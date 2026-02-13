import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";
const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg";

function parseFirstName(name) {
  return (name || 'there').split(' ')[0];
}

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.substring(0, max - 3) + '...' : str;
}

function formatIndustry(ind) {
  if (!ind) return '';
  return ind.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const currentUser = await base44.auth.me();
    if (currentUser?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const { dryRun = false, limit = 100 } = await req.json().catch(() => ({}));
    const now = new Date();

    // Get today's active questions (posted in last 24h)
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const recentHelp = await base44.asServiceRole.entities.HelpRequest.filter(
      { status: 'active' }, '-created_date', 20
    );
    const recentJobs = await base44.asServiceRole.entities.JobRequest.filter(
      { status: 'active' }, '-created_date', 20
    );

    const todaysQuestions = [...recentHelp, ...recentJobs].filter(
      q => new Date(q.created_date) >= oneDayAgo
    );

    if (todaysQuestions.length === 0) {
      return Response.json({ success: true, skipped: true, reason: 'No new questions today' });
    }

    // Get parent/alumni users (skip alumni job seekers)
    const allUsers = await base44.asServiceRole.entities.User.filter({});
    const helpers = allUsers.filter(u =>
      (u.persona === 'parent' || u.persona === 'alumni') &&
      u.onboarding_completed !== false &&
      !(u.persona === 'alumni' && (u.alumni_intent === 'career_help' || u.alumni_help_type))
    );

    // Pre-fetch karma and answer counts for stats
    const [allKarma, allAnswers, allJobAnswers] = await Promise.all([
      base44.asServiceRole.entities.FamilyKarma.filter({}, '-total_karma', 500),
      base44.asServiceRole.entities.Answer.filter({}, '-created_date', 1000),
      base44.asServiceRole.entities.JobAnswer.filter({}, '-created_date', 1000)
    ]);
    // Build karma lookup by family_group_id
    const karmaByFamily = {};
    allKarma.forEach(k => { karmaByFamily[k.family_group_id] = k; });
    // Build answers-by-email lookup
    const answersByEmail = {};
    allAnswers.forEach(a => {
      if (!answersByEmail[a.answerer_email]) answersByEmail[a.answerer_email] = [];
      answersByEmail[a.answerer_email].push(a);
    });
    allJobAnswers.forEach(a => {
      if (!answersByEmail[a.responder_email]) answersByEmail[a.responder_email] = [];
      answersByEmail[a.responder_email].push(a);
    });
    // Family lookup for karma
    let familiesByUser = {};
    try {
      const families = await base44.asServiceRole.entities.Family.filter({});
      families.forEach(f => {
        (f.parent_ids || []).forEach(pid => { familiesByUser[pid] = f; });
      });
    } catch (e) { /* no families */ }

    // Get email prefs
    const prefs = await base44.asServiceRole.entities.EmailPreference.filter({});
    const prefsByUser = {};
    prefs.forEach(p => { prefsByUser[p.user_id] = p; });

    // Get parent expertise for matching (index by both parent_id and user_email)
    const expertise = await base44.asServiceRole.entities.ParentExpertise.filter({});
    const expertiseByUser = {};
    expertise.forEach(e => {
      if (e.parent_id) expertiseByUser[e.parent_id] = e;
      if (e.user_email) expertiseByUser[e.user_email] = e;
    });

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

    for (const helper of helpers.slice(0, limit)) {
      try {
        results.processed++;

        const pref = prefsByUser[helper.id];
        if (pref && (pref.all_emails === false || pref.daily_digest === false)) {
          results.skipped++;
          continue;
        }

        // Anti-spam: max 1/day, max 3/week
        const userLogs = logsByEmail[helper.email] || [];
        const todayCount = userLogs.filter(l => l.sent_at >= oneDayAgoStr).length;
        const weekCount = userLogs.filter(l => l.sent_at >= oneWeekAgoStr).length;
        if (todayCount >= 1 || weekCount >= 3) {
          results.rateLimited++;
          continue;
        }

        // Check if we already sent a daily digest in the last 20h
        const twentyHoursAgo = new Date(now - 20*60*60*1000).toISOString();
        const recentDigests = userLogs.filter(l => l.email_type === 'daily_match_digest' && l.sent_at >= twentyHoursAgo);
        if (recentDigests.length > 0) {
          results.skipped++;
          continue;
        }

        // Match questions to this parent's expertise
        const exp = expertiseByUser[helper.id] || expertiseByUser[helper.email];
        const userIndustries = exp?.industries || (helper.industries ? helper.industries : []);
        const userIndustry = userIndustries[0] || exp?.industry || '';

        let matched = todaysQuestions;
        if (userIndustry) {
          const industryLower = userIndustry.toLowerCase();
          const industryMatched = todaysQuestions.filter(q => {
            const qi = (q.industry || q.target_industry || '').toLowerCase();
            return userIndustries.some(ui => {
              const uiLower = ui.toLowerCase();
              return qi.includes(uiLower) || uiLower.includes(qi);
            }) || qi.includes(industryLower) || industryLower.includes(qi);
          });
          if (industryMatched.length > 0) matched = industryMatched;
        }

        matched = matched.slice(0, 3);

        if (matched.length === 0) {
          results.skipped++;
          continue;
        }

        // Get this helper's karma and students helped count
        const family = familiesByUser[helper.id];
        const familyKarma = family ? karmaByFamily[family.family_group_id] : null;
        const karma = familyKarma?.total_karma || 0;
        const helperAnswersList = answersByEmail[helper.email] || [];
        const uniqueQuestionIds = [...new Set(helperAnswersList.map(a => a.question_id || a.job_request_id))];
        const studentsHelped = uniqueQuestionIds.length;

        const firstName = parseFirstName(helper.full_name);

        // Build numbered question cards
        const questionCards = matched.map((q, i) => {
          const desc = truncate(q.description, 100);
          const url = `${APP_BASE_URL}/#QuestionDetail?id=${q.id}&type=${q.role ? 'job' : 'help'}&utm_source=daily_digest`;
          return `<tr>
            <td style="padding: 14px 0; ${i < matched.length - 1 ? 'border-bottom: 1px solid #f3f4f6;' : ''}">
              <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
                <td style="width: 28px; vertical-align: top; padding-right: 12px;">
                  <span style="display: inline-block; width: 28px; height: 28px; border-radius: 50%; background: #0021A5; color: white; text-align: center; line-height: 28px; font-weight: 700; font-size: 14px;">${i + 1}</span>
                </td>
                <td>
                  <p style="color: #374151; font-style: italic; margin: 0 0 8px 0; font-size: 15px;">"${desc}"</p>
                  <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #FA4616, #FF6B3D); color: white; padding: 8px 18px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Answer →</a>
                </td>
              </tr></table>
            </td>
          </tr>`;
        }).join('');

        const subject = `${matched.length} new UF student question${matched.length > 1 ? 's' : ''} match your background`;

        const emailHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<span style="display:none;font-size:1px;color:#fff;max-height:0;overflow:hidden;">${matched.length} new question${matched.length > 1 ? 's' : ''} match your expertise — ${karma} Karma earned so far.</span>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); padding: 28px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="${LOGO_URL}" alt="College Fast Forward" style="height: 60px; margin-bottom: 8px;" />
    </div>
    <div style="background: #fff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
      <p style="font-size: 18px; color: #111827; margin: 0 0 16px 0;">Hi ${firstName},</p>
      <p style="font-size: 16px;"><strong>${matched.length}</strong> new question${matched.length > 1 ? 's' : ''} match your expertise:</p>

      <div style="border-top: 2px solid #e5e7eb; border-bottom: 2px solid #e5e7eb; padding: 8px 0; margin: 20px 0;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          ${questionCards}
        </table>
      </div>

      <p style="font-size: 16px;">You've earned <strong>${karma}</strong> Karma so far and helped <strong>${studentsHelped}</strong> student${studentsHelped !== 1 ? 's' : ''}.</p>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${APP_BASE_URL}/#Connections?utm_source=daily_digest" style="display: inline-block; background: linear-gradient(135deg, #FA4616, #FF6B3D); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">See All Matched Questions →</a>
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

        if (!dryRun) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: helper.email,
            subject,
            body: emailHtml,
            from_name: 'College Fast Forward'
          });

          try {
            await base44.asServiceRole.entities.EmailLog.create({
              user_id: helper.id,
              user_email: helper.email,
              email_type: 'daily_match_digest',
              subject,
              status: 'sent',
              sent_at: now.toISOString(),
              metadata: { matchCount: matched.length, karma, studentsHelped }
            });
          } catch (e) { console.log('Log failed:', e.message); }
        }

        results.sent++;
      } catch (err) {
        results.errors.push({ userId: helper.id, error: err.message });
      }
    }

    return Response.json({ success: true, dryRun, results });
  } catch (error) {
    console.error('Daily digest error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});