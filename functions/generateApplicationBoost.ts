import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { companyName, jobTitle, jobDescription, companySize, roleType, coverLetterRequired } = await req.json();

    // Get student profile
    const profiles = await base44.entities.FastTrackProProfile.filter({ user_email: user.email });
    const profile = profiles[0] || {};

    // Get resume
    const resumes = await base44.entities.Resume.filter({ student_email: user.email, is_active: true }, '-created_date', 1);
    const resumeText = resumes[0]?.parsed_text || profile.resume_text || '';

    const prompt = `You are FASTIQ, an honest AI career advisor for a UF student.

JOB: ${jobTitle} at ${companyName}
COMPANY SIZE: ${companySize || 'unknown'}
ROLE TYPE: ${roleType || 'general'}
COVER LETTER REQUIRED BY APPLICATION: ${coverLetterRequired ? 'Yes' : 'Not specified'}
JOB DESCRIPTION:
${jobDescription}

STUDENT:
Name: ${user.full_name || 'Student'}
Major: ${profile.major || 'Unknown'}
Graduation: ${profile.graduation_year || 'Unknown'}
Industries: ${(profile.selected_industries || []).join(', ') || 'Unknown'}

RESUME:
${resumeText || 'No resume on file'}

First, honestly assess: does this student need a cover letter?

Cover letters ARE worth writing when:
- Small company/startup where founder is hiring directly
- Creative, communications, writing, PR, marketing roles
- Application explicitly requires one
- Role involves significant client communication

Cover letters are NOT worth writing when:
- Large corporation with ATS
- Technical roles focused on skills/portfolio
- High-volume entry level roles

Generate ONE output:

OUTPUT A (cover_letter): 3 paragraphs, max 250 words. P1: Why THIS company/role. P2: Relevant experience with example. P3: What you'll bring + call to action. NEVER start with "I am writing to apply" or "I am passionate about".

OUTPUT B (note_to_hiring_manager): 3-4 sentences MAX for the message/additional info field. Grab attention immediately. One reason why this company, one thing they bring.

OUTPUT C (none_needed): No content needed. Give 3 alternative actions instead.

Return JSON:
{
  "cover_letter_needed": boolean,
  "output_type": "cover_letter" | "note_to_hiring_manager" | "none_needed",
  "reasoning": "one honest sentence",
  "content": "the text or null",
  "word_count": number,
  "tips": ["tip1", "tip2", "tip3"]
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          cover_letter_needed: { type: "boolean" },
          output_type: { type: "string" },
          reasoning: { type: "string" },
          content: { type: "string" },
          word_count: { type: "number" },
          tips: { type: "array", items: { type: "string" } }
        }
      },
      model: "claude_sonnet_4_6"
    });

    // Save to entity
    const saved = await base44.entities.ApplicationBoost.create({
      user_email: user.email,
      company_name: companyName,
      job_title: jobTitle,
      job_description: jobDescription,
      company_size: companySize || 'large',
      role_type: roleType || 'general',
      cover_letter_needed: result.cover_letter_needed,
      output_type: result.output_type,
      reasoning: result.reasoning || '',
      content: result.content || '',
      word_count: result.word_count || 0,
      tips: result.tips || [],
    });

    return Response.json({ success: true, ...result, savedId: saved.id });
  } catch (error) {
    console.error('Application boost error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});