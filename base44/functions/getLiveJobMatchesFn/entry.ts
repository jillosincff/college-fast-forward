import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Map app industry names → Fantastic.jobs ai_taxonomies_a values
function mapIndustryToTaxonomy(industry) {
  const i = (industry || '').toLowerCase();
  if (i.includes('tech') || i.includes('software') || i.includes('information')) return 'Technology';
  if (i.includes('health') || i.includes('pharma') || i.includes('medical')) return 'Healthcare';
  if (i.includes('finance') || i.includes('insurance') || i.includes('banking')) return 'Finance & Accounting';
  if (i.includes('marketing') || i.includes('advertising') || i.includes('pr')) return 'Marketing';
  if (i.includes('sales')) return 'Sales';
  if (i.includes('consult') || i.includes('professional services')) return 'Management & Leadership';
  if (i.includes('education') || i.includes('training')) return 'Education & Training';
  if (i.includes('retail') || i.includes('consumer')) return 'Retail';
  if (i.includes('sports') || i.includes('entertainment') || i.includes('media')) return 'Media & Entertainment';
  if (i.includes('logistics') || i.includes('transport') || i.includes('supply chain')) return 'Transportation';
  if (i.includes('construction') || i.includes('real estate')) return 'Construction';
  return null;
}

// Headcount bounds per size preference
function sizeToHeadcount(primary) {
  if (primary === 'startup') return { lt: 200 };
  if (primary === 'mid' || primary === 'midmarket') return { gte: 200, lt: 5000 };
  if (primary === 'large' || primary === 'enterprise') return { gte: 5000 };
  return null;
}

async function fetchFantasticJobs({ role, location, industries, sizePreference, employmentTypes }) {
  const apiKey = Deno.env.get('FANTASTIC_JOBS_API_KEY');
  if (!apiKey) throw new Error('FANTASTIC_JOBS_API_KEY not set');

  const params = new URLSearchParams();
  // Use 7d (7-day window) — freshest batch that covers ~14 days of postings
  params.set('time_frame', '7d');
  params.set('limit', '50');
  params.set('include_basic_organization_details', 'true');
  params.set('description_format', 'text');

  // Employment types (ai_employment_type is the AI-classified field)
  for (const et of employmentTypes) {
    params.append('ai_employment_type', et);
  }

  // Role keyword search: strip employment-type words since ai_employment_type handles them
  const cleanRole = role.replace(/\b(intern(ship)?|entry.?level|junior)\b/gi, '').trim();
  if (cleanRole) params.set('title', cleanRole);

  // Location — use full name format required by Fantastic.jobs
  if (location && !/^(remote|anywhere|flexible|open)/i.test(location.trim())) {
    const city = location.split(',')[0].trim();
    params.set('location', `${city}, United States`);
  }

  // NOTE: ai_taxonomies_a is intentionally omitted — it's too restrictive and filters out
  // many valid jobs. Role + employment type filters are sufficient.

  // Company size via headcount — only apply for startup/mid
  const primary = Array.isArray(sizePreference) ? sizePreference[0] : sizePreference;
  if (primary === 'startup') {
    params.set('organization_headcount_lt', '500');
  } else if (primary === 'mid' || primary === 'midmarket') {
    params.set('organization_headcount_gte', '200');
    params.set('organization_headcount_lt', '5000');
  }
  // 'large' / 'all' — no headcount filter

  const url = `https://data.fantastic.jobs/v1/active-ats?${params.toString()}`;
  console.log('[getLiveJobMatchesFn] Fantastic.jobs query:', url);

  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${apiKey}` },
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Fantastic.jobs ${res.status}: ${err.slice(0, 300)}`);
  }

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { return []; }

  // API returns an array directly (not wrapped in {jobs:[]})
  if (Array.isArray(data)) return data;
  return data.jobs || data.data || data.results || [];
}

function jobsToCompanies(jobs, targetRole, industries) {
  const seen = new Set();
  const companies = [];

  for (const job of jobs) {
    // Fantastic.jobs: org name is in job.organization (string)
    const orgName = job.organization || '';
    if (!orgName || seen.has(orgName.toLowerCase())) continue;
    seen.add(orgName.toLowerCase());

    // Count openings at this company — more = hotter signal
    const openings = jobs.filter(j => (j.organization || '').toLowerCase() === orgName.toLowerCase()).length;
    const hiringSignal = openings >= 3 ? 'hot' : 'warm';

    // Size from org_linkedin_headcount (present when include_basic_organization_details=true)
    const headcount = job.org_linkedin_headcount || 0;
    const size = headcount >= 5000 ? 'large' : headcount >= 200 ? 'mid' : headcount > 0 ? 'startup' : 'mid';

    // Domain for alumni search
    const domain = job.domain_derived || job.org_linkedin_website || '';

    const rawDesc = job.description || '';
    const shortDesc = rawDesc.length > 300
      ? rawDesc.slice(0, 300) + '…'
      : rawDesc.length > 20
        ? rawDesc
        : `${orgName} is hiring for ${job.title || targetRole || 'interns'}.`;

    companies.push({
      name: orgName,
      domain,
      industry: job.org_linkedin_industry || industries[0] || '',
      hiring_signal: hiringSignal,
      hiring_description: shortDesc,
      size,
      job_title: job.title || '',
      job_url: job.url || '',
      date_posted: job.date_posted || job.date_created || '',
      has_web_result: true,
    });

    if (companies.length >= 10) break;
  }

  return companies;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const goals = body.career_goals || {};

    const role = goals.target_roles?.[0] || goals.role || '';
    const location = goals.locations?.[0] || '';

    let industries = goals.industries?.length > 0 ? goals.industries : [];

    // Normalize size preference
    const rawSize = goals.company_size_preference;
    let sizePreference;
    if (!rawSize || rawSize === 'all') {
      sizePreference = ['large', 'mid', 'startup'];
    } else if (Array.isArray(rawSize)) {
      sizePreference = rawSize;
    } else {
      const sizeOrder = {
        startup: ['startup', 'mid', 'large'],
        midmarket: ['mid', 'startup', 'large'],
        mid: ['mid', 'startup', 'large'],
        enterprise: ['large', 'mid', 'startup'],
        large: ['large', 'mid', 'startup'],
      };
      sizePreference = sizeOrder[rawSize] || ['large', 'mid', 'startup'];
    }

    const excludeNames = (goals.target_companies || []).map(c => c.toLowerCase());

    // ── Step 1: Fantastic.jobs — internships first, then entry-level full-time ──
    let companies = [];
    try {
      const [internJobs, ftJobs] = await Promise.allSettled([
        fetchFantasticJobs({ role, location, industries, sizePreference, employmentTypes: ['INTERN'] }),
        fetchFantasticJobs({ role, location, industries, sizePreference, employmentTypes: ['FULL_TIME'] }),
      ]);

      const internResults  = internJobs.status === 'fulfilled' ? internJobs.value : [];
      const ftResults      = ftJobs.status  === 'fulfilled' ? ftJobs.value  : [];

      // Merge: interns first, then fill with entry-level full-time
      const merged = [...internResults, ...ftResults];
      companies = jobsToCompanies(merged, role, industries);

      console.log(`[getLiveJobMatchesFn] Fantastic.jobs: ${internResults.length} intern + ${ftResults.length} FT jobs → ${companies.length} unique companies`);
    } catch (err) {
      console.warn('[getLiveJobMatchesFn] Fantastic.jobs failed:', err.message);
    }

    // ── Step 2: LLM web-search fallback ──
    if (companies.length < 3) {
      console.log('[getLiveJobMatchesFn] Falling back to LLM web search');
      try {
        const today = new Date().toISOString().slice(0, 10);
        const industry = industries[0] || 'general business';
        const size = sizePreference[0] || 'any size';

        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Today is ${today}. Search the web for companies that posted internship or entry-level ${role || industry} job openings in the last 14 days in or near ${location || 'United States'}.

Focus on ${size} companies in ${industry}. Return exactly 5 companies with verified, active openings.

For each: real company name, one sentence describing the specific openings, hiring signal (hot/warm/cool), company size (startup/mid/large).`,
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
                    description: { type: 'string' },
                    hiring_signal: { type: 'string', enum: ['hot', 'warm', 'cool'] },
                    size: { type: 'string', enum: ['startup', 'mid', 'large'] },
                  },
                  required: ['name', 'description', 'hiring_signal', 'size'],
                },
              },
            },
          },
        });

        const llmCompanies = (result?.companies || []).map(c => ({
          name: c.name,
          industry: industries[0] || '',
          hiring_signal: c.hiring_signal,
          hiring_description: c.description,
          size: c.size,
          has_web_result: true,
        }));

        // Merge with any Fantastic results
        const existingNames = new Set(companies.map(c => c.name.toLowerCase()));
        for (const c of llmCompanies) {
          if (!existingNames.has(c.name.toLowerCase())) companies.push(c);
          if (companies.length >= 10) break;
        }
      } catch (llmErr) {
        console.warn('[getLiveJobMatchesFn] LLM fallback failed:', llmErr.message);
      }
    }

    // Apply exclude filter
    companies = companies.filter(c => !excludeNames.includes(c.name.toLowerCase()));

    const result = companies.slice(0, 5).map(c => ({
      name: c.name,
      domain: c.domain || '',
      industry: c.industry || industries[0] || '',
      size: c.size || 'large',
      hiring_signal: c.hiring_signal,
      hiring_description: c.hiring_description,
      job_title: c.job_title || '',
      job_url: c.job_url || '',
      has_web_result: true,
    }));

    console.log(`[getLiveJobMatchesFn] ✅ ${result.length} companies: ${result.map(c => c.name).join(', ')}`);
    return Response.json({ companies: result });

  } catch (error) {
    console.error('[getLiveJobMatchesFn] Error:', error.message);
    return Response.json({ error: error.message, companies: [] }, { status: 500 });
  }
});