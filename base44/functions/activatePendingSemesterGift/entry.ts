import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Signup check: a parent may have paid the School Year gift before the
// student had an account. The webhook wrote a PendingSemesterGift row. On the
// student's first authenticated load (wired from AuthContext), this activates
// their Pro through May 31, 2027. Idempotent — safe to call every login.

const FALL_SEMESTER_ENDS_AT = '2027-05-31T23:59:00-04:00'; // America/New_York (EDT)

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const studentEmail = (user.email || '').trim().toLowerCase();
    if (!studentEmail) return Response.json({ error: 'no email' }, { status: 400 });

    const pendings = await base44.asServiceRole.entities.PendingSemesterGift
      .filter({ student_email: studentEmail, status: 'pending' })
      .catch((e) => { console.error('[activatePendingSemesterGift] lookup failed:', e.message); return []; });
    if (!pendings?.length) return Response.json({ activated: false, reason: 'none' });

    // Newest first.
    const gift = pendings.sort((a, b) => (b.created_date || '').localeCompare(a.created_date || ''))[0];

    // If the student already has active paid Pro, just retire the pending row.
    if (user.subscription_status === 'active' && user.stripe_subscription_id) {
      await base44.asServiceRole.entities.PendingSemesterGift.update(gift.id, {
        status: 'activated', activated_at: new Date().toISOString(),
      }).catch((e) => console.error('[activatePendingSemesterGift] retire failed:', e.message));
      return Response.json({ activated: false, reason: 'already_pro' });
    }

    // Turn on Pro.
    try {
      await base44.asServiceRole.entities.User.update(user.id, {
        subscription_status: 'active',
        subscription_tier: 'cff',
        membership_tier: 'cff',
        fastiq_active: true,
        is_fastiq: true,
        gifted_by_parent_email: gift.parent_email || '',
        linked_parent_name: gift.parent_name?.split(' ')[0] || 'Your parent',
      });
    } catch (e) {
      console.error('[activatePendingSemesterGift] user update failed:', e.message);
      return Response.json({ error: e.message }, { status: 500 });
    }

    // UserAccessPlan upsert — source marks it as a semester gift so the daily
    // downgrade can expire it on May 31, 2027.
    try {
      const existing = await base44.asServiceRole.entities.UserAccessPlan.filter({ user_id: user.id });
      const fields = {
        plan: 'pro',
        access_state: 'pro_active',
        access_source: 'parent_gift_semester',
        paid_period_ends_at: gift.expires_at || FALL_SEMESTER_ENDS_AT,
      };
      if (existing?.length) {
        await base44.asServiceRole.entities.UserAccessPlan.update(existing[0].id, fields);
      } else {
        await base44.asServiceRole.entities.UserAccessPlan.create({ user_id: user.id, user_email: user.email, ...fields });
      }
    } catch (e) { console.error('[activatePendingSemesterGift] access plan upsert failed:', e.message); }

    await base44.asServiceRole.entities.PendingSemesterGift.update(gift.id, {
      status: 'activated', activated_at: new Date().toISOString(),
    }).catch((e) => console.error('[activatePendingSemesterGift] pending update failed:', e.message));

    return Response.json({ activated: true });
  } catch (e) {
    console.error('activatePendingSemesterGift error:', e.message);
    return Response.json({ error: e.message }, { status: 500 });
  }
}