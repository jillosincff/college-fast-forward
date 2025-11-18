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
        // Get student info
        const allUsers = await base44.asServiceRole.entities.User.list();
        const student = allUsers.find(u => u.id === studentId);
        
        if (!student) continue;
        
        // Find student's active requests
        const studentRequests = await base44.asServiceRole.entities.JobRequest.filter({
          created_by: student.email,
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
          
          // Send email notification to student
          if (student.email) {
            try {
              await base44.asServiceRole.integrations.Core.SendEmail({
                to: student.email,
                from_name: 'College Fast Forward',
                subject: '⭐ Your Request Has Been Boosted!',
                body: `Hi ${student.full_name || 'there'},\n\nGreat news! Your parent just posted an opportunity, and your job request "${request.title || request.role}" has been boosted to the top of the feed for the next 14 days!\n\n🚀 What this means for you:\n• Your request will be pinned at the top with a ⭐ star badge\n• More parents and alumni will see your request\n• Higher chance of getting introductions and help\n\nThis boost expires on ${new Date(boostExpiresAt).toLocaleDateString()}.\n\nGood luck!\n\nThe College Fast Forward Team\nhttps://collegefastforward.com`
              });
            } catch (emailErr) {
              console.error(`Failed to send email to ${student.email}:`, emailErr);
            }
          }
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