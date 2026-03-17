// Pre-scripted demo scenarios for the hero product demo
// School name is injected dynamically via the school selector

// Pool of realistic, diverse alumni names — rotated randomly per session
const ALUMNI_NAME_POOL = [
  'Sarah Chen', 'Michael Ross', 'David Klein', 'Priya Patel', 'Daniel Green',
  'Alex Martinez', 'Jordan Blake', 'Emily Carter', 'Ryan Goldberg', 'Hannah Lee',
  'Kevin Shah', 'Lauren Brooks', 'Marcus Rivera', 'Nicole Tran', 'Chris Walker',
  'Samantha Park', 'Jason Liu', 'Olivia Hughes', 'Tyler Moreno', 'Rachel Adams',
  'Brandon Kim', 'Mia Gonzalez', 'Jake Williams', 'Sophie Nguyen', 'Ethan Cole',
  'Isabella Reed', 'Nathan Foster', 'Ava Sullivan', 'Derek Huang', 'Maya Singh',
];

// Shuffle helper (Fisher-Yates)
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Get N unique random names from the pool
export function getRandomAlumniNames(count = 3) {
  return shuffle(ALUMNI_NAME_POOL).slice(0, count);
}

const DEMO_SCENARIOS = [
  {
    prompt: "I'm a junior interested in consulting and want to work at Deloitte.",
    companies: [
      { name: 'Deloitte', tag: 'Big 4', asterisk: true },
      { name: 'Accenture', tag: 'Strategy' },
      { name: 'Bain & Company', tag: 'MBB' },
      { name: 'EY-Parthenon', tag: 'Advisory' },
      { name: 'KPMG', tag: 'Consulting' },
    ],
    hasAsterisk: true,
    alumniRoles: [
      { company: 'Deloitte', role: 'Consulting Analyst', year: "'22" },
      { company: 'Accenture', role: 'Strategy Associate', year: "'21" },
      { company: 'EY-Parthenon', role: 'Senior Analyst', year: "'23" },
    ],
    outreach: {
      company: 'Deloitte',
      from: 'Olivia',
      bodyTemplate: (school, alumniName) =>
        `Hi ${alumniName.split(' ')[0]},\n\nI'm a junior at ${school} studying business and exploring consulting — I noticed you're at Deloitte and would love to hear how you got started.\n\nWould you have 15 minutes for a quick call? I'd really appreciate any advice on breaking in.\n\nThanks so much,\nOlivia`,
    },
  },
  {
    prompt: "I'm a marketing major and want to work at Nike or Spotify.",
    companies: [
      { name: 'Nike', tag: 'Sportswear', asterisk: true },
      { name: 'Spotify', tag: 'Music/Tech', asterisk: true },
      { name: 'Adidas', tag: 'Sportswear' },
      { name: 'Ogilvy', tag: 'Agency' },
      { name: 'VaynerMedia', tag: 'Digital' },
    ],
    hasAsterisk: true,
    alumniRoles: [
      { company: 'Nike', role: 'Brand Marketing Coordinator', year: "'21" },
      { company: 'Spotify', role: 'Growth Marketing Associate', year: "'22" },
      { company: 'Ogilvy', role: 'Account Executive', year: "'20" },
    ],
    outreach: {
      company: 'Nike',
      from: 'Marcus',
      bodyTemplate: (school, alumniName) =>
        `Hi ${alumniName.split(' ')[0]},\n\nI'm a marketing major at ${school} and saw you're doing brand marketing at Nike — that's exactly the space I'm trying to break into.\n\nWould you be open to a brief chat? I'd love to hear what the day-to-day looks like and how you landed the role.\n\nReally appreciate it,\nMarcus`,
    },
  },
  {
    prompt: "I'm studying finance and don't know which companies to target.",
    companies: [
      { name: 'JP Morgan', tag: 'Investment Banking' },
      { name: 'Goldman Sachs', tag: 'Finance' },
      { name: 'Raymond James', tag: 'Wealth Mgmt' },
      { name: 'Citadel', tag: 'Hedge Fund' },
      { name: 'BlackRock', tag: 'Asset Mgmt' },
    ],
    hasAsterisk: false,
    alumniRoles: [
      { company: 'JP Morgan', role: 'Investment Banking Analyst', year: "'22" },
      { company: 'Raymond James', role: 'Equity Research Associate', year: "'21" },
      { company: 'Goldman Sachs', role: 'Operations Analyst', year: "'23" },
    ],
    outreach: {
      company: 'JP Morgan',
      from: 'Sophie',
      bodyTemplate: (school, alumniName) =>
        `Hi ${alumniName.split(' ')[0]},\n\nI'm a finance major at ${school} and still figuring out which area of finance to focus on. I saw you're at JP Morgan and would love to hear how you decided on investment banking.\n\nWould you have time for a quick 15-minute call?\n\nThanks so much,\nSophie`,
    },
  },
  {
    prompt: "I've sent 100 resumes and heard nothing back. What should I do next?",
    companies: [
      { name: 'HubSpot', tag: 'SaaS' },
      { name: 'Salesforce', tag: 'Enterprise' },
      { name: 'Adobe', tag: 'Creative/Tech' },
      { name: 'Mailchimp', tag: 'Marketing Tech' },
      { name: 'Notion', tag: 'Productivity' },
    ],
    hasAsterisk: false,
    alumniRoles: [
      { company: 'HubSpot', role: 'Business Development Rep', year: "'22" },
      { company: 'Salesforce', role: 'Account Executive', year: "'21" },
      { company: 'Adobe', role: 'Customer Success Associate', year: "'23" },
    ],
    outreach: {
      company: 'HubSpot',
      from: 'Alex',
      bodyTemplate: (school, alumniName) =>
        `Hi ${alumniName.split(' ')[0]},\n\nI'm a ${school} student trying to break into SaaS and noticed you're at HubSpot. I've been applying broadly but want to be more strategic.\n\nWould you have a few minutes to share how you landed your role? Any advice would mean a lot.\n\nBest,\nAlex`,
    },
  },
  {
    prompt: "I want to break into tech sales but don't know where to start.",
    companies: [
      { name: 'Salesforce', tag: 'CRM' },
      { name: 'Datadog', tag: 'Monitoring' },
      { name: 'Snowflake', tag: 'Data Cloud' },
      { name: 'Gong', tag: 'Revenue Intel' },
      { name: 'ZoomInfo', tag: 'Sales Intel' },
    ],
    hasAsterisk: false,
    alumniRoles: [
      { company: 'Salesforce', role: 'SDR', year: "'22" },
      { company: 'Datadog', role: 'Account Executive', year: "'21" },
      { company: 'Gong', role: 'Business Development Rep', year: "'23" },
    ],
    outreach: {
      company: 'Salesforce',
      from: 'Emma',
      bodyTemplate: (school, alumniName) =>
        `Hi ${alumniName.split(' ')[0]},\n\nI'm at ${school} and really interested in getting into tech sales — I saw you're an SDR at Salesforce and that's exactly the kind of role I'm targeting.\n\nWould you be open to a quick chat about how you broke in? I'd love any tips.\n\nThanks,\nEmma`,
    },
  },
];

export const SCHOOLS = [
  'University of Florida',
  'University of Michigan',
  'UCF',
  'Tulane University',
  'USC',
  'Penn State',
  'University of Miami',
  'Ohio State University',
  'University of Georgia',
  'University of Texas at Austin',
  'University of Wisconsin',
  'Boston University',
  'NYU',
  'Vanderbilt University',
  'Clemson University',
];

// Short name for alumni badge display
export function getSchoolShort(school) {
  const map = {
    'University of Florida': 'UF',
    'University of Michigan': 'UMich',
    'UCF': 'UCF',
    'Tulane University': 'Tulane',
    'USC': 'USC',
    'Penn State': 'PSU',
    'University of Miami': 'Miami',
    'Ohio State University': 'OSU',
    'University of Georgia': 'UGA',
    'University of Texas at Austin': 'UT',
    'University of Wisconsin': 'UW',
    'Boston University': 'BU',
    'NYU': 'NYU',
    'Vanderbilt University': 'Vandy',
    'Clemson University': 'Clemson',
  };
  return map[school] || school.split(' ').map(w => w[0]).join('');
}

export default DEMO_SCENARIOS;