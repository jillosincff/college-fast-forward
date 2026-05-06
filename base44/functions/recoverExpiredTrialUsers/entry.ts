import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ONE-SHOT RECOVERY FUNCTION — run once manually.
// Finds users whose trial has expired (trial_status: 'expired' OR trial_end_date in the past)
// who were on a 7-day trial, excludes Suz Tab (requested unsubscribe),
// sends a personal apology/recovery email from Jill, and extends their trial by 3 days.

const EXCLUDE_EMAILS = ['suztab.43@gmail.com'];

const RECOVERY_EMAIL_HTML = (firstName) => `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:48px 24px;">

  <p style="font-size:13px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:#E85D20;margin:0 0 32px;">COLLEGE FAST FORWARD</p>

  <p style="font-size:16px;color:#1A1A1A;line-height:1.75;margin:0 0 16px;">Hi ${firstName},</p>

  <p style="font-size:16px;color:#1A1A1A;line-height:1.75;margin:0 0 16px;">
    I owe you an apology. Your FastIQ trial ended a few days ago and we never told you it was about to happen — no warning email, no heads up, nothing. That's on us, not you.
  </p>

  <p style="font-size:16px;color:#1A1A1A;line-height:1.75;margin:0 0 16px;">
    I'm extending your FastIQ access for <strong>3 more days, on the house</strong>. No card, no catch. I want you to actually get to use what you signed up for.
  </p>

  <p style="font-size:16px;color:#1A1A1A;line-height:1.75;margin:0 0 8px;">You've got full access to:</p>
  <ul style="font-size:15px;color:#1A1A1A;line-height:1.9;margin:0 0 24px;padding-left:20px;">
    <li>Mock Interview practice with STAR-method coaching</li>
    <li>LinkedIn Profile Review</li>
    <li>Career Archetype Assessment</li>
    <li>Outreach Drafts to alumni and parent contacts</li>
    <li>The full FastIQ Dashboard</li>
  </ul>

  <div style="margin:0 0 24px;">
    <a href="https://collegefastforward.com" style="display:inline-block;background:#E85D20;color:#fff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;">Log back in →</a>
  </div>

  <p style="font-size:16px;color:#1A1A1A;line-height:1.75;margin:0 0 16px;">
    If FastIQ ends up being useful to you over the next 3 days, you can grab a subscription before access ends. If not, no hard feelings — just glad you gave it a shot.
  </p>

  <p style="font-size:16px;color:#1A1A1A;line-height:1.75;margin:0 0 24px;">
    And if you have a minute to tell me what worked or didn't, I'd genuinely appreciate it. We're a small team and feedback from real users is how we get better.
  </p>

  <p style="font-size:16px;color:#1A1A1A;line-height:1.75;margin:0 0 4px;">Sorry again for the silent cutoff. That's not how I want this platform to work.</p>

  <p style="font-size:15px;color:#1A1A1A;margin:24px 0 0;">Jill Osinoff<br>Founder, College Fast Forward<br>
    <a href="mailto:support@collegefastforward.com" style="color:#E85D20;">support@collegefastforward.com</a>
  </p>

</div>
</body>
</html>`;

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const callerUser = await base44.auth.me().catch(() => null);
  if (!callerUser || callerUser?.role !== 'admin') {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  const { dryRun = false } = await req.json().catch(() => ({}));

  const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
  const newTrialEnd = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

  // Fetch all users with a trial_start_date set
  const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);

  // Identify recovery candidates:
  // - Had a trial (trial_start_date set)
  // - Trial is expired (trial_status === 'expired' OR trial_end_date in the past)
  // - Not currently paying
  // - Not a founding member
  // - Not excluded (Suz Tab)
  const now = new Date();
  const candidates = allUsers.filter(u => {
    if (!u.trial_start_date) return false;
    if (EXCLUDE_EMAILS.includes(u.email?.toLowerCase())) return false;
    if (u.subscription_status === 'active') return false;
    if (u.is_founding_member || u.founding_offer_redeemed) return false;
    if (u.fastiq_setup_complete === true) return false;

    const isExpired = u.trial_status === 'expired' ||
      (u.trial_end_date && new Date(u.trial_end_date) < now);

    if (!isExpired) return false;

    // Only users who were on the 7-day model (trial_end_date - trial_start_date > 5 days)
    // These are the ones who got no warning emails due to the bug
    if (u.trial_start_date && u.trial_end_date) {
      const trialLengthDays = Math.round(
        (new Date(u.trial_end_date) - new Date(u.trial_start_date)) / (1000 * 60 * 60 * 24)
      );
      if (trialLengthDays < 1 || trialLengthDays > 90) return false;
      // Only target legacy 7-day users (> 5 days)
      if (trialLengthDays <= 5) return false;
    }

    return true;
  });

  console.log(`[recoverExpiredTrialUsers] Found ${candidates.length} recovery candidates. dryRun=${dryRun}`);
  console.log('Candidates:', candidates.map(u => `${u.email} (${u.full_name})`).join(', '));

  if (dryRun) {
    return Response.json({
      dry_run: true,
      candidates: candidates.map(u => ({
        id: u.id,
        email: u.email,
        name: u.full_name,
        trial_end_date: u.trial_end_date,
        trial_status: u.trial_status,
      })),
      count: candidates.length,
      excluded: EXCLUDE_EMAILS,
    });
  }

  const results = [];

  for (const u of candidates) {
    const firstName = u.full_name?.split(' ')[0] || 'there';
    const result = { id: u.id, email: u.email, name: u.full_name, email_sent: false, trial_extended: false, error: null };

    // 1. Send recovery email via SendGrid
    try {
      const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: u.email }] }],
          from: { email: 'jill@collegefastforward.com', name: 'Jill at College Fast Forward' },
          reply_to: { email: 'support@collegefastforward.com', name: 'Jill at College Fast Forward' },
          subject: 'We dropped the ball — here\'s 3 more days of FastIQ',
          content: [{ type: 'text/html', value: RECOVERY_EMAIL_HTML(firstName) }],
        }),
      });

      if (sgRes.ok || sgRes.status === 202) {
        result.email_sent = true;
        console.log(`[recoverExpiredTrialUsers] Email sent to ${u.email}`);
      } else {
        const body = await sgRes.text();
        throw new Error(`SendGrid ${sgRes.status}: ${body}`);
      }
    } catch (e) {
      result.error = `Email failed: ${e.message}`;
      console.error(`[recoverExpiredTrialUsers] Email failed for ${u.email}:`, e.message);
    }

    // 2. Extend trial flags (even if email failed — access restoration is the priority)
    try {
      await base44.asServiceRole.entities.User.update(u.id, {
        trial_status: 'active',
        fastiq_trial_active: true,
        membership_tier: 'fastiq_trial',
        subscription_status: 'trial',
        trial_end_date: newTrialEnd,
        fastiq_active: true,
        is_fastiq: true,
      });
      result.trial_extended = true;
      result.new_trial_end = newTrialEnd;
      console.log(`[recoverExpiredTrialUsers] Trial extended for ${u.email} until ${newTrialEnd}`);
    } catch (e) {
      result.error = (result.error ? result.error + ' | ' : '') + `Trial extend failed: ${e.message}`;
      console.error(`[recoverExpiredTrialUsers] Trial extend failed for ${u.email}:`, e.message);
    }

    // 3. Write EmailEvent record for idempotency
    if (result.email_sent) {
      try {
        await base44.asServiceRole.entities.EmailEvent.create({
          user_id: u.id,
          user_email: u.email,
          template_name: 'recoverExpiredTrialEmail',
          sent_at: new Date().toISOString(),
          school_code: u.school_code || u.school_name || '',
          metadata: { recovery: true, new_trial_end: newTrialEnd },
        });
      } catch (_) {}
    }

    results.push(result);
    await new Promise(r => setTimeout(r, 150));
  }

  const emailsSent = results.filter(r => r.email_sent).length;
  const trialsExtended = results.filter(r => r.trial_extended).length;
  const errors = results.filter(r => r.error);

  console.log(`[recoverExpiredTrialUsers] Done. emails_sent=${emailsSent}, trials_extended=${trialsExtended}, errors=${errors.length}`);

  return Response.json({
    success: true,
    total_candidates: candidates.length,
    emails_sent: emailsSent,
    trials_extended: trialsExtended,
    new_trial_end: newTrialEnd,
    excluded_emails: EXCLUDE_EMAILS,
    results,
    errors: errors.map(r => ({ email: r.email, error: r.error })),
  });
});