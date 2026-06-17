import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const SIXTY_DAYS_AGO = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
const INTENT_EVENTS = ['fastiq_feature_used', 'trial_ended', 'upgrade_clicked'];

const FROM_EMAIL = 'jill@collegefastforward.com';
const FROM_NAME = 'Jill Osinoff';
const SUBJECT = 'your friends are missing out (and so are you)';

function buildHtml(referralLink, email) {
  const enc = (s) => encodeURIComponent(s || '');
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;line-height:1.65;font-size:16px;padding:32px 24px;">

<p>hey —</p>

<p>if CLiFF has been useful to you, you already know the thing most students don't: <strong>warm intros beat cold applications every single time.</strong></p>

<p>but here's what a lot of people miss — the network gets more valuable the more people are in it. more students = more alumni paying attention = better matches for everyone.</p>

<p>so we're asking: who's one friend who's stressed about their job search right now?</p>

<p>not a blast to your whole contact list. just one person. the one who's been grinding on LinkedIn with nothing to show for it, or refreshing Handshake and feeling invisible.</p>

<p>forward them your referral link. that's it.</p>

<div style="margin:28px 0;">
  <a href="${referralLink}" style="background:#7c3aed;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">Share CLiFF with a friend →</a>
</div>

<p>when they sign up, they get access to our AI agent that finds hidden opportunities and identifies alumni at any company they care about.</p>

<p>don't keep this a secret. <strong>help your friends get hired.</strong></p>

<p style="color:#555;">— Jill and the College Fast Forward Team</p>

<hr style="border:none;border-top:1px solid #eee;margin:32px 0;">
<p style="font-size:12px;color:#aaa;">You're receiving this because you joined College Fast Forward. &nbsp;<a href="https://www.collegefastforward.com/unsubscribe?email=${enc(email)}" style="color:#aaa;">Unsubscribe</a></p>
</div>`;
}

function buildText(referralLink, email) {
  return `hey —

if CLiFF has been useful to you, you already know the thing most students don't: warm intros beat cold applications every single time.

but here's what a lot of people miss — the network gets more valuable the more people are in it. more students = more alumni paying attention = better matches for everyone.

so we're asking: who's one friend who's stressed about their job search right now?

not a blast to your whole contact list. just one person. the one who's been grinding on LinkedIn with nothing to show for it, or refreshing Handshake and feeling invisible.

forward them your referral link. that's it.

${referralLink}

when they sign up, they get access to our AI agent that finds hidden opportunities and identifies alumni at any company they care about.

don't keep this a secret. help your friends get hired.

— Jill and the College Fast Forward Team

---
Unsubscribe: https://www.collegefastforward.com/unsubscribe?email=${encodeURIComponent(email || '')}`;
}

async function sendViaSendGrid(apiKey, to, html, text) {
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: FROM_EMAIL, name: FROM_NAME },
      reply_to: { email: FROM_EMAIL },
      subject: SUBJECT,
      content: [
        { type: 'text/plain', value: text },
        { type: 'text/html', value: html },
      ],
    }),
  });
  return res;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    if (!SENDGRID_API_KEY) return Response.json({ error: 'SENDGRID_API_KEY not set' }, { status: 500 });

    const db = base44.asServiceRole.entities;

    // ── Load data ──
    const [allUsers, allEvents, allPrefs, allEmailLogs, allReferrals] = await Promise.all([
      db.User.list('-created_date', 5000),
      db.AnalyticsEvent.list('-created_date', 10000),
      db.EmailPreference.list('-created_date', 5000),
      db.EmailLog.list('-sent_at', 10000),
      db.ReferralLink.list('-created_date', 5000),
    ]);

    const recentEvents = allEvents.filter(e => new Date(e.created_date) >= new Date(SIXTY_DAYS_AGO));
    const recentEmailLogs = allEmailLogs.filter(e => e.sent_at && new Date(e.sent_at) >= new Date(THIRTY_DAYS_AGO));

    const isUpgraded = (u) => u.subscription_status === 'active' || u.membership_tier === 'fastiq' || u.fastiq_trial_active === true;
    const isUnsubscribed = (u) => {
      const pref = allPrefs.find(p => p.user_email?.toLowerCase() === u.email?.toLowerCase());
      return pref && pref.all_emails === false;
    };
    const hasIntentSignal = (u) => recentEvents.some(e =>
      e.user_email?.toLowerCase() === u.email?.toLowerCase() && INTENT_EVENTS.includes(e.event_name)
    );
    const wasRecentlyEmailed = (u) => recentEmailLogs.some(log =>
      log.user_email?.toLowerCase() === u.email?.toLowerCase() &&
      (log.email_type?.includes('fastiq') || log.email_type?.includes('paywall') ||
       log.subject?.toLowerCase().includes('fastiq') || log.subject?.toLowerCase().includes('correction'))
    );

    // ── Get eligible students (same logic as getCleanBlastLists) ──
    const eligible = allUsers.filter(u =>
      u.persona === 'student' &&
      !isUpgraded(u) &&
      !isUnsubscribed(u) &&
      !wasRecentlyEmailed(u) &&
      hasIntentSignal(u) &&
      u.email &&
      u.email.toLowerCase() !== 'jill@uffastforward.com'
    ).slice(0, 162);

    // ── Build referral code map ──
    const referralByEmail = {};
    for (const r of allReferrals) {
      if (r.referrer_email && r.code) {
        referralByEmail[r.referrer_email.toLowerCase()] = r.code;
      }
    }

    // ── Send emails ──
    let sent = 0;
    let failed = 0;
    const errors = [];

    for (const u of eligible) {
      const email = u.email;
      let code = referralByEmail[email.toLowerCase()];

      // Generate a code if none exists
      if (!code) {
        code = Math.random().toString(36).substring(2, 10).toUpperCase();
        try {
          await db.ReferralLink.create({
            referrer_email: email,
            referrer_id: u.id,
            code,
            created_date: new Date().toISOString(),
          });
          referralByEmail[email.toLowerCase()] = code;
        } catch (e) {
          // If creation fails, still attempt send with the generated code
        }
      }

      const referralLink = `https://www.collegefastforward.com?ref=${code}`;
      const html = buildHtml(referralLink, email);
      const text = buildText(referralLink, email);

      try {
        const res = await sendViaSendGrid(SENDGRID_API_KEY, email, html, text);
        if (res.ok || res.status === 202) {
          sent++;
        } else {
          const body = await res.text();
          failed++;
          errors.push({ email, status: res.status, error: body.slice(0, 200) });
        }
      } catch (e) {
        failed++;
        errors.push({ email, error: e.message });
      }

      await sleep(300);
    }

    return Response.json({
      success: true,
      total: eligible.length,
      sent,
      failed,
      errors,
    });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});