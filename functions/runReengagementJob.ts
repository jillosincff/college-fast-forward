import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://getgatorshired.com";

// School branding config
const schoolConfig = {
  schoolName: 'University of Florida',
  schoolShortName: 'UF',
  primaryColor: '#0021A5'
};

// Subject line variants for A/B testing
const subjectLineVariants = {
  day7: [
    (data) => `A ${data.schoolShortName} student needs your ${data.industry} expertise`,
    (data) => `${data.studentName} is looking for someone like you`,
    (data) => `Can you spare 2 minutes for a ${data.schoolShortName} student?`
  ],
  day21: [
    (data) => `${data.count} students are waiting for someone with your background`,
    (data) => `Students keep asking about ${data.industry} — can you help?`,
    (data) => `${data.count} ${data.schoolShortName} students need your advice`
  ],
  day45: [
    (data) => `We miss you — ${data.schoolShortName} students still need help`,
    (data) => `It's been a while — ${data.count} students could use your advice`,
    (data) => `A ${data.schoolShortName} student is hoping you'll come back`
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

function hashUserId(userId) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getSubjectLineVariant(userId, emailType, data) {
  const variants = subjectLineVariants[emailType];
  const variantIndex = hashUserId(userId) % variants.length;
  return {
    variant: ['A', 'B', 'C'][variantIndex],
    subject: variants[variantIndex](data)
  };
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
    
    // Get recent re-engagement emails (last 60 days)
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
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
    
    const results = {
      processed: 0,
      emailsSent: 0,
      skipped: {
        recentlyActive: 0,
        noMatches: 0,
        unsubscribed: 0,
        recentEmail: 0,
        ignoredPrevious: 0,
        maxEmailsReached: 0
      },
      errors: []
    };
    
    for (const user of eligibleUsers.slice(0, limit)) {
      try {
        results.processed++;
        
        // Check if user has unsubscribed
        const prefs = prefsByUser[user.id];
        if (prefs && prefs.reengagement_emails === false) {
          results.skipped.unsubscribed++;
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
        
        // Determine which email type to send
        let emailType = null;
        if (daysSinceActive >= 7 && daysSinceActive < 21 && emailCount === 0) {
          emailType = 'day7';
        } else if (daysSinceActive >= 21 && daysSinceActive < 45 && emailCount === 1) {
          emailType = 'day21';
        } else if (daysSinceActive >= 45 && daysSinceActive < 60 && emailCount === 2) {
          emailType = 'day45';
        } else if (emailCount >= 3) {
          results.skipped.maxEmailsReached++;
          continue;
        } else {
          // Not time for next email yet
          continue;
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
        
        if (matchedQuestions.length < 2) {
          results.skipped.noMatches++;
          continue;
        }
        
        // Prepare email data
        const primaryIndustry = formatIndustry(user.industries?.[0]);
        const studentName = parseFirstName(matchedQuestions[0].poster_name);
        
        const subjectData = {
          schoolShortName: schoolConfig.schoolShortName,
          industry: primaryIndustry,
          studentName,
          count: matchedQuestions.length
        };
        
        const { variant, subject } = getSubjectLineVariant(user.id, emailType, subjectData);
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
          schoolShortName: schoolConfig.schoolShortName,
          primaryColor: schoolConfig.primaryColor,
          primaryIndustry,
          questions: formattedQuestions,
          count: matchedQuestions.length,
          trackingId,
          unsubscribeUrl: `${APP_BASE_URL}/#UnsubscribeReengagement?userId=${user.id}`,
          dashboardUrl: `${APP_BASE_URL}/#ParentDashboard?utm_source=reengagement&utm_campaign=${emailType}`
        });
        
        // Send the email
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          subject,
          body: emailHtml
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
          subject_variant: variant
        });
        
        console.log(`✅ Sent ${emailType} email to ${user.email} (variant ${variant})`);
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
  const { parentFirstName, schoolShortName, primaryColor, primaryIndustry, questions, count, trackingId, unsubscribeUrl, dashboardUrl } = data;
  
  const questionCards = questions.slice(0, emailType === 'day7' ? 1 : 3).map(q => `
    <div style="border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; margin-bottom: 16px; background: #FAFAFA;">
      <div style="margin-bottom: 12px;">
        <strong style="color: #111827;">${q.studentName}</strong>
        <span style="color: #6B7280;"> · ${q.major}${q.gradYear ? ` '${q.gradYear}` : ''}</span>
        <div style="color: #9CA3AF; font-size: 13px; margin-top: 4px;">Posted ${q.timeAgo}</div>
      </div>
      <p style="color: #374151; font-style: italic; margin: 0 0 16px 0;">"${q.preview}"</p>
      ${q.helpTypes ? `<div style="color: #6B7280; font-size: 13px; margin-bottom: 16px;">Looking for: ${q.helpTypes}</div>` : ''}
      <a href="${q.url}" style="display: inline-block; background: ${primaryColor}; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">Help ${q.studentName} →</a>
    </div>
  `).join('');
  
  let intro, outro;
  
  switch (emailType) {
    case 'day7':
      intro = `A student posted a question that matches your background:`;
      outro = `2-3 minutes of your time could change their trajectory.`;
      break;
    case 'day21':
      intro = `${count} students have posted questions that match your background. Here are a few:`;
      outro = `These students don't have the connections you have. One answer could open doors they didn't know existed.`;
      break;
    case 'day45':
      intro = `It's been a while! While you were away, ${count} students posted questions that match your ${primaryIndustry} background.<br><br>Here's one that could really use your perspective:`;
      outro = `Most answers take 2-3 minutes. No pressure — but if you have a few minutes, a student would really appreciate it.`;
      break;
  }
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #111827; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <p style="font-size: 16px;">Hi ${parentFirstName},</p>
  
  <p style="font-size: 16px;">${intro}</p>
  
  <div style="margin: 24px 0;">
    ${questionCards}
  </div>
  
  ${emailType !== 'day7' ? `
  <div style="text-align: center; margin: 24px 0;">
    <a href="${dashboardUrl}" style="display: inline-block; background: ${primaryColor}; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">See All Matching Questions →</a>
  </div>
  ` : ''}
  
  <p style="font-size: 16px; color: #374151;">${outro}</p>
  
  <p style="font-size: 16px; color: #6B7280;">— College Fast Forward</p>
  
  <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0;">
  
  <p style="font-size: 12px; color: #9CA3AF; text-align: center;">
    <a href="${unsubscribeUrl}" style="color: #9CA3AF;">Unsubscribe from these reminders</a>
  </p>
  
</body>
</html>
  `.trim();
}