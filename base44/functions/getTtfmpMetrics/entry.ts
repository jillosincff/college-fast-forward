import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Admin-only TTFMP metrics: median, % under 10 min, conversion, distribution,
// first-action breakdown, tracked vs backfilled — with a school cohort filter.

const median = (arr) => {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    const isAdmin = me && (me.role === 'admin' || (me.roles || []).includes('admin'));
    if (!isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 });
    const { school = 'all' } = await req.json().catch(() => ({}));

    // Student accounts only ('gator' is the legacy student persona); exclude admins & flagged test accounts
    const [students, gators] = await Promise.all([
      base44.asServiceRole.entities.User.filter({ persona: 'student' }, '-created_date', 5000).catch(() => []),
      base44.asServiceRole.entities.User.filter({ persona: 'gator' }, '-created_date', 5000).catch(() => []),
    ]);
    let users = [...(students || []), ...(gators || [])].filter(u =>
      !u.exclude_from_analytics &&
      u.role !== 'admin' && !(u.roles || []).includes('admin')
    );

    // School cohorts — hide comparisons for tiny cohorts (min 10 students, privacy)
    const schoolCounts = {};
    for (const u of users) {
      const sc = (u.school_code || '').toUpperCase();
      if (sc) schoolCounts[sc] = (schoolCounts[sc] || 0) + 1;
    }
    const schools = Object.entries(schoolCounts).filter(([, n]) => n >= 10).map(([code, n]) => ({ code, count: n })).sort((a, b) => b.count - a.count);

    if (school && school !== 'all') {
      users = users.filter(u => (u.school_code || '').toUpperCase() === school.toUpperCase());
    }

    const converted = users.filter(u => u.first_meaningful_progress_at && typeof u.ttfmp_seconds === 'number' && u.ttfmp_seconds >= 0);
    const noProgress = users.filter(u => !u.first_meaningful_progress_at);
    const secs = converted.map(u => u.ttfmp_seconds);

    // Distribution buckets — no-progress students stay their own group, never merged into >24h
    const buckets = [
      { label: 'Under 5 min', min: 0, max: 300 },
      { label: '5–10 min', min: 300, max: 600 },
      { label: '10–20 min', min: 600, max: 1200 },
      { label: '20–60 min', min: 1200, max: 3600 },
      { label: '1–24 hours', min: 3600, max: 86400 },
      { label: 'More than 24 hours', min: 86400, max: Infinity },
    ].map(b => {
      const count = secs.filter(s => s >= b.min && s < b.max).length;
      return { label: b.label, count, pct: users.length ? Math.round((count / users.length) * 100) : 0 };
    });
    buckets.push({ label: 'No meaningful progress yet', count: noProgress.length, pct: users.length ? Math.round((noProgress.length / users.length) * 100) : 0 });

    // First-action breakdown
    const byType = {};
    for (const u of converted) {
      const t = u.first_meaningful_progress_type || 'unknown';
      (byType[t] = byType[t] || []).push(u.ttfmp_seconds);
    }
    const breakdown = Object.entries(byType).map(([type, list]) => ({
      type,
      count: list.length,
      pct_of_converted: converted.length ? Math.round((list.length / converted.length) * 100) : 0,
      median_seconds: median(list),
      pct_under_10: Math.round((list.filter(s => s <= 600).length / list.length) * 100),
    })).sort((a, b) => b.count - a.count);

    const withEnough = breakdown.filter(b => b.count >= 3);
    const fastest = (withEnough.length ? withEnough : breakdown).sort((a, b) => (a.median_seconds ?? Infinity) - (b.median_seconds ?? Infinity))[0] || null;

    const daysSince = (u) => (Date.now() - new Date(u.created_date).getTime()) / 86400000;

    return Response.json({
      school,
      schools,
      eligible: users.length,
      converted: converted.length,
      conversion_rate: users.length ? Math.round((converted.length / users.length) * 100) : 0,
      median_ttfmp_seconds: median(secs),
      avg_ttfmp_seconds: secs.length ? Math.round(secs.reduce((a, b) => a + b, 0) / secs.length) : null,
      pct_under_10: users.length ? Math.round((converted.filter(u => u.ttfmp_seconds <= 600).length / users.length) * 100) : 0,
      pct_under_10_of_converted: converted.length ? Math.round((converted.filter(u => u.ttfmp_seconds <= 600).length / converted.length) * 100) : 0,
      no_progress: {
        count: noProgress.length,
        pct: users.length ? Math.round((noProgress.length / users.length) * 100) : 0,
        median_days_since_signup: median(noProgress.map(daysSince)),
      },
      distribution: buckets,
      breakdown,
      fastest_first_action: fastest,
      live_tracked: converted.filter(u => !u.ttfmp_backfilled).length,
      backfilled: converted.filter(u => u.ttfmp_backfilled).length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});