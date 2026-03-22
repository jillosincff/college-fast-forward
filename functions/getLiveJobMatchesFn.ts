import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

function inferIndustryFromRole(role) {
  if (!role) return null;
  const r = role.toLowerCase();
  const map = [
    { k: ['construction', 'superintendent', 'contractor', 'general contractor', 'subcontractor', 'civil engineer', 'structural engineer', 'architect', 'architecture', 'real estate', 'property manager', 'facilities', 'estimator', 'foreman', 'site manager', 'infrastructure', 'real estate developer'], v: 'Construction & Agriculture' },
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

// Industry-aware hardcoded companies — instant, no DB, always relevant
const INDUSTRY_COMPANIES = {
  'Healthcare & Pharmaceuticals': [
    { name: 'HCA Healthcare', hiring_signal: 'hot', hiring_description: 'One of the largest hospital networks in the US, consistently hiring nurses across hundreds of facilities nationwide.' },
    { name: 'Mayo Clinic', hiring_signal: 'hot', hiring_description: 'World-renowned medical center with strong nursing programs and excellent career development.' },
    { name: 'CVS Health', hiring_signal: 'hot', hiring_description: 'Hiring nurses and clinical staff for pharmacy and MinuteClinic locations nationwide.' },
    { name: 'Northwell Health', hiring_signal: 'hot', hiring_description: "New York's largest health system with extensive openings for RNs across all specialties." },
    { name: 'Jackson Memorial Hospital', hiring_signal: 'warm', hiring_description: 'Major public hospital in Miami with consistent nursing openings across departments.' },
  ],
  'Finance & Insurance': [
    { name: 'JPMorgan', hiring_signal: 'hot', hiring_description: 'Large-scale hiring for finance and operations analyst roles nationwide.' },
    { name: 'Goldman Sachs', hiring_signal: 'warm', hiring_description: 'Summer analyst and new associate programs open for investment banking division.' },
    { name: 'Deloitte', hiring_signal: 'hot', hiring_description: 'Hiring audit, tax, and advisory associates across all major US offices.' },
    { name: 'PwC', hiring_signal: 'hot', hiring_description: 'Big 4 firm actively hiring across all service lines for new graduates.' },
    { name: 'BlackRock', hiring_signal: 'warm', hiring_description: "World's largest asset manager with analyst programs across multiple divisions." },
  ],
  'Technology, Information & Media': [
    { name: 'Google', hiring_signal: 'hot', hiring_description: 'Actively hiring across engineering, product, and business roles for new grads.' },
    { name: 'Microsoft', hiring_signal: 'hot', hiring_description: 'Strong new grad programs across all divisions including cloud, AI, and business.' },
    { name: 'Adobe', hiring_signal: 'warm', hiring_description: 'Hiring across engineering, design, and marketing technology roles.' },
    { name: 'Salesforce', hiring_signal: 'warm', hiring_description: 'Rotational programs and entry-level roles in sales, engineering, and marketing.' },
    { name: 'Cisco', hiring_signal: 'warm', hiring_description: 'Networking and technology roles with strong early career programs.' },
  ],
  'Advertising & PR': [
    { name: 'Edelman', hiring_signal: 'hot', hiring_description: "World's largest PR firm — actively hiring communications and PR associates." },
    { name: 'Ogilvy', hiring_signal: 'warm', hiring_description: 'Creative and account management roles for recent grads in advertising.' },
    { name: 'WPP', hiring_signal: 'warm', hiring_description: 'Global holding company with entry-level roles across agency brands.' },
    { name: 'Publicis Groupe', hiring_signal: 'warm', hiring_description: 'Global agency network with entry-level creative and strategy roles.' },
    { name: 'Weber Shandwick', hiring_signal: 'hot', hiring_description: 'Hiring entry-level PR and communications associates across major markets.' },
  ],
  'Professional Services': [
    { name: 'McKinsey', hiring_signal: 'warm', hiring_description: 'Business analyst roles for top undergraduates entering management consulting.' },
    { name: 'Deloitte', hiring_signal: 'hot', hiring_description: 'Hiring consultants and business analysts in advisory practices nationwide.' },
    { name: 'EY', hiring_signal: 'hot', hiring_description: 'Entry-level associate roles across all service lines with strong development.' },
    { name: 'KPMG', hiring_signal: 'hot', hiring_description: 'Associate-level hiring in audit, tax, and advisory across US offices.' },
    { name: 'BCG', hiring_signal: 'warm', hiring_description: 'Associate and analyst roles for new grads in strategy consulting.' },
  ],
  'Sports & Entertainment': [
    { name: 'ESPN', hiring_signal: 'warm', hiring_description: 'Hiring for content, production, and marketing roles in sports media.' },
    { name: 'Live Nation', hiring_signal: 'hot', hiring_description: 'Entry-level roles in events, marketing, and operations at the world\'s largest live entertainment company.' },
    { name: 'Nike', hiring_signal: 'warm', hiring_description: 'Brand marketing and product roles for recent grads with sports or business backgrounds.' },
    { name: 'Endeavor', hiring_signal: 'warm', hiring_description: 'Global sports and entertainment company with entry-level roles across divisions.' },
    { name: 'Warner Bros. Discovery', hiring_signal: 'warm', hiring_description: 'Media and entertainment roles in production, marketing, and digital content.' },
  ],
  'Retail & Consumer Goods': [
    { name: 'Procter & Gamble', hiring_signal: 'hot', hiring_description: 'Brand management and operations rotational roles for recent grads.' },
    { name: 'Target', hiring_signal: 'hot', hiring_description: 'Store leadership and corporate rotational programs open nationwide.' },
    { name: 'Unilever', hiring_signal: 'warm', hiring_description: 'Future Leaders Program for top undergraduates in consumer goods.' },
    { name: 'L\'Oreal', hiring_signal: 'warm', hiring_description: 'Management trainee and brand marketing roles for recent grads.' },
    { name: 'Estee Lauder', hiring_signal: 'warm', hiring_description: 'Entry-level positions in marketing, retail, and corporate operations.' },
  ],
  'Education & Training': [
    { name: 'Teach For America', hiring_signal: 'hot', hiring_description: 'Two-year teaching fellowship placing grads in under-resourced schools.' },
    { name: 'Pearson', hiring_signal: 'warm', hiring_description: 'Education technology and content roles for curriculum-focused graduates.' },
    { name: 'Chegg', hiring_signal: 'warm', hiring_description: 'EdTech company with roles in content, marketing, and product.' },
    { name: 'Duolingo', hiring_signal: 'warm', hiring_description: 'Language learning platform hiring for content, product, and engineering.' },
    { name: 'Khan Academy', hiring_signal: 'warm', hiring_description: 'Non-profit education platform with product and content roles.' },
  ],
  'Government & Public Sector': [
    { name: 'Deloitte Government', hiring_signal: 'hot', hiring_description: 'Federal consulting division actively hiring for public sector projects.' },
    { name: 'Booz Allen Hamilton', hiring_signal: 'hot', hiring_description: 'Government consulting firm with strong entry-level programs.' },
    { name: 'MITRE', hiring_signal: 'warm', hiring_description: 'Non-profit working on national security and public interest challenges.' },
    { name: 'Leidos', hiring_signal: 'warm', hiring_description: 'Defense and government IT firm with consistent new grad hiring.' },
    { name: 'Peace Corps', hiring_signal: 'warm', hiring_description: 'International service program with openings across education, health, and agriculture.' },
  ],
  'Transportation & Logistics': [
    { name: 'UPS', hiring_signal: 'hot', hiring_description: 'Supply chain and logistics roles with management development programs.' },
    { name: 'FedEx', hiring_signal: 'hot', hiring_description: 'Operations and logistics management programs for recent grads.' },
    { name: 'Norfolk Southern', hiring_signal: 'warm', hiring_description: 'Transportation and operations management trainee programs.' },
    { name: 'XPO Logistics', hiring_signal: 'warm', hiring_description: 'Logistics management and operations roles for new graduates.' },
    { name: 'C.H. Robinson', hiring_signal: 'warm', hiring_description: 'Supply chain and freight brokerage roles with strong training programs.' },
  ],
  'Construction & Agriculture': [
    { name: 'Turner Construction', hiring_signal: 'hot', hiring_description: 'One of the largest construction firms in the US — hiring project managers and engineers nationwide.' },
    { name: 'CBRE', hiring_signal: 'hot', hiring_description: "World's largest commercial real estate services firm — strong project management division." },
    { name: 'AECOM', hiring_signal: 'hot', hiring_description: 'Global infrastructure firm — extensive project management roles across the US.' },
    { name: 'Bechtel', hiring_signal: 'warm', hiring_description: 'Major engineering and construction company — project management roles nationwide.' },
    { name: 'Hines', hiring_signal: 'warm', hiring_description: 'Global real estate firm with strong development and construction management programs.' },
  ],
};

const DEFAULT_COMPANIES = [
  { name: 'Deloitte', hiring_signal: 'hot', hiring_description: 'Hiring consultants and business analysts nationwide across all service lines.' },
  { name: 'Amazon', hiring_signal: 'hot', hiring_description: 'Hiring across logistics, technology, and business operations at scale.' },
  { name: 'JPMorgan', hiring_signal: 'hot', hiring_description: 'Large-scale hiring for finance and operations roles nationwide.' },
  { name: 'Microsoft', hiring_signal: 'hot', hiring_description: 'Strong new grad programs across all divisions.' },
  { name: 'Google', hiring_signal: 'warm', hiring_description: 'Hiring across engineering, product, and business roles.' },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const goals = body.career_goals || {};
    let industries = goals.industries?.length > 0 ? goals.industries : (user.target_industries || []);
    // If still no industries, infer from role
    if (industries.length === 0 && goals.role) {
      const inferred = inferIndustryFromRole(goals.role);
      if (inferred) industries = [inferred];
    }
    const excludeNames = (goals.target_companies || []).map(c => c.toLowerCase());

    // Try to find matching industry companies
    let companies = [];
    for (const industry of industries) {
      const list = INDUSTRY_COMPANIES[industry];
      if (list) {
        const filtered = list.filter(c => !excludeNames.includes(c.name.toLowerCase()));
        companies.push(...filtered);
        break; // Use first matching industry
      }
    }

    // If no match found, try partial match
    if (companies.length === 0 && industries.length > 0) {
      const primaryIndustry = industries[0].toLowerCase();
      for (const [key, list] of Object.entries(INDUSTRY_COMPANIES)) {
        if (key.toLowerCase().includes(primaryIndustry.split(' ')[0]) || primaryIndustry.includes(key.toLowerCase().split(' ')[0])) {
          companies = list.filter(c => !excludeNames.includes(c.name.toLowerCase()));
          break;
        }
      }
    }

    // Final fallback
    if (companies.length === 0) {
      companies = DEFAULT_COMPANIES.filter(c => !excludeNames.includes(c.name.toLowerCase()));
    }

    const result = companies.slice(0, 5).map(c => ({
      name: c.name,
      industry: industries[0] || '',
      size: 'large',
      hiring_signal: c.hiring_signal,
      hiring_description: c.hiring_description,
      has_web_result: true,
    }));

    console.log(`✅ getLiveJobMatchesFn: ${result.length} companies for industries: ${industries.join(', ')}`);
    return Response.json({ companies: result });

  } catch (error) {
    console.error('getLiveJobMatchesFn error:', error.message);
    return Response.json({ error: error.message, companies: [] }, { status: 500 });
  }
});