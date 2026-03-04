import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";
const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { event, data } = await req.json();

    // Support both direct call and entity automation payload
    const interactionLog = data || {};
    const interactionId = interactionLog.id || event?.entity_id;

    // Only process completed interactions
    if (interactionLog.status !== 'completed') {
      console.log('Skipping — status is not completed:', interactionLog.status);
      return Response.json({ success: true, skipped: true, reason: 'Not completed' });
    }

    // If triggered by automation, fetch the full record if needed
    let log = interactionLog;
    if (!log.helper_email && interactionId) {
      const logs = await base44.asServiceRole.entities.InteractionLog.filter({ id: interactionId });
      if (logs?.length > 0) log = logs[0];
    }

    const reviewerEmail = log.helper_email;
    const reviewerName = log.helper_name || '';
    const studentId = log.student_id || '';
    const studentEmail = log.student_email || '';
    const studentName = log.student_name || '';
    const interactionLogId = log.id || interactionId;

    if (!reviewerEmail || !studentEmail || !interactionLogId) {
      console.log('Skipping — missing required fields', { reviewerEmail, studentEmail, interactionLogId });
      return Response.json({ success: true, skipped: true, reason: 'Missing fields' });
    }

    // DUPLICATE CHECK 1: Feedback already exists for this interaction
    const existingFeedback = await base44.asServiceRole.entities.InteractionFeedback.filter({
      interaction_log_id: interactionLogId
    });
    if (existingFeedback?.length > 0) {
      console.log('Skipping — feedback already exists for interaction', interactionLogId);
      return Response.json({ success: true, skipped: true, reason: 'Feedback already exists' });
    }

    // DUPLICATE CHECK 2: Feedback request email already sent for this interaction
    const existingEmails = await base44.asServiceRole.entities.EmailLog.filter({
      user_email: reviewerEmail
    });
    const alreadySent = existingEmails.some(e =>
      e.email_type === 'feedback_request' &&
      e.metadata?.interaction_log_id === interactionLogId
    );
    if (alreadySent) {
      console.log('Skipping — feedback request email already sent for interaction', interactionLogId);
      return Response.json({ success: true, skipped: true, reason: 'Email already sent' });
    }

    // EMAIL THROTTLE: Check 24-hour limit via emailHelpers
    const canSendResult = await base44.functions.invoke('emailHelpers', {
      action: 'canSendEmail',
      userEmail: reviewerEmail,
      emailType: 'feedback_request'
    });
    if (!canSendResult.data?.canSend) {
      console.log('Skipping — throttled:', canSendResult.data?.reason);
      return Response.json({ success: true, skipped: true, reason: canSendResult.data?.reason || 'Throttled' });
    }

    // Build email
    const reviewerFirstName = (reviewerName || 'there').split(',')[0].split(' ')[0];
    const studentFirstName = (studentName || 'the student').split(',')[0].split(' ')[0];
    const studentFullName = studentName || 'the student';

    const feedbackUrl = `${APP_BASE_URL}/#SubmitFeedback?interactionId=${interactionLogId}&studentId=${encodeURIComponent(studentId)}&studentEmail=${encodeURIComponent(studentEmail)}`;

    const subject = `How was your conversation with ${studentFirstName}?`;

    const emailHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<span style="display:none;font-size:1px;color:#fff;max-height:0;overflow:hidden;">Your feedback helps ${studentFirstName} grow and stand out.</span>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="${LOGO_URL}" alt="College Fast Forward" style="height: 60px; margin-bottom: 8px;" />
    </div>
    <div style="background: #fff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
      <p style="font-size: 18px; color: #111827; margin: 0 0 16px 0;">Hi ${reviewerFirstName},</p>
      <p style="font-size: 16px; margin: 0 0 16px 0;">Thanks for connecting with <strong>${studentFullName}</strong> on College Fast Forward! Your feedback helps students grow and stand out to future employers.</p>
      <p style="font-size: 16px; margin: 0 0 24px 0;">It takes less than 60 seconds:</p>
      <div style="text-align: center; margin: 0 0 28px 0;">
        <a href="${feedbackUrl}" style="display: inline-block; background: linear-gradient(135deg, #FA4616, #FF6B3D); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">Leave Feedback →</a>
      </div>
      <p style="font-size: 14px; color: #6b7280; margin: 0 0 16px 0;">Your review is anonymous to the student — they'll see the attributes you selected but not your name.</p>
      <p style="font-size: 14px; color: #6b7280; margin: 0;">Thank you for helping the next generation!</p>
      <p style="font-size: 14px; color: #6b7280; margin: 16px 0 0 0;">— The CFF Team</p>
    </div>
    <div style="background: #f9fafb; padding: 20px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">College Fast Forward</p>
      <p style="font-size: 11px; color: #9ca3af; margin: 4px 0 0 0;">8731 Lewis River Road, Delray Beach, FL 33446</p>
      <p style="font-size: 11px; color: #9ca3af; margin: 8px 0 0 0;"><a href="${APP_BASE_URL}/#ProfileEdit" style="color: #9ca3af;">Email Preferences</a></p>
    </div>
  </div>
</body>
</html>`;

    // Send the email
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: reviewerEmail,
      subject,
      body: emailHtml,
      from_name: 'College Fast Forward'
    });

    // Log it
    await base44.asServiceRole.entities.EmailLog.create({
      user_email: reviewerEmail,
      email_type: 'feedback_request',
      subject,
      status: 'sent',
      sent_at: new Date().toISOString(),
      metadata: {
        interaction_log_id: interactionLogId,
        student_id: studentId,
        student_email: studentEmail,
        student_name: studentName
      }
    });

    console.log('Feedback request email sent to', reviewerEmail, 'for interaction', interactionLogId);
    return Response.json({ success: true, emailSent: true, reviewerEmail, interactionLogId });

  } catch (error) {
    console.error('sendFeedbackRequest error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});