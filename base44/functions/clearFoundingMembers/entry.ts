import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const isAdmin = user?.role === 'admin' || user?.roles?.includes('admin');
    if (!user || !isAdmin) {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);
    const flagged = allUsers.filter(u => u.is_founding_member === true);

    let updated = 0;
    const errors = [];
    const batch = flagged.slice(0, 120);
    for (const u of batch) {
      try {
        await base44.asServiceRole.entities.User.update(u.id, { is_founding_member: false });
        updated++;
      } catch (e) {
        errors.push({ email: u.email, error: e.message });
      }
      await new Promise(r => setTimeout(r, 400));
    }

    return Response.json({ flagged: flagged.length, updated, errors: errors.slice(0, 5) });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});