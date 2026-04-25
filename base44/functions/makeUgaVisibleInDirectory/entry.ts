import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);
    const ugaUsers = allUsers.filter(u => u.school_code === 'uga');

    let updated = 0;
    for (const u of ugaUsers) {
      if (u.visible_in_directory !== true) {
        await base44.asServiceRole.entities.User.update(u.id, { visible_in_directory: true });
        updated++;
      }
    }

    return Response.json({
      success: true,
      total: ugaUsers.length,
      updated,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});