import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await req.json();

    if (!id) {
      return Response.json({ error: 'Missing id' }, { status: 400 });
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
      return Response.json({ error: 'Permission denied - you can only delete your own questions' }, { status: 403 });
    }

    // Delete using service role
    await base44.asServiceRole.entities.JobRequest.delete(id);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting job request:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});