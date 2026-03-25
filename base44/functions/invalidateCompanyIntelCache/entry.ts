import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin-only check
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { user_id } = await req.json();
    if (!user_id) return Response.json({ error: 'user_id required' }, { status: 400 });

    // Null out the cache timestamp to force fresh Firecrawl run
    await base44.asServiceRole.entities.User.update(user_id, {
      company_intel_cached_at: null,
      company_intel_cache: [],
    });

    return Response.json({
      success: true,
      message: `Company Intel cache invalidated for user ${user_id}. Next load will run fresh Firecrawl.`,
    });
  } catch (error) {
    console.error('invalidateCompanyIntelCache error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});