import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user?.roles?.includes('admin')) {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { dryRun = true, confirmMassUpdate = false } = await req.json().catch(() => ({}));

    if (!dryRun && !confirmMassUpdate) {
      return Response.json({
        error: 'Mass founding member update requires confirmMassUpdate: true',
        message: 'This will mark ALL users without is_founding_gator as founding members. Pass confirmMassUpdate: true to proceed.',
      }, { status: 400 });
    }

    if (!dryRun) {
      console.warn('[markAsFoundingMembers] LIVE MODE — marking all eligible users as founding members');
    }

    const allUsers = await base44.asServiceRole.entities.User.list();
    const affectedUsers = allUsers.filter(u => !u.is_founding_gator);

    if (dryRun) {
      return Response.json({
        dry_run: true,
        would_affect: affectedUsers.length,
        preview: affectedUsers.slice(0, 10).map(u => u.email),
      });
    }

    const updated = [];
    const skipped = [];

    for (const userToFix of affectedUsers) {
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
      total_processed: affectedUsers.length,
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