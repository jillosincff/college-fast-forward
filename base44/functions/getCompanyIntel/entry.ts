import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// ──────────────────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────────────────

function safeParseJSON(content) {
  try {
    const text = Array.isArray(content)
      ? content.map(c => c.text || '').join('')
      : String(content);
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

async function enrichWithFirecrawlSignals(companies, targetFunctions, targetIndustries, base44) {
  const FUNCTION_TO_KEYWORDS = {
    'Software Engineering': ['engineer', 'developer', 'swe', 'backend', 'frontend', 'fullstack', 'mobile'],
    'Product Management': ['product manager', 'pm', 'product lead', 'roadmap'],
    'Sales & Business Development': ['sales', 'business development', 'bdr', 'sdr', 'account executive', 'ae', 'revenue'],
    'Marketing & Brand': ['marketing', 'brand', 'growth', 'demand gen', 'content', 'seo', 'campaigns'],
    'Finance & Accounting': ['finance', 'accounting', 'cpa', 'controller', 'fp&a', 'analyst', 'audit'],
    'Operations & Strategy': ['operations', 'strategy', 'chief of staff', 'biz ops', 'program manager'],
    'Data & Analytics': ['data', 'analytics', 'bi', 'sql', 'tableau', 'data science', 'machine learning'],
    'Human Resources': ['hr', 'human resources', 'recruiting', 'talent', 'people ops'],
    'Consulting / Advisory': ['consultant', 'advisor', 'strategy', 'associate', 'engagement manager'],
    'Supply Chain & Logistics': ['supply chain', 'procurement', 'logistics', 'sourcing', 'inventory'],
    'Healthcare / Clinical': ['clinical', 'nursing', 'physician', 'patient', 'care', 'medical'],
    'Legal & Compliance': ['legal', 'compliance', 'counsel', 'attorney', 'paralegal', 'regulatory'],
  };
  const roleKeywords = targetFunctions.flatMap(fn => FUNCTION_TO_KEYWORDS[fn] || []).join(', ');
  const enriched = await Promise.allSettled(
    companies.map(async (company) => {
      const signals = {
        open_roles: null,
        layoff_alert: null,
        growth_signal: null,
        hiring_timeline_note: null,
      };

      // 1. SCRAPE CAREERS PAGE for open roles
      try {
        const careersUrl = `https://careers.${company.name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')}.com`;
        const careersRes = await base44.asServiceRole.functions.invoke('firecrawlService', {
          action: 'scrapeCompanySite',
          url: careersUrl,
        });
        if (careersRes?.success && careersRes?.content) {
          const extractRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
            model: 'gemini_3_flash',
            prompt: `You are analyzing a company careers page for a college student.

Student is targeting roles matching these keywords: ${roleKeywords || 'Not specified'}
(Derived from job functions: ${targetFunctions.join(', ') || 'Not specified'})
Student is targeting these industries: ${targetIndustries.join(', ') || 'Not specified'}

Look for open roles whose titles or descriptions contain any of these keywords.
Prioritize entry-level titles: associate, coordinator, analyst, representative, assistant, junior.

Careers page content:
${careersRes.content.slice(0, 6000)}

Return JSON only, no markdown:
{
  "open_role_count": number | null,
  "matched_roles": string[],
  "hiring_timeline_note": string | null,
  "is_actively_hiring": boolean
}`,
            response_json_schema: {
              type: 'object',
              properties: {
                open_role_count: { type: 'number' },
                matched_roles: { type: 'array', items: { type: 'string' } },
                hiring_timeline_note: { type: 'string' },
                is_actively_hiring: { type: 'boolean' },
              },
            },
          });
          const parsed = safeParseJSON(extractRes);
          if (parsed) {
            signals.open_roles = {
              count: parsed.open_role_count ?? 0,
              matched_roles: parsed.matched_roles ?? [],
            };
            signals.hiring_timeline_note = parsed.hiring_timeline_note;
          }
        }
      } catch (e) {
        console.warn(`Careers page scrape failed for ${company.name}:`, e.message);
      }

      // 2. SCRAPE NEWS for layoff signals
      try {
        const layoffRes = await base44.asServiceRole.functions.invoke('firecrawlService', {
          action: 'scrapeUrl',
          url: `https://www.google.com/search?q=${encodeURIComponent(
            `${company.name} layoffs OR "hiring freeze" OR "headcount reduction" 2024 OR 2025`
          )}&num=3`,
        });
        if (layoffRes?.success && layoffRes?.content) {
          const newsExtract = await base44.asServiceRole.integrations.Core.InvokeLLM({
            model: 'gemini_3_flash',
            prompt: `Analyze this news content about ${company.name}.

Content:
${layoffRes.content.slice(0, 3000)}

Return JSON only:
{ "layoff_detected": boolean, "layoff_summary": string | null }`,
            response_json_schema: {
              type: 'object',
              properties: {
                layoff_detected: { type: 'boolean' },
                layoff_summary: { type: 'string' },
              },
            },
          });
          const parsed = safeParseJSON(newsExtract);
          if (parsed?.layoff_detected) {
            signals.layoff_alert = {
              detected: true,
              summary: parsed.layoff_summary,
            };
          }
        }
      } catch (e) {
        console.warn(`Layoff news scrape failed for ${company.name}:`, e.message);
      }

      // 3. SCRAPE NEWS for funding / growth signals
      try {
        const fundingRes = await base44.asServiceRole.functions.invoke('firecrawlService', {
          action: 'scrapeUrl',
          url: `https://www.google.com/search?q=${encodeURIComponent(
            `${company.name} funding OR "Series" OR hiring OR expansion 2024 OR 2025`
          )}&num=3`,
        });
        if (fundingRes?.success && fundingRes?.content) {
          const fundingExtract = await base44.asServiceRole.integrations.Core.InvokeLLM({
            model: 'gemini_3_flash',
            prompt: `Analyze this news about ${company.name}.

Content:
${fundingRes.content.slice(0, 3000)}

Return JSON:
{ "growth_detected": boolean, "growth_summary": string | null }`,
            response_json_schema: {
              type: 'object',
              properties: {
                growth_detected: { type: 'boolean' },
                growth_summary: { type: 'string' },
              },
            },
          });
          const parsed = safeParseJSON(fundingExtract);
          if (parsed?.growth_detected) {
            signals.growth_signal = {
              detected: true,
              summary: parsed.growth_summary,
            };
          }
        }
      } catch (e) {
        console.warn(`Funding news scrape failed for ${company.name}:`, e.message);
      }

      // 4. DERIVE hiring_signal from real data (overwrite LLM guess)
      let real_hiring_signal = 'unknown';
      if (signals.layoff_alert?.detected) {
        real_hiring_signal = 'freeze';
      } else if (signals.open_roles && signals.open_roles.count > 5) {
        real_hiring_signal = 'active';
      } else if (signals.open_roles && signals.open_roles.count > 0) {
        real_hiring_signal = 'selective';
      } else if (signals.growth_signal?.detected) {
        real_hiring_signal = 'active';
      }

      return {
        ...company,
        hiring_signal: real_hiring_signal,
        signals,
      };
    })
  );

  return enriched.map((result, i) =>
    result.status === 'fulfilled' ? result.value : companies[i]
  );
}

// ──────────────────────────────────────────────────────────────────────────
// MAIN
// ──────────────────────────────────────────────────────────────────────────

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

      // Enrich with Firecrawl signals
      companies = await enrichWithFirecrawlSignals(
        companies,
        careerGoals.target_functions || [],
        careerGoals.target_industries || [],
        base44
      );

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
      targetFunctions: careerGoals.target_functions || [],
      cached: cacheAge < ONE_DAY_MS,
    });
  } catch (error) {
    console.error('getCompanyIntel error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});