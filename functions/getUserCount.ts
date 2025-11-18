import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Use service role to get all users
    const users = await base44.asServiceRole.entities.User.list();
    
    // Count students (gators)
    const students = users.filter(u => 
      u.persona === 'gator' || 
      u.roles?.includes('gator') || 
      u.email?.toLowerCase().endsWith('@ufl.edu')
    );
    
    console.log('✅ User count fetched successfully:', {
      totalUsers: users.length,
      totalStudents: students.length
    });
    
    return Response.json({
      success: true,
      count: users.length,
      studentCount: students.length,
      spotsLeft: Math.max(0, 1000 - users.length)
    });
  } catch (error) {
    console.error('❌ Error fetching user count:', error);
    return Response.json({
      success: false,
      error: error.message,
      count: 150, // Fallback
      studentCount: 0,
      spotsLeft: 850
    }, { status: 500 });
  }
});