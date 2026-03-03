import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const STUDENT_KARMA_VALUES = {
  answer_question: 10,
  share_story: 15,
  post_job_gig: 10,
  share_salary: 20,
  invite_parent_joined: 25,
  upvote_answer: 2,
  complete_profile: 15,
  post_question: 5,
  thanked_answer: 5,
  interview_question_submitted: 15,
  interview_question_confirmed: 3,
};

const STUDENT_KARMA_TIERS = [
  { name: 'newcomer', threshold: 0 },
  { name: 'contributor', threshold: 15 },
  { name: 'connector', threshold: 50 },
  { name: 'leader', threshold: 150 },
  { name: 'legend', threshold: 500 },
];

// Family karma tiers — STANDARD across all files
const FAMILY_KARMA_TIERS = [
  { name: 'none', threshold: 0, boost: 0 },
  { name: 'active', threshold: 100, boost: 1 },
  { name: 'engaged', threshold: 300, boost: 2 },
  { name: 'priority', threshold: 500, boost: 3 },
  { name: 'champion', threshold: 1000, boost: 5 },
];

function getFamilyKarmaLevel(totalKarma) {
  let current = FAMILY_KARMA_TIERS[0];
  for (const tier of FAMILY_KARMA_TIERS) {
    if (totalKarma >= tier.threshold) current = tier;
    else break;
  }
  return current;
}

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

    // === DEDUPLICATION GUARD ===
    try {
      const recentTx = await base44.asServiceRole.entities.KarmaTransaction.filter(
        { parent_user_id: effectiveUserId, action_type: actionType },
        '-created_date', 3
      );
      if (recentTx.length > 0) {
        const txAge = now.getTime() - new Date(recentTx[0].created_date).getTime();
        const sameRef = referenceId && recentTx[0].reference_id === referenceId;
        if (sameRef || txAge < 60000) {
          console.log(`Dedup: skipping duplicate ${actionType} for ${effectiveUserId}`);
          return Response.json({ success: true, points_awarded: 0, deduplicated: true });
        }
      }
    } catch (e) {
      console.log('Dedup check failed (proceeding):', e.message);
    }

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

    // ========== ROLL UP TO FAMILY KARMA ==========
    let familyRollUp = null;
    try {
      // Look up student's user record for family_group_id
      let studentUser = null;
      try {
        const users = await base44.asServiceRole.entities.User.filter({ id: effectiveUserId });
        if (users.length > 0) studentUser = users[0];
      } catch (e) {
        console.log('Could not look up student user:', e.message);
      }

      const familyGroupId = studentUser?.family_group_id;
      if (familyGroupId) {
        // Find or create FamilyKarma
        const existingFK = await base44.asServiceRole.entities.FamilyKarma.filter({ family_group_id: familyGroupId });
        let fk = existingFK.length > 0 ? existingFK[0] : null;
        if (!fk) {
          fk = await base44.asServiceRole.entities.FamilyKarma.create({
            family_group_id: familyGroupId,
            total_karma: 0,
            karma_level: 'none',
            boost_multiplier: 0,
            school_id: 'uf',
          });
        }

        const newFamilyTotal = (fk.total_karma || 0) + points;
        const familyTier = getFamilyKarmaLevel(newFamilyTotal);

        // Monthly karma handling
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        let fkMonthKarma = (fk.this_month_karma || 0) + points;
        if (fk.month_reset_date && new Date(fk.month_reset_date) < monthStart) {
          fkMonthKarma = points;
        }
        const nextMonthStartFK = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        const boostExpiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000);

        await base44.asServiceRole.entities.FamilyKarma.update(fk.id, {
          total_karma: newFamilyTotal,
          karma_level: familyTier.name,
          boost_multiplier: familyTier.boost,
          last_karma_earned_at: now.toISOString(),
          boost_expires_at: boostExpiresAt.toISOString(),
          this_month_karma: fkMonthKarma,
          month_reset_date: nextMonthStartFK.toISOString(),
        });

        // Propagate boost to linked students' questions (same as awardKarma)
        if (familyTier.boost > 0) {
          try {
            const familyMembers = await base44.asServiceRole.entities.User.filter({ family_group_id: familyGroupId });
            const studentMemberEmails = familyMembers
              .filter(m => m.persona === 'gator' || m.persona === 'student')
              .map(m => m.email);

            for (const sEmail of studentMemberEmails) {
              // Boost JobRequests by created_by
              const questionsByCreator = await base44.asServiceRole.entities.JobRequest.filter({
                created_by: sEmail,
                status: 'active'
              });
              // Also boost JobRequests by poster_email (handles anonymous posts)
              const questionsByPoster = await base44.asServiceRole.entities.JobRequest.filter({
                poster_email: sEmail,
                status: 'active'
              });
              // Dedupe
              const seenIds = new Set();
              const allQuestions = [];
              for (const q of [...questionsByCreator, ...questionsByPoster]) {
                if (!seenIds.has(q.id)) { seenIds.add(q.id); allQuestions.push(q); }
              }
              for (const q of allQuestions) {
                await base44.asServiceRole.entities.JobRequest.update(q.id, {
                  karma_boost: familyTier.boost,
                  boosted_until: boostExpiresAt.toISOString(),
                  priority_score: (q.is_boosted ? 999 : 0) + (familyTier.boost * 100)
                });
              }

              // Also boost HelpRequests
              const helpRequests = await base44.asServiceRole.entities.HelpRequest.filter({
                student_email: sEmail,
                status: 'active'
              });
              for (const hr of helpRequests) {
                await base44.asServiceRole.entities.HelpRequest.update(hr.id, {
                  karma_boost: familyTier.boost,
                  boosted_until: boostExpiresAt.toISOString()
                });
              }
            }
            console.log(`Propagated boost ${familyTier.boost} to ${studentMemberEmails.length} students' questions & help requests`);

            // Sync cached karma on all family members
            for (const member of familyMembers) {
              await base44.asServiceRole.entities.User.update(member.id, {
                family_karma: newFamilyTotal,
                karma_tier: familyTier.name
              });
            }
          } catch (boostErr) {
            console.log('Question boost propagation failed (non-critical):', boostErr.message);
          }
        }

        familyRollUp = { total: newFamilyTotal, level: familyTier.name, boost: familyTier.boost };
        console.log(`Rolled up ${points} student karma to family ${familyGroupId}, new total: ${newFamilyTotal}`);
      }
    } catch (e) {
      console.log('Family karma roll-up failed (non-critical):', e.message);
    }

    return Response.json({
      success: true,
      points_awarded: points,
      new_total: newTotal,
      karma_level: newLevel,
      this_month_karma: thisMonthKarma,
      next_tier: nextTier,
      tier_unlocked: karmaRecord.karma_level !== newLevel ? newLevel : null,
      family_roll_up: familyRollUp,
    });
  } catch (error) {
    console.error('awardStudentKarma error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});