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

// companyTier:
//   1 = Enterprise/Goliath (1,000+ employees) — brand recognition, structured programs
//   2 = Mid-Market Growth (200–1,000 employees) — scaling rapidly, high ownership
//   3 = Seed/Series A-C Startup (10–100 employees) — warm intro = almost guaranteed interview

const JOB_POOL = {
  'finance': [
    // Tier 1: Enterprise
    { company: 'JPMorgan', role: 'Financial Operations Specialist', companyTier: 1, description: 'Location: New York, NY | Hybrid. Responsibilities: Support investment banking operations, prepare financial reports, analyze market trends, coordinate with trading desks. Requirements: Bachelor in Finance/Economics, 3.5+ GPA, strong Excel/SQL skills, Series 7/63 preferred. Compensation: $95,000 base + $20-40K bonus, full benefits, 401k match.', source: 'jpmorgan.com/careers', sourceCategory: 'C' },
    { company: 'Goldman Sachs', role: 'Investment Banking Analyst', companyTier: 1, description: 'Location: New York, NY | On-site. Responsibilities: Build financial models, conduct industry research, prepare pitch books, support M&A transactions. Requirements: Top-tier university, Finance/Econ major, 3.7+ GPA, prior IB internship. Compensation: $110,000 base + $50-100K bonus, premium health benefits, relocation assistance.', source: 'goldmansachs.com/careers', sourceCategory: 'C' },
    { company: 'BlackRock', role: 'Investment Analyst', companyTier: 1, description: 'Location: New York, NY | Hybrid. Responsibilities: Portfolio analysis, risk assessment, market research, client reporting. Requirements: Finance/Econ/Math degree, 3.6+ GPA, Bloomberg certification, CFA Level 1 preferred. Compensation: $100,000 base + $30-50K bonus, comprehensive benefits, tuition reimbursement.', source: 'blackrock.com/careers', sourceCategory: 'C' },
    { company: 'PwC', role: 'Assurance Associate', companyTier: 1, description: 'Location: Multiple US cities | Hybrid. Responsibilities: Financial statement audits, internal controls testing, client communication, team collaboration. Requirements: Accounting degree, 150 credit hours, CPA eligibility. Compensation: $70,000-80,000 base + busy season bonus, CPA bonuses, career development.', source: 'pwc.com/careers', sourceCategory: 'C' },
    // Tier 2: Mid-Market
    { company: 'Stripe', role: 'Financial Operations Specialist', companyTier: 2, description: 'Location: Remote-friendly (US). Responsibilities: Manage payment operations, analyze transaction data, optimize financial workflows, partner with engineering teams. Requirements: Bachelor degree, 2+ years finance experience, SQL/Tableau skills, fintech interest. Compensation: $105,000 base + equity package, unlimited PTO, $3K learning stipend.', source: 'stripe.com/jobs', sourceCategory: 'B' },
    { company: 'SoFi', role: 'Finance Analyst', companyTier: 2, description: 'Location: Charlotte, NC | Remote options. Responsibilities: Credit risk analysis, loan portfolio management, financial modeling, regulatory compliance. Requirements: Bachelor in Finance, 1-3 years experience, Python/R skills. Compensation: $85,000-95,000 base + equity, 100% health premium coverage, parental leave.', source: 'sofi.com/careers', sourceCategory: 'B' },
    { company: 'Brex', role: 'Finance Operations Analyst', companyTier: 2, description: 'Location: Remote-friendly (US) | Hybrid. Responsibilities: Manage corporate card reconciliations, support month-end close, build financial dashboards, optimize spend workflows. Requirements: Bachelor in Finance/Accounting, SQL comfort, startup mindset. Compensation: $90,000-105,000 base + meaningful equity, full benefits, unlimited PTO.', source: 'brex.com/careers', sourceCategory: 'B' },
    // Tier 3: Startup
    { company: 'Ramp', role: 'Finance & Strategy Analyst', companyTier: 3, description: 'Location: New York, NY | Hybrid. Series C fintech redefining corporate finance. Responsibilities: Strategic planning, financial forecasting, business intelligence. Requirements: Top university, analytical mindset, Excel/SQL expertise. Compensation: $110,000 base + significant equity, unlimited PTO, home office budget.', source: 'ramp.com/careers', sourceCategory: 'B' },
    { company: 'Jeeves', role: 'Finance Analyst', companyTier: 3, description: 'Location: Remote (US) | Series B global expense platform. Responsibilities: FP&A support, revenue analysis, investor reporting, cross-functional projects. Requirements: Finance/Economics degree, strong modeling skills. Compensation: $85,000-100,000 + equity. Team of 200 — your work is seen immediately.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Finley Technologies', role: 'Credit Operations Analyst', companyTier: 3, description: 'Location: Remote-first | Series A debt capital management startup backed by Y Combinator. Responsibilities: Manage borrower data, build credit reporting workflows, partner with engineering. Requirements: Finance/CS background, analytical mindset.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
  'finance & insurance': [
    { company: 'JPMorgan', role: 'Financial Operations Specialist', companyTier: 1, description: 'Analyst roles in investment banking and corporate finance divisions.', source: 'jpmorgan.com/careers', sourceCategory: 'C' },
    { company: 'Goldman Sachs', role: 'Investment Banking Analyst', companyTier: 1, description: 'Summer and new associate programs across all divisions.', source: 'goldmansachs.com/careers', sourceCategory: 'C' },
    { company: 'Stripe', role: 'Financial Operations Specialist', companyTier: 2, description: 'Finance and strategy analyst roles at a leading fintech.', source: 'stripe.com/jobs', sourceCategory: 'B' },
    { company: 'Brex', role: 'Finance Operations Analyst', companyTier: 2, description: 'Fast-scaling corporate card startup with strong internal finance ownership.', source: 'brex.com/careers', sourceCategory: 'B' },
    { company: 'Ramp', role: 'Finance & Strategy Analyst', companyTier: 3, description: 'Fast-growing Series C fintech with high-ownership finance roles.', source: 'ramp.com/careers', sourceCategory: 'B' },
    { company: 'Finley Technologies', role: 'Credit Operations Analyst', companyTier: 3, description: 'YC-backed Series A startup — team of 30, direct founder access.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
  'human resources': [
    // Tier 1
    { company: 'Workday', role: 'HR Systems Analyst', companyTier: 1, description: 'Location: Remote-friendly (US) | Hybrid. Responsibilities: Configure Workday HCM, troubleshoot system issues, generate reports, train users on HR technology. Requirements: Bachelor degree, HRIS experience preferred, analytical skills, HR certification track. Compensation: $75,000-90,000 base + bonus, premium benefits, certification support, career growth.', source: 'workday.com/careers', sourceCategory: 'C' },
    { company: 'LinkedIn', role: 'Talent Operations Specialist', companyTier: 1, description: 'Location: Remote-friendly (US) | Hybrid options. Responsibilities: Optimize recruiting processes, manage ATS workflows, coordinate candidate communications, analyze hiring metrics. Requirements: 2+ years recruiting ops experience, Greenhouse/Workday expertise, data analysis skills. Compensation: $95,000-115,000 base + equity, comprehensive benefits, learning budget.', source: 'linkedin.com/careers', sourceCategory: 'B' },
    // Tier 2
    { company: 'Rippling', role: 'HR Generalist (New Grad)', companyTier: 2, description: 'Location: Remote-friendly (US) | Hybrid options. Responsibilities: Full-cycle recruiting coordination, onboard 50+ new hires monthly, administer benefits, manage employee relations, ensure compliance. Requirements: Bachelor degree, strong communication skills, ability to manage multiple priorities. Compensation: $70,000-85,000 base + meaningful equity, full health benefits.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Gusto', role: 'People Operations Associate', companyTier: 2, description: 'Location: Remote-first (US). Responsibilities: Coordinate 100+ annual hires, manage I-9 verification, administer open enrollment for 1,200+ employees, track HR metrics. Compensation: $68,000-82,000 + equity, 100% employer-paid premiums, unlimited PTO, $3K development stipend.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    // Tier 3
    { company: 'Lattice', role: 'People Operations Coordinator', companyTier: 3, description: 'Location: Remote (US) | Series E HR tech platform. Responsibilities: Manage onboarding, maintain HRIS data, coordinate engagement surveys, support benefits. Requirements: 0-2 years HR experience, exceptional organizational skills. Compensation: $65,000-80,000 base + equity, 100% medical/dental/vision, unlimited PTO, $3K learning stipend.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Leapsome', role: 'HR Success Associate', companyTier: 3, description: 'Location: Remote-friendly (US) | Series A people enablement platform. Responsibilities: Onboard HR clients, drive product adoption, gather feedback for product team. Requirements: Bachelor degree, people-first mindset, SaaS interest. Compensation: $60,000-75,000 + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
  'tech': [
    // Tier 1
    { company: 'Google', role: 'Software Engineer (New Grad)', companyTier: 1, description: 'Engineering and product roles across cloud, AI, and consumer teams.', source: 'careers.google.com', sourceCategory: 'C' },
    { company: 'Microsoft', role: 'Software Development Engineer', companyTier: 1, description: 'New grad programs spanning cloud, AI, and productivity divisions.', source: 'careers.microsoft.com', sourceCategory: 'C' },
    { company: 'Salesforce', role: 'Associate Software Engineer', companyTier: 1, description: 'Rotational and entry-level engineering roles across the platform.', source: 'salesforce.com/careers', sourceCategory: 'C' },
    { company: 'Adobe', role: 'Junior Product Designer', companyTier: 1, description: 'Design roles across Creative Cloud and Digital Experience — highly competitive public listing.', source: 'linkedin.com/jobs', sourceCategory: 'C', displayStyle: 'REALITY_CHECK', daysPosted: 16, applicantCount: 349 },
    { company: 'Meta', role: 'Data Engineer', companyTier: 1, description: 'Data and engineering roles across ads and product infrastructure.', source: 'metacareers.com', sourceCategory: 'B' },
    // Tier 2
    { company: 'Notion', role: 'Product Analyst', companyTier: 2, description: 'Productivity startup scaling globally — product and data roles with real ownership.', source: 'notion.com/careers', sourceCategory: 'B' },
    { company: 'Webflow', role: 'Junior Front-End Engineer', companyTier: 2, description: 'Location: Remote-friendly (US) | No-code platform with strong engineering culture. Responsibilities: Build and maintain UI components, collaborate with design, ship features for 300K+ customers. Requirements: React/JavaScript proficiency, 1-2 years experience. Compensation: $130,000-155,000 base + equity, learning budget.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Figma', role: 'Product Engineer', companyTier: 2, description: 'Location: San Francisco/Remote | Design infrastructure team building collaborative tools at scale. Responsibilities: Core product engineering, performance optimization, cross-team collaboration. Requirements: Strong CS fundamentals, 2+ years experience. Compensation: $160,000-190,000 + equity. Posted on Dribbble to target active builders.', source: 'dribbble.com/jobs', sourceCategory: 'E', nichePlatform: 'dribbble' },
    // Tier 3
    { company: 'Linear', role: 'Product Designer', companyTier: 3, description: 'Location: Remote-first | Team of 50. Premium issue-tracking tool beloved by engineers everywhere. Responsibilities: Design core product workflows, contribute to design system, ship features directly. Requirements: Strong product instincts, Figma mastery. Compensation: Top-of-market + equity.', source: 'keyvalues.com', sourceCategory: 'E', nichePlatform: 'keyvalues' },
    { company: 'Ramp', role: 'Software Engineer', companyTier: 3, description: 'Location: New York, NY | Series D fintech. Real engineering ownership from day one.', source: 'ramp.com/careers', sourceCategory: 'B' },
    { company: 'Retool', role: 'Software Engineer', companyTier: 3, description: 'Location: San Francisco/Remote | Series C internal tools platform. Responsibilities: Build core platform features, work directly with founders, ship products used by 100K+ developers. Requirements: Strong CS fundamentals, 1+ years experience. Compensation: $160,000-200,000 + substantial equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Vercel', role: 'Growth Engineer', companyTier: 3, description: 'Location: Remote-first | Series C developer platform scaling rapidly. Responsibilities: Activate new users, build onboarding flows, instrument analytics, collaborate with product. Requirements: Full-stack comfort, growth mindset. Compensation: $130,000-160,000 + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
  'technology, information & media': [
    { company: 'Google', role: 'Software Engineer (New Grad)', companyTier: 1, description: 'Engineering and product roles across cloud, AI, and consumer teams.', source: 'careers.google.com', sourceCategory: 'C' },
    { company: 'Microsoft', role: 'Software Development Engineer', companyTier: 1, description: 'New grad programs spanning cloud, AI, and productivity divisions.', source: 'careers.microsoft.com', sourceCategory: 'C' },
    { company: 'Meta', role: 'Data Engineer', companyTier: 1, description: 'Data and engineering roles across ads and product infrastructure.', source: 'metacareers.com', sourceCategory: 'B' },
    { company: 'Notion', role: 'Product Analyst', companyTier: 2, description: 'Productivity startup scaling globally — product and data roles.', source: 'notion.com/careers', sourceCategory: 'B' },
    { company: 'Vercel', role: 'Growth Engineer', companyTier: 3, description: 'Remote-first Series C developer platform — warm intro = direct hiring manager access.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
  'consulting': [
    // Tier 1
    { company: 'McKinsey', role: 'Business Analyst', companyTier: 1, description: 'Analyst roles for top undergrads entering management consulting.', source: 'mckinsey.com/careers', sourceCategory: 'C' },
    { company: 'BCG', role: 'Associate Consultant', companyTier: 1, description: 'Entry-level strategy roles for new graduates.', source: 'bcg.com/careers', sourceCategory: 'C' },
    { company: 'Deloitte', role: 'Strategy & Analytics Consultant', companyTier: 1, description: 'Consulting and business analysts in advisory practices nationwide.', source: 'deloitte.com/careers', sourceCategory: 'C' },
    // Tier 2
    { company: 'West Monroe', role: 'Business Analyst', companyTier: 2, description: 'Location: Multiple US offices | Digital consulting firm with a startup culture. Responsibilities: Client analysis, process improvement, technology advisory. Compensation: $75,000-85,000 base + bonus + profit sharing.', source: 'westmonroe.com/careers', sourceCategory: 'B' },
    { company: 'Slalom', role: 'Business Analyst', companyTier: 2, description: 'Location: Multiple US cities | Modern consulting firm with local market model. Responsibilities: Strategy and tech consulting, client workshops, delivery. Requirements: Bachelor degree, analytical skills, communication. Compensation: $70,000-85,000 base + bonus, excellent benefits.', source: 'slalom.com/careers', sourceCategory: 'B' },
    // Tier 3
    { company: 'Boutique Strategy Firm', role: 'Junior Consultant', companyTier: 3, description: 'Location: Remote-friendly | Founder-led strategy consultancy hiring via r/consulting megathread — direct email contact, no ATS. Team of 15 analysts.', source: 'reddit.com/r/consulting', sourceCategory: 'D' },
    { company: 'Clarkston Consulting', role: 'Associate Consultant', companyTier: 3, description: 'Location: Multiple US offices | 300-person boutique specializing in consumer goods and life sciences. Responsibilities: Client deliverables, data analysis, process design. Compensation: $65,000-75,000 base + bonus.', source: 'clarktonconsulting.com/careers', sourceCategory: 'B' },
  ],
  'professional services': [
    { company: 'Deloitte', role: 'Consulting Analyst', companyTier: 1, description: 'Advisory associates in strategy, digital, and operations.', source: 'deloitte.com/careers', sourceCategory: 'C' },
    { company: 'EY', role: 'Associate', companyTier: 1, description: 'Entry-level roles across audit, tax, and advisory.', source: 'ey.com/careers', sourceCategory: 'C' },
    { company: 'KPMG', role: 'Advisory Associate', companyTier: 1, description: 'Associate-level hiring across US offices.', source: 'kpmg.com/careers', sourceCategory: 'C' },
    { company: 'McKinsey', role: 'Business Analyst', companyTier: 1, description: 'Analyst roles for top undergrads entering management consulting.', source: 'mckinsey.com/careers', sourceCategory: 'C' },
    { company: 'West Monroe', role: 'Business Analyst', companyTier: 2, description: 'Digital consulting firm with strong alumni placement and entry-level training.', source: 'westmonroe.com/careers', sourceCategory: 'B' },
    { company: 'Clarkston Consulting', role: 'Associate Consultant', companyTier: 3, description: 'Boutique 300-person firm — warm intro carries far more weight than at MBB.', source: 'clarktonconsulting.com/careers', sourceCategory: 'B' },
  ],
  'healthcare': [
    // Tier 1
    { company: 'HCA Healthcare', role: 'Clinical Coordinator', companyTier: 1, description: 'Hospital network consistently hiring nurses across hundreds of facilities.', source: 'hcahealthcare.com/careers', sourceCategory: 'C' },
    { company: 'AdventHealth', role: 'Registered Nurse', companyTier: 1, description: 'Faith-based hospital network with strong nursing culture.', source: 'adventhealth.com/careers', sourceCategory: 'C' },
    // Tier 2
    { company: 'Carbon Health', role: 'Care Coordinator', companyTier: 2, description: 'Location: Multiple US cities | Tech-enabled primary care startup with 100+ clinics. Responsibilities: Patient care coordination, scheduling, care plan follow-up. Compensation: $55,000-65,000 base + equity, full health benefits.', source: 'carbonhealth.com/careers', sourceCategory: 'B' },
    { company: 'Hims & Hers', role: 'Clinical Operations Analyst', companyTier: 2, description: 'Location: Remote-friendly (US) | Telehealth platform scaling rapidly. Responsibilities: Analyze clinical workflows, coordinate with provider teams, report on outcomes. Compensation: $70,000-85,000 + equity.', source: 'himshers.com/careers', sourceCategory: 'B' },
    // Tier 3
    { company: 'Nomi Health', role: 'Operations Associate', companyTier: 3, description: 'Location: Remote-first | Series B direct healthcare company. Team of 250 reimagining employer health benefits.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Grow Therapy', role: 'Clinical Network Associate', companyTier: 3, description: 'Location: Remote-first | Series B mental health startup growing 3x YoY. Responsibilities: Onboard therapist partners, manage clinical compliance, support patient matching. Compensation: $60,000-70,000 + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
  'healthcare & pharmaceuticals': [
    { company: 'HCA Healthcare', role: 'Clinical Coordinator', companyTier: 1, description: 'Hospital network consistently hiring nurses across hundreds of facilities.', source: 'hcahealthcare.com/careers', sourceCategory: 'C' },
    { company: 'CVS Health', role: 'Pharmacy Operations Analyst', companyTier: 1, description: 'Hiring clinical and operations staff for pharmacy and MinuteClinic.', source: 'cvshealth.com/careers', sourceCategory: 'C' },
    { company: 'Hims & Hers', role: 'Clinical Operations Analyst', companyTier: 2, description: 'Telehealth platform with 800+ employees scaling rapidly.', source: 'himshers.com/careers', sourceCategory: 'B' },
    { company: 'Grow Therapy', role: 'Clinical Network Associate', companyTier: 3, description: 'Series B mental health startup — warm intro = near-guaranteed first interview.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
  'marketing': [
    // Tier 1
    { company: 'Procter & Gamble', role: 'Brand Management Associate', companyTier: 1, description: 'Brand management and operations rotational roles for recent grads.', source: 'pg.com/careers', sourceCategory: 'C' },
    { company: 'Ogilvy', role: 'Account Coordinator', companyTier: 1, description: 'Creative and account management roles for recent grads in advertising.', source: 'ogilvy.com/careers', sourceCategory: 'B' },
    // Tier 2
    { company: 'Edelman', role: 'PR Account Coordinator', companyTier: 2, description: "World's largest PR firm — hiring communications and PR associates.", source: 'edelman.com/careers', sourceCategory: 'C' },
    { company: 'Klaviyo', role: 'Marketing Operations Analyst', companyTier: 2, description: 'Location: Boston, MA / Remote | E-commerce marketing platform post-IPO. Responsibilities: Campaign analysis, marketing automation, cross-channel reporting. Compensation: $75,000-90,000 + equity.', source: 'klaviyo.com/careers', sourceCategory: 'B' },
    // Tier 3
    { company: 'Attentive', role: 'Growth Marketing Associate', companyTier: 3, description: 'Location: Remote-friendly | Series E SMS marketing platform. Responsibilities: Campaign management, performance analysis, A/B testing. Compensation: $65,000-80,000 + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Triple Whale', role: 'Marketing Analyst', companyTier: 3, description: 'Location: Remote-first | Series B e-commerce analytics startup. Team of 120.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
  'creative': [
    // Tier 1
    { company: 'Ogilvy', role: 'Junior Art Director', companyTier: 1, description: 'Global creative agency — junior creative and art direction roles for new talent.', source: 'ogilvy.com/careers', sourceCategory: 'C' },
    // Tier 2
    { company: 'Figma', role: 'Brand Designer', companyTier: 2, description: 'Design tool powerhouse — role posted on Dribbble Jobs to reach designers actively sharing their work.', source: 'dribbble.com/jobs', sourceCategory: 'E', nichePlatform: 'dribbble' },
    { company: 'Superside', role: 'Junior Creative Strategist', companyTier: 2, description: 'Remote-first creative agency — posted on Working Not Working, not on LinkedIn. Applicant pool is a fraction of mainstream job boards.', source: 'workingnotworking.com', sourceCategory: 'E', nichePlatform: 'workingnotworking' },
    // Tier 3
    { company: 'Mailchimp', role: 'UX Writer', companyTier: 2, description: 'Strong brand and content culture — curated on Key Values for candidates who care about autonomy and craft.', source: 'keyvalues.com', sourceCategory: 'E', nichePlatform: 'keyvalues' },
    { company: 'Contra', role: 'Brand Designer', companyTier: 3, description: 'Location: Remote-first | Series B freelance platform for independents. Team of 60. Responsibilities: Visual identity, campaign assets, design system contributions.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Jobbio Creative Agency', role: 'Content Strategist', companyTier: 3, description: 'Boutique agency matched on Jobbio for culture alignment — much less noise than a LinkedIn Easy Apply.', source: 'jobbio.com', sourceCategory: 'E', nichePlatform: 'jobbio' },
  ],
  'advertising & pr': [
    // Tier 1
    { company: 'Edelman', role: 'PR Account Coordinator', companyTier: 1, description: "World's largest PR firm — hiring communications and PR associates.", source: 'edelman.com/careers', sourceCategory: 'C' },
    { company: 'WPP', role: 'Strategy Analyst', companyTier: 1, description: 'Global holding company with entry-level roles across agency brands.', source: 'wpp.com/careers', sourceCategory: 'C' },
    // Tier 2
    { company: 'Weber Shandwick', role: 'PR Associate', companyTier: 2, description: 'Hiring entry-level PR and communications associates.', source: 'webershandwick.com/careers', sourceCategory: 'B' },
    { company: 'Klaviyo', role: 'Content Marketing Associate', companyTier: 2, description: 'Location: Boston, MA / Remote | Post-IPO e-commerce marketing platform. Responsibilities: Blog content, case studies, social copy, SEO. Compensation: $65,000-80,000 + equity.', source: 'klaviyo.com/careers', sourceCategory: 'B' },
    // Tier 3
    { company: 'Independent Creative Agency', role: 'Junior Copywriter', companyTier: 3, description: 'Boutique creative agency posting directly in r/design weekly thread — DM founder with portfolio link. 20-person shop.', source: 'reddit.com/r/design', sourceCategory: 'D' },
    { company: 'Global Creative Studio', role: 'Art Director (Junior)', companyTier: 3, description: 'Curated by Working Not Working — only top-tier creative studios recruit on this platform. 90% fewer applicants than a job posted on LinkedIn.', source: 'workingnotworking.com', sourceCategory: 'E', nichePlatform: 'workingnotworking' },
  ],
  'real_estate': [
    { company: 'CBRE', role: 'Real Estate Analyst', companyTier: 1, description: "World's largest commercial real estate services firm hiring analysts.", source: 'cbre.com/careers', sourceCategory: 'C' },
    { company: 'JLL', role: 'Research Associate', companyTier: 1, description: 'Global RE firm with strong graduate development programs.', source: 'jll.com/careers', sourceCategory: 'C' },
    { company: 'Opendoor', role: 'Operations Analyst', companyTier: 2, description: 'Location: Remote-friendly (US) | Tech-enabled homebuying platform. Responsibilities: Market analysis, transaction ops, pricing models. Compensation: $80,000-95,000 + equity.', source: 'opendoor.com/careers', sourceCategory: 'B' },
    { company: 'Pacaso', role: 'Market Associate', companyTier: 3, description: 'Location: Remote-first | Series C fractional vacation home startup. Team of 250.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
  'construction & agriculture': [
    { company: 'Turner Construction', role: 'Project Engineer', companyTier: 1, description: 'One of the largest construction firms — hiring project managers and engineers nationwide.', source: 'turnerconstruction.com/careers', sourceCategory: 'C' },
    { company: 'CBRE', role: 'Project Manager', companyTier: 1, description: "World's largest commercial real estate services firm — project management division.", source: 'cbre.com/careers', sourceCategory: 'C' },
    { company: 'Procore', role: 'Implementation Analyst', companyTier: 2, description: 'Construction management software — sales, support, and analyst roles.', source: 'procore.com/careers', sourceCategory: 'B' },
    { company: 'Deepfield Robotics', role: 'Operations Associate', companyTier: 3, description: 'Location: Remote-friendly | Series A precision agriculture startup. Team of 80. Responsibilities: Manage field partner relationships, track deployment data, support product rollout.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
  'education': [
    { company: 'Teach For America', role: 'Corps Member', companyTier: 1, description: 'Two-year teaching fellowship placing grads in under-resourced schools.', source: 'teachforamerica.org/join-tfa', sourceCategory: 'C' },
    { company: 'Duolingo', role: 'Curriculum Analyst', companyTier: 2, description: 'Language learning platform hiring for content and product roles.', source: 'duolingo.com/careers', sourceCategory: 'B' },
    { company: 'Synthesis', role: 'Learning Experience Associate', companyTier: 3, description: 'Location: Remote-first | Series A edtech startup spun out of SpaceX. Team of 100. Responsibilities: Design learning experiences, analyze student outcomes, work with instructors.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Primer', role: 'Education Operations Associate', companyTier: 3, description: 'Location: Remote-first | Series B AI tutoring platform. Team of 60. Responsibilities: Support school partnerships, track learning outcomes, assist curriculum development. Compensation: $60,000-75,000 + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
  'education & training': [
    { company: 'Teach For America', role: 'Corps Member', companyTier: 1, description: 'Two-year teaching fellowship in under-resourced schools.', source: 'teachforamerica.org/join-tfa', sourceCategory: 'C' },
    { company: 'Duolingo', role: 'Curriculum Analyst', companyTier: 2, description: 'Language learning platform hiring for content and product roles.', source: 'duolingo.com/careers', sourceCategory: 'B' },
    { company: 'Synthesis', role: 'Learning Experience Associate', companyTier: 3, description: 'Series A edtech from SpaceX — team of 100, direct curriculum team access via alumni intro.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
  'nonprofit': [
    { company: 'Teach For America', role: 'Program Associate', companyTier: 1, description: 'Educational non-profit with operations and program roles.', source: 'teachforamerica.org/join-tfa', sourceCategory: 'C' },
    { company: 'Code for America', role: 'Civic Tech Fellow', companyTier: 2, description: 'Non-profit improving government services through technology.', source: 'codeforamerica.org/careers', sourceCategory: 'B' },
    { company: 'GiveDirectly', role: 'Operations Associate', companyTier: 3, description: 'Location: Remote-friendly | High-impact international nonprofit. Team of 200. Responsibilities: Program support, data analysis, partner coordination.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
  'government': [
    { company: 'Booz Allen Hamilton', role: 'Government Analyst', companyTier: 1, description: 'Government consulting firm with strong entry-level programs.', source: 'boozallen.com/careers', sourceCategory: 'C' },
    { company: 'Deloitte Government', role: 'Federal Consultant', companyTier: 1, description: 'Federal consulting division hiring for public sector projects.', source: 'deloitte.com/careers', sourceCategory: 'C' },
    { company: 'Palantir', role: 'Forward Deployed Software Engineer', companyTier: 2, description: 'Location: Multiple US cities | Data analytics platform with major government contracts. Responsibilities: Deploy and customize software for government clients, solve mission-critical problems. Strong alumni pipeline.', source: 'palantir.com/careers', sourceCategory: 'B' },
  ],
  'government & public sector': [
    { company: 'Booz Allen Hamilton', role: 'Government Analyst', companyTier: 1, description: 'Government consulting firm with strong entry-level programs.', source: 'boozallen.com/careers', sourceCategory: 'C' },
    { company: 'Deloitte Government', role: 'Federal Consultant', companyTier: 1, description: 'Federal consulting division hiring for public sector projects.', source: 'deloitte.com/careers', sourceCategory: 'C' },
    { company: 'Palantir', role: 'Forward Deployed Software Engineer', companyTier: 2, description: 'Data analytics platform with major government contracts. Alumni network is well-represented.', source: 'palantir.com/careers', sourceCategory: 'B' },
  ],
  'sports & entertainment': [
    // Tier 1
    { company: 'Live Nation', role: 'Marketing Coordinator', companyTier: 1, description: "World's largest live entertainment company — events and operations roles.", source: 'livenation.com/careers', sourceCategory: 'C' },
    { company: 'Nike', role: 'Brand Marketing Associate', companyTier: 1, description: 'Brand marketing and product roles for sports or business backgrounds.', source: 'jobs.nike.com', sourceCategory: 'C' },
    // Tier 2
    { company: 'ESPN', role: 'Content Associate', companyTier: 2, description: 'Hiring for content, production, and marketing roles in sports media.', source: 'espncareers.com', sourceCategory: 'B' },
    { company: 'Overtime', role: 'Social Media Coordinator', companyTier: 2, description: 'Location: New York, NY | Digital sports media brand serving Gen Z. Responsibilities: Create social content, manage channels, analyze performance. Compensation: $55,000-70,000 + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    // Tier 3
    { company: 'Buzzer', role: 'Growth Associate', companyTier: 3, description: 'Location: Remote-friendly | Series B sports streaming platform. Team of 70. Responsibilities: User acquisition, partnership activation, marketing operations.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Athlete Studio', role: 'Brand Operations Associate', companyTier: 3, description: 'Location: Los Angeles / Remote | Seed-stage athlete media company. Team of 25. Responsibilities: Manage athlete partnerships, coordinate content production, track brand deals.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
  'media and entertainment': [
    // Tier 1
    { company: 'Netflix', role: 'Junior Content Designer', companyTier: 1, description: 'Location: Remote-friendly (US) | Hybrid options. Responsibilities: Design product features for 250M+ subscribers, create user journey maps, collaborate with engineering. Requirements: Bachelor in Design/UX, 1-2 years product design experience, Figma expertise. Compensation: $95,000-115,000 base + equity, premium health/dental/vision, unlimited PTO.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Disney', role: 'Content Coordinator', companyTier: 1, description: 'Location: Multiple US offices | Hybrid options. Responsibilities: Manage editorial calendars for Disney+/Hulu/ESPN+, coordinate content rollout schedules, track deliverables. Requirements: Bachelor in Communications/Media, excellent writing skills, project management experience. Compensation: $70,000-80,000 base + bonus, Disney+ bundle, comprehensive benefits.', source: 'disney.com/careers', sourceCategory: 'C' },
    { company: 'Warner Bros Discovery', role: 'Social Media Coordinator', companyTier: 1, description: 'Location: New York, NY | Hybrid. Responsibilities: Manage social channels for HBO Max/CNN/DC, create engaging content, monitor community engagement. Requirements: Bachelor in Marketing/Communications, 1+ years social media experience. Compensation: $60,000-70,000 base + bonus, Max subscription, full benefits.', source: 'wbd.com/careers', sourceCategory: 'C' },
    // Tier 2
    { company: 'Spotify', role: 'UX Writer', companyTier: 2, description: 'Location: New York, NY | Remote-friendly. Responsibilities: Craft voice/tone for world\'s largest audio platform, write app copy and onboarding flows, partner with product designers. Requirements: 2+ years UX writing, portfolio of shipped digital products. Compensation: $100,000-120,000 base + equity, Spotify Premium Family, wellness stipend.', source: 'dribbble.com/jobs', sourceCategory: 'E', nichePlatform: 'dribbble' },
    { company: 'Hulu', role: 'Brand Designer', companyTier: 2, description: 'Location: Remote-friendly (US) | Hybrid. Responsibilities: Create visual assets for Hulu brand campaigns, design marketing materials, maintain brand consistency. Compensation: $85,000-100,000 base + bonus, Hulu subscription, professional development budget.', source: 'dribbble.com/jobs', sourceCategory: 'E', nichePlatform: 'dribbble' },
    { company: 'Vox Media', role: 'Editorial Associate', companyTier: 2, description: 'Location: Remote-friendly | Publisher behind The Verge, Vox, NY Mag. Responsibilities: Research, fact-checking, editorial coordination, audience analysis. Compensation: $55,000-68,000 base + benefits. Strong alumni placement in digital media editorial.', source: 'voxmedia.com/careers', sourceCategory: 'B' },
    // Tier 3
    { company: 'BuzzFeed', role: 'Junior Content Strategist', companyTier: 3, description: 'Location: New York, NY | Hybrid. Responsibilities: Develop branded content campaigns, work with editorial on social-first strategies, analyze performance metrics. Compensation: $65,000-75,000 base + performance bonus.', source: 'workingnotworking.com', sourceCategory: 'E', nichePlatform: 'workingnotworking' },
    { company: 'Puck News', role: 'Operations Associate', companyTier: 3, description: 'Location: Remote-first | Series A media startup disrupting political and entertainment journalism. Team of 40. Responsibilities: Operations support, subscriber analytics, editorial coordination.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
  'media & entertainment': [
    { company: 'Netflix', role: 'Junior Content Designer', companyTier: 1, description: 'Netflix is hiring junior content designers for their product design team.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Disney', role: 'Content Coordinator', companyTier: 1, description: 'Disney Streaming is hiring a Content Coordinator to manage editorial calendars across Disney+, Hulu, and ESPN+.', source: 'disney.com/careers', sourceCategory: 'C' },
    { company: 'Warner Bros Discovery', role: 'Social Media Coordinator', companyTier: 1, description: 'Entry-level social media coordinator role across WBD\'s flagship properties.', source: 'wbd.com/careers', sourceCategory: 'C' },
    { company: 'Spotify', role: 'UX Writer', companyTier: 2, description: 'Spotify is looking for a UX writer to craft the voice of the world\'s largest audio platform.', source: 'dribbble.com/jobs', sourceCategory: 'E', nichePlatform: 'dribbble' },
    { company: 'Hulu', role: 'Brand Designer', companyTier: 2, description: 'Hulu is sourcing a brand designer for their in-house creative team.', source: 'dribbble.com/jobs', sourceCategory: 'E', nichePlatform: 'dribbble' },
    { company: 'Puck News', role: 'Operations Associate', companyTier: 3, description: 'Series A media startup — team of 40, founding team access via alumni intro.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
  'content & ux design': [
    { company: 'Figma', role: 'Brand Designer', companyTier: 2, description: 'Design tool powerhouse — role posted on Dribbble Jobs to reach designers actively sharing their work.', source: 'dribbble.com/jobs', sourceCategory: 'E', nichePlatform: 'dribbble' },
    { company: 'Mailchimp', role: 'UX Writer', companyTier: 2, description: 'Strong brand and content culture — curated on Key Values for candidates who care about autonomy and craft.', source: 'keyvalues.com', sourceCategory: 'E', nichePlatform: 'keyvalues' },
    { company: 'Superside', role: 'Junior Creative Strategist', companyTier: 2, description: 'Remote-first creative agency — posted on Working Not Working. Applicant pool is a fraction of mainstream job boards.', source: 'workingnotworking.com', sourceCategory: 'E', nichePlatform: 'workingnotworking' },
    { company: 'Webflow', role: 'Junior Content Strategist', companyTier: 2, description: 'No-code design platform with a strong creative culture — posted exclusively on Wellfound.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Linear', role: 'Product Designer', companyTier: 3, description: 'Premium software tool — team of 50, Key Values listing targeting culture-aligned designers only.', source: 'keyvalues.com', sourceCategory: 'E', nichePlatform: 'keyvalues' },
    { company: 'Contra', role: 'Brand Designer', companyTier: 3, description: 'Series B freelance platform — team of 60, alumni intro = direct creative lead conversation.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
  'logistics': [
    { company: 'C.H. Robinson', role: 'Supply Chain Analyst', companyTier: 1, description: 'Supply chain and freight brokerage roles with strong training.', source: 'chrobinson.com/careers', sourceCategory: 'C' },
    { company: 'Arrive Logistics', role: 'Account Manager', companyTier: 2, description: 'Growing freight brokerage — strong entry-level training program.', source: 'arrivelogistics.com/careers', sourceCategory: 'B' },
    { company: 'Samsara', role: 'Sales Development Rep', companyTier: 2, description: 'Fleet management platform — sales and operations roles.', source: 'samsara.com/careers', sourceCategory: 'B' },
    { company: 'Flexport', role: 'Operations Analyst', companyTier: 3, description: 'Location: Remote-friendly | Series E freight platform reinventing global trade. Team of 2,000.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
  'transportation & logistics': [
    { company: 'C.H. Robinson', role: 'Supply Chain Analyst', companyTier: 1, description: 'Supply chain and freight brokerage roles with strong training.', source: 'chrobinson.com/careers', sourceCategory: 'C' },
    { company: 'Arrive Logistics', role: 'Account Manager', companyTier: 2, description: 'Growing freight brokerage — strong entry-level training program.', source: 'arrivelogistics.com/careers', sourceCategory: 'B' },
    { company: 'Samsara', role: 'Sales Development Rep', companyTier: 2, description: 'Fleet management platform startup — sales and operations roles.', source: 'samsara.com/careers', sourceCategory: 'B' },
    { company: 'Flexport', role: 'Operations Analyst', companyTier: 3, description: 'Location: Remote-friendly | Series E freight startup reinventing global trade. Team of 2,000.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
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
    
    // Location filter: only apply if relocation is NOT ok AND user has a specific city (not just a state)
    // Skip location filtering if user only has a state/country preference — too aggressive
    if (!relocationOk && userCity) {
      const locationKeywords = [userCity].filter(Boolean);
      const locationFiltered = jobPool.filter(j => {
        const jobDesc = (j.description || '').toLowerCase();
        const isRemote = jobDesc.includes('remote') || jobDesc.includes('work from home') || jobDesc.includes('remote-friendly');
        const matchesLocation = locationKeywords.some(loc => jobDesc.includes(loc));
        return isRemote || matchesLocation;
      });
      // Only apply if it keeps at least 4 results
      if (locationFiltered.length >= 4) jobPool = locationFiltered;
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

    // Role filter: only apply if it keeps at least 5 results to prevent sparse wipeout
    if (allRoleKeywords.length > 0) {
      const roleFiltered = jobPool.filter(j => {
        const roleLower = j.role.toLowerCase();
        const descLower = j.description.toLowerCase();
        return allRoleKeywords.some(kw => roleLower.includes(kw) || descLower.includes(kw));
      });
      if (roleFiltered.length >= 5) jobPool = roleFiltered;
    }

    // Deduplicate by company+role (allow same company with different roles)
    const seen = new Set();
    jobPool = jobPool.filter(j => {
      const key = `${j.company}||${j.role}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // ─── Balanced Feed Mix: Enforce ≥30% mid-market/startup (Tier 2/3) ─────
    // Prevents the feed from being all enterprise brands
    const tier1 = jobPool.filter(j => (j.companyTier || 1) === 1);
    const tier23 = jobPool.filter(j => (j.companyTier || 1) >= 2);
    const totalPool = jobPool.length;
    const tier23Ratio = totalPool > 0 ? tier23.length / totalPool : 0;
    if (tier23Ratio < 0.3 && tier23.length < 3) {
      // Pull in cross-industry Tier 2/3 starters to pad the feed
      const crossTier23 = [
        { company: 'Retool', role: 'Implementation Engineer', companyTier: 3, description: 'Location: San Francisco/Remote | Series C internal tools platform. Team of 200. Responsibilities: Implement Retool for enterprise clients, build custom dashboards, ensure successful deployments. Requirements: Technical background, client-facing skills. Compensation: $110,000-140,000 + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
        { company: 'Notion', role: 'Customer Success Manager', companyTier: 2, description: 'Location: Remote-friendly | Productivity platform with 30M+ users. Responsibilities: Onboard enterprise clients, drive adoption, gather product feedback. Compensation: $90,000-110,000 + equity.', source: 'notion.com/careers', sourceCategory: 'B' },
        { company: 'Vercel', role: 'Solutions Engineer', companyTier: 3, description: 'Location: Remote-first | Series C developer platform scaling rapidly.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
      ].filter(j => !SENIOR_FILTER.test(j.role));
      for (const j of crossTier23) {
        const key = `${j.company}||${j.role}`;
        if (!seen.has(key)) { seen.add(key); jobPool.push(j); }
        if (jobPool.filter(x => (x.companyTier || 1) >= 2).length / jobPool.length >= 0.3) break;
      }
    }

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

    // ─── Step 2: Load all network members (alumni + parents) + DiscoveredAlumni ──
    const INVALID = ['self employed', 'selfemployed', 'self-employed', 'retired', 'none', 'n/a', 'unemployed', 'stay at home', 'homemaker', 'between jobs'];
    const [allUsers, discoveredAlumni] = await Promise.all([
      base44.asServiceRole.entities.User.list('-created_date', 5000),
      base44.asServiceRole.entities.DiscoveredAlumni.filter({ school_code: (userSchoolCode || 'uf').toUpperCase() }, '-created_date', 1000).catch(() => []),
    ]);
    
    // Helper: resolve a field from user object, checking both top-level and nested data.*
    const getField = (u, ...keys) => {
      for (const k of keys) {
        const v = u[k] || u.data?.[k];
        if (v) return v;
      }
      return '';
    };

    // All school alumni/parents (with a company listed)
    const schoolAlumni = allUsers.filter(u => {
      const persona = u.persona || u.data?.persona || '';
      const roles = u.roles || u.data?.roles || [];
      const isAlumni = persona === 'alumni' || (Array.isArray(roles) && roles.includes('alumni'));
      const isParent = persona === 'parent' || (Array.isArray(roles) && roles.includes('parent'));
      if (!isAlumni && !isParent) return false;
      const rawCompany = getField(u, 'current_company', 'company', 'employer').trim();
      if (!rawCompany) return false;
      const uCode = getField(u, 'school_code').toLowerCase();
      const uName = getField(u, 'school_name', 'school', 'university').toLowerCase();
      const matchesSchool = (userSchoolCode && uCode === userSchoolCode) || 
                           (userSchool && (uName === userSchool || uName.includes(userSchool) || userSchool.includes(uName)));
      return matchesSchool;
    });
    
    console.log(`[getPersonalizedNetworkCarousel] Found ${schoolAlumni.length} total alumni/parents from ${userSchoolCode || userSchool}`);

    // Normalizer for company name comparison (strip suffixes + special chars)
    const normalizeForMatch = (name) => name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\b(inc|ltd|llc|corp|co|company|the)\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Build a map: normalizedCompanyKey → count of school alumni/parents there
    // Scan ALL job pool companies against ALL school members (no prior filter on companyNames)
    const alumniByCompany = {};
    for (const job of jobPool) {
      const normalizedKey = normalizeCompanyName(job.company);
      if (alumniByCompany[normalizedKey] !== undefined) continue; // already counted
      const jobNorm = normalizeForMatch(job.company);
      const matches = schoolAlumni.filter(u => {
        const rawCompany = getField(u, 'current_company', 'company', 'employer').trim();
        if (!rawCompany) return false;
        const userNorm = normalizeForMatch(rawCompany);
        // Partial match in both directions, minimum 4 chars to avoid false positives
        return (jobNorm.length >= 4 && userNorm.length >= 4) &&
          (userNorm.includes(jobNorm) || jobNorm.includes(userNorm));
      });
      alumniByCompany[normalizedKey] = matches.length;
      if (matches.length > 0) {
        console.log(`[getPersonalizedNetworkCarousel] ✅ ${job.company}: ${matches.length} school contacts`);
        matches.forEach(u => console.log(`[getPersonalizedNetworkCarousel]   - ${u.full_name} at "${getField(u, 'current_company', 'company', 'employer')}"`));
      }
    }

    // Also count DiscoveredAlumni (sourced by scoutCompanyBackdoor) per job company
    for (const job of jobPool) {
      const normalizedKey = normalizeCompanyName(job.company);
      const jobNorm = normalizeForMatch(job.company);
      const discoveredMatches = (discoveredAlumni || []).filter(a => {
        const aNorm = normalizeForMatch(a.company || '');
        return aNorm.length >= 4 && jobNorm.length >= 4 &&
          (aNorm.includes(jobNorm) || jobNorm.includes(aNorm));
      });
      if (discoveredMatches.length > 0) {
        alumniByCompany[normalizedKey] = (alumniByCompany[normalizedKey] || 0) + discoveredMatches.length;
        console.log(`[getPersonalizedNetworkCarousel] 🛰️ ${job.company}: +${discoveredMatches.length} DiscoveredAlumni (total: ${alumniByCompany[normalizedKey]})`);
      }
    }
    
    const networkMembers = (allUsers || []).filter(u => {
      const persona = u.persona || u.data?.persona || '';
      const roles = u.roles || u.data?.roles || [];
      const isParent = persona === 'parent' || (Array.isArray(roles) && roles.includes('parent'));
      const isAlumni = persona === 'alumni' || (Array.isArray(roles) && roles.includes('alumni'));
      if (!isParent && !isAlumni) return false;
      if (!u.full_name) return false;
      // Use same school matching logic as schoolAlumni (userSchoolCode / userSchool)
      if (userSchoolCode || userSchool) {
        const uCode = getField(u, 'school_code').toLowerCase();
        const uName = getField(u, 'school_name', 'school', 'university').toLowerCase();
        if (!((userSchoolCode && uCode === userSchoolCode) || (userSchool && (uName === userSchool || uName.includes(userSchool) || userSchool.includes(uName))))) return false;
      }
      const rawCompany = getField(u, 'current_company', 'company', 'employer').trim();
      if (!rawCompany) return false;
      const key = normalizeCompanyName(rawCompany);
      if (!key || INVALID.includes(key)) return false;
      return true;
    });
    console.log(`[getPersonalizedNetworkCarousel] networkMembers for company map: ${networkMembers.length}`);

    const companyNetworkMap = {};
    for (const u of networkMembers) {
      const rawCompany = getField(u, 'current_company', 'company', 'employer').trim();
      const key = normalizeCompanyName(rawCompany);
      if (!companyNetworkMap[key]) companyNetworkMap[key] = { alumni: [], parents: [] };
      const persona = u.persona || u.data?.persona || '';
      const roles = u.roles || u.data?.roles || [];
      const isParent = persona === 'parent' || (Array.isArray(roles) && roles.includes('parent'));
      const member = {
        id: u.id,
        full_name: u.full_name,
        title: getField(u, 'job_title', 'current_position', 'position', 'career_background'),
        industry: getField(u, 'industry'),
        graduation_year: getField(u, 'graduation_year', 'class_year'),
        linkedin_url: getField(u, 'linkedin_url') || null,
        student_name: isParent ? (getField(u, 'student_name') || null) : null,
        persona: isParent ? 'parent' : 'alumni',
      };
      if (isParent) companyNetworkMap[key].parents.push(member);
      else companyNetworkMap[key].alumni.push(member);
    }

    // ─── Step 3: Find industry-matched parents (any company) ────────────────
    const industryKeywords = getMemberKeywords(targetIndustries);
    const industryParents = networkMembers.filter(u => {
      const persona = u.persona || u.data?.persona || '';
      const roles = u.roles || u.data?.roles || [];
      const isParent = persona === 'parent' || (Array.isArray(roles) && roles.includes('parent'));
      if (!isParent) return false;
      return memberInIndustry({
        title: getField(u, 'job_title', 'current_position', 'position', 'career_background'),
        industry: getField(u, 'industry'),
        bio: getField(u, 'bio'),
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
      const realAlumniCount = alumniByCompany[normalizedJobCompany] || 0;
      const registeredAlumni = networkEntry?.alumni || [];
      const parentsAtCompany = networkEntry?.parents || [];

      // Also pull matching DiscoveredAlumni for this company to show in the modal
      const jobNormForDisc = normalizeForMatch(job.company);
      const discoveredForJob = (discoveredAlumni || []).filter(a => {
        const aNorm = normalizeForMatch(a.company || '');
        return aNorm.length >= 4 && jobNormForDisc.length >= 4 &&
          (aNorm.includes(jobNormForDisc) || jobNormForDisc.includes(aNorm));
      }).map(a => ({
        id: a.id,
        full_name: a.name,
        title: a.role_title || '',
        industry: '',
        graduation_year: a.degree_info || '',
        linkedin_url: a.linkedin_url || null,
        student_name: null,
        persona: 'alumni',
      }));

      // Merge registered + discovered alumni (deduplicate by full_name)
      const seenNames = new Set(registeredAlumni.map(a => a.full_name));
      const mergedAlumni = [...registeredAlumni];
      for (const da of discoveredForJob) {
        if (!seenNames.has(da.full_name)) {
          seenNames.add(da.full_name);
          mergedAlumni.push(da);
        }
      }
      const alumni = mergedAlumni;

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
          companyTier: job.companyTier || 1,
          leadTier: 'insider',
        });

        if (priorityInsiders.length >= 20) continue;
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
          companyTier: job.companyTier || 1,
          leadTier: 'target',
        });
      }
    }

    // Fallback: if no targeted discoveries at all, fill from job pool
    if (priorityInsiders.length === 0 && targetedDiscoveries.length === 0) {
      jobPool.slice(0, 20).forEach(job => {
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
      priorityInsiders: priorityInsiders.slice(0, 12),
      targetedDiscoveries: targetedDiscoveries.slice(0, 20),
      wasFiltered: targetIndustries.length > 0,
      targetIndustries,
    });

  } catch (error) {
    console.error('[getPersonalizedNetworkCarousel]', error.message);
    return Response.json({ error: error.message, cards: [] }, { status: 500 });
  }
});