import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Returns the list of companies where parents in the student's school network work.
// No PII — just company names + counts, used for "warm path" signals on job cards.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const schoolCode = (user.school_code || '').toUpperCase();
    if (!schoolCode) return Response.json({ companies: [] });

    const parents = await base44.asServiceRole.entities.ParentNetworkProfile.filter({
      school_code: schoolCode,
      is_active: true,
    }).catch(() => []);

    const counts = {};
    for (const p of parents || []) {
      const name = (p.company_name || '').trim();
      if (!name) continue;
      const key = name.toLowerCase();
      if (!counts[key]) counts[key] = { company_name: name, count: 0 };
      counts[key].count += 1;
    }

    return Response.json({ companies: Object.values(counts) });
  } catch (error) {
    return Response.json({ companies: [], error: error.message }, { status: 500 });
  }
});