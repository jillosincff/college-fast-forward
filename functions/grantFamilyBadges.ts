import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { badge_type, parent_email, family_group_id } = await req.json();

    // Verify caller is a parent or admin
    const isParent = user.persona === 'parent' || user.roles?.includes('parent');
    const isAdmin = user.role === 'admin' || user.roles?.includes('admin');
    
    if (!isParent && !isAdmin) {
      return Response.json({ error: 'Only parents or admins can grant family badges' }, { status: 403 });
    }

    // Get family_group_id (from user or passed in by admin)
    const targetFamilyId = family_group_id || user.family_group_id;
    
    if (!targetFamilyId) {
      return Response.json({ error: 'No family_group_id available' }, { status: 400 });
    }

    // Get all students in this family
    const familyStudents = await base44.asServiceRole.entities.User.filter({
      family_group_id: targetFamilyId
    });

    const students = familyStudents.filter(u => 
      (u.persona === 'gator' || u.roles?.includes('gator')) && 
      u.id !== user.id
    );

    console.log(`Found ${students.length} students in family ${targetFamilyId}`);

    if (students.length === 0) {
      return Response.json({ 
        success: true, 
        message: 'No students in family to grant badges to' 
      });
    }

    const badgeConfigs = {
      parent_verified: {
        name: 'Parent Verified',
        description: 'Parent has completed their profile and is actively supporting this student',
        icon: '✅'
      },
      network_expanding: {
        name: 'Network Expanding',
        description: 'Parent is actively building connections to help this student',
        icon: '🌐'
      },
      supported_family: {
        name: 'Supported Family',
        description: 'Family has premium access to all platform features',
        icon: '💎'
      }
    };

    const config = badgeConfigs[badge_type];
    if (!config) {
      return Response.json({ error: 'Invalid badge type' }, { status: 400 });
    }

    const badgesToCreate = [];
    
    for (const student of students) {
      // Check if badge already exists
      const existingBadges = await base44.asServiceRole.entities.UserBadge.filter({
        user_id: student.id,
        badge_type
      });

      if (existingBadges.length === 0) {
        badgesToCreate.push({
          user_id: student.id,
          badge_type,
          badge_name: config.name,
          badge_description: config.description,
          badge_icon: config.icon,
          earned_at: new Date().toISOString(),
          granted_by_parent_email: parent_email || user.email
        });
      }
    }

    if (badgesToCreate.length > 0) {
      await base44.asServiceRole.entities.UserBadge.bulkCreate(badgesToCreate);
      console.log(`✅ Granted ${badgesToCreate.length} ${badge_type} badges`);
    }

    // For parent_verified badge, also boost students in directory
    if (badge_type === 'parent_verified') {
      for (const student of students) {
        await base44.asServiceRole.entities.User.update(student.id, {
          directory_boost: true,
          directory_boost_reason: 'Parent Verified',
          directory_boost_expires: null // Permanent boost
        });
      }
      console.log(`✅ Boosted ${students.length} students in directory`);
    }

    return Response.json({
      success: true,
      badges_granted: badgesToCreate.length,
      students_affected: students.map(s => s.email),
      badge_type,
      directory_boost: badge_type === 'parent_verified'
    });

  } catch (error) {
    console.error('❌ Error granting family badges:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});