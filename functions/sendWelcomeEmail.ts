import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";
const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg";

function parseFirstName(name) {
  return (name || 'there').split(' ')[0];
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return 'recently';
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
  return 'recently';
}

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.substring(0, max) + '...' : str;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userId, userEmail, userName, persona, userIndustries } = await req.json();

    if (!userEmail) {
      return Response.json({ error: 'userEmail required' }, { status: 400 });
    }

    const firstName = parseFirstName(userName);
    const isParent = persona === 'parent';
    const isAlumni = persona === 'alumni';
    const isGator = persona === 'gator' || persona === 'student';

    // Anti-spam: max 1 email/day, max 3/week
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const recentLogs = await base44.asServiceRole.entities.EmailLog.filter({ user_email: userEmail }, '-sent_at', 50);
    const todayCount = recentLogs.filter(l => l.sent_at >= oneDayAgo).length;
    const weekCount = recentLogs.filter(l => l.sent_at >= oneWeekAgo).length;
    if (todayCount >= 1 || weekCount >= 3) {
      return Response.json({ success: true, skipped: true, reason: `Rate limited (today: ${todayCount}, week: ${weekCount})` });
    }

    // ── Fetch live stats and matched question ──
    const [activeHelpReqs, activeJobReqs, allUsers] = await Promise.all([
      base44.asServiceRole.entities.HelpRequest.filter({ status: 'active' }, '-created_date', 100),
      base44.asServiceRole.entities.JobRequest.filter({ status: 'active' }, '-created_date', 100),
      base44.asServiceRole.entities.User.filter({})
    ]);

    const allActiveQuestions = [...activeHelpReqs, ...activeJobReqs];
    const unansweredQuestions = allActiveQuestions.filter(q => (q.answer_count || 0) === 0);
    const questionCount = unansweredQuestions.length || allActiveQuestions.length;
    const memberCount = allUsers.length;

    // Find a matched question for parent/alumni (by industry)
    let matchedQuestion = null;
    if (isParent || isAlumni) {
      const industries = userIndustries || [];
      if (industries.length > 0) {
        matchedQuestion = unansweredQuestions.find(q => {
          const qi = (q.industry || q.target_industry || '').toLowerCase();
          return industries.some(i => qi.includes(i.toLowerCase()) || i.toLowerCase().includes(qi));
        });
      }
      if (!matchedQuestion) matchedQuestion = unansweredQuestions[0];
      if (!matchedQuestion) matchedQuestion = allActiveQuestions[0];
    }

    let subject, emailHtml;

    // For students, fetch their most recent question
    let studentQuestion = null;
    if (isGator && userId) {
      try {
        const [helpReqs, jobReqs] = await Promise.all([
          base44.asServiceRole.entities.HelpRequest.filter({ student_id: userId }, '-created_date', 1),
          base44.asServiceRole.entities.JobRequest.filter({ created_by: userEmail }, '-created_date', 1)
        ]);
        const allStudentQs = [...helpReqs, ...jobReqs].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        studentQuestion = allStudentQs[0] || null;
      } catch (e) { console.log('Student question fetch failed:', e.message); }
    }

    if (isParent) {
      subject = `Welcome to the UF family, ${firstName}! 🎉`;
      emailHtml = buildParentWelcome({ firstName, questionCount, memberCount, matchedQuestion });
    } else if (isAlumni) {
      subject = `Welcome back to the UF family, ${firstName}! 🎉`;
      emailHtml = buildAlumniWelcome({ firstName, questionCount, memberCount, matchedQuestion });
    } else {
      subject = `You're in, ${firstName}! Here's what happens next 🚀`;
      emailHtml = buildStudentWelcome({ firstName, questionCount, memberCount, studentQuestion });
    }

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: userEmail,
      subject,
      body: emailHtml,
      from_name: 'College Fast Forward'
    });

    // Log email
    try {
      await base44.asServiceRole.entities.EmailLog.create({
        user_id: userId || '',
        user_email: userEmail,
        email_type: 'welcome',
        subject,
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

// ═══════════════════════════════════════════════════════
// 1A — PARENT WELCOME
// ═══════════════════════════════════════════════════════
function buildParentWelcome({ firstName, questionCount, memberCount, matchedQuestion }) {
  const studentName = matchedQuestion
    ? parseFirstName(matchedQuestion.student_name || matchedQuestion.poster_name)
    : 'A UF student';
  const major = matchedQuestion?.student_major || matchedQuestion?.major || '';
  const classYear = matchedQuestion?.student_year || '';
  const questionPreview = truncate(matchedQuestion?.description || 'is looking for career advice', 120);
  const timeAgo = formatTimeAgo(matchedQuestion?.created_date);
  const answerCount = matchedQuestion?.answer_count || 0;
  const answerUrl = matchedQuestion
    ? `${APP_BASE_URL}/#QuestionDetail?id=${matchedQuestion.id}&type=${matchedQuestion.role ? 'job' : 'help'}&utm_source=welcome`
    : `${APP_BASE_URL}/#Connections`;

  const questionCardHtml = matchedQuestion ? `
      <div style="border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 24px 0; background: #fafafa;">
        <div style="margin-bottom: 8px;">
          <strong style="color: #111827; font-size: 15px;">${studentName}</strong>
          ${major ? `<span style="color: #6b7280; font-size: 13px;"> · ${major}</span>` : ''}
          ${classYear ? `<span style="color: #6b7280; font-size: 13px;"> · ${classYear}</span>` : ''}
        </div>
        <p style="color: #374151; font-style: italic; margin: 0 0 12px 0; font-size: 15px;">"${questionPreview}"</p>
        <p style="color: #9ca3af; font-size: 13px; margin: 0 0 14px 0;">⏰ Posted ${timeAgo} · ${answerCount} answer${answerCount !== 1 ? 's' : ''}</p>
        <div style="text-align: center;">
          <a href="${answerUrl}" style="display: inline-block; background: #FA4616; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">Answer This Question →</a>
        </div>
      </div>` : '';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<span style="display:none;font-size:1px;color:#fff;max-height:0;overflow:hidden;">${questionCount} students are waiting for career advice from the UF network.</span>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); padding: 28px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="${LOGO_URL}" alt="College Fast Forward" style="height: 60px; margin-bottom: 8px;" />
    </div>
    <div style="background: #fff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
      <p style="font-size: 18px; color: #111827; margin: 0 0 16px 0;">Hi ${firstName},</p>
      <p style="font-size: 16px;">You're officially part of the University of Florida network on College Fast Forward.</p>

      <p style="font-size: 16px; font-weight: 600; color: #111827; margin: 24px 0 12px 0;">Here's what's happening right now:</p>
      <div style="background: #f8fafc; border-radius: 10px; padding: 16px 20px; margin: 0 0 24px 0;">
        <p style="margin: 0 0 6px 0; font-size: 15px;">📬 <strong>${questionCount}</strong> students are waiting for career advice</p>
        <p style="margin: 0 0 6px 0; font-size: 15px;">👥 <strong>${memberCount}</strong> parents and alumni are in the network</p>
        <p style="margin: 0; font-size: 15px;">⭐ Your Family Karma: <strong>0 points</strong></p>
      </div>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0 0 24px 0;" />

      <p style="font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 4px 0;">Your next step — help a student:</p>
      ${questionCardHtml}

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

      <p style="font-size: 16px;">It takes 2-3 minutes. Your answer could change a student's trajectory.</p>
      <p style="font-size: 14px; color: #6b7280;">— The CFF Team</p>
      <p style="font-size: 13px; color: #9ca3af; margin: 16px 0 0 0;">P.S. Every answer you give earns Karma that boosts your student's visibility in the network.</p>
    </div>
    <div style="background: #f9fafb; padding: 20px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">College Fast Forward</p>
      <p style="font-size: 11px; color: #9ca3af; margin: 4px 0 0 0;">8731 Lewis River Road, Delray Beach, FL 33446</p>
      <p style="font-size: 11px; color: #9ca3af; margin: 8px 0 0 0;"><a href="${APP_BASE_URL}/#ProfileEdit" style="color: #9ca3af;">Unsubscribe</a> · <a href="${APP_BASE_URL}/#ProfileEdit" style="color: #9ca3af;">Email Preferences</a></p>
    </div>
  </div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════
// 1B — ALUMNI WELCOME (similar to parent but different copy)
// ═══════════════════════════════════════════════════════
function buildAlumniWelcome({ firstName, questionCount, memberCount, matchedQuestion }) {
  const studentName = matchedQuestion
    ? parseFirstName(matchedQuestion.student_name || matchedQuestion.poster_name)
    : 'A UF student';
  const major = matchedQuestion?.student_major || matchedQuestion?.major || '';
  const classYear = matchedQuestion?.student_year || '';
  const questionPreview = truncate(matchedQuestion?.description || 'is looking for career advice', 120);
  const timeAgo = formatTimeAgo(matchedQuestion?.created_date);
  const answerCount = matchedQuestion?.answer_count || 0;
  const answerUrl = matchedQuestion
    ? `${APP_BASE_URL}/#QuestionDetail?id=${matchedQuestion.id}&type=${matchedQuestion.role ? 'job' : 'help'}&utm_source=welcome`
    : `${APP_BASE_URL}/#Connections`;

  const questionCardHtml = matchedQuestion ? `
      <div style="border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 24px 0; background: #fafafa;">
        <div style="margin-bottom: 8px;">
          <strong style="color: #111827; font-size: 15px;">${studentName}</strong>
          ${major ? `<span style="color: #6b7280; font-size: 13px;"> · ${major}</span>` : ''}
          ${classYear ? `<span style="color: #6b7280; font-size: 13px;"> · ${classYear}</span>` : ''}
        </div>
        <p style="color: #374151; font-style: italic; margin: 0 0 12px 0; font-size: 15px;">"${questionPreview}"</p>
        <p style="color: #9ca3af; font-size: 13px; margin: 0 0 14px 0;">⏰ Posted ${timeAgo} · ${answerCount} answer${answerCount !== 1 ? 's' : ''}</p>
        <div style="text-align: center;">
          <a href="${answerUrl}" style="display: inline-block; background: #FA4616; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">Answer This Question →</a>
        </div>
      </div>` : '';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<span style="display:none;font-size:1px;color:#fff;max-height:0;overflow:hidden;">Welcome back — ${questionCount} UF students could use your expertise.</span>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); padding: 28px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="${LOGO_URL}" alt="College Fast Forward" style="height: 60px; margin-bottom: 8px;" />
    </div>
    <div style="background: #fff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
      <p style="font-size: 18px; color: #111827; margin: 0 0 16px 0;">Hi ${firstName},</p>
      <p style="font-size: 16px;">Welcome back to the UF family! You've joined a growing network of UF alumni who are paying it forward by helping current students navigate their careers.</p>

      <div style="background: #f8fafc; border-radius: 10px; padding: 16px 20px; margin: 20px 0;">
        <p style="margin: 0 0 6px 0; font-size: 15px;">📬 <strong>${questionCount}</strong> students are waiting for career advice</p>
        <p style="margin: 0; font-size: 15px;">👥 <strong>${memberCount}</strong> members are in the UF network</p>
      </div>

      <p style="font-size: 16px; font-weight: 600; color: #111827;">Here's a student who could use your help:</p>
      ${questionCardHtml}

      <p style="font-size: 16px;">It takes 2-3 minutes. Your real-world experience is exactly what students need.</p>
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
}

// ═══════════════════════════════════════════════════════
// 1C — STUDENT WELCOME
// ═══════════════════════════════════════════════════════
function buildStudentWelcome({ firstName, questionCount, memberCount, studentQuestion }) {
  const questionPreview = truncate(studentQuestion?.description || studentQuestion?.role || 'Your question', 120);
  const hasQuestion = !!studentQuestion;

  const questionBlock = hasQuestion ? `
      <div style="border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 20px 0; background: #fafafa;">
        <p style="color: #374151; font-style: italic; margin: 0; font-size: 15px;">"${questionPreview}"</p>
      </div>

      <p style="font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 12px 0;">Here's what happens next:</p>
      <div style="margin: 0 0 24px 0;">
        <p style="margin: 0 0 8px 0; font-size: 15px;">✅ Parents and alumni with matching experience will be notified</p>
        <p style="margin: 0 0 8px 0; font-size: 15px;">✅ You'll get an email the moment someone responds</p>
        <p style="margin: 0; font-size: 15px;">✅ Average response time: under 24 hours</p>
      </div>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

      <p style="font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 16px 0;">While you wait, here are 3 things you can do:</p>` : `
      <p style="font-size: 16px;">You now have access to UF parents and alumni who are ready to help you with career advice, job leads, resume reviews, and more.</p>

      <div style="background: #f8fafc; border-radius: 10px; padding: 16px 20px; margin: 20px 0;">
        <p style="margin: 0 0 6px 0; font-size: 15px;">👥 <strong>${memberCount}</strong> parents and alumni are in the network</p>
        <p style="margin: 0; font-size: 15px;">💬 Most questions get a response within <strong>24 hours</strong></p>
      </div>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

      <p style="font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 16px 0;">Here are 3 things you can do right now:</p>`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<span style="display:none;font-size:1px;color:#fff;max-height:0;overflow:hidden;">${hasQuestion ? 'Parents and alumni are being notified about your question now.' : `${memberCount} UF parents and alumni are ready to help you.`}</span>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); padding: 28px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="${LOGO_URL}" alt="College Fast Forward" style="height: 60px; margin-bottom: 8px;" />
    </div>
    <div style="background: #fff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
      <p style="font-size: 18px; color: #111827; margin: 0 0 16px 0;">Hi ${firstName},</p>
      <p style="font-size: 16px;">Welcome to College Fast Forward at the University of Florida!</p>
      ${hasQuestion ? `<p style="font-size: 16px;">Your question is live and visible to the entire UF network:</p>` : ''}
      ${questionBlock}

      <!-- Action 1: Invite Parents -->
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 16px 20px; margin: 0 0 12px 0;">
        <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>1. 👨‍👩‍👧 Invite your parents</strong> — they earn Karma that boosts YOUR visibility</p>
        <a href="${APP_BASE_URL}/#GatorParentInvite?utm_source=welcome" style="display: inline-block; background: #0021A5; color: white; padding: 8px 18px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Invite Parents →</a>
      </div>

      <!-- Action 2: Help a student -->
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px 20px; margin: 0 0 12px 0;">
        <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>2. 💬 Help a fellow UF student</strong> — answer someone else's question (+5 karma)</p>
        <a href="${APP_BASE_URL}/#Connections?utm_source=welcome" style="display: inline-block; background: #166534; color: white; padding: 8px 18px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">See Student Questions →</a>
      </div>

      <!-- Action 3: Share salary data -->
      <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 10px; padding: 16px 20px; margin: 0 0 24px 0;">
        <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>3. 💰 Share salary data</strong> — help everyone negotiate better (+25 karma)</p>
        <a href="${APP_BASE_URL}/#Insights?utm_source=welcome" style="display: inline-block; background: #92400e; color: white; padding: 8px 18px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Share Anonymously →</a>
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
}