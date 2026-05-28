import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * getPersonalizedNetworkCarousel
 *
 * 3-Tier Match Hierarchy (strictly ordered):
 *  1. Anchor (Job): A real/sourced job opening matching the user's target industries & role.
 *  2. Backdoor Lever (Alumni): The company must have a verified school alumnus for a warm intro.
 *  3. Mentorship Boost (Parent): Any school parents who work in the same industry as the job
 *     are layered on as advisory assets.
 *
 * Cards with no alumni are skipped entirely.
 */

// Map industry labels → title/field keywords for matching network members
const INDUSTRY_KEYWORDS = {
  'finance': ['finance', 'financial', 'investment', 'banking', 'capital', 'wealth', 'equity', 'trading', 'accounting', 'cfo', 'analyst', 'insurance'],
  'finance & insurance': ['finance', 'financial', 'investment', 'banking', 'capital', 'wealth', 'equity', 'trading', 'accounting', 'cfo', 'analyst', 'insurance'],
  'human resources': ['hr', 'human resources', 'talent', 'recruiting', 'recruiter', 'people ops', 'people operations', 'workforce', 'benefits'],
  'creative': ['creative', 'design', 'designer', 'marketing', 'brand', 'content', 'media', 'advertising', 'art', 'ux', 'ui', 'copywriter'],
  'advertising & pr': ['marketing', 'brand', 'advertising', 'social media', 'content', 'public relations', 'communications', 'digital marketing', 'seo', 'copywriter', 'creative'],
  'entrepreneur': ['founder', 'co-founder', 'ceo', 'owner', 'entrepreneur', 'startup', 'venture', 'managing partner'],
  'tech': ['software', 'engineer', 'developer', 'product', 'data', 'ai', 'ml', 'machine learning', 'cloud', 'saas', 'fullstack', 'backend', 'frontend'],
  'technology, information & media': ['software', 'engineer', 'developer', 'product', 'data', 'ai', 'machine learning', 'cloud', 'saas', 'tech'],
  'consulting': ['consultant', 'consulting', 'strategy', 'advisory', 'management consulting'],
  'professional services': ['consultant', 'consulting', 'strategy', 'advisory', 'law', 'attorney', 'accountant', 'cpa'],
  'healthcare': ['health', 'medical', 'nurse', 'doctor', 'hospital', 'pharma', 'biotech', 'clinical'],
  'healthcare & pharmaceuticals': ['health', 'medical', 'nurse', 'doctor', 'hospital', 'pharma', 'biotech', 'clinical'],
  'real_estate': ['real estate', 'realty', 'property', 'broker', 'mortgage', 'leasing'],
  'construction & agriculture': ['construction', 'contractor', 'real estate', 'architecture', 'infrastructure'],
  'law': ['attorney', 'lawyer', 'legal', 'counsel', 'law', 'litigation', 'paralegal'],
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
    // also allow partial key match
    for (const [mapKey, mapKws] of Object.entries(INDUSTRY_KEYWORDS)) {
      if (mapKey.includes(key.split(' ')[0]) || key.includes(mapKey.split(' ')[0])) {
        mapKws.forEach(k => kws.add(k));
      }
    }
  }
  return Array.from(kws);
}

function memberInIndustry(member, keywords) {
  if (!keywords.length) return true;
  const haystack = [member.title || '', member.industry || '', member.bio || ''].join(' ').toLowerCase();
  return keywords.some(kw => haystack.includes(kw));
}

// Static job pool per industry (anchor tier). Expanded to ensure overlap with real companies.
const JOB_POOL = {
  'finance': [
    { company: 'JPMorgan', role: 'Financial Operations Specialist', description: 'Analyst roles in investment banking and corporate finance divisions.' },
    { company: 'Goldman Sachs', role: 'Investment Banking Analyst', description: 'Summer and new associate programs across all divisions.' },
    { company: 'Stripe', role: 'Financial Operations Specialist', description: 'Finance and strategy analyst roles at a leading fintech.' },
    { company: 'Deloitte', role: 'Finance & Advisory Associate', description: 'Audit, tax, and financial advisory associates across US offices.' },
    { company: 'BlackRock', role: 'Investment Analyst', description: 'Analyst programs across multi-asset and quant divisions.' },
    { company: 'SoFi', role: 'Finance Analyst', description: 'Personal finance platform — lending, analytics, and operations.' },
    { company: 'Ramp', role: 'Finance & Strategy Analyst', description: 'Fast-growing fintech with high-ownership finance roles.' },
    { company: 'PwC', role: 'Assurance Associate', description: 'Big 4 hiring across all service lines for new graduates.' },
  ],
  'finance & insurance': [
    { company: 'JPMorgan', role: 'Financial Operations Specialist', description: 'Analyst roles in investment banking and corporate finance divisions.' },
    { company: 'Goldman Sachs', role: 'Investment Banking Analyst', description: 'Summer and new associate programs across all divisions.' },
    { company: 'Stripe', role: 'Financial Operations Specialist', description: 'Finance and strategy analyst roles at a leading fintech.' },
    { company: 'Deloitte', role: 'Finance & Advisory Associate', description: 'Audit, tax, and financial advisory associates across US offices.' },
    { company: 'Ramp', role: 'Finance & Strategy Analyst', description: 'Fast-growing fintech with high-ownership finance roles.' },
  ],
  'tech': [
    { company: 'Google', role: 'Software Engineer (New Grad)', description: 'Engineering and product roles across cloud, AI, and consumer teams.' },
    { company: 'Microsoft', role: 'Software Development Engineer', description: 'New grad programs spanning cloud, AI, and productivity divisions.' },
    { company: 'Salesforce', role: 'Associate Software Engineer', description: 'Rotational and entry-level engineering roles across the platform.' },
    { company: 'Meta', role: 'Data Engineer', description: 'Data and engineering roles across ads and product infrastructure.' },
    { company: 'Ramp', role: 'Software Engineer', description: 'Fast-growing fintech — real engineering ownership from day one.' },
    { company: 'Notion', role: 'Product Analyst', description: 'Productivity startup scaling globally — product and data roles.' },
  ],
  'technology, information & media': [
    { company: 'Google', role: 'Software Engineer (New Grad)', description: 'Engineering and product roles across cloud, AI, and consumer teams.' },
    { company: 'Microsoft', role: 'Software Development Engineer', description: 'New grad programs spanning cloud, AI, and productivity divisions.' },
    { company: 'Meta', role: 'Data Engineer', description: 'Data and engineering roles across ads and product infrastructure.' },
  ],
  'consulting': [
    { company: 'McKinsey', role: 'Business Analyst', description: 'Analyst roles for top undergrads entering management consulting.' },
    { company: 'Deloitte', role: 'Strategy & Analytics Consultant', description: 'Consulting and business analysts in advisory practices nationwide.' },
    { company: 'BCG', role: 'Associate Consultant', description: 'Entry-level strategy roles for new graduates.' },
    { company: 'West Monroe', role: 'Business Analyst', description: 'Digital consulting firm actively hiring analysts.' },
  ],
  'professional services': [
    { company: 'Deloitte', role: 'Consulting Analyst', description: 'Advisory associates in strategy, digital, and operations.' },
    { company: 'EY', role: 'Associate', description: 'Entry-level roles across audit, tax, and advisory.' },
    { company: 'KPMG', role: 'Advisory Associate', description: 'Associate-level hiring across US offices.' },
    { company: 'McKinsey', role: 'Business Analyst', description: 'Analyst roles for top undergrads entering management consulting.' },
  ],
  'healthcare': [
    { company: 'HCA Healthcare', role: 'Clinical Coordinator', description: 'Hospital network consistently hiring nurses across hundreds of facilities.' },
    { company: 'AdventHealth', role: 'Registered Nurse', description: 'Faith-based hospital network with strong nursing culture.' },
    { company: 'Carbon Health', role: 'Care Coordinator', description: 'Tech-enabled primary care startup rapidly expanding clinical teams.' },
  ],
  'healthcare & pharmaceuticals': [
    { company: 'HCA Healthcare', role: 'Clinical Coordinator', description: 'Hospital network consistently hiring nurses across hundreds of facilities.' },
    { company: 'CVS Health', role: 'Pharmacy Operations Analyst', description: 'Hiring clinical and operations staff for pharmacy and MinuteClinic.' },
  ],
  'marketing': [
    { company: 'Procter & Gamble', role: 'Brand Management Associate', description: 'Brand management and operations rotational roles for recent grads.' },
    { company: 'Edelman', role: 'PR Account Coordinator', description: "World's largest PR firm — hiring communications and PR associates." },
    { company: 'Ogilvy', role: 'Creative Account Manager', description: 'Creative and account management roles for recent grads in advertising.' },
  ],
  'advertising & pr': [
    { company: 'Edelman', role: 'PR Account Coordinator', description: "World's largest PR firm — hiring communications and PR associates." },
    { company: 'Weber Shandwick', role: 'PR Associate', description: 'Hiring entry-level PR and communications associates.' },
    { company: 'WPP', role: 'Strategy Analyst', description: 'Global holding company with entry-level roles across agency brands.' },
  ],
  'real_estate': [
    { company: 'CBRE', role: 'Real Estate Analyst', description: "World's largest commercial real estate services firm hiring analysts." },
    { company: 'JLL', role: 'Research Associate', description: 'Global RE firm with strong graduate development programs.' },
  ],
  'construction & agriculture': [
    { company: 'Turner Construction', role: 'Project Engineer', description: 'One of the largest construction firms — hiring project managers and engineers nationwide.' },
    { company: 'CBRE', role: 'Project Manager', description: "World's largest commercial real estate services firm — project management division." },
    { company: 'Procore', role: 'Implementation Analyst', description: 'Construction management software — sales, support, and analyst roles.' },
  ],
  'education': [
    { company: 'Teach For America', role: 'Corps Member', description: 'Two-year teaching fellowship placing grads in under-resourced schools.' },
    { company: 'Duolingo', role: 'Curriculum Analyst', description: 'Language learning platform hiring for content and product roles.' },
  ],
  'education & training': [
    { company: 'Teach For America', role: 'Corps Member', description: 'Two-year teaching fellowship in under-resourced schools.' },
    { company: 'Duolingo', role: 'Curriculum Analyst', description: 'Language learning platform hiring for content and product roles.' },
  ],
  'nonprofit': [
    { company: 'Teach For America', role: 'Program Associate', description: 'Educational non-profit with operations and program roles.' },
    { company: 'Code for America', role: 'Civic Tech Fellow', description: 'Non-profit improving government services through technology.' },
  ],
  'government': [
    { company: 'Booz Allen Hamilton', role: 'Government Analyst', description: 'Government consulting firm with strong entry-level programs.' },
    { company: 'Deloitte Government', role: 'Federal Consultant', description: 'Federal consulting division hiring for public sector projects.' },
  ],
  'government & public sector': [
    { company: 'Booz Allen Hamilton', role: 'Government Analyst', description: 'Government consulting firm with strong entry-level programs.' },
    { company: 'Deloitte Government', role: 'Federal Consultant', description: 'Federal consulting division hiring for public sector projects.' },
  ],
  'sports & entertainment': [
    { company: 'Live Nation', role: 'Marketing Coordinator', description: "World's largest live entertainment company — events and operations roles." },
    { company: 'ESPN', role: 'Content Associate', description: 'Hiring for content, production, and marketing roles in sports media.' },
    { company: 'Nike', role: 'Brand Marketing Associate', description: 'Brand marketing and product roles for sports or business backgrounds.' },
  ],
  'logistics': [
    { company: 'Arrive Logistics', role: 'Account Manager', description: 'Growing freight brokerage — strong entry-level training program.' },
    { company: 'Samsara', role: 'Sales Development Rep', description: 'Fleet management platform — sales and operations roles.' },
    { company: 'C.H. Robinson', role: 'Supply Chain Analyst', description: 'Supply chain and freight brokerage roles with strong training.' },
  ],
  'transportation & logistics': [
    { company: 'Arrive Logistics', role: 'Account Manager', description: 'Growing freight brokerage — strong entry-level training program.' },
    { company: 'C.H. Robinson', role: 'Supply Chain Analyst', description: 'Supply chain and freight brokerage roles with strong training.' },
    { company: 'Samsara', role: 'Sales Development Rep', description: 'Fleet management platform startup — sales and operations roles.' },
  ],
};

const FALLBACK_JOBS = [
  { company: 'Deloitte', role: 'Business Analyst', description: 'Consulting and advisory associates across all US offices.' },
  { company: 'JPMorgan', role: 'Operations Analyst', description: 'Finance and operations roles nationwide.' },
  { company: 'Google', role: 'Associate Product Manager', description: 'Product and engineering roles across multiple teams.' },
  { company: 'Salesforce', role: 'Associate', description: 'Rotational roles across sales, engineering, and marketing.' },
  { company: 'Procter & Gamble', role: 'Brand Management Associate', description: 'Consumer goods brand and operations roles.' },
];

function normalizeCompanyName(name) {
  return (name || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const targetIndustries = (
      body.target_industries
      || user.career_goals?.target_industries
      || user.industries_interested
      || user.industries_of_interest
      || []
    ).map(i => i.toLowerCase());

    const targetRole = body.target_role || user.career_goals?.role || user.target_role || '';
    const schoolCode = (user.school_code || '').toLowerCase();
    const schoolName = (user.school_name || user.school || user.university || '').toLowerCase();

    // ─── Step 1: Build the job pool from target industries ──────────────────
    let jobPool = [];
    for (const ind of targetIndustries) {
      const pool = JOB_POOL[ind] || [];
      jobPool.push(...pool);
    }
    // Deduplicate by company name
    const seen = new Set();
    jobPool = jobPool.filter(j => {
      if (seen.has(j.company)) return false;
      seen.add(j.company);
      return true;
    });
    if (!jobPool.length) jobPool = [...FALLBACK_JOBS];

    // ─── Step 2: Load all network members (alumni + parents) ────────────────
    const INVALID = ['self employed', 'selfemployed', 'self-employed', 'retired', 'none', 'n/a', 'unemployed', 'stay at home', 'homemaker', 'between jobs'];
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);
    const networkMembers = (allUsers || []).filter(u => {
      const isParent = u.persona === 'parent' || (Array.isArray(u.roles) && u.roles.includes('parent'));
      const isAlumni = u.persona === 'alumni' || (Array.isArray(u.roles) && u.roles.includes('alumni'));
      if (!isParent && !isAlumni) return false;
      if (!u.full_name) return false;
      if (u.visible_in_directory === false) return false;
      // School match
      if (schoolCode || schoolName) {
        const uCode = (u.school_code || '').toLowerCase();
        const uName = (u.school_name || u.school || u.university || '').toLowerCase();
        if (!((schoolCode && uCode === schoolCode) || (schoolName && uName === schoolName))) return false;
      }
      const rawCompany = (u.company || u.current_company || u.employer || '').trim();
      if (!rawCompany) return false;
      const key = normalizeCompanyName(rawCompany);
      if (!key || INVALID.includes(key)) return false;
      return true;
    });

    // Build quick lookup: normalized_company → { alumni: [], parents: [] }
    const companyNetworkMap = {};
    for (const u of networkMembers) {
      const rawCompany = (u.company || u.current_company || u.employer || '').trim();
      const key = normalizeCompanyName(rawCompany);
      if (!companyNetworkMap[key]) companyNetworkMap[key] = { alumni: [], parents: [] };
      const isParent = u.persona === 'parent' || (Array.isArray(u.roles) && u.roles.includes('parent'));
      const member = {
        id: u.id,
        full_name: u.full_name,
        title: u.job_title || u.current_position || u.position || '',
        industry: u.industry || '',
        graduation_year: u.graduation_year || u.class_year || '',
        linkedin_url: u.linkedin_url || null,
        student_name: isParent ? (u.student_name || null) : null,
        persona: isParent ? 'parent' : 'alumni',
      };
      if (isParent) companyNetworkMap[key].parents.push(member);
      else companyNetworkMap[key].alumni.push(member);
    }

    // ─── Step 3: Find industry-matched parents (any company) ────────────────
    const industryKeywords = getMemberKeywords(targetIndustries);
    const industryParents = networkMembers.filter(u => {
      const isParent = u.persona === 'parent' || (Array.isArray(u.roles) && u.roles.includes('parent'));
      if (!isParent) return false;
      return memberInIndustry({
        title: u.job_title || u.current_position || u.position || '',
        industry: u.industry || '',
        bio: u.bio || '',
      }, industryKeywords);
    });

    // ─── Step 4: Build final premium cards ──────────────────────────────────
    // FIX: Alumni are a BACKDOOR CHANNEL regardless of their internal department.
    // We keep the job pool strictly industry-targeted (Gate 1), but we look for
    // ANY alumni at the company — not just ones whose profile tags match the industry (Gate 2 removed).
    // Parents are still filtered by industry for targeted advisory value.

    const premiumCards = [];

    for (const job of jobPool) {
      const normalizedJobCompany = normalizeCompanyName(job.company);

      // Find network entry for this company — exact match first, then partial
      let networkEntry = companyNetworkMap[normalizedJobCompany];
      if (!networkEntry) {
        for (const [key, val] of Object.entries(companyNetworkMap)) {
          if (key.includes(normalizedJobCompany) || normalizedJobCompany.includes(key)) {
            networkEntry = val;
            break;
          }
        }
      }

      // Tier 2 (LOOSENED): ANY alumni at this company qualify as a backdoor lever,
      // regardless of their specific role or department.
      const alumni = networkEntry?.alumni || [];
      // Also count parents at this company as a weak alumni signal — they can route resumes too
      const parentsAtCompany = networkEntry?.parents || [];

      // Must have at least one warm connection (alumni OR parent at this specific company)
      if (alumni.length === 0 && parentsAtCompany.length === 0) continue;

      // Tier 3: Parent advisory bonus — industry-matched parents (any company)
      const industryParentAdvisors = industryParents.slice(0, 3);
      const allParentAdvisors = [...new Map(
        [...parentsAtCompany, ...industryParentAdvisors].map(p => [p.id, p])
      ).values()];

      // Pick a representative parent advisor for the card copy
      const featuredParent = allParentAdvisors.find(p =>
        memberInIndustry({ title: p.title, industry: p.industry, bio: '' }, industryKeywords)
      ) || allParentAdvisors[0] || null;

      premiumCards.push({
        company: job.company,
        role: job.role,
        jobDescription: job.description,
        targetIndustry: targetIndustries[0] || '',
        matchedIndustries: targetIndustries,
        alumniCount: alumni.length,
        parentCount: allParentAdvisors.length,
        alumni: alumni.slice(0, 5),
        featuredParent: featuredParent ? {
          full_name: featuredParent.full_name,
          title: featuredParent.title,
          persona: 'parent',
        } : null,
        hasParentBonus: allParentAdvisors.length > 0,
        networkWeight: Math.min(98, 60 + alumni.length * 10 + (allParentAdvisors.length > 0 ? 14 : 0)),
        _members: [...alumni.slice(0, 3), ...parentsAtCompany.slice(0, 3)],
      });

      if (premiumCards.length >= 6) break;
    }

    // ─── Fallback: If strict company matching produced nothing, surface jobs
    // from the pool paired with any industry-matched parents as advisory cards.
    // This ensures the user always sees something actionable.
    if (premiumCards.length === 0 && industryParents.length > 0) {
      const fallbackJobs = jobPool.slice(0, 3);
      for (const job of fallbackJobs) {
        const advisors = industryParents.slice(0, 3);
        premiumCards.push({
          company: job.company,
          role: job.role,
          jobDescription: job.description,
          targetIndustry: targetIndustries[0] || '',
          matchedIndustries: targetIndustries,
          alumniCount: 0,
          parentCount: advisors.length,
          alumni: [],
          featuredParent: advisors[0] ? { full_name: advisors[0].full_name, title: advisors[0].title, persona: 'parent' } : null,
          hasParentBonus: advisors.length > 0,
          networkWeight: Math.min(75, 50 + advisors.length * 8),
          _members: advisors.slice(0, 3),
        });
      }
    }

    console.log(`[getPersonalizedNetworkCarousel] Built ${premiumCards.length} premium cards for industries: [${targetIndustries.join(', ')}]`);
    return Response.json({
      success: true,
      cards: premiumCards,
      wasFiltered: targetIndustries.length > 0,
      targetIndustries,
    });

  } catch (error) {
    console.error('[getPersonalizedNetworkCarousel]', error.message);
    return Response.json({ error: error.message, cards: [] }, { status: 500 });
  }
});