import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const limit = body.limit ?? 50;
    const db = base44.asServiceRole.entities;
    const now = new Date().toISOString();
    let approved = 0;

    // Fetch one extra to detect hasMore
    const page = await db.EngagementEmail.filter(
      { status: 'pending_approval' },
      'created_date',
      limit + 1
    );

    const hasMore = page.length > limit;
    const toProcess = page.slice(0, limit);

    for (const record of toProcess) {
      await db.EngagementEmail.update(record.id, {
        status: 'approved',
        approved_at: now,
        approved_by: 'owner',
      });
      approved++;
      await new Promise(res => setTimeout(res, 300));
    }

    return Response.json({ success: true, approved, hasMore });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});