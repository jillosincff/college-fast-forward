import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { canRunGated, SOFT_WALL_MESSAGE } from '../../shared/entitlements.ts';
import { normCompany, makeCompanyMatcher, rankAndDedupe, runPublicAlumniSearch, stampAlumniShown } from '../../shared/peopleSearch.ts';

// CLIFF People Finder — the two-layer people search that powers the free Magic
// Moment "Wow". Layer 1 is the opt-in CLIFF graph (parents/alumni who joined
// CFF from the student's school + company). When that graph is thin, Layer 2
// runs a Jesse-style PUBLIC web research query (LLM + internet context) for
// real alumni of the student's school at the target company — returning ONLY
// facts that appear in a real public source, with the source URL.
//
// SAFETY: never fabricates names/titles/years. Never scrapes LinkedIn. Never
// emails anyone. Public-web people are surfaced as "found publicly" with a
// source link; only opt-in CFF members can be introduced through the app.
// Public finds are cached to DiscoveredAlumni (24h TTL) so repeat cycles are
// instant and don't burn LLM credits.
export default async function (req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const {
      companyName, targetRole, magic_moment,
      schoolName, schoolCode: schoolCodeRaw, chipText, location,
      school_level, fast_only,
    } = await req.json().catch(() => ({}));

    // Free during the Magic Moment; Pro-gated otherwise.
    if (!(await canRunGated(base44, user, magic_moment))) {
      return Response.json({ connections: [], recommended: null, upgrade_required: true, message: SOFT_WALL_MESSAGE });
    }

    const schoolCode = (schoolCodeRaw || user.school_code || '').toUpperCase();
    const school = schoolName || user.school || '';
    const sr = base44.asServiceRole;

    // ── School-level search (not company-scoped) ────────────────────────────
    // "[School] alumni in healthcare in Miami" — runs Layer 2 directly with a
    // school + field + location query so UM/UF healthcare alumni in Miami
    // surface even when no curated company has a cached match. Used as the
    // FIRST people search in the Magic Moment; the company scan is extra.
    if (school_level) {
      const publicFinds = await runPublicAlumniSearch(sr, {
        school, schoolCode, companyName: '', targetRole, chipText, location,
      });
      const deduped = rankAndDedupe(publicFinds, targetRole, 5);
      await stampAlumniShown(sr, deduped);
      return Response.json({
        connections: deduped,
        recommended: deduped[0] || null,
        people_source: deduped.length === 0 ? 'none' : 'public_web',
        person_found: deduped.length > 0,
      });
    }

    const target = normCompany(companyName);
    if (!target) return Response.json({ connections: [], recommended: null });

    const companyMatch = makeCompanyMatcher(companyName);

    const connections = [];

    // ── LAYER 1 — CLIFF opt-in graph (highest trust) ───────────────────────
    // Tier 1: parents/helpers from the student's OWN school at this company.
    if (schoolCode) {
      const own = await sr.entities.ParentNetworkProfile.filter({
        school_code: schoolCode, is_active: true,
      }).catch(() => []);
      for (const p of own || []) {
        if (p.help_scope === 'unavailable') continue;
        if (!companyMatch(p.company_name)) continue;
        const personaLabel = p.persona === 'alumni' ? 'Alum' : 'Parent';
        connections.push({
          tier: 1,
          source: 'opt_in',
          name: [p.first_name, p.last_name].filter(Boolean).join(' '),
          role_title: p.role_title || null,
          company: p.company_name,
          school: school || schoolCode,
          graduation_year: null,
          linkedin_url: p.linkedin_url || null,
          persona: p.persona || 'parent',
          school_code: p.school_code,
          why: `${personaLabel} in your ${schoolCode} network who works at ${p.company_name}`,
          label: 'Possible connection',
          source_url: p.linkedin_url || null,
        });
      }
    }

    // Tier 2: previously-discovered public alumni from the student's school at
    // this company (cached from past Layer 2 runs). Shuffled + sorted by
    // last_shown_at ascending so the least-recently-sown person surfaces first
    // (rotation / soft-cap — prevents the same person going to every student).
    if (schoolCode) {
      const alumni = await sr.entities.DiscoveredAlumni.filter(
        { school_code: schoolCode }, '-created_date', 500
      ).catch(() => []);
      const now = Date.now();
      const fresh = (alumni || []).filter((a) => {
        if (!companyMatch(a.company)) return false;
        if (a.expires_at && new Date(a.expires_at).getTime() < now) return false;
        return true;
      });
      // Sort: never-shown first, then least-recently-shown — then shuffle within
      // equal buckets so ties don't always return the same person.
      const sorted = shuffle(fresh).sort((a, b) => {
        const at = a.last_shown_at ? new Date(a.last_shown_at).getTime() : 0;
        const bt = b.last_shown_at ? new Date(b.last_shown_at).getTime() : 0;
        return at - bt;
      });
      for (const a of sorted) {
        connections.push({
          tier: 2,
          source: 'public_web',
          name: a.name,
          role_title: a.role_title || null,
          company: a.company,
          school: school || schoolCode,
          graduation_year: a.degree_info || null,
          linkedin_url: a.linkedin_url || null,
          persona: 'alumni',
          school_code: schoolCode,
          why: `${schoolCode} alum found via public source${a.source_url ? ' — see link' : ''}`,
          label: 'Found publicly',
          source_url: a.source_url || null,
          _alumni_id: a.id,
        });
      }
    }

    // Tier 3: cross-school CFF members who explicitly opted in to help ANY school.
    const anySchool = await sr.entities.ParentNetworkProfile.filter({
      help_scope: 'any_school', is_active: true,
    }).catch(() => []);
    for (const p of anySchool || []) {
      if ((p.school_code || '').toUpperCase() === schoolCode) continue;
      if (!companyMatch(p.company_name)) continue;
      const personaLabel = p.persona === 'alumni' ? 'alum' : 'parent';
      connections.push({
        tier: 3,
        source: 'opt_in',
        name: [p.first_name, p.last_name].filter(Boolean).join(' '),
        role_title: p.role_title || null,
        company: p.company_name,
        school: p.school_code || school,
        graduation_year: null,
        linkedin_url: p.linkedin_url || null,
        persona: p.persona || 'parent',
        school_code: p.school_code,
        why: `CFF ${personaLabel} (${p.school_code}) who opted in to help students from any school`,
        label: 'May be open to helping',
        source_url: p.linkedin_url || null,
      });
    }

    // ── LAYER 2 — public web research (only if Layer 1 found nobody) ───────
    // Shared with findWorkspaceConnections — extracted to peopleSearch.ts so
    // both the Magic Moment and the Job Workspace use identical discovery logic.
    // fast_only = skip Layer 2 (LLM public web search). Used by the Pro dashboard's
    // company-scoped fast scan: just the opt-in graph + cache, no LLM credits burned.
    if (connections.length === 0 && !fast_only) {
      const publicFinds = await runPublicAlumniSearch(sr, {
        school,
        schoolCode,
        companyName,
        targetRole,
        chipText,
        location,
      });
      connections.push(...publicFinds);
    }

    // Rank + dedupe via the shared helper (same logic as findWorkspaceConnections).
    const deduped = rankAndDedupe(connections, targetRole, 5);

    // Soft-cap: stamp last_shown_at = now on served public-web alumni so the
    // next student gets a different person (least-recently-shown surfaces first).
    await stampAlumniShown(sr, deduped);

    return Response.json({
      connections: deduped,
      recommended: deduped[0] || null,
      people_source: deduped.length === 0 ? 'none' : (deduped[0].source === 'opt_in' ? 'opt_in' : 'public_web'),
      person_found: deduped.length > 0,
    });
  } catch (error) {
    return Response.json({ connections: [], recommended: null, people_source: 'none', person_found: false, error: error.message }, { status: 500 });
  }
}