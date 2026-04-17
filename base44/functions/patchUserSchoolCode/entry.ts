import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { email, school_code } = await req.json();
    if (!email || !school_code) {
      return Response.json({ error: 'email and school_code are required' }, { status: 400 });
    }

    const users = await base44.asServiceRole.entities.User.filter({ email });
    if (!users || users.length === 0) {
      return Response.json({ error: `No user found with email: ${email}` }, { status: 404 });
    }

    const target = users[0];
    await base44.asServiceRole.entities.User.update(target.id, { school_code });

    return Response.json({ success: true, updated_user_id: target.id, email, school_code });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});