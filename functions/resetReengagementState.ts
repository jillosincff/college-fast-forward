import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Call this when a user takes meaningful action (login, answer, profile update)
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Update the user's last_active_at timestamp
    await base44.auth.updateMe({
      last_active_at: new Date().toISOString()
    });
    
    console.log(`Reset re-engagement state for user ${user.id}`);
    
    return Response.json({ success: true });
    
  } catch (error) {
    console.error('Reset state error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});