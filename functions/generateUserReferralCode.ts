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

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has a code
    if (user.my_referral_code) {
      return Response.json({ 
        success: true, 
        code: user.my_referral_code,
        message: 'User already has a referral code'
      });
    }

    // Generate new code
    const code = generateReferralCode();

    // Update user with their code
    await base44.asServiceRole.entities.User.update(user.id, {
      my_referral_code: code
    });

    return Response.json({ 
      success: true, 
      code,
      message: 'Referral code generated'
    });

  } catch (error) {
    console.error('Error generating referral code:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});