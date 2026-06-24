import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Fields safe to expose on a public profile page.
const ALLOWED = [
  'id', 'full_name', 'persona', 'roles', 'bio', 'major', 'graduation_year', 'gpa',
  'company', 'job_title', 'industry', 'location_city', 'location_state',
  'linkedin_url', 'resume_url', 'email', 'profile_image_url', 'skills', 'interests',
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { slug } = await req.json().catch(() => ({}));
    if (!slug) {
      return Response.json({ error: 'No profile slug provided' }, { status: 400 });
    }

    const users = await base44.asServiceRole.entities.User.filter({ shareable_profile_slug: slug });
    if (!users || users.length === 0) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    const user = users[0];

    if (user.profile_visibility === 'private') {
      return Response.json({ error: 'This profile is private' }, { status: 403 });
    }

    if (user.profile_visibility === 'gators_only') {
      const currentUser = await base44.auth.me().catch(() => null);
      if (!currentUser) {
        return Response.json({ error: 'This profile is only visible to Gators. Please sign in.' }, { status: 403 });
      }
    }

    // Increment view count
    await base44.asServiceRole.entities.User.update(user.id, {
      profile_views: (user.profile_views || 0) + 1,
    }).catch(() => {});

    // Sanitize to allowlist
    const profile = {};
    for (const key of ALLOWED) {
      if (user[key] !== undefined) profile[key] = user[key];
    }

    return Response.json({ success: true, profile });
  } catch (error) {
    console.error('getPublicProfileBySlug error:', error);
    return Response.json({ error: 'Failed to load profile' }, { status: 500 });
  }
});