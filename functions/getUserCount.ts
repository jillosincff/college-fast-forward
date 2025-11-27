import { createClientFromRequest, createClient } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get ALL users using service role
    const allUsers = await base44.asServiceRole.entities.User.list();
    
    // Count by type
    const gators = allUsers.filter(u => 
      u.persona === 'gator' || 
      u.roles?.includes('gator') || 
      u.email?.toLowerCase().endsWith('@ufl.edu')
    );
    
    const parents = allUsers.filter(u => 
      u.persona === 'parent' || 
      u.roles?.includes('parent')
    );
    
    const result = {
      totalUsers: allUsers.length,
      gatorCount: gators.length,
      parentCount: parents.length,
      spotsLeft: Math.max(0, 1000 - allUsers.length)
    };
    
    return Response.json(result);
  } catch (error) {
    console.error('getUserCount error:', error);
    return Response.json({
      totalUsers: 0,
      gatorCount: 0,
      parentCount: 0,
      spotsLeft: 1000,
      error: error.message
    }, { status: 500 });
  }
});