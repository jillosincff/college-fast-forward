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
    const userLocation = payload.target_location || user.career_goals?.location_preference || user.location || '';

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

    // ── STEP 1: Single people search — Exa neural understands this phrasing well ──
    console.log(`[DualConstraint] Step 1: Finding ${shortSchool} alumni in "${roleQuery}"`);

    const peopleResults = await Promise.all([
      exaFetch('search', {
        query: `${universityName} alumni ${roleQuery}`,
        type: 'neural',
        category: 'people',
        numResults: 15,
        contents: { text: { maxCharacters: 500 } },
      }).catch(() => ({ results: [] }))
    ]);

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

    // ── STEP 2: Single job search across all top companies ──────────────
    const SENIOR_PATTERN = /\b(senior|sr\b|lead|principal|director|manager|head of|vp\b|vice president|staff)\b/i;

    const topCompanies = rankedCompanies.slice(0, 6);
    console.log(`[DualConstraint] Step 2: Searching jobs at: ${topCompanies.map(c => c.name).join(', ')}`);

    const locationCity = userLocation ? userLocation.split(',')[0].trim() : '';
    const remoteIntent = /^(remote|anywhere|flexible|open to relocation)$/i.test((userLocation || '').trim());
    const companyList = topCompanies.map(c => `"${c.name}"`).join(' OR ');
    const locationSuffix = remoteIntent ? ' remote' : locationCity ? ` ${locationCity}` : '';
    const jobQuery = `${roleQuery} entry level job opening (${companyList})${locationSuffix}`;

    const jobSearchResult = await exaFetch('search', {
      query: jobQuery,
      type: 'neural',
      numResults: 12,
      contents: {
        highlights: { maxCharacters: 400, numSentences: 3 },
        text: { maxCharacters: 600 },
      },
    }).catch(() => ({ results: [] }));

    // Map job results back to companies by checking which company name appears in the URL/title
    const companyDomains = topCompanies.map(c => ({ company: c.name, domain: null }));
    const perCompanyJobResults = topCompanies.map(company => {
      const matches = (jobSearchResult.results || []).filter(r => {
        const haystack = ((r.url || '') + ' ' + (r.title || '')).toLowerCase();
        const compNorm = company.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const firstWord = compNorm.slice(0, Math.min(6, compNorm.length));
        return haystack.includes(firstWord) || haystack.includes(company.name.toLowerCase().split(' ')[0].toLowerCase());
      });
      return { company: company.name, domain: null, results: matches };
    });

    // Sanitize Exa description text into a clean, human-readable snippet
    const cleanDescription = (raw) => {
      if (!raw || typeof raw !== 'string') return null;
      let text = raw
        .replace(/<[^>]+>/g, ' ')           // strip HTML tags
        .replace(/\[\.{2,3}\]/g, '')         // remove "[...]" truncation markers
        .replace(/\[…\]/g, '')               // remove "[…]"
        .replace(/#+\s*/g, '')               // strip markdown headings (#, ##, ###)
        .replace(/^(Date|Location[s]?|Company|Job ID|Req ID|Requisition)[^\n]*\n?/gim, '') // strip metadata lines
        .replace(/\n{2,}/g, ' ')             // collapse newlines
        .replace(/\s{2,}/g, ' ')             // collapse whitespace
        .trim();
      // Reject if >15% non-ASCII (binary/garbage content)
      const nonAscii = (text.match(/[^\x20-\x7E]/g) || []).length;
      if (text.length === 0 || nonAscii / text.length >= 0.15) return null;
      return text.slice(0, 320);
    };

    // Two-tier location matching (mirrors getPersonalizedNetworkCarousel):
    //   strict:   text explicitly names the user's city
    //   loose:    text does NOT explicitly name a different city (ambiguous /
    //             remote / multi-city posts pass)
    // Always reject posts that explicitly name a different identifiable city.
    // After scoring, prefer strict matches; fall back to loose when strict is
    // sparse so a user in a city with few hits (e.g. Miami at alumni-verified
    // companies) still sees something useful instead of an empty feed.
    const US_CITIES = /\b(Austin|San Francisco|Seattle|Chicago|Los Angeles|Boston|Atlanta|Denver|Dallas|Houston|Miami|Phoenix|Portland|San Diego|Minneapolis|Detroit|Philadelphia|Pittsburgh|Charlotte|Nashville|Raleigh|Salt Lake City|Las Vegas|Tampa|Orlando|San Jose|San Antonio|Columbus|Kansas City|Indianapolis|St\. Louis|Cincinnati|Cleveland|Memphis|Richmond|Sacramento|Baltimore|New York|Brooklyn|Manhattan|Mountain View|Menlo Park|Cupertino|Palo Alto|Redmond|Burbank|Santa Monica)\b/i;
    const userCityForMatch = remoteIntent ? '' : (locationCity ? locationCity.toLowerCase() : '');
    const cityInText = (text) => {
      const m = text.match(US_CITIES);
      return m ? m[0].toLowerCase() : '';
    };
    const isStrictCityMatch = (text) => {
      if (!userCityForMatch) return false;
      const mc = cityInText(text);
      return !!mc && (mc === userCityForMatch || mc.includes(userCityForMatch) || userCityForMatch.includes(mc));
    };
    const isLooseCompatible = (text) => {
      const lowerText = text.toLowerCase();
      if (remoteIntent) {
        return lowerText.includes('remote') || lowerText.includes('multiple cities') || lowerText.includes('multiple us cities');
      }
      if (!userCityForMatch) return true; // no preference → keep
      const mc = cityInText(text);
      if (!mc) return true; // ambiguous → keep
      return mc === userCityForMatch || mc.includes(userCityForMatch) || userCityForMatch.includes(mc);
    };

    // Build jobsByCompany map — results are already domain-locked, no fuzzy matching needed.
    // Two-tier location selection per company: prefer strict-city-match jobs; fall back
    // to loose-compatible ones when strict is sparse.
    const STRICT_CITY_THRESHOLD = 1;
    const jobsByCompany = new Map();
    perCompanyJobResults.forEach(({ company, domain, results }) => {
      const haystack = (r) => (r.title || '') + ' ' + (r.highlights || []).join(' ') + ' ' + (r.text || '').slice(0, 400);
      const preFiltered = results.filter(r => r.url && r.title && !SENIOR_PATTERN.test(r.title));
      // Strict pool: posts that explicitly name the user's city.
      const strict = userCityForMatch ? preFiltered.filter(r => isStrictCityMatch(haystack(r))) : [];
      // Loose pool: posts that don't explicitly name a different city.
      const loose = preFiltered.filter(r => isLooseCompatible(haystack(r)));
      // Prefer strict; otherwise loose (which is a superset of strict).
      const selected = strict.length >= STRICT_CITY_THRESHOLD ? strict : loose;
      const jobs = selected
        .map(r => {
          // Prefer highlights (Exa-extracted key sentences) over raw text
          const highlightSnippet = (r.highlights || []).filter(h => typeof h === 'string').join(' ');
          const textSnippet = typeof r.text === 'string' ? r.text.slice(0, 800) : '';
          const description = cleanDescription(highlightSnippet) || cleanDescription(textSnippet);
          return {
            title: r.title?.split(/[|·]/)[0]?.trim() || r.title,
            url: r.url,
            company_domain: domain,
            publishedDate: r.publishedDate || null,
            description,
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
        const companyDomain = companyDomains.find(d => d.company === company.name)?.domain || null;
        return {
          company: company.name,
          company_domain: companyDomain,
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