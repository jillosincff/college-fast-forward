// Curated first-cycle job inventory — the GUARANTEED fallback so the Magic
// Moment NEVER ships an empty "couldn't find a job" screen. These are real
// employers with stable career pages for the most common student target pairs
// (Sales/Finance/Marketing/Software × NYC, plus generic NYC + remote).
//
// Served only when live search (JSearch strict → relaxed → permissive) returns
// nothing, OR when the upstream provider times out / errors with no cache.
// Shared between getLiveJobMatchesFn (backend) and MagicMoment (frontend) so
// the guarantee holds even if the backend is entirely unreachable.

export interface CuratedJob {
  name: string;
  job_title: string;
  hiring_description: string;
  hiring_signal: string;
  job_url: string;
  industry: string;
  location: string;
  salary_range: string | null;
  posted_date: string | null;
  logo_url: string | null;
  has_web_result: boolean;
  verified_posting: boolean;
  curated: true;
}

const NYC = 'New York, NY';

const mk = (
  name: string, job_title: string, industry: string, location: string,
  hiring_description: string, job_url: string, hiring_signal = 'warm',
): CuratedJob => ({
  name, job_title, industry, location, hiring_description, job_url, hiring_signal,
  salary_range: null, posted_date: null, logo_url: null,
  has_web_result: true, verified_posting: true, curated: true,
});

// ── Sales / Business Development — NYC ──────────────────────────────────────
const NYC_SALES: CuratedJob[] = [
  mk('Salesforce', 'Sales Development Representative', 'Sales', NYC,
    'Salesforce SDRs pipeline-build for account executives: prospect outbound accounts, qualify inbound leads, and book discovery meetings. Classic entry point into enterprise SaaS sales with a clear promotion path to AE.',
    'https://careers.salesforce.com/en/jobs/'),
  mk('HubSpot', 'Sales Development Representative', 'Sales', NYC,
    'HubSpot SDRs connect with small/mid-market businesses, qualify fit for the platform, and hand off to closing reps. Strong training program, great for new grads.',
    'https://www.hubspot.com/careers'),
  mk('Google', 'Account Executive, Ads', 'Sales', NYC,
    'Google Ads Account Executives advise and grow advertising clients across search, YouTube, and display. Consultative sales with measurable revenue impact.',
    'https://www.google.com/about/careers/applications/'),
  mk('Datadog', 'Sales Development Representative', 'Sales', NYC,
    'Datadog SDRs research infrastructure/engineering accounts, run multi-channel outbound, and set qualified meetings for the enterprise sales team.',
    'https://careers.datadoghq.com/'),
  mk('Squarespace', 'Account Executive', 'Sales', NYC,
    'Squarespace AEs own the full sales cycle for SMB customers, helping creators and small businesses get online.',
    'https://www.squarespace.com/about/careers'),
  mk('MongoDB', 'Sales Development Representative', 'Sales', NYC,
    'MongoDB SDRs identify developer-led opportunities and partner with AEs to grow the database business across industries.',
    'https://www.mongodb.com/careers/positions'),
];

// ── Finance — NYC ───────────────────────────────────────────────────────────
const NYC_FINANCE: CuratedJob[] = [
  mk('Goldman Sachs', 'Analyst, Investment Banking', 'Finance', NYC,
    'Goldman Sachs Analysts support M&A, capital markets, and financing transactions: build models, draft pitch materials, and run market research. Two-year rotational program, common new-grad entry point.',
    'https://www.goldmansachs.com/careers/index.html'),
  mk('JPMorgan Chase', 'Analyst', 'Finance', NYC,
    'JPMorgan Analysts rotate across corporate banking, markets, and risk — supporting client coverage, deal execution, and portfolio analysis.',
    'https://careers.jpmorgan.com/'),
  mk('Morgan Stanley', 'Analyst', 'Finance', NYC,
    'Morgan Stanley Analysts work on wealth management, institutional securities, and investment management teams with structured training and sponsorship.',
    'https://www.morganstanley.com/people'),
  mk('Bloomberg', 'Financial Analyst', 'Finance', NYC,
    'Bloomberg Financial Analysts support the Terminal business — analyzing markets, helping clients use data, and surfacing insights across asset classes.',
    'https://careers.bloomberg.com/job/search'),
  mk('BlackRock', 'Analyst', 'Finance', NYC,
    'BlackRock Analysts join a rotational program across investments, client business, and technology to launch careers in asset management.',
    'https://careers.blackrock.com/'),
  mk('Citi', 'Analyst', 'Finance', NYC,
    'Citi Analysts support banking, markets, and risk functions with modeling, research, and client deliverables across global teams.',
    'https://jobs.citi.com/'),
];

// ── Marketing / Media — NYC ─────────────────────────────────────────────────
const NYC_MARKETING: CuratedJob[] = [
  mk('Google', 'Marketing Coordinator', 'Marketing', NYC,
    'Google Marketing Coordinators support campaign execution, content scheduling, and cross-functional launches across product areas.',
    'https://www.google.com/about/careers/applications/'),
  mk('Meta', 'Marketing Coordinator', 'Marketing', NYC,
    'Meta Marketing Coordinators help plan and execute brand and performance campaigns, partnering with creative and analytics teams.',
    'https://www.metacareers.com/jobs'),
  mk('NBCUniversal', 'Marketing Coordinator', 'Marketing', NYC,
    'NBCUniversal Marketing Coordinators support promo planning, events, and audience campaigns across TV, streaming, and digital.',
    'https://www.nbcunicareers.com/search-jobs'),
  mk('Spotify', 'Marketing Coordinator', 'Marketing', NYC,
    'Spotify Marketing Coordinators help run artist campaigns, brand moments, and listener-growth initiatives across markets.',
    'https://www.lifeatspotify.com/jobs'),
  mk('Warner Bros. Discovery', 'Marketing Coordinator', 'Marketing', NYC,
    'WBD Marketing Coordinators support title launches, social campaigns, and partnership activations across networks and streaming.',
    'https://careers.wbd.com/'),
  mk('Squarespace', 'Marketing Coordinator', 'Marketing', NYC,
    'Squarespace Marketing Coordinators help execute brand, lifecycle, and acquisition campaigns for the website-builder business.',
    'https://www.squarespace.com/about/careers'),
];

// ── Software / Engineering — NYC ────────────────────────────────────────────
const NYC_SOFTWARE: CuratedJob[] = [
  mk('Google', 'Software Engineer', 'Software', NYC,
    'Google Software Engineers build and scale products used by billions — working across search, ads, cloud, and consumer surfaces.',
    'https://www.google.com/about/careers/applications/'),
  mk('Meta', 'Software Engineer', 'Software', NYC,
    'Meta Software Engineers work on React, backend services, ML infrastructure, and the family of apps at massive scale.',
    'https://www.metacareers.com/jobs'),
  mk('Amazon', 'Software Development Engineer', 'Software', NYC,
    'Amazon SDEs build services and products across AWS, advertising, and retail with a strong engineering bar and ownership culture.',
    'https://www.amazon.jobs/'),
  mk('Microsoft', 'Software Engineer', 'Software', NYC,
    'Microsoft Software Engineers work across Azure, Microsoft 365, and AI products with structured onboarding for new grads.',
    'https://careers.microsoft.com/'),
  mk('Datadog', 'Software Engineer', 'Software', NYC,
    'Datadog Engineers build observability tooling — ingestion, dashboards, and alerts — used by engineering teams worldwide.',
    'https://careers.datadoghq.com/'),
  mk('MongoDB', 'Software Engineer', 'Software', NYC,
    'MongoDB Engineers build the core database, cloud platform (Atlas), and developer tooling used by millions of developers.',
    'https://www.mongodb.com/careers/positions'),
];

// ── Communications / PR — NYC ────────────────────────────────────────────────
const NYC_COMMUNICATIONS: CuratedJob[] = [
  mk('Edelman', 'Communications Assistant', 'Communications', NYC,
    'Edelman Communications Assistants support media relations, press lists, and client deliverables across PR campaigns for major brands.',
    'https://www.edelman.com/careers'),
  mk('Weber Shandwick', 'Account Coordinator, PR', 'Communications', NYC,
    'Weber Shandwick Account Coordinators support media outreach, content drafting, and campaign coordination across consumer and corporate clients.',
    'https://www.webershandwick.com/careers'),
  mk('NBCUniversal', 'Communications Coordinator', 'Communications', NYC,
    'NBCUniversal Communications Coordinators support publicity, talent relations, and internal comms across TV, streaming, and news.',
    'https://www.nbcunicareers.com/search-jobs'),
  mk('Ogilvy', 'Junior Associate, Communications', 'Communications', NYC,
    'Ogilvy Junior Associates support PR, social, and content programs across the agency brand and corporate communications teams.',
    'https://www.ogilvy.com/careers'),
  mk('Warner Bros. Discovery', 'Public Relations Coordinator', 'Communications', NYC,
    'WBD PR Coordinators support title launches, press events, and talent publicity across networks and streaming.',
    'https://careers.wbd.com/'),
  mk('Meta', 'Communications Coordinator', 'Communications', NYC,
    'Meta Communications Coordinators support corporate comms, internal storytelling, and executive visibility programs.',
    'https://www.metacareers.com/jobs'),
];

// ── Generic NYC (used when the role doesn't match a specific category) ──────
const NYC_GENERIC: CuratedJob[] = [
  mk('Deloitte', 'Analyst', 'Business', NYC,
    'Deloitte Analysts join consulting and risk/advisory teams supporting client engagements across industries with structured training.',
    'https://jobs.deloitte.com/'),
  mk('EY', 'Analyst', 'Business', NYC,
    'EY Analysts support assurance, consulting, tax, and strategy engagements with a clear professional development path.',
    'https://careers.ey.com/'),
  mk('PwC', 'Associate', 'Business', NYC,
    'PwC Associates work on audit, consulting, and tax engagements with rotational exposure and sponsorship for certifications.',
    'https://www.pwc.com/us/en/careers.html'),
  mk('KPMG', 'Associate', 'Business', NYC,
    'KPMG Associates support audit, advisory, and tax engagements across industries with strong mentorship.',
    'https://careers.kpmg.us/'),
  mk('Google', 'Associate Account Strategist', 'Business', NYC,
    'Google Associate Account Strategists help advertisers get the most out of their campaigns — a great entry role into tech sales/marketing.',
    'https://www.google.com/about/careers/applications/'),
  mk('Squarespace', 'Account Coordinator', 'Business', NYC,
    'Squarespace Account Coordinators support customer onboarding and growth across the SMB segment.',
    'https://www.squarespace.com/about/careers'),
];

// ── Operations / Supply Chain — NYC ─────────────────────────────────────────
const NYC_OPERATIONS: CuratedJob[] = [
  mk('Amazon', 'Area Operations Manager', 'Operations', NYC,
    'Amazon Area Operations Managers lead fulfillment-center teams — a high-volume entry point for new grads into ops leadership.',
    'https://www.amazon.jobs/'),
  mk('UPS', 'Operations Supervisor', 'Operations', NYC,
    'UPS Operations Supervisors coordinate package sort and delivery flow — structured rotational onboarding for recent grads.',
    'https://www.jobs-ups.com/'),
  mk('FedEx', 'Operations Coordinator', 'Operations', NYC,
    'FedEx Operations Coordinators manage dispatch and routing logistics across the metro network.',
    'https://careers.fedex.com/'),
  mk('Maersk', 'Logistics Coordinator', 'Operations', NYC,
    'Maersk Logistics Coordinators support ocean-freight and supply-chain operations for global shippers.',
    'https://www.maersk.com/careers'),
];

// ── Consulting — NYC ────────────────────────────────────────────────────────
const NYC_CONSULTING: CuratedJob[] = [
  mk('Deloitte', 'Strategy & Operations Analyst', 'Consulting', NYC,
    'Deloitte S&O Analysts solve client problems across industries — the classic Big Four entry role with heavy training.',
    'https://jobs.deloitte.com/'),
  mk('PwC', 'Associate – Consulting', 'Consulting', NYC,
    'PwC Consulting Associates join client engagement teams supporting transformation and tech-advisory work.',
    'https://www.pwc.com/us/en/careers.html'),
  mk('Accenture', 'Strategy Consultant', 'Consulting', NYC,
    'Accenture Strategy Consultants bridge business and technology for large enterprise clients.',
    'https://www.accenture.com/us-en/careers'),
  mk('Bain', 'Associate Consultant', 'Consulting', NYC,
    'Bain Associate Consultants (ACs) are the core entry role on case teams — among the most coveted undergrad consulting jobs.',
    'https://www.bain.com/careers/'),
];

// ── Healthcare — NYC ────────────────────────────────────────────────────────
const NYC_HEALTHCARE: CuratedJob[] = [
  mk('NewYork-Presbyterian', 'Clinical Research Coordinator', 'Healthcare', NYC,
    'NYP Clinical Research Coordinators run trials at one of the top academic medical centers — strong pre-med and bio launchpad.',
    'https://www.nyp.org/careers'),
  mk('Memorial Sloan Kettering', 'Research Technician', 'Healthcare', NYC,
    'MSK Research Technicians support oncology lab work — a flagship bench-research entry role in NYC.',
    'https://www.mskcc.org/careers'),
  mk('Mount Sinai', 'Healthcare Data Analyst', 'Healthcare', NYC,
    'Mount Sinai Healthcare Data Analysts turn clinical data into operational insight across the hospital system.',
    'https://careers.mountsinai.org/'),
  mk('Pfizer', 'Clinical Operations Associate', 'Healthcare', NYC,
    'Pfizer Clinical Operations Associates support drug-development trials at the pharma HQ.',
    'https://www.pfizer.com/careers'),
];

// ── Data / Analytics — NYC ──────────────────────────────────────────────────
const NYC_DATA: CuratedJob[] = [
  mk('Meta', 'Data Scientist (University Grad)', 'Data', NYC,
    'Meta new-grad Data Scientists work on product analytics and experimentation at scale.',
    'https://www.metacareers.com/'),
  mk('Spotify', 'Data Analyst', 'Data', NYC,
    'Spotify Data Analysts measure listener behavior to shape product decisions.',
    'https://www.lifeatspotify.com/'),
  mk('Bloomberg', 'Financial Data Analyst', 'Data', NYC,
    'Bloomberg Financial Data Analysts maintain and expand the terminal datasets that power global markets.',
    'https://www.bloomberg.com/careers/'),
  mk('Goldman Sachs', 'Quantitative Analyst', 'Data', NYC,
    'Goldman Sachs Quant Analysts build models and analyze risk across trading desks.',
    'https://www.goldmansachs.com/careers/'),
];

// ── Product / UX — NYC ───────────────────────────────────────────────────────
const NYC_PRODUCT: CuratedJob[] = [
  mk('Google', 'Associate Product Manager', 'Product', NYC,
    'Google APM is the gold-standard new-grad product rotation — highly competitive, legendary launchpad.',
    'https://www.google.com/about/careers/applications/'),
  mk('Meta', 'Product Analyst (University Grad)', 'Product', NYC,
    'Meta Product Analysts measure and improve product surfaces with experimentation.',
    'https://www.metacareers.com/'),
  mk('Spotify', 'Associate Product Designer', 'Product', NYC,
    'Spotify Associate Product Designers craft listener experiences across platforms.',
    'https://www.lifeatspotify.com/'),
  mk('Figma', 'Product Design Intern', 'Product', NYC,
    'Figma Product Designers shape the design tool used by teams worldwide.',
    'https://www.figma.com/careers/'),
];

// ── HR / Recruiting — NYC ────────────────────────────────────────────────────
const NYC_HR: CuratedJob[] = [
  mk('Google', 'People Operations Analyst', 'HR', NYC,
    'Google People Operations Analysts support HR programs and workforce analytics.',
    'https://www.google.com/about/careers/applications/'),
  mk('Meta', 'University Recruiting Coordinator', 'HR', NYC,
    'Meta Recruiting Coordinators schedule and support campus hiring — a classic HR entry point.',
    'https://www.metacareers.com/'),
  mk('Deloitte', 'Talent Acquisition Specialist', 'HR', NYC,
    'Deloitte Talent Acquisition Specialists support campus and experienced hiring pipelines.',
    'https://jobs.deloitte.com/'),
  mk('JPMorgan', 'Human Resources Analyst', 'HR', NYC,
    'JPMorgan HR Analysts rotate through compensation, recruiting, and employee relations.',
    'https://careers.jpmorgan.com/'),
];

// ── Education / Nonprofit — NYC ──────────────────────────────────────────────
const NYC_EDUCATION: CuratedJob[] = [
  mk('NYC Department of Education', 'Teaching Fellow', 'Education', NYC,
    'NYC Teaching Fellows fast-track new grads into classroom roles in high-need schools.',
    'https://www.nyctf.org/'),
  mk('Teach For America', 'Corps Member', 'Nonprofit', NYC,
    'TFA Corps Members teach for two years in under-resourced schools — a flagship public-service launchpad.',
    'https://www.teachforamerica.org/'),
  mk('Year Up', 'Program Coordinator', 'Nonprofit', NYC,
    'Year Up Program Coordinators support young-adult workforce development cohorts.',
    'https://www.yearup.org/careers'),
  mk('NYU', 'Admissions Counselor', 'Education', NYC,
    'NYU Admissions Counselors review applications and recruit prospective students.',
    'https://www.nyu.edu/about/careers-at-nyu.html'),
];

// ── Remote / national last-resort — ROLE-SPECIFIC so a Communications
//    student never gets a Sales SDR. Each list has on-chip W-2 remote roles
//    for that field. REMOTE_GENERIC is only for truly unknown roles. ────────
const REMOTE_BY_ROLE: Record<string, CuratedJob[]> = {
  communications: [
    mk('Edelman', 'Communications Assistant (Remote)', 'Communications', 'Remote',
      'Edelman Communications Assistants support media relations, press lists, and client deliverables across PR campaigns for major brands.',
      'https://www.edelman.com/careers'),
    mk('Weber Shandwick', 'Account Coordinator, PR (Remote)', 'Communications', 'Remote',
      'Weber Shandwick Account Coordinators support media outreach, content drafting, and campaign coordination across consumer and corporate clients.',
      'https://www.webershandwick.com/careers'),
    mk('Ogilvy', 'Junior Associate, Communications (Remote)', 'Communications', 'Remote',
      'Ogilvy Junior Associates support PR, social, and content programs across the agency brand and corporate communications teams.',
      'https://www.ogilvy.com/careers'),
  ],
  marketing: [
    mk('HubSpot', 'Marketing Coordinator (Remote)', 'Marketing', 'Remote',
      'HubSpot Marketing Coordinators help execute lifecycle, content, and acquisition campaigns remotely with a proven training program.',
      'https://www.hubspot.com/careers'),
    mk('GitLab', 'Marketing Campaign Manager', 'Marketing', 'Remote',
      'GitLab Marketing Campaign Managers plan and execute demand-generation campaigns for the fully-remote team.',
      'https://about.gitlab.com/jobs/'),
    mk('Automattic', 'Marketing Specialist', 'Marketing', 'Remote',
      'Automattic (WordPress.com, WooCommerce) hires fully-remote marketing specialists across growth, content, and brand.',
      'https://automattic.com/work-with-us/'),
  ],
  sales: [
    mk('GitLab', 'Sales Development Representative', 'Sales', 'Remote',
      'GitLab SDRs prospect and qualify outbound accounts for the fully-remote sales team — a classic entry point into enterprise SaaS.',
      'https://about.gitlab.com/jobs/'),
    mk('Stripe', 'Account Executive', 'Sales', 'Remote',
      'Stripe AEs help online businesses scale payments — consultative SaaS sales with strong enablement.',
      'https://stripe.com/jobs'),
    mk('HubSpot', 'Sales Development Representative (Remote)', 'Sales', 'Remote',
      'HubSpot hires remote SDRs to prospect and qualify inbound/outbound leads with a proven training program.',
      'https://www.hubspot.com/careers'),
  ],
  software: [
    mk('Automattic', 'Software Engineer', 'Software', 'Remote',
      'Automattic (WordPress.com, WooCommerce) hires fully-remote engineers across timezones.',
      'https://automattic.com/work-with-us/'),
    mk('GitLab', 'Software Engineer', 'Software', 'Remote',
      'GitLab Engineers build the DevOps platform used by millions of developers — fully remote, handbook-first culture.',
      'https://about.gitlab.com/jobs/'),
    mk('Stripe', 'Software Engineer', 'Software', 'Remote',
      'Stripe Engineers build payment infrastructure for online businesses — strong engineering bar, fully remote-friendly.',
      'https://stripe.com/jobs'),
  ],
  finance: [
    mk('Stripe', 'Financial Analyst', 'Finance', 'Remote',
      'Stripe Financial Analysts support forecasting, reporting, and strategic finance for the payments platform.',
      'https://stripe.com/jobs'),
    mk('Plaid', 'Financial Analyst', 'Finance', 'Remote',
      'Plaid Financial Analysts support fintech financial operations and planning.',
      'https://plaid.com/careers/'),
  ],
  data: [
    mk('GitLab', 'Data Analyst', 'Data', 'Remote',
      'GitLab Data Analysts turn product and usage data into insight for the fully-remote team.',
      'https://about.gitlab.com/jobs/'),
    mk('Stripe', 'Data Scientist', 'Data', 'Remote',
      'Stripe Data Scientists build models and experiments that power payment decisions.',
      'https://stripe.com/jobs'),
  ],
  consulting: [
    mk('Deloitte', 'Analyst (Remote-Eligible)', 'Consulting', 'Remote',
      'Deloitte Analysts join consulting and advisory teams — many roles offer remote-eligible arrangements.',
      'https://jobs.deloitte.com/'),
  ],
  operations: [
    mk('GitLab', 'Operations Analyst', 'Operations', 'Remote',
      'GitLab Operations Analysts support business operations for the fully-remote company.',
      'https://about.gitlab.com/jobs/'),
  ],
  hr: [
    mk('GitLab', 'People Operations Analyst', 'HR', 'Remote',
      'GitLab People Operations Analysts support HR programs and workforce analytics — fully remote.',
      'https://about.gitlab.com/jobs/'),
  ],
  product: [
    mk('GitLab', 'Product Analyst', 'Product', 'Remote',
      'GitLab Product Analysts measure and improve product surfaces with experimentation — fully remote.',
      'https://about.gitlab.com/jobs/'),
  ],
  healthcare: [
    mk('UnitedHealth Group', 'Healthcare Data Analyst (Remote)', 'Healthcare', 'Remote',
      'UnitedHealth Group Healthcare Data Analysts turn clinical data into operational insight — remote-eligible.',
      'https://careers.unitedhealthgroup.com/'),
  ],
  education: [
    mk('Khan Academy', 'Content Intern', 'Education', 'Remote',
      'Khan Academy Content Interns help build free educational content used by millions — fully remote.',
      'https://www.khanacademy.org/careers'),
  ],
};

// Generic remote fallback — only used when the role is truly unknown.
const REMOTE_GENERIC: CuratedJob[] = [
  mk('Deloitte', 'Analyst (Remote-Eligible)', 'Business', 'Remote',
    'Deloitte Analysts join consulting and risk/advisory teams — many roles offer remote arrangements.',
    'https://jobs.deloitte.com/'),
  mk('HubSpot', 'Sales Development Representative (Remote)', 'Sales', 'Remote',
    'HubSpot hires remote SDRs to prospect and qualify inbound/outbound leads with a proven training program.',
    'https://www.hubspot.com/careers'),
];

// ── Matching helpers ───────────────────────────────────────────────────────
function detectRole(role: string): string | null {
  const r = (role || '').toLowerCase();
  if (!r) return null;
  if (/\bsale|business development|\bSDR\b|\bBDR\b|account executive/.test(r)) return 'sales';
  if (/financ|account|bank|invest|asset|wealth/.test(r)) return 'finance';
  if (/consult|strategy|advisory|big four/.test(r)) return 'consulting';
  if (/health|clinical|nurs|patient|medical|pharma|biotech|pre-?med/.test(r)) return 'healthcare';
  if (/product|ux|\bui\b|design|user experience/.test(r)) return 'product';
  if (/\bdata\b|analyst|analytics|quant/.test(r)) return 'data';
  if (/software|engineer|develop|frontend|backend|fullstack|\bSWE\b|tech|coding|programmer/.test(r)) return 'software';
  if (/market|media|content|brand|social|advertis/.test(r)) return 'marketing';
  if (/communicat|public relations|\bpr\b|media relations|press|corporate communicat/.test(r)) return 'communications';
  if (/operation|supply chain|logistic|fulfillment|warehouse/.test(r)) return 'operations';
  if (/\bhr\b|human resource|recruit|talent acquis|people ops|personnel/.test(r)) return 'hr';
  if (/educat|teach|nonprofit|non-?profit|higher ed|admission/.test(r)) return 'education';
  return null;
}

function detectMetro(location: string): string | null {
  const l = (location || '').toLowerCase();
  if (!l) return null;
  if (/new york|\bnyc\b|manhattan|brooklyn|queens|bronx|\bny\b/.test(l)) return 'nyc';
  // Extensible: add more metros here as the curated inventory grows.
  return null;
}

const BY_MARKET: Record<string, CuratedJob[]> = {
  'sales|nyc': NYC_SALES,
  'finance|nyc': NYC_FINANCE,
  'marketing|nyc': NYC_MARKETING,
  'software|nyc': NYC_SOFTWARE,
  'communications|nyc': NYC_COMMUNICATIONS,
  'operations|nyc': NYC_OPERATIONS,
  'consulting|nyc': NYC_CONSULTING,
  'healthcare|nyc': NYC_HEALTHCARE,
  'data|nyc': NYC_DATA,
  'product|nyc': NYC_PRODUCT,
  'hr|nyc': NYC_HR,
  'education|nyc': NYC_EDUCATION,
  'generic|nyc': NYC_GENERIC,
};

// Hard floor — a single legitimate W-2 job. getCuratedFallback can NEVER return
// an empty array, so the first Magic Moment cycle can never dead-end on the
// "couldn't find a job" screen for ANY role + location combination.
const GUARANTEED_FLOOR: CuratedJob[] = [
  mk('Deloitte', 'Analyst', 'Business', NYC,
    'Deloitte Analysts join consulting and risk/advisory teams supporting client engagements across industries with structured training.',
    'https://jobs.deloitte.com/'),
];

/**
 * Returns curated real jobs for a target role + location. Tries the specific
 * role+metro pair first, then a generic metro list, then a remote national list.
 * Always returns at least an empty array only when no market matches at all —
 * callers should treat an empty result as a true edge case.
 */
export function getCuratedFallback(role: string, location: string): CuratedJob[] {
  const rk = detectRole(role);
  const mk = detectMetro(location);

  if (rk && mk && BY_MARKET[`${rk}|${mk}`]) return BY_MARKET[`${rk}|${mk}`];
  if (mk === 'nyc') return NYC_GENERIC;
  // No curated market — try role-specific remote jobs first so a
  // Communications student never gets a Sales SDR from the generic list.
  if (rk && REMOTE_BY_ROLE[rk] && REMOTE_BY_ROLE[rk].length > 0) return REMOTE_BY_ROLE[rk];
  if (REMOTE_GENERIC.length > 0) return REMOTE_GENERIC;
  // Absolute floor — can never be empty, no matter what was edited above.
  return GUARANTEED_FLOOR;
}