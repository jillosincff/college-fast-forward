import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Generate a unique referral code in format GATOR-XXXXX
function generateReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'GATOR-';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || !user.roles?.includes('admin')) {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all users without referral codes
    const allUsers = await base44.asServiceRole.entities.User.filter({});
    const usersWithoutCodes = allUsers.filter(u => !u.my_referral_code);

    let updated = 0;
    const errors = [];

    for (const u of usersWithoutCodes) {
      try {
        const code = generateReferralCode();
        await base44.asServiceRole.entities.User.update(u.id, {
          my_referral_code: code
        });
        updated++;
      } catch (err) {
        errors.push({ userId: u.id, error: err.message });
      }
    }

    return Response.json({ 
      success: true, 
      totalUsers: allUsers.length,
      usersWithoutCodes: usersWithoutCodes.length,
      updated,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error backfilling referral codes:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});