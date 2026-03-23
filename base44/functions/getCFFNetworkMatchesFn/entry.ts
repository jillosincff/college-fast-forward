import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

function inferIndustryFromRole(role) {
  if (!role) return null;
  const r = role.toLowerCase();
  const map = [
    // Construction BEFORE healthcare — order matters, first match wins
    { k: ['construction', 'superintendent', 'contractor', 'general contractor', 'subcontractor', 'civil engineer', 'structural engineer', 'architect', 'architecture', 'real estate', 'property manager', 'facilities', 'estimator', 'foreman', 'site manager', 'infrastructure', 'real estate developer'], v: 'Construction & Agriculture' },
    // Healthcare — require clinical/medical specificity
    { k: ['nurse', 'nursing', ' rn ', 'registered nurse', 'lpn', 'cna', 'physical therapist', 'occupational therapist', 'physician', 'doctor', 'medical doctor', 'surgeon', 'dentist', 'dental', 'pharmacist', 'pharmacy', 'radiologist', 'paramedic', 'emt', 'speech therapist', 'respiratory therapist', 'clinical', 'patient care', 'healthcare worker', 'health aide', 'medical assistant', 'hospital administrator'], v: 'Healthcare & Pharmaceuticals' },
    { k: ['investment banking','banker','finance','financial','accounting','accountant','cpa','portfolio','wealth','trading','trader','actuary','insurance'], v: 'Finance & Insurance' },
    { k: ['software','developer','coding','programming','data science','machine learning','product manager','ux ','ui ','cyber','devops','cloud','tech','information technology'], v: 'Technology, Information & Media' },
    { k: ['marketing','brand','advertising','social media','content','public relations','communications','digital marketing','seo','copywriter','creative'], v: 'Advertising & PR' },
    { k: ['sports','entertainment','music','film',' tv ','television','journalism','broadcast','athletic','coaching'], v: 'Sports & Entertainment' },
    { k: ['consulting','consultant','strategy','management consulting','advisory'], v: 'Professional Services' },
    { k: ['teacher','teaching','education','school','professor','tutor','curriculum'], v: 'Education & Training' },
    { k: ['retail','consumer goods','merchandise','buying','fashion','apparel','ecommerce'], v: 'Retail & Consumer Goods' },
    { k: ['law','lawyer','attorney','legal','paralegal','litigation','compliance'], v: 'Professional Services' },
    { k: ['government','federal','policy','public sector','nonprofit','non-profit','ngo'], v: 'Government & Public Sector' },
    { k: ['logistics','supply chain','transportation','shipping','warehouse','procurement'], v: 'Transportation & Logistics' },
  ];
  for (const { k, v } of map) {
    if (k.some(kw => r.includes(kw))) return v;
  }
  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const goals = body.career_goals || {};
    const studentSchool = body.university || user.school || user.university || '';

    let industries = goals.industries?.length > 0 ? goals.industries : [];
    if (industries.length === 0 && goals.role) {
      const inferred = inferIndustryFromRole(goals.role);
      if (inferred) industries = [inferred];
    }
    const targetCompanies = goals.target_companies || [];
    const industriesLower = industries.map(i => i.toLowerCase());
    const companiesLower = targetCompanies.map(c => c.toLowerCase());
    const schoolWord = studentSchool.toLowerCase().split(' ')[0];

    console.log('🔍 getCFFNetworkMatchesFn searching for industries:', industries);

    // Fetch all users — no visibility filter to maximize matches
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 300);
    const eligible = allUsers.filter(u =>
      u.persona === 'parent' || u.persona === 'alumni' ||
      u.roles?.includes('parent') || u.roles?.includes('alumni')
    );
    console.log(`📊 Total users: ${allUsers.length}, eligible: ${eligible.length}`);

    // Healthcare-specific keywords for job title / company name matching
    const HEALTHCARE_TITLE_KEYWORDS = ['nurs', 'health', 'medical', 'clinical', 'pharma', 'hospital', 'patient', 'physician', 'doctor', 'therapist', 'care'];
    const HEALTHCARE_COMPANY_KEYWORDS = ['health', 'hospital', 'medical', 'clinic', 'pharma', 'care', 'baptist', 'mayo', 'kaiser', 'uhealth'];
    const isHealthcareSearch = industries.some(i => i.toLowerCase().includes('health') || i.toLowerCase().includes('pharma'));

    const companyMap = {};
    const membersList = [];

    const processUser = (u) => {
      const company = (u.company || u.current_company || u.employer || '').trim();
      if (!company) return;

      const uIndustry = (u.industry || '').toLowerCase();
      const uCompany = company.toLowerCase();
      const uJobTitle = (u.job_title || u.role_title || u.current_role || '').toLowerCase();
      const uSchool = (u.school || u.university || '').toLowerCase();

      // Industry keyword match
      const industryKeywords = industriesLower.flatMap(i => i.split(/[&,\s]+/).filter(w => w.length > 3));
      const industryMatch = industriesLower.length === 0 ||
        industryKeywords.some(kw => uIndustry.includes(kw));

      // Company target match
      const companyTargetMatch = companiesLower.some(c => c && uCompany.includes(c));

      // Healthcare-specific fallback matching
      const healthcareTitleMatch = isHealthcareSearch &&
        HEALTHCARE_TITLE_KEYWORDS.some(kw => uJobTitle.includes(kw));
      const healthcareCompanyMatch = isHealthcareSearch &&
        HEALTHCARE_COMPANY_KEYWORDS.some(kw => uCompany.includes(kw));

      const isMatch = industryMatch || companyTargetMatch || healthcareTitleMatch || healthcareCompanyMatch;
      if (!isMatch) return;

      // Skip obvious test accounts
      const firstName = (u.first_name || u.full_name?.split(' ')[0] || '').toLowerCase();
      if (['test', 'demo', 'sample', 'fake', 'movie'].includes(firstName)) return;

      const schoolMatch = schoolWord && uSchool.includes(schoolWord);
      const isOpenToIntro = ['happy_to_help', 'yes', 'open', 'true', '1', 'actively_helping',
        'actively helping', 'happy to help'].some(v =>
          (u.intro_availability || '').toLowerCase().includes(v));
      const type = (u.persona === 'parent' || u.roles?.includes('parent')) ? 'parent' : 'alumni';

      const key = uCompany;
      if (!companyMap[key]) {
        companyMap[key] = { name: company, industry: u.industry || '', cff_parent_count: 0, school_alumni_count: 0, open_to_intro_count: 0, sample_roles: [], school_match: false };
      }
      if (type === 'parent') {
        companyMap[key].cff_parent_count++;
        if (isOpenToIntro) companyMap[key].open_to_intro_count++;
      } else {
        companyMap[key].school_alumni_count++;
        if (schoolMatch) companyMap[key].school_match = true;
      }
      const roleTitle = u.role_title || u.job_title || u.current_role || '';
      if (roleTitle && !companyMap[key].sample_roles.includes(roleTitle)) {
        companyMap[key].sample_roles.push(roleTitle);
      }

      // Add to members list for people-first display
      membersList.push({
        id: u.id,
        first_name: u.first_name || u.full_name?.split(' ')[0] || '',
        last_name: u.last_name || u.full_name?.split(' ').slice(1).join(' ') || '',
        company_name: company,
        job_title: u.job_title || u.role_title || u.current_role || '',
        industry: u.industry || '',
        intro_availability: u.intro_availability || '',
        school_match: schoolMatch,
        school: u.school || u.university || '',
        email: u.email || '',
        persona: type,
      });
    };

    eligible.forEach(u => processUser(u));

    const companies = Object.values(companyMap).map(c => ({ ...c, sample_roles: c.sample_roles.slice(0, 3) }));

    // Sort members: school match + open to intro first
    membersList.sort((a, b) => {
      const aScore = (a.school_match ? 2 : 0) + (['happy_to_help','yes','open','actively_helping'].includes(a.intro_availability) ? 1 : 0);
      const bScore = (b.school_match ? 2 : 0) + (['happy_to_help','yes','open','actively_helping'].includes(b.intro_availability) ? 1 : 0);
      return bScore - aScore;
    });

    console.log(`✅ CFF network: ${companies.length} companies, ${membersList.length} individual members`);
    console.log('🔍 Sample members:', membersList.slice(0, 3).map(m => ({ name: `${m.first_name} ${m.last_name}`, company: m.company_name, industry: m.industry, intro: m.intro_availability })));

    return Response.json({ companies, members: membersList });

  } catch (error) {
    console.error('getCFFNetworkMatchesFn error:', error.message);
    return Response.json({ error: error.message, companies: [], members: [] }, { status: 500 });
  }
});