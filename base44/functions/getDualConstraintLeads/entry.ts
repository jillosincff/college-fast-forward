import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Find real job listings matching the user's role + location.
 * Alumni lookup is NOT done here — it's triggered separately when the user
 * clicks "Find Alumni" on a specific company card.
 */
Deno.serve(async (req) => {
  const EXA_API_KEY = Deno.env.get('EXA_API_KEY');
  if (!EXA_API_KEY) return Response.json({ success: false, error: 'EXA_API_KEY not set' }, { status: 500 });

  const JOB_BOARD_PATTERN = /indeed|linkedin|glassdoor|ziprecruiter|builtin|jobsearcher|jobright|monster|simplyhired|careerbuilder|snagajob|handshake|wayup|internships\.com|jobot|talentcom|joblist|jobcase/i;

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json().catch(() => ({}));

    const targetRole = payload.explicit_target_role || user.career_goals?.target_roles?.[0] || user.target_roles?.[0] || '';
    const targetIndustries = payload.explicit_target_industries || user.career_goals?.target_industries || user.target_industries || [];
    const userLocation = payload.target_location || user.career_goals?.location_preference || user.location || '';

    if (!targetRole && targetIndustries.length === 0) {
      return Response.json({ success: true, leads: [], reason: 'No career goals set' });
    }

    const roleQuery = targetRole || targetIndustries.slice(0, 2).join(' ');
    const locationCity = userLocation ? userLocation.split(',')[0].trim() : '';

    const jobSearchQuery = locationCity
      ? `${roleQuery} entry level junior jobs hiring ${locationCity}`
      : `${roleQuery} entry level junior jobs hiring`;

    console.log(`[DualConstraint] Searching jobs: "${jobSearchQuery}"`);

    const res = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: { 'x-api-key': EXA_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: jobSearchQuery,
        type: 'neural',
        numResults: 20,
        contents: { text: { maxCharacters: 400 } },
      }),
    });
    if (!res.ok) throw new Error(`Exa search failed: ${res.status}`);
    const jobData = await res.json();

    const jobResults = (jobData.results || []).filter(r =>
      r.url && r.title &&
      !/virginia tech|alumni association|university career/i.test(r.title) &&
      !/\.edu\//i.test(r.url) &&
      !JOB_BOARD_PATTERN.test(r.url) &&
      !JOB_BOARD_PATTERN.test(r.title)
    );

    console.log(`[DualConstraint] Found ${jobResults.length} job listings after filtering`);

    if (jobResults.length === 0) {
      return Response.json({ success: true, leads: [], reason: 'No job listings found' });
    }

    // Extract unique companies from job results
    const companyMap = new Map(); // companyName → job
    for (const r of jobResults) {
      const atMatch = r.title?.match(/\bat\s+([A-Z][A-Za-z0-9\s&.,'\-]{2,40}?)(?:\s*[|·\-]|\s*$)/);
      const dashMatch = r.title?.match(/^([A-Z][A-Za-z0-9\s&.,'\-]{2,40}?)\s*[-–|]/);
      let hostCompany = null;
      try {
        const host = new URL(r.url).hostname.replace(/^www\./, '').split('.')[0];
        if (host && host.length > 2 && !JOB_BOARD_PATTERN.test(host)) {
          hostCompany = host.charAt(0).toUpperCase() + host.slice(1);
        }
      } catch {}

      const company = atMatch?.[1]?.trim() || dashMatch?.[1]?.trim() || hostCompany;
      if (company && company.length > 1 && !companyMap.has(company) && !JOB_BOARD_PATTERN.test(company)) {
        companyMap.set(company, {
          title: r.title?.split(/[|·]/)[0]?.trim() || r.title,
          url: r.url,
          description: (r.text || '').slice(0, 300),
        });
      }
    }

    const leads = [...companyMap.entries()].slice(0, 10).map(([company, job]) => ({
      company,
      role: roleQuery,
      hasActiveJobs: true,
      activeJobs: [job],
      signalTier: 'silver',
      ctaType: 'find_alumni',
      leadTier: 'dual_constraint',
      source: 'dual_constraint_engine',
    }));

    console.log(`[DualConstraint] Returning ${leads.length} job leads`);
    return Response.json({ success: true, leads });

  } catch (e) {
    console.error('[getDualConstraintLeads] Error:', e.message);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
});