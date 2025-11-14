import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { invite_code, new_user_email, new_user_name } = await req.json();

    if (!invite_code || !new_user_email) {
      return Response.json({ 
        error: 'Missing required parameters' 
      }, { status: 400 });
    }

    // Get the invite code details
    const invites = await base44.asServiceRole.entities.InviteCode.filter({
      code: invite_code
    });

    if (invites.length === 0) {
      return Response.json({ 
        error: 'Invite code not found' 
      }, { status: 404 });
    }

    const invite = invites[0];

    // Only send notifications for community invites
    if (!invite.is_community_invite) {
      return Response.json({ 
        success: true,
        message: 'Not a community invite, no notification sent'
      });
    }

    // Get inviter details
    const inviterUser = await base44.asServiceRole.entities.User.get(invite.inviter_id);

    if (!inviterUser || !inviterUser.email) {
      return Response.json({ 
        success: true,
        message: 'Inviter not found, no notification sent'
      });
    }

    // Calculate usage after this new member
    const currentUsage = (invite.current_uses || 0) + 1;
    const spotsRemaining = invite.max_uses - currentUsage;

    // Send email notification to inviter using plain text format
    const emailSubject = `🎉 New Member from Your ${invite.group_name} Invite!`;
    
    const emailBody = `
🐊 Great News!

Someone just joined College Fast Forward using your community invite code:

━━━━━━━━━━━━━━━━━━━━━━━━
New Member: ${new_user_name || new_user_email}
Community: ${invite.group_name}
Code Used: ${invite_code}
━━━━━━━━━━━━━━━━━━━━━━━━

📊 Invite Stats:
✅ ${currentUsage} people have joined
🎯 ${spotsRemaining} spots remaining

Keep sharing your code to help more Gators get hired! 🚀

━━━━━━━━━━━━━━━━━━━━━━━━
Go Gators! 🧡💙
College Fast Forward Team
    `.trim();

    // Use SendEmail with proper parameters - SendGrid expects plain text in the body field
    await base44.integrations.Core.SendEmail({
      to: inviterUser.email,
      subject: emailSubject,
      body: emailBody
    });

    return Response.json({
      success: true,
      message: 'Notification sent to inviter',
      notified_email: inviterUser.email
    });

  } catch (error) {
    console.error('Send community invite notification error:', error);
    
    // Log detailed error for debugging
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    
    return Response.json({ 
      error: error.message || 'Failed to send notification' 
    }, { status: 500 });
  }
});