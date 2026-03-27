import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { studentName, major, targetRole, graduationYear, school, alumniName, alumniTitle, alumniCompany } = await req.json();

    const schoolLabel = school || 'University of Florida';

    const prompt = `Write a LinkedIn connection request message from a ${schoolLabel} student to a ${schoolLabel} alumni.

Student: ${studentName}${major ? `, studying ${major}` : ''}${targetRole ? `, interested in ${targetRole}` : ''}${graduationYear ? `, graduating ${graduationYear}` : ''}.
Alumni: ${alumniName}${alumniTitle ? `, ${alumniTitle}` : ''}${alumniCompany ? ` at ${alumniCompany}` : ''}.

Rules (follow exactly):
- Maximum 3 sentences. No exceptions.
- No flattery. Do not say "I came across your profile" or "I admire your work."
- First sentence: lead with the shared ${schoolLabel} connection.
- Last sentence: one low-ask question (e.g. would you be open to a 15-min chat?).
- Sound like a real student, not a cover letter.
- Return the message body only. No subject line. No greeting label. No sign-off label.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: 'gemini_3_flash',
    });

    return Response.json({ success: true, message: result || '' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});