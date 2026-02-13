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

    // Get parent/alumni users
    const allUsers = await base44.asServiceRole.entities.User.filter({});
    const helpers = allUsers.filter(u =>
      (u.persona === 'parent' || u.persona === 'alumni') &&
      u.onboarding_completed !== false
    );

    // Get email prefs
    const prefs = await base44.asServiceRole.entities.EmailPreference.filter({});
    const prefsByUser = {};
    prefs.forEach(p => { prefsByUser[p.user_id] = p; });

    // Get parent expertise for matching
    const expertise = await base44.asServiceRole.entities.ParentExpertise.filter({});
    const expertiseByUser = {};
    expertise.forEach(e => { expertiseByUser[e.parent_id] = e; });

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

        // Match questions to this parent's expertise
        const exp = expertiseByUser[helper.id];
        const userIndustry = exp?.industry || helper.industries?.[0] || '';

        let matched = todaysQuestions;
        if (userIndustry) {
          const industryLower = userIndustry.toLowerCase();
          matched = todaysQuestions.filter(q => {
            const qi = (q.industry || q.target_industry || '').toLowerCase();
            return qi.includes(industryLower) || industryLower.includes(qi);
          });
        }

        if (matched.length === 0) matched = todaysQuestions.slice(0, 3);
        matched = matched.slice(0, 5);

        if (matched.length === 0) {
          results.skipped++;
          continue;
        }

        const firstName = parseFirstName(helper.full_name);

        const questionCards = matched.map(q => {
          const sName = parseFirstName(q.student_name || q.poster_name);
          const desc = truncate(q.description, 130);
          const ind = formatIndustry(q.industry || q.target_industry);
          const url = `${APP_BASE_URL}/#QuestionDetail?id=${q.id}&type=${q.role ? 'job' : 'help'}&utm_source=daily_digest`;
          return `<div style="border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px; margin-bottom: 10px; background: #fafafa;">
            <div><strong style="color: #111827;">${sName}</strong>${ind ? ` <span style="color: #6b7280; font-size: 13px;">· ${ind}</span>` : ''}</div>
            <p style="color: #374151; font-style: italic; margin: 6px 0 10px 0; font-size: 14px;">"${desc}"</p>
            <a href="${url}" style="color: #0021A5; font-weight: 600; font-size: 14px; text-decoration: none;">Help ${sName} →</a>
          </div>`;
        }).join('');

        const emailHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="${LOGO_URL}" alt="CFF" style="height: 50px;" />
    </div>
    <div style="background: #fff; padding: 28px 24px; border: 1px solid #e5e7eb; border-top: none;">
      <p style="font-size: 16px;">Hi ${firstName},</p>
      <p style="font-size: 16px;"><strong>${matched.length} UF student${matched.length > 1 ? 's' : ''}</strong> posted questions today that match your background:</p>
      <div style="margin: 20px 0;">${questionCards}</div>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${APP_BASE_URL}/#Connections?utm_source=daily_digest" style="display: inline-block; background: #0021A5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">See All Questions →</a>
      </div>
      <p style="font-size: 14px; color: #6b7280; text-align: center;">2-3 minutes of your time can change a UF student's career trajectory.</p>
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
            to: helper.email,
            subject: `${matched.length} UF student${matched.length > 1 ? 's' : ''} need${matched.length === 1 ? 's' : ''} your help today`,
            body: emailHtml,
            from_name: 'College Fast Forward'
          });

          try {
            await base44.asServiceRole.entities.EmailLog.create({
              user_id: helper.id,
              user_email: helper.email,
              email_type: 'daily_match_digest',
              subject: `${matched.length} UF students need your help today`,
              status: 'sent',
              sent_at: now.toISOString(),
              metadata: { matchCount: matched.length }
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