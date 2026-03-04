import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { invite_id, parent_email } = await req.json();

    if (!invite_id) {
      return Response.json({ error: 'invite_id is required' }, { status: 400 });
    }

    // Try to get from Invite entity first, then ReferralLink as fallback
    let invite = null;
    let parent = null;

    const invites = await base44.asServiceRole.entities.Invite.filter({ id: invite_id });
    if (invites.length > 0) {
      invite = invites[0];
      const parents = await base44.asServiceRole.entities.User.filter({ id: invite.helper_user_id });
      parent = parents[0];
    } else {
      // Try ReferralLink
      const referralLinks = await base44.asServiceRole.entities.ReferralLink.filter({ id: invite_id });
      if (referralLinks.length > 0) {
        const link = referralLinks[0];
        const parents = await base44.asServiceRole.entities.User.filter({ id: link.helper_user_id });
        parent = parents[0];
        
        // Convert ReferralLink to invite-like object
        invite = {
          id: link.id,
          helper_user_id: link.helper_user_id,
          friend_name: 'a connection',
          friend_email: link.student_email
        };
      }
    }

    if (!invite || !parent) {
      return Response.json({ error: 'Invite or parent not found' }, { status: 404 });
    }

    if (!parent || !parent.family_group_id) {
      return Response.json({ 
        error: 'Parent not found or has no family group',
        details: { helper_user_id: invite.helper_user_id }
      }, { status: 404 });
    }

    console.log(`📨 Parent ${parent.email} invited ${invite.friend_email} - granting badges...`);

    // Get all students in this parent's family
    const familyStudents = await base44.asServiceRole.entities.User.filter({
      family_group_id: parent.family_group_id,
      persona: 'gator'
    });

    if (familyStudents.length === 0) {
      return Response.json({ 
        success: true,
        message: 'No students in family to grant badges to'
      });
    }

    // Grant "Network Expanding" badge to each student
    const badgesToCreate = [];
    
    for (const student of familyStudents) {
      // Check if badge already exists
      const existingBadges = await base44.asServiceRole.entities.UserBadge.filter({
        user_id: student.id,
        badge_type: 'network_expanding'
      });

      if (existingBadges.length === 0) {
        badgesToCreate.push({
          user_id: student.id,
          badge_type: 'network_expanding',
          badge_name: 'Network Expanding',
          badge_description: 'Parent is actively building connections to help this student',
          badge_icon: '🌐',
          earned_at: new Date().toISOString(),
          granted_by_parent_email: parent.email,
          metadata: {
            invite_id: invite.id,
            invited_friend: invite.friend_name
          }
        });
      }
    }

    if (badgesToCreate.length > 0) {
      await base44.asServiceRole.entities.UserBadge.bulkCreate(badgesToCreate);
      console.log(`✅ Granted ${badgesToCreate.length} "Network Expanding" badges`);
    }

    // Send notifications to students
    const notificationsToCreate = [];
    
    for (const student of familyStudents) {
      notificationsToCreate.push({
        user_id: student.id,
        type: 'parent_invite',
        title: 'Your parent is expanding your network! 🌐',
        message: `Your parent just invited ${invite.friend_name} to help you!`,
        link: '#Connections',
        is_read: false,
        metadata: {
          invite_id: invite.id,
          friend_name: invite.friend_name,
          friend_email: invite.friend_email,
          parent_email: parent.email
        }
      });
    }

    if (notificationsToCreate.length > 0) {
      await base44.asServiceRole.entities.Notification.bulkCreate(notificationsToCreate);
      console.log(`✅ Sent ${notificationsToCreate.length} notifications`);
    }

    return Response.json({
      success: true,
      badges_granted: badgesToCreate.length,
      notifications_sent: notificationsToCreate.length,
      students_affected: familyStudents.map(s => s.email),
      friend_invited: invite.friend_name
    });

  } catch (error) {
    console.error('❌ Error handling parent invite:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});