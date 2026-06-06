import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Dual-Constraint Alumni Sourcing Engine
 * 
 * Step 1: Find alumni from user's university working in user's target role (Exa people search)
 * Step 2: Extract unique companies from those alumni profiles
 * Step 3: Cross-reference those companies for active job listings matching the target role
 * Returns: High-signal cards combining alumni proof + active hiring evidence
 */
Deno.serve(async (req) => {
  const EXA_API_KEY = Deno.env.get('EXA_API_KEY');
  if (!EXA_API_KEY) return Response.json({ success: false, error: 'EXA_API_KEY not set' }, { status: 500 });

  const exaFetch = async (endpoint, body) => {
    const res = await fetch(`https://api.exa.ai/${endpoint}`, {
      method: 'POST',
      headers: { 'x-api-key': EXA_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Exa ${endpoint} failed: ${res.status}`);
    return res.json();
  };

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json().catch(() => ({}));

    // Accept explicit overrides from the carousel (same pattern as getPersonalizedNetworkCarousel)
    const targetRole = payload.explicit_target_role
      || user.career_goals?.target_roles?.[0]
      || user.target_roles?.[0]
      || '';
    const targetIndustries = payload.explicit_target_industries
      || user.career_goals?.target_industries
      || user.target_industries
      || [];
    const universityName = user.school_name || user.school || user.university || 'University of Florida';
    const userLocation = user.location || '';

    if (!targetRole && targetIndustries.length === 0) {
      return Response.json({ success: true, leads: [], reason: 'No career goals set' });
    }

    // Build short school name: "University of Florida" → "Florida"
    const shortSchool = universityName
      .replace(/^University of /i, '')
      .replace(/ University$/i, '')
      .replace(/ College$/i, '')
      .trim();

    const roleQuery = targetRole || targetIndustries.slice(0, 2).join(' or ');

    // ── STEP 1: Find alumni working in target role ──────────────────────
    // Use neural search WITH text content so we get rich snippets to extract company names from
    console.log(`[DualConstraint] Step 1: Finding ${shortSchool} alumni in "${roleQuery}"`);

    const peopleQueries = [
      `${shortSchool} alumnus alumna ${roleQuery} at company LinkedIn`,
      `"University of Florida" OR "UF" graduate ${roleQuery} works at`,
      `${universityName} alumni ${roleQuery} professional career`,
    ];

    const peopleResults = await Promise.all(
      peopleQueries.map(q =>
        exaFetch('search', {
          query: q,
          type: 'neural',
          category: 'people',
          numResults: 8,
          contents: { text: { maxCharacters: 600 } },
        }).catch(() => ({ results: [] }))
      )
    );

    // Deduplicate profiles and extract company names
    const seenUrls = new Set();
    const profiles = peopleResults
      .flatMap(d => d.results || [])
      .filter(r => {
        if (!r?.url || seenUrls.has(r.url)) return false;
        seenUrls.add(r.url);
        return true;
      });

    console.log(`[DualConstraint] Found ${profiles.length} alumni profiles`);

    // Extract company names from profile titles/headlines
    // Exa people profiles typically have "Name - Title at Company | LinkedIn"
    const companyMap = new Map(); // company -> { count, profiles[] }

    profiles.forEach(p => {
      const title = p.title || '';
      const highlights = (p.highlights || []).join(' ');
      const text = p.text || '';
      const fullText = title + ' ' + highlights + ' ' + text;

      // Exa people profiles typically look like:
      // Title: "Jane Smith - Marketing Analyst at Nike | LinkedIn"
      // Or highlights mention "works at Nike" / "Nike | Marketing Analyst"
      
      const roleWords = /\b(analyst|manager|engineer|director|associate|intern|coordinator|specialist|developer|designer|consultant|researcher|writer|advisor|representative|assistant|strategist|president|officer|founder|lead|head|ceo|cfo|cto|vp|svp|evp)\b/i;
      
      // Strategy 1: "at Company" pattern in title or highlights (most reliable)
      const atMatch = fullText.match(/\bat\s+([A-Z][A-Za-z0-9\s&.,'\-]{2,45}?)(?:\s*[|·]|\s*\n|\s*$)/);
      
      // Strategy 2: "Title | Company" — second segment after pipe/bullet if it doesn't look like a role
      const pipeParts = title.split(/[|·]/).map(s => s.trim()).filter(Boolean);
      // person name is usually first; company might be last part after their role
      const companyFromPipe = pipeParts.length >= 3
        ? pipeParts[pipeParts.length - 1]  // "Name | Role | Company"
        : pipeParts.length === 2 && !roleWords.test(pipeParts[1])
          ? pipeParts[1]  // "Name | Company" (no role in between)
          : null;

      // Strategy 3: highlights often say "works at X" or "employed by X"
      const worksAtMatch = highlights.match(/(?:works at|employed (?:by|at)|position at|role at)\s+([A-Z][A-Za-z0-9\s&.,'\-]{2,40}?)(?:[.,\n]|$)/i);

      const companyName = atMatch?.[1]?.trim()
        || worksAtMatch?.[1]?.trim()
        || (companyFromPipe && !companyFromPipe.toLowerCase().includes('linkedin') ? companyFromPipe : null);

      // Validate: must exist, not be a person name (no role words needed but must have 2+ words or be known brand)
      if (companyName && companyName.length > 1 && companyName.length < 60) {
        const lower = companyName.toLowerCase();
        if (lower.includes(shortSchool.toLowerCase()) || lower.includes('university') || lower.includes('college') || lower === 'linkedin') return;
        // Skip if it looks like a person name (only 2 words, both capitalized, no role indicators)
        const words = companyName.trim().split(/\s+/);
        const looksLikePerson = words.length === 2 && words.every(w => /^[A-Z][a-z]+$/.test(w));
        if (looksLikePerson) return;
        
        if (!companyMap.has(companyName)) {
          companyMap.set(companyName, { count: 0, profiles: [] });
        }
        const entry = companyMap.get(companyName);
        entry.count++;
        entry.profiles.push({
          name: pipeParts[0] || title.split(/[|\-·]/)[0].trim(),
          url: p.url,
          headline: title,
        });
      }
    });

    console.log('[DualConstraint] Company map:', [...companyMap.entries()].map(([k,v]) => `${k}(${v.count})`).join(', '));

    // Sort by alumni count — companies with most alumni first
    const rankedCompanies = [...companyMap.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 12)
      .map(([name, data]) => ({ name, alumniCount: data.count, insiders: data.profiles }));

    console.log(`[DualConstraint] Step 2: Extracted ${rankedCompanies.length} companies with alumni`);

    if (rankedCompanies.length === 0) {
      return Response.json({ success: true, leads: [], reason: 'No companies extracted from alumni profiles' });
    }

    // ── STEP 2: Check active job listings at alumni-verified companies ──
    const companyNames = rankedCompanies.map(c => c.name);
    const locationStr = userLocation ? ` ${userLocation}` : '';

    const jobQuery = `${roleQuery} (entry level OR junior OR associate OR new grad)${locationStr}`;

    // Also build a company-specific query targeting each alumni company directly
    const topCompanyNames = companyNames.slice(0, 6);
    const companyOrQuery = topCompanyNames.map(n => `"${n}"`).join(' OR ');
    const companyJobQuery = `(${companyOrQuery}) ${roleQuery} hiring job`;

    console.log(`[DualConstraint] Step 3: Checking active jobs at: ${topCompanyNames.join(', ')}`);

    const ATS_DOMAINS = [
      'jobs.lever.co',
      'boards.greenhouse.io',
      'jobs.ashbyhq.com',
      'apply.workable.com',
    ];

    // Run three parallel checks for maximum coverage
    const [atsJobData, companyJobData, careerPageData] = await Promise.all([
      exaFetch('search', {
        query: jobQuery,
        type: 'keyword',
        numResults: 20,
        includeDomains: ATS_DOMAINS,
        contents: { highlights: { maxCharacters: 400 } },
        startPublishedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      }).catch(() => ({ results: [] })),
      // Direct company-targeted job search on ATS boards
      exaFetch('search', {
        query: companyJobQuery,
        type: 'neural',
        numResults: 15,
        includeDomains: ATS_DOMAINS,
        contents: { highlights: { maxCharacters: 400 } },
        startPublishedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      }).catch(() => ({ results: [] })),
      // Broader web search for job openings at these companies
      exaFetch('search', {
        query: `${companyJobQuery} careers apply`,
        type: 'neural',
        numResults: 10,
        contents: { highlights: { maxCharacters: 400 } },
        startPublishedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      }).catch(() => ({ results: [] })),
    ]);

    const allJobResults = [
      ...(atsJobData.results || []),
      ...(companyJobData.results || []),
      ...(careerPageData.results || []),
    ];

    console.log(`[DualConstraint] Found ${allJobResults.length} potential job listings`);

    // Match job results back to alumni companies
    const SENIOR_PATTERN = /\b(senior|sr\b|lead|principal|director|manager|head of|vp\b|vice president|staff)\b/i;

    // Only trust known job board / ATS domains
    const TRUSTED_JOB_DOMAINS = [
      'jobs.lever.co', 'boards.greenhouse.io', 'jobs.ashbyhq.com', 'apply.workable.com',
      'linkedin.com/jobs', 'indeed.com', 'glassdoor.com', 'myworkdayjobs.com',
      'jobs.smartrecruiters.com',
    ];
    const isJobUrl = (url) => {
      const u = (url || '').toLowerCase();
      return TRUSTED_JOB_DOMAINS.some(d => u.includes(d));
    };

    const jobsByCompany = new Map();
    allJobResults.forEach(r => {
      if (!r.url || !r.title) return;
      if (SENIOR_PATTERN.test(r.title)) return;
      if (!isJobUrl(r.url)) return; // skip spam / non-job-board results

      // Extract company slug from ATS URL
      const atsMatch = r.url.match(/(?:jobs\.lever\.co|boards\.greenhouse\.io|jobs\.ashbyhq\.com|apply\.workable\.com)\/([^/]+)/);
      const companySlug = atsMatch ? atsMatch[1].replace(/-/g, ' ') : '';

      // Require company name to appear in the ATS URL slug or job title — strict match only
      const normalize = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
      const matchedCompany = rankedCompanies.find(c => {
        const cNorm = normalize(c.name);
        const slugNorm = normalize(companySlug);
        const titleNorm = normalize(r.title || '');
        // First word of company (4+ chars) must appear in slug or title
        const firstWord = cNorm.replace(/\s+/g, ' ').split(' ').find(w => w.length >= 4) || cNorm;
        return slugNorm.includes(firstWord) || titleNorm.includes(firstWord);
      });

      if (matchedCompany) {
        if (!jobsByCompany.has(matchedCompany.name)) {
          jobsByCompany.set(matchedCompany.name, []);
        }
        jobsByCompany.get(matchedCompany.name).push({
          title: r.title?.split(/[|·]/)[0]?.trim() || r.title,
          url: r.url,
          publishedDate: r.publishedDate || null,
        });
      }
    });

    // Also try matching unmatched jobs to companies by title keyword scan
    allJobResults.forEach(r => {
      if (!r.url || !r.title) return;
      if (SENIOR_PATTERN.test(r.title)) return;
      if (!isJobUrl(r.url)) return;
      const normalize = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
      rankedCompanies.forEach(c => {
        // Skip if already matched
        if (jobsByCompany.has(c.name) && jobsByCompany.get(c.name).length > 0) return;
        const cNorm = normalize(c.name);
        const titleNorm = normalize(r.title || '');
        const urlNorm = normalize(r.url || '');
        const snippetNorm = normalize((r.highlights || []).join(' '));
        const firstWord = cNorm.replace(/\s+/g, '').length >= 4 ? cNorm.split('').slice(0,8).join('') : cNorm;
      if (titleNorm.includes(firstWord) || urlNorm.includes(firstWord)) {
          if (!jobsByCompany.has(c.name)) jobsByCompany.set(c.name, []);
          jobsByCompany.get(c.name).push({
            title: r.title?.split(/[|·]/)[0]?.trim() || r.title,
            url: r.url,
            publishedDate: r.publishedDate || null,
          });
        }
      });
    });

    // ── BUILD FINAL HIGH-SIGNAL LEAD CARDS ─────────────────────────────
    const leads = rankedCompanies
      .map(company => {
        const jobs = jobsByCompany.get(company.name) || [];
        return {
          company: company.name,
          role: roleQuery,
          alumniCount: company.alumniCount,
          insiders: company.insiders.slice(0, 3),
          activeJobs: jobs.slice(0, 3),
          hasActiveJobs: jobs.length > 0,
          // Signal tier: gold if both alumni + active jobs, silver if alumni only
          signalTier: jobs.length > 0 ? 'gold' : 'silver',
          ctaType: 'add_to_pipeline',
          leadTier: 'dual_constraint',
          source: 'dual_constraint_engine',
        };
      })
      // Prioritize companies with active jobs first
      .sort((a, b) => {
        if (a.hasActiveJobs && !b.hasActiveJobs) return -1;
        if (!a.hasActiveJobs && b.hasActiveJobs) return 1;
        return b.alumniCount - a.alumniCount;
      })
      .slice(0, 8);

    console.log(`[DualConstraint] Returning ${leads.length} leads (${leads.filter(l => l.hasActiveJobs).length} with active jobs)`);

    return Response.json({ success: true, leads, alumniProfilesFound: profiles.length });

  } catch (e) {
    console.error('[getDualConstraintLeads] Error:', e.message);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
});