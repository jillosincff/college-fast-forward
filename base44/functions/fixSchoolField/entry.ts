import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const dry_run = body.dry_run !== false;

    const users = await base44.asServiceRole.entities.User.list('-created_date', 5000);

    // Find all users with school_code set but school field blank
    const needsFix = users.filter(u => u.school_code && !u.school);

    const breakdown = {};
    for (const u of needsFix) {
      breakdown[u.school_code] = (breakdown[u.school_code] || 0) + 1;
    }

    if (dry_run) {
      return Response.json({
        mode: 'dry_run',
        total: needsFix.length,
        breakdown,
      });
    }

    // Run fix: copy school_code → school
    const batchSize = 50;
    let updated = 0;

    for (let i = 0; i < needsFix.length; i += batchSize) {
      const batch = needsFix.slice(i, i + batchSize);
      await Promise.all(batch.map(u =>
        base44.asServiceRole.entities.User.update(u.id, { school: u.school_code })
      ));
      updated += batch.length;
      await new Promise(r => setTimeout(r, 300));
      console.log(`Progress: ${updated}/${needsFix.length}`);
    }

    return Response.json({ mode: 'full_run', updated });

  } catch (e) {
    console.error('fixSchoolField error:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
});