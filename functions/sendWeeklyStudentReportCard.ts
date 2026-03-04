import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  console.log('[sendWeeklyStudentReportCard] Starting...');
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.roles?.includes('admin') && user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const profiles = await base44.asServiceRole.entities.FastTrackProfile.list();
    if (!profiles || profiles.length === 0) {
      return Response.json({ message: 'No FastTrackProfiles found', sent: 0 });
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneWeekAgoISO = oneWeekAgo.toISOString();
    const weekOfDate = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    let sentCount = 0;
    const errors = [];

    for (const profile of profiles) {
      try {
        if (!profile.user_email) continue;

        const [interactions, feedback, messages] = await Promise.all([
          base44.asServiceRole.entities.InteractionLog.filter({
            student_email: profile.user_email,
            status: 'completed'
          }).catch(() => []),
          base44.asServiceRole.entities.InteractionFeedback.filter({
            student_email: profile.user_email
          }).catch(() => []),
          base44.asServiceRole.entities.Message.filter({
            sender_email: profile.user_email
          }).catch(() => [])
        ]);

        const weekInteractions = (interactions || []).filter(i => i.completed_at && i.completed_at >= oneWeekAgoISO);
        const weekFeedback = (feedback || []).filter(r => r.created_date && r.created_date >= oneWeekAgoISO);
        const weekMessages = (messages || []).filter(m => m.created_date && m.created_date >= oneWeekAgoISO);

        const newInteractions = weekInteractions.length;
        const newFeedbackCount = weekFeedback.length;
        const messagesSent = weekMessages.length;
        const positiveWeekFeedback = weekFeedback.filter(r => r.overall_impression === 'excellent' || r.overall_impression === 'great');

        const urgencyTier = calculateUrgencyTier(profile, now);
        if (urgencyTier !== profile.urgency_tier) {
          await base44.asServiceRole.entities.FastTrackProfile.update(profile.id, { urgency_tier: urgencyTier }).catch(() => {});
        }

        const allInteractions = (interactions || []).filter(i => i.status === 'completed');
        const allPositiveFeedback = (feedback || []).filter(r => r.overall_impression === 'excellent' || r.overall_impression === 'great');
        const intros = await base44.asServiceRole.entities.Intro.filter({ student_email: profile.user_email }).catch(() => []);
        const connections = await base44.asServiceRole.entities.Connection.filter({ student_email: profile.user_email }).catch(() => []);

        const coldAppEquivalent =
          allInteractions.length * 15 +
          allPositiveFeedback.length * 10 +
          ((intros || []).length + (connections || []).length) * 20;

        const activityGrade = newInteractions >= 3 ? 'A' : newInteractions === 2 ? 'B' : newInteractions === 1 ? 'C' : 'D';
        const feedbackGrade = positiveWeekFeedback.length >= 2 ? 'A' : positiveWeekFeedback.length === 1 ? 'B' : newFeedbackCount >= 1 ? 'C' : 'D';

        const studentName = profile.user_name || profile.user_email.split('@')[0];
        const tierDisplayNames = {
          just_getting_started: 'Just Getting Started',
          building_momentum: 'Building Momentum',
          rising: 'Rising',
          fast_tracked: 'Fast Tracked'
        };

        const urgencyHeadline = getUrgencyHeadline(urgencyTier, profile, now);
        const tierGap = getTierGap(profile);
        const thisWeeksMove = getThisWeeksMove(profile);

        let feedbackQuote = '';
        if (positiveWeekFeedback.length > 0) {
          const topFeedback = positiveWeekFeedback[0];
          const attrMap = {
            came_prepared: 'Came prepared',
            asked_great_questions: 'Asked great questions',
            strong_communicator: 'Strong communicator',
            professional_demeanor: 'Professional demeanor',
            followed_up: 'Great follow-up',
            would_refer: 'Would refer you',
            would_hire: 'Would hire you'
          };
          const attr = (topFeedback.positive_attributes || [])[0];
          const attrPhrase = attr ? attrMap[attr] || attr : 'Great interaction';
          const mentorName = topFeedback.reviewer_name ? topFeedback.reviewer_name.split(' ')[0] : 'A mentor';
          feedbackQuote = `\n"${attrPhrase}" — ${mentorName}`;
        }

        const emailBody = `${urgencyHeadline}

Hey ${studentName},

Here's your weekly CFF Report Card:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NETWORK ACTIVITY: ${activityGrade}
${newInteractions} conversation${newInteractions !== 1 ? 's' : ''} this week. ${messagesSent} message${messagesSent !== 1 ? 's' : ''} sent.

YOUR FEEDBACK: ${feedbackGrade}
${newFeedbackCount} new feedback received.${feedbackQuote}

YOUR TIER: ${tierDisplayNames[profile.current_tier] || 'Just Getting Started'}
${tierGap}

COLD APPLICATION EQUIVALENT: ${coldAppEquivalent}
CFF has saved you the equivalent of ${coldAppEquivalent} cold applications so far.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THIS WEEK'S MOVE:
${thisWeeksMove}

How you network matters. Show up, and we'll bend over backwards for you.

— College Fast Forward at UF`;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: profile.user_email,
          subject: `Your CFF Report Card — Week of ${weekOfDate}`,
          body: emailBody,
          from_name: 'College Fast Forward'
        });

        sentCount++;
      } catch (studentError) {
        console.error(`Error processing student ${profile.user_email}:`, studentError.message);
        errors.push({ email: profile.user_email, error: studentError.message });
      }
    }

    return Response.json({
      message: `Weekly report cards sent`,
      sent: sentCount,
      total: profiles.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Weekly report card error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function calculateUrgencyTier(profile, now) {
  if (!profile.graduation_year) return 'cruising';
  const semesterMonthMap = { Spring: 5, Summer: 8, Fall: 12 };
  const gradMonth = semesterMonthMap[profile.graduation_semester] || 5;
  const gradDate = new Date(profile.graduation_year, gradMonth - 1, 15);
  const monthsUntil = (gradDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
  if (monthsUntil > 18) return 'cruising';
  if (monthsUntil > 12) return 'time_to_move';
  if (monthsUntil > 6) return 'dont_miss_this';
  return 'all_hands_on_deck';
}

function getUrgencyHeadline(urgencyTier, profile, now) {
  if (urgencyTier === 'cruising') {
    return "You've got time — and that's your superpower. Use it to build relationships now.";
  }
  if (urgencyTier === 'time_to_move') {
    const season = now.getMonth() >= 8 ? 'Spring' : 'Fall';
    return `${season} recruiting is approaching. The students who start networking now get the best opportunities.`;
  }
  if (urgencyTier === 'dont_miss_this') {
    const semesterMonthMap = { Spring: 5, Summer: 8, Fall: 12 };
    const gradMonth = semesterMonthMap[profile.graduation_semester] || 5;
    const gradDate = new Date(profile.graduation_year, gradMonth - 1, 15);
    const monthsLeft = Math.max(1, Math.round((gradDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.44)));
    return `You're ${monthsLeft} months from graduation. This is the semester that matters most.`;
  }
  const semesterMonthMap = { Spring: 5, Summer: 8, Fall: 12 };
  const gradMonth = semesterMonthMap[profile.graduation_semester] || 5;
  const gradDate = new Date(profile.graduation_year, gradMonth - 1, 15);
  const daysLeft = Math.max(1, Math.round((gradDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  return `${daysLeft} days until you walk across that stage. The CFF community has your back. Let's go.`;
}

function getTierGap(profile) {
  const tier = profile.current_tier || 'just_getting_started';
  const completed = profile.completed_interactions || 0;
  const positiveFeedback = profile.positive_feedback || 0;
  const reliability = profile.reliability_score || 100;
  const followUp = profile.follow_up_rate || 0;
  const wouldRefer = profile.would_refer_count || 0;
  const streak = profile.weekly_activity_streak || 0;

  if (tier === 'just_getting_started') {
    return 'Complete your first conversation to reach Building Momentum.';
  }
  if (tier === 'building_momentum') {
    const gaps = [];
    if (completed < 3) gaps.push(`${3 - completed} more conversation${3 - completed !== 1 ? 's' : ''}`);
    if (positiveFeedback < 2) gaps.push(`${2 - positiveFeedback} more positive feedback`);
    if (reliability < 80) gaps.push('improve your reliability score to 80%');
    if (followUp < 60) gaps.push('improve your follow-up rate to 60%');
    return gaps.length > 0 ? `You're ${gaps.join(' and ')} away from Rising.` : 'You're close to Rising! Keep it up.';
  }
  if (tier === 'rising') {
    const gaps = [];
    if (completed < 6) gaps.push(`${6 - completed} more conversation${6 - completed !== 1 ? 's' : ''}`);
    if (positiveFeedback < 5) gaps.push(`${5 - positiveFeedback} more positive feedback`);
    if (reliability < 90) gaps.push('a 90%+ reliability score');
    if (followUp < 80) gaps.push('an 80%+ follow-up rate');
    if (wouldRefer < 2) gaps.push(`${2 - wouldRefer} more "would refer" endorsement${2 - wouldRefer !== 1 ? 's' : ''}`);
    if (streak < 4) gaps.push(`a ${4 - streak} week longer activity streak`);
    return gaps.length > 0 ? `You need ${gaps.join(', ')} to reach Fast Tracked.` : "You're on the doorstep of Fast Tracked! Keep going.";
  }
  return "You're Fast Tracked! Stay active to maintain your visibility to hiring companies.";
}

function getThisWeeksMove(profile) {
  const tier = profile.current_tier || 'just_getting_started';
  const completed = profile.completed_interactions || 0;
  const positiveFeedback = profile.positive_feedback || 0;
  const followUp = profile.follow_up_rate || 0;
  const streak = profile.weekly_activity_streak || 0;
  const industries = (profile.target_industries || []).join(', ') || 'your target industry';

  if (tier === 'just_getting_started' || completed < 1) {
    return `Parents in ${industries} are active this week. Claim your first conversation — it only takes one to start building momentum.`;
  }
  if (tier === 'building_momentum') {
    if (completed < 3) return `${3 - completed} parents in ${industries} are active this week. Claim a conversation.`;
    if (positiveFeedback < 2) return 'Focus on preparation before your next call. Check the parent\'s background and come with 3 questions.';
    if (followUp < 60) return 'After your next conversation, send a thank-you within 24 hours. It makes a huge difference.';
    return 'Keep connecting — you\'re close to Rising!';
  }
  if (tier === 'rising') {
    if (completed < 6) return `Schedule your next conversation this week. ${6 - completed} more to reach Fast Tracked.`;
    if (positiveFeedback < 5) return 'Focus on preparation before your next call. Check the parent\'s background and come with 3 questions.';
    if (followUp < 80) return 'After your next conversation, send a thank-you within 24 hours. It makes a huge difference.';
    if (streak < 4) return `Log in and connect this week to keep your streak alive. You're at ${streak} week${streak !== 1 ? 's' : ''}.`;
    return 'You\'re almost Fast Tracked. One more strong week could do it.';
  }
  return 'Stay visible. Companies are watching. Schedule a conversation this week to maintain your streak.';
}