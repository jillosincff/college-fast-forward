import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { studentName, major, targetRole, graduationYear, alumniName, alumniTitle, alumniCompany } = await req.json();

    const outreachPrompt = `
You are helping a college student write a short, genuine LinkedIn message to an alumni.

Student profile:
- Name: ${studentName}
- Major: ${major}
- Target role: ${targetRole}
- School: University of Florida
- Graduation year: ${graduationYear}

Alumni:
- Name: ${alumniName}
- Current title: ${alumniTitle}
- Company: ${alumniCompany}

Write a LinkedIn connection message. Rules:
- 3 sentences maximum
- No flattery or "I came across your profile"
- Lead with the shared UF connection
- Be specific about why this role/company interests them
- End with a single low-ask question
- Sound like a real student, not a cover letter

Return only the message text, nothing else.
`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: outreachPrompt,
      model: 'gemini_3_flash',
    });

    return Response.json({
      success: true,
      message: result || '',
    });
  } catch (error) {
    console.error('[generateOutreachDraft] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});