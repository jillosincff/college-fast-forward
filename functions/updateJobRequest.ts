import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, updateData } = await req.json();

    if (!id || !updateData) {
      return Response.json({ error: 'Missing id or updateData' }, { status: 400 });
    }

    // Fetch the job request to verify ownership
    const jobRequests = await base44.asServiceRole.entities.JobRequest.filter({ id });
    
    if (!jobRequests || jobRequests.length === 0) {
      return Response.json({ error: 'Job request not found' }, { status: 404 });
    }

    const jobRequest = jobRequests[0];

    // Check if user owns this request (by created_by or poster_email)
    const isOwner = 
      (jobRequest.created_by && jobRequest.created_by !== 'anonymous' && jobRequest.created_by === user.email) ||
      jobRequest.poster_email === user.email ||
      user.role === 'admin';

    if (!isOwner) {
      return Response.json({ error: 'Permission denied - you can only edit your own questions' }, { status: 403 });
    }

    // Only allow updating specific fields
    const allowedFields = ['description', 'role', 'target_industry', 'target_company', 'status'];
    const sanitizedData = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        sanitizedData[field] = updateData[field];
      }
    }

    // Update using service role
    await base44.asServiceRole.entities.JobRequest.update(id, sanitizedData);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error updating job request:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});