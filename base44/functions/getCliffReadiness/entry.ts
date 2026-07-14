import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// "CLIFF Is Ready" preview: proves CLIFF has genuinely assessed an opportunity
// without generating the paid deliverables. Only for Free students after their
// Magic Moment. Trust rules: real resume analysis, real network check — no
// fabricated contacts, drafts, or finished work.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { company, role, jobDescription } = await req.json().catch(() => ({}));
    if (!company) return Response.json({ show: false });
    const svc = base44.asServiceRole;

    // Free students after the Magic Moment only — never Pro/excluded accounts
    const plans = await svc.entities.UserAccessPlan.filter({ user_id: user.id }, '-created_date', 1).catch(() => []);
    const access = plans?.[0];
    if (!access || access.magic_moment_status !== 'completed') return Response.json({ show: false });
    const excludedStates = ['pro_active', 'trial_active', 'grandfathered', 'admin_granted', 'internal_test', 'canceled_active_until_period_end'];
    if (access.plan === 'pro' || access.exclude_upgrade_prompts || excludedStates.includes(access.access_state)) {
      return Response.json({ show: false });
    }
    // Respect the 7-day suppression after "Continue with Free"
    const states = await svc.entities.UpgradePromptState.filter({ user_email: user.email }, '-created_date', 1).catch(() => []);
    if (states?.[0]?.suppressed_until && new Date(states[0].suppressed_until) > new Date()) {
      return Response.json({ show: false });
    }

    const items = [];

    // 1. Real resume assessment — only when both the resume and JD actually exist
    let assessedResume = false;
    if (jobDescription && jobDescription.length > 100) {
      const resumes = await base44.entities.Resume.filter({ student_email: user.email, is_active: true }, '-created_date', 1).catch(() => []);
      const resumeText = resumes?.[0]?.parsed_text;
      if (resumeText && resumeText.length > 200) {
        try {
          const analysis = await base44.integrations.Core.InvokeLLM({
            prompt: `You are a resume-tailoring analyst. Compare this student's resume against the job description and count the concrete, specific improvements a tailoring pass would make (keyword additions, bullet rewrites to match required skills, reordering, quantification opportunities, summary alignment). Return only the count and up to 3 short focus-area labels (2-4 words each). Do NOT write any actual improvements or drafts.\n\nRESUME:\n${resumeText.slice(0, 6000)}\n\nJOB (${role || ''} at ${company}):\n${jobDescription.slice(0, 4000)}`,
            response_json_schema: {
              type: 'object',
              properties: {
                improvements_identified: { type: 'number' },
                focus_areas: { type: 'array', items: { type: 'string' } },
              },
            },
          });
          if (analysis?.improvements_identified > 0) {
            assessedResume = true;
            items.push({
              icon: '📄',
              label: `${analysis.improvements_identified} resume improvement${analysis.improvements_identified !== 1 ? 's' : ''} identified`,
              detail: analysis.focus_areas?.slice(0, 2).join(' · ') || null,
            });
          }
        } catch { /* analysis unavailable — item omitted rather than fabricated */ }
      }
    }

    // 2. Real network check against verified CFF network members
    if (user.school_code) {
      const profiles = await svc.entities.ParentNetworkProfile.filter({ school_code: user.school_code, is_active: true }, '-created_date', 500).catch(() => []);
      const c = company.toLowerCase();
      const matched = (profiles || []).some(p => p.company_name && (p.company_name.toLowerCase().includes(c) || c.includes(p.company_name.toLowerCase())));
      if (matched) items.push({ icon: '🤝', label: 'Possible networking advantage available', detail: null });
    }

    // 3+4. Capabilities CLIFF can reliably provide for this role
    items.push({ icon: '🏢', label: 'Company strategy available', detail: null });
    items.push({ icon: '🎤', label: 'Interview practice can be prepared', detail: role ? `Role-specific for ${role}` : null });

    return Response.json({ show: true, items, assessed_resume: assessedResume });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});