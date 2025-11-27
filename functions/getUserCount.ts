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
    
    // Count founding gators (first 1000 or has is_founding_gator flag)
    const foundingGators = allUsers.filter(u => 
      u.is_founding_gator === true || 
      (u.signup_order && u.signup_order <= 1000)
    );
    
    const result = {
      totalUsers: allUsers.length,
      gatorCount: gators.length,
      parentCount: parents.length,
      foundingGatorCount: foundingGators.length,
      spotsLeft: Math.max(0, 1000 - allUsers.length),
      isFoundingGatorAvailable: allUsers.length < 1000
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