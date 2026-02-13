import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";
const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { helperEmail, helperName, studentName, questionTitle, thankYouMessage } = await req.json();

    if (!helperEmail || !studentName) {
      return Response.json({ error: 'helperEmail and studentName required' }, { status: 400 });
    }

    // Count total unique students this helper has helped
    let totalStudentsHelped = 1;
    try {
      const [helperAnswers, helperJobAnswers] = await Promise.all([
        base44.asServiceRole.entities.Answer.filter({ answerer_email: helperEmail }, '-created_date', 200),
        base44.asServiceRole.entities.JobAnswer.filter({ responder_email: helperEmail }, '-created_date', 200)
      ]);
      // Collect unique question authors by email from the questions they answered
      const questionIds = [...new Set([
        ...helperAnswers.map(a => a.question_id),
        ...helperJobAnswers.map(a => a.job_request_id)
      ])];
      // Use question count as proxy for unique students helped
      totalStudentsHelped = Math.max(1, questionIds.length);
    } catch (e) { /* fallback to 1 */ }

    // Check email preferences
    const prefs = await base44.asServiceRole.entities.EmailPreference.filter({ user_email: helperEmail });
    const pref = prefs?.[0];
    if (pref && (pref.all_emails === false || pref.thank_you_notifications === false)) {
      return Response.json({ success: true, skipped: true, reason: 'Unsubscribed' });
    }

    const helperFirst = (helperName || 'there').split(' ')[0];
    const studentFirst = (studentName || 'A UF student').split(' ')[0];
    const questionPreview = questionTitle ? (questionTitle.length > 100 ? questionTitle.substring(0, 100) + '...' : questionTitle) : '';

    const emailHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<span style="display:none;font-size:1px;color:#fff;max-height:0;overflow:hidden;">${studentFirst} just said your answer was helpful! +5 Karma earned.</span>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); padding: 28px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="${LOGO_URL}" alt="College Fast Forward" style="height: 60px; margin-bottom: 8px;" />
    </div>
    <div style="background: #fff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
      <p style="font-size: 18px; color: #111827; margin: 0 0 16px 0;">Hi ${helperFirst},</p>
      <p style="font-size: 16px;">${studentFirst} just said your answer was helpful!</p>

      <div style="border-top: 2px solid #e5e7eb; border-bottom: 2px solid #e5e7eb; padding: 20px 0; margin: 20px 0;">
        ${questionPreview ? `<p style="color: #374151; margin: 0 0 12px 0; font-size: 15px;">Your answer to: <em>"${questionPreview}"</em></p>` : ''}
        <p style="color: #166534; font-weight: 700; font-size: 16px; margin: 0; background: #f0fdf4; display: inline-block; padding: 6px 14px; border-radius: 6px;">⭐ +5 Karma earned</p>
      </div>

      <p style="font-size: 16px;">You've now helped <strong>${totalStudentsHelped}</strong> student${totalStudentsHelped !== 1 ? 's' : ''} in the UF network. Keep it up!</p>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${APP_BASE_URL}/#Connections?utm_source=thank_you_email" style="display: inline-block; background: linear-gradient(135deg, #FA4616, #FF6B3D); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">See More Questions to Answer →</a>
      </div>

      <p style="font-size: 14px; color: #6b7280; margin: 16px 0 0 0;">— The CFF Team</p>
    </div>
    <div style="background: #f9fafb; padding: 20px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">College Fast Forward</p>
      <p style="font-size: 11px; color: #9ca3af; margin: 4px 0 0 0;">8731 Lewis River Road, Delray Beach, FL 33446</p>
      <p style="font-size: 11px; color: #9ca3af; margin: 8px 0 0 0;"><a href="${APP_BASE_URL}/#ProfileEdit" style="color: #9ca3af;">Unsubscribe</a> · <a href="${APP_BASE_URL}/#ProfileEdit" style="color: #9ca3af;">Email Preferences</a></p>
    </div>
  </div>
</body></html>`;

    // Anti-spam: max 1 email/day, max 3/week
    const oneDayAgo = new Date(Date.now() - 24*60*60*1000).toISOString();
    const oneWeekAgo = new Date(Date.now() - 7*24*60*60*1000).toISOString();
    const recentLogs = await base44.asServiceRole.entities.EmailLog.filter({ user_email: helperEmail }, '-sent_at', 50);
    const todayCount = recentLogs.filter(l => l.sent_at >= oneDayAgo).length;
    const weekCount = recentLogs.filter(l => l.sent_at >= oneWeekAgo).length;
    if (todayCount >= 1 || weekCount >= 3) {
      return Response.json({ success: true, skipped: true, reason: `Rate limited (today: ${todayCount}, week: ${weekCount})` });
    }

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: helperEmail,
      subject: `A UF student said your answer helped! ⭐`,
      body: emailHtml,
      from_name: 'College Fast Forward'
    });

    // Log email
    try {
      await base44.asServiceRole.entities.EmailLog.create({
        user_email: helperEmail,
        email_type: 'thank_you',
        subject: `A UF student said your answer helped! ⭐`,
        status: 'sent',
        sent_at: new Date().toISOString(),
        metadata: { studentName, questionTitle }
      });
    } catch (e) { console.log('Log failed:', e.message); }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Thank you email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});