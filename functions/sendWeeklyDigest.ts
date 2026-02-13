import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";
const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg";

function parseFirstName(name) {
  return (name || 'there').split(' ')[0];
}

function getWeekKey() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

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
    const weekKey = getWeekKey();

    // Compute this week's stats
    const [helpReqs, jobReqs, answers, salaryReports, interviewReports, allUsers] = await Promise.all([
      base44.asServiceRole.entities.HelpRequest.filter({ status: 'active' }, '-created_date', 100),
      base44.asServiceRole.entities.JobRequest.filter({ status: 'active' }, '-created_date', 100),
      base44.asServiceRole.entities.Answer.filter({}, '-created_date', 200),
      base44.asServiceRole.entities.SalaryReport.list('-created_date', 50),
      base44.asServiceRole.entities.InterviewReport.list('-created_date', 50),
      base44.asServiceRole.entities.User.filter({}),
    ]);

    const thisWeekQuestions = [...helpReqs, ...jobReqs].filter(q => new Date(q.created_date) >= oneWeekAgo);
    const thisWeekAnswers = answers.filter(a => new Date(a.created_date) >= oneWeekAgo);
    const thisWeekSalary = salaryReports.filter(s => new Date(s.created_date) >= oneWeekAgo);
    const thisWeekInterviews = interviewReports.filter(i => new Date(i.created_date) >= oneWeekAgo);
    const thisWeekUsers = allUsers.filter(u => new Date(u.created_date) >= oneWeekAgo);

    // Top industries this week
    const indCounts = {};
    thisWeekQuestions.forEach(q => {
      const ind = q.industry || q.target_industry;
      if (ind) indCounts[ind] = (indCounts[ind] || 0) + 1;
    });
    const topIndustries = Object.entries(indCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([i]) => i);

    // Top helpers (by answer count this week)
    const helperCounts = {};
    thisWeekAnswers.forEach(a => {
      const name = a.answerer_name || 'Anonymous';
      helperCounts[name] = (helperCounts[name] || 0) + 1;
    });
    const topHelpers = Object.entries(helperCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, answers: count }));

    // Featured questions (most recent, unanswered)
    const featured = thisWeekQuestions
      .filter(q => (q.answer_count || 0) === 0)
      .slice(0, 3);

    // Cache stats
    try {
      const existing = await base44.asServiceRole.entities.WeeklyDigestCache.filter({ week_key: weekKey });
      const cacheData = {
        week_key: weekKey,
        total_questions: thisWeekQuestions.length,
        total_answers: thisWeekAnswers.length,
        total_new_users: thisWeekUsers.length,
        top_industries: topIndustries,
        top_helpers: topHelpers,
        salary_insights_count: thisWeekSalary.length,
        interview_insights_count: thisWeekInterviews.length,
        featured_questions: featured.map(q => ({
          id: q.id,
          title: q.description?.substring(0, 80) || q.role || '',
          industry: q.industry || q.target_industry || '',
          poster_name: parseFirstName(q.student_name || q.poster_name)
        })),
        computed_at: now.toISOString()
      };
      if (existing.length > 0) {
        await base44.asServiceRole.entities.WeeklyDigestCache.update(existing[0].id, cacheData);
      } else {
        await base44.asServiceRole.entities.WeeklyDigestCache.create(cacheData);
      }
    } catch (e) { console.log('Cache update failed:', e.message); }

    // Get email prefs
    const prefs = await base44.asServiceRole.entities.EmailPreference.filter({});
    const prefsByUser = {};
    prefs.forEach(p => { prefsByUser[p.user_id] = p; });

    // All eligible users (everyone with completed onboarding)
    const eligible = allUsers.filter(u => u.onboarding_completed !== false && u.persona);

    const leaderboardHtml = topHelpers.length > 0 ? `
      <div style="margin: 20px 0;">
        <h3 style="color: #0021A5; font-size: 16px; margin: 0 0 10px 0;">🏆 This Week's Top Helpers</h3>
        ${topHelpers.map((h, i) => `<div style="display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
          <span style="font-size: 18px; margin-right: 10px;">${['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span>
          <span style="font-weight: 600; color: #111827;">${h.name}</span>
          <span style="color: #6b7280; font-size: 13px; margin-left: auto;">${h.answers} answer${h.answers > 1 ? 's' : ''}</span>
        </div>`).join('')}
      </div>` : '';

    const featuredHtml = featured.length > 0 ? `
      <div style="margin: 20px 0;">
        <h3 style="color: #0021A5; font-size: 16px; margin: 0 0 10px 0;">🆘 Still Waiting for Help</h3>
        ${featured.map(q => {
          const name = parseFirstName(q.student_name || q.poster_name);
          const desc = (q.description || '').substring(0, 100);
          const url = `${APP_BASE_URL}/#QuestionDetail?id=${q.id}&type=${q.role ? 'job' : 'help'}&utm_source=weekly_digest`;
          return `<div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 8px; background: #fafafa;">
            <strong>${name}</strong> <span style="color: #6b7280; font-size: 13px;">· ${q.industry || q.target_industry || ''}</span>
            <p style="margin: 4px 0 8px 0; font-size: 14px; color: #374151; font-style: italic;">"${desc}..."</p>
            <a href="${url}" style="color: #0021A5; font-weight: 600; font-size: 14px; text-decoration: none;">Help ${name} →</a>
          </div>`;
        }).join('')}
      </div>` : '';

    // Fetch all email logs for rate limiting
    const allEmailLogs = await base44.asServiceRole.entities.EmailLog.filter({}, '-sent_at', 2000);
    const logsByEmail = {};
    allEmailLogs.forEach(l => {
      if (!logsByEmail[l.user_email]) logsByEmail[l.user_email] = [];
      logsByEmail[l.user_email].push(l);
    });
    const oneDayAgoStr = new Date(now - 24*60*60*1000).toISOString();
    const oneWeekAgoStr = new Date(now - 7*24*60*60*1000).toISOString();

    const results = { processed: 0, sent: 0, skipped: 0, rateLimited: 0, errors: [] };

    for (const u of eligible.slice(0, limit)) {
      try {
        results.processed++;

        const pref = prefsByUser[u.id];
        if (pref && (pref.all_emails === false || pref.weekly_digest === false)) {
          results.skipped++;
          continue;
        }

        // Anti-spam: max 1/day, max 3/week
        const userLogs = logsByEmail[u.email] || [];
        const todayCount = userLogs.filter(l => l.sent_at >= oneDayAgoStr).length;
        const weekCount = userLogs.filter(l => l.sent_at >= oneWeekAgoStr).length;
        if (todayCount >= 1 || weekCount >= 3) {
          results.rateLimited++;
          continue;
        }

        const firstName = parseFirstName(u.full_name);

        const emailHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="${LOGO_URL}" alt="CFF" style="height: 50px; margin-bottom: 4px;" />
      <h1 style="color: white; margin: 8px 0 0 0; font-size: 20px;">📊 Your Weekly UF Digest</h1>
    </div>
    <div style="background: #fff; padding: 28px 24px; border: 1px solid #e5e7eb; border-top: none;">
      <p style="font-size: 16px;">Hi ${firstName},</p>
      <p style="font-size: 16px;">Here's what happened in the UF Network this week:</p>
      
      <div style="display: flex; gap: 12px; margin: 20px 0; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 100px; background: #eff6ff; border-radius: 10px; padding: 14px; text-align: center;">
          <p style="font-size: 24px; font-weight: 700; color: #0021A5; margin: 0;">${thisWeekQuestions.length}</p>
          <p style="font-size: 12px; color: #0021A5; margin: 4px 0 0 0;">New Questions</p>
        </div>
        <div style="flex: 1; min-width: 100px; background: #fef3c7; border-radius: 10px; padding: 14px; text-align: center;">
          <p style="font-size: 24px; font-weight: 700; color: #92400e; margin: 0;">${thisWeekAnswers.length}</p>
          <p style="font-size: 12px; color: #92400e; margin: 4px 0 0 0;">Answers Given</p>
        </div>
        <div style="flex: 1; min-width: 100px; background: #f0fdf4; border-radius: 10px; padding: 14px; text-align: center;">
          <p style="font-size: 24px; font-weight: 700; color: #166534; margin: 0;">${thisWeekUsers.length}</p>
          <p style="font-size: 12px; color: #166534; margin: 4px 0 0 0;">New Members</p>
        </div>
      </div>

      ${topIndustries.length > 0 ? `<p style="font-size: 14px; color: #6b7280;">🔥 <strong>Trending industries:</strong> ${topIndustries.join(', ')}</p>` : ''}
      ${thisWeekSalary.length > 0 ? `<p style="font-size: 14px; color: #6b7280;">💰 <strong>${thisWeekSalary.length}</strong> new salary insights shared</p>` : ''}
      ${thisWeekInterviews.length > 0 ? `<p style="font-size: 14px; color: #6b7280;">🎤 <strong>${thisWeekInterviews.length}</strong> new interview experiences shared</p>` : ''}

      ${leaderboardHtml}
      ${featuredHtml}

      <div style="text-align: center; margin: 24px 0;">
        <a href="${APP_BASE_URL}/#Connections?utm_source=weekly_digest" style="display: inline-block; background: #0021A5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Explore the UF Network →</a>
      </div>
    </div>
    <div style="background: #f9fafb; padding: 16px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">College Fast Forward</p>
      <p style="font-size: 11px; color: #9ca3af; margin: 4px 0 0 0;">8731 Lewis River Road, Delray Beach, FL 33446</p>
      <p style="font-size: 11px; color: #9ca3af; margin: 8px 0 0 0;"><a href="${APP_BASE_URL}/#ProfileEdit" style="color: #9ca3af;">Unsubscribe</a> · <a href="${APP_BASE_URL}/#ProfileEdit" style="color: #9ca3af;">Email Preferences</a></p>
    </div>
  </div>
</body></html>`;

        if (!dryRun) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: u.email,
            subject: `📊 Your UF Week: ${thisWeekQuestions.length} questions, ${thisWeekAnswers.length} answers`,
            body: emailHtml,
            from_name: 'College Fast Forward'
          });

          try {
            await base44.asServiceRole.entities.EmailLog.create({
              user_id: u.id,
              user_email: u.email,
              email_type: 'weekly_digest',
              subject: `Your UF Week: ${thisWeekQuestions.length} questions, ${thisWeekAnswers.length} answers`,
              status: 'sent',
              sent_at: now.toISOString()
            });
          } catch (e) { console.log('Log failed:', e.message); }
        }
        results.sent++;
      } catch (err) {
        results.errors.push({ userId: u.id, error: err.message });
      }
    }

    return Response.json({ success: true, dryRun, weekKey, stats: { questions: thisWeekQuestions.length, answers: thisWeekAnswers.length, newUsers: thisWeekUsers.length }, results });
  } catch (error) {
    console.error('Weekly digest error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});