import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const requestId = body.requestId;
    const currentCount = body.currentCount || 0;
    
    if (!requestId) {
      return Response.json({ error: 'Missing requestId' }, { status: 400 });
    }

    const newCount = currentCount + 1;

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