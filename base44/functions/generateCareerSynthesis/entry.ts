import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { major, work_environment, natural_strength, motivation, graduation_year, biggest_struggle } = await req.json();

    const prompt = `You are a career advisor helping a college student figure out what they want to do.

Student profile:
- Major: ${major || 'Not specified'}
- Work environment preference: ${work_environment || 'Not specified'}
- Natural strength: ${natural_strength || 'Not specified'}
- Motivated by: ${motivation || 'Not specified'}
- Graduating: ${graduation_year || 'Not specified'}
- Biggest struggle: ${biggest_struggle || 'Not specified'}

Based on this, provide:
1. A warm, encouraging 2-3 sentence synthesis of what careers might suit them (casual, smart friend tone — not corporate, no exclamation points)
2. 3-4 specific role suggestions that match their profile

Respond ONLY with valid JSON in this exact format:
{
  "synthesis": "2-3 sentence message to the student",
  "suggested_roles": ["Role 1", "Role 2", "Role 3", "Role 4"]
}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          synthesis: { type: 'string' },
          suggested_roles: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return Response.json({
      success: true,
      synthesis: result?.synthesis || "Based on what you've shared, you have a clear sense of what matters to you. Let's find the right roles.",
      suggested_roles: result?.suggested_roles || [],
    });
  } catch (error) {
    return Response.json({
      success: false,
      synthesis: "Based on what you've shared, you have a clear sense of what matters to you. Let's find the right roles.",
      suggested_roles: [],
    });
  }
});