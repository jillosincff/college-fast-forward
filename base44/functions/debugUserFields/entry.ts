import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;
    const users = await db.User.list();
    const sample = users.slice(0, 3).map((u) => {
      const fields = {};
      for (const k of Object.keys(u)) fields[k] = u[k];
      return fields;
    });
    return Response.json({ count: users.length, sample });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});