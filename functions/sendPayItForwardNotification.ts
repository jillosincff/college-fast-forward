import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const APP = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";
const SGK = Deno.env.get("SENDGRID_API_KEY");
const DM = "'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const PF = "'Playfair Display',Georgia,'Times New Roman',serif";
const YR = new Date().getFullYear();

const emailWrap = (pre, body) => `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<span style="display:none;font-size:1px;color:#f4f2ee;max-height:0;overflow:hidden;">${pre}&zwnj;&nbsp;</span>
</head><body style="margin:0;padding:0;background-color:#f4f2ee;font-family:${DM};">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f2ee;"><tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
<tr><td style="background-color:#0d1117;border-radius:16px 16px 0 0;padding:24px 32px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td><span style="font-family:${DM};font-size:18px;font-weight:600;color:#f4f0e8;">C<span style="color:#E85D20;">FF</span></span><span style="font-family:${DM};font-size:11px;font-weight:400;color:rgba(244,240,232,0.4);letter-spacing:0.08em;text-transform:uppercase;margin-left:12px;">College Fast Forward</span></td><td align="right"></td></tr></table></td></tr>
<tr><td style="background-color:#fff;padding:36px 32px;">${body}</td></tr>
<tr><td style="background-color:#0d1117;border-radius:0 0 16px 16px;padding:20px 32px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:${DM};font-size:11px;font-weight:300;color:rgba(244,240,232,0.3);line-height:1.6;">&copy; ${YR} College Fast Forward.<br><a href="${APP}/#ProfileEdit" style="color:rgba(244,240,232,0.4);text-decoration:underline;">Unsubscribe</a> &middot; <a href="${APP}/#ProfileEdit" style="color:rgba(244,240,232,0.4);text-decoration:underline;">Email preferences</a></td><td align="right" style="font-family:${DM};font-size:11px;font-weight:300;color:rgba(244,240,232,0.2);">University of Florida &middot; ${YR}</td></tr></table></td></tr>
</table></td></tr></table></body></html>`;

function firstName(n) { if (!n) return 'there'; if (n.includes(',')) return (n.split(',')[1]||'').trim().split(/\s+/)[0]||'there'; return n.split(' ')[0]; }

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { helper_parent_email, helper_parent_name, student_email, student_name, trigger_type } = await req.json();
    if (!helper_parent_email || !student_email) return Response.json({ error: 'Missing required fields' }, { status: 400 });

    const allUsers = await base44.asServiceRole.entities.User.list();
    const student = allUsers.find(u => u.email === student_email);
    if (!student) return Response.json({ success: false, reason: 'Student not found' });

    let linkedParent = student.parent_email ? allUsers.find(u => u.email === student.parent_email) : null;
    if (!linkedParent) linkedParent = allUsers.find(u => (u.persona==='parent'||u.roles?.includes('parent')) && u.linked_student_emails?.includes(student_email));
    if (!linkedParent) return Response.json({ success: false, reason: 'No linked parent found' });
    if (linkedParent.email === helper_parent_email) return Response.json({ success: false, reason: 'Helper is own parent' });

    const oneDayAgo = new Date(); oneDayAgo.setDate(oneDayAgo.getDate()-1);
    const recent = await base44.asServiceRole.entities.PayItForwardNotification.filter({ recipient_parent_email: linkedParent.email, created_date: { $gte: oneDayAgo.toISOString() } });
    if (recent?.length > 0) return Response.json({ success: false, reason: 'Rate limited' });

    await base44.asServiceRole.entities.PayItForwardNotification.create({
      recipient_parent_email: linkedParent.email, student_email, student_name: student_name||student.full_name||'Your student',
      helper_parent_name: helper_parent_name||'A UF Parent', helper_parent_email, trigger_type: trigger_type||'message', is_read: false, email_sent: false
    });

    // Fetch a matching question for the CTA
    let featuredQ = null;
    try {
      const activeQ = await base44.asServiceRole.entities.JobRequest.filter({ status:'active', poster_type:'student' }, '-created_date', 10);
      const unanswered = (activeQ||[]).filter(q => (q.answer_count||0)===0);
      featuredQ = unanswered[0];
    } catch {}

    if (SGK && linkedParent.email) {
      const stuFirst = firstName(student_name || student.full_name);
      const helperFirst = firstName(helper_parent_name);
      const connectionsUrl = `${APP}/#Connections?utm_source=pay_it_forward&utm_medium=email&utm_campaign=pay_it_forward`;

      const qCardHtml = featuredQ ? `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left:3px solid #E85D20;background:#fff;border-radius:0 12px 12px 0;margin:16px 0;"><tr><td style="padding:14px 16px;">
<p style="font-family:${PF};font-size:16px;font-weight:700;color:#1a1a1a;line-height:1.4;margin:0 0 6px;">${(featuredQ.title||featuredQ.description||'').substring(0,120)}</p>
<p style="font-family:${DM};font-size:12px;font-weight:300;color:#888;margin:0 0 10px;">${firstName(featuredQ.poster_name)} &middot; ${featuredQ.student_major||''}</p>
<table cellpadding="0" cellspacing="0" border="0"><tr><td style="background-color:#E85D20;border-radius:100px;padding:6px 16px;"><a href="${APP}/#QuestionDetail?id=${featuredQ.id}&utm_source=pay_it_forward&utm_medium=email" style="font-family:${DM};font-size:12px;font-weight:500;color:#fff;text-decoration:none;">Answer this &rarr;</a></td></tr></table>
</td></tr></table>` : '';

      const content = `
<h1 style="font-family:${PF};font-size:28px;font-weight:700;letter-spacing:-0.02em;line-height:1.2;margin:0 0 8px;"><span style="color:#1a1a1a;">Someone helped a student today.</span> <span style="font-style:italic;font-weight:400;color:#E85D20;">You can too.</span></h1>
<p style="font-family:${DM};font-size:15px;font-weight:300;color:#555;line-height:1.75;margin:0 0 16px;"><strong style="font-weight:500;color:#1a1a1a;">${helperFirst}</strong> just responded to a question in the network. Here&rsquo;s one that matches your background:</p>
${qCardHtml}
<table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;"><tr><td style="background-color:#E85D20;border-radius:100px;padding:14px 32px;"><a href="${connectionsUrl}" style="font-family:${DM};font-size:15px;font-weight:500;color:#fff;text-decoration:none;">Answer this question &rarr;</a></td></tr></table>`;

      const html = emailWrap(`A parent in the network answered a student's question. Here's one you might be able to help with too.`, content);
      const subject = `Someone just helped ${stuFirst} — want to pay it forward?`;

      try {
        const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST', headers: { 'Authorization': `Bearer ${SGK}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ personalizations:[{to:[{email:linkedParent.email}]}], from:{email:'notifications@collegefastforward.com',name:'College Fast Forward'}, subject, content:[{type:'text/html',value:html}] })
        });
        if (res.ok) {
          const notifs = await base44.asServiceRole.entities.PayItForwardNotification.filter({ recipient_parent_email:linkedParent.email, student_email }, '-created_date', 1);
          if (notifs?.[0]) await base44.asServiceRole.entities.PayItForwardNotification.update(notifs[0].id, { email_sent: true });
        }
      } catch (e) { console.error('PIF email failed:', e); }
    }
    return Response.json({ success: true, recipient_parent: linkedParent.email });
  } catch (error) {
    console.error('PIF error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});