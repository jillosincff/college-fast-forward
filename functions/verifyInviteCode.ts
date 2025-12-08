import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { code } = await req.json();

    console.log('🔑 Verifying invite code:', code);

    if (!code) {
      console.error('❌ No code provided');
      return Response.json({ 
        success: false, 
        error: 'Invite code is required' 
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

      // Increment usage count
      console.log('📈 Incrementing usage count from', invite.current_uses, 'to', invite.current_uses + 1);
      await base44.asServiceRole.entities.InviteCode.update(invite.id, {
        current_uses: invite.current_uses + 1
      });
      console.log('✅ Usage count updated');

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

      // Mark as used
      let currentUser = null;
      try {
        currentUser = await base44.auth.me();
      } catch (e) {
        console.log('User not authenticated during individual invite');
      }

      await base44.asServiceRole.entities.InviteCode.update(invite.id, {
        status: 'used',
        used_by_email: currentUser?.email,
        used_at: new Date().toISOString()
      });

      // Award +100 points to inviter for individual invites
      if (currentUser) {
        try {
          const inviterUser = await base44.asServiceRole.entities.User.get(invite.inviter_id);
          const currentPoints = inviterUser.gator_points || 0;
          await base44.asServiceRole.entities.User.update(invite.inviter_id, {
            gator_points: currentPoints + 100
          });

          // Send notification email to inviter
          const emailSubject = `Your Invite Was Used! 🎉`;
          const emailBody = `Great news! Someone just joined College Fast Forward using your invite code!

New Member: ${currentUser.full_name || currentUser.email}

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

        } catch (pointsError) {
          console.log('Failed to award points (non-critical):', pointsError.message);
        }
      }
    }

    return Response.json({
      success: true,
      invite_type: invite.invite_type,
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