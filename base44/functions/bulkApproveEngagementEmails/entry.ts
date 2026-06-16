import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const db = base44.asServiceRole.entities;
    const now = new Date().toISOString();
    let approved = 0;
    let skip = 0;
    const pageSize = 100;

    while (true) {
      const page = await db.EngagementEmail.filter(
        { status: 'pending_approval' },
        '-created_date',
        pageSize,
        skip
      );

      if (!page || page.length === 0) break;

      for (const record of page) {
        await db.EngagementEmail.update(record.id, {
          status: 'approved',
          approved_at: now,
          approved_by: 'owner',
        });
        approved++;
        await new Promise(res => setTimeout(res, 100));
      }

      if (page.length < pageSize) break;
      skip += pageSize;
    }

    return Response.json({ success: true, approved });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});