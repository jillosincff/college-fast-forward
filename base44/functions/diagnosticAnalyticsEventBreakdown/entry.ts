import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SIXTY_DAYS_AGO = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch all AnalyticsEvent records from last 60 days
    const allEvents = await base44.asServiceRole.entities.AnalyticsEvent.list('-created_date', 10000);
    const recentEvents = allEvents.filter(e => new Date(e.created_date) >= new Date(SIXTY_DAYS_AGO));

    console.log(`[diagnosticAnalytics] Total events in last 60 days: ${recentEvents.length}`);

    // Group by event_name and count
    const eventBreakdown = {};
    recentEvents.forEach(e => {
      const eventName = e.event_name || 'unknown';
      eventBreakdown[eventName] = (eventBreakdown[eventName] || 0) + 1;
    });

    // Sort by count descending
    const sortedEvents = Object.entries(eventBreakdown)
      .map(([eventName, count]) => ({ event_name: eventName, count }))
      .sort((a, b) => b.count - a.count);

    console.log('[diagnosticAnalytics] Event breakdown:');
    sortedEvents.forEach(e => {
      console.log(`  ${e.event_name}: ${e.count}`);
    });

    // Sample 10 events across all types
    const samples = recentEvents.slice(0, 10).map(e => ({
      event_name: e.event_name,
      user_email: e.user_email,
      persona: e.persona,
      created_date: e.created_date,
    }));

    return Response.json({
      total_events_60d: recentEvents.length,
      unique_event_types: sortedEvents.length,
      event_breakdown: sortedEvents,
      sample_events: samples,
      expected_intent_events: ['paywall_viewed', 'teaser_reveal_viewed', 'match_score_viewed', 'fastiq_leads_viewed', 'alumni_search_used', 'checkout_started'],
      missing_expected: sortedEvents.filter(e => !['paywall_viewed', 'teaser_reveal_viewed', 'match_score_viewed', 'fastiq_leads_viewed', 'alumni_search_used', 'checkout_started'].includes(e.event_name)).map(e => e.event_name),
    });
  } catch (error) {
    console.error('[diagnosticAnalytics] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});