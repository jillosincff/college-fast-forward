import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Returns personalized job leads for a student.
 * Uses LLM with internet context for relevance, cached 24h per user.
 * Falls back to fresh generation if cache is stale or goals changed.
 */

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { career_goals = {}, force_refresh = false } = await req.json().catch(() => ({}));

    const role = career_goals.role
      || user.career_goals?.target_roles?.[0]
      || '';
    const industries = career_goals.industries
      || user.career_goals?.target_industries
      || [];
    const location = career_goals.locations?.[0]
      || user.career_goals?.location_preference
      || '';
    const companySizes = career_goals.company_size_preference
      || user.career_goals?.company_size_preference
      || [];

    if (!role && industries.length === 0) {
      return Response.json({ companies: [] });
    }

    // Cache key: hash of goals so stale cache is busted when goals change
    const goalKey = `${role}|${industries.join(',')}|${location}|${companySizes}`;
    const cached = user.job_leads_cache;
    const cachedAt = user.job_leads_cached_at;
    const cachedKey = user.job_leads_cache_key;
    const cacheAge = cachedAt ? Date.now() - new Date(cachedAt).getTime() : Infinity;
    const cacheValid = !force_refresh && cacheAge < CACHE_TTL_MS && cachedKey === goalKey && cached?.length > 0;

    if (cacheValid) {
      console.log(`[getLiveJobMatchesFn] Returning ${cached.length} cached leads (${Math.round(cacheAge / 60000)}m old)`);
      return Response.json({ companies: cached, from_cache: true });
    }

    // Build size preference description
    const sizeDesc = Array.isArray(companySizes) && companySizes.length > 0
      ? companySizes.join(', ')
      : 'any size';

    const locationDesc = location || 'anywhere in the US';
    const industryDesc = industries.length > 0 ? industries.join(', ') : 'any industry';
    const roleDesc = role || industries[0] || 'entry level';

    console.log(`[getLiveJobMatchesFn] Generating fresh leads for: ${roleDesc} in ${locationDesc}`);

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a job search assistant helping a college student find real, currently hiring companies.

Student's career goals:
- Target role: ${roleDesc}
- Industries: ${industryDesc}
- Location: ${locationDesc}
- Company size preference: ${sizeDesc}

Find 8 real COMPANIES (not job titles) that are actively hiring for entry-level or internship positions matching these goals RIGHT NOW.

CRITICAL: 
- "name" must be the COMPANY NAME (e.g. "Google", "Nike", "Miami HEAT") — NEVER a job title
- "job_title" is the specific role they're hiring for (e.g. "Marketing Intern", "Software Engineer I")
- Only include well-known, established companies

For each company return:
- name: COMPANY NAME ONLY (e.g. "Apple", "Tesla", "Publicis Groupe")
- job_title: Most relevant entry-level or intern job title
- hiring_description: 1-2 sentences describing the role and why it's a good fit
- hiring_signal: "hot" if very actively hiring, "warm" if hiring, "cool" if uncertain
- job_url: Direct URL to their careers page
- industry: Specific industry

Be specific and realistic. Only include real companies actually known to hire for these types of roles.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          companies: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'COMPANY NAME ONLY, not a job title' },
                job_title: { type: 'string' },
                hiring_description: { type: 'string' },
                hiring_signal: { type: 'string' },
                job_url: { type: 'string' },
                industry: { type: 'string' },
              },
              required: ['name', 'job_title', 'hiring_description']
            }
          }
        }
      }
    });

    const companies = (result?.companies || []).map(c => ({
      ...c,
      has_web_result: true,
    }));

    console.log(`[getLiveJobMatchesFn] Generated ${companies.length} fresh leads`);

    // Cache results on user record
    await base44.asServiceRole.entities.User.update(user.id, {
      job_leads_cache: companies,
      job_leads_cached_at: new Date().toISOString(),
      job_leads_cache_key: goalKey,
    });

    return Response.json({ companies, from_cache: false });

  } catch (error) {
    console.error('[getLiveJobMatchesFn] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});