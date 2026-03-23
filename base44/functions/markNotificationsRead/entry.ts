import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationIds } = await req.json();

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return Response.json({ 
        error: 'notificationIds must be an array' 
      }, { status: 400 });
    }

    // Mark notifications as read
    const updatePromises = notificationIds.map(id => 
      base44.entities.Notification.update(id, { is_read: true })
    );

    await Promise.all(updatePromises);

    return Response.json({ 
      success: true,
      updated: notificationIds.length
    });

  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});