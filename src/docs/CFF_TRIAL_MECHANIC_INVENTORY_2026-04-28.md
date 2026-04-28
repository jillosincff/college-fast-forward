# CFF Trial Mechanic Inventory — Full Reference
**Date:** April 28, 2026  
**Purpose:** Complete inventory of every place in CFF that references trial duration, credit card requirement, or trial-to-paid conversion mechanics. Generated BEFORE any updates ship. Review with fresh eyes tomorrow morning before touching anything.  
**Status:** INVENTORY ONLY — do not update anything until reviewed April 29.

---

## AUTOMATION PAUSE STATE (as of tonight, April 28)

| Automation | ID | Status | Notes |
|---|---|---|---|
| Trial Email Scheduler | `69d4...` (recurring, 12:00 UTC) | ✅ **STILL ACTIVE** | ⚠️ Could not pause — ID truncated in list API response. **MANUAL ACTION REQUIRED:** Go to dashboard → automations → pause "Trial Email Scheduler" before 12:00 UTC (8am ET) tomorrow. |
| Founding Rate Blast — April 30 | `69e4f08eb0ea8416defc2e30` | ⏸️ **PAUSED** | Will not fire on April 30 until reactivated |
| CFF Engagement Agent — Daily Queue Builder | `69ee9134ed487656af3d589e` | ⏸️ **PAUSED** | Was a one-time for today; paused |
| Correction Email — April 15 deadline bug | `69eec71a636a05cebb9dfa3d` | ✅ **ACTIVE** | Fires at 9:30am ET tomorrow — INTENTIONALLY LEFT ACTIVE (no trial mechanic references) |
| Founding Rate Blast — April 27 | `69e4f08eb0ea8416defc2e2f` | ❌ ARCHIVED (already ran, failed) | No action needed |
| Daily Trial Expiry Check | `69d6dd9b9ec0e3321c6b7cb7` | ✅ ACTIVE | Not email-related — just marks records; safe to keep |
| Cleanup Expired Magic Links | `69da178ecd4886ca9c099946` | ✅ ACTIVE | Unrelated — safe |

### ⚠️ CRITICAL ACTION FOR TOMORROW MORNING
**Before 8am ET: Manually pause "Trial Email Scheduler" from the automations dashboard.**
- Go to: Dashboard → Automations → Trial Email Scheduler → Toggle off
- This sends sendTrialDay5Email, sendTrialDay7Email, sendTrialDay8Email — all reference old 7-day model
- The API ID was truncated and could not be paused programmatically tonight

---

## CONFIRMED PAUSED / NOT FIRING TOMORROW

| Send | Status | Reason |
|---|---|---|
| Founding Rate Blast (April 30) | ⏸️ PAUSED | Automation paused tonight. References trial mechanics need rewrite before refiring. |
| CFF Engagement Agent daily queue | ⏸️ PAUSED | Paused tonight. Engagement agent emails that reference FastIQ trial mechanics need review. |
| sendTrialDay5Email | ⚠️ SCHEDULER NEEDS MANUAL PAUSE | If scheduler runs at 8am, this WILL fire for users with daysLeft===2. |
| sendTrialDay7Email | ⚠️ SCHEDULER NEEDS MANUAL PAUSE | References "trial ends today" — based on 7-day model. |
| sendTrialDay8Email | ⚠️ SCHEDULER NEEDS MANUAL PAUSE | References "trial has ended" — based on 7-day model. |

## CONFIRMED STILL FIRING TOMORROW

| Send | Status | Reason |
|---|---|---|
| Correction Email (9:30am ET) | ✅ FIRES | References April 30 deadline only — no trial mechanics |
| fastiqUnansweredTrigger | ✅ FIRES | No trial mechanic references |
| fastiqScoutDigest | ✅ FIRES | No trial mechanic references |
| sendWelcomeEmail (on signup) | ✅ FIRES | Mentions "FastIQ" + career goals CTA but no trial terms explicitly |
| sendParentWelcomeEmail (on signup) | ✅ FIRES | FastIQ pitch in body but no trial duration/CC terms |

---

## THE 16 GRANDFATHERED USERS

These users started trials BEFORE the April 29 cutoff (`NEW_TRIAL_CUTOFF = 2026-04-29T00:00:00Z`). They remain on the original 7-day no-credit-card terms. New rules (5-day, CC required, auto-convert) do NOT apply to them.

**From database query (trial_status: active, no stripe_subscription_id, sorted by trial_start_date):**

> Note: The database query returned 2 users with trial_status=active at time of query. The "16 grandfathered users" referenced in prior planning were identified via analytics logs and are listed below from the recreateExpiredTrialUsers function which was previously committed:

| # | Name | Email | Trial Started | Trial End | Persona | School | Notes |
|---|---|---|---|---|---|---|---|
| 1 | Karen Buxton | karenbuxton@comcast.net | 2026-04-19 | 2026-04-26 | student | College of Charleston | Trial may be expired — check |
| 2 | M Schaefer | mschaefer1129@yahoo.com | 2026-04-17 | 2026-04-24 | parent | University of Florida | Trial may be expired — check |
| 3 | Lexie Stant | lexiestant@gmail.com | 2026-04-16 | 2026-04-23 | student | University of Florida | Trial may be expired — check |
| 4 | Jackson Whitcomb | jacksonwhitcomb@ufl.edu | 2026-04-16 | 2026-04-23 | student | University of Florida | Trial may be expired — check |
| 5 | Brendan Schaefer | brendanschaefer15@gmail.com | 2026-04-16 | 2026-04-23 | student | University of Florida | Trial may be expired — check |
| 6 | Moss Rex | mossrex@ufl.edu | 2026-04-15 | 2026-04-22 | gator | University of Florida | Trial may be expired — check |
| 7 | Ankes | ankes@umich.edu | 2026-04-16 | 2026-04-23 | student | University of Michigan | Trial may be expired — check |
| 8 | Callista Seago | callista.seago@gmail.com | 2026-04-10 | 2026-05-04 | student | University of Florida | Trial_end extended — still active |
| 9–16 | Additional users | (see recreateExpiredTrialUsers function + AnalyticsEvent entity) | Various | Various | Various | Various | Check `trial_status` field |

**Key facts for grandfathered users:**
- They get the 7-day, no-credit-card model
- Founding Rate ($14.50/month) still available to them if they convert, regardless of April 30 deadline
- They should receive a short email tomorrow confirming they keep their original terms (on tomorrow's task list)
- `checkTrialExpiry` is still running and may expire them based on trial_end_date — **verify trial_end_date values are correct before tomorrow's run**

---

## FULL INVENTORY: TRIAL MECHANIC REFERENCES

### CATEGORY 1 — EMAIL TEMPLATES (Backend Functions)

---

#### `sendTrialDay5Email` (`functions/sendTrialDay5Email.js`)
- **Audience:** User-facing
- **Trial mechanic references:**
  - Old model (legacy): "Trial ends in X days — lock in $14.50/mo" — references the trial end date
  - New model variant (just added tonight): "Your 5-day trial ends tomorrow — your card on file will be charged automatically"
  - Gifted student path: "Your parent gave you access to FastIQ — your trial ends in X days"
  - Parent path: "Your student's trial ends in X days"
- **Old language:** "Trial ends in 2 days" — calibrated for 7-day model where Day 5 = daysLeft===2
- **Status:** Partially updated tonight (new model variant added). Old model paths still exist for grandfathered users. Gifted path still says "access to FastIQ" (removed hardcoded "7 days").
- **Priority:** **MUST-FIX-BEFORE-RELAUNCH** — old model copy still active for grandfathered users

---

#### `sendTrialDay7Email` (`functions/sendTrialDay7Email.js`)
- **Audience:** User-facing
- **Trial mechanic references:**
  - Subject: "Your FastIQ trial ends today"
  - Body: "Lock in your rate before your trial ends on [trialEndDate]"
  - Founding Rate CTA: $14.50/month
- **Old language:** Entire email is premised on a 7-day trial. No concept of 5-day model.
- **Status:** Only fires for grandfathered users (via `!isNewModel && daysSinceTrial === 7` guard added tonight). NOT fired for new model users.
- **Priority:** **CAN-WAIT** — guarded to grandfathered users only. Can archive once all 16 grandfathered users pass day 7. But copy should be reviewed for accuracy.

---

#### `sendTrialDay8Email` (`functions/sendTrialDay8Email.js`)
- **Audience:** User-facing
- **Trial mechanic references:**
  - Subject: "Your FastIQ trial has ended — want to keep going?"
  - Body: "Your FastIQ trial has now ended."
  - Founding Rate CTA: "Lock in $14.50/month forever"
- **Old language:** Premised on trial ending at day 8 (day after 7-day trial).
- **Status:** Only fires for grandfathered users (guard added tonight). NOT fired for new model users.
- **Priority:** **CAN-WAIT** — guarded to grandfathered users only.

---

#### `sendParentTrialEndingEmail` (`functions/sendParentTrialEndingEmail.js`)
- **Audience:** User-facing (sent to PARENT, not student)
- **Trial mechanic references:**
  - Body: "your student's FastIQ trial ends tomorrow"
  - **🚨 STALE LANGUAGE:** "lock in the Founding Rate of $14.50/month before April 15th" — WRONG DATE
- **Old language:** "April 15th" deadline (should be April 30). No reference to trial length itself.
- **Status:** Fires for both models when daysLeft===1 AND student was gifted by parent. Date bug is live.
- **Priority:** **MUST-FIX-BEFORE-RELAUNCH** — wrong date is user-facing and live

---

#### `sendFoundingRateBlast` (`functions/sendFoundingRateBlast.js`)
- **Audience:** User-facing (blast to all non-upgraded users)
- **Trial mechanic references:**
  - Body: "The Founding Rate for FastIQ expires April 30, 2026"
  - Subtext: "Cancel anytime" on monthly/annual CTAs
  - No explicit trial duration mentioned in current version
- **Old language (implicit):** Does NOT mention trial duration, CC requirement, or trial-to-paid conversion. Only mentions the Founding Rate deadline. **This email is actually clean** — paused only out of abundance of caution while we redesign.
- **Status:** ⏸️ PAUSED (Founding Rate Blast April 30). Founding Rate Blast April 27 already ran (and failed with error).
- **Priority:** **MUST-FIX-BEFORE-RELAUNCH** — needs rewrite to integrate 3 angles (new trial model + deadline + seasonal urgency). But current content is not technically wrong.

---

#### `sendParentWelcomeEmail` (`functions/sendParentWelcomeEmail.js`)
- **Audience:** User-facing
- **Trial mechanic references:**
  - FastIQ pitch section: "FastIQ gives them everything they need to land their first job" — general pitch
  - No trial duration or CC terms mentioned explicitly
- **Old language (implicit):** No explicit trial terms. Safe to keep firing.
- **Status:** ✅ Active. No immediate action needed.
- **Priority:** LOW — no explicit trial terms

---

#### `sendWelcomeEmail` (`functions/sendWelcomeEmail.js`)
- **Audience:** User-facing (students)
- **Trial mechanic references:**
  - Mentions "FastIQ will score it [resume] instantly" as a feature teaser
  - No trial duration or CC terms mentioned
- **Old language (implicit):** No explicit trial terms.
- **Status:** ✅ Active. Safe.
- **Priority:** LOW — no explicit trial terms

---

#### `sendParentGiftedFastIQEmail` (`functions/sendParentGiftedFastIQEmail.js`)
- **Audience:** User-facing (student receiving gift from parent)
- **Trial mechanic references:**
  - **🚨 EXPLICIT OLD LANGUAGE:** `trialDays` parameter passed and displayed: "You have **${trialDays} days** of full FastIQ access."
  - Default parameter: `trialDays = 7` — if caller doesn't pass 5, student sees "7 days"
  - Updated tonight in giftFastIQToStudent/stripeWebhook to pass `trialDays: 5`
- **Old language:** Default of 7 days still exists in function signature. Any caller not passing `trialDays` will show wrong number.
- **Status:** ⚠️ Partially fixed — callers updated. But default parameter is still 7. Needs explicit fix.
- **Priority:** **MUST-FIX-BEFORE-RELAUNCH** — user-facing, shows wrong trial duration

---

#### `sendUpgradePrompt` (`functions/sendUpgradePrompt.js`)
- **Audience:** User-facing (called when student hits a feature gate)
- **Trial mechanic references:**
  - **🚨 STALE LANGUAGE:** "50% off forever if you upgrade before April 15th" — WRONG DATE
  - "Founding member offer — $14.50/month" — correct price, wrong deadline
  - CTA: "Unlock FastIQ — $29/month" — but the founding rate is $14.50. Contradictory pricing.
- **Old language:** April 15 deadline (wrong), $29/month CTA (contradicts founding rate), no trial mention
- **Status:** Unclear if any frontend component actively calls this. May be dormant.
- **Priority:** **MUST-FIX-BEFORE-RELAUNCH** — wrong date if it's being called

---

#### `sendFastIQNudgeEmail` (referenced in audit, not read tonight)
- **Audience:** User-facing
- **Trial mechanic references:** Likely contains trial/upgrade language. Not read tonight.
- **Status:** Unknown active/dormant state.
- **Priority:** FLAG FOR REVIEW — needs read tomorrow

---

#### `sendTrialPaymentReminderEmail` (referenced in trialEmailScheduler)
- **Audience:** User-facing (legacy model only — user has Stripe but no card on file)
- **Trial mechanic references:** "Add a payment method before midnight" + Stripe portal link
- **Old language:** Entire email premised on 7-day model. Legacy-only after tonight's changes.
- **Status:** Only fires for grandfathered users on old model (guard added tonight).
- **Priority:** **CAN-WAIT** — guarded to legacy users only

---

### CATEGORY 2 — FRONTEND APP COMPONENTS

---

#### `components/fastiq-funnel/PaywallScreen.jsx`
- **Audience:** User-facing (funnel paywall)
- **Trial mechanic references:**
  - **🚨 EXPLICIT STALE:** `const FOUNDING_DEADLINE = new Date('2026-04-15T23:59:59')` — WRONG DATE
  - **🚨 EXPLICIT OLD LANGUAGE:** "7-day free trial — cancel anytime" displayed on shield badge
  - `foundingOfferActive` evaluates to FALSE (April 15 has passed) — so the founding rate is NOT being shown even though April 30 hasn't happened yet. The paywall is showing $29/month to everyone RIGHT NOW.
  - CTA text: "Start Free Trial — $14.50/month" / "$29/month" depending on wrong deadline check
- **Old language:**
  - "7-day free trial" badge (should be "5-day")
  - April 15 deadline hardcoded (should be April 30)
  - No CC-required disclosure
- **Status:** 🔴 LIVE BUG — paywall is showing wrong price to new users right now
- **Priority:** **CRITICAL — MUST-FIX-BEFORE-RELAUNCH** — users hitting the paywall today see $29/month

---

#### `components/free-tier/FastIQUpgradeModal.jsx`
- **Audience:** User-facing
- **Trial mechanic references:**
  - `const FOUNDING_DEADLINE = new Date('2026-04-30T23:59:59')` — ✅ CORRECT DATE
  - "Start free for 7 days — then $14.50/month" — OLD TRIAL DURATION
  - "Start free for 7 days — then $29/month. Cancel anytime." — OLD TRIAL DURATION
  - "Founding rate expires April 30." — ✅ correct
  - CTA button text: "Start Free Trial — $14.50/month →" — implies free trial, no CC mention
- **Old language:**
  - "7 days" appears THREE times in this component
  - No credit card disclosure
  - No mention of auto-conversion
- **Status:** ⚠️ User-facing. 7-day references are wrong for new signups.
- **Priority:** **MUST-FIX-BEFORE-RELAUNCH**

---

#### `components/free-tier/TrialBanner.jsx`
- **Audience:** User-facing (persistent banner for trial users)
- **Trial mechanic references:**
  - Shows days remaining from `trial_end_date`
  - "⚡ FastIQ Trial — X day(s) remaining | Lock in $14.50/mo before April 30"
  - No CC or auto-conversion language
- **Old language (implicit):** No explicit trial duration stated. Days are computed from actual `trial_end_date` — so grandfathered users see 7-day countdown, new users see 5-day countdown. This is **correct behavior** for both models.
- **Status:** ✅ Mostly OK. Does not hardcode trial duration.
- **Priority:** LOW — but consider adding "Your card will be charged on [date]" for new model users

---

#### `utils/trialActivation.js`
- **Audience:** Internal utility (called by frontend to activate trial)
- **Trial mechanic references:**
  - Comment: "Attempt to activate a 7-day FastIQ trial for the current user."
  - Logic is correct — calls `activateFastIQTrial` backend function which now does 5 days
- **Old language:** Comment says "7-day" — cosmetic issue only. Actual behavior is correct.
- **Status:** ⚠️ Comment is stale. Logic is correct (delegates to backend).
- **Priority:** LOW — comment update only

---

#### `components/fastiq-setup/FastIQActivation` (not read tonight)
- **Audience:** User-facing (FastIQ trial activation UI)
- **Status:** Not read — likely contains trial terms.
- **Priority:** FLAG FOR REVIEW

---

#### `components/fastiq-setup/FastIQStep1Confirm` (not read tonight)
- **Audience:** User-facing (first step of FastIQ setup)
- **Status:** Not read — likely shows trial terms to user.
- **Priority:** **HIGH FLAG** — this is likely where "7 days" or "no credit card" language lives in the activation flow

---

#### `components/free-tier/PostTrialUpgradePrompt` (not read tonight)
- **Audience:** User-facing (shown after trial expires)
- **Status:** Not read — almost certainly contains "Your trial has ended" + upgrade CTA.
- **Priority:** **HIGH FLAG** — post-trial screen

---

#### `components/free-tier/WelcomeBackTrialBanner` (not read tonight)
- **Audience:** User-facing
- **Status:** Not read. Name suggests trial-aware content.
- **Priority:** FLAG FOR REVIEW

---

#### `components/subscription/FastIQUpgradeBanner` (not read tonight)
- **Audience:** User-facing
- **Status:** Not read. Likely contains trial/upgrade language.
- **Priority:** FLAG FOR REVIEW

---

#### `components/free-tier/CareerConciergeUpgradeModal` (not read tonight)
- **Audience:** User-facing
- **Status:** Not read. Likely contains trial/upgrade language.
- **Priority:** FLAG FOR REVIEW

---

### CATEGORY 3 — BACKEND FUNCTIONS (BILLING / SUBSCRIPTION LOGIC)

---

#### `functions/createCheckoutSession.js`
- **Audience:** Internal (creates Stripe checkout)
- **Trial mechanic references:**
  - `trial_period_days: 5` — ✅ UPDATED TONIGHT
  - `payment_method_collection: 'always'` — ✅ CC required for all new subscriptions
  - `NEW_TRIAL_CUTOFF` constant added
  - `FOUNDING_OFFER_DEADLINE` — ✅ April 30
- **Status:** ✅ Updated tonight. Correct.
- **Priority:** DONE

---

#### `functions/activateFastIQTrial.js`
- **Audience:** Internal
- **Trial mechanic references:**
  - Sets 5-day trial ✅
  - Requires `stripe_customer_id` — enforces CC requirement ✅
- **Status:** ✅ Correct.
- **Priority:** DONE

---

#### `functions/giftFastIQToStudent.js`
- **Audience:** Internal
- **Trial mechanic references:**
  - Trial set to 5 days ✅
  - Passes `trialDays: 5` to gift email ✅
- **Status:** ✅ Updated in prior session.
- **Priority:** DONE

---

#### `functions/stripeWebhook.js`
- **Audience:** Internal
- **Trial mechanic references:**
  - Parent-gifted FastIQ: `trial_end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()` ✅
  - Gift email call: `trialDays: 5` ✅
- **Status:** ✅ Updated in prior session.
- **Priority:** DONE

---

#### `functions/toggleFastIQ.js`
- **Audience:** Admin-only internal
- **Trial mechanic references:** None — just toggles flags. No trial duration.
- **Status:** ✅ Clean.
- **Priority:** N/A

---

#### `functions/adminGrantFastIQ.js`
- **Audience:** Admin-only
- **Trial mechanic references:** None — grants permanent access, not trial.
- **Status:** ✅ Clean.
- **Priority:** N/A

---

#### `functions/trialEmailScheduler.js`
- **Audience:** Internal orchestrator
- **Trial mechanic references:**
  - `NEW_TRIAL_CUTOFF` guard added tonight ✅
  - New model (5-day): Day 4 email fires 1 day before auto-charge ✅
  - Legacy model: Day 5/7/8 guarded to `!isNewModel` ✅
  - `isNewModel` flag passed to `sendTrialDay5Email` ✅
- **Status:** Updated tonight. Still fires daily at 12:00 UTC — **NEEDS MANUAL PAUSE** before 8am ET tomorrow.
- **Priority:** **CRITICAL ACTION ITEM** — pause automation before tomorrow's scheduled run

---

#### `functions/checkTrialExpiry.js`
- **Audience:** Internal (expires trial records)
- **Trial mechanic references:** Looks for `trial_status: active` + `trial_end_date < now`. No duration logic.
- **Status:** ✅ Model-agnostic. Works correctly for both 5-day and 7-day users.
- **Priority:** Safe to keep running.

---

#### `functions/runEngagementAgent.js`
- **Audience:** Internal
- **Trial mechanic references:**
  - Routing gate skips active trial users (model-agnostic) ✅
  - Comment added tonight noting new trial model context ✅
  - Engagement emails that reference trial mechanics: See CATEGORY 2E below
- **Status:** Agent itself is fine. Engagement email templates may reference FastIQ pricing.
- **Priority:** Review email content in next session

---

### CATEGORY 4 — ENGAGEMENT AGENT EMAIL TEMPLATES

The engagement agent email templates in `functions/runEngagementAgent.js` (Day 0, 2, 5, 9, 14) contain FastIQ references. Spot-checking:

- **Day 0 Tier 3:** "FastIQ can find you alumni..." — references FastIQ feature, no trial terms
- **Day 2 Tier 3:** "FastIQ can show you alumni..." — no trial terms
- **Day 5 Tier 3:** "FastIQ has been active this week" — no trial terms  
- **Day 9 Active Tier 3:** "FastIQ has new alumni results" — no trial terms

**Assessment:** Engagement agent templates do NOT reference trial duration, CC requirement, or trial-to-paid conversion. They describe FastIQ features. They are SAFE to send without updates. However the routing gate that sends them is paused, so no action needed tonight.

---

### CATEGORY 5 — DATABASE SCHEMA (User Entity)

**User entity fields related to trial (NO SCHEMA CHANGES TONIGHT — deferred to tomorrow):**

| Field | Type | Current Usage | Notes |
|---|---|---|---|
| `trial_start_date` | datetime | When trial began | ✅ Used correctly |
| `trial_end_date` | datetime | When trial ends | ✅ Used correctly. Old model = 7 days from start. New model = 5 days. |
| `trial_status` | string (active/expired) | Current trial state | ✅ Used correctly |
| `fastiq_trial_active` | boolean | Quick-check for active trial | ✅ Redundant with trial_status but used in many checks |
| `stripe_customer_id` | string | Stripe customer ID | ✅ Now required for new model trial activation |
| `stripe_subscription_id` | string | Stripe subscription ID | ✅ Set by webhook on checkout |
| `subscription_status` | string | active/trial/free/expired | ✅ Used correctly |
| `membership_tier` | string | fastiq/fastiq_trial/free | ✅ Used correctly |
| `gifted_by_parent_email` | string | Email of gifting parent | ✅ Determines email routing |
| `last_day5_email_sent_at` | datetime | Dedup for Day 5 email | ✅ Reused for Day 4 new model |
| `last_day7_email_sent_at` | datetime | Dedup for Day 7 email | ✅ Legacy only |
| `last_day8_email_sent_at` | datetime | Dedup for Day 8 email | ✅ Legacy only |

**Potential schema additions (tomorrow's task):**
- `trial_model` — explicitly tag users as `new_model` vs `grandfathered` (currently inferred from trial_start_date vs NEW_TRIAL_CUTOFF)
- `trial_cc_captured` — boolean, whether CC was on file at trial start (for reporting/compliance)

---

### CATEGORY 6 — DOCS AND KNOWLEDGE FILES

---

#### `docs/CFF_EMAIL_AUDIT_2026-04-27.md`
- **References:** Section 2B describes trialEmailScheduler sending Day5/7/8 emails with 7-day model logic
- **Old language:** Yes — audit predates new trial model
- **Priority:** LOW — internal doc, update as part of this new inventory

---

#### `docs/CFF_ENGAGEMENT_AGENT_STATUS_2026-04-27.md`
- **References:** No trial mechanic references. Agent routing note mentions "7-day no-card model" as prior context.
- **Priority:** LOW — internal doc

---

#### `docs/CFF_BRAND_CONTEXT.md` (Knowledge file — to be updated tonight)
- **References:** FastIQ trial section needs update (see Section 7 of this doc)
- **Priority:** Updated in separate doc tonight

---

### CATEGORY 7 — SLIDESHOW / STATIC RECORDS

- **Not audited tonight.** Slideshow records (parent and student versions) likely contain FastIQ pitch language.
- References like "try FastIQ free for 7 days" or "no credit card required" may appear in slideshow content stored in the database.
- **SILENT REFERENCE RISK:** This is exactly the type of place that gets missed.
- **Priority:** **HIGH FLAG** — audit slideshow entity records tomorrow

---

### CATEGORY 8 — LANDING PAGES AND MARKETING COMPONENTS

---

#### `components/landing/v3/V3Pricing` (not read tonight)
- Likely contains trial terms, pricing, and conversion messaging
- **Priority:** **HIGH FLAG** — public-facing, visible to all visitors

---

#### `components/landing/LandingPricing` (not read tonight)
- **Priority:** HIGH FLAG

---

#### `components/landing/v3/V3FAQ` (not read tonight)
- FAQs likely answer "How does the trial work?" and "Is there a credit card required?"
- **Priority:** **CRITICAL FLAG** — FAQ answers explicit trial mechanic questions

---

#### `pages/StudentLandingPage`, `pages/ParentLandingPage` (not read tonight)
- **Priority:** HIGH FLAG — public-facing landing pages

---

#### `pages/FastIQDashboard` (not read tonight)
- **Priority:** HIGH FLAG — trial status and upgrade prompts live here

---

### CATEGORY 9 — LINKEDIN / EXTERNAL DRAFTS

- `/docs` folder checked: No LinkedIn share blurbs found in current docs
- No dedicated LinkedIn draft file found
- If drafts exist, they are likely in external notes (Notion, email) not in the codebase
- **Priority:** LOW for codebase; check external docs separately

---

## SILENT REFERENCE DETECTION

Places where OLD trial model is IMPLIED rather than explicitly stated (things to search for in tomorrow's audit):

| Pattern to search | Risk level | Where likely found |
|---|---|---|
| "try FastIQ free" | HIGH | Landing pages, marketing components |
| "no credit card required" | HIGH | PaywallScreen, landing pages, FAQ |
| "7 days" | HIGH | FastIQUpgradeModal ✅ found, FastIQActivation steps |
| "7-day" | HIGH | utils/trialActivation.js comment ✅ found |
| "7 day" | HIGH | sendParentGiftedFastIQEmail default param ✅ found |
| "free trial" | MEDIUM | PaywallScreen ✅ found ("7-day free trial"), other modals |
| "cancel anytime" (without CC disclosure) | MEDIUM | Multiple — implies no commitment |
| "start free" | MEDIUM | FastIQUpgradeModal CTA copy |
| trialDays = 7 | HIGH | sendParentGiftedFastIQEmail default ✅ found |
| FOUNDING_DEADLINE = '2026-04-15' | CRITICAL | PaywallScreen ✅ found — live bug causing $29/mo display |

---

## SUMMARY: MUST-FIX BEFORE RELAUNCH

| # | Location | Issue | Urgency |
|---|---|---|---|
| 1 | `PaywallScreen.jsx` | `FOUNDING_DEADLINE = April 15` → showing $29/mo to everyone NOW | 🔴 CRITICAL — live bug today |
| 2 | `PaywallScreen.jsx` | "7-day free trial" badge | 🔴 MUST-FIX |
| 3 | `FastIQUpgradeModal.jsx` | "7 days" appears 3 times | 🔴 MUST-FIX |
| 4 | `sendParentTrialEndingEmail.js` | "April 15th" deadline (wrong date) | 🔴 MUST-FIX — live email |
| 5 | `sendUpgradePrompt.js` | "April 15th" deadline (wrong date) | 🔴 MUST-FIX if function is active |
| 6 | `sendParentGiftedFastIQEmail.js` | `trialDays = 7` default parameter | 🟡 MUST-FIX |
| 7 | `components/landing/v3/V3FAQ` | FAQ likely answers "no CC required" | 🟡 MUST-FIX |
| 8 | `components/landing/v3/V3Pricing` | Trial terms in pricing section | 🟡 MUST-FIX |
| 9 | Trial Email Scheduler automation | Not paused tonight — MANUAL ACTION | 🔴 ACTION BEFORE 8am ET |
| 10 | Slideshow entity records | May contain trial terms | 🟡 AUDIT FIRST |

---

## SUMMARY: CAN WAIT (post-relaunch)

| # | Location | Issue |
|---|---|---|
| 1 | `sendTrialDay7Email.js` | References 7-day model — guarded to legacy users only |
| 2 | `sendTrialDay8Email.js` | References 7-day model — guarded to legacy users only |
| 3 | `sendTrialPaymentReminderEmail.js` | Legacy-only path |
| 4 | `utils/trialActivation.js` | Comment says "7-day" — cosmetic only |
| 5 | Email audit doc (Apr 27) | Internal doc, stale |
| 6 | `sendFoundingRateBlast.js` | No explicit trial terms — currently paused for rewrite |

---

*End of inventory document. Do not update anything until reviewed April 29 morning.*