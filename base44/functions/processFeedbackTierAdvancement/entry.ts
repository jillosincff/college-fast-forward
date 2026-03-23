import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const TIER_ORDER = ['just_getting_started', 'building_momentum', 'rising', 'fast_tracked'];
const TIER_DISPLAY = {
  just_getting_started: 'Just Getting Started',
  building_momentum: 'Building Momentum',
  rising: 'Rising',
  fast_tracked: 'Fast Tracked',
};

const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    // Only process creates
    if (event?.type !== 'create') {
      console.log('Skipping — not a create event:', event?.type);
      return Response.json({ success: true, skipped: true, reason: 'Not a create event' });
    }

    const feedback = data || {};
    const studentId = feedback.student_id;
    const studentEmail = feedback.student_email;
    const studentName = feedback.student_name || '';

    if (!studentEmail) {
      console.log('Skipping — no student_email on feedback');
      return Response.json({ success: true, skipped: true, reason: 'No student_email' });
    }

    console.log('Processing feedback for student:', studentEmail, '| impression:', feedback.overall_impression);

    // ═══════════════════════════════════════════════════════════════
    // STEP 1: Find or create FastTrackProfile
    // ═══════════════════════════════════════════════════════════════
    let profiles = await base44.asServiceRole.entities.FastTrackProfile.filter({ user_email: studentEmail });
    let profile = profiles[0];

    if (!profile && studentId) {
      profiles = await base44.asServiceRole.entities.FastTrackProfile.filter({ user_id: studentId });
      profile = profiles[0];
    }

    if (!profile) {
      console.log('No FastTrackProfile found — creating one for', studentEmail);
      profile = await base44.asServiceRole.entities.FastTrackProfile.create({
        user_id: studentId || '',
        user_email: studentEmail,
        user_name: studentName,
        current_tier: 'just_getting_started',
        completed_interactions: 0,
        total_interactions: 0,
        total_feedback: 0,
        positive_feedback: 0,
        would_refer_count: 0,
        would_hire_count: 0,
        follow_up_rate: 0,
        reliability_score: 100,
        weekly_activity_streak: 0,
        no_show_count: 0,
        avg_impression_score: 0,
        tier_updated_at: new Date().toISOString(),
      });
    }

    const oldTier = profile.current_tier || 'just_getting_started';

    // ═══════════════════════════════════════════════════════════════
    // STEP 2: Fetch all feedback + interactions for this student
    // ═══════════════════════════════════════════════════════════════
    const allFeedback = await base44.asServiceRole.entities.InteractionFeedback.filter({ student_email: studentEmail });
    const allInteractions = await base44.asServiceRole.entities.InteractionLog.filter({ student_email: studentEmail });

    // ═══════════════════════════════════════════════════════════════
    // STEP 3: Calculate counters
    // ═══════════════════════════════════════════════════════════════
    const totalFeedback = allFeedback.length;

    // Positive = excellent or great
    const positiveFeedback = allFeedback.filter(f =>
      f.overall_impression === 'excellent' || f.overall_impression === 'great'
    ).length;

    // would_refer
    const wouldReferCount = allFeedback.filter(f =>
      (f.positive_attributes || []).some(a =>
        a === 'would_refer' || a.toLowerCase().includes("i'd refer")
      )
    ).length;

    // would_hire
    const wouldHireCount = allFeedback.filter(f =>
      (f.positive_attributes || []).some(a =>
        a === 'would_hire' || a.toLowerCase().includes("i'd hire")
      )
    ).length;

    // follow_up_rate: % of feedback where followed_up is in positive_attributes
    const followedUpCount = allFeedback.filter(f =>
      (f.positive_attributes || []).some(a =>
        a === 'followed_up' || a.toLowerCase().includes('followed up afterward')
      )
    ).length;
    const followUpRate = totalFeedback > 0 ? Math.round((followedUpCount / totalFeedback) * 100) : 0;

    // avg_impression_score
    const impressionMap = { excellent: 4, great: 3, good: 2, still_warming_up: 1 };
    const totalScore = allFeedback.reduce((sum, f) => sum + (impressionMap[f.overall_impression] || 0), 0);
    const avgImpressionScore = totalFeedback > 0 ? Math.round((totalScore / totalFeedback) * 100) / 100 : 0;

    // completed_interactions (from InteractionLog)
    const completedInteractions = allInteractions.filter(i => i.status === 'completed').length;
    const totalInteractions = allInteractions.length;
    const noShowCount = allInteractions.filter(i => i.status === 'no_show_student').length;

    // reliability_rate: completed / (completed + no_show)
    const reliabilityDenom = completedInteractions + noShowCount;
    const reliabilityScore = reliabilityDenom > 0 ? Math.round((completedInteractions / reliabilityDenom) * 100) : 100;

    // current_streak: consecutive completed interactions with no gaps > 14 days
    const completedLogs = allInteractions
      .filter(i => i.status === 'completed' && i.completed_at)
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());

    let currentStreak = 0;
    const now = new Date();
    if (completedLogs.length > 0) {
      const lastCompleted = new Date(completedLogs[0].completed_at);
      const daysSinceLast = (now.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceLast <= 14) {
        currentStreak = 1;
        for (let i = 1; i < completedLogs.length; i++) {
          const prev = new Date(completedLogs[i - 1].completed_at);
          const curr = new Date(completedLogs[i].completed_at);
          const gap = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
          if (gap <= 14) {
            currentStreak++;
          } else {
            break;
          }
        }
      } else {
        currentStreak = 1; // just completed this one
      }
    }

    // coaching_recommended: true if any feedback has recommend_coaching
    const coachingRecommended = profile.coaching_recommended ||
      allFeedback.some(f => f.recommend_coaching === true);

    // ═══════════════════════════════════════════════════════════════
    // STEP 4: Evaluate tier advancement
    // ═══════════════════════════════════════════════════════════════
    const oldTierIndex = TIER_ORDER.indexOf(oldTier);
    let newTier = oldTier;

    // JUST_GETTING_STARTED → BUILDING_MOMENTUM: completed_interactions >= 1
    if (oldTierIndex < 1 && completedInteractions >= 1) {
      newTier = 'building_momentum';
    }

    // BUILDING_MOMENTUM → RISING
    if (TIER_ORDER.indexOf(newTier) < 2 &&
      completedInteractions >= 3 &&
      positiveFeedback >= 2 &&
      reliabilityScore >= 80 &&
      followUpRate >= 60) {
      newTier = 'rising';
    }

    // RISING → FAST_TRACKED
    if (TIER_ORDER.indexOf(newTier) < 3 &&
      completedInteractions >= 6 &&
      positiveFeedback >= 5 &&
      reliabilityScore >= 90 &&
      followUpRate >= 80 &&
      wouldReferCount >= 2 &&
      currentStreak >= 4) {

      // COACHING GATE: If coaching recommended but not completed, block
      const coachingCompleted = profile.coaching_completed || false;
      if (coachingRecommended && !coachingCompleted) {
        console.log('Coaching gate BLOCKS advancement to fast_tracked');
        // Stay at rising, send coaching nudge
        newTier = 'rising';
      } else {
        newTier = 'fast_tracked';
      }
    }

    // CRITICAL: Tiers only go UP, never down
    const newTierIndex = TIER_ORDER.indexOf(newTier);
    if (newTierIndex < oldTierIndex) {
      newTier = oldTier;
    }

    const tierChanged = newTier !== oldTier;

    // ═══════════════════════════════════════════════════════════════
    // STEP 5: Update FastTrackProfile
    // ═══════════════════════════════════════════════════════════════
    const updateData = {
      total_feedback: totalFeedback,
      positive_feedback: positiveFeedback,
      would_refer_count: wouldReferCount,
      would_hire_count: wouldHireCount,
      follow_up_rate: followUpRate,
      avg_impression_score: avgImpressionScore,
      completed_interactions: completedInteractions,
      total_interactions: totalInteractions,
      no_show_count: noShowCount,
      reliability_score: reliabilityScore,
      weekly_activity_streak: currentStreak,
      coaching_recommended: coachingRecommended,
      last_activity_date: now.toISOString(),
    };

    if (tierChanged) {
      updateData.current_tier = newTier;
      updateData.tier_updated_at = now.toISOString();
      if (newTier === 'fast_tracked') {
        updateData.fast_tracked_date = now.toISOString();
      }
    }

    await base44.asServiceRole.entities.FastTrackProfile.update(profile.id, updateData);
    console.log('FastTrackProfile updated:', { oldTier, newTier, tierChanged, completedInteractions, positiveFeedback, reliabilityScore, followUpRate, wouldReferCount, currentStreak });

    // ═══════════════════════════════════════════════════════════════
    // STEP 6: If tier changed, take action
    // ═══════════════════════════════════════════════════════════════
    if (tierChanged) {
      // a. Create UserBadge
      if (newTier === 'rising') {
        const existingBadges = await base44.asServiceRole.entities.UserBadge.filter({ user_id: studentId });
        const hasRisingStar = existingBadges.some(b => b.badge_type === 'rising_star');
        if (!hasRisingStar) {
          await base44.asServiceRole.entities.UserBadge.create({
            user_id: studentId,
            badge_type: 'rising_star',
            badge_name: 'Rising Star',
            badge_description: 'Reached Rising tier on Fast Track',
            badge_icon: '⭐',
            earned_at: now.toISOString(),
          });
          console.log('Awarded rising_star badge to', studentId);
        }
      }

      if (newTier === 'fast_tracked') {
        const existingBadges = await base44.asServiceRole.entities.UserBadge.filter({ user_id: studentId });
        const hasFastTracked = existingBadges.some(b => b.badge_type === 'fast_tracked');
        if (!hasFastTracked) {
          await base44.asServiceRole.entities.UserBadge.create({
            user_id: studentId,
            badge_type: 'fast_tracked',
            badge_name: 'Fast Tracked',
            badge_description: 'Reached Fast Tracked tier — the highest level on CFF',
            badge_icon: '🚀',
            earned_at: now.toISOString(),
          });
          console.log('Awarded fast_tracked badge to', studentId);
        }
      }

      // b. Send student notification
      const tierMessages = {
        building_momentum: {
          title: "You're building momentum!",
          message: `You completed your first CFF conversation! You've moved up to Building Momentum tier. Keep connecting to unlock more opportunities.`,
        },
        rising: {
          title: "You're now Rising!",
          message: `You're building a real reputation on CFF. Professionals are noticing. Keep going — Fast Tracked status unlocks company access.`,
        },
        fast_tracked: {
          title: "🎉 You've been FAST TRACKED!",
          message: `Congratulations! You've earned Fast Tracked status on College Fast Forward. This is a huge achievement — you now have priority access to company connections and opportunities.`,
        },
      };

      const tierMsg = tierMessages[newTier];
      if (tierMsg) {
        await base44.asServiceRole.entities.Notification.create({
          user_email: studentEmail,
          type: 'system',
          title: tierMsg.title,
          message: tierMsg.message,
          priority: newTier === 'fast_tracked' || newTier === 'rising' ? 'high' : 'normal',
          metadata: { trigger: `tier_advance_${newTier}` },
        });
        console.log('Tier advancement notification sent:', newTier);
      }

      // c. If fast_tracked, send celebration email + admin notification
      if (newTier === 'fast_tracked') {
        const studentFirst = (studentName || 'Student').split(/[\s,]/)[0];

        // Celebration email to student
        const emailHtml = buildCelebrationEmail(studentName, completedInteractions, positiveFeedback, reliabilityScore, wouldReferCount);
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: studentEmail,
          subject: "🎉 You've been FAST TRACKED!",
          body: emailHtml,
          from_name: 'College Fast Forward',
        });

        await base44.asServiceRole.entities.EmailLog.create({
          user_email: studentEmail,
          email_type: 'feedback_request',
          subject: "🎉 You've been FAST TRACKED!",
          status: 'sent',
          sent_at: now.toISOString(),
          metadata: {
            trigger: 'fast_tracked_celebration',
            completed_interactions: completedInteractions,
            positive_feedback: positiveFeedback,
            reliability_score: reliabilityScore,
            would_refer_count: wouldReferCount,
          },
        });

        // Admin notification
        await base44.asServiceRole.entities.Notification.create({
          user_email: 'admin@collegefastforward.com',
          type: 'system',
          title: `🚀 ${studentName || studentEmail} just reached Fast Tracked!`,
          message: `${studentName || studentEmail} has earned Fast Tracked status. ${completedInteractions} interactions, ${positiveFeedback} positive feedback, ${reliabilityScore}% reliability. Consider them for company outreach.`,
          priority: 'high',
          metadata: {
            trigger: 'admin_fast_tracked_alert',
            student_id: studentId,
            student_email: studentEmail,
          },
        });
        console.log('Fast Tracked celebration email + admin notification sent');
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 7: If coaching gate blocked advancement, send nudge
    // ═══════════════════════════════════════════════════════════════
    if (!tierChanged && coachingRecommended && !(profile.coaching_completed) &&
        completedInteractions >= 6 && positiveFeedback >= 5 &&
        reliabilityScore >= 90 && followUpRate >= 80 &&
        wouldReferCount >= 2 && currentStreak >= 4) {
      await base44.asServiceRole.entities.Notification.create({
        user_email: studentEmail,
        type: 'system',
        title: 'One step away from Fast Tracked!',
        message: "You've hit every milestone — but there's one thing left. Complete your free complimentary 30-minute coaching session to unlock Fast Tracked status.",
        priority: 'high',
        metadata: { trigger: 'coaching_gate_block' },
      });
      console.log('Coaching gate nudge notification sent');
    }

    return Response.json({
      success: true,
      studentEmail,
      oldTier,
      newTier,
      tierChanged,
      counters: {
        completedInteractions,
        positiveFeedback,
        reliabilityScore,
        followUpRate,
        wouldReferCount,
        wouldHireCount,
        currentStreak,
        totalFeedback,
      },
    });

  } catch (error) {
    console.error('processFeedbackTierAdvancement error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function buildCelebrationEmail(studentName, interactions, feedback, reliability, refers) {
  const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg";
  const firstName = (studentName || 'Gator').split(/[\s,]/)[0];

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="${LOGO_URL}" alt="College Fast Forward" style="height: 60px; margin-bottom: 8px;" />
      <h1 style="color: white; font-size: 28px; margin: 8px 0 0 0;">🎉 You've Been FAST TRACKED!</h1>
    </div>
    <div style="background: #fff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
      <p style="font-size: 18px; color: #111827; margin: 0 0 16px 0;">Congratulations ${firstName}!</p>
      <p style="font-size: 16px; margin: 0 0 24px 0;">You've officially earned <strong>Fast Tracked</strong> status on College Fast Forward. Here's how you got here:</p>
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 0 0 24px 0;">
        <p style="margin: 4px 0; font-size: 15px;">✅ <strong>${interactions}</strong> professional conversations</p>
        <p style="margin: 4px 0; font-size: 15px;">✅ <strong>${feedback}</strong> positive feedback from mentors</p>
        <p style="margin: 4px 0; font-size: 15px;">✅ <strong>${reliability}%</strong> reliability score</p>
        <p style="margin: 4px 0; font-size: 15px;">✅ <strong>${refers}</strong> mentor${refers !== 1 ? 's' : ''} said they'd refer you</p>
      </div>
      <p style="font-size: 16px; margin: 0 0 24px 0;">You now have <strong>priority access</strong> to company connections, exclusive opportunities, and more. Keep building your network!</p>
      <div style="text-align: center; margin: 0 0 28px 0;">
        <a href="${APP_BASE_URL}/#Dashboard" style="display: inline-block; background: linear-gradient(135deg, #FA4616, #FF6B3D); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">View Your Dashboard →</a>
      </div>
      <p style="font-size: 14px; color: #6b7280; margin: 0;">— The CFF Team</p>
    </div>
    <div style="background: #f9fafb; padding: 16px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">College Fast Forward</p>
    </div>
  </div>
</body>
</html>`;
}