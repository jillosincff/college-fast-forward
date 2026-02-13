import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";
const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg";

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.substring(0, max) + '...' : str;
}

Deno.serve(async (req) => {
    try {
        const body = await req.json();

        const {
            questionId,
            questionType,
            questionTitle,
            posterEmail,
            posterName,
            answererName,
            answererEmail,
            answererTitle,
            answererCompany,
            answererPersona,
            answerId,
            answerPreview
        } = body;

        if (!posterEmail || !answererName || !answerPreview || !questionTitle) {
            return Response.json({ 
                error: 'Missing required fields',
                required: ['posterEmail', 'answererName', 'answerPreview', 'questionTitle']
            }, { status: 400 });
        }

        // Don't notify if the author answered their own question
        if (posterEmail === answererEmail) {
            return Response.json({ success: true, skipped: true, reason: 'Self-answer' });
        }

        const base44 = createClientFromRequest(req);

        // Anti-spam + preferences via shared helper
        const canSendResult = await base44.functions.invoke('emailHelpers', {
          action: 'canSendEmail', userEmail: posterEmail, emailType: 'new_answer'
        });
        if (!canSendResult.data?.canSend) {
          return Response.json({ success: true, skipped: true, reason: canSendResult.data?.reason || 'Rate limited' });
        }

        // Build display values
        const firstName = (posterName || 'there').split(' ')[0];
        const answererFirstName = (answererName || 'Someone').split(' ')[0];

        const answererRole = answererPersona === 'parent' ? 'UF Parent'
            : answererPersona === 'alumni' ? 'UF Alumni'
            : 'UF Student';

        const questionPreview = truncate(questionTitle, 120);
        const displayAnswer = truncate(answerPreview, 150);

        const answerUrl = `${APP_BASE_URL}/#QuestionDetail?id=${questionId}&type=${questionType || 'help'}&utm_source=answer_notification`;
        const thankUrl = `${APP_BASE_URL}/#QuestionDetail?id=${questionId}&type=${questionType || 'help'}&thank=${answerId || ''}&utm_source=answer_notification`;

        const subject = `${answererName} answered your question!`;

        const emailHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<span style="display:none;font-size:1px;color:#fff;max-height:0;overflow:hidden;">${answererName} (${answererRole}) just responded to your question.</span>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); padding: 28px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="${LOGO_URL}" alt="College Fast Forward" style="height: 60px; margin-bottom: 8px;" />
    </div>
    <div style="background: #fff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
      <p style="font-size: 18px; color: #111827; margin: 0 0 16px 0;">Hi ${firstName},</p>
      <p style="font-size: 16px;">${answererName} (${answererRole}) just responded to your question:</p>

      <div style="border-top: 2px solid #e5e7eb; border-bottom: 2px solid #e5e7eb; padding: 20px 0; margin: 20px 0;">
        <p style="font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 6px 0;">Your question:</p>
        <p style="color: #374151; font-style: italic; margin: 0 0 20px 0; font-size: 15px;">"${questionPreview}"</p>

        <p style="font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 6px 0;">Their answer:</p>
        <p style="color: #374151; font-style: italic; margin: 0; font-size: 15px;">"${displayAnswer}"</p>
      </div>

      <div style="text-align: center; margin: 0 0 28px 0;">
        <a href="${answerUrl}" style="display: inline-block; background: linear-gradient(135deg, #FA4616, #FF6B3D); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">Read Full Answer →</a>
      </div>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0 0 20px 0;" />

      <p style="font-size: 15px; color: #374151; margin: 0 0 16px 0;">Was this helpful? Let them know — it encourages them to help more students.</p>

      <div style="text-align: center; margin: 0 0 24px 0;">
        <a href="${thankUrl}" style="display: inline-block; background: #0021A5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">👍 Thank ${answererFirstName} →</a>
      </div>

      <p style="font-size: 14px; color: #6b7280;">— The CFF Team</p>
    </div>
    <div style="background: #f9fafb; padding: 20px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">College Fast Forward</p>
      <p style="font-size: 11px; color: #9ca3af; margin: 4px 0 0 0;">8731 Lewis River Road, Delray Beach, FL 33446</p>
      <p style="font-size: 11px; color: #9ca3af; margin: 8px 0 0 0;"><a href="${APP_BASE_URL}/#ProfileEdit" style="color: #9ca3af;">Unsubscribe</a> · <a href="${APP_BASE_URL}/#ProfileEdit" style="color: #9ca3af;">Email Preferences</a></p>
    </div>
  </div>
</body>
</html>`;

        await base44.asServiceRole.integrations.Core.SendEmail({
            to: posterEmail,
            subject,
            body: emailHtml,
            from_name: 'College Fast Forward'
        });

        // Log the email
        try {
            await base44.asServiceRole.entities.EmailLog.create({
                user_email: posterEmail,
                email_type: 'new_answer',
                subject,
                status: 'sent',
                sent_at: new Date().toISOString(),
                metadata: { questionId, answererName, answerId }
            });
        } catch (logErr) { console.log('Email log failed:', logErr.message); }

        return Response.json({ success: true, emailSent: true, questionId });

    } catch (error) {
        console.error('Answer notification error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});