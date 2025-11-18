import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    console.log('🔍 getUserCount: Starting user count fetch...');
    
    // Use service role to get all users
    const users = await base44.asServiceRole.entities.User.list();
    
    console.log('📊 getUserCount: Raw users data:', { 
      usersLength: users?.length,
      usersType: typeof users,
      isArray: Array.isArray(users),
      firstUser: users?.[0] ? {
        email: users[0].email,
        persona: users[0].persona,
        roles: users[0].roles
      } : null
    });
    
    // Count students (gators)
    const students = users.filter(u => 
      u.persona === 'gator' || 
      u.roles?.includes('gator') || 
      u.email?.toLowerCase().endsWith('@ufl.edu')
    );
    
    const result = {
      success: true,
      count: users.length,
      studentCount: students.length,
      spotsLeft: Math.max(0, 1000 - users.length)
    };
    
    console.log('✅ getUserCount: Returning result:', result);
    
    return Response.json(result);
  } catch (error) {
    console.error('❌ getUserCount error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return Response.json({
      success: false,
      error: error.message,
      count: 0,
      studentCount: 0,
      spotsLeft: 1000
    }, { status: 500 });
  }
});