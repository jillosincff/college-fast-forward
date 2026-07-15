// ── Curated Career Intelligence templates for the homepage mini-plan demo ──
// The plan is assembled from approved templates — never invented by an LLM.

export const YEARS = [
  { label: 'Freshman', key: 'freshman' },
  { label: 'Sophomore', key: 'sophomore' },
  { label: 'Junior', key: 'junior' },
  { label: 'Senior', key: 'senior' },
  { label: 'Graduate Student', key: 'grad' },
  { label: 'Recent Graduate', key: 'recent_grad' },
];

export const FIELDS = [
  'Marketing', 'Finance', 'Accounting', 'Consulting', 'Software Engineering',
  'Data / Analytics', 'Healthcare', 'Communications / PR', 'Business / Operations', 'Still Exploring',
];

export const GOALS = [
  { label: 'Build experience', key: 'build_experience' },
  { label: 'Internship', key: 'internship' },
  { label: 'Full-time job', key: 'fulltime' },
  { label: 'Still figuring it out', key: 'exploring' },
];

// Field groupings drive which template family applies
const GROUP = {
  'Finance': 'fin', 'Accounting': 'fin', 'Consulting': 'fin',
  'Software Engineering': 'tech', 'Data / Analytics': 'tech',
  'Marketing': 'biz', 'Communications / PR': 'biz', 'Business / Operations': 'biz',
  'Healthcare': 'health',
};

// Realistic entry-role lanes per field (used for senior/grad plans)
const LANES = {
  'Finance': 'financial analyst, corporate finance, credit analyst, or wealth-management associate',
  'Accounting': 'audit associate, tax associate, staff accountant, or advisory analyst',
  'Consulting': 'business analyst, associate consultant, or strategy analyst',
  'Marketing': 'marketing coordinator, brand or content associate, or growth analyst',
  'Communications / PR': 'communications coordinator, PR assistant, or social media associate',
  'Business / Operations': 'operations analyst, rotational program associate, or project coordinator',
  'Software Engineering': 'backend, frontend, full-stack, mobile, or data engineering',
  'Data / Analytics': 'data analyst, business intelligence, or junior data science',
  'Healthcare': 'clinical research assistant, health administration associate, or public health analyst',
};

// Freshman "one piece of proof" per field
const FRESHMAN_PROOF = {
  'Marketing': 'Help a campus organization with social media, promotions, or an event so you have a real marketing example to discuss.',
  'Communications / PR': 'Help a campus organization with its newsletter, social accounts, or event publicity so you have real communications work to point to.',
  'Business / Operations': 'Help run an event, manage a budget, or organize a project for a campus organization so you have real operational work to discuss.',
  'Finance': 'Take a treasurer role, join a case or investing competition, or manage a budget for a campus organization.',
  'Accounting': 'Take a treasurer or bookkeeping role in a campus organization so you have real numbers work to discuss.',
  'Consulting': 'Join a case competition or student consulting group so you have one real problem-solving example.',
  'Software Engineering': 'Build one small project you can demo — a simple app, script, or website that solves a real problem.',
  'Data / Analytics': 'Analyze one real dataset — campus data, sports, or a topic you care about — and write up what you found.',
  'Healthcare': 'Start one volunteering, shadowing, or research-assistant experience connected to healthcare.',
};

const item = (type, title, text, why, time) => ({ type, title, text, why, ...(time ? { time } : {}) });

// Fields where recruiting reliably starts early
const EARLY_FIELDS = new Set(['Finance', 'Consulting', 'Software Engineering', 'Accounting', 'Data / Analytics']);

// ── Cautious, month-aware timing line (no fabricated deadlines) ──
export function getTimingNote(field, month = new Date().getMonth()) {
  const early = EARLY_FIELDS.has(field);
  if (month <= 1 || month === 11) return 'Many later-cycle employers — mid-size companies, agencies, startups, and nonprofits — are still hiring this time of year.';
  if (month <= 4) return 'Summer roles are filling now — timing and fit matter more than volume. Hiring timing varies by employer.';
  if (month <= 7) return early
    ? `Recruiting often begins earlier in ${field.toLowerCase()} than students expect — this is a strong time to be ready before fall postings open.`
    : 'This is a strong time to prepare — many large employers begin opening roles around early fall.';
  return 'Fall recruiting is active — a focused search beats a high-volume one right now.';
}

const EXPLORING_PLAN = (yearKey) => ({
  templateId: 'exploring',
  items: [
    item('Explore', 'Narrow the field through evidence', 'Pick two career directions that connect to what you already enjoy or have done — not ten.', 'Comparing two real options beats staring at an infinite list.'),
    item('Explore', 'Try one low-risk experiment', 'Have one informational conversation, take on one small project, or try one campus activity in a direction you\u2019re curious about.', 'A single real data point teaches you more than weeks of browsing.', '~1–2 hours'),
    item('Explore', 'Let CLIFF compare the paths', 'CLIFF explains what each path involves day-to-day and which first opportunities commonly lead there.', 'Clarity about the destination makes every next step easier.'),
  ],
  reassurance: yearKey === 'senior' || yearKey === 'recent_grad'
    ? 'You don\u2019t need the perfect answer today. You need a useful next experiment — and a plan behind it.'
    : 'You do not need the perfect answer today. You need a useful next experiment.',
});

const FRESHMAN_PLAN = (field) => ({
  templateId: `freshman_${GROUP[field]}`,
  items: [
    item('Build', 'Build one piece of proof', FRESHMAN_PROOF[field], 'You do not need a major internship yet. You need evidence that you can do the work.'),
    item('Build', 'Create your first career-ready resume', 'Turn classes, campus involvement, projects, and part-time work into a simple first resume.', 'You\u2019ll be ready when early opportunities appear instead of starting from zero.', '~45 min'),
    item('Connect', `Choose one ${field === 'Healthcare' ? 'healthcare' : field.toLowerCase()} community`, 'Join one relevant organization or follow one professional community — not five.', 'The goal is exposure and direction, not collecting memberships.'),
  ],
  reassurance: 'You are not behind. This is exactly the right time to build the foundation.',
});

const SOPHOMORE_PLANS = {
  fin: (field) => ({
    templateId: 'sophomore_fin',
    items: [
      item('Prepare', 'Get recruiting-ready before postings peak', `Finalize your resume and identify the ${field.toLowerCase()} tracks you are actually considering.`, `${field} recruiting can start earlier than students expect.`),
      item('Build', 'Build a focused target list', 'Choose 10–15 companies across your strongest paths — not every firm with an open role.', 'A clear list means watching the right opportunities instead of random postings.', '~1 hour'),
      item('Connect', 'Begin selective outreach', 'Start with alumni or professionals connected to your strongest target paths — a few good conversations, not a blast.', 'Early conversations are more useful than last-minute referral requests.'),
    ],
    reassurance: 'You\u2019re early enough that preparation still compounds. That\u2019s an advantage.',
  }),
  tech: (field) => ({
    templateId: 'sophomore_tech',
    items: [
      item('Build', 'Build the project recruiters will ask about', field === 'Software Engineering' ? 'Ship one project you can demo and explain — the code matters less than the decisions behind it.' : 'Complete one analysis project with real data — and write up what you found and why it matters.', 'Early tech internships hinge on proof of work, and this is when there\u2019s time to build it.'),
      item('Prepare', 'Get your resume internship-ready', 'Turn coursework, projects, and any part-time work into a clean one-page resume.', 'Tech internship postings for sophomores open earlier than most students expect.', '~45 min'),
      item('Build', 'Build a focused target list', 'Choose 10–15 companies and programs that actually take sophomores — including early-talent programs.', 'Focusing on realistic doors beats applying everywhere.'),
    ],
    reassurance: 'You have time — and using it on proof beats using it on volume.',
  }),
  biz: (field) => ({
    templateId: 'sophomore_biz',
    items: [
      item('Build', 'Build one piece of real proof', FRESHMAN_PROOF[field] || FRESHMAN_PROOF['Marketing'], 'When applications open, concrete examples are what set sophomores apart.'),
      item('Prepare', 'Get your resume recruiting-ready', 'Shape your campus work, projects, and jobs into a resume that reads like early experience.', 'Being ready before postings peak means you apply calm, not rushed.', '~45 min'),
      item('Build', 'Build a focused target list', `Choose 10–15 companies across the ${field.toLowerCase()} paths you\u2019d actually take.`, 'A clear list helps CLIFF watch the right opportunities instead of showing random roles.'),
    ],
    reassurance: 'You\u2019re on time. Focused preparation now makes junior year much easier.',
  }),
  health: () => ({
    templateId: 'sophomore_health',
    items: [
      item('Build', 'Deepen one hands-on experience', 'Commit to one volunteering, research, or shadowing experience this term — depth beats a scattered list.', 'Healthcare paths reward sustained involvement more than one-off activities.'),
      item('Prepare', 'Get your resume program-ready', 'Capture your clinical, research, and volunteer work in a clean resume now.', 'Many healthcare internships and summer programs have earlier, structured application cycles.', '~45 min'),
      item('Explore', 'Identify the program types that fit', 'Clarify which routes you\u2019re building toward — clinical, research, administration, or public health — and what each looks for.', 'Knowing the destination tells you which experiences actually count.'),
    ],
    reassurance: 'You\u2019re building at the right pace. Depth now pays off at application time.',
  }),
};

const JUNIOR_PLAN = (field) => {
  const group = GROUP[field];
  const practice = group === 'tech'
    ? item('Practice', 'Start practicing technical screens now', 'Practice the interview format used by the roles you\u2019re pursuing — before an invitation arrives.', 'Waiting until an interview is scheduled creates unnecessary pressure.')
    : group === 'fin'
      ? item('Practice', 'Start interview practice before the invitation', 'Prepare behavioral stories plus the technical basics your target roles commonly test.', 'Waiting until an interview is scheduled creates unnecessary pressure.')
      : item('Practice', 'Start interview practice before the invitation', 'Prepare behavioral stories and role-specific questions now.', 'Waiting until an interview is scheduled creates unnecessary pressure.');
  return {
    templateId: `junior_${group}`,
    items: [
      item('Pursue', 'Pursue your strongest opportunities now', 'Prioritize a small number of roles with strong goal, resume, location, and timing fit — not everything with a matching title.', 'This is the year when internship quality matters most.'),
      item('Prepare', 'Prepare one application properly', 'Tailor the resume, clarify the role fit, and complete the application plan for your top choice.', 'One thoughtful application is worth more than several rushed ones.', '~1 hour'),
      practice,
    ],
    reassurance: 'You don\u2019t need more applications. You need the right ones, done well.',
  };
};

const SENIOR_PLANS = (field) => {
  const group = GROUP[field];
  if (group === 'tech') {
    return {
      templateId: 'senior_tech',
      items: [
        item('Build', 'Define the role lane', `Choose your strongest target: ${LANES[field]}.`, 'A clear lane makes every application and conversation sharper.'),
        item('Build', 'Strengthen the proof recruiters will inspect', field === 'Software Engineering' ? 'Prioritize your most relevant project, GitHub work, technical experience, or deployed product.' : 'Prioritize your most relevant analysis, dashboard, or portfolio piece — the work recruiters will actually open.', 'For technical roles, visible proof is often the first filter.'),
        item('Practice', 'Prepare for technical screens', 'Practice the interview format used by the roles and companies you are pursuing.', 'Interview readiness is the next major conversion point.'),
      ],
      reassurance: 'You\u2019re not behind. You just need the right next move.',
    };
  }
  if (group === 'fin') {
    return {
      templateId: 'senior_fin',
      items: [
        item('Build', 'Narrow your entry points', `Choose the two or three realistic role families that best match your experience, such as ${LANES[field]}.`, 'A focused search creates stronger applications and clearer networking.'),
        item('Pursue', 'Pursue the best current opportunities', 'Focus serious effort on the roles with real fit, freshness, and trajectory value — not a weekly application quota.', 'The goal is not more applications. It is more credible paths to interviews.'),
        item('Practice', 'Prepare your interview evidence', 'Build strong examples around analysis, teamwork, judgment, leadership, and measurable results.', 'For many of these roles, interview readiness is the next major conversion point.'),
      ],
      reassurance: 'You\u2019re not behind. You just need the right next move.',
      networkingNote: 'A relevant alumni connection may help for selected roles. CLIFF will only surface one when it is genuinely worth contacting.',
    };
  }
  if (group === 'health') {
    return {
      templateId: 'senior_health',
      items: [
        item('Build', 'Narrow your entry points', `Choose the two or three role families that match your experience, such as ${LANES['Healthcare']}.`, 'Healthcare hiring is structured — a focused lane makes your background legible.'),
        item('Pursue', 'Pursue the best current opportunities', 'Focus on the roles and programs with genuine fit — not a volume of scattered applications.', 'Credible fit, not quantity, is what converts to interviews here.'),
        item('Practice', 'Prepare your interview evidence', 'Build examples around patient or stakeholder impact, reliability, and working within teams and protocols.', 'Interview readiness is the next major conversion point.'),
      ],
      reassurance: 'You\u2019re not behind. You just need the right next move.',
    };
  }
  return {
    templateId: 'senior_biz',
    items: [
      item('Build', 'Narrow your entry points', `Choose the two or three realistic role families that best match your experience, such as ${LANES[field]}.`, 'A focused search creates stronger applications and clearer networking.'),
      item('Pursue', 'Pursue the best current opportunities', 'Focus serious effort on the strongest-fit roles — not a weekly application quota.', 'The goal is not more applications. It is more credible paths to interviews.'),
      item('Prepare', 'Prepare the work examples recruiters ask about', 'Gather the campaigns, projects, or results you can walk through concretely in an interview.', 'Specific examples are what separate finalists in these fields.'),
    ],
    reassurance: 'You\u2019re not behind. You just need the right next move.',
  };
};

/**
 * Assemble the mini-plan from curated templates.
 * Returns { items[3], reassurance, networkingNote?, timingNote, templateId } or
 * { fallback: true, ... } when no reliable template exists.
 */
export function getMiniPlan(yearKey, field, goalKey, month = new Date().getMonth()) {
  const timingNote = getTimingNote(field === 'Still Exploring' ? '' : field, month);

  if (field === 'Still Exploring' || goalKey === 'exploring') {
    return { ...EXPLORING_PLAN(yearKey), timingNote: '' };
  }

  const group = GROUP[field];
  if (!group) return { fallback: true, templateId: 'fallback', timingNote: '', items: EXPLORING_PLAN(yearKey).items, reassurance: EXPLORING_PLAN(yearKey).reassurance };

  // Graduate students: full-time goal → senior urgency; otherwise junior-style focus
  let bucket = yearKey;
  if (yearKey === 'grad') bucket = goalKey === 'fulltime' ? 'senior' : 'junior';
  if (yearKey === 'recent_grad') bucket = 'senior';

  let plan;
  if (bucket === 'freshman') plan = FRESHMAN_PLAN(field);
  else if (bucket === 'sophomore') plan = SOPHOMORE_PLANS[group](field);
  else if (bucket === 'junior') plan = JUNIOR_PLAN(field);
  else plan = SENIOR_PLANS(field);

  return { ...plan, timingNote };
}