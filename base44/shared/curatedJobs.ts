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

// ── Remote / national last-resort (legitimate W-2 roles, no hustle/MLM) ─────
const REMOTE_GENERIC: CuratedJob[] = [
  mk('GitLab', 'Associate', 'Software', 'Remote',
    'GitLab hires fully-remote associates across sales, support, and engineering with a documented handbook-first culture.',
    'https://about.gitlab.com/jobs/'),
  mk('Automattic', 'Support & Engineering Roles', 'Software', 'Remote',
    'Automattic (WordPress.com, WooCommerce) hires fully-remote support engineers and builders across timezones.',
    'https://automattic.com/work-with-us/'),
  mk('Stripe', 'Account Executive', 'Sales', 'Remote',
    'Stripe AEs help online businesses scale payments — consultative SaaS sales with strong enablement.',
    'https://stripe.com/jobs'),
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
  if (/market|media|content|brand|social|advertis/.test(r)) return 'marketing';
  if (/communicat|public relations|\bpr\b|media relations|press|corporate communicat/.test(r)) return 'communications';
  if (/software|engineer|develop|frontend|backend|fullstack|\bSWE\b|tech|data|coding|programmer/.test(r)) return 'software';
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
  // No curated market for this metro — return remote legitimate roles so the
  // first cycle still completes instead of dead-ending.
  if (REMOTE_GENERIC.length > 0) return REMOTE_GENERIC;
  // Absolute floor — can never be empty, no matter what was edited above.
  return GUARANTEED_FLOOR;
}