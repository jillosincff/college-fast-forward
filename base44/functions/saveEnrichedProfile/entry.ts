import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { userId, profileData } = await req.json();
    if (!userId || !profileData) return Response.json({ error: 'userId and profileData required' }, { status: 400 });

    const updateData = {};
    if (profileData.current_title) updateData.job_title = profileData.current_title;
    if (profileData.current_company) updateData.current_company = profileData.current_company;
    if (profileData.industry) updateData.industry = profileData.industry;
    if (profileData.summary) updateData.bio = profileData.summary;
    if (profileData.profile_pic) updateData.profile_image_url = profileData.profile_pic;
    updateData.enriched_at = new Date().toISOString();
    updateData.enriched_via = 'proxycurl';

    await base44.asServiceRole.entities.User.update(userId, updateData);

    return Response.json({ success: true });
  } catch (error) {
    console.error('[saveEnrichedProfile] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});