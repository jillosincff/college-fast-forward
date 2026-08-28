import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from 'base44:runtime';
import { isProUser } from '../../shared/entitlements.ts';
import { rankAndDedupe, stampAlumniShown, shuffle } from '../../shared/peopleSearch.ts';

// Agent Jesse — Layer 2 people search for PAID users only.
//
// The Jesse API takes ~60-90s to complete a search. This function uses an
// ASYNC RETRY pattern: it creates the search, polls for ~25s, and if the
// search is still running, returns { pending: true, searchId }. The client
// retries with that searchId and this call polls again until completion.
//
// Results are cached to DiscoveredAlumni (24h TTL) so repeat lookups are
// instant. Server-side only: the JESSE_API_KEY never reaches the client.
export default async function (req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // PAID ONLY — never run Jesse during free onboarding or for free users.
    if (!isProUser(user)) {
      return Response.json({ connections: [], upgrade_required: true });
    }

    const {
      schoolName, schoolCode: schoolCodeRaw, chipText, location,
      companyName, targetRole, searchId: existingSearchId,
    } = await req.json().catch(() => ({}));

    const schoolCode = (schoolCodeRaw || user.school_code || '').toUpperCase();
    const school = schoolName || user.school || '';

    const apiKey = secrets.get('JESSE_API_KEY');
    if (!apiKey) return Response.json({ connections: [], error: 'Jesse API key not configured' });

    const sr = base44.asServiceRole;
    const JESSE_BASE = 'https://agentjesse-backend.floworks.ai/api/v1';
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };

    // 0) Check DiscoveredAlumni cache (24h TTL) — instant return if we have
    //    fresh results from a prior Jesse run. This makes repeat dashboard
    //    visits instant instead of waiting 80s again.
    if (schoolCode && !existingSearchId) {
      try {
        const alumni = await sr.entities.DiscoveredAlumni.filter(
          { school_code: schoolCode }, '-created_date', 500
        );
        const now = Date.now();
        const fresh = (alumni || []).filter(a => {
          if (a.expires_at && new Date(a.expires_at).getTime() < now) return false;
          return true;
        });
        if (fresh.length >= 3) {
          // Least-recently-shown first, same rotation logic as findCliffPeople
          const sorted = shuffle(fresh).sort((a, b) => {
            const at = a.last_shown_at ? new Date(a.last_shown_at).getTime() : 0;
            const bt = b.last_shown_at ? new Date(b.last_shown_at).getTime() : 0;
            return at - bt;
          });
          const cached = sorted.map(a => ({
            tier: 2, source: 'jesse',
            name: a.name,
            role_title: a.role_title || '',
            company: a.company || companyName || '',
            school: school || schoolCode,
            graduation_year: null,
            linkedin_url: a.linkedin_url || '',
            email: a.email || '',
            persona: 'alumni',
            school_code: schoolCode,
            why: a.description || `${school} alum found via Jesse`,
            label: 'Found via Jesse',
            source_url: a.source_url || a.linkedin_url || '',
            _alumni_id: a.id,
          })).filter((c: any) => !EXCLUDED_TITLES.test(c.role_title || ''));
          const deduped = rankAndDedupe(cached, targetRole || chipText || '', 3);
          await stampAlumniShown(sr, deduped);
          return Response.json({
            connections: deduped,
            recommended: deduped[0] || null,
            people_source: 'cache',
            person_found: deduped.length > 0,
          });
        }
      } catch (e) { /* cache check best-effort */ }
    }

    let searchId = existingSearchId;

    // 1) If no existing searchId, create + start a new Jesse search
    if (!searchId) {
      const appUrl = secrets.get('APP_BASE_URL') || 'https://collegefastforward.com';
      const createRes = await fetch(`${JESSE_BASE}/people-search/create`, {
        method: 'POST', headers,
        body: JSON.stringify({
          companyUrl: appUrl,
          productDescription: 'AI career platform helping college students find internships and jobs through alumni connections and warm introductions',
        }),
      });
      if (!createRes.ok) return Response.json({ connections: [], pending: true });
      const createData = await createRes.json();
      searchId = createData.searchId || createData.id || createData._id || createData.search_id;
      if (!searchId) return Response.json({ connections: [], pending: true });

      // Start research with the early-career ICP
      const icpDescription = buildICP(school, chipText, location, companyName);
      const researchRes = await fetch(`${JESSE_BASE}/people-search/research`, {
        method: 'POST', headers,
        body: JSON.stringify({ searchId, icpDescription, numProspects: 6 }),
      });
      if (!researchRes.ok) return Response.json({ connections: [], pending: true });
    }

    // 2) Poll until complete or ~25s deadline (per call).
    //    The client retries with the searchId if we return pending.
    const deadline = Date.now() + 25000;
    let pollData: any = null;
    let completed = false;
    while (Date.now() < deadline) {
      await sleep(3000);
      const pollRes = await fetch(`${JESSE_BASE}/people-search/research/${searchId}?page=1&limit=25`, { headers });
      if (!pollRes.ok) continue;
      pollData = await pollRes.json();
      const status = (pollData.status || '').toLowerCase();
      if (['completed', 'complete', 'done', 'finished'].includes(status)) { completed = true; break; }
      if (['failed', 'error', 'cancelled'].includes(status)) { pollData = null; break; }
    }

    // 3) If still processing or failed, return pending + searchId for retry
    if (!pollData || !completed) {
      return Response.json({ connections: [], pending: true, searchId });
    }

    // 4) Map results — Jesse returns people[] with full_name, title, company_name
    const people: any[] = pollData.people || pollData.prospects || pollData.results || pollData.data || [];
    const connections: any[] = people.slice(0, 8).map((p: any) => {
      const linkedinUrl = extractLinkedInUrl(p);
      return {
        tier: 4,
        source: 'jesse',
        name: p.full_name || p.name || '',
        role_title: p.title || p.job_title || '',
        company: p.company_name || p.company || companyName || '',
        school: school || schoolCode,
        graduation_year: null,
        linkedin_url: linkedinUrl,
        email: p.email || p.work_email || p.personal_email || '',
        persona: 'alumni',
        school_code: schoolCode,
        why: p.rationale || p.summary || `${school} alum found via Agent Jesse`,
        label: 'Found via Jesse',
        source_url: linkedinUrl || '',
      };
    }).filter((c: any) => c.name && c.name !== 'Unknown');

    // 5) Cache to DiscoveredAlumni (24h TTL) so repeat lookups skip Jesse
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const nowIso = new Date().toISOString();
    for (const c of connections.slice(0, 5)) {
      try {
        const created = await sr.entities.DiscoveredAlumni.create({
          name: c.name,
          role_title: c.role_title || '',
          company: companyName || c.company || '',
          school_code: schoolCode,
          source_url: c.source_url || c.linkedin_url || '',
          degree_info: c.graduation_year || '',
          location: location || '',
          linkedin_url: c.linkedin_url || '',
          email: c.email || '',
          description: c.why || '',
          verified: false,
          expires_at: expires,
          last_shown_at: nowIso,
        });
        if (created?.id) c._alumni_id = created.id;
      } catch (e) { /* cache best-effort */ }
    }

    // 6) Drop excluded titles (VP/MD/chief/founder), then rank + dedupe to 3.
    //    Peer-level coordinators/AEs/associates rank above any remaining directors
    //    via outreachPenalty in rankAndDedupe.
    const peerOnly = connections.filter((c: any) => !EXCLUDED_TITLES.test(c.role_title || ''));
    const deduped = rankAndDedupe(peerOnly, targetRole || chipText || '', 3);
    await stampAlumniShown(sr, deduped);

    // 7) CFF-branded notification email — replaces any Jesse/Floworks email.
    //    Fires ONLY on live search completion with results. Cache hits return
    //    early above; pending/error/empty paths never reach here. Free users
    //    are blocked at the isProUser gate.
    if (deduped.length > 0 && user.email) {
      try {
        await sendPeopleFoundEmail({
          to: user.email,
          firstName: (user.full_name || user.email).split(' ')[0],
          school: school || schoolCode,
          chip: chipText || targetRole || 'your field',
          location: location || '',
          peopleCount: deduped.length,
        });
      } catch (e) { /* best-effort — don't break the search */ }
    }

    return Response.json({
      connections: deduped,
      recommended: deduped[0] || null,
      people_source: deduped.length === 0 ? 'none' : 'jesse',
      person_found: deduped.length > 0,
    });
  } catch (error) {
    return Response.json({ connections: [], error: error.message }, { status: 500 });
  }
}

/** Extracts a LinkedIn URL from Jesse's sourceUrls array, or constructs a
 *  LinkedIn people-search fallback URL using the person's name + company. */
function extractLinkedInUrl(p: any): string {
  if (Array.isArray(p.sourceUrls)) {
    const li = p.sourceUrls.find((u: string) => /linkedin\.com/i.test(u));
    if (li) return li;
  }
  const name = p.full_name || p.name || '';
  const company = p.company_name || p.company || '';
  if (name) {
    const query = company ? `${name} ${company}` : name;
    return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}`;
  }
  return '';
}

// Hard-exclude titles — these NEVER belong in a peer-level student contact list.
const EXCLUDED_TITLES = /\b(managing director|partner|vp|vice president|svp|evp|chief|president|founder|alumni association)\b/i;

function buildICP(school: string, chipText: string, location: string, companyName: string): string {
  const companyClause = companyName ? ` and currently work at ${companyName}` : '';
  const locationClause = location ? ` in ${location}` : '';
  return `${school} graduates working in ${chipText || 'business'}${locationClause}${companyClause}. Prefer titles: intern, coordinator, assistant, associate, specialist, account executive, recruiter, SDR, BDR, analyst. Exclude: managing director, partner, VP, SVP, EVP, chief, president, founder, alumni association officer. Prefer grad years ~2018-2026 when available.`;
}

function sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }

/**
 * Sends a CFF/CLIFF-branded notification email when a Jesse people search
 * completes with results. No vendor names (Jesse/Floworks) appear anywhere.
 * Does not attach raw data or individual emails — just a count + CTA.
 */
async function sendPeopleFoundEmail({ to, firstName, school, chip, location, peopleCount }: {
  to: string; firstName: string; school: string; chip: string; location: string; peopleCount: number;
}): Promise<void> {
  const sendgridKey = secrets.get('SENDGRID_API_KEY');
  if (!sendgridKey) return;

  const appUrl = secrets.get('APP_BASE_URL') || 'https://app.collegefastforward.com';
  const locClause = location ? ` in ${location}` : '';
  const subject = `We found ${peopleCount} ${peopleCount === 1 ? 'person' : 'people'} from ${school} in ${chip}`;
  const ctaUrl = `${appUrl}/#/FreeTierDashboard`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f9fc;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fc;padding:40px 0">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;max-width:560px;width:100%;box-shadow:0 2px 8px rgba(109,40,217,0.08)">
      <tr><td style="background:#312e81;padding:32px 36px">
        <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#8b5cf6">PEOPLE FROM YOUR SCHOOL</p>
        <h1 style="margin:10px 0 0;font-size:24px;font-weight:700;color:#fff;line-height:1.3">We found ${peopleCount} ${school} alumni in ${chip}${locClause}.</h1>
      </td></tr>
      <tr><td style="padding:28px 36px">
        <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7">Hi ${firstName},</p>
        <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7">CLIFF finished searching for ${school} alumni who landed in ${chip}${locClause}. ${peopleCount} ${peopleCount === 1 ? 'person is' : 'people are'} ready to view — each comes with a draft message you can copy and send.</p>
        <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7">Tap below to see them on your dashboard.</p>
        <div style="text-align:center;margin-bottom:8px">
          <a href="${ctaUrl}" style="display:inline-block;background:#6d28d9;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 32px;border-radius:10px">See your people →</a>
        </div>
      </td></tr>
      <tr><td style="background:#f5f3ff;padding:16px 36px;text-align:center;border-top:1px solid #ede9fe">
        <p style="margin:0;font-size:11px;color:#9ca3af">College Fast Forward · CLIFF</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

  await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sendgridKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: { email: 'support@collegefastforward.com', name: 'College Fast Forward' },
      personalizations: [{ to: [{ email: to }] }],
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  });
}