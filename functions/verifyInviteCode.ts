import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { code } = await req.json();

    if (!code) {
      return Response.json({ 
        success: false, 
        error: 'Invite code is required' 
      }, { status: 400 });
    }

    // Find the invite code (case-insensitive)
    const invites = await base44.asServiceRole.entities.InviteCode.filter({
      code: code.toUpperCase()
    });

    if (invites.length === 0) {
      return Response.json({
        success: false,
        error: 'Invalid invite code'
      });
    }

    const invite = invites[0];

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      return Response.json({
        success: false,
        error: 'This invite code has expired'
      });
    }

    // Check if community invite has reached max uses
    if (invite.is_community_invite) {
      if (invite.current_uses >= invite.max_uses) {
        return Response.json({
          success: false,
          error: 'This invite code has reached its maximum usage limit'
        });
      }

      // Increment usage count
      await base44.asServiceRole.entities.InviteCode.update(invite.id, {
        current_uses: invite.current_uses + 1
      });

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
      max_uses: invite.max_uses || 1
    });

  } catch (error) {
    console.error('Verify invite code error:', error);
    return Response.json({ 
      success: false,
      error: error.message || 'Failed to verify invite code' 
    }, { status: 500 });
  }
});