import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { canRunGated, SOFT_WALL_MESSAGE } from '../../shared/entitlements.ts';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const {
    context,
    recipientName,
    recipientTitle,
    recipientCompany,
    recipientEmail,
    studentName,
    studentMajor,
    targetRole,
    targetIndustry,
    graduationYear,
    school,
    jobTitle,
    jobUrl,
    conversationContext,
    isLinkedInRoute,
    magic_moment,
  } = await req.json();

  // Soft wall: outreach drafts are a Pro feature (free only during the Magic Moment).
  if (!(await canRunGated(base44, user, magic_moment))) {
    return Response.json({ success: false, error: SOFT_WALL_MESSAGE, upgrade_required: true });
  }

  const schoolAbbrev = school || 'UF';
  const firstName = (studentName || '').split(' ')[0] || studentName;
  const alumniFirstName = (recipientName || '').split(' ')[0] || recipientName;
  const isUF = /florida|^uf$/i.test(schoolAbbrev);
  const cheer = isUF ? 'Go Gators!' : `Go ${schoolAbbrev}!`;

  const BANNED_PHRASES_RULE = `BANNED PHRASES — never use these:
- "I hope this email finds you well"
- "I hope you are doing good"
- "Please allow me to introduce myself"
- "I came across your profile"
- "I admire your work"
- "I wanted to reach out"
Start the message body with a direct personal hook — no corporate pleasantries.`;

  const contextPrompts = {
    alumni_search: `${BANNED_PHRASES_RULE}

${isLinkedInRoute ? `CRITICAL: You are writing a LinkedIn connection request invitation. You have a strict limit of 280 characters total for the body. Be ultra-concise, mention the shared school affinity, and ask for a brief chat. Do NOT include a subject line (return empty string), formal email signatures, or conversational filler. Return JSON: {"subject": "", "body": "..."}` : `Write a short outreach email (with subject line) from a ${schoolAbbrev} student to a ${schoolAbbrev} alumni. Return JSON: {"subject": "...", "body": "..."}`}

The body MUST follow this exact style and structure (warm, casual, one short paragraph):
"Hi ${alumniFirstName}! I'm a ${schoolAbbrev} student studying ${studentMajor || '[major]'} and saw you're a ${recipientTitle || '[title]'} at ${recipientCompany || '[company]'} — that's the kind of job I'm hoping to land after I graduate. Would you have 15 min to hop on a call sometime? Would love to hear how you got there. ${cheer} – ${firstName}"

${isLinkedInRoute ? 'Keep it under 280 characters — compress if needed but keep the same voice. No subject line. No formal signature beyond the "– name" sign-off.' : `Keep this exact structure and voice. It should read like a friendly text, not a formal email. End with "${cheer} – ${firstName}".`}`,
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

  const rawResult = typeof result === 'string' ? result : result?.response || '';
  let message = rawResult;
  let subject = '';
  if (context === 'alumni_search') {
    try {
      const parsed = JSON.parse(rawResult.replace(/```json|```/g, '').trim());
      subject = parsed.subject || '';
      message = parsed.body || rawResult;
    } catch {
      // fallback to raw text
    }
  }
  
  // For LinkedIn route, ensure subject is empty and message is trimmed
  if (isLinkedInRoute) {
    subject = '';
    message = message.trim();
  }
  
  return Response.json({ success: true, message, subject });
});