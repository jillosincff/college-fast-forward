import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const APP_URL = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";
  const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");

  try {
    const body = await req.json();
    const { event, data } = body;

    // Only process Answer creation events
    if (!event || event.type !== 'create' || !data) {
      return Response.json({ skipped: true, reason: 'Not a create event' });
    }

    const answer = data;
    const questionId = answer.question_id;
    if (!questionId) {
      return Response.json({ skipped: true, reason: 'No question_id on answer' });
    }

    // Check if this is the FIRST answer on this question
    const allAnswers = await base44.asServiceRole.entities.Answer.filter({ question_id: questionId });
    if ((allAnswers || []).length !== 1) {
      return Response.json({ skipped: true, reason: 'Not the first answer — already has ' + (allAnswers || []).length + ' answers' });
    }

    // Check if we already sent a first_match_notification for this question
    const existingNotif = await base44.asServiceRole.entities.ReengagementEmail.filter({
      email_type: 'first_match_notification'
    });
    const alreadySent = (existingNotif || []).some(e => 
      e.question_ids && e.question_ids.includes(questionId)
    );
    if (alreadySent) {
      return Response.json({ skipped: true, reason: 'First match notification already sent for this question' });
    }

    // Fetch the original question
    const questionType = answer.question_type || 'JobRequest';
    let question = null;
    if (questionType === 'JobRequest') {
      const questions = await base44.asServiceRole.entities.JobRequest.filter({ id: questionId });
      question = questions?.[0];
    } else {
      const questions = await base44.asServiceRole.entities.HelpRequest.filter({ id: questionId });
      question = questions?.[0];
    }

    if (!question) {
      return Response.json({ skipped: true, reason: 'Question not found' });
    }

    const studentEmail = question.poster_email || question.student_email || question.created_by;
    if (!studentEmail || studentEmail.includes('service+')) {
      return Response.json({ skipped: true, reason: 'No valid student email' });
    }

    // Check email preferences
    const prefs = await base44.asServiceRole.entities.EmailPreference.filter({ user_email: studentEmail });
    if (prefs?.[0]?.all_emails === false) {
      return Response.json({ skipped: true, reason: 'Student unsubscribed' });
    }

    const questionTitle = question.title || question.role || question.description?.substring(0, 80) || 'your question';
    const questionUrl = `${APP_URL}/#QuestionDetail?id=${questionId}`;
    const subject = `🎉 You've been matched! A UF parent is ready to help`;

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #0021A5 0%, #001580 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🎉 You've Been Matched!</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 16px;">A UF parent is ready to help you</p>
        </div>
        <div style="padding: 32px 24px;">
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">
            Great news — your question about <strong>"${questionTitle}"</strong> has been seen by parents in our network who want to help. Someone has already responded!
          </p>
          
          <div style="background: #F0FDF4; border-left: 4px solid #16A34A; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #16A34A; font-weight: 600; margin: 0 0 8px 0;">What happens next?</p>
            <ul style="color: #334155; margin: 0; padding-left: 20px; line-height: 2;">
              <li>Log in to read the full answer</li>
              <li>Say thank you — it earns you karma!</li>
              <li>Keep the conversation going to build your network</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${questionUrl}" style="display: inline-block; background: #0021A5; color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 16px;">
              See My Matches →
            </a>
          </div>
          
          <p style="color: #64748B; font-size: 14px; text-align: center;">
            The CFF community is working for you. More parents may respond — check back often!
          </p>
        </div>
        <div style="background: #F8FAFC; padding: 20px 24px; text-align: center; border-top: 1px solid #E2E8F0;">
          <p style="color: #94A3B8; font-size: 12px; margin: 0;">College Fast Forward — The Private Career Network for UF Families</p>
        </div>
      </div>
    `;

    // Send email via SendGrid
    const sgResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: studentEmail }] }],
        from: { email: 'notifications@collegefastforward.com', name: 'College Fast Forward' },
        subject,
        content: [{ type: 'text/html', value: htmlBody }]
      })
    });

    const emailStatus = sgResponse.ok ? 'sent' : 'failed';

    // Log to ReengagementEmail
    await base44.asServiceRole.entities.ReengagementEmail.create({
      user_id: studentEmail,
      user_email: studentEmail,
      email_type: 'first_match_notification',
      status: emailStatus,
      sent_at: new Date().toISOString(),
      question_ids: [questionId]
    });

    // Log to EmailLog
    await base44.asServiceRole.entities.EmailLog.create({
      user_email: studentEmail,
      email_type: 'first_match_notification',
      subject,
      status: emailStatus,
      sent_at: new Date().toISOString(),
      metadata: { question_id: questionId }
    });

    console.log(`First match notification ${emailStatus} to ${studentEmail} for question ${questionId}`);
    return Response.json({ success: true, emailStatus, studentEmail });
  } catch (error) {
    console.error('sendFirstMatchNotification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});