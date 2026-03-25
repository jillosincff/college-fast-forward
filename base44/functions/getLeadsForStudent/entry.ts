import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const SCHOOL_NAMES = {
  'uf': 'University of Florida', 'usc': 'University of Southern California',
  'osu': 'Ohio State University', 'ucf': 'University of Central Florida',
  'umich': 'University of Michigan', 'udel': 'University of Delaware',
  'uga': 'University of Georgia', 'psu': 'Penn State University',
  'tulane': 'Tulane University', 'umd': 'University of Maryland',
  'fau': 'Florida Atlantic University', 'fsu': 'Florida State University',
  'jmu': 'James Madison University', 'miami': 'University of Miami',
  'utexas': 'University of Texas', 'uky': 'University of Kentucky'
};

const normalizeSchool = (s) => SCHOOL_NAMES[s?.toLowerCase?.()?.trim?.()] || s?.trim?.() || '';

const INDUSTRY_CLUSTERS = {
  marketing: ['marketing', 'advertising', 'media', 'entertainment', 'communications', 'pr', 'public relations', 'brand', 'digital', 'content', 'creative', 'fashion', 'retail', 'consumer', 'music', 'film', 'tv', 'publishing', 'social media', 'agency', 'influencer', 'sports marketing'],
  finance: ['finance', 'banking', 'investment', 'accounting', 'insurance', 'real estate', 'private equity', 'hedge fund', 'wealth', 'asset management', 'fintech', 'cpa', 'audit'],
  technology: ['tech', 'technology', 'software', 'engineering', 'product', 'data', 'ai', 'startup', 'saas', 'cyber', 'it', 'information technology', 'developer', 'cloud'],
  consulting: ['consulting', 'strategy', 'advisory', 'management', 'operations', 'analyst', 'mckinsey', 'bain', 'deloitte', 'accenture'],
  healthcare: ['healthcare', 'medical', 'hospital', 'pharma', 'biotech', 'clinical', 'nursing', 'health system', 'dentistry', 'physician', 'speech', 'pathologist', 'therapist', 'rehabilitation'],
  legal: ['legal', 'law', 'attorney', 'lawyer', 'paralegal', 'compliance', 'regulatory', 'litigation'],
  nonprofit: ['nonprofit', 'ngo', 'foundation', 'social impact', 'advocacy', 'education', 'government', 'policy', 'public sector'],
  realestate: ['real estate', 'property', 'construction', 'reit', 'mortgage', 'broker', 'developer'],
  sales: ['sales', 'business development', 'account executive', 'revenue', 'bdr', 'sdr'],
};

function getClusterKeywords(industries, roles) {
  const keywords = new Set();
  const allTargets = [...industries.map(i => i.toLowerCase()), ...roles.map(r => r.toLowerCase())];
  allTargets.forEach(t => keywords.add(t));
  Object.entries(INDUSTRY_CLUSTERS).forEach(([, words]) => {
    if (allTargets.some(t => words.some(w => t.includes(w) || w.includes(t)))) {
      words.forEach(w => keywords.add(w));
    }
  });
  return Array.from(keywords);
}

// Returns which cluster a text blob most strongly belongs to
function getClusterKey(text) {
  const t = (text || '').toLowerCase();
  let best = null; let bestScore = 0;
  for (const [key, words] of Object.entries(INDUSTRY_CLUSTERS)) {
    const score = words.filter(w => t.includes(w)).length;
    if (score > bestScore) { bestScore = score; best = key; }
  }
  return bestScore > 0 ? best : null;
}

function scoreMatch(member, clusterKeywords, targetClusterKeys) {
  // Hard exclude: if member's explicit industry clearly belongs to a DIFFERENT cluster
  const memberIndustryText = (member.industry || member.industries || '').toLowerCase();
  if (memberIndustryText) {
    const memberCluster = getClusterKey(memberIndustryText);
    if (memberCluster && targetClusterKeys.length > 0 && !targetClusterKeys.includes(memberCluster)) {
      return 0;
    }
  }
  // Score only against structured fields — not bio (too noisy)
  const coreText = [
    member.industry, member.industries, member.job_title,
    member.current_role, member.current_position,
    member.company, member.current_company, member.expertise_areas
  ].filter(Boolean).join(' ').toLowerCase();
  return clusterKeywords.filter(k => coreText.includes(k)).length;
}

const GENERIC_TITLES = ['professional', 'member', 'user', 'n/a', 'na', '', 'cff member', 'cff parent', 'parent'];

function getDisplayTitle(member) {
  const raw = (member.job_title || member.current_role || member.current_position || '').trim();
  if (GENERIC_TITLES.includes(raw.toLowerCase())) {
    if (member.industry) return `${member.industry} Professional`;
    if (member.company || member.current_company) return `Works at ${member.company || member.current_company}`;
    if (member.persona === 'parent') return null;
    return null;
  }
  return raw;
}

// Minimum profile quality gate
function hasMinimumProfile(u) {
  const hasRealName = u.full_name &&
    u.full_name.includes(' ') &&
    !u.full_name.includes('@') &&
    u.full_name.toLowerCase() !== (u.email?.split('@')[0] || '').toLowerCase();
  const hasJobContext = u.job_title || u.current_role || u.current_position || u.industry || u.company || u.current_company || u.bio;
  return !!(hasRealName || hasJobContext);
}

// Exclude clearly off-field clinical titles from fallback
const EXCLUDE_TITLES = ['speech language pathologist','speech pathologist','physical therapist','occupational therapist','dentist','physician','doctor','nurse','veterinarian','pharmacist'];
function isRelevantFallback(u) {
  const title = (u.job_title || u.current_role || u.current_position || '').toLowerCase();
  return !EXCLUDE_TITLES.some(ex => title.includes(ex));
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { student_id } = await req.json();
    if (student_id !== user.id) return Response.json({ error: 'Can only fetch own leads' }, { status: 403 });

    const student = await base44.asServiceRole.entities.User.get(student_id);
    if (!student) return Response.json({ redHot: [], redHotTotal: 0, error: 'Student not found' });

    const studentEmail = student.email?.toLowerCase() || '';
    const studentSchool = normalizeSchool(student.school || student.university || '');
    const studentSchools = Array.isArray(student.schools) && student.schools.length > 0
      ? student.schools.map(s => normalizeSchool(s)).filter(Boolean) : [];
    if (studentSchool && !studentSchools.includes(studentSchool)) studentSchools.push(studentSchool);

    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 2000);

    const careerGoals = student.career_goals || {};
    const industries = [
      ...(Array.isArray(careerGoals.target_industries) ? careerGoals.target_industries : [careerGoals.target_industries].filter(Boolean)),
      ...(Array.isArray(student.target_industries) ? student.target_industries : [])
    ].filter(Boolean);
    const roles = [
      ...(Array.isArray(careerGoals.target_roles) ? careerGoals.target_roles : [careerGoals.target_roles].filter(Boolean)),
      ...(Array.isArray(student.target_roles) ? student.target_roles : [])
    ].filter(Boolean);
    const targetDesc = [...roles, ...industries].join(', ');

    const clusterKeywords = getClusterKeywords(industries, roles);

    // Determine which industry clusters the student's goals map to
    const targetClusterKeys = Object.entries(INDUSTRY_CLUSTERS)
      .filter(([, words]) => [...industries, ...roles].some(t =>
        words.some(w => t.toLowerCase().includes(w) || w.includes(t.toLowerCase()))
      ))
      .map(([key]) => key);

    console.log('Target cluster keys:', targetClusterKeys);
    console.log('Student industries:', industries, '| roles:', roles);

    const getSharedSchools = (member) => {
      const ms = normalizeSchool(member.school || member.university || '');
      const memberSchools = Array.isArray(member.schools) && member.schools.length > 0
        ? member.schools.map(s => normalizeSchool(s)).filter(Boolean) : [ms].filter(Boolean);
      return studentSchools.filter(ss => memberSchools.includes(ss) || ss === ms);
    };

    // Exclude: student themselves, admins, hidden profiles, wrong school
    const sameSchoolMembers = allUsers.filter(u => {
      if (u.id === student_id) return false;
      if (u.email?.toLowerCase() === studentEmail) return false;
      if (u.show_in_directory === false) return false;
      if (u.roles?.includes('admin') || u.role === 'admin') return false;
      const ms = normalizeSchool(u.school || u.university || '');
      if (!studentSchools.includes(ms) || ms === '') return false;
      // Include parents and any alumni (not just those explicitly offering help)
      return u.persona === 'parent' || u.roles?.includes('parent') ||
        u.persona === 'alumni' || u.roles?.includes('alumni');
    });

    console.log('Same-school members (pre-score):', sameSchoolMembers.length);

    // Quality-filtered base pool
    const qualityPool = sameSchoolMembers.filter(u => hasMinimumProfile(u));

    // Tier 1: strong match (score >= 2)
    const strongMatch = qualityPool.filter(u => scoreMatch(u, clusterKeywords, targetClusterKeys) >= 2);
    // Tier 2: weak match (score === 1)
    const weakMatchIds = new Set(strongMatch.map(u => u.id));
    const weakMatch = qualityPool.filter(u => scoreMatch(u, clusterKeywords, targetClusterKeys) === 1 && !weakMatchIds.has(u.id));
    // Tier 3: fallback — profile complete, relevant field, score 0
    const usedIds = new Set([...strongMatch, ...weakMatch].map(u => u.id));
    const fallback = qualityPool
      .filter(u => !usedIds.has(u.id) && isRelevantFallback(u))
      .sort((a, b) => new Date(b.updated_date || 0) - new Date(a.updated_date || 0));

    const relevantMembers = [...strongMatch, ...weakMatch, ...fallback].slice(0, 20);

    console.log('Same-school members (pre-score):', sameSchoolMembers.length);
    console.log('Relevant members after strict scoring:', relevantMembers.length);

    console.log('Relevant members after strict scoring:', relevantMembers.length);

    // Generate briefings
    let briefings = {};
    if (relevantMembers.length > 0 && targetDesc) {
      try {
        const memberList = relevantMembers.slice(0, 10).map((m, i) => {
          const title = getDisplayTitle(m);
          const company = m.company || m.current_company || '';
          return `${i}:\n- Name: ${m.full_name || 'Member'}\n- Title: ${title || 'not provided'}\n- Company: ${company || 'not provided'}\n- Industry: ${m.industry || 'not provided'}\n- Bio: ${m.bio || 'not provided'}\n- Expertise: ${Array.isArray(m.expertise_areas) ? m.expertise_areas.join(', ') : (m.expertise_areas || 'not provided')}`;
        }).join('\n\n');

        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `For each person below, generate a 1-sentence briefing (max 15 words) explaining why they are a relevant lead for a student targeting "${targetDesc}".\n\nONLY use information explicitly present in their profile data. DO NOT invent, infer, or embellish. If there is insufficient data to write a meaningful briefing, return null for that index.\n\nReturn JSON object where keys are index numbers as strings and values are plain text strings or null.\n\n${memberList}`,
          response_json_schema: { type: 'object', properties: {}, additionalProperties: { type: 'string' } }
        });
        briefings = result || {};
      } catch (e) { console.warn('Briefing generation failed:', e.message); }
    }

    const redHot = relevantMembers.map((member, i) => {
      const shared = getSharedSchools(member);
      const briefing = briefings[String(i)];
      return {
        id: member.id,
        full_name: member.full_name || member.name || '',
        job_title: getDisplayTitle(member),
        company: member.company || member.current_company || member.employer || '',
        industry: member.industry || '',
        school: normalizeSchool(member.school || member.university || ''),
        shared_schools: shared,
        persona: member.persona,
        email: member.email,
        linkedin_url: member.linkedin_url || '',
        briefing: (briefing && briefing !== 'null') ? briefing : '',
        match_score: scoreMatch(member, clusterKeywords, targetClusterKeys) + (shared.length > 1 ? 2 : 0),
      };
    });

    // Warm leads cache check
    const cachedAt = student.warm_leads_cached_at;
    const cacheAge = cachedAt ? Date.now() - new Date(cachedAt).getTime() : Infinity;
    const cacheValid = cacheAge < ONE_DAY_MS && student.warm_leads_cache?.length > 0;

    let warmLeadsData = [];
    let exploreChips = [];

    if (cacheValid) {
      warmLeadsData = student.warm_leads_cache;
      exploreChips = warmLeadsData.map(w => w.company);
      console.log('Using cached warm leads:', warmLeadsData.length);
    } else if (industries.length > 0 || roles.length > 0) {
      const location = careerGoals.location_preference || 'the US';
      const INVALID_COMPANY_VALUES = ['not sure yet', 'not specified', 'not specified yet', 'unsure', 'tbd', 'n/a', 'none', 'no dream company yet', 'no dream company', 'not sure', 'none yet', ''];
      let targetCompanies = (careerGoals.target_companies || []).filter(
        c => c && !INVALID_COMPANY_VALUES.includes(c.toLowerCase().trim())
      );
      if (careerGoals.dream_company && !INVALID_COMPANY_VALUES.includes((careerGoals.dream_company || '').toLowerCase().trim())) {
        targetCompanies = [careerGoals.dream_company, ...targetCompanies];
      }

      if (targetCompanies.length === 0) {
        try {
          const llm = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `Generate 12 real, well-known companies a student targeting "${targetDesc}" in ${location} should target. Mix large and mid-size. Return JSON: { "companies": ["Company1", ...] }`,
            response_json_schema: { type: 'object', properties: { companies: { type: 'array', items: { type: 'string' } } } },
          });
          targetCompanies = llm?.companies || [];
        } catch (e) { console.warn('Company gen failed:', e.message); }
      }

      exploreChips = targetCompanies;

      const COMPANY_LINKEDIN_URLS = {
        'NBCUniversal': 'https://www.linkedin.com/company/nbcuniversal',
        'The Walt Disney Company': 'https://www.linkedin.com/company/the-walt-disney-company',
        'ViacomCBS': 'https://www.linkedin.com/company/paramount',
        'Warner Bros. Entertainment': 'https://www.linkedin.com/company/warner-bros-entertainment',
        'Sony Music Entertainment': 'https://www.linkedin.com/company/sony-music',
        'Live Nation Entertainment': 'https://www.linkedin.com/company/live-nation-entertainment',
        'Goldman Sachs': 'https://www.linkedin.com/company/goldman-sachs',
        'JPMorgan Chase': 'https://www.linkedin.com/company/jpmorgan-chase',
        'Deloitte': 'https://www.linkedin.com/company/deloitte',
        'Google': 'https://www.linkedin.com/company/google',
        'Apple': 'https://www.linkedin.com/company/apple',
        'Microsoft': 'https://www.linkedin.com/company/microsoft',
        'Amazon': 'https://www.linkedin.com/company/amazon',
        'Meta': 'https://www.linkedin.com/company/meta',
        'CBRE': 'https://www.linkedin.com/company/cbre',
        'JLL': 'https://www.linkedin.com/company/jll',
        'Blackstone': 'https://www.linkedin.com/company/blackstone',
        'McKinsey': 'https://www.linkedin.com/company/mckinsey',
        'BCG': 'https://www.linkedin.com/company/boston-consulting-group',
        'Roc Nation': 'https://www.linkedin.com/company/roc-nation',
        'A24': 'https://www.linkedin.com/company/a24',
        'Spotify': 'https://www.linkedin.com/company/spotify',
        'Nike': 'https://www.linkedin.com/company/nike',
        'PwC': 'https://www.linkedin.com/company/pwc',
        'EY': 'https://www.linkedin.com/company/ernstandyoung',
        'Morgan Stanley': 'https://www.linkedin.com/company/morgan-stanley',
        'Bank of America': 'https://www.linkedin.com/company/bank-of-america',
        'Citi': 'https://www.linkedin.com/company/citi',
        'Salesforce': 'https://www.linkedin.com/company/salesforce',
        'Netflix': 'https://www.linkedin.com/company/netflix',
        'Adobe': 'https://www.linkedin.com/company/adobe',
      };

      const warmResults = await Promise.all(
        targetCompanies.slice(0, 10).map(async (company) => {
          try {
            const linkedInUrl = COMPANY_LINKEDIN_URLS[company];

            const [alumniResult, teaserResult] = await Promise.all([
              // Use Proxycurl for mapped companies, fall back for unmapped
              linkedInUrl
                ? base44.asServiceRole.functions.invoke('proxycurlService', {
                    action: 'getAlumniCount',
                    params: { companyName: company, companyLinkedInUrl: linkedInUrl, universityName: studentSchool || 'University of Florida' },
                  }).catch(() => ({ company, alumni_count: null, confidence: 'unknown', source: 'proxycurl_error', hiring_signal: 'unknown' }))
                : Promise.resolve({ company, alumni_count: null, confidence: 'unknown', source: 'not_mapped', hiring_signal: 'unknown' }),
              base44.asServiceRole.integrations.Core.InvokeLLM({
                prompt: `Generate 3 realistic job titles that ${studentSchool || 'University of Florida'} alumni working at ${company} in the field of "${targetDesc}" might hold. Real titles only. Return JSON: { "roles": ["Title1", "Title2", "Title3"] }`,
                response_json_schema: { type: 'object', properties: { roles: { type: 'array', items: { type: 'string' } } } },
              }),
            ]);

            if (!alumniResult) return null;
            return {
              company,
              alumni_count: alumniResult.alumni_count || null,
              confidence: alumniResult.confidence || 'unknown',
              source: alumniResult.source || 'unknown',
              hiring_signal: alumniResult.hiring_signal || 'unknown',
              teaser_roles: teaserResult?.roles || [],
              alumni_signal: true,
            };
          } catch (err) { return null; }
        })
      );

      warmLeadsData = warmResults
        .filter(r => r != null)
        .sort((a, b) => {
          if (a.alumni_count && !b.alumni_count) return -1;
          if (!a.alumni_count && b.alumni_count) return 1;
          return (b.alumni_count || 0) - (a.alumni_count || 0);
        });

      await base44.asServiceRole.entities.User.update(student_id, {
        warm_leads_cache: warmLeadsData,
        warm_leads_cached_at: new Date().toISOString(),
      });
      console.log('Saved fresh warm leads to cache:', warmLeadsData.length);
    }

    return Response.json({
      redHot,
      redHotTotal: redHot.length,
      warmLeads: warmLeadsData,
      exploreChips: exploreChips.length > 0 ? exploreChips : warmLeadsData.map(w => w.company),
      studentSchool,
      studentSchools,
      hasGoals: industries.length > 0 || roles.length > 0,
      targetDesc,
      debug: {
        totalUsersInDB: allUsers.length,
        sameSchoolTotal: sameSchoolMembers.length,
        relevantTotal: relevantMembers.length,
        targetClusterKeys,
        studentIndustries: industries,
        studentRoles: roles,
        warmLeadsCached: cacheValid,
      }
    });
  } catch (error) {
    console.error('getLeadsForStudent error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});