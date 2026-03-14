import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const APP = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";
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

function trunc(s,m) { return !s?'':s.length>m?s.substring(0,m-3)+'...':s; }
function initials(name) { return (name||'?').split(/[\s,]+/).filter(Boolean).slice(0,2).map(w=>w[0]?.toUpperCase()).join(''); }

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { questionId, questionType, questionTitle, posterEmail, posterName, answererName, answererEmail, answererTitle, answererCompany, answererPersona, answerId, answerPreview } = body;
    if (!posterEmail || !answererName || !answerPreview || !questionTitle) return Response.json({ error: 'Missing required fields' }, { status: 400 });
    if (posterEmail === answererEmail) return Response.json({ success: true, skipped: true, reason: 'Self-answer' });

    const base44 = createClientFromRequest(req);
    const canSendResult = await base44.functions.invoke('emailHelpers', { action: 'canSendEmail', userEmail: posterEmail, emailType: 'new_answer' });
    if (!canSendResult.data?.canSend) return Response.json({ success: true, skipped: true, reason: canSendResult.data?.reason || 'Rate limited' });

    const aFirst = (answererName||'Someone').split(' ')[0];
    const answererRole = answererPersona==='parent'?'UF Parent':answererPersona==='alumni'?'UF Alumni':'Community Member';
    const qPreview = trunc(questionTitle, 120);
    const aPreview = trunc(answerPreview, 150);
    const answerUrl = `${APP}/#QuestionDetail?id=${questionId}&type=${questionType||'help'}&utm_source=answer_notification&utm_medium=email&utm_campaign=answer_notification`;

    const subject = `${answererName} just answered your question`;
    const preheader = trunc(answerPreview, 100);

    const content = `
<h1 style="font-family:${PF};font-size:28px;font-weight:700;letter-spacing:-0.02em;line-height:1.2;margin:0 0 8px;"><span style="color:#1a1a1a;">${aFirst} answered</span> <span style="font-style:italic;font-weight:400;color:#E85D20;">your question.</span></h1>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;"><tr>
<td style="border-left:3px solid #E85D20;padding:12px 16px;background-color:#fff9f7;">
<p style="font-family:${DM};font-size:14px;font-weight:400;color:#555;line-height:1.65;margin:0;font-style:italic;">&ldquo;${qPreview}&rdquo;</p>
</td></tr></table>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f2ee;border-radius:12px;margin:8px 0;"><tr><td style="padding:14px 16px;">
<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
<td style="vertical-align:top;width:40px;"><div style="width:40px;height:40px;border-radius:50%;background-color:#0d1117;color:#fff;font-family:${DM};font-size:13px;font-weight:500;text-align:center;line-height:40px;display:inline-block;">${initials(answererName)}</div></td>
<td style="padding-left:12px;vertical-align:top;">
<p style="font-family:${DM};font-size:14px;font-weight:500;color:#1a1a1a;margin:0 0 2px;">${answererName}</p>
<p style="font-family:${DM};font-size:12px;font-weight:300;color:#888;margin:0;">${[answererRole, answererTitle, answererCompany].filter(Boolean).join(' &middot; ')}</p>
</td></tr></table></td></tr></table>

<p style="font-family:${DM};font-size:15px;font-weight:300;color:#555;line-height:1.75;margin:16px 0;">&ldquo;${aPreview}&rdquo;</p>

<table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;"><tr>
<td style="background-color:#E85D20;border-radius:100px;padding:14px 32px;">
<a href="${answerUrl}" style="font-family:${DM};font-size:15px;font-weight:500;color:#fff;text-decoration:none;">Read the full answer &rarr;</a>
</td></tr></table>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0;"><tr><td style="border-top:1px solid rgba(0,0,0,0.06);font-size:0;">&nbsp;</td></tr></table>
<p style="font-family:${DM};font-size:12px;font-weight:300;color:#aaa;line-height:1.6;margin:0;">Reply to keep the conversation going &mdash; parents who get a response are 4x more likely to make an introduction.</p>`;

    const html = emailWrap(preheader, content);

    await base44.asServiceRole.integrations.Core.SendEmail({ to: posterEmail, subject, body: html, from_name: 'College Fast Forward' });
    try { await base44.asServiceRole.entities.EmailLog.create({ user_email: posterEmail, email_type: 'new_answer', subject, status: 'sent', sent_at: new Date().toISOString(), metadata: { questionId, answererName, answerId } }); } catch {}

    return Response.json({ success: true, emailSent: true, questionId });
  } catch (error) {
    console.error('Answer notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});