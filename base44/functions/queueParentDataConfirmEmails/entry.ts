/**
 * One-shot queue builder: drafts a "confirm your company & title" re-engagement
 * email for every parent/alumni User with a valid email address.
 *
 * Creates EngagementEmail records with status="pending_approval" so an admin can
 * review/approve them in the dashboard before dispatchApprovedEngagementEmails sends.
 *
 * Idempotent: skips any user who already has a draft with this template_id that
 * isn't rejected (avoids duplicate drafts on re-run).
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TEMPLATE_ID = 'parent_data_confirm_2026';
const WORKFLOW = 'reengagement';
const PROFILE_EDIT_URL = (Deno.env.get('APP_BASE_URL') || 'https://collegefastforward.com') + '/#/ParentProfileEdit';

function deriveFirstName(fullName) {
  const fn = (fullName || '').trim();
  if (fn && fn.includes(' ') && /[a-zA-Z]/.test(fn)) {
    const first = fn.split(' ')[0];
    if (/^[a-zA-Z]+$/.test(first)) return first;
  }
  if (fn && /^[a-zA-Z]+$/.test(fn)) return fn;
  return '';
}

function buildEmail(firstName) {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,';
  const subject = 'Quick favor — confirm your company & title so students can find you';
  const bodyHtml = `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:540px;margin:0 auto;color:#1a1a2e;line-height:1.6;">
    <p style="font-size:16px;">${greeting}</p>
    <p style="font-size:16px;">Thanks for being part of the College Fast Forward network. When students search for warm connections, we match them by <strong>where you work and what you do</strong> — but your profile is currently missing a real job title (and for a few of you, an up-to-date company).</p>
    <p style="font-size:16px;">It takes 30 seconds to fix, and it's the single biggest thing that gets you matched with a student who could use your help:</p>
    <p style="text-align:center;margin:32px 0;">
      <a href="${PROFILE_EDIT_URL}" style="background:#6d28d9;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:16px;display:inline-block;">Confirm my company &amp; title →</a>
    </p>
    <p style="font-size:15px;color:#555;">That's it. Your info is only shown to students at your university, and only when there's a genuine match.</p>
    <p style="font-size:16px;margin-top:24px;">Thank you for paying it forward,<br/>The College Fast Forward Team</p>
  </div>`;
  const bodyText = `${greeting}\n\nThanks for being part of the College Fast Forward network. When students search for warm connections, we match them by where you work and what you do — but your profile is currently missing a real job title (and for a few of you, an up-to-date company).\n\nIt takes 30 seconds to fix, and it's the single biggest thing that gets you matched with a student who could use your help:\n\nConfirm my company & title: ${PROFILE_EDIT_URL}\n\nThat's it. Your info is only shown to students at your university, and only when there's a genuine match.\n\nThank you for paying it forward,\nThe College Fast Forward Team`;
  return { subject, bodyHtml, bodyText };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const isAdmin = user?.role === 'admin' || user?.roles?.includes('admin');
    if (!user || !isAdmin) {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = body.dryRun === true;

    const db = base44.asServiceRole.entities;

    const users = await db.User.list('-created_date', 10000);
    const isParentOrAlum = (u) => {
      const persona = (u.persona || '').toLowerCase();
      const roles = (u.roles || []).map(r => String(r).toLowerCase());
      return persona === 'parent' || persona === 'alumni' || roles.includes('parent') || roles.includes('alumni');
    };
    const targets = users.filter(isParentOrAlum).filter(u => (u.email || '').includes('@'));

    // Idempotency: existing drafts for this template that aren't rejected
    const existing = await db.EngagementEmail.filter({ template_id: TEMPLATE_ID });
    const alreadyQueued = new Set(
      existing
        .filter(e => e.status !== 'rejected')
        .map(e => (e.user_email || '').toLowerCase())
    );

    const toCreate = [];
    let skipped = 0;
    for (const u of targets) {
      const emailLc = (u.email || '').toLowerCase();
      if (alreadyQueued.has(emailLc)) { skipped++; continue; }
      const firstName = deriveFirstName(u.full_name);
      const { subject, bodyHtml, bodyText } = buildEmail(firstName);
      toCreate.push({
        user_id: u.id,
        user_email: u.email,
        user_name: u.full_name || '',
        school_code: u.school_code || '',
        workflow: WORKFLOW,
        template_id: TEMPLATE_ID,
        tier: 'unknown',
        subject,
        body_html: bodyHtml,
        body_text: bodyText,
        status: 'pending_approval',
      });
    }

    if (dryRun) {
      return Response.json({
        success: true,
        dryRun: true,
        targets: targets.length,
        wouldCreate: toCreate.length,
        skippedExisting: skipped,
        sampleSubject: toCreate[0]?.subject || null,
      });
    }

    let created = 0;
    for (let i = 0; i < toCreate.length; i += 100) {
      const chunk = toCreate.slice(i, i + 100);
      await db.EngagementEmail.bulkCreate(chunk);
      created += chunk.length;
    }

    return Response.json({
      success: true,
      targets: targets.length,
      created,
      skippedExisting: skipped,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});