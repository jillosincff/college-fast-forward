import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Karma point values
const KARMA_VALUES = {
  answer: 10,
  upvote_received: 5,
  best_answer: 50,
  referral: 25,
  intro_made: 15,
  opportunity_posted: 20,
  opportunity_application: 10
};

// Level thresholds and boosts
const KARMA_LEVELS = {
  bronze: { min: 0, max: 50, boost: 0 },
  silver: { min: 50, max: 150, boost: 1 },
  gold: { min: 150, max: 300, boost: 2 },
  platinum: { min: 300, max: Infinity, boost: 3 }
};

// Boost duration in hours
const BOOST_DURATION_HOURS = 48;

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
    
    console.log('awardKarma called:', { familyGroupId, parentUserId, parentEmail, actionType, referenceId });
    
    // Allow calls without familyGroupId - we'll look it up from the parent
    if (!parentUserId || !actionType) {
      return Response.json({ error: 'Missing required fields (parentUserId, actionType)' }, { status: 400 });
    }
    
    const points = KARMA_VALUES[actionType];
    if (!points) {
      return Response.json({ error: `Invalid action type: ${actionType}` }, { status: 400 });
    }
    
    const now = new Date();
    const boostExpiresAt = new Date(now.getTime() + BOOST_DURATION_HOURS * 60 * 60 * 1000);
    
    // Get parent user to find their linked students and family
    let parentUser = null;
    let effectiveFamilyGroupId = familyGroupId;
    
    try {
      const parentUsers = await base44.asServiceRole.entities.User.filter({ id: parentUserId });
      if (parentUsers.length > 0) {
        parentUser = parentUsers[0];
        effectiveFamilyGroupId = effectiveFamilyGroupId || parentUser.family_group_id;
      }
    } catch (e) {
      console.log('Could not fetch parent user:', e.message);
    }
    
    // Create karma transaction if we have a family group
    if (effectiveFamilyGroupId) {
      try {
        await base44.asServiceRole.entities.KarmaTransaction.create({
          family_group_id: effectiveFamilyGroupId,
          parent_user_id: parentUserId,
          parent_email: parentEmail || parentUser?.email || '',
          points: points,
          action_type: actionType,
          reference_id: referenceId || '',
          description: description || `Earned ${points} karma for ${actionType}`
        });
      } catch (e) {
        console.log('Could not create karma transaction:', e.message);
      }
    }
    
    // Update user's individual karma count and timestamp
    let newUserTotal = points;
    if (parentUser) {
      const currentUserKarma = parentUser.karma_points || parentUser.karma_earned || 0;
      newUserTotal = currentUserKarma + points;
      const { level } = getKarmaLevel(newUserTotal);
      
      try {
        await base44.asServiceRole.entities.User.update(parentUserId, {
          karma_points: newUserTotal,
          karma_earned: newUserTotal, // Keep legacy field in sync
          karma_level: level,
          last_karma_earned_at: now.toISOString()
        });
        console.log(`Updated parent ${parentUser.email} karma to ${newUserTotal} (${level})`);
      } catch (e) {
        console.log('Could not update user karma:', e.message);
      }
    }
    
    // Get or create FamilyKarma record if we have a family group
    let familyKarma = null;
    let newFamilyTotal = points;
    let familyLevel = 'bronze';
    let familyBoost = 0;
    
    if (effectiveFamilyGroupId) {
      const existingKarma = await base44.asServiceRole.entities.FamilyKarma.filter({ 
        family_group_id: effectiveFamilyGroupId 
      });
      
      if (existingKarma.length > 0) {
        familyKarma = existingKarma[0];
      } else {
        // Create new family karma record
        familyKarma = await base44.asServiceRole.entities.FamilyKarma.create({
          family_group_id: effectiveFamilyGroupId,
          total_karma: 0,
          karma_level: 'bronze',
          boost_multiplier: 0
        });
      }
      
      // Calculate new total
      newFamilyTotal = (familyKarma.total_karma || 0) + points;
      const levelInfo = getKarmaLevel(newFamilyTotal);
      familyLevel = levelInfo.level;
      familyBoost = levelInfo.boost;
      
      // Update family karma
      await base44.asServiceRole.entities.FamilyKarma.update(familyKarma.id, {
        total_karma: newFamilyTotal,
        karma_level: familyLevel,
        boost_multiplier: familyBoost,
        last_karma_earned_at: now.toISOString(),
        boost_expires_at: boostExpiresAt.toISOString()
      });
    }
    
    // Update boost on linked students
    await updateLinkedStudentBoosts(base44, parentUser, effectiveFamilyGroupId, familyBoost, boostExpiresAt, parentEmail || parentUser?.email);
    
    // Update boost on family's student questions
    if (effectiveFamilyGroupId) {
      await updateFamilyQuestionBoosts(base44, effectiveFamilyGroupId, familyBoost, boostExpiresAt);
    }
    
    return Response.json({
      success: true,
      points_awarded: points,
      new_user_total: newUserTotal,
      new_family_total: newFamilyTotal,
      karma_level: familyLevel,
      boost_multiplier: familyBoost,
      boost_expires_at: boostExpiresAt.toISOString()
    });
    
  } catch (error) {
    console.error('awardKarma error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function updateLinkedStudentBoosts(base44, parentUser, familyGroupId, boost, boostExpiresAt, parentEmail) {
  try {
    // Get student emails from parent's student_emails array
    const studentEmails = parentUser?.student_emails || [];
    
    // Also get students from family group
    let familyStudents = [];
    if (familyGroupId) {
      const familyMembers = await base44.asServiceRole.entities.User.filter({
        family_group_id: familyGroupId
      });
      familyStudents = familyMembers
        .filter(m => m.persona === 'gator' || m.persona === 'student')
        .map(m => m.email);
    }
    
    // Combine and dedupe
    const allStudentEmails = [...new Set([...studentEmails, ...familyStudents])];
    
    if (allStudentEmails.length === 0) {
      console.log('No linked students found for parent');
      return;
    }
    
    // Update each student's boost level
    for (const email of allStudentEmails) {
      try {
        const students = await base44.asServiceRole.entities.User.filter({ email });
        if (students.length > 0) {
          const student = students[0];
          await base44.asServiceRole.entities.User.update(student.id, {
            boost_level: boost,
            boost_expires_at: boostExpiresAt.toISOString(),
            boosted_by_parent_email: parentEmail || ''
          });
          console.log(`Updated student ${email} boost_level to ${boost}, expires ${boostExpiresAt.toISOString()}`);
        }
      } catch (e) {
        console.log(`Could not update student ${email}:`, e.message);
      }
    }
  } catch (e) {
    console.log('Could not update linked student boosts:', e.message);
  }
}

async function updateFamilyQuestionBoosts(base44, familyGroupId, boost, boostExpiresAt) {
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
          boosted_until: boostExpiresAt.toISOString(),
          priority_score: (q.is_boosted ? 999 : 0) + (boost * 100) // Higher multiplier for visibility
        });
      }
      
      // Also update HelpRequests
      const helpRequests = await base44.asServiceRole.entities.HelpRequest.filter({
        student_email: email,
        status: 'active'
      });
      
      for (const hr of helpRequests) {
        await base44.asServiceRole.entities.HelpRequest.update(hr.id, {
          karma_boost: boost,
          boosted_until: boostExpiresAt.toISOString()
        });
      }
    }
    
    console.log(`Updated boost to ${boost} for ${studentEmails.length} students' questions`);
  } catch (e) {
    console.log('Could not update question boosts:', e.message);
  }
}