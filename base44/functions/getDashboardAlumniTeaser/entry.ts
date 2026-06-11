import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Returns ONE real alumni match for the free dashboard teaser.
// Strict rule: real DiscoveredAlumni records only — never fabricated.

function blurName(name) {
  if (!name) return null;
  const parts = name.trim().split(/\s+/);
  const first = parts[0];
  const lastInitial = parts.length > 1 ? parts[parts.length - 1][0] + '.' : '';
  return `${first} ${lastInitial}`.trim();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const schoolCode = user.school_code || 'UF';
    const goals = user.career_goals || {};
    const targetCompanies = [
      ...(goals.target_companies || []),
      ...(user.target_companies || []),
    ].filter(Boolean).slice(0, 5);

    let best = null;
    let totalAtTargets = 0;
    let isTargetCompany = false;

    // 1. Look for real alumni at the student's target companies
    for (const company of targetCompanies) {
      const alumni = await base44.asServiceRole.entities.DiscoveredAlumni.filter(
        { company, school_code: schoolCode }, '-match_score', 25
      ).catch(() => []);
      const real = (alumni || []).filter(a => a.name && a.role_title);
      totalAtTargets += real.length;
      if (real.length > 0 && (!best || (real[0].match_score || 0) > (best.match_score || 0))) {
        best = real[0];
        isTargetCompany = true;
      }
    }

    // 2. School-wide network stats (real counts, capped at 500)
    const allSchool = await base44.asServiceRole.entities.DiscoveredAlumni.filter(
      { school_code: schoolCode }, '-match_score', 500
    ).catch(() => []);
    const realSchool = (allSchool || []).filter(a => a.name && a.company);
    const networkTotal = realSchool.length;
    const verifiedTotal = realSchool.filter(a => a.verified).length;
    const companiesMapped = new Set(realSchool.map(a => (a.company || '').toLowerCase())).size;

    // 3. Fallback: the highest-scored real alum anywhere in this school's network
    if (!best) {
      best = realSchool.find(a => a.role_title) || null;
    }

    if (!best) return Response.json({ found: false, network_total: networkTotal });

    return Response.json({
      found: true,
      is_target_company: isTargetCompany,
      company: best.company,
      role_title: best.role_title,
      blurred_name: blurName(best.name),
      verified: !!best.verified,
      total_at_targets: totalAtTargets,
      target_companies_count: targetCompanies.length,
      network_total: networkTotal,
      network_capped: (allSchool || []).length >= 500,
      verified_total: verifiedTotal,
      companies_mapped: companiesMapped,
    });
  } catch (error) {
    console.error('[getDashboardAlumniTeaser] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});