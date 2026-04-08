import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Anthropic from 'npm:@anthropic-ai/sdk@0.27.3';

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { studentName, major, targetRole, graduationYear, school, alumniName, alumniTitle, alumniCompany } = await req.json();

    // Server-side trial enforcement — never trust client
    const trialExpired = user.trial_status === 'expired' && user.subscription_status !== 'active';
    if (trialExpired) {
      return Response.json({
        success: false,
        error: 'Your FastIQ trial has ended. Upgrade to continue drafting messages.',
        upgrade_required: true,
      });
    }

    const schoolLabel = user.school_name || user.school || school || '';
    if (!schoolLabel) return Response.json({ error: 'School not set on profile' }, { status: 400 });

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

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });
    const result = response.content?.[0]?.text || '';

    // Log feature usage (fire-and-forget)
    base44.asServiceRole.entities.AnalyticsEvent.create({
      event_name: 'fastiq_feature_used',
      user_id: user.id,
      user_email: user.email,
      school_code: user.school_name || user.school || '',
      properties: { feature_type: 'outreach_draft' },
    }).catch(() => {});

    return Response.json({ success: true, message: result || '' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});