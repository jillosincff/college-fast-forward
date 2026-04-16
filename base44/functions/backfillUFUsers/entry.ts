import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch only users still missing school_code (so each call picks up where it left off)
    const users = await base44.asServiceRole.entities.User.filter(
      { school_code: { $exists: false } },
      undefined,
      100
    );
    const ufUsers = (users || []).filter(u => !u.school_code);

    if (ufUsers.length === 0) {
      console.log('✅ All users already have a school_code.');
      return Response.json({ success: true, updated: 0, remaining: 0, done: true });
    }

    console.log(`Processing batch of ${ufUsers.length} users without school_code...`);

    let updated = 0;
    for (const u of ufUsers) {
      await base44.asServiceRole.entities.User.update(u.id, {
        school_code: 'ufl',
        school_name: 'University of Florida',
      });
      updated++;
      await new Promise(r => setTimeout(r, 200));
    }

    console.log(`✅ Batch done. Updated ${updated} users.`);

    return Response.json({
      success: true,
      updated,
      remaining: ufUsers.length - updated,
      done: ufUsers.length < 100,
    });
  } catch (error) {
    console.error('Backfill error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});