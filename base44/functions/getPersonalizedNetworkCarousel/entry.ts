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
    { company: 'Morgan Stanley', role: 'Financial Analyst', companyTier: 1, description: 'Location: New York, NY | On-site. Responsibilities: Support wealth management and capital markets teams, build models, prepare client presentations. Requirements: Finance/Econ degree, strong quantitative skills, Series 7 preferred. Compensation: $90,000-110,000 + bonus.', source: 'morganstanley.com/careers', sourceCategory: 'C' },
    { company: 'Citigroup', role: 'Treasury Analyst', companyTier: 1, description: 'Location: Tampa, FL | Hybrid. Responsibilities: Liquidity reporting, funds transfer pricing, regulatory compliance. Requirements: Finance/Accounting degree, Excel/SQL proficiency. Compensation: $75,000-90,000 + bonus, full benefits.', source: 'jobs.citi.com', sourceCategory: 'C' },
    { company: 'Bank of America', role: 'Credit Analyst', companyTier: 1, description: 'Location: Multiple US cities | Hybrid. Responsibilities: Underwrite commercial loans, analyze financial statements, prepare credit memos. Requirements: Finance degree, analytical skills. Compensation: $75,000-85,000 + bonus.', source: 'bankofamerica.com/careers', sourceCategory: 'C' },
    { company: 'Fidelity Investments', role: 'Financial Operations Analyst', companyTier: 1, description: 'Location: Boston, MA | Hybrid. Responsibilities: Trade reconciliation, client reporting, process improvement. Requirements: Finance/Business degree, strong attention to detail. Compensation: $70,000-85,000 + bonus, excellent benefits.', source: 'jobs.fidelity.com', sourceCategory: 'C' },
    { company: 'Vanguard', role: 'Investment Analyst', companyTier: 1, description: 'Location: Malvern, PA | Hybrid. Responsibilities: Portfolio analytics, fund analysis, research support. Requirements: Finance/Economics degree, CFA track preferred. Compensation: $75,000-90,000 + profit sharing.', source: 'vanguardjobs.com', sourceCategory: 'C' },
    { company: 'Charles Schwab', role: 'Financial Advisor Associate', companyTier: 1, description: 'Location: Multiple US cities | Hybrid. Responsibilities: Client portfolio management, financial planning support, investment recommendations. Requirements: Finance degree, Series 7/66 or willingness to obtain. Compensation: $65,000-80,000 + bonus.', source: 'schwab.com/careers', sourceCategory: 'C' },
    // Tier 2: Mid-Market
    { company: 'Stripe', role: 'Financial Operations Specialist', companyTier: 2, description: 'Location: Remote-friendly (US). Responsibilities: Manage payment operations, analyze transaction data, optimize financial workflows, partner with engineering teams. Requirements: Bachelor degree, 2+ years finance experience, SQL/Tableau skills, fintech interest. Compensation: $105,000 base + equity package, unlimited PTO, $3K learning stipend.', source: 'stripe.com/jobs', sourceCategory: 'B' },
    { company: 'SoFi', role: 'Finance Analyst', companyTier: 2, description: 'Location: Charlotte, NC | Remote options. Responsibilities: Credit risk analysis, loan portfolio management, financial modeling, regulatory compliance. Requirements: Bachelor in Finance, 1-3 years experience, Python/R skills. Compensation: $85,000-95,000 base + equity, 100% health premium coverage, parental leave.', source: 'sofi.com/careers', sourceCategory: 'B' },
    { company: 'Brex', role: 'Finance Operations Analyst', companyTier: 2, description: 'Location: Remote-friendly (US) | Hybrid. Responsibilities: Manage corporate card reconciliations, support month-end close, build financial dashboards, optimize spend workflows. Requirements: Bachelor in Finance/Accounting, SQL comfort, startup mindset. Compensation: $90,000-105,000 base + meaningful equity, full benefits, unlimited PTO.', source: 'brex.com/careers', sourceCategory: 'B' },
    { company: 'Robinhood', role: 'Finance Operations Analyst', companyTier: 2, description: 'Location: Menlo Park, CA | Hybrid. Responsibilities: Brokerage operations, regulatory reporting, trade settlement. Requirements: Finance/Accounting degree, detail-oriented, process improvement mindset. Compensation: $90,000-110,000 + equity.', source: 'careers.robinhood.com', sourceCategory: 'B' },
    { company: 'Chime', role: 'Risk Analyst', companyTier: 2, description: 'Location: San Francisco, CA | Remote-friendly. Responsibilities: Fraud detection, financial risk modeling, compliance monitoring. Requirements: Finance/Statistics degree, SQL skills. Compensation: $85,000-100,000 + equity.', source: 'chime.com/careers', sourceCategory: 'B' },
    { company: 'Plaid', role: 'Financial Analyst', companyTier: 2, description: 'Location: Remote-first (US). Responsibilities: FP&A support, financial modeling, data analysis for fintech infrastructure company. Requirements: Finance/Econ degree, SQL and Excel proficiency. Compensation: $100,000-120,000 + equity.', source: 'plaid.com/careers', sourceCategory: 'B' },
    { company: 'Affirm', role: 'Credit Risk Analyst', companyTier: 2, description: 'Location: Remote-friendly (US). Responsibilities: Underwriting model development, portfolio monitoring, credit policy analysis for BNPL leader. Requirements: Statistics/Finance degree, Python or R skills. Compensation: $95,000-115,000 + equity.', source: 'affirm.com/careers', sourceCategory: 'B' },
    // Tier 3: Startup
    { company: 'Ramp', role: 'Finance & Strategy Analyst', companyTier: 3, description: 'Location: New York, NY | Hybrid. Series C fintech redefining corporate finance. Responsibilities: Strategic planning, financial forecasting, business intelligence. Requirements: Top university, analytical mindset, Excel/SQL expertise. Compensation: $110,000 base + significant equity, unlimited PTO, home office budget.', source: 'ramp.com/careers', sourceCategory: 'B' },
    { company: 'Jeeves', role: 'Finance Analyst', companyTier: 3, description: 'Location: Remote (US) | Series B global expense platform. Responsibilities: FP&A support, revenue analysis, investor reporting, cross-functional projects. Requirements: Finance/Economics degree, strong modeling skills. Compensation: $85,000-100,000 base + equity, full benefits. Team of 200.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Finley Technologies', role: 'Credit Operations Analyst', companyTier: 3, description: 'Location: Remote-first | Series A debt capital management startup backed by Y Combinator. Team of 30. Responsibilities: Manage borrower data, build credit reporting workflows, partner with engineering. Requirements: Finance/CS background, analytical mindset. Compensation: $80,000-95,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Carry', role: 'Operations Analyst', companyTier: 3, description: 'Location: Remote-first | Series A retirement & tax planning platform. Team of 60. Responsibilities: Customer onboarding, account operations, product feedback loop. Requirements: Business/Finance degree, customer service skills. Compensation: $70,000-85,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Titan Invest', role: 'Finance Associate', companyTier: 3, description: 'Location: New York, NY | Hybrid | Series B consumer investment platform. Team of 80. Responsibilities: Portfolio operations, client reporting, investment research support. Requirements: Finance/Econ degree, strong Excel skills. Compensation: $90,000-110,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Savvy Wealth', role: 'Financial Planning Associate', companyTier: 3, description: 'Location: Remote-first | Seed-stage RIA platform modernizing wealth management. Team of 40. Responsibilities: Client financial plans, model portfolio management, advisor support. Requirements: Finance degree, CFA Level 1 preferred. Compensation: $75,000-90,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Compound Planning', role: 'Wealth Operations Analyst', companyTier: 3, description: 'Location: Remote-first | Series A wealth management platform for tech employees. Team of 50. Responsibilities: Equity compensation analysis, tax planning coordination, client operations. Requirements: Finance/Accounting degree. Compensation: $80,000-95,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
  'finance & insurance': [
    { company: 'JPMorgan', role: 'Financial Operations Specialist', companyTier: 1, description: 'Location: New York, NY | Hybrid. Responsibilities: Support investment banking operations, prepare financial reports, analyze market trends. Requirements: Bachelor in Finance/Economics, 3.5+ GPA, Excel/SQL skills. Compensation: $95,000 base + $20-40K bonus.', source: 'jpmorgan.com/careers', sourceCategory: 'C' },
    { company: 'Goldman Sachs', role: 'Investment Banking Analyst', companyTier: 1, description: 'Location: New York, NY | On-site. Responsibilities: Build financial models, conduct industry research, prepare pitch books. Requirements: Top-tier university, Finance major, 3.7+ GPA. Compensation: $110,000 base + $50-100K bonus.', source: 'goldmansachs.com/careers', sourceCategory: 'C' },
    { company: 'BlackRock', role: 'Investment Analyst', companyTier: 1, description: 'Location: New York, NY | Hybrid. Responsibilities: Portfolio analysis, risk assessment, market research. Requirements: Finance/Econ/Math degree, 3.6+ GPA. Compensation: $100,000 base + $30-50K bonus.', source: 'blackrock.com/careers', sourceCategory: 'C' },
    { company: 'PwC', role: 'Assurance Associate', companyTier: 1, description: 'Location: Multiple US cities | Hybrid. Responsibilities: Financial statement audits, internal controls testing. Requirements: Accounting degree, 150 credit hours, CPA eligibility. Compensation: $70,000-80,000 base + busy season bonus.', source: 'pwc.com/careers', sourceCategory: 'C' },
    { company: 'Morgan Stanley', role: 'Financial Analyst', companyTier: 1, description: 'Location: New York, NY | On-site. Responsibilities: Support wealth management teams, build models, prepare client presentations. Requirements: Finance/Econ degree, strong quantitative skills. Compensation: $90,000-110,000 + bonus.', source: 'morganstanley.com/careers', sourceCategory: 'C' },
    { company: 'Citigroup', role: 'Treasury Analyst', companyTier: 1, description: 'Location: Tampa, FL | Hybrid. Responsibilities: Liquidity reporting, funds transfer pricing, regulatory compliance. Requirements: Finance/Accounting degree, Excel/SQL proficiency. Compensation: $75,000-90,000 + bonus.', source: 'jobs.citi.com', sourceCategory: 'C' },
    { company: 'Fidelity Investments', role: 'Financial Operations Analyst', companyTier: 1, description: 'Location: Boston, MA | Hybrid. Responsibilities: Trade reconciliation, client reporting, process improvement. Requirements: Finance/Business degree, attention to detail. Compensation: $70,000-85,000 + bonus.', source: 'jobs.fidelity.com', sourceCategory: 'C' },
    { company: 'Bank of America', role: 'Credit Analyst', companyTier: 1, description: 'Location: Multiple US cities | Hybrid. Responsibilities: Underwrite commercial loans, analyze financial statements. Requirements: Finance degree, analytical skills. Compensation: $75,000-85,000 + bonus.', source: 'bankofamerica.com/careers', sourceCategory: 'C' },
    { company: 'Vanguard', role: 'Investment Analyst', companyTier: 1, description: 'Location: Malvern, PA | Hybrid. Responsibilities: Portfolio analytics, fund analysis, research support. Requirements: Finance/Economics degree, CFA track preferred. Compensation: $75,000-90,000 + profit sharing.', source: 'vanguardjobs.com', sourceCategory: 'C' },
    { company: 'Charles Schwab', role: 'Financial Advisor Associate', companyTier: 1, description: 'Location: Multiple US cities | Hybrid. Responsibilities: Client portfolio management, financial planning support. Requirements: Finance degree, Series 7/66 or willingness to obtain. Compensation: $65,000-80,000 + bonus.', source: 'schwab.com/careers', sourceCategory: 'C' },
    { company: 'Wells Fargo', role: 'Corporate Finance Analyst', companyTier: 1, description: 'Location: Multiple US cities | Hybrid. Responsibilities: Support corporate banking teams, financial analysis, client presentations. Requirements: Finance/Business degree, 3.5+ GPA. Compensation: $75,000-90,000 + bonus.', source: 'wellsfargojobs.com', sourceCategory: 'C' },
    { company: 'American Express', role: 'Financial Analyst', companyTier: 1, description: 'Location: New York, NY | Hybrid. Responsibilities: FP&A support, risk analytics, financial modeling. Requirements: Finance/Accounting degree, strong Excel skills. Compensation: $80,000-95,000 + bonus.', source: 'jobs.americanexpress.com', sourceCategory: 'C' },
    { company: 'Stripe', role: 'Financial Operations Specialist', companyTier: 2, description: 'Location: Remote-friendly (US). Responsibilities: Manage payment operations, analyze transaction data, optimize workflows. Requirements: Bachelor degree, 2+ years finance experience, SQL skills. Compensation: $105,000 base + equity.', source: 'stripe.com/jobs', sourceCategory: 'B' },
    { company: 'SoFi', role: 'Finance Analyst', companyTier: 2, description: 'Location: Charlotte, NC | Remote options. Responsibilities: Credit risk analysis, loan portfolio management, financial modeling. Requirements: Bachelor in Finance, 1-3 years experience. Compensation: $85,000-95,000 base + equity.', source: 'sofi.com/careers', sourceCategory: 'B' },
    { company: 'Brex', role: 'Finance Operations Analyst', companyTier: 2, description: 'Location: Remote-friendly (US) | Hybrid. Responsibilities: Manage corporate card reconciliations, support month-end close, build dashboards. Requirements: Bachelor in Finance/Accounting, SQL comfort. Compensation: $90,000-105,000 base + equity.', source: 'brex.com/careers', sourceCategory: 'B' },
    { company: 'Robinhood', role: 'Finance Operations Analyst', companyTier: 2, description: 'Location: Menlo Park, CA | Hybrid. Responsibilities: Brokerage operations, regulatory reporting, trade settlement. Requirements: Finance/Accounting degree, detail-oriented. Compensation: $90,000-110,000 + equity.', source: 'careers.robinhood.com', sourceCategory: 'B' },
    { company: 'Chime', role: 'Risk Analyst', companyTier: 2, description: 'Location: San Francisco, CA | Remote-friendly. Responsibilities: Fraud detection, financial risk modeling, compliance monitoring. Requirements: Finance/Statistics degree, SQL skills. Compensation: $85,000-100,000 + equity.', source: 'chime.com/careers', sourceCategory: 'B' },
    { company: 'Plaid', role: 'Financial Analyst', companyTier: 2, description: 'Location: Remote-first (US). Responsibilities: FP&A support, financial modeling, data analysis. Requirements: Finance/Econ degree, SQL and Excel proficiency. Compensation: $100,000-120,000 + equity.', source: 'plaid.com/careers', sourceCategory: 'B' },
    { company: 'Affirm', role: 'Credit Risk Analyst', companyTier: 2, description: 'Location: Remote-friendly (US). Responsibilities: Underwriting model development, portfolio monitoring. Requirements: Statistics/Finance degree, Python or R skills. Compensation: $95,000-115,000 + equity.', source: 'affirm.com/careers', sourceCategory: 'B' },
    { company: 'Marqeta', role: 'Finance Operations Analyst', companyTier: 2, description: 'Location: Remote-friendly (US). Responsibilities: Payment operations, financial reconciliation, reporting. Requirements: Finance/Accounting degree, 1+ years experience. Compensation: $85,000-100,000 + equity.', source: 'marqeta.com/careers', sourceCategory: 'B' },
    { company: 'Nerdwallet', role: 'Business Analyst', companyTier: 2, description: 'Location: Remote-friendly (US). Responsibilities: Business analytics, financial modeling, data insights. Requirements: Bachelor in quantitative field, SQL skills. Compensation: $90,000-110,000 + equity.', source: 'nerdwallet.com/careers', sourceCategory: 'B' },
    { company: 'Ramp', role: 'Finance & Strategy Analyst', companyTier: 3, description: 'Location: New York, NY | Hybrid. Series C fintech. Responsibilities: Strategic planning, financial forecasting, business intelligence. Requirements: Top university, analytical mindset. Compensation: $110,000 base + equity.', source: 'ramp.com/careers', sourceCategory: 'B' },
    { company: 'Jeeves', role: 'Finance Analyst', companyTier: 3, description: 'Location: Remote (US) | Series B. Team of 200. Responsibilities: FP&A support, revenue analysis, investor reporting. Requirements: Finance/Economics degree. Compensation: $85,000-100,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Finley Technologies', role: 'Credit Operations Analyst', companyTier: 3, description: 'Location: Remote-first | Series A. Team of 30. Responsibilities: Manage borrower data, build credit reporting workflows. Requirements: Finance/CS background. Compensation: $80,000-95,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Carry', role: 'Operations Analyst', companyTier: 3, description: 'Location: Remote-first | Series A. Team of 60. Responsibilities: Customer onboarding, account operations. Requirements: Business/Finance degree. Compensation: $70,000-85,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Titan Invest', role: 'Finance Associate', companyTier: 3, description: 'Location: New York, NY | Hybrid | Series B. Team of 80. Responsibilities: Portfolio operations, client reporting. Requirements: Finance/Econ degree. Compensation: $90,000-110,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Compound Planning', role: 'Wealth Operations Analyst', companyTier: 3, description: 'Location: Remote-first | Series A. Team of 50. Responsibilities: Equity compensation analysis, tax planning. Requirements: Finance/Accounting degree. Compensation: $80,000-95,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Savvy Wealth', role: 'Financial Planning Associate', companyTier: 3, description: 'Location: Remote-first | Seed-stage. Team of 40. Responsibilities: Client financial plans, portfolio management. Requirements: Finance degree. Compensation: $75,000-90,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Clearco', role: 'Investment Analyst', companyTier: 3, description: 'Location: Remote-friendly | Series B. Team of 150. Responsibilities: Deal analysis, portfolio monitoring. Requirements: Finance/Econ degree. Compensation: $85,000-100,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Pipe', role: 'Capital Markets Analyst', companyTier: 3, description: 'Location: Remote-first | Series C. Team of 100. Responsibilities: Revenue financing analysis, deal execution. Requirements: Finance degree. Compensation: $90,000-110,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Sentieo', role: 'Financial Research Analyst', companyTier: 3, description: 'Location: Remote-friendly | Series B. Team of 80. Responsibilities: Investment research, client support. Requirements: Finance/Econ degree. Compensation: $80,000-95,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Hometap', role: 'Investment Operations Analyst', companyTier: 3, description: 'Location: Remote-friendly | Series C. Team of 200. Responsibilities: Investment operations, data analysis. Requirements: Finance/Business degree. Compensation: $75,000-90,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Vestwell', role: 'Finance Operations Associate', companyTier: 3, description: 'Location: Remote-friendly | Series C. Team of 180. Responsibilities: Finance operations, client reporting. Requirements: Finance/Accounting degree. Compensation: $70,000-85,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
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
    { company: 'Google', role: 'Software Engineer (New Grad)', companyTier: 1, description: 'Location: Multiple US cities (Mountain View, Seattle, NYC) | Hybrid. Responsibilities: Build scalable systems for billions of users, write clean code in Java/Python/C++, collaborate with cross-functional teams. Requirements: BS in Computer Science or related field, strong coding skills, experience with data structures and algorithms. Compensation: $110,000-130,000 base + bonus + equity, full health benefits, free meals, $3K learning stipend.', source: 'careers.google.com', sourceCategory: 'C' },
    { company: 'Microsoft', role: 'Software Development Engineer', companyTier: 1, description: 'Location: Redmond, WA | Hybrid. Responsibilities: Design and develop cloud services for Azure, write distributed systems code, participate in code reviews. Requirements: BS/MS in Computer Science, proficiency in C++/Java/C#, strong problem-solving skills. Compensation: $105,000-125,000 base + signing bonus + stock, comprehensive health coverage, relocation assistance.', source: 'careers.microsoft.com', sourceCategory: 'C' },
    { company: 'Salesforce', role: 'Associate Software Engineer', companyTier: 1, description: 'Location: San Francisco, CA | Hybrid. Responsibilities: Build features for Salesforce CRM platform, write Apex/Java code, collaborate with product teams. Requirements: BS in Computer Science, knowledge of OOP, database fundamentals. Compensation: $100,000-120,000 base + equity, full benefits, volunteer time off.', source: 'salesforce.com/careers', sourceCategory: 'C' },
    { company: 'Meta', role: 'Data Engineer', companyTier: 1, description: 'Location: Menlo Park, CA | Hybrid. Responsibilities: Build data pipelines for billions of events, optimize query performance, work with Presto/Spark. Requirements: BS in CS/Engineering, SQL expertise, experience with big data technologies. Compensation: $115,000-140,000 base + RSUs, free meals, wellness programs.', source: 'metacareers.com', sourceCategory: 'B' },
    { company: 'Apple', role: 'Software Engineer (New Grad)', companyTier: 1, description: 'Location: Cupertino, CA | On-site. Responsibilities: Develop features for iOS/macOS, write Swift/Objective-C code, optimize performance. Requirements: BS in Computer Science, strong coding fundamentals, passion for user experience. Compensation: $110,000-135,000 base + stock + bonus, premium health benefits, employee discount.', source: 'jobs.apple.com', sourceCategory: 'C' },
    { company: 'Amazon', role: 'Software Development Engineer', companyTier: 1, description: 'Location: Seattle, WA | Hybrid. Responsibilities: Build scalable services for AWS, design system architecture, mentor junior engineers. Requirements: BS in Computer Science, proficiency in Java/Python, strong algorithmic skills. Compensation: $100,000-120,000 base + sign-on + RSUs, full benefits, career development.', source: 'amazon.jobs', sourceCategory: 'C' },
    { company: 'IBM', role: 'Associate Software Engineer', companyTier: 1, description: 'Location: Multiple US cities | Hybrid. Responsibilities: Develop AI/ML solutions for enterprise clients, write Python/Java code, collaborate with research teams. Requirements: BS in CS/Engineering, knowledge of machine learning frameworks. Compensation: $85,000-105,000 base + bonus, comprehensive benefits, tuition assistance.', source: 'ibm.com/careers', sourceCategory: 'C' },
    // Tier 2
    { company: 'Notion', role: 'Product Analyst', companyTier: 2, description: 'Location: San Francisco, CA | Hybrid. Responsibilities: Analyze user behavior data, build dashboards in SQL/Tableau, partner with product teams on feature launches. Requirements: BS in quantitative field, SQL expertise, strong communication skills. Compensation: $95,000-115,000 base + equity, full health benefits, unlimited PTO.', source: 'notion.com/careers', sourceCategory: 'B' },
    { company: 'Webflow', role: 'Junior Front-End Engineer', companyTier: 2, description: 'Location: San Francisco, CA | Remote-friendly. Responsibilities: Build UI components for no-code platform, write React/TypeScript code, optimize performance for 300K+ customers. Requirements: BS in CS or bootcamp grad, strong JavaScript skills, portfolio of web projects. Compensation: $130,000-155,000 base + equity, 100% health premium, home office stipend.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Figma', role: 'Product Engineer', companyTier: 2, description: 'Location: San Francisco, CA | Hybrid. Responsibilities: Build core design tool features, optimize rendering performance, write C++/WebAssembly code. Requirements: BS in CS, strong systems programming skills, passion for design tools. Compensation: $160,000-190,000 base + equity, full benefits, learning budget.', source: 'dribbble.com/jobs', sourceCategory: 'E', nichePlatform: 'dribbble' },
    { company: 'Airtable', role: 'Software Engineer', companyTier: 2, description: 'Location: San Francisco, CA | Hybrid. Responsibilities: Build database platform features, write distributed systems code in Go/Java, ensure 99.99% uptime. Requirements: BS in Computer Science, experience with databases, strong coding skills. Compensation: $140,000-170,000 base + equity, comprehensive health, unlimited PTO.', source: 'airtable.com/careers', sourceCategory: 'B' },
    { company: 'Twilio', role: 'Software Engineer (New Grad)', companyTier: 2, description: 'Location: Remote-first (US). Responsibilities: Build messaging/video APIs used by millions, write Java/Python code, participate in on-call rotation. Requirements: BS in CS, strong backend skills, API design knowledge. Compensation: $120,000-145,000 base + equity, full remote benefits, coworking stipend.', source: 'twilio.com/en-us/company/jobs', sourceCategory: 'B' },
    { company: 'Datadog', role: 'Software Engineer', companyTier: 2, description: 'Location: New York, NY | Hybrid. Responsibilities: Build cloud monitoring features, write Go/Python code, optimize data pipelines for billions of metrics. Requirements: BS in CS, distributed systems experience, strong problem-solving. Compensation: $130,000-160,000 base + equity, premium health, commuter benefits.', source: 'careers.datadoghq.com', sourceCategory: 'B' },
    { company: 'HashiCorp', role: 'Software Engineer', companyTier: 2, description: 'Location: Remote-first (US). Responsibilities: Build infrastructure automation tools, contribute to open source projects, write Go code. Requirements: BS in CS, passion for DevOps, strong coding skills. Compensation: $125,000-155,000 base + equity, remote-first culture, unlimited PTO.', source: 'hashicorp.com/jobs', sourceCategory: 'B' },
    { company: 'Cloudflare', role: 'Software Engineer', companyTier: 2, description: 'Location: Austin, TX | Hybrid. Responsibilities: Build internet security features, write Rust/Go code, optimize network performance. Requirements: BS in CS, networking knowledge, strong systems skills. Compensation: $115,000-145,000 base + equity, full benefits, learning stipend.', source: 'cloudflare.com/careers', sourceCategory: 'B' },
    // Tier 3
    { company: 'Linear', role: 'Product Designer', companyTier: 3, description: 'Location: Remote-first | Team of 50. Responsibilities: Design core issue-tracking workflows, build design system components, conduct user research. Requirements: 2+ years product design experience, strong Figma skills, portfolio of shipped work. Compensation: $140,000-170,000 base + equity, remote-first, top-of-market package.', source: 'keyvalues.com', sourceCategory: 'E', nichePlatform: 'keyvalues' },
    { company: 'Ramp', role: 'Software Engineer', companyTier: 3, description: 'Location: New York, NY | Hybrid | Series D fintech. Responsibilities: Build payment infrastructure, write backend services in Python/Go, ensure PCI compliance. Requirements: BS in CS, strong backend skills, fintech interest. Compensation: $150,000-180,000 base + meaningful equity, full benefits, unlimited PTO.', source: 'ramp.com/careers', sourceCategory: 'B' },
    { company: 'Retool', role: 'Software Engineer', companyTier: 3, description: 'Location: San Francisco, CA | Hybrid | Series C. Responsibilities: Build internal tools platform, write React/TypeScript code, optimize performance for 100K+ developers. Requirements: BS in CS, strong full-stack skills, startup mindset. Compensation: $160,000-200,000 base + equity, comprehensive health, catered lunches.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Vercel', role: 'Growth Engineer', companyTier: 3, description: 'Location: Remote-first | Series C. Responsibilities: Build onboarding flows, instrument analytics, optimize conversion funnels. Requirements: BS in CS, full-stack experience, data-driven mindset. Compensation: $130,000-160,000 base + equity, remote-first, learning budget.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Supabase', role: 'Software Engineer', companyTier: 3, description: 'Location: Remote-first | Series B. Responsibilities: Build open source Firebase alternative, write PostgreSQL extensions, contribute to community. Requirements: BS in CS, database expertise, open source contributions. Compensation: $140,000-170,000 base + equity, remote-first, conference budget.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'PlanetScale', role: 'Developer Advocate Engineer', companyTier: 3, description: 'Location: Remote-first | Series C. Responsibilities: Create technical content, build demo applications, engage with developer community. Requirements: BS in CS, strong communication skills, database knowledge. Compensation: $130,000-160,000 base + equity, remote-first, travel budget.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Fly.io', role: 'Software Engineer', companyTier: 3, description: 'Location: Remote-first | Team of 40. Responsibilities: Build edge deployment platform, write Go/Rust code, optimize container orchestration. Requirements: BS in CS, systems programming experience, distributed systems knowledge. Compensation: $140,000-175,000 base + equity, remote-first, high ownership.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Descript', role: 'Software Engineer', companyTier: 3, description: 'Location: Remote-friendly | Series C. Team of 150. Responsibilities: Build audio/video editing features, write C++/JavaScript code, optimize media processing. Requirements: BS in CS, multimedia experience, strong coding skills. Compensation: $140,000-170,000 base + equity, full benefits, home office stipend.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Loom', role: 'Product Engineer', companyTier: 3, description: 'Location: Remote-first | Async video platform. Responsibilities: Build video recording/playback features, write React/Node code, optimize streaming quality. Requirements: BS in CS, full-stack experience, passion for communication tools. Compensation: $135,000-165,000 base + equity, remote-first, wellness stipend.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Cal.com', role: 'Software Engineer', companyTier: 3, description: 'Location: Remote-first | Open source scheduling platform. Responsibilities: Build calendar integrations, write TypeScript/React code, contribute to open source community. Requirements: BS in CS or equivalent, strong TypeScript skills, open source contributions. Compensation: $120,000-150,000 base + equity, remote-first, direct founder access.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Resend', role: 'Software Engineer', companyTier: 3, description: 'Location: Remote-first | YC-backed. Team of 20. Responsibilities: Build email API infrastructure, write Go/TypeScript code, ensure high deliverability. Requirements: BS in CS, backend experience, API design skills. Compensation: $140,000-170,000 base + equity, remote-first, massive ownership.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Turso', role: 'Developer Advocate', companyTier: 3, description: 'Location: Remote-first | Edge database startup. Responsibilities: Create technical tutorials, engage with developer community, build sample applications. Requirements: BS in CS, strong writing skills, database knowledge. Compensation: $110,000-140,000 base + equity, remote-first, conference travel.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Prisma', role: 'Software Engineer', companyTier: 3, description: 'Location: Remote-first | Series B. Team of 60. Responsibilities: Build ORM tooling, write TypeScript/Rust code, engage with open source community. Requirements: BS in CS, database expertise, TypeScript proficiency. Compensation: $135,000-165,000 base + equity, remote-first, learning budget.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
  'technology': [
    { company: 'Google', role: 'Software Engineer (New Grad)', companyTier: 1, description: 'Location: Multiple US cities | Hybrid. Responsibilities: Build scalable systems, write clean code in Java/Python/C++, collaborate with teams. Requirements: BS in CS, strong coding skills, data structures knowledge. Compensation: $110,000-130,000 base + bonus + equity.', source: 'careers.google.com', sourceCategory: 'C' },
    { company: 'Microsoft', role: 'Software Development Engineer', companyTier: 1, description: 'Location: Redmond, WA | Hybrid. Responsibilities: Design cloud services for Azure, write distributed systems code. Requirements: BS/MS in CS, C++/Java/C# proficiency. Compensation: $105,000-125,000 base + stock.', source: 'careers.microsoft.com', sourceCategory: 'C' },
    { company: 'Salesforce', role: 'Associate Software Engineer', companyTier: 1, description: 'Location: San Francisco, CA | Hybrid. Responsibilities: Build CRM platform features, write Apex/Java code. Requirements: BS in CS, OOP knowledge. Compensation: $100,000-120,000 base + equity.', source: 'salesforce.com/careers', sourceCategory: 'C' },
    { company: 'Meta', role: 'Data Engineer', companyTier: 1, description: 'Location: Menlo Park, CA | Hybrid. Responsibilities: Build data pipelines for billions of events, optimize queries. Requirements: BS in CS/Engineering, SQL expertise. Compensation: $115,000-140,000 base + RSUs.', source: 'metacareers.com', sourceCategory: 'B' },
    { company: 'Apple', role: 'Software Engineer (New Grad)', companyTier: 1, description: 'Location: Cupertino, CA | On-site. Responsibilities: Develop iOS/macOS features, write Swift/Objective-C code. Requirements: BS in CS, strong coding fundamentals. Compensation: $110,000-135,000 base + stock.', source: 'jobs.apple.com', sourceCategory: 'C' },
    { company: 'Amazon', role: 'Software Development Engineer', companyTier: 1, description: 'Location: Seattle, WA | Hybrid. Responsibilities: Build AWS services, design system architecture. Requirements: BS in CS, Java/Python proficiency. Compensation: $100,000-120,000 base + RSUs.', source: 'amazon.jobs', sourceCategory: 'C' },
    { company: 'Airtable', role: 'Software Engineer', companyTier: 2, description: 'Location: San Francisco, CA | Hybrid. Responsibilities: Build database platform features, write Go/Java code. Requirements: BS in CS, database experience. Compensation: $140,000-170,000 base + equity.', source: 'airtable.com/careers', sourceCategory: 'B' },
    { company: 'Notion', role: 'Product Analyst', companyTier: 2, description: 'Location: San Francisco, CA | Hybrid. Responsibilities: Analyze user behavior, build SQL/Tableau dashboards. Requirements: BS in quantitative field, SQL expertise. Compensation: $95,000-115,000 base + equity.', source: 'notion.com/careers', sourceCategory: 'B' },
    { company: 'Datadog', role: 'Software Engineer', companyTier: 2, description: 'Location: New York, NY | Hybrid. Responsibilities: Build cloud monitoring features, write Go/Python code. Requirements: BS in CS, distributed systems experience. Compensation: $130,000-160,000 base + equity.', source: 'careers.datadoghq.com', sourceCategory: 'B' },
    { company: 'Twilio', role: 'Software Engineer (New Grad)', companyTier: 2, description: 'Location: Remote-first (US). Responsibilities: Build messaging/video APIs, write Java/Python code. Requirements: BS in CS, backend skills. Compensation: $120,000-145,000 base + equity.', source: 'twilio.com/en-us/company/jobs', sourceCategory: 'B' },
    { company: 'Webflow', role: 'Junior Front-End Engineer', companyTier: 2, description: 'Location: San Francisco, CA | Remote-friendly. Responsibilities: Build UI components, write React/TypeScript code. Requirements: BS in CS or bootcamp grad, JavaScript skills. Compensation: $130,000-155,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Retool', role: 'Software Engineer', companyTier: 3, description: 'Location: San Francisco, CA | Hybrid | Series C. Team of 200. Responsibilities: Build internal tools platform, write React/TypeScript code. Requirements: BS in CS, full-stack skills. Compensation: $160,000-200,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Vercel', role: 'Growth Engineer', companyTier: 3, description: 'Location: Remote-first | Series C. Responsibilities: Build onboarding flows, instrument analytics. Requirements: BS in CS, full-stack experience. Compensation: $130,000-160,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Supabase', role: 'Software Engineer', companyTier: 3, description: 'Location: Remote-first | Series B. Responsibilities: Build open source Firebase alternative, write PostgreSQL extensions. Requirements: BS in CS, database expertise. Compensation: $140,000-170,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Ramp', role: 'Software Engineer', companyTier: 3, description: 'Location: New York, NY | Hybrid | Series D. Responsibilities: Build payment infrastructure, write Python/Go code. Requirements: BS in CS, backend skills. Compensation: $150,000-180,000 base + equity.', source: 'ramp.com/careers', sourceCategory: 'B' },
    { company: 'Descript', role: 'Software Engineer', companyTier: 3, description: 'Location: Remote-friendly | Series C. Team of 150. Responsibilities: Build audio/video editing features, write C++/JavaScript. Requirements: BS in CS, multimedia experience. Compensation: $140,000-170,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Loom', role: 'Product Engineer', companyTier: 3, description: 'Location: Remote-first. Responsibilities: Build video recording/playback features, write React/Node code. Requirements: BS in CS, full-stack experience. Compensation: $135,000-165,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Resend', role: 'Software Engineer', companyTier: 3, description: 'Location: Remote-first | YC-backed. Team of 20. Responsibilities: Build email API infrastructure, write Go/TypeScript. Requirements: BS in CS, backend experience. Compensation: $140,000-170,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Prisma', role: 'Software Engineer', companyTier: 3, description: 'Location: Remote-first | Series B. Team of 60. Responsibilities: Build ORM tooling, write TypeScript/Rust. Requirements: BS in CS, database expertise. Compensation: $135,000-165,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Linear', role: 'Product Designer', companyTier: 3, description: 'Location: Remote-first | Team of 50. Responsibilities: Design product workflows, build design system. Requirements: 2+ years product design, Figma skills. Compensation: $140,000-170,000 base + equity.', source: 'keyvalues.com', sourceCategory: 'E', nichePlatform: 'keyvalues' },
  ],
  'technology, information & media': [
    { company: 'Google', role: 'Software Engineer (New Grad)', companyTier: 1, description: 'Engineering and product roles across cloud, AI, and consumer teams.', source: 'careers.google.com', sourceCategory: 'C' },
    { company: 'Microsoft', role: 'Software Development Engineer', companyTier: 1, description: 'New grad programs spanning cloud, AI, and productivity divisions.', source: 'careers.microsoft.com', sourceCategory: 'C' },
    { company: 'Meta', role: 'Data Engineer', companyTier: 1, description: 'Data and engineering roles across ads and product infrastructure.', source: 'metacareers.com', sourceCategory: 'B' },
    { company: 'Apple', role: 'Software Engineer (New Grad)', companyTier: 1, description: 'Engineering roles across iOS, macOS, and services.', source: 'jobs.apple.com', sourceCategory: 'C' },
    { company: 'Notion', role: 'Product Analyst', companyTier: 2, description: 'Productivity startup scaling globally — product and data roles.', source: 'notion.com/careers', sourceCategory: 'B' },
    { company: 'Airtable', role: 'Software Engineer', companyTier: 2, description: 'No-code database platform — engineering with direct product ownership.', source: 'airtable.com/careers', sourceCategory: 'B' },
    { company: 'Datadog', role: 'Software Engineer', companyTier: 2, description: 'Cloud monitoring platform — backend, frontend, and infrastructure roles.', source: 'careers.datadoghq.com', sourceCategory: 'B' },
    { company: 'Vercel', role: 'Growth Engineer', companyTier: 3, description: 'Remote-first Series C developer platform — warm intro = direct hiring manager access.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Retool', role: 'Software Engineer', companyTier: 3, description: 'Series C internal tools platform. $160,000-200,000 + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Supabase', role: 'Software Engineer', companyTier: 3, description: 'Open source Firebase alternative, Series B. Remote-first engineering culture.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Descript', role: 'Software Engineer', companyTier: 3, description: 'Series C audio/video editing platform. Team of 150.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Loom', role: 'Product Engineer', companyTier: 3, description: 'Async video platform used by 25M+ people. Full-stack product engineering.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Resend', role: 'Software Engineer', companyTier: 3, description: 'YC-backed email API startup. Massive ownership, small team, direct user feedback.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Prisma', role: 'Software Engineer', companyTier: 3, description: 'Open source ORM and database tooling, Series B. Remote-first.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
  'consulting': [
    // Tier 1
    { company: 'McKinsey', role: 'Business Analyst', companyTier: 1, description: 'Location: Multiple US cities | Hybrid. Responsibilities: Analyze client business problems, build financial models, prepare presentations, conduct research. Requirements: Top-tier university, 3.7+ GPA, leadership experience. Compensation: $90,000-100,000 base + bonus, full benefits, travel rewards.', source: 'mckinsey.com/careers', sourceCategory: 'C' },
    { company: 'BCG', role: 'Associate Consultant', companyTier: 1, description: 'Location: Multiple US cities | Hybrid. Responsibilities: Support strategy engagements, analyze market data, develop recommendations, client presentations. Requirements: Bachelor degree, 3.6+ GPA, analytical skills. Compensation: $85,000-95,000 base + signing bonus, comprehensive benefits.', source: 'bcg.com/careers', sourceCategory: 'C' },
    { company: 'Deloitte', role: 'Strategy & Analytics Consultant', companyTier: 1, description: 'Location: Multiple US cities | Hybrid. Responsibilities: Client analysis, process improvement, technology advisory, build dashboards. Requirements: Bachelor in Business/Engineering, 3.5+ GPA, strong Excel skills. Compensation: $75,000-90,000 base + bonus, full benefits, professional development.', source: 'deloitte.com/careers', sourceCategory: 'C' },
    // Tier 2
    { company: 'West Monroe', role: 'Business Analyst', companyTier: 2, description: 'Location: Multiple US offices | Digital consulting firm. Responsibilities: Client analysis, process improvement, technology advisory, requirements gathering. Requirements: Bachelor degree, analytical mindset, communication skills. Compensation: $75,000-85,000 base + bonus + profit sharing, full benefits.', source: 'westmonroe.com/careers', sourceCategory: 'B' },
    { company: 'Slalom', role: 'Business Analyst', companyTier: 2, description: 'Location: Multiple US cities | Modern consulting firm. Responsibilities: Strategy and tech consulting, client workshops, delivery, stakeholder management. Requirements: Bachelor degree, analytical skills, communication. Compensation: $70,000-85,000 base + bonus, excellent benefits, flexible work.', source: 'slalom.com/careers', sourceCategory: 'B' },
    // Tier 3
    { company: 'Clarkston Consulting', role: 'Associate Consultant', companyTier: 3, description: 'Location: Multiple US offices | 300-person boutique. Responsibilities: Client deliverables, data analysis, process design, workshop facilitation. Requirements: Bachelor degree, 3.5+ GPA, strong problem-solving. Compensation: $65,000-75,000 base + bonus, health benefits.', source: 'clarktonconsulting.com/careers', sourceCategory: 'B' },
  ],
  'professional services': [
    { company: 'Deloitte', role: 'Consulting Analyst', companyTier: 1, description: 'Location: Multiple US cities | Hybrid. Responsibilities: Client analysis, process improvement, technology advisory. Requirements: Bachelor in Business/Engineering, 3.5+ GPA. Compensation: $75,000-90,000 base + bonus.', source: 'deloitte.com/careers', sourceCategory: 'C' },
    { company: 'EY', role: 'Associate', companyTier: 1, description: 'Location: Multiple US cities | Hybrid. Responsibilities: Financial audits, tax preparation, advisory projects. Requirements: Accounting/Business degree, 3.5+ GPA. Compensation: $70,000-85,000 base + bonus.', source: 'ey.com/careers', sourceCategory: 'C' },
    { company: 'KPMG', role: 'Advisory Associate', companyTier: 1, description: 'Location: Multiple US cities | Hybrid. Responsibilities: Risk advisory, management consulting, deal advisory. Requirements: Business/Engineering degree, strong analytical skills. Compensation: $72,000-88,000 base + bonus.', source: 'kpmg.com/careers', sourceCategory: 'C' },
    { company: 'McKinsey', role: 'Business Analyst', companyTier: 1, description: 'Location: Multiple US cities | Hybrid. Responsibilities: Analyze client problems, build financial models, prepare presentations. Requirements: Top-tier university, 3.7+ GPA. Compensation: $90,000-100,000 base + bonus.', source: 'mckinsey.com/careers', sourceCategory: 'C' },
    { company: 'West Monroe', role: 'Business Analyst', companyTier: 2, description: 'Location: Multiple US offices | Hybrid. Responsibilities: Client analysis, process improvement, technology advisory. Requirements: Bachelor degree, analytical mindset. Compensation: $75,000-85,000 base + profit sharing.', source: 'westmonroe.com/careers', sourceCategory: 'B' },
    { company: 'Clarkston Consulting', role: 'Associate Consultant', companyTier: 3, description: 'Location: Multiple US offices | 300-person boutique. Responsibilities: Client deliverables, data analysis, process design. Requirements: Bachelor degree, 3.5+ GPA. Compensation: $65,000-75,000 base + bonus.', source: 'clarktonconsulting.com/careers', sourceCategory: 'B' },
  ],
  'healthcare': [
    // Tier 1
    { company: 'HCA Healthcare', role: 'Clinical Coordinator', companyTier: 1, description: 'Location: Multiple US cities | Hospital network. Responsibilities: Coordinate patient care schedules, manage nursing staff assignments, ensure compliance with protocols. Requirements: BSN degree, RN license, 2+ years clinical experience. Compensation: $70,000-85,000 base + shift differential, full benefits, tuition reimbursement.', source: 'hcahealthcare.com/careers', sourceCategory: 'C' },
    { company: 'AdventHealth', role: 'Registered Nurse', companyTier: 1, description: 'Location: Multiple US cities | Faith-based hospital network. Responsibilities: Provide direct patient care, administer medications, collaborate with healthcare teams. Requirements: BSN degree, RN license, BLS certification. Compensation: $68,000-82,000 base + sign-on bonus, comprehensive benefits.', source: 'adventhealth.com/careers', sourceCategory: 'C' },
    // Tier 2
    { company: 'Carbon Health', role: 'Care Coordinator', companyTier: 2, description: 'Location: Multiple US cities | Tech-enabled primary care startup with 100+ clinics. Responsibilities: Patient care coordination, scheduling, care plan follow-up, insurance verification. Requirements: Bachelor in Health Administration, 1+ years healthcare experience. Compensation: $55,000-65,000 base + equity, full health benefits.', source: 'carbonhealth.com/careers', sourceCategory: 'B' },
    { company: 'Hims & Hers', role: 'Clinical Operations Analyst', companyTier: 2, description: 'Location: Remote-friendly (US) | Telehealth platform. Responsibilities: Analyze clinical workflows, coordinate with provider teams, report on outcomes, ensure regulatory compliance. Requirements: Bachelor in Healthcare/Business, 2+ years ops experience, SQL skills. Compensation: $70,000-85,000 base + equity, remote-first.', source: 'himshers.com/careers', sourceCategory: 'B' },
    // Tier 3
    { company: 'Nomi Health', role: 'Operations Associate', companyTier: 3, description: 'Location: Remote-first | Series B direct healthcare company. Team of 250. Responsibilities: Support employer health benefit programs, analyze claims data, coordinate with provider networks. Requirements: Bachelor in Healthcare/Business, analytical skills. Compensation: $65,000-75,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Grow Therapy', role: 'Clinical Network Associate', companyTier: 3, description: 'Location: Remote-first | Series B mental health startup. Team of 150. Responsibilities: Onboard therapist partners, manage clinical compliance, support patient matching, track outcomes. Requirements: Bachelor in Psychology/Healthcare, 1+ years experience. Compensation: $60,000-70,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
  'healthcare & pharmaceuticals': [
    { company: 'HCA Healthcare', role: 'Clinical Coordinator', companyTier: 1, description: 'Location: Multiple US cities | Hospital network. Responsibilities: Coordinate patient care schedules, manage nursing staff assignments. Requirements: BSN degree, RN license, 2+ years experience. Compensation: $70,000-85,000 base + benefits.', source: 'hcahealthcare.com/careers', sourceCategory: 'C' },
    { company: 'CVS Health', role: 'Pharmacy Operations Analyst', companyTier: 1, description: 'Location: Multiple US cities | Hybrid. Responsibilities: Pharmacy operations, inventory management, regulatory compliance. Requirements: Bachelor in Pharmacy/Business, analytical skills. Compensation: $65,000-80,000 base + benefits.', source: 'cvshealth.com/careers', sourceCategory: 'C' },
    { company: 'Hims & Hers', role: 'Clinical Operations Analyst', companyTier: 2, description: 'Location: Remote-friendly (US). Responsibilities: Analyze clinical workflows, coordinate with providers, ensure compliance. Requirements: Bachelor in Healthcare, 2+ years ops experience. Compensation: $70,000-85,000 base + equity.', source: 'himshers.com/careers', sourceCategory: 'B' },
    { company: 'Grow Therapy', role: 'Clinical Network Associate', companyTier: 3, description: 'Location: Remote-first | Series B. Team of 150. Responsibilities: Onboard therapists, manage compliance, support patient matching. Requirements: Bachelor in Psychology/Healthcare. Compensation: $60,000-70,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
  'marketing': [
    // Tier 1
    { company: 'Procter & Gamble', role: 'Brand Management Associate', companyTier: 1, description: 'Location: Cincinnati, OH | Hybrid. Responsibilities: Lead product launches, manage brand P&L, conduct consumer research, coordinate with R&D. Requirements: Bachelor in Business/Marketing, 3.5+ GPA, leadership experience. Compensation: $90,000-100,000 base + bonus, full benefits, relocation assistance.', source: 'pg.com/careers', sourceCategory: 'C' },
    { company: 'Ogilvy', role: 'Account Coordinator', companyTier: 1, description: 'Location: New York, NY | Hybrid. Responsibilities: Coordinate client campaigns, manage project timelines, prepare presentations, liaise with creative teams. Requirements: Bachelor in Marketing/Communications, strong writing skills. Compensation: $55,000-65,000 base + bonus, health benefits.', source: 'ogilvy.com/careers', sourceCategory: 'B' },
    // Tier 2
    { company: 'Edelman', role: 'PR Account Coordinator', companyTier: 2, description: "Location: Multiple US cities | Hybrid. Responsibilities: Draft press releases, manage media lists, coordinate events, track coverage. Requirements: Bachelor in Communications/PR, excellent writing skills. Compensation: $50,000-60,000 base + bonus, full benefits.", source: 'edelman.com/careers', sourceCategory: 'C' },
    { company: 'Klaviyo', role: 'Marketing Operations Analyst', companyTier: 2, description: 'Location: Boston, MA / Remote | Post-IPO. Responsibilities: Campaign analysis, marketing automation, cross-channel reporting, optimize email/SMS flows. Requirements: Bachelor in Marketing/Business, SQL skills, analytics mindset. Compensation: $75,000-90,000 base + equity, full benefits.', source: 'klaviyo.com/careers', sourceCategory: 'B' },
    // Tier 3
    { company: 'Attentive', role: 'Growth Marketing Associate', companyTier: 3, description: 'Location: Remote-friendly | Series E SMS marketing platform. Team of 400. Responsibilities: Campaign management, performance analysis, A/B testing, optimize conversion funnels. Requirements: Bachelor in Marketing, 1-2 years experience, data-driven. Compensation: $65,000-80,000 base + equity, remote-first.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Triple Whale', role: 'Marketing Analyst', companyTier: 3, description: 'Location: Remote-first | Series B e-commerce analytics startup. Team of 120. Responsibilities: Analyze customer data, build marketing dashboards, support growth initiatives. Requirements: Bachelor in quantitative field, SQL/Tableau skills. Compensation: $70,000-85,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
  'creative': [
    // Tier 1
    { company: 'Ogilvy', role: 'Junior Art Director', companyTier: 1, description: 'Location: New York, NY | Hybrid. Responsibilities: Create visual concepts, design campaign assets, collaborate with copywriters. Requirements: Bachelor in Design, strong portfolio. Compensation: $60,000-75,000 base + bonus.', source: 'ogilvy.com/careers', sourceCategory: 'C' },
    // Tier 2
    { company: 'Figma', role: 'Brand Designer', companyTier: 2, description: 'Location: San Francisco, CA | Hybrid. Responsibilities: Create brand assets, design marketing materials, maintain brand consistency. Requirements: 3+ years brand design experience. Compensation: $130,000-160,000 base + equity.', source: 'dribbble.com/jobs', sourceCategory: 'E', nichePlatform: 'dribbble' },
    { company: 'Superside', role: 'Junior Creative Strategist', companyTier: 2, description: 'Location: Remote-first. Responsibilities: Develop creative strategies, manage client projects, coordinate with designers. Requirements: 2+ years creative experience. Compensation: $70,000-90,000 base + equity.', source: 'workingnotworking.com', sourceCategory: 'E', nichePlatform: 'workingnotworking' },
    // Tier 3
    { company: 'Mailchimp', role: 'UX Writer', companyTier: 2, description: 'Location: Remote-friendly (US). Responsibilities: Craft product copy, maintain voice/tone, design content systems. Requirements: 3+ years UX writing experience. Compensation: $100,000-130,000 base + equity.', source: 'keyvalues.com', sourceCategory: 'E', nichePlatform: 'keyvalues' },
    { company: 'Contra', role: 'Brand Designer', companyTier: 3, description: 'Location: Remote-first | Series B. Team of 60. Responsibilities: Visual identity, campaign assets, design system contributions. Requirements: 3+ years brand design. Compensation: $110,000-140,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Jobbio Creative Agency', role: 'Content Strategist', companyTier: 3, description: 'Location: Remote-friendly | Boutique agency. Team of 25. Responsibilities: Content strategy, editorial planning, client workshops. Requirements: 2+ years content strategy. Compensation: $65,000-80,000 base + equity.', source: 'jobbio.com', sourceCategory: 'E', nichePlatform: 'jobbio' },
  ],
  'advertising & pr': [
    // Tier 1
    { company: 'Edelman', role: 'PR Account Coordinator', companyTier: 1, description: "Location: Multiple US cities | Hybrid. Responsibilities: Draft press releases, manage media lists, coordinate events. Requirements: Bachelor in Communications/PR. Compensation: $50,000-60,000 base + bonus.", source: 'edelman.com/careers', sourceCategory: 'C' },
    { company: 'WPP', role: 'Strategy Analyst', companyTier: 1, description: 'Location: New York, NY | Hybrid. Responsibilities: Market research, competitive analysis, client presentations. Requirements: Bachelor in Marketing/Business. Compensation: $65,000-80,000 base + bonus.', source: 'wpp.com/careers', sourceCategory: 'C' },
    // Tier 2
    { company: 'Weber Shandwick', role: 'PR Associate', companyTier: 2, description: 'Location: Multiple US cities | Hybrid. Responsibilities: Media relations, content creation, campaign support. Requirements: Bachelor in Communications. Compensation: $55,000-65,000 base + bonus.', source: 'webershandwick.com/careers', sourceCategory: 'B' },
    { company: 'Klaviyo', role: 'Content Marketing Associate', companyTier: 2, description: 'Location: Boston, MA / Remote | Post-IPO. Responsibilities: Blog content, case studies, social copy, SEO. Requirements: Bachelor in Marketing/English. Compensation: $65,000-80,000 base + equity.', source: 'klaviyo.com/careers', sourceCategory: 'B' },
    // Tier 3
    { company: 'Independent Creative Agency', role: 'Junior Copywriter', companyTier: 3, description: 'Location: Remote-friendly | Boutique agency. Team of 20. Responsibilities: Write ad copy, social content, brand messaging. Requirements: Strong writing portfolio. Compensation: $55,000-70,000 base + equity.', source: 'reddit.com/r/design', sourceCategory: 'D' },
    { company: 'Global Creative Studio', role: 'Art Director (Junior)', companyTier: 3, description: 'Location: New York, NY | Hybrid. Responsibilities: Visual concept development, campaign design, client presentations. Requirements: 2+ years art direction. Compensation: $70,000-90,000 base + bonus.', source: 'workingnotworking.com', sourceCategory: 'E', nichePlatform: 'workingnotworking' },
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
    { company: 'Teach For America', role: 'Corps Member', companyTier: 1, description: 'Location: Multiple US cities | Full-time. Responsibilities: Teach in under-resourced schools, develop lesson plans, track student progress, collaborate with staff. Requirements: Bachelor degree, 3.5+ GPA, leadership experience, commitment to 2 years. Compensation: $55,000-65,000 base + loan forgiveness, full benefits, training program.', source: 'teachforamerica.org/join-tfa', sourceCategory: 'C' },
    { company: 'Duolingo', role: 'Curriculum Analyst', companyTier: 2, description: 'Location: Pittsburgh, PA | Hybrid. Responsibilities: Design language learning content, analyze learner data, A/B test lessons, collaborate with product teams. Requirements: Bachelor in Education/Linguistics, data analysis skills, language proficiency. Compensation: $75,000-90,000 base + equity, full benefits.', source: 'duolingo.com/careers', sourceCategory: 'B' },
    { company: 'Synthesis', role: 'Learning Experience Associate', companyTier: 3, description: 'Location: Remote-first | Series A edtech from SpaceX. Team of 100. Responsibilities: Design learning experiences, analyze student outcomes, work with instructors, iterate curriculum. Requirements: Bachelor in Education, passion for innovation, analytical mindset. Compensation: $70,000-85,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Primer', role: 'Education Operations Associate', companyTier: 3, description: 'Location: Remote-first | Series B AI tutoring platform. Team of 60. Responsibilities: Support school partnerships, track learning outcomes, assist curriculum development, coordinate pilots. Requirements: Bachelor in Education/Business, 1+ years experience. Compensation: $60,000-75,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
  'education & training': [
    { company: 'Teach For America', role: 'Corps Member', companyTier: 1, description: 'Location: Multiple US cities | Full-time. Responsibilities: Teach in under-resourced schools, develop lesson plans, track student progress. Requirements: Bachelor degree, 3.5+ GPA, leadership experience. Compensation: $55,000-65,000 base + loan forgiveness.', source: 'teachforamerica.org/join-tfa', sourceCategory: 'C' },
    { company: 'Duolingo', role: 'Curriculum Analyst', companyTier: 2, description: 'Location: Pittsburgh, PA | Hybrid. Responsibilities: Design language learning content, analyze learner data, A/B test lessons. Requirements: Bachelor in Education/Linguistics, data analysis skills. Compensation: $75,000-90,000 base + equity.', source: 'duolingo.com/careers', sourceCategory: 'B' },
    { company: 'Synthesis', role: 'Learning Experience Associate', companyTier: 3, description: 'Location: Remote-first | Series A. Team of 100. Responsibilities: Design learning experiences, analyze student outcomes, work with instructors. Requirements: Bachelor in Education, analytical mindset. Compensation: $70,000-85,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
  'nonprofit': [
    { company: 'Teach For America', role: 'Program Associate', companyTier: 1, description: 'Educational non-profit with operations and program roles.', source: 'teachforamerica.org/join-tfa', sourceCategory: 'C' },
    { company: 'Code for America', role: 'Civic Tech Fellow', companyTier: 2, description: 'Non-profit improving government services through technology.', source: 'codeforamerica.org/careers', sourceCategory: 'B' },
    { company: 'GiveDirectly', role: 'Operations Associate', companyTier: 3, description: 'Location: Remote-friendly | High-impact international nonprofit. Team of 200. Responsibilities: Program support, data analysis, partner coordination.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
  'government': [
    { company: 'Booz Allen Hamilton', role: 'Government Analyst', companyTier: 1, description: 'Location: Washington DC | Hybrid. Responsibilities: Analyze government programs, prepare briefings, support federal clients. Requirements: Bachelor in Business/Political Science, 3.5+ GPA. Compensation: $75,000-90,000 base + bonus.', source: 'boozallen.com/careers', sourceCategory: 'C' },
    { company: 'Deloitte Government', role: 'Federal Consultant', companyTier: 1, description: 'Location: Washington DC | Hybrid. Responsibilities: Support federal agencies, process improvement, technology implementation. Requirements: Bachelor degree, US citizenship. Compensation: $80,000-95,000 base + bonus.', source: 'deloitte.com/careers', sourceCategory: 'C' },
    { company: 'Palantir', role: 'Forward Deployed Software Engineer', companyTier: 2, description: 'Location: Multiple US cities | Hybrid. Responsibilities: Deploy software for government clients, solve mission-critical problems. Requirements: BS in CS, strong coding skills. Compensation: $120,000-150,000 base + equity.', source: 'palantir.com/careers', sourceCategory: 'B' },
  ],
  'government & public sector': [
    { company: 'Booz Allen Hamilton', role: 'Government Analyst', companyTier: 1, description: 'Location: Washington DC | Hybrid. Responsibilities: Analyze government programs, prepare briefings. Requirements: Bachelor degree, 3.5+ GPA. Compensation: $75,000-90,000 base + bonus.', source: 'boozallen.com/careers', sourceCategory: 'C' },
    { company: 'Deloitte Government', role: 'Federal Consultant', companyTier: 1, description: 'Location: Washington DC | Hybrid. Responsibilities: Support federal agencies, process improvement. Requirements: Bachelor degree, US citizenship. Compensation: $80,000-95,000 base + bonus.', source: 'deloitte.com/careers', sourceCategory: 'C' },
    { company: 'Palantir', role: 'Forward Deployed Software Engineer', companyTier: 2, description: 'Location: Multiple US cities | Hybrid. Responsibilities: Deploy software for government clients. Requirements: BS in CS. Compensation: $120,000-150,000 base + equity.', source: 'palantir.com/careers', sourceCategory: 'B' },
  ],
  'sports & entertainment': [
    // Tier 1
    { company: 'Live Nation', role: 'Marketing Coordinator', companyTier: 1, description: "Location: Beverly Hills, CA | Hybrid. Responsibilities: Coordinate event marketing, manage social campaigns, track ticket sales. Requirements: Bachelor in Marketing. Compensation: $60,000-75,000 base + bonus.", source: 'livenation.com/careers', sourceCategory: 'C' },
    { company: 'Nike', role: 'Brand Marketing Associate', companyTier: 1, description: 'Location: Beaverton, OR | Hybrid. Responsibilities: Support brand campaigns, coordinate product launches, analyze market trends. Requirements: Bachelor in Marketing/Business. Compensation: $70,000-85,000 base + bonus.', source: 'jobs.nike.com', sourceCategory: 'C' },
    // Tier 2
    { company: 'ESPN', role: 'Content Associate', companyTier: 2, description: 'Location: Bristol, CT | Hybrid. Responsibilities: Support content production, manage social channels, coordinate with talent. Requirements: Bachelor in Communications/Journalism. Compensation: $55,000-70,000 base + bonus.', source: 'espncareers.com', sourceCategory: 'B' },
    { company: 'Overtime', role: 'Social Media Coordinator', companyTier: 2, description: 'Location: New York, NY | Hybrid. Responsibilities: Create social content, manage channels, analyze performance. Requirements: Bachelor in Marketing. Compensation: $55,000-70,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    // Tier 3
    { company: 'Buzzer', role: 'Growth Associate', companyTier: 3, description: 'Location: Remote-friendly | Series B. Team of 70. Responsibilities: User acquisition, partnership activation. Requirements: Bachelor in Marketing/Business. Compensation: $60,000-75,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Athlete Studio', role: 'Brand Operations Associate', companyTier: 3, description: 'Location: Los Angeles / Remote | Seed-stage. Team of 25. Responsibilities: Manage athlete partnerships, coordinate content. Requirements: Bachelor in Business/Marketing. Compensation: $55,000-70,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
  'media and entertainment': [
    // Tier 1
    { company: 'Netflix', role: 'Junior Content Designer', companyTier: 1, description: 'Location: Los Gatos, CA | Hybrid. Responsibilities: Design product features for 250M+ subscribers, create user journey maps, collaborate with engineering. Requirements: Bachelor in Design/UX, 1-2 years product design experience, Figma expertise. Compensation: $95,000-115,000 base + equity, premium health/dental/vision, unlimited PTO.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Disney', role: 'Content Coordinator', companyTier: 1, description: 'Location: Burbank, CA | Hybrid. Responsibilities: Manage editorial calendars for Disney+/Hulu/ESPN+, coordinate content rollout schedules, track deliverables. Requirements: Bachelor in Communications/Media, excellent writing skills, project management experience. Compensation: $70,000-80,000 base + bonus, Disney+ bundle, comprehensive benefits.', source: 'disney.com/careers', sourceCategory: 'C' },
    { company: 'Warner Bros Discovery', role: 'Social Media Coordinator', companyTier: 1, description: 'Location: New York, NY | Hybrid. Responsibilities: Manage social channels for HBO Max/CNN/DC, create engaging content, monitor community engagement. Requirements: Bachelor in Marketing/Communications, 1+ years social media experience. Compensation: $60,000-70,000 base + bonus, Max subscription, full benefits.', source: 'wbd.com/careers', sourceCategory: 'C' },
    // Tier 2
    { company: 'Spotify', role: 'UX Writer', companyTier: 2, description: 'Location: New York, NY | Remote-friendly. Responsibilities: Craft voice/tone for world\'s largest audio platform, write app copy and onboarding flows, partner with product designers. Requirements: 2+ years UX writing, portfolio of shipped digital products. Compensation: $100,000-120,000 base + equity, Spotify Premium Family, wellness stipend.', source: 'dribbble.com/jobs', sourceCategory: 'E', nichePlatform: 'dribbble' },
    { company: 'Hulu', role: 'Brand Designer', companyTier: 2, description: 'Location: Santa Monica, CA | Hybrid. Responsibilities: Create visual assets for Hulu brand campaigns, design marketing materials, maintain brand consistency. Requirements: Bachelor in Design, 2+ years brand design experience. Compensation: $85,000-100,000 base + bonus, Hulu subscription, professional development budget.', source: 'dribbble.com/jobs', sourceCategory: 'E', nichePlatform: 'dribbble' },
    { company: 'Vox Media', role: 'Editorial Associate', companyTier: 2, description: 'Location: Remote-friendly | Publisher behind The Verge, Vox, NY Mag. Responsibilities: Research, fact-checking, editorial coordination, audience analysis. Requirements: Bachelor in Journalism/Communications, strong writing skills. Compensation: $55,000-68,000 base + benefits.', source: 'voxmedia.com/careers', sourceCategory: 'B' },
    // Tier 3
    { company: 'BuzzFeed', role: 'Junior Content Strategist', companyTier: 3, description: 'Location: New York, NY | Hybrid. Responsibilities: Develop branded content campaigns, work with editorial on social-first strategies, analyze performance metrics. Requirements: Bachelor in Marketing/Communications, 1+ years experience. Compensation: $65,000-75,000 base + performance bonus.', source: 'workingnotworking.com', sourceCategory: 'E', nichePlatform: 'workingnotworking' },
    { company: 'Puck News', role: 'Operations Associate', companyTier: 3, description: 'Location: Remote-first | Series A media startup. Team of 40. Responsibilities: Operations support, subscriber analytics, editorial coordination. Requirements: Bachelor degree, analytical skills, startup mindset. Compensation: $60,000-70,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Morning Brew', role: 'Content Strategist', companyTier: 3, description: 'Location: Remote-friendly | Independent media brand with 4M+ subscribers. Responsibilities: Editorial planning, content strategy, audience growth. Requirements: Bachelor in Journalism/Marketing, 2+ years experience. Compensation: $60,000-75,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Substack', role: 'Product Designer', companyTier: 3, description: 'Location: Remote-first | Newsletter publishing platform. Team of 80. Responsibilities: Product design, content tools UX, design system contributions. Requirements: Bachelor in Design, 3+ years product design experience. Compensation: $120,000-150,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Workweek Media', role: 'Content Associate', companyTier: 3, description: 'Location: Remote-first | Creator-first B2B media startup. Team of 30. Responsibilities: Editorial writing, newsletter production, audience development. Requirements: Bachelor in Journalism/Communications, strong writing portfolio. Compensation: $55,000-65,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
  'media & entertainment': [
    { company: 'Netflix', role: 'Junior Content Designer', companyTier: 1, description: 'Location: Los Gatos, CA | Hybrid. Responsibilities: Design product features, create user journey maps, collaborate with engineering. Requirements: Bachelor in Design/UX, 1-2 years experience. Compensation: $95,000-115,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Disney', role: 'Content Coordinator', companyTier: 1, description: 'Location: Burbank, CA | Hybrid. Responsibilities: Manage editorial calendars, coordinate content rollout, track deliverables. Requirements: Bachelor in Communications/Media. Compensation: $70,000-80,000 base + bonus.', source: 'disney.com/careers', sourceCategory: 'C' },
    { company: 'Warner Bros Discovery', role: 'Social Media Coordinator', companyTier: 1, description: 'Location: New York, NY | Hybrid. Responsibilities: Manage social channels, create content, monitor engagement. Requirements: Bachelor in Marketing/Communications. Compensation: $60,000-70,000 base + bonus.', source: 'wbd.com/careers', sourceCategory: 'C' },
    { company: 'Spotify', role: 'UX Writer', companyTier: 2, description: 'Location: New York, NY | Remote-friendly. Responsibilities: Craft voice/tone, write app copy, partner with designers. Requirements: 2+ years UX writing. Compensation: $100,000-120,000 base + equity.', source: 'dribbble.com/jobs', sourceCategory: 'E', nichePlatform: 'dribbble' },
    { company: 'Hulu', role: 'Brand Designer', companyTier: 2, description: 'Location: Santa Monica, CA | Hybrid. Responsibilities: Create visual assets, design marketing materials. Requirements: Bachelor in Design, 2+ years experience. Compensation: $85,000-100,000 base + bonus.', source: 'dribbble.com/jobs', sourceCategory: 'E', nichePlatform: 'dribbble' },
    { company: 'Puck News', role: 'Operations Associate', companyTier: 3, description: 'Location: Remote-first | Series A. Team of 40. Responsibilities: Operations support, subscriber analytics, editorial coordination. Requirements: Bachelor degree. Compensation: $60,000-70,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Morning Brew', role: 'Content Strategist', companyTier: 3, description: 'Location: Remote-friendly | 4M+ subscribers. Responsibilities: Editorial planning, content strategy, audience growth. Requirements: Bachelor in Journalism/Marketing. Compensation: $60,000-75,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Substack', role: 'Product Designer', companyTier: 3, description: 'Location: Remote-first | Team of 80. Responsibilities: Product design, content tools UX. Requirements: Bachelor in Design, 3+ years experience. Compensation: $120,000-150,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Workweek Media', role: 'Content Associate', companyTier: 3, description: 'Location: Remote-first | Team of 30. Responsibilities: Editorial writing, newsletter production. Requirements: Bachelor in Journalism/Communications. Compensation: $55,000-65,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
  'content & ux design': [
    { company: 'Figma', role: 'Brand Designer', companyTier: 2, description: 'Location: San Francisco, CA | Hybrid. Responsibilities: Create brand assets, design marketing materials, maintain consistency. Requirements: 3+ years brand design. Compensation: $130,000-160,000 base + equity.', source: 'dribbble.com/jobs', sourceCategory: 'E', nichePlatform: 'dribbble' },
    { company: 'Mailchimp', role: 'UX Writer', companyTier: 2, description: 'Location: Remote-friendly (US). Responsibilities: Craft product copy, maintain voice/tone. Requirements: 3+ years UX writing. Compensation: $100,000-130,000 base + equity.', source: 'keyvalues.com', sourceCategory: 'E', nichePlatform: 'keyvalues' },
    { company: 'Superside', role: 'Junior Creative Strategist', companyTier: 2, description: 'Location: Remote-first. Responsibilities: Develop creative strategies, manage client projects. Requirements: 2+ years creative experience. Compensation: $70,000-90,000 base + equity.', source: 'workingnotworking.com', sourceCategory: 'E', nichePlatform: 'workingnotworking' },
    { company: 'Webflow', role: 'Junior Content Strategist', companyTier: 2, description: 'Location: Remote-friendly (US). Responsibilities: Content strategy, SEO, blog writing. Requirements: 2+ years content experience. Compensation: $75,000-95,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
    { company: 'Linear', role: 'Product Designer', companyTier: 3, description: 'Location: Remote-first | Team of 50. Responsibilities: Design product workflows, build design system. Requirements: 2+ years product design. Compensation: $140,000-170,000 base + equity.', source: 'keyvalues.com', sourceCategory: 'E', nichePlatform: 'keyvalues' },
    { company: 'Contra', role: 'Brand Designer', companyTier: 3, description: 'Location: Remote-first | Series B. Team of 60. Responsibilities: Visual identity, campaign assets. Requirements: 3+ years brand design. Compensation: $110,000-140,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
  'logistics': [
    { company: 'C.H. Robinson', role: 'Supply Chain Analyst', companyTier: 1, description: 'Location: Multiple US cities | Hybrid. Responsibilities: Analyze shipping data, optimize routes, coordinate with carriers. Requirements: Bachelor in Supply Chain/Business. Compensation: $65,000-80,000 base + bonus.', source: 'chrobinson.com/careers', sourceCategory: 'C' },
    { company: 'Arrive Logistics', role: 'Account Manager', companyTier: 2, description: 'Location: Multiple US cities | Hybrid. Responsibilities: Manage carrier relationships, negotiate rates, coordinate shipments. Requirements: Bachelor degree, sales skills. Compensation: $55,000-70,000 base + commission.', source: 'arrivelogistics.com/careers', sourceCategory: 'B' },
    { company: 'Samsara', role: 'Sales Development Rep', companyTier: 2, description: 'Location: Remote-friendly (US). Responsibilities: Generate leads, qualify prospects, support sales team. Requirements: Bachelor degree, communication skills. Compensation: $60,000-75,000 base + commission + equity.', source: 'samsara.com/careers', sourceCategory: 'B' },
    { company: 'Flexport', role: 'Operations Analyst', companyTier: 3, description: 'Location: Remote-friendly | Series E. Team of 2,000. Responsibilities: Manage freight operations, coordinate with carriers, optimize workflows. Requirements: Bachelor in Supply Chain/Business. Compensation: $70,000-85,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
  'transportation & logistics': [
    { company: 'C.H. Robinson', role: 'Supply Chain Analyst', companyTier: 1, description: 'Location: Multiple US cities | Hybrid. Responsibilities: Analyze shipping data, optimize routes. Requirements: Bachelor in Supply Chain/Business. Compensation: $65,000-80,000 base + bonus.', source: 'chrobinson.com/careers', sourceCategory: 'C' },
    { company: 'Arrive Logistics', role: 'Account Manager', companyTier: 2, description: 'Location: Multiple US cities | Hybrid. Responsibilities: Manage carrier relationships, negotiate rates. Requirements: Bachelor degree. Compensation: $55,000-70,000 base + commission.', source: 'arrivelogistics.com/careers', sourceCategory: 'B' },
    { company: 'Samsara', role: 'Sales Development Rep', companyTier: 2, description: 'Location: Remote-friendly (US). Responsibilities: Generate leads, qualify prospects. Requirements: Bachelor degree. Compensation: $60,000-75,000 base + commission + equity.', source: 'samsara.com/careers', sourceCategory: 'B' },
    { company: 'Flexport', role: 'Operations Analyst', companyTier: 3, description: 'Location: Remote-friendly | Series E. Team of 2,000. Responsibilities: Manage freight operations, coordinate with carriers. Requirements: Bachelor in Supply Chain/Business. Compensation: $70,000-85,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
  ],
};

// Universal fallback — broad, recognizable companies that span any industry
const FALLBACK_JOBS = [
  { company: 'Deloitte', role: 'Business Analyst', companyTier: 1, description: 'Location: Multiple US cities | Hybrid. Responsibilities: Client analysis, process improvement, technology advisory. Requirements: Bachelor in Business/Engineering. Compensation: $75,000-90,000 base + bonus.', source: 'deloitte.com/careers', sourceCategory: 'C' },
  { company: 'JPMorgan', role: 'Operations Analyst', companyTier: 1, description: 'Location: Multiple US cities | Hybrid. Responsibilities: Support operations teams, analyze data, prepare reports. Requirements: Bachelor in Finance/Business. Compensation: $80,000-95,000 base + bonus.', source: 'jpmorgan.com/careers', sourceCategory: 'C' },
  { company: 'Google', role: 'Associate Product Manager', companyTier: 1, description: 'Location: Mountain View, CA | Hybrid. Responsibilities: Define product requirements, work with engineering, analyze user data. Requirements: BS in CS/Business. Compensation: $110,000-130,000 base + equity.', source: 'careers.google.com', sourceCategory: 'C' },
  { company: 'Salesforce', role: 'Sales Development Representative', companyTier: 1, description: 'Location: Multiple US cities | Hybrid. Responsibilities: Generate leads, qualify prospects, support sales team. Requirements: Bachelor degree. Compensation: $65,000-80,000 base + commission.', source: 'salesforce.com/careers', sourceCategory: 'C' },
  { company: 'Procter & Gamble', role: 'Brand Management Associate', companyTier: 1, description: 'Location: Cincinnati, OH | Hybrid. Responsibilities: Lead product launches, manage brand P&L. Requirements: Bachelor in Business/Marketing. Compensation: $90,000-100,000 base + bonus.', source: 'pg.com/careers', sourceCategory: 'C' },
  { company: 'Amazon', role: 'Operations Manager (New Grad)', companyTier: 1, description: 'Location: Multiple US cities. Responsibilities: Manage warehouse operations, lead teams, optimize processes. Requirements: Bachelor degree, leadership skills. Compensation: $70,000-85,000 base + sign-on.', source: 'amazon.jobs', sourceCategory: 'C' },
  { company: 'Microsoft', role: 'Business Program Manager', companyTier: 1, description: 'Location: Redmond, WA | Hybrid. Responsibilities: Coordinate cross-functional projects, track deliverables. Requirements: Bachelor in Business/Engineering. Compensation: $95,000-115,000 base + stock.', source: 'careers.microsoft.com', sourceCategory: 'C' },
  { company: 'HubSpot', role: 'Sales Development Representative', companyTier: 2, description: 'Location: Remote-friendly (US). Responsibilities: Generate leads, qualify prospects. Requirements: Bachelor degree. Compensation: $60,000-75,000 base + commission + equity.', source: 'hubspot.com/careers', sourceCategory: 'B' },
  { company: 'HubSpot', role: 'Customer Success Associate', companyTier: 2, description: 'Location: Remote-friendly (US). Responsibilities: Onboard customers, drive product adoption, gather feedback. Requirements: Bachelor degree. Compensation: $70,000-85,000 base + equity.', source: 'hubspot.com/careers', sourceCategory: 'B' },
  { company: 'Ramp', role: 'Business Operations Analyst', companyTier: 3, description: 'Location: New York, NY | Hybrid. Series D. Responsibilities: Strategic planning, financial analysis. Requirements: Top university. Compensation: $100,000-120,000 base + equity.', source: 'ramp.com/careers', sourceCategory: 'B' },
  { company: 'Lattice', role: 'Customer Success Manager', companyTier: 3, description: 'Location: Remote-first. Responsibilities: Manage client relationships, drive adoption. Requirements: 2+ years CS experience. Compensation: $75,000-95,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
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
    
    // CRITICAL: Prioritize explicit payload parameters over DB to bypass race conditions
    // When frontend passes explicit_target_role, use it immediately instead of DB lookup
    let targetIndustries = (
      body.target_industries
      || body.explicit_target_industries
      || user.career_goals?.target_industries
      || user.industries_interested
      || user.industries_of_interest
      || []
    ).map(i => i.toLowerCase());

    // If no industries set, use a default to show some opportunities
    if (!targetIndustries.length) {
      targetIndustries = ['tech']; // Default fallback
    }

    const targetRole = body.explicit_target_role || body.target_role || user.career_goals?.role || user.target_role || '';
    const companySizePref = body.explicit_company_size_preference || body.company_size_preference || user.career_goals?.company_size_preference || 'all';
    // Companies the user has already seen — exclude them from this batch
    const seenCompanies = new Set(
      (body.seen_companies || []).map(c => normalizeCompanyName(c))
    );
    // target_positions is an array of role-type selections from onboarding (e.g. ["UX Design", "Content Strategy"])
    const targetPositions = (
      body.target_positions
      || user.career_goals?.target_positions
      || user.target_positions
      || []
    ).map(p => p.toLowerCase());

    const schoolCode = (user.school_code || '').toLowerCase();
    const schoolName = (user.school_name || user.school || user.university || '').toLowerCase();
    
    // Get user's location preferences — payload.target_location takes priority (sent by OrganizedFeeds)
    const rawLocation = body.target_location || user.career_goals?.location_preference || user.location_preference || user.preferred_location || user.location || '';
    const userLocation = rawLocation.toLowerCase();
    // "Remote" / "Anywhere" preference is an intent, not a city — don't try to match it against city names.
    const remoteIntent = /^(remote|anywhere|flexible|open to relocation)$/i.test(rawLocation.trim());
    // Extract city: "New York, NY" → "new york". Blank for remote-intent so the city filter doesn't reject everything.
    const userCity = remoteIntent ? '' : (rawLocation ? rawLocation.split(',')[0].trim().toLowerCase() : (user.location_city || user.city || '').toLowerCase());
    const userState = (user.location_state || user.state || '').toLowerCase();
    const relocationOk = user.relocation_ok === true || remoteIntent;
    const userSchoolCode = (user.school_code || '').toLowerCase();
    const userSchool = (user.school_name || user.school || user.university || '').toLowerCase();

    // ─── Step 1: Build the job pool from target industries ──────────────────
    const SENIOR_FILTER = /\b(senior|sr\.|lead|principal|director|manager|head of|vp |vice president|staff engineer|architect|managing partner)\b/i;

    // Sibling industry groups — pull related pools to keep the rotation pool large enough
    const INDUSTRY_SIBLINGS = {
      'finance': ['finance & insurance', 'consulting'],
      'finance & insurance': ['finance', 'consulting'],
      'tech': ['technology', 'technology, information & media'],
      'technology': ['tech', 'technology, information & media'],
      'technology, information & media': ['tech', 'technology'],
      'media and entertainment': ['media & entertainment'],
      'media & entertainment': ['media and entertainment'],
      'creative': ['advertising & pr', 'content & ux design'],
      'advertising & pr': ['creative', 'marketing'],
      'marketing': ['advertising & pr'],
      'healthcare': ['healthcare & pharmaceuticals'],
      'healthcare & pharmaceuticals': ['healthcare'],
      'education': ['education & training'],
      'education & training': ['education'],
      'consulting': ['professional services'],
      'professional services': ['consulting'],
      'government': ['government & public sector'],
      'government & public sector': ['government'],
      'transportation & logistics': ['logistics'],
      'logistics': ['transportation & logistics'],
      'real estate': ['construction & agriculture'],
      'real_estate': ['real estate', 'construction & agriculture'],
      'construction & agriculture': ['real_estate', 'real estate'],
      'law': ['professional services', 'consulting'],
      'legal': ['law', 'professional services'],
      'sales': ['advertising & pr', 'marketing'],
      'accounting': ['finance', 'finance & insurance'],
      'retail': ['retail & consumer goods'],
      'retail & consumer goods': ['retail', 'marketing'],
      'sports': ['sports & entertainment', 'media and entertainment'],
      'sports & entertainment': ['sports', 'media and entertainment'],
      'entertainment': ['media and entertainment', 'media & entertainment'],
      'ux design': ['content & ux design', 'creative'],
      'content strategy': ['content & ux design', 'creative', 'advertising & pr'],
      'creative direction': ['creative', 'advertising & pr'],
      'entrepreneurship': ['entrepreneur'],
      'entrepreneur': ['tech', 'consulting'],
    };

    // Stream A: curated static pool — primary + sibling industries for a larger rotation pool
    let jobPool = [];
    const industriesToPull = new Set(targetIndustries);
    for (const ind of targetIndustries) {
      (INDUSTRY_SIBLINGS[ind] || []).forEach(s => industriesToPull.add(s));
    }
    for (const ind of industriesToPull) {
      const pool = JOB_POOL[ind] || [];
      jobPool.push(...pool);
    }

    // Apply company size filter to static pool
    if (companySizePref && companySizePref !== 'all') {
      const tierMap = { startup: [3], midmarket: [2], enterprise: [1] };
      const allowedTiers = tierMap[companySizePref];
      if (allowedTiers) {
        const sizeFiltered = jobPool.filter(j => allowedTiers.includes(j.companyTier || 1));
        if (sizeFiltered.length >= 5) {
          jobPool = sizeFiltered;
        } else if (sizeFiltered.length > 0) {
          // Not enough of the preferred size — expand to adjacent tiers (startup→mid, mid→startup+enterprise)
          const expandedTiers = companySizePref === 'startup' ? [3, 2] : companySizePref === 'enterprise' ? [1, 2] : [2, 3, 1];
          const expanded = jobPool.filter(j => expandedTiers.includes(j.companyTier || 1));
          jobPool = expanded.length >= 5 ? expanded : jobPool;
        }
        // else: keep all — no matches at all for preferred size
      }
    }

    // Stream B: live web results via getLiveJobMatchesFn — appended after static entries
    try {
      const liveRes = await Promise.race([
        base44.asServiceRole.functions.invoke('getLiveJobMatchesFn', {
          career_goals: {
            role: targetRole || (targetIndustries[0] ? `${targetIndustries[0]} analyst` : 'analyst'),
            industries: targetIndustries.map(i => i.charAt(0).toUpperCase() + i.slice(1)),
            locations: userLocation ? [userLocation] : [],
            company_size_preference: companySizePref === 'startup' ? ['startup'] : companySizePref === 'midmarket' ? ['mid'] : companySizePref === 'enterprise' ? ['large'] : ['large', 'mid', 'startup'],
          },
        }),
        new Promise((_, r) => setTimeout(() => r(new Error('live_timeout')), 15000)),
      ]);

      const liveCompanies = liveRes?.companies || [];
      console.log(`[getPersonalizedNetworkCarousel] 🌐 Live results: ${liveCompanies.length} companies`);

      // Convert live company objects → job-pool-compatible entries
      const liveJobEntries = liveCompanies.map(c => ({
        company: c.name,
        role: targetRole || `${targetIndustries[0] || 'Business'} Analyst`,
        description: c.hiring_description || `${c.name} is actively hiring — ${c.hiring_signal === 'hot' ? 'aggressively recruiting new grads right now' : 'selectively hiring for entry-level roles'}.`,
        source: `${c.name.toLowerCase().replace(/\s+/g, '')}.com/careers`,
        sourceCategory: 'B',
        companyTier: c.size === 'startup' ? 3 : c.size === 'mid' ? 2 : 1,
        isLiveResult: true,
      }));

      // Deduplicate against static pool using composite key: company+role (lowercase)
      const staticKeys = new Set(jobPool.map(j => `${j.company.toLowerCase()}||${j.role.toLowerCase()}`));
      const deduped = liveJobEntries.filter(j => {
        const key = `${j.company.toLowerCase()}||${j.role.toLowerCase()}`;
        // Also check company-only match to avoid same company with slightly different role wording
        const companyKey = j.company.toLowerCase().replace(/[^a-z0-9]/g, '');
        const staticCompanyMatch = [...staticKeys].some(sk => {
          const skCompany = sk.split('||')[0].replace(/[^a-z0-9]/g, '');
          return skCompany.length >= 4 && companyKey.length >= 4 &&
            (skCompany.includes(companyKey) || companyKey.includes(skCompany));
        });
        return !staticCompanyMatch;
      });

      // Append live results after static (static entries stay at the top for premium UX)
      jobPool = [...jobPool, ...deduped];
      console.log(`[getPersonalizedNetworkCarousel] Hybrid pool: ${jobPool.length} jobs (${jobPool.length - deduped.length} static + ${deduped.length} live)`);
    } catch (liveErr) {
      console.warn(`[getPersonalizedNetworkCarousel] Live fetch skipped (${liveErr.message}) — using static pool only`);
    }

    // Filter out senior roles
    jobPool = jobPool.filter(j => !SENIOR_FILTER.test(j.role));

    // ─── Daily rotation + manual refresh shuffle ─────────────────────────────
    // refresh_seed increments on each manual "New Batch" click, guaranteeing
    // a different shuffle even within the same day.
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const refreshSeed = body.refresh_seed || 0;
    const seedStr = `${user.id}${today}${refreshSeed}`;
    let seedHash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      seedHash = ((seedHash << 5) - seedHash) + seedStr.charCodeAt(i);
      seedHash |= 0;
    }
    const seededRandom = (n) => {
      seedHash = ((seedHash << 5) - seedHash) + n;
      seedHash |= 0;
      return Math.abs(seedHash) / 2147483647;
    };
    // Fisher-Yates shuffle with seeded random
    for (let i = jobPool.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(i) * (i + 1));
      [jobPool[i], jobPool[j]] = [jobPool[j], jobPool[i]];
    }
    
    // Location gate — also reused by the post-filter padding steps below so injected
    // cross-tier and fallback jobs can't bypass it.
    const US_CITIES = [
      'austin', 'san francisco', 'seattle', 'chicago', 'los angeles', 'boston', 'atlanta',
      'denver', 'dallas', 'houston', 'miami', 'phoenix', 'portland', 'san diego', 'minneapolis',
      'detroit', 'philadelphia', 'pittsburgh', 'charlotte', 'nashville', 'raleigh', 'salt lake city',
      'las vegas', 'tampa', 'orlando', 'san jose', 'san antonio', 'columbus', 'kansas city',
      'indianapolis', 'new york', 'brooklyn', 'manhattan', 'menlo park', 'cupertino', 'redwood city',
      'mountain view', 'palo alto', 'burbank', 'santa monica', 'los gatos', 'beverly hills',
      'malvern', 'cincinnati', 'beaverton', 'bristol', 'richmond', 'sacramento', 'baltimore',
      'st. louis', 'cleveland', 'memphis', 'bellevue', 'herndon', 'dc', 'washington dc',
      'washington, dc', 'pittsburgh, pa', 'new york, ny', 'gainesville',
    ];
    // Fallback city for companies whose static-pool descriptions omit a "Location:" line.
    // Without this, single-line entries like "Productivity startup scaling globally" pass
    // the gate (no city to find in description) and leak through to non-HQ users.
    // Only include companies whose roles are genuinely HQ-centric — multi-city giants
    // (Google, Microsoft, Amazon, etc.) are intentionally left out so their generic
    // "we hire across X teams" entries still show everywhere.
    const COMPANY_HQ_CITY = {
      'notion': 'san francisco',
      'airtable': 'san francisco',
      'datadog': 'new york',
      'retool': 'san francisco',
      'descript': 'san francisco',
      'loom': 'san francisco',
      'resend': 'san francisco',
      'vercel': 'san francisco',
      'figma': 'san francisco',
      'linear': 'san francisco',
      'lattice': 'san francisco',
      'ramp': 'new york',
      'meta': 'menlo park',
      'apple': 'cupertino',
      'netflix': 'los gatos',
    };
    const passesLocation = (j) => {
      const desc = (j.description || '').toLowerCase();
      const isRemote = desc.includes('remote') || desc.includes('work from home') || desc.includes('remote-friendly') || desc.includes('remote-first');
      const isMultiCity = desc.includes('multiple us cities') || desc.includes('multiple cities');

      // Identify the post's city. Body text wins; if silent, fall back to
      // the company's HQ (covers entries like Notion "Productivity startup
      // scaling globally" with no Location: line).
      let mentionedCity = US_CITIES.find(c => desc.includes(c));
      if (!mentionedCity) {
        const companyKey = (j.company || '').toLowerCase().trim();
        mentionedCity = COMPANY_HQ_CITY[companyKey];
      }

      // Mode 1 — user picked a SPECIFIC city: strict match. The post must
      // name that city (in body text or via HQ map). Remote-only,
      // multi-city, and ambiguous posts ALL reject. "Twilio · Remote-first
      // USA" is not a Miami job; if a Miami user wants remote jobs they
      // set their preference to "Remote" / "Anywhere" and take Mode 2.
      if (userCity) {
        if (!mentionedCity) return false;
        return mentionedCity.includes(userCity) || userCity.includes(mentionedCity);
      }

      // Mode 2 — user picked "Remote" / "Anywhere": keep remote-friendly
      // or multi-city posts; reject single-city ones.
      if (remoteIntent) return isRemote || isMultiCity;

      // Mode 3 — no location preference: nothing to gate on.
      return true;
    };

    // Apply the gate unconditionally — if userCity is empty and not remote intent,
    // passesLocation returns true for everything (no city to gate on), so this is safe.
    // Previously gating only when userCity was truthy allowed the entire filter to be
    // skipped when a user had no location set, letting SF-HQ static entries leak through.
    jobPool = jobPool.filter(passesLocation);

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

    // Role filter: soft-filter by role title keywords only — never wipe the pool.
    // Only apply if result keeps at least 5 entries, otherwise skip to preserve variety.
    // IMPORTANT: If the role filter doesn't match (e.g. "Business Analyst" against a tech pool),
    // we still use the full industry pool but override the displayed role title with the user's target role.
    let roleOverride = null;
    if (roleKeywords.length > 0 || positionKeywords.length > 0) {
      const softKeywords = [...new Set([...roleKeywords, ...positionKeywords])];
      const roleFiltered = jobPool.filter(j => {
        const roleLower = j.role.toLowerCase();
        const descLower = j.description.toLowerCase();
        return softKeywords.some(kw => roleLower.includes(kw) || descLower.includes(kw));
      });
      if (roleFiltered.length >= 5) {
        jobPool = roleFiltered;
      } else {
        // Not enough exact matches — keep full industry pool but override role display
        // so the user sees their actual target role, not the static pool's role names
        roleOverride = targetRole || null;
      }
    }

    // Deduplicate by company+role (allow same company with different roles)
    const seen = new Set();
    jobPool = jobPool.filter(j => {
      const key = `${j.company}||${j.role}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Exclude companies the user has already seen (only when they have seen jobs)
    // If exclusion would wipe the pool entirely, reset and show everything (pool exhausted)
    if (seenCompanies.size > 0) {
      const excluded = jobPool.filter(j => !seenCompanies.has(normalizeCompanyName(j.company)));
      if (excluded.length >= 3) jobPool = excluded;
      // else: pool exhausted — serve full pool so user always sees something
    }

    // ─── Balanced Feed Mix: Enforce ≥30% mid-market/startup (Tier 2/3) ─────
    // Prevents the feed from being all enterprise brands
    const tier1 = jobPool.filter(j => (j.companyTier || 1) === 1);
    const tier23 = jobPool.filter(j => (j.companyTier || 1) >= 2);
    const totalPool = jobPool.length;
    const tier23Ratio = totalPool > 0 ? tier23.length / totalPool : 0;
    if (tier23Ratio < 0.3 && tier23.length < 3) {
      // Pull in cross-industry Tier 2/3 starters to pad the feed
      const crossTier23 = [
        { company: 'Twilio', role: 'Customer Success Manager', companyTier: 2, description: 'Location: Remote-first (US). Responsibilities: Onboard enterprise clients, drive product adoption, manage renewals. Requirements: 2+ years CS experience, strong communication. Compensation: $90,000-110,000 base + equity.', source: 'twilio.com/en-us/company/jobs', sourceCategory: 'B' },
        { company: 'HubSpot', role: 'Business Operations Analyst', companyTier: 2, description: 'Location: Remote-friendly (US). Responsibilities: Support revenue operations, analyze business metrics, improve cross-functional processes. Requirements: Bachelor degree, SQL skills. Compensation: $80,000-100,000 base + equity.', source: 'hubspot.com/careers', sourceCategory: 'B' },
        { company: 'Lattice', role: 'Customer Success Manager', companyTier: 3, description: 'Location: Remote-first (US). Responsibilities: Manage client relationships, drive platform adoption, gather product feedback. Requirements: 2+ years CS experience. Compensation: $75,000-95,000 base + equity.', source: 'wellfound.com/jobs', sourceCategory: 'E', nichePlatform: 'wellfound' },
      ].filter(j => !SENIOR_FILTER.test(j.role));
      for (const j of crossTier23) {
        if (!passesLocation(j)) continue;
        const key = `${j.company}||${j.role}`;
        if (!seen.has(key)) { seen.add(key); jobPool.push(j); }
        if (jobPool.filter(x => (x.companyTier || 1) >= 2).length / jobPool.length >= 0.3) break;
      }
    }

    // If pool is still too small (< 5), pad it with fallback jobs
    // This guarantees users with niche or unmapped industries always see something
    if (jobPool.length < 5) {
      const seenPoolKeys = new Set(jobPool.map(j => normalizeCompanyName(j.company)));
      const fallbackFiltered = FALLBACK_JOBS.filter(j =>
        !SENIOR_FILTER.test(j.role) && !seenPoolKeys.has(normalizeCompanyName(j.company)) && passesLocation(j)
      );
      jobPool = [...jobPool, ...fallbackFiltered];
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
        linkedin_url: getField(u, 'linkedin_url', 'linkedin', 'linkedin_profile', 'linkedinUrl') || null,
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
          role: roleOverride || job.role,
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
          role: roleOverride || job.role,
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
          role: roleOverride || job.role,
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

    // The shuffle (Fisher-Yates above) is already seeded by user.id + today + refreshSeed,
    // so every "New Batch" click produces a genuinely different order.
    // Return the full shuffled+filtered pool — no slicing here.
    // The frontend renders whatever it receives, so the user always sees fresh results.
    console.log(`[getPersonalizedNetworkCarousel] seed=${refreshSeed} | Insiders: ${priorityInsiders.length} | Discoveries: ${targetedDiscoveries.length}`);

    return Response.json({
      success: true,
      priorityInsiders,
      targetedDiscoveries,
      wasFiltered: targetIndustries.length > 0,
      targetIndustries,
    });

  } catch (error) {
    console.error('[getPersonalizedNetworkCarousel]', error.message);
    return Response.json({ error: error.message, cards: [] }, { status: 500 });
  }
});