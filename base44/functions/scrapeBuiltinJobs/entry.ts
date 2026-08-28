import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Backup job source: scrapes BuiltIn's entry-level job board directly (HTML fetch —
 * more reliable than Firecrawl for this site). Used by getLiveJobMatchesFn when
 * the primary OpenWeb Ninja provider is down and no cache exists.
 */

const SENIOR_TITLE_RE = /\b(senior|sr\.?|lead|principal|director|manager|mgr|head|vp|vice president|chief|staff|supervisor|architect|expert|experienced)\b|\b(ii|iii|iv|v)\b/i;
const INTERN_TITLE_RE = /\b(intern|internship|co-?op)\b/i;
const ENTRY_TITLE_RE = /\b(junior|jr\.?|entry|graduate|trainee|new grad)\b/i;

const decodeEntities = (s) => (s || '')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').trim();

function signalFromAge(chunk) {
  const m = chunk.match(/(\d+)\s+(Hours?|Days?)\s+Ago/i);
  if (!m) return 'warm';
  if (/hour/i.test(m[2])) return 'hot';
  const days = parseInt(m[1], 10);
  if (days <= 2) return 'hot';
  if (days <= 5) return 'warm';
  return 'cool';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { query = '', remote = false, seeking = 'both', location = '' } = await req.json().catch(() => ({}));

    // Try a city-specific BuiltIn board for known metros — jobs there are
    // genuinely local. Falls back to the national entry-level board.
    const BUILTIN_CITIES = {
      'new york': 'newyork', 'newyork': 'newyork', 'nyc': 'newyork',
      'los angeles': 'losangeles', 'san francisco': 'sanfrancisco',
      'chicago': 'chicago', 'boston': 'boston', 'austin': 'austin',
      'seattle': 'seattle', 'denver': 'denver', 'atlanta': 'atlanta',
      'dallas': 'dallas', 'houston': 'houston', 'miami': 'miami',
      'philadelphia': 'philadelphia', 'phoenix': 'phoenix',
      'portland': 'portland', 'washington': 'dc', 'washington dc': 'dc', 'dc': 'dc',
    };
    const citySlug = (!remote && location)
      ? (BUILTIN_CITIES[location.split(',')[0].trim().toLowerCase()] || null)
      : null;

    const fetchHtml = async (urlPath) => {
      const fetchUrl = `https://builtin.com${urlPath}?search=${encodeURIComponent(query)}`;
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 12000);
      try {
        const res = await fetch(fetchUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36' },
          signal: ctrl.signal,
        });
        if (!res.ok) return null;
        return await res.text();
      } catch { return null; }
      finally { clearTimeout(t); }
    };

    let html;
    if (citySlug) {
      console.log(`[scrapeBuiltinJobs] Fetching city board: /${citySlug}/jobs/entry-level`);
      html = await fetchHtml(`/${citySlug}/jobs/entry-level`);
      if (!html || html.split('data-id="job-card"').slice(1).length === 0) {
        console.log(`[scrapeBuiltinJobs] City board empty — falling back to national`);
        html = await fetchHtml(remote ? '/jobs/remote/entry-level' : '/jobs/entry-level');
      }
    } else {
      const path = remote ? '/jobs/remote/entry-level' : '/jobs/entry-level';
      console.log(`[scrapeBuiltinJobs] Fetching ${path}`);
      html = await fetchHtml(path);
    }
    if (!html) {
      console.error(`[scrapeBuiltinJobs] BuiltIn unreachable`);
      return Response.json({ companies: [], error: 'BuiltIn unreachable' });
    }

    // Each job listing starts at a data-id="job-card" marker
    const chunks = html.split('data-id="job-card"').slice(1);
    const companies = [];
    const seen = new Set();

    for (const chunk of chunks) {
      const companyMatch = chunk.match(/data-id="company-title"[^>]*>\s*(?:<span[^>]*>)?([^<]{2,80})/);
      const titleMatch = chunk.match(/<a href="(\/job\/[^"]+)"[^>]*data-id="job-card-title"[^>]*>([^<]{3,140})</);
      if (!companyMatch || !titleMatch) continue;

      const name = decodeEntities(companyMatch[1]);
      const title = decodeEntities(titleMatch[2]);
      const jobUrl = `https://builtin.com${titleMatch[1]}`;
      if (!name || !title) continue;

      // Skip non-job placeholder listings
      if (/talent community|general application|future opportunit|talent pool|talent network/i.test(title)) continue;

      const isIntern = INTERN_TITLE_RE.test(title);
      if (seeking === 'internship' && !isIntern) continue;
      if (seeking === 'fulltime' && isIntern) continue;
      if (SENIOR_TITLE_RE.test(title) && !ENTRY_TITLE_RE.test(title) && !isIntern) continue;

      const key = `${name.toLowerCase()}|${title.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const logoMatch = chunk.match(/data-id="company-img"[^>]*src="([^"]+)"/);
      const isRemoteJob = /\bRemote\b/.test(chunk);
      // Try to extract the per-card location from BuiltIn's HTML
      const locMatch = chunk.match(/data-id="job-location"[^>]*>\s*(?:<[^>]*>\s*)?([^<]{2,60})/)
        || chunk.match(/class="[^"]*location[^"]*"[^>]*>\s*([^<]{2,60})/);

      companies.push({
        name,
        job_title: title,
        hiring_description: `${name} is hiring for ${title}. View the full posting on BuiltIn.`,
        hiring_signal: signalFromAge(chunk),
        job_url: jobUrl,
        industry: '',
        location: isRemoteJob ? 'Remote' : (locMatch ? decodeEntities(locMatch[1]).trim() : ''),
        salary_range: null,
        posted_date: null,
        logo_url: logoMatch ? logoMatch[1] : null,
        has_web_result: true,
        verified_posting: true,
        source: 'builtin',
      });
    }

    console.log(`[scrapeBuiltinJobs] Parsed ${companies.length} jobs from ${chunks.length} cards`);
    return Response.json({ companies });

  } catch (error) {
    console.error('[scrapeBuiltinJobs] Error:', error.message);
    return Response.json({ companies: [], error: error.message }, { status: 500 });
  }
});