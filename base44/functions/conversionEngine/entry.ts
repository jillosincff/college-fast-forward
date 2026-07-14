import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// CLIFF Conversion Engine — single backend for the free-to-pro journey.
// Actions:
//   reflection   → post-Magic-Moment data: real completed work, elapsed time, real next move
//   log          → record a funnel event (idempotent via event_key)
//   promptCheck  → is this user eligible to see a contextual Pro prompt right now?
//   promptAction → record shown / dismissed / continue_free / cta_clicked + frequency state
// Trust rules: only real completed work and real next moves are ever returned.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action } = body;
    const svc = base44.asServiceRole;

    const accessPlans = await svc.entities.UserAccessPlan.filter({ user_id: user.id }, '-created_date', 1).catch(() => []);
    const access = accessPlans?.[0] || null;
    const planNow = access?.plan || 'free';

    const daysSinceSignup = user.created_date
      ? Math.floor((Date.now() - new Date(user.created_date).getTime()) / 86400000)
      : null;

    const logEvent = async (event_name, extra = {}) => {
      const event_key = extra.event_key || `${user.id}:${event_name}`;
      const existing = await svc.entities.ConversionEvent.filter({ event_key }, '-created_date', 1).catch(() => []);
      if (existing?.length) return existing[0];
      const record = {
        user_id: user.id,
        user_email: user.email,
        event_name,
        event_key,
        plan_at_event: planNow,
        metadata: extra.metadata || {},
      };
      if (extra.trigger) record.trigger = extra.trigger;
      if (extra.company_name) record.company_name = extra.company_name;
      if (extra.job_title) record.job_title = extra.job_title;
      if (extra.device) record.device = extra.device;
      if (user.school_code) record.school_code = user.school_code;
      if (daysSinceSignup !== null) record.days_since_signup = daysSinceSignup;
      return await svc.entities.ConversionEvent.create(record);
    };

    // ── Reflection: post-Magic-Moment "Look what you just accomplished" ──
    if (action === 'reflection') {
      if (!access || access.magic_moment_status !== 'completed') return Response.json({ show: false });
      // Show once, ever — refreshes and duplicate events never re-trigger it
      const seen = await svc.entities.ConversionEvent.filter({ event_key: `${user.id}:reflection_viewed` }, '-created_date', 1).catch(() => []);
      if (seen?.length) return Response.json({ show: false });
      // Pro/excluded users never see the conversion arc
      if (planNow === 'pro' || access.exclude_upgrade_prompts) return Response.json({ show: false });

      const [resumes, pursuits, netrecs] = await Promise.all([
        base44.entities.TailoredResume.filter({ user_email: user.email, status: 'completed' }, '-created_date', 5).catch(() => []),
        base44.entities.JobPursuit.filter({ user_email: user.email }, '-created_date', 10).catch(() => []),
        svc.entities.NetworkingRecommendation.filter({ user_email: user.email }, '-created_date', 10).catch(() => []),
      ]);

      const resume = (resumes || []).find(r => r.id === access.magic_moment_job_id) || (resumes || [])[0] || null;
      const company = resume?.company_name || null;
      const sameCompany = (v) => company && v && v.toLowerCase() === company.toLowerCase();

      // Only items the workflow actually completed
      const items = [];
      if (resume) {
        items.push({ icon: '📄', label: 'Tailored resume prepared', detail: resume.ats_score ? `${resume.ats_score}% match score` : null });
        if (resume.job_description_text) {
          items.push({ icon: '🎯', label: 'Job fit evaluated', detail: resume.keywords_added?.length ? `${resume.keywords_added.length} keywords strengthened` : null });
        }
      }
      const pursuit = (pursuits || []).find(p => sameCompany(p.company_name)) || null;
      if (pursuit && ['ready_for_review', 'approved', 'complete'].includes(pursuit.company_research_status)) {
        items.push({ icon: '🏢', label: 'Company strategy created', detail: null });
      }
      const rec = (netrecs || []).find(n => sameCompany(n.company_name)) || null;
      if (rec) {
        const found = rec.networking_value !== 'NONE' && !!rec.best_contact_name;
        items.push({ icon: '🤝', label: 'Possible connection checked', detail: found ? 'A warm path was found' : null });
        if (rec.drafted) items.push({ icon: '✉️', label: 'Outreach drafted', detail: null });
      }
      if (pursuit?.next_action) items.push({ icon: '🗺️', label: 'Application plan built', detail: pursuit.next_action });

      if (!items.length) return Response.json({ show: false });

      // Real elapsed time only — omit if missing or implausible for a single session
      let elapsedMinutes = null;
      if (access.magic_moment_started_at && access.magic_moment_completed_at) {
        const mins = Math.round((new Date(access.magic_moment_completed_at).getTime() - new Date(access.magic_moment_started_at).getTime()) / 60000);
        if (mins >= 1 && mins <= 240) elapsedMinutes = mins;
      }

      // The one real next move comes from the single decision brain
      let move = null;
      try {
        const er = await base44.functions.invoke('decisionEngine', {});
        move = (er?.data || er)?.move || null;
      } catch { move = null; }

      // Personalized "here's what I'd do for you with Pro" — grounded in real student data
      const [planRows, pipeline] = await Promise.all([
        base44.entities.CareerPlan.filter({ user_email: user.email, status: 'active' }, '-created_date', 1).catch(() => []),
        base44.entities.NetworkingPipeline.filter({ user_email: user.email }, '-created_date', 50).catch(() => []),
      ]);
      const plan = planRows?.[0] || null;
      const goals = user.career_goals || {};
      const pitch = [];
      const oppName = (o) => o?.company || o?.company_name || null;
      const nextOpp = (plan?.opportunities || []).find(o => oppName(o) && oppName(o).toLowerCase() !== (company || '').toLowerCase()) || (plan?.opportunities || [])[0];
      if (oppName(nextOpp)) pitch.push(`Prepare your ${oppName(nextOpp)} application`);
      const watchCompanies = (plan?.companies?.length ? plan.companies : goals.target_companies) || [];
      const industries = (plan?.industries?.length ? plan.industries : goals.target_industries) || [];
      if (watchCompanies.length) pitch.push(`Monitor ${watchCompanies.slice(0, 3).join(', ')} for new openings`);
      else if (industries.length) pitch.push(`Monitor ${industries[0]} companies you're interested in`);
      const kind = (plan?.employment_type === 'internship' || goals.seeking === 'internship') ? 'internship' : 'opportunity';
      pitch.push(`Alert you if a better ${kind} appears`);
      const activeApps = (pipeline || []).filter(r => ['reached_out', 'messaged', 'applied'].includes(r.status)).length;
      pitch.push(activeApps > 0 ? `Draft follow-ups for your ${activeApps} active application${activeApps !== 1 ? 's' : ''}` : 'Draft follow-ups after you apply');
      pitch.push('Prepare you if you get an interview');

      await logEvent('reflection_viewed', { company_name: company, device: body.device });

      return Response.json({
        show: true,
        items,
        elapsed_minutes: elapsedMinutes,
        company_name: company,
        role_title: resume?.role_title || null,
        next_move: move,
        pro_pitch: pitch.slice(0, 5),
      });
    }

    // ── Log a funnel event ──
    if (action === 'log') {
      const allowed = ['magic_moment_offered', 'magic_moment_started', 'magic_moment_completed', 'reflection_viewed', 'next_action_displayed', 'pro_offer_viewed', 'pro_cta_clicked', 'checkout_started'];
      if (!allowed.includes(body.event_name)) return Response.json({ error: 'Invalid event_name' }, { status: 400 });
      const event_key = body.once === false
        ? `${user.id}:${body.event_name}:${Date.now()}`
        : `${user.id}:${body.event_name}`;
      await logEvent(body.event_name, {
        event_key,
        trigger: body.trigger,
        company_name: body.company_name,
        job_title: body.job_title,
        device: body.device,
        metadata: body.metadata,
      });
      return Response.json({ ok: true });
    }

    // ── Eligibility for a contextual Pro prompt ──
    if (action === 'promptCheck') {
      const excludedStates = ['pro_active', 'trial_active', 'grandfathered', 'admin_granted', 'internal_test', 'canceled_active_until_period_end'];
      const excluded = access && (access.plan === 'pro' || access.exclude_upgrade_prompts || excludedStates.includes(access.access_state));
      if (excluded) return Response.json({ eligible: false, reason: 'excluded' });
      // Suppression only applies to passive prompts — user-initiated paid actions always explain themselves
      if (!body.user_initiated) {
        const states = await svc.entities.UpgradePromptState.filter({ user_email: user.email }, '-created_date', 1).catch(() => []);
        const st = states?.[0];
        if (st?.suppressed_until && new Date(st.suppressed_until) > new Date()) {
          return Response.json({ eligible: false, reason: 'suppressed' });
        }
      }
      return Response.json({ eligible: true });
    }

    // ── Record a prompt interaction + update frequency state ──
    if (action === 'promptAction') {
      const { trigger, act } = body;
      if (!trigger || !['shown', 'dismissed', 'continue_free', 'cta_clicked'].includes(act)) {
        return Response.json({ error: 'Invalid promptAction' }, { status: 400 });
      }
      const states = await svc.entities.UpgradePromptState.filter({ user_email: user.email }, '-created_date', 1).catch(() => []);
      const st = states?.[0];
      const now = new Date().toISOString();
      const counts = { ...(st?.trigger_counts || {}) };
      if (act === 'shown') counts[trigger] = (counts[trigger] || 0) + 1;
      const patch = {
        user_email: user.email,
        last_trigger: trigger,
        trigger_counts: counts,
        total_shown: (st?.total_shown || 0) + (act === 'shown' ? 1 : 0),
        total_dismissed: (st?.total_dismissed || 0) + (act === 'dismissed' || act === 'continue_free' ? 1 : 0),
      };
      if (act === 'shown') patch.last_prompt_at = now;
      if (act === 'continue_free') patch.suppressed_until = new Date(Date.now() + 7 * 86400000).toISOString();
      if (st) await svc.entities.UpgradePromptState.update(st.id, patch);
      else await svc.entities.UpgradePromptState.create(patch);

      const evName = act === 'shown' ? 'prompt_shown' : act === 'dismissed' ? 'prompt_dismissed' : act === 'continue_free' ? 'continue_free' : 'pro_cta_clicked';
      await logEvent(evName, {
        trigger,
        device: body.device,
        company_name: body.company_name,
        job_title: body.job_title,
        event_key: `${user.id}:${evName}:${trigger}:${Date.now()}`,
      });
      return Response.json({ ok: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});