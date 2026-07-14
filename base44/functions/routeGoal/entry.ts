import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// CLIFF OS front door: classify whatever the student typed into an intent so
// everything routes through CLIFF — the student never picks a feature.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { goal } = await req.json().catch(() => ({}));
    if (!goal || !goal.trim()) return Response.json({ error: 'Missing goal' }, { status: 400 });

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are CLIFF, an AI career agent for college students. The student just typed this into your "What's our goal today?" box:

"${goal.trim()}"

Classify the intent:
- "found_job": they found a specific job/posting they want to pursue (may include a company, role, or URL)
- "interview_prep": they want to prepare/practice for an interview
- "no_response": they applied or reached out and haven't heard back
- "find_better": they want better opportunities than what they have
- "new_goal": they're stating a career goal or aspiration (specific or vague, including "I don't know") — the default

Also return:
- ack: a short conversational reply (1-2 sentences) in a warm, confident coach voice telling them what you'll do. Never use the word "search".
- company: company name if one was mentioned, else ""
- role: role/title if mentioned, else ""
- job_url: URL if one was pasted, else ""`,
      response_json_schema: {
        type: 'object',
        properties: {
          intent: { type: 'string' },
          ack: { type: 'string' },
          company: { type: 'string' },
          role: { type: 'string' },
          job_url: { type: 'string' },
        },
        required: ['intent', 'ack'],
      },
    });

    const valid = ['found_job', 'interview_prep', 'no_response', 'find_better', 'new_goal'];
    return Response.json({
      intent: valid.includes(result.intent) ? result.intent : 'new_goal',
      ack: result.ack || 'On it.',
      company: result.company || '',
      role: result.role || '',
      job_url: result.job_url || '',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});