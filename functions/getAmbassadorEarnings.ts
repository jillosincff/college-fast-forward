import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Updated payout structure per December 2025 guide
const SIGNUP_BONUS = 5; // $5 per completed signup during Free Phase
const SIGNUP_BONUS_CAP = 100; // $100 lifetime cap (20 signups max)
const COMMISSION_RATE = 0.15; // 15% monthly commission on paid subscriptions

// Pricing tiers
const TIER_FOUNDING = 9; // $9/month for first 5,000 paid users nationwide
const TIER_STANDARD = 19; // $19/month for 5,001+ paid users nationwide

// UF Free Phase: First 1,000 UF users get Free Forever
const UF_FREE_PHASE_LIMIT = 1000;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's referral record
    const referralsByCreator = await base44.entities.Referral.filter({ 
      created_by: user.email 
    });
    const referralsByEmail = await base44.entities.Referral.filter({ 
      email: user.email 
    });
    
    const referralMap = new Map();
    [...referralsByCreator, ...referralsByEmail].forEach(r => referralMap.set(r.id, r));
    const referrals = Array.from(referralMap.values());

    if (referrals.length === 0) {
      return Response.json({
        success: true,
        earnings: {
          total: 0,
          signupBonus: {
            amount: 0,
            count: 0,
            totalSignups: 0,
            pendingProfiles: 0,
            perSignup: SIGNUP_BONUS,
            cap: SIGNUP_BONUS_CAP,
            capped: false
          },
          monthlyCommission: {
            amount: 0,
            rate: COMMISSION_RATE * 100,
            paidUsersCount: 0,
            breakdown: []
          }
        },
        stats: {
          totalSignups: 0,
          qualifiedSignups: 0,
          pendingProfiles: 0,
          paidConversions: 0,
          conversionRate: 0
        },
        recentActivity: [],
        referralCodes: []
      });
    }

    // Get all users who signed up with this ambassador's referral codes
    const referralCodes = referrals.map(r => r.referral_code);
    let referredUsers = [];
    
    for (const code of referralCodes) {
      try {
        const usersWithCode = await base44.asServiceRole.entities.User.filter({ 
          referral_code: code 
        });
        referredUsers = [...referredUsers, ...usersWithCode];
      } catch (err) {
        console.log(`Could not fetch users for code ${code}:`, err.message);
      }
    }

    // Get total UF user count to determine if Free Phase is still active
    let ufUserCount = 0;
    try {
      const allUsers = await base44.asServiceRole.entities.User.list();
      // Count UF users (students + alumni with @ufl.edu OR persona = gator/student/alumni)
      ufUserCount = allUsers.filter(u => 
        u.email?.toLowerCase().endsWith('@ufl.edu') || 
        ['gator', 'student', 'alumni'].includes(u.persona?.toLowerCase())
      ).length;
    } catch (err) {
      console.log('Could not fetch UF user count:', err.message);
    }

    const isFreePhaseActive = ufUserCount < UF_FREE_PHASE_LIMIT;

    // Calculate signup bonuses - only for completed profiles during Free Phase
    const completedProfileUsers = referredUsers.filter(u => {
      // Profile is complete if:
      // 1. Onboarding completed
      // 2. Has first and last name
      // 3. Has grad year or major (for students)
      // 4. Has filled out help request or created a profile
      const hasBasicInfo = u.first_name && u.last_name;
      const hasOnboarding = u.onboarding_completed === true;
      return hasBasicInfo && hasOnboarding;
    });

    const totalSignups = referredUsers.length;
    const qualifiedSignups = completedProfileUsers.length;
    
    // Only count signup bonuses if referred during Free Phase
    const freePhaseSignups = completedProfileUsers.filter(u => {
      // If we have signup_order and it's <= 1000, they were in Free Phase
      if (u.signup_order && u.signup_order <= UF_FREE_PHASE_LIMIT) {
        return true;
      }
      // Fallback: check if their creation was before UF hit 1,000
      // (This is approximate - ideally we'd track the exact moment)
      return isFreePhaseActive;
    });

    const bonusEligibleCount = Math.min(freePhaseSignups.length, SIGNUP_BONUS_CAP / SIGNUP_BONUS);
    const signupBonusEarnings = bonusEligibleCount * SIGNUP_BONUS;
    const signupBonusCapped = freePhaseSignups.length >= (SIGNUP_BONUS_CAP / SIGNUP_BONUS);

    // Calculate monthly commission from paid subscribers
    // Only users who upgraded AFTER UF hit 1,000 generate commission
    const paidUsers = completedProfileUsers.filter(u => 
      u.subscription_status === 'active' && u.subscription_tier
    );

    let monthlyCommissionBreakdown = [];
    let totalMonthlyCommission = 0;

    paidUsers.forEach(u => {
      let monthlyPrice = 0;
      
      // Determine their subscription price based on when they subscribed
      if (u.subscription_tier === 'Early Adopter' || u.subscription_tier === 'Founding Gator') {
        monthlyPrice = TIER_FOUNDING; // $9/month
      } else if (u.subscription_tier === 'Standard') {
        monthlyPrice = TIER_STANDARD; // $19/month
      }

      const commission = monthlyPrice * COMMISSION_RATE;
      totalMonthlyCommission += commission;

      monthlyCommissionBreakdown.push({
        name: u.full_name || `${u.first_name} ${u.last_name}`,
        tier: u.subscription_tier,
        monthlyPrice,
        commission
      });
    });

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
        profileComplete: u.onboarding_completed === true,
        inFreePhaseBucket: u.signup_order && u.signup_order <= UF_FREE_PHASE_LIMIT
      }));

    const totalEarnings = signupBonusEarnings + totalMonthlyCommission;

    return Response.json({
      success: true,
      earnings: {
        total: totalEarnings,
        signupBonus: {
          amount: signupBonusEarnings,
          count: bonusEligibleCount,
          totalSignups: totalSignups,
          freePhaseSignups: freePhaseSignups.length,
          pendingProfiles: totalSignups - qualifiedSignups,
          perSignup: SIGNUP_BONUS,
          cap: SIGNUP_BONUS_CAP,
          capped: signupBonusCapped,
          isFreePhaseActive
        },
        monthlyCommission: {
          amount: totalMonthlyCommission,
          rate: COMMISSION_RATE * 100,
          paidUsersCount: paidUsers.length,
          breakdown: monthlyCommissionBreakdown
        }
      },
      stats: {
        totalSignups,
        qualifiedSignups,
        freePhaseSignups: freePhaseSignups.length,
        pendingProfiles: totalSignups - qualifiedSignups,
        paidConversions: paidUsers.length,
        conversionRate: qualifiedSignups > 0 ? ((paidUsers.length / qualifiedSignups) * 100).toFixed(1) : 0,
        ufUserCount,
        freePhaseActive: isFreePhaseActive,
        spotsLeftInFreePhase: Math.max(0, UF_FREE_PHASE_LIMIT - ufUserCount)
      },
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