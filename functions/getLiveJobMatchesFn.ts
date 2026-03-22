import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

function inferIndustryFromRole(role) {
  if (!role) return null;
  const r = role.toLowerCase();
  const map = [
    { k: ['construction', 'superintendent', 'contractor', 'general contractor', 'subcontractor', 'civil engineer', 'structural engineer', 'architect', 'architecture', 'real estate', 'property manager', 'facilities', 'estimator', 'foreman', 'site manager', 'infrastructure', 'real estate developer'], v: 'Construction & Agriculture' },
    { k: ['nurse', 'nursing', ' rn ', 'registered nurse', 'lpn', 'cna', 'physical therapist', 'occupational therapist', 'physician', 'doctor', 'medical doctor', 'surgeon', 'dentist', 'dental', 'pharmacist', 'pharmacy', 'radiologist', 'paramedic', 'emt', 'speech therapist', 'respiratory therapist', 'clinical', 'patient care', 'healthcare worker', 'health aide', 'medical assistant', 'hospital administrator'], v: 'Healthcare & Pharmaceuticals' },
    { k: ['investment banking','banker','finance','financial','accounting','accountant','cpa','portfolio','wealth','trading','trader','actuary','insurance'], v: 'Finance & Insurance' },
    { k: ['software','developer','coding','programming','data science','data analyst','machine learning','product manager','ux ','ui ','cyber','devops','cloud','tech','information technology'], v: 'Technology, Information & Media' },
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

// Industry companies organized by size tier
const INDUSTRY_COMPANIES = {
  'Healthcare & Pharmaceuticals': {
    // Healthcare is special — size preference doesn't apply, hospitals are hospitals
    large: [
      { name: 'HCA Healthcare', hiring_signal: 'hot', hiring_description: 'One of the largest hospital networks in the US, consistently hiring nurses across hundreds of facilities nationwide.' },
      { name: 'Mayo Clinic', hiring_signal: 'hot', hiring_description: 'World-renowned medical center with strong nursing programs and excellent career development.' },
      { name: 'CVS Health', hiring_signal: 'hot', hiring_description: 'Hiring nurses and clinical staff for pharmacy and MinuteClinic locations nationwide.' },
      { name: 'Northwell Health', hiring_signal: 'hot', hiring_description: "New York's largest health system with extensive openings for RNs across all specialties." },
      { name: 'Jackson Memorial Hospital', hiring_signal: 'warm', hiring_description: 'Major public hospital in Miami with consistent nursing openings across departments.' },
    ],
    mid: [
      { name: 'AdventHealth', hiring_signal: 'hot', hiring_description: 'Faith-based hospital network with strong nursing culture and career development.' },
      { name: 'Kindred Healthcare', hiring_signal: 'warm', hiring_description: 'Specialty hospital network hiring nurses for rehabilitation and long-term care.' },
      { name: 'Envision Healthcare', hiring_signal: 'warm', hiring_description: 'Physician-led group with openings for clinical staff across the US.' },
      { name: 'LifePoint Health', hiring_signal: 'warm', hiring_description: 'Community hospital network with nursing openings in non-urban markets.' },
      { name: 'Surgery Partners', hiring_signal: 'warm', hiring_description: 'Ambulatory surgical centers hiring nurses and clinical staff.' },
    ],
    startup: [
      { name: 'Carbon Health', hiring_signal: 'hot', hiring_description: 'Tech-enabled primary care startup rapidly expanding clinical teams.' },
      { name: 'Forward', hiring_signal: 'warm', hiring_description: 'Membership-based primary care startup hiring nurses and care coordinators.' },
      { name: 'Galileo Health', hiring_signal: 'warm', hiring_description: 'Virtual-first care platform hiring clinical staff.' },
      { name: 'Cityblock Health', hiring_signal: 'warm', hiring_description: 'Community health startup serving Medicaid populations.' },
      { name: 'Firefly Health', hiring_signal: 'warm', hiring_description: 'Virtual primary care startup hiring nurse practitioners and care coordinators.' },
    ],
  },

  'Finance & Insurance': {
    large: [
      { name: 'JPMorgan', hiring_signal: 'hot', hiring_description: 'Large-scale hiring for finance and operations analyst roles nationwide.' },
      { name: 'Goldman Sachs', hiring_signal: 'warm', hiring_description: 'Summer analyst and new associate programs open for investment banking division.' },
      { name: 'Deloitte', hiring_signal: 'hot', hiring_description: 'Hiring audit, tax, and advisory associates across all major US offices.' },
      { name: 'PwC', hiring_signal: 'hot', hiring_description: 'Big 4 firm actively hiring across all service lines for new graduates.' },
      { name: 'BlackRock', hiring_signal: 'warm', hiring_description: "World's largest asset manager with analyst programs across multiple divisions." },
    ],
    mid: [
      { name: 'Robinhood', hiring_signal: 'warm', hiring_description: 'Fintech brokerage with finance and operations roles for new grads.' },
      { name: 'SoFi', hiring_signal: 'hot', hiring_description: 'Personal finance platform actively hiring in lending, analytics, and operations.' },
      { name: 'Chime', hiring_signal: 'warm', hiring_description: 'Neobank hiring finance and compliance roles.' },
      { name: 'Plaid', hiring_signal: 'warm', hiring_description: 'Fintech infrastructure company with finance and business analyst roles.' },
      { name: 'Marqeta', hiring_signal: 'warm', hiring_description: 'Card issuing platform with finance and analytics roles.' },
    ],
    startup: [
      { name: 'Brex', hiring_signal: 'hot', hiring_description: 'Corporate cards and spend management startup — finance and analyst roles.' },
      { name: 'Ramp', hiring_signal: 'hot', hiring_description: 'Fast-growing fintech — finance analyst roles with real ownership.' },
      { name: 'Mercury', hiring_signal: 'warm', hiring_description: 'Banking for startups — finance and operations roles.' },
      { name: 'Stripe', hiring_signal: 'warm', hiring_description: 'Payments infrastructure startup with finance and strategy roles.' },
      { name: 'Deel', hiring_signal: 'warm', hiring_description: 'Global payroll startup — finance and compliance analyst roles.' },
    ],
  },

  'Technology, Information & Media': {
    large: [
      { name: 'Google', hiring_signal: 'hot', hiring_description: 'Actively hiring across engineering, product, and business roles for new grads.' },
      { name: 'Microsoft', hiring_signal: 'hot', hiring_description: 'Strong new grad programs across all divisions including cloud, AI, and business.' },
      { name: 'Salesforce', hiring_signal: 'hot', hiring_description: 'Rotational programs and entry-level roles in sales, engineering, and marketing.' },
      { name: 'Adobe', hiring_signal: 'warm', hiring_description: 'Hiring across engineering, design, and marketing technology roles.' },
      { name: 'Meta', hiring_signal: 'warm', hiring_description: 'Data and engineering roles across multiple divisions.' },
    ],
    mid: [
      { name: 'Duolingo', hiring_signal: 'hot', hiring_description: 'Fast-growing edtech — data analyst and product roles.' },
      { name: 'Canva', hiring_signal: 'hot', hiring_description: 'Design platform scaling rapidly — data and analytics roles.' },
      { name: 'Brex', hiring_signal: 'warm', hiring_description: 'Financial technology company — data analyst roles.' },
      { name: 'Notion', hiring_signal: 'warm', hiring_description: 'Productivity startup — data and growth analyst roles.' },
      { name: 'Figma', hiring_signal: 'warm', hiring_description: 'Design platform — data analyst and product roles.' },
    ],
    startup: [
      { name: 'Ramp', hiring_signal: 'hot', hiring_description: 'Fast-growing fintech — data analyst roles with high impact.' },
      { name: 'Linear', hiring_signal: 'warm', hiring_description: 'Project management startup — data and analytics roles.' },
      { name: 'Retool', hiring_signal: 'warm', hiring_description: 'Internal tools startup — data and analytics engineering.' },
      { name: 'Hex', hiring_signal: 'warm', hiring_description: 'Data collaboration startup — analyst and data science roles.' },
      { name: 'Dbt Labs', hiring_signal: 'warm', hiring_description: 'Data transformation startup — analyst and engineering roles.' },
    ],
  },

  'Advertising & PR': {
    large: [
      { name: 'Edelman', hiring_signal: 'hot', hiring_description: "World's largest PR firm — actively hiring communications and PR associates." },
      { name: 'WPP', hiring_signal: 'warm', hiring_description: 'Global holding company with entry-level roles across agency brands.' },
      { name: 'Publicis Groupe', hiring_signal: 'warm', hiring_description: 'Global agency network with entry-level creative and strategy roles.' },
      { name: 'Ogilvy', hiring_signal: 'warm', hiring_description: 'Creative and account management roles for recent grads in advertising.' },
      { name: 'Weber Shandwick', hiring_signal: 'hot', hiring_description: 'Hiring entry-level PR and communications associates across major markets.' },
    ],
    mid: [
      { name: 'GOLIN', hiring_signal: 'warm', hiring_description: 'PR agency with entry-level account coordinator roles.' },
      { name: 'Zeno Group', hiring_signal: 'warm', hiring_description: 'Independent PR agency hiring junior associates.' },
      { name: 'Praytell', hiring_signal: 'warm', hiring_description: 'Culture-forward PR agency known for strong entry-level programs.' },
      { name: 'MikeWorldWide', hiring_signal: 'warm', hiring_description: 'Independent PR agency with strong new grad training programs.' },
      { name: 'Citizen Relations', hiring_signal: 'warm', hiring_description: 'Creative PR shop hiring junior account staff.' },
    ],
    startup: [
      { name: 'Day One Agency', hiring_signal: 'warm', hiring_description: 'Independent social media and PR agency — entry-level account roles.' },
      { name: 'Praytell', hiring_signal: 'warm', hiring_description: 'Independent PR firm with a strong culture and entry-level opportunities.' },
      { name: 'Bospar', hiring_signal: 'warm', hiring_description: 'Boutique tech PR agency hiring remote junior associates.' },
      { name: 'Inkhouse', hiring_signal: 'warm', hiring_description: 'Independent communications agency with junior PR roles.' },
      { name: 'Affect', hiring_signal: 'warm', hiring_description: 'Tech PR boutique — hands-on entry-level experience from day one.' },
    ],
  },

  'Professional Services': {
    large: [
      { name: 'McKinsey', hiring_signal: 'warm', hiring_description: 'Business analyst roles for top undergraduates entering management consulting.' },
      { name: 'Deloitte', hiring_signal: 'hot', hiring_description: 'Hiring consultants and business analysts in advisory practices nationwide.' },
      { name: 'EY', hiring_signal: 'hot', hiring_description: 'Entry-level associate roles across all service lines with strong development.' },
      { name: 'KPMG', hiring_signal: 'hot', hiring_description: 'Associate-level hiring in audit, tax, and advisory across US offices.' },
      { name: 'BCG', hiring_signal: 'warm', hiring_description: 'Associate and analyst roles for new grads in strategy consulting.' },
    ],
    mid: [
      { name: 'FTI Consulting', hiring_signal: 'warm', hiring_description: 'Business consulting firm with strong analyst programs.' },
      { name: 'West Monroe', hiring_signal: 'hot', hiring_description: 'Digital consulting firm actively hiring business analysts.' },
      { name: 'L.E.K. Consulting', hiring_signal: 'warm', hiring_description: 'Strategy consulting firm with strong new grad analyst program.' },
      { name: 'Guidehouse', hiring_signal: 'hot', hiring_description: 'Management consulting with public sector and commercial practices.' },
      { name: 'Huron Consulting', hiring_signal: 'warm', hiring_description: 'Consulting firm with strong healthcare and education practices.' },
    ],
    startup: [
      { name: 'Bain & Company Futures', hiring_signal: 'warm', hiring_description: 'Boutique strategy projects — analyst roles with broad exposure.' },
      { name: 'Keystone Strategy', hiring_signal: 'warm', hiring_description: 'Boutique economics and strategy consultancy — analyst roles.' },
      { name: 'Analysis Group', hiring_signal: 'warm', hiring_description: 'Economic consulting boutique with strong analyst programs.' },
      { name: 'Cornerstone Research', hiring_signal: 'warm', hiring_description: 'Litigation and strategy consulting — research analyst roles.' },
      { name: 'Brattle Group', hiring_signal: 'warm', hiring_description: 'Economic and financial consulting boutique — analyst roles.' },
    ],
  },

  'Sports & Entertainment': {
    large: [
      { name: 'ESPN', hiring_signal: 'warm', hiring_description: 'Hiring for content, production, and marketing roles in sports media.' },
      { name: 'Live Nation', hiring_signal: 'hot', hiring_description: "Entry-level roles in events, marketing, and operations at the world's largest live entertainment company." },
      { name: 'Nike', hiring_signal: 'warm', hiring_description: 'Brand marketing and product roles for recent grads with sports or business backgrounds.' },
      { name: 'Endeavor', hiring_signal: 'warm', hiring_description: 'Global sports and entertainment company with entry-level roles across divisions.' },
      { name: 'Warner Bros. Discovery', hiring_signal: 'warm', hiring_description: 'Media and entertainment roles in production, marketing, and digital content.' },
    ],
    mid: [
      { name: 'SportsRadio', hiring_signal: 'warm', hiring_description: 'Sports media company with on-air and production roles.' },
      { name: 'FloSports', hiring_signal: 'warm', hiring_description: 'Sports streaming startup hiring for production and marketing.' },
      { name: 'On Location', hiring_signal: 'warm', hiring_description: 'Premium sports experience company with event and marketing roles.' },
      { name: 'Overtime', hiring_signal: 'warm', hiring_description: 'Sports media startup focused on Gen Z audiences.' },
      { name: 'Whistle Sports', hiring_signal: 'warm', hiring_description: 'Youth sports media company with content and marketing roles.' },
    ],
    startup: [
      { name: 'Overtime Elite', hiring_signal: 'warm', hiring_description: 'Basketball league startup — operations and marketing roles.' },
      { name: 'Athlete.co', hiring_signal: 'warm', hiring_description: 'Athlete brand management startup — marketing and brand roles.' },
      { name: 'Greenfly', hiring_signal: 'warm', hiring_description: 'Sports content distribution startup — client success and marketing.' },
      { name: 'Teamworks', hiring_signal: 'warm', hiring_description: 'Athlete operations platform — sales and account management.' },
      { name: 'Opendorse', hiring_signal: 'warm', hiring_description: 'NIL and athlete marketing platform — sales and marketing roles.' },
    ],
  },

  'Retail & Consumer Goods': {
    large: [
      { name: 'Procter & Gamble', hiring_signal: 'hot', hiring_description: 'Brand management and operations rotational roles for recent grads.' },
      { name: 'Target', hiring_signal: 'hot', hiring_description: 'Store leadership and corporate rotational programs open nationwide.' },
      { name: 'Unilever', hiring_signal: 'warm', hiring_description: 'Future Leaders Program for top undergraduates in consumer goods.' },
      { name: "L'Oreal", hiring_signal: 'warm', hiring_description: 'Management trainee and brand marketing roles for recent grads.' },
      { name: 'Estee Lauder', hiring_signal: 'warm', hiring_description: 'Entry-level positions in marketing, retail, and corporate operations.' },
    ],
    mid: [
      { name: 'Warby Parker', hiring_signal: 'warm', hiring_description: 'DTC eyewear brand with retail and marketing roles.' },
      { name: 'Away Travel', hiring_signal: 'warm', hiring_description: 'DTC travel brand — marketing and operations roles.' },
      { name: 'Chewy', hiring_signal: 'hot', hiring_description: 'Pet retail e-commerce company actively hiring operations and marketing.' },
      { name: 'Grove Collaborative', hiring_signal: 'warm', hiring_description: 'Sustainable consumer goods — marketing and operations roles.' },
      { name: 'Allbirds', hiring_signal: 'warm', hiring_description: 'Sustainable footwear brand with retail and marketing roles.' },
    ],
    startup: [
      { name: 'Caraway', hiring_signal: 'warm', hiring_description: 'DTC cookware brand — marketing and brand management roles.' },
      { name: 'Hydrant', hiring_signal: 'warm', hiring_description: 'Health beverage startup — growth and marketing roles.' },
      { name: 'Italic', hiring_signal: 'warm', hiring_description: 'Luxury goods startup — operations and marketing roles.' },
      { name: 'Outer', hiring_signal: 'warm', hiring_description: 'Outdoor furniture startup — growth and operations roles.' },
      { name: 'Public Goods', hiring_signal: 'warm', hiring_description: 'Sustainable consumer goods startup — marketing and operations.' },
    ],
  },

  'Education & Training': {
    large: [
      { name: 'Teach For America', hiring_signal: 'hot', hiring_description: 'Two-year teaching fellowship placing grads in under-resourced schools.' },
      { name: 'Pearson', hiring_signal: 'warm', hiring_description: 'Education technology and content roles for curriculum-focused graduates.' },
      { name: 'Chegg', hiring_signal: 'warm', hiring_description: 'EdTech company with roles in content, marketing, and product.' },
      { name: 'Duolingo', hiring_signal: 'warm', hiring_description: 'Language learning platform hiring for content, product, and engineering.' },
      { name: 'Khan Academy', hiring_signal: 'warm', hiring_description: 'Non-profit education platform with product and content roles.' },
    ],
    mid: [
      { name: 'Coursera', hiring_signal: 'warm', hiring_description: 'Online learning platform with roles in content and partnerships.' },
      { name: 'Newsela', hiring_signal: 'warm', hiring_description: 'EdTech company building literacy tools for K-12 classrooms.' },
      { name: 'Panorama Education', hiring_signal: 'warm', hiring_description: 'EdTech analytics platform — account management and data roles.' },
      { name: 'IXL Learning', hiring_signal: 'warm', hiring_description: 'Personalized learning platform with roles in content and sales.' },
      { name: 'Zearn', hiring_signal: 'warm', hiring_description: 'Non-profit math edtech with curriculum and operations roles.' },
    ],
    startup: [
      { name: 'Synthesis', hiring_signal: 'warm', hiring_description: 'Problem-solving learning platform for kids — curriculum and ops roles.' },
      { name: 'Numerade', hiring_signal: 'warm', hiring_description: 'STEM education startup — content and marketing roles.' },
      { name: 'Juni Learning', hiring_signal: 'warm', hiring_description: 'Coding education startup — instructor and curriculum roles.' },
      { name: 'Primer', hiring_signal: 'warm', hiring_description: 'Micro-school startup reimagining K-12 education.' },
      { name: 'Tynker', hiring_signal: 'warm', hiring_description: 'Coding platform for kids — content and curriculum roles.' },
    ],
  },

  'Government & Public Sector': {
    large: [
      { name: 'Deloitte Government', hiring_signal: 'hot', hiring_description: 'Federal consulting division actively hiring for public sector projects.' },
      { name: 'Booz Allen Hamilton', hiring_signal: 'hot', hiring_description: 'Government consulting firm with strong entry-level programs.' },
      { name: 'Leidos', hiring_signal: 'warm', hiring_description: 'Defense and government IT firm with consistent new grad hiring.' },
      { name: 'MITRE', hiring_signal: 'warm', hiring_description: 'Non-profit working on national security and public interest challenges.' },
      { name: 'Peace Corps', hiring_signal: 'warm', hiring_description: 'International service program with openings across education, health, and agriculture.' },
    ],
    mid: [
      { name: 'ICF', hiring_signal: 'warm', hiring_description: 'Consulting and technology services firm working on government contracts.' },
      { name: 'Guidehouse', hiring_signal: 'hot', hiring_description: 'Management consulting with strong public sector practice.' },
      { name: 'Noblis', hiring_signal: 'warm', hiring_description: 'Non-profit science and tech firm supporting federal agencies.' },
      { name: 'RAND Corporation', hiring_signal: 'warm', hiring_description: 'Research institution with policy analyst and research roles.' },
      { name: 'Urban Institute', hiring_signal: 'warm', hiring_description: 'Non-profit policy research with analyst and data roles.' },
    ],
    startup: [
      { name: 'Nava PBC', hiring_signal: 'warm', hiring_description: 'Public benefit company building better government digital services.' },
      { name: 'U.S. Digital Service', hiring_signal: 'warm', hiring_description: 'Federal agency improving government digital products.' },
      { name: 'Code for America', hiring_signal: 'warm', hiring_description: 'Non-profit improving government services through technology.' },
      { name: 'Civis Analytics', hiring_signal: 'warm', hiring_description: 'Data science firm serving political campaigns and government.' },
      { name: 'Palantir', hiring_signal: 'warm', hiring_description: 'Data analytics firm with significant government sector work.' },
    ],
  },

  'Transportation & Logistics': {
    large: [
      { name: 'UPS', hiring_signal: 'hot', hiring_description: 'Supply chain and logistics roles with management development programs.' },
      { name: 'FedEx', hiring_signal: 'hot', hiring_description: 'Operations and logistics management programs for recent grads.' },
      { name: 'C.H. Robinson', hiring_signal: 'warm', hiring_description: 'Supply chain and freight brokerage roles with strong training programs.' },
      { name: 'XPO Logistics', hiring_signal: 'warm', hiring_description: 'Logistics management and operations roles for new graduates.' },
      { name: 'Norfolk Southern', hiring_signal: 'warm', hiring_description: 'Transportation and operations management trainee programs.' },
    ],
    mid: [
      { name: 'Flexport', hiring_signal: 'warm', hiring_description: 'Digital freight forwarder — operations and account management roles.' },
      { name: 'project44', hiring_signal: 'warm', hiring_description: 'Supply chain visibility platform — analytics and operations roles.' },
      { name: 'Echo Global Logistics', hiring_signal: 'hot', hiring_description: 'Freight brokerage actively hiring account managers and analysts.' },
      { name: 'Arrive Logistics', hiring_signal: 'hot', hiring_description: 'Growing freight brokerage — strong entry-level training program.' },
      { name: 'Coyote Logistics', hiring_signal: 'warm', hiring_description: 'Third-party logistics provider with strong carrier relations roles.' },
    ],
    startup: [
      { name: 'Convoy', hiring_signal: 'warm', hiring_description: 'Digital trucking startup — operations and data roles.' },
      { name: 'Transfix', hiring_signal: 'warm', hiring_description: 'Freight marketplace startup — carrier and shipper success roles.' },
      { name: 'Samsara', hiring_signal: 'hot', hiring_description: 'Fleet management platform startup — sales and operations roles.' },
      { name: 'KeepTruckin', hiring_signal: 'warm', hiring_description: 'Trucking platform startup — operations and customer success.' },
      { name: 'Leaf Logistics', hiring_signal: 'warm', hiring_description: 'Supply chain intelligence startup — analyst and ops roles.' },
    ],
  },

  'Construction & Agriculture': {
    large: [
      { name: 'Turner Construction', hiring_signal: 'hot', hiring_description: 'One of the largest construction firms in the US — hiring project managers and engineers nationwide.' },
      { name: 'CBRE', hiring_signal: 'hot', hiring_description: "World's largest commercial real estate services firm — strong project management division." },
      { name: 'AECOM', hiring_signal: 'hot', hiring_description: 'Global infrastructure firm — extensive project management roles across the US.' },
      { name: 'Bechtel', hiring_signal: 'warm', hiring_description: 'Major engineering and construction company — project management roles nationwide.' },
      { name: 'Skanska', hiring_signal: 'warm', hiring_description: 'Global construction firm with strong project management programs.' },
    ],
    mid: [
      { name: 'Hines', hiring_signal: 'warm', hiring_description: 'Global real estate firm with strong development and construction management programs.' },
      { name: 'Clayco', hiring_signal: 'warm', hiring_description: 'Real estate, architecture and construction firm — project management roles.' },
      { name: 'Robins & Morton', hiring_signal: 'warm', hiring_description: 'Southeast-focused construction firm with strong culture and project roles.' },
      { name: 'Barton Malow', hiring_signal: 'warm', hiring_description: 'Midwest construction firm — project engineer and manager roles.' },
      { name: 'DPR Construction', hiring_signal: 'hot', hiring_description: 'Employee-owned builder with strong entry-level project management programs.' },
    ],
    startup: [
      { name: 'Procore', hiring_signal: 'hot', hiring_description: 'Construction management software startup — sales, support, and analyst roles.' },
      { name: 'PlanGrid', hiring_signal: 'warm', hiring_description: 'Construction productivity software — customer success and implementation.' },
      { name: 'Katerra', hiring_signal: 'warm', hiring_description: 'Tech-enabled construction startup — operations and project coordination.' },
      { name: 'OpenSpace', hiring_signal: 'warm', hiring_description: 'Construction documentation startup — field and customer success roles.' },
      { name: 'Buildots', hiring_signal: 'warm', hiring_description: 'AI-powered construction monitoring startup — implementation roles.' },
    ],
  },
};

const DEFAULT_COMPANIES = {
  large: [
    { name: 'Deloitte', hiring_signal: 'hot', hiring_description: 'Hiring consultants and analysts nationwide across all service lines.' },
    { name: 'JPMorgan', hiring_signal: 'hot', hiring_description: 'Large-scale hiring for finance and operations roles nationwide.' },
    { name: 'Google', hiring_signal: 'hot', hiring_description: 'Entry-level roles across multiple teams.' },
  ],
  mid: [
    { name: 'Duolingo', hiring_signal: 'hot', hiring_description: 'Fast-growing edtech company with strong culture.' },
    { name: 'Canva', hiring_signal: 'hot', hiring_description: 'Design platform scaling rapidly with analyst and product roles.' },
    { name: 'Brex', hiring_signal: 'warm', hiring_description: 'Financial technology company with meaningful early-career roles.' },
  ],
  startup: [
    { name: 'Ramp', hiring_signal: 'hot', hiring_description: 'Fast-growing fintech — real ownership from day one.' },
    { name: 'Linear', hiring_signal: 'warm', hiring_description: 'Project management startup with a culture of craft.' },
    { name: 'Retool', hiring_signal: 'warm', hiring_description: 'Internal tools startup — broad exposure and fast learning.' },
  ],
};

function getCompaniesBySize(industryData, sizePreference) {
  const pref = sizePreference?.length > 0 ? sizePreference : ['large', 'mid', 'startup'];
  const results = [];

  // Rank 1 (most preferred): take up to 3
  const rank1 = industryData[pref[0]] || [];
  results.push(...rank1.slice(0, 3));

  // Rank 2: take up to 2
  const rank2 = industryData[pref[1]] || [];
  results.push(...rank2.slice(0, 2));

  // Deduplicate
  const seen = new Set();
  return results.filter(c => {
    if (seen.has(c.name)) return false;
    seen.add(c.name);
    return true;
  }).slice(0, 5);
}

Deno.serve(async (req) => {
  try {
    // No auth needed — pure in-memory lookup, no DB calls
    const body = await req.json().catch(() => ({}));
    const goals = body.career_goals || {};
    let industries = goals.industries?.length > 0 ? goals.industries : [];
    // Infer from role if no industries specified
    if (industries.length === 0 && goals.role) {
      const inferred = inferIndustryFromRole(goals.role);
      if (inferred) industries = [inferred];
    }
    const sizePreference = goals.company_size_preference || ['large', 'mid', 'startup'];
    const excludeNames = (goals.target_companies || []).map(c => c.toLowerCase());

    let companies = [];

    // Find matching industry data
    if (industries.length > 0) {
      const primary = industries[0];
      const industryData = INDUSTRY_COMPANIES[primary];

      if (industryData) {
        companies = getCompaniesBySize(industryData, sizePreference);
      } else {
        // Try partial match
        for (const [key, data] of Object.entries(INDUSTRY_COMPANIES)) {
          if (key.toLowerCase().includes(primary.toLowerCase().split(' ')[0])) {
            companies = getCompaniesBySize(data, sizePreference);
            break;
          }
        }
      }
    }

    // Default fallback
    if (companies.length === 0) {
      const pref = sizePreference[0] || 'large';
      companies = DEFAULT_COMPANIES[pref] || DEFAULT_COMPANIES.large;
    }

    // Apply exclude filter
    companies = companies.filter(c => !excludeNames.includes(c.name.toLowerCase()));

    const result = companies.slice(0, 5).map(c => ({
      name: c.name,
      industry: industries[0] || '',
      size: c.size || sizePreference[0] || 'large',
      hiring_signal: c.hiring_signal,
      hiring_description: c.hiring_description,
      has_web_result: true,
    }));

    console.log(`✅ getLiveJobMatchesFn: ${result.length} companies for industries: ${industries.join(', ')} | size pref: ${sizePreference.join('>')}`);
    return Response.json({ companies: result });

  } catch (error) {
    console.error('getLiveJobMatchesFn error:', error.message);
    return Response.json({ error: error.message, companies: [] }, { status: 500 });
  }
});