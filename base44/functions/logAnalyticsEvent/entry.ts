import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event_name, properties = {}, anonymous_id } = await req.json();

    if (!event_name) {
      return Response.json({ error: 'event_name required' }, { status: 400 });
    }

    // Onboarding happens pre-auth for most students — allow anonymous events
    // when an anonymous_id is supplied, otherwise require a logged-in user.
    let user = null;
    try { user = await base44.auth.me(); } catch { user = null; }
    if (!user && !anonymous_id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await base44.asServiceRole.entities.AnalyticsEvent.create({
      event_name,
      user_id: user ? user.id : `anon_${String(anonymous_id).slice(0, 40)}`,
      user_email: user ? user.email : '',
      school_code: user ? (user.school_name || user.school || user.university || '') : (properties.school || ''),
      persona: user?.persona || undefined,
      properties,
    });

    return Response.json({ success: true });
  } catch (e) {
    console.error('Analytics error:', e.message);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
});