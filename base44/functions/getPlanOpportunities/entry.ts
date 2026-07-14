import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Selects the 3 best real opportunities for the student's active CareerPlan.
// Quality over quantity: 3 explained picks, never a list of 40.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { planId } = await req.json().catch(() => ({}));
    let plan = null;
    if (planId) {
      plan = await base44.entities.CareerPlan.get(planId);
    } else {
      const plans = await base44.entities.CareerPlan.filter({ user_email: user.email, status: 'active' }, '-created_date', 1);
      plan = plans?.[0] || null;
    }
    if (!plan) return Response.json({ error: 'No active career plan' }, { status: 404 });

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are CLIFF, an AI career agent. Find real, currently-open positions for a college student with this career plan:

Goal: ${plan.goal_summary}
Target roles: ${(plan.target_roles || []).join(', ') || 'open'}
Industries: ${(plan.industries || []).join(', ') || 'any'}
Locations: ${(plan.locations || []).join(', ') || 'no preference'}
Companies of interest: ${(plan.companies || []).join(', ') || 'none named'}
Position type: ${plan.employment_type === 'either' ? 'internship or entry-level' : plan.employment_type.replace('_', '-')}

Search current job postings and select ONLY the 3 best opportunities for this student. Prioritize fit with the goal, realistic competitiveness for a college student, location match, and posting freshness. Do NOT pad the list — quality over quantity.

For each opportunity return:
- company, role, location
- url: link to the actual posting (empty string if unavailable)
- tier: "best" (clear top pick, at most one) or "good"
- why: 2-3 short reasons this deserves the student's time, tied to their plan
- beat_others: one sentence on why this beat similar roles you considered
- effort: estimated total prep effort, e.g. "~20 min with CLIFF"

Also return skipped_note: one or two sentences explaining what you filtered out and why (e.g. "I skipped three similar internships because they required relocation."). Honest, specific, coach voice.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          opportunities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                company: { type: 'string' },
                role: { type: 'string' },
                location: { type: 'string' },
                url: { type: 'string' },
                tier: { type: 'string' },
                why: { type: 'array', items: { type: 'string' } },
                beat_others: { type: 'string' },
                effort: { type: 'string' },
              },
              required: ['company', 'role', 'tier', 'why'],
            },
          },
          skipped_note: { type: 'string' },
        },
        required: ['opportunities'],
      },
    });

    const opportunities = (result.opportunities || []).slice(0, 3);
    await base44.entities.CareerPlan.update(plan.id, {
      opportunities,
      skipped_note: result.skipped_note || '',
      plan_built_at: new Date().toISOString(),
    });

    return Response.json({ opportunities, skipped_note: result.skipped_note || '' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});