import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { targetFunctions, targetRoles, location, schoolName = 'University of Florida' } = await req.json();

    const FUNCTION_TO_TITLES = {
      'Marketing & Brand': ['Social Media Manager', 'Content Strategist', 'Brand Manager', 'Marketing Manager'],
      'Sales & Business Development': ['Account Executive', 'Business Development Rep', 'Sales Manager'],
      'Finance & Accounting': ['Financial Analyst', 'Accountant', 'Investment Analyst'],
      'Software Engineering': ['Software Engineer', 'Frontend Engineer', 'Full Stack Developer'],
      'Product Management': ['Product Manager', 'Associate Product Manager'],
      'Operations & Strategy': ['Operations Manager', 'Strategy Analyst', 'Chief of Staff'],
      'Data & Analytics': ['Data Analyst', 'Business Intelligence Analyst', 'Data Scientist'],
      'Consulting / Advisory': ['Consultant', 'Associate Consultant', 'Strategy Consultant'],
    };

    const results = [];

    for (const fn of targetFunctions || []) {
      const titles = FUNCTION_TO_TITLES[fn] || targetRoles || [];
      if (!titles.length) continue;

      try {
        const proxycurlRes = await base44.asServiceRole.functions.invoke('proxycurlService', {
          action: 'getAlumniByRole',
          params: {
            jobTitle: titles[0],
            universityName: schoolName,
            location: location || null,
            maxResults: 3,
          },
        });

        if (proxycurlRes?.profiles?.length > 0) {
          results.push({
            cluster: fn,
            alumni: proxycurlRes.profiles.map(p => ({
              name: p.full_name,
              title: p.current_title,
              company: p.current_company,
              linkedin_url: p.linkedin_url,
              location: p.location,
              graduation_year: p.graduation_year,
            })),
          });
        }
      } catch (e) {
        console.warn(`[getAlumniByRole] Failed for ${fn}:`, e.message);
      }
    }

    return Response.json({ success: true, clusters: results });
  } catch (error) {
    console.error('[getAlumniByRole] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});