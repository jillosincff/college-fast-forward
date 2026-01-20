import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Karma tiers matching spec
const KARMA_TIERS = [
  { name: 'none', threshold: 0, boost: 0, benefit: '' },
  { name: 'active', threshold: 100, boost: 1, benefit: 'Active Family badge on profile' },
  { name: 'engaged', threshold: 300, boost: 1.5, benefit: 'Boosted in match results' },
  { name: 'priority', threshold: 500, boost: 2, benefit: 'Priority placement in matches' },
  { name: 'champion', threshold: 1000, boost: 3, benefit: 'Featured in directory' }
];

function getKarmaLevel(totalKarma) {
  let currentTier = KARMA_TIERS[0];
  for (const tier of KARMA_TIERS) {
    if (totalKarma >= tier.threshold) {
      currentTier = tier;
    } else {
      break;
    }
  }
  return currentTier;
}

function getNextTier(totalKarma) {
  for (const tier of KARMA_TIERS) {
    if (totalKarma < tier.threshold) {
      return { 
        name: tier.name, 
        threshold: tier.threshold, 
        points_needed: tier.threshold,
        points_remaining: tier.threshold - totalKarma,
        benefit: tier.benefit
      };
    }
  }
  return { name: 'max', threshold: 1000, points_needed: 0, points_remaining: 0, benefit: 'Maximum level reached!' };
}

function getUnlockedBenefits(totalKarma) {
  return KARMA_TIERS.filter(tier => totalKarma >= tier.threshold && tier.benefit);
}

function getLockedBenefits(totalKarma) {
  return KARMA_TIERS.filter(tier => totalKarma < tier.threshold && tier.benefit);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const familyGroupId = user.family_group_id;
    
    if (!familyGroupId) {
      // User not in a family - return default state with new tier structure
      return Response.json({
        success: true,
        family_group_id: null,
        total_karma: 0,
        karma_level: 'none',
        boost_multiplier: 0,
        user_karma: user.karma_earned || user.karma_points || 0,
        recent_transactions: [],
        next_level: getNextTier(0),
        unlocked_benefits: [],
        locked_benefits: getLockedBenefits(0),
        karma_percentile: 0
      });
    }
    
    // Get family karma
    const karmaRecords = await base44.asServiceRole.entities.FamilyKarma.filter({
      family_group_id: familyGroupId
    });
    
    let familyKarma = {
      total_karma: 0,
      karma_level: 'none',
      boost_multiplier: 0,
      karma_percentile: 0
    };
    
    if (karmaRecords.length > 0) {
      familyKarma = karmaRecords[0];
    }
    
    const totalKarma = familyKarma.total_karma || 0;
    const currentTier = getKarmaLevel(totalKarma);
    
    // Calculate percentile ranking (what % of families have less karma)
    let karmaPercentile = familyKarma.karma_percentile || 0;
    try {
      const allFamilies = await base44.asServiceRole.entities.FamilyKarma.list('-total_karma', 1000);
      if (allFamilies.length > 1) {
        const familiesWithLessKarma = allFamilies.filter(f => (f.total_karma || 0) < totalKarma).length;
        karmaPercentile = Math.round((familiesWithLessKarma / allFamilies.length) * 100);
      } else if (totalKarma > 0) {
        karmaPercentile = 100; // Only family with karma = top 100%
      }
    } catch (e) {
      console.log('Could not calculate percentile:', e.message);
    }
    
    // Get recent transactions
    const transactions = await base44.asServiceRole.entities.KarmaTransaction.filter(
      { family_group_id: familyGroupId },
      '-created_date',
      10
    );
    
    // Get ALL linked students info for boost display (supports multiple students)
    let linkedStudents = [];
    let boostExpiresAt = null;
    
    try {
      const studentEmails = user.student_emails || [];
      
      if (user.student_email && !studentEmails.includes(user.student_email)) {
        studentEmails.push(user.student_email);
      }
      
      let familyStudents = [];
      if (familyGroupId) {
        const familyMembers = await base44.asServiceRole.entities.User.filter({
          family_group_id: familyGroupId,
          persona: 'gator'
        });
        familyStudents = familyMembers;
      }
      
      for (const email of studentEmails) {
        try {
          const students = await base44.asServiceRole.entities.User.filter({ email });
          if (students.length > 0) {
            const student = students[0];
            linkedStudents.push({
              id: student.id,
              name: student.full_name || student.first_name || email.split('@')[0],
              first_name: student.full_name?.split(' ')[0] || student.first_name || email.split('@')[0],
              email: student.email,
              major: student.major,
              graduation_year: student.graduation_year,
              profile_image_url: student.profile_image_url,
              boost_level: student.boost_level || 0,
              boost_expires_at: student.boost_expires_at
            });
            if (!boostExpiresAt && student.boost_expires_at) {
              boostExpiresAt = student.boost_expires_at;
            }
          }
        } catch (e) {
          console.log('Could not fetch student:', email, e.message);
        }
      }
      
      for (const student of familyStudents) {
        if (!linkedStudents.find(s => s.id === student.id)) {
          linkedStudents.push({
            id: student.id,
            name: student.full_name || student.first_name || student.email?.split('@')[0],
            first_name: student.full_name?.split(' ')[0] || student.first_name,
            email: student.email,
            major: student.major,
            graduation_year: student.graduation_year,
            profile_image_url: student.profile_image_url,
            boost_level: student.boost_level || 0,
            boost_expires_at: student.boost_expires_at
          });
          if (!boostExpiresAt && student.boost_expires_at) {
            boostExpiresAt = student.boost_expires_at;
          }
        }
      }
    } catch (err) {
      console.log('Failed to get linked students:', err.message);
    }
    
    // Format linked student names for display
    const linkedStudentNames = linkedStudents.map(s => s.first_name);
    let linkedStudentsText = '';
    if (linkedStudentNames.length === 0) {
      linkedStudentsText = 'your students';
    } else if (linkedStudentNames.length === 1) {
      linkedStudentsText = linkedStudentNames[0];
    } else if (linkedStudentNames.length === 2) {
      linkedStudentsText = `${linkedStudentNames[0]} and ${linkedStudentNames[1]}`;
    } else if (linkedStudentNames.length === 3) {
      linkedStudentsText = `${linkedStudentNames[0]}, ${linkedStudentNames[1]}, and ${linkedStudentNames[2]}`;
    } else {
      linkedStudentsText = `your ${linkedStudentNames.length} students`;
    }
    
    // Get family member contributions for student view
    let familyContributions = [];
    try {
      const parentMembers = await base44.asServiceRole.entities.User.filter({
        family_group_id: familyGroupId,
        persona: 'parent'
      });
      
      for (const parent of parentMembers) {
        // Get this parent's karma earned this month
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        
        const parentTransactions = transactions.filter(t => 
          t.parent_user_id === parent.id && 
          new Date(t.created_date) >= monthStart
        );
        
        const karmaThisMonth = parentTransactions.reduce((sum, t) => sum + (t.points || 0), 0);
        const answerCount = parentTransactions.filter(t => t.action_type === 'answer').length;
        
        let description = '';
        if (answerCount > 0) {
          description = `answered ${answerCount} question${answerCount > 1 ? 's' : ''} this month`;
        } else if (karmaThisMonth > 0) {
          description = 'contributed this month';
        }
        
        familyContributions.push({
          id: parent.id,
          name: parent.full_name || parent.first_name || 'Parent',
          relation: parent.full_name?.split(' ')[0] || 'Parent',
          profile_image_url: parent.profile_image_url,
          karma_earned_this_month: karmaThisMonth,
          karma_description: description
        });
      }
    } catch (e) {
      console.log('Could not get family contributions:', e.message);
    }
    
    return Response.json({
      success: true,
      family_group_id: familyGroupId,
      total_karma: totalKarma,
      karma_level: currentTier.name,
      boost_multiplier: currentTier.boost,
      user_karma: user.karma_earned || user.karma_points || 0,
      recent_transactions: transactions,
      next_level: getNextTier(totalKarma),
      unlocked_benefits: getUnlockedBenefits(totalKarma),
      locked_benefits: getLockedBenefits(totalKarma),
      karma_percentile: karmaPercentile,
      linked_students: linkedStudents,
      linked_students_count: linkedStudents.length,
      linked_students_text: linkedStudentsText,
      linked_student_name: linkedStudentNames[0] || 'Your student',
      boost_expires_at: boostExpiresAt,
      family_contributions: familyContributions
    });
    
  } catch (error) {
    console.error('getFamilyKarma error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});