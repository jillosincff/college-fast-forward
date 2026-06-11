import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Reply Detection Engine
 * Scans connected Gmail inboxes for replies from outreach contacts.
 * For every NetworkingPipeline record in 'reached_out'/'messaged' status with a
 * known alumni_email, checks if that contact has emailed the student since outreach.
 * On a hit: moves the card to 'replied' and emails the student the good news.
 *
 * Designed to run as a scheduled automation (admin) — can also be invoked
 * by a logged-in user to check only their own pipeline.
 */

function decryptToken(token) {
  return atob(token);
}

async function refreshAccessToken(refreshToken) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '',
      client_secret: Deno.env.get('google_oauth_client_secret') || '',
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token refresh failed: ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.access_token;
}

// Search Gmail for any message FROM the contact AFTER the outreach date
async function findReply(accessToken, contactEmail, sinceDate) {
  const afterUnix = Math.floor(new Date(sinceDate).getTime() / 1000);
  const q = `from:${contactEmail} after:${afterUnix}`;
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(q)}&maxResults=1`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gmail search failed (${res.status}): ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  return (data.messages && data.messages.length > 0) ? data.messages[0] : null;
}

// Fetch the reply's snippet text so CliFF can draft a response to it
async function fetchMessageSnippet(accessToken, messageId) {
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=metadata`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) return '';
  const data = await res.json();
  return data.snippet || '';
}

// CliFF drafts a suggested response the student can copy-paste
async function draftSuggestedReply(base44, { studentName, contactName, contactRole, company, jobTitle, replySnippet }) {
  const prompt = `You are CliFF, a career coach helping a college student respond to an alumni networking reply.

Context:
- Student: ${studentName}
- Contact: ${contactName}${contactRole ? `, ${contactRole}` : ''}${company ? ` at ${company}` : ''}
${jobTitle ? `- The student is interested in this role: ${jobTitle}` : ''}
- The contact just replied to the student's outreach. Here is the reply (may be truncated): "${replySnippet}"

Write a short response email (under 120 words) the student can send back. Rules:
- Warm, genuine, low-pressure tone — sound like a real student, not a template
- Thank them for replying
- If the reply suggests a call/chat, accept enthusiastically and offer 2-3 flexible time windows
- If the reply is brief/neutral, ask ONE specific, easy-to-answer question about their work or team
- End by signing off with just the first name: ${studentName.split(' ')[0]}
- No subject line, no placeholders like [Your Name] — output only the email body text`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });
  return typeof result === 'string' ? result.trim() : '';
}

function buildReplyEmail(firstName, contactName, company, appUrl, suggestedReply) {
  const suggestionBlock = suggestedReply ? `
        <div style="background: #F0F7FF; border: 1px solid #BFDBFE; border-radius: 10px; padding: 18px 20px; margin: 0 0 20px;">
          <p style="font-size: 12px; font-weight: 700; color: #0021A5; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 10px;">✍️ Suggested response — drafted by CliFF</p>
          <p style="font-size: 14px; color: #333; line-height: 1.7; margin: 0; white-space: pre-line;">${suggestedReply.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
        </div>
        <p style="font-size: 13px; color: #666; margin: 0 0 20px;">Tweak it so it sounds like you, then hit reply in your inbox. Speed matters — respond today if you can.</p>` : '';

  return buildReplyEmailHtml(firstName, contactName, company, appUrl, suggestionBlock);
}

function buildReplyEmailHtml(firstName, contactName, company, appUrl, suggestionBlock) {
  return `
    <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1A1A1A;">
      <div style="background: #0021A5; padding: 24px 28px; border-radius: 12px 12px 0 0;">
        <p style="color: #fff; font-size: 13px; margin: 0; opacity: 0.8;">CliFF</p>
        <h1 style="color: #fff; font-size: 22px; margin: 8px 0 0; font-weight: 700;">🎉 ${contactName} replied to you!</h1>
      </div>
      <div style="background: #fff; border: 1px solid #E8E8E8; border-top: none; border-radius: 0 0 12px 12px; padding: 28px;">
        <p style="font-size: 15px; color: #444; margin: 0 0 20px;">Hey ${firstName},</p>
        <p style="font-size: 15px; color: #444; margin: 0 0 20px; line-height: 1.6;">
          Big news — <strong>${contactName}</strong>${company ? ` at <strong>${company}</strong>` : ''} just replied to your outreach. Check your inbox and respond within 24 hours while the conversation is warm.
        </p>
        <p style="font-size: 14px; color: #444; margin: 0 0 20px;">We've moved this contact to <strong>Replied</strong> in your pipeline.</p>
        ${suggestionBlock}
        <a href="${appUrl}/#/FreeTierDashboard"
          style="display: block; background: #E85D20; color: #fff; text-decoration: none;
                 text-align: center; padding: 14px 24px; border-radius: 10px;
                 font-weight: 700; font-size: 15px; margin-bottom: 16px;">
          View Your Pipeline →
        </a>
        <p style="font-size: 12px; color: #AAA; text-align: center; margin: 0;">
          You're receiving this because you connected your email to CliFF.
        </p>
      </div>
    </div>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const isAdmin = user.role === 'admin' || user.roles?.includes('admin');
    const appUrl = Deno.env.get('APP_BASE_URL') || 'https://collegefastforward.com';

    // 1. Find pipeline records waiting on a reply with a known contact email
    const filter = { status: { $in: ['reached_out', 'messaged'] } };
    if (!isAdmin) filter.user_email = user.email;

    const pending = await base44.asServiceRole.entities.NetworkingPipeline.filter(filter, '-reached_out_date', 500);
    const candidates = (pending || []).filter(r => r.alumni_email && (r.reached_out_date || r.status_date));

    if (candidates.length === 0) {
      return Response.json({ success: true, checked: 0, replies_found: 0, message: 'No pending outreach with contact emails' });
    }

    // 2. Group by student, only students with Gmail connected
    const byStudent = {};
    for (const rec of candidates) {
      if (!byStudent[rec.user_email]) byStudent[rec.user_email] = [];
      byStudent[rec.user_email].push(rec);
    }

    let checked = 0;
    let repliesFound = 0;
    const results = [];

    for (const [studentEmail, records] of Object.entries(byStudent)) {
      const students = await base44.asServiceRole.entities.User.filter({ email: studentEmail }, undefined, 1);
      const student = students?.[0];
      if (!student?.is_email_synced || !student?.encryptedRefreshToken) {
        console.log(`[detectOutreachReplies] Skipping ${studentEmail} — no email sync`);
        continue;
      }

      let accessToken;
      try {
        accessToken = await refreshAccessToken(decryptToken(student.encryptedRefreshToken));
      } catch (e) {
        console.warn(`[detectOutreachReplies] Token refresh failed for ${studentEmail}: ${e.message}`);
        continue;
      }

      for (const rec of records) {
        checked++;
        const since = rec.reached_out_date || rec.status_date;
        try {
          const reply = await findReply(accessToken, rec.alumni_email, since);
          if (reply) {
            repliesFound++;
            await base44.asServiceRole.entities.NetworkingPipeline.update(rec.id, {
              status: 'replied',
              replied_date: new Date().toISOString(),
              status_date: new Date().toISOString(),
            });
            console.log(`[detectOutreachReplies] 🎉 Reply detected: ${rec.alumni_name} → ${studentEmail}`);

            // Also flip the matching OutreachDraft to 'replied' so the drafts list stays in sync
            try {
              const drafts = await base44.asServiceRole.entities.OutreachDraft.filter(
                { created_by: studentEmail, status: 'sent' }, '-created_date', 100
              );
              const norm = (s) => (s || '').trim().toLowerCase();
              const draftMatch = (drafts || []).find(d =>
                norm(d.recipient_name) === norm(rec.alumni_name) &&
                (!d.recipient_company || !rec.company || norm(d.recipient_company) === norm(rec.company))
              );
              if (draftMatch) {
                await base44.asServiceRole.entities.OutreachDraft.update(draftMatch.id, { status: 'replied' });
              }
            } catch (e) {
              console.warn(`[detectOutreachReplies] Draft sync failed: ${e.message}`);
            }

            const firstName = student.full_name?.split(' ')[0] || 'there';

            // CliFF drafts a suggested response based on the actual reply content
            let suggestedReply = '';
            try {
              const replySnippet = await fetchMessageSnippet(accessToken, reply.id);
              if (replySnippet) {
                suggestedReply = await draftSuggestedReply(base44, {
                  studentName: student.full_name || firstName,
                  contactName: rec.alumni_name || 'the contact',
                  contactRole: rec.alumni_role,
                  company: rec.company,
                  jobTitle: rec.job_title,
                  replySnippet,
                });
              }
            } catch (e) {
              console.warn(`[detectOutreachReplies] Suggested reply generation failed: ${e.message}`);
            }

            await base44.asServiceRole.integrations.Core.SendEmail({
              to: studentEmail,
              subject: `🎉 ${rec.alumni_name || 'Your contact'} replied — here's your next move`,
              body: buildReplyEmail(firstName, rec.alumni_name || 'Your contact', rec.company, appUrl, suggestedReply),
              from_name: 'CliFF',
            });

            results.push({ student: studentEmail, contact: rec.alumni_name, company: rec.company });
          }
        } catch (e) {
          console.warn(`[detectOutreachReplies] Gmail check failed for ${rec.alumni_email}: ${e.message}`);
        }
      }
    }

    console.log(`[detectOutreachReplies] Checked ${checked} contacts, found ${repliesFound} replies`);
    return Response.json({ success: true, checked, replies_found: repliesFound, replies: results });

  } catch (error) {
    console.error('[detectOutreachReplies] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});