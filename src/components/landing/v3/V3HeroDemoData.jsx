// Pre-scripted demo scenarios for the hero product demo
// School name is injected dynamically via the school selector

const DEMO_SCENARIOS = [
  {
    prompt: "I'm a junior interested in consulting and want to work at Deloitte.",
    companies: [
      { name: 'Deloitte', tag: 'Big 4' },
      { name: 'Accenture', tag: 'Strategy' },
      { name: 'Bain & Company', tag: 'MBB' },
      { name: 'EY-Parthenon', tag: 'Advisory' },
      { name: 'KPMG', tag: 'Consulting' },
    ],
    alumni: [
      { name: 'Sarah Chen', year: "'22", company: 'Deloitte', role: 'Consulting Analyst' },
      { name: 'Michael Ross', year: "'21", company: 'Accenture', role: 'Strategy Associate' },
      { name: 'David Klein', year: "'23", company: 'EY-Parthenon', role: 'Senior Analyst' },
    ],
    outreach: {
      to: 'Sarah',
      toFull: 'Sarah Chen',
      company: 'Deloitte',
      from: 'Olivia',
      bodyTemplate: (school) =>
        `Hi Sarah,\n\nI'm a junior at ${school} studying business and exploring consulting — I noticed you're at Deloitte and would love to hear how you got started.\n\nWould you have 15 minutes for a quick call? I'd really appreciate any advice on breaking in.\n\nThanks so much,\nOlivia`,
    },
  },
  {
    prompt: "I'm a marketing major and want to work at Nike or Spotify.",
    companies: [
      { name: 'Nike', tag: 'Sportswear' },
      { name: 'Spotify', tag: 'Music/Tech' },
      { name: 'Adidas', tag: 'Sportswear' },
      { name: 'Ogilvy', tag: 'Agency' },
      { name: 'VaynerMedia', tag: 'Digital' },
    ],
    alumni: [
      { name: 'Jessica Torres', year: "'21", company: 'Nike', role: 'Brand Marketing Coordinator' },
      { name: 'Ryan Patel', year: "'22", company: 'Spotify', role: 'Growth Marketing Associate' },
      { name: 'Amanda Liu', year: "'20", company: 'Ogilvy', role: 'Account Executive' },
    ],
    outreach: {
      to: 'Jessica',
      toFull: 'Jessica Torres',
      company: 'Nike',
      from: 'Marcus',
      bodyTemplate: (school) =>
        `Hi Jessica,\n\nI'm a marketing major at ${school} and saw you're doing brand marketing at Nike — that's exactly the space I'm trying to break into.\n\nWould you be open to a brief chat? I'd love to hear what the day-to-day looks like and how you landed the role.\n\nReally appreciate it,\nMarcus`,
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
    alumni: [
      { name: 'Kevin Nguyen', year: "'22", company: 'JP Morgan', role: 'Investment Banking Analyst' },
      { name: 'Rachel Adams', year: "'21", company: 'Raymond James', role: 'Equity Research Associate' },
      { name: 'Chris Hernandez', year: "'23", company: 'Goldman Sachs', role: 'Operations Analyst' },
    ],
    outreach: {
      to: 'Kevin',
      toFull: 'Kevin Nguyen',
      company: 'JP Morgan',
      from: 'Sophie',
      bodyTemplate: (school) =>
        `Hi Kevin,\n\nI'm a finance major at ${school} and still figuring out which area of finance to focus on. I saw you're at JP Morgan and would love to hear how you decided on investment banking.\n\nWould you have time for a quick 15-minute call?\n\nThanks so much,\nSophie`,
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
    alumni: [
      { name: 'Taylor Brooks', year: "'22", company: 'HubSpot', role: 'Business Development Rep' },
      { name: 'Jordan Lee', year: "'21", company: 'Salesforce', role: 'Account Executive' },
      { name: 'Maya Singh', year: "'23", company: 'Adobe', role: 'Customer Success Associate' },
    ],
    outreach: {
      to: 'Taylor',
      toFull: 'Taylor Brooks',
      company: 'HubSpot',
      from: 'Alex',
      bodyTemplate: (school) =>
        `Hi Taylor,\n\nI'm a ${school} student trying to break into SaaS and noticed you're at HubSpot. I've been applying broadly but want to be more strategic.\n\nWould you have a few minutes to share how you landed your role? Any advice would mean a lot.\n\nBest,\nAlex`,
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
    alumni: [
      { name: 'Brandon Park', year: "'22", company: 'Salesforce', role: 'SDR' },
      { name: 'Mia Gonzalez', year: "'21", company: 'Datadog', role: 'Account Executive' },
      { name: 'Jake Williams', year: "'23", company: 'Gong', role: 'Business Development Rep' },
    ],
    outreach: {
      to: 'Brandon',
      toFull: 'Brandon Park',
      company: 'Salesforce',
      from: 'Emma',
      bodyTemplate: (school) =>
        `Hi Brandon,\n\nI'm at ${school} and really interested in getting into tech sales — I saw you're an SDR at Salesforce and that's exactly the kind of role I'm targeting.\n\nWould you be open to a quick chat about how you broke in? I'd love any tips.\n\nThanks,\nEmma`,
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