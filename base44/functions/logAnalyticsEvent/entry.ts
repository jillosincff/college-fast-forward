import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { event_name, properties = {} } = await req.json();

    if (!event_name) {
      return Response.json({ error: 'event_name required' }, { status: 400 });
    }

    await base44.asServiceRole.entities.AnalyticsEvent.create({
      event_name,
      user_id: user.id,
      user_email: user.email,
      school_code: user.school_name || user.school || user.university || '',
      persona: user.persona || '',
      properties,
    });

    return Response.json({ success: true });
  } catch (e) {
    console.error('Analytics error:', e.message);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
});