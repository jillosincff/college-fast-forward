// School-specific demo scenarios for the hero product demo
// Each school has its own scenario pool — different prompts, companies, alumni, outreach

const ALUMNI_NAME_POOL = [
  'Sarah Chen', 'Michael Ross', 'David Klein', 'Priya Patel', 'Daniel Green',
  'Alex Martinez', 'Jordan Blake', 'Emily Carter', 'Ryan Goldberg', 'Hannah Lee',
  'Kevin Shah', 'Lauren Brooks', 'Marcus Rivera', 'Nicole Tran', 'Chris Walker',
  'Samantha Park', 'Jason Liu', 'Olivia Hughes', 'Tyler Moreno', 'Rachel Adams',
  'Brandon Kim', 'Mia Gonzalez', 'Jake Williams', 'Sophie Nguyen', 'Ethan Cole',
  'Isabella Reed', 'Nathan Foster', 'Ava Sullivan', 'Derek Huang', 'Maya Singh',
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getRandomAlumniNames(count = 3) {
  return shuffle(ALUMNI_NAME_POOL).slice(0, count);
}

// ── School-specific scenario pools ──────────────────────

const SCHOOL_SCENARIOS = {
  'University of Florida': [
    {
      prompt: "I'm a marketing major at UF and want to work at a top brand like Nike or Spotify.",
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
        company: 'Nike', from: 'Olivia',
        bodyTemplate: (alumniName) =>
          `Hi ${alumniName.split(' ')[0]},\n\nI'm a marketing major at UF and brand strategy is exactly where I want to build my career — I noticed you're at Nike and would love to hear how you got started there.\n\nWould you have 15 minutes for a quick call? I'd really appreciate any advice.\n\nThanks so much,\nOlivia`,
      },
    },
    {
      prompt: "I'm pre-med at UF but thinking about switching to healthcare consulting.",
      companies: [
        { name: 'ZS Associates', tag: 'Pharma Consulting', asterisk: true },
        { name: 'IQVIA', tag: 'Health Data' },
        { name: 'McKinsey Health', tag: 'Strategy' },
        { name: 'Optum', tag: 'UnitedHealth' },
      ],
      hasAsterisk: true,
      alumniRoles: [
        { company: 'ZS Associates', role: 'Associate Consultant', year: "'22" },
        { company: 'IQVIA', role: 'Analyst', year: "'23" },
        { company: 'Optum', role: 'Strategy Associate', year: "'21" },
      ],
      outreach: {
        company: 'ZS Associates', from: 'Sophie',
        bodyTemplate: (alumniName) =>
          `Hi ${alumniName.split(' ')[0]},\n\nI'm at UF with a pre-med background but exploring healthcare consulting — I saw you're at ZS Associates and that transition is exactly what I'm considering.\n\nWould you have time for a quick 15-minute call? I'd love to hear your perspective.\n\nThanks so much,\nSophie`,
      },
    },
  ],

  'University of Michigan': [
    {
      prompt: "I'm interested in consulting and want to work at Deloitte or Bain.",
      companies: [
        { name: 'Deloitte', tag: 'Big Four' },
        { name: 'Bain & Company', tag: 'Strategy' },
        { name: 'Accenture', tag: 'Tech Consulting' },
        { name: 'EY-Parthenon', tag: 'Strategy' },
      ],
      hasAsterisk: false,
      alumniRoles: [
        { company: 'Deloitte', role: 'Business Analyst', year: "'23" },
        { company: 'Bain & Company', role: 'Associate Consultant', year: "'22" },
        { company: 'Accenture', role: 'Strategy Analyst', year: "'21" },
      ],
      outreach: {
        company: 'Deloitte', from: 'Jake',
        bodyTemplate: (alumniName) =>
          `Hi ${alumniName.split(' ')[0]},\n\nI'm a junior at Michigan interested in management consulting — I saw you're at Deloitte and would love to hear about your experience breaking in.\n\nWould you have 15 minutes for a quick call?\n\nThanks,\nJake`,
      },
    },
    {
      prompt: "I'm exploring product marketing roles at tech companies.",
      companies: [
        { name: 'Google', tag: 'Big Tech' },
        { name: 'Spotify', tag: 'Music/Tech' },
        { name: 'HubSpot', tag: 'SaaS' },
        { name: 'Notion', tag: 'Productivity' },
      ],
      hasAsterisk: false,
      alumniRoles: [
        { company: 'Google', role: 'Associate PMM', year: "'23" },
        { company: 'Spotify', role: 'Marketing Associate', year: "'22" },
        { company: 'HubSpot', role: 'Product Marketing Coordinator', year: "'21" },
      ],
      outreach: {
        company: 'Google', from: 'Rachel',
        bodyTemplate: (alumniName) =>
          `Hi ${alumniName.split(' ')[0]},\n\nI'm a Michigan student exploring product marketing and noticed you're at Google — I'd love to hear how you got your start in PMM.\n\nWould you have a few minutes for a quick chat?\n\nBest,\nRachel`,
      },
    },
  ],

  'UCF': [
    {
      prompt: "I'm a finance major at UCF and want to work at JPMorgan or Deloitte.",
      companies: [
        { name: 'JPMorgan', tag: 'Investment Banking' },
        { name: 'Deloitte', tag: 'Big Four' },
        { name: 'Goldman Sachs', tag: 'Finance' },
        { name: 'PwC', tag: 'Advisory' },
      ],
      hasAsterisk: false,
      alumniRoles: [
        { company: 'JPMorgan', role: 'Financial Analyst', year: "'23" },
        { company: 'Deloitte', role: 'Audit Associate', year: "'22" },
        { company: 'PwC', role: 'Advisory Associate', year: "'21" },
      ],
      outreach: {
        company: 'JPMorgan', from: 'Tyler',
        bodyTemplate: (alumniName) =>
          `Hi ${alumniName.split(' ')[0]},\n\nI'm a finance major at UCF targeting investment banking and noticed you're at JPMorgan — I'd love to hear about your path there.\n\nWould you have 15 minutes for a quick call?\n\nThanks,\nTyler`,
      },
    },
    {
      prompt: "I'm interested in brand marketing and want to work at Nike or PepsiCo.",
      companies: [
        { name: 'Nike', tag: 'Brand Marketing' },
        { name: 'PepsiCo', tag: 'CPG' },
        { name: 'Red Bull', tag: 'Lifestyle Brand' },
        { name: 'Adidas', tag: 'Sports/DTC' },
      ],
      hasAsterisk: false,
      alumniRoles: [
        { company: 'Nike', role: 'Marketing Coordinator', year: "'23" },
        { company: 'PepsiCo', role: 'Brand Associate', year: "'22" },
        { company: 'Red Bull', role: 'Events Marketing', year: "'21" },
      ],
      outreach: {
        company: 'Nike', from: 'Emma',
        bodyTemplate: (alumniName) =>
          `Hi ${alumniName.split(' ')[0]},\n\nI'm a UCF student passionate about brand marketing and noticed you're at Nike — I'd love to hear how you got started there.\n\nWould you have a few minutes for a quick chat?\n\nThanks,\nEmma`,
      },
    },
  ],

  'Tulane University': [
    {
      prompt: "I want to break into consulting and don't know where to start.",
      companies: [
        { name: 'McKinsey', tag: 'Strategy' },
        { name: 'BCG', tag: 'Strategy' },
        { name: 'Deloitte', tag: 'Big Four' },
        { name: 'Alvarez & Marsal', tag: 'Restructuring' },
      ],
      hasAsterisk: false,
      alumniRoles: [
        { company: 'McKinsey', role: 'Business Analyst', year: "'22" },
        { company: 'BCG', role: 'Associate', year: "'23" },
        { company: 'Deloitte', role: 'Strategy Consultant', year: "'21" },
      ],
      outreach: {
        company: 'McKinsey', from: 'Mia',
        bodyTemplate: (alumniName) =>
          `Hi ${alumniName.split(' ')[0]},\n\nI'm a Tulane student exploring consulting and saw you're at McKinsey — I'd love to learn how you prepared and landed your role.\n\nWould you have 15 minutes for a quick call?\n\nThanks so much,\nMia`,
      },
    },
    {
      prompt: "I'm interested in hospitality and consumer brands in New Orleans and beyond.",
      companies: [
        { name: 'Marriott', tag: 'Hospitality' },
        { name: 'LVMH', tag: 'Luxury/CPG' },
        { name: 'Hilton', tag: 'Hospitality' },
        { name: 'Diageo', tag: 'Spirits/CPG' },
      ],
      hasAsterisk: false,
      alumniRoles: [
        { company: 'Marriott', role: 'Revenue Analyst', year: "'23" },
        { company: 'LVMH', role: 'Brand Associate', year: "'22" },
        { company: 'Diageo', role: 'Marketing Coordinator', year: "'21" },
      ],
      outreach: {
        company: 'Marriott', from: 'Nathan',
        bodyTemplate: (alumniName) =>
          `Hi ${alumniName.split(' ')[0]},\n\nI'm a Tulane student passionate about hospitality and saw you're at Marriott — I'd love to learn how you got started in the industry.\n\nWould you have a few minutes to chat?\n\nBest,\nNathan`,
      },
    },
  ],

  'USC': [
    {
      prompt: "I'm exploring entertainment marketing and brand partnerships.",
      companies: [
        { name: 'Disney', tag: 'Entertainment' },
        { name: 'Netflix', tag: 'Streaming' },
        { name: 'CAA', tag: 'Talent Agency' },
        { name: 'Paramount', tag: 'Media' },
      ],
      hasAsterisk: false,
      alumniRoles: [
        { company: 'Disney', role: 'Marketing Coordinator', year: "'23" },
        { company: 'Netflix', role: 'Brand Partnerships', year: "'22" },
        { company: 'CAA', role: 'Agent Trainee', year: "'21" },
      ],
      outreach: {
        company: 'Disney', from: 'Samantha',
        bodyTemplate: (alumniName) =>
          `Hi ${alumniName.split(' ')[0]},\n\nI'm a USC student passionate about entertainment marketing and noticed you're at Disney — I'd love to hear how you got your start.\n\nWould you have 15 minutes for a quick call?\n\nThanks,\nSamantha`,
      },
    },
    {
      prompt: "I want to work in media, sports, or consumer marketing.",
      companies: [
        { name: 'ESPN', tag: 'Sports Media' },
        { name: 'Nike', tag: 'Sports/Brand' },
        { name: 'Riot Games', tag: 'Gaming' },
        { name: 'Red Bull', tag: 'Lifestyle' },
      ],
      hasAsterisk: false,
      alumniRoles: [
        { company: 'ESPN', role: 'Content Associate', year: "'23" },
        { company: 'Nike', role: 'Sports Marketing', year: "'22" },
        { company: 'Riot Games', role: 'Community Manager', year: "'21" },
      ],
      outreach: {
        company: 'ESPN', from: 'Brandon',
        bodyTemplate: (alumniName) =>
          `Hi ${alumniName.split(' ')[0]},\n\nI'm a USC student interested in sports media and noticed you're at ESPN — I'd love to hear about your path there.\n\nWould you have a few minutes for a quick chat?\n\nBest,\nBrandon`,
      },
    },
  ],

  'Penn State': [
    {
      prompt: "I'm interested in supply chain and operations roles.",
      companies: [
        { name: 'Amazon', tag: 'Operations' },
        { name: 'P&G', tag: 'Supply Chain' },
        { name: 'Johnson & Johnson', tag: 'Healthcare/Ops' },
        { name: 'Caterpillar', tag: 'Manufacturing' },
      ],
      hasAsterisk: false,
      alumniRoles: [
        { company: 'Amazon', role: 'Area Manager', year: "'23" },
        { company: 'P&G', role: 'Supply Chain Analyst', year: "'22" },
        { company: 'J&J', role: 'Operations Associate', year: "'21" },
      ],
      outreach: {
        company: 'Amazon', from: 'Kevin',
        bodyTemplate: (alumniName) =>
          `Hi ${alumniName.split(' ')[0]},\n\nI'm a Penn State student studying supply chain management and noticed you're at Amazon — I'd love to learn about the operations track there.\n\nWould you have 15 minutes for a quick call?\n\nThanks,\nKevin`,
      },
    },
    {
      prompt: "I want to target Big Four consulting firms.",
      companies: [
        { name: 'Deloitte', tag: 'Big Four' },
        { name: 'PwC', tag: 'Big Four' },
        { name: 'EY', tag: 'Big Four' },
        { name: 'KPMG', tag: 'Big Four' },
      ],
      hasAsterisk: false,
      alumniRoles: [
        { company: 'Deloitte', role: 'Consulting Analyst', year: "'23" },
        { company: 'PwC', role: 'Advisory Associate', year: "'22" },
        { company: 'EY', role: 'Staff Consultant', year: "'21" },
      ],
      outreach: {
        company: 'Deloitte', from: 'Lauren',
        bodyTemplate: (alumniName) =>
          `Hi ${alumniName.split(' ')[0]},\n\nI'm a Penn State student targeting consulting and saw you're at Deloitte — I'd love to hear about your recruiting experience.\n\nWould you have a few minutes for a quick call?\n\nBest,\nLauren`,
      },
    },
  ],
};

// ── Fallback scenario for schools without specific data ──
const FALLBACK_SCENARIOS = [
  {
    promptTemplate: (school) => `I'm a student at ${school} and want to break into tech — where should I start?`,
    companies: [
      { name: 'Google', tag: 'Big Tech' },
      { name: 'HubSpot', tag: 'SaaS' },
      { name: 'Stripe', tag: 'Fintech' },
      { name: 'Notion', tag: 'Productivity' },
    ],
    hasAsterisk: false,
    alumniRoles: [
      { company: 'Google', role: 'Associate PMM', year: "'23" },
      { company: 'HubSpot', role: 'BDR', year: "'22" },
      { company: 'Stripe', role: 'Operations Associate', year: "'21" },
    ],
    outreach: {
      company: 'Google', from: 'Alex',
      bodyTemplate: (school, alumniName) =>
        `Hi ${alumniName.split(' ')[0]},\n\nI'm a student at ${school} exploring tech careers and noticed you're at Google — I'd love to hear how you got started.\n\nWould you have 15 minutes for a quick call?\n\nThanks,\nAlex`,
    },
  },
  {
    promptTemplate: (school) => `I've sent 100 resumes and heard nothing back. What should I do next?`,
    companies: [
      { name: 'HubSpot', tag: 'SaaS' },
      { name: 'Shopify', tag: 'E-commerce' },
      { name: 'Adobe', tag: 'Creative/Tech' },
      { name: 'Zillow', tag: 'Real Estate' },
    ],
    hasAsterisk: false,
    alumniRoles: [
      { company: 'HubSpot', role: 'Business Development Rep', year: "'22" },
      { company: 'Shopify', role: 'Partnerships Associate', year: "'23" },
      { company: 'Adobe', role: 'Customer Success Associate', year: "'21" },
    ],
    outreach: {
      company: 'HubSpot', from: 'Alex',
      bodyTemplate: (school, alumniName) =>
        `Hi ${alumniName.split(' ')[0]},\n\nI'm a ${school} student trying to break into SaaS and noticed you're at HubSpot. I've been applying broadly but want to be more strategic.\n\nWould you have a few minutes to share how you landed your role?\n\nBest,\nAlex`,
    },
  },
];

/**
 * Get scenarios for a specific school.
 * Returns array of resolved scenario objects ready for use.
 */
export function getScenariosForSchool(school) {
  const specific = SCHOOL_SCENARIOS[school];
  if (specific) {
    // School-specific scenarios already have prompt as string (not template)
    return specific.map(s => ({
      ...s,
      // Normalize: specific scenarios use `prompt` string, fallbacks use `promptTemplate` fn
      promptText: s.prompt,
      outreachBodyFn: s.outreach.bodyTemplate,
    }));
  }
  // Fallback: use generic scenarios with school name injected
  return FALLBACK_SCENARIOS.map(s => ({
    ...s,
    promptText: s.promptTemplate(school),
    outreachBodyFn: (alumniName) => s.outreach.bodyTemplate(school, alumniName),
  }));
}

/**
 * Resolve a scenario with randomized alumni names.
 */
export function resolveScenario(scenario) {
  const names = getRandomAlumniNames(scenario.alumniRoles.length);
  const alumni = scenario.alumniRoles.map((r, i) => ({
    name: names[i], company: r.company, role: r.role, year: r.year,
  }));
  const firstAlumni = alumni[0];
  const bodyFn = scenario.outreachBodyFn || scenario.outreach.bodyTemplate;
  return {
    companies: scenario.companies,
    hasAsterisk: scenario.hasAsterisk || false,
    alumni,
    outreach: {
      to: firstAlumni.name.split(' ')[0],
      toFull: firstAlumni.name,
      company: scenario.outreach.company,
      from: scenario.outreach.from,
      body: bodyFn(firstAlumni.name),
    },
  };
}

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