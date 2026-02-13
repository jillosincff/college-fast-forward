import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";
const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { studentEmail, studentName, parentName, parentEmail } = await req.json();

    if (!studentEmail || !parentName) {
      return Response.json({ error: 'studentEmail and parentName required' }, { status: 400 });
    }

    // Check prefs
    const prefs = await base44.asServiceRole.entities.EmailPreference.filter({ user_email: studentEmail });
    const pref = prefs?.[0];
    if (pref && (pref.all_emails === false || pref.parent_joined_notifications === false)) {
      return Response.json({ success: true, skipped: true });
    }

    const studentFirst = (studentName || 'there').split(' ')[0];
    const parentFirst = (parentName || 'Your parent').split(' ')[0];

    const emailHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="${LOGO_URL}" alt="CFF" style="height: 50px; margin-bottom: 4px;" />
      <h1 style="color: white; margin: 8px 0 0 0; font-size: 22px;">Your UF Family Just Got Stronger! 🎉</h1>
    </div>
    <div style="background: #fff; padding: 28px 24px; border: 1px solid #e5e7eb; border-top: none;">
      <p style="font-size: 16px;">Hi ${studentFirst},</p>
      <p style="font-size: 16px;">Great news! <strong>${parentFirst}</strong> just joined the UF Network through your invite.</p>
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px; margin: 16px 0; text-align: center;">
        <p style="font-size: 18px; font-weight: 700; color: #166534; margin: 0;">🎉 +50 karma earned!</p>
        <p style="font-size: 14px; color: #166534; margin: 4px 0 0 0;">Your questions now get priority visibility in the network.</p>
      </div>
      <p style="font-size: 16px;">What this means for you:</p>
      <ul style="color: #374151; font-size: 15px;">
        <li style="margin-bottom: 8px;">Your questions get boosted to the top of the feed</li>
        <li style="margin-bottom: 8px;">${parentFirst} can now help other UF students too</li>
        <li style="margin-bottom: 8px;">The more parents who join, the stronger the UF Network gets</li>
      </ul>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${APP_BASE_URL}/#Dashboard" style="display: inline-block; background: #FA4616; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View Your Dashboard →</a>
      </div>
    </div>
    <div style="background: #f9fafb; padding: 16px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">University of Florida 🧡💙 — <a href="${APP_BASE_URL}/#ProfileEdit" style="color: #9ca3af;">Manage preferences</a></p>
    </div>
  </div>
</body></html>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: studentEmail,
      subject: `🎉 ${parentFirst} just joined the UF Network!`,
      body: emailHtml,
      from_name: 'College Fast Forward'
    });

    try {
      await base44.asServiceRole.entities.EmailLog.create({
        user_email: studentEmail,
        email_type: 'parent_joined',
        subject: `${parentFirst} just joined the UF Network!`,
        status: 'sent',
        sent_at: new Date().toISOString(),
        metadata: { parentName, parentEmail }
      });
    } catch (e) { console.log('Log failed:', e.message); }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Parent joined email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});