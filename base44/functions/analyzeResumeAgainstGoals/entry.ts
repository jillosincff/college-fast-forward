import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { resumeText, fileUrl, targetRoles, targetIndustries, jobType, location, careerGoals } = await req.json();

    if (!resumeText && !fileUrl) return Response.json({ error: 'No resume provided' }, { status: 400 });

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