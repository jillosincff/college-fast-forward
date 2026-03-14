import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const APP = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";
const DM = "'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const PF = "'Playfair Display',Georgia,'Times New Roman',serif";
const YR = new Date().getFullYear();

const emailWrap = (pre, body, unsub) => `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<span style="display:none;font-size:1px;color:#f4f2ee;max-height:0;overflow:hidden;">${pre}&zwnj;&nbsp;</span>
</head><body style="margin:0;padding:0;background-color:#f4f2ee;font-family:${DM};">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f2ee;"><tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
<tr><td style="background-color:#0d1117;border-radius:16px 16px 0 0;padding:24px 32px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td><span style="font-family:${DM};font-size:18px;font-weight:600;color:#f4f0e8;">C<span style="color:#E85D20;">FF</span></span><span style="font-family:${DM};font-size:11px;font-weight:400;color:rgba(244,240,232,0.4);letter-spacing:0.08em;text-transform:uppercase;margin-left:12px;">College Fast Forward</span></td><td align="right"></td></tr></table></td></tr>
<tr><td style="background-color:#fff;padding:36px 32px;">${body}</td></tr>
<tr><td style="background-color:#0d1117;border-radius:0 0 16px 16px;padding:20px 32px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:${DM};font-size:11px;font-weight:300;color:rgba(244,240,232,0.3);line-height:1.6;">&copy; ${YR} College Fast Forward.<br><a href="${unsub||APP+'/#ProfileEdit'}" style="color:rgba(244,240,232,0.4);text-decoration:underline;">Unsubscribe</a> &middot; <a href="${APP}/#ProfileEdit" style="color:rgba(244,240,232,0.4);text-decoration:underline;">Email preferences</a> &middot; <a href="${APP}" style="color:rgba(244,240,232,0.4);text-decoration:underline;">Visit CFF</a></td><td align="right" style="font-family:${DM};font-size:11px;font-weight:300;color:rgba(244,240,232,0.2);">University of Florida &middot; ${YR}</td></tr></table></td></tr>
</table></td></tr></table></body></html>`;

const personCardHtml = (initials, name, role, company, detail, msgUrl, first) => `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f2ee;border-radius:12px;margin:8px 0;"><tr><td style="padding:14px 16px;"><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="vertical-align:top;width:40px;"><div style="width:40px;height:40px;border-radius:50%;background-color:#0d1117;color:#fff;font-family:${DM};font-size:13px;font-weight:500;text-align:center;line-height:40px;display:inline-block;">${initials}</div></td><td style="padding-left:12px;vertical-align:top;"><p style="font-family:${DM};font-size:14px;font-weight:500;color:#1a1a1a;margin:0 0 2px;">${name}</p><p style="font-family:${DM};font-size:12px;font-weight:300;color:#888;margin:0 0 6px;">${[role,company].filter(Boolean).join(' &middot; ')}</p>${detail?`<p style="font-family:${DM};font-size:12px;font-weight:300;color:#aaa;margin:0;">${detail}</p>`:''}</td>${msgUrl?`<td align="right" style="vertical-align:middle;padding-left:16px;"><table cellpadding="0" cellspacing="0" border="0"><tr><td style="background-color:#0d1117;border-radius:100px;padding:7px 16px;"><a href="${msgUrl}" style="font-family:${DM};font-size:12px;font-weight:500;color:#fff;text-decoration:none;">Message ${first||'them'}</a></td></tr></table></td>`:''}</tr></table></td></tr></table>`;

// Subject lines per spec
const subjectLineVariants = {
  day7: [(data) => `You have ${data.count} new matches waiting`],
  day21: [(data) => `${data.count} people in the network can help you right now`],
  day45: [(data) => `Your account is still here — and so are your matches`],
};

function getDaysSince(dateStr) {
  if (!dateStr) return 999;
  const date = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - date) / (1000 * 60 * 60 * 24));
}

function parseFirstName(fullName) {
  if (!fullName) return 'there';
  const parts = fullName.split(' ');
  return parts[0] || 'there';
}

function truncate(str, maxLen) {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen - 3) + '...';
}

function formatTimeAgo(dateStr) {
  const days = getDaysSince(dateStr);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
}

function formatHelpType(type) {
  const labels = {
    career_advice: 'Career Advice',
    internship_leads: 'Internship Leads',
    resume_review: 'Resume Review',
    interview_prep: 'Interview Prep',
    industry_insights: 'Industry Insights',
    networking_intros: 'Networking Intros',
    informational_interview: 'Informational Interview'
  };
  return labels[type] || type;
}

function formatIndustry(industry) {
  if (!industry) return 'professional';
  return industry.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function generateTrackingId() {
  return 'trk_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function getSubject(emailType, data) {
  return subjectLineVariants[emailType][0](data);
}

// Simple industry matching score
function matchQuestionToParent(question, user) {
  let score = 0;
  
  const userIndustries = user.industries || [];
  const questionIndustry = question.target_industry || question.industry;
  
  // Industry match: +50
  if (questionIndustry && userIndustries.some(i => 
    i.toLowerCase().includes(questionIndustry.toLowerCase()) ||
    questionIndustry.toLowerCase().includes(i.toLowerCase())
  )) {
    score += 50;
  }
  
  // Help type match: +20 each
  const userHelpTypes = user.help_types || [];
  const questionHelpTypes = question.help_types || [];
  const helpMatches = questionHelpTypes.filter(h => userHelpTypes.includes(h)).length;
  score += helpMatches * 20;
  
  // Recency bonus: +10 for questions < 7 days old
  const daysSincePosted = getDaysSince(question.created_date);
  if (daysSincePosted < 7) score += 10;
  
  return score;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Called by trusted scheduled automation — no user auth required
    
    const { dryRun = false, limit = 50 } = await req.json().catch(() => ({}));
    
    console.log(`🔄 Starting re-engagement job (dryRun: ${dryRun}, limit: ${limit})`);
    
    // Get settings first - check if enabled
    const settingsRecords = await base44.asServiceRole.entities.ReengagementSettings.filter({});
    
    if (settingsRecords.length === 0) {
      console.log('⏭️ No re-engagement settings found, skipping job');
      return Response.json({ success: true, skipped: true, reason: 'No settings configured' });
    }
    
    const settings = settingsRecords[0];
    
    if (!settings.enabled) {
      console.log('⏭️ Re-engagement emails are disabled, skipping job');
      return Response.json({ success: true, skipped: true, reason: 'Re-engagement disabled' });
    }
    
    console.log(`📧 Re-engagement enabled, using thresholds: ${settings.day1_threshold}/${settings.day2_threshold}/${settings.day3_threshold} days`);
    
    // Get all users with parent/alumni persona
    const allUsers = await base44.asServiceRole.entities.User.filter({});
    
    // Filter to parents/alumni who completed onboarding
    const eligibleUsers = allUsers.filter(u => 
      (u.persona === 'parent' || u.persona === 'alumni') &&
      u.onboarding_completed === true
    );
    
    console.log(`Found ${eligibleUsers.length} parent/alumni users with completed onboarding`);

    // DEDUPLICATION RULE 1: Exclude users who have a FastTrackProfile — 
    // the Fast Track Scout handles their re-engagement with personalized, tier-aware messaging.
    const fastTrackProfiles = await base44.asServiceRole.entities.FastTrackProfile.filter({});
    const fastTrackEmails = new Set(fastTrackProfiles.map(p => p.user_email?.toLowerCase()));
    const preFilterCount = eligibleUsers.length;
    const filteredEligibleUsers = eligibleUsers.filter(u => !fastTrackEmails.has(u.email?.toLowerCase()));
    const fastTrackSkipped = preFilterCount - filteredEligibleUsers.length;
    if (fastTrackSkipped > 0) {
      console.log(`⏭️ Skipped ${fastTrackSkipped} users with FastTrackProfiles (handled by Fast Track Scout)`);
    }
    
    // Get email preferences
    const emailPrefs = await base44.asServiceRole.entities.EmailPreference.filter({});
    const prefsByUser = {};
    emailPrefs.forEach(p => { prefsByUser[p.user_id] = p; });
    
    // Use settings thresholds
    const day1Threshold = settings.day1_threshold || 7;
    const day2Threshold = settings.day2_threshold || 21;
    const day3Threshold = settings.day3_threshold || 45;
    const maxEmailsPerDay = settings.max_emails_per_day || 100;
    
    // Get recent re-engagement emails
    const recentEmails = await base44.asServiceRole.entities.ReengagementEmail.filter({});
    
    // Group emails by user
    const emailsByUser = {};
    recentEmails.forEach(e => {
      if (!emailsByUser[e.user_id]) emailsByUser[e.user_id] = [];
      emailsByUser[e.user_id].push(e);
    });
    
    // Get active questions (from JobRequest and HelpRequest)
    const jobRequests = await base44.asServiceRole.entities.JobRequest.filter({ status: 'active' });
    const helpRequests = await base44.asServiceRole.entities.HelpRequest.filter({ status: 'active' });
    const allQuestions = [...jobRequests, ...helpRequests];
    
    console.log(`Found ${allQuestions.length} active questions`);

    // Compute community stats for 21d/45d templates
    const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const newMembersThisMonth = allUsers.filter(u => u.created_date >= thisMonthStart).length;
    const totalMemberCount = allUsers.length;
    // Count total answered questions (non-zero answer_count)
    const totalQuestionsAnswered = allQuestions.filter(q => (q.answer_count || 0) > 0).length
      + (await base44.asServiceRole.entities.HelpRequest.filter({ status: 'resolved' })).length
      + (await base44.asServiceRole.entities.HelpRequest.filter({ status: 'closed' })).length;
    
    // Fetch all email logs for cross-function rate limiting
    const allEmailLogs = await base44.asServiceRole.entities.EmailLog.filter({}, '-sent_at', 2000);
    const logsByEmail = {};
    allEmailLogs.forEach(l => {
      if (!logsByEmail[l.user_email]) logsByEmail[l.user_email] = [];
      logsByEmail[l.user_email].push(l);
    });
    const rateLimitOneDayAgo = new Date(Date.now() - 24*60*60*1000).toISOString();
    const rateLimitOneWeekAgo = new Date(Date.now() - 7*24*60*60*1000).toISOString();
    const NUDGE_REENGAGE_TYPES = ['nudge_24h','nudge_48h','reengagement_7d','reengagement_21d','reengagement_45d'];

    const results = {
      processed: 0,
      emailsSent: 0,
      skipped: {
        recentlyActive: 0,
        noMatches: 0,
        unsubscribed: 0,
        recentEmail: 0,
        ignoredPrevious: 0,
        maxEmailsReached: 0,
        rateLimited: 0
      },
      errors: []
    };
    
    for (const user of filteredEligibleUsers.slice(0, limit)) {
      try {
        results.processed++;
        
        // Check if user has unsubscribed
        const prefs = prefsByUser[user.id];
        if (prefs && (prefs.reengagement_emails === false || prefs.all_emails === false)) {
          results.skipped.unsubscribed++;
          continue;
        }

        // Anti-spam: max 1/day, max 3/week, max 3 nudge/reengage ever
        const userLogs = logsByEmail[user.email] || [];
        const todayCount = userLogs.filter(l => l.sent_at >= rateLimitOneDayAgo).length;
        const weekCount = userLogs.filter(l => l.sent_at >= rateLimitOneWeekAgo).length;
        const totalNudgeReengage = userLogs.filter(l => NUDGE_REENGAGE_TYPES.includes(l.email_type)).length;
        if (todayCount >= 1 || weekCount >= 3 || totalNudgeReengage >= 3) {
          results.skipped.rateLimited++;
          continue;
        }
        
        // Calculate days since last active
        const daysSinceActive = getDaysSince(user.last_active_at || user.updated_date);
        
        // Skip if recently active (< 7 days)
        if (daysSinceActive < 7) {
          results.skipped.recentlyActive++;
          continue;
        }
        
        // Get user's previous re-engagement emails
        const userEmails = emailsByUser[user.id] || [];
        const emailCount = userEmails.length;
        
        // Check if received email in last 7 days
        const lastEmail = userEmails.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at))[0];
        if (lastEmail && getDaysSince(lastEmail.sent_at) < 7) {
          results.skipped.recentEmail++;
          continue;
        }
        
        // Check if ignored last 3 emails (no opens)
        const recent3 = userEmails.slice(0, 3);
        if (recent3.length >= 3 && recent3.every(e => !e.opened_at)) {
          results.skipped.ignoredPrevious++;
          continue;
        }
        
        // HARD STOP: after 45-day email (3 sent), never send again
        if (emailCount >= 3) {
          results.skipped.maxEmailsReached++;
          continue;
        }

        // Determine which email type to send (using settings thresholds)
        let emailType = null;
        if (daysSinceActive >= day1Threshold && daysSinceActive < day2Threshold && emailCount === 0) {
          emailType = 'day7';
        } else if (daysSinceActive >= day2Threshold && daysSinceActive < day3Threshold && emailCount === 1) {
          emailType = 'day21';
        } else if (daysSinceActive >= day3Threshold && emailCount === 2) {
          emailType = 'day45';
        } else {
          // Not time for next email yet
          continue;
        }
        
        // Check daily limit
        if (results.emailsSent >= maxEmailsPerDay) {
          console.log(`Daily limit of ${maxEmailsPerDay} reached, stopping`);
          break;
        }
        
        // Get matched questions for this user
        const scoredQuestions = allQuestions.map(q => ({
          ...q,
          score: matchQuestionToParent(q, user)
        }));
        
        const matchedQuestions = scoredQuestions
          .filter(q => q.score >= 40)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);
        
        // 7d needs at least 1 matched question; 21d needs at least 2; 45d needs 0 (community stats only)
        const minMatches = emailType === 'day7' ? 1 : emailType === 'day21' ? 2 : 0;
        if (matchedQuestions.length < minMatches) {
          results.skipped.noMatches++;
          continue;
        }
        
        // Prepare email data
        const primaryIndustry = formatIndustry(user.industries?.[0]);
        const studentName = parseFirstName(matchedQuestions[0].poster_name);
        
        const subjectData = {
          industry: primaryIndustry,
          studentName,
          count: matchedQuestions.length,
          firstName: parseFirstName(user.full_name)
        };
        
        const subject = getSubject(emailType, subjectData);
        const trackingId = generateTrackingId();
        
        // Format questions for email
        const formattedQuestions = matchedQuestions.map(q => ({
          id: q.id,
          studentName: parseFirstName(q.poster_name),
          major: q.student_major || q.major || 'Undeclared',
          gradYear: (q.student_year || q.graduation_year || '').slice(-2),
          preview: truncate(q.description, 120),
          helpTypes: (q.help_types || []).slice(0, 2).map(formatHelpType).join(', '),
          timeAgo: formatTimeAgo(q.created_date),
          url: `${APP_BASE_URL}/#QuestionDetail?id=${q.id}&type=${q.role ? 'job' : 'help'}&utm_source=reengagement&utm_campaign=${emailType}`
        }));
        
        if (dryRun) {
          console.log(`[DRY RUN] Would send ${emailType} email to ${user.email} with ${matchedQuestions.length} questions`);
          results.emailsSent++;
          continue;
        }
        
        // Build email HTML
        const emailHtml = buildReengagementEmailHtml(emailType, {
          parentFirstName: parseFirstName(user.full_name),
          primaryIndustry,
          questions: formattedQuestions,
          count: matchedQuestions.length,
          unsubscribeUrl: `${APP_BASE_URL}/#UnsubscribeReengagement?userId=${user.id}`,
          dashboardUrl: `${APP_BASE_URL}/#ParentDashboard?utm_source=reengagement&utm_campaign=${emailType}`,
          communityUrl: `${APP_BASE_URL}/#Connections?utm_source=reengagement&utm_campaign=${emailType}`,
          newMemberCount: newMembersThisMonth,
          memberCount: totalMemberCount,
          totalQuestionsAnswered,
        });
        
        // Send the email
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          subject,
          body: emailHtml,
          from_name: 'College Fast Forward'
        });
        
        // Record the email
        await base44.asServiceRole.entities.ReengagementEmail.create({
          user_id: user.id,
          user_email: user.email,
          email_type: emailType,
          question_ids: matchedQuestions.map(q => q.id),
          status: 'sent',
          tracking_id: trackingId,
          sent_at: new Date().toISOString(),
          subject_variant: 'A'
        });
        
        // Log to EmailLog
        try {
          const emailLogType = emailType === 'day7' ? 'reengagement_7d' : emailType === 'day21' ? 'reengagement_21d' : 'reengagement_45d';
          await base44.asServiceRole.entities.EmailLog.create({
            user_id: user.id,
            user_email: user.email,
            email_type: emailLogType,
            subject,
            status: 'sent',
            sent_at: new Date().toISOString(),
            metadata: { questionCount: matchedQuestions.length, trackingId }
          });
        } catch (logErr) { console.log('EmailLog failed:', logErr.message); }

        console.log(`✅ Sent ${emailType} email to ${user.email}`);
        results.emailsSent++;
        
      } catch (err) {
        console.error(`Error processing user ${user.id}:`, err);
        results.errors.push({ userId: user.id, error: err.message });
      }
    }
    
    console.log(`✅ Re-engagement job complete. Sent ${results.emailsSent} emails.`);
    
    return Response.json({
      success: true,
      dryRun,
      results
    });
    
  } catch (error) {
    console.error('Re-engagement job error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function buildReengagementEmailHtml(emailType, data) {
  const { parentFirstName, questions, count, unsubscribeUrl, dashboardUrl, communityUrl, newMemberCount, memberCount, totalQuestionsAnswered } = data;
  const divider = `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0;"><tr><td style="border-top:1px solid rgba(0,0,0,0.06);font-size:0;">&nbsp;</td></tr></table>`;

  if (emailType === 'day7') {
    const personCards = questions.slice(0, 3).map(q => {
      const ini = (q.studentName||'S').charAt(0).toUpperCase();
      return personCardHtml(ini, q.studentName, q.major, '', `Posted ${q.timeAgo}`, q.url, q.studentName);
    }).join('');

    const body = `
<h1 style="font-family:${PF};font-size:28px;font-weight:700;letter-spacing:-0.02em;line-height:1.2;margin:0 0 8px;"><span style="color:#1a1a1a;">${count} people are ready to</span> <span style="font-style:italic;font-weight:400;color:#E85D20;">help you.</span></h1>
<p style="font-family:${DM};font-size:15px;font-weight:300;color:#555;line-height:1.75;margin:0 0 16px;">You haven&rsquo;t logged in for a few days. Your matches haven&rsquo;t gone anywhere &mdash; and some of them are waiting to hear from you.</p>
${personCards}
<table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;"><tr><td style="background-color:#E85D20;border-radius:100px;padding:14px 32px;"><a href="${communityUrl}" style="font-family:${DM};font-size:15px;font-weight:500;color:#fff;text-decoration:none;">Message a match &rarr;</a></td></tr></table>`;
    return emailWrap(`${count} new matches waiting for you.`, body, unsubscribeUrl);
  }

  if (emailType === 'day21') {
    const personCards = questions.slice(0, 3).map(q => {
      const ini = (q.studentName||'S').charAt(0).toUpperCase();
      return personCardHtml(ini, q.studentName, q.major, '', `&ldquo;${q.preview}&rdquo;`, q.url, q.studentName);
    }).join('');

    const body = `
<h1 style="font-family:${PF};font-size:28px;font-weight:700;letter-spacing:-0.02em;line-height:1.2;margin:0 0 8px;"><span style="color:#1a1a1a;">${count} people in the network can</span> <span style="font-style:italic;font-weight:400;color:#E85D20;">help you right now.</span></h1>
<p style="font-family:${DM};font-size:15px;font-weight:300;color:#555;line-height:1.75;margin:0 0 16px;">The UF network has grown to <strong style="font-weight:500;color:#1a1a1a;">${memberCount}</strong> members. <strong style="font-weight:500;color:#1a1a1a;">${newMemberCount}</strong> joined this month alone. Your matches haven&rsquo;t gone anywhere.</p>
${personCards}
<table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;"><tr><td style="background-color:#E85D20;border-radius:100px;padding:14px 32px;"><a href="${communityUrl}" style="font-family:${DM};font-size:15px;font-weight:500;color:#fff;text-decoration:none;">Message a match &rarr;</a></td></tr></table>`;
    return emailWrap(`${count} people in the network can help you right now.`, body, unsubscribeUrl);
  }

  // 45-day — final
  const body = `
<h1 style="font-family:${PF};font-size:28px;font-weight:700;color:#1a1a1a;letter-spacing:-0.02em;line-height:1.2;margin:0 0 8px;">Your account is still here &mdash; and so are your matches.</h1>
<p style="font-family:${DM};font-size:15px;font-weight:300;color:#555;line-height:1.75;margin:0 0 16px;">Since you joined, the UF network has grown to <strong style="font-weight:500;color:#1a1a1a;">${memberCount}</strong> members. <strong style="font-weight:500;color:#1a1a1a;">${totalQuestionsAnswered}</strong> questions have been answered. Students are landing internships through warm introductions.</p>
<p style="font-family:${DM};font-size:15px;font-weight:300;color:#555;line-height:1.75;margin:0 0 16px;">If you have 5 minutes, even once a month, it makes a difference:</p>
<table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;"><tr><td style="background-color:#E85D20;border-radius:100px;padding:14px 32px;"><a href="${dashboardUrl}" style="font-family:${DM};font-size:15px;font-weight:500;color:#fff;text-decoration:none;">See What&rsquo;s New &rarr;</a></td></tr></table>
${divider}
<p style="font-family:${DM};font-size:15px;font-weight:300;color:#555;line-height:1.75;margin:0 0 16px;">If you&rsquo;d rather not hear from us, no hard feelings:</p>
<table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;"><tr><td style="border:1px solid rgba(232,93,32,0.4);border-radius:100px;padding:13px 32px;"><a href="${unsubscribeUrl}" style="font-family:${DM};font-size:15px;font-weight:400;color:#E85D20;text-decoration:none;">Unsubscribe from nudges &rarr;</a></td></tr></table>`;
  return emailWrap(`This is the last time we'll reach out — your matches are still here.`, body, unsubscribeUrl);
}