import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Returns active parents in the student's OWN school network who work at the
// given company. School separation is strict: we only ever match parents whose
// school_code equals the student's uppercase school_code. Cheap query (a few
// hundred parents total), so it's safe to run on apply.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { companyName } = await req.json().catch(() => ({}));
    const schoolCode = (user.school_code || user.data?.school_code || '').toUpperCase();

    if (!schoolCode || !companyName) {
      return Response.json({ parents: [] });
    }

    const cleanTarget = companyName.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
    if (!cleanTarget) return Response.json({ parents: [] });

    const parents = await base44.asServiceRole.entities.ParentNetworkProfile.filter({
      school_code: schoolCode,
      is_active: true,
    }).catch(() => []);

    const matches = (parents || []).filter((p) => {
      const pc = (p.company_name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!pc) return false;
      return pc.includes(cleanTarget) || cleanTarget.includes(pc);
    });

    return Response.json({
      parents: matches.slice(0, 5).map((p) => ({
        name: [p.first_name, p.last_name].filter(Boolean).join(' '),
        role_title: p.role_title || null,
        company: p.company_name,
        linkedin_url: p.linkedin_url || null,
      })),
    });
  } catch (error) {
    return Response.json({ parents: [], error: error.message }, { status: 500 });
  }
});