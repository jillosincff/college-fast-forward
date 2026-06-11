import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function startOf(daysAgo) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

const isPaid = (u) =>
  u.subscription_status === 'active' ||
  u.membership_tier === 'fastiq' ||
  u.is_founding_member === true;

const isActiveTrial = (u) =>
  !isPaid(u) && (
    u.trial_status === 'active' ||
    u.fastiq_trial_active === true ||
    u.membership_tier === 'fastiq_trial'
  );

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const isAdmin = user?.role === 'admin' || user?.roles?.includes('admin');
    if (!user || !isAdmin) {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const day7 = startOf(7);
    const day14 = startOf(14);
    const day30 = startOf(30);

    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);

    // ── Growth ────────────────────────────────────────────────────────────
    const students = allUsers.filter(u => ['student', 'gator'].includes(u.persona));
    const parents = allUsers.filter(u => u.persona === 'parent');

    const newThisWeek = allUsers.filter(u => u.created_date >= day7);
    const newLastWeek = allUsers.filter(u => u.created_date >= day14 && u.created_date < day7);
    const studentsThisWeek = newThisWeek.filter(u => ['student', 'gator'].includes(u.persona)).length;
    const studentsLastWeek = newLastWeek.filter(u => ['student', 'gator'].includes(u.persona)).length;
    const parentsThisWeek = newThisWeek.filter(u => u.persona === 'parent').length;
    const parentsLastWeek = newLastWeek.filter(u => u.persona === 'parent').length;

    // ── Revenue / trials ──────────────────────────────────────────────────
    const paidUsers = allUsers.filter(isPaid);
    const paidBreakdown = {
      stripeActive: allUsers.filter(u => u.subscription_status === 'active').length,
      stripeActiveWithCustomerId: allUsers.filter(u => u.subscription_status === 'active' && u.stripe_customer_id).length,
      fastiqTier: allUsers.filter(u => u.membership_tier === 'fastiq' && u.subscription_status !== 'active').length,
      foundingMembers: allUsers.filter(u => u.is_founding_member === true && u.subscription_status !== 'active' && u.membership_tier !== 'fastiq').length,
    };
    const activeTrials = allUsers.filter(isActiveTrial);
    const expiredTrials = allUsers.filter(u => u.trial_status === 'expired' && !isPaid(u));
    const trialsStartedThisWeek = allUsers.filter(u =>
      u.trial_start_date ? u.trial_start_date >= day7 : (isActiveTrial(u) && u.created_date >= day7)
    ).length;
    // Approximate trial→paid conversion: paid users who went through a trial vs all completed trials
    const paidFromTrial = paidUsers.filter(u => u.trial_status || u.trial_end_date).length;
    const completedTrials = paidFromTrial + expiredTrials.length;
    const trialConversionPct = completedTrials > 0
      ? Math.round((paidFromTrial / completedTrials) * 100)
      : null;

    // ── Outreach pipeline (NetworkingPipeline — the current core loop) ────
    let pipeline = [];
    try {
      pipeline = await base44.asServiceRole.entities.NetworkingPipeline.list('-created_date', 5000);
    } catch (_) { pipeline = []; }

    const reachedStatuses = ['reached_out', 'messaged', 'replied', 'coffee_chat', 'intro_made', 'interview', 'offer', 'no_response'];
    const repliedStatuses = ['replied', 'coffee_chat', 'intro_made', 'interview', 'offer'];

    const funnel = {
      identified: pipeline.length,
      reachedOut: pipeline.filter(p => reachedStatuses.includes(p.status)).length,
      replied: pipeline.filter(p => repliedStatuses.includes(p.status)).length,
      interviews: pipeline.filter(p => ['interview', 'offer'].includes(p.status)).length,
      offers: pipeline.filter(p => p.status === 'offer').length,
    };

    const reached30 = pipeline.filter(p => reachedStatuses.includes(p.status) && (p.reached_out_date || p.created_date) >= day30);
    const replied30 = reached30.filter(p => repliedStatuses.includes(p.status));
    const replyRate30 = reached30.length > 0
      ? Math.round((replied30.length / reached30.length) * 100)
      : null;
    const outreachThisWeek = pipeline.filter(p => p.reached_out_date && p.reached_out_date >= day7).length;
    const outreachLastWeek = pipeline.filter(p => p.reached_out_date && p.reached_out_date >= day14 && p.reached_out_date < day7).length;

    // ── Activation (students who actually use the core loop) ─────────────
    const studentEmails = new Set(students.map(s => s.email));
    const activeStudentEmails = new Set(pipeline.map(p => p.user_email).filter(e => studentEmails.has(e)));
    const outreachStudentEmails = new Set(
      pipeline.filter(p => reachedStatuses.includes(p.status)).map(p => p.user_email).filter(e => studentEmails.has(e))
    );
    const activationPct = students.length > 0
      ? Math.round((activeStudentEmails.size / students.length) * 100)
      : null;

    // ── Student drop-off journey ──────────────────────────────────────────
    const studentsOnboarded = students.filter(u => u.onboarding_completed === true).length;
    const dropoff = {
      signedUp: students.length,
      onboarded: studentsOnboarded,
      builtPipeline: activeStudentEmails.size,
      reachedOut: outreachStudentEmails.size,
    };

    // ── Alumni database health ────────────────────────────────────────────
    let alumniTotal = 0, alumniVerified = 0, unresolvedMisses = 0;
    try {
      const alumni = await base44.asServiceRole.entities.DiscoveredAlumni.list('-created_date', 10000);
      alumniTotal = alumni.length;
      alumniVerified = alumni.filter(a => a.verified).length;
    } catch (_) {}
    try {
      const misses = await base44.asServiceRole.entities.AlumniSearchMiss.filter({ resolved: false });
      unresolvedMisses = misses.length;
    } catch (_) {}

    // ── School breakdown (compact) ────────────────────────────────────────
    const schoolMap = {};
    for (const u of allUsers) {
      const code = (u.school_code || '').toLowerCase();
      if (!code) continue;
      if (!schoolMap[code]) schoolMap[code] = { code, total: 0, students: 0, parents: 0, newThisWeek: 0 };
      schoolMap[code].total++;
      if (['student', 'gator'].includes(u.persona)) schoolMap[code].students++;
      if (u.persona === 'parent') schoolMap[code].parents++;
      if (u.created_date >= day7) schoolMap[code].newThisWeek++;
    }
    const schools = Object.values(schoolMap).sort((a, b) => b.total - a.total).slice(0, 12);

    return Response.json({
      growth: {
        totalUsers: allUsers.length,
        students: students.length,
        parents: parents.length,
        signupsThisWeek: newThisWeek.length,
        signupsLastWeek: newLastWeek.length,
        studentsThisWeek,
        studentsLastWeek,
        parentsThisWeek,
        parentsLastWeek,
      },
      revenue: {
        paidUsers: paidBreakdown.stripeActive,
        foundingMembers: paidBreakdown.foundingMembers,
        paidBreakdown,
        activeTrials: activeTrials.length,
        expiredTrials: expiredTrials.length,
        trialsStartedThisWeek,
        trialConversionPct,
        weeklyMRR: Math.round(paidBreakdown.stripeActive * 4.99 * 100) / 100,
      },
      activation: {
        totalStudents: students.length,
        studentsWithPipeline: activeStudentEmails.size,
        studentsWhoReachedOut: outreachStudentEmails.size,
        activationPct,
      },
      dropoff,
      funnel: {
        ...funnel,
        replyRate30,
        outreachThisWeek,
        outreachLastWeek,
      },
      alumniDb: {
        total: alumniTotal,
        verified: alumniVerified,
        unresolvedMisses,
      },
      schools,
    });
  } catch (e) {
    console.error('getCliffAdminMetrics error:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
});