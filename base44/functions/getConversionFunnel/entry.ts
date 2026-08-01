import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Admin-only conversion funnel: signup → Magic Moment → reflection → Pro offer → subscription.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const isAdmin = user.role === 'admin' || user.roles?.includes('admin');
    if (!isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const svc = base44.asServiceRole;
    const [users, plans, events, promptStates] = await Promise.all([
      svc.entities.User.list('-created_date', 1000).catch(() => []),
      svc.entities.UserAccessPlan.list('-created_date', 1000).catch(() => []),
      svc.entities.ConversionEvent.list('-created_date', 1000).catch(() => []),
      svc.entities.UpgradePromptState.list('-created_date', 1000).catch(() => []),
    ]);

    const students = (users || []).filter(u => !['parent', 'alumni'].includes(u.persona) && !u.roles?.includes('parent') && !u.roles?.includes('alumni'));
    const distinct = (name) => new Set((events || []).filter(e => e.event_name === name).map(e => e.user_email)).size;

    const mmStarted = (plans || []).filter(p => ['in_progress', 'completed'].includes(p.magic_moment_status)).length;
    const mmCompleted = (plans || []).filter(p => p.magic_moment_status === 'completed').length;
    const proUsers = (plans || []).filter(p => p.plan === 'pro');

    const steps = [
      { key: 'signup', label: 'Student signup', count: students.length },
      { key: 'onboarding', label: 'Onboarding completed', count: students.filter(u => u.onboarding_completed === true).length },
      { key: 'mm_offered', label: 'Magic Moment offered', count: distinct('magic_moment_offered') },
      { key: 'mm_started', label: 'Magic Moment started', count: mmStarted },
      { key: 'mm_completed', label: 'Magic Moment completed', count: mmCompleted },
      { key: 'reflection_viewed', label: 'Reflection screen viewed', count: distinct('reflection_viewed') },
      { key: 'next_action_displayed', label: 'Next CLIFF action displayed', count: distinct('next_action_displayed') },
      { key: 'pro_offer_viewed', label: 'Pro offer viewed', count: distinct('pro_offer_viewed') },
      { key: 'pro_cta_clicked', label: 'Pro CTA clicked', count: distinct('pro_cta_clicked') },
      { key: 'checkout_started', label: 'Checkout started', count: distinct('checkout_started') },
      { key: 'subscribed', label: 'Subscription active', count: proUsers.length },
    ];
    // Step-over-step conversion rate
    const funnel = steps.map((s, i) => ({
      ...s,
      rate: i === 0 || steps[i - 1].count === 0 ? null : Math.round((s.count / steps[i - 1].count) * 100),
    }));

    // Attribution: which triggers actually lead toward conversion
    const byTrigger = {};
    for (const e of events || []) {
      if (!e.trigger) continue;
      if (!byTrigger[e.trigger]) byTrigger[e.trigger] = { shown: 0, dismissed: 0, cta_clicked: 0, checkout_started: 0 };
      if (e.event_name === 'prompt_shown') byTrigger[e.trigger].shown++;
      if (e.event_name === 'prompt_dismissed' || e.event_name === 'continue_free') byTrigger[e.trigger].dismissed++;
      if (e.event_name === 'pro_cta_clicked') byTrigger[e.trigger].cta_clicked++;
      if (e.event_name === 'checkout_started') byTrigger[e.trigger].checkout_started++;
    }

    // Segments (minimum cohort size of 5 enforced client-side)
    const bySchool = {};
    const byDevice = {};
    for (const e of (events || []).filter(e => e.event_name === 'pro_cta_clicked')) {
      const school = e.school_code || 'unknown';
      bySchool[school] = (bySchool[school] || 0) + 1;
      const dev = e.device || 'unknown';
      byDevice[dev] = (byDevice[dev] || 0) + 1;
    }

    const totalShown = (promptStates || []).reduce((s, p) => s + (p.total_shown || 0), 0);
    const totalDismissed = (promptStates || []).reduce((s, p) => s + (p.total_dismissed || 0), 0);
    const suppressedNow = (promptStates || []).filter(p => p.suppressed_until && new Date(p.suppressed_until) > new Date()).length;

    return Response.json({
      funnel,
      byTrigger,
      bySchool,
      byDevice,
      mmToProRate: mmCompleted > 0 ? Math.round((proUsers.length / mmCompleted) * 1000) / 10 : null,
      prompts: {
        totalShown,
        totalDismissed,
        dismissalRate: totalShown > 0 ? Math.round((totalDismissed / totalShown) * 100) : null,
        suppressedNow,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});