import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

function inferIndustryFromRole(role) {
  if (!role) return null;
  const r = role.toLowerCase();
  const map = [
    { k: ['nurse','nursing','rn ','lpn','cna','physical therapist','physician','doctor','medical','healthcare','hospital','clinical','pharmacist','pharmacy','surgeon','dentist','dental','health','patient care'], v: 'Healthcare & Pharmaceuticals' },
    { k: ['investment banking','banker','finance','financial','accounting','accountant','cpa','portfolio','wealth','trading','trader','actuary','insurance'], v: 'Finance & Insurance' },
    { k: ['software','engineer','developer','coding','programming','data science','machine learning','product manager','ux ','ui ','cyber','devops','cloud','tech','information technology'], v: 'Technology, Information & Media' },
    { k: ['marketing','brand','advertising','social media','content','public relations','communications','digital marketing','seo','copywriter','creative'], v: 'Advertising & PR' },
    { k: ['sports','entertainment','music','film',' tv ','television','journalism','broadcast','athletic','coaching'], v: 'Sports & Entertainment' },
    { k: ['consulting','consultant','strategy','management consulting','advisory'], v: 'Professional Services' },
    { k: ['teacher','teaching','education','school','professor','tutor','curriculum'], v: 'Education & Training' },
    { k: ['real estate','property','construction','architecture','contractor'], v: 'Construction & Agriculture' },
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

    // Database only — fetch max 50 users per query, no LLM
    // Use list() since persona field may be stored in roles array or persona field
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 100);
    const parents = allUsers.filter(u => u.persona === 'parent' || u.roles?.includes('parent'));
    const alumni = allUsers.filter(u => u.persona === 'alumni' || u.roles?.includes('alumni'));
    console.log(`📊 Total users: ${allUsers.length}, parents: ${parents.length}, alumni: ${alumni.length}`);

    const companyMap = {};

    const processUser = (u, type) => {
      if (u.show_in_directory === false || u.directory_visible === false) return;
      const company = (u.company || u.current_company || '').trim();
      if (!company) return;

      const uIndustry = (u.industry || '').toLowerCase();
      const uCompany = company.toLowerCase();
      const industryMatch = industriesLower.length === 0 || industriesLower.some(i => uIndustry.includes(i.split(',')[0].trim()));
      const companyMatch = companiesLower.some(c => c && uCompany.includes(c));
      if (!industryMatch && !companyMatch) return;

      const uSchool = (u.school || u.university || '').toLowerCase();
      const schoolMatch = schoolWord && uSchool.includes(schoolWord);
      const isOpenToIntro = u.intro_availability === 'happy_to_help' || u.intro_availability === 'yes' || u.open_to_intro === true;

      const key = uCompany;
      if (!companyMap[key]) {
        companyMap[key] = {
          name: company,
          industry: u.industry || '',
          cff_parent_count: 0,
          school_alumni_count: 0,
          open_to_intro_count: 0,
          sample_roles: [],
          school_match: false,
        };
      }
      if (type === 'parent') {
        companyMap[key].cff_parent_count++;
        if (isOpenToIntro) companyMap[key].open_to_intro_count++;
      } else {
        companyMap[key].school_alumni_count++;
        if (schoolMatch) companyMap[key].school_match = true;
      }
      const role = u.role_title || u.current_role || '';
      if (role && !companyMap[key].sample_roles.includes(role)) {
        companyMap[key].sample_roles.push(role);
      }
    };

    parents.forEach(u => processUser(u, 'parent'));
    alumni.forEach(u => processUser(u, 'alumni'));

    const results = Object.values(companyMap).map(c => ({
      ...c,
      sample_roles: c.sample_roles.slice(0, 3),
    }));

    console.log(`✅ CFF network: ${results.length} companies from ${parents.length + alumni.length} users`);

    return Response.json({ companies: results });

  } catch (error) {
    console.error('getCFFNetworkMatchesFn error:', error.message);
    return Response.json({ error: error.message, companies: [] }, { status: 500 });
  }
});