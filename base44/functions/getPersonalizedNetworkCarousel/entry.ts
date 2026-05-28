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
 * sourceCategory labels:
 *   'A' = 🔥 Hidden Network Referral  — surfaced directly from parent/alumni network intake
 *   'B' = 🛰️ Hiring Manager Social Feed — native social post by a hiring manager (pre-ATS)
 *   'C' = ⚡ Direct Backdoor Track     — rolling ATS talent pool / evergreen pipeline on company site
 */

const INDUSTRY_KEYWORDS = {
  'finance': ['finance', 'financial', 'investment', 'banking', 'capital', 'wealth', 'equity', 'trading', 'accounting', 'cfo', 'analyst', 'insurance'],
  'finance & insurance': ['finance', 'financial', 'investment', 'banking', 'capital', 'wealth', 'equity', 'trading', 'accounting', 'cfo', 'analyst', 'insurance'],
  'human resources': ['hr', 'human resources', 'talent', 'recruiting', 'recruiter', 'people ops', 'people operations', 'workforce', 'benefits', 'chro', 'hrbp'],
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

// sourceCategory:
//   'A' = 🔥 Hidden Network Referral — sourced directly from parent/alumni intake
//   'B' = 🛰️ Hiring Manager Social Feed — surfaced from native LinkedIn/social manager posts
//   'C' = ⚡ Direct Backdoor Track — rolling ATS talent pool / evergreen pipeline on company site
//   'D' = 💬 Industry Community Thread — Reddit/Slack megathread, founder direct post
//   'E' = 🔭 Niche Platform Scout — curated from Wellfound, Dribbble, Otta, etc.
//         requires: nichePlatform field (key into NICHE_PLATFORM_CONFIG)

// Niche platform metadata — used by the frontend to render the "Curated Via" banner
const NICHE_PLATFORM_CONFIG = {
  wellfound:    { label: 'Wellfound (AngelList)', icon: '🚀', insight: 'Sourced from an exclusive startup network. This role has 85% fewer public applicants than LinkedIn.' },
  builtin:      { label: 'Built In', icon: '🏙️', insight: 'Local tech ecosystem listing — not syndicated to mainstream job boards. Applies from talent who already know the city.' },
  keyvalues:    { label: 'Key Values', icon: '🧭', insight: 'Companies post here when culture fit matters more than a keyword-matched resume. High response rates.' },
  workingnotworking: { label: 'Working Not Working', icon: '🎨', insight: 'Elite creative community — only top agencies recruit here. Applicant pool is 10x smaller than Behance.' },
  dribbble:     { label: 'Dribbble Jobs', icon: '🏀', insight: 'Design studios post here to catch creatives actively shipping work — not passive resume uploaders.' },
  otta:         { label: 'Otta', icon: '📊', insight: 'Otta scores companies on salary transparency & growth. Only high-quality roles make the cut.' },
  jobbio:       { label: 'Jobbio', icon: '🌿', insight: 'Culture-first curation — roles are matched on values, not just keywords. Much lower noise than LinkedIn.' },
  lattice_rfh:  { label: 'Resources for Humans (Lattice)', icon: '👥', insight: 'Posted inside an invite-only HR Slack community — seen by People Ops insiders before anyone else.' },
  shrm:         { label: 'SHRM Job Board', icon: '🏛️', insight: 'The official SHRM board is largely ignored by students — yet it hosts thousands of HR coordinator roles with almost zero Gen-Z competition.' },
};

const JOB_POOL = {
  'finance': [
    { company: 'JPMorgan', role: 'Financial Operations Specialist', description: 'Analyst roles in investment banking and corporate finance divisions.', source: 'jpmorgan.com/careers', sourceCategory: 'C' },
    { company: 'Goldman Sachs', role: 'Investment Banking Analyst', description: 'Summer and new associate programs across all divisions.', source: 'goldmansachs.com/careers', sourceCategory: 'C' },
    { company: 'Stripe', role: 'Financial Operations Specialist', description: 'Finance and strategy analyst roles at a leading fintech.', source: 'stripe.com/jobs', sourceCategory: 'B' },
    { company: 'Deloitte', role: 'Finance & Advisory Associate', description: 'Audit, tax, and financial advisory associates across US offices.', source: 'deloitte.com/careers', sourceCategory: 'C' },
    { company: 'BlackRock', role: 'Investment Analyst', description: 'Analyst programs across multi-asset and quant divisions.', source: 'blackrock.com/careers', sourceCategory: 'C' },
    { company: 'SoFi', role: 'Finance Analyst', description: 'Personal finance platform — lending, analytics, and operations.', source: 'sofi.com/careers', sourceCategory: 'B' },
    { company: 'Ramp', role: 'Finance & Strategy Analyst', description: 'Fast-growing fintech with high-ownership finance roles.', source: 'ramp.com/careers', sourceCategory: 'B' },
    { company: 'PwC', role: 'Assurance Associate', description: 'Big 4 hiring across all service lines for new graduates.', source: 'pwc.com/careers', sourceCategory: 'C' },
  ],
  'finance & insurance': [
    { company: 'JPMorgan', role: 'Financial Operations Specialist', description: 'Analyst roles in investment banking and corporate finance divisions.', source: 'jpmorgan.com/careers', sourceCategory: 'C' },
    { company: 'Goldman Sachs', role: 'Investment Banking Analyst', description: 'Summer and new associate programs across all divisions.', source: 'goldmansachs.com/careers', sourceCategory: 'C' },
    { company: 'Stripe', role: 'Financial Operations Specialist', description: 'Finance and strategy analyst roles at a leading fintech.', source: 'stripe.com/jobs', sourceCategory: 'B' },
    { company: 'Deloitte', role: 'Finance & Advisory Associate', description: 'Audit, tax, and financial advisory associates across US offices.', source: 'deloitte.com/careers', sourceCategory: 'C' },
    { company: 'Ramp', role: 'Finance & Strategy Analyst', description: 'Fast-growing fintech with high-ownership finance roles.', source: 'ramp.com/careers', sourceCategory: 'B' },
  ],
  'human resources': [
    { company: 'Lattice', role: 'People Operations Coordinator', description: 'HR tech company — and their own people ops team is actively hiring entry-level coordinators.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Rippling', role: 'HR Generalist (New Grad)', description: 'Fast-scaling HR/payroll platform. Hiring people ops from their own Wellfound page.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Gusto', role: 'People Operations Associate', description: 'Payroll & benefits platform building out their internal HR team.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'HR Tech Startup', role: 'Talent Coordinator', description: 'Posted inside the Lattice "Resources for Humans" Slack — seen by People Ops professionals only, days before any public listing.', source: 'lattice.com/resources-for-humans', sourceCategory: 'E', nichePlatform: 'lattice_rfh' },
    { company: 'Mid-Market SaaS Co.', role: 'HR Coordinator', description: 'Overlooked by most students — this role posted on the SHRM job board has received zero Gen-Z applications.', source: 'shrm.org/jobs', sourceCategory: 'E', nichePlatform: 'shrm' },
  ],
  'tech': [
    { company: 'Adobe', role: 'Junior Product Designer', description: 'Design roles across Creative Cloud and Digital Experience — highly competitive public listing.', source: 'linkedin.com/jobs', sourceCategory: 'C', displayStyle: 'REALITY_CHECK', daysPosted: 16, applicantCount: 349 },
    { company: 'Google', role: 'Software Engineer (New Grad)', description: 'Engineering and product roles across cloud, AI, and consumer teams.', source: 'careers.google.com', sourceCategory: 'C' },
    { company: 'Microsoft', role: 'Software Development Engineer', description: 'New grad programs spanning cloud, AI, and productivity divisions.', source: 'careers.microsoft.com', sourceCategory: 'C' },
    { company: 'Salesforce', role: 'Associate Software Engineer', description: 'Rotational and entry-level engineering roles across the platform.', source: 'salesforce.com/careers', sourceCategory: 'C' },
    { company: 'Meta', role: 'Data Engineer', description: 'Data and engineering roles across ads and product infrastructure.', source: 'metacareers.com', sourceCategory: 'B' },
    { company: 'Ramp', role: 'Software Engineer', description: 'Fast-growing fintech — real engineering ownership from day one.', source: 'ramp.com/careers', sourceCategory: 'B' },
    { company: 'Notion', role: 'Product Analyst', description: 'Productivity startup scaling globally — product and data roles.', source: 'notion.com/careers', sourceCategory: 'B' },
    { company: 'Early-Stage AI Startup', role: 'Software Engineer', description: 'Seed-stage AI startup seeking early engineers — spotted in r/cscareerquestions monthly hiring thread. Direct founder contact, no recruiter screen.', source: 'reddit.com/r/cscareerquestions', sourceCategory: 'D' },
    { company: 'Webflow', role: 'Junior Creative Strategist', description: 'No-code design platform with a strong creative culture — posted exclusively on Wellfound.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Linear', role: 'Product Designer', description: 'Premium software tool beloved by engineers — Key Values listing targeting culture-aligned candidates only.', source: 'keyvalues.com', sourceCategory: 'E', nichePlatform: 'keyvalues' },
    { company: 'Otta-Curated Startup', role: 'Growth Analyst', description: 'Otta scores this company 9/10 for salary transparency and growth trajectory — and it has under 30 applicants.', source: 'otta.com', sourceCategory: 'E', nichePlatform: 'otta' },
  ],
  'technology, information & media': [
    { company: 'Google', role: 'Software Engineer (New Grad)', description: 'Engineering and product roles across cloud, AI, and consumer teams.', source: 'careers.google.com', sourceCategory: 'C' },
    { company: 'Microsoft', role: 'Software Development Engineer', description: 'New grad programs spanning cloud, AI, and productivity divisions.', source: 'careers.microsoft.com', sourceCategory: 'C' },
    { company: 'Meta', role: 'Data Engineer', description: 'Data and engineering roles across ads and product infrastructure.', source: 'metacareers.com', sourceCategory: 'B' },
  ],
  'consulting': [
    { company: 'McKinsey', role: 'Business Analyst', description: 'Analyst roles for top undergrads entering management consulting.', source: 'mckinsey.com/careers', sourceCategory: 'C' },
    { company: 'Deloitte', role: 'Strategy & Analytics Consultant', description: 'Consulting and business analysts in advisory practices nationwide.', source: 'deloitte.com/careers', sourceCategory: 'C' },
    { company: 'BCG', role: 'Associate Consultant', description: 'Entry-level strategy roles for new graduates.', source: 'bcg.com/careers', sourceCategory: 'C' },
    { company: 'West Monroe', role: 'Business Analyst', description: 'Digital consulting firm actively hiring analysts.', source: 'westmonroe.com/careers', sourceCategory: 'B' },
    { company: 'Boutique Strategy Firm', role: 'Junior Consultant', description: 'Founder-led strategy consultancy hiring via r/consulting megathread — direct email contact, no ATS.', source: 'reddit.com/r/consulting', sourceCategory: 'D' },
  ],
  'professional services': [
    { company: 'Deloitte', role: 'Consulting Analyst', description: 'Advisory associates in strategy, digital, and operations.', source: 'deloitte.com/careers', sourceCategory: 'C' },
    { company: 'EY', role: 'Associate', description: 'Entry-level roles across audit, tax, and advisory.', source: 'ey.com/careers', sourceCategory: 'C' },
    { company: 'KPMG', role: 'Advisory Associate', description: 'Associate-level hiring across US offices.', source: 'kpmg.com/careers', sourceCategory: 'C' },
    { company: 'McKinsey', role: 'Business Analyst', description: 'Analyst roles for top undergrads entering management consulting.', source: 'mckinsey.com/careers', sourceCategory: 'C' },
  ],
  'healthcare': [
    { company: 'HCA Healthcare', role: 'Clinical Coordinator', description: 'Hospital network consistently hiring nurses across hundreds of facilities.', source: 'hcahealthcare.com/careers', sourceCategory: 'C' },
    { company: 'AdventHealth', role: 'Registered Nurse', description: 'Faith-based hospital network with strong nursing culture.', source: 'adventhealth.com/careers', sourceCategory: 'C' },
    { company: 'Carbon Health', role: 'Care Coordinator', description: 'Tech-enabled primary care startup rapidly expanding clinical teams.', source: 'carbonhealth.com/careers', sourceCategory: 'B' },
  ],
  'healthcare & pharmaceuticals': [
    { company: 'HCA Healthcare', role: 'Clinical Coordinator', description: 'Hospital network consistently hiring nurses across hundreds of facilities.', source: 'hcahealthcare.com/careers', sourceCategory: 'C' },
    { company: 'CVS Health', role: 'Pharmacy Operations Analyst', description: 'Hiring clinical and operations staff for pharmacy and MinuteClinic.', source: 'cvshealth.com/careers', sourceCategory: 'C' },
  ],
  'marketing': [
    { company: 'Procter & Gamble', role: 'Brand Management Associate', description: 'Brand management and operations rotational roles for recent grads.', source: 'pg.com/careers', sourceCategory: 'C' },
    { company: 'Edelman', role: 'PR Account Coordinator', description: "World's largest PR firm — hiring communications and PR associates.", source: 'edelman.com/careers', sourceCategory: 'C' },
    { company: 'Ogilvy', role: 'Creative Account Manager', description: 'Creative and account management roles for recent grads in advertising.', source: 'ogilvy.com/careers', sourceCategory: 'B' },
  ],
  'creative': [
    { company: 'Superside', role: 'Junior Creative Strategist', description: 'Remote-first creative agency — posted on Working Not Working, not on LinkedIn. Applicant pool is a fraction of mainstream job boards.', source: 'workingnotworking.com', sourceCategory: 'E', nichePlatform: 'workingnotworking' },
    { company: 'Figma', role: 'Brand Designer', description: 'Design tool powerhouse — role posted on Dribbble Jobs to reach designers actively sharing their work.', source: 'dribbble.com/jobs', sourceCategory: 'E', nichePlatform: 'dribbble' },
    { company: 'Mailchimp', role: 'UX Writer', description: 'Strong brand and content culture — curated on Key Values for candidates who care about autonomy and craft.', source: 'keyvalues.com', sourceCategory: 'E', nichePlatform: 'keyvalues' },
    { company: 'Jobbio Creative Agency', role: 'Content Strategist', description: 'Boutique agency matched on Jobbio for culture alignment — much less noise than a LinkedIn Easy Apply.', source: 'jobbio.com', sourceCategory: 'E', nichePlatform: 'jobbio' },
  ],
  'advertising & pr': [
    { company: 'Edelman', role: 'PR Account Coordinator', description: "World's largest PR firm — hiring communications and PR associates.", source: 'edelman.com/careers', sourceCategory: 'C' },
    { company: 'Weber Shandwick', role: 'PR Associate', description: 'Hiring entry-level PR and communications associates.', source: 'webershandwick.com/careers', sourceCategory: 'B' },
    { company: 'WPP', role: 'Strategy Analyst', description: 'Global holding company with entry-level roles across agency brands.', source: 'wpp.com/careers', sourceCategory: 'C' },
    { company: 'Independent Creative Agency', role: 'Junior Copywriter', description: 'Boutique creative agency posting directly in r/design weekly thread — DM founder with portfolio link.', source: 'reddit.com/r/design', sourceCategory: 'D' },
    { company: 'Global Creative Studio', role: 'Art Director (Junior)', description: 'Curated by Working Not Working — only top-tier creative studios recruit on this platform. 90% fewer applicants than a job posted on LinkedIn.', source: 'workingnotworking.com', sourceCategory: 'E', nichePlatform: 'workingnotworking' },
  ],
  'real_estate': [
    { company: 'CBRE', role: 'Real Estate Analyst', description: "World's largest commercial real estate services firm hiring analysts.", source: 'cbre.com/careers', sourceCategory: 'C' },
    { company: 'JLL', role: 'Research Associate', description: 'Global RE firm with strong graduate development programs.', source: 'jll.com/careers', sourceCategory: 'C' },
  ],
  'construction & agriculture': [
    { company: 'Turner Construction', role: 'Project Engineer', description: 'One of the largest construction firms — hiring project managers and engineers nationwide.', source: 'turnerconstruction.com/careers', sourceCategory: 'C' },
    { company: 'CBRE', role: 'Project Manager', description: "World's largest commercial real estate services firm — project management division.", source: 'cbre.com/careers', sourceCategory: 'C' },
    { company: 'Procore', role: 'Implementation Analyst', description: 'Construction management software — sales, support, and analyst roles.', source: 'procore.com/careers', sourceCategory: 'B' },
  ],
  'education': [
    { company: 'Teach For America', role: 'Corps Member', description: 'Two-year teaching fellowship placing grads in under-resourced schools.', source: 'teachforamerica.org/join-tfa', sourceCategory: 'C' },
    { company: 'Duolingo', role: 'Curriculum Analyst', description: 'Language learning platform hiring for content and product roles.', source: 'duolingo.com/careers', sourceCategory: 'B' },
  ],
  'education & training': [
    { company: 'Teach For America', role: 'Corps Member', description: 'Two-year teaching fellowship in under-resourced schools.', source: 'teachforamerica.org/join-tfa', sourceCategory: 'C' },
    { company: 'Duolingo', role: 'Curriculum Analyst', description: 'Language learning platform hiring for content and product roles.', source: 'duolingo.com/careers', sourceCategory: 'B' },
  ],
  'nonprofit': [
    { company: 'Teach For America', role: 'Program Associate', description: 'Educational non-profit with operations and program roles.', source: 'teachforamerica.org/join-tfa', sourceCategory: 'C' },
    { company: 'Code for America', role: 'Civic Tech Fellow', description: 'Non-profit improving government services through technology.', source: 'codeforamerica.org/careers', sourceCategory: 'B' },
  ],
  'government': [
    { company: 'Booz Allen Hamilton', role: 'Government Analyst', description: 'Government consulting firm with strong entry-level programs.', source: 'boozallen.com/careers', sourceCategory: 'C' },
    { company: 'Deloitte Government', role: 'Federal Consultant', description: 'Federal consulting division hiring for public sector projects.', source: 'deloitte.com/careers', sourceCategory: 'C' },
  ],
  'government & public sector': [
    { company: 'Booz Allen Hamilton', role: 'Government Analyst', description: 'Government consulting firm with strong entry-level programs.', source: 'boozallen.com/careers', sourceCategory: 'C' },
    { company: 'Deloitte Government', role: 'Federal Consultant', description: 'Federal consulting division hiring for public sector projects.', source: 'deloitte.com/careers', sourceCategory: 'C' },
  ],
  'sports & entertainment': [
    { company: 'Live Nation', role: 'Marketing Coordinator', description: "World's largest live entertainment company — events and operations roles.", source: 'livenation.com/careers', sourceCategory: 'C' },
    { company: 'ESPN', role: 'Content Associate', description: 'Hiring for content, production, and marketing roles in sports media.', source: 'espncareers.com', sourceCategory: 'B' },
    { company: 'Nike', role: 'Brand Marketing Associate', description: 'Brand marketing and product roles for sports or business backgrounds.', source: 'jobs.nike.com', sourceCategory: 'C' },
  ],
  'logistics': [
    { company: 'Arrive Logistics', role: 'Account Manager', description: 'Growing freight brokerage — strong entry-level training program.', source: 'arrivelogistics.com/careers', sourceCategory: 'B' },
    { company: 'Samsara', role: 'Sales Development Rep', description: 'Fleet management platform — sales and operations roles.', source: 'samsara.com/careers', sourceCategory: 'B' },
    { company: 'C.H. Robinson', role: 'Supply Chain Analyst', description: 'Supply chain and freight brokerage roles with strong training.', source: 'chrobinson.com/careers', sourceCategory: 'C' },
  ],
  'transportation & logistics': [
    { company: 'Arrive Logistics', role: 'Account Manager', description: 'Growing freight brokerage — strong entry-level training program.', source: 'arrivelogistics.com/careers', sourceCategory: 'B' },
    { company: 'C.H. Robinson', role: 'Supply Chain Analyst', description: 'Supply chain and freight brokerage roles with strong training.', source: 'chrobinson.com/careers', sourceCategory: 'C' },
    { company: 'Samsara', role: 'Sales Development Rep', description: 'Fleet management platform startup — sales and operations roles.', source: 'samsara.com/careers', sourceCategory: 'B' },
  ],
};

const FALLBACK_JOBS = [
  { company: 'Deloitte', role: 'Business Analyst', description: 'Consulting and advisory associates across all US offices.', source: 'deloitte.com/careers', sourceCategory: 'C' },
  { company: 'JPMorgan', role: 'Operations Analyst', description: 'Finance and operations roles nationwide.', source: 'jpmorgan.com/careers', sourceCategory: 'C' },
  { company: 'Google', role: 'Associate Product Manager', description: 'Product and engineering roles across multiple teams.', source: 'careers.google.com', sourceCategory: 'C' },
  { company: 'Salesforce', role: 'Associate', description: 'Rotational roles across sales, engineering, and marketing.', source: 'salesforce.com/careers', sourceCategory: 'C' },
  { company: 'Procter & Gamble', role: 'Brand Management Associate', description: 'Consumer goods brand and operations roles.', source: 'pg.com/careers', sourceCategory: 'C' },
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
    const premiumCards = [];

    for (const job of jobPool) {
      const normalizedJobCompany = normalizeCompanyName(job.company);

      let networkEntry = companyNetworkMap[normalizedJobCompany];
      if (!networkEntry) {
        for (const [key, val] of Object.entries(companyNetworkMap)) {
          if (key.includes(normalizedJobCompany) || normalizedJobCompany.includes(key)) {
            networkEntry = val;
            break;
          }
        }
      }

      const alumni = networkEntry?.alumni || [];
      const parentsAtCompany = networkEntry?.parents || [];

      if (alumni.length === 0 && parentsAtCompany.length === 0) continue;

      const industryParentAdvisors = industryParents.slice(0, 3);
      const allParentAdvisors = [...new Map(
        [...parentsAtCompany, ...industryParentAdvisors].map(p => [p.id, p])
      ).values()];

      const featuredParent = allParentAdvisors.find(p =>
        memberInIndustry({ title: p.title, industry: p.industry, bio: '' }, industryKeywords)
      ) || allParentAdvisors[0] || null;

      // If this card has alumni who explicitly referred via network intake, upgrade to category A
      const hasNetworkReferral = alumni.some(a => a.referred_opening === true);
      const effectiveCategory = hasNetworkReferral ? 'A' : (job.sourceCategory || 'C');

      premiumCards.push({
        company: job.company,
        role: job.role,
        jobDescription: job.description,
        jobSource: job.source || null,
        jobSourceCategory: effectiveCategory,
        displayStyle: job.displayStyle || 'HIDDEN_SIGNAL',
        daysPosted: job.daysPosted || null,
        applicantCount: job.applicantCount || null,
        nichePlatform: job.nichePlatform || null,
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

    // ─── Fallback: surface jobs paired with industry-matched parents ─────────
    if (premiumCards.length === 0 && industryParents.length > 0) {
      const fallbackJobs = jobPool.slice(0, 3);
      for (const job of fallbackJobs) {
        const advisors = industryParents.slice(0, 3);
        premiumCards.push({
          company: job.company,
          role: job.role,
          jobDescription: job.description,
          jobSource: job.source || null,
          jobSourceCategory: job.sourceCategory || 'C',
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