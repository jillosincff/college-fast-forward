import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

function inferIndustryFromRole(role) {
  if (!role) return null;
  const r = role.toLowerCase();
  const map = [
    { k: ['nurse','nursing','rn ','lpn','cna','physical therapist','occupational therapist','physician','doctor','medical','healthcare','hospital','clinical','pharmacist','pharmacy','surgeon','dentist','dental','radiologist','speech therapist','respiratory','paramedic','emt ','health','patient care'], v: 'Healthcare & Pharmaceuticals' },
    { k: ['investment banking','banker','finance','financial','accounting','accountant','cpa','portfolio','wealth management','private equity','hedge fund','trading','trader','actuary','insurance'], v: 'Finance & Insurance' },
    { k: ['software','engineer','developer','coding','programming','data science','data scientist','machine learning','product manager','ux ','ui ','cyber','devops','cloud','tech','information technology'], v: 'Technology, Information & Media' },
    { k: ['marketing','brand','advertising','social media','content','public relations','communications','digital marketing','seo','copywriter','creative'], v: 'Advertising & PR' },
    { k: ['sports','entertainment','music','film',' tv ','television','journalism','broadcast','athletic','coaching','talent agent'], v: 'Sports & Entertainment' },
    { k: ['consulting','consultant','strategy','management consulting','advisory'], v: 'Professional Services' },
    { k: ['teacher','teaching','education','school','professor','tutor','curriculum','instructional'], v: 'Education & Training' },
    { k: ['real estate','property','construction','architecture','contractor'], v: 'Construction & Agriculture' },
    { k: ['retail','consumer goods','merchandise','buying','fashion','apparel','ecommerce','e-commerce'], v: 'Retail & Consumer Goods' },
    { k: ['law','lawyer','attorney','legal','paralegal','litigation','compliance'], v: 'Professional Services' },
    { k: ['government','federal','policy','public sector','nonprofit','non-profit','ngo','advocacy'], v: 'Government & Public Sector' },
    { k: ['logistics','supply chain','transportation','shipping','warehouse','procurement'], v: 'Transportation & Logistics' },
  ];
  for (const { k, v } of map) {
    if (k.some(kw => r.includes(kw))) return v;
  }
  return null;
}

async function getExternalRecs(base44, role, industriesStr, locationsStr, primarySize, secondarySize, existingTargets) {
  const prompt = `You are a career research assistant helping a college student find companies actively hiring right now.

Student profile:
- Target role: ${role}
- Industries of interest: ${industriesStr}
- Preferred locations: ${locationsStr}
- Company size preference: primarily ${primarySize}${secondarySize}
${existingTargets ? `- Already has these as targets (do NOT suggest these): ${existingTargets}` : ''}

Find 5 companies that are actively hiring ${role} positions in ${industriesStr} right now.
Weight your suggestions toward ${primarySize}.
Include a mix of well-known and lesser-known companies when possible.
For each company, explain in one short sentence why it specifically fits this student's profile.

Return exactly 5 companies as a JSON array.`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
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
              size: { type: 'string', enum: ['startup', 'mid', 'large'] },
              hiring_signal: { type: 'string', enum: ['hot', 'warm', 'cool'] },
              hiring_description: { type: 'string' },
              why_recommended: { type: 'string' },
              careers_url: { type: 'string' },
            },
          },
        },
      },
    },
  });

  return result?.companies || [];
}

async function getCFFNetworkMatches(base44, industriesArr, targetCompaniesArr, studentSchool) {
  const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);

  const industriesLower = industriesArr.map(i => i.toLowerCase());
  const companiesLower = targetCompaniesArr.map(c => c.toLowerCase());
  const schoolWord = (studentSchool || '').toLowerCase().split(' ')[0];

  // Include all parents/alumni with a company set, unless explicitly opted out
  const eligible = allUsers.filter(u => {
    if (u.persona !== 'parent' && u.persona !== 'alumni') return false;
    // Skip only if they've explicitly opted out
    if (u.show_in_directory === false || u.directory_visible === false || u.is_directory_visible === false) return false;
    const company = (u.company || u.current_company || '').trim();
    if (!company) return false;
    const uIndustry = (typeof u.industry === 'string' ? u.industry : Array.isArray(u.expertise_areas) ? u.expertise_areas.join(' ') : (u.expertise_areas || '')).toLowerCase();
    const uCompany = company.toLowerCase();
    // Broad industry match — check any keyword overlap
    const industryKeywords = industriesLower.flatMap(i => i.toLowerCase().split(/[,&\s]+/).filter(w => w.length > 3));
    const industryMatch = industriesLower.length === 0 || industryKeywords.some(kw => uIndustry.includes(kw));
    const companyMatch = companiesLower.some(c => c && uCompany.includes(c));
    return industryMatch || companyMatch;
  });

  // Group by company
  const companyMap = {};
  for (const u of eligible) {
    const company = (u.company || u.current_company || '').trim();
    if (!company) continue;
    if (!companyMap[company]) {
      companyMap[company] = { name: company, connections: [], alumni_count: 0, parent_count: 0 };
    }
    const uSchool = (u.school || u.university || '').toLowerCase();
    const isSchoolMatch = schoolWord && uSchool.includes(schoolWord);
    companyMap[company].connections.push({
      persona: u.persona,
      role: u.role_title || u.current_role || '',
      school_match: isSchoolMatch,
    });
    if (u.persona === 'alumni') companyMap[company].alumni_count++;
    else companyMap[company].parent_count++;
  }

  return Object.values(companyMap).map(c => {
    const hasAlumni = c.alumni_count > 0;
    const hasParent = c.parent_count > 0;
    const schoolMatch = c.connections.some(conn => conn.school_match);
    const connectionType = hasAlumni && hasParent ? 'both' : hasAlumni ? 'alumni' : 'parent';
    const sampleRoles = [...new Set(c.connections.map(conn => conn.role).filter(Boolean))].slice(0, 3);
    return {
      name: c.name,
      cff_connection_count: c.connections.length,
      connection_type: connectionType,
      school_match: schoolMatch,
      sample_roles: sampleRoles,
    };
  });
}

function mergeAndRank(external, internal, sizePref) {
  const internalMap = {};
  for (const c of internal) internalMap[c.name.toLowerCase()] = c;

  const seen = new Set();
  const scored = [];

  for (const c of external) {
    const key = c.name.toLowerCase();
    seen.add(key);
    const cffData = internalMap[key];
    let score = 1; // external only baseline
    if (cffData) {
      score += 3; // appears in both
    }
    if (c.hiring_signal === 'hot') score += 2;
    else if (c.hiring_signal === 'warm') score += 1;
    if (sizePref[0] && c.size === sizePref[0]) score += 1;
    if (cffData?.school_match) score += 0.5;

    // Build merged why_recommended
    let why = c.why_recommended || '';
    if (cffData && cffData.cff_connection_count > 0) {
      if (c.hiring_signal === 'hot' || c.hiring_signal === 'warm') {
        why = `Actively hiring + ${cffData.cff_connection_count} CFF connection${cffData.cff_connection_count > 1 ? 's' : ''} — your strongest opportunity`;
      } else {
        why = `${cffData.cff_connection_count} CFF connection${cffData.cff_connection_count > 1 ? 's' : ''} work here — warm path available`;
      }
    }

    scored.push({ ...c, score, cff_data: cffData || null, why_recommended: why });
  }

  // Add internal-only companies (not in external results)
  for (const c of internal) {
    const key = c.name.toLowerCase();
    if (seen.has(key)) continue;
    scored.push({
      name: c.name,
      industry: '',
      size: null,
      hiring_signal: 'warm',
      hiring_description: `${c.cff_connection_count} CFF member${c.cff_connection_count > 1 ? 's' : ''} work here.`,
      why_recommended: `${c.cff_connection_count} CFF connection${c.cff_connection_count > 1 ? 's' : ''} work here — warm path available`,
      careers_url: '',
      score: 2 + (c.school_match ? 0.5 : 0),
      cff_data: c,
    });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const goals = body.career_goals || user.career_goals || {};

    // Apply fallback defaults
    const role = goals.role || user.target_role || 'entry-level roles';

    // Infer industry from role if none saved
    let rawIndustries = goals.industries?.length > 0 ? goals.industries
      : user.target_industries?.length > 0 ? user.target_industries : [];
    if (rawIndustries.length === 0) {
      const inferred = inferIndustryFromRole(role);
      if (inferred) {
        rawIndustries = [inferred];
        console.log(`Inferred industry "${inferred}" from role "${role}"`);
      }
    }
    const industriesArr = rawIndustries.length > 0 ? rawIndustries : ['general business'];
    const locationsArr = (goals.locations?.length > 0) ? goals.locations
      : (user.location_preferences?.length > 0) ? user.location_preferences : ['United States'];
    const targetCompaniesArr = goals.target_companies || user.target_companies || [];
    const studentSchool = user.school || user.university || '';

    const sizePref = (goals.company_size_preference?.length > 0) ? goals.company_size_preference : ['large', 'mid', 'startup'];
    const sizeLabels = {
      large: 'large enterprise companies (1000+ employees)',
      mid: 'mid-size companies (100-999 employees)',
      startup: 'startups (under 100 employees)',
    };
    const primarySize = sizeLabels[sizePref[0]] || 'a balanced mix of company sizes';
    const secondarySize = sizePref[1] ? ` and some ${sizeLabels[sizePref[1]]}` : '';
    const existingTargets = targetCompaniesArr.join(', ');
    const industriesStr = industriesArr.join(', ');
    const locationsStr = locationsArr.join(', ');

    console.log('Starting company recommendations query for:', JSON.stringify({ role, industriesStr, locationsStr, primarySize }));

    // Run both queries in parallel — fault tolerant via allSettled
    const makeExternalCall = () => Promise.race([
      getExternalRecs(base44, role, industriesStr, locationsStr, primarySize, secondarySize, existingTargets),
      new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 40000)),
    ]);
    const makeInternalCall = () => getCFFNetworkMatches(base44, industriesArr, targetCompaniesArr, studentSchool);

    const [externalResult, internalResult] = await Promise.allSettled([
      makeExternalCall(),
      makeInternalCall(),
    ]);

    const external = externalResult.status === 'fulfilled' ? (externalResult.value || []) : [];
    const internal = internalResult.status === 'fulfilled' ? (internalResult.value || []) : [];

    if (externalResult.status === 'rejected') console.warn('External query failed:', externalResult.reason?.message);
    if (internalResult.status === 'rejected') console.warn('Internal CFF query failed:', internalResult.reason?.message);

    console.log('External results count:', external.length);
    console.log('Internal CFF results count:', internal.length);

    const finalExternal = external;

    // If both failed, fall back to hardcoded industry-specific companies
    let companies;
    if (finalExternal.length === 0 && internal.length === 0) {
      console.log('Both sources empty — using hardcoded industry fallback');
      const HARDCODED = {
        'Healthcare & Pharmaceuticals': [
          { name: 'HCA Healthcare', industry: 'Healthcare', size: 'large', hiring_signal: 'hot', hiring_description: 'One of the largest hospital networks in the US, consistently hiring nurses across hundreds of facilities.' },
          { name: 'CVS Health', industry: 'Healthcare', size: 'large', hiring_signal: 'hot', hiring_description: 'Hiring nurses and clinical staff for pharmacy and MinuteClinic locations nationwide.' },
          { name: 'Mayo Clinic', industry: 'Healthcare', size: 'large', hiring_signal: 'warm', hiring_description: 'World-renowned medical center with strong nursing programs and career development.' },
        ],
        'Finance & Insurance': [
          { name: 'JPMorgan', industry: 'Finance', size: 'large', hiring_signal: 'hot', hiring_description: 'Large-scale hiring for finance and operations roles nationwide.' },
          { name: 'Goldman Sachs', industry: 'Finance', size: 'large', hiring_signal: 'warm', hiring_description: 'Summer analyst applications open for investment banking division.' },
          { name: 'Deloitte', industry: 'Consulting', size: 'large', hiring_signal: 'hot', hiring_description: 'Hiring consultants and business analysts nationwide.' },
        ],
      };
      const primaryIndustry = industriesArr[0] || '';
      const fallbackList = HARDCODED[primaryIndustry] || [
        { name: 'Deloitte', industry: 'Consulting', size: 'large', hiring_signal: 'hot', hiring_description: 'Hiring consultants and business analysts nationwide.' },
        { name: 'Amazon', industry: 'Technology', size: 'large', hiring_signal: 'hot', hiring_description: 'Hiring across logistics, technology, and business operations.' },
        { name: 'JPMorgan', industry: 'Finance', size: 'large', hiring_signal: 'hot', hiring_description: 'Large-scale hiring for finance and operations roles.' },
      ];
      companies = fallbackList.map(c => ({ ...c, why_recommended: `Actively hiring in ${primaryIndustry || 'your target industries'} right now`, cff_data: null, is_fallback: true }));
      console.log('Hardcoded fallback returned:', companies.length, 'companies');
    } else {
      companies = mergeAndRank(finalExternal, internal, sizePref);
    }

    console.log('Rendering', companies.length, 'company cards');

    return Response.json({
      companies,
      is_fallback: finalExternal.length === 0 && internal.length === 0,
      generated_at: new Date().toISOString(),
      internal_generated_at: new Date().toISOString(),
    });

  } catch (error) {
    console.error('getFreeTierCompanyRecs error:', error.message);
    return Response.json({ error: error.message, companies: [] }, { status: 500 });
  }
});