import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Seeds the Magic Moment test fixtures: known alumni at a fixture company for
// a given school, and a guaranteed zero-alumni company. Admin-only so the
// ParentNetworkProfile writes (admin-gated by RLS) succeed.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const schoolCode = (body.school_code || 'UF').toUpperCase();
    const alumniCompany = body.alumni_company || 'Meridian Labs';
    const zeroAlumniCompany = body.zero_alumni_company || 'Zyzzyx Test Corp';

    const domainFor = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 24) + '.test';
    const alumniDomain = domainFor(alumniCompany);
    const zeroDomain = domainFor(zeroAlumniCompany);

    // Guarantee the zero-alumni fixture has no network members
    try {
      await base44.asServiceRole.entities.ParentNetworkProfile.deleteMany({ company_domain: zeroDomain });
    } catch (e) {}

    // Upsert known alumni for the alumni fixture company
    const alumni = [
      { first_name: 'Maya', last_name: 'Chen', role_title: 'Senior Software Engineer', persona: 'alumni' },
      { first_name: 'Jordan', last_name: 'Pierce', role_title: 'Engineering Manager', persona: 'alumni' },
    ];
    let upserted = 0;
    for (const a of alumni) {
      const existing = await base44.asServiceRole.entities.ParentNetworkProfile.filter({
        company_domain: alumniDomain, first_name: a.first_name, last_name: a.last_name, school_code: schoolCode,
      });
      if (existing && existing.length) continue;
      await base44.asServiceRole.entities.ParentNetworkProfile.create({
        first_name: a.first_name, last_name: a.last_name,
        company_name: alumniCompany, company_domain: alumniDomain,
        role_title: a.role_title, school_code: schoolCode,
        persona: a.persona, is_active: true, help_scope: 'my_school_only',
      });
      upserted++;
    }

    return Response.json({
      success: true,
      school_code: schoolCode,
      alumni_company: alumniCompany,
      alumni_domain: alumniDomain,
      upserted,
      zero_alumni_company: zeroAlumniCompany,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}