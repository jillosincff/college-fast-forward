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
          const cached = sorted.slice(0, 5).map(a => ({
            tier: 2, source: 'jesse',
            name: a.name,
            role_title: a.role_title || '',
            company: a.company || companyName || '',
            school: school || schoolCode,
            graduation_year: null,
            linkedin_url: a.linkedin_url || '',
            persona: 'alumni',
            school_code: schoolCode,
            why: a.description || `${school} alum found via Jesse`,
            label: 'Found via Jesse',
            source_url: a.source_url || a.linkedin_url || '',
            _alumni_id: a.id,
          }));
          const deduped = rankAndDedupe(cached, targetRole || chipText || '', 5);
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
        body: JSON.stringify({ searchId, icpDescription, numProspects: 5 }),
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
    const connections: any[] = people.slice(0, 5).map((p: any) => {
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
          description: c.why || '',
          verified: false,
          expires_at: expires,
          last_shown_at: nowIso,
        });
        if (created?.id) c._alumni_id = created.id;
      } catch (e) { /* cache best-effort */ }
    }

    // 6) Rank + dedupe (peer-level before senior, same as findCliffPeople)
    const deduped = rankAndDedupe(connections, targetRole || chipText || '', 5);
    await stampAlumniShown(sr, deduped);

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

function buildICP(school: string, chipText: string, location: string, companyName: string): string {
  const companyClause = companyName ? ` and currently work at ${companyName}` : '';
  const locationClause = location ? ` in ${location}` : '';
  return `${school} graduates working in ${chipText || 'business'}${locationClause}${companyClause}. Early-career titles only: intern, coordinator, analyst, associate, specialist, recruiter, SDR, BDR. Exclude managing director, partner, VP, chief, president.`;
}

function sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }