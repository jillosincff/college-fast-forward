import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Goal Search: turn whatever the student typed — specific or loose — into a
// structured CareerPlan plus a conversational acknowledgment from CLIFF.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { goal } = await req.json().catch(() => ({}));
    if (!goal || !goal.trim()) return Response.json({ error: 'Missing goal' }, { status: 400 });

    const parsed = await base44.integrations.Core.InvokeLLM({
      prompt: `You are CLIFF, an AI career agent for college students. A student just told you their career goal in their own words:

"${goal.trim()}"

Interpret their intent. The goal may be specific ("marketing internship in Miami") or loose ("I like sports", "I don't know yet"). Aspirations about lifestyle ("I want to live in Boston", "I want to make $75k", "I want to work remotely") should be translated into concrete career-plan fields.

Return:
- ack: A short conversational reply (2 sentences max) in a warm, confident coach voice. Examples: "Perfect. I'll focus on marketing internships in Florida." / "No worries. Let's figure it out together — I'll start with roles that fit students who aren't sure yet." Never use the word "search".
- goal_summary: one crisp line summarizing the plan focus, e.g. "Marketing internships in Florida"
- target_roles: 1-4 concrete role titles to pursue
- industries: 0-3 industries
- locations: 0-3 locations (use "Remote" if applicable, empty if no preference)
- companies: 0-5 specific companies (only if named or strongly implied, e.g. "I want to work in sports" → sports employers)
- employment_type: "internship", "entry_level", or "either"
- confidence: "specific" if they know what they want, "exploring" if directional, "unsure" if they don't know`,
      response_json_schema: {
        type: 'object',
        properties: {
          ack: { type: 'string' },
          goal_summary: { type: 'string' },
          target_roles: { type: 'array', items: { type: 'string' } },
          industries: { type: 'array', items: { type: 'string' } },
          locations: { type: 'array', items: { type: 'string' } },
          companies: { type: 'array', items: { type: 'string' } },
          employment_type: { type: 'string' },
          confidence: { type: 'string' },
        },
        required: ['ack', 'goal_summary', 'target_roles'],
      },
    });

    // Only one active plan at a time
    const existing = await base44.entities.CareerPlan.filter({ user_email: user.email, status: 'active' });
    for (const p of existing || []) {
      await base44.entities.CareerPlan.update(p.id, { status: 'archived' });
    }

    const employmentType = ['internship', 'entry_level', 'either'].includes(parsed.employment_type) ? parsed.employment_type : 'either';
    const confidence = ['specific', 'exploring', 'unsure'].includes(parsed.confidence) ? parsed.confidence : 'exploring';

    const plan = await base44.entities.CareerPlan.create({
      user_email: user.email,
      goal_text: goal.trim(),
      goal_summary: parsed.goal_summary || goal.trim(),
      target_roles: parsed.target_roles || [],
      industries: parsed.industries || [],
      locations: parsed.locations || [],
      companies: parsed.companies || [],
      employment_type: employmentType,
      confidence,
      status: 'active',
    });

    return Response.json({ ack: parsed.ack, plan });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});