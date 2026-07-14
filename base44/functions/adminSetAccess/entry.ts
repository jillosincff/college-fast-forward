import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Admin access overrides. Every change writes an AccessAuditLog record and
// keeps the legacy User flags in sync so existing runtime checks stay correct.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const admin = await base44.auth.me();
    if (!admin || admin.role !== 'admin') {
      return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });
    }

    const { email, action, days, expires_at, exclude, reason = '', note = '' } = await req.json();
    if (!email || !action) return Response.json({ error: 'email and action are required' }, { status: 400 });

    const users = await base44.asServiceRole.entities.User.filter({ email });
    const target = users[0];
    if (!target) return Response.json({ error: 'User not found: ' + email }, { status: 404 });

    const plans = await base44.asServiceRole.entities.UserAccessPlan.filter({ user_id: target.id });
    let plan = plans[0] || null;

    if (action === 'lookup') {
      return Response.json({
        success: true,
        user: {
          id: target.id, email: target.email, full_name: target.full_name,
          persona: target.persona, subscription_status: target.subscription_status,
          membership_tier: target.membership_tier, trial_status: target.trial_status,
          fastiq_active: target.fastiq_active, is_founding_member: target.is_founding_member,
        },
        plan,
      });
    }

    if (!reason.trim()) return Response.json({ error: 'A reason is required for access overrides' }, { status: 400 });

    const nowIso = new Date().toISOString();
    const previous = plan ? { ...plan } : null;
    let planUpdates = { access_source: 'admin_override' };
    let userUpdates = null;

    switch (action) {
      case 'grant_pro':
        planUpdates = { ...planUpdates, plan: 'pro', access_state: 'admin_granted', override_ends_at: expires_at || null };
        userUpdates = { fastiq_active: true };
        break;
      case 'remove_pro':
        planUpdates = { ...planUpdates, plan: 'free', access_state: 'free', override_ends_at: null };
        userUpdates = { fastiq_active: false, is_fastiq: false, fastiq_trial_active: false, fastiq_setup_complete: false };
        break;
      case 'start_trial': {
        const trialDays = Number(days) || 7;
        const endsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString();
        planUpdates = { ...planUpdates, plan: 'pro', access_state: 'trial_active', trial_started_at: nowIso, trial_ends_at: endsAt };
        userUpdates = { trial_status: 'active', fastiq_trial_active: true };
        break;
      }
      case 'set_expiration':
        if (!expires_at) return Response.json({ error: 'expires_at is required' }, { status: 400 });
        planUpdates = { ...planUpdates, override_ends_at: expires_at };
        break;
      case 'mark_grandfathered':
        planUpdates = { ...planUpdates, plan: 'pro', access_state: 'grandfathered', grandfathered: true, grandfathered_notes: note || reason };
        userUpdates = { fastiq_active: true };
        break;
      case 'mark_internal':
        planUpdates = { ...planUpdates, plan: 'pro', access_state: 'internal_test', exclude_upgrade_prompts: true };
        userUpdates = { fastiq_active: true };
        break;
      case 'reset_magic_moment':
        planUpdates = {
          ...planUpdates,
          magic_moment_status: 'available', magic_moment_eligible: true,
          magic_moment_job_id: '', magic_moment_started_at: null, magic_moment_completed_at: null,
        };
        break;
      case 'set_exclude_prompts':
        planUpdates = { ...planUpdates, exclude_upgrade_prompts: exclude !== false };
        break;
      default:
        return Response.json({ error: 'Unknown action: ' + action }, { status: 400 });
    }

    if (plan) {
      plan = await base44.asServiceRole.entities.UserAccessPlan.update(plan.id, planUpdates);
    } else {
      plan = await base44.asServiceRole.entities.UserAccessPlan.create({
        user_id: target.id, user_email: target.email,
        plan: 'free', access_state: 'free',
        magic_moment_status: 'available',
        ...planUpdates,
      });
    }

    if (userUpdates) {
      await base44.asServiceRole.entities.User.update(target.id, userUpdates);
    }

    await base44.asServiceRole.entities.AccessAuditLog.create({
      admin_email: admin.email,
      user_id: target.id,
      user_email: target.email,
      action,
      previous_access: previous || {},
      new_access: plan,
      reason,
      note,
    });

    return Response.json({ success: true, plan });
  } catch (error) {
    console.error('adminSetAccess error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});