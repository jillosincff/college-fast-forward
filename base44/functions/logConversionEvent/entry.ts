import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Logs a canonical conversion-funnel event to the ConversionEvent table.
// Idempotent: one event per user per event_name (event_key = user_id:event_name).
// This is the single source of truth for the admin conversion funnel.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { event_name, trigger, company_name, job_title, metadata } = await req.json();
    if (!event_name) return Response.json({ error: 'event_name required' }, { status: 400 });

    const event_key = `${user.id}:${event_name}`;

    // Idempotency check — one-time steps are never double-counted
    const existing = await base44.asServiceRole.entities.ConversionEvent
      .filter({ event_key }).catch(() => []);
    if (existing?.length > 0) {
      return Response.json({ success: true, duplicate: true });
    }

    const ua = req.headers.get('user-agent') || '';
    const device = /Mobile|Android|iPhone/i.test(ua) ? 'mobile' : 'desktop';
    const school_code = user.school_name || user.school || user.school_code || '';
    const days_since_signup = user.created_date
      ? Math.floor((Date.now() - new Date(user.created_date).getTime()) / 86400000)
      : null;

    await base44.asServiceRole.entities.ConversionEvent.create({
      user_id: user.id,
      user_email: user.email,
      event_name,
      event_key,
      trigger: trigger || null,
      company_name: company_name || null,
      job_title: job_title || null,
      school_code,
      device,
      plan_at_event: user.membership_tier || user.subscription_tier || 'free',
      days_since_signup,
      metadata: metadata || {},
    });

    return Response.json({ success: true });
  } catch (e) {
    console.error('logConversionEvent error:', e.message);
    return Response.json({ error: e.message }, { status: 500 });
  }
});