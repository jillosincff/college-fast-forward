import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";
const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg";

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.substring(0, max) + '...' : str;
}

function parseFirstName(name) {
  return (name || 'there').split(' ')[0];
}

// ── Check if user has taken a qualifying action since signup ──
async function hasQualifyingAction(base44, prompt) {
  const userType = prompt.user_type;
  const userId = prompt.user_id;
  const userEmail = prompt.user_email;
  const signupDate = prompt.created_date;

  if (userType === 'parent' || (userType === 'alumni' && !prompt.source?.includes('job_seeker'))) {
    // Parent/Alumni helper: answered a question
    const answers = await base44.asServiceRole.entities.Answer.filter({ answerer_email: userEmail }, '-created_date', 1);
    if (answers.length > 0 && answers[0].created_date > signupDate) return true;
    const jobAnswers = await base44.asServiceRole.entities.JobAnswer.filter({ responder_email: userEmail }, '-created_date', 1);
    if (jobAnswers.length > 0 && jobAnswers[0].created_date > signupDate) return true;
    return false;
  }

  if (userType === 'student') {
    // Student: posted a second question, answered a peer, or invited parents
    const [helpReqs, jobReqs] = await Promise.all([
      base44.asServiceRole.entities.HelpRequest.filter({ student_email: userEmail }, '-created_date', 3),
      base44.asServiceRole.entities.JobRequest.filter({ created_by: userEmail }, '-created_date', 3)
    ]);
    if ((helpReqs.length + jobReqs.length) >= 2) return true;
    const answers = await base44.asServiceRole.entities.Answer.filter({ answerer_email: userEmail }, '-created_date', 1);
    if (answers.length > 0 && answers[0].created_date > signupDate) return true;
    // Check parent invites (Referral or Family link)
    const families = await base44.asServiceRole.entities.Family.filter({ student_ids: userId }, '-created_date', 1);
    if (families.length > 0 && families[0].parent_ids?.length > 0) return true;
    return false;
  }

  // Alumni job seeker: posted a follow-up question or browsed directory (can't track browse, so just check questions)
  if (userType === 'alumni') {
    const [helpReqs, jobReqs] = await Promise.all([
      base44.asServiceRole.entities.HelpRequest.filter({ student_email: userEmail }, '-created_date', 3),
      base44.asServiceRole.entities.JobRequest.filter({ created_by: userEmail }, '-created_date', 3)
    ]);
    if ((helpReqs.length + jobReqs.length) >= 2) return true;
    return false;
  }

  return false;
}

// ── Find a matched unanswered question for parent nudge ──
function findMatchedQuestion(questions, userIndustries) {
  const industries = (userIndustries || []).map(i => i.toLowerCase());
  if (industries.length > 0) {
    const match = questions.find(q => {
      const qi = (q.industry || q.target_industry || '').toLowerCase();
      return industries.some(i => qi.includes(i) || i.includes(qi));
    });
    if (match) return match;
  }
  // Fallback: first unanswered question
  return questions[0] || null;
}

// ═══════════════════════════════════════════════════════
// 3A — PARENT 24h NUDGE
// ═══════════════════════════════════════════════════════
function buildParentNudge24h({ firstName, matchedQuestion, activeParentCount }) {
  const studentName = matchedQuestion
    ? parseFirstName(matchedQuestion.student_name || matchedQuestion.poster_name)
    : 'A UF student';
  const major = matchedQuestion?.student_major || '';
  const classYear = matchedQuestion?.student_year || '';
  const questionPreview = truncate(matchedQuestion?.description || 'is looking for career advice', 120);
  const industry = matchedQuestion?.industry || matchedQuestion?.target_industry || 'your field';
  const answerUrl = matchedQuestion
    ? `${APP_BASE_URL}/#QuestionDetail?id=${matchedQuestion.id}&type=${matchedQuestion.role ? 'job' : 'help'}&utm_source=nudge_24h`
    : `${APP_BASE_URL}/#Connections?utm_source=nudge_24h`;
  const studentFirstName = studentName;

  const subject = `A UF student could use your ${industry} expertise`;

  const emailHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<span style="display:none;font-size:1px;color:#fff;max-height:0;overflow:hidden;">A student posted a question right in your wheelhouse.</span>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); padding: 28px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="${LOGO_URL}" alt="College Fast Forward" style="height: 60px; margin-bottom: 8px;" />
    </div>
    <div style="background: #fff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
      <p style="font-size: 18px; color: #111827; margin: 0 0 16px 0;">Hi ${firstName},</p>
      <p style="font-size: 16px;">A quick one — this student posted a question that's right in your wheelhouse:</p>

      <div style="border-top: 2px solid #e5e7eb; border-bottom: 2px solid #e5e7eb; padding: 20px 0; margin: 20px 0;">
        <div style="margin-bottom: 8px;">
          <strong style="color: #111827; font-size: 15px;">${studentName}</strong>
          ${major ? `<span style="color: #6b7280; font-size: 13px;"> · ${major}</span>` : ''}
          ${classYear ? `<span style="color: #6b7280; font-size: 13px;"> · ${classYear}</span>` : ''}
        </div>
        <p style="color: #374151; font-style: italic; margin: 0 0 12px 0; font-size: 15px;">"${questionPreview}"</p>
        <p style="color: #9ca3af; font-size: 13px; margin: 0 0 16px 0;">⏰ Still unanswered</p>
        <div style="text-align: center;">
          <a href="${answerUrl}" style="display: inline-block; background: linear-gradient(135deg, #FA4616, #FF6B3D); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">Help ${studentFirstName} →</a>
        </div>
      </div>

      <p style="font-size: 16px;">2-3 minutes of your time. That's all it takes.</p>
      <p style="font-size: 14px; color: #6b7280;">— Jill, CFF Founder</p>
      <p style="font-size: 13px; color: #9ca3af; margin: 16px 0 0 0;">P.S. ${activeParentCount} other UF parents are already answering questions in the network.</p>
    </div>
    <div style="background: #f9fafb; padding: 20px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">College Fast Forward</p>
      <p style="font-size: 11px; color: #9ca3af; margin: 4px 0 0 0;">8731 Lewis River Road, Delray Beach, FL 33446</p>
      <p style="font-size: 11px; color: #9ca3af; margin: 8px 0 0 0;"><a href="${APP_BASE_URL}/#ProfileEdit" style="color: #9ca3af;">Unsubscribe</a> · <a href="${APP_BASE_URL}/#ProfileEdit" style="color: #9ca3af;">Email Preferences</a></p>
    </div>
  </div>
</body>
</html>`;

  return { subject, emailHtml };
}

// ═══════════════════════════════════════════════════════
// 3B — STUDENT 24h NUDGE
// ═══════════════════════════════════════════════════════
function buildStudentNudge24h({ firstName, memberCount }) {
  const subject = `${memberCount}+ UF parents and alumni are ready to help you`;

  const emailHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<span style="display:none;font-size:1px;color:#fff;max-height:0;overflow:hidden;">UF parents and alumni are standing by — what do you need help with?</span>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); padding: 28px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="${LOGO_URL}" alt="College Fast Forward" style="height: 60px; margin-bottom: 8px;" />
    </div>
    <div style="background: #fff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
      <p style="font-size: 18px; color: #111827; margin: 0 0 16px 0;">Hi ${firstName},</p>
      <p style="font-size: 16px;">You joined CFF yesterday — here are 3 ways to get the most out of the UF network:</p>

      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 16px 20px; margin: 20px 0 12px 0;">
        <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>1. 👨‍👩‍👧 Invite your parents</strong> — their Karma boosts YOUR questions</p>
        <a href="${APP_BASE_URL}/#GatorParentInvite?utm_source=nudge_24h" style="display: inline-block; background: #0021A5; color: white; padding: 8px 18px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Invite Parents →</a>
      </div>

      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px 20px; margin: 0 0 12px 0;">
        <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>2. 💬 Help a fellow Gator</strong> — answer a peer's question (+5 karma)</p>
        <a href="${APP_BASE_URL}/#Connections?utm_source=nudge_24h" style="display: inline-block; background: #166534; color: white; padding: 8px 18px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">See Questions →</a>
      </div>

      <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 10px; padding: 16px 20px; margin: 0 0 24px 0;">
        <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>3. 💰 Share salary or interview data</strong> — help everyone negotiate better</p>
        <a href="${APP_BASE_URL}/#Insights?utm_source=nudge_24h" style="display: inline-block; background: #92400e; color: white; padding: 8px 18px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Contribute Data →</a>
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

  return { subject, emailHtml };
}

// ═══════════════════════════════════════════════════════
// 3C — ALUMNI HELPER 24h NUDGE
// ═══════════════════════════════════════════════════════
function buildAlumniHelperNudge24h({ firstName, matchedQuestion, activeParentCount }) {
  const studentName = matchedQuestion
    ? parseFirstName(matchedQuestion.student_name || matchedQuestion.poster_name)
    : 'A UF student';
  const major = matchedQuestion?.student_major || '';
  const classYear = matchedQuestion?.student_year || '';
  const questionPreview = truncate(matchedQuestion?.description || 'is looking for career advice', 120);
  const industry = matchedQuestion?.industry || matchedQuestion?.target_industry || 'your field';
  const answerUrl = matchedQuestion
    ? `${APP_BASE_URL}/#QuestionDetail?id=${matchedQuestion.id}&type=${matchedQuestion.role ? 'job' : 'help'}&utm_source=nudge_24h`
    : `${APP_BASE_URL}/#Connections?utm_source=nudge_24h`;
  const studentFirstName = studentName;

  const subject = `A fellow Gator could use your ${industry} experience`;

  const emailHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<span style="display:none;font-size:1px;color:#fff;max-height:0;overflow:hidden;">A student posted a question that matches your background.</span>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); padding: 28px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="${LOGO_URL}" alt="College Fast Forward" style="height: 60px; margin-bottom: 8px;" />
    </div>
    <div style="background: #fff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
      <p style="font-size: 18px; color: #111827; margin: 0 0 16px 0;">Hi ${firstName},</p>
      <p style="font-size: 16px;">A quick one — this student posted a question that matches your background:</p>

      <div style="border-top: 2px solid #e5e7eb; border-bottom: 2px solid #e5e7eb; padding: 20px 0; margin: 20px 0;">
        <div style="margin-bottom: 8px;">
          <strong style="color: #111827; font-size: 15px;">${studentName}</strong>
          ${major ? `<span style="color: #6b7280; font-size: 13px;"> · ${major}</span>` : ''}
          ${classYear ? `<span style="color: #6b7280; font-size: 13px;"> · ${classYear}</span>` : ''}
        </div>
        <p style="color: #374151; font-style: italic; margin: 0 0 12px 0; font-size: 15px;">"${questionPreview}"</p>
        <p style="color: #9ca3af; font-size: 13px; margin: 0 0 16px 0;">⏰ Still unanswered</p>
        <div style="text-align: center;">
          <a href="${answerUrl}" style="display: inline-block; background: linear-gradient(135deg, #FA4616, #FF6B3D); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">Help ${studentFirstName} →</a>
        </div>
      </div>

      <p style="font-size: 16px;">2-3 minutes of your time. That's all it takes.</p>
      <p style="font-size: 14px; color: #6b7280;">— Jill, CFF Founder</p>
      <p style="font-size: 13px; color: #9ca3af; margin: 16px 0 0 0;">P.S. ${activeParentCount} UF parents and alumni are already helping in the network.</p>
    </div>
    <div style="background: #f9fafb; padding: 20px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">College Fast Forward</p>
      <p style="font-size: 11px; color: #9ca3af; margin: 4px 0 0 0;">8731 Lewis River Road, Delray Beach, FL 33446</p>
      <p style="font-size: 11px; color: #9ca3af; margin: 8px 0 0 0;"><a href="${APP_BASE_URL}/#ProfileEdit" style="color: #9ca3af;">Unsubscribe</a> · <a href="${APP_BASE_URL}/#ProfileEdit" style="color: #9ca3af;">Email Preferences</a></p>
    </div>
  </div>
</body>
</html>`;

  return { subject, emailHtml };
}

// ═══════════════════════════════════════════════════════
// 3D — ALUMNI JOB SEEKER 24h NUDGE
// ═══════════════════════════════════════════════════════
function buildAlumniSeekerNudge24h({ firstName, memberCount }) {
  const subject = `The UF network is working on your request, ${firstName}`;

  const emailHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<span style="display:none;font-size:1px;color:#fff;max-height:0;overflow:hidden;">While you wait, browse the directory or share your experience to earn karma.</span>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); padding: 28px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="${LOGO_URL}" alt="College Fast Forward" style="height: 60px; margin-bottom: 8px;" />
    </div>
    <div style="background: #fff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
      <p style="font-size: 18px; color: #111827; margin: 0 0 16px 0;">Hi ${firstName},</p>
      <p style="font-size: 16px;">Your request is live and ${memberCount}+ network members can see it. While you wait for responses, here are two things you can do:</p>

      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 16px 20px; margin: 20px 0 12px 0;">
        <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>🔍 Browse the UF Directory</strong> — find alumni and parents in your target industry and reach out directly</p>
        <a href="${APP_BASE_URL}/#GatorDirectory?utm_source=nudge_24h" style="display: inline-block; background: #0021A5; color: white; padding: 8px 18px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Browse Directory →</a>
      </div>

      <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 10px; padding: 16px 20px; margin: 0 0 24px 0;">
        <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>💰 Share your experience</strong> — salary data and interview insights help the whole community</p>
        <a href="${APP_BASE_URL}/#Insights?utm_source=nudge_24h" style="display: inline-block; background: #92400e; color: white; padding: 8px 18px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Contribute →</a>
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

  return { subject, emailHtml };
}

// ═══════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const { dryRun = false, limit = 50 } = await req.json().catch(() => ({}));

    const now = new Date();

    // Get activation prompts that need nudging (22-48h window for 24h nudge)
    const prompts = await base44.asServiceRole.entities.ActivationPrompt.filter({
      action_taken: false,
      status: 'pending'
    });

    // Get email preferences
    const prefs = await base44.asServiceRole.entities.EmailPreference.filter({});
    const prefsByUser = {};
    prefs.forEach(p => { prefsByUser[p.user_id] = p; });

    // Get active unanswered questions for content
    const [recentHelpReqs, recentJobReqs, allUsers] = await Promise.all([
      base44.asServiceRole.entities.HelpRequest.filter({ status: 'active' }, '-created_date', 20),
      base44.asServiceRole.entities.JobRequest.filter({ status: 'active' }, '-created_date', 20),
      base44.asServiceRole.entities.User.filter({})
    ]);

    const unansweredQuestions = [...recentHelpReqs, ...recentJobReqs].filter(q => (q.answer_count || 0) === 0);
    const memberCount = allUsers.length;
    const activeParentCount = allUsers.filter(u => u.persona === 'parent' || u.roles?.includes('parent')).length;

    // Fetch all email logs for rate limiting
    const allEmailLogs = await base44.asServiceRole.entities.EmailLog.filter({}, '-sent_at', 2000);
    const logsByEmail = {};
    allEmailLogs.forEach(l => {
      if (!logsByEmail[l.user_email]) logsByEmail[l.user_email] = [];
      logsByEmail[l.user_email].push(l);
    });

    const oneDayAgoStr = new Date(now - 24*60*60*1000).toISOString();
    const oneWeekAgoStr = new Date(now - 7*24*60*60*1000).toISOString();
    const NUDGE_REENGAGE_TYPES = ['nudge_24h','nudge_48h','reengagement_7d','reengagement_21d','reengagement_45d'];

    const results = { processed: 0, nudge24Sent: 0, nudge48Sent: 0, skipped: 0, rateLimited: 0, qualifiedSkipped: 0, errors: [] };

    for (const prompt of prompts.slice(0, limit)) {
      try {
        results.processed++;

        // Check email preferences
        const pref = prefsByUser[prompt.user_id];
        if (pref && (pref.all_emails === false || pref.nudge_emails === false)) {
          results.skipped++;
          continue;
        }

        // Anti-spam: max 1/day, max 3/week, max 3 nudge/reengage ever
        const userLogs = logsByEmail[prompt.user_email] || [];
        const todayCount = userLogs.filter(l => l.sent_at >= oneDayAgoStr).length;
        const weekCount = userLogs.filter(l => l.sent_at >= oneWeekAgoStr).length;
        const totalNudgeReengage = userLogs.filter(l => NUDGE_REENGAGE_TYPES.includes(l.email_type)).length;
        if (todayCount >= 1 || weekCount >= 3 || totalNudgeReengage >= 3) {
          results.rateLimited++;
          continue;
        }

        const createdAt = new Date(prompt.created_date);
        const hoursSinceSignup = (now - createdAt) / (1000 * 60 * 60);

        // 24h nudge: fires between 22-48h
        let nudgeType = null;
        if (hoursSinceSignup >= 22 && hoursSinceSignup < 48 && !prompt.nudge_24h_sent_at) {
          nudgeType = '24h';
        } else if (hoursSinceSignup >= 48 && hoursSinceSignup < 72 && !prompt.nudge_48h_sent_at) {
          nudgeType = '48h';
        } else {
          results.skipped++;
          continue;
        }

        // Check qualifying actions — skip nudge if user already activated
        const qualified = await hasQualifyingAction(base44, prompt);
        if (qualified) {
          // Mark prompt as acted upon
          if (!dryRun) {
            await base44.asServiceRole.entities.ActivationPrompt.update(prompt.id, {
              action_taken: true,
              status: 'acted',
              acted_at: now.toISOString()
            });
          }
          results.qualifiedSkipped++;
          continue;
        }

        // Resolve user's full name (try to find from User entity)
        let firstName = parseFirstName(prompt.user_email?.split('@')[0]);
        try {
          const users = await base44.asServiceRole.entities.User.filter({ email: prompt.user_email }, undefined, 1);
          if (users[0]?.full_name) firstName = parseFirstName(users[0].full_name);
        } catch (e) { /* fallback to email parse */ }

        // Determine persona & pick template
        const isParent = prompt.user_type === 'parent';
        const isAlumni = prompt.user_type === 'alumni';
        const isStudent = prompt.user_type === 'student';
        const isAlumniSeeker = isAlumni && (prompt.source || '').includes('job_seeker');

        // Find user industries for matching
        let userIndustries = [];
        try {
          const expertise = await base44.asServiceRole.entities.ParentExpertise.filter({ user_email: prompt.user_email }, undefined, 1);
          if (expertise[0]?.industries) userIndustries = expertise[0].industries;
        } catch (e) { /* no expertise data */ }

        const matchedQuestion = (isParent || (isAlumni && !isAlumniSeeker))
          ? findMatchedQuestion(unansweredQuestions, userIndustries)
          : null;

        let subject, emailHtml;

        if (isParent) {
          ({ subject, emailHtml } = buildParentNudge24h({ firstName, matchedQuestion, activeParentCount }));
        } else if (isAlumni && !isAlumniSeeker) {
          ({ subject, emailHtml } = buildAlumniHelperNudge24h({ firstName, matchedQuestion, activeParentCount }));
        } else if (isAlumniSeeker) {
          ({ subject, emailHtml } = buildAlumniSeekerNudge24h({ firstName, memberCount }));
        } else {
          ({ subject, emailHtml } = buildStudentNudge24h({ firstName, memberCount }));
        }

        if (!dryRun) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: prompt.user_email,
            subject,
            body: emailHtml,
            from_name: 'College Fast Forward'
          });

          // Update activation prompt
          const updateData = nudgeType === '24h'
            ? { nudge_24h_sent_at: now.toISOString(), prompt_stage: 'nudge_24h' }
            : { nudge_48h_sent_at: now.toISOString(), prompt_stage: 'nudge_48h' };
          await base44.asServiceRole.entities.ActivationPrompt.update(prompt.id, updateData);

          // Log
          await base44.asServiceRole.entities.EmailLog.create({
            user_id: prompt.user_id,
            user_email: prompt.user_email,
            email_type: nudgeType === '24h' ? 'nudge_24h' : 'nudge_48h',
            subject,
            status: 'sent',
            sent_at: now.toISOString(),
            metadata: { persona: prompt.user_type }
          });
        }

        if (nudgeType === '24h') results.nudge24Sent++;
        else results.nudge48Sent++;

      } catch (err) {
        results.errors.push({ userId: prompt.user_id, error: err.message });
      }
    }

    return Response.json({ success: true, dryRun, results });
  } catch (error) {
    console.error('Nudge email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});