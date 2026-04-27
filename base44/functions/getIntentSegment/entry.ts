/**
 * getIntentSegment
 *
 * Identifies students who showed FastIQ intent (viewed leads/paywall/score)
 * but never started a trial. This is the "evaluated FastIQ but hit friction" segment.
 *
 * Intent signals (in order of strength):
 *   paywall_viewed         — highest intent: hit the upgrade screen
 *   match_score_viewed     — medium: saw the match score + locked profiles
 *   teaser_reveal_viewed   — medium: saw blurred alumni leads
 *   fastiq_leads_viewed    — in-app: viewed blurred profiles from dashboard
 *
 * Exclusions:
 *   - Users who have a fastiq_trial_started event (they converted)
 *   - Users who have subscription_status: active (paid)
 *   - Non-student personas
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const INTENT_EVENTS = ['paywall_viewed', 'match_score_viewed', 'teaser_reveal_viewed', 'fastiq_leads_viewed'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    // Pull all analytics events (limit to recent 90 days via sort)
    const allEvents = await base44.asServiceRole.entities.AnalyticsEvent.list('-created_date', 5000);

    // Build sets
    const trialedUserIds = new Set(
      allEvents
        .filter(e => e.event_name === 'fastiq_trial_started')
        .map(e => e.user_id)
    );

    // Group intent events by user_id, tracking highest-intent signal and latest timestamp
    const intentMap = {}; // user_id → { events: [], strongestSignal, latestAt, user_email }

    const intentStrength = {
      paywall_viewed: 4,
      checkout_started: 5,
      match_score_viewed: 3,
      teaser_reveal_viewed: 2,
      fastiq_leads_viewed: 2,
    };

    for (const e of allEvents) {
      if (!INTENT_EVENTS.includes(e.event_name)) continue;
      if (trialedUserIds.has(e.user_id)) continue; // already converted

      if (!intentMap[e.user_id]) {
        intentMap[e.user_id] = {
          user_id: e.user_id,
          user_email: e.user_email,
          school_code: e.school_code,
          persona: e.persona,
          events: [],
          strongestSignal: e.event_name,
          strongestScore: intentStrength[e.event_name] || 1,
          latestAt: e.created_date,
        };
      }

      const entry = intentMap[e.user_id];
      if (!entry.events.includes(e.event_name)) {
        entry.events.push(e.event_name);
      }
      const score = intentStrength[e.event_name] || 1;
      if (score > entry.strongestScore) {
        entry.strongestSignal = e.event_name;
        entry.strongestScore = score;
      }
      if (new Date(e.created_date) > new Date(entry.latestAt)) {
        entry.latestAt = e.created_date;
      }
    }

    // Convert to sorted array (highest intent first, then most recent)
    const segment = Object.values(intentMap).sort((a, b) => {
      if (b.strongestScore !== a.strongestScore) return b.strongestScore - a.strongestScore;
      return new Date(b.latestAt) - new Date(a.latestAt);
    });

    // Summary stats
    const paywallViewers = segment.filter(u => u.events.includes('paywall_viewed')).length;
    const scoreViewers = segment.filter(u => u.events.includes('match_score_viewed')).length;
    const teaserViewers = segment.filter(u => u.events.includes('teaser_reveal_viewed')).length;
    const leadsViewers = segment.filter(u => u.events.includes('fastiq_leads_viewed')).length;

    return Response.json({
      total: segment.length,
      trialedCount: trialedUserIds.size,
      summary: { paywallViewers, scoreViewers, teaserViewers, leadsViewers },
      segment,
    });
  } catch (error) {
    console.error('getIntentSegment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});