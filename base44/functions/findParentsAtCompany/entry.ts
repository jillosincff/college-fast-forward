import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { canRunGated, SOFT_WALL_MESSAGE } from '../../shared/entitlements.ts';

// Returns active parents in the student's OWN school network who work at the
// given company. School separation is strict: we only ever match parents whose
// school_code equals the student's uppercase school_code. Cheap query (a few
// hundred parents total), so it's safe to run on apply.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { companyName, magic_moment } = await req.json().catch(() => ({}));

    // Soft wall: surfacing people at a target company is a Pro feature (free only during the Magic Moment).
    if (!(await canRunGated(base44, user, magic_moment))) {
      return Response.json({ parents: [], upgrade_required: true, message: SOFT_WALL_MESSAGE });
    }

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
        persona: p.persona || 'parent',
      })),
    });
  } catch (error) {
    return Response.json({ parents: [], error: error.message }, { status: 500 });
  }
});