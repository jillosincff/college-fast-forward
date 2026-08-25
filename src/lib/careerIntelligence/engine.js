// CLIFF Career Intelligence Engine — Phase 1.
// Knows what a student should be doing right now based on year, goal, major,
// graduation date, and time of year. Students never have to know how
// recruiting works — CLIFF does.
//
// Extensibility: future signal sources (career fairs, career center workshops,
// employer visits, campus clubs, Handshake, CampusGroups, recruiting calendars)
// register in SIGNAL_SOURCES and return the same recommendation shape.
import { ROADMAP_RECOMMENDATIONS, YEAR_VOICE, CAN_WAIT } from './roadmaps';
import { resolveLevel, resolveField } from '@/lib/studentProfile';

const SIGNAL_SOURCES = [
  { key: 'builtin_roadmaps', getRecommendations: () => ROADMAP_RECOMMENDATIONS },
  // Phase 2+: { key: 'university_events', ... }, { key: 'handshake', ... }
];

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const YEAR_ALIASES = {
  freshman: 'freshman', freshmen: 'freshman', '1': 'freshman', first_year: 'freshman',
  sophomore: 'sophomore', '2': 'sophomore',
  junior: 'junior', '3': 'junior',
  senior: 'senior', '4': 'senior',
  recent_grad: 'recent_grad', graduate: 'recent_grad', grad: 'recent_grad', alumni: 'recent_grad',
};

export function deriveStudentProfile(user) {
  const cg = user?.career_goals || {};
  // Explicit year first
  let studentYear = YEAR_ALIASES[String(user?.student_year || user?.class_year || user?.year || cg.student_year || '').toLowerCase().trim()] || null;

  // Derive from graduation year: academic year ends in May
  const gradYear = Number(user?.graduation_year || user?.grad_year || cg.graduation_year) || null;
  if (!studentYear && gradYear) {
    const now = new Date();
    // Academic year label: Aug-Dec counts toward next May's graduating class
    const academicEndYear = now.getMonth() >= 7 ? now.getFullYear() + 1 : now.getFullYear();
    const yearsLeft = gradYear - academicEndYear;
    if (yearsLeft < 0 || (yearsLeft === 0 && now.getMonth() >= 5 && gradYear === now.getFullYear())) studentYear = 'recent_grad';
    else if (yearsLeft <= 0) studentYear = 'senior';
    else if (yearsLeft === 1) studentYear = 'junior';
    else if (yearsLeft === 2) studentYear = 'sophomore';
    else studentYear = 'freshman';
  }
  // Stage is only "known" when it comes from real data (explicit year or grad
  // year) — a defaulted stage must never be asserted as the student's identity.
  const stageKnown = !!studentYear;
  if (!studentYear) studentYear = 'junior';

  // Goal: resolved by the shared profile module (explicit setting, then the
  // student's own role wording) so the plan can't claim a different level than
  // the job feed used. Only fall back to a year-based default when truly unknown.
  const resolved = resolveLevel(cg, user || {});
  let goal = resolved.known ? resolved.level : null;
  if (!goal || goal === 'both') goal = (studentYear === 'senior' || studentYear === 'recent_grad') ? 'fulltime' : 'internship';

  return {
    studentYear,
    stageKnown,
    goal,
    major: user?.major || cg.major || null,
    industry: resolveField(cg, user || {}),
    graduationYear: gradYear,
  };
}

// Career season by year × month — the "where you are in the journey" label.
export function getCareerSeason(studentYear, goal, month) {
  if (studentYear === 'freshman') {
    return { key: 'foundation', emoji: '🌱', name: 'Foundation Season', why: 'No deadlines yet — this is when you build the profile, resume, and network everything else stands on.' };
  }
  if (studentYear === 'sophomore') {
    if (month >= 5 && month <= 7) return { key: 'prep', emoji: '🚀', name: 'Pre-Recruiting Season', why: 'Junior-year internship applications open in late summer. The students who are ready in July win in August.' };
    if (month >= 8 && month <= 12) return { key: 'networking', emoji: '🤝', name: 'Networking Season', why: 'Relationships you build this fall become referrals when recruiting hits next year.' };
    return { key: 'foundation', emoji: '🌱', name: 'Foundation Season', why: 'Spring sophomore year is for sharpening your resume and target list before recruiting gets real.' };
  }
  if (studentYear === 'junior') {
    if (month >= 7 && month <= 10) return { key: 'recruiting', emoji: '🚀', name: 'Recruiting Season', why: 'Most major internship postings open July through October. Applications now carry the most weight of the whole year.' };
    if (month >= 11 || month <= 2) return { key: 'interview', emoji: '🎤', name: 'Interview Season', why: 'Companies are converting fall applications into interviews right now.' };
    return { key: 'networking', emoji: '🤝', name: 'Networking Season', why: 'Spring is for building relationships and catching late-cycle openings before summer recruiting restarts.' };
  }
  if (studentYear === 'senior') {
    if (month >= 8 && month <= 11) return { key: 'recruiting', emoji: '🚀', name: 'Recruiting Season', why: 'Full-time new-grad hiring peaks in the fall. This is your biggest window.' };
    if (month === 12 || (month >= 1 && month <= 3)) return { key: 'interview', emoji: '🎤', name: 'Interview Season', why: 'Fall applications turn into interviews and offers through the winter.' };
    return { key: 'recruiting', emoji: '🚀', name: 'Recruiting Season', why: 'Plenty of companies hire new grads on rolling, just-in-time timelines — spring and summer are still live.' };
  }
  // recent_grad
  return { key: 'recruiting', emoji: '🚀', name: 'Recruiting Season', why: 'New-grad hiring runs year-round. Every week is a live week — momentum is the whole game.' };
}

// Main service: current monthly focus, top priorities, what can wait, next season.
export function getCareerIntelligence(profile, date = new Date()) {
  const month = date.getMonth() + 1;
  const { studentYear, goal, industry } = profile;

  const pool = SIGNAL_SOURCES.flatMap(s => s.getRecommendations(profile, date)).filter(r =>
    r.student_year === studentYear &&
    (r.goal === 'any' || r.goal === goal) &&
    (r.industry_tags.includes('all') || (industry && r.industry_tags.includes(String(industry).toLowerCase())))
  );

  const inMonth = pool.filter(r => r.recommended_months.includes(month)).sort((a, b) => a.priority - b.priority);
  const offMonth = pool.filter(r => !r.recommended_months.includes(month)).sort((a, b) => a.priority - b.priority);
  const monthlyFocus = [...inMonth, ...offMonth].slice(0, 5).slice(0, Math.max(3, Math.min(5, inMonth.length || 4)));

  const season = getCareerSeason(studentYear, goal, month);

  // Next season change within the coming 12 months
  let upcomingSeason = null;
  for (let i = 1; i <= 12; i++) {
    const m = ((month - 1 + i) % 12) + 1;
    const s = getCareerSeason(studentYear, goal, m);
    if (s.key !== season.key) { upcomingSeason = { ...s, startsIn: MONTH_NAMES[m - 1] }; break; }
  }

  return {
    season,
    voice: YEAR_VOICE[studentYear],
    monthName: MONTH_NAMES[month - 1],
    monthlyFocus,
    canWait: CAN_WAIT[studentYear],
    upcomingSeason,
  };
}

// Timeline integration: one Career Intelligence item shaped exactly like a
// Decision Engine timeline item — never noise, just the single top move.
export function getCareerIntelligenceTimelineItems(user, date = new Date()) {
  if (!user) return [];
  const profile = deriveStudentProfile(user);
  const ci = getCareerIntelligence(profile, date);
  const top = ci.monthlyFocus[0];
  if (!top) return [];
  return [{
    date: date.toISOString(),
    emoji: '📍',
    text: `${top.reason} Recommended: ${top.title.toLowerCase()} (${top.estimated_time}). You're right on time.`,
    cta: 'Start',
    action: top.action_route ? { type: 'route', route: top.action_route } : { type: 'scroll' },
  }];
}