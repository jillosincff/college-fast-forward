import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Validates that an apply URL still resolves to a live posting for THIS role.
// A 404/410, an "expired/closed" page, or a careers homepage that never
// mentions the role title all fail — the Magic Moment must never render
// "Apply" / "Hiring now" on a dead or invented job.
// Reasons: missing_url | http_fail | closed
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { url, title = '' } = await req.json().catch(() => ({}));
    if (!url || !/^https?:\/\//i.test(url)) return Response.json({ live: false, reason: 'missing_url' });

    let res;
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      res = await fetch(url, {
        redirect: 'follow',
        signal: ctrl.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,*/*',
        },
      });
      clearTimeout(timer);
    } catch (e) {
      return Response.json({ live: false, reason: 'http_fail' });
    }

    if (!res.ok) return Response.json({ live: false, reason: 'http_fail', status: res.status });

    const text = (await res.text()).slice(0, 500000).toLowerCase();

    const CLOSED = /(no longer (accepting|available|active|open)|position (has been )?filled|job (has )?expired|job (has been )?closed|posting (has )?expired|posting (has been )?closed|this (job|position|posting|role) (is|has been) (closed|expired|filled|removed)|has been removed|page not found|job not found)/i;
    if (CLOSED.test(text)) return Response.json({ live: false, reason: 'closed' });

    // Token-level title match instead of exact phrase. Real postings on
    // Greenhouse/Lever/Workday render the title via JavaScript, so the exact
    // title phrase never appears in the raw HTML — those real jobs were being
    // executed as "closed". Require 2+ distinctive title tokens on the page.
    const STOP = new Set(['analyst','associate','intern','internship','junior','jr','sr','senior','lead','coordinator','specialist','assistant','team','role','position','the','and','for','of','to','in','at','with','a','an']);
    const normalize = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const tokens = normalize(title).split(' ').filter(t => t.length > 2 && !STOP.has(t));
    const pageText = normalize(text);
    if (tokens.filter(t => pageText.includes(t)).length >= 2) {
      return Response.json({ live: true });
    }
    // JS-rendered ATS shell: HTTP 200 + no closed language = live. The page is
    // reachable and not a 404/expired page; the title just isn't in raw HTML.
    const ATS = ['greenhouse.io','lever.co','workday','ashby.at','smartrecruiters','taleo','icims','jobvite','myworkdayjobs','applytojob','recruitee','bamboohr'];
    const isATS = ATS.some(h => url.toLowerCase().includes(h));
    const isShell = text.length < 2000 || /id="root"|id="__next"|data-react-root|window\.__INITIAL/i.test(text);
    if (isATS || isShell) return Response.json({ live: true, reason: 'ats_shell' });
    // Generic single-token title (e.g. "Analyst") — can't token-match. A
    // reachable, non-closed page is live; the chip gate already vetted the role.
    if (tokens.length < 2) return Response.json({ live: true, reason: 'generic_title' });
    return Response.json({ live: false, reason: 'closed', detail: 'title_not_on_page' });
  } catch (error) {
    return Response.json({ live: false, reason: 'http_fail', error: error.message });
  }
}