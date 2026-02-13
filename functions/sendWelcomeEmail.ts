import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";
const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userId, userEmail, userName, persona } = await req.json();

    if (!userEmail) {
      return Response.json({ error: 'userEmail required' }, { status: 400 });
    }

    const firstName = (userName || 'there').split(' ')[0];
    const isParent = persona === 'parent';
    const isAlumni = persona === 'alumni';
    const isGator = persona === 'gator' || persona === 'student';

    let roleMessage, ctaText, ctaUrl;
    if (isParent) {
      roleMessage = `Welcome to the UF family! You've just joined a network of UF parents and alumni who are helping students land their dream careers.`;
      ctaText = 'See Students Who Need Help →';
      ctaUrl = `${APP_BASE_URL}/#Connections`;
    } else if (isAlumni) {
      roleMessage = `Welcome back, fellow UF alumni! You've joined a growing network of UF alumni who are paying it forward by helping current students navigate their careers.`;
      ctaText = 'Browse Student Questions →';
      ctaUrl = `${APP_BASE_URL}/#Connections`;
    } else {
      roleMessage = `Welcome to the UF Network! You now have access to UF parents and alumni who are ready to help you with career advice, job leads, resume reviews, and more.`;
      ctaText = 'Ask Your First Question →';
      ctaUrl = `${APP_BASE_URL}/#PostRequest`;
    }

    const quickWins = isGator ? `
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #0021A5; margin: 0 0 12px 0; font-size: 16px;">🚀 Quick wins to get started:</h3>
        <ul style="margin: 0; padding-left: 20px; color: #374151;">
          <li style="margin-bottom: 8px;"><strong>Post a question</strong> — Tell us what you need help with (+5 karma)</li>
          <li style="margin-bottom: 8px;"><strong>Complete your profile</strong> — Helps parents find the best matches (+15 karma)</li>
          <li style="margin-bottom: 8px;"><strong>Invite your parents</strong> — They can help other UF students too (+50 karma)</li>
        </ul>
      </div>` : isParent ? `
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #0021A5; margin: 0 0 12px 0; font-size: 16px;">🚀 Here's how to make an impact:</h3>
        <ul style="margin: 0; padding-left: 20px; color: #374151;">
          <li style="margin-bottom: 8px;"><strong>Browse student questions</strong> — See who needs your expertise</li>
          <li style="margin-bottom: 8px;"><strong>Answer a question</strong> — 2-3 minutes can change a UF student's trajectory</li>
          <li style="margin-bottom: 8px;"><strong>Share salary data</strong> — Help students understand real compensation</li>
        </ul>
      </div>` : '';

    const emailHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); padding: 28px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="${LOGO_URL}" alt="College Fast Forward" style="height: 60px; margin-bottom: 8px;" />
      <h1 style="color: white; margin: 8px 0 0 0; font-size: 24px;">Welcome to the UF Network!</h1>
    </div>
    <div style="background: #fff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
      <p style="font-size: 18px; color: #111827;">Hi ${firstName},</p>
      <p style="font-size: 16px;">${roleMessage}</p>
      ${quickWins}
      <div style="text-align: center; margin: 28px 0;">
        <a href="${ctaUrl}" style="display: inline-block; background: linear-gradient(135deg, #FA4616, #FF6B3D); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">${ctaText}</a>
      </div>
      <p style="font-size: 15px; color: #6b7280; text-align: center;">Every connection strengthens the UF Network.</p>
    </div>
    <div style="background: #f9fafb; padding: 20px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
      <p style="font-size: 14px; color: #6b7280; margin: 0;">University of Florida 🧡💙</p>
      <p style="font-size: 12px; color: #9ca3af; margin: 8px 0 0 0;">College Fast Forward — Where UF Helps UF</p>
      <p style="font-size: 11px; color: #9ca3af; margin: 12px 0 0 0;"><a href="${APP_BASE_URL}/#ProfileEdit" style="color: #9ca3af;">Manage email preferences</a></p>
    </div>
  </div>
</body>
</html>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: userEmail,
      subject: `Welcome to the Gator Network, ${firstName}! 🐊`,
      body: emailHtml,
      from_name: 'College Fast Forward'
    });

    // Log email
    try {
      await base44.asServiceRole.entities.EmailLog.create({
        user_id: userId || '',
        user_email: userEmail,
        email_type: 'welcome',
        subject: `Welcome to the UF Network, ${firstName}!`,
        status: 'sent',
        sent_at: new Date().toISOString(),
        metadata: { persona }
      });
    } catch (logErr) {
      console.log('Email log failed (non-critical):', logErr.message);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Welcome email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});