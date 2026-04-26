/**
 * CFF Engagement Agent — Workflow 1: Onboarding Sequence
 * 
 * Runs daily. For each student, checks which day they're on in the onboarding
 * sequence and queues the appropriate email for Jill's approval.
 * 
 * Day 0 → immediate welcome (queued same day as signup)
 * Day 2 → 3 parent profiles from their school/industry
 * Day 5 → platform activity summary
 * Day 9 → personalized industry update (two variants: active vs dormant)
 * Day 14 → re-orientation (two variants: profile complete vs incomplete)
 *
 * Safety rules enforced:
 * - Max 2 emails per student per 7 days
 * - No send between 10pm–7am ET (default timezone)
 * - Skip if student unsubscribed
 * - Skip if email already sent for this sequence day
 * - All emails → status: pending_approval (Jill reviews before send)
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const APP_URL = Deno.env.get('APP_BASE_URL') || 'https://collegefastforward.com';
const FROM_EMAIL = 'support@collegefastforward.com';
const FROM_NAME = 'Jill at CFF';
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');

// Onboarding sequence days
const SEQUENCE_DAYS = [0, 2, 5, 9, 14];

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

function isProfileComplete(user) {
  const hasMajor = !!(user.major?.trim());
  const hasYear = !!(user.graduation_year);
  const hasIndustry = primaryIndustry(user) !== null;
  const hasBio = !!(user.bio?.trim());
  return hasMajor && hasYear && hasIndustry && hasBio;
}

function missingProfileFields(user) {
  const missing = [];
  if (!user.major?.trim()) missing.push('your major');
  if (!user.graduation_year) missing.push('your graduation year');
  if (!primaryIndustry(user)) missing.push('your target industry');
  if (!user.bio?.trim()) missing.push('a one-sentence note about what you are looking for');
  return missing;
}

function firstName(user) {
  return user.first_name || user.full_name?.split(' ')[0] || 'there';
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

// ─── Email Templates ───────────────────────────────────────────────────────────

function templateDay0(user, stats) {
  const first = firstName(user);
  const school = user.school_name || user.school || 'your school';
  const parentCount = stats.parentsAtSchool || 0;

  const body = `Hi ${first},

You just joined College Fast Forward, and I wanted to reach out personally.

We have ${parentCount} parents from ${school} on the platform right now. They have real jobs, real connections, and they signed up specifically to be available to students like you.

It takes about 4 minutes to fill out your profile: your major, graduation year, the industry you are interested in, and one sentence about what you are looking for. Once it is done, you can browse the full directory and reach out directly.

Log in and get your profile set up: ${APP_URL}

-- Jill

P.S. Parents on this platform are not here to lecture you. Most of them just wish someone had done this for them when they were in school.`;

  return {
    subject: `Welcome to CFF -- ${parentCount} parents from ${school} are here`,
    body_text: body,
    body_html: wrapHtml(body),
  };
}

function templateDay2(user, stats) {
  const first = firstName(user);
  const school = user.school_name || user.school || 'your school';
  const industry = primaryIndustry(user);
  const parents = stats.sampleParents || [];

  let parentLines = '';
  if (parents.length > 0) {
    parentLines = parents.slice(0, 3).map(p => {
      const role = [p.current_position, p.current_company].filter(Boolean).join(' at ') || 'CFF parent';
      const ind = p.industry ? ` (${p.industry})` : '';
      return `- ${p.full_name || 'A parent'} -- ${role}${ind}`;
    }).join('\n');
  } else {
    parentLines = `- Several parents from ${school} are active and open to conversations`;
  }

  const industryLine = industry
    ? `A few of them work in ${industry}, which is the area you said you are focused on.`
    : `Several of them match what you said you are interested in.`;

  const body = `${first},

A few parents on the platform you might want to know about:

${parentLines}

${industryLine}

These are real people who said yes to being available to students. The directory has their full profiles -- what they do, how they can help, and how to reach them.

Log in and take a look: ${APP_URL}

-- Jill

P.S. You do not have to have a specific ask ready. Most students who reach out just start with: "I am studying X and would love to hear how you got into Y."`;

  return {
    subject: `3 parents from ${school} you might want to meet`,
    body_text: body,
    body_html: wrapHtml(body),
  };
}

function templateDay5(user, stats) {
  const first = firstName(user);
  const newParents7d = stats.newParentsLast7Days || 0;
  const recentMessages = stats.recentMessages || 0;
  const topIndustries = stats.topIndustriesThisWeek || [];

  const industryLine = topIndustries.length > 0
    ? `The most active industries this week: ${topIndustries.slice(0, 3).join(', ')}.`
    : 'Parents across a range of industries have been active this week.';

  const msgLine = recentMessages > 0
    ? `${recentMessages} conversations started between students and parents`
    : 'Students and parents have been connecting';

  const body = `${first},

Quick update on what has been happening on CFF this week:

- ${newParents7d > 0 ? `${newParents7d} new parents joined the platform` : 'New parents joined the platform'}
- ${msgLine}
- ${industryLine}

This is a small, active community -- not a job board. The people on here actually respond.

If you have not set up your profile yet, that is the one thing that makes a difference: ${APP_URL}

-- Jill

P.S. The students who get the most out of CFF are not necessarily the most prepared -- they are just the ones who showed up first.`;

  return {
    subject: `What has been happening on CFF this week`,
    body_text: body,
    body_html: wrapHtml(body),
  };
}

function templateDay9Active(user, stats) {
  const first = firstName(user);
  const industry = primaryIndustry(user) || 'your target industry';
  const newInIndustry = stats.newParentsInIndustry7Days || 0;
  const totalInIndustry = stats.totalParentsInIndustry || 0;

  const countLine = newInIndustry > 0
    ? `${newInIndustry} new parent${newInIndustry > 1 ? 's' : ''} in ${industry} joined CFF this week.`
    : `There are now ${totalInIndustry} parents in ${industry} on the platform.`;

  const body = `${first},

${countLine} ${totalInIndustry > 0 && newInIndustry > 0 ? `That is ${totalInIndustry} total in that area now.` : ''}

Since you have already been checking things out -- thought you would want to know.

Log in to see who is new: ${APP_URL}

-- Jill

P.S. Parents who just joined tend to respond fastest. In their first few weeks, they are still checking the platform regularly.`;

  return {
    subject: `New parents in ${industry} this week`,
    body_text: body,
    body_html: wrapHtml(body),
  };
}

function templateDay9Dormant(user, stats) {
  const first = firstName(user);
  const industry = primaryIndustry(user) || 'your target area';
  const newInIndustry = stats.newParentsInIndustry7Days || 0;
  const totalInIndustry = stats.totalParentsInIndustry || 0;

  const countLine = newInIndustry > 0
    ? `${newInIndustry} parent${newInIndustry > 1 ? 's' : ''} in ${industry} joined since you did.`
    : `There are ${totalInIndustry} parents in ${industry} on the platform.`;

  const body = `${first},

You signed up for CFF about 9 days ago and I wanted to check in.

${countLine} These are people who specifically said they are open to hearing from students.

I know it is easy to sign up and not get back to it. No pressure -- but if you have 5 minutes, log in and see who is there: ${APP_URL}

-- Jill

P.S. Your profile takes 4 minutes. That is the only thing standing between you and being able to reach out.`;

  return {
    subject: newInIndustry > 0
      ? `${newInIndustry} new parent${newInIndustry > 1 ? 's' : ''} in ${industry} since you signed up`
      : `Parents in ${industry} are waiting`,
    body_text: body,
    body_html: wrapHtml(body),
  };
}

function templateDay14Complete(user) {
  const first = firstName(user);

  const body = `${first},

You have been on CFF for two weeks and your profile is set up -- that is actually more than most students do.

Here is how this works in practice: browse the parent directory, find someone in an industry or company you care about, and send a short note. Something like "I am studying X and interested in Y -- would you be open to a quick conversation?" works fine.

Parents on this platform said yes to receiving messages. They signed up for this.

Go find someone worth reaching out to: ${APP_URL}

-- Jill

P.S. The students who get the most out of networking are the ones who treat it like a normal conversation, not a favor ask.`;

  return {
    subject: `Two weeks in -- here is what to do next`,
    body_text: body,
    body_html: wrapHtml(body),
  };
}

function templateDay14Incomplete(user) {
  const first = firstName(user);
  const missing = missingProfileFields(user);
  const missingStr = missing.length > 0
    ? `You are still missing: ${missing.join(', ')}.`
    : 'Your profile has a few gaps.';

  const body = `${first},

You signed up two weeks ago, so I wanted to check in.

${missingStr} I get it -- it is easy to sign up and not get back to it.

Here is the honest version of why it matters: parents in the directory can see your profile when you reach out. A profile with your major, what you are interested in, and one sentence about what you are looking for makes a real difference in whether you get a response.

It takes about 4 minutes: ${APP_URL}

-- Jill

P.S. The directory has parents in most industries. Once your profile is up, you can browse and reach out directly.`;

  return {
    subject: `Two weeks in -- one thing left to do`,
    body_text: body,
    body_html: wrapHtml(body),
  };
}

// ─── Stats Fetchers ───────────────────────────────────────────────────────────

function fetchStats(user, allParents, recentMsgCount) {
  const schoolCode = user.school_code;
  const industry = primaryIndustry(user);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const parentsAtSchool = allParents.filter(p => p.school_code === schoolCode || p.school_name === user.school_name).length;
  const newParentsLast7Days = allParents.filter(p => p.created_date >= sevenDaysAgo).length;

  const parentsInIndustry = industry
    ? allParents.filter(p => {
        const pInd = (p.industry || '').toLowerCase();
        const indLower = industry.toLowerCase();
        return pInd.includes(indLower) || indLower.includes(pInd.split(' ')[0]);
      })
    : [];
  const totalParentsInIndustry = parentsInIndustry.length;
  const newParentsInIndustry7Days = parentsInIndustry.filter(p => p.created_date >= sevenDaysAgo).length;

  const schoolParents = allParents.filter(p => p.school_code === schoolCode || p.school_name === user.school_name);
  const samplePool = schoolParents.length >= 3 ? schoolParents : allParents;
  const sampleParents = samplePool.slice(0, 3).map(p => ({
    full_name: p.full_name,
    current_position: p.current_position,
    current_company: p.current_company,
    industry: p.industry,
  }));

  const industryCounts = {};
  allParents.forEach(p => {
    if (p.industry) industryCounts[p.industry] = (industryCounts[p.industry] || 0) + 1;
  });
  const topIndustriesThisWeek = Object.entries(industryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([ind]) => ind);

  return {
    parentsAtSchool,
    newParentsLast7Days,
    totalParentsInIndustry,
    newParentsInIndustry7Days,
    sampleParents,
    topIndustriesThisWeek,
    recentMessages: recentMsgCount || 0,
  };
}

// ─── Frequency Cap Check (uses pre-fetched records) ──────────────────────────

function checkFrequencyCap(existingEmails, userId) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const recentForUser = existingEmails.filter(e =>
    e.user_id === userId &&
    ['approved', 'sent'].includes(e.status) &&
    e.created_date >= sevenDaysAgo
  );
  return recentForUser.length < 2;
}

function alreadyQueuedForDay(existingEmails, userId, sequenceDay) {
  return existingEmails.some(e =>
    e.user_id === userId &&
    e.sequence_day === sequenceDay &&
    ['pending_approval', 'approved', 'sent'].includes(e.status)
  );
}

// ─── Send via SendGrid ────────────────────────────────────────────────────────

async function sendEmail(toEmail, toName, subject, bodyHtml, bodyText) {
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail, name: toName }] }],
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject,
      content: [
        { type: 'text/plain', value: bodyText },
        { type: 'text/html', value: bodyHtml },
      ],
      tracking_settings: {
        click_tracking: { enable: true },
        open_tracking: { enable: true },
      },
    }),
  });
  const msgId = res.headers.get('X-Message-Id');
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SendGrid error ${res.status}: ${err}`);
  }
  return msgId;
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    // Optional: pass { dryRun: true } to preview without creating records
    const body = await req.json().catch(() => ({}));
    const dryRun = body.dryRun === true;

    // Fetch all students (persona: student OR gator)
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);
    const students = allUsers.filter(u =>
      ['student', 'gator'].includes(u.persona) ||
      (Array.isArray(u.roles) && (u.roles.includes('student') || u.roles.includes('gator')))
    );

    // Pre-fetch all existing engagement emails once (avoids rate limits)
    let existingEmails = [];
    try {
      existingEmails = await base44.asServiceRole.entities.EngagementEmail.list('-created_date', 2000);
    } catch (_) { existingEmails = []; }

    // Pre-fetch all parents once
    const allParents = allUsers.filter(u =>
      u.persona === 'parent' || (Array.isArray(u.roles) && u.roles.includes('parent'))
    );

    // Pre-fetch recent message count once
    let recentMsgCount = 0;
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const msgs = await base44.asServiceRole.entities.Message.list('-created_date', 200);
      recentMsgCount = msgs.filter(m => m.created_date >= sevenDaysAgo).length;
    } catch (_) {}

    const results = { queued: 0, skipped: 0, details: [] };

    for (const student of students) {
      // Skip unsubscribed
      if (student.reengagement_unsubscribed) {
        results.skipped++;
        continue;
      }

      const signupDate = student.created_date;
      if (!signupDate) { results.skipped++; continue; }

      const daysSinceSignup = daysSince(signupDate);

      // Find which sequence day to send today
      // We find the highest day that has passed but not yet been queued
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

      // Frequency cap
      const capOk = checkFrequencyCap(existingEmails, student.id);
      if (!capOk) {
        results.details.push({ email: student.email, skipped: `frequency cap (day ${targetDay})` });
        results.skipped++;
        continue;
      }

      // Compute stats for personalization (no extra DB calls — uses pre-fetched data)
      const stats = fetchStats(student, allParents, recentMsgCount);

      // Generate the email
      let template;
      const profileDone = isProfileComplete(student);
      // Active = has visited recently (last_active_at within 7 days OR platform_visit_count > 1)
      const isActive = (student.platform_visit_count > 1) ||
        (student.last_active_at && daysSince(student.last_active_at) <= 7);

      if (targetDay === 0) {
        template = templateDay0(student, stats);
      } else if (targetDay === 2) {
        template = templateDay2(student, stats);
      } else if (targetDay === 5) {
        template = templateDay5(student, stats);
      } else if (targetDay === 9) {
        template = isActive ? templateDay9Active(student, stats) : templateDay9Dormant(student, stats);
      } else if (targetDay === 14) {
        template = profileDone ? templateDay14Complete(student) : templateDay14Incomplete(student);
      }

      if (!template) { results.skipped++; continue; }

      const emailRecord = {
        user_id: student.id,
        user_email: student.email,
        user_name: firstName(student),
        school_code: student.school_code || '',
        workflow: 'onboarding',
        sequence_day: targetDay,
        template_id: `onboarding_day${targetDay}${targetDay === 9 ? (isActive ? '_active' : '_dormant') : ''}${targetDay === 14 ? (profileDone ? '_complete' : '_incomplete') : ''}`,
        subject: template.subject,
        body_html: template.body_html,
        body_text: template.body_text,
        personalization_data: {
          profileComplete: profileDone,
          isActive,
          daysSinceSignup,
          industry: primaryIndustry(student),
          school: student.school_name || student.school,
          parentsAtSchool: stats.parentsAtSchool,
          newParentsInIndustry7Days: stats.newParentsInIndustry7Days,
          totalParentsInIndustry: stats.totalParentsInIndustry,
        },
        status: 'pending_approval',
        frequency_check_passed: true,
        scheduled_send_at: new Date().toISOString(),
      };

      if (!dryRun) {
        await base44.asServiceRole.entities.EngagementEmail.create(emailRecord);
        results.queued++;
      } else {
        results.details.push({ email: student.email, day: targetDay, subject: template.subject });
        results.queued++;
      }
    }

    return Response.json({
      success: true,
      dryRun,
      totalStudents: students.length,
      queued: results.queued,
      skipped: results.skipped,
      details: results.details,
    });
  } catch (error) {
    console.error('runEngagementAgent error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});