import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { student_id } = await req.json();
    if (student_id !== user.id) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const student = await base44.asServiceRole.entities.User.get(student_id);
    if (!student) return Response.json({ error: 'Student not found' }, { status: 404 });

    const careerGoals = student.career_goals || {};
    const industries = [
      ...(Array.isArray(careerGoals.target_industries) ? careerGoals.target_industries : []),
      ...(Array.isArray(student.target_industries) ? student.target_industries : []),
    ].filter(Boolean);
    const roles = [
      ...(Array.isArray(careerGoals.target_roles) ? careerGoals.target_roles : []),
      ...(Array.isArray(student.target_roles) ? student.target_roles : []),
    ].filter(Boolean);
    const location = careerGoals.location_preference || 'the US';

    if (!industries.length && !roles.length) {
      return Response.json({ companies: [], noGoals: true });
    }

    // Check cache (24h)
    const cachedAt = student.company_intel_cached_at;
    const cacheAge = cachedAt ? Date.now() - new Date(cachedAt).getTime() : Infinity;
    const cachedCompanies = student.company_intel_cache;

    let companies = [];

    if (cacheAge < ONE_DAY_MS && Array.isArray(cachedCompanies) && cachedCompanies.length > 0) {
      console.log('Using cached company intel:', cachedCompanies.length);
      companies = cachedCompanies;
    } else {
      // Generate personalized company list
      const generated = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Generate 12 real companies that actively hire for "${roles.join(', ')}" roles in "${industries.join(', ')}" in "${location}".

For each company return a JSON object with:
- name: string
- industry: string
- size: "startup" | "mid" | "large" | "enterprise"
- headquarters: "city, state"
- hiring_signal: "active" | "selective" | "freeze" | "unknown"
- known_for: 1 sentence why notable for this role/industry
- application_timeline: when they typically recruit (e.g. "August-October for summer internships")
- what_they_look_for: array of exactly 3 strings — specific, honest requirements for entry-level candidates
- entry_level_programs: string or null — named programs like rotational programs, analyst programs
- campus_recruiting: boolean

Real companies only. Honest hiring signals. Specific to this role and industry. Return a JSON array of 12 companies.`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            companies: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  industry: { type: 'string' },
                  size: { type: 'string' },
                  headquarters: { type: 'string' },
                  hiring_signal: { type: 'string' },
                  known_for: { type: 'string' },
                  application_timeline: { type: 'string' },
                  what_they_look_for: { type: 'array', items: { type: 'string' } },
                  entry_level_programs: { type: 'string' },
                  campus_recruiting: { type: 'boolean' },
                },
              },
            },
          },
        },
      });

      companies = generated?.companies || [];

      // Save to cache
      await base44.asServiceRole.entities.User.update(student_id, {
        company_intel_cache: companies,
        company_intel_cached_at: new Date().toISOString(),
      });
      console.log('Generated and cached company intel:', companies.length);
    }

    // Enrich with CFF network data
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 2000);
    const studentEmail = student.email?.toLowerCase() || '';

    const enriched = companies.map(company => {
      const nameLower = company.name.toLowerCase();

      const cffParents = allUsers.filter(u => {
        if (u.id === student_id) return false;
        if (u.email?.toLowerCase() === studentEmail) return false;
        if (u.show_in_directory === false) return false;
        const isParent = u.persona === 'parent' || u.roles?.includes('parent');
        if (!isParent) return false;
        const co = [u.company, u.current_company, u.employer].filter(Boolean);
        return co.some(c => c.toLowerCase().includes(nameLower) || nameLower.includes(c.toLowerCase().split(' ')[0]));
      });

      const warmLeadEntry = student.warm_leads_cache?.find(w =>
        w.company?.toLowerCase() === nameLower
      );
      const alumniCount = warmLeadEntry?.alumni_count || null;

      return {
        ...company,
        cff_parents: cffParents.slice(0, 5).map(p => ({
          id: p.id,
          full_name: p.full_name || '',
          job_title: p.job_title || p.current_role || '',
          school: p.school || '',
        })),
        cff_parent_count: cffParents.length,
        alumni_count: alumniCount,
        is_combo: cffParents.length > 0 && !!alumniCount,
      };
    });

    // Sort: combo > hiring signal > parent count
    const signalOrder = { active: 3, selective: 2, unknown: 1, freeze: 0 };
    enriched.sort((a, b) => {
      if (a.is_combo && !b.is_combo) return -1;
      if (!a.is_combo && b.is_combo) return 1;
      const sigDiff = (signalOrder[b.hiring_signal] || 0) - (signalOrder[a.hiring_signal] || 0);
      if (sigDiff !== 0) return sigDiff;
      return b.cff_parent_count - a.cff_parent_count;
    });

    return Response.json({
      companies: enriched,
      targetRoles: roles,
      targetIndustries: industries,
      cached: cacheAge < ONE_DAY_MS,
    });
  } catch (error) {
    console.error('getCompanyIntel error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});