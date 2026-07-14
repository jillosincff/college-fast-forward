import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Proactive agent digest: everything real that changed since the student's
// last visit, plus the single most valuable next move. Trust rules: only
// verifiable facts from the student's own records — nothing is fabricated.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { since } = await req.json().catch(() => ({}));
    const sinceTs = since ? new Date(since).getTime() : Date.now() - 24 * 3600000;
    const now = Date.now();

    const [pipeline, resumes, plans] = await Promise.all([
      base44.entities.NetworkingPipeline.filter({ user_email: user.email }, '-created_date', 100).catch(() => []),
      base44.entities.TailoredResume.filter({ user_email: user.email }, '-created_date', 20).catch(() => []),
      base44.entities.CareerPlan.filter({ user_email: user.email, status: 'active' }, '-created_date', 1).catch(() => []),
    ]);

    const plan = plans?.[0] || null;
    const daysSince = (r) => (now - new Date(r.status_date || r.created_date).getTime()) / 86400000;
    const changedSince = (d) => d && new Date(d).getTime() > sinceTs;
    const items = [];

    // Employer activity actually recorded in the tracker
    for (const r of pipeline || []) {
      if (r.status === 'offer' && changedSince(r.status_date)) items.push(`🎉 You got an offer from ${r.company}.`);
      else if (r.status === 'interview' && changedSince(r.status_date)) items.push(`🎉 You landed an interview with ${r.company}.`);
      else if (r.status === 'replied' && changedSince(r.status_date)) items.push(`✓ ${r.alumni_name || r.company} replied to your outreach.`);
    }

    // Work CLIFF finished while they were away
    const newResumes = (resumes || []).filter(r => r.status === 'completed' && changedSince(r.updated_date));
    for (const r of newResumes.slice(0, 2)) items.push(`✓ I finished tailoring your resume for ${r.company_name}.`);
    if (plan?.plan_built_at && changedSince(plan.plan_built_at) && plan.opportunities?.length) {
      items.push(`✓ I picked your ${plan.opportunities.length} best opportunities for "${plan.goal_summary}".`);
    }

    // Time-driven items that became due
    const followUpsDue = (pipeline || []).filter(r => ['reached_out', 'messaged'].includes(r.status) && daysSince(r) >= 5);
    for (const r of followUpsDue.slice(0, 2)) items.push(`✓ Your ${r.company} follow-up is due today.`);

    const interviews = (pipeline || []).filter(r => r.status === 'interview' && r.interview_date);
    for (const r of interviews) {
      const hrs = (new Date(r.interview_date).getTime() - now) / 3600000;
      if (hrs > 0 && hrs <= 48) items.push(`✓ Your ${r.company} interview is ${hrs <= 24 ? 'today or tomorrow' : 'coming up in 2 days'}.`);
    }

    // ── One recommendation: the single most valuable next move ──────────
    const interviewSoon = interviews.find(r => {
      const hrs = (new Date(r.interview_date).getTime() - now) / 3600000;
      return hrs > 0 && hrs <= 48;
    }) || (pipeline || []).find(r => r.status === 'interview');
    const readyResume = (resumes || []).find(r => r.status === 'completed' && !r.downloaded_at);
    const topOpp = plan?.opportunities?.[0];

    let recommendation;
    if (interviewSoon) {
      recommendation = {
        title: `Practice your ${interviewSoon.company} interview`,
        reason: 'Your interview is the highest-stakes event on your calendar right now.',
        time: '~15 minutes', outcome: 'Walk in with rehearsed answers instead of nerves.',
        cta: 'Practice', route: '#/MockInterview',
      };
    } else if (followUpsDue[0]) {
      recommendation = {
        title: `Send your ${followUpsDue[0].company} follow-up`,
        reason: `It's been ${Math.floor(daysSince(followUpsDue[0]))} days with no reply — a short nudge now keeps you on their radar.`,
        time: '~2 minutes', outcome: 'Roughly doubles your chance of a response versus staying silent.',
        cta: 'Send', route: '#/ApplicationTracker',
      };
    } else if (readyResume) {
      recommendation = {
        title: `Review your tailored ${readyResume.company_name} resume`,
        reason: "I already did the tailoring — it just needs your approval before you apply.",
        time: '~3 minutes', outcome: 'A submit-ready application for ' + readyResume.company_name + '.',
        cta: 'Review', route: '#/ResumeTailoring',
      };
    } else if (topOpp) {
      recommendation = {
        title: `Apply to ${topOpp.company}`,
        reason: topOpp.beat_others || `It's my top pick for "${plan.goal_summary}".`,
        time: topOpp.effort || '~20 minutes', outcome: 'Your strongest current shot at your goal.',
        cta: 'Continue', workspace: { company: topOpp.company, role: topOpp.role, jobUrl: topOpp.url || '', location: topOpp.location || '' },
      };
    } else {
      recommendation = {
        title: 'Tell me your goal',
        reason: "I don't have an active plan for you yet — give me a goal and I'll line everything up.",
        time: '~30 seconds', outcome: 'A full plan with your 3 best opportunities.',
        cta: 'Start', route: null,
      };
    }

    const urgent = !!interviewSoon || followUpsDue.length > 0;
    return Response.json({
      items: items.slice(0, 5),
      on_track: items.length === 0,
      brief: urgent ? 'Today is important.' : 'Today looks simple.',
      recommendation,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});