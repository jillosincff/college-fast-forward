import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const SIGNUP_BONUS = 5; // $5 per signup
const SIGNUP_BONUS_CAP = 200; // $200 lifetime cap
const LEAD_COMMISSION_RATE = 0.25; // 25% monthly commission
const OVERRIDE_RATE = 0.05; // 5% override on team earnings

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all referral codes for this user
    const referrals = await base44.entities.Referral.filter({ 
      created_by: user.email 
    });

    // Get all users who signed up with this user's referral codes
    const referralCodes = referrals.map(r => r.referral_code);
    
    let referredUsers = [];
    if (referralCodes.length > 0) {
      // Get users who used any of this lead's referral codes
      for (const code of referralCodes) {
        const usersWithCode = await base44.entities.User.filter({ 
          referral_code: code 
        });
        referredUsers = [...referredUsers, ...usersWithCode];
      }
    }

    // Only count users with completed profiles for signup bonuses
    const completedProfileUsers = referredUsers.filter(u => u.onboarding_completed === true);
    const totalSignups = referredUsers.length;
    const qualifiedSignups = completedProfileUsers.length;
    const signupBonusEarnings = Math.min(qualifiedSignups * SIGNUP_BONUS, SIGNUP_BONUS_CAP);
    const signupBonusCapped = qualifiedSignups * SIGNUP_BONUS > SIGNUP_BONUS_CAP;

    // Calculate monthly commission from paid subscribers (must also have completed profile)
    const paidUsers = completedProfileUsers.filter(u => 
      u.subscription_status === 'active'
    );
    
    // For simplicity, we'll estimate monthly commission based on subscription tiers
    // Founding Gator: $9/mo, Standard: $19/mo
    let monthlyCommissionBase = 0;
    paidUsers.forEach(u => {
      if (u.subscription_tier === 'Early Adopter' || u.is_founding_gator) {
        monthlyCommissionBase += 9;
      } else {
        monthlyCommissionBase += 19;
      }
    });
    const monthlyCommission = monthlyCommissionBase * LEAD_COMMISSION_RATE;

    // Get team ambassadors (users who signed up under this lead and became ambassadors)
    const teamAmbassadors = [];
    let teamOverrideEarnings = 0;
    
    for (const referredUser of referredUsers) {
      // Check if this referred user has their own referral codes (became an ambassador)
      const theirReferrals = await base44.entities.Referral.filter({
        created_by: referredUser.email,
        role: 'ambassador'
      });
      
      if (theirReferrals.length > 0) {
        // Sum up their earnings for override calculation
        const theirTotalEarnings = theirReferrals.reduce((sum, r) => sum + (r.earnings_total || 0), 0);
        teamOverrideEarnings += theirTotalEarnings * OVERRIDE_RATE;
        
        teamAmbassadors.push({
          name: referredUser.full_name || `${referredUser.first_name} ${referredUser.last_name}`,
          email: referredUser.email,
          signups: theirReferrals.reduce((sum, r) => sum + (r.signups_count || 0), 0),
          earnings: theirTotalEarnings
        });
      }
    }

    // Build activity timeline
    const recentActivity = referredUsers
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 10)
      .map(u => ({
        type: 'signup',
        name: u.full_name || `${u.first_name} ${u.last_name}`,
        date: u.created_date,
        isPaid: u.subscription_status === 'active',
        tier: u.subscription_tier,
        profileComplete: u.onboarding_completed === true
      }));

    // Calculate totals
    const totalEarnings = signupBonusEarnings + monthlyCommission + teamOverrideEarnings;

    return Response.json({
      success: true,
      earnings: {
        total: totalEarnings,
        signupBonus: {
          amount: signupBonusEarnings,
          count: qualifiedSignups,
          totalSignups: totalSignups,
          pendingProfiles: totalSignups - qualifiedSignups,
          perSignup: SIGNUP_BONUS,
          cap: SIGNUP_BONUS_CAP,
          capped: signupBonusCapped
        },
        monthlyCommission: {
          amount: monthlyCommission,
          rate: LEAD_COMMISSION_RATE * 100,
          paidUsersCount: paidUsers.length,
          baseAmount: monthlyCommissionBase
        },
        teamOverride: {
          amount: teamOverrideEarnings,
          rate: OVERRIDE_RATE * 100,
          teamSize: teamAmbassadors.length
        }
      },
      stats: {
        totalSignups,
        qualifiedSignups,
        pendingProfiles: totalSignups - qualifiedSignups,
        paidConversions: paidUsers.length,
        conversionRate: qualifiedSignups > 0 ? ((paidUsers.length / qualifiedSignups) * 100).toFixed(1) : 0,
        teamSize: teamAmbassadors.length
      },
      team: teamAmbassadors,
      recentActivity,
      referralCodes: referrals.map(r => ({
        code: r.referral_code,
        signups: r.signups_count || 0,
        status: r.status
      }))
    });

  } catch (error) {
    console.error('Error fetching ambassador earnings:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});