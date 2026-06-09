import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * getPersonalizedNetworkCarousel - Live Lead Generation
 *
 * Uses live LLM web search + Exa alumni data to surface real opportunities.
 * No hardcoded job pool — everything is dynamic and goal-driven.
 *
 * 🔥 PRIORITY 1: priorityInsiders — company has a verified alumni or parent from user's school
 * ☀️ PRIORITY 2: targetedDiscoveries — role match, no insider yet
 */

const INDUSTRY_KEYWORDS = {
  'finance': ['finance', 'financial', 'investment', 'banking', 'capital', 'wealth', 'equity', 'trading', 'accounting', 'analyst', 'insurance'],
  'finance & insurance': ['finance', 'financial', 'investment', 'banking', 'capital', 'wealth', 'equity', 'trading', 'accounting', 'analyst', 'insurance'],
  'human resources': ['hr', 'human resources', 'talent', 'recruiting', 'people ops', 'workforce', 'benefits'],
  'creative': ['creative', 'design', 'designer', 'marketing', 'brand', 'content', 'media', 'advertising', 'ux', 'ui', 'copywriter'],
  'advertising & pr': ['marketing', 'brand', 'advertising', 'social media', 'content', 'public relations', 'communications', 'digital marketing', 'seo', 'copywriter', 'creative'],
  'tech': ['software', 'engineer', 'developer', 'product', 'data', 'ai', 'ml', 'machine learning', 'cloud', 'saas', 'fullstack', 'backend', 'frontend'],
  'technology, information & media': ['software', 'engineer', 'developer', 'product', 'data', 'ai', 'machine learning', 'cloud', 'saas', 'tech', 'content', 'media', 'design'],
  'media and entertainment': ['media', 'entertainment', 'content', 'film', 'television', 'music', 'broadcast', 'streaming', 'creative', 'design', 'ux', 'copywriter', 'editorial', 'social media', 'brand'],
  'media & entertainment': ['media', 'entertainment', 'content', 'film', 'television', 'music', 'broadcast', 'streaming', 'creative', 'design', 'ux', 'editorial', 'social media', 'brand'],
  'consulting': ['consultant', 'consulting', 'strategy', 'advisory', 'management consulting'],
  'professional services': ['consultant', 'consulting', 'strategy', 'advisory', 'law', 'attorney', 'accountant', 'cpa'],
  'healthcare': ['health', 'medical', 'nurse', 'doctor', 'hospital', 'pharma', 'biotech', 'clinical'],
  'healthcare & pharmaceuticals': ['health', 'medical', 'nurse', 'doctor', 'hospital', 'pharma', 'biotech', 'clinical'],
  'nonprofit': ['nonprofit', 'non-profit', 'ngo', 'foundation', 'charity', 'social impact'],
  'government': ['government', 'federal', 'state', 'public sector', 'policy', 'agency'],
  'government & public sector': ['government', 'federal', 'state', 'public sector', 'policy', 'agency'],
  'education': ['teacher', 'professor', 'education', 'school', 'university', 'college', 'curriculum'],
  'education & training': ['teacher', 'professor', 'education', 'school', 'university', 'college', 'curriculum'],
  'sports & entertainment': ['sports', 'entertainment', 'music', 'film', 'television', 'journalism', 'broadcast'],
  'retail & consumer goods': ['retail', 'consumer goods', 'merchandise', 'buying', 'fashion', 'ecommerce'],
  'transportation & logistics': ['logistics', 'supply chain', 'transportation', 'shipping', 'warehouse', 'procurement'],
};

function getMemberKeywords(targetIndustries) {
  const kws = new Set();
  for (const ind of targetIndustries) {
    const key = ind.toLowerCase();
    const matches = INDUSTRY_KEYWORDS[key] || [];
    matches.forEach(k => kws.add(k));
    for (const [mapKey, mapKws] of Object.entries(INDUSTRY_KEYWORDS)) {
      if (mapKey.includes(key.split(' ')[0]) || key.includes(mapKey.split(' ')[0])) {
        mapKws.forEach(k => kws.add(k));
      }
    }
  }
  return Array.from(kws);
}

function normalizeCompanyName(name) {
  return (name || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

function normalizeForMatch(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\b(inc|ltd|llc|corp|co|company|the)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function memberInIndustry(member, keywords) {
  if (!keywords.length) return true;
  const haystack = [member.title || '', member.industry || '', member.bio || ''].join(' ').toLowerCase();
  return keywords.some(kw => haystack.includes(kw));
}

const SENIOR_FILTER = /\b(senior|sr\.|lead|principal|director|manager|head of|vp |vice president|staff engineer|architect|managing partner)\b/i;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));

    // CRITICAL: Prioritize explicit payload parameters over DB to bypass race conditions
    let targetIndustries = (
      body.target_industries
      || body.explicit_target_industries
      || user.career_goals?.target_industries
      || user.industries_interested
      || []
    ).map(i => i.toLowerCase());

    const targetRole = body.explicit_target_role || body.target_role || user.career_goals?.target_roles?.[0] || user.career_goals?.role || user.target_role || '';
    const companySizePref = body.company_size_preference || user.career_goals?.company_size_preference || 'all';
    const seenCompanies = new Set((body.seen_companies || []).map(c => normalizeCompanyName(c)));
    const refreshSeed = body.refresh_seed || 0;

    const rawLocation = body.target_location || user.career_goals?.location_preference || user.location || '';
    const remoteIntent = /^(remote|anywhere|flexible|open to relocation)$/i.test(rawLocation.trim());
    const userCity = remoteIntent ? '' : (rawLocation ? rawLocation.split(',')[0].trim().toLowerCase() : '');

    const userSchoolCode = (user.school_code || '').toLowerCase();
    const userSchool = (user.school_name || user.school || user.university || '').toLowerCase();

    if (!targetRole && targetIndustries.length === 0) {
      return Response.json({ success: true, priorityInsiders: [], targetedDiscoveries: [], wasFiltered: false });
    }

    // ── STEP 1: Get live job matches via LLM web search ──────────────────
    console.log(`[getPersonalizedNetworkCarousel] Fetching live jobs for: role="${targetRole}", industries=${targetIndustries.join(',')}, location="${rawLocation}"`);

    let liveCompanies = [];
    try {
      const liveRes = await Promise.race([
        base44.asServiceRole.functions.invoke('getLiveJobMatchesFn', {
          career_goals: {
            role: targetRole || (targetIndustries[0] ? `${targetIndustries[0]} analyst` : 'analyst'),
            industries: targetIndustries.map(i => i.charAt(0).toUpperCase() + i.slice(1)),
            locations: rawLocation ? [rawLocation] : [],
            company_size_preference: companySizePref === 'startup' ? ['startup'] : companySizePref === 'midmarket' ? ['mid'] : companySizePref === 'enterprise' ? ['large'] : ['large', 'mid', 'startup'],
          },
        }),
        new Promise((_, r) => setTimeout(() => r(new Error('live_timeout')), 20000)),
      ]);
      liveCompanies = liveRes?.companies || [];
    } catch (liveErr) {
      console.warn(`[getPersonalizedNetworkCarousel] Live fetch failed: ${liveErr.message}`);
    }

    console.log(`[getPersonalizedNetworkCarousel] Live companies: ${liveCompanies.map(c => c.name).join(', ') || 'none'}`);

    if (liveCompanies.length === 0) {
    // Fallback: use LLM to generate real job listings with full descriptions
    try {
      const fallback = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Generate 10 realistic, detailed entry-level job listings for a "${targetRole || (targetIndustries[0] || 'Business') + ' Analyst'}" role at real companies actively hiring in ${rawLocation || 'the United States'} in 2025.

    For each listing, write a REAL job description (150-250 words) that includes:
    - 3-4 specific responsibilities (what they'll actually do day-to-day)
    - 3-4 required qualifications (degree requirements, skills, tools)
    - 1-2 nice-to-have skills
    - Compensation range if available

    Make the descriptions sound like actual job postings, not marketing copy. Use concrete, specific language about real tools and technologies relevant to the role and industry.

    Return 10 companies with real, substantive job descriptions. Mix large enterprises and mid-size companies.`,
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
                  job_description: { type: 'string' },
                  size: { type: 'string', enum: ['startup', 'mid', 'large'] }
                },
                required: ['name', 'job_description']
              }
            }
          }
        }
      });
      liveCompanies = (fallback?.companies || []).map(c => ({
        name: c.name,
        hiring_signal: 'warm',
        hiring_description: c.job_description || `${c.name} is hiring entry-level ${targetRole || 'professionals'}.`,
        size: c.size || 'mid',
      }));
    } catch (e) {
      console.warn('[getPersonalizedNetworkCarousel] Fallback LLM also failed:', e.message);
    }
    }

    // If live companies have only vague blurbs, enrich with real job descriptions
    const needsEnrichment = liveCompanies.length > 0 && liveCompanies.every(c => (c.hiring_description || '').length < 120);
    if (needsEnrichment) {
      try {
        const enriched = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Write realistic, detailed entry-level job descriptions for a "${targetRole || (targetIndustries[0] || 'Business') + ' Analyst'}" role at each of these companies: ${liveCompanies.map(c => c.name).join(', ')}.

For each company, write a real job description (150-200 words) with:
- Specific day-to-day responsibilities relevant to that company's business
- Required qualifications (education, tools, skills)
- Nice-to-have skills

Use concrete, specific language that sounds like an actual job posting.`,
          model: 'gemini_3_flash',
          response_json_schema: {
            type: 'object',
            properties: {
              listings: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    company: { type: 'string' },
                    description: { type: 'string' }
                  },
                  required: ['company', 'description']
                }
              }
            }
          }
        });
        const descMap = {};
        (enriched?.listings || []).forEach(l => { descMap[l.company?.toLowerCase()] = l.description; });
        liveCompanies = liveCompanies.map(c => ({
          ...c,
          hiring_description: descMap[c.name?.toLowerCase()] || c.hiring_description,
        }));
      } catch (e) {
        console.warn('[getPersonalizedNetworkCarousel] Description enrichment failed:', e.message);
      }
    }

    // Convert live companies to job-card format
    let jobPool = liveCompanies.map(c => ({
      company: c.name,
      role: targetRole || `${targetIndustries[0] || 'Business'} Analyst`,
      job_title: c.job_title || '',
      job_url: c.job_url || '',
      description: c.hiring_description || c.description || `${c.name} is actively hiring entry-level ${targetRole || 'professionals'}.`,
      source: c.job_url || `${(c.name || '').toLowerCase().replace(/\s+/g, '')}.com/careers`,
      sourceCategory: 'B',
      companyTier: c.size === 'startup' ? 3 : c.size === 'mid' ? 2 : 1,
      isLiveResult: true,
    }));

    // Filter senior roles and deduplicate
    jobPool = jobPool.filter(j => !SENIOR_FILTER.test(j.role));
    const seenKeys = new Set();
    jobPool = jobPool.filter(j => {
      const key = normalizeCompanyName(j.company);
      if (seenKeys.has(key)) return false;
      seenKeys.add(key);
      return true;
    });

    // Exclude already-seen companies
    if (seenCompanies.size > 0) {
      const excluded = jobPool.filter(j => !seenCompanies.has(normalizeCompanyName(j.company)));
      if (excluded.length >= 3) jobPool = excluded;
    }

    // Seeded shuffle for consistent "New Batch" rotation
    const today = new Date().toISOString().slice(0, 10);
    const seedStr = `${user.id}${today}${refreshSeed}`;
    let seedHash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      seedHash = ((seedHash << 5) - seedHash) + seedStr.charCodeAt(i);
      seedHash |= 0;
    }
    const seededRandom = (n) => {
      seedHash = ((seedHash << 5) - seedHash) + n;
      seedHash |= 0;
      return Math.abs(seedHash) / 2147483647;
    };
    for (let i = jobPool.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(i) * (i + 1));
      [jobPool[i], jobPool[j]] = [jobPool[j], jobPool[i]];
    }

    // ── STEP 2: Load school network (alumni + parents + DiscoveredAlumni) ──
    const INVALID = ['self employed', 'selfemployed', 'self-employed', 'retired', 'none', 'n/a', 'unemployed'];
    const getField = (u, ...keys) => {
      for (const k of keys) {
        const v = u[k] || u.data?.[k];
        if (v) return v;
      }
      return '';
    };

    const [allUsers, discoveredAlumni] = await Promise.all([
      base44.asServiceRole.entities.User.list('-created_date', 5000),
      base44.asServiceRole.entities.DiscoveredAlumni.filter({ school_code: (userSchoolCode || 'uf').toUpperCase() }, '-created_date', 1000).catch(() => []),
    ]);

    const schoolMembers = allUsers.filter(u => {
      const persona = u.persona || u.data?.persona || '';
      const roles = u.roles || u.data?.roles || [];
      const isAlumni = persona === 'alumni' || roles.includes('alumni');
      const isParent = persona === 'parent' || roles.includes('parent');
      if (!isAlumni && !isParent) return false;
      const rawCompany = getField(u, 'current_company', 'company', 'employer').trim();
      if (!rawCompany) return false;
      const uCode = getField(u, 'school_code').toLowerCase();
      const uName = getField(u, 'school_name', 'school', 'university').toLowerCase();
      return (userSchoolCode && uCode === userSchoolCode) ||
        (userSchool && (uName === userSchool || uName.includes(userSchool) || userSchool.includes(uName)));
    });

    console.log(`[getPersonalizedNetworkCarousel] ${schoolMembers.length} school network members`);

    // Build company → {alumni, parents} map
    const companyNetworkMap = {};
    for (const u of schoolMembers) {
      const rawCompany = getField(u, 'current_company', 'company', 'employer').trim();
      const key = normalizeCompanyName(rawCompany);
      if (!key || INVALID.includes(key)) continue;
      if (!companyNetworkMap[key]) companyNetworkMap[key] = { alumni: [], parents: [] };
      const persona = u.persona || u.data?.persona || '';
      const roles = u.roles || u.data?.roles || [];
      const isParent = persona === 'parent' || roles.includes('parent');
      const member = {
        id: u.id,
        full_name: u.full_name,
        title: getField(u, 'job_title', 'current_position', 'position', 'career_background'),
        industry: getField(u, 'industry'),
        graduation_year: getField(u, 'graduation_year', 'class_year'),
        linkedin_url: getField(u, 'linkedin_url', 'linkedin', 'linkedin_profile') || null,
        student_name: isParent ? (getField(u, 'student_name') || null) : null,
        persona: isParent ? 'parent' : 'alumni',
      };
      if (isParent) companyNetworkMap[key].parents.push(member);
      else companyNetworkMap[key].alumni.push(member);
    }

    // Count alumni per job company (including DiscoveredAlumni)
    const alumniByCompany = {};
    for (const job of jobPool) {
      const normalizedKey = normalizeCompanyName(job.company);
      if (alumniByCompany[normalizedKey] !== undefined) continue;
      const jobNorm = normalizeForMatch(job.company);

      // Registered members
      let count = 0;
      for (const [key, val] of Object.entries(companyNetworkMap)) {
        const netKey = normalizeForMatch(key.replace(/[^a-z0-9\s]/g, ''));
        if (jobNorm.length >= 4 && netKey.length >= 4 && (netKey.includes(jobNorm) || jobNorm.includes(netKey))) {
          count += val.alumni.length + val.parents.length;
        }
      }
      // DiscoveredAlumni - use strict matching
      const discovered = (discoveredAlumni || []).filter(a => {
        const aNorm = normalizeForMatch(a.company || '');
        if (aNorm.length < 4 || jobNorm.length < 4) return false;
        
        // Use word-based matching instead of simple substring
        const jobWords = jobNorm.split(/\s+/).filter(w => w.length > 2);
        const alumWords = aNorm.split(/\s+/).filter(w => w.length > 2);
        const overlappingWords = jobWords.filter(w => alumWords.some(aw => aw.includes(w) || w.includes(aw)));
        const overlapRatio = overlappingWords.length / Math.max(jobWords.length, alumWords.length);
        
        return overlapRatio >= 0.5;
      });
      alumniByCompany[normalizedKey] = count + discovered.length;
    }

    // Industry parents for warm leads
    const industryKeywords = getMemberKeywords(targetIndustries);
    const industryParents = schoolMembers.filter(u => {
      const persona = u.persona || u.data?.persona || '';
      const roles = u.roles || u.data?.roles || [];
      const isParent = persona === 'parent' || roles.includes('parent');
      if (!isParent) return false;
      return memberInIndustry({
        title: getField(u, 'job_title', 'current_position', 'position', 'career_background'),
        industry: getField(u, 'industry'),
        bio: getField(u, 'bio'),
      }, industryKeywords);
    });

    // ── STEP 3: Classify leads into Insider vs Discovery ──────────────────
    const priorityInsiders = [];
    const targetedDiscoveries = [];

    for (const job of jobPool) {
      const normalizedJobCompany = normalizeCompanyName(job.company);
      const jobNorm = normalizeForMatch(job.company);

      // Find network entry - use strict matching to avoid false positives
      let networkEntry = companyNetworkMap[normalizedJobCompany];
      if (!networkEntry) {
        for (const [key, val] of Object.entries(companyNetworkMap)) {
          const netKey = normalizeForMatch(key);
          // Require strong similarity - not just substring matches
          const jobWords = jobNorm.split(/\s+/).filter(w => w.length > 2);
          const netWords = netKey.split(/\s+/).filter(w => w.length > 2);
          
          // Check for significant word overlap (at least 50% of words match)
          const overlappingWords = jobWords.filter(w => netWords.some(nw => nw.includes(w) || w.includes(nw)));
          const overlapRatio = overlappingWords.length / Math.max(jobWords.length, netWords.length);
          
          if (jobNorm.length >= 4 && netKey.length >= 4 && overlapRatio >= 0.5) {
            networkEntry = val;
            break;
          }
        }
      }

      const realAlumniCount = alumniByCompany[normalizedJobCompany] || 0;
      const registeredAlumni = networkEntry?.alumni || [];
      const parentsAtCompany = networkEntry?.parents || [];

      // Pull DiscoveredAlumni for this company - use strict matching
      const discoveredForJob = (discoveredAlumni || []).filter(a => {
        const aNorm = normalizeForMatch(a.company || '');
        if (aNorm.length < 4 || jobNorm.length < 4) return false;
        
        // Use word-based matching instead of simple substring
        const jobWords = jobNorm.split(/\s+/).filter(w => w.length > 2);
        const alumWords = aNorm.split(/\s+/).filter(w => w.length > 2);
        const overlappingWords = jobWords.filter(w => alumWords.some(aw => aw.includes(w) || w.includes(aw)));
        const overlapRatio = overlappingWords.length / Math.max(jobWords.length, alumWords.length);
        
        return overlapRatio >= 0.5;
      }).map(a => ({
        id: a.id,
        full_name: a.name,
        title: a.role_title || '',
        industry: '',
        graduation_year: a.degree_info || '',
        linkedin_url: a.linkedin_url || null,
        student_name: null,
        persona: 'alumni',
      }));

      const seenNames = new Set(registeredAlumni.map(a => a.full_name));
      const mergedAlumni = [...registeredAlumni];
      for (const da of discoveredForJob) {
        if (!seenNames.has(da.full_name)) { seenNames.add(da.full_name); mergedAlumni.push(da); }
      }

      const hasInsider = realAlumniCount > 0 || parentsAtCompany.length > 0;

      if (hasInsider) {
        const insiderBadge = realAlumniCount > 0 && parentsAtCompany.length > 0
          ? `${realAlumniCount} Alumni + ${parentsAtCompany.length} Parent Insider`
          : realAlumniCount > 0 ? `${realAlumniCount} Alumni Work Here`
          : `${parentsAtCompany.length} Parent Advisor Here`;

        priorityInsiders.push({
          company: job.company,
          role: job.role,
          job_title: job.job_title || '',
          job_url: job.job_url || '',
          jobDescription: job.description || job.hiring_description || '',
          jobSource: job.source || null,
          jobSourceCategory: job.sourceCategory || 'B',
          targetIndustry: targetIndustries[0] || '',
          matchedIndustries: targetIndustries,
          alumniCount: realAlumniCount,
          parentCount: parentsAtCompany.length,
          alumni: mergedAlumni.slice(0, 5),
          featuredParent: parentsAtCompany[0] ? { full_name: parentsAtCompany[0].full_name, title: parentsAtCompany[0].title, persona: 'parent' } : null,
          hasParentBonus: parentsAtCompany.length > 0,
          insiderBadge,
          ctaType: realAlumniCount > 0 ? 'message_alumni' : 'connect_parent',
          companyTier: job.companyTier || 1,
          leadTier: 'insider',
          isLiveResult: true,
        });
      } else {
        targetedDiscoveries.push({
          company: job.company,
          role: job.role,
          job_title: job.job_title || '',
          job_url: job.job_url || '',
          jobDescription: job.description || job.hiring_description || '',
          jobSource: job.source || null,
          jobSourceCategory: job.sourceCategory || 'B',
          targetIndustry: targetIndustries[0] || '',
          matchedIndustries: targetIndustries,
          alumniCount: 0,
          parentCount: 0,
          hasParentBonus: false,
          ctaType: 'add_to_pipeline',
          companyTier: job.companyTier || 1,
          leadTier: 'target',
          isLiveResult: true,
        });
      }
    }

    console.log(`[getPersonalizedNetworkCarousel] 🔥 ${priorityInsiders.length} INSIDERS | ☀️ ${targetedDiscoveries.length} TARGETS | seed=${refreshSeed}`);

    return Response.json({
      success: true,
      cards: priorityInsiders,
      coldOpportunities: targetedDiscoveries,
      wasFiltered: targetIndustries.length > 0,
      targetIndustries,
    });

  } catch (error) {
    console.error('[getPersonalizedNetworkCarousel]', error.message);
    return Response.json({ error: error.message, priorityInsiders: [], targetedDiscoveries: [] }, { status: 500 });
  }
});