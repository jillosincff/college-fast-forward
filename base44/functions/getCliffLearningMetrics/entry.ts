import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const isAdmin = user && (user.role === 'admin' || (user.roles || []).includes('admin'));
    if (!isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const svc = base44.asServiceRole;
    const now = new Date();

    // "Today" in Eastern Time
    const etNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const offsetMs = now.getTime() - etNow.getTime();
    const etMidnight = new Date(etNow.getFullYear(), etNow.getMonth(), etNow.getDate());
    const todayStart = new Date(etMidnight.getTime() + offsetMs);

    const iso30d = new Date(now.getTime() - 30 * 86400000).toISOString();

    const [users, magicEvents, plans, pursuits, recOutcomes, accessPlans, analyticsEvents, studentEvents] = await Promise.all([
      svc.entities.User.list('-created_date', 2000),
      svc.entities.ConversionEvent.filter({ event_name: 'magic_moment_completed' }, '-created_date', 2000),
      svc.entities.CareerPlan.list('-created_date', 2000),
      svc.entities.JobPursuit.list('-created_date', 2000),
      svc.entities.RecommendationOutcome.list('-created_date', 2000),
      svc.entities.UserAccessPlan.list('-created_date', 2000),
      svc.entities.AnalyticsEvent.filter({ created_date: { $gte: iso30d } }, '-created_date', 2000),
      svc.entities.StudentAnalyticsEvent.list('event_timestamp', 2000),
    ]);

    const students = (users || []).filter(u => u.persona === 'student' || (u.roles || []).includes('student'));
    const studentByEmail = {};
    for (const s of students) if (s.email) studentByEmail[s.email.toLowerCase()] = s;

    // 1. Signups today
    const signupsToday = students.filter(s => new Date(s.created_date) >= todayStart).length;

    // 2. Magic Moment
    const magicEmails = new Set((magicEvents || []).map(e => (e.user_email || '').toLowerCase()).filter(Boolean));
    const magicToday = (magicEvents || []).filter(e => new Date(e.created_date) >= todayStart).length;

    // 3. Onboarding completed
    const onboardedTotal = students.filter(s => s.onboarding_completed === true).length;
    const onboardedToday = students.filter(s => s.onboarding_completed === true && new Date(s.created_date) >= todayStart).length;

    // 4. Avg Time to First Meaningful Progress (signup -> first meaningful event)
    const firstEventByEmail = {};
    for (const ev of (studentEvents || [])) {
      const em = (ev.user_email || '').toLowerCase();
      if (!em || !ev.event_timestamp) continue;
      const t = new Date(ev.event_timestamp).getTime();
      if (!firstEventByEmail[em] || t < firstEventByEmail[em]) firstEventByEmail[em] = t;
    }
    const ttfmpHours = [];
    for (const [em, t] of Object.entries(firstEventByEmail)) {
      const s = studentByEmail[em];
      if (!s) continue;
      const diffH = (t - new Date(s.created_date).getTime()) / 3600000;
      if (diffH >= 0 && diffH < 24 * 90) ttfmpHours.push(diffH);
    }
    const avgTtfmpHours = ttfmpHours.length ? ttfmpHours.reduce((a, b) => a + b, 0) / ttfmpHours.length : null;

    // 5-7. Career plan signals: still exploring, top goals, top locations
    const latestPlanByEmail = {};
    for (const p of (plans || [])) {
      const em = (p.user_email || '').toLowerCase();
      if (em && !latestPlanByEmail[em]) latestPlanByEmail[em] = p; // list is newest-first
    }
    const latestPlans = Object.values(latestPlanByEmail);
    const stillExploring = latestPlans.filter(p => ['exploring', 'unsure'].includes(p.confidence)).length;

    const countTop = (values, topN = 5) => {
      const counts = {};
      for (const v of values) {
        const k = (v || '').toString().trim().toLowerCase();
        if (!k) continue;
        counts[k] = (counts[k] || 0) + 1;
      }
      return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, topN)
        .map(([name, count]) => ({ name, count }));
    };
    const topGoals = countTop(latestPlans.flatMap(p => (p.target_roles?.length ? p.target_roles : [p.goal_summary])));
    const topLocations = countTop(latestPlans.flatMap(p => p.locations || []));

    // 8. Best-performing recommendations
    const byLevel = {};
    for (const r of (recOutcomes || [])) {
      const lvl = r.recommendation_level || 'unknown';
      if (!byLevel[lvl]) byLevel[lvl] = { level: lvl, shown: 0, pursued: 0, applied: 0, interview: 0, offer: 0 };
      byLevel[lvl].shown++;
      if (r.pursued) byLevel[lvl].pursued++;
      if (r.applied) byLevel[lvl].applied++;
      if (r.interview) byLevel[lvl].interview++;
      if (r.offer) byLevel[lvl].offer++;
    }
    const recLevels = ['best', 'good', 'low'].map(l => byLevel[l]).filter(Boolean);
    const companyCounts = {};
    for (const r of (recOutcomes || [])) {
      if (!r.pursued || !r.company_name) continue;
      const k = r.company_name.trim();
      if (!companyCounts[k]) companyCounts[k] = { name: k, pursued: 0, interview: 0 };
      companyCounts[k].pursued++;
      if (r.interview) companyCounts[k].interview++;
    }
    const topCompanies = Object.values(companyCounts).sort((a, b) => b.pursued - a.pursued).slice(0, 5);

    // 9-10. Interview & offer rates (from pursuits)
    const appliedStatuses = ['applied', 'follow_up_due', 'interviewing', 'offer', 'rejected'];
    const appliedPursuits = (pursuits || []).filter(p => appliedStatuses.includes(p.application_status));
    const interviews = appliedPursuits.filter(p => (p.interview_status && p.interview_status !== 'none') || ['interviewing', 'offer'].includes(p.application_status)).length;
    const offers = appliedPursuits.filter(p => p.application_status === 'offer').length;
    const pct = (n, d) => (d > 0 ? Math.round((n / d) * 1000) / 10 : null);

    // 11. Pro conversion
    const proCount = (accessPlans || []).filter(a => a.plan === 'pro').length;

    // 12. 7-day retention: cohort signed up 7-28 days ago, active again after day 7
    const latestActivityByEmail = {};
    for (const ev of (analyticsEvents || [])) {
      const em = (ev.user_email || '').toLowerCase();
      if (!em) continue;
      const t = new Date(ev.created_date).getTime();
      if (!latestActivityByEmail[em] || t > latestActivityByEmail[em]) latestActivityByEmail[em] = t;
    }
    const cohort = students.filter(s => {
      const age = (now.getTime() - new Date(s.created_date).getTime()) / 86400000;
      return age >= 7 && age <= 28;
    });
    const retained = cohort.filter(s => {
      const last = latestActivityByEmail[(s.email || '').toLowerCase()];
      return last && last >= new Date(s.created_date).getTime() + 7 * 86400000;
    }).length;

    return Response.json({
      signups_today: signupsToday,
      total_students: students.length,
      magic_moment: { today: magicToday, total_students: magicEmails.size },
      onboarding: { completed_today: onboardedToday, completed_total: onboardedTotal },
      avg_ttfmp_hours: avgTtfmpHours !== null ? Math.round(avgTtfmpHours * 10) / 10 : null,
      ttfmp_sample_size: ttfmpHours.length,
      still_exploring: { count: stillExploring, of_plans: latestPlans.length },
      top_goals: topGoals,
      top_locations: topLocations,
      recommendations: { by_level: recLevels, top_companies: topCompanies, total_tracked: (recOutcomes || []).length },
      interview_rate: { pct: pct(interviews, appliedPursuits.length), interviews, applied: appliedPursuits.length },
      offer_rate: { pct: pct(offers, appliedPursuits.length), offers, applied: appliedPursuits.length },
      pro_conversion: { pct: pct(proCount, students.length), pro: proCount, students: students.length },
      retention_7d: { pct: pct(retained, cohort.length), retained, cohort: cohort.length },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});