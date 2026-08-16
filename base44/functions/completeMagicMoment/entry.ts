import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Marks the one-time free Magic Moment cycle as completed. Called by the
// Magic Moment page at the END of the cycle (after alumni + outreach), so the
// soft-wall gate blocks any further free use. Idempotent.
export default async function (req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    try {
      const plans = await base44.asServiceRole.entities.UserAccessPlan.filter({ user_id: user.id });
      const plan = plans?.[0];
      if (plan) {
        if (plan.magic_moment_status !== 'completed') {
          await base44.asServiceRole.entities.UserAccessPlan.update(plan.id, {
            magic_moment_status: 'completed',
            magic_moment_completed_at: new Date().toISOString(),
          });
        }
      } else {
        await base44.asServiceRole.entities.UserAccessPlan.create({
          user_id: user.id,
          user_email: user.email,
          plan: 'free',
          access_state: 'free',
          access_source: 'default_free',
          magic_moment_eligible: true,
          magic_moment_status: 'completed',
          magic_moment_completed_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      // best-effort — never fail the cycle over the plan write
    }
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}