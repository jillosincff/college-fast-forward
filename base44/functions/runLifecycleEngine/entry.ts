import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * CFF Lifecycle Engagement Engine
 * 
 * Classifies students into 3 lifecycle segments and writes draft emails
 * into EngagementEmail (workflow="lifecycle", status="pending_approval").
 * In autonomous mode (GlobalSettings.autonomous_lifecycle_mode=true),
 * writes status="approved" so dispatchApprovedEngagementEmails sends them.
 *
 * Segments:
 *   1. never_activated  — signed up 3+ days ago, no core action taken
 *   2. gone_quiet       — was active, silent 7–60 days
 *   3. cliff_ready      — free tier, active ≤30 days, hit paywall
 *
 * Hard rules:
 *   - Max 1 lifecycle email per user per 7-day rolling window
 *   - Never same email_type twice for the same user
 *   - Skip reengagement_unsubscribed=true or EmailPreference.reengagement_emails=false
 */

const daysAgo = (d) =>
  d ? (Date.now() - new Date(d).getTime()) / 86_400_000 : Infinity;

const todayStr = () => new Date().toISOString().slice(0, 10);

const firstName = (n) =>
  (n || "").split(" ")[0] || "there";

const enc = (s) => encodeURIComponent(s || "");

// ── Email templates ───────────────────────────────────────────────────────────

function templateNeverActivated(user) {
  const name = firstName(user.full_name);
  const school = (user.school_name && user.school_name !== "Unknown")
    ? ` at ${user.school_name}` : "";
  const daysSince = Math.round(daysAgo(user.created_date));

  const subjects = [
    "your job search is waiting",
    "one move. that's all it takes.",
    "still here when you're ready 👋",
    "the shortcut you haven't used yet",
  ];
  const subject = subjects[Math.floor(Math.random() * subjects.length)];

  const text = `hey ${name} —

you signed up for CFF${school} ${daysSince} days ago but haven't taken a first step yet. totally normal. but here's the thing: the students who land roles fastest aren't the ones with the best resumes. they're the ones who start first.

one action is all it takes:

→ run your first alumni search — find someone at a company you care about
→ upload your resume — so you're ready when the right contact shows up
→ track an application — keep your pipeline organized from day one

any of those. pick one. takes 2 minutes.

cold applications go nowhere. one warm intro changes everything.

collegefastforward.com

— CFF

p.s. this isn't a guilt trip. just a nudge from someone who's seen the difference it makes.

---
You're receiving this because you joined College Fast Forward.
Unsubscribe: https://collegefastforward.com/unsubscribe?email=${enc(user.email)}`;

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;line-height:1.65;font-size:16px;padding:32px 24px;">
<p>hey ${name} —</p>
<p>you signed up for CFF${school} ${daysSince} days ago but haven't taken a first step yet. totally normal. but here's the thing: the students who land roles fastest aren't the ones with the best resumes. <strong>they're the ones who start first.</strong></p>
<p>one action is all it takes:</p>
<ul style="padding-left:20px;line-height:2.2;">
<li>run your first <strong>alumni search</strong> — find someone at a company you care about</li>
<li>upload your <strong>resume</strong> — so you're ready when the right contact shows up</li>
<li>track an <strong>application</strong> — keep your pipeline organized from day one</li>
</ul>
<p>any of those. pick one. takes 2 minutes.</p>
<div style="margin:28px 0;"><a href="https://www.collegefastforward.com" style="background:#2563eb;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">Find an alumni now →</a></div>
<p>cold applications go nowhere. <strong>one warm intro changes everything.</strong></p>
<p style="color:#555;">— CFF</p>
<p style="font-size:13px;color:#999;">p.s. this isn't a guilt trip. just a nudge from someone who's seen the difference it makes.</p>
<hr style="border:none;border-top:1px solid #eee;margin:32px 0;">
<p style="font-size:12px;color:#aaa;">You're receiving this because you joined College Fast Forward. &nbsp;<a href="https://collegefastforward.com/unsubscribe?email=${enc(user.email)}" style="color:#aaa;">Unsubscribe</a></p>
</div>`;

  return { subject, text, html, email_type: "lifecycle_never_activated_v1",
    personalization: { days_since_signup: daysSince, school } };
}

function templateGoneQuiet(user, pipelineByEmail) {
  const name = firstName(user.full_name);
  const daysSilent = Math.round(daysAgo(user.last_active_at));

  const entries = (pipelineByEmail[user.email] || [])
    .sort((a, b) => new Date(b.updated_date).getTime() - new Date(a.updated_date).getTime());
  const latest = entries[0];
  const entryCompany = latest?.company || null;
  const entryTitle = latest?.job_title || null;
  const entryStatus = latest?.status || null;

  const subjects = entryCompany
    ? [
        `your ${entryCompany} app — worth a follow-up?`,
        "don't let this one go cold",
        `still thinking about ${entryCompany}?`,
        "your pipeline needs a nudge",
      ]
    : [
        "the job market didn't slow down",
        "your alumni network is still there",
        "one intro. that's the difference.",
        "the search picks back up when you do",
      ];
  const subject = subjects[Math.floor(Math.random() * subjects.length)];

  const pipelineBlurb = latest
    ? `you've got "${entryTitle || "a tracked role"}" at ${entryCompany} sitting at "${entryStatus}" — has anything moved? even a quick status update keeps your pipeline honest and your head in the game.`
    : `you had some real momentum going. the alumni network you have access to through CFF doesn't get stale — those contacts are still there waiting.`;

  const text = `hey ${name} —

it's been about ${daysSilent} days since you were last on CFF. no big deal — job search has peaks and valleys. just didn't want you to lose ground.

${pipelineBlurb}

the cold application black hole is real. submitting to an ATS and waiting is a coin flip at best. but one message to an alum at the company? changes the odds entirely. warm intros work because they bypass the noise.

your school's network is one of the most underused things in your arsenal. it's already there.

collegefastforward.com

— CFF

p.s. even 10 minutes of outreach today beats a week of waiting.

---
You're receiving this because you joined College Fast Forward.
Unsubscribe: https://collegefastforward.com/unsubscribe?email=${enc(user.email)}`;

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;line-height:1.65;font-size:16px;padding:32px 24px;">
<p>hey ${name} —</p>
<p>it's been about <strong>${daysSilent} days</strong> since you were last on CFF. no big deal — job search has peaks and valleys. just didn't want you to lose ground.</p>
<p>${pipelineBlurb}</p>
<p>the cold application black hole is real. <strong>submitting to an ATS and waiting is a coin flip at best.</strong> but one message to an alum at the company? changes the odds entirely. warm intros work because they bypass the noise.</p>
<p>your school's network is one of the most underused things in your arsenal. <strong>it's already there.</strong></p>
<div style="margin:28px 0;"><a href="https://www.collegefastforward.com" style="background:#2563eb;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">Jump back in →</a></div>
<p style="color:#555;">— CFF</p>
<p style="font-size:13px;color:#999;">p.s. even 10 minutes of outreach today beats a week of waiting.</p>
<hr style="border:none;border-top:1px solid #eee;margin:32px 0;">
<p style="font-size:12px;color:#aaa;">You're receiving this because you joined College Fast Forward. &nbsp;<a href="https://collegefastforward.com/unsubscribe?email=${enc(user.email)}" style="color:#aaa;">Unsubscribe</a></p>
</div>`;

  return { subject, text, html, email_type: "lifecycle_gone_quiet_v1",
    personalization: { days_silent: daysSilent, tracked_company: entryCompany,
      tracked_title: entryTitle, tracked_status: entryStatus } };
}

function templateCliffReady(user, paywallCount) {
  const name = firstName(user.full_name);

  const subjects = [
    "your job search — one place, $4.99/wk",
    "unlimited tracking. less than a coffee.",
    "the upgrade that pays for itself",
    "you've hit the limit. here's the unlock.",
    "CLIFF: your entire job search, automated",
  ];
  const subject = subjects[Math.floor(Math.random() * subjects.length)];

  const hitNote = paywallCount > 1
    ? `you've hit the wall ${paywallCount}x now.`
    : `you hit the paywall — which means you're actually using this thing.`;

  const text = `hey ${name} —

${hitNote} that's a good sign. it means you're working your search.

here's what CLIFF unlocks:

✓ unlimited application tracking — no 5-app cap
✓ auto-tracking — CLIFF spots new applications so you don't have to log them
✓ AI next-step suggestions for every tracked role
✓ automated follow-up nudges so no opportunity goes cold
✓ full pipeline — every company, every contact, every status in one place

$4.99/week. less than a coffee. billed as $19.96/month. cancel anytime.

your entire job search. one place.

collegefastforward.com/upgrade

— CFF

p.s. the students on CLIFF send 3x more follow-ups and track 4x more contacts. the difference compounds fast.

---
You're receiving this because you joined College Fast Forward.
Unsubscribe: https://collegefastforward.com/unsubscribe?email=${enc(user.email)}`;

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;line-height:1.65;font-size:16px;padding:32px 24px;">
<p>hey ${name} —</p>
<p>${hitNote} that's a good sign. <strong>it means you're working your search.</strong></p>
<p>here's what <strong>CLIFF</strong> unlocks:</p>
<ul style="padding-left:20px;line-height:2.2;">
<li>✓ <strong>unlimited application tracking</strong> — no 5-app cap</li>
<li>✓ <strong>auto-tracking</strong> — CLIFF spots new applications so you don't have to log them</li>
<li>✓ <strong>AI next-step suggestions</strong> for every tracked role</li>
<li>✓ <strong>automated follow-up nudges</strong> so no opportunity goes cold</li>
<li>✓ <strong>full pipeline</strong> — every company, every contact, every status in one place</li>
</ul>
<div style="background:#f0f7ff;border-left:4px solid #2563eb;padding:16px 20px;margin:24px 0;border-radius:4px;">
<p style="margin:0;font-size:20px;font-weight:700;">$4.99/week. Less than a coffee.</p>
<p style="margin:6px 0 0;color:#555;font-size:14px;">Billed as $19.96/month. Cancel anytime.</p>
</div>
<p><strong>Your entire job search. One place.</strong></p>
<div style="margin:28px 0;"><a href="https://www.collegefastforward.com/upgrade" style="background:#2563eb;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">Unlock CLIFF →</a></div>
<p style="color:#555;">— CFF</p>
<p style="font-size:13px;color:#999;">p.s. the students on CLIFF send 3x more follow-ups and track 4x more contacts. the difference compounds fast.</p>
<hr style="border:none;border-top:1px solid #eee;margin:32px 0;">
<p style="font-size:12px;color:#aaa;">You're receiving this because you joined College Fast Forward. &nbsp;<a href="https://collegefastforward.com/unsubscribe?email=${enc(user.email)}" style="color:#aaa;">Unsubscribe</a></p>
</div>`;

  return { subject, text, html, email_type: "lifecycle_cliff_ready_v1",
    personalization: { paywall_hit_count: paywallCount } };
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Allow both admin users and service-role callers (automation triggers)
    let isAdmin = false;
    let isService = false;
    try {
      const user = await base44.auth.me();
      isAdmin = user?.role === "admin";
    } catch {
      isService = true; // no authenticated user = service/automation caller
    }

    if (!isAdmin && !isService) {
      return Response.json({ error: "Admin only" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const dryRun    = body.dry_run === true;
    const statsOnly = body.stats_only === true;
    const today     = todayStr();

    const db = base44.asServiceRole.entities;

    // ── Settings ──
    const settingsRaw = await db.GlobalSettings.list();
    const settingMap = {};
    for (const s of settingsRaw) settingMap[s.setting_key] = s.value;
    const autonomousMode = settingMap["autonomous_lifecycle_mode"] === true
      || settingMap["autonomous_lifecycle_mode"] === "true";

    // ── Load all students ──
    const allUsers = await db.User.list();
    const students = allUsers.filter((u) =>
      u.role === "user" && (u.persona === "student" || !u.persona)
    );

    // ── Unsubscribe list ──
    const emailPrefs = await db.EmailPreference.list();
    const optedOut = new Set(
      emailPrefs
        .filter((p) => p.reengagement_emails === false || p.all_emails === false)
        .map((p) => p.user_email)
    );

    // ── Existing lifecycle emails for dedup ──
    const allEngagementEmails = await db.EngagementEmail.list();
    const lifecycleEmails = allEngagementEmails.filter((e) => e.workflow === "lifecycle");
    const lifecycleByEmail = {};
    for (const e of lifecycleEmails) {
      if (!lifecycleByEmail[e.user_email]) lifecycleByEmail[e.user_email] = [];
      lifecycleByEmail[e.user_email].push(e);
    }

    // ── Pipeline data ──
    const allPipeline = await db.NetworkingPipeline.list();
    const pipelineCountByEmail = {};
    const pipelineByEmail = {};
    for (const p of allPipeline) {
      if (!p.user_email) continue;
      pipelineCountByEmail[p.user_email] = (pipelineCountByEmail[p.user_email] || 0) + 1;
      if (!pipelineByEmail[p.user_email]) pipelineByEmail[p.user_email] = [];
      pipelineByEmail[p.user_email].push(p);
    }

    // ── Paywall analytics ──
    const allEvents = await db.AnalyticsEvent.list();
    const paywallNames = new Set(["paywall_shown", "upgrade_clicked"]);
    const paywallByEmail = {};
    for (const ev of allEvents) {
      if (paywallNames.has(ev.event_name) && ev.user_email) {
        paywallByEmail[ev.user_email] = (paywallByEmail[ev.user_email] || 0) + 1;
      }
    }

    // ── Classify ──
    const toProcess = [];
    const counters = {
      never_activated: 0, gone_quiet: 0, cliff_ready: 0,
      skip_unsub: 0, skip_7day: 0, skip_dedup: 0, skip_today: 0, skip_nosegment: 0
    };

    for (const u of students) {
      // Skip unsubscribed
      if (u.reengagement_unsubscribed === true || optedOut.has(u.email)) {
        counters.skip_unsub++; continue;
      }

      const userLC = lifecycleByEmail[u.email] || [];

      // 7-day rolling window
      const recentSent = userLC.find((e) => {
        const ref = e.sent_at || (["sent","approved"].includes(e.status) ? e.created_date : null);
        return ref && daysAgo(ref) < 7;
      });
      if (recentSent) { counters.skip_7day++; continue; }

      // Already generated today
      const todayDraft = userLC.find((e) =>
        (e.created_date || "").slice(0, 10) === today
      );
      if (todayDraft) { counters.skip_today++; continue; }

      const signupAge   = daysAgo(u.created_date);
      const hasResume   = !!(u.resume_url);
      const hasSearch   = !!(u.has_searched_alumni || u.alumni_search_used);
      const hasPipeline = (pipelineCountByEmail[u.email] || 0) > 0;
      const hasCoreAction = hasResume || hasSearch || hasPipeline;
      const paywallCount  = paywallByEmail[u.email] || 0;

      // ── Segment 3 first (highest value) — CLIFF-ready ──────────────────
      const isFree         = u.subscription_status !== "active";
      const activeRecently = daysAgo(u.updated_date) <= 30;

      if (isFree && activeRecently && paywallCount > 0) {
        const already = userLC.find((e) => e.template_id === "lifecycle_cliff_ready_v1");
        if (already) { counters.skip_dedup++; continue; }
        counters.cliff_ready++;
        toProcess.push({ user: u, segment: "cliff_ready", paywallCount,
          trigger: `Free tier. Active within 30 days. Hit paywall ${paywallCount}x.` });
        continue;
      }

      // ── Segment 1 — Never-Activated ──────────────────────────────────────
      if (signupAge >= 3 && !hasCoreAction) {
        const already = userLC.find((e) => e.template_id === "lifecycle_never_activated_v1");
        if (already) { counters.skip_dedup++; continue; }
        counters.never_activated++;
        toProcess.push({ user: u, segment: "never_activated",
          trigger: `Signed up ${Math.round(signupAge)}d ago. No resume, alumni search, or pipeline entry.` });
        continue;
      }

      // ── Segment 2 — Gone-Quiet ────────────────────────────────────────────
      const daysSilent = daysAgo(u.updated_date);
      const wasActive  = hasCoreAction || (u.platform_visit_count || 0) > 0;

      if (wasActive && daysSilent >= 7 && daysSilent <= 60) {
        const already = userLC.find((e) => e.template_id === "lifecycle_gone_quiet_v1");
        if (already) { counters.skip_dedup++; continue; }
        counters.gone_quiet++;
        toProcess.push({ user: u, segment: "gone_quiet",
          trigger: `Was active. Silent for ${Math.round(daysSilent)} days.` });
        continue;
      }

      counters.skip_nosegment++;
    }

    const stats = {
      total_students: students.length,
      ...counters,
      to_generate: toProcess.length,
      mode: autonomousMode ? "autonomous" : "draft",
      dry_run: dryRun,
    };

    if (statsOnly || dryRun || toProcess.length === 0) {
      return Response.json({ success: true, stats, emails: [] });
    }

    // ── Generate & write ──
    const results = [];
    for (const item of toProcess) {
      const { user: u, segment, paywallCount, trigger } = item;
      try {
        let tmpl;
        if      (segment === "never_activated") tmpl = templateNeverActivated(u);
        else if (segment === "gone_quiet")      tmpl = templateGoneQuiet(u, pipelineByEmail);
        else                                    tmpl = templateCliffReady(u, paywallCount || 0);

        const status = autonomousMode ? "approved" : "pending_approval";
        const now    = new Date().toISOString();

        const record = {
          user_id:              u.id,
          user_email:           u.email,
          user_name:            firstName(u.full_name),
          school_code:          u.school_code || "",
          workflow:             "lifecycle",
          sequence_day:         0,
          template_id:          tmpl.email_type,

          subject:              tmpl.subject,
          body_html:            tmpl.html,
          body_text:            tmpl.text,
          personalization_data: { ...tmpl.personalization, trigger_reason: trigger, run_date: today },
          status,
          frequency_check_passed: true,
          scheduled_send_at:    now,
          resulted_in_login:    false,
          resulted_in_profile_completion: false,
          resulted_in_trial_start: false,
          resulted_in_conversion: false,
        };

        if (autonomousMode) {
          record.approved_at  = now;
          record.approved_by  = "lifecycle_agent";
        }

        const created = await db.EngagementEmail.create(record);
        results.push({
          id:      created.id,
          email:   u.email,
          segment,
          subject: tmpl.subject,
          status,
        });
      } catch (err) {
        results.push({ email: u.email, segment, error: err.message });
      }
    }

    const created = results.filter(r => !r.error).length;
    const errors  = results.filter(r =>  r.error).length;

    return Response.json({
      success: true,
      stats,
      created,
      errors,
      autonomous_mode: autonomousMode,
      emails: results,
    });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});