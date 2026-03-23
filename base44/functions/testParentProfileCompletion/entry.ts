import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    const isAdmin = user && (user.role === 'admin' || user.roles?.includes('admin'));
    if (!isAdmin) {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    console.log('🧪 Testing Parent Profile Completion → Badge & Boost...');

    // Find a test parent with family
    const parents = await base44.asServiceRole.entities.User.filter({
      persona: 'parent'
    });

    let testParent = parents.find(p => p.family_group_id);
    
    if (!testParent) {
      return Response.json({ 
        error: 'No parent with family_group_id found. Set up a parent-student link first.' 
      }, { status: 404 });
    }

    console.log('✅ Test parent found:', testParent.email, 'family:', testParent.family_group_id);

    // Grant badges directly instead of calling another function
    const familyStudents = await base44.asServiceRole.entities.User.filter({
      family_group_id: testParent.family_group_id,
      persona: 'gator'
    });

    console.log(`Found ${familyStudents.length} students in family`);

    const badgesToCreate = [];
    
    for (const student of familyStudents) {
      // Check if badge already exists
      const existingBadges = await base44.asServiceRole.entities.UserBadge.filter({
        user_id: student.id,
        badge_type: 'parent_verified'
      });

      if (existingBadges.length === 0) {
        badgesToCreate.push({
          user_id: student.id,
          badge_type: 'parent_verified',
          badge_name: 'Parent Verified',
          badge_description: 'Parent has completed their profile and is actively supporting this student',
          badge_icon: '✅',
          earned_at: new Date().toISOString(),
          granted_by_parent_email: testParent.email
        });
      }
    }

    if (badgesToCreate.length > 0) {
      await base44.asServiceRole.entities.UserBadge.bulkCreate(badgesToCreate);
      console.log(`✅ Granted ${badgesToCreate.length} parent_verified badges`);
    }

    // Boost students in directory
    for (const student of familyStudents) {
      await base44.asServiceRole.entities.User.update(student.id, {
        directory_boost: true,
        directory_boost_reason: 'Parent Verified',
        directory_boost_expires: null
      });
    }
    console.log(`✅ Boosted ${familyStudents.length} students in directory`);

    // Verify badges were created
    const results = [];
    
    for (const student of familyStudents) {
      const badges = await base44.asServiceRole.entities.UserBadge.filter({
        user_id: student.id,
        badge_type: 'parent_verified'
      });

      const updatedStudent = await base44.asServiceRole.entities.User.filter({
        id: student.id
      });

      results.push({
        student_email: student.email,
        badge_exists: badges.length > 0,
        badge_icon: badges[0]?.badge_icon,
        directory_boost: updatedStudent[0]?.directory_boost === true,
        boost_reason: updatedStudent[0]?.directory_boost_reason
      });
    }

    const allPassed = results.every(r => r.badge_exists && r.directory_boost);

    return Response.json({
      success: allPassed,
      message: allPassed ? '🎉 Test PASSED!' : '❌ Test FAILED - see results',
      parent_email: testParent.email,
      family_group_id: testParent.family_group_id,
      badges_granted: badgesToCreate.length,
      students_checked: results.length,
      results
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
    return Response.json({ 
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});