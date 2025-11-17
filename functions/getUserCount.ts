import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Use service role to get all users
    const users = await base44.asServiceRole.entities.User.list();
    
    return Response.json({
      success: true,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching user count:', error);
    return Response.json({
      success: false,
      count: 150 // Fallback
    });
  }
});