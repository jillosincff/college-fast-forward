import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const APP = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";
const SGK = Deno.env.get("SENDGRID_API_KEY");
const DM = "'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const PF = "'Playfair Display',Georgia,'Times New Roman',serif";
const YR = new Date().getFullYear();

const emailWrap = (pre, body, unsub) => `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<!--[if !mso]><!--><style>@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');</style><!--<![endif]-->
</head><body style="margin:0;padding:0;background-color:#f4f2ee;font-family:${DM};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<div style="display:none;font-size:1px;color:#f4f2ee;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${pre}&#847;&zwnj;&nbsp;</div>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f2ee;" role="presentation"><tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;" role="presentation">
<tr><td style="background-color:#0d1117;border-radius:16px 16px 0 0;padding:24px 32px;"><table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"><tr><td><span style="font-family:${DM};font-size:18px;font-weight:600;color:#f4f0e8;">C<span style="color:#E85D20;">FF</span></span><span style="font-family:${DM};font-size:11px;font-weight:400;color:#8a867e;letter-spacing:0.08em;text-transform:uppercase;margin-left:12px;">College Fast Forward</span></td><td align="right"></td></tr></table></td></tr>
<tr><td style="background-color:#ffffff;padding:36px 32px;">${body}</td></tr>
<tr><td style="background-color:#0d1117;border-radius:0 0 16px 16px;padding:20px 32px;"><table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"><tr><td style="font-family:${DM};font-size:11px;font-weight:300;color:#5a574f;line-height:1.6;">&copy; ${YR} College Fast Forward.<br><a href="${unsub||APP+'/#ProfileEdit'}" style="color:#8a867e;text-decoration:underline;">Unsubscribe</a> &middot; <a href="${APP}/#ProfileEdit" style="color:#8a867e;text-decoration:underline;">Email preferences</a> &middot; <a href="${APP}" style="color:#8a867e;text-decoration:underline;">Visit CFF</a></td><td align="right" style="font-family:${DM};font-size:11px;font-weight:300;color:#3d3a35;">University of Florida &middot; ${YR}</td></tr></table></td></tr>
</table></td></tr></table></body></html>`;

const qCard = (cat, text, name, year, major, url, karma) => `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left:3px solid #E85D20;background:#fff;border-radius:0 12px 12px 0;margin:8px 0;"><tr><td style="padding:14px 16px;">
${cat?`<p style="font-family:${DM};font-size:10px;font-weight:500;color:#E85D20;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 6px;">${cat}</p>`:''}
<p style="font-family:${PF};font-size:16px;font-weight:700;color:#1a1a1a;line-height:1.4;margin:0 0 6px;">${text}</p>
<p style="font-family:${DM};font-size:12px;font-weight:300;color:#888;margin:0 0 10px;">${[name,year,major].filter(Boolean).join(' &middot; ')}</p>
<table cellpadding="0" cellspacing="0" border="0"><tr><td style="background-color:#E85D20;border-radius:100px;padding:6px 16px;"><a href="${url}" style="font-family:${DM};font-size:12px;font-weight:500;color:#fff;text-decoration:none;">Answer this +${karma||5} karma &rarr;</a></td></tr></table>
</td></tr></table>`;

const CATS = { networking:'Networking & Outreach', career_path:'Career Path', first_job:'First Job Advice', industry:'Industry-Specific' };
function firstName(n) { if (!n) return 'there'; if (n.includes(',')) { const p=n.split(','); return (p[1]||'').trim().split(/\s+/)[0]||'there'; } return n.split(' ')[0]; }
function trunc(s,m) { return !s?'':s.length>m?s.substring(0,m-3)+'...':s; }

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  try {
    const oneWeekAgo = new Date(Date.now() - 7*24*60*60*1000).toISOString();

    const [allUsers, recentQ, recentA, allPrefs, allDigests] = await Promise.all([
      base44.asServiceRole.entities.User.filter({}, '-updated_date', 500),
      base44.asServiceRole.entities.JobRequest.filter({ status:'active', poster_type:'student' }, '-created_date', 100),
      base44.asServiceRole.entities.Answer.filter({}, '-created_date', 500),
      base44.asServiceRole.entities.EmailPreference.filter({}, undefined, 500),
      base44.asServiceRole.entities.ReengagementEmail.filter({ email_type:'weekly_parent_digest' }, '-sent_at', 500),
    ]);

    const parents = (allUsers||[]).filter(u => (u.persona==='parent'||u.roles?.includes('parent')) && u.onboarding_completed!==false && u.email && !u.email.includes('service+'));
    const thisWeekQ = (recentQ||[]).filter(q => q.created_date && new Date(q.created_date).toISOString()>=oneWeekAgo && !q.is_alumni_career_request);
    const prefsMap = new Map((allPrefs||[]).map(p => [p.user_email, p]));

    let sent = 0, skipped = 0;
    for (const parent of parents.slice(0, 50)) {
      const pr = prefsMap.get(parent.email);
      if (pr?.all_emails===false || pr?.weekly_digest===false) { skipped++; continue; }
      if ((allDigests||[]).some(e => e.user_email===parent.email && e.sent_at && e.sent_at>=oneWeekAgo)) { skipped++; continue; }
      if (sent > 0 && sent % 10 === 0) await new Promise(r => setTimeout(r, 1000));

      const pInd = parent.industries?.[0] || parent.industry;
      const matchedQ = pInd ? thisWeekQ.filter(q => q.target_industry?.toLowerCase().includes(pInd.toLowerCase())) : thisWeekQ;
      const pAnswers = (recentA||[]).filter(a => a.answerer_email===parent.email);
      const karma = pAnswers.length * 15;
      const helped = new Set(pAnswers.map(a => a.question_id)).size;
      const unanswered = (matchedQ.length>0?matchedQ:thisWeekQ).filter(q => (q.answer_count||0)===0);
      const featured = unanswered[0];

      const fn = firstName(parent.full_name);
      const subject = `Your weekly roundup — ${thisWeekQ.length} students need answers`;
      const preheader = featured ? `${firstName(featured.poster_name)} asked a question in your field. Can you help?` : `${thisWeekQ.length} new questions this week.`;

      // Stats row
      const stats = `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;"><tr>
<td width="30%" align="center" style="padding:16px;background:#f4f2ee;border-radius:12px;"><p style="font-family:${PF};font-size:24px;font-weight:700;color:#E85D20;margin:0 0 4px;">${thisWeekQ.length}</p><p style="font-family:${DM};font-size:11px;font-weight:300;color:#888;text-transform:uppercase;letter-spacing:0.05em;margin:0;">Questions this week</p></td>
<td width="5%"></td>
<td width="30%" align="center" style="padding:16px;background:#f4f2ee;border-radius:12px;"><p style="font-family:${PF};font-size:24px;font-weight:700;color:#E85D20;margin:0 0 4px;">${helped}</p><p style="font-family:${DM};font-size:11px;font-weight:300;color:#888;text-transform:uppercase;letter-spacing:0.05em;margin:0;">You've helped</p></td>
<td width="5%"></td>
<td width="30%" align="center" style="padding:16px;background:#f4f2ee;border-radius:12px;"><p style="font-family:${PF};font-size:24px;font-weight:700;color:#E85D20;margin:0 0 4px;">${karma}</p><p style="font-family:${DM};font-size:11px;font-weight:300;color:#888;text-transform:uppercase;letter-spacing:0.05em;margin:0;">Your karma</p></td>
</tr></table>`;

      const featuredCard = featured ? qCard(
        CATS[featured.category] || '',
        trunc(featured.title || featured.description, 120),
        firstName(featured.poster_name), featured.student_year||'', featured.student_major||'',
        `${APP}/#QuestionDetail?id=${featured.id}&utm_source=weekly_digest&utm_medium=email&utm_campaign=weekly_digest`, 15
      ) : '';

      const extraCards = (matchedQ.length>0?matchedQ:thisWeekQ).filter(q => q.id !== featured?.id).slice(0, 2).map(q =>
        qCard(CATS[q.category]||'', trunc(q.title||q.description,100), firstName(q.poster_name), q.student_year||'', q.student_major||'', `${APP}/#QuestionDetail?id=${q.id}&utm_source=weekly_digest&utm_medium=email&utm_campaign=weekly_digest`, 5)
      ).join('');

      const divider = `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0;"><tr><td style="border-top:1px solid rgba(0,0,0,0.06);font-size:0;">&nbsp;</td></tr></table>`;

      const body = `
<h1 style="font-family:${PF};font-size:28px;font-weight:700;color:#1a1a1a;letter-spacing:-0.02em;line-height:1.2;margin:0 0 8px;">This week in the network.</h1>
${stats}
${divider}
${featured ? `<h2 style="font-family:${PF};font-size:20px;font-weight:700;color:#1a1a1a;letter-spacing:-0.01em;line-height:1.3;margin:0 0 6px;">A question that matches your background:</h2>${featuredCard}
<table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;"><tr><td style="background-color:#E85D20;border-radius:100px;padding:14px 32px;"><a href="${APP}/#QuestionDetail?id=${featured.id}&utm_source=weekly_digest&utm_medium=email&utm_campaign=weekly_digest" style="font-family:${DM};font-size:15px;font-weight:500;color:#fff;text-decoration:none;">Answer this question &rarr;</a></td></tr></table>` : ''}
${extraCards ? `${divider}<h2 style="font-family:${PF};font-size:20px;font-weight:700;color:#1a1a1a;margin:0 0 6px;">More questions this week:</h2>${extraCards}
<table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;"><tr><td style="background-color:#0d1117;border-radius:100px;padding:14px 32px;"><a href="${APP}/#Connections?utm_source=weekly_digest&utm_medium=email&utm_campaign=weekly_digest" style="font-family:${DM};font-size:15px;font-weight:500;color:#fff;text-decoration:none;">See all questions &rarr;</a></td></tr></table>` : ''}
${divider}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;"><tr><td style="border-left:3px solid #E85D20;padding:12px 16px;background-color:#fff9f7;"><p style="font-family:${DM};font-size:14px;font-weight:400;color:#555;line-height:1.65;margin:0;">Every answer you give earns karma &mdash; and helps a student who&rsquo;s counting on this network.</p></td></tr></table>`;

      const html = emailWrap(preheader, body);

      const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${SGK}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ personalizations:[{to:[{email:parent.email}]}], from:{email:'notifications@collegefastforward.com',name:'College Fast Forward'}, subject, content:[{type:'text/html',value:html}] })
      });

      await Promise.all([
        base44.asServiceRole.entities.ReengagementEmail.create({ user_id:parent.id, user_email:parent.email, email_type:'weekly_parent_digest', status:sgRes.ok?'sent':'failed', sent_at:new Date().toISOString() }),
        base44.asServiceRole.entities.EmailLog.create({ user_email:parent.email, email_type:'weekly_parent_digest', subject, status:sgRes.ok?'sent':'failed', sent_at:new Date().toISOString(), persona:'parent' })
      ]);
      if (sgRes.ok) sent++;
    }
    return Response.json({ success:true, totalParents:parents.length, sent, skipped });
  } catch (error) {
    console.error('weeklyParentDigest error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});