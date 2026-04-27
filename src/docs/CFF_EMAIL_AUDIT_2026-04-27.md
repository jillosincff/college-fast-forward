# CFF Email Systems Audit
**Date:** April 27, 2026  
**Purpose:** Full inventory of every email-sending mechanism before activating the Engagement Agent  
**Status:** DO NOT ACTIVATE ENGAGEMENT AGENT until conflicts in Section 5 are resolved

---

## Section 1 — SendGrid Templates

CFF does **not** use SendGrid dynamic templates (template IDs). All emails are built as inline HTML in backend functions and sent via the SendGrid v3 `mail/send` API directly. There are no stored templates in the SendGrid dashboard to audit — all content lives in the functions listed in Section 2.

**SendGrid sender domains in use:**
- `support@collegefastforward.com` — default CFF sender
- `jill@collegefastforward.com` — personal Jill sender (trial emails, founding rate)
- `notifications@collegefastforward.com` — FastIQ scout/unanswered trigger

---

## Section 2 — Backend Functions That Send Email

### 2A. STUDENT-FACING (ONBOARDING / LIFECYCLE)

---

**`sendWelcomeEmail`**
- **Trigger:** Called manually from `StudentOnboarding.jsx` on completion, and from `AlumniOnboarding` for alumni helpers
- **Audience:** New student/gator users AND new alumni helpers
- **Content:** 
  - Students: "You're in — let's get you hired" — lists CFF features, CTA to set career goals
  - Alumni helpers: Personal thank-you from Jill, how the network works, CTA to view profile
- **Active:** ✅ Yes — fires on every new signup
- **From:** `support@collegefastforward.com`

---

**`sendOnboardingNudge`**
- **Trigger:** Called manually (no automation attached). Must be invoked explicitly with `userEmail` + `firstName`
- **Audience:** Students who signed up but haven't set career goals
- **Content:** "You're one step away — set your career goals (3 min)"
- **Active:** ⚠️ Function exists but no automation runs it. Appears to be called ad hoc or was planned but not scheduled.
- **From:** `support@collegefastforward.com`

---

**`sendStudentMigrationEmail`**
- **Trigger:** Admin-only, manual blast. One-time use for a list of 162 legacy students from CSV.
- **Audience:** Specific student list (hardcoded CSV in function). Non-CFF users being invited to re-join.
- **Content:** April urgency pitch — "internship offers going out, here's the new site"
- **Active:** ⚠️ One-time blast function. Has already been used for its intended purpose. Should not re-fire.
- **From:** `jill@collegefastforward.com`

---

**`sendReengagementEmail`**
- **Trigger:** Called by `runReengagementJob` (which is now **disabled** — returns early). Also callable standalone.
- **Audience:** Students/parents who haven't logged in for 7+ days
- **Content:** "Your network is waiting" / "We haven't seen you in X days" — shows pending follow-ups and next action CTA
- **Active:** ⚠️ Function exists and works, but `runReengagementJob` is disabled. Not currently firing.
- **From:** `support@collegefastforward.com`

---

**`runReengagementJob`**
- **Trigger:** Scheduled automation exists but the function itself returns early with `skipped: true` ("Weekly reengagement emails disabled")
- **Audience:** Parents and alumni — NOT students
- **Content:** 3-email lifecycle: Day 7 (matched questions), Day 21 (community growth), Day 45 (final/unsubscribe)
- **Active:** ❌ Explicitly disabled in code. Returns immediately without processing.
- **Note:** This was built for parents/alumni, not students. The Engagement Agent is for students. No conflict.

---

### 2B. FASTIQ TRIAL LIFECYCLE (ACTIVE — HIGH PRIORITY)

---

**`trialEmailScheduler`** (orchestrator — calls sub-functions below)
- **Trigger:** Scheduled automation — runs daily at 12:00 UTC (8am ET). **CURRENTLY ACTIVE.**
- **Audience:** Any user with `trial_start_date` set, `subscription_status !== 'active'`, and `fastiq_setup_complete !== true`
- **Logic:** Evaluates `daysLeft` and `daysSinceTrial` to decide which email to send
- **Active:** ✅ YES — runs every day, 22 successful runs so far

Sub-emails dispatched:

| Email | Condition | Content | From |
|---|---|---|---|
| `sendTrialDay5Email` | `daysLeft === 2` (2 days left) | "Trial ends in 2 days — lock in $14.50/mo Founding Rate" | `jill@collegefastforward.com` |
| `sendTrialPaymentReminderEmail` | `daysLeft === 1` + has Stripe customer | "Add a payment method before midnight" + Stripe portal link | `jill@collegefastforward.com` |
| `sendParentTrialEndingEmail` | `daysLeft === 1` + gifted by parent | Sent to the PARENT, not the student | `jill@collegefastforward.com` |
| `sendTrialDay7Email` | `daysSinceTrial === 7` | "Trial ends today — Founding Rate" | `jill@collegefastforward.com` |
| `sendTrialDay8Email` | `daysSinceTrial === 8` | "Trial has ended — reactivate at $14.50/mo" | `jill@collegefastforward.com` |

**⚠️ STALE CONTENT FLAG:** `sendTrialDay8Email` and `sendTrialDay7Email` both reference "April 15" as the Founding Rate deadline. The actual deadline is April 30. This is a live bug — students receiving these emails today are seeing wrong expiry dates.

---

### 2C. FASTIQ UPSELL / UPGRADE

---

**`sendFastIQNudgeEmail`**
- **Trigger:** Called manually from frontend components when user hits a paywalled FastIQ feature
- **Audience:** Free students who attempted a FastIQ feature
- **Content:** Trigger-specific variants: resume_scored, alumni_searched, idle_7_days, default. Shows FastIQ features + $29/mo CTA
- **Active:** ⚠️ Function exists but unclear if any frontend component currently calls it. No automation.
- **From:** `support@collegefastforward.com`

---

**`sendUpgradePrompt`**
- **Trigger:** Called manually when user hits a FastIQ feature gate
- **Audience:** Free students
- **Content:** "You found a FastIQ feature" — lists all FastIQ features, $29/mo CTA, Founding Rate note (April 15 — **stale**)
- **Active:** ⚠️ Function exists. Not called by any automation. May be called from frontend.
- **From:** `support@collegefastforward.com`

---

**`sendFoundingRateBlast`**
- **Trigger:** Scheduled automations (blast mode) AND single-user mode (called with userEmail)
- **Audience:** All non-upgraded users (trial active OR free member with persona set)
- **Content:** "X days left to lock in $14.50/mo — expires April 30"
- **Active:** ✅ YES — blasts scheduled for April 27 (today, 10am ET) and April 30 (9am ET). April 20 blast already ran.
- **From:** `jill@collegefastforward.com`

---

### 2D. FASTIQ ACTIVE-USER FEATURES

---

**`fastiqUnansweredTrigger`**
- **Trigger:** Scheduled automation — runs daily (cron). Looks for student JobRequests with 0 answers that are 72-78 hours old.
- **Audience:** Students whose questions got no responses after 72 hours
- **Content:** "Your question hasn't gotten a response yet — FastIQ found X alumni who can help" + upgrade CTA for free users
- **Active:** ✅ YES — active automation
- **From:** `notifications@collegefastforward.com`
- **Cap:** Max 2 per student per week, deduplicates by question ID

---

**`fastiqWeeklyAccountability`**
- **Trigger:** Scheduled automation exists but function returns early ("Weekly recap emails disabled")
- **Audience:** FastTrackProProfile users
- **Content:** Weekly stats (companies researched, alumni found, messages drafted)
- **Active:** ❌ Explicitly disabled in code

---

**`fastiqScoutDigest`**
- **Trigger:** Scheduled automation
- **Audience:** FastTrackProProfile users with `new_alerts_count > 0`
- **Content:** "FastIQ found N new opportunities for you" — lists scouted job postings
- **Active:** ✅ YES — active. Only fires when there are new scouted opportunities.
- **From:** `notifications@collegefastforward.com`

---

**`fastiqWeeklyScout`**
- **Trigger:** Scheduled automation (admin-only)
- **Audience:** FastTrackProProfile users with `assessment_complete: true` AND target companies set
- **Content:** Not an email — this is the data pipeline that populates ScoutedOpportunity records, which `fastiqScoutDigest` then emails about
- **Active:** ✅ YES
- **Note:** This does NOT send emails directly; it feeds `fastiqScoutDigest`

---

### 2E. PARENT-FACING

---

**`sendParentWelcomeEmail`**
- **Trigger:** Called from `ParentOnboarding.jsx` on completion
- **Audience:** New parent users
- **Content:** "Thank you for showing up for your kid" — explains how the network works, FastIQ upsell, CTA to complete profile
- **Active:** ✅ YES — fires on every new parent signup
- **From:** `support@collegefastforward.com`

---

**`sendWeeklyDigestEmail`**
- **Trigger:** Returns early immediately ("Weekly digest emails disabled")
- **Audience:** Was for students — FastIQ weekly activity summary
- **Active:** ❌ Explicitly disabled

---

### 2F. NOW-ACTIVE ENGAGEMENT AGENT (NEW)

---

**`runEngagementAgent`** → queues to **`dispatchApprovedEngagementEmails`**
- **Trigger:** Automation created but set as one-time (Apr 27 at 3:15am — may have already run). NOT yet a recurring daily automation.
- **Audience:** Students who signed up AFTER 2026-04-26 with no active trial / paid subscription
- **Content:** 5-email sequence (Day 0, 2, 5, 9, 14) — tiered by school parent count
- **Active:** ⏸️ HELD — emails go to `pending_approval` only. Nothing sends without manual approval.

---

## Section 3 — Active Automations Inventory

| Automation | Function | Schedule | Status | Last Run |
|---|---|---|---|---|
| Trial Email Scheduler | `trialEmailScheduler` | Daily 12:00 UTC (8am ET) | ✅ ACTIVE | Apr 26 |
| Daily Trial Expiry Check | `checkTrialExpiry` | Daily 01:00 UTC | ✅ ACTIVE | Apr 27 |
| FastIQ Unanswered Trigger | `fastiqUnansweredTrigger` | Daily (cron) | ✅ ACTIVE | Unknown |
| FastIQ Scout Digest | `fastiqScoutDigest` | Scheduled | ✅ ACTIVE | Unknown |
| FastIQ Weekly Scout | `fastiqWeeklyScout` | Weekly (admin) | ✅ ACTIVE | Unknown |
| Cleanup Expired Magic Links | `cleanupExpiredMagicLinks` | Daily 02:00 UTC | ✅ ACTIVE | Apr 27 |
| Founding Rate Blast — Apr 27 | `sendFoundingRateBlast` | One-time today 10am ET | ✅ ACTIVE (fires today) | Not yet |
| Founding Rate Blast — Apr 30 | `sendFoundingRateBlast` | One-time Apr 30 9am ET | ✅ ACTIVE | Not yet |
| CFF Engagement Agent | `runEngagementAgent` | One-time Apr 27 3:15am | ⏸️ HELD (pending_approval only) | Not yet |
| Founding Rate Blast — Apr 20 | `sendFoundingRateBlast` | One-time | ✅ ARCHIVED (ran) | Apr 20 |
| Daily Activity Nudges | `sendActivityNudges` | Daily | ❌ ARCHIVED | Apr 1 |
| Run Reengagement Job | `runReengagementJob` | Unknown | ⚠️ Function disabled | N/A |
| FastIQ Weekly Accountability | `fastiqWeeklyAccountability` | Weekly | ⚠️ Function disabled | N/A |
| Weekly Digest | `sendWeeklyDigestEmail` | Weekly | ⚠️ Function disabled | N/A |

---

## Section 4 — Event-Based Email Triggers (Action-Fired)

These fire on specific user actions — not on a schedule:

| Event | Function Called | Fires From | Active? |
|---|---|---|---|
| Student completes onboarding | `sendWelcomeEmail` | `StudentOnboarding.jsx` | ✅ Yes |
| Parent completes onboarding | `sendParentWelcomeEmail` | `ParentOnboarding.jsx` | ✅ Yes |
| Alumni helper completes onboarding | `sendWelcomeEmail` (helper variant) | `AlumniOnboarding.jsx` | ✅ Yes |
| Student hits FastIQ paywall | `sendUpgradePrompt` | Frontend component (if wired) | ⚠️ Unclear |
| Student hits FastIQ feature | `sendFastIQNudgeEmail` | Frontend component (if wired) | ⚠️ Unclear |
| Question unanswered 72h | `fastiqUnansweredTrigger` | Scheduled (daily scan) | ✅ Yes |
| New scouted opportunities | `fastiqScoutDigest` | Scheduled (when alerts > 0) | ✅ Yes |

---

## Section 5 — CONFLICT ANALYSIS: Engagement Agent vs Existing Emails

### CONFLICT 1 — HIGH SEVERITY: Day 0 Welcome Email vs `sendWelcomeEmail`
**Overlap:** Both fire within hours of signup for student users.
- `sendWelcomeEmail`: Fires immediately on `StudentOnboarding.jsx` completion. Content: FastIQ features + career goals CTA.
- `runEngagementAgent` Day 0: Fires within 24 hours. Content: "X parents from your school are here — set up your profile."

**Assessment:** These are **the same lifecycle moment** (just joined) but different angles — one is FastIQ-led, one is network-led. If both fire within the same day, the student gets 2 welcome emails. At small volume this may be tolerable, but it's not intentional design and will look disorganized at scale.

**Recommendation options:**
- A) **Retire `sendWelcomeEmail` for students** — let Day 0 Engagement Agent email BE the welcome. (Cleanest. Requires updating `StudentOnboarding.jsx` to NOT call `sendWelcomeEmail`.)
- B) **Add a 24h delay to Day 0** — change AGENT_LAUNCH_DATE logic so Day 0 fires day 1, not day 0. Gives `sendWelcomeEmail` its moment, then agent follows.
- C) **Keep both but differentiate clearly** — `sendWelcomeEmail` stays as the transactional "you're in" confirmation; Day 0 agent email becomes the first substantive network-context email, sent 24h later.

**My recommendation: Option B or C.** The welcome confirmation email (`sendWelcomeEmail`) has a clear transactional role — it's confirmation that the account exists. The Day 0 agent email has a different role — it's the first substantive engagement. Adding a delay or relabeling Day 0 as Day 1 cleanly separates them. **Do NOT retire `sendWelcomeEmail` without replacing it** — students need immediate signup confirmation.

---

### CONFLICT 2 — MEDIUM SEVERITY: Founding Rate Blast vs Day 0/2 Agent Emails
**Overlap:** `sendFoundingRateBlast` (blasting today April 27 and April 30) hits ALL non-upgraded users — including the 7 new students who are candidates for the Engagement Agent onboarding sequence.

- Blast: "Lock in $14.50/mo before April 30" — commercial urgency email
- Agent Day 0: "Here are the parents at your school" — relationship/network email
- Agent Day 2: "Here are 3 parents to know" — relationship/network email

**Assessment:** These are NOT conflicting in content — they're parallel messages. But a student who gets both a commercial urgency blast (today) AND a Day 0 welcome email (today or tomorrow from the agent) in the same 24-hour window is getting 2+ emails from CFF on day 1. That's aggressive.

**Recommendation:** 
- The Founding Rate blasts (Apr 27 + Apr 30) are time-critical commercial emails and should run as planned. They're about to expire.
- **Hold the Engagement Agent Day 0 email until May 1 for any student who received a Founding Rate blast within the last 48 hours.** This is a simple frequency cap — already partially in place (2 emails per 7 days). The existing frequency cap in `runEngagementAgent` WILL catch this, since `sendFoundingRateBlast` doesn't log to `EngagementEmail` entity. **This means the frequency cap only works if you add a cross-check against EmailLog.**
- Currently there IS NO cross-system frequency check. The Engagement Agent's 2-per-7-days cap only looks at its own `EngagementEmail` records, not at `sendFoundingRateBlast` sends.

---

### CONFLICT 3 — MEDIUM SEVERITY: Stale Founding Rate Dates in Trial Emails
**Overlap:** `sendTrialDay7Email` and `sendTrialDay8Email` both hardcode "April 15" as the Founding Rate deadline. The actual deadline is April 30. Any student whose trial ends in the next few days is receiving incorrect pricing deadline information.

**This is not a conflict with the Engagement Agent — it's a live content bug.**

**Recommendation:** Fix `sendTrialDay7Email` and `sendTrialDay8Email` to reference April 30 before any more trial emails go out. Low-effort fix.

---

### CONFLICT 4 — LOW SEVERITY: `fastiqUnansweredTrigger` vs Agent Day 2/5
**Overlap:** `fastiqUnansweredTrigger` fires when a student's question has no answer after 72 hours. The Engagement Agent Day 2 and Day 5 emails are also sent in the same window.

**Assessment:** Different content, different purpose. The unanswered trigger is reactive (your question has no answer). The agent emails are proactive (here's the network). Not a content conflict, but frequency could be an issue — again, no cross-system cap exists.

**Recommendation:** Low priority for now. Add a note to the Engagement Agent to eventually check `FastiqOutreachEmail` records for recent sends before queuing.

---

### NON-CONFLICT — Trial Emails
The trial scheduler (`trialEmailScheduler`) targets users with `trial_start_date` set. The Engagement Agent **explicitly skips** active trial users. These systems are already mutually exclusive. ✅ No conflict.

---

### NON-CONFLICT — Parent/Alumni Emails
The Engagement Agent only targets student/gator personas. Parent welcome emails, parent trial ending emails, and the re-engagement job (parents/alumni) do not overlap. ✅ No conflict.

---

## Section 6 — External Tools

**No Mailchimp, Klaviyo, ActiveCampaign, or other external ESP detected.** CFF uses SendGrid exclusively via direct API calls. No marketing automation platforms are in use. No mailing lists, sequences, or drip campaigns exist outside of this codebase.

---

## Section 7 — Recommendations Summary (For Your Decision)

| # | Issue | Severity | My Recommendation | Your Decision |
|---|---|---|---|---|
| 1 | Day 0 agent email + `sendWelcomeEmail` both fire on signup | HIGH | Option B: Add 24h delay to Day 0, or Option C: Let both send, clearly differentiated | PENDING |
| 2 | No cross-system frequency cap between Founding Rate blast and Agent emails | MEDIUM | Add EmailLog cross-check to Engagement Agent frequency cap before going live | PENDING |
| 3 | `sendTrialDay7Email` + `sendTrialDay8Email` say "April 15" deadline (wrong — it's April 30) | MEDIUM (live bug) | Fix immediately regardless of Engagement Agent status | PENDING |
| 4 | `fastiqUnansweredTrigger` + Agent Day 2/5 may hit same student in same week | LOW | Monitor at current volume; add cross-check in future | PENDING |
| 5 | `sendOnboardingNudge` — function exists, no automation, unclear if actively called | LOW | Verify if it's being called anywhere; if not, it's dead code | PENDING |
| 6 | `sendUpgradePrompt` + `sendFastIQNudgeEmail` — unclear if frontend calls these | LOW | Audit which frontend components call these before adding more upgrade emails | PENDING |

---

## Section 8 — Pre-Activation Checklist for Engagement Agent

Do NOT activate (switch from one-time to recurring) until these are resolved:

- [ ] **Decision on Conflict #1** — Day 0 timing vs welcome email
- [ ] **Fix #3** — Update April 15 date in trial Day 7/8 emails to April 30
- [ ] **Decision on Conflict #2** — Cross-system frequency cap (build it or accept the risk at current volume)
- [ ] **Founding Rate blast (April 27) completes** — today's blast fires at 10am ET; confirm it ran successfully before queuing agent emails for the same students
- [ ] **First agent dry run reviewed and approved** — confirm tier classifications look right
- [ ] **Rebecca intent check** — was she captured in intent segment? (See yesterday's status doc)