import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * getOrganizedFeeds - Three-Tier Lead Hierarchy
 *
 * 🔥 HOT LEADS: Has verified school alumnus at that exact company
 *   - CTA: [ ⚡ Draft Backdoor Message ]
 *
 * ☀️ WARM LEADS: No company insider, but has industry connections (alumni/parents in same industry)
 *   - CTA: [ 💡 Request Industry Insight ]
 *
 * ❄️ COLD LEADS: No direct or industry connections yet
 *   - CTA: [ 🔍 View Role & Hunt Insiders ]
 */

const INDUSTRY_KEYWORDS = {
  'finance': ['finance', 'financial', 'investment', 'banking', 'capital', 'wealth', 'equity', 'trading', 'accounting', 'cfo', 'analyst', 'insurance'],
  'finance & insurance': ['finance', 'financial', 'investment', 'banking', 'capital', 'wealth', 'equity', 'trading', 'accounting', 'cfo', 'analyst', 'insurance'],
  'human resources': ['hr', 'human resources', 'talent', 'recruiting', 'recruiter', 'people ops', 'people operations', 'workforce', 'benefits', 'chro', 'hrbp'],
  'creative': ['creative', 'design', 'designer', 'marketing', 'brand', 'content', 'media', 'advertising', 'art', 'ux', 'ui', 'copywriter'],
  'advertising & pr': ['marketing', 'brand', 'advertising', 'social media', 'content', 'public relations', 'communications', 'digital marketing', 'seo', 'copywriter', 'creative'],
  'entrepreneur': ['founder', 'co-founder', 'ceo', 'owner', 'entrepreneur', 'startup', 'venture', 'managing partner'],
  'tech': ['software', 'engineer', 'developer', 'product', 'data', 'ai', 'ml', 'machine learning', 'cloud', 'saas', 'fullstack', 'backend', 'frontend'],
  'technology, information & media': ['software', 'engineer', 'developer', 'product', 'data', 'ai', 'machine learning', 'cloud', 'saas', 'tech', 'content', 'media', 'design'],
  'media and entertainment': ['media', 'entertainment', 'content', 'film', 'television', 'music', 'broadcast', 'streaming', 'creative', 'design', 'ux', 'copywriter', 'editorial', 'social media', 'brand'],
  'media & entertainment': ['media', 'entertainment', 'content', 'film', 'television', 'music', 'broadcast', 'streaming', 'creative', 'design', 'ux', 'copywriter', 'editorial', 'social media', 'brand'],
  'content & ux design': ['ux', 'ui', 'content', 'design', 'designer', 'copywriter', 'editorial', 'user experience', 'interaction', 'creative', 'brand', 'social media'],
  'ux design': ['ux', 'ui', 'design', 'designer', 'user experience', 'interaction', 'product designer', 'creative'],
  'content strategy': ['content', 'copywriter', 'editorial', 'writer', 'social media', 'communications', 'brand'],
  'creative direction': ['creative', 'art director', 'brand designer', 'design director', 'creative director'],
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
    { company: 'JPMorgan', role: 'Financial Operations Specialist', description: 'Location: New York, NY | Hybrid. Responsibilities: Support investment banking operations, prepare financial reports, analyze market trends, coordinate with trading desks. Requirements: Bachelor in Finance/Economics, 3.5+ GPA, strong Excel/SQL skills, Series 7/63 preferred. Compensation: $95,000 base + $20-40K bonus, full benefits, 401k match.', source: 'jpmorgan.com/careers', sourceCategory: 'C' },
    { company: 'Goldman Sachs', role: 'Investment Banking Analyst', description: 'Location: New York, NY | On-site. Responsibilities: Build financial models, conduct industry research, prepare pitch books, support M&A transactions. Requirements: Top-tier university, Finance/Econ major, 3.7+ GPA, prior IB internship. Compensation: $110,000 base + $50-100K bonus, premium health benefits, relocation assistance.', source: 'goldmansachs.com/careers', sourceCategory: 'C' },
    { company: 'Stripe', role: 'Financial Operations Specialist', description: 'Location: San Francisco, CA | Remote-friendly. Responsibilities: Manage payment operations, analyze transaction data, optimize financial workflows, partner with engineering teams. Requirements: Bachelor degree, 2+ years finance experience, SQL/Tableau skills, fintech interest. Compensation: $105,000 base + equity package, unlimited PTO, $3K learning stipend.', source: 'stripe.com/jobs', sourceCategory: 'B' },
    { company: 'Deloitte', role: 'Finance & Advisory Associate', description: 'Location: Multiple US offices | Hybrid. Responsibilities: Client financial analysis, audit support, tax preparation, advisory consulting. Requirements: Accounting/Finance degree, CPA track, strong communication skills. Compensation: $75,000-85,000 base + performance bonus, CPA study support, clear promotion path.', source: 'deloitte.com/careers', sourceCategory: 'C' },
    { company: 'BlackRock', role: 'Investment Analyst', description: 'Location: New York, NY | Hybrid. Responsibilities: Portfolio analysis, risk assessment, market research, client reporting. Requirements: Finance/Econ/Math degree, 3.6+ GPA, Bloomberg certification, CFA Level 1 preferred. Compensation: $100,000 base + $30-50K bonus, comprehensive benefits, tuition reimbursement.', source: 'blackrock.com/careers', sourceCategory: 'C' },
    { company: 'SoFi', role: 'Finance Analyst', description: 'Location: Charlotte, NC | Remote options. Responsibilities: Credit risk analysis, loan portfolio management, financial modeling, regulatory compliance. Requirements: Bachelor in Finance, 1-3 years experience, Python/R skills. Compensation: $85,000-95,000 base + equity, 100% health premium coverage, parental leave.', source: 'sofi.com/careers', sourceCategory: 'B' },
    { company: 'Ramp', role: 'Finance & Strategy Analyst', description: 'Location: New York, NY | Hybrid. Responsibilities: Strategic planning, financial forecasting, business intelligence, cross-functional projects. Requirements: Top university, analytical mindset, Excel/SQL expertise, startup interest. Compensation: $110,000 base + significant equity, unlimited PTO, home office budget.', source: 'ramp.com/careers', sourceCategory: 'B' },
    { company: 'PwC', role: 'Assurance Associate', description: 'Location: Multiple US cities | Hybrid. Responsibilities: Financial statement audits, internal controls testing, client communication, team collaboration. Requirements: Accounting degree, 150 credit hours, CPA eligibility. Compensation: $70,000-80,000 base + busy season bonus, CPA bonuses, career development.', source: 'pwc.com/careers', sourceCategory: 'C' },
  ],
  'finance & insurance': [
    { company: 'JPMorgan', role: 'Financial Operations Specialist', description: 'Analyst roles in investment banking and corporate finance divisions.', source: 'jpmorgan.com/careers', sourceCategory: 'C' },
    { company: 'Goldman Sachs', role: 'Investment Banking Analyst', description: 'Summer and new associate programs across all divisions.', source: 'goldmansachs.com/careers', sourceCategory: 'C' },
    { company: 'Stripe', role: 'Financial Operations Specialist', description: 'Finance and strategy analyst roles at a leading fintech.', source: 'stripe.com/jobs', sourceCategory: 'B' },
    { company: 'Deloitte', role: 'Finance & Advisory Associate', description: 'Audit, tax, and financial advisory associates across US offices.', source: 'deloitte.com/careers', sourceCategory: 'C' },
    { company: 'Ramp', role: 'Finance & Strategy Analyst', description: 'Fast-growing fintech with high-ownership finance roles.', source: 'ramp.com/careers', sourceCategory: 'B' },
  ],
  'human resources': [
    { company: 'Lattice', role: 'People Operations Coordinator', description: 'Location: Remote (US) | Fully Remote. Responsibilities: Manage offer letter generation and background checks, own new hire onboarding scheduling, maintain HRIS data integrity, coordinate engagement surveys, support benefits administration. Requirements: 0-2 years HR/operations experience, exceptional organizational skills, Google Suite proficiency, interest in people ops. Compensation: $65,000-80,000 base + equity, 100% medical/dental/vision, unlimited PTO, $3K learning stipend, home office budget.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Rippling', role: 'HR Generalist (New Grad)', description: 'Location: San Francisco, CA | Hybrid. Responsibilities: Full-cycle recruiting coordination, onboard 50+ new hires monthly, administer benefits across 3 states, manage employee relations, ensure compliance. Requirements: Bachelor degree, strong communication skills, ability to manage multiple priorities, discretion with confidential info. Compensation: $70,000-85,000 base + meaningful equity, full health benefits, build HR infrastructure at $13B company.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Gusto', role: 'People Operations Associate', description: 'Location: Denver, CO | Remote-first. Responsibilities: Coordinate 100+ annual hires, manage I-9 verification, administer open enrollment for 1,200+ employees, track HR metrics, support DEI initiatives. Requirements: 0-2 years HR/operations experience, passion for employee experience, attention to detail, data comfort. Compensation: $68,000-82,000 + equity, 100% employer-paid premiums, unlimited PTO (15-day min), $3K development stipend, parental leave.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Workday', role: 'HR Systems Analyst', description: 'Location: Pleasanton, CA | Hybrid. Responsibilities: Configure Workday HCM, troubleshoot system issues, generate reports, train users on HR technology. Requirements: Bachelor degree, HRIS experience preferred, analytical skills, HR certification track. Compensation: $75,000-90,000 base + bonus, premium benefits, certification support, career growth.', source: 'workday.com/careers', sourceCategory: 'C' },
    { company: 'LinkedIn', role: 'Talent Operations Specialist', description: 'Location: Sunnyvale, CA | Hybrid. Responsibilities: Optimize recruiting processes, manage ATS workflows, coordinate candidate communications, analyze hiring metrics. Requirements: 2+ years recruiting ops experience, Greenhouse/Workday expertise, data analysis skills. Compensation: $95,000-115,000 base + equity, comprehensive benefits, learning budget.', source: 'linkedin.com/careers', sourceCategory: 'B' },
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
  'media and entertainment': [
    { company: 'Netflix', role: 'Junior Content Designer', description: 'Location: Los Angeles, CA | Hybrid. Responsibilities: Design product features for 250M+ subscribers, create user journey maps, collaborate with engineering on interface improvements. Requirements: Bachelor in Design/UX, 1-2 years product design experience, Figma expertise, strong portfolio. Compensation: $95,000-115,000 base + equity, premium health/dental/vision, unlimited PTO, content stipend.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Disney', role: 'Content Coordinator', description: 'Location: Burbank, CA | On-site. Responsibilities: Manage editorial calendars for Disney+/Hulu/ESPN+, coordinate content rollout schedules, track deliverables across teams. Requirements: Bachelor in Communications/Media, excellent writing skills, project management experience, passion for streaming. Compensation: $70,000-80,000 base + bonus, Disney+ bundle, park discounts, comprehensive benefits.', source: 'disney.com/careers', sourceCategory: 'C' },
    { company: 'Spotify', role: 'UX Writer', description: 'Location: New York, NY | Remote-friendly. Responsibilities: Craft voice/tone for world\'s largest audio platform, write app copy and onboarding flows, partner with product designers. Requirements: 2+ years UX writing, portfolio of shipped digital products, collaboration skills. Compensation: $100,000-120,000 base + equity, Spotify Premium Family, wellness stipend, parental leave.', source: 'dribbble.com/jobs', sourceCategory: 'E', nichePlatform: 'dribbble' },
    { company: 'BuzzFeed', role: 'Junior Content Strategist', description: 'Location: New York, NY | Hybrid. Responsibilities: Develop branded content campaigns, work with editorial teams on social-first strategies, analyze performance metrics. Requirements: Bachelor in Marketing/Communications, 1-2 years content experience, social media expertise. Compensation: $65,000-75,000 base + performance bonus, health benefits, flexible PTO, creative freedom.', source: 'workingnotworking.com', sourceCategory: 'E', nichePlatform: 'workingnotworking' },
    { company: 'Hulu', role: 'Brand Designer', description: 'Location: Santa Monica, CA | Hybrid. Responsibilities: Create visual assets for Hulu brand campaigns, design marketing materials, maintain brand consistency across platforms. Requirements: Bachelor in Graphic Design, strong portfolio, Adobe Creative Suite mastery. Compensation: $85,000-100,000 base + bonus, Hulu subscription, health coverage, professional development budget.', source: 'dribbble.com/jobs', sourceCategory: 'E', nichePlatform: 'dribbble' },
    { company: 'Warner Bros Discovery', role: 'Social Media Coordinator', description: 'Location: New York, NY | Hybrid. Responsibilities: Manage social channels for HBO Max/CNN/DC, create engaging content, monitor community engagement, track analytics. Requirements: Bachelor in Marketing/Communications, 1+ years social media experience, knowledge of entertainment landscape. Compensation: $60,000-70,000 base + bonus, Max subscription, full benefits, career growth opportunities.', source: 'wbd.com/careers', sourceCategory: 'C' },
  ],
  'media & entertainment': [
    { company: 'Netflix', role: 'Junior Content Designer', description: 'Netflix is hiring junior content designers for their product design team — creative roles with real ownership over how 250M subscribers experience the interface.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Disney', role: 'Content Coordinator', description: 'Disney Streaming is hiring a Content Coordinator to manage editorial calendars and content rollout across Disney+, Hulu, and ESPN+.', source: 'disney.com/careers', sourceCategory: 'C' },
    { company: 'Spotify', role: 'UX Writer', description: 'Spotify is looking for a UX writer to craft the voice and language of the world\'s largest audio platform.', source: 'dribbble.com/jobs', sourceCategory: 'E', nichePlatform: 'dribbble' },
    { company: 'Hulu', role: 'Brand Designer', description: 'Hulu is sourcing a brand designer for their in-house creative team — posted on Dribbble.', source: 'dribbble.com/jobs', sourceCategory: 'E', nichePlatform: 'dribbble' },
    { company: 'Warner Bros Discovery', role: 'Social Media Coordinator', description: 'Entry-level social media coordinator role across WBD\'s flagship properties.', source: 'wbd.com/careers', sourceCategory: 'C' },
  ],
  'content & ux design': [
    { company: 'Figma', role: 'Brand Designer', description: 'Design tool powerhouse — role posted on Dribbble Jobs to reach designers actively sharing their work.', source: 'dribbble.com/jobs', sourceCategory: 'E', nichePlatform: 'dribbble' },
    { company: 'Mailchimp', role: 'UX Writer', description: 'Strong brand and content culture — curated on Key Values for candidates who care about autonomy and craft.', source: 'keyvalues.com', sourceCategory: 'E', nichePlatform: 'keyvalues' },
    { company: 'Superside', role: 'Junior Creative Strategist', description: 'Remote-first creative agency — posted on Working Not Working. Applicant pool is a fraction of mainstream job boards.', source: 'workingnotworking.com', sourceCategory: 'E', nichePlatform: 'workingnotworking' },
    { company: 'Webflow', role: 'Junior Content Strategist', description: 'No-code design platform with a strong creative culture — posted exclusively on Wellfound.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Linear', role: 'Product Designer', description: 'Premium software tool — Key Values listing targeting culture-aligned designers only.', source: 'keyvalues.com', sourceCategory: 'E', nichePlatform: 'keyvalues' },
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

    // Fetch user's unlocked jobs (scouted backdoors)
    const unlocks = await base44.asServiceRole.entities.NetworkingPipeline.filter({
      user_id: user.id,
      unlocked: true
    });
    const unlockedJobIds = new Set(unlocks.map(u => u.job_id));

    const body = await req.json().catch(() => ({}));
    let targetIndustries = (
      body.target_industries
      || user.career_goals?.target_industries
      || user.industries_interested
      || user.industries_of_interest
      || []
    ).map(i => i.toLowerCase());

    // If no industries set, use a default to show some opportunities
    if (!targetIndustries.length) {
      targetIndustries = ['tech']; // Default fallback
    }

    const targetRole = body.target_role || user.career_goals?.role || user.target_role || '';
    // target_positions is an array of role-type selections from onboarding (e.g. ["UX Design", "Content Strategy"])
    const targetPositions = (
      body.target_positions
      || user.career_goals?.target_positions
      || user.target_positions
      || []
    ).map(p => p.toLowerCase());

    const schoolCode = (user.school_code || '').toLowerCase();
    const schoolName = (user.school_name || user.school || user.university || '').toLowerCase();
    
    // Get user's location preferences
    const userLocation = (user.location_preference || user.preferred_location || user.location || '').toLowerCase();
    const userCity = (user.location_city || user.city || '').toLowerCase();
    const userState = (user.location_state || user.state || '').toLowerCase();
    const relocationOk = user.relocation_ok === true;
    const userSchoolCode = (user.school_code || '').toLowerCase();
    const userSchool = (user.school_name || user.school || user.university || '').toLowerCase();

    // ─── Step 1: Build the job pool from target industries ──────────────────
    const SENIOR_FILTER = /\b(senior|sr\.|lead|principal|director|manager|head of|vp |vice president|staff engineer|architect|managing partner)\b/i;

    let jobPool = [];
    for (const ind of targetIndustries) {
      const pool = JOB_POOL[ind] || [];
      jobPool.push(...pool);
    }

    // Filter out senior roles
    jobPool = jobPool.filter(j => !SENIOR_FILTER.test(j.role));
    
    // Filter jobs by location if user has specified preferences
    if (userLocation || userCity || userState) {
      const locationKeywords = [userLocation, userCity, userState].filter(Boolean);
      jobPool = jobPool.filter(j => {
        const jobDesc = (j.description || '').toLowerCase();
        const isRemote = jobDesc.includes('remote') || jobDesc.includes('work from home');
        const matchesLocation = locationKeywords.some(loc => 
          jobDesc.includes(loc) || 
          jobDesc.includes(loc.replace(' ', ''))
        );
        return isRemote || matchesLocation || relocationOk;
      });
    }

    // Build role keyword list from target_role, target_positions, AND industry-derived keywords
    // This is the "double-lock": industry must match AND role title must match
    const roleKeywords = (targetRole || '')
      .toLowerCase()
      .split(/[\s,\/]+/)
      .filter(w => w.length > 2);

    // target_positions keywords — e.g. "ux design" → ["ux", "design"]
    const positionKeywords = targetPositions
      .flatMap(p => p.split(/[\s,\/]+/))
      .filter(w => w.length > 2);

    // Also pull function keywords from the industry map for role-level matching
    const industryRoleKeywords = getMemberKeywords([...targetIndustries, ...targetPositions]);

    const allRoleKeywords = [...new Set([...roleKeywords, ...positionKeywords, ...industryRoleKeywords])];

    if (allRoleKeywords.length > 0) {
      const roleFiltered = jobPool.filter(j => {
        const roleLower = j.role.toLowerCase();
        const descLower = j.description.toLowerCase();
        return allRoleKeywords.some(kw => roleLower.includes(kw) || descLower.includes(kw));
      });
      // Only apply if it narrows the results — prevents total wipeout for sparse industries
      if (roleFiltered.length > 0) jobPool = roleFiltered;
    }

    // Deduplicate by company
    const seen = new Set();
    jobPool = jobPool.filter(j => {
      if (seen.has(j.company)) return false;
      seen.add(j.company);
      return true;
    });

    // If still empty, use fallback but still try to role-filter it
    if (!jobPool.length) {
      let fallback = [...FALLBACK_JOBS].filter(j => !SENIOR_FILTER.test(j.role));
      if (allRoleKeywords.length > 0) {
        const roleFiltered = fallback.filter(j => {
          const roleLower = j.role.toLowerCase();
          const descLower = j.description.toLowerCase();
          return allRoleKeywords.some(kw => roleLower.includes(kw) || descLower.includes(kw));
        });
        if (roleFiltered.length > 0) fallback = roleFiltered;
      }
      jobPool = fallback;
    }

    // ─── Step 2: Load all network members (alumni + parents) ────────────────
    const INVALID = ['self employed', 'selfemployed', 'self-employed', 'retired', 'none', 'n/a', 'unemployed', 'stay at home', 'homemaker', 'between jobs'];
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);
    
    // Find REAL alumni/parents from user's school at each company
    const companyNames = jobPool.map(j => j.company.toLowerCase());
    const schoolAlumni = allUsers.filter(u => {
      const isAlumni = u.persona === 'alumni' || (Array.isArray(u.roles) && u.roles.includes('alumni'));
      const isParent = u.persona === 'parent' || (Array.isArray(u.roles) && u.roles.includes('parent'));
      if (!isAlumni && !isParent) return false;
      
      const uCode = (u.school_code || '').toLowerCase();
      const uName = (u.school_name || u.school || u.university || '').toLowerCase();
      const matchesSchool = (userSchoolCode && uCode === userSchoolCode) || 
                           (userSchool && uName === userSchool);
      return matchesSchool;
    });
    
    console.log(`[getPersonalizedNetworkCarousel] Found ${schoolAlumni.length} total alumni/parents from ${userSchoolCode || userSchool}`);
    
    // Build a map of company -> real alumni count from user's school
    const alumniByCompany = {};
    for (const company of companyNames) {
      const alumniAtCompany = schoolAlumni.filter(u => {
        const userCompany = (u.current_company || u.company || u.employer || '').toLowerCase().trim();
        // Skip users with empty company fields
        if (!userCompany) return false;
        const match = userCompany.includes(company) || company.includes(userCompany);
        if (match) console.log(`[getPersonalizedNetworkCarousel] ✅ Match: ${u.full_name} at ${userCompany} for job company ${company}`);
        return match;
      });
      alumniByCompany[company] = alumniAtCompany.length;
      console.log(`[getPersonalizedNetworkCarousel] Company "${company}" has ${alumniAtCompany.length} alumni`);
    }
    
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

    // ─── Step 4: Two-Tier Lead Hierarchy (Direct Network Leverage) ─────────
    // PRIORITY 1: priorityInsiders — company has a verified alumni or parent insider OR user-unlocked via scout
    // PRIORITY 2: targetedDiscoveries — clean role match, no insider at this company yet
    const priorityInsiders = [];
    const targetedDiscoveries = [];

    for (const job of jobPool) {
      // Check if user has unlocked this job via scout backdoor
      const isUnlockedByScout = unlockedJobIds.has(job.id || job.jobId);
      const normalizedJobCompany = normalizeCompanyName(job.company);

      let networkEntry = companyNetworkMap[normalizedJobCompany];
      if (!networkEntry) {
        // Fuzzy match: strip all non-alphanumeric chars and check substring overlap
        const jobKey = normalizedJobCompany.replace(/[^a-z0-9]/g, '');
        for (const [key, val] of Object.entries(companyNetworkMap)) {
          const netKey = key.replace(/[^a-z0-9]/g, '');
          if (jobKey.length >= 4 && netKey.length >= 4 &&
              (jobKey.includes(netKey) || netKey.includes(jobKey))) {
            networkEntry = val;
            break;
          }
        }
      }

      // Get REAL alumni count from user's school at this company
      // Try both normalized and raw company name for lookup
      let realAlumniCount = alumniByCompany[normalizedJobCompany] || 0;
      if (realAlumniCount === 0) {
        const rawCompany = job.company.toLowerCase();
        realAlumniCount = alumniByCompany[rawCompany] || 0;
      }
      const alumni = networkEntry?.alumni || [];
      const parentsAtCompany = networkEntry?.parents || [];

      // Build parent advisor list (for warm leads)
      const industryParentAdvisors = industryParents.slice(0, 3);
      const allParentAdvisors = [...new Map(
        [...parentsAtCompany, ...industryParentAdvisors].map(p => [p.id, p])
      ).values()];

      // Has insider if: real alumni from their school OR parent at company OR unlocked via scout
      const hasInsider = realAlumniCount > 0 || parentsAtCompany.length > 0 || isUnlockedByScout;

      // 🔥 PRIORITY 1: Company Insiders — verified alumni OR parent advisor at this exact company OR user-unlocked via scout
      if (hasInsider) {
        const featuredParent = parentsAtCompany[0] || null;
        const hasNetworkReferral = alumni.some(a => a.referred_opening === true);
        const effectiveCategory = hasNetworkReferral ? 'A' : (job.sourceCategory || 'C');

        const roleKws = targetRole.toLowerCase().split(/\s+/);
        const jobRoleLower = job.role.toLowerCase();
        const jobDescLower = job.description.toLowerCase();
        let matchScore = 50;
        if (targetIndustries.some(ind => jobDescLower.includes(ind))) matchScore += 30;
        const roleMatchCount = roleKws.filter(kw => kw.length > 3 && (jobRoleLower.includes(kw) || jobDescLower.includes(kw))).length;
        matchScore += Math.min(20, roleMatchCount * 5);
        matchScore += Math.min(10, alumni.length * 2);
        if (parentsAtCompany.length > 0) matchScore += 5;

        // Build insider badge copy
        const insiderBadge = realAlumniCount > 0 && parentsAtCompany.length > 0
          ? `${realAlumniCount} Alumni + ${parentsAtCompany.length} Parent Insider`
          : realAlumniCount > 0
            ? `${realAlumniCount} Alumni Work Here`
            : `${parentsAtCompany.length} Parent Advisor Here`;

        priorityInsiders.push({
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
          alumniCount: realAlumniCount,
          parentCount: parentsAtCompany.length,
          alumni: alumni.slice(0, 5),
          featuredParent: featuredParent ? { full_name: featuredParent.full_name, title: featuredParent.title, persona: 'parent' } : null,
          hasParentBonus: parentsAtCompany.length > 0,
          insiderBadge,
          ctaType: realAlumniCount > 0 ? 'message_alumni' : 'connect_parent',
          networkWeight: Math.min(99, matchScore),
          leadTier: 'insider',
        });

        if (priorityInsiders.length >= 6) continue;
      }
      // ☀️ PRIORITY 2: Targeted Hidden Lead — matches target role/industry, no insider yet
      else {
        targetedDiscoveries.push({
          company: job.company,
          role: job.role,
          jobDescription: job.description,
          jobSource: job.source || null,
          jobSourceCategory: job.sourceCategory || 'C',
          nichePlatform: job.nichePlatform || null,
          targetIndustry: targetIndustries[0] || '',
          matchedIndustries: targetIndustries,
          alumniCount: 0,
          parentCount: 0,
          hasParentBonus: false,
          ctaType: 'add_to_pipeline',
          leadTier: 'target',
        });
      }
    }

    // Fallback: if no targeted discoveries at all, fill from job pool
    if (priorityInsiders.length === 0 && targetedDiscoveries.length === 0) {
      jobPool.slice(0, 6).forEach(job => {
        targetedDiscoveries.push({
          company: job.company,
          role: job.role,
          jobDescription: job.description,
          jobSource: job.source || null,
          jobSourceCategory: job.sourceCategory || 'C',
          nichePlatform: job.nichePlatform || null,
          targetIndustry: targetIndustries[0] || '',
          matchedIndustries: targetIndustries,
          alumniCount: 0,
          parentCount: 0,
          hasParentBonus: false,
          ctaType: 'add_to_pipeline',
          leadTier: 'target',
        });
      });
    }

    console.log(`[getPersonalizedNetworkCarousel] 🔥 ${priorityInsiders.length} INSIDERS | ☀️ ${targetedDiscoveries.length} TARGETS`);
    console.log(`[getPersonalizedNetworkCarousel] Sample insider:`, priorityInsiders[0]?.company, priorityInsiders[0]?.alumniCount, priorityInsiders[0]?.jobDescription?.substring(0, 50));
    return Response.json({
      success: true,
      priorityInsiders: priorityInsiders.slice(0, 6),
      targetedDiscoveries: targetedDiscoveries.slice(0, 12),
      wasFiltered: targetIndustries.length > 0,
      targetIndustries,
    });

  } catch (error) {
    console.error('[getPersonalizedNetworkCarousel]', error.message);
    return Response.json({ error: error.message, cards: [] }, { status: 500 });
  }
});