import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Live job matches using Exa keyword search against real ATS job boards.
 * Replaces Fantastic.jobs (out of credits) with direct Exa search.
 * Returns real job URLs, titles, and company names from Lever/Greenhouse/Ashby/Workable.
 */

const ATS_DOMAINS = [
  'jobs.lever.co',
  'boards.greenhouse.io',
  'jobs.ashbyhq.com',
  'apply.workable.com',
];

const ATS_SOURCE_LABELS = {
  'jobs.lever.co': 'Lever',
  'boards.greenhouse.io': 'Greenhouse',
  'jobs.ashbyhq.com': 'Ashby',
  'apply.workable.com': 'Workable',
};

const SENIOR_FILTER = /\b(senior|sr\b|lead|principal|director|manager|head of|vp\b|vice president|staff engineer|architect|managing partner)\b/i;

const ATS_URL_PATTERNS = [
  /^https:\/\/jobs\.lever\.co\//,
  /^https:\/\/boards\.greenhouse\.io\//,
  /^https:\/\/jobs\.ashbyhq\.com\//,
  /^https:\/\/apply\.workable\.com\//,
];

const ROLE_WORD = /\b(engineer|analyst|associate|intern|coordinator|specialist|manager|developer|designer|consultant|researcher|scientist|writer|advisor|representative|assistant|strategist|accountant)\b/i;

Deno.serve(async (req) => {
  const EXA_API_KEY = Deno.env.get('EXA_API_KEY');
  if (!EXA_API_KEY) return Response.json({ error: 'EXA_API_KEY not set' }, { status: 500 });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { career_goals = {} } = await req.json().catch(() => ({}));

    const role = career_goals.role
      || (Array.isArray(career_goals.target_roles) ? career_goals.target_roles[0] : null)
      || user.career_goals?.target_roles?.[0]
      || 'entry level';

    const location = career_goals.locations?.[0]
      || career_goals.location_preference
      || user.career_goals?.location_preference
      || '';

    const locationStr = location ? ` ${location.split(',')[0].trim()}` : '';

    // Run intern + full-time searches in parallel
    const searchQuery = (type) =>
      `"${role}" ${type}${locationStr} (entry level OR junior OR associate OR new grad)`;

    const exaSearch = async (query) => {
      const res = await fetch('https://api.exa.ai/search', {
        method: 'POST',
        headers: { 'x-api-key': EXA_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          type: 'keyword',
          numResults: 15,
          includeDomains: ATS_DOMAINS,
          contents: { highlights: { maxCharacters: 600 } },
          startPublishedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });
      if (!res.ok) throw new Error(`Exa search failed: ${res.status}`);
      return res.json();
    };

    const [internData, ftData] = await Promise.all([
      exaSearch(searchQuery('internship')),
      exaSearch(searchQuery('job')),
    ]);

    console.log(`[getLiveJobMatchesFn] Exa intern results: ${internData.results?.length || 0}, FT results: ${ftData.results?.length || 0}`);

    const allResults = [...(internData.results || []), ...(ftData.results || [])];

    // Deduplicate by URL
    const seen = new Set();
    const jobs = allResults
      .filter(r => {
        if (!r.url || !r.title) return false;
        if (seen.has(r.url)) return false;
        seen.add(r.url);
        if (SENIOR_FILTER.test(r.title)) return false;
        return ATS_URL_PATTERNS.some(p => p.test(r.url));
      })
      .map(r => {
        // Extract company from ATS URL slug
        const urlMatch = r.url.match(/(?:jobs\.lever\.co|boards\.greenhouse\.io|jobs\.ashbyhq\.com|apply\.workable\.com)\/([^/]+)/);
        const companySlug = urlMatch?.[1] || '';
        const companyName = companySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        // Extract job title — prefer snippet header (## Title), then parse page title
        const snippetText = (r.highlights || []).join(' ');
        const snippetHeaderMatch = snippetText.match(/##\s*([^\n\[]{3,80})/);
        // Page title format varies: "Job Title @ Company - Jobs" or "Company | Job Title"
        const rawTitle = (r.title || '').replace(/ - (Jobs|Careers|Lever|Greenhouse|Ashby|Workable)$/i, '').trim();
        const titleParts = rawTitle.split(/[@|·\-–]/).map(s => s.trim()).filter(Boolean);
        const titleCandidate = titleParts.find(p => ROLE_WORD.test(p)) || titleParts[0];
        const jobTitle = snippetHeaderMatch?.[1]?.trim() || titleCandidate || rawTitle;

        // Freshness
        const publishedDate = r.publishedDate ? new Date(r.publishedDate) : null;
        const daysLive = publishedDate
          ? Math.max(0, Math.floor((Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24)))
          : null;

        const matchedDomain = ATS_DOMAINS.find(d => r.url.includes(d));

        return {
          name: companyName,
          job_title: jobTitle,
          job_url: r.url,
          source: matchedDomain ? (ATS_SOURCE_LABELS[matchedDomain] || matchedDomain) : 'ATS',
          hiring_description: (r.highlights || [])[0] || '',
          hiring_signal: daysLive !== null && daysLive <= 3 ? 'hot' : 'warm',
          days_live: daysLive,
          industry: career_goals.industries?.[0] || '',
          has_web_result: true,
        };
      })
      .filter(j => j.name && j.job_title)
      .slice(0, 10);

    console.log(`[getLiveJobMatchesFn] Returning ${jobs.length} real ATS job leads`);

    return Response.json({ companies: jobs });

  } catch (error) {
    console.error('[getLiveJobMatchesFn] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});