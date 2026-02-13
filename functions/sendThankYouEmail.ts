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

    // Check email preferences
    const prefs = await base44.asServiceRole.entities.EmailPreference.filter({ user_email: helperEmail });
    const pref = prefs?.[0];
    if (pref && (pref.all_emails === false || pref.thank_you_notifications === false)) {
      return Response.json({ success: true, skipped: true, reason: 'Unsubscribed' });
    }

    const helperFirst = (helperName || 'there').split(' ')[0];
    const studentFirst = (studentName || 'A UF student').split(' ')[0];

    const emailHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="${LOGO_URL}" alt="CFF" style="height: 50px; margin-bottom: 4px;" />
      <h1 style="color: white; margin: 8px 0 0 0; font-size: 22px;">You Made a Difference! ❤️</h1>
    </div>
    <div style="background: #fff; padding: 28px 24px; border: 1px solid #e5e7eb; border-top: none;">
      <p style="font-size: 16px;">Hi ${helperFirst},</p>
      <p style="font-size: 16px;">${studentFirst} just marked your answer as their <strong>Best Answer</strong>! Your advice is making a real impact in the UF community.</p>
      ${questionTitle ? `<div style="background: #fef3c7; padding: 14px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #f59e0b;">
        <p style="margin: 0; font-size: 14px; font-weight: 600; color: #92400e;">Question: "${questionTitle}"</p>
      </div>` : ''}
      ${thankYouMessage ? `<div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #22c55e;">
        <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 600; color: #166534;">💬 ${studentFirst} says:</p>
        <p style="margin: 0; font-size: 15px; color: #166534; font-style: italic;">"${thankYouMessage}"</p>
      </div>` : ''}
      <div style="text-align: center; margin: 24px 0;">
        <a href="${APP_BASE_URL}/#Connections" style="display: inline-block; background: #FA4616; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Help Another UF Student →</a>
      </div>
      <p style="font-size: 14px; color: #6b7280; text-align: center;">Every answer strengthens the UF Network. Thank you for paying it forward!</p>
    </div>
    <div style="background: #f9fafb; padding: 16px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">University of Florida 🧡💙 — <a href="${APP_BASE_URL}/#ProfileEdit" style="color: #9ca3af;">Manage preferences</a></p>
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
      subject: `❤️ ${studentFirst} just thanked you — you made a difference!`,
      body: emailHtml,
      from_name: 'College Fast Forward'
    });

    // Log email
    try {
      await base44.asServiceRole.entities.EmailLog.create({
        user_email: helperEmail,
        email_type: 'thank_you',
        subject: `${studentFirst} just thanked you`,
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