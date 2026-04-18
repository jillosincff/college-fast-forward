import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const users = await base44.asServiceRole.entities.User.list('-created_date', 5000);

    const codes = [...new Set(users.map(u => u.school_code).filter(Boolean))];
    console.log('All school codes:', codes);

    const breakdown = {};
    codes.forEach(code => {
      breakdown[code] = users.filter(u => u.school_code === code).length;
      console.log(`${code}: ${breakdown[code]} users`);
    });

    const noCode = users.filter(u => !u.school_code).length;
    console.log(`No school_code: ${noCode} users`);

    return Response.json({ codes, breakdown, noCode, total: users.length });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});