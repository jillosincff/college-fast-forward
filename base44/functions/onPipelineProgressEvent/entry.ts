import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Entity-automation handler for NetworkingPipeline changes.
// Catches meaningful completions no matter which feature triggered them:
// - status → 'applied'                → application_submitted
// - status → 'reached_out'/'messaged' → outreach_sent
// Idempotent via the same event_key scheme as logMeaningfulEvent.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    let data = payload.data;
    if (!data && payload.payload_too_large && payload.event?.entity_id) {
      data = await base44.asServiceRole.entities.NetworkingPipeline.get(payload.event.entity_id).catch(() => null);
    }
    if (!data?.user_email) return Response.json({ ok: true, skipped: 'no_data' });

    const oldStatus = payload.old_data?.status || '';
    const status = data.status || '';
    if (status === oldStatus) return Response.json({ ok: true, skipped: 'no_status_change' });

    let event_name = null;
    if (status === 'applied') event_name = 'application_submitted';
    else if (['reached_out', 'messaged'].includes(status)) event_name = 'outreach_sent';
    if (!event_name) return Response.json({ ok: true, skipped: 'not_meaningful' });

    const users = await base44.asServiceRole.entities.User.filter({ email: data.user_email });
    const user = users?.[0];
    if (!user || !['student', 'gator'].includes(user.persona)) return Response.json({ ok: true, skipped: 'non_student' });

    const event_key = `${user.id}|${event_name}|${data.id || 'none'}`;
    const existing = await base44.asServiceRole.entities.StudentAnalyticsEvent.filter({ event_key });
    if (existing?.length) return Response.json({ ok: true, duplicate: true });

    const now = new Date().toISOString();
    const event = await base44.asServiceRole.entities.StudentAnalyticsEvent.create({
      student_id: user.id, user_email: user.email,
      event_name, event_key, event_timestamp: now,
      related_record_id: data.id || '', company_name: data.company || '',
      source_feature: 'Application Tracker', delivery_channel: 'Manually Confirmed',
      metadata: { status }, is_meaningful_progress: true, historically_backfilled: false,
    });

    if (!user.first_meaningful_progress_at) {
      const seconds = Math.max(0, Math.round((new Date(now).getTime() - new Date(user.created_date).getTime()) / 1000));
      await base44.asServiceRole.entities.User.update(user.id, {
        first_meaningful_progress_at: now,
        first_meaningful_progress_type: event_name,
        first_meaningful_progress_event_id: event.id,
        ttfmp_seconds: seconds,
        ttfmp_under_10_minutes: seconds <= 600,
        ttfmp_backfilled: false,
      });
    }
    return Response.json({ ok: true, event_id: event.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});