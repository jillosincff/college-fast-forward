import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userId } = await req.json().catch(() => ({}));
    
    if (!userId) {
      return Response.json({ error: 'Missing userId' }, { status: 400 });
    }
    
    // Check if preference exists
    const existing = await base44.asServiceRole.entities.EmailPreference.filter({ user_id: userId });
    
    if (existing.length > 0) {
      await base44.asServiceRole.entities.EmailPreference.update(existing[0].id, {
        reengagement_emails: false
      });
    } else {
      // Get user email
      const users = await base44.asServiceRole.entities.User.filter({ id: userId });
      const userEmail = users[0]?.email;
      
      await base44.asServiceRole.entities.EmailPreference.create({
        user_id: userId,
        user_email: userEmail,
        reengagement_emails: false,
        answer_notifications: true,
        weekly_digest: true
      });
    }
    
    console.log(`User ${userId} unsubscribed from re-engagement emails`);
    
    return Response.json({ 
      success: true,
      message: 'Successfully unsubscribed from reminder emails'
    });
    
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});