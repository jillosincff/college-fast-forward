/**
 * CFF Email Templates
 * Ready to load into Base44 automations after site QA.
 *
 * Variables: {firstName}, {schoolName}
 * Rules: no emoji in subject lines, no UF-specific language, school-agnostic body copy.
 */

export const EMAIL_TEMPLATES = [

  // ── 1. Student Welcome ────────────────────────────────────────────────────
  {
    id: 'student_welcome',
    trigger: 'user_created (persona: student/gator)',
    subject: "You're in, {firstName} — here's where to start",
    body: `Hi {firstName},

You just joined College Fast Forward. Here's what to do first.

The students who get results fastest do three things in their first session:

1. Set your career goals — takes 5 minutes, tells the system what to find for you.
2. Run an alumni search — type what you're looking for in plain English (e.g. "marketing alumni at consumer brands in NYC").
3. Send one message — find someone relevant and reach out. FastIQ drafts it for you.

That's it. One message sent is worth 50 applications submitted.

Log in and get started:
{app_url}

— The CFF Team`,
  },

  // ── 2. Parent Welcome ─────────────────────────────────────────────────────
  {
    id: 'parent_welcome',
    trigger: 'user_created (persona: parent)',
    subject: 'Welcome to CFF, {firstName} — students are already searching',
    body: `Hi {firstName},

You're now part of College Fast Forward.

Right now, students from {schoolName} are searching for someone like you — professionals willing to share a connection, answer a question, or open a door.

Here's how it works:
- Students browse your profile and send a message when your background is relevant.
- You decide who to respond to and how much to share.
- One conversation can change everything for a student.

Complete your profile so students can find you:
{app_url}

It takes less than 3 minutes.

— The CFF Team`,
  },

  // ── 3. Onboarding Abandonment (20–28 hrs) ────────────────────────────────
  {
    id: 'onboarding_abandonment',
    trigger: 'scheduled: 20–28hrs after signup, career_goals not set',
    subject: "{firstName}, your career profile isn't set up yet",
    body: `Hi {firstName},

You joined College Fast Forward but haven't set up your career profile yet.

Without it, the system doesn't know what to find for you — no company recommendations, no alumni matches, no personalized outreach drafts.

It takes 5 minutes:
{app_url}/#FreeTierDashboard?tab=career_goals

Once it's done, FastIQ starts working.

— The CFF Team`,
  },

  // ── 4. 14-Day Re-engagement ───────────────────────────────────────────────
  {
    id: 'reengagement_14day',
    trigger: 'scheduled: 14 days after signup, no login in 7+ days',
    subject: '{firstName}, your matches are still here',
    body: `Hi {firstName},

You set up a profile on College Fast Forward two weeks ago.

The professionals who match your background and goals are still there. So are the company intel updates and alumni search tools.

The students who use CFF consistently — even just 20 minutes a week — are the ones who end up with warm introductions instead of cold applications.

Log back in:
{app_url}

— The CFF Team`,
  },

  // ── 5. 30-Day Final Nudge ─────────────────────────────────────────────────
  {
    id: 'reengagement_30day',
    trigger: 'scheduled: 30 days after signup, no login in 14+ days',
    subject: 'This is the window, {firstName}',
    body: `Hi {firstName},

Recruiting cycles don't wait. The window between now and when offers go out is shorter than it feels.

Students who have warm introductions before they apply get callbacks. Students who apply cold mostly don't hear back.

You have a profile in CFF. You have access to the alumni search and the network. The only thing missing is using it.

Come back and send one message this week:
{app_url}

— The CFF Team`,
  },

  // ── 6. CFF 2.0 Re-introduction (403 members, persona variants) ───────────
  {
    id: 'cff_reintroduction',
    trigger: 'one-time blast to all 403 existing members',
    subject: 'We changed everything. For the better.',
    variants: {
      student: {
        body: `Hi {firstName},

We rebuilt College Fast Forward from scratch.

The old version connected students with parents for general advice. That worked. But it wasn't enough.

The new CFF is built around one goal: getting you a warm introduction to someone at the right company before you apply.

What's new:
- Alumni search — find {schoolName} graduates in any role, at any company, in plain English
- FastIQ — AI that researches companies, drafts your outreach, and builds your daily action plan
- Company intel — real hiring signals from job boards, updated every 24 hours
- Career path research — talk through your options with an AI that knows your goals

Your account is active. Log in and see what's different:
{app_url}

— The CFF Team`,
      },
      parent: {
        body: `Hi {firstName},

We rebuilt College Fast Forward.

The new platform is sharper, faster, and more useful for everyone in the network — especially students who are actively searching.

What changed for you:
- Your profile is now part of a live alumni network students search directly
- Students can find you by role, company, and industry — not just by school
- You'll get cleaner, more relevant connection requests

Nothing you need to do. Just log in to see the new platform:
{app_url}

Thank you for being part of this.

— The CFF Team`,
      },
    },
  },

  // ── 7. Founding Member Offer ──────────────────────────────────────────────
  {
    id: 'founding_member_offer',
    trigger: 'one-time to eligible founding members before April 15th',
    subject: 'Your founding member rate — expires April 15th',
    body: `Hi {firstName},

You joined College Fast Forward early. That matters, and we want to recognize it.

For founding members, we're offering FastIQ at $14.50/month or $124.50/year — 50% off, locked in permanently as long as you stay subscribed.

This rate expires April 15th. After that, FastIQ is $29/month.

What FastIQ includes:
- Full alumni search with names and contact info
- AI-drafted personalized outreach for every connection
- Company hiring signals updated every 24 hours
- Resume tailoring, LinkedIn review, mock interview prep
- Daily action plan built around your goals

Claim your founding rate here:
{checkout_url}

The window closes April 15th.

— The CFF Team`,
  },

];

/**
 * AUTOMATION SETUP NOTES (load after QA):
 *
 * 1. student_welcome       → Entity automation: User.create, filter persona=student/gator
 * 2. parent_welcome        → Entity automation: User.create, filter persona=parent
 * 3. onboarding_abandonment→ Scheduled: daily, filter users where career_goals not set + created 20-28hrs ago
 * 4. reengagement_14day    → Scheduled: daily, filter users with no login in 7d, created 14d ago
 * 5. reengagement_30day    → Scheduled: daily, filter users with no login in 14d, created 30d ago
 * 6. cff_reintroduction    → One-time blast, send via sendEmail with persona-based variant
 * 7. founding_member_offer → One-time blast, filter membership_tier = 'founding'
 *
 * All use base44.integrations.Core.SendEmail or SendGrid templates.
 * Replace {app_url} with APP_BASE_URL env variable.
 * Replace {checkout_url} with Stripe checkout link for founding plan.
 */