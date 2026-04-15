import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin only
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { dryRun = true } = await req.json().catch(() => ({}));

    // Get all users
    const allUsers = await base44.asServiceRole.entities.User.list();

    // Find UF members missing school_code
    const ufUsers = allUsers.filter(u => 
      !u.school_code && (
        u.email?.toLowerCase().includes('@ufl.edu') ||
        u.invite_code_used?.toUpperCase?.().includes('UF') ||
        u.school_name?.toLowerCase?.().includes('florida') ||
        u.school?.toLowerCase?.() === 'uf' ||
        u.school?.toLowerCase?.() === 'ufl'
      )
    );

    console.log(`Found ${ufUsers.length} UF users to backfill`);
    if (ufUsers.length > 0) {
      console.log('Sample:', ufUsers.slice(0, 3).map(u => ({ email: u.email, school: u.school_name })));
    }

    if (dryRun) {
      return Response.json({
        message: 'DRY RUN: Ready to backfill',
        count: ufUsers.length,
        dryRun: true,
        nextStep: 'Call with dryRun: false to execute',
      });
    }

    // Execute backfill
    let updated = 0;
    for (const u of ufUsers) {
      await base44.asServiceRole.entities.User.update(u.id, {
        school_code: 'ufl',
        school_name: 'University of Florida',
      });
      updated++;
    }

    console.log(`✓ Backfilled ${updated} users`);

    return Response.json({
      message: 'Backfill complete',
      updated,
      dryRun: false,
    });
  } catch (error) {
    console.error('Backfill error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});