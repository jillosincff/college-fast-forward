import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Agent Guardrail Validation - Inline
 * Enforces Identity, Target Matching, and Link Resolution rules
 */
function validateAgentLeadIntegrity(lead, userGoals = {}) {
  const company = (lead.company || lead.companyName || lead.company_name || '').trim();
  const jobTitle = (lead.job_title || lead.role || lead.title || '').trim();
  const location = (lead.location || lead.job_location || '').toLowerCase();
  const linkedinUrl = lead.linkedin_url || lead.company_linkedin || '';
  const companyDomain = lead.domain || lead.company_domain || '';

  const lowerCompany = company.toLowerCase();
  const lowerTitle = jobTitle.toLowerCase();

  // Identity Check
  if (!company || company.length < 3) return false;
  if (lowerCompany === lowerTitle) return false;

  const jobTitleKeywords = ['intern', 'junior', 'senior', 'manager', 'director', 'coordinator', 'specialist', 'analyst', 'assistant', 'executive', 'lead', 'head', 'vp', 'chief', 'officer', 'engineer', 'developer', 'designer', 'consultant', 'associate', 'representative', 'account', 'administrator', 'supervisor', 'technician', 'scout', 'talent', 'recruiter', 'partner', 'strategist', 'operator', 'fellow', 'researcher', 'scientist', 'advisor'];
  const businessSuffixes = ['inc', 'llc', 'corp', 'company', 'co', 'ltd', 'group', 'partners', 'associates', 'solutions', 'systems', 'services', 'ventures', 'capital', 'agency', 'firm'];
  const hasValidSuffix = businessSuffixes.some(suffix => new RegExp(`\\b${suffix}\\b`, 'i').test(lowerCompany));
  if (!hasValidSuffix && jobTitleKeywords.some(keyword => lowerCompany.includes(keyword))) return false;

  // Ghost patterns
  const ghostPatterns = ['capsule', 'goodwin', 'goodwin recruiting'];
  if (ghostPatterns.some(pattern => lowerCompany.includes(pattern))) return false;

  // Target Matching
  const placeholderTitles = ['entry level role', 'join our team', 'job opportunity', 'open position', 'hiring now', 'career opportunity', 'apply now', 'multiple positions', 'various roles'];
  if (!jobTitle || placeholderTitles.some(pt => lowerTitle.includes(pt))) return false;

  if (userGoals?.location_preference) {
    const targetLoc = userGoals.location_preference.toLowerCase().trim();
    if (location && !location.includes(targetLoc) && !targetLoc.includes(location)) return false;
  }

  // Link Resolution
  if (!linkedinUrl && !companyDomain) return false;

  return true;
}

/**
 * Returns personalized job leads for a student.
 * Uses LLM with internet context for relevance, cached 24h per user.
 * Falls back to fresh generation if cache is stale or goals changed.
 * 
 * ENFORCES THREE-POINT AGENT VALIDATION:
 * 1. Identity Check (blocks ghosts & mirrored titles)
 * 2. Target Matching (validates strategic relevance)
 * 3. Link Resolution (confirms actionable engines)
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

    // 🛡️ AGENT GUARDRAIL: Apply three-point validation to all leads
    const userGoals = {
      location_preference: location,
      industries: industries,
    };

    const rawCompanies = result?.companies || [];
    const validatedCompanies = rawCompanies.filter(c => {
      const lead = {
        company: c.name,
        job_title: c.job_title,
        location: location,
        linkedin_url: c.linkedin_url || '',
        domain: c.domain || '',
      };
      
      const isValid = validateAgentLeadIntegrity(lead, userGoals);
      if (!isValid) {
        console.log(`🚫 [getLiveJobMatchesFn] REJECTED: ${c.name} - failed guardrail validation`);
      }
      return isValid;
    }).map(c => ({
      ...c,
      has_web_result: true,
    }));

    const companies = validatedCompanies;

    console.log(`[getLiveJobMatchesFn] Generated ${companies.length} fresh leads (filtered from ${result?.companies?.length || 0})`);

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