import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const db = base44.asServiceRole.entities;

  // Pull last 48h of relevant events
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const [allEvents, recentUsers] = await Promise.all([
    db.AnalyticsEvent.list('-created_date', 2000),
    db.User.filter({ persona: 'student' }, '-created_date', 500),
  ]);

  const recent = allEvents.filter(e => e.created_date >= cutoff);

  // ── Helper ──────────────────────────────────────────────────────
  const count = (events, name) => events.filter(e => e.event_name === name).length;
  const countRecent = (name) => count(recent, name);
  const countAll = (name) => count(allEvents, name);

  // ── 1. Downsell Recovery Yield ───────────────────────────────────
  const exitIntentFired = countAll('exit_intent_triggered');
  const downsellShown   = countAll('downsell_modal_shown');
  const downsellConverted = countAll('downsell_converted');
  const downsellBounced = downsellShown - downsellConverted;
  const downsellYield = downsellShown > 0
    ? Math.round((downsellConverted / downsellShown) * 100)
    : null;

  // ── 2. K-Factor / Viral Coefficient ──────────────────────────────
  const referralLinkClicks  = countAll('referral_link_clicked');
  const referralSignups     = countAll('referral_signup_completed');
  const referralShares      = countAll('paywall_referral_share_clicked');
  const kFactor = referralShares > 0
    ? Math.round((referralSignups / referralShares) * 100) / 100
    : null;
  const viralLoop = referralSignups > 0 && referralShares > 0
    ? (referralSignups / referralShares * 3).toFixed(2) // 3 = target classmates per share
    : null;

  // ── 3. Bounce Horizon ────────────────────────────────────────────
  const paywallShown     = countAll('paywall_shown');
  const paywallConverted = countAll('paywall_converted');
  const paywallBounced   = paywallShown - paywallConverted - downsellConverted;
  const conversionRate   = paywallShown > 0
    ? Math.round((paywallConverted / paywallShown) * 100)
    : null;
  const overallConversionRate = paywallShown > 0
    ? Math.round(((paywallConverted + downsellConverted) / paywallShown) * 100)
    : null;

  // ── 4. Recent 48h funnel ─────────────────────────────────────────
  const recentFunnel = {
    paywall_shown:        countRecent('paywall_shown'),
    paywall_converted:    countRecent('paywall_converted'),
    downsell_shown:       countRecent('downsell_modal_shown'),
    downsell_converted:   countRecent('downsell_converted'),
    referral_shares:      countRecent('paywall_referral_share_clicked'),
    referral_signups:     countRecent('referral_signup_completed'),
    exit_intents:         countRecent('exit_intent_triggered'),
  };

  // ── 5. Hourly trend (last 24h) ───────────────────────────────────
  const now = Date.now();
  const hourlyBuckets = Array.from({ length: 24 }, (_, i) => {
    const bucketStart = new Date(now - (23 - i) * 60 * 60 * 1000);
    const bucketEnd   = new Date(now - (22 - i) * 60 * 60 * 1000);
    const label = bucketStart.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    const inBucket = allEvents.filter(e => {
      const t = new Date(e.created_date).getTime();
      return t >= bucketStart.getTime() && t < bucketEnd.getTime();
    });
    return {
      hour: label,
      paywall_shown:     count(inBucket, 'paywall_shown'),
      conversions:       count(inBucket, 'paywall_converted') + count(inBucket, 'downsell_converted'),
      referral_shares:   count(inBucket, 'paywall_referral_share_clicked'),
    };
  });

  // ── 6. New signups last 48h ───────────────────────────────────────
  const newSignups48h = recentUsers.filter(u => u.created_date >= cutoff).length;

  return Response.json({
    summary: {
      exitIntentFired,
      downsellShown,
      downsellConverted,
      downsellBounced,
      downsellYield,
      paywallShown,
      paywallConverted,
      paywallBounced,
      conversionRate,
      overallConversionRate,
      referralShares,
      referralSignups,
      referralLinkClicks,
      kFactor,
      viralLoop,
      newSignups48h,
    },
    recentFunnel,
    hourlyTrend: hourlyBuckets,
  });
});