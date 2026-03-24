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
  healthcare: ['healthcare', 'medical', 'hospital', 'pharma', 'biotech', 'clinical', 'nursing', 'health system', 'dentistry', 'physician'],
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

function scoreMatch(member, clusterKeywords) {
  const text = [member.industry, member.industries, member.job_title, member.current_role, member.current_position, member.company, member.current_company, member.expertise_areas, member.bio].filter(Boolean).join(' ').toLowerCase();
  return clusterKeywords.filter(k => text.includes(k)).length;
}

const GENERIC_TITLES = ['professional', 'member', 'user', 'n/a', 'na', ''];

function getDisplayTitle(member) {
  const raw = (member.job_title || member.current_role || member.current_position || '').trim();
  if (GENERIC_TITLES.includes(raw.toLowerCase())) {
    if (member.industry) return `${member.industry} Professional`;
    if (member.persona === 'parent') return 'CFF Parent';
    return 'CFF Member';
  }
  return raw;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { student_id } = await req.json();
    if (student_id !== user.id) return Response.json({ error: 'Can only fetch own leads' }, { status: 403 });

    const student = await base44.asServiceRole.entities.User.get(student_id);
    if (!student) return Response.json({ redHot: [], redHotTotal: 0, error: 'Student not found' });

    const studentSchool = normalizeSchool(student.school || student.university || '');
    const studentSchools = Array.isArray(student.schools) && student.schools.length > 0
      ? student.schools.map(s => normalizeSchool(s)).filter(Boolean) : [];
    if (studentSchool && !studentSchools.includes(studentSchool)) studentSchools.push(studentSchool);

    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 2000);

    const careerGoals = student.career_goals || {};
    const industries = [...(Array.isArray(careerGoals.target_industries) ? careerGoals.target_industries : [careerGoals.target_industries].filter(Boolean)), ...(Array.isArray(student.target_industries) ? student.target_industries : [])].filter(Boolean);
    const roles = [...(Array.isArray(careerGoals.target_roles) ? careerGoals.target_roles : [careerGoals.target_roles].filter(Boolean)), ...(Array.isArray(student.target_roles) ? student.target_roles : [])].filter(Boolean);

    const clusterKeywords = getClusterKeywords(industries, roles);

    const getSharedSchools = (member) => {
      const ms = normalizeSchool(member.school || member.university || '');
      const memberSchools = Array.isArray(member.schools) && member.schools.length > 0
        ? member.schools.map(s => normalizeSchool(s)).filter(Boolean) : [ms].filter(Boolean);
      return studentSchools.filter(ss => memberSchools.includes(ss) || ss === ms);
    };

    // FIX 8: Exclude student by both id and email
    const sameSchoolMembers = allUsers.filter(u => {
      if (u.id === student_id || u.email === student.email) return false;
      if (u.show_in_directory === false) return false;
      const ms = normalizeSchool(u.school || u.university || '');
      if (!studentSchools.includes(ms) || ms === '') return false;
      return u.persona === 'parent' || u.roles?.includes('parent') ||
        (u.persona === 'alumni' && (u.alumni_intent === 'giving_help' || u.help_types?.includes('career') || u.intro_availability === 'happy_to_help'));
    });

    // Only show score > 0
    const relevantMembers = sameSchoolMembers
      .filter(u => scoreMatch(u, clusterKeywords) > 0)
      .sort((a, b) => {
        const sB = scoreMatch(b, clusterKeywords) + (getSharedSchools(b).length > 1 ? 2 : 0);
        const sA = scoreMatch(a, clusterKeywords) + (getSharedSchools(a).length > 1 ? 2 : 0);
        return sB - sA;
      })
      .slice(0, 20);

    // Generate briefings for top 10
    let briefings = {};
    if (relevantMembers.length > 0 && (industries.length > 0 || roles.length > 0)) {
      try {
        const targetDesc = [...roles, ...industries].join(', ') || 'their target field';
        const memberList = relevantMembers.slice(0, 10).map((m, i) => {
          const title = getDisplayTitle(m);
          const company = m.company || m.current_company || '';
          return `${i}: ${m.full_name || 'Member'} — ${title}${company ? ' at ' + company : ''} — industry: ${m.industry || 'not listed'}`;
        }).join('\n');

        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `For a student targeting "${targetDesc}", generate a 10-word-max briefing for why each person is a valuable connection. Return JSON object where keys are index numbers as strings, values are plain text (no markdown, no quotes around the value itself).\n\nMembers:\n${memberList}`,
          response_json_schema: { type: 'object', properties: {}, additionalProperties: { type: 'string' } }
        });
        briefings = result || {};
      } catch (e) { console.warn('Briefing generation failed:', e.message); }
    }

    const redHot = relevantMembers.map((member, i) => {
      const shared = getSharedSchools(member);
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
        briefing: briefings[String(i)] || '',
        match_score: scoreMatch(member, clusterKeywords) + (shared.length > 1 ? 2 : 0),
      };
    });

    // Generate warm leads target companies + teaser roles
    let targetCompanies = (careerGoals.target_companies || []);
    if (careerGoals.dream_company && careerGoals.dream_company !== 'Not specified') {
      targetCompanies = [careerGoals.dream_company, ...targetCompanies];
    }

    let warmLeadsData = [];
    let exploreChips = [];

    if (industries.length > 0 || roles.length > 0) {
      const targetDesc = [...roles, ...industries].join(', ');
      const location = careerGoals.location_preference || 'the US';

      // Auto-generate companies if needed
      if (targetCompanies.length === 0) {
        try {
          const llm = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `Generate 12 real, well-known companies a student targeting "${targetDesc}" in ${location} should target. Mix large and mid-size. Return JSON: { "companies": ["Company1", ...] }`,
            response_json_schema: { type: 'object', properties: { companies: { type: 'array', items: { type: 'string' } } } },
          });
          targetCompanies = llm?.companies || [];
          exploreChips = targetCompanies;
        } catch (e) { console.warn('Company gen failed:', e.message); }
      } else {
        exploreChips = targetCompanies;
      }

      // Fetch alumni counts + teaser roles in parallel
      const warmResults = await Promise.all(
        targetCompanies.slice(0, 10).map(async (company) => {
          try {
            const [alumniResult, teaserResult] = await Promise.all([
              base44.asServiceRole.integrations.Core.InvokeLLM({
                prompt: `How many ${studentSchool || 'University of Florida'} alumni currently work at ${company}? Return JSON: { "company": "${company}", "alumni_count": number|null, "confidence": "high|medium|low", "hiring_signal": "active|selective|freeze|unknown", "industry": "string", "location": "string" }. Return null for alumni_count if uncertain.`,
                add_context_from_internet: true,
                model: 'gemini_3_flash',
                response_json_schema: { type: 'object', properties: { company: { type: 'string' }, alumni_count: { type: 'number' }, confidence: { type: 'string' }, hiring_signal: { type: 'string' }, industry: { type: 'string' }, location: { type: 'string' } } },
              }),
              base44.asServiceRole.integrations.Core.InvokeLLM({
                prompt: `Generate 3 realistic job titles that ${studentSchool || 'University of Florida'} alumni working at ${company} in the field of "${targetDesc}" might hold. Real titles only. Return JSON: { "roles": ["Title1", "Title2", "Title3"] }`,
                response_json_schema: { type: 'object', properties: { roles: { type: 'array', items: { type: 'string' } } } },
              }),
            ]);
            if (!alumniResult || alumniResult.alumni_count === null || alumniResult.confidence === 'low') return null;
            return { ...alumniResult, teaser_roles: teaserResult?.roles || [] };
          } catch { return null; }
        })
      );

      warmLeadsData = warmResults.filter(r => r && r.alumni_count > 0).sort((a, b) => b.alumni_count - a.alumni_count);
    }

    return Response.json({
      redHot,
      redHotTotal: redHot.length,
      warmLeads: warmLeadsData,
      exploreChips,
      studentSchool,
      studentSchools,
      hasGoals: industries.length > 0 || roles.length > 0,
      targetDesc: [...roles, ...industries].join(', '),
      debug: {
        totalUsersInDB: allUsers.length,
        sameSchoolTotal: sameSchoolMembers.length,
        relevantTotal: relevantMembers.length,
        studentIndustries: industries,
        studentRoles: roles,
      }
    });
  } catch (error) {
    console.error('getLeadsForStudent error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});