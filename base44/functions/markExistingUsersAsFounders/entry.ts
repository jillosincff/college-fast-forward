import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * ONE-TIME migration: set membership_tier = 'founding' on the first 1000 users (by created_date).
 * Does NOT set is_fastiq — founding members must subscribe at the 50% rate.
 * Guards against re-running via a GlobalCounter flag.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Guard: check if migration has already run
    const flags = await base44.asServiceRole.entities.GlobalCounter.filter({ counter_name: 'founding_migration_done' });
    if (flags.length > 0) {
      return Response.json({ success: false, error: 'Migration already completed — will not run again.' }, { status: 409 });
    }

    const { dry_run = true } = await req.json().catch(() => ({ dry_run: true }));
    console.log('Founding migration started. dry_run:', dry_run);

    // Fetch first 1000 users ordered by created_date ascending
    const allUsers = await base44.asServiceRole.entities.User.list('created_date', 1000);
    console.log('Users fetched:', allUsers.length);

    if (dry_run) {
      return Response.json({
        success: true,
        dry_run: true,
        message: 'Dry run — no changes made.',
        will_update: allUsers.length,
        sample: allUsers.slice(0, 5).map(u => ({ id: u.id, email: u.email, created_date: u.created_date })),
      });
    }

    let updated = 0;
    const errors = [];

    for (const u of allUsers) {
      try {
        await base44.asServiceRole.entities.User.update(u.id, {
          membership_tier: 'founding',
        });
        updated++;
      } catch (err) {
        errors.push({ id: u.id, email: u.email, error: err.message });
      }
    }

    // Mark migration as done so it cannot run again
    await base44.asServiceRole.entities.GlobalCounter.create({
      counter_name: 'founding_migration_done',
      counter_value: updated,
      last_updated: new Date().toISOString(),
    });

    console.log('Migration complete. Updated:', updated, 'Errors:', errors.length);

    return Response.json({
      success: true,
      updated,
      errors: errors.length,
      error_details: errors.slice(0, 10),
    });

  } catch (err) {
    console.error('Migration error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});