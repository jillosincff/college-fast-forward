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
    { k: ['retail','consumer goods','merchandise','buying','fashion','apparel','ecommerce'], v: 'Retail & Consumer Goods' },
    { k: ['law','lawyer','attorney','legal','paralegal','litigation','compliance'], v: 'Professional Services' },
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

    const role = goals.role || user.target_role || 'entry level';
    let industries = goals.industries?.length > 0 ? goals.industries : (user.target_industries || []);
    if (industries.length === 0 && role) {
      const inferred = inferIndustryFromRole(role);
      if (inferred) industries = [inferred];
    }
    const location = goals.locations?.[0] || 'United States';
    const targetCompanies = goals.target_companies || [];
    const sizePref = goals.company_size_preference || ['large', 'mid', 'startup'];
    const primarySize = { large: 'large enterprise', mid: 'mid-size', startup: 'startup' }[sizePref[0]] || 'various size';
    const industriesStr = industries.join(', ') || 'general business';
    const existingTargets = targetCompanies.join(', ');

    const prompt = `Find 5 companies actively hiring ${role} positions in ${industriesStr} in ${location} right now (2025).
Prefer ${primarySize} companies.
${existingTargets ? `Do NOT suggest these (already targeted): ${existingTargets}` : ''}
Return 5 companies with real current hiring activity. Be specific and accurate.`;

    console.log(`🔍 LLM web search: "${role}" in "${industriesStr}"`);

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
              },
            },
          },
        },
      },
    });

    const companies = result?.companies || [];
    console.log(`✅ Live jobs: ${companies.length} companies found`);

    return Response.json({ companies });

  } catch (error) {
    console.error('getLiveJobMatchesFn error:', error.message);
    return Response.json({ error: error.message, companies: [] }, { status: 500 });
  }
});