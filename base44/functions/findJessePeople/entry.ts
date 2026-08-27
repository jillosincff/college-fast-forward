import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from 'base44:runtime';
import { isProUser } from '../../shared/entitlements.ts';
import { rankAndDedupe, stampAlumniShown } from '../../shared/peopleSearch.ts';

// Agent Jesse — Layer 2 people search for PAID users only.
// Runs when Layer 1 (opt-in graph + cached alumni) is empty.
// Server-side only: the JESSE_API_KEY never reaches the client.
// Hard cap ~18s; returns empty on timeout so the caller shows LinkedIn fallback.
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
      companyName, targetRole,
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

    // 1) Create search — companyUrl + productDescription satisfy the API;
    //    the ICP description (step 2) is what actually drives the people query.
    const appUrl = secrets.get('APP_BASE_URL') || 'https://collegefastforward.com';
    const createRes = await fetch(`${JESSE_BASE}/people-search/create`, {
      method: 'POST', headers,
      body: JSON.stringify({
        companyUrl: appUrl,
        productDescription: 'AI career platform helping college students find internships and jobs through alumni connections and warm introductions',
      }),
    });
    if (!createRes.ok) return Response.json({ connections: [] });
    const createData = await createRes.json();
    const searchId = createData.id || createData.searchId || createData._id || createData.search_id;
    if (!searchId) return Response.json({ connections: [] });

    // 2) Start research with the early-career ICP
    const icpDescription = buildICP(school, chipText, location, companyName);
    const researchRes = await fetch(`${JESSE_BASE}/people-search/research`, {
      method: 'POST', headers,
      body: JSON.stringify({ searchId, icpDescription, numProspects: 5 }),
    });
    if (!researchRes.ok) return Response.json({ connections: [] });

    // 3) Poll until complete or 18s deadline
    const deadline = Date.now() + 18000;
    let pollData: any = null;
    while (Date.now() < deadline) {
      await sleep(3000);
      const pollRes = await fetch(`${JESSE_BASE}/people-search/research/${searchId}?page=1&limit=25`, { headers });
      if (!pollRes.ok) continue;
      pollData = await pollRes.json();
      const status = (pollData.status || '').toLowerCase();
      if (['completed', 'complete', 'done', 'finished'].includes(status)) break;
      if (['failed', 'error', 'cancelled'].includes(status)) { pollData = null; break; }
    }
    if (!pollData) return Response.json({ connections: [], pending: true });

    // 4) Map results — handle multiple possible field names from Jesse
    const prospects: any[] = pollData.prospects || pollData.results || pollData.people || pollData.data || [];
    const connections: any[] = prospects.slice(0, 5).map((p: any) => ({
      tier: 4,
      source: 'jesse',
      name: p.full_name || p.name || '',
      role_title: p.title || p.job_title || '',
      company: p.company_name || p.company || companyName || '',
      school: school || schoolCode,
      graduation_year: null,
      linkedin_url: p.linkedin_url || '',
      persona: 'alumni',
      school_code: schoolCode,
      why: p.rationale || p.summary || `${school} alum found via Agent Jesse`,
      label: 'Found via Jesse',
      source_url: p.source || p.linkedin_url || '',
    })).filter((c: any) => c.name && c.name !== 'Unknown');

    // 5) Cache to DiscoveredAlumni (24h TTL) so repeat lookups skip Jesse
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const nowIso = new Date().toISOString();
    for (const c of connections.slice(0, 3)) {
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

function buildICP(school: string, chipText: string, location: string, companyName: string): string {
  const companyClause = companyName ? ` and currently work at ${companyName}` : '';
  const locationClause = location ? ` in ${location}` : '';
  return `${school} graduates working in ${chipText || 'business'}${locationClause}${companyClause}. Early-career titles only: intern, coordinator, analyst, associate, specialist, recruiter, SDR, BDR. Exclude managing director, partner, VP, chief, president.`;
}

function sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }