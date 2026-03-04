import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { help_request_id } = await req.json();

    if (!help_request_id) {
      return Response.json({ 
        error: 'help_request_id is required' 
      }, { status: 400 });
    }

    // Get the help request
    const helpRequests = await base44.entities.HelpRequest.filter({ id: help_request_id });
    const helpRequest = helpRequests?.[0];
    
    if (!helpRequest) {
      return Response.json({ error: 'Help request not found' }, { status: 404 });
    }

    // Verify this request belongs to the authenticated student
    if (helpRequest.student_id !== user.id) {
      return Response.json({ 
        error: 'Unauthorized: This is not your help request' 
      }, { status: 403 });
    }

    // Check if already closed
    if (helpRequest.status === 'closed') {
      return Response.json({ 
        error: 'Help request is already closed' 
      }, { status: 400 });
    }

    // Close the help request
    await base44.entities.HelpRequest.update(help_request_id, { 
      status: 'closed'
    });

    // Get all matches for this request and mark them as passed
    const matches = await base44.asServiceRole.entities.Match.filter({ 
      help_request_id: help_request_id 
    });

    let matchesRemoved = 0;
    if (matches && matches.length > 0) {
      for (const match of matches) {
        if (match.status !== 'passed') {
          await base44.asServiceRole.entities.Match.update(match.id, { 
            status: 'passed' 
          });
          matchesRemoved++;
        }
      }
    }

    return Response.json({ 
      success: true,
      message: 'Help request closed successfully',
      helpRequestId: help_request_id,
      matchesRemoved: matchesRemoved
    });

  } catch (error) {
    console.error('Error closing help request:', error);
    return Response.json({ 
      error: 'Failed to close help request',
      details: error.message 
    }, { status: 500 });
  }
});