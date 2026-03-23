import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

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
    
    const admins = allUsers.filter(u => 
      u.roles?.includes('admin')
    );
    
    const result = {
      totalUsers: allUsers.length,
      gatorCount: gators.length,
      parentCount: parents.length,
      adminCount: admins.length,
      spotsLeft: Math.max(0, 1000 - allUsers.length),
      sampleUsers: allUsers.slice(0, 3).map(u => ({
        email: u.email,
        persona: u.persona,
        roles: u.roles
      }))
    };
    
    return Response.json(result);
  } catch (error) {
    return Response.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});