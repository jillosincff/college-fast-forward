# CFF Tomorrow's Task List — April 29, 2026
**Generated:** April 28, 2026 (tonight)  
**First action of the day:** Review `CFF_TRIAL_MECHANIC_INVENTORY_2026-04-28.md` before touching anything.

---

## ✅ SYSTEM STATUS AT CLOSE OF APRIL 28

All sends confirmed held for the night:
- Trial Email Scheduler: ✅ **PAUSED MANUALLY** (April 28 evening)
- Founding Rate Blast — April 30: ✅ **PAUSED**
- CFF Engagement Agent: ✅ **PAUSED**
- Correction Email (9:30am ET): ✅ **ACTIVE** (intentional — no trial terms)

**No automated emails will fire overnight. System is fully held.**

---

## 🔴 TOP PRIORITY — REVENUE-IMPACTING BUG (moved to #1)

---

## ORDERED TASK LIST

### Priority 1 — Revenue-Impacting Bug (first thing tomorrow)

**1. AUDIT + FIX `PaywallScreen.jsx` — FOUNDING_DEADLINE wrong date (13-day revenue gap)**
- File: `components/fastiq-funnel/PaywallScreen.jsx`
- Issue: `FOUNDING_DEADLINE = new Date('2026-04-15T23:59:59')` → paywall has been showing **$29/month** to every new user since April 15. Today is April 28. That's **13 days of wrong pricing.**
- Same family as the `sendParentTrialEndingEmail` / `sendUpgradePrompt` April 15 date bug — all hardcoded from the same original deadline.

**Step 1 — Pull impact data BEFORE fixing:**
- Query `AnalyticsEvent` for `event_name: 'upgrade_clicked'` or `event_name: 'fastiq_trial_started'` between April 15–28
- Also check Stripe dashboard: any checkouts between April 15–28 where the user saw $29/month
- Count affected users — anyone who converted during this window did so at the correct $14.50 price (Stripe checkout still had founding rate logic), but they were shown $29 on the paywall before clicking. They may not know they got the founding rate.
- Decision point: **Do any of these users deserve a proactive "you got the founding rate" confirmation email?** (Probably yes — builds trust.)

**Step 2 — Fix the code:**
- Change `FOUNDING_DEADLINE` to `'2026-04-30T23:59:59'`
- Change "7-day free trial — cancel anytime" badge → "5-day trial · card required"
- Add CC disclosure near CTA: "Card required. Auto-converts at day 5. Cancel anytime."

**Step 3 — Draft confirmation email for affected users (if any converted April 15–28):**
- Short, from Jill: "Just want to confirm — you're locked in at $14.50/month. The paywall showed the wrong price for a period, but your checkout captured the founding rate correctly. You're good."

**2. Fix `sendParentTrialEndingEmail.js` — wrong deadline date**
- File: `functions/sendParentTrialEndingEmail.js`
- Issue: Body says "lock in the Founding Rate of $14.50/month before April 15th"
- Fix: Change to "April 30"

**3. Fix `sendUpgradePrompt.js` — wrong deadline date**
- File: `functions/sendUpgradePrompt.js`
- Issue: "50% off forever if you upgrade before April 15th"
- Fix: Change to "April 30" — also change $29/month CTA to $14.50/month since founding rate is active

---

### Priority 2 — Core Trial Flow Updates

**4. Fix `FastIQUpgradeModal.jsx` — three "7 days" references**
- File: `components/free-tier/FastIQUpgradeModal.jsx`
- Issue: "Start free for 7 days" appears 3 times
- Fix: Update to "5-day trial" for new model; add CC disclosure; update CTA copy

**5. Fix `sendParentGiftedFastIQEmail.js` — default trialDays = 7**
- File: `functions/sendParentGiftedFastIQEmail.js`
- Issue: Default parameter `trialDays = 7` — any caller not passing the param shows "7 days"
- Fix: Change default to `trialDays = 5`; update body copy to reference 5 days

**6. Read and audit FastIQ activation flow components**
- `components/fastiq-setup/FastIQActivation`
- `components/fastiq-setup/FastIQStep1Confirm`
- `components/fastiq-setup/FastIQStep2Companies` etc.
- Look for: "7 days", "no credit card", "try free", "free trial"
- Add: CC disclosure, auto-conversion notice, cancel instructions

**7. Add cancel-trial UI in account settings**
- Users need a clear, visible way to cancel within the 5-day window
- Trust matters more than aggressive conversion
- Location TBD — likely `pages/Profile` or a new settings section
- Must be discoverable without hunting

---

### Priority 3 — Email Rewrites

**8. Rewrite `sendTrialDay5Email` for new model (or clarify roles)**
- New model: 1 day before auto-charge → "Your card will be charged tomorrow. Here's how to cancel if you want to." (auto-convert variant already added tonight — review and polish)
- Legacy model: 2 days left → keep existing copy for grandfathered users
- Consider: Rename new model email to `sendAutoChargeReminderEmail` to be clearer

**9. Retire `sendTrialDay7Email` and `sendTrialDay8Email`**
- No day 7 or 8 in the 5-day model
- These are guarded to `!isNewModel` in trialEmailScheduler — they will only fire for the 16 grandfathered users
- After all 16 grandfathered users pass their trial end date, archive these functions
- Check: When does the last grandfathered user's trial end? Set a calendar reminder to archive then.

**10. Rewrite Founding Rate Blast for relaunch**
- Integrate 3 angles:
  1. New trial model (5 days, CC required, $14.50/mo founding rate locks in)
  2. April 30 deadline (2 days left)
  3. Seasonal urgency (graduation crunch — students either want to put in the work now or they don't)
- Re-enable the April 30 automation once blast is rewritten
- Test send to josinoff@gmail.com before enabling

**11. Send grandfathered users short confirmation email**
- Audience: The 16 users on old 7-day terms (see inventory for list)
- Message: Short, plain, from Jill. "You started your trial before we updated our terms. Nothing changes for you — you keep your original 7-day, no-credit-card trial. If you convert, founding rate is still available to you. No action needed."
- Build as a one-time function call or admin trigger — not an automation

---

### Priority 4 — Content Audit

**12. Audit landing pages for trial mechanic references**
- `components/landing/v3/V3Pricing`
- `components/landing/v3/V3FAQ`
- `components/landing/LandingPricing`
- `pages/StudentLandingPage`
- `pages/ParentLandingPage`
- Search for: "7 days", "no credit card", "free trial", "try free"

**13. Audit slideshow / static records in database**
- Query: `Slideshow` entity (or equivalent) for any records referencing "trial" or "free" or "7 day"
- Flag any copy with old trial mechanics

**14. Audit remaining upgrade/paywall components**
- `components/free-tier/PostTrialUpgradePrompt`
- `components/free-tier/WelcomeBackTrialBanner`
- `components/subscription/FastIQUpgradeBanner`
- `components/free-tier/CareerConciergeUpgradeModal`
- `pages/FastIQDashboard`

**15. Read `sendFastIQNudgeEmail` function**
- Check for trial mechanic references
- Determine if any frontend component actively calls it

---

### Priority 5 — Schema and Infrastructure

**16. Consider User entity schema additions**
- `trial_model`: `'new'` vs `'grandfathered'` — explicit flag vs inferring from trial_start_date
- `trial_cc_captured`: boolean — was CC on file at trial start
- Defer if inference from `trial_start_date >= NEW_TRIAL_CUTOFF` is sufficient

**17. Re-enable Trial Email Scheduler**
- After completing tasks 8–9 above (email rewrites)
- Verify all new-model sends are correct
- Verify legacy sends are correctly guarded

**18. Re-enable and re-schedule Founding Rate Blast**
- After completing task 10 (blast rewrite)
- Update April 30 blast automation with new copy
- Consider: Does April 30 blast now go to everyone, or only new-model users? (Grandfathered users get founding rate regardless of deadline — don't confuse them)

---

### Priority 6 — Engagement Agent Reactivation

**19. Re-enable CFF Engagement Agent — Daily Queue Builder**
- After verifying no engagement email templates reference old trial terms
- Agent emails reviewed: ✅ Clean (Day 0–14 templates have no trial duration/CC references)
- Re-enable when ready to resume onboarding sequence

---

## NOT FOR TOMORROW — DEFER

- Trial Activation Sequence (Workflow 2) — needs design decision first
- LinkedIn share blurb updates — no draft found in codebase; check external docs
- User entity schema changes — discuss and decide before implementing
- Archive sendTrialDay7Email / sendTrialDay8Email — wait until all 16 grandfathered users are past their trial end date

---

## TONIGHT'S COMPLETED ACTIONS (recap for morning review)

### Automations paused ✅
- CFF Engagement Agent — Daily Queue Builder: **PAUSED** ✅
- Founding Rate Blast — April 30: **PAUSED** ✅
- Correction Email — April 15 deadline bug: **ACTIVE** (intentional — fires at 9:30am ET, no trial terms) ✅

### Automations NOT yet paused ⚠️
- Trial Email Scheduler: **STILL ACTIVE** — see first action item above

### Code updated tonight ✅
- `createCheckoutSession`: trial_period_days 7→5, CC required, NEW_TRIAL_CUTOFF
- `activateFastIQTrial`: already 5 days
- `giftFastIQToStudent`: 5-day trial + trialDays: 5 passed to email
- `stripeWebhook`: gift trial 5 days + trialDays: 5 passed to email
- `trialEmailScheduler`: NEW_TRIAL_CUTOFF guard, new model Day 4 email, legacy guards for Day 5/6/7/8
- `sendTrialDay5Email`: new auto-convert variant added for new model self-signup users; hardcoded "7 days" removed from gifted path
- `runEngagementAgent`: routing comment updated

### Documents created tonight ✅
- `docs/CFF_TRIAL_MECHANIC_INVENTORY_2026-04-28.md` — full inventory
- `docs/CFF_BRAND_CONTEXT.md` — knowledge file updated with new trial terms + seasonal context
- `docs/CFF_TOMORROW_TASKS_2026-04-29.md` — this file

---

*Good night. Review inventory tomorrow before touching anything.*