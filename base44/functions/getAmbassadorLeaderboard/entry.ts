import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all referrals
    const allReferrals = await base44.asServiceRole.entities.Referral.filter({});

    // Aggregate by email (ambassador)
    const ambassadorMap = new Map();

    for (const ref of allReferrals) {
      const existing = ambassadorMap.get(ref.email);
      if (existing) {
        existing.signups += ref.signups_count || 0;
        existing.earnings += ref.earnings_total || 0;
        existing.codes.push(ref.referral_code);
      } else {
        ambassadorMap.set(ref.email, {
          name: ref.name,
          email: ref.email,
          school: ref.school,
          role: ref.role,
          signups: ref.signups_count || 0,
          earnings: ref.earnings_total || 0,
          codes: [ref.referral_code]
        });
      }
    }

    const ambassadors = Array.from(ambassadorMap.values());

    // Get Founding Circle Lead status for each ambassador
    const foundingCircleLeads = [];
    for (const amb of ambassadors) {
      try {
        const users = await base44.asServiceRole.entities.User.filter({ email: amb.email });
        if (users && users.length > 0 && users[0].is_founding_circle_lead) {
          amb.isFoundingCircleLead = true;
          amb.foundingCircleSchool = users[0].founding_circle_school;
          foundingCircleLeads.push(amb);
        }
      } catch (e) {
        // User lookup failed, continue
      }
    }

    // Sort by signups
    const bySignups = [...ambassadors]
      .sort((a, b) => b.signups - a.signups)
      .slice(0, 25)
      .map((a, idx) => ({ ...a, rank: idx + 1 }));

    // Sort by earnings
    const byEarnings = [...ambassadors]
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 25)
      .map((a, idx) => ({ ...a, rank: idx + 1 }));

    // Sort founding circle leads by signups
    const foundingCircleRanked = [...foundingCircleLeads]
      .sort((a, b) => b.signups - a.signups)
      .map((a, idx) => ({ ...a, rank: idx + 1 }));

    // Find current user's ranking
    let userRankBySignups = null;
    let userRankByEarnings = null;
    let userStats = null;

    const userAmbassador = ambassadors.find(a => a.email === user.email);
    if (userAmbassador) {
      userStats = userAmbassador;

      const sortedBySignups = [...ambassadors].sort((a, b) => b.signups - a.signups);
      const sortedByEarnings = [...ambassadors].sort((a, b) => b.earnings - a.earnings);

      userRankBySignups = sortedBySignups.findIndex(a => a.email === user.email) + 1;
      userRankByEarnings = sortedByEarnings.findIndex(a => a.email === user.email) + 1;
    }

    return Response.json({
      success: true,
      leaderboards: {
        bySignups,
        byEarnings,
        foundingCircleLeads: foundingCircleRanked
      },
      userRanking: userStats ? {
        stats: userStats,
        rankBySignups: userRankBySignups,
        rankByEarnings: userRankByEarnings,
        totalAmbassadors: ambassadors.length
      } : null,
      totalAmbassadors: ambassadors.length
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});