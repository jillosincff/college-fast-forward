# CFF Engagement Agent — End-of-Day Status
**Date:** Sunday, April 27, 2026  
**Author:** Build session w/ Base44 AI  
**Next review:** Monday, April 28, 2026 (first thing)

---

## What Was Built Today

### 1. Engagement Agent Infrastructure (Workflow 1: Onboarding Sequence)

**Backend function:** `functions/runEngagementAgent.js`
- Sequences: Day 0, 2, 5, 9, 14
- Tiered personalization: Tier 1 (25+ parents), Tier 2 (5–24 parents), Tier 3 (<5 parents OR <2 in student's target industry at school)
- Tier 3 leads with FastIQ/alumni path — never surfaces thin parent numbers
- Active/dormant variants on Day 9
- Profile complete/incomplete variants on Day 14
- All emails created with `status: pending_approval` — nothing sends without Jill's manual approval

**Routing gate (added today):**
- Active FastIQ trial users → skipped (logged as `active_fastiq_trial — routed to Trial Activation sequence (TBD)`)
- Paid subscribers → skipped (`paid_subscriber — no onboarding needed`)
- Trial-expired students → fall through to Workflow 1 (they didn't convert)
- No-trial students → Workflow 1 normally

**Safety rules in place:**
- Max 2 emails per student per 7 days (frequency cap)
- Skip if `reengagement_unsubscribed === true`
- Skip all students who signed up before `AGENT_LAUNCH_DATE` (2026-04-26) — legacy users never touched
- Skip if email already queued/sent for that sequence day (idempotent)

**Email dispatch function:** `functions/dispatchApprovedEngagementEmails.js`
- Only fires emails with `status: approved`
- Requires manual trigger from Engagement Agent Dashboard

**Entity:** `EngagementEmail`
- Tracks workflow, sequence_day, template_id, tier, fastiq_routing, status, personalization_data
- Full open/click/conversion tracking fields ready

---

### 2. Engagement Agent Dashboard (`/engagement-agent`)

- Live at `/#/engagement-agent`
- Tabs: Pending Approval | Approved | Sent | Rejected
- Per-email: preview body text + personalization data, approve/reject with one click
- Stats row: pending count, approved count, sent count, open rate, login rate
- Run Agent button (live or dry run)
- Send Approved button (manual dispatch trigger)
- **Intent Segment Panel** (see section 4 below)

---

### 3. AnalyticsEvent Instrumentation

Events now firing:

| Event | Where | Meaning |
|---|---|---|
| `fastiq_trial_started` | (existing) | User completed trial activation |
| `paywall_viewed` | `PaywallScreen.jsx` | Hit the upgrade screen |
| `checkout_started` | `PaywallScreen.jsx` | Clicked the CTA |
| `checkout_completed` | `PaywallScreen.jsx` | Returned from Stripe w/ success |
| `match_score_viewed` | `MatchScoreDashboard.jsx` | Saw score + locked profiles |
| `teaser_reveal_viewed` | `TeaserReveal.jsx` | Saw blurred alumni leads (funnel) |
| `fastiq_leads_viewed` | `FreeTierAlumniNetworkTab.jsx` | Viewed blurred in-app alumni profiles |

---

### 4. Intent Segment Infrastructure

**Backend:** `functions/getIntentSegment.js`
- Queries all intent events, excludes users with `fastiq_trial_started`
- Returns ranked segment by intent strength: paywall_viewed (4) > match_score_viewed (3) > teaser/leads_viewed (2)
- Returns per-user: email, events list, strongest signal, last activity timestamp

**Dashboard panel:** `components/engagement/IntentSegmentPanel.jsx`
- Shows total segment size + breakdown by signal type
- Per-user list with intent badges and recency
- "Friction sequence needed" callout with priority guidance

**Current segment count as of tonight:** 0 (all 19 FastIQ trial starters are excluded)
- Segment will populate as volume grows and some users evaluate-but-don't-trial

---

## What Is NOT Live / Not Running

| Item | Status | Reason |
|---|---|---|
| Daily automation (scheduled run) | **NOT CREATED** | Deliberately deferred — Jill reviews first |
| Onboarding emails in `pending_approval` | **0 emails queued** | Agent hasn't been run against live students yet |
| Trial Activation sequence (Workflow 2) | **Not built** | TBD — referenced in routing gate as future work |
| Re-engagement sequence | **Not built** | Separate from this agent |
| SendGrid dispatch | **Manual only** | Must click "Send N approved" in dashboard |

**Nothing will trigger overnight.** No scheduled automations exist for this agent. No emails are in `approved` status. The system is fully at rest.

---

## The 7 Students — Current Hold State

These are the first students who signed up after `AGENT_LAUNCH_DATE` (2026-04-26) and are eligible for Workflow 1.

| Status | Meaning |
|---|---|
| All 7 are in the system | Signed up after the cutoff, are `student`/`gator` persona |
| No emails queued yet | Agent has not been run in live mode against them |
| Routing gate will evaluate each | Active trial → skip; paid → skip; no trial → Workflow 1 |
| Held until Jill runs agent | Manual trigger required from dashboard |

**To queue emails for these students tomorrow:** Go to `/engagement-agent` → click "Run Agent" (not Dry Run) → emails appear in Pending Approval → Jill reviews each → click "Send N approved."

---

## Decisions Pending for Tomorrow

### 1. Rebecca Intent Check (PRIORITY FIRST THING)
- **Check:** Does Rebecca appear in the Intent Segment panel on `/engagement-agent`?
- **If YES:** Retroactive tracking worked. Her `fastiq_leads_viewed` / `teaser_reveal_viewed` events were captured.
- **If NO:** Instrumentation gap. Investigate:
  - Was she using the in-app alumni tab (`FreeTierAlumniNetworkTab`)? → `fastiq_leads_viewed` should fire
  - Was she using the FastIQ funnel (`TeaserReveal`)? → `teaser_reveal_viewed` should fire
  - Was she on `PaywallScreen`? → `paywall_viewed` should fire
  - Check `AnalyticsEvent` entity directly, filter by her email
  - The gap may be that events weren't being fired before today's instrumentation work

### 2. Run Agent or Continue Dry Run?
- First run in dry run mode to review which students get which tier/template
- Confirm tier classifications look right before going live
- Then run live → review all pending_approval emails before approving any

### 3. Decide: Daily Automation Timing
- What time should the agent run daily? (Suggested: 9:30am ET)
- Who gets approval rights? (Currently: anyone who can reach `/engagement-agent`)
- Target turnaround: approve same day → sends ~24h after signup

### 4. Workflow 2: Trial Activation Sequence
- Students on active FastIQ trial are currently being routed to "TBD"
- Need: what does this sequence look like? How many days? What's the conversion goal?
- Build can happen in a single session once design is decided

### 5. Friction Sequence for Intent Segment
- The intent-but-no-trial segment is instrumented and surfaced
- Need: email sequence designed specifically for "you evaluated, here's what you're missing"
- Different from onboarding — assumes they already saw the paywall, address the specific friction

---

## File Map — What Was Created/Modified Today

### New files
- `functions/runEngagementAgent.js` — main agent logic
- `functions/dispatchApprovedEngagementEmails.js` — sends approved emails via SendGrid
- `functions/getIntentSegment.js` — intent segment query
- `entities/EngagementEmail.json` — email queue entity
- `pages/EngagementAgentDashboard.jsx` — Jill's review dashboard
- `components/engagement/IntentSegmentPanel.jsx` — intent segment UI
- `components/adminv2/FastIQTrialPanel.jsx` — FastIQ trial overview in admin

### Modified files
- `pages/AdminV2.jsx` — added Engagement Agent link + FastIQ panel
- `components/fastiq-funnel/PaywallScreen.jsx` — added analytics tracking
- `components/fastiq-funnel/MatchScoreDashboard.jsx` — added analytics tracking
- `components/fastiq-funnel/TeaserReveal.jsx` — added analytics tracking
- `components/free-tier/FreeTierAlumniNetworkTab.jsx` — added `fastiq_leads_viewed` tracking

---

## System State Confirmation

- ✅ No scheduled automations running for engagement agent
- ✅ No emails in `pending_approval` or `approved` state
- ✅ Legacy students (pre-2026-04-26) will never be touched by this agent
- ✅ Active FastIQ trial users are excluded from onboarding emails
- ✅ All dispatch is manual — nothing sends without human action
- ✅ Intent segment populated from real-time analytics — no overnight processing

**Safe to close for the night.**