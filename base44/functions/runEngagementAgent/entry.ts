/**
 * CFF Engagement Agent — Workflow 1: Onboarding Sequence
 *
 * Runs daily at 9:30am ET. For each student who signed up AFTER this agent
 * was deployed (the AGENT_LAUNCH_DATE cutoff), checks which day they are on
 * and queues the appropriate email for Jill's approval.
 *
 * TIERED PERSONALIZATION LOGIC:
 * ─────────────────────────────
 * Tier 1 (Well-staffed):  25+ parents at school AND 2+ parents in student's industry at that school
 * Tier 2 (Developing):    5–24 parents at school (and industry slice is adequate, ≥2)
 * Tier 3 (Understaffed):  <5 parents at school  OR  student's target industry has <2 parents at school
 *
 * Key rule: school-specific counts ONLY. Never reference platform-wide parent counts.
 * Tier 3 always leads with FastIQ / alumni discovery — never surfaces thin parent numbers.
 *
 * Day 0  → Welcome (tiered: T1/T2 = parent-led, T3 = FastIQ-led)
 * Day 2  → 3 parent profiles (T1/T2) or FastIQ alumni thread (T3)
 * Day 5  → Activity summary — school-scoped parent counts only; T3 pivots to FastIQ
 * Day 9  → Industry update — school+industry-scoped; T3 pivots to FastIQ
 * Day 14 → Re-orientation (profile complete vs incomplete variants)
 *
 * Safety rules:
 * - Skip all students who signed up before AGENT_LAUNCH_DATE
 * - Max 2 emails per student per 7 days
 * - Skip if student unsubscribed
 * - Skip if email already queued/sent for this sequence day
 * - All emails → status: pending_approval (Jill reviews before send)
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const APP_URL = Deno.env.get('APP_BASE_URL') || 'https://collegefastforward.com';
const AGENT_LAUNCH_DATE = '2026-04-26T00:00:00.000Z';
// Day 0 retired — sendWelcomeEmail fires immediately on signup and covers the welcome moment.
// Agent sequence starts at Day 2 (first substantive network email, after welcome has landed).
const SEQUENCE_DAYS = [2, 5, 9, 14];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysSince(dateStr) {
  if (!dateStr) return 9999;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function primaryIndustry(user) {
  const cg = user.career_goals;
  if (cg?.target_industries?.length > 0) return cg.target_industries[0];
  if (user.target_industries?.length > 0) return user.target_industries[0];
  if (user.industries_interested?.length > 0) return user.industries_interested[0];
  return user.industry || null;
}

function allIndustries(user) {
  const cg = user.career_goals;
  const arr = cg?.target_industries || user.target_industries || user.industries_interested || [];
  return arr.length > 0 ? arr : (user.industry ? [user.industry] : []);
}

function isProfileComplete(user) {
  const hasMajor = !!(user.major?.trim());
  const hasYear = !!(user.graduation_year);
  const hasIndustry = primaryIndustry(user) !== null;
  return hasMajor && hasYear && hasIndustry;
}

function missingProfileFields(user) {
  const missing = [];
  if (!user.major?.trim()) missing.push('your major');
  if (!user.graduation_year) missing.push('your graduation year');
  if (!primaryIndustry(user)) missing.push('your target industry');
  return missing;
}

function firstName(user) {
  const raw = user.first_name || user.full_name?.split(' ')[0] || null;
  return nameIsReal(raw, user.email) ? raw : null;
}

function nameIsReal(name, email) {
  if (!name) return false;
  const emailPrefix = email?.split('@')[0]?.toLowerCase() || '';
  const nameLower = name.toLowerCase();
  if (nameLower === emailPrefix) return false;
  if (/\d/.test(name)) return false;
  if (name.includes('_')) return false;
  if (/\.[a-z]/i.test(name)) return false;
  return true;
}

function plural(count, singular, pluralForm) {
  return count === 1 ? `1 ${singular}` : `${count} ${pluralForm || singular + 's'}`;
}

function wrapHtml(bodyText) {
  const lines = bodyText.split('\n').map(line => {
    if (line.trim() === '') return '<br>';
    return `<p style="margin:0 0 12px 0;font-family:Georgia,serif;font-size:16px;line-height:1.6;color:#1a1a1a;">${line.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
  }).join('\n');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#f9f9f7;margin:0;padding:32px 16px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:8px;padding:40px 48px;max-width:560px;">
<tr><td>${lines}</td></tr>
<tr><td style="padding-top:24px;border-top:1px solid #eee;">
<p style="font-family:Arial,sans-serif;font-size:12px;color:#aaa;margin:0;">
You're receiving this because you joined College Fast Forward. &nbsp;
<a href="${APP_URL}/#Logout" style="color:#aaa;">Unsubscribe</a>
</p></td></tr></table></td></tr></table></body></html>`;
}

// ─── Tier Classification ───────────────────────────────────────────────────────
// Returns 1, 2, or 3.
// Rule: Tier 3 if school has <5 parents OR student's primary industry has <2 parents at that school.
// This catches "hidden Tier 3" — students at large schools whose specific industry is unrepresented.

function classifyTier(student, stats) {
  const schoolCount = stats.parentsAtSchool;
  const industryAtSchool = stats.parentsInIndustryAtSchool;
  const hasIndustry = primaryIndustry(student) !== null;

  // Under 5 parents at school → always Tier 3
  if (schoolCount < 5) return 3;

  // Student has an industry but fewer than 2 parents at their school match it → Tier 3
  if (hasIndustry && industryAtSchool < 2) return 3;

  // 5–24 parents → Tier 2
  if (schoolCount < 25) return 2;

  // 25+ parents and industry is adequate → Tier 1
  return 1;
}

// ─── Stats Fetchers ───────────────────────────────────────────────────────────

function fetchStats(user, allParents, recentMsgCount) {
  const schoolCode = user.school_code;
  const schoolName = user.school_name || user.school;
  const industry = primaryIndustry(user);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // School-scoped parent lists — always school-specific, never platform-wide
  const schoolParents = allParents.filter(p =>
    (schoolCode && p.school_code === schoolCode) ||
    (schoolName && p.school_name === schoolName)
  );
  const parentsAtSchool = schoolParents.length;
  const newParentsAtSchoolLast7Days = schoolParents.filter(p => p.created_date >= sevenDaysAgo).length;

  // Industry match — school-scoped only
  const industryMatchFn = (p) => {
    if (!industry) return false;
    const pInd = (p.industry || '').toLowerCase();
    const indLower = industry.toLowerCase();
    // Check primary industry first word against parent industry (handles "Finance & Banking" vs "Finance")
    return pInd.includes(indLower.split(' ')[0]) || indLower.includes(pInd.split(' ')[0]);
  };

  const parentsInIndustryAtSchool = schoolParents.filter(industryMatchFn).length;
  const newParentsInIndustryAtSchoolLast7Days = schoolParents
    .filter(p => p.created_date >= sevenDaysAgo)
    .filter(industryMatchFn).length;

  // Sample parents for Day 2 — school-scoped, prefer industry match
  const industryParentsAtSchool = schoolParents.filter(industryMatchFn);
  const samplePool = industryParentsAtSchool.length >= 3
    ? industryParentsAtSchool
    : schoolParents.length >= 3
    ? schoolParents
    : [];
  const sampleParents = samplePool.slice(0, 3).map(p => ({
    full_name: p.full_name,
    current_position: p.current_position,
    current_company: p.current_company,
    industry: p.industry,
  }));

  // Top industries at school this week (school-scoped)
  const industryCounts = {};
  schoolParents.forEach(p => {
    if (p.industry) industryCounts[p.industry] = (industryCounts[p.industry] || 0) + 1;
  });
  const topIndustriesAtSchool = Object.entries(industryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([ind]) => ind);

  return {
    parentsAtSchool,
    newParentsAtSchoolLast7Days,
    parentsInIndustryAtSchool,
    newParentsInIndustryAtSchoolLast7Days,
    sampleParents,
    topIndustriesAtSchool,
    recentMessages: recentMsgCount || 0,
  };
}

// ─── Email Templates ───────────────────────────────────────────────────────────

// DAY 0 — Tier 1: well-staffed school, adequate industry representation
function templateDay0Tier1(user, stats) {
  const first = firstName(user);
  const greeting = first ? `Hi ${first},` : `Hi,`;
  const school = user.school_name || user.school || 'your school';
  const parentCount = stats.parentsAtSchool;
  const parentStr = plural(parentCount, 'parent');
  const parentVerb = parentCount === 1 ? 'is' : 'are';

  const body = `${greeting}

You just joined College Fast Forward, and I wanted to reach out personally.

We have ${parentStr} from ${school} on the platform right now — people who said they're open to hearing from students like you.

It takes about 4 minutes to fill out your profile: your major, graduation year, and the industry you are interested in. Once it is done, you can browse the full directory and reach out directly.

Log in and get your profile set up: ${APP_URL}

— Jill

P.S. The parents on the platform are here for one reason only: to help students like you.`;

  return {
    subject: `Welcome to CFF — ${parentStr} from ${school} ${parentVerb} here`,
    body_text: body,
    body_html: wrapHtml(body),
  };
}

// DAY 0 — Tier 2: developing school (5-24 parents), mention count + FastIQ as complement
function templateDay0Tier2(user, stats) {
  const first = firstName(user);
  const greeting = first ? `Hi ${first},` : `Hi,`;
  const school = user.school_name || user.school || 'your school';
  const parentCount = stats.parentsAtSchool;
  const parentStr = plural(parentCount, 'parent');
  const parentVerb = parentCount === 1 ? 'is' : 'are';

  const body = `${greeting}

You just joined College Fast Forward, and I wanted to reach out personally.

We have ${parentStr} from ${school} on the platform right now — they joined specifically to help students from your school.

As your school's network grows, CFF also gives you FastIQ — it finds alumni at companies you're interested in and helps you reach out to them directly. Both paths are useful.

Log in and get your profile set up: ${APP_URL}

— Jill

P.S. The parents on the platform are here for one reason only: to help students like you.`;

  return {
    subject: `Welcome to CFF — ${parentStr} from ${school} ${parentVerb} here`,
    body_text: body,
    body_html: wrapHtml(body),
  };
}

// DAY 0 — Tier 3: <5 parents at school OR <2 parents in student's industry at school
// Lead with FastIQ, honest about parent network being early-stage
function templateDay0Tier3(user, stats) {
  const first = firstName(user);
  const greeting = first ? `Hi ${first},` : `Hi,`;
  const school = user.school_name || user.school || 'your school';
  const industry = primaryIndustry(user);
  const cg = user.career_goals;
  const industries = cg?.target_industries || user.target_industries || [];

  // Build specific industry mention if we have it
  let industryLine = '';
  if (industries.length > 1) {
    industryLine = `You mentioned you're interested in ${industries.slice(0, 2).join(' and ')}. FastIQ can find you alumni working in those spaces right now.`;
  } else if (industry) {
    industryLine = `You mentioned you're interested in ${industry}. FastIQ can find you alumni working in that space right now.`;
  } else {
    industryLine = `FastIQ can find you alumni in industries you're interested in — once your profile is set up.`;
  }

  const body = `${greeting}

Welcome to College Fast Forward. I wanted to reach out personally.

CFF gives you two ways to connect with professionals who can help: the parent network at your school, and FastIQ — which finds alumni at companies you're interested in and helps you reach out directly.

For ${school} right now, the alumni path is the stronger one. Your school's parent network is still growing, and I don't want to oversell what's there. FastIQ, on the other hand, is ready to use today.

${industryLine}

Log in and try it: ${APP_URL}

— Jill

P.S. The parents on the platform are here for one reason only: to help students like you. As more Wisconsin parents join, you'll hear from us.`;

  return {
    subject: `Welcome to CFF — two ways to get connected`,
    body_text: body,
    body_html: wrapHtml(body),
  };
}

// DAY 2 — Tier 1/2: Show 3 school parents
function templateDay2Tier12(user, stats) {
  const first = firstName(user);
  const greeting = first ? `${first},` : `Hi,`;
  const school = user.school_name || user.school || 'your school';
  const industry = primaryIndustry(user);
  const parents = stats.sampleParents || [];

  let parentLines = '';
  if (parents.length > 0) {
    parentLines = parents.slice(0, 3).map(p => {
      const role = [p.current_position, p.current_company].filter(Boolean).join(' at ') || 'CFF parent';
      const ind = p.industry ? ` (${p.industry})` : '';
      return `- ${p.full_name || 'A parent'} — ${role}${ind}`;
    }).join('\n');
  } else {
    parentLines = `- Parents from ${school} are active and open to conversations`;
  }

  const industryLine = industry
    ? `A few of them work in ${industry}, which is the area you said you are focused on.`
    : `Several of them match what you said you are interested in.`;

  const body = `${greeting}

A few parents from ${school} you might want to know about:

${parentLines}

${industryLine}

These are real people who said they're open to hearing from students at ${school}. The directory has their full profiles — what they do, how they can help, and how to reach them.

Log in and take a look: ${APP_URL}

— Jill

P.S. You do not have to have a specific ask ready. Most students who reach out just start with: "I am studying X and would love to hear how you got into Y." That is enough.`;

  return {
    subject: `Parents from ${school} you might want to meet`,
    body_text: body,
    body_html: wrapHtml(body),
  };
}

// DAY 2 — Tier 3: FastIQ-led, no parent names/counts, continues the alumni thread
function templateDay2Tier3(user, stats) {
  const first = firstName(user);
  const greeting = first ? `${first},` : `Hi,`;
  const industry = primaryIndustry(user);
  const cg = user.career_goals;
  const targetCompanies = cg?.target_companies || [];

  let companyLine = '';
  if (targetCompanies.length > 0) {
    const companies = targetCompanies.slice(0, 3).join(', ');
    companyLine = `You listed ${companies} as target companies. FastIQ can show you who from your school has worked there — and help you write a message to reach out.`;
  } else if (industry) {
    companyLine = `FastIQ can show you alumni working in ${industry} right now and help you write a first message.`;
  } else {
    companyLine = `Once your profile is set up, FastIQ can show you alumni at companies you care about and help you write a first message.`;
  }

  const body = `${greeting}

I wanted to follow up on what I mentioned when you joined.

FastIQ is built for the situation you're in: you know roughly what you want, but you don't have a direct line to people doing it. That's what it fixes.

${companyLine}

You don't have to know exactly what to say. FastIQ helps you draft the message too.

Log in and take a look: ${APP_URL}

— Jill

P.S. The students who get responses are usually the ones who send a message in the first week. After that it gets easier to put off.`;

  return {
    subject: `Your next step on CFF`,
    body_text: body,
    body_html: wrapHtml(body),
  };
}

// DAY 5 — Tier 1/2: School-scoped activity summary
function templateDay5Tier12(user, stats) {
  const first = firstName(user);
  const greeting = first ? `${first},` : `Hi,`;
  const school = user.school_name || user.school || 'your school';
  const newParents7d = stats.newParentsAtSchoolLast7Days || 0;
  const recentMessages = stats.recentMessages || 0;
  const topIndustries = stats.topIndustriesAtSchool || [];

  const industryLine = topIndustries.length > 0
    ? `The most active industries at ${school} this week: ${topIndustries.slice(0, 3).join(', ')}.`
    : `Parents at ${school} across a range of industries have been active this week.`;

  const msgLine = recentMessages > 0
    ? `${plural(recentMessages, 'conversation')} started between students and parents`
    : 'Students and parents have been connecting';

  const newParentsLine = newParents7d > 0
    ? `${plural(newParents7d, 'new parent')} from ${school} joined this week`
    : `The parent network at ${school} is active`;

  const body = `${greeting}

Quick update on what has been happening on CFF this week:

- ${newParentsLine}
- ${msgLine}
- ${industryLine}

This is a small, active community — not a job board. The people on here actually respond.

If you have not set up your profile yet, that is the one thing that makes a difference: ${APP_URL}

— Jill

P.S. The students who get the most out of CFF are not necessarily the most prepared — they are just the ones who showed up first.`;

  return {
    subject: `What has been happening on CFF this week`,
    body_text: body,
    body_html: wrapHtml(body),
  };
}

// DAY 5 — Tier 3: Skip school-specific stats (nothing to show), lead with FastIQ momentum
function templateDay5Tier3(user, stats) {
  const first = firstName(user);
  const greeting = first ? `${first},` : `Hi,`;
  const industry = primaryIndustry(user);

  const industryMention = industry
    ? `in ${industry}`
    : 'in the areas you care about';

  const body = `${greeting}

You've been on CFF for about 5 days. I wanted to check in.

FastIQ has been active this week — students have been using it to find alumni ${industryMention} and start conversations. That's the path that tends to move fastest when you're getting started.

The one thing that makes a difference: a complete profile. Your major, graduation year, and target industries. Without it, you can't reach out.

Takes 4 minutes: ${APP_URL}

— Jill

P.S. You don't have to have a great resume or a polished pitch. You just have to start.`;

  return {
    subject: `Five days in — here's where most students get stuck`,
    body_text: body,
    body_html: wrapHtml(body),
  };
}

// DAY 9 Active — Tier 1/2: School+industry-scoped update
function templateDay9ActiveTier12(user, stats) {
  const first = firstName(user);
  const greeting = first ? `${first},` : `Hi,`;
  const school = user.school_name || user.school || 'your school';
  const industry = primaryIndustry(user) || 'your target industry';
  const newInIndustry = stats.newParentsInIndustryAtSchoolLast7Days || 0;
  const totalInIndustry = stats.parentsInIndustryAtSchool || 0;

  let countLine;
  if (newInIndustry > 0) {
    countLine = `${plural(newInIndustry, 'new parent')} in ${industry} from ${school} joined CFF this week.`;
    if (totalInIndustry > 0) countLine += ` That is ${plural(totalInIndustry, 'parent')} total in that area at your school.`;
  } else if (totalInIndustry > 0) {
    countLine = `There are ${plural(totalInIndustry, 'parent')} in ${industry} from ${school} on the platform.`;
  } else {
    // No parents in this industry at this school — pivot to FastIQ
    countLine = `FastIQ has alumni in ${industry} you can reach out to directly — even if the parent network at ${school} doesn't have that covered yet.`;
  }

  const body = `${greeting}

${countLine}

Since you have already been checking things out — thought you would want to know.

Log in to see who is new: ${APP_URL}

— Jill

P.S. A short message goes a long way. Something like "I saw your profile and I am studying X — would you be open to a quick conversation?" is all you need.`;

  return {
    subject: newInIndustry > 0
      ? `${plural(newInIndustry, 'new parent')} in ${industry} from ${school} this week`
      : `Updates from ${school}'s network`,
    body_text: body,
    body_html: wrapHtml(body),
  };
}

// DAY 9 Dormant — Tier 1/2: School+industry-scoped
function templateDay9DormantTier12(user, stats) {
  const first = firstName(user);
  const greeting = first ? `${first},` : `Hi,`;
  const school = user.school_name || user.school || 'your school';
  const industry = primaryIndustry(user) || 'your target area';
  const newInIndustry = stats.newParentsInIndustryAtSchoolLast7Days || 0;
  const totalInIndustry = stats.parentsInIndustryAtSchool || 0;

  let countLine;
  if (newInIndustry > 0) {
    countLine = `${plural(newInIndustry, 'parent')} in ${industry} from ${school} joined since you did.`;
  } else if (totalInIndustry > 0) {
    countLine = `There are ${plural(totalInIndustry, 'parent')} in ${industry} from ${school} on the platform.`;
  } else {
    countLine = `FastIQ has alumni in ${industry} you can reach out to — a faster path when the parent network at ${school} is still growing in your area.`;
  }

  const body = `${greeting}

You signed up for CFF about 9 days ago and I wanted to check in.

${countLine} These are people who said they're open to hearing from students.

I know it is easy to sign up and not get back to it. No pressure — but if you have 5 minutes, log in and see who is there: ${APP_URL}

— Jill

P.S. Your profile takes 4 minutes. That is the only thing standing between you and being able to reach out.`;

  return {
    subject: newInIndustry > 0
      ? `${plural(newInIndustry, 'parent')} in ${industry} from ${school} since you signed up`
      : `Checking in — 9 days since you joined`,
    body_text: body,
    body_html: wrapHtml(body),
  };
}

// DAY 9 Active — Tier 3: FastIQ-focused
function templateDay9ActiveTier3(user, stats) {
  const first = firstName(user);
  const greeting = first ? `${first},` : `Hi,`;
  const industry = primaryIndustry(user) || 'your target area';

  const body = `${greeting}

You've been active on CFF — that's good. Wanted to give you an update.

FastIQ has new alumni results in ${industry} this week. If you haven't started a conversation yet, this is a good moment to try.

The students who get responses are the ones who send a message before they feel ready. The message doesn't have to be perfect.

Log in: ${APP_URL}

— Jill

P.S. Something like "I'm a student interested in ${industry} — would you be open to a 15-minute conversation?" is enough to get a response from most people.`;

  return {
    subject: `Alumni in ${industry} — ready when you are`,
    body_text: body,
    body_html: wrapHtml(body),
  };
}

// DAY 9 Dormant — Tier 3: FastIQ-focused
function templateDay9DormantTier3(user, stats) {
  const first = firstName(user);
  const greeting = first ? `${first},` : `Hi,`;
  const industry = primaryIndustry(user) || 'your target area';

  const body = `${greeting}

You signed up about 9 days ago and I wanted to check in.

I know it's easy to sign up and not come back. Here's what's waiting for you: FastIQ has alumni in ${industry} you can reach out to today. You don't need a referral or a warm intro — just a profile and a short message.

That's what CFF is for. Log in when you're ready: ${APP_URL}

— Jill

P.S. Takes about 10 minutes to set up your profile and send your first message. Most students say it feels easier than they expected.`;

  return {
    subject: `Still here when you're ready`,
    body_text: body,
    body_html: wrapHtml(body),
  };
}

// DAY 14 Complete — same for all tiers (no counts)
function templateDay14Complete(user) {
  const first = firstName(user);
  const greeting = first ? `${first},` : `Hi,`;

  const body = `${greeting}

You have been on CFF for two weeks and your profile is set up — that is actually more than most students do.

Here is how this works in practice: browse the parent directory, find someone in an industry or company you care about, and send a short note. Something like "I am studying X and interested in Y — would you be open to a quick conversation?" works fine.

Parents on this platform said they're open to receiving messages. They signed up for this.

Go find someone worth reaching out to: ${APP_URL}

— Jill

P.S. One conversation can lead to a referral, an introduction, or just a better sense of what you are walking into. It is worth the 5 minutes.`;

  return {
    subject: `Two weeks in — here is what to do next`,
    body_text: body,
    body_html: wrapHtml(body),
  };
}

// DAY 14 Incomplete — same for all tiers (no counts)
function templateDay14Incomplete(user) {
  const first = firstName(user);
  const greeting = first ? `${first},` : `Hi,`;
  const missing = missingProfileFields(user);
  const missingStr = missing.length > 0
    ? `You are still missing: ${missing.join(', ')}.`
    : 'Your profile has a few gaps.';

  const body = `${greeting}

You signed up two weeks ago, so I wanted to check in.

${missingStr} I get it — it is easy to sign up and not get back to it.

Here is the honest version of why it matters: parents in the directory can see your profile when you reach out. A profile with your major and what you are interested in makes a real difference in whether you get a response.

It takes about 4 minutes: ${APP_URL}

— Jill

P.S. The directory has parents across industries. Once your profile is up, you can browse and reach out directly.`;

  return {
    subject: `Two weeks in — one thing left to do`,
    body_text: body,
    body_html: wrapHtml(body),
  };
}

// ─── Template Router ───────────────────────────────────────────────────────────

function selectTemplate(targetDay, student, stats, isActive) {
  const tier = classifyTier(student, stats);
  const profileDone = isProfileComplete(student);

  if (targetDay === 0) {
    if (tier === 1) return { template: templateDay0Tier1(student, stats), tier };
    if (tier === 2) return { template: templateDay0Tier2(student, stats), tier };
    return { template: templateDay0Tier3(student, stats), tier };
  }
  if (targetDay === 2) {
    if (tier === 3) return { template: templateDay2Tier3(student, stats), tier };
    return { template: templateDay2Tier12(student, stats), tier };
  }
  if (targetDay === 5) {
    if (tier === 3) return { template: templateDay5Tier3(student, stats), tier };
    return { template: templateDay5Tier12(student, stats), tier };
  }
  if (targetDay === 9) {
    if (tier === 3) {
      return { template: isActive ? templateDay9ActiveTier3(student, stats) : templateDay9DormantTier3(student, stats), tier };
    }
    return { template: isActive ? templateDay9ActiveTier12(student, stats) : templateDay9DormantTier12(student, stats), tier };
  }
  if (targetDay === 14) {
    return { template: profileDone ? templateDay14Complete(student) : templateDay14Incomplete(student), tier };
  }
  return { template: null, tier };
}

// ─── Unified Frequency Cap ────────────────────────────────────────────────────
// Counts emails from ALL sources sent to this user in the past 7 days:
//   1. EngagementEmail records (this agent's own sends)
//   2. EmailLog records (sendWelcomeEmail, sendFoundingRateBlast, trialEmailScheduler, etc.)
// If combined count >= 2, skip — the agent's email will be picked up next run.

function checkFrequencyCap(existingEmails, userId, userEmail, emailLogByEmail) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Count agent emails sent/approved in last 7 days
  const agentCount = existingEmails.filter(e =>
    e.user_id === userId &&
    ['approved', 'sent'].includes(e.status) &&
    e.created_date >= sevenDaysAgo
  ).length;

  // Count emails from all other sources (EmailLog) in last 7 days
  const externalCount = (emailLogByEmail[userEmail?.toLowerCase()] || []).filter(e =>
    e.sent_at >= sevenDaysAgo
  ).length;

  const total = agentCount + externalCount;
  return total < 2; // true = cap not hit, ok to queue
}

function alreadyQueuedForDay(existingEmails, userId, sequenceDay) {
  return existingEmails.some(e =>
    e.user_id === userId &&
    e.sequence_day === sequenceDay &&
    ['pending_approval', 'approved', 'sent'].includes(e.status)
  );
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

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

    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);
    const students = allUsers.filter(u =>
      ['student', 'gator'].includes(u.persona) ||
      (Array.isArray(u.roles) && (u.roles.includes('student') || u.roles.includes('gator')))
    );

    let existingEmails = [];
    try {
      existingEmails = await base44.asServiceRole.entities.EngagementEmail.list('-created_date', 2000);
    } catch (_) { existingEmails = []; }

    // Unified frequency cap: fetch recent EmailLog records from ALL email sources
    // (sendWelcomeEmail, sendFoundingRateBlast, trialEmailScheduler, fastiqUnansweredTrigger, etc.)
    let emailLogByEmail = {};
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const recentLogs = await base44.asServiceRole.entities.EmailLog.list('-sent_at', 2000);
      const recentFiltered = recentLogs.filter(e => e.sent_at >= sevenDaysAgo && e.status === 'sent');
      recentFiltered.forEach(e => {
        const key = e.user_email?.toLowerCase();
        if (key) {
          if (!emailLogByEmail[key]) emailLogByEmail[key] = [];
          emailLogByEmail[key].push(e);
        }
      });
    } catch (_) { emailLogByEmail = {}; }

    const allParents = allUsers.filter(u =>
      u.persona === 'parent' || (Array.isArray(u.roles) && u.roles.includes('parent'))
    );

    let recentMsgCount = 0;
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const msgs = await base44.asServiceRole.entities.Message.list('-created_date', 200);
      recentMsgCount = msgs.filter(m => m.created_date >= sevenDaysAgo).length;
    } catch (_) {}

    const results = { queued: 0, skipped: 0, legacy_skipped: 0, details: [] };

    for (const student of students) {
      if (!student.created_date || student.created_date < AGENT_LAUNCH_DATE) {
        results.legacy_skipped++;
        continue;
      }

      if (student.reengagement_unsubscribed) {
        results.skipped++;
        continue;
      }

      // ROUTING GATE: Students on active FastIQ trial belong to Trial Activation sequence (TBD).
      // Students who are paid subscribers need no onboarding emails.
      // Only students with NO FastIQ engagement follow Workflow 1.
      // NOTE: From 2026-04-29, new trials are 5-day CC-required auto-convert. Grandfathered 16 users
      // on the old 7-day no-card model keep their original terms. Routing logic is model-agnostic.
      const isActiveTrial = student.fastiq_trial_active === true ||
        student.trial_status === 'active' ||
        student.membership_tier === 'fastiq_trial';
      const isPaidSubscriber = student.subscription_status === 'active' &&
        student.membership_tier !== 'fastiq_trial';
      const trialExpired = student.trial_end_date && new Date(student.trial_end_date) <= new Date() &&
        !isPaidSubscriber;

      if (isPaidSubscriber) {
        results.details.push({ email: student.email, skipped: 'paid_subscriber — no onboarding needed' });
        results.skipped++;
        continue;
      }
      if (isActiveTrial && !trialExpired) {
        results.details.push({ email: student.email, skipped: 'active_fastiq_trial — routed to Trial Activation sequence (TBD)' });
        results.skipped++;
        continue;
      }
      // trialExpired students fall through to Workflow 1 (they didn't convert — need re-engagement)
      // students who never started a trial follow Workflow 1 normally

      const signupDate = student.created_date;
      const daysSinceSignup = daysSince(signupDate);

      let targetDay = null;
      for (const seqDay of [...SEQUENCE_DAYS].reverse()) {
        if (daysSinceSignup >= seqDay) {
          const alreadyQueued = alreadyQueuedForDay(existingEmails, student.id, seqDay);
          if (!alreadyQueued) {
            targetDay = seqDay;
            break;
          }
        }
      }

      if (targetDay === null) { results.skipped++; continue; }

      const capOk = checkFrequencyCap(existingEmails, student.id, student.email, emailLogByEmail);
      if (!capOk) {
        results.details.push({ email: student.email, skipped: `frequency cap (day ${targetDay})` });
        results.skipped++;
        continue;
      }

      const stats = fetchStats(student, allParents, recentMsgCount);
      const isActive = (student.platform_visit_count > 1) ||
        (student.last_active_at && daysSince(student.last_active_at) <= 7);

      const { template, tier } = selectTemplate(targetDay, student, stats, isActive);
      if (!template) { results.skipped++; continue; }

      const emailRecord = {
        user_id: student.id,
        user_email: student.email,
        user_name: firstName(student),
        school_code: student.school_code || '',
        workflow: 'onboarding',
        sequence_day: targetDay,
        template_id: `onboarding_day${targetDay}_tier${tier}${targetDay === 9 ? (isActive ? '_active' : '_dormant') : ''}${targetDay === 14 ? (isProfileComplete(student) ? '_complete' : '_incomplete') : ''}`,
        subject: template.subject,
        body_html: template.body_html,
        body_text: template.body_text,
        personalization_data: {
          tier,
          profileComplete: isProfileComplete(student),
          isActive,
          daysSinceSignup,
          industry: primaryIndustry(student),
          school: student.school_name || student.school,
          parentsAtSchool: stats.parentsAtSchool,
          parentsInIndustryAtSchool: stats.parentsInIndustryAtSchool,
          newParentsAtSchoolLast7Days: stats.newParentsAtSchoolLast7Days,
          newParentsInIndustryAtSchoolLast7Days: stats.newParentsInIndustryAtSchoolLast7Days,
        },
        status: 'pending_approval',
        frequency_check_passed: true,
        scheduled_send_at: new Date().toISOString(),
      };

      if (!dryRun) {
        await base44.asServiceRole.entities.EngagementEmail.create(emailRecord);
        results.queued++;
      } else {
        results.details.push({
          email: student.email,
          name_resolved: firstName(student) || '(no name)',
          tier,
          day: targetDay,
          parentsAtSchool: stats.parentsAtSchool,
          parentsInIndustryAtSchool: stats.parentsInIndustryAtSchool,
          subject: template.subject,
          body_text: template.body_text,
        });
        results.queued++;
      }
    }

    return Response.json({
      success: true,
      dryRun,
      totalStudents: students.length,
      legacy_skipped: results.legacy_skipped,
      queued: results.queued,
      skipped: results.skipped,
      details: results.details,
    });
  } catch (error) {
    console.error('runEngagementAgent error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});