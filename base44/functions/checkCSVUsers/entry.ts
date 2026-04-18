import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const checks = [
      { name: 'Jamie Twersky (udel parent)', email: 'jetwersky@gmail.com' },
      { name: 'Brandon Schops (OSU parent)', email: 'cffosu@gmail.com' },
      { name: 'Arleen Goldenberg (FSU parent)', email: 'arleengoldenberg@gmail.com' },
    ];

    const results = await Promise.all(checks.map(async ({ name, email }) => {
      const found = await base44.asServiceRole.entities.User.filter({ email });
      return {
        name,
        email,
        status: found.length > 0 ? 'EXISTS' : 'NOT FOUND',
        school_code: found[0]?.school_code || null,
        school: found[0]?.school || null,
      };
    }));

    return Response.json({ results });

  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});