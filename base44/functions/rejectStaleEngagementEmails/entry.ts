import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  const isAdmin = user?.role === 'admin' || user?.roles?.includes('admin');
  if (!user || !isAdmin) {
    return Response.json({ error: 'Admin only' }, { status: 403 });
  }

  const { maxAgeDays = 2 } = await req.json().catch(() => ({}));

  const allPending = await base44.asServiceRole.entities.EngagementEmail.filter({ status: 'pending_approval' });
  const cutoff = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);

  let rejected = 0;
  for (const email of allPending) {
    if (new Date(email.created_date) < cutoff) {
      await base44.asServiceRole.entities.EngagementEmail.update(email.id, {
        status: 'rejected',
        rejected_reason: `Stale — queued more than ${maxAgeDays} days ago, re-queue on next agent run`,
      });
      rejected++;
    }
  }

  return Response.json({ success: true, rejected, total_pending: allPending.length });
});