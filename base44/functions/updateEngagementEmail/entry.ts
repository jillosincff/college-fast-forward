import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  const isAdmin = user?.role === 'admin' || user?.roles?.includes('admin');
  if (!user || !isAdmin) {
    return Response.json({ error: 'Admin only' }, { status: 403 });
  }

  const { id, updates } = await req.json();
  if (!id || !updates) {
    return Response.json({ error: 'id and updates required' }, { status: 400 });
  }

  await base44.asServiceRole.entities.EngagementEmail.update(id, updates);
  return Response.json({ success: true });
});