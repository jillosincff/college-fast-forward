import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * getTargetedSignalsFn
 *
 * Fetches REAL job postings from niche ATS boards (Lever, Greenhouse, Ashby, Workable)
 * using Exa search, filtered to entry-level/junior/internship based on user's seeking type.
 * Falls back to a broader search if targeted search returns nothing.
 */

// Niche ATS domains — every URL on these is a real job posting
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

// Maps CFF industry labels → role keywords for search
const INDUSTRY_ROLE_KEYWORDS = {
  'Technology, Information & Media': ['software engineer', 'data analyst', 'product manager', 'UX designer', 'developer'],
  'Media and Entertainment': ['media coordinator', 'content creator', 'production assistant', 'social media', 'marketing coordinator'],
  'Finance & Insurance': ['financial analyst', 'investment analyst', 'accounting', 'audit associate', 'risk analyst'],
  'Human Resources': ['hr coordinator', 'recruiter', 'talent acquisition', 'people operations'],
  'Marketing & Communications': ['marketing coordinator', 'brand associate', 'content writer', 'PR coordinator', 'social media'],
  'Healthcare & Pharmaceuticals': ['clinical coordinator', 'healthcare analyst', 'research associate', 'medical writer'],
  'Professional Services': ['business analyst', 'consultant', 'strategy associate', 'advisory analyst'],
  'Sports & Entertainment': ['sports coordinator', 'event coordinator', 'operations associate', 'media production'],
  'Education & Training': ['education coordinator', 'instructional designer', 'program coordinator', 'curriculum developer'],
  'Retail & Consumer Goods': ['buyer assistant', 'merchandising analyst', 'brand coordinator', 'consumer insights'],
  'Government & Public Sector': ['policy analyst', 'program coordinator', 'government analyst', 'public affairs'],
  'Transportation & Logistics': ['supply chain analyst', 'logistics coordinator', 'operations analyst', 'procurement'],
  'Construction & Agriculture': ['project coordinator', 'civil engineer', 'construction analyst', 'real estate analyst'],
  'Advertising & PR': ['account coordinator', 'media planner', 'PR associate', 'creative associate'],
  'default': ['analyst', 'coordinator', 'associate', 'specialist', 'assistant'],
};

// Map user's seeking/job_type to Exa-friendly search terms
function getLevelTerms(user) {
  const seeking = (user?.career_goals?.seeking || user?.job_type || '').toLowerCase();
  if (seeking.includes('intern')) return ['internship', 'intern'];
  if (seeking.includes('part')) return ['part-time', 'part time'];
  // Default: entry-level / junior / new grad (covers most students)
  return ['entry level', 'junior', 'new grad', 'associate'];
}

function getSourceLabel(url) {
  const domain = ATS_DOMAINS.find(d => url.includes(d));
  return domain ? (ATS_SOURCE_LABELS[domain] || 'Niche Board') : 'Niche Board';
}

function extractCompanyFromUrl(url) {
  const match = url?.match(/(?:jobs\.lever\.co|boards\.greenhouse\.io|jobs\.ashbyhq\.com|apply\.workable\.com)\/([^/?#]+)/);
  if (!match) return '';
  return match[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function extractJobTitle(r) {
  // Try to get title from snippet headers
  const snippetText = (r.highlights || []).join(' ');
  const headerMatch = snippetText.match(/##\s*([^\n\[]{5,80})/);
  if (headerMatch) return headerMatch[1].trim();

  // Parse page title: often "Company | Job Title" or "Job Title at Company"
  const raw = r.title || '';
  const parts = raw.split(/[|·\-–]/).map(s => s.trim()).filter(Boolean);
  const roleWords = /\b(engineer|analyst|associate|intern|coordinator|specialist|manager|developer|designer|consultant|researcher|scientist|writer|advisor|representative|assistant|strategist|accountant|producer|planner|buyer|coordinator)\b/i;
  const candidate = parts.find(p => roleWords.test(p));
  return candidate || parts[0] || raw;
}

const SENIOR_FILTER = /\b(senior|sr\b|lead|principal|director|manager|head of|vp\b|vice president|staff engineer|architect|managing partner|executive)\b/i;

Deno.serve(async (req) => {
  try {
    const EXA_API_KEY = Deno.env.get('EXA_API_KEY');
    if (!EXA_API_KEY) {
      return Response.json({ error: 'EXA_API_KEY not set', signals: [] }, { status: 500 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized', signals: [] }, { status: 401 });
    }

    const careerGoals = user.career_goals || {};
    const targetIndustries = careerGoals.target_industries || [];
    const targetRoles = careerGoals.target_roles || [];
    const location = careerGoals.location_preference || careerGoals.preferred_location || '';
    const levelTerms = getLevelTerms(user);

    // Build role keywords from user's target roles + industry keywords
    const industryRoleKeywords = targetIndustries.flatMap(ind => {
      const key = Object.keys(INDUSTRY_ROLE_KEYWORDS).find(k =>
        k.toLowerCase() === ind.toLowerCase() || ind.toLowerCase().includes(k.toLowerCase().split(' ')[0])
      );
      return INDUSTRY_ROLE_KEYWORDS[key] || INDUSTRY_ROLE_KEYWORDS['default'];
    });

    // Combine explicit target roles with industry-derived keywords, deduplicated
    // Clean each term: no commas, trim whitespace, skip empty
    const cleanTerm = t => t.replace(/,/g, '').trim();
    const allRoleTerms = [...new Set([...targetRoles, ...industryRoleKeywords])]
      .map(cleanTerm)
      .filter(Boolean);
    const roleQuery = allRoleTerms.slice(0, 4).map(t => `"${t}"`).join(' OR ') || '"analyst" OR "coordinator" OR "associate"';
    const levelQuery = levelTerms.map(t => `"${t}"`).join(' OR ');
    const locationStr = location ? ` ${location}` : '';
    const query = `(${roleQuery}) (${levelQuery})${locationStr}`;

    console.log(`[getTargetedSignalsFn] Searching Exa: "${query}"`);

    const exaSearch = async (q, extraParams = {}) => {
      const res = await fetch('https://api.exa.ai/search', {
        method: 'POST',
        headers: { 'x-api-key': EXA_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          type: 'keyword',
          numResults: 20,
          includeDomains: ATS_DOMAINS,
          contents: { highlights: { maxCharacters: 600 } },
          ...extraParams,
        }),
      });
      const data = await res.json();
      console.log(`[getTargetedSignalsFn] Exa status: ${res.status}, results: ${(data.results || []).length}, error: ${data.error || 'none'}`);
      return data.results || [];
    };

    let results = await exaSearch(query, {
      startPublishedDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    });

    // If targeted search returned nothing, try without date filter
    if (!results.length) {
      console.log('[getTargetedSignalsFn] No results with date filter, removing date constraint...');
      results = await exaSearch(query);
    }

    // If still nothing, try a broad role-only fallback using just first role term
    if (!results.length && allRoleTerms.length > 0) {
      console.log('[getTargetedSignalsFn] No results, trying role-only fallback...');
      const fallbackQuery = `${allRoleTerms[0]} jobs (${levelQuery})`;
      results = await exaSearch(fallbackQuery);
    }

    // Filter and map to signal objects — check URL contains any ATS domain
    const isATSUrl = (url) => ATS_DOMAINS.some(d => url && url.includes(d));

    // Professional role whitelist — title must contain at least one of these to be relevant
    const ROLE_WHITELIST = /\b(engineer|analyst|associate|intern|coordinator|specialist|developer|designer|consultant|researcher|scientist|writer|advisor|strategist|accountant|producer|planner|buyer|manager|recruiter|marketer|marketing|sales|operations|finance|data|software|product|ux|ui|legal|communications|pr|account|media|content|brand|project|program|policy|clinical|research|business|financial|investment|hr|talent|supply chain|logistics|procurement|public relations|social media|growth|customer success|technical|implementation|solution|architect|devops|security|quality|audit|compliance|editorial|creative|digital|event|field|community|partnerships|revenue|insights|reporting|visualization|machine learning|ai|nlp|computer vision|mobile|frontend|backend|full.?stack|infrastructure|platform|api|cloud|embedded|firmware|hardware|electrical|mechanical|civil|biomedical|chemical|industrial|environmental|aerospace|manufacturing)\b/i;

    const signals = results
      .filter(r => {
        if (!r.url || !r.title) return false;
        if (!isATSUrl(r.url)) return false;
        if (SENIOR_FILTER.test(r.title)) return false;
        // Must look like a real professional/white-collar role
        if (!ROLE_WHITELIST.test(r.title)) return false;
        return true;
      })
      .map(r => {
        const publishedDate = r.publishedDate ? new Date(r.publishedDate) : null;
        const daysLive = publishedDate
          ? Math.max(0, Math.floor((Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24)))
          : null;

        let riskLevel = 'LOW';
        if (daysLive !== null) {
          if (daysLive > 6) riskLevel = 'HIGH';
          else if (daysLive > 3) riskLevel = 'MEDIUM';
        }

        const company = extractCompanyFromUrl(r.url);
        const jobTitle = extractJobTitle(r);
        const source = getSourceLabel(r.url);

        // Skip if extracted title is senior or not a recognized professional role
        if (SENIOR_FILTER.test(jobTitle)) return null;
        if (!ROLE_WHITELIST.test(jobTitle)) return null;

        return {
          id: r.id || r.url,
          type: 'live_posting',
          emoji: riskLevel === 'LOW' ? '🔥' : riskLevel === 'MEDIUM' ? '🎯' : '📡',
          count: 1,
          label: jobTitle || 'New Opening',
          company,
          detail: `Posted on ${source}`,
          time: daysLive !== null ? (daysLive === 0 ? 'Today' : `${daysLive}d ago`) : 'Recently',
          badge: daysLive !== null && daysLive <= 1 ? 'NEW' : null,
          source,
          sourceUrl: r.url,
          daysLive,
          riskLevel,
          publishedDate: publishedDate?.toISOString() || null,
          snippet: (r.highlights || [])[0] || '',
          realAlumniCount: null,
          parentCount: 0,
          expansion: {
            roles: [{ title: jobTitle, status: riskLevel === 'LOW' ? '🟢' : riskLevel === 'MEDIUM' ? '🟡' : '🔴' }],
            intel: `Posted ${daysLive !== null ? `${daysLive} day${daysLive !== 1 ? 's' : ''} ago` : 'recently'} on ${source}. ${riskLevel === 'LOW' ? 'Fresh listing — apply now for best odds.' : riskLevel === 'MEDIUM' ? 'A few days old — still worth applying but move quickly.' : 'Posting is over a week old — competition may be high.'}`,
            cta: '🔗 View & Apply on ' + source,
            ctaType: 'external_link',
            applyUrl: r.url,
          },
        };
      })
      .filter(j => j !== null && j.label)
      .slice(0, 6);

    console.log(`[getTargetedSignalsFn] Returning ${signals.length} real job signals`);
    return Response.json({ signals });

  } catch (error) {
    console.error('getTargetedSignalsFn error:', error.message);
    return Response.json({ error: error.message, signals: [] }, { status: 500 });
  }
});