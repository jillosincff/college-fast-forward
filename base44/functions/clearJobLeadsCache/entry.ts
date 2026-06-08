import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Clear the job leads cache to force fresh data
    await base44.asServiceRole.entities.User.update(user.id, {
      job_leads_cache: [],
      job_leads_cached_at: null,
      job_leads_cache_key: null,
    });

    return Response.json({ 
      success: true, 
      message: 'Cache cleared. Next request will fetch fresh leads.'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});