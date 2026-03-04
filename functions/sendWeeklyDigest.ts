import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";
const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg";

function parseFirstName(name) {
  return (name || 'there').split(' ')[0];
}

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.substring(0, max - 3) + '...' : str;
}

function getWeekKey() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

// ── 8A: PARENT / ALUMNI HELPER WEEKLY DIGEST ──
function buildParentWeeklyDigest({ firstName, weeklyKarma, weeklyStudentsHelped, leaderboardRank, percentile, newQuestionCount, newMemberCount, featuredQuestions }) {
  const hasActivity = weeklyKarma > 0;

  const activityBlock = hasActivity
    ? `<p style="font-size: 16px; color: #166534; font-weight: 600;">Nice work! You're in the top ${percentile}% of UF parents.</p>`
    : `<p style="font-size: 16px;">No activity this week — <strong>${newQuestionCount}</strong> new question${newQuestionCount !== 1 ? 's' : ''} are waiting for your expertise.</p>`;

  const featuredHtml = featuredQuestions.length > 0 ? featuredQuestions.map((q, i) => {
    const url = `${APP_BASE_URL}/#QuestionDetail?id=${q.id}&type=${q.type}&utm_source=weekly_digest`;
    return `<tr>
      <td style="padding: 12px 0; ${i < featuredQuestions.length - 1 ? 'border-bottom: 1px solid #f3f4f6;' : ''}">
        <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
          <td style="width: 28px; vertical-align: top; padding-right: 12px;">
            <span style="display: inline-block; width: 28px; height: 28px; border-radius: 50%; background: #0021A5; color: white; text-align: center; line-height: 28px; font-weight: 700; font-size: 14px;">${i + 1}</span>
          </td>
          <td>
            <p style="color: #374151; font-style: italic; margin: 0 0 8px 0; font-size: 15px;">"${q.preview}"</p>
            <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #FA4616, #FF6B3D); color: white; padding: 8px 18px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Answer →</a>
          </td>
        </tr></table>
      </td>
    </tr>`;
  }).join('') : '';

  const subject = `Your UF week: ${weeklyKarma} Karma · ${weeklyStudentsHelped} student${weeklyStudentsHelped !== 1 ? 's' : ''} helped`;

  const emailHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<span style="display:none;font-size:1px;color:#fff;max-height:0;overflow:hidden;">${weeklyKarma} Karma earned · #${leaderboardRank} on leaderboard · ${newQuestionCount} new questions this week.</span>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); padding: 28px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="${LOGO_URL}" alt="College Fast Forward" style="height: 60px; margin-bottom: 8px;" />
    </div>
    <div style="background: #fff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
      <p style="font-size: 18px; color: #111827; margin: 0 0 16px 0;">Hi ${firstName},</p>
      <p style="font-size: 16px;">Your weekly CFF recap:</p>

      <div style="background: #f9fafb; border-radius: 10px; padding: 16px 20px; margin: 16px 0 24px 0;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr><td style="padding: 6px 0; font-size: 15px;">⭐ Karma earned this week: <strong>${weeklyKarma}</strong></td></tr>
          <tr><td style="padding: 6px 0; font-size: 15px;">👥 Students helped: <strong>${weeklyStudentsHelped}</strong></td></tr>
          <tr><td style="padding: 6px 0; font-size: 15px;">📊 Leaderboard position: <strong>#${leaderboardRank}</strong></td></tr>
        </table>
      </div>

      ${activityBlock}

      <p style="font-size: 16px; font-weight: 600; color: #111827; margin: 24px 0 8px 0;">New this week:</p>
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr><td style="padding: 4px 0; font-size: 15px;">📬 <strong>${newQuestionCount}</strong> new student question${newQuestionCount !== 1 ? 's' : ''}</td></tr>
        <tr><td style="padding: 4px 0; font-size: 15px;">👥 <strong>${newMemberCount}</strong> new member${newMemberCount !== 1 ? 's' : ''} joined</td></tr>
      </table>

      ${featuredHtml ? `
      <div style="border-top: 2px solid #e5e7eb; border-bottom: 2px solid #e5e7eb; padding: 8px 0; margin: 20px 0;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          ${featuredHtml}
        </table>
      </div>` : ''}

      <div style="text-align: center; margin: 24px 0;">
        <a href="${APP_BASE_URL}/#Connections?utm_source=weekly_digest" style="display: inline-block; background: linear-gradient(135deg, #FA4616, #FF6B3D); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">See This Week's Questions →</a>
      </div>

      <p style="font-size: 14px; color: #6b7280; margin: 16px 0 0 0;">— The CFF Team</p>
    </div>
    <div style="background: #f9fafb; padding: 20px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">College Fast Forward</p>
      <p style="font-size: 11px; color: #9ca3af; margin: 4px 0 0 0;">8731 Lewis River Road, Delray Beach, FL 33446</p>
      <p style="font-size: 11px; color: #9ca3af; margin: 8px 0 0 0;"><a href="${APP_BASE_URL}/#ProfileEdit" style="color: #9ca3af;">Unsubscribe</a> · <a href="${APP_BASE_URL}/#ProfileEdit" style="color: #9ca3af;">Email Preferences</a></p>
    </div>
  </div>
</body></html>`;

  return { subject, emailHtml };
}

// ── 8B: STUDENT WEEKLY DIGEST ──
function buildStudentWeeklyDigest({ firstName, newResponses, weeklyKarma, trendingCompany, trendingCount, salaryInsight }) {
  const hasResponses = newResponses > 0;

  const responsesBlock = hasResponses
    ? `<p style="font-size: 16px;">Check out what parents and alumni shared:</p>
       <div style="text-align: center; margin: 16px 0;">
         <a href="${APP_BASE_URL}/#Dashboard?utm_source=weekly_digest" style="display: inline-block; background: linear-gradient(135deg, #FA4616, #FF6B3D); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px;">Read Your Responses →</a>
       </div>`
    : '';

  const trendingBlock = trendingCompany
    ? `<p style="font-size: 15px;">🔥 <strong>${trendingCompany}</strong> — ${trendingCount} student${trendingCount !== 1 ? 's' : ''} asking</p>`
    : '';

  const salaryBlock = salaryInsight
    ? `<p style="font-size: 15px;">💰 ${salaryInsight}</p>`
    : '';

  const subject = `Your CFF week: ${newResponses} new response${newResponses !== 1 ? 's' : ''} · ${weeklyKarma} Karma`;

  const emailHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<span style="display:none;font-size:1px;color:#fff;max-height:0;overflow:hidden;">${newResponses} new response${newResponses !== 1 ? 's' : ''} to your questions · ${weeklyKarma} Karma earned this week.</span>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); padding: 28px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="${LOGO_URL}" alt="College Fast Forward" style="height: 60px; margin-bottom: 8px;" />
    </div>
    <div style="background: #fff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
      <p style="font-size: 18px; color: #111827; margin: 0 0 16px 0;">Hi ${firstName},</p>
      <p style="font-size: 16px;">Your weekly recap:</p>

      <div style="background: #f9fafb; border-radius: 10px; padding: 16px 20px; margin: 16px 0 24px 0;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr><td style="padding: 6px 0; font-size: 15px;">💬 New responses to your questions: <strong>${newResponses}</strong></td></tr>
          <tr><td style="padding: 6px 0; font-size: 15px;">⭐ Karma earned: <strong>${weeklyKarma}</strong></td></tr>
        </table>
      </div>

      ${responsesBlock}

      ${(trendingBlock || salaryBlock) ? `
      <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 20px;">
        <p style="font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 8px 0;">Trending on CFF Insights:</p>
        ${trendingBlock}
        ${salaryBlock}
        <div style="text-align: center; margin: 16px 0;">
          <a href="${APP_BASE_URL}/#Insights?utm_source=weekly_digest" style="display: inline-block; background: #0021A5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">Explore CFF Insights →</a>
        </div>
      </div>` : ''}

      <p style="font-size: 14px; color: #6b7280; margin: 16px 0 0 0;">— The CFF Team</p>
    </div>
    <div style="background: #f9fafb; padding: 20px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">College Fast Forward</p>
      <p style="font-size: 11px; color: #9ca3af; margin: 4px 0 0 0;">8731 Lewis River Road, Delray Beach, FL 33446</p>
      <p style="font-size: 11px; color: #9ca3af; margin: 8px 0 0 0;"><a href="${APP_BASE_URL}/#ProfileEdit" style="color: #9ca3af;">Unsubscribe</a> · <a href="${APP_BASE_URL}/#ProfileEdit" style="color: #9ca3af;">Email Preferences</a></p>
    </div>
  </div>
</body></html>`;

  return { subject, emailHtml };
}

// ═══════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const currentUser = await base44.auth.me();
    if (currentUser?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const { dryRun = false, limit = 200 } = await req.json().catch(() => ({}));
    const now = new Date();
    const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000);
    const weekKey = getWeekKey();

    // ── Fetch all data in parallel ──
    const [helpReqs, jobReqs, allAnswers, allJobAnswers, salaryReports, interviewReports, allUsers, allKarma, allStudentKarma] = await Promise.all([
      base44.asServiceRole.entities.HelpRequest.filter({ status: 'active' }, '-created_date', 100),
      base44.asServiceRole.entities.JobRequest.filter({ status: 'active' }, '-created_date', 100),
      base44.asServiceRole.entities.Answer.filter({}, '-created_date', 500),
      base44.asServiceRole.entities.JobAnswer.filter({}, '-created_date', 500),
      base44.asServiceRole.entities.SalaryReport.list('-created_date', 50),
      base44.asServiceRole.entities.InterviewReport.list('-created_date', 50),
      base44.asServiceRole.entities.User.filter({}),
      base44.asServiceRole.entities.FamilyKarma.filter({}, '-total_karma', 500),
      base44.asServiceRole.entities.StudentKarma.filter({}, '-total_karma', 500),
    ]);

    // ── Compute week stats ──
    const allQuestions = [...helpReqs, ...jobReqs];
    const thisWeekQuestions = allQuestions.filter(q => new Date(q.created_date) >= oneWeekAgo);
    const thisWeekAnswers = allAnswers.filter(a => new Date(a.created_date) >= oneWeekAgo);
    const thisWeekJobAnswers = allJobAnswers.filter(a => new Date(a.created_date) >= oneWeekAgo);
    const thisWeekUsers = allUsers.filter(u => new Date(u.created_date) >= oneWeekAgo);
    const thisWeekSalary = salaryReports.filter(s => new Date(s.created_date) >= oneWeekAgo);

    // Families for karma lookup
    let familiesByUserId = {};
    try {
      const families = await base44.asServiceRole.entities.Family.filter({});
      families.forEach(f => {
        (f.parent_ids || []).forEach(pid => { familiesByUserId[pid] = f; });
      });
    } catch (e) { /* no families */ }

    const karmaByFamily = {};
    allKarma.forEach(k => { karmaByFamily[k.family_group_id] = k; });

    // Sorted leaderboard for rank calc
    const sortedKarma = [...allKarma].sort((a, b) => (b.total_karma || 0) - (a.total_karma || 0));

    // Answers by email for per-user stats
    const answersByEmail = {};
    allAnswers.forEach(a => {
      if (!answersByEmail[a.answerer_email]) answersByEmail[a.answerer_email] = [];
      answersByEmail[a.answerer_email].push(a);
    });
    allJobAnswers.forEach(a => {
      if (!answersByEmail[a.responder_email]) answersByEmail[a.responder_email] = [];
      answersByEmail[a.responder_email].push(a);
    });

    // Trending company (most asked about this week)
    const companyCounts = {};
    thisWeekQuestions.forEach(q => {
      const co = q.target_company;
      if (co) companyCounts[co] = (companyCounts[co] || 0) + 1;
    });
    const topCompanyEntry = Object.entries(companyCounts).sort((a, b) => b[1] - a[1])[0];
    const trendingCompany = topCompanyEntry?.[0] || '';
    const trendingCount = topCompanyEntry?.[1] || 0;

    // Salary insight for students
    let salaryInsight = '';
    if (thisWeekSalary.length > 0) {
      const s = thisWeekSalary[0];
      if (s.base_salary) {
        salaryInsight = `New ${s.offer_type === 'internship' ? 'internship' : ''} salary data: ${s.role} at ${s.company} — $${Math.round(s.base_salary / 1000)}k`;
      } else {
        salaryInsight = `${thisWeekSalary.length} new salary report${thisWeekSalary.length > 1 ? 's' : ''} shared this week`;
      }
    }

    // Featured unanswered questions for parent digest
    const featured = thisWeekQuestions
      .filter(q => (q.answer_count || 0) === 0)
      .slice(0, 3)
      .map(q => ({
        id: q.id,
        type: q.role ? 'job' : 'help',
        preview: truncate(q.description || '', 100)
      }));

    // ── Cache stats ──
    try {
      const existing = await base44.asServiceRole.entities.WeeklyDigestCache.filter({ week_key: weekKey });
      const indCounts = {};
      thisWeekQuestions.forEach(q => {
        const ind = q.industry || q.target_industry;
        if (ind) indCounts[ind] = (indCounts[ind] || 0) + 1;
      });
      const topIndustries = Object.entries(indCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([i]) => i);
      const helperCounts = {};
      thisWeekAnswers.forEach(a => {
        const name = a.answerer_name || 'Anonymous';
        helperCounts[name] = (helperCounts[name] || 0) + 1;
      });
      const topHelpers = Object.entries(helperCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, answers: count }));

      const cacheData = {
        week_key: weekKey,
        total_questions: thisWeekQuestions.length,
        total_answers: thisWeekAnswers.length,
        total_new_users: thisWeekUsers.length,
        top_industries: topIndustries,
        top_helpers: topHelpers,
        salary_insights_count: thisWeekSalary.length,
        interview_insights_count: interviewReports.filter(i => new Date(i.created_date) >= oneWeekAgo).length,
        featured_questions: featured.map(q => ({ id: q.id, title: q.preview, industry: '', poster_name: '' })),
        computed_at: now.toISOString()
      };
      if (existing.length > 0) {
        await base44.asServiceRole.entities.WeeklyDigestCache.update(existing[0].id, cacheData);
      } else {
        await base44.asServiceRole.entities.WeeklyDigestCache.create(cacheData);
      }
    } catch (e) { console.log('Cache update failed:', e.message); }

    // ── Email prefs + logs ──
    const prefs = await base44.asServiceRole.entities.EmailPreference.filter({});
    const prefsByUser = {};
    prefs.forEach(p => { prefsByUser[p.user_id] = p; });

    const allEmailLogs = await base44.asServiceRole.entities.EmailLog.filter({}, '-sent_at', 2000);
    const logsByEmail = {};
    allEmailLogs.forEach(l => {
      if (!logsByEmail[l.user_email]) logsByEmail[l.user_email] = [];
      logsByEmail[l.user_email].push(l);
    });
    const threeDaysAgoStr = threeDaysAgo.toISOString();
    const oneDayAgoStr = new Date(now - 24*60*60*1000).toISOString();
    const oneWeekAgoStr = oneWeekAgo.toISOString();

    // ── Filter eligible users: logged in within 30 days, has persona, onboarded ──
    const eligible = allUsers.filter(u => {
      if (!u.persona || u.onboarding_completed === false) return false;
      // Use last_login_at or updated_date as proxy for activity
      const lastActive = u.last_login_at || u.updated_date || u.created_date;
      return lastActive && new Date(lastActive) >= thirtyDaysAgo;
    });

    const results = { processed: 0, parentSent: 0, studentSent: 0, skipped: 0, rateLimited: 0, errors: [] };

    for (const u of eligible.slice(0, limit)) {
      try {
        results.processed++;

        const pref = prefsByUser[u.id];
        if (pref && (pref.all_emails === false || pref.weekly_digest === false)) {
          results.skipped++;
          continue;
        }

        // Skip if emailed in last 3 days
        const userLogs = logsByEmail[u.email] || [];
        const recentEmails = userLogs.filter(l => l.sent_at >= threeDaysAgoStr);
        if (recentEmails.length > 0) {
          results.rateLimited++;
          continue;
        }

        // Also enforce max 1/day, max 3/week as safety
        const todayCount = userLogs.filter(l => l.sent_at >= oneDayAgoStr).length;
        const weekCount = userLogs.filter(l => l.sent_at >= oneWeekAgoStr).length;
        if (todayCount >= 1 || weekCount >= 3) {
          results.rateLimited++;
          continue;
        }

        const firstName = parseFirstName(u.full_name);
        const isHelper = u.persona === 'parent' || (u.persona === 'alumni' && u.alumni_intent !== 'career_help' && !u.alumni_help_type);

        let subject, emailHtml;

        if (isHelper) {
          // ── 8A: Parent / Alumni Helper ──
          const family = familiesByUserId[u.id];
          const familyKarma = family ? karmaByFamily[family.family_group_id] : null;

          // Weekly karma: answers this week * 10
          const myWeekAnswers = (answersByEmail[u.email] || []).filter(a => new Date(a.created_date) >= oneWeekAgo);
          const weeklyKarma = myWeekAnswers.length * 10;

          // Students helped this week
          const weeklyStudentIds = [...new Set(myWeekAnswers.map(a => a.question_id || a.job_request_id))];
          const weeklyStudentsHelped = weeklyStudentIds.length;

          // Leaderboard rank
          let leaderboardRank = 'N/A';
          let percentile = 50;
          if (family && familyKarma) {
            const idx = sortedKarma.findIndex(k => k.family_group_id === family.family_group_id);
            if (idx >= 0) {
              leaderboardRank = idx + 1;
              percentile = Math.max(1, Math.round((1 - idx / Math.max(sortedKarma.length, 1)) * 100));
            }
          }

          ({ subject, emailHtml } = buildParentWeeklyDigest({
            firstName,
            weeklyKarma,
            weeklyStudentsHelped,
            leaderboardRank,
            percentile,
            newQuestionCount: thisWeekQuestions.length,
            newMemberCount: thisWeekUsers.length,
            featuredQuestions: featured
          }));

          if (!dryRun) {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: u.email, subject, body: emailHtml, from_name: 'College Fast Forward'
            });
            try {
              await base44.asServiceRole.entities.EmailLog.create({
                user_id: u.id, user_email: u.email, email_type: 'weekly_digest',
                subject, status: 'sent', sent_at: now.toISOString(),
                metadata: { persona: 'parent', weeklyKarma, weeklyStudentsHelped }
              });
            } catch (e) { console.log('Log failed:', e.message); }
          }
          results.parentSent++;

        } else {
          // ── 8B: Student ──
          // Count new responses to student's questions this week
          const studentQuestionIds = new Set(
            allQuestions.filter(q => q.created_by === u.email || q.poster_email === u.email || q.student_email === u.email)
              .map(q => q.id)
          );
          const newResponses = [...thisWeekAnswers, ...thisWeekJobAnswers].filter(a => {
            const qid = a.question_id || a.job_request_id;
            return studentQuestionIds.has(qid);
          }).length;

          // Student karma this week
          const sk = allStudentKarma.find(k => k.user_email === u.email);
          const weeklyKarma = sk?.this_month_karma || 0; // approximate — monthly as proxy

          ({ subject, emailHtml } = buildStudentWeeklyDigest({
            firstName,
            newResponses,
            weeklyKarma,
            trendingCompany,
            trendingCount,
            salaryInsight
          }));

          if (!dryRun) {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: u.email, subject, body: emailHtml, from_name: 'College Fast Forward'
            });
            try {
              await base44.asServiceRole.entities.EmailLog.create({
                user_id: u.id, user_email: u.email, email_type: 'weekly_digest',
                subject, status: 'sent', sent_at: now.toISOString(),
                metadata: { persona: 'student', newResponses, weeklyKarma }
              });
            } catch (e) { console.log('Log failed:', e.message); }
          }
          results.studentSent++;
        }
      } catch (err) {
        results.errors.push({ userId: u.id, error: err.message });
      }
    }

    return Response.json({
      success: true, dryRun, weekKey,
      stats: { questions: thisWeekQuestions.length, answers: thisWeekAnswers.length, newUsers: thisWeekUsers.length },
      results
    });
  } catch (error) {
    console.error('Weekly digest error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});