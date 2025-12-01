import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { requestId } = await req.json();
    
    if (!requestId) {
      return Response.json({ error: 'Missing requestId' }, { status: 400 });
    }

    // Get current request using service role
    const requests = await base44.asServiceRole.entities.JobRequest.filter({ id: requestId });
    
    if (!requests || requests.length === 0) {
      return Response.json({ error: 'Request not found' }, { status: 404 });
    }

    const currentRequest = requests[0];
    const newCount = (currentRequest.offers_count || 0) + 1;

    // Update using service role to bypass RLS
    await base44.asServiceRole.entities.JobRequest.update(requestId, { 
      offers_count: newCount 
    });

    return Response.json({ 
      success: true, 
      newCount,
      message: 'Offer count incremented successfully'
    });

  } catch (error) {
    console.error('Error incrementing offer count:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});