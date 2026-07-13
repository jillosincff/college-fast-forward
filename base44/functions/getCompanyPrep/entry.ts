import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// CLIFF Company Preparation for the Job Workspace: summary, values, key JD
// language, application strategy, likely interview questions, recent news.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { company, role, jobDescription } = await req.json().catch(() => ({}));
    if (!company) return Response.json({ error: 'company is required' }, { status: 400 });

    const prompt = `You are CLIFF, a career agent preparing a college student to apply for a job.

Company: ${company}
Role: ${role || 'entry-level / internship role'}
Job description: ${(jobDescription || '').slice(0, 5000) || 'not provided'}

Produce concise, practical preparation material for a college student. Rules:
- company_summary: 2-3 sentences on what the company does and its position in its market.
- company_values: 3-4 short phrases describing what the company appears to value (culture, priorities).
- key_language: 4-6 important words/phrases from the job description the student should mirror in their application. If no description was provided, give phrases typical for this role.
- strategy: 2-3 sentences of suggested application strategy for a student (angle to lead with, what to emphasize).
- interview_questions: 4-5 questions this company is likely to ask for this role.
- recent_news: 1-2 sentences of relevant recent company information ONLY if you found reliable, current information — otherwise null. Never invent news.
Write plainly, addressed to the student ("you").`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          company_summary: { type: 'string' },
          company_values: { type: 'array', items: { type: 'string' } },
          key_language: { type: 'array', items: { type: 'string' } },
          strategy: { type: 'string' },
          interview_questions: { type: 'array', items: { type: 'string' } },
          recent_news: { type: ['string', 'null'] },
        },
        required: ['company_summary', 'strategy'],
      },
    });

    return Response.json({ success: true, prep: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});