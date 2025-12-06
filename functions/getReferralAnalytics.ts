import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can view analytics
    if (!user.roles?.includes('admin')) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all referrals
    const referrals = await base44.asServiceRole.entities.Referral.list();

    // Top referring users (sorted by signups_count)
    const topReferrers = referrals
      .sort((a, b) => (b.signups_count || 0) - (a.signups_count || 0))
      .slice(0, 10)
      .map(ref => ({
        name: ref.name,
        email: ref.email,
        referral_code: ref.referral_code,
        signups_count: ref.signups_count || 0,
        earnings_total: ref.earnings_total || 0,
        role: ref.role,
        school: ref.school
      }));

    // Fetch all registration attempts with referral codes
    const registrations = await base44.asServiceRole.entities.RegistrationAttempt.list();
    
    // Filter only those with referral codes
    const referralSignups = registrations
      .filter(reg => reg.referral_code)
      .map(reg => ({
        referral_code: reg.referral_code,
        created_date: reg.created_date,
        email: reg.email,
        status: reg.status
      }));

    // Group signups by date
    const signupsByDate = {};
    referralSignups.forEach(signup => {
      const date = new Date(signup.created_date).toISOString().split('T')[0];
      if (!signupsByDate[date]) {
        signupsByDate[date] = 0;
      }
      signupsByDate[date]++;
    });

    // Convert to array and sort by date
    const signupTrend = Object.entries(signupsByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Group signups by referral code
    const signupsByCode = {};
    referralSignups.forEach(signup => {
      if (!signupsByCode[signup.referral_code]) {
        signupsByCode[signup.referral_code] = [];
      }
      signupsByCode[signup.referral_code].push({
        date: new Date(signup.created_date).toISOString().split('T')[0],
        email: signup.email
      });
    });

    // Calculate summary stats
    const totalSignups = referralSignups.length;
    const totalEarnings = referrals.reduce((sum, ref) => sum + (ref.earnings_total || 0), 0);
    const activeAmbassadors = referrals.filter(ref => ref.status === 'active').length;

    return Response.json({
      success: true,
      topReferrers,
      signupTrend,
      signupsByCode,
      summary: {
        totalSignups,
        totalEarnings,
        activeAmbassadors,
        totalReferrals: referrals.length
      }
    });
  } catch (error) {
    console.error('Error fetching referral analytics:', error);
    return Response.json({ 
      error: 'Failed to fetch analytics',
      details: error.message 
    }, { status: 500 });
  }
});