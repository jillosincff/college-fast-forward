import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// One-time (idempotent) migration: existing parent/alumni Users were never written
// into ParentNetworkProfile, which is the ONLY entity the matcher (findParentsAtCompany)
// reads. This surfaces every existing user who has both a company and a school_code.
// Admin-only.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const sr = base44.asServiceRole;

    const deriveDomain = (name) => {
      const clean = (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return clean ? `${clean}.com` : '';
    };

    const parents = await sr.entities.User.filter({ persona: 'parent' }, '-created_date', 5000).catch(() => []);
    const alumni = await sr.entities.User.filter({ persona: 'alumni' }, '-created_date', 5000).catch(() => []);
    const all = [...parents, ...alumni];

    // Preload existing profiles once to dedupe without a query per user
    const existingProfiles = await sr.entities.ParentNetworkProfile.list('-created_date', 10000).catch(() => []);
    const profileKey = (sc, fn, ln, co) =>
      `${sc}|${(fn || '').toLowerCase().trim()}|${(ln || '').toLowerCase().trim()}|${(co || '').toLowerCase().trim()}`;
    const existingKeys = new Set(
      existingProfiles.map((p) => profileKey(p.school_code, p.first_name, p.last_name, p.company_name))
    );

    let created = 0;
    let skippedExisting = 0;
    let skippedNoData = 0;
    const toCreate = [];

    for (const u of all) {
      const company = (u.company || u.current_company || '').trim();
      const sc = (u.school_code || '').toUpperCase();
      const persona = u.persona === 'alumni' ? 'alumni' : 'parent';

      if (!company || !sc) {
        skippedNoData++;
        continue;
      }

      const nameParts = (u.full_name || '').trim().split(/\s+/).filter(Boolean);
      const firstName = nameParts[0] || (u.full_name || '').trim() || 'Member';
      const lastName = nameParts.slice(1).join(' ') || firstName;

      const key = profileKey(sc, firstName, lastName, company);
      if (existingKeys.has(key)) {
        skippedExisting++;
        continue;
      }
      existingKeys.add(key);

      toCreate.push({
        first_name: firstName,
        last_name: lastName,
        company_name: company,
        company_domain: deriveDomain(company),
        role_title: (u.career_background || '').trim() || 'Professional',
        linkedin_url: (u.linkedin_url || '').trim(),
        school_code: sc,
        persona,
        is_active: u.visible_in_directory !== false,
      });
    }

    // Bulk create in chunks of 200
    for (let i = 0; i < toCreate.length; i += 200) {
      const chunk = toCreate.slice(i, i + 200);
      await sr.entities.ParentNetworkProfile.bulkCreate(chunk);
      created += chunk.length;
    }

    return Response.json({
      success: true,
      totalUsersScanned: all.length,
      profilesCreated: created,
      skippedAlreadyHadProfile: skippedExisting,
      skippedMissingCompanyOrSchool: skippedNoData,
    });
  } catch (error) {
    console.error('[backfillParentNetworkProfiles]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});