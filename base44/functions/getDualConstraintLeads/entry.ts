import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Step 1: Find real job listings matching the user's role + location
 * Step 2: For each company found, search for alumni from the user's school
 */
Deno.serve(async (req) => {
  const EXA_API_KEY = Deno.env.get('EXA_API_KEY');
  if (!EXA_API_KEY) return Response.json({ success: false, error: 'EXA_API_KEY not set' }, { status: 500 });

  const exaFetch = async (body) => {
    const res = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: { 'x-api-key': EXA_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Exa search failed: ${res.status}`);
    return res.json();
  };

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json().catch(() => ({}));

    const targetRole = payload.explicit_target_role || user.career_goals?.target_roles?.[0] || user.target_roles?.[0] || '';
    const targetIndustries = payload.explicit_target_industries || user.career_goals?.target_industries || user.target_industries || [];
    const universityName = user.school_name || user.school || user.university || 'University of Florida';
    const userLocation = payload.target_location || user.career_goals?.location_preference || user.location || '';

    if (!targetRole && targetIndustries.length === 0) {
      return Response.json({ success: true, leads: [], reason: 'No career goals set' });
    }

    const roleQuery = targetRole || targetIndustries.slice(0, 2).join(' ');
    const locationCity = userLocation ? userLocation.split(',')[0].trim() : '';

    // ── STEP 1: Find actual job listings ──────────────────────────────────
    const jobSearchQuery = locationCity
      ? `${roleQuery} entry level junior jobs hiring ${locationCity}`
      : `${roleQuery} entry level junior jobs hiring`;

    console.log(`[DualConstraint] Searching jobs: "${jobSearchQuery}"`);

    const jobData = await exaFetch({
      query: jobSearchQuery,
      type: 'neural',
      numResults: 15,
      contents: { text: { maxCharacters: 400 } },
    });

    const jobResults = (jobData.results || []).filter(r =>
      r.url && r.title &&
      !/virginia tech|alumni association|university career/i.test(r.title) &&
      !/\.edu\//i.test(r.url)
    );

    console.log(`[DualConstraint] Found ${jobResults.length} job listings`);

    if (jobResults.length === 0) {
      return Response.json({ success: true, leads: [], reason: 'No job listings found' });
    }

    // Extract unique company names from job results
    const companySet = new Map(); // companyName → job
    jobResults.forEach(r => {
      // Title often looks like "Marketing Coordinator at Nike | LinkedIn" or "Nike - Marketing Analyst"
      const atMatch = r.title?.match(/\bat\s+([A-Z][A-Za-z0-9\s&.,'\-]{2,40}?)(?:\s*[|·\-]|\s*$)/);
      const dashMatch = r.title?.match(/^([A-Z][A-Za-z0-9\s&.,'\-]{2,40}?)\s*[-–|]/);
      // Also try extracting from URL hostname
      let hostCompany = null;
      try {
        const host = new URL(r.url).hostname.replace(/^www\./, '').split('.')[0];
        if (host && host.length > 2 && !/lever|greenhouse|workday|indeed|linkedin|glassdoor|ziprecruiter|builtin/i.test(host)) {
          hostCompany = host.charAt(0).toUpperCase() + host.slice(1);
        }
      } catch {}

      const company = atMatch?.[1]?.trim() || dashMatch?.[1]?.trim() || hostCompany;
      if (company && company.length > 1 && !companySet.has(company)) {
        companySet.set(company, {
          title: r.title?.split(/[|·]/)[0]?.trim() || r.title,
          url: r.url,
          description: (r.text || '').slice(0, 300),
        });
      }
    });

    const companies = [...companySet.entries()].slice(0, 8); // top 8 companies
    console.log(`[DualConstraint] Extracted companies: ${companies.map(([c]) => c).join(', ')}`);

    // ── STEP 2: For each company, find alumni from user's school ──────────
    const alumniResults = await Promise.all(
      companies.map(async ([companyName, job]) => {
        try {
          const alumniData = await exaFetch({
            query: `${universityName} alumni that works at ${companyName}`,
            type: 'neural',
            numResults: 5,
            includeDomains: ['linkedin.com'],
            contents: { text: { maxCharacters: 300 } },
          });

          const profiles = (alumniData.results || []).filter(r =>
            /linkedin\.com\/in\/[^/?]+/.test(r.url || '')
          );

          const insiders = profiles.slice(0, 3).map(p => {
            const namePart = (p.title || '').split(/[|\-·]/)[0].trim();
            return {
              name: namePart || 'Alumni',
              url: p.url,
              headline: p.title || '',
            };
          });

          return {
            company: companyName,
            job,
            alumniCount: profiles.length,
            insiders,
            hasAlumni: profiles.length > 0,
          };
        } catch {
          return { company: companyName, job, alumniCount: 0, insiders: [], hasAlumni: false };
        }
      })
    );

    // Sort: companies with alumni first, then by alumni count
    const leads = alumniResults
      .sort((a, b) => {
        if (a.hasAlumni && !b.hasAlumni) return -1;
        if (!a.hasAlumni && b.hasAlumni) return 1;
        return b.alumniCount - a.alumniCount;
      })
      .map(r => ({
        company: r.company,
        role: roleQuery,
        alumniCount: r.alumniCount,
        insiders: r.insiders,
        hasActiveJobs: true,
        activeJobs: [r.job],
        signalTier: r.hasAlumni ? 'gold' : 'silver',
        ctaType: 'add_to_pipeline',
        leadTier: 'dual_constraint',
        source: 'dual_constraint_engine',
      }));

    console.log(`[DualConstraint] Returning ${leads.length} leads (${leads.filter(l => l.alumniCount > 0).length} with alumni)`);
    return Response.json({ success: true, leads });

  } catch (e) {
    console.error('[getDualConstraintLeads] Error:', e.message);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
});