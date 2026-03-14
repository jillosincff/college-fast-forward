import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const APP = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";
const SGK = Deno.env.get("SENDGRID_API_KEY");
const DM = "'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const PF = "'Playfair Display',Georgia,'Times New Roman',serif";
const YR = new Date().getFullYear();

// FASTIQ emails get the FASTIQ badge in the header
const emailWrap = (pre, body) => `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<!--[if !mso]><!--><style>@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');</style><!--<![endif]-->
</head><body style="margin:0;padding:0;background-color:#f4f2ee;font-family:${DM};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<div style="display:none;font-size:1px;color:#f4f2ee;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${pre}&#847;&zwnj;&nbsp;</div>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f2ee;" role="presentation"><tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;" role="presentation">
<tr><td style="background-color:#0d1117;border-radius:16px 16px 0 0;padding:24px 32px;"><table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"><tr>
<td><span style="font-family:${DM};font-size:18px;font-weight:600;color:#f4f0e8;">C<span style="color:#E85D20;">FF</span></span><span style="font-family:${DM};font-size:11px;font-weight:400;color:#8a867e;letter-spacing:0.08em;text-transform:uppercase;margin-left:12px;">College Fast Forward</span></td>
<td align="right"><span style="background:#2b1e14;border:1px solid #5c3316;border-radius:100px;padding:4px 12px;font-size:11px;font-weight:500;color:#E85D20;font-family:${DM};">FASTIQ&trade; Active</span></td>
</tr></table></td></tr>
<tr><td style="background-color:#ffffff;padding:36px 32px;">${body}</td></tr>
<tr><td style="background-color:#0d1117;border-radius:0 0 16px 16px;padding:20px 32px;"><table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"><tr><td style="font-family:${DM};font-size:11px;font-weight:300;color:#5a574f;line-height:1.6;">&copy; ${YR} College Fast Forward.<br><a href="${APP}/#ProfileEdit" style="color:#8a867e;text-decoration:underline;">Unsubscribe</a> &middot; <a href="${APP}/#ProfileEdit" style="color:#8a867e;text-decoration:underline;">Email preferences</a></td><td align="right" style="font-family:${DM};font-size:11px;font-weight:300;color:#3d3a35;">University of Florida &middot; ${YR}</td></tr></table></td></tr>
</table></td></tr></table></body></html>`;

const CATEGORY_INDUSTRY_MAP = {
  networking: ['Marketing','Consulting','Finance & Banking'],
  career_path: ['Technology & Software','Engineering','Healthcare'],
  first_job: ['Retail','Hospitality','Media & Entertainment'],
  industry: ['Law & Legal','Real Estate','Manufacturing','Government']
};

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  try {
    const { dryRun = false } = await req.json().catch(() => ({}));
    const now = new Date();
    const h72 = new Date(now - 72*3600000).toISOString();
    const h78 = new Date(now - 78*3600000).toISOString();
    const week = new Date(now - 7*86400000).toISOString();

    const allJR = await base44.asServiceRole.entities.JobRequest.filter({ status:'active', poster_type:'student' }, '-created_date', 200);
    const unanswered = (allJR||[]).filter(q => (q.answer_count||0)===0 && q.created_date && q.created_date<=h72 && q.created_date>=h78);
    if (!unanswered.length) return Response.json({ success:true, processed:0, reason:'No questions in 72h window' });

    const [triggers, profiles, families, allUsers, emailPrefs] = await Promise.all([
      base44.asServiceRole.entities.FastiqOutreachEmail.filter({ email_type:'zero_response_intro' }, '-sent_date', 500),
      base44.asServiceRole.entities.FastTrackProProfile.filter({}, undefined, 500),
      base44.asServiceRole.entities.Family.filter({}, undefined, 500),
      base44.asServiceRole.entities.User.filter({}, undefined, 500),
      base44.asServiceRole.entities.EmailPreference.filter({})
    ]);

    const triggeredIds = new Set((triggers||[]).map(t=>t.job_request_id).filter(Boolean));
    const recentTriggers = (triggers||[]).filter(t=>t.sent_date&&t.sent_date>=week);
    const weeklyByStudent = {}; recentTriggers.forEach(t => { weeklyByStudent[t.user_email]=(weeklyByStudent[t.user_email]||0)+1; });
    const profileByEmail = {}; (profiles||[]).forEach(p => { if(p.user_email) profileByEmail[p.user_email]=p; });
    const famByStudentEmail = {}; (families||[]).forEach(f => { if(f.student_email) famByStudentEmail[f.student_email]=f; (f.student_ids||[]).forEach(sid => { famByStudentEmail[`id:${sid}`]=f; }); });

    const alumniByCategory = {};
    const totalHelpers = (allUsers||[]).filter(u=>u.persona==='parent'||u.persona==='alumni').length;
    (allUsers||[]).filter(u=>u.persona==='parent'||u.persona==='alumni').forEach(u => {
      (u.industries||[]).forEach(ind => {
        Object.entries(CATEGORY_INDUSTRY_MAP).forEach(([cat,inds]) => {
          if(inds.some(i=>i.toLowerCase().includes(ind.toLowerCase())||ind.toLowerCase().includes(i.toLowerCase()))) alumniByCategory[cat]=(alumniByCategory[cat]||0)+1;
        });
      });
    });

    const prefsMap = {}; (emailPrefs||[]).forEach(p => { if(p.user_email) prefsMap[p.user_email]=p; });
    const results = { processed:0, notificationsSent:0, emailsSent:0, skipped:0, errors:[] };

    for (const q of unanswered) {
      try {
        results.processed++;
        const email = q.poster_email || q.created_by;
        if (!email || email.includes('service+')) { results.skipped++; continue; }
        if (triggeredIds.has(q.id)) { results.skipped++; continue; }
        if ((weeklyByStudent[email]||0)>=2) { results.skipped++; continue; }
        if (prefsMap[email]?.all_emails===false) { results.skipped++; continue; }

        const fam = famByStudentEmail[email];
        const tier = fam?.subscription_tier || 'free';
        const isFastiq = tier==='fastiq' || profileByEmail[email]?.pro_tier==='fastiq';
        const isBasic = tier==='cff' || (!isFastiq && fam?.subscription_status==='active');
        const cat = q.category || 'networking';
        const alumniCount = alumniByCategory[cat] || Math.min(totalHelpers, 50);

        let ctaText, ctaUrl, ctaSubtext, h2Text, bodyText;
        if (isFastiq) {
          h2Text = 'Want FASTIQ to find your answer?';
          bodyText = 'FASTIQ can reach out to these alumni directly on your behalf. One tap and it handles everything.';
          ctaText = 'Let FASTIQ reach out';
          ctaUrl = `${APP}/#FastIQ?action=outreach&question_id=${q.id}&utm_source=fastiq_unanswered_trigger&utm_medium=email`;
          ctaSubtext = 'FASTIQ will draft a personalized message and notify you when someone responds.';
        } else {
          h2Text = 'Let FASTIQ reach out for you.';
          bodyText = `Upgrade to FASTIQ and it will find the right people, write the message, and get you a response &mdash; so your question never goes unanswered again.`;
          ctaText = 'Unlock FASTIQ — $29/month';
          ctaUrl = `${APP}/#FastIQ?upgrade=true&question_id=${q.id}&utm_source=fastiq_unanswered_trigger&utm_medium=email`;
          ctaSubtext = 'Includes everything in your current membership. Cancel anytime.';
        }

        const stuName = q.poster_first_name || q.poster_name?.split(' ')[0] || 'there';
        const qPreview = (q.title || q.description || '').substring(0, 120);
        const catLabel = cat.replace(/_/g, ' ');

        // In-app notification
        await base44.asServiceRole.entities.Notification.create({
          user_email: email, type:'fastiq_unanswered', title:"Your question hasn't gotten a response yet",
          message:`FASTIQ found ${alumniCount} alumni who work in ${catLabel} — want me to reach out to them directly?`,
          action_url: ctaUrl, is_read:false, priority:'high',
          metadata: { question_id:q.id, alumni_count:alumniCount, category:cat, tier:isFastiq?'fastiq':isBasic?'basic':'free' }
        });
        results.notificationsSent++;
        if (dryRun) continue;

        // Build branded email
        const stats = `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;"><tr>
<td width="30%" align="center" style="padding:16px;background:#f4f2ee;border-radius:12px;"><p style="font-family:${PF};font-size:24px;font-weight:700;color:#E85D20;margin:0 0 4px;">${alumniCount}</p><p style="font-family:${DM};font-size:11px;font-weight:300;color:#888;text-transform:uppercase;letter-spacing:0.05em;margin:0;">Alumni found</p></td>
<td width="5%"></td>
<td width="30%" align="center" style="padding:16px;background:#f4f2ee;border-radius:12px;"><p style="font-family:${PF};font-size:24px;font-weight:700;color:#E85D20;margin:0 0 4px;">85%</p><p style="font-family:${DM};font-size:11px;font-weight:300;color:#888;text-transform:uppercase;letter-spacing:0.05em;margin:0;">Response rate</p></td>
<td width="5%"></td>
<td width="30%" align="center" style="padding:16px;background:#f4f2ee;border-radius:12px;"><p style="font-family:${PF};font-size:24px;font-weight:700;color:#E85D20;margin:0 0 4px;">&lt;24h</p><p style="font-family:${DM};font-size:11px;font-weight:300;color:#888;text-transform:uppercase;letter-spacing:0.05em;margin:0;">Avg reply time</p></td>
</tr></table>`;

        const content = `
<h1 style="font-family:${PF};font-size:28px;font-weight:700;color:#1a1a1a;letter-spacing:-0.02em;line-height:1.2;margin:0 0 8px;">Your question hasn&rsquo;t gotten a response yet.</h1>
<p style="font-family:${DM};font-size:15px;font-weight:300;color:#555;line-height:1.75;margin:0 0 16px;">The network hasn&rsquo;t answered yet &mdash; but FASTIQ found <strong style="font-weight:500;color:#1a1a1a;">${alumniCount} alumni</strong> who work in <span style="color:#E85D20;font-weight:500;">${catLabel}</span>. They went to your school and know this space.</p>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;"><tr>
<td style="border-left:3px solid #E85D20;padding:12px 16px;background-color:#fff9f7;">
<p style="font-family:${DM};font-size:14px;font-weight:400;color:#555;line-height:1.65;margin:0;font-style:italic;">&ldquo;${qPreview}&rdquo;</p>
</td></tr></table>

${stats}

<h2 style="font-family:${PF};font-size:20px;font-weight:700;color:#1a1a1a;letter-spacing:-0.01em;line-height:1.3;margin:16px 0 6px;">${h2Text}</h2>
<p style="font-family:${DM};font-size:15px;font-weight:300;color:#555;line-height:1.75;margin:0 0 16px;">${bodyText}</p>
<table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;"><tr><td style="background-color:#E85D20;border-radius:100px;padding:14px 32px;"><a href="${ctaUrl}" style="font-family:${DM};font-size:15px;font-weight:500;color:#fff;text-decoration:none;">${ctaText} &rarr;</a></td></tr></table>
<p style="font-family:${DM};font-size:12px;font-weight:300;color:#aaa;line-height:1.6;margin:0;">${ctaSubtext}</p>`;

        const subject = "Still waiting on an answer? FASTIQ can help.";
        const preheader = `FASTIQ identified ${alumniCount} alumni in ${catLabel} who might have exactly the answer you need.`;
        const html = emailWrap(preheader, content);

        const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method:'POST', headers:{'Authorization':`Bearer ${SGK}`,'Content-Type':'application/json'},
          body:JSON.stringify({ personalizations:[{to:[{email}]}], from:{email:'notifications@collegefastforward.com',name:'FASTIQ by CFF'}, subject, content:[{type:'text/html',value:html}] })
        });

        await Promise.all([
          base44.asServiceRole.entities.FastiqOutreachEmail.create({ user_email:email, email_type:'zero_response_intro', sent_date:now.toISOString(), job_request_id:q.id, student_name:stuName }),
          base44.asServiceRole.entities.EmailLog.create({ user_email:email, email_type:'fastiq_unanswered_trigger', subject, status:sgRes.ok?'sent':'failed', sent_at:now.toISOString(), metadata:{ question_id:q.id, membership_tier:isFastiq?'fastiq':isBasic?'basic':'free', fastiq_alumni_count:alumniCount } })
        ]);

        if (sgRes.ok) results.emailsSent++;
        weeklyByStudent[email] = (weeklyByStudent[email]||0)+1;
        triggeredIds.add(q.id);
      } catch (err) { results.errors.push({ questionId:q.id, error:err.message }); }
    }
    return Response.json({ success:true, dryRun, results });
  } catch (error) {
    console.error('fastiqUnansweredTrigger error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});