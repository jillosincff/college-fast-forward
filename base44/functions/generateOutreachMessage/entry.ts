import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const {
    context,
    recipientName,
    recipientTitle,
    recipientCompany,
    studentName,
    studentMajor,
    targetRole,
    targetIndustry,
    graduationYear,
    school,
    jobTitle,
    jobUrl,
    conversationContext,
  } = await req.json();

  const contextPrompts = {
    alumni_search: `Write a LinkedIn connection request message from a college student to a university alumni they found while job searching. The message should feel warm, specific, and genuine — not generic. It should reference the alumni's role/company specifically, mention a shared school connection, and make a clear but non-pushy ask (informational interview or quick chat). Keep it under 300 characters for LinkedIn's limit.`,
    cff_connection: `Write a message from a college student to a professional in the College Fast Forward network who has volunteered to help students. The message should feel grateful, specific about what help they're looking for, and respectful of the person's time. Keep it conversational and under 200 words.`,
    job_application: `Write a follow-up message from a college student who recently applied for a job. The message should express continued interest, briefly reinforce why they're a fit, and ask about next steps. Professional but not stiff. Under 150 words.`,
    cold_outreach: `Write a cold outreach message from a college student to a professional at a target company they haven't met. Should be brief, specific about why they're reaching out to this person specifically, and make a clear low-commitment ask. Under 150 words.`,
    thank_you: `Write a thank you note from a college student after a conversation with a professional who gave them their time. Should feel genuine and specific, reference something from the conversation, and leave the door open for future connection. Under 150 words.`,
  };

  const prompt = `${contextPrompts[context] || contextPrompts.cold_outreach}

STUDENT INFO:
- Name: ${studentName}
- School: ${school}
- Major: ${studentMajor}
- Target Role: ${targetRole}
- Target Industry: ${targetIndustry}
- Graduating: ${graduationYear}

RECIPIENT INFO:
- Name: ${recipientName}
- Title: ${recipientTitle}
- Company: ${recipientCompany}
${jobTitle ? `- Job they applied for: ${jobTitle}` : ''}
${conversationContext ? `- Context from conversation: ${conversationContext}` : ''}

Write ONLY the message text. No subject line, no preamble, no explanation. Just the message itself.`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    model: 'claude_sonnet_4_6',
  });

  const message = typeof result === 'string' ? result : result?.response || '';
  return Response.json({ success: true, message });
});