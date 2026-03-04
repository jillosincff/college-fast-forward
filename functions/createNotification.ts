import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      recipientEmail, 
      type, 
      title, 
      message, 
      actionUrl, 
      actionLabel,
      priority = 'normal',
      sendEmail = false,
      metadata = {}
    } = await req.json();

    if (!recipientEmail || !type || !title || !message) {
      return Response.json({ 
        error: 'Missing required fields: recipientEmail, type, title, message' 
      }, { status: 400 });
    }

    // Create in-app notification
    const notification = await base44.asServiceRole.entities.Notification.create({
      recipient_email: recipientEmail,
      type,
      title,
      message,
      action_url: actionUrl,
      action_label: actionLabel,
      priority,
      is_read: false,
      email_sent: false,
      metadata
    });

    // Send email if requested and user preferences allow
    if (sendEmail) {
      try {
        await base44.asServiceRole.functions.invoke('sendNotificationEmail', {
          recipientEmail,
          title,
          message,
          actionUrl,
          actionLabel
        });

        // Mark email as sent
        await base44.asServiceRole.entities.Notification.update(notification.id, {
          email_sent: true
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
        // Don't fail the notification creation if email fails
      }
    }

    return Response.json({
      success: true,
      notification
    });

  } catch (error) {
    console.error('Error creating notification:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});