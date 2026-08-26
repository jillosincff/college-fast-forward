import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { canRunGated, SOFT_WALL_MESSAGE } from '../../shared/entitlements.ts';
import { normCompany, makeCompanyMatcher, rankAndDedupe, runPublicAlumniSearch, stampAlumniShown } from '../../shared/peopleSearch.ts';

// Ordered, permission-respecting connection search for the CLIFF Job Workspace.
// Search order: (1) own-school parents/helpers, (2) cached school alumni found via
// public search, (3) cross-school CFF members who EXPLICITLY opted in to help any school.
// Never surfaces cross-school members without that opt-in, and all copy stays honest —
// "possible connection", never a promised referral.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { companyName, targetRole, magic_moment, location } = await req.json().catch(() => ({}));

    // Soft wall: alumni matches are a Pro feature (free only during the Magic Moment).
    if (!(await canRunGated(base44, user, magic_moment))) {
      return Response.json({ connections: [], recommended: null, upgrade_required: true, message: SOFT_WALL_MESSAGE });
    }
    const target = normCompany(companyName);
    if (!target) return Response.json({ connections: [], recommended: null });

    const schoolCode = (user.school_code || '').toUpperCase();
    const sr = base44.asServiceRole;
    const companyMatch = makeCompanyMatcher(companyName);

    const connections = [];

    // Tier 1: participating parents/helpers from the student's OWN school
    if (schoolCode) {
      const own = await sr.entities.ParentNetworkProfile.filter({
        school_code: schoolCode,
        is_active: true,
      }).catch(() => []);
      for (const p of own || []) {
        if (p.help_scope === 'unavailable') continue;
        if (!companyMatch(p.company_name)) continue;
        const persona = p.persona === 'alumni' ? 'Alum' : 'Parent';
        connections.push({
          tier: 1,
          source: 'cff_member',
          name: [p.first_name, p.last_name].filter(Boolean).join(' '),
          role_title: p.role_title || null,
          company: p.company_name,
          linkedin_url: p.linkedin_url || null,
          persona: p.persona || 'parent',
          school_code: p.school_code,
          why: `${persona} in your ${schoolCode} network who works at ${p.company_name} — may be open to helping`,
          label: 'Possible connection',
        });
      }
    }

    // Tier 2: alumni from the student's school (previously discovered via public search)
    if (schoolCode) {
      const alumni = await sr.entities.DiscoveredAlumni.filter(
        { school_code: schoolCode }, '-created_date', 500
      ).catch(() => []);
      for (const a of alumni || []) {
        if (!companyMatch(a.company)) continue;
        connections.push({
          tier: 2,
          source: 'external',
          name: a.name,
          role_title: a.role_title || null,
          company: a.company,
          linkedin_url: a.linkedin_url || null,
          persona: 'alumni',
          school_code: schoolCode,
          why: `${schoolCode} alum found via public search — works in a relevant area at ${a.company}`,
          label: 'Worth contacting',
        });
      }
    }

    // Tier 3: cross-school CFF members — ONLY those who explicitly chose "any CFF school"
    const anySchool = await sr.entities.ParentNetworkProfile.filter({
      help_scope: 'any_school',
      is_active: true,
    }).catch(() => []);
    for (const p of anySchool || []) {
      if ((p.school_code || '').toUpperCase() === schoolCode) continue; // already tier 1
      if (!companyMatch(p.company_name)) continue;
      const persona = p.persona === 'alumni' ? 'alum' : 'parent';
      connections.push({
        tier: 3,
        source: 'cff_member',
        name: [p.first_name, p.last_name].filter(Boolean).join(' '),
        role_title: p.role_title || null,
        company: p.company_name,
        linkedin_url: p.linkedin_url || null,
        persona: p.persona || 'parent',
        school_code: p.school_code,
        why: `CFF ${persona} (${p.school_code}) who opted in to help students from any CFF school`,
        label: 'May be open to helping',
      });
    }

    // ── LAYER 2 — public web research (only if Layers 1-3 found nobody) ───
    // Same Jesse-style query as the Magic Moment: real alumni of [School] at
    // [Company], found via LLM + internet context. Without this, the workspace
    // showed "no one found" for companies where UF alumni clearly exist on
    // LinkedIn — the opt-in graph is just thin for newer companies like Canva.
    if (connections.length === 0) {
      const school = user.school_name || user.school || user.university || '';
      const publicFinds = await runPublicAlumniSearch(sr, {
        school,
        schoolCode,
        companyName,
        targetRole,
        location,
      });
      connections.push(...publicFinds);
    }

    const deduped = rankAndDedupe(connections, targetRole, 8);

    // Soft-cap: stamp last_shown_at = now on served public-web alumni.
    await stampAlumniShown(sr, deduped);

    return Response.json({ connections: deduped, recommended: deduped[0] || null });
  } catch (error) {
    return Response.json({ connections: [], recommended: null, error: error.message }, { status: 500 });
  }
});