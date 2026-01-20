import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// NEW Karma point values based on spec
const KARMA_VALUES = {
  onboarding_complete: 50,
  answer: 15,
  upvote_received: 3,
  best_answer: 25,
  salary_submitted: 25,
  interview_question_submitted: 15,
  interview_question_confirmed: 5,
  message_received: 5,
  message_responded: 10,
  referral_given: 50,
  mock_interview: 30,
  outcome_reported: 75,
  ama_hosted: 200,
  // Legacy mappings
  referral: 50,
  intro_made: 15,
  opportunity_posted: 20,
  opportunity_application: 10
};

// NEW Level thresholds based on spec
const KARMA_TIERS = [
  { name: 'none', threshold: 0, boost: 0 },
  { name: 'active', threshold: 100, boost: 1 },
  { name: 'engaged', threshold: 300, boost: 1.5 },
  { name: 'priority', threshold: 500, boost: 2 },
  { name: 'champion', threshold: 1000, boost: 3 }
];

// Boost duration in hours
const BOOST_DURATION_HOURS = 48;

function getKarmaLevel(totalKarma) {
  let currentTier = KARMA_TIERS[0];
  for (const tier of KARMA_TIERS) {
    if (totalKarma >= tier.threshold) {
      currentTier = tier;
    } else {
      break;
    }
  }
  return { level: currentTier.name, boost: currentTier.boost, threshold: currentTier.threshold };
}

function getNextTier(totalKarma) {
  for (const tier of KARMA_TIERS) {
    if (totalKarma < tier.threshold) {
      return { 
        name: tier.name, 
        threshold: tier.threshold, 
        points_needed: tier.threshold,
        points_remaining: tier.threshold - totalKarma,
        benefit: getBenefitLabel(tier.name)
      };
    }
  }
  return { name: 'max', threshold: 1000, points_needed: 0, points_remaining: 0 };
}

function getBenefitLabel(tierName) {
  const benefits = {
    active: 'Active Family badge',
    engaged: 'Boosted visibility',
    priority: 'Priority placement',
    champion: 'Featured status'
  };
  return benefits[tierName] || '';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Auth check - allow system calls too
    const user = await base44.auth.me().catch(() => null);
    
    const body = await req.json();
    const { familyGroupId, parentUserId, parentEmail, parentName, actionType, referenceType, referenceId, description } = body;
    
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
          parent_name: parentName || parentUser?.full_name || '',
          points: points,
          action_type: actionType,
          reference_type: referenceType || '',
          reference_id: referenceId || '',
          description: description || getDefaultDescription(actionType, points)
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
    let familyLevel = 'none';
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
          karma_level: 'none',
          boost_multiplier: 0
        });
      }
      
      // Calculate new total
      newFamilyTotal = (familyKarma.total_karma || 0) + points;
      const levelInfo = getKarmaLevel(newFamilyTotal);
      familyLevel = levelInfo.level;
      familyBoost = levelInfo.boost;
      
      // Check if new tier unlocked
      const oldLevel = familyKarma.karma_level || 'none';
      const tierUnlocked = oldLevel !== familyLevel && familyLevel !== 'none';
      
      // Update family karma
      await base44.asServiceRole.entities.FamilyKarma.update(familyKarma.id, {
        total_karma: newFamilyTotal,
        karma_level: familyLevel,
        boost_multiplier: familyBoost,
        last_karma_earned_at: now.toISOString(),
        boost_expires_at: boostExpiresAt.toISOString()
      });
      
      // Update all family members' cached karma
      await updateFamilyMembersKarma(base44, effectiveFamilyGroupId, newFamilyTotal, familyLevel);
    }
    
    // Update boost on ALL linked students (supports multiple students)
    const boostResult = await updateLinkedStudentBoosts(base44, parentUser, effectiveFamilyGroupId, familyBoost, boostExpiresAt, parentEmail || parentUser?.email);
    
    // Update boost on family's student questions
    if (effectiveFamilyGroupId) {
      await updateFamilyQuestionBoosts(base44, effectiveFamilyGroupId, familyBoost, boostExpiresAt);
    }
    
    // ALSO boost alumni career requests if this user is an alumni
    let alumniCareerRequestsBoosted = 0;
    if (parentUser?.persona === 'alumni' || parentUser?.roles?.includes('alumni')) {
      alumniCareerRequestsBoosted = await updateAlumniCareerRequestBoosts(
        base44, 
        parentUserId, 
        parentEmail || parentUser?.email, 
        familyBoost, 
        boostExpiresAt
      );
    }
    
    const nextTier = getNextTier(newFamilyTotal);
    
    return Response.json({
      success: true,
      points_awarded: points,
      new_user_total: newUserTotal,
      new_family_total: newFamilyTotal,
      karma_level: familyLevel,
      boost_multiplier: familyBoost,
      boost_expires_at: boostExpiresAt.toISOString(),
      next_tier: nextTier,
      boosted_students: boostResult.boostedStudents,
      boosted_count: boostResult.count,
      alumni_career_requests_boosted: alumniCareerRequestsBoosted
    });
    
  } catch (error) {
    console.error('awardKarma error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getDefaultDescription(actionType, points) {
  const descriptions = {
    onboarding_complete: 'Completed profile setup',
    answer: 'Answered a question',
    upvote_received: 'Answer was upvoted',
    best_answer: 'Marked as best answer',
    salary_submitted: 'Shared salary data',
    interview_question_submitted: 'Shared interview question',
    interview_question_confirmed: 'Interview question confirmed',
    message_received: 'Received a student message',
    message_responded: 'Responded to a message',
    referral_given: 'Gave a referral',
    mock_interview: 'Conducted mock interview',
    outcome_reported: 'Student reported positive outcome',
    ama_hosted: 'Hosted an AMA session'
  };
  return descriptions[actionType] || `Earned ${points} karma for ${actionType}`;
}

async function updateFamilyMembersKarma(base44, familyGroupId, totalKarma, karmaLevel) {
  try {
    const familyMembers = await base44.asServiceRole.entities.User.filter({
      family_group_id: familyGroupId
    });
    
    for (const member of familyMembers) {
      await base44.asServiceRole.entities.User.update(member.id, {
        family_karma: totalKarma,
        karma_tier: karmaLevel
      });
    }
    console.log(`Updated ${familyMembers.length} family members with karma ${totalKarma}`);
  } catch (e) {
    console.log('Could not update family members karma:', e.message);
  }
}

async function updateLinkedStudentBoosts(base44, parentUser, familyGroupId, boost, boostExpiresAt, parentEmail) {
  try {
    const studentEmails = parentUser?.student_emails || [];
    
    if (parentUser?.student_email && !studentEmails.includes(parentUser.student_email)) {
      studentEmails.push(parentUser.student_email);
    }
    
    let familyStudents = [];
    if (familyGroupId) {
      const familyMembers = await base44.asServiceRole.entities.User.filter({
        family_group_id: familyGroupId
      });
      familyStudents = familyMembers
        .filter(m => m.persona === 'gator' || m.persona === 'student')
        .map(m => m.email);
    }
    
    const allStudentEmails = [...new Set([...studentEmails, ...familyStudents])];
    
    if (allStudentEmails.length === 0) {
      console.log('No linked students found for parent');
      return { boostedStudents: [], count: 0 };
    }
    
    const parentName = parentUser?.full_name?.split(' ')[0] || parentUser?.first_name || 'Your parent';
    const boostedStudents = [];
    
    for (const email of allStudentEmails) {
      try {
        const students = await base44.asServiceRole.entities.User.filter({ email });
        if (students.length > 0) {
          const student = students[0];
          await base44.asServiceRole.entities.User.update(student.id, {
            boost_level: boost,
            boost_expires_at: boostExpiresAt.toISOString(),
            boosted_by_parent_email: parentEmail || '',
            boosted_by_parent_name: parentName
          });
          boostedStudents.push({
            email,
            name: student.full_name || student.first_name || email.split('@')[0],
            major: student.major
          });
          console.log(`Updated student ${email} boost_level to ${boost}`);
        }
      } catch (e) {
        console.log(`Could not update student ${email}:`, e.message);
      }
    }
    
    console.log(`Boosted ${boostedStudents.length} students to level ${boost}`);
    return { boostedStudents, count: boostedStudents.length };
  } catch (e) {
    console.log('Could not update linked student boosts:', e.message);
    return { boostedStudents: [], count: 0 };
  }
}

async function updateFamilyQuestionBoosts(base44, familyGroupId, boost, boostExpiresAt) {
  try {
    const familyMembers = await base44.asServiceRole.entities.User.filter({
      family_group_id: familyGroupId
    });
    
    const studentEmails = familyMembers
      .filter(m => m.persona === 'gator' || m.persona === 'student')
      .map(m => m.email);
    
    if (studentEmails.length === 0) return;
    
    for (const email of studentEmails) {
      const questions = await base44.asServiceRole.entities.JobRequest.filter({
        created_by: email,
        status: 'active'
      });
      
      for (const q of questions) {
        await base44.asServiceRole.entities.JobRequest.update(q.id, {
          karma_boost: boost,
          boosted_until: boostExpiresAt.toISOString(),
          priority_score: (q.is_boosted ? 999 : 0) + (boost * 100)
        });
      }
      
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

async function updateAlumniCareerRequestBoosts(base44, alumniUserId, alumniEmail, boost, boostExpiresAt) {
  try {
    const alumniRequests = await base44.asServiceRole.entities.JobRequest.filter({
      poster_email: alumniEmail,
      is_alumni_career_request: true,
      status: 'active'
    });
    
    const alumniRequestsByCreator = await base44.asServiceRole.entities.JobRequest.filter({
      created_by: alumniEmail,
      is_alumni_career_request: true,
      status: 'active'
    });
    
    const seenIds = new Set();
    const allRequests = [];
    [...alumniRequests, ...alumniRequestsByCreator].forEach(r => {
      if (!seenIds.has(r.id)) {
        seenIds.add(r.id);
        allRequests.push(r);
      }
    });
    
    for (const request of allRequests) {
      await base44.asServiceRole.entities.JobRequest.update(request.id, {
        karma_boost: boost,
        boosted_until: boostExpiresAt.toISOString(),
        priority_score: (request.is_boosted ? 999 : 0) + (boost * 100)
      });
    }
    
    console.log(`Updated boost to ${boost} for ${allRequests.length} alumni career requests`);
    return allRequests.length;
  } catch (e) {
    console.log('Could not update alumni career request boosts:', e.message);
    return 0;
  }
}