import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipientEmail } = await req.json();
    
    console.log('📊 Incrementing message count for recipient:', recipientEmail);
    
    // Find all active JobRequests created by this recipient
    const requests = await base44.asServiceRole.entities.JobRequest.filter({
      created_by: recipientEmail,
      status: 'active'
    });
    
    console.log(`Found ${requests.length} active requests for ${recipientEmail}`);
    
    // Increment messages_count for each request
    for (const request of requests) {
      const newCount = (request.messages_count || 0) + 1;
      await base44.asServiceRole.entities.JobRequest.update(request.id, {
        messages_count: newCount
      });
      console.log(`✅ Updated request ${request.id} - new count: ${newCount}`);
    }
    
    return Response.json({ 
      success: true, 
      updatedRequests: requests.length 
    });
    
  } catch (error) {
    console.error('❌ Error incrementing message count:', error);
    return Response.json({ 
      error: 'Failed to increment message count',
      details: error.message 
    }, { status: 500 });
  }
});