import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = Deno.env.get('SENDGRID_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'SENDGRID_API_KEY not set' }, { status: 500 });
    }

    // Get stats for the last 30 days
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const response = await fetch(
      `https://api.sendgrid.com/v3/stats?start_date=${startDate}&end_date=${endDate}&aggregated_by=day`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return Response.json({ error: `SendGrid API error: ${err}` }, { status: response.status });
    }

    const data = await response.json();

    // Aggregate totals across all days
    const totals = {
      requests: 0,
      delivered: 0,
      opens: 0,
      unique_opens: 0,
      clicks: 0,
      unique_clicks: 0,
      bounces: 0,
      spam_reports: 0,
      unsubscribes: 0,
    };

    const daily = data.map(day => {
      const s = day.stats[0]?.metrics || {};
      totals.requests += s.requests || 0;
      totals.delivered += s.delivered || 0;
      totals.opens += s.opens || 0;
      totals.unique_opens += s.unique_opens || 0;
      totals.clicks += s.clicks || 0;
      totals.unique_clicks += s.unique_clicks || 0;
      totals.bounces += s.bounces || 0;
      totals.spam_reports += s.spam_reports || 0;
      totals.unsubscribes += s.unsubscribes || 0;
      return { date: day.date, ...s };
    });

    const openRate = totals.delivered > 0
      ? Math.round((totals.unique_opens / totals.delivered) * 100)
      : null;
    const clickRate = totals.delivered > 0
      ? Math.round((totals.unique_clicks / totals.delivered) * 100)
      : null;
    const bounceRate = totals.requests > 0
      ? Math.round((totals.bounces / totals.requests) * 100)
      : null;

    return Response.json({ totals, daily, openRate, clickRate, bounceRate, startDate, endDate });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});