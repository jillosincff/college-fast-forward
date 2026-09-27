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
    const foundingGatorUsers = allUsers.filter(u => u.membership_tier === 'founding_gator');
    const paidBreakdown = {
      // Paying Pro = active Stripe subscription only. founding_gator is a pilot
      // (free Pro) cohort — counted separately as pilotFreePro, never as revenue.
      stripeActive: allUsers.filter(u => u.subscription_status === 'active').length,
      stripeActiveWithCustomerId: allUsers.filter(u => u.subscription_status === 'active' && u.stripe_customer_id).length,
      fastiqTier: allUsers.filter(u => u.membership_tier === 'fastiq' && u.subscription_status !== 'active').length,
      foundingMembers: allUsers.filter(u => u.is_founding_member === true && u.subscription_status !== 'active' && u.membership_tier !== 'fastiq').length,
      foundingGator: foundingGatorUsers.length,
    };
    // Pilot (free Pro) — the founding_gator parent-pilot cohort, never charged.
    // Reported separately so dashboards don't mix granted access with revenue.
    const pilotFreePro = {
      total: foundingGatorUsers.length,
      parents: foundingGatorUsers.filter(u => u.persona === 'parent').length,
      students: foundingGatorUsers.filter(u => ['student', 'gator'].includes(u.persona)).length,
      other: foundingGatorUsers.filter(u => !['student', 'gator', 'parent'].includes(u.persona)).length,
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

    // Effective outreach date — many records have a reached-out status but no
    // reached_out_date stamped, so fall back to status_date then created_date.
    const outDate = (p) => p.reached_out_date || p.status_date || p.created_date;
    const reached30 = pipeline.filter(p => reachedStatuses.includes(p.status) && outDate(p) >= day30);
    const replied30 = reached30.filter(p => repliedStatuses.includes(p.status));
    const replyRate30 = reached30.length > 0
      ? Math.round((replied30.length / reached30.length) * 100)
      : null;
    const outreachThisWeek = pipeline.filter(p => reachedStatuses.includes(p.status) && outDate(p) >= day7).length;
    const outreachLastWeek = pipeline.filter(p => reachedStatuses.includes(p.status) && outDate(p) >= day14 && outDate(p) < day7).length;

    // Active trials who actually engaged (have pipeline activity = logged in and used it)
    const pipelineEmails = new Set(pipeline.map(p => p.user_email));
    const activeTrialsEngaged = activeTrials.filter(u => pipelineEmails.has(u.email)).length;

    // ── Activation (students who actually use the core loop) ─────────────
    const studentEmails = new Set(students.map(s => s.email));
    const activeStudentEmails = new Set(pipeline.map(p => p.user_email).filter(e => studentEmails.has(e)));
    const outreachStudentEmails = new Set(
      pipeline.filter(p => reachedStatuses.includes(p.status)).map(p => p.user_email).filter(e => studentEmails.has(e))
    );
    const activationPct = students.length > 0
      ? Math.round((activeStudentEmails.size / students.length) * 100)
      : null;

    // ── Weekly active students ───────────────────────────────────────────
    // Union of genuine activity signals only: analytics events, pipeline
    // activity, resume tailoring in last 7d. Deliberately excludes
    // user.updated_date — bulk backend jobs touch user records and inflate it.
    const activeThisWeek = new Set();
    try {
      const recentEvents = await base44.asServiceRole.entities.AnalyticsEvent.filter({ created_date: { $gte: day7 } }, '-created_date', 2000);
      for (const e of recentEvents) {
        if (e.user_email && studentEmails.has(e.user_email)) activeThisWeek.add(e.user_email);
      }
    } catch (_) {}
    for (const p of pipeline) {
      if ((p.updated_date || p.created_date) >= day7 && studentEmails.has(p.user_email)) activeThisWeek.add(p.user_email);
    }
    try {
      const recentTailored = await base44.asServiceRole.entities.TailoredResume.filter({ created_date: { $gte: day7 } }, '-created_date', 1000);
      for (const t of recentTailored) {
        if (studentEmails.has(t.user_email)) activeThisWeek.add(t.user_email);
      }
    } catch (_) {}

    // ── Student drop-off journey ──────────────────────────────────────────
    // Users with no persona never finished signup classification — they still
    // signed up, so include them in the top of the journey.
    const unclassified = allUsers.filter(u => !u.persona?.trim()).length;
    const studentsOnboarded = students.filter(u => u.onboarding_completed === true).length;
    const dropoff = {
      signedUp: students.length + unclassified,
      unclassified,
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

    // ── Parent gift test (Fall Semester Gift) ────────────────────────────
    let parentGiftTest = { asksSent: 0, parentPageOpens: 0, checkoutsStarted: 0, giftsPaid: 0, giftsRefunded: 0, revenue: 0, byUtm: {} };
    try {
      const [paid, sent, started, refunded, views] = await Promise.all([
        base44.asServiceRole.entities.ConversionEvent.filter({ event_name: 'gift_semester_paid' }).catch(() => []),
        base44.asServiceRole.entities.ConversionEvent.filter({ event_name: 'ask_parent_sent' }).catch(() => []),
        base44.asServiceRole.entities.ConversionEvent.filter({ event_name: 'checkout_started' }).catch(() => []),
        base44.asServiceRole.entities.ConversionEvent.filter({ event_name: 'gift_semester_refunded' }).catch(() => []),
        base44.asServiceRole.entities.AnalyticsEvent.filter({ event_name: 'for_parents_viewed' }).catch(() => []),
      ]);
      const semStarted = (started || []).filter((e) => e.metadata?.offer === 'fall_semester_gift');
      const byUtm = { asksSent: {}, parentPageOpens: {}, checkoutsStarted: {}, giftsPaid: {}, revenue: {} };
      const bump = (obj, src, val = 1) => { const k = src || 'other'; obj[k] = (obj[k] || 0) + val; };
      for (const e of (sent || [])) bump(byUtm.asksSent, e.metadata?.utm_source || e.trigger);
      for (const e of (views || [])) bump(byUtm.parentPageOpens, e.properties?.utm_source);
      for (const e of semStarted) bump(byUtm.checkoutsStarted, e.metadata?.utm_source || e.trigger);
      for (const e of (paid || [])) {
        bump(byUtm.giftsPaid, e.metadata?.utm_source || e.trigger);
        bump(byUtm.revenue, e.metadata?.utm_source || e.trigger, (e.metadata?.amount_cents || 0) / 100);
      }
      parentGiftTest = {
        asksSent: (sent || []).length,
        parentPageOpens: (views || []).length,
        checkoutsStarted: semStarted.length,
        giftsPaid: (paid || []).length,
        giftsRefunded: (refunded || []).length,
        revenue: Math.round(((paid || []).reduce((s, e) => s + (e.metadata?.amount_cents || 0) / 100, 0)) * 100) / 100,
        byUtm,
      };
    } catch (e) { console.error('parentGiftTest metrics failed:', e.message); }

    return Response.json({
      parentGiftTest,
      pilotFreePro,
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
        payingPro: paidBreakdown.stripeActive,
        paidUsers: paidBreakdown.stripeActive,
        foundingMembers: paidBreakdown.foundingMembers,
        pilotFreePro: pilotFreePro.total,
        paidBreakdown,
        activeTrials: activeTrials.length,
        activeTrialsEngaged,
        expiredTrials: expiredTrials.length,
        trialsStartedThisWeek,
        trialConversionPct,
        // Actual Stripe plan is "Pro Monthly" at $19.96/month
        mrr: Math.round(paidBreakdown.stripeActive * 19.96 * 100) / 100,
      },
      activation: {
        totalStudents: students.length,
        studentsWithPipeline: activeStudentEmails.size,
        studentsWhoReachedOut: outreachStudentEmails.size,
        activationPct,
        weeklyActiveStudents: activeThisWeek.size,
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