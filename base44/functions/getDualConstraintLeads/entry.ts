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
    console.log(`[DualConstraint] Step 1: Finding ${shortSchool} alumni in "${roleQuery}"`);

    const peopleQueries = [
      `${shortSchool} alumnus graduate currently works as ${roleQuery}`,
      `studied at ${universityName} now ${roleQuery} professional`,
    ];

    const peopleResults = await Promise.all(
      peopleQueries.map(q =>
        exaFetch('search', {
          query: q,
          type: 'auto',
          category: 'people',
          numResults: 10,
          contents: { highlights: { maxCharacters: 400 } },
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
      const text = `${p.title || ''} ${(p.highlights || []).join(' ')}`;
      
      // Try to extract "at Company" patterns
      const atMatch = text.match(/\bat\s+([A-Z][A-Za-z0-9\s&.,'-]{2,40}?)(?:\s*[|·\-]|\s*$)/);
      // Also try "Company | Title" or title parts after last dash
      const pipeMatch = p.title?.match(/[|\-·]\s*([A-Z][A-Za-z0-9\s&.,'-]{2,40})\s*$/);
      
      const companyName = atMatch?.[1]?.trim() || pipeMatch?.[1]?.trim();
      
      if (companyName && companyName.length > 2 && companyName.length < 50) {
        // Filter out university names
        const lower = companyName.toLowerCase();
        if (lower.includes(shortSchool.toLowerCase()) || lower.includes('university') || lower.includes('college')) return;
        
        if (!companyMap.has(companyName)) {
          companyMap.set(companyName, { count: 0, profiles: [] });
        }
        const entry = companyMap.get(companyName);
        entry.count++;
        entry.profiles.push({
          name: (p.title || '').split(/[|\-·]/)[0].trim(),
          url: p.url,
          headline: p.title || '',
        });
      }
    });

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

    // Build a targeted query: role + scoped to those specific company domains
    const companyDomainGuesses = companyNames.slice(0, 8).map(n =>
      n.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com'
    );

    // Also search ATS boards scoped to these companies
    const jobQuery = `${roleQuery} (entry level OR junior OR associate OR new grad)${locationStr}`;

    console.log(`[DualConstraint] Step 3: Checking active jobs at: ${companyNames.slice(0, 6).join(', ')}`);

    const ATS_DOMAINS = [
      'jobs.lever.co',
      'boards.greenhouse.io',
      'jobs.ashbyhq.com',
      'apply.workable.com',
    ];

    // Run two parallel checks: ATS boards + company career pages
    const [atsJobData, careerPageData] = await Promise.all([
      exaFetch('search', {
        query: jobQuery,
        type: 'keyword',
        numResults: 20,
        includeDomains: ATS_DOMAINS,
        contents: { highlights: { maxCharacters: 400 } },
        startPublishedDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      }).catch(() => ({ results: [] })),
      exaFetch('search', {
        query: `${jobQuery} site:careers OR site:jobs`,
        type: 'keyword',
        numResults: 15,
        includeDomains: companyDomainGuesses,
        contents: { highlights: { maxCharacters: 400 } },
        startPublishedDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      }).catch(() => ({ results: [] })),
    ]);

    const allJobResults = [...(atsJobData.results || []), ...(careerPageData.results || [])];

    console.log(`[DualConstraint] Found ${allJobResults.length} potential job listings`);

    // Match job results back to alumni companies
    const SENIOR_PATTERN = /\b(senior|sr\b|lead|principal|director|manager|head of|vp\b|vice president|staff)\b/i;

    const jobsByCompany = new Map();
    allJobResults.forEach(r => {
      if (!r.url || !r.title) return;
      if (SENIOR_PATTERN.test(r.title)) return;

      // Extract company slug from ATS URL
      const atsMatch = r.url.match(/(?:jobs\.lever\.co|boards\.greenhouse\.io|jobs\.ashbyhq\.com|apply\.workable\.com)\/([^/]+)/);
      const companySlug = atsMatch ? atsMatch[1].replace(/-/g, ' ') : '';

      // Try to match to one of our alumni companies
      const matchedCompany = rankedCompanies.find(c => {
        const cLower = c.name.toLowerCase();
        const slugLower = companySlug.toLowerCase();
        const domainLower = r.url.toLowerCase();
        return slugLower.includes(cLower.split(' ')[0]) ||
               cLower.includes(slugLower.split(' ')[0]) ||
               domainLower.includes(cLower.replace(/\s+/g, ''));
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