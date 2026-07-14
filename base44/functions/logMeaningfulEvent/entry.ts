import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// The ONE shared logger for meaningful-progress events (TTFMP).
// Idempotent: student_id + event_name + related_record_id — a completed action
// is never counted twice (double clicks, refreshes, reopened screens).
// The first eligible event permanently stamps the student's TTFMP.

const ELIGIBLE = [
  'tailored_resume_completed',
  'application_submitted',
  'outreach_sent',
  'interview_practice_completed',
  'follow_up_sent',
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const { event_name, related_record_id = '', company_name = '', source_feature = '', delivery_channel = '', metadata = {} } = body;

    if (!ELIGIBLE.includes(event_name)) {
      return Response.json({ error: 'Not an eligible meaningful-progress event' }, { status: 400 });
    }
    // Only student accounts run a TTFMP clock ('gator' is the legacy student persona)
    if (!['student', 'gator'].includes(user.persona)) {
      return Response.json({ ok: true, skipped: 'non_student' });
    }

    const event_key = `${user.id}|${event_name}|${related_record_id || 'none'}`;
    const existing = await base44.asServiceRole.entities.StudentAnalyticsEvent.filter({ event_key });
    if (existing?.length) return Response.json({ ok: true, duplicate: true, event_id: existing[0].id });

    const now = new Date().toISOString();
    const event = await base44.asServiceRole.entities.StudentAnalyticsEvent.create({
      student_id: user.id,
      user_email: user.email,
      event_name,
      event_key,
      event_timestamp: now,
      related_record_id,
      company_name,
      source_feature,
      delivery_channel,
      metadata,
      is_meaningful_progress: true,
      historically_backfilled: false,
    });

    // First meaningful progress is permanent — never overwritten by later events
    let firstProgress = false;
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
      firstProgress = true;
    }

    return Response.json({ ok: true, event_id: event.id, first_progress: firstProgress });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});