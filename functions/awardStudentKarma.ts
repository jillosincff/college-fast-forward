import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const STUDENT_KARMA_VALUES = {
  answer_question: 5,
  share_story: 10,
  post_job_gig: 10,
  share_salary: 25,
  invite_parent_joined: 50,
  upvote_answer: 2,
  complete_profile: 15,
  post_question: 5,
  interview_question_submitted: 10,
  interview_question_confirmed: 3,
};

const STUDENT_KARMA_TIERS = [
  { name: 'newcomer', threshold: 0 },
  { name: 'contributor', threshold: 15 },
  { name: 'connector', threshold: 50 },
  { name: 'leader', threshold: 150 },
  { name: 'legend', threshold: 500 },
];

function getStudentKarmaLevel(totalKarma) {
  let current = STUDENT_KARMA_TIERS[0];
  for (const tier of STUDENT_KARMA_TIERS) {
    if (totalKarma >= tier.threshold) {
      current = tier;
    } else {
      break;
    }
  }
  return current.name;
}

function getNextTier(totalKarma) {
  for (const tier of STUDENT_KARMA_TIERS) {
    if (totalKarma < tier.threshold) {
      return {
        name: tier.name,
        threshold: tier.threshold,
        points_remaining: tier.threshold - totalKarma,
      };
    }
  }
  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);

    const body = await req.json();
    const { userId, userEmail, actionType, referenceId, description } = body;

    const effectiveUserId = userId || user?.id;
    const effectiveEmail = userEmail || user?.email;

    if (!effectiveUserId || !actionType) {
      return Response.json({ error: 'Missing userId or actionType' }, { status: 400 });
    }

    const points = STUDENT_KARMA_VALUES[actionType];
    if (!points) {
      return Response.json({ error: `Invalid action type: ${actionType}` }, { status: 400 });
    }

    const now = new Date();

    // Get or create StudentKarma record
    let karmaRecord = null;
    const existing = await base44.asServiceRole.entities.StudentKarma.filter({
      user_id: effectiveUserId,
    });

    if (existing.length > 0) {
      karmaRecord = existing[0];
    } else {
      karmaRecord = await base44.asServiceRole.entities.StudentKarma.create({
        user_id: effectiveUserId,
        user_email: effectiveEmail,
        total_karma: 0,
        karma_level: 'newcomer',
        this_month_karma: 0,
        actions_count: {},
      });
    }

    // Calculate new totals
    const newTotal = (karmaRecord.total_karma || 0) + points;
    const newLevel = getStudentKarmaLevel(newTotal);

    // Monthly karma with reset logic
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    let thisMonthKarma = (karmaRecord.this_month_karma || 0) + points;
    if (karmaRecord.month_reset_date && new Date(karmaRecord.month_reset_date) < monthStart) {
      thisMonthKarma = points;
    }
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Update actions count
    const actionsCount = karmaRecord.actions_count || {};
    actionsCount[actionType] = (actionsCount[actionType] || 0) + 1;

    // Update StudentKarma record
    await base44.asServiceRole.entities.StudentKarma.update(karmaRecord.id, {
      total_karma: newTotal,
      karma_level: newLevel,
      this_month_karma: thisMonthKarma,
      month_reset_date: nextMonthStart.toISOString(),
      last_karma_earned_at: now.toISOString(),
      actions_count: actionsCount,
    });

    // Also update user record for quick access
    try {
      await base44.asServiceRole.entities.User.update(effectiveUserId, {
        student_karma: newTotal,
        student_karma_level: newLevel,
      });
    } catch (e) {
      console.log('Could not update user student_karma:', e.message);
    }

    // Log transaction to KarmaTransaction for unified history
    try {
      await base44.asServiceRole.entities.KarmaTransaction.create({
        family_group_id: `student_${effectiveUserId}`,
        parent_user_id: effectiveUserId,
        parent_email: effectiveEmail,
        parent_name: user?.full_name || '',
        points,
        action_type: actionType,
        reference_type: 'student_karma',
        reference_id: referenceId || '',
        description: description || `Student earned ${points} karma for ${actionType}`,
      });
    } catch (e) {
      console.log('Could not create karma transaction:', e.message);
    }

    const nextTier = getNextTier(newTotal);

    return Response.json({
      success: true,
      points_awarded: points,
      new_total: newTotal,
      karma_level: newLevel,
      this_month_karma: thisMonthKarma,
      next_tier: nextTier,
      tier_unlocked: karmaRecord.karma_level !== newLevel ? newLevel : null,
    });
  } catch (error) {
    console.error('awardStudentKarma error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});