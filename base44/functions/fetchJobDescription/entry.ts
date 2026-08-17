import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// --- SSRF guard: only allow public http(s) URLs, resolved to non-private IPs ---
function isPrivateIp(ip: string): boolean {
  if (ip.includes(':')) {
    const lower = ip.toLowerCase();
    return lower === '::1' || lower.startsWith('fe80') || lower.startsWith('fc') || lower.startsWith('fd');
  }
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4) return true;
  const [a, b] = parts;
  return (
    a === 127 || a === 10 || a === 0 ||                       // loopback, private, "this"
    (a === 172 && b >= 16 && b <= 31) ||                      // private
    (a === 192 && b === 168) ||                               // private
    (a === 169 && b === 254) ||                               // link-local + cloud metadata
    a >= 224                                                  // multicast / reserved
  );
}

async function assertSafeUrl(raw: string): Promise<string> {
  let parsed: URL;
  try { parsed = new URL(raw); } catch { throw new Error('Invalid URL'); }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error('Only http(s) URLs are allowed');
  const host = parsed.hostname;
  if (!host) throw new Error('Invalid URL host');
  let ips: string[] = [];
  try { ips = ips.concat(await Deno.resolveDns(host, 'A')); } catch { /* may only have AAAA */ }
  try { ips = ips.concat(await Deno.resolveDns(host, 'AAAA')); } catch { /* may only have A */ }
  if (ips.length === 0) throw new Error('Could not resolve hostname');
  for (const ip of ips) { if (isPrivateIp(ip)) throw new Error('Internal or private URLs are not allowed'); }
  return parsed.toString();
}

// Fetches a job posting URL and extracts the clean job description text,
// so the tailoring screen can pre-fill it for the student.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { url } = await req.json();
    if (!url) return Response.json({ success: false, error: 'url is required' }, { status: 400 });

    // Validate the URL before any outbound request to prevent SSRF (private/loopback/link-local targets).
    let safeUrl: string;
    try {
      safeUrl = await assertSafeUrl(String(url));
    } catch (e) {
      return Response.json({ success: false, error: (e as Error).message || 'Invalid URL' }, { status: 400 });
    }

    // Pages behind bot detection serve junk to headless scrapers, so try a
    // direct fetch with a real browser identity first, then fall back to Firecrawl.
    let content = null;

    // 1) Direct HTML fetch (captures server-rendered pages + JSON-LD job data)
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      const resp = await fetch(safeUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (resp.ok) {
        const html = await resp.text();
        // Prefer the JSON-LD JobPosting block when present — it carries the full JD
        const ldMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
        for (const block of ldMatches) {
          try {
            const json = JSON.parse(block.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, ''));
            const items = Array.isArray(json) ? json : [json];
            const posting = items.find(i => i && (i['@type'] === 'JobPosting' || (Array.isArray(i['@type']) && i['@type'].includes('JobPosting'))));
            if (posting?.description) {
              content = String(posting.description);
              break;
            }
          } catch (_e) { /* malformed block — keep looking */ }
        }
        // Otherwise strip the HTML down to visible text
        if (!content) {
          const text = html
            .replace(/<script[\s\S]*?<\/script>/gi, ' ')
            .replace(/<style[\s\S]*?<\/style>/gi, ' ')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/\s{2,}/g, ' ')
            .trim();
          if (text.length > 500) content = text;
        }
      }
    } catch (_e) { /* fall through to Firecrawl */ }

    // 2) Firecrawl fallback for JS-rendered pages
    if (!content || content.length < 500) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 15000);
        const resp = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('FIRECRAWL_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: safeUrl, formats: ['markdown'], onlyMainContent: true, waitFor: 3000 }),
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (resp.ok) {
          const data = await resp.json();
          const md = data?.data?.markdown || '';
          if (md.length > (content?.length || 0)) content = md;
        }
      } catch (_e) { /* handled below */ }
    }
    if (!content || content.length < 100) {
      return Response.json({ success: false, error: 'Could not read the job posting page' });
    }

    // Extract just the job description from the page content
    const extracted = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Below is the scraped content of a job posting web page. Extract ONLY the job description itself: the role summary, responsibilities, requirements/qualifications, and any compensation/benefits details. Preserve the original wording. Exclude navigation, cookie banners, footers, "similar jobs" listings, and application form text. If the page does not contain a job description, return exactly "NONE".\n\nPAGE CONTENT:\n${content.slice(0, 20000)}`,
    });

    const jd = typeof extracted === 'string' ? extracted.trim() : '';
    if (!jd || jd === 'NONE' || jd.length < 100) {
      return Response.json({ success: false, error: 'No job description found on the page' });
    }

    return Response.json({ success: true, jobDescription: jd });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});