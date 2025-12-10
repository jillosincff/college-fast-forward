import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
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
    
    const { requestId, actionType } = body;
    
    if (!requestId) {
      return Response.json({ error: 'Missing requestId' }, { status: 400 });
    }

    // Handle "like" action by creating ProfileLike record
    if (actionType === 'like') {
      try {
        // Check if user already liked this request
        const existingLikes = await base44.asServiceRole.entities.ProfileLike.filter({
          request_id: requestId,
          liker_email: user.email
        });

        if (existingLikes && existingLikes.length > 0) {
          return Response.json({ 
            success: false, 
            error: 'Already liked' 
          }, { status: 400 });
        }

        // Create the like record
        await base44.asServiceRole.entities.ProfileLike.create({
          request_id: requestId,
          liker_email: user.email
        });

        // Also increment the offers_count on JobRequest
        const currentRecord = await base44.asServiceRole.entities.JobRequest.get(requestId);
        const currentCount = currentRecord?.offers_count || 0;
        const newCount = currentCount + 1;

        await base44.asServiceRole.entities.JobRequest.update(requestId, { 
          offers_count: newCount 
        });

        return Response.json({ 
          success: true, 
          newCount
        });

      } catch (likeError) {
        return Response.json({ 
          success: false, 
          error: 'Failed to save like',
          details: likeError.message
        }, { status: 500 });
      }
    }

    // First fetch the current record to get actual count
    let currentRecord;
    try {
      currentRecord = await base44.asServiceRole.entities.JobRequest.get(requestId);
    } catch (fetchError) {
      return Response.json({ 
        success: false, 
        error: 'Failed to fetch record',
        details: fetchError.message
      }, { status: 404 });
    }

    const currentCount = currentRecord?.offers_count || 0;
    const newCount = currentCount + 1;

    // Update using service role to bypass RLS
    try {
      await base44.asServiceRole.entities.JobRequest.update(requestId, { 
        offers_count: newCount 
      });
    } catch (updateError) {
      return Response.json({ 
        success: false, 
        error: 'Failed to update record',
        details: updateError.message
      }, { status: 500 });
    }

    return Response.json({ 
      success: true, 
      newCount
    });

  } catch (error) {
    return Response.json({ 
      success: false,
      error: error.message
    }, { status: 500 });
  }
});