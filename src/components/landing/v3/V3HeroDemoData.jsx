// Pre-scripted demo scenarios for the hero product demo
// Each scenario maps a prompt to structured output

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
      { name: 'Sarah Chen', school: 'UF \'22', company: 'Deloitte', role: 'Consulting Analyst' },
      { name: 'Michael Ross', school: 'UF \'21', company: 'Accenture', role: 'Strategy Associate' },
      { name: 'David Klein', school: 'UF \'23', company: 'EY-Parthenon', role: 'Senior Analyst' },
    ],
    outreach: {
      to: 'Sarah',
      toFull: 'Sarah Chen',
      company: 'Deloitte',
      from: 'Olivia',
      body: `Hi Sarah,\n\nI'm a junior at UF studying business and exploring consulting — I noticed you're at Deloitte and would love to hear how you got started.\n\nWould you have 15 minutes for a quick call? I'd really appreciate any advice on breaking in.\n\nThanks so much,\nOlivia`,
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
      { name: 'Jessica Torres', school: 'UF \'21', company: 'Nike', role: 'Brand Marketing Coordinator' },
      { name: 'Ryan Patel', school: 'UF \'22', company: 'Spotify', role: 'Growth Marketing Associate' },
      { name: 'Amanda Liu', school: 'UF \'20', company: 'Ogilvy', role: 'Account Executive' },
    ],
    outreach: {
      to: 'Jessica',
      toFull: 'Jessica Torres',
      company: 'Nike',
      from: 'Marcus',
      body: `Hi Jessica,\n\nI'm a marketing major at UF and saw you're doing brand marketing at Nike — that's exactly the space I'm trying to break into.\n\nWould you be open to a brief chat? I'd love to hear what the day-to-day looks like and how you landed the role.\n\nReally appreciate it,\nMarcus`,
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
      { name: 'Kevin Nguyen', school: 'UF \'22', company: 'JP Morgan', role: 'Investment Banking Analyst' },
      { name: 'Rachel Adams', school: 'UF \'21', company: 'Raymond James', role: 'Equity Research Associate' },
      { name: 'Chris Hernandez', school: 'UF \'23', company: 'Goldman Sachs', role: 'Operations Analyst' },
    ],
    outreach: {
      to: 'Kevin',
      toFull: 'Kevin Nguyen',
      company: 'JP Morgan',
      from: 'Sophie',
      body: `Hi Kevin,\n\nI'm a finance major at UF and still figuring out which area of finance to focus on. I saw you're at JP Morgan and would love to hear how you decided on investment banking.\n\nWould you have time for a quick 15-minute call?\n\nThanks so much,\nSophie`,
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
      { name: 'Taylor Brooks', school: 'UF \'22', company: 'HubSpot', role: 'Business Development Rep' },
      { name: 'Jordan Lee', school: 'UF \'21', company: 'Salesforce', role: 'Account Executive' },
      { name: 'Maya Singh', school: 'UF \'23', company: 'Adobe', role: 'Customer Success Associate' },
    ],
    outreach: {
      to: 'Taylor',
      toFull: 'Taylor Brooks',
      company: 'HubSpot',
      from: 'Alex',
      body: `Hi Taylor,\n\nI'm a UF student trying to break into SaaS and noticed you're at HubSpot. I've been applying broadly but want to be more strategic.\n\nWould you have a few minutes to share how you landed your role? Any advice would mean a lot.\n\nBest,\nAlex`,
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
      { name: 'Brandon Park', school: 'UF \'22', company: 'Salesforce', role: 'SDR' },
      { name: 'Mia Gonzalez', school: 'UF \'21', company: 'Datadog', role: 'Account Executive' },
      { name: 'Jake Williams', school: 'UF \'23', company: 'Gong', role: 'Business Development Rep' },
    ],
    outreach: {
      to: 'Brandon',
      toFull: 'Brandon Park',
      company: 'Salesforce',
      from: 'Emma',
      body: `Hi Brandon,\n\nI'm at UF and really interested in getting into tech sales — I saw you're an SDR at Salesforce and that's exactly the kind of role I'm targeting.\n\nWould you be open to a quick chat about how you broke in? I'd love any tips.\n\nThanks,\nEmma`,
    },
  },
];

export default DEMO_SCENARIOS;