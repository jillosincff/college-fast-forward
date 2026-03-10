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
    const answererName = answer.answerer_name || 'A CFF member';
    const answerPreview = (answer.answer_text || '').substring(0, 200);

    if (!questionId) {
      return Response.json({ skipped: true, reason: 'No question_id on answer' });
    }

    // Fetch the original question
    let question = null;
    const questionType = answer.question_type || 'JobRequest';

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
    if (prefs?.[0]?.all_emails === false || prefs?.[0]?.answer_notifications === false) {
      return Response.json({ skipped: true, reason: 'Student unsubscribed from answer notifications' });
    }

    // Check anti-spam: don't send more than 3 answer notifications in 24h
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const recentEmails = await base44.asServiceRole.entities.EmailLog.filter({
      user_email: studentEmail,
      email_type: 'answer_notification'
    });
    const recentCount = (recentEmails || []).filter(e => e.sent_at && e.sent_at > oneDayAgo).length;
    if (recentCount >= 3) {
      return Response.json({ skipped: true, reason: 'Anti-spam: 3+ answer notifications in 24h' });
    }

    const questionTitle = question.title || question.role || question.description?.substring(0, 80) || 'your question';
    const questionUrl = `${APP_URL}/#QuestionDetail?id=${questionId}`;
    const subject = `${answererName} answered your question!`;

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #0021A5 0%, #001580 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Someone answered your question! 🎉</h1>
        </div>
        <div style="padding: 32px 24px;">
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">
            Great news — <strong>${answererName}</strong> just responded to your question:
          </p>
          <div style="background: #F8FAFC; border-left: 4px solid #0021A5; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #0021A5; font-weight: 600; margin: 0 0 8px 0;">${questionTitle}</p>
          </div>
          <div style="background: #FFF7ED; border-left: 4px solid #FA4616; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #1E293B; font-style: italic; margin: 0;">"${answerPreview}${answerPreview.length >= 200 ? '...' : ''}"</p>
            <p style="color: #64748B; font-size: 13px; margin: 8px 0 0 0;">— ${answererName}</p>
          </div>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${questionUrl}" style="display: inline-block; background: #0021A5; color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 16px;">
              Read the Full Answer →
            </a>
          </div>
          <p style="color: #64748B; font-size: 14px; text-align: center;">
            💡 Tip: Reply to say thank you — it earns you karma and encourages more parents to help!
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

    // Log to EmailLog
    await base44.asServiceRole.entities.EmailLog.create({
      user_email: studentEmail,
      email_type: 'answer_notification',
      subject,
      status: emailStatus,
      sent_at: new Date().toISOString(),
      metadata: { question_id: questionId, answerer_name: answererName, answer_id: answer.id }
    });

    // Log to ReengagementEmail
    await base44.asServiceRole.entities.ReengagementEmail.create({
      user_id: studentEmail,
      user_email: studentEmail,
      email_type: 'answer_notification',
      status: emailStatus,
      sent_at: new Date().toISOString(),
      question_ids: [questionId]
    });

    // --- PAY IT FORWARD: Check if this is the FIRST answer to the question ---
    const allAnswers = await base44.asServiceRole.entities.Answer.filter({ question_id: questionId });
    if ((allAnswers || []).length === 1) {
      // First answer! Find linked parents
      const families = await base44.asServiceRole.entities.Family.filter({ student_email: studentEmail });
      
      for (const family of (families || [])) {
        for (const parentId of (family.parent_ids || [])) {
          // Find parent user
          const parentUsers = await base44.asServiceRole.entities.User.filter({ id: parentId });
          const parent = parentUsers?.[0];
          if (!parent?.email) continue;

          // Check parent email prefs
          const parentPrefs = await base44.asServiceRole.entities.EmailPreference.filter({ user_email: parent.email });
          if (parentPrefs?.[0]?.all_emails === false) continue;

          // Check anti-spam
          const parentRecent = await base44.asServiceRole.entities.ReengagementEmail.filter({
            user_email: parent.email,
            email_type: 'pay_it_forward'
          });
          const recentPIF = (parentRecent || []).filter(e => e.sent_at && e.sent_at > oneDayAgo).length;
          if (recentPIF >= 1) continue;

          const studentName = question.poster_name || 'your student';
          const parentName = parent.full_name?.split(',')[0] || parent.full_name?.split(' ')[0] || 'there';
          const pifSubject = `Someone just helped ${studentName} — want to pay it forward?`;

          // Find an unanswered question matching parent expertise
          const parentIndustry = parent.industries?.[0] || parent.industry;
          let featuredQuestion = null;
          if (parentIndustry) {
            const unanswered = await base44.asServiceRole.entities.JobRequest.filter({
              status: 'active',
              target_industry: parentIndustry
            });
            featuredQuestion = (unanswered || []).find(q => (q.answer_count || 0) === 0 && q.poster_email !== studentEmail);
          }

          const featuredHtml = featuredQuestion ? `
            <div style="background: #FFF7ED; border: 2px solid #FA4616; padding: 16px; border-radius: 12px; margin: 20px 0;">
              <p style="color: #FA4616; font-weight: 700; margin: 0 0 8px 0;">🙋 A student who could use your help:</p>
              <p style="color: #1E293B; margin: 0;">${featuredQuestion.title || featuredQuestion.description?.substring(0, 120)}</p>
              <a href="${APP_URL}/#QuestionDetail?id=${featuredQuestion.id}" style="display: inline-block; margin-top: 12px; background: #FA4616; color: white; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-weight: 600;">Pay It Forward Now →</a>
            </div>
          ` : '';

          const pifHtml = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #0021A5 0%, #001580 100%); padding: 32px 24px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 22px;">❤️ Good news about ${studentName}!</h1>
              </div>
              <div style="padding: 32px 24px;">
                <p style="color: #334155; font-size: 16px; line-height: 1.6;">
                  Hi ${parentName},
                </p>
                <p style="color: #334155; font-size: 16px; line-height: 1.6;">
                  A CFF member just answered ${studentName}'s question about <strong>"${questionTitle}"</strong>. That's the CFF community working for your family.
                </p>
                <p style="color: #334155; font-size: 16px; line-height: 1.6;">
                  Want to keep the momentum going? Help another student today and earn karma that boosts ${studentName}'s visibility.
                </p>
                ${featuredHtml}
                <div style="text-align: center; margin: 24px 0;">
                  <a href="${APP_URL}/#Connections" style="display: inline-block; background: #0021A5; color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700;">See Students Who Need Help →</a>
                </div>
              </div>
              <div style="background: #F8FAFC; padding: 20px 24px; text-align: center; border-top: 1px solid #E2E8F0;">
                <p style="color: #94A3B8; font-size: 12px; margin: 0;">College Fast Forward — The Private Career Network for UF Families</p>
              </div>
            </div>
          `;

          const pifSgResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${SENDGRID_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              personalizations: [{ to: [{ email: parent.email }] }],
              from: { email: 'notifications@collegefastforward.com', name: 'College Fast Forward' },
              subject: pifSubject,
              content: [{ type: 'text/html', value: pifHtml }]
            })
          });

          await base44.asServiceRole.entities.ReengagementEmail.create({
            user_id: parentId,
            user_email: parent.email,
            email_type: 'pay_it_forward',
            status: pifSgResponse.ok ? 'sent' : 'failed',
            sent_at: new Date().toISOString(),
            question_ids: [questionId]
          });

          console.log(`Pay It Forward email ${pifSgResponse.ok ? 'sent' : 'failed'} to ${parent.email}`);
        }
      }
    }

    return Response.json({ success: true, emailStatus, studentEmail, answererName });
  } catch (error) {
    console.error('onAnswerCreated error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});