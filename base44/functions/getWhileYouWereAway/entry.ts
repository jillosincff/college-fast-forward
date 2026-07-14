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

    // ── The one recommendation comes from a single brain: the Decision Engine ──
    const engineRes = await base44.functions.invoke('decisionEngine', {});
    const engine = engineRes?.data || engineRes || {};

    return Response.json({
      items: items.slice(0, 5),
      on_track: items.length === 0,
      brief: engine.urgency === 'high' ? 'Today is important.' : 'Today looks simple.',
      recommendation: engine.move || null,
      suppressed: engine.suppressed || [],
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});