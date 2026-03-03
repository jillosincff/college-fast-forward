import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { code, skipUsageIncrement } = await req.json();

    console.log('🔑 Verifying invite code:', code, skipUsageIncrement ? '(re-verify, skip increment)' : '');

    if (!code) {
      console.error('❌ No code provided');
      return Response.json({ 
        success: false, 
        error: 'Invite code is required' 
      }, { status: 400 });
    }

    if (code.length < 4) {
      console.error('❌ Code too short');
      return Response.json({ 
        success: false, 
        error: 'Invalid invite code format' 
      }, { status: 400 });
    }

    // Find the invite code (case-insensitive)
    console.log('🔍 Searching for code:', code.toUpperCase());
    const invites = await base44.asServiceRole.entities.InviteCode.filter({
      code: code.toUpperCase()
    });

    console.log('📊 Found invites:', invites.length);

    if (invites.length === 0) {
      console.error('❌ No matching invite code found');
      return Response.json({
        success: false,
        error: 'Invalid invite code'
      });
    }

    const invite = invites[0];
    console.log('✅ Found invite:', {
      code: invite.code,
      is_community: invite.is_community_invite,
      current_uses: invite.current_uses,
      max_uses: invite.max_uses,
      status: invite.status,
      expires_at: invite.expires_at
    });

    // Check if expired
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      console.error('❌ Invite code expired:', invite.expires_at);
      return Response.json({
        success: false,
        error: 'This invite code has expired'
      });
    }

    // Check if community invite has reached max uses
    if (invite.is_community_invite) {
      console.log('🏘️ Community invite - checking usage limits');
      if (invite.current_uses >= invite.max_uses) {
        console.error('❌ Max uses reached:', invite.current_uses, '>=', invite.max_uses);
        return Response.json({
          success: false,
          error: 'This invite code has reached its maximum usage limit'
        });
      }
      
      console.log('✅ Usage limit OK:', invite.current_uses, '<', invite.max_uses);

      // Only increment usage count on first verification, not re-verification
      if (!skipUsageIncrement) {
        console.log('📈 Incrementing usage count from', invite.current_uses, 'to', invite.current_uses + 1);
        await base44.asServiceRole.entities.InviteCode.update(invite.id, {
          current_uses: invite.current_uses + 1
        });
        console.log('✅ Usage count updated');
      } else {
        console.log('⏭️ Skipping usage increment (re-verification)');
      }

      // Get current user for notification (if authenticated)
      let currentUser = null;
      try {
        currentUser = await base44.auth.me();
      } catch (e) {
        console.log('User not authenticated yet during verification');
      }

      // Send notification to inviter (async, don't block)
      if (currentUser) {
        // Get inviter details
        try {
          const inviterUser = await base44.asServiceRole.entities.User.get(invite.inviter_id);
          
          if (inviterUser?.email) {
            const currentUsage = invite.current_uses + 1;
            const spotsRemaining = invite.max_uses - currentUsage;

            // Send simple plain text email
            const emailSubject = `New Member from Your ${invite.group_name} Invite! 🎉`;
            const emailBody = `Someone just joined College Fast Forward using your community invite code!

New Member: ${currentUser.full_name || currentUser.email}

Community: ${invite.group_name}
Code Used: ${invite.code}

Invite Stats:
- ${currentUsage} people have joined
- ${spotsRemaining} spots remaining

You earned +100 points! 🎊

Keep sharing your code to help more Gators get hired!

Go Gators! 🐊🧡💙

College Fast Forward Team`;

            // Fire and forget - don't await
            base44.asServiceRole.integrations.Core.SendEmail({
              to: inviterUser.email,
              subject: emailSubject,
              body: emailBody
            }).catch(err => {
              console.log('Email notification failed (non-critical):', err.message);
            });

            // Award +100 points to inviter
            try {
              const currentPoints = inviterUser.gator_points || 0;
              await base44.asServiceRole.entities.User.update(invite.inviter_id, {
                gator_points: currentPoints + 100
              });
            } catch (pointsError) {
              console.log('Failed to award points (non-critical):', pointsError.message);
            }
          }
        } catch (notifError) {
          // Don't fail verification if notification fails
          console.log('Failed to send notification (non-critical):', notifError.message);
        }
      }

    } else {
      // Regular invite - check if already used
      if (invite.status === 'used') {
        return Response.json({
          success: false,
          error: 'This invite code has already been used'
        });
      }

      // Get current user for tracking (if authenticated)
      let regularInviteUser = null;
      try {
        regularInviteUser = await base44.auth.me();
      } catch (e) {
        console.log('User not authenticated during individual invite verification');
      }

      // Only mark as used on first verification, not re-verification
      if (!skipUsageIncrement) {
        await base44.asServiceRole.entities.InviteCode.update(invite.id, {
          status: 'used',
          used_by_email: regularInviteUser?.email || null,
          used_at: new Date().toISOString()
        });
      } else {
        console.log('⏭️ Skipping status update (re-verification)');
      }

      // Award +100 points to inviter for individual invites (only if user authenticated)
      if (regularInviteUser && invite.inviter_id) {
        try {
          const inviterUser = await base44.asServiceRole.entities.User.get(invite.inviter_id);
          if (inviterUser) {
            const currentPoints = inviterUser.gator_points || 0;
            await base44.asServiceRole.entities.User.update(invite.inviter_id, {
              gator_points: currentPoints + 100
            });

            // Send notification email to inviter
            const emailSubject = `Your Invite Was Used! 🎉`;
            const emailBody = `Great news! Someone just joined College Fast Forward using your invite code!

New Member: ${regularInviteUser.full_name || regularInviteUser.email}

Code Used: ${invite.code}

You earned +100 points! 🎊

Keep inviting to build the Gator network!

Go Gators! 🐊🧡💙

College Fast Forward Team`;

            base44.asServiceRole.integrations.Core.SendEmail({
              to: inviterUser.email,
              subject: emailSubject,
              body: emailBody
            }).catch(err => {
              console.log('Email notification failed (non-critical):', err.message);
            });
          }
        } catch (pointsError) {
          console.log('Failed to award points (non-critical):', pointsError.message);
        }
      }
    }

    // Handle gator_to_parent linking
    if (invite.invite_type === 'gator_to_parent' && invite.family_group_id && invite.parent_slot) {
      console.log('🔗 Processing gator_to_parent linking...');
      
      let parentUser = null;
      try {
        parentUser = await base44.auth.me();
      } catch (e) {
        console.log('Parent user not authenticated yet during verification');
      }

      if (parentUser?.id) {
        console.log('Parent user authenticated:', parentUser.email);
        
        // Get the student who created this invite
        try {
          const studentUser = await base44.asServiceRole.entities.User.get(invite.inviter_id);
          
          // Check if the parent slot is already filled
          const slotField = `${invite.parent_slot}_email`;
          if (studentUser[slotField]) {
            console.error('❌ Parent slot already filled:', slotField, studentUser[slotField]);
            return Response.json({
              success: false,
              error: `This parent slot (${invite.parent_slot}) is already filled. Please contact ${studentUser.full_name || 'the student'} for a new invite code.`
            });
          }

          // Link parent to student's family
          console.log('Linking parent to family:', invite.family_group_id);
          await base44.asServiceRole.entities.User.update(parentUser.id, {
            family_group_id: invite.family_group_id,
            persona: 'parent',
            roles: ['parent']
          });

          // Update student's parent slot
          console.log('Updating student parent slot:', slotField, '=', parentUser.email);
          await base44.asServiceRole.entities.User.update(invite.inviter_id, {
            [slotField]: parentUser.email
          });

          console.log('✅ Parent-student linking complete!');

          // Send notification to student
          try {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: studentUser.email,
              subject: `Your parent joined College Fast Forward! 🎉`,
              body: `Great news!

${parentUser.full_name || parentUser.email} has joined your family network on College Fast Forward using your invite code.

They can now help you connect with opportunities and support your career journey.

Go Gators! 🐊🧡💙

College Fast Forward Team`
            });
          } catch (emailErr) {
            console.log('Email notification failed (non-critical):', emailErr.message);
          }
        } catch (linkingError) {
          console.error('❌ Failed to link parent to student:', linkingError);
          return Response.json({
            success: false,
            error: 'Failed to link parent to student. Please contact support.'
          }, { status: 500 });
        }
      }
    }

    // Increment global user count if user authenticated (non-blocking)
    try {
      const authUserForCount = await base44.auth.me();
      if (authUserForCount?.id) {
        console.log('🔢 Incrementing global user count for new signup');
        // Fire and forget - don't block the response
        base44.functions.invoke('incrementUserCount', {
          user_id: authUserForCount.id,
          family_group_id: invite.family_group_id || authUserForCount.family_group_id
        }).catch(err => {
          console.log('User count increment failed (non-critical):', err.message);
        });
      }
    } catch (e) {
      console.log('User count increment skipped (not authenticated yet)');
    }

    // Determine the role from invite
    let assignedRole = invite.role || null;
    if (!assignedRole || assignedRole === 'everyone' || assignedRole === 'all') {
      // For "everyone" invites, don't assign a specific role - let user choose
      if (invite.invite_type?.includes('everyone') || invite.role === 'everyone' || invite.role === 'all') {
        assignedRole = null; // User will choose their role
      } else if (invite.invite_type?.includes('alumni')) {
        assignedRole = 'alumni';
      } else if (invite.invite_type?.includes('parent')) {
        assignedRole = 'parent';
      } else if (invite.invite_type?.includes('gator')) {
        assignedRole = 'gator';
      }
    }

    console.log('✅ Invite verified. Assigned role:', assignedRole);

    return Response.json({
      success: true,
      valid: true,
      invite_type: invite.invite_type,
      role: assignedRole,
      inviter_name: invite.inviter_name,
      is_community_invite: invite.is_community_invite || false,
      group_name: invite.group_name || null,
      current_uses: invite.current_uses + 1,
      max_uses: invite.max_uses || 1,
      family_group_id: invite.family_group_id || null,
      parent_slot: invite.parent_slot || null
    });

  } catch (error) {
    console.error('❌ CRITICAL: Verify invite code error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return Response.json({ 
      success: false,
      error: error.message || 'Failed to verify invite code' 
    }, { status: 500 });
  }
});