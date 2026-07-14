import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Server-side source of truth for free-tier metering.
// Credits are consumed only when the output completed successfully —
// callers invoke action:'consume' after success, action:'status' to check.
const FREE_LIMITS = {
  cliff_chat_basic: { limit: 5, period: 'week' },
  daily_job_recommendations: { limit: 3, period: 'day' },
  resume_tailor: { limit: 1, period: 'lifetime' },
  mock_interview_basic: { limit: 1, period: 'month' },
};

// Mirrors checkIsFastIQ — Pro users are never metered
function isPro(user) {
  if (
    user.subscription_status === 'active' ||
    user.membership_tier === 'fastiq' ||
    user.is_founding_member === true ||
    user.fastiq_active === true ||
    user.is_fastiq === true
  ) return true;
  if (
    user.trial_status === 'active' ||
    user.fastiq_trial_active === true ||
    user.membership_tier === 'fastiq_trial'
  ) return true;
  if (user.fastiq_setup_complete && user.trial_status !== 'expired') return true;
  return false;
}

function periodBounds(period) {
  const now = new Date();
  if (period === 'lifetime') {
    return { start: '1970-01-01T00:00:00.000Z', end: '9999-12-31T00:00:00.000Z' };
  }
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start);
  if (period === 'day') {
    end.setUTCDate(end.getUTCDate() + 1);
  } else if (period === 'week') {
    // Week starts Monday UTC
    const day = start.getUTCDay(); // 0=Sun
    const diff = day === 0 ? 6 : day - 1;
    start.setUTCDate(start.getUTCDate() - diff);
    end.setTime(start.getTime());
    end.setUTCDate(end.getUTCDate() + 7);
  } else {
    // month
    start.setUTCDate(1);
    end.setTime(start.getTime());
    end.setUTCMonth(end.getUTCMonth() + 1);
  }
  return { start: start.toISOString(), end: end.toISOString() };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action = 'status', capability } = await req.json().catch(() => ({}));
    const rule = FREE_LIMITS[capability];
    if (!rule) return Response.json({ error: 'Unknown metered capability: ' + capability }, { status: 400 });

    if (isPro(user)) {
      return Response.json({ allowed: true, unlimited: true, remaining: null, plan: 'pro' });
    }

    const { start, end } = periodBounds(rule.period);
    const records = await base44.asServiceRole.entities.FeatureUsage.filter({
      user_id: user.id,
      capability_name: capability,
      period_start: start,
    });
    const rec = records[0] || null;
    const used = rec ? rec.usage_count || 0 : 0;
    const remaining = Math.max(rule.limit - used, 0);
    const base = { limit: rule.limit, period: rule.period, plan: 'free' };

    if (action === 'status') {
      return Response.json({ ...base, allowed: remaining > 0, remaining });
    }

    // consume
    if (remaining <= 0) {
      return Response.json({ ...base, allowed: false, remaining: 0 });
    }
    const nowIso = new Date().toISOString();
    if (rec) {
      await base44.asServiceRole.entities.FeatureUsage.update(rec.id, {
        usage_count: used + 1,
        lifetime_count: (rec.lifetime_count || 0) + 1,
        last_used_at: nowIso,
      });
    } else {
      await base44.asServiceRole.entities.FeatureUsage.create({
        user_id: user.id,
        user_email: user.email,
        capability_name: capability,
        usage_count: 1,
        period_type: rule.period,
        period_start: start,
        period_end: end,
        lifetime_count: 1,
        last_used_at: nowIso,
      });
    }
    return Response.json({ ...base, allowed: true, remaining: remaining - 1 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});