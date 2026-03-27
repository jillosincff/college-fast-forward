const FUNCTION_TO_KEYWORDS = {
  'Software Engineering': ['engineer', 'developer', 'swe', 'backend', 'frontend'],
  'Product Management': ['product manager', 'pm', 'product lead'],
  'Sales & Business Development': ['sales', 'business development', 'bdr', 'sdr', 'account executive'],
  'Marketing & Brand': ['marketing', 'brand', 'growth', 'content', 'social media'],
  'Finance & Accounting': ['finance', 'accounting', 'analyst', 'audit', 'fp&a'],
  'Operations & Strategy': ['operations', 'strategy', 'chief of staff', 'biz ops'],
  'Data & Analytics': ['data', 'analytics', 'bi', 'sql', 'data science'],
  'Human Resources': ['hr', 'recruiting', 'talent', 'people ops'],
  'Consulting / Advisory': ['consultant', 'advisor', 'associate', 'engagement'],
  'Supply Chain & Logistics': ['supply chain', 'logistics', 'procurement', 'sourcing'],
  'Healthcare / Clinical': ['clinical', 'nursing', 'physician', 'medical'],
  'Legal & Compliance': ['legal', 'compliance', 'counsel', 'attorney'],
};

Deno.serve(async (req) => {
  const EXA_API_KEY = Deno.env.get('EXA_API_KEY');
  if (!EXA_API_KEY) return Response.json({ success: false, error: 'EXA_API_KEY not set' }, { status: 500 });

  const exaFetch = async (endpoint, body) => {
    const res = await fetch(`https://api.exa.ai/${endpoint}`, {
      method: 'POST',
      headers: { 'x-api-key': EXA_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.json();
  };

  try {
    const { action, ...params } = await req.json();

    // ── ACTION 1: Company hiring signal ──────────────────────────────
    if (action === 'getHiringSignal') {
      const { companyName, targetFunctions = [], location = '' } = params;
      const functionTitles = targetFunctions.slice(0, 2).join(' or ');
      const query = `${companyName} hiring ${functionTitles || 'entry level'} jobs ${location} 2025`;

      const [hiringData, layoffData] = await Promise.all([
        exaFetch('search', {
          query,
          type: 'auto',
          numResults: 5,
          includeDomains: [
            'greenhouse.io',
            'lever.co',
            'linkedin.com/jobs',
            'jobs.lever.co',
            'boards.greenhouse.io',
            'myworkdayjobs.com',
            'careers.smartrecruiters.com',
            'indeed.com',
          ],
          contents: { highlights: { maxCharacters: 4000 } },
        }),
        exaFetch('search', {
          query: `${companyName} layoffs OR "hiring freeze" OR "headcount reduction" 2024 2025`,
          type: 'auto',
          numResults: 3,
          category: 'news',
          contents: { highlights: { maxCharacters: 2000 } },
        }),
      ]);

      const layoffResults = layoffData.results || [];
      const layoffDetected = layoffResults.some(r => {
        const text = (r.highlights || []).join(' ').toLowerCase();
        return text.includes('layoff') || text.includes('hiring freeze') ||
               text.includes('headcount reduction') || text.includes('laid off');
      });

      const hiringResults = hiringData.results || [];
      const openRoles = hiringResults
        .filter(r => {
          const url = r.url?.toLowerCase() || '';
          return url.includes('greenhouse') || url.includes('lever') ||
                 url.includes('linkedin') || url.includes('workday') ||
                 url.includes('smartrecruiters') || url.includes('indeed');
        })
        .map(r => r.title?.split('|')?.[0]?.trim() || r.title)
        .filter(Boolean)
        .slice(0, 5);

      const jobCount = openRoles.length;

      // Filter by target functions using highlights from valid results
      const functionKeywords = new Set();
      targetFunctions.forEach(fn => (FUNCTION_TO_KEYWORDS[fn] || []).forEach(k => functionKeywords.add(k)));
      const matchedRoles = functionKeywords.size > 0
        ? openRoles.filter(t => [...functionKeywords].some(kw => t.toLowerCase().includes(kw)))
        : openRoles;

      // Confidence: only 'high' when results come from verified job board domains
      const JOB_BOARD_DOMAINS = ['greenhouse.io', 'lever.co', 'boards.greenhouse.io', 'myworkdayjobs.com', 'jobs.lever.co', 'smartrecruiters.com', 'indeed.com'];
      const verifiedJobBoardResults = hiringResults.filter(r => {
        const url = r.url?.toLowerCase() || '';
        return JOB_BOARD_DOMAINS.some(d => url.includes(d));
      });
      const confidence = verifiedJobBoardResults.length > 0 ? 'high' : 'low';

      // Only set active/selective when confidence is high (real job board hits)
      let hiring_signal = 'unknown';
      if (layoffDetected) hiring_signal = 'freeze';
      else if (confidence === 'high' && jobCount >= 3) hiring_signal = 'active';
      else if (confidence === 'high' && jobCount >= 1) hiring_signal = 'selective';

      const growthData = await exaFetch('search', {
        query: `${companyName} funding OR "Series" OR expansion OR growth 2024 2025`,
        type: 'auto',
        numResults: 2,
        category: 'news',
        contents: { highlights: { maxCharacters: 1000 } },
      });

      const growthHighlights = (growthData.results || []).flatMap(r => r.highlights || []);
      const growthDetected = growthHighlights.some(h => {
        const lower = h.toLowerCase();
        return lower.includes('raised') || lower.includes('series') ||
               lower.includes('funding') || lower.includes('expansion');
      });

      return Response.json({
        success: true,
        hiring_signal,
        open_roles: openRoles,
        matched_roles: matchedRoles,
        layoff_alert: layoffDetected
          ? { detected: true, summary: (layoffResults[0]?.highlights?.[0] || '').slice(0, 120) }
          : null,
        growth_signal: growthDetected
          ? { detected: true, summary: growthHighlights[0]?.slice(0, 120) || null }
          : null,
      });
    }

    // ── ACTION 2: Alumni people search ───────────────────────────────
    if (action === 'searchAlumni') {
      const { query: freeTextQuery, jobTitle, universityName = 'University of Florida', companyName = '', maxResults = 3 } = params;
      const companyClause = companyName ? `at ${companyName}` : '';
      let query;
      if (freeTextQuery) {
        // If university is already mentioned, don't append it again
        query = freeTextQuery.toLowerCase().includes(universityName.toLowerCase())
          ? freeTextQuery
          : `${freeTextQuery} ${universityName} alumni`;
      } else {
        query = `${jobTitle} ${companyClause} ${universityName} alumni`;
      }

      const data = await exaFetch('search', {
        query,
        type: 'auto',
        numResults: maxResults,
        includeDomains: ['linkedin.com'],
        contents: { highlights: { maxCharacters: 2000 } },
      });

      const profiles = (data.results || []).map(r => {
        const parts = (r.title || '').split(/[|\-]/).map(s => s.trim()).filter(Boolean);
        const full_name = parts[0] || 'Unknown';
        const headline = parts.slice(1).join(' · ') || '';
        const summary = (r.highlights || []).join(' ').slice(0, 300);
        return {
          full_name,
          linkedin_url: r.url,
          headline,
          summary,
          source: 'exa',
          cff_user_id: null,
          email: null,
        };
      }).filter(p => p.full_name !== 'Unknown' && p.linkedin_url?.includes('linkedin.com'));

      return Response.json({
        success: true,
        profiles,
        total_count: profiles.length,
        source: 'exa_people_search',
      });
    }

    return Response.json({ success: false, error: 'Unknown action' });
  } catch (e) {
    console.error('[exaService] Error:', e.message);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
});