// Helper to fetch alumni clusters by target roles/functions
export async function getAlumniByRole(targetFunctions, targetRoles, location, universityName = 'University of Florida') {
  const FUNCTION_TO_TITLES = {
    'Marketing & Brand': ['Social Media Manager', 'Content Strategist', 'Brand Manager'],
    'Sales & Business Development': ['Account Executive', 'Business Development Representative', 'Sales Manager'],
    'Finance & Accounting': ['Financial Analyst', 'Accountant', 'Investment Analyst'],
    'Software Engineering': ['Software Engineer', 'Frontend Engineer', 'Full Stack Developer'],
    'Product Management': ['Product Manager', 'Associate Product Manager'],
    'Operations & Strategy': ['Operations Manager', 'Strategy Analyst', 'Chief of Staff'],
    'Data & Analytics': ['Data Analyst', 'Business Intelligence Analyst', 'Data Scientist'],
    'Consulting / Advisory': ['Consultant', 'Associate Consultant', 'Strategy Consultant'],
    'Human Resources': ['HR Generalist', 'Recruiter', 'Talent Acquisition Specialist'],
    'Consumer Goods & Retail': ['Buyer', 'Merchandise Planner', 'Category Manager'],
    'Media & Entertainment': ['Production Assistant', 'Media Planner', 'Content Producer'],
    'Logistics & Supply Chain': ['Supply Chain Analyst', 'Operations Coordinator', 'Logistics Manager'],
  };

  const results = [];
  const functionsToQuery = targetFunctions
    .filter(fn => FUNCTION_TO_TITLES[fn])
    .slice(0, 3);

  if (functionsToQuery.length === 0 && targetRoles?.length > 0) {
    functionsToQuery.push(targetRoles[0]);
  }

  for (const fn of functionsToQuery) {
    const titles = FUNCTION_TO_TITLES[fn] || [fn];
    try {
      const res = await fetch('/functions/proxycurlService', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getAlumniByRole',
          jobTitle: titles[0],
          universityName,
          location,
          maxResults: 3,
        }),
      });
      const data = await res.json();
      if (data.profiles?.length) {
        results.push({
          cluster: fn,
          alumni: data.profiles.map(p => ({
            name: p.full_name,
            title: p.current_title || p.headline,
            company: p.current_company,
            linkedin_url: p.linkedin_url,
            summary: p.summary?.slice(0, 120) || null,
          })),
        });
      }
    } catch (e) {
      // Skip cluster on failure
    }
  }

  return results;
}