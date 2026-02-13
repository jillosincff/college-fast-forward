import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg";

// Subject lines per spec
const subjectLineVariants = {
  day7: [
    (data) => `A UF student needs someone in ${data.industry}`,
  ],
  day21: [
    (data) => `${data.count} UF students are looking for someone with your background`,
  ],
  day45: [
    (data) => `We miss you, ${data.firstName} — UF students still need help`,
  ]
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
    
    // Verify admin access
    const currentUser = await base44.auth.me();
    if (currentUser?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }
    
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
    
    for (const user of eligibleUsers.slice(0, limit)) {
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
        
        // 7d needs at least 1 matched question; 21d/45d need at least 2
        const minMatches = emailType === 'day7' ? 1 : 2;
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
  const { parentFirstName, primaryIndustry, questions, count, unsubscribeUrl, dashboardUrl, communityUrl, newMemberCount, memberCount, totalQuestionsAnswered } = data;

  // ── 9A: 7-Day — single matched question, minimal ──
  if (emailType === 'day7') {
    const q = questions[0];
    const preheader = `A student posted a question right in your area — still unanswered.`;

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<span style="display:none;font-size:1px;color:#fff;max-height:0;overflow:hidden;">${preheader}</span>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); padding: 28px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="${LOGO_URL}" alt="College Fast Forward" style="height: 60px; margin-bottom: 8px;" />
    </div>
    <div style="background: #fff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
      <p style="font-size: 18px; color: #111827; margin: 0 0 16px 0;">Hi ${parentFirstName},</p>
      <p style="font-size: 16px;">It's been a few days — meanwhile, a student posted a question right in your area:</p>

      <div style="border-top: 2px solid #e5e7eb; border-bottom: 2px solid #e5e7eb; padding: 20px 0; margin: 20px 0;">
        <div style="margin-bottom: 8px;">
          <strong style="color: #111827; font-size: 15px;">${q.studentName}</strong>
          <span style="color: #6b7280; font-size: 13px;"> · ${q.major}</span>
        </div>
        <p style="color: #374151; font-style: italic; margin: 0 0 12px 0; font-size: 15px;">"${q.preview}"</p>
        <p style="color: #9ca3af; font-size: 13px; margin: 0 0 16px 0;">⏰ Unanswered · Posted ${q.timeAgo}</p>
        <div style="text-align: center;">
          <a href="${q.url}" style="display: inline-block; background: linear-gradient(135deg, #FA4616, #FF6B3D); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">Help ${q.studentName} →</a>
        </div>
      </div>

      <p style="font-size: 14px; color: #6b7280; margin: 16px 0 0 0;">— The CFF Team</p>
    </div>
    <div style="background: #f9fafb; padding: 20px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">College Fast Forward</p>
      <p style="font-size: 11px; color: #9ca3af; margin: 4px 0 0 0;">8731 Lewis River Road, Delray Beach, FL 33446</p>
      <p style="font-size: 11px; color: #9ca3af; margin: 8px 0 0 0;"><a href="${unsubscribeUrl}" style="color: #9ca3af;">Unsubscribe</a> · <a href="${APP_BASE_URL}/#ProfileEdit" style="color: #9ca3af;">Email Preferences</a></p>
    </div>
  </div>
</body></html>`;
  }

  // ── 9B: 21-Day — growth stats + numbered question list ──
  if (emailType === 'day21') {
    const questionList = questions.slice(0, 3).map((q, i) => `
      <tr><td style="padding: 10px 0; ${i < Math.min(questions.length, 3) - 1 ? 'border-bottom: 1px solid #f3f4f6;' : ''}">
        <span style="color: #6b7280; font-size: 14px;">${i + 1}.</span>
        <span style="color: #374151; font-style: italic; font-size: 14px;">"${q.preview}"</span>
      </td></tr>`).join('');

    const preheader = `The UF network has been growing — ${count} students have questions that match your expertise.`;

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<span style="display:none;font-size:1px;color:#fff;max-height:0;overflow:hidden;">${preheader}</span>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); padding: 28px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="${LOGO_URL}" alt="College Fast Forward" style="height: 60px; margin-bottom: 8px;" />
    </div>
    <div style="background: #fff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
      <p style="font-size: 18px; color: #111827; margin: 0 0 16px 0;">Hi ${parentFirstName},</p>
      <p style="font-size: 16px;">The UF network has been growing — <strong>${newMemberCount}</strong> new members joined this month.</p>
      <p style="font-size: 16px;">Right now, <strong>${count}</strong> students have questions that match your expertise:</p>

      <div style="border-top: 2px solid #e5e7eb; border-bottom: 2px solid #e5e7eb; padding: 8px 0; margin: 20px 0;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          ${questionList}
        </table>
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${communityUrl}" style="display: inline-block; background: linear-gradient(135deg, #FA4616, #FF6B3D); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">See All Questions →</a>
      </div>

      <p style="font-size: 16px;">Your experience matters more than you think.</p>
      <p style="font-size: 14px; color: #6b7280; margin: 16px 0 0 0;">— Jill, CFF Founder</p>
    </div>
    <div style="background: #f9fafb; padding: 20px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">College Fast Forward</p>
      <p style="font-size: 11px; color: #9ca3af; margin: 4px 0 0 0;">8731 Lewis River Road, Delray Beach, FL 33446</p>
      <p style="font-size: 11px; color: #9ca3af; margin: 8px 0 0 0;"><a href="${unsubscribeUrl}" style="color: #9ca3af;">Unsubscribe</a> · <a href="${APP_BASE_URL}/#ProfileEdit" style="color: #9ca3af;">Email Preferences</a></p>
    </div>
  </div>
</body></html>`;
  }

  // ── 9C: 45-Day FINAL — personal from Jill, explicit unsubscribe, hard stop ──
  const preheader = `This is the last time I'll nudge you — I promise.`;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<span style="display:none;font-size:1px;color:#fff;max-height:0;overflow:hidden;">${preheader}</span>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); padding: 28px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="${LOGO_URL}" alt="College Fast Forward" style="height: 60px; margin-bottom: 8px;" />
    </div>
    <div style="background: #fff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
      <p style="font-size: 18px; color: #111827; margin: 0 0 16px 0;">Hi ${parentFirstName},</p>
      <p style="font-size: 16px;">This is the last time I'll nudge you — I promise.</p>
      <p style="font-size: 16px;">Since you joined, the UF network has grown to <strong>${memberCount}</strong> members. <strong>${totalQuestionsAnswered}</strong> questions have been answered and students are landing internships through warm introductions.</p>
      <p style="font-size: 16px;">If you have 5 minutes, even once a month, it makes a difference:</p>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #FA4616, #FF6B3D); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">See What's New →</a>
      </div>

      <p style="font-size: 16px;">If you'd rather not hear from us, no hard feelings:</p>

      <div style="text-align: center; margin: 16px 0 24px 0;">
        <a href="${unsubscribeUrl}" style="display: inline-block; background: #f3f4f6; color: #6b7280; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; border: 1px solid #d1d5db;">Unsubscribe from nudges →</a>
      </div>

      <p style="font-size: 14px; color: #6b7280; margin: 16px 0 0 0;">— Jill</p>
    </div>
    <div style="background: #f9fafb; padding: 20px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">College Fast Forward</p>
      <p style="font-size: 11px; color: #9ca3af; margin: 4px 0 0 0;">8731 Lewis River Road, Delray Beach, FL 33446</p>
      <p style="font-size: 11px; color: #9ca3af; margin: 8px 0 0 0;"><a href="${unsubscribeUrl}" style="color: #9ca3af;">Unsubscribe</a> · <a href="${APP_BASE_URL}/#ProfileEdit" style="color: #9ca3af;">Email Preferences</a></p>
    </div>
  </div>
</body></html>`;
}