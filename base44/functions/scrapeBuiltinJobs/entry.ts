import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Backup job source: scrapes BuiltIn's entry-level job board directly (HTML fetch —
 * more reliable than Firecrawl for this site). Used by getLiveJobMatchesFn when
 * the primary OpenWeb Ninja provider is down and no cache exists.
 */

const SENIOR_TITLE_RE = /\b(senior|sr\.?|lead|principal|director|manager|mgr|head|vp|vice president|chief|staff|supervisor|architect|executive|expert|experienced)\b|\b(ii|iii|iv|v)\b/i;
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

    const { query = '', remote = false, seeking = 'both' } = await req.json().catch(() => ({}));

    const path = remote ? '/jobs/remote/entry-level' : '/jobs/entry-level';
    const url = `https://builtin.com${path}?search=${encodeURIComponent(query)}`;
    console.log(`[scrapeBuiltinJobs] Fetching ${url}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    let html;
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36' },
        signal: controller.signal,
      });
      if (!res.ok) {
        console.error(`[scrapeBuiltinJobs] BuiltIn returned ${res.status}`);
        return Response.json({ companies: [], error: `BuiltIn returned ${res.status}` });
      }
      html = await res.text();
    } finally {
      clearTimeout(timeout);
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

      companies.push({
        name,
        job_title: title,
        hiring_description: `${name} is hiring for ${title}. View the full posting on BuiltIn.`,
        hiring_signal: signalFromAge(chunk),
        job_url: jobUrl,
        industry: '',
        location: isRemoteJob ? 'Remote' : '',
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