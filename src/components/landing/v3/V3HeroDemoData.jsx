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
    promptTemplate: (school) => `I'm a marketing major at ${school} and want to work at a top brand like Nike or Spotify.`,
    companies: [
      { name: 'Nike', tag: 'Brand Marketing', asterisk: true },
      { name: 'Spotify', tag: 'Music/Tech' },
      { name: 'Ogilvy', tag: 'Creative Agency' },
      { name: 'PepsiCo', tag: 'CPG' },
      { name: 'Lululemon', tag: 'DTC Brand' },
    ],
    hasAsterisk: true,
    alumniRoles: [
      { company: 'Nike', role: 'Brand Marketing Coordinator', year: "'23" },
      { company: 'Spotify', role: 'Marketing Associate', year: "'22" },
      { company: 'Ogilvy', role: 'Account Coordinator', year: "'21" },
    ],
    outreach: {
      company: 'Nike',
      from: 'Olivia',
      bodyTemplate: (school, alumniName) =>
        `Hi ${alumniName.split(' ')[0]},\n\nI'm a marketing major at ${school} and brand strategy is exactly where I want to build my career — I noticed you're at Nike and would love to hear how you got started there.\n\nWould you have 15 minutes for a quick call? I'd really appreciate any advice.\n\nThanks so much,\nOlivia`,
    },
  },
  {
    promptTemplate: (school) => `I'm studying data science at ${school} — what companies should I target?`,
    companies: [
      { name: 'Stripe', tag: 'Fintech' },
      { name: 'Palantir', tag: 'Data/Gov' },
      { name: 'Databricks', tag: 'Data Platform' },
      { name: 'Airbnb', tag: 'Travel/Tech' },
      { name: 'Capital One', tag: 'Finance/ML' },
    ],
    hasAsterisk: false,
    alumniRoles: [
      { company: 'Stripe', role: 'Data Analyst', year: "'23" },
      { company: 'Palantir', role: 'Forward Deployed Engineer', year: "'22" },
      { company: 'Airbnb', role: 'Data Scientist', year: "'21" },
    ],
    outreach: {
      company: 'Stripe',
      from: 'Marcus',
      bodyTemplate: (school, alumniName) =>
        `Hi ${alumniName.split(' ')[0]},\n\nI'm a data science student at ${school} and fintech is really exciting to me — I saw you're at Stripe and would love to learn how you got your foot in the door.\n\nWould you have 15 minutes for a quick call?\n\nReally appreciate it,\nMarcus`,
    },
  },
  {
    promptTemplate: (school) => `I'm pre-med at ${school} but thinking about switching to healthcare consulting.`,
    companies: [
      { name: 'ZS Associates', tag: 'Pharma Consulting', asterisk: true },
      { name: 'IQVIA', tag: 'Health Data' },
      { name: 'McKinsey Health', tag: 'Strategy' },
      { name: 'Optum', tag: 'UnitedHealth' },
      { name: 'Veeva Systems', tag: 'Health Cloud' },
    ],
    hasAsterisk: true,
    alumniRoles: [
      { company: 'ZS Associates', role: 'Associate Consultant', year: "'22" },
      { company: 'IQVIA', role: 'Analyst', year: "'23" },
      { company: 'Optum', role: 'Strategy Associate', year: "'21" },
    ],
    outreach: {
      company: 'ZS Associates',
      from: 'Sophie',
      bodyTemplate: (school, alumniName) =>
        `Hi ${alumniName.split(' ')[0]},\n\nI'm at ${school} with a pre-med background but exploring healthcare consulting — I saw you're at ZS Associates and that transition is exactly what I'm considering.\n\nWould you have time for a quick 15-minute call? I'd love to hear your perspective.\n\nThanks so much,\nSophie`,
    },
  },
  {
    promptTemplate: (_school) => `I've sent 100 resumes and heard nothing back. What should I do next?`,
    companies: [
      { name: 'HubSpot', tag: 'SaaS' },
      { name: 'Shopify', tag: 'E-commerce' },
      { name: 'Adobe', tag: 'Creative/Tech' },
      { name: 'Zillow', tag: 'Real Estate' },
      { name: 'Notion', tag: 'Productivity' },
    ],
    hasAsterisk: false,
    alumniRoles: [
      { company: 'HubSpot', role: 'Business Development Rep', year: "'22" },
      { company: 'Shopify', role: 'Partnerships Associate', year: "'23" },
      { company: 'Adobe', role: 'Customer Success Associate', year: "'21" },
    ],
    outreach: {
      company: 'HubSpot',
      from: 'Alex',
      bodyTemplate: (school, alumniName) =>
        `Hi ${alumniName.split(' ')[0]},\n\nI'm a ${school} student trying to break into SaaS and noticed you're at HubSpot. I've been applying broadly but want to be more strategic.\n\nWould you have a few minutes to share how you landed your role? Any advice would mean a lot.\n\nBest,\nAlex`,
    },
  },
  {
    promptTemplate: (school) => `I'm at ${school} studying communications — is there a path into tech?`,
    companies: [
      { name: 'Canva', tag: 'Design/Tech' },
      { name: 'LinkedIn', tag: 'Social/B2B' },
      { name: 'Figma', tag: 'Design Tools' },
      { name: 'Twilio', tag: 'Cloud Comms' },
      { name: 'Reddit', tag: 'Social Platform' },
    ],
    hasAsterisk: false,
    alumniRoles: [
      { company: 'Canva', role: 'Content Strategist', year: "'23" },
      { company: 'LinkedIn', role: 'Program Coordinator', year: "'22" },
      { company: 'Figma', role: 'Community Associate', year: "'21" },
    ],
    outreach: {
      company: 'Canva',
      from: 'Emma',
      bodyTemplate: (school, alumniName) =>
        `Hi ${alumniName.split(' ')[0]},\n\nI'm a communications student at ${school} and love the intersection of storytelling and tech — I saw you're at Canva and that's exactly the kind of company I'm targeting.\n\nWould you be open to a quick chat about how you made the jump? I'd love any tips.\n\nThanks,\nEmma`,
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