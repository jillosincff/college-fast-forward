import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { resumeText, fileUrl, targetRoles, targetIndustries, jobType, location, careerGoals } = await req.json();

    if (!resumeText && !fileUrl) return Response.json({ error: 'No resume provided' }, { status: 400 });

    const goalsContext = [
      targetRoles?.length ? `Target Roles: ${targetRoles.join(', ')}` : '',
      targetIndustries?.length ? `Target Industries: ${targetIndustries.join(', ')}` : '',
      jobType ? `Job Type: ${jobType}` : '',
      location ? `Preferred Location: ${location}` : '',
      careerGoals?.graduation_year ? `Graduation Year: ${careerGoals.graduation_year}` : '',
      careerGoals?.biggest_struggle ? `Biggest Challenge: ${careerGoals.biggest_struggle}` : '',
    ].filter(Boolean).join('\n');

    const prompt = `You are a career coach reviewing a student's resume against their career goals.

${resumeText ? `RESUME:\n${resumeText}` : 'Review the attached resume document.'}

STUDENT CAREER GOALS:
${goalsContext || 'No specific goals provided — give general feedback.'}

Analyze this resume and return a JSON object with:
- overall_score: a number from 0-100 rating how well this resume matches the student's goals
- score_label: one of "Needs Work", "Getting There", "Strong Match", "Excellent"
- summary: 1-2 sentence plain-English summary of the resume's fit for these goals
- strengths: array of 2-3 specific things the resume does well (short bullet phrases)
- gaps: array of 2-3 areas that could be improved (short bullet phrases)
- missing: array of 2-3 specific keywords or skills missing that the target roles require (short bullet phrases)
- top_fix: single most impactful change the student should make right now (1 sentence)`;

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