import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Cron job to expire old boosts
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all boosted requests
    const allRequests = await base44.asServiceRole.entities.JobRequest.list();
    const now = new Date();
    
    let expiredCount = 0;
    
    for (const request of allRequests) {
      if (request.is_boosted && request.boost_expires_at) {
        const expiresAt = new Date(request.boost_expires_at);
        
        if (expiresAt < now) {
          await base44.asServiceRole.entities.JobRequest.update(request.id, {
            is_boosted: false,
            priority_score: 0
          });
          expiredCount++;
        }
      }
    }
    
    return Response.json({
      success: true,
      expiredCount,
      timestamp: now.toISOString()
    });
    
  } catch (error) {
    console.error('Expire boosts error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});