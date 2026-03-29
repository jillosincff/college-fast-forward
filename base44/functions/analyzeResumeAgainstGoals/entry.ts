import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { resumeText, fileUrl, targetRoles, targetIndustries, jobType, location, careerGoals } = await req.json();

    if (!resumeText && !fileUrl) return Response.json({ error: 'No resume provided' }, { status: 400 });

    const prompt = `You are an expert resume coach and ATS specialist. Analyze this resume against the student's career goals and provide a detailed score.

STUDENT'S CAREER GOALS:
- Target Roles: ${targetRoles?.join(', ') || 'Not specified'}
- Target Industries: ${targetIndustries?.join(', ') || 'Not specified'}
- Job Type: ${jobType || 'Not specified'}
- Location: ${location || 'Not specified'}

RESUME TEXT:
${resumeText || '(Resume provided as attached file — please analyze the attached PDF/document)'}

Analyze the resume and respond ONLY with this JSON structure (no preamble, no markdown):
{
  "overall_score": <number 0-100>,
  "score_label": <"Needs Work" | "Getting There" | "Strong" | "Excellent">,
  "summary": "<2 sentence honest assessment in casual smart-friend tone>",
  "strengths": [
    "<specific strength 1>",
    "<specific strength 2>",
    "<specific strength 3>"
  ],
  "gaps": [
    "<specific gap 1>",
    "<specific gap 2>",
    "<specific gap 3>"
  ],
  "missing": [
    "<critical missing element 1>",
    "<critical missing element 2>"
  ],
  "top_fix": "<single most impactful thing they could do right now, 1 sentence>"
}

Be specific and personalized to their goals. A resume targeting Financial Services should be scored on finance keywords, quantified achievements, relevant experience. Don't be generic.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: 'gemini_3_flash',
      ...(fileUrl && !resumeText ? { file_urls: [fileUrl] } : {}),
      response_json_schema: {
        type: 'object',
        properties: {
          overall_score: { type: 'number' },
          score_label: { type: 'string' },
          summary: { type: 'string' },
          strengths: { type: 'array', items: { type: 'string' } },
          gaps: { type: 'array', items: { type: 'string' } },
          missing: { type: 'array', items: { type: 'string' } },
          top_fix: { type: 'string' },
        },
      },
    });

    return Response.json({ success: true, analysis: result });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});