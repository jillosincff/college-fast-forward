import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Anthropic from 'npm:@anthropic-ai/sdk@0.27.3';
import { canRunGated, SOFT_WALL_MESSAGE } from '../../shared/entitlements.ts';

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req) => {
  try {
    // CORS preflight — answer OPTIONS first so cross-origin callers don't get a 405.
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { studentName, major, targetRole, graduationYear, school, alumniName, alumniTitle, alumniCompany, cold, magic_moment } = await req.json();

    // Soft wall: outreach drafts are a Pro feature (free only during the Magic Moment).
    if (!(await canRunGated(base44, user, magic_moment))) {
      return Response.json({ success: false, error: SOFT_WALL_MESSAGE, upgrade_required: true });
    }

    const schoolLabel = user.school_name || user.school || school || '';
    if (!schoolLabel) return Response.json({ error: 'School not set on profile' }, { status: 400 });

    const schoolNickname = user.school_nickname || schoolLabel.split(' ')[0];
    const firstName = (studentName || '').split(' ')[0] || studentName;

    const systemPrompt = `You are a college career coach helping students write authentic, conversational outreach emails to alumni. Your job is to produce direct, human-sounding messages — NOT corporate, NOT formal, NOT stiff.

BANNED PHRASES — never use these, ever:
- "I hope this email finds you well"
- "I hope you are doing good"  
- "Please allow me to introduce myself"
- "I came across your profile"
- "I admire your work"
- "I wanted to reach out"
- Any corporate pleasantry opener

TONE RULES:
- Sound like a real college student writing a genuine email
- Start the body immediately with a direct personal hook referencing their shared school + student's major
- Keep it warm, specific, and low-pressure
- The ask should be a simple 15-minute virtual coffee chat`;

    const prompt = cold
      ? `${systemPrompt}

Write a short cold outreach MESSAGE (for LinkedIn) from a ${schoolLabel} student to a hiring manager or recruiter at ${alumniCompany || 'the company'}. The student is targeting the ${targetRole || 'open'} role there. There is NO shared school connection — do not assume one.

Student: ${firstName}, studying ${major || 'business'}${targetRole ? `, aiming for ${targetRole} roles` : ''}${graduationYear ? `, graduating ${graduationYear}` : ''}.

Use EXACTLY this 4-part structure — no corporate openers, no banned phrases:
1. One line: a genuine, specific reason this role at ${alumniCompany || 'the company'} caught their attention (tie it to what they're hiring for).
2. One line: who they are — ${schoolLabel} student, ${major || 'their major'}, graduating ${graduationYear || 'soon'}.
3. One low-pressure ask: a 10-minute chat OR one quick insight on what stands out in candidates for this role.
4. Clean sign-off: "Thanks for your time,\\n${firstName}"

Greeting: "Hi," (they'll add the name once they find the person on LinkedIn). Keep it under 120 words. Return JSON: {"subject": "${schoolLabel} student / Question about ${targetRole || 'the role'} at ${alumniCompany || 'the company'}", "body": "..."}. Return ONLY the JSON object.`
      : `${systemPrompt}

Write a short outreach EMAIL (not LinkedIn message) from a ${schoolLabel} student to a ${schoolLabel} alumni.

Student: ${firstName}, studying ${major || 'business'}${targetRole ? `, interested in ${targetRole} roles` : ''}${graduationYear ? `, graduating ${graduationYear}` : ''}.
Alumni: ${alumniName}${alumniTitle ? `, ${alumniTitle}` : ''}${alumniCompany ? ` at ${alumniCompany}` : ''}.

Return a JSON object with exactly these two fields:
{
  "subject": "${schoolLabel} connection / Question about ${alumniTitle || targetRole || 'your career'} roles at ${alumniCompany || 'your company'}",
  "body": "Hi ${alumniName?.split(' ')[0] || alumniName}!\\n\\nI'm a fellow ${schoolLabel} student studying ${major || '[major]'}, and I saw your path to becoming a ${alumniTitle || '[title]'} at ${alumniCompany || '[company]'}.\\n\\nYour background in this space is exactly where I'm trying to grow. If you have any availability over the next couple of weeks, I'd love to grab a quick 15-minute virtual coffee to ask you a couple of questions about your journey.\\n\\nGo ${schoolNickname}!\\n\\nBest,\\n${firstName}"
}

The body field MUST follow that 4-part structure — (1) school connection opener, (2) one line on the role/path, (3) a low-pressure 15-min ask, (4) clean sign-off — but make the middle feel genuine and personal, not copy-pasted. Keep the opening line and closing exactly as shown. Return ONLY the JSON object, no extra text.`;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });
    const rawText = response.content?.[0]?.text || '';

    let subject = '';
    let message = rawText;
    try {
      const parsed = JSON.parse(rawText);
      subject = parsed.subject || '';
      message = parsed.body || rawText;
    } catch {
      // fallback: return raw as message body
    }

    // Log feature usage (fire-and-forget)
    base44.asServiceRole.entities.AnalyticsEvent.create({
      event_name: 'fastiq_feature_used',
      user_id: user.id,
      user_email: user.email,
      school_code: user.school_name || user.school || '',
      properties: { feature_type: 'outreach_draft' },
    }).catch(() => {});

    return Response.json({ success: true, message, subject });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});