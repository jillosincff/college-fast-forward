import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const APP = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";
const DM = "'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const PF = "'Playfair Display',Georgia,'Times New Roman',serif";
const YR = new Date().getFullYear();

// ── Inline brand kit (matches platform nav) ──
const emailWrap = (preheader, content) => `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<span style="display:none;font-size:1px;color:#f4f2ee;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&zwnj;&nbsp;&zwnj;&nbsp;</span>
</head>
<body style="margin:0;padding:0;background-color:#f4f2ee;font-family:${DM};">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f2ee;"><tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
<tr><td style="background-color:#0d1117;border-radius:16px 16px 0 0;padding:24px 32px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td><span style="font-family:${DM};font-size:18px;font-weight:600;color:#f4f0e8;">C<span style="color:#E85D20;">FF</span></span><span style="font-family:${DM};font-size:11px;font-weight:400;color:rgba(244,240,232,0.4);letter-spacing:0.08em;text-transform:uppercase;margin-left:12px;">College Fast Forward</span></td>
<td align="right"></td>
</tr></table></td></tr>
<tr><td style="background-color:#ffffff;padding:36px 32px;">${content}</td></tr>
<tr><td style="background-color:#0d1117;border-radius:0 0 16px 16px;padding:20px 32px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="font-family:${DM};font-size:11px;font-weight:300;color:rgba(244,240,232,0.3);line-height:1.6;">&copy; ${YR} College Fast Forward.<br><a href="${APP}/#ProfileEdit" style="color:rgba(244,240,232,0.4);text-decoration:underline;">Unsubscribe</a> &middot; <a href="${APP}/#ProfileEdit" style="color:rgba(244,240,232,0.4);text-decoration:underline;">Email preferences</a> &middot; <a href="${APP}" style="color:rgba(244,240,232,0.4);text-decoration:underline;">Visit CFF</a></td>
<td align="right" style="font-family:${DM};font-size:11px;font-weight:300;color:rgba(244,240,232,0.2);">University of Florida &middot; ${YR}</td>
</tr></table></td></tr>
</table></td></tr></table></body></html>`;

const qCard = (cat, text, name, year, major, url, karma) => `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left:3px solid #E85D20;background:#ffffff;border-radius:0 12px 12px 0;margin:8px 0;"><tr><td style="padding:14px 16px;">
${cat ? `<p style="font-family:${DM};font-size:10px;font-weight:500;color:#E85D20;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 6px;">${cat}</p>` : ''}
<p style="font-family:${PF};font-size:16px;font-weight:700;color:#1a1a1a;line-height:1.4;margin:0 0 6px;">${text}</p>
<p style="font-family:${DM};font-size:12px;font-weight:300;color:#888;margin:0 0 10px;">${[name,year,major].filter(Boolean).join(' &middot; ')}</p>
<table cellpadding="0" cellspacing="0" border="0"><tr><td style="background-color:#E85D20;border-radius:100px;padding:6px 16px;"><a href="${url}" style="font-family:${DM};font-size:12px;font-weight:500;color:#fff;text-decoration:none;">Answer this +${karma || 5} karma &rarr;</a></td></tr></table>
</td></tr></table>`;

const CATEGORY_LABELS = { networking: 'Networking & Outreach', career_path: 'Career Path', first_job: 'First Job Advice', industry: 'Industry-Specific' };

function parseFirstName(n) { if (!n) return 'there'; if (n.includes(',')) { const p = n.split(','); return (p[1]||'').trim().split(/\s+/)[0] || 'there'; } return n.split(' ')[0]; }
function truncate(s, m) { return !s ? '' : s.length > m ? s.substring(0, m-3) + '...' : s; }

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { dryRun = false, limit = 100 } = await req.json().catch(() => ({}));
    const now = new Date();
    const oneDayAgo = new Date(now - 24*60*60*1000);

    const [recentHelp, recentJobs] = await Promise.all([
      base44.asServiceRole.entities.HelpRequest.filter({ status: 'active' }, '-created_date', 20),
      base44.asServiceRole.entities.JobRequest.filter({ status: 'active' }, '-created_date', 20)
    ]);

    const todaysQuestions = [...recentHelp, ...recentJobs].filter(q => new Date(q.created_date) >= oneDayAgo);
    if (todaysQuestions.length === 0) return Response.json({ success: true, skipped: true, reason: 'No new questions today' });

    const [allUsers, allKarma, allAnswers, allJobAnswers, prefs, expertise, allEmailLogs] = await Promise.all([
      base44.asServiceRole.entities.User.filter({}),
      base44.asServiceRole.entities.FamilyKarma.filter({}, '-total_karma', 500),
      base44.asServiceRole.entities.Answer.filter({}, '-created_date', 1000),
      base44.asServiceRole.entities.JobAnswer.filter({}, '-created_date', 1000),
      base44.asServiceRole.entities.EmailPreference.filter({}),
      base44.asServiceRole.entities.ParentExpertise.filter({}),
      base44.asServiceRole.entities.EmailLog.filter({}, '-sent_at', 2000)
    ]);

    const helpers = allUsers.filter(u =>
      (u.persona === 'parent' || u.persona === 'alumni') &&
      u.onboarding_completed !== false &&
      !(u.persona === 'alumni' && (u.alumni_intent === 'career_help' || u.alumni_help_type))
    );

    const karmaByFamily = {}; allKarma.forEach(k => { karmaByFamily[k.family_group_id] = k; });
    const answersByEmail = {};
    allAnswers.forEach(a => { (answersByEmail[a.answerer_email] ||= []).push(a); });
    allJobAnswers.forEach(a => { (answersByEmail[a.responder_email] ||= []).push(a); });
    let familiesByUser = {};
    try { const fams = await base44.asServiceRole.entities.Family.filter({}); fams.forEach(f => { (f.parent_ids||[]).forEach(pid => { familiesByUser[pid] = f; }); }); } catch {}

    const prefsByUser = {}; prefs.forEach(p => { prefsByUser[p.user_id] = p; });
    const expertiseByUser = {}; expertise.forEach(e => { if (e.parent_id) expertiseByUser[e.parent_id] = e; if (e.user_email) expertiseByUser[e.user_email] = e; });
    const logsByEmail = {}; allEmailLogs.forEach(l => { (logsByEmail[l.user_email] ||= []).push(l); });

    const oneDayAgoStr = new Date(now - 24*60*60*1000).toISOString();
    const oneWeekAgoStr = new Date(now - 7*24*60*60*1000).toISOString();
    const twentyHoursAgoStr = new Date(now - 20*60*60*1000).toISOString();

    const results = { processed: 0, sent: 0, skipped: 0, rateLimited: 0, errors: [] };

    for (const helper of helpers.slice(0, limit)) {
      try {
        results.processed++;
        const pref = prefsByUser[helper.id];
        if (pref && (pref.all_emails === false || pref.daily_digest === false)) { results.skipped++; continue; }

        const userLogs = logsByEmail[helper.email] || [];
        if (userLogs.filter(l => l.sent_at >= oneDayAgoStr).length >= 1 || userLogs.filter(l => l.sent_at >= oneWeekAgoStr).length >= 3) { results.rateLimited++; continue; }
        if (userLogs.filter(l => l.email_type === 'daily_match_digest' && l.sent_at >= twentyHoursAgoStr).length > 0) { results.skipped++; continue; }

        const exp = expertiseByUser[helper.id] || expertiseByUser[helper.email];
        const userIndustries = exp?.industries || helper.industries || [];
        const userIndustry = userIndustries[0] || exp?.industry || '';

        let matched = todaysQuestions;
        if (userIndustry) {
          const iLow = userIndustry.toLowerCase();
          const im = todaysQuestions.filter(q => {
            const qi = (q.industry || q.target_industry || '').toLowerCase();
            return userIndustries.some(ui => qi.includes(ui.toLowerCase()) || ui.toLowerCase().includes(qi)) || qi.includes(iLow) || iLow.includes(qi);
          });
          if (im.length > 0) matched = im;
        }
        matched = matched.slice(0, 3);
        if (matched.length === 0) { results.skipped++; continue; }

        const family = familiesByUser[helper.id];
        const fk = family ? karmaByFamily[family.family_group_id] : null;
        const karma = fk?.total_karma || 0;
        const uniqueQIds = [...new Set((answersByEmail[helper.email]||[]).map(a => a.question_id || a.job_request_id))];
        const studentsHelped = uniqueQIds.length;

        // Build branded email
        const cards = matched.map(q => {
          const cat = q.category || q.help_types?.[0] || '';
          const catLabel = CATEGORY_LABELS[cat] || '';
          const desc = truncate(q.description || q.title, 120);
          const url = `${APP}/#QuestionDetail?id=${q.id}&utm_source=daily_digest&utm_medium=email&utm_campaign=daily_digest`;
          const name = parseFirstName(q.poster_name || q.student_name);
          return qCard(catLabel, desc, name, q.student_year || '', q.student_major || '', url, 5);
        }).join('');

        const content = `
${`<h1 style="font-family:${PF};font-size:28px;font-weight:700;letter-spacing:-0.02em;line-height:1.2;margin:0 0 8px;"><span style="color:#1a1a1a;">${matched.length} student${matched.length > 1 ? 's' : ''} could use</span> <span style="font-style:italic;font-weight:400;color:#E85D20;">your help today.</span></h1>`}
<p style="font-family:${DM};font-size:15px;font-weight:300;color:#555;line-height:1.75;margin:0 0 16px;">These questions match your background. Even 2&ndash;3 sentences makes a difference &mdash; and earns you karma points.</p>
${cards}
<table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;"><tr><td style="background-color:#E85D20;border-radius:100px;padding:14px 32px;"><a href="${APP}/#Connections?utm_source=daily_digest&utm_medium=email&utm_campaign=daily_digest" style="font-family:${DM};font-size:15px;font-weight:500;color:#fff;text-decoration:none;">See all questions &rarr;</a></td></tr></table>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0;"><tr><td style="border-top:1px solid rgba(0,0,0,0.06);font-size:0;">&nbsp;</td></tr></table>
<p style="font-family:${DM};font-size:12px;font-weight:300;color:#aaa;line-height:1.6;margin:0;">You&rsquo;re receiving this because you&rsquo;re a CFF member. Answer questions to earn karma and move up the leaderboard.</p>`;

        const subject = `${matched.length} students need your help today`;
        const preheader = `${parseFirstName(matched[0].poster_name || matched[0].student_name)} is asking about ${matched[0].category || 'career advice'} — you might know just the right thing to say.`;
        const html = emailWrap(preheader, content);

        if (!dryRun) {
          await base44.asServiceRole.integrations.Core.SendEmail({ to: helper.email, subject, body: html, from_name: 'College Fast Forward' });
          try { await base44.asServiceRole.entities.EmailLog.create({ user_id: helper.id, user_email: helper.email, email_type: 'daily_match_digest', subject, status: 'sent', sent_at: now.toISOString(), metadata: { matchCount: matched.length, karma, studentsHelped } }); } catch {}
        }
        results.sent++;
      } catch (err) { results.errors.push({ userId: helper.id, error: err.message }); }
    }
    return Response.json({ success: true, dryRun, results });
  } catch (error) {
    console.error('Daily digest error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});