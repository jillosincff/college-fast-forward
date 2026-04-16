import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Anyone with no school_code is an original UF member
    // The imported multisite users already have school codes
    const users = await base44.asServiceRole.entities.User.filter({});
    const ufUsers = (users || []).filter(u => !u.school_code);

    console.log(`Backfilling ${ufUsers.length} users as University of Florida...`);

    const batchSize = 50;
    let updated = 0;

    for (let i = 0; i < ufUsers.length; i += batchSize) {
      const batch = ufUsers.slice(i, i + batchSize);
      await Promise.all(batch.map(u =>
        base44.asServiceRole.entities.User.update(u.id, {
          school_code: 'ufl',
          school_name: 'University of Florida',
        })
      ));
      updated += batch.length;
      await new Promise(r => setTimeout(r, 500));
      console.log(`Progress: ${updated}/${ufUsers.length}`);
    }

    console.log(`✅ Done. ${updated} UF users backfilled.`);

    return Response.json({
      success: true,
      updated,
      total: ufUsers.length,
    });
  } catch (error) {
    console.error('Backfill error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});