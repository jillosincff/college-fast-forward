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
      
      // Strategy 1: "at Company" pattern — must be preceded by a role/title word to avoid matching "at" in person names
      // e.g. "Marketing Analyst at Nike" → Nike ✓  | "Macarena Gonzalez at Cabanellas" → skip ✗
      const atMatch = fullText.match(/\b(?:analyst|manager|engineer|director|associate|intern|coordinator|specialist|developer|designer|consultant|researcher|writer|advisor|representative|assistant|strategist|president|officer|founder|lead|head|ceo|cfo|cto|vp|svp|evp)[^|·\n]{0,40}\bat\s+([A-Z][A-Za-z0-9\s&.,'\-]{2,45}?)(?:\s*[|·]|\s*\n|\s*$)/i);
      
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
        // Skip if it looks like a person name:
        // - single word, all title-case, no digits (e.g. "Cabanellas")
        // - two words, both title-case (e.g. "John Smith")
        const words = companyName.trim().split(/\s+/);
        const allTitleCase = words.every(w => /^[A-Z][a-z]+$/.test(w));
        const looksLikePerson = allTitleCase && words.length <= 3 && !/\d/.test(companyName);
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

    console.log('[DualConstraint] Company map (pre-merge):', [...companyMap.entries()].map(([k,v]) => `${k}(${v.count})`).join(', '));

    // ── Merge duplicate company entries ────────────────────────────────
    // e.g. "McKinsey" and "McKinsey & Company" should be one card
    // Strategy: group by first significant word (4+ chars), keep the most common name as canonical
    const normalize = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const companyEntries = [...companyMap.entries()]; // [name, {count, profiles}]

    const merged = new Map(); // canonical name → {count, profiles}
    companyEntries.forEach(([name, data]) => {
      const normName = normalize(name);
      // Find first existing canonical that shares a 5+ char prefix
      const firstWord = normName.length >= 5 ? normName.slice(0, 6) : normName;
      let canonicalKey = null;
      for (const [key] of merged) {
        const keyNorm = normalize(key);
        if (keyNorm.startsWith(firstWord) || normName.startsWith(normalize(key).slice(0, 6))) {
          canonicalKey = key;
          break;
        }
      }
      if (canonicalKey) {
        // Merge into existing — pick the longer/more complete name as canonical
        const existing = merged.get(canonicalKey);
        existing.count += data.count;
        existing.profiles.push(...data.profiles);
        // If this name is longer (more descriptive), use it as the new key
        if (name.length > canonicalKey.length) {
          merged.set(name, existing);
          merged.delete(canonicalKey);
        }
      } else {
        merged.set(name, { count: data.count, profiles: [...data.profiles] });
      }
    });

    console.log('[DualConstraint] Company map (post-merge):', [...merged.entries()].map(([k,v]) => `${k}(${v.count})`).join(', '));

    // Sort by alumni count — companies with most alumni first
    const rankedCompanies = [...merged.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 12)
      .map(([name, data]) => ({ name, alumniCount: data.count, insiders: data.profiles }));

    console.log(`[DualConstraint] Step 2: Extracted ${rankedCompanies.length} companies with alumni`);

    if (rankedCompanies.length === 0) {
      return Response.json({ success: true, leads: [], reason: 'No companies extracted from alumni profiles' });
    }

    // ── STEP 2: Search for active job listings at each alumni company directly ──
    const SENIOR_PATTERN = /\b(senior|sr\b|lead|principal|director|manager|head of|vp\b|vice president|staff)\b/i;
    const ATS_DOMAINS = [
      'jobs.lever.co', 'boards.greenhouse.io', 'jobs.ashbyhq.com',
      'apply.workable.com', 'myworkdayjobs.com', 'jobs.smartrecruiters.com',
    ];

    const topCompanies = rankedCompanies.slice(0, 8);
    console.log(`[DualConstraint] Step 2: Searching jobs at: ${topCompanies.map(c => c.name).join(', ')}`);

    // For each company, do a targeted ATS search by company name + role
    // This is far more reliable than one big generic search
    const perCompanyJobResults = await Promise.all(
      topCompanies.map(company =>
        exaFetch('search', {
          query: `"${company.name}" ${roleQuery} job opening hiring`,
          type: 'keyword',
          numResults: 5,
          includeDomains: ATS_DOMAINS,
          contents: {
            highlights: { maxCharacters: 400, numSentences: 3 },
            text: { maxCharacters: 800 },
          },
          startPublishedDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        }).then(d => ({ company: company.name, results: d.results || [] }))
          .catch(() => ({ company: company.name, results: [] }))
      )
    );

    // Build jobsByCompany map from per-company results — no fuzzy matching needed
    const jobsByCompany = new Map();
    perCompanyJobResults.forEach(({ company, results }) => {
      const jobs = results
        .filter(r => r.url && r.title && !SENIOR_PATTERN.test(r.title))
        .map(r => {
          // Build a readable description snippet from highlights or text
          const highlightSnippet = (r.highlights || []).join(' ').trim();
          const textSnippet = (r.text || '').slice(0, 500).trim();
          const rawDescription = highlightSnippet || textSnippet;
          // Clean up: strip HTML tags, collapse whitespace, cap at ~300 chars
          const description = rawDescription
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 300);
          return {
            title: r.title?.split(/[|·]/)[0]?.trim() || r.title,
            url: r.url,
            publishedDate: r.publishedDate || null,
            description: description || null,
          };
        });
      if (jobs.length > 0) {
        jobsByCompany.set(company, jobs);
      }
    });

    console.log(`[DualConstraint] Companies with active jobs: ${[...jobsByCompany.keys()].join(', ') || 'none'}`);

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