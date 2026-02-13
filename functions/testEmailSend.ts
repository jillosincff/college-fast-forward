import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Backend function to send test emails for any of the 9 email types.
// Bypasses time checks and rate limits, uses real data, but overrides recipient.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const { emailType, testEmail, testPersona = 'parent' } = await req.json();

    if (!emailType || !testEmail) {
      return Response.json({ error: 'emailType and testEmail required' }, { status: 400 });
    }

    // Find a real user of the specified persona to use as test data source
    const allUsers = await base44.asServiceRole.entities.User.filter({});
    const testUser = allUsers.find(u => u.persona === testPersona && u.onboarding_completed !== false) || allUsers[0];

    if (!testUser) {
      return Response.json({ error: `No ${testPersona} user found to use as test data` }, { status: 400 });
    }

    const firstName = (testUser.full_name || 'Test User').split(' ')[0];

    // Fetch common data needed by many templates
    const [helpReqs, jobReqs] = await Promise.all([
      base44.asServiceRole.entities.HelpRequest.filter({ status: 'active' }, '-created_date', 20),
      base44.asServiceRole.entities.JobRequest.filter({ status: 'active' }, '-created_date', 20),
    ]);
    const allQuestions = [...helpReqs, ...jobReqs];
    const unanswered = allQuestions.filter(q => (q.answer_count || 0) === 0);
    const memberCount = allUsers.length;
    const parentCount = allUsers.filter(u => u.persona === 'parent').length;

    // Get user industries for matching
    let userIndustries = [];
    try {
      const exp = await base44.asServiceRole.entities.ParentExpertise.filter({ user_email: testUser.email }, undefined, 1);
      if (exp[0]?.industries) userIndustries = exp[0].industries;
    } catch (e) {}

    let result;

    switch (emailType) {
      case 'welcome': {
        result = await base44.functions.invoke('sendWelcomeEmail', {
          userId: testUser.id,
          userEmail: testEmail,
          userName: testUser.full_name,
          persona: testPersona,
          userIndustries,
          isAlumniJobSeeker: testPersona === 'alumni'
        });
        break;
      }

      case 'answer_notification': {
        // Find a real answer to use as test data
        const answers = await base44.asServiceRole.entities.Answer.filter({}, '-created_date', 5);
        const answer = answers[0];
        if (!answer) return Response.json({ error: 'No answers in database to use as test data' }, { status: 400 });
        
        const question = allQuestions.find(q => q.id === answer.question_id) || allQuestions[0];
        
        result = await base44.functions.invoke('sendAnswerNotification', {
          questionId: question?.id || 'test',
          questionType: question?.role ? 'job' : 'help',
          questionTitle: question?.description?.substring(0, 120) || question?.role || 'Test question',
          posterEmail: testEmail,
          posterName: testUser.full_name || 'Test Student',
          answererName: answer.answerer_name || 'Test Answerer',
          answererEmail: answer.answerer_email || 'test@test.com',
          answererTitle: answer.answerer_title || 'Software Engineer',
          answererCompany: answer.answerer_company || 'Tech Co',
          answererPersona: answer.answerer_persona || 'parent',
          answerId: answer.id,
          answerPreview: answer.answer_text?.substring(0, 150) || 'This is a test answer preview.'
        });
        break;
      }

      case 'nudge_24h':
      case 'nudge_48h': {
        // Call sendNudgeEmail but we can't easily bypass its internal logic.
        // Instead, build and send the email directly using the branding.
        const matchedQ = unanswered[0] || allQuestions[0];
        const isNudge24 = emailType === 'nudge_24h';
        
        // Create a simulated activation prompt
        const fakePromptData = {
          user_id: testUser.id,
          user_type: testPersona,
          user_email: testEmail,
          action_taken: false,
          status: 'pending',
          created_date: new Date(Date.now() - (isNudge24 ? 25 : 50) * 60 * 60 * 1000).toISOString()
        };

        // For test, directly invoke the nudge function won't work easily.
        // Send a simple notification instead using the real template approach.
        const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";
        const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg";
        
        const studentName = matchedQ ? (matchedQ.poster_name || matchedQ.student_name || 'A UF Student').split(' ')[0] : 'A UF Student';
        const industry = matchedQ?.industry || matchedQ?.target_industry || 'your field';
        const questionPreview = (matchedQ?.description || 'is looking for career advice').substring(0, 120);
        const qUrl = matchedQ ? `${APP_BASE_URL}/#QuestionDetail?id=${matchedQ.id}&type=${matchedQ.role ? 'job' : 'help'}&utm_source=test` : `${APP_BASE_URL}/#Connections`;

        const subject = isNudge24
          ? (testPersona === 'parent' ? `A UF student could use your ${industry} expertise` : `While you wait — here's how to get answers faster`)
          : (testPersona === 'parent' ? `${unanswered.length || 'Several'} UF students are still waiting for help` : `Get your parents involved — it makes a real difference`);

        const body = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); padding: 28px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="${LOGO_URL}" alt="CFF" style="height: 60px;" />
    </div>
    <div style="background: #fff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
      <p style="font-size: 18px; color: #111827;">Hi ${firstName},</p>
      <p style="font-size: 16px;">[TEST] This is a test ${emailType} email for persona: ${testPersona}</p>
      <div style="border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 20px 0; background: #fafafa;">
        <strong>${studentName}</strong>
        <p style="font-style: italic;">"${questionPreview}"</p>
        <div style="text-align: center; margin-top: 12px;">
          <a href="${qUrl}" style="display: inline-block; background: #FA4616; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 700;">Help ${studentName} →</a>
        </div>
      </div>
      <p style="font-size: 14px; color: #6b7280;">— The CFF Team</p>
    </div>
    <div style="background: #f9fafb; padding: 20px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
      <p style="font-size: 12px; color: #9ca3af;">College Fast Forward · 8731 Lewis River Road, Delray Beach, FL 33446</p>
      <p style="font-size: 11px; color: #9ca3af;"><a href="${APP_BASE_URL}/#ProfileEdit" style="color: #9ca3af;">Unsubscribe</a></p>
    </div>
  </div>
</body></html>`;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: testEmail, subject, body, from_name: 'College Fast Forward'
        });
        result = { data: { success: true } };
        break;
      }

      case 'thank_you': {
        const answers = await base44.asServiceRole.entities.Answer.filter({}, '-created_date', 5);
        const answer = answers[0];
        const question = answer ? allQuestions.find(q => q.id === answer.question_id) : allQuestions[0];

        result = await base44.functions.invoke('sendThankYouEmail', {
          helperEmail: testEmail,
          helperName: testUser.full_name || 'Test Helper',
          studentName: 'Test Student',
          questionTitle: question?.description?.substring(0, 100) || 'Test question about career advice',
          thankYouMessage: 'This was really helpful, thank you!'
        });
        break;
      }

      case 'daily_digest': {
        // Invoke the real function - it will use real data but we can't override recipient easily.
        // Send a direct test email instead.
        const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";
        const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg";
        
        const matched = unanswered.slice(0, 3);
        const questionCards = matched.map((q, i) => {
          const desc = (q.description || '').substring(0, 100);
          const url = `${APP_BASE_URL}/#QuestionDetail?id=${q.id}&type=${q.role ? 'job' : 'help'}&utm_source=test_digest`;
          return `<tr><td style="padding: 14px 0; ${i < matched.length - 1 ? 'border-bottom: 1px solid #f3f4f6;' : ''}">
            <span style="display: inline-block; width: 28px; height: 28px; border-radius: 50%; background: #0021A5; color: white; text-align: center; line-height: 28px; font-weight: 700; font-size: 14px; margin-right: 12px;">${i + 1}</span>
            <span style="font-style: italic;">"${desc}"</span>
            <br/><a href="${url}" style="color: #FA4616; font-weight: 600; font-size: 14px; margin-top: 8px; display: inline-block;">Answer →</a>
          </td></tr>`;
        }).join('');

        const subject = `${matched.length} new UF student question${matched.length > 1 ? 's' : ''} match your background`;
        const body = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); padding: 28px; text-align: center; border-radius: 12px 12px 0 0;"><img src="${LOGO_URL}" alt="CFF" style="height: 60px;" /></div>
    <div style="background: #fff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
      <p style="font-size: 18px; color: #111827;">Hi ${firstName},</p>
      <p>[TEST] Daily Match Digest — <strong>${matched.length}</strong> question${matched.length > 1 ? 's' : ''} match your expertise:</p>
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 20px 0;">${questionCards}</table>
      <div style="text-align: center;"><a href="${APP_BASE_URL}/#Connections?utm_source=test_digest" style="display: inline-block; background: #FA4616; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700;">See All Questions →</a></div>
      <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">— The CFF Team</p>
    </div>
    <div style="background: #f9fafb; padding: 20px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
      <p style="font-size: 12px; color: #9ca3af;">College Fast Forward · 8731 Lewis River Road, Delray Beach, FL 33446</p>
    </div>
  </div>
</body></html>`;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: testEmail, subject, body, from_name: 'College Fast Forward'
        });
        result = { data: { success: true } };
        break;
      }

      case 'parent_joined': {
        const parent = allUsers.find(u => u.persona === 'parent') || testUser;
        result = await base44.functions.invoke('sendParentJoinedEmail', {
          studentEmail: testEmail,
          studentName: testUser.full_name || 'Test Student',
          parentName: parent.full_name || 'Jane Smith',
          parentEmail: parent.email
        });
        break;
      }

      case 'weekly_digest': {
        // Build and send directly
        const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";
        const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg";
        
        const weeklyKarma = 25;
        const studentsHelped = 3;
        const newQuestions = allQuestions.filter(q => {
          const d = new Date(q.created_date);
          return d >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        }).length;

        const subject = `Your UF week: ${weeklyKarma} Karma · ${studentsHelped} students helped`;
        const body = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); padding: 28px; text-align: center; border-radius: 12px 12px 0 0;"><img src="${LOGO_URL}" alt="CFF" style="height: 60px;" /></div>
    <div style="background: #fff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
      <p style="font-size: 18px; color: #111827;">Hi ${firstName},</p>
      <p>[TEST] Your weekly CFF recap:</p>
      <div style="background: #f9fafb; border-radius: 10px; padding: 16px 20px; margin: 16px 0 24px 0;">
        <p>⭐ Karma earned: <strong>${weeklyKarma}</strong></p>
        <p>👥 Students helped: <strong>${studentsHelped}</strong></p>
        <p>📬 New questions: <strong>${newQuestions}</strong></p>
      </div>
      <div style="text-align: center;"><a href="${APP_BASE_URL}/#Connections?utm_source=test_weekly" style="display: inline-block; background: #FA4616; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700;">See This Week's Questions →</a></div>
      <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">— The CFF Team</p>
    </div>
    <div style="background: #f9fafb; padding: 20px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
      <p style="font-size: 12px; color: #9ca3af;">College Fast Forward · 8731 Lewis River Road, Delray Beach, FL 33446</p>
    </div>
  </div>
</body></html>`;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: testEmail, subject, body, from_name: 'College Fast Forward'
        });
        result = { data: { success: true } };
        break;
      }

      case 'reengagement_7d':
      case 'reengagement_21d':
      case 'reengagement_45d': {
        const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";
        const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg";
        
        const dayVariant = emailType.replace('reengagement_', '');
        const matchedQ = unanswered[0] || allQuestions[0];
        const qPreview = (matchedQ?.description || 'Looking for career advice in technology').substring(0, 120);
        const qUrl = matchedQ ? `${APP_BASE_URL}/#QuestionDetail?id=${matchedQ.id}&type=${matchedQ.role ? 'job' : 'help'}&utm_source=test_reengagement` : `${APP_BASE_URL}/#Connections`;

        let subject, bodyContent;

        if (dayVariant === '7d') {
          subject = `A UF student needs someone in ${matchedQ?.industry || matchedQ?.target_industry || 'your field'}`;
          bodyContent = `<p>It's been a few days — meanwhile, a student posted a question right in your area:</p>
            <div style="border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 20px 0; background: #fafafa;">
              <strong>${(matchedQ?.poster_name || 'A UF Student').split(' ')[0]}</strong>
              <p style="font-style: italic; margin: 8px 0;">"${qPreview}"</p>
              <div style="text-align: center;"><a href="${qUrl}" style="display: inline-block; background: #FA4616; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 700;">Help This Student →</a></div>
            </div>`;
        } else if (dayVariant === '21d') {
          const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
          const newMembers = allUsers.filter(u => u.created_date >= thisMonthStart).length;
          subject = `${unanswered.length} UF students are looking for someone with your background`;
          bodyContent = `<p>The UF network has been growing — <strong>${newMembers}</strong> new members joined this month.</p>
            <p>Right now, <strong>${unanswered.length}</strong> students have questions that match your expertise:</p>
            <div style="border-top: 2px solid #e5e7eb; border-bottom: 2px solid #e5e7eb; padding: 8px 0; margin: 20px 0;">
              ${unanswered.slice(0, 3).map((q, i) => `<p>${i + 1}. <em>"${(q.description || '').substring(0, 80)}"</em></p>`).join('')}
            </div>
            <div style="text-align: center;"><a href="${APP_BASE_URL}/#Connections?utm_source=test_reengagement" style="display: inline-block; background: #FA4616; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700;">See All Questions →</a></div>`;
        } else {
          subject = `We miss you, ${firstName} — UF students still need help`;
          bodyContent = `<p>This is the last time I'll nudge you — I promise.</p>
            <p>Since you joined, the UF network has grown to <strong>${memberCount}</strong> members. Students are landing internships through warm introductions.</p>
            <p>If you have 5 minutes, even once a month, it makes a difference:</p>
            <div style="text-align: center; margin: 24px 0;"><a href="${APP_BASE_URL}/#ParentDashboard?utm_source=test_reengagement" style="display: inline-block; background: #FA4616; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700;">See What's New →</a></div>
            <p>If you'd rather not hear from us, no hard feelings:</p>
            <div style="text-align: center; margin: 16px 0;"><a href="${APP_BASE_URL}/#UnsubscribeReengagement?userId=test" style="display: inline-block; background: #f3f4f6; color: #6b7280; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; border: 1px solid #d1d5db;">Unsubscribe from nudges →</a></div>
            <p style="color: #6b7280;">— Jill</p>`;
        }

        const body = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); padding: 28px; text-align: center; border-radius: 12px 12px 0 0;"><img src="${LOGO_URL}" alt="CFF" style="height: 60px;" /></div>
    <div style="background: #fff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
      <p style="font-size: 18px; color: #111827;">Hi ${firstName},</p>
      <p style="font-size: 12px; color: #9ca3af;">[TEST — Re-engagement ${dayVariant}]</p>
      ${bodyContent}
    </div>
    <div style="background: #f9fafb; padding: 20px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
      <p style="font-size: 12px; color: #9ca3af;">College Fast Forward · 8731 Lewis River Road, Delray Beach, FL 33446</p>
    </div>
  </div>
</body></html>`;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: testEmail, subject, body, from_name: 'College Fast Forward'
        });
        result = { data: { success: true } };
        break;
      }

      default:
        return Response.json({ error: `Unknown emailType: ${emailType}` }, { status: 400 });
    }

    return Response.json({
      success: true,
      emailType,
      sentTo: testEmail,
      testPersona,
      testUserName: testUser.full_name
    });

  } catch (error) {
    console.error('Test email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});