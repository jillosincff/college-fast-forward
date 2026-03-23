import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || !user.roles?.includes('admin')) {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all users
    const allUsers = await base44.asServiceRole.entities.User.filter({});

    // Stats
    const totalUsers = allUsers.length;
    const usersWithCodeUsed = allUsers.filter(u => u.referral_code_used).length;
    const conversionRate = totalUsers > 0 ? ((usersWithCodeUsed / totalUsers) * 100).toFixed(1) : 0;

    // Build referral map: code -> referrer info
    const codeToReferrer = {};
    for (const u of allUsers) {
      if (u.my_referral_code) {
        codeToReferrer[u.my_referral_code] = {
          id: u.id,
          name: u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
          email: u.email
        };
      }
    }

    // Count referrals per code
    const referralCounts = {};
    const recentReferrals = [];

    for (const u of allUsers) {
      if (u.referral_code_used) {
        const code = u.referral_code_used;
        referralCounts[code] = (referralCounts[code] || 0) + 1;
        
        recentReferrals.push({
          newUserId: u.id,
          newUserName: u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
          newUserEmail: u.email,
          codeUsed: code,
          referredBy: codeToReferrer[code] || null,
          date: u.referral_used_at || u.created_date
        });
      }
    }

    // Sort recent referrals by date
    recentReferrals.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Build top referrers list
    const topReferrers = Object.entries(referralCounts)
      .map(([code, count]) => ({
        code,
        referralCount: count,
        referrer: codeToReferrer[code] || { name: 'Unknown', email: 'Unknown' },
        mostRecent: recentReferrals.find(r => r.codeUsed === code)?.date
      }))
      .sort((a, b) => b.referralCount - a.referralCount)
      .slice(0, 20);

    return Response.json({ 
      success: true,
      stats: {
        totalUsers,
        usersWithCodeUsed,
        conversionRate: parseFloat(conversionRate)
      },
      topReferrers,
      recentReferrals: recentReferrals.slice(0, 50)
    });

  } catch (error) {
    console.error('Error getting referral stats:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});