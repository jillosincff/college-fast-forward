import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const familyGroupId = user.family_group_id;
    
    if (!familyGroupId) {
      // User not in a family - return default state
      return Response.json({
        success: true,
        family_group_id: null,
        total_karma: 0,
        karma_level: 'bronze',
        boost_multiplier: 0,
        user_karma: user.karma_earned || 0,
        recent_transactions: [],
        next_level: {
          name: 'silver',
          points_needed: 50,
          points_remaining: 50
        }
      });
    }
    
    // Get family karma
    const karmaRecords = await base44.asServiceRole.entities.FamilyKarma.filter({
      family_group_id: familyGroupId
    });
    
    let familyKarma = {
      total_karma: 0,
      karma_level: 'bronze',
      boost_multiplier: 0
    };
    
    if (karmaRecords.length > 0) {
      familyKarma = karmaRecords[0];
    }
    
    // Get recent transactions
    const transactions = await base44.asServiceRole.entities.KarmaTransaction.filter(
      { family_group_id: familyGroupId },
      '-created_date',
      10
    );
    
    // Calculate next level
    const currentKarma = familyKarma.total_karma || 0;
    let nextLevel = null;
    
    if (currentKarma < 50) {
      nextLevel = { name: 'silver', points_needed: 50, points_remaining: 50 - currentKarma };
    } else if (currentKarma < 150) {
      nextLevel = { name: 'gold', points_needed: 150, points_remaining: 150 - currentKarma };
    } else if (currentKarma < 300) {
      nextLevel = { name: 'platinum', points_needed: 300, points_remaining: 300 - currentKarma };
    } else {
      nextLevel = { name: 'max', points_needed: 0, points_remaining: 0 };
    }
    
    // Get ALL linked students info for boost display (supports multiple students)
    let linkedStudents = [];
    let boostExpiresAt = null;
    
    try {
      // Get from user's student_emails array first
      const studentEmails = user.student_emails || [];
      
      // Also check legacy single student_email
      if (user.student_email && !studentEmails.includes(user.student_email)) {
        studentEmails.push(user.student_email);
      }
      
      // Find students by family_group_id as fallback
      let familyStudents = [];
      if (familyGroupId) {
        const familyMembers = await base44.asServiceRole.entities.User.filter({
          family_group_id: familyGroupId,
          persona: 'gator'
        });
        familyStudents = familyMembers;
      }
      
      // Fetch students from email list
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
              profile_image_url: student.profile_image_url,
              boost_level: student.boost_level || 0,
              boost_expires_at: student.boost_expires_at
            });
            // Use first student's expiry for widget display
            if (!boostExpiresAt && student.boost_expires_at) {
              boostExpiresAt = student.boost_expires_at;
            }
          }
        } catch (e) {
          console.log('Could not fetch student:', email, e.message);
        }
      }
      
      // Add family students not already in list
      for (const student of familyStudents) {
        if (!linkedStudents.find(s => s.id === student.id)) {
          linkedStudents.push({
            id: student.id,
            name: student.full_name || student.first_name || student.email?.split('@')[0],
            first_name: student.full_name?.split(' ')[0] || student.first_name,
            email: student.email,
            major: student.major,
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
    
    return Response.json({
      success: true,
      family_group_id: familyGroupId,
      total_karma: familyKarma.total_karma,
      karma_level: familyKarma.karma_level,
      boost_multiplier: familyKarma.boost_multiplier,
      user_karma: user.karma_earned || 0,
      recent_transactions: transactions,
      next_level: nextLevel,
      linked_students: linkedStudents,
      linked_students_count: linkedStudents.length,
      linked_students_text: linkedStudentsText,
      linked_student_name: linkedStudentNames[0] || 'Your student',
      boost_expires_at: boostExpiresAt
    });
    
  } catch (error) {
    console.error('getFamilyKarma error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});