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

    // The page must actually be about THIS role — a generic careers homepage
    // that never mentions the exact title is not a live posting for it.
    // Exact phrase match (normalized whitespace/punctuation), not loose tokens:
    // "account" + "coordinator" scattered across a careers page must NOT pass.
    const normalize = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const phrase = normalize(title);
    if (phrase && !normalize(text).includes(phrase)) {
      return Response.json({ live: false, reason: 'closed', detail: 'title_not_on_page' });
    }

    return Response.json({ live: true });
  } catch (error) {
    return Response.json({ live: false, reason: 'http_fail', error: error.message });
  }
}