import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Karma point values
const KARMA_VALUES = {
  answer: 10,
  upvote_received: 5,
  best_answer: 50,
  referral: 25
};

// Level thresholds and boosts
const KARMA_LEVELS = {
  bronze: { min: 0, max: 50, boost: 0 },
  silver: { min: 50, max: 150, boost: 1 },
  gold: { min: 150, max: 300, boost: 2 },
  platinum: { min: 300, max: Infinity, boost: 3 }
};

function getKarmaLevel(totalKarma) {
  if (totalKarma >= 300) return { level: 'platinum', boost: 3 };
  if (totalKarma >= 150) return { level: 'gold', boost: 2 };
  if (totalKarma >= 50) return { level: 'silver', boost: 1 };
  return { level: 'bronze', boost: 0 };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Auth check - allow system calls too
    const user = await base44.auth.me().catch(() => null);
    
    const body = await req.json();
    const { familyGroupId, parentUserId, parentEmail, actionType, referenceId, description } = body;
    
    console.log('awardKarma called:', { familyGroupId, parentUserId, actionType, referenceId });
    
    if (!familyGroupId || !parentUserId || !actionType) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const points = KARMA_VALUES[actionType];
    if (!points) {
      return Response.json({ error: 'Invalid action type' }, { status: 400 });
    }
    
    // Create karma transaction
    await base44.asServiceRole.entities.KarmaTransaction.create({
      family_group_id: familyGroupId,
      parent_user_id: parentUserId,
      parent_email: parentEmail || '',
      points: points,
      action_type: actionType,
      reference_id: referenceId || '',
      description: description || `Earned ${points} karma for ${actionType}`
    });
    
    // Get or create FamilyKarma record
    let familyKarma = null;
    const existingKarma = await base44.asServiceRole.entities.FamilyKarma.filter({ 
      family_group_id: familyGroupId 
    });
    
    if (existingKarma.length > 0) {
      familyKarma = existingKarma[0];
    } else {
      // Create new family karma record
      familyKarma = await base44.asServiceRole.entities.FamilyKarma.create({
        family_group_id: familyGroupId,
        total_karma: 0,
        karma_level: 'bronze',
        boost_multiplier: 0
      });
    }
    
    // Calculate new total
    const newTotal = (familyKarma.total_karma || 0) + points;
    const { level, boost } = getKarmaLevel(newTotal);
    
    // Update family karma
    await base44.asServiceRole.entities.FamilyKarma.update(familyKarma.id, {
      total_karma: newTotal,
      karma_level: level,
      boost_multiplier: boost
    });
    
    // Update user's individual karma count
    if (parentUserId) {
      try {
        const users = await base44.asServiceRole.entities.User.filter({ id: parentUserId });
        if (users.length > 0) {
          const currentUserKarma = users[0].karma_earned || 0;
          await base44.asServiceRole.entities.User.update(parentUserId, {
            karma_earned: currentUserKarma + points
          });
        }
      } catch (e) {
        console.log('Could not update user karma_earned:', e.message);
      }
    }
    
    // Update boost on family's student questions
    await updateFamilyQuestionBoosts(base44, familyGroupId, boost);
    
    return Response.json({
      success: true,
      points_awarded: points,
      new_total: newTotal,
      karma_level: level,
      boost_multiplier: boost
    });
    
  } catch (error) {
    console.error('awardKarma error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function updateFamilyQuestionBoosts(base44, familyGroupId, boost) {
  try {
    // Get family members
    const familyMembers = await base44.asServiceRole.entities.User.filter({
      family_group_id: familyGroupId
    });
    
    // Get student emails from family
    const studentEmails = familyMembers
      .filter(m => m.persona === 'gator' || m.persona === 'student')
      .map(m => m.email);
    
    if (studentEmails.length === 0) return;
    
    // Update their questions with new boost
    for (const email of studentEmails) {
      const questions = await base44.asServiceRole.entities.JobRequest.filter({
        created_by: email,
        status: 'active'
      });
      
      for (const q of questions) {
        await base44.asServiceRole.entities.JobRequest.update(q.id, {
          karma_boost: boost,
          priority_score: (q.is_boosted ? 999 : 0) + boost
        });
      }
    }
    
    console.log(`Updated boost to ${boost} for ${studentEmails.length} students' questions`);
  } catch (e) {
    console.log('Could not update question boosts:', e.message);
  }
}