import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * getVerifiedNetworkCompanies
 *
 * When target_industries are passed, strictly filters to only companies
 * where verified alumni/parents work in those industries or matching roles.
 * Falls back to general network density if no targets provided.
 */

// Map CFF industry labels to keywords that appear in job titles / industry fields
const INDUSTRY_KEYWORDS = {
  'finance': ['finance', 'financial', 'investment', 'banking', 'capital', 'wealth', 'equity', 'trading', 'accounting', 'cfo', 'analyst'],
  'human resources': ['hr', 'human resources', 'talent', 'recruiting', 'recruiter', 'people ops', 'people operations', 'workforce', 'hris', 'benefits'],
  'creative': ['creative', 'design', 'designer', 'marketing', 'brand', 'content', 'media', 'advertising', 'art', 'ux', 'ui', 'copywriter'],
  'entrepreneur': ['founder', 'co-founder', 'ceo', 'owner', 'entrepreneur', 'startup', 'venture', 'managing partner'],
  'tech': ['software', 'engineer', 'developer', 'product', 'data', 'ai', 'ml', 'machine learning', 'cloud', 'saas', 'fullstack', 'backend', 'frontend'],
  'consulting': ['consultant', 'consulting', 'strategy', 'advisory', 'management consulting', 'mckinsey', 'deloitte', 'bcg', 'bain'],
  'healthcare': ['health', 'medical', 'nurse', 'doctor', 'hospital', 'pharma', 'biotech', 'clinical', 'healthcare'],
  'real_estate': ['real estate', 'realty', 'property', 'broker', 'mortgage', 'cre', 'leasing'],
  'law': ['attorney', 'lawyer', 'legal', 'counsel', 'law', 'litigation', 'paralegal', 'esquire'],
  'nonprofit': ['nonprofit', 'non-profit', 'ngo', 'foundation', 'charity', 'social impact', 'advocacy'],
  'government': ['government', 'federal', 'state', 'county', 'city', 'public sector', 'policy', 'agency', 'department of'],
  'education': ['teacher', 'professor', 'education', 'school', 'university', 'college', 'curriculum', 'academic'],
  'media': ['media', 'entertainment', 'film', 'tv', 'television', 'radio', 'news', 'journalism', 'publishing', 'podcast', 'streaming', 'production', 'studio'],
  'media and entertainment': ['media', 'entertainment', 'film', 'tv', 'television', 'radio', 'news', 'journalism', 'publishing', 'podcast', 'streaming', 'production', 'studio'],
  'sports': ['sports', 'athletic', 'fitness', 'coaching', 'nfl', 'nba', 'mlb', 'nhl', 'espn', 'league'],
  'marketing': ['marketing', 'brand', 'advertising', 'pr', 'public relations', 'growth', 'seo', 'social media', 'digital marketing'],
  'sales': ['sales', 'account executive', 'business development', 'bdr', 'sdr', 'revenue', 'account manager'],
  'supply chain': ['supply chain', 'logistics', 'operations', 'procurement', 'inventory', 'warehouse', 'distribution'],
  'real estate': ['real estate', 'realty', 'property', 'broker', 'mortgage', 'cre', 'leasing'],
};

function memberMatchesIndustries(member, targetIndustries) {
  if (!targetIndustries || targetIndustries.length === 0) return true;
  const haystack = [
    member.title || '',
    member.industry || '',
    member.bio || '',
  ].join(' ').toLowerCase();

  return targetIndustries.some(ind => {
    const keywords = INDUSTRY_KEYWORDS[ind.toLowerCase()] || [ind.toLowerCase()];
    return keywords.some(kw => haystack.includes(kw));
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Accept target_industries from request body (optional)
    let targetIndustries = [];
    try {
      const body = await req.json().catch(() => ({}));
      // Accept both "industries" and "target_industries" keys
      targetIndustries = body.target_industries || body.industries || [];
    } catch {}

    // Also fall back to user's saved goals/onboarding industries
    if (!targetIndustries.length) {
      targetIndustries = user.career_goals?.target_industries
        || user.industries_interested
        || user.industries_of_interest
        || [];
    }

    const schoolCode = (user.school_code || '').toLowerCase();
    const schoolName = (user.school_name || user.school || user.university || '').toLowerCase();

    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);

    const companyMap = {};

    for (const u of (allUsers || [])) {
      const isParent = u.persona === 'parent' || (Array.isArray(u.roles) && u.roles.includes('parent'));
      const isAlumni = u.persona === 'alumni' || (Array.isArray(u.roles) && u.roles.includes('alumni'));
      if (!isParent && !isAlumni) continue;
      if (!u.full_name) continue;
      if (u.visible_in_directory === false) continue;

      // School isolation
      if (schoolCode || schoolName) {
        const uCode = (u.school_code || '').toLowerCase();
        const uName = (u.school_name || u.school || u.university || '').toLowerCase();
        const codeMatch = schoolCode && uCode === schoolCode;
        const nameMatch = schoolName && uName === schoolName;
        if (!codeMatch && !nameMatch) continue;
      }

      const rawCompany = (u.company || u.current_company || u.employer || '').trim();
      if (!rawCompany) continue;

      const key = rawCompany.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
      if (!key) continue;

      const INVALID_COMPANY_KEYWORDS = [
        'self', 'self employed', 'selfemployed', 'self-employed',
        'retired', 'retirement', 'none', 'n/a', 'na', 'not applicable',
        'unemployed', 'unemployed currently', 'stay at home', 'homemaker',
        'housewife', 'househusband', 'looking for work', 'job searching', 'between jobs',
      ];
      if (INVALID_COMPANY_KEYWORDS.includes(key)) continue;

      // Build member preview object (needed for industry matching)
      const memberPreview = {
        id: u.id,
        full_name: u.full_name,
        title: u.job_title || u.current_position || u.position || '',
        industry: u.industry || '',
        bio: u.bio || '',
        persona: isParent ? 'parent' : 'alumni',
        graduation_year: u.graduation_year || u.class_year || '',
        linkedin_url: u.linkedin_url || null,
        student_name: isParent ? (u.student_name || null) : null,
        ways_to_help: u.ways_to_help || [],
      };

      // Strict industry filter — if targets set, only include industry-matching members
      const industryMatch = memberMatchesIndustries(memberPreview, targetIndustries);
      if (!industryMatch) continue;

      if (!companyMap[key]) {
        companyMap[key] = {
          company: rawCompany,
          alumniCount: 0,
          parentCount: 0,
          members: [],
          // Track which industries are represented at this company
          matchedIndustries: new Set(),
        };
      }

      if (isAlumni) companyMap[key].alumniCount++;
      if (isParent) companyMap[key].parentCount++;

      // Track matched industries for the UI insight copy
      targetIndustries.forEach(ind => {
        const keywords = INDUSTRY_KEYWORDS[ind.toLowerCase()] || [ind.toLowerCase()];
        const haystack = [memberPreview.title, memberPreview.industry].join(' ').toLowerCase();
        if (keywords.some(kw => haystack.includes(kw))) {
          companyMap[key].matchedIndustries.add(ind);
        }
      });

      if (companyMap[key].members.length < 10) {
        companyMap[key].members.push(memberPreview);
      }
    }

    // Serialize and sort
    const companies = Object.values(companyMap)
      .filter(c => c.alumniCount + c.parentCount > 0)
      .map(c => ({
        ...c,
        matchedIndustries: Array.from(c.matchedIndustries),
      }))
      .sort((a, b) => (b.alumniCount + b.parentCount) - (a.alumniCount + a.parentCount))
      .slice(0, 20);

    const wasFiltered = targetIndustries.length > 0;
    console.log(`[getVerifiedNetworkCompanies] ${companies.length} companies | filtered by industries: [${targetIndustries.join(', ')}]`);

    return Response.json({ success: true, companies, wasFiltered, targetIndustries });

  } catch (error) {
    console.error('[getVerifiedNetworkCompanies]', error.message);
    return Response.json({ error: error.message, companies: [] }, { status: 500 });
  }
});