import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// One-time standardization: University of Florida records are split between "UFL"
// and "UF". The codebase's canonical code (deriveSchoolCode) is "uf", so we converge
// everything onto UF across Users (all personas) and ParentNetworkProfile. Admin-only.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const sr = base44.asServiceRole;

    const bulkFix = async (entity) => {
      const rows = await entity.list('-created_date', 10000).catch(() => []);
      const targets = rows.filter((r) => (r.school_code || '').toUpperCase() === 'UFL');
      let updated = 0;
      for (let i = 0; i < targets.length; i += 200) {
        const chunk = targets.slice(i, i + 200).map((r) => ({ id: r.id, school_code: 'UF' }));
        await entity.bulkUpdate(chunk);
        updated += chunk.length;
      }
      return updated;
    };

    const usersUpdated = await bulkFix(sr.entities.User);
    const profilesUpdated = await bulkFix(sr.entities.ParentNetworkProfile);

    return Response.json({ success: true, usersUpdated, profilesUpdated });
  } catch (error) {
    console.error('[standardizeUFSchoolCode]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});