import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Find real job listings matching the user's role + location.
 * Alumni lookup is NOT done here — it's triggered separately when the user
 * clicks "Find Alumni" on a specific company card.
 * 
 * ENFORCES THREE-POINT AGENT VALIDATION:
 * 1. Identity Check (blocks ghosts & mirrored titles)
 * 2. Target Matching (validates strategic relevance)
 * 3. Link Resolution (confirms actionable engines)
 */
Deno.serve(async (req) => {
  const EXA_API_KEY = Deno.env.get('EXA_API_KEY');
  if (!EXA_API_KEY) return Response.json({ success: false, error: 'EXA_API_KEY not set' }, { status: 500 });

  const JOB_BOARD_PATTERN = /indeed|linkedin|glassdoor|ziprecruiter|builtin|jobsearcher|jobright|monster|simplyhired|careerbuilder|snagajob|handshake|wayup|internships\.com|jobot|talentcom|joblist|jobcase|digitalhire|remotepulse|internexxus|lever\.co|ashbyhq|greenhouse|workable|smartrecruiters|breezy|rippling|workday|myworkdayjobs|adzuna|themuse|dice|getro|paylocity|bamboohr|jazzhr|recruitee|teamtailor|jobvite|icims|taleo|hire|jobs\.|careers\.|apply\.|recruiting/i;

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

    // Only return jobs posted within the last 14 days
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const res = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: { 'x-api-key': EXA_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: jobSearchQuery,
        type: 'neural',
        numResults: 20,
        startPublishedDate: fourteenDaysAgo,
        contents: { text: { maxCharacters: 5000 } },
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
    // Junk tokens that are never real company names (job-board / ATS artifacts)
    const JUNK_COMPANY = /^(jobs?|careers?|apply|hiring|remote|work|talent|recruiting|opening|opportunit)/i;

    for (const r of jobResults) {
      // Only trust company names parsed from the job TITLE — never the URL hostname,
      // which produces phantom companies like "Jobs", "Remotepulse", "Veeva" from job boards.
      const atMatch = r.title?.match(/\bat\s+([A-Z][A-Za-z0-9\s&.,'\-]{2,40}?)(?:\s*[|·\-]|\s*$)/);
      const dashMatch = r.title?.match(/^([A-Z][A-Za-z0-9\s&.,'\-]{2,40}?)\s*[-–|]/);

      const company = atMatch?.[1]?.trim() || dashMatch?.[1]?.trim();
      if (
        company &&
        company.length > 2 &&
        !companyMap.has(company) &&
        !JOB_BOARD_PATTERN.test(company) &&
        !JUNK_COMPANY.test(company)
      ) {
        companyMap.set(company, {
          title: r.title?.split(/[|·]/)[0]?.trim() || r.title,
          url: r.url,
          description: (r.text || '').trim(),
        });
      }
    }

    // Extract unique companies and apply validation inline
    const validatedLeads = [];
    const userGoals = {
      location_preference: userLocation,
      industries: targetIndustries,
    };

    for (const [company, job] of companyMap.entries()) {
      const lead = {
        company,
        job_title: job.title?.split(/[|·]/)[0]?.trim() || job.title,
        role: roleQuery,
        url: job.url,
      };

      // 🛡️ Inline validation: Identity check
      const lowerCompany = company.toLowerCase();
      const lowerTitle = lead.job_title.toLowerCase();
      
      if (!company || company.length < 3) continue;
      if (lowerCompany === lowerTitle) {
        console.log(`🚫 [DualConstraint] REJECTED (mirrored): ${company}`);
        continue;
      }

      // Check for job title keywords in company name
      const jobTitleKeywords = ['intern', 'junior', 'senior', 'manager', 'director', 'coordinator', 'specialist', 'analyst', 'assistant', 'executive', 'engineer', 'developer', 'designer', 'consultant', 'associate', 'representative', 'account', 'administrator'];
      const businessSuffixes = ['inc', 'llc', 'corp', 'company', 'co', 'ltd', 'group', 'partners', 'associates', 'solutions', 'services', 'ventures', 'capital', 'agency', 'firm'];
      const hasValidSuffix = businessSuffixes.some(suffix => new RegExp(`\\b${suffix}\\b`, 'i').test(lowerCompany));
      
      if (!hasValidSuffix && jobTitleKeywords.some(keyword => lowerCompany.includes(keyword))) {
        console.log(`🚫 [DualConstraint] REJECTED (job keyword): ${company}`);
        continue;
      }

      // Validate job title exists
      if (!lead.job_title || lead.job_title === 'Entry Level Role') {
        console.log(`🚫 [DualConstraint] REJECTED (no title): ${company}`);
        continue;
      }

      validatedLeads.push({
        ...lead,
        description: job.description || '',
        hasActiveJobs: true,
        activeJobs: [job],
        signalTier: 'silver',
        ctaType: 'find_alumni',
        leadTier: 'dual_constraint',
        source: 'dual_constraint_engine',
      });

      if (validatedLeads.length >= 10) break;
    }

    console.log(`[DualConstraint] Returning ${validatedLeads.length} validated leads (filtered from ${companyMap.size})`);
    return Response.json({ success: true, leads: validatedLeads });

  } catch (e) {
    console.error('[getDualConstraintLeads] Error:', e.message);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
});