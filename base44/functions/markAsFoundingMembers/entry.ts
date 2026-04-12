import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user?.roles?.includes('admin')) {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { confirm = false, dry_run = true } = await req.json().catch(() => ({}));

    if (!dry_run) {
      console.warn('[markAsFoundingMembers] LIVE MODE — changes will be written to DB');
    }

    const allUsers = await base44.asServiceRole.entities.User.list();
    const needsMarking = allUsers.filter(u => !u.is_founding_gator);

    // Dry run — return preview only
    if (dry_run) {
      return Response.json({
        success: true,
        dry_run: true,
        affected_count: needsMarking.length,
        preview: needsMarking.slice(0, 10).map(u => u.email),
        message: 'Dry run complete. Pass dry_run: false and confirm: true to apply.',
      });
    }

    // Live mode requires explicit confirmation
    if (!confirm) {
      return Response.json({
        error: 'This operation requires confirm: true to proceed in live mode',
        hint: 'Re-run with dry_run: false AND confirm: true',
        affected_count: needsMarking.length,
        preview: needsMarking.slice(0, 5).map(u => u.email),
      }, { status: 400 });
    }

    const updated = [];
    const skipped = [];

    for (const userToFix of needsMarking) {
      try {
        const countResult = await base44.asServiceRole.functions.invoke('getUserCount', {});
        const nextNumber = (countResult.data?.count || 0) + 1;

        await base44.asServiceRole.entities.User.update(userToFix.id, {
          is_founding_gator: true,
          founding_gator_number: nextNumber,
          membership_tier: 'founding_gator',
        });

        await base44.asServiceRole.functions.invoke('incrementUserCount', {});

        updated.push({ email: userToFix.email, name: userToFix.full_name, number: nextNumber });
      } catch (err) {
        skipped.push({ email: userToFix.email, error: err.message });
      }
    }

    return Response.json({
      success: true,
      dry_run: false,
      total_processed: needsMarking.length,
      updated: updated.length,
      skipped: skipped.length,
      updated_users: updated,
      skipped_users: skipped,
    });

  } catch (error) {
    console.error('Mark as founding members error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});