/**
 * Entity automation: fires when a User record is updated.
 * Checks that any user who just completed onboarding has school_code populated.
 * If missing, logs a structured alert so the gap is surfaced immediately
 * rather than discovered later on the admin dashboard.
 *
 * Trigger conditions (set in automation):
 *   changed_fields contains "onboarding_completed"
 *   data.onboarding_completed equals true
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { data, old_data, event } = body;

    // Only care about onboarding just flipping to true
    const justCompleted =
      data?.onboarding_completed === true &&
      old_data?.onboarding_completed !== true;

    if (!justCompleted) {
      return Response.json({ skipped: true });
    }

    const schoolCode = data?.school_code?.trim();
    const persona = data?.persona || 'unknown';
    const email = data?.email || event?.entity_id || 'unknown';

    if (!schoolCode) {
      // Structured alert — visible in function logs and easy to grep
      console.error(JSON.stringify({
        alert: 'MISSING_SCHOOL_CODE_ON_ONBOARDING_COMPLETE',
        severity: 'HIGH',
        email,
        persona,
        school_name: data?.school_name || data?.school || null,
        entity_id: event?.entity_id,
        timestamp: new Date().toISOString(),
        message: `User ${email} (${persona}) completed onboarding without a school_code. school_name="${data?.school_name || data?.school || 'none'}". Manual review or backfill required.`,
      }));

      // Optionally store a flag for the admin dashboard to surface
      try {
        const base44 = createClientFromRequest(req);
        await base44.asServiceRole.entities.AnalyticsEvent.create({
          event_name: 'onboarding_missing_school_code',
          user_id: event?.entity_id || '',
          user_email: email,
          persona,
          properties: {
            school_name: data?.school_name || data?.school || null,
            onboarding_completed_at: data?.onboarding_completed_at || null,
          },
        });
      } catch (e) {
        // Non-blocking — the console.error above is the critical part
        console.warn('Could not write AnalyticsEvent alert:', e.message);
      }
    }

    return Response.json({ ok: true, had_school_code: !!schoolCode, email, persona });
  } catch (e) {
    console.error('validateOnboardingSchoolCode error:', e.message);
    return Response.json({ error: e.message }, { status: 500 });
  }
});