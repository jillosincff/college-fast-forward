import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    
    const requestId = body.requestId;
    const currentCount = body.currentCount || 0;
    
    if (!requestId) {
      return Response.json({ error: 'Missing requestId' }, { status: 400 });
    }

    const newCount = currentCount + 1;

    // Update using service role to bypass RLS
    const result = await base44.asServiceRole.entities.JobRequest.update(requestId, { 
      offers_count: newCount 
    });

    return Response.json({ 
      success: true, 
      newCount,
      result
    });

  } catch (error) {
    // Return detailed error for debugging
    return Response.json({ 
      error: error.message,
      stack: error.stack,
      name: error.name
    }, { status: 500 });
  }
});