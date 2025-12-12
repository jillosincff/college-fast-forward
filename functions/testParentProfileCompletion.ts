import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || !user.roles?.includes('admin')) {
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

    // Simulate parent profile completion by calling grantFamilyBadges
    const grantResponse = await fetch(`${req.url.replace('/testParentProfileCompletion', '/grantFamilyBadges')}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('Authorization')
      },
      body: JSON.stringify({ 
        badge_type: 'parent_verified',
        parent_email: testParent.email
      })
    });

    const grantData = await grantResponse.json();
    
    if (!grantData.success) {
      return Response.json({ 
        error: 'Failed to grant badges',
        details: grantData 
      }, { status: 500 });
    }

    console.log('✅ Badges granted:', grantData);

    // Verify badges were created
    const familyStudents = await base44.asServiceRole.entities.User.filter({
      family_group_id: testParent.family_group_id,
      persona: 'gator'
    });

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
      badges_granted: grantData.badges_granted,
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