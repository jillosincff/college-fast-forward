import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Regular Ambassador payouts
const SIGNUP_BONUS = 5; // $5 per completed signup during Free Phase
const SIGNUP_BONUS_CAP = 100; // $100 lifetime cap (20 signups max)
const COMMISSION_RATE = 0.15; // 15% monthly commission on paid subscriptions

// Founding Circle Leader payouts
const FCL_PHASE1_BONUS = 5; // $5 per referral in Phase 1
const FCL_PHASE1_CAP = 200; // $200 cap in Phase 1 (40 signups max)
const FCL_PHASE2_BONUS = 0; // No signup bonus in Phase 2
const FCL_PHASE2_COMMISSION = 0.25; // 25% 1st-level commission in Phase 2
const FCL_PHASE2_SECOND_LEVEL = 0.05; // 5% 2nd-level commission in Phase 2

// Profile completion threshold for payouts
const MIN_PROFILE_COMPLETION = 80; // 80% profile completion required

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

    // Check if user is a Founding Circle Leader
    const isFoundingCircleLeader = user.is_founding_circle_lead === true;

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
    const isPhase1 = ufUserCount <= UF_FREE_PHASE_LIMIT; // Phase 1 = ≤1000 users
    const isPhase2 = ufUserCount > UF_FREE_PHASE_LIMIT; // Phase 2 = >1000 users

    // Calculate signup bonuses - only for completed profiles during Free Phase
    const completedProfileUsers = referredUsers.filter(u => {
      // Profile is complete if:
      // 1. Onboarding completed
      // 2. Has first and last name
      // 3. Profile completion score >= 80%
      const hasBasicInfo = u.first_name && u.last_name;
      const hasOnboarding = u.onboarding_completed === true;
      const profileComplete = (u.profile_completion_score || 0) >= MIN_PROFILE_COMPLETION;
      return hasBasicInfo && hasOnboarding && profileComplete;
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

    // Calculate signup bonuses based on user type
    let signupBonusEarnings = 0;
    let bonusEligibleCount = 0;
    let signupBonusCapped = false;

    if (isFoundingCircleLeader) {
      // Founding Circle Leader logic
      if (isPhase1) {
        // Phase 1: $5 per referral with $200 cap (40 signups max)
        bonusEligibleCount = Math.min(freePhaseSignups.length, FCL_PHASE1_CAP / FCL_PHASE1_BONUS);
        signupBonusEarnings = bonusEligibleCount * FCL_PHASE1_BONUS;
        signupBonusCapped = freePhaseSignups.length >= (FCL_PHASE1_CAP / FCL_PHASE1_BONUS);
      } else {
        // Phase 2: NO signup bonus (focuses on long-term commission growth)
        bonusEligibleCount = 0;
        signupBonusEarnings = 0;
        signupBonusCapped = false;
      }
    } else {
      // Regular Ambassador
      bonusEligibleCount = Math.min(freePhaseSignups.length, SIGNUP_BONUS_CAP / SIGNUP_BONUS);
      signupBonusEarnings = bonusEligibleCount * SIGNUP_BONUS;
      signupBonusCapped = freePhaseSignups.length >= (SIGNUP_BONUS_CAP / SIGNUP_BONUS);
    }

    // Calculate monthly commission from paid subscribers
    // Only users who upgraded AFTER UF hit 1,000 generate commission
    const paidUsers = completedProfileUsers.filter(u => 
      u.subscription_status === 'active' && u.subscription_tier
    );

    let monthlyCommissionBreakdown = [];
    let totalMonthlyCommission = 0;
    let secondLevelCommission = 0;

    // Determine commission rate based on user type and phase
    let commissionRate = COMMISSION_RATE; // Default 15%
    if (isFoundingCircleLeader && isPhase2) {
      commissionRate = FCL_PHASE2_COMMISSION; // 25% for FCL in Phase 2
    }

    paidUsers.forEach(u => {
      let monthlyPrice = 0;
      
      // Determine their subscription price based on when they subscribed
      if (u.subscription_tier === 'Early Adopter' || u.subscription_tier === 'Founding Gator') {
        monthlyPrice = TIER_FOUNDING; // $9/month
      } else if (u.subscription_tier === 'Standard') {
        monthlyPrice = TIER_STANDARD; // $19/month
      }

      const commission = monthlyPrice * commissionRate;
      totalMonthlyCommission += commission;

      monthlyCommissionBreakdown.push({
        name: u.full_name || `${u.first_name} ${u.last_name}`,
        tier: u.subscription_tier,
        monthlyPrice,
        commission,
        level: 1
      });
    });

    // Calculate 2nd-level commission for Founding Circle Leaders in Phase 2
    if (isFoundingCircleLeader && isPhase2) {
      // Get 2nd-level referrals (users referred by users this FCL referred)
      for (const referredUser of referredUsers) {
        if (referredUser.ambassador_code) {
          try {
            const secondLevelUsers = await base44.asServiceRole.entities.User.filter({
              referral_code: referredUser.ambassador_code,
              subscription_status: 'active'
            });

            secondLevelUsers.forEach(u => {
              let monthlyPrice = 0;
              if (u.subscription_tier === 'Early Adopter' || u.subscription_tier === 'Founding Gator') {
                monthlyPrice = TIER_FOUNDING;
              } else if (u.subscription_tier === 'Standard') {
                monthlyPrice = TIER_STANDARD;
              }

              const commission = monthlyPrice * FCL_PHASE2_SECOND_LEVEL;
              secondLevelCommission += commission;

              monthlyCommissionBreakdown.push({
                name: u.full_name || `${u.first_name} ${u.last_name}`,
                tier: u.subscription_tier,
                monthlyPrice,
                commission,
                level: 2,
                referredBy: referredUser.full_name
              });
            });
          } catch (err) {
            console.log('Error fetching 2nd-level users:', err.message);
          }
        }
      }
    }

    totalMonthlyCommission += secondLevelCommission;

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
      isFoundingCircleLeader,
      currentPhase: isPhase1 ? 1 : 2,
      earnings: {
        total: totalEarnings,
        signupBonus: {
          amount: signupBonusEarnings,
          count: bonusEligibleCount,
          totalSignups: totalSignups,
          freePhaseSignups: freePhaseSignups.length,
          pendingProfiles: totalSignups - qualifiedSignups,
          perSignup: isFoundingCircleLeader ? (isPhase1 ? FCL_PHASE1_BONUS : FCL_PHASE2_BONUS) : SIGNUP_BONUS,
          cap: isFoundingCircleLeader ? (isPhase1 ? FCL_PHASE1_CAP : null) : SIGNUP_BONUS_CAP,
          capped: signupBonusCapped,
          isFreePhaseActive
        },
        monthlyCommission: {
          amount: totalMonthlyCommission,
          rate: commissionRate * 100,
          paidUsersCount: paidUsers.length,
          secondLevelAmount: secondLevelCommission,
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