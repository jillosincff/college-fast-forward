import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only parents can trigger this
    if (user.persona !== 'parent' && !user.roles?.includes('parent')) {
      return Response.json({ error: 'Only parents can boost student requests' }, { status: 403 });
    }
    
    const { opportunityId } = await req.json();
    
    if (!opportunityId) {
      return Response.json({ error: 'Missing opportunityId' }, { status: 400 });
    }
    
    // Get linked students
    const linkedStudents = user.linked_students || [];
    
    if (linkedStudents.length === 0) {
      return Response.json({ 
        success: true, 
        boostedCount: 0,
        message: 'No linked students to boost' 
      });
    }
    
    // Calculate boost expiration (14 days from now)
    const boostExpiresAt = new Date();
    boostExpiresAt.setDate(boostExpiresAt.getDate() + 14);
    
    let boostedCount = 0;
    const boostedRequests = [];
    
    // Boost each linked student's active requests
    for (const studentId of linkedStudents) {
      try {
        // Find student's active requests
        const studentRequests = await base44.asServiceRole.entities.JobRequest.filter({
          created_by: studentId,
          status: 'active'
        });
        
        // Boost each active request
        for (const request of studentRequests) {
          await base44.asServiceRole.entities.JobRequest.update(request.id, {
            is_boosted: true,
            boost_expires_at: boostExpiresAt.toISOString(),
            priority_score: 999
          });
          
          boostedCount++;
          boostedRequests.push({
            requestId: request.id,
            studentId: studentId,
            title: request.title || request.role
          });
        }
      } catch (err) {
        console.error(`Error boosting requests for student ${studentId}:`, err);
      }
    }
    
    return Response.json({ 
      success: true,
      boostedCount,
      linkedStudentsCount: linkedStudents.length,
      boostedRequests,
      expiresAt: boostExpiresAt.toISOString()
    });
    
  } catch (error) {
    console.error('Boost error:', error);
    return Response.json({ 
      error: error.message || 'Failed to boost requests' 
    }, { status: 500 });
  }
});