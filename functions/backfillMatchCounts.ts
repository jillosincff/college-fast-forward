import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only admins can run this backfill
    if (!user || !user.roles?.includes('admin')) {
      return Response.json({ error: 'Unauthorized - admin only' }, { status: 401 });
    }

    // Get all help requests
    const helpRequests = await base44.asServiceRole.entities.HelpRequest.filter(
      { status: 'active' }
    );

    const updates = [];
    const errors = [];

    for (const request of helpRequests) {
      try {
        // Count actual matches for this request
        const matches = await base44.asServiceRole.entities.Match.filter({
          help_request_id: request.id
        });
        
        const actualCount = matches.length;
        const currentCount = request.match_count || 0;
        
        // Only update if counts differ
        if (actualCount !== currentCount) {
          await base44.asServiceRole.entities.HelpRequest.update(request.id, {
            match_count: actualCount
          });
          
          updates.push({
            requestId: request.id,
            studentEmail: request.student_email,
            oldCount: currentCount,
            newCount: actualCount
          });
        }
      } catch (err) {
        errors.push({
          requestId: request.id,
          error: err.message
        });
      }
    }

    return Response.json({
      success: true,
      totalRequests: helpRequests.length,
      updated: updates.length,
      errors: errors.length,
      updates,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Backfill match counts error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});