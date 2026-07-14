import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Classifies every existing user into a canonical UserAccessPlan BEFORE any
// gating is enforced. Idempotent: re-runs update records but never touch
// admin_override records. Never deletes or hides previously generated work.
function classify(u) {
  const out = {
    plan: 'free',
    access_state: 'free',
    access_source: 'default_free',
    grandfathered: false,
    grandfathered_notes: '',
    needs_review: false,
    review_reason: '',
  };
  const sub = (u.subscription_status || '').toLowerCase();

  if (u.role === 'admin') {
    out.plan = 'pro'; out.access_state = 'internal_test'; out.access_source = 'internal';
  } else if (sub === 'active') {
    out.plan = 'pro'; out.access_state = 'pro_active'; out.access_source = 'billing_provider';
  } else if (sub === 'past_due') {
    out.plan = 'pro'; out.access_state = 'payment_past_due'; out.access_source = 'billing_provider';
    out.needs_review = true; out.review_reason = 'Subscription past due — verify billing status';
  } else if (sub === 'canceled' || sub === 'cancelled') {
    out.plan = 'pro'; out.access_state = 'canceled_active_until_period_end'; out.access_source = 'billing_provider';
    out.needs_review = true; out.review_reason = 'Canceled subscription — verify period end date';
  } else if (u.is_founding_member === true) {
    out.plan = 'pro'; out.access_state = 'grandfathered'; out.access_source = 'grandfathered';
    out.grandfathered = true; out.grandfathered_notes = 'Founding member';
  } else if (u.membership_tier === 'fastiq' || u.fastiq_active === true || u.is_fastiq === true) {
    out.plan = 'pro'; out.access_state = 'pro_active'; out.access_source = 'legacy_subscription';
  } else if (u.trial_status === 'active' || u.fastiq_trial_active === true || u.membership_tier === 'fastiq_trial') {
    out.plan = 'pro'; out.access_state = 'trial_active'; out.access_source = 'legacy_subscription';
  } else if (u.fastiq_setup_complete && u.trial_status !== 'expired') {
    out.plan = 'pro'; out.access_state = 'grandfathered'; out.access_source = 'grandfathered';
    out.grandfathered = true; out.grandfathered_notes = 'Legacy fastiq_setup_complete flag';
  } else if (u.trial_status === 'expired') {
    out.plan = 'free'; out.access_state = 'expired'; out.access_source = 'legacy_subscription';
  }

  // Preserve trial/billing dates when present (field names vary across eras)
  const trialStart = u.trial_started_at || u.trial_start_date || null;
  const trialEnd = u.trial_ends_at || u.trial_end_date || u.trial_expires_at || null;
  if (trialStart) out.trial_started_at = trialStart;
  if (trialEnd) out.trial_ends_at = trialEnd;
  if (u.subscription_period_end || u.current_period_end) {
    out.paid_period_ends_at = u.subscription_period_end || u.current_period_end;
  }

  // Magic moment: only free students are eligible. Historical completion is
  // determined lazily at point-of-use from completed TailoredResume records
  // (reliable evidence), never guessed here from page views.
  const persona = u.persona || '';
  out.magic_moment_eligible = out.plan === 'free' && (!persona || persona === 'student' || persona === 'gator');
  out.exclude_upgrade_prompts = out.access_state === 'internal_test';

  return out;
}

function chunk(arr, size) {
  const res = [];
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
  return res;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const admin = await base44.auth.me();
    if (!admin || admin.role !== 'admin') {
      return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });
    }

    const { dryRun = false } = await req.json().catch(() => ({}));

    const users = await base44.asServiceRole.entities.User.list('-created_date', 5000);
    const existingPlans = await base44.asServiceRole.entities.UserAccessPlan.list('-created_date', 5000);
    const planByUser = {};
    for (const p of existingPlans) planByUser[p.user_id] = p;

    const summary = {
      evaluated: users.length,
      possiblyTruncated: users.length >= 5000,
      freeAssigned: 0,
      proAssigned: 0,
      trialsPreserved: 0,
      grandfathered: 0,
      adminOverridesPreserved: 0,
      internalTest: 0,
      needsReview: 0,
      reviewAccounts: [],
      created: 0,
      updated: 0,
      errors: [],
      dryRun,
    };

    const toCreate = [];
    const toUpdate = [];

    for (const u of users) {
      try {
        const existing = planByUser[u.id];
        // Never overwrite manual admin overrides
        if (existing && existing.access_source === 'admin_override') {
          summary.adminOverridesPreserved++;
          if (existing.plan === 'pro') summary.proAssigned++; else summary.freeAssigned++;
          continue;
        }

        const c = classify(u);
        if (c.plan === 'pro') summary.proAssigned++; else summary.freeAssigned++;
        if (c.access_state === 'trial_active') summary.trialsPreserved++;
        if (c.grandfathered) summary.grandfathered++;
        if (c.access_state === 'internal_test') summary.internalTest++;
        if (c.needs_review) {
          summary.needsReview++;
          if (summary.reviewAccounts.length < 50) {
            summary.reviewAccounts.push({ email: u.email, reason: c.review_reason });
          }
        }

        if (existing) {
          // Preserve magic-moment progress across re-runs
          toUpdate.push({ id: existing.id, ...c, magic_moment_eligible: existing.magic_moment_status === 'completed' ? existing.magic_moment_eligible : c.magic_moment_eligible });
        } else {
          toCreate.push({ user_id: u.id, user_email: u.email, magic_moment_status: 'available', ...c });
        }
      } catch (e) {
        summary.errors.push({ email: u.email, error: e.message });
      }
    }

    if (!dryRun) {
      for (const batch of chunk(toCreate, 200)) {
        await base44.asServiceRole.entities.UserAccessPlan.bulkCreate(batch);
        summary.created += batch.length;
      }
      for (const batch of chunk(toUpdate, 200)) {
        await base44.asServiceRole.entities.UserAccessPlan.bulkUpdate(batch);
        summary.updated += batch.length;
      }
    } else {
      summary.created = toCreate.length;
      summary.updated = toUpdate.length;
    }

    summary.gatingSafe = summary.errors.length === 0 && summary.needsReview === 0;
    return Response.json({ success: true, summary });
  } catch (error) {
    console.error('migrateAccessPlans error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});