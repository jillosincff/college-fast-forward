// CLIFF Career Intelligence — Phase 1 built-in roadmaps.
// Generalized, structured recommendations by student year × goal.
// Future phases plug in as additional signal sources (career fairs, Handshake,
// recruiting calendars, campus clubs) — see engine.js SIGNAL_SOURCES.

// Each recommendation:
// { id, title, description, priority (1 = highest), recommended_months [1-12],
//   student_year, goal ('internship'|'fulltime'|'any'), industry_tags,
//   estimated_time, reason, action_route? }

const ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const ROADMAP_RECOMMENDATIONS = [
  // ── Freshman ──
  { id: 'fr_linkedin', title: 'Build your LinkedIn', description: 'Set up a real profile: photo, headline, your school, and what you\'re curious about.', priority: 1, recommended_months: ALL, student_year: 'freshman', goal: 'any', industry_tags: ['all'], estimated_time: '30 min', reason: 'Recruiters and upperclassmen will look you up — give them something to find.' },
  { id: 'fr_resume', title: 'Create your first resume', description: 'One page. Coursework, activities, any job you\'ve ever had. It doesn\'t need to be impressive yet — it needs to exist.', priority: 1, recommended_months: ALL, student_year: 'freshman', goal: 'any', industry_tags: ['all'], estimated_time: '45 min', reason: 'Every opportunity from here on will ask for it.', action_route: '#/ResumeTailoring' },
  { id: 'fr_org', title: 'Join one organization related to your field', description: 'One club, one team, one society. Pick the one you\'d actually show up to.', priority: 2, recommended_months: [1, 2, 8, 9, 10], student_year: 'freshman', goal: 'any', industry_tags: ['all'], estimated_time: '1 hr', reason: 'This becomes your first resume line and your first network.' },
  { id: 'fr_upperclassman', title: 'Meet one upperclassman in your major', description: 'Ask them what they wish they\'d done freshman year. That\'s it.', priority: 2, recommended_months: ALL, student_year: 'freshman', goal: 'any', industry_tags: ['all'], estimated_time: '20 min', reason: 'They\'ve already made the mistakes you\'re about to make.' },
  { id: 'fr_explore', title: 'Explore two industries you\'re curious about', description: 'Read what people in those roles actually do all day. Rule one in, rule one out.', priority: 3, recommended_months: ALL, student_year: 'freshman', goal: 'any', industry_tags: ['all'], estimated_time: '30 min', reason: 'Direction beats effort — knowing what you want saves years.' },

  // ── Sophomore ──
  { id: 'so_resume', title: 'Finalize your resume', description: 'Tighten every bullet. Add numbers where you can. Get one person to review it.', priority: 1, recommended_months: ALL, student_year: 'sophomore', goal: 'any', industry_tags: ['all'], estimated_time: '1 hr', reason: 'Sophomore-year programs and early internships are already screening resumes.', action_route: '#/ResumeTailoring' },
  { id: 'so_targets', title: 'Build a target company list', description: '10-15 companies you\'d genuinely want to work for. Mix of dream and realistic.', priority: 1, recommended_months: ALL, student_year: 'sophomore', goal: 'any', industry_tags: ['all'], estimated_time: '40 min', reason: 'A list turns "someday" into a plan CLIFF can work.' },
  { id: 'so_network', title: 'Start networking — two real conversations', description: 'Alumni, parents in the CFF network, or upperclassmen at your target companies.', priority: 2, recommended_months: ALL, student_year: 'sophomore', goal: 'any', industry_tags: ['all'], estimated_time: '1 hr', reason: 'Warm connections made now pay off when applications open.' },
  { id: 'so_follow', title: 'Follow the companies you\'re interested in', description: 'LinkedIn + their early-careers pages. Turn on notifications for openings.', priority: 2, recommended_months: ALL, student_year: 'sophomore', goal: 'any', industry_tags: ['all'], estimated_time: '15 min', reason: 'Early applicants get seen. Late applicants get filtered.' },
  { id: 'so_summer_prep', title: 'Prepare for applications opening in late summer', description: 'Junior-year internship postings open as early as July-August. Have your materials ready before they do.', priority: 1, recommended_months: [5, 6, 7], student_year: 'sophomore', goal: 'internship', industry_tags: ['all'], estimated_time: '1 hr', reason: 'Recruiting begins earlier than most students realize.' },

  // ── Junior ──
  { id: 'ju_apply', title: 'Apply to your top opportunities', description: 'Your target list, best-fit roles first. Tailored resume for each.', priority: 1, recommended_months: [1, 2, 7, 8, 9, 10, 11], student_year: 'junior', goal: 'internship', industry_tags: ['all'], estimated_time: '2 hrs', reason: 'This is peak recruiting season for junior-year internships.' },
  { id: 'ju_followup', title: 'Follow up consistently', description: 'Every application older than a week gets a follow-up. CLIFF tracks the timing.', priority: 1, recommended_months: ALL, student_year: 'junior', goal: 'any', industry_tags: ['all'], estimated_time: '20 min', reason: 'Most students never follow up. The ones who do get remembered.', action_route: '#/ApplicationTracker' },
  { id: 'ju_interviews', title: 'Practice interviews', description: 'One mock session per week. Behavioral questions first, then role-specific.', priority: 2, recommended_months: [1, 2, 9, 10, 11, 12], student_year: 'junior', goal: 'any', industry_tags: ['all'], estimated_time: '30 min', reason: 'Interview invites come fast once applications land — be ready before they do.', action_route: '#/MockInterview' },
  { id: 'ju_network', title: 'Use networking strategically', description: 'Reach out at companies where you\'ve applied or are about to. A warm name moves your resume up the pile.', priority: 2, recommended_months: ALL, student_year: 'junior', goal: 'any', industry_tags: ['all'], estimated_time: '30 min', reason: 'Referrals convert to interviews at several times the rate of cold applications.' },

  // ── Senior ──
  { id: 'se_quality', title: 'Focus on quality over quantity', description: 'Five excellent, tailored applications beat twenty rushed ones.', priority: 1, recommended_months: ALL, student_year: 'senior', goal: 'fulltime', industry_tags: ['all'], estimated_time: '2 hrs', reason: 'At this stage fit and polish win — volume doesn\'t.' },
  { id: 'se_interview', title: 'Continue interviewing', description: 'Keep momentum. Every interview makes the next one easier — even the ones you don\'t want.', priority: 1, recommended_months: ALL, student_year: 'senior', goal: 'fulltime', industry_tags: ['all'], estimated_time: '1 hr', reason: 'Offers come from a pipeline, not a single shot.', action_route: '#/MockInterview' },
  { id: 'se_expand', title: 'Expand your target companies', description: 'Add mid-size and lesser-known companies in your industry. That\'s where most hiring actually happens.', priority: 2, recommended_months: ALL, student_year: 'senior', goal: 'fulltime', industry_tags: ['all'], estimated_time: '30 min', reason: 'Brand-name-only searches stall. Broader lists close.' },
  { id: 'se_salary', title: 'Prepare salary conversations', description: 'Know the market range for your role and city. Practice saying a number out loud.', priority: 2, recommended_months: [1, 2, 3, 4, 11, 12], student_year: 'senior', goal: 'fulltime', industry_tags: ['all'], estimated_time: '30 min', reason: 'The first salary conversation sets the baseline for years.' },

  // ── Recent Graduate ──
  { id: 'rg_momentum', title: 'Maintain application momentum', description: 'A steady weekly cadence of quality applications. Consistency beats bursts.', priority: 1, recommended_months: ALL, student_year: 'recent_grad', goal: 'fulltime', industry_tags: ['all'], estimated_time: '2 hrs', reason: 'The search rewards students who keep showing up every week.' },
  { id: 'rg_followup', title: 'Follow up on everything', description: 'Every open application, every conversation that went quiet. Politely, once a week.', priority: 1, recommended_months: ALL, student_year: 'recent_grad', goal: 'fulltime', industry_tags: ['all'], estimated_time: '20 min', reason: 'Silence usually means busy, not no.', action_route: '#/ApplicationTracker' },
  { id: 'rg_geo', title: 'Expand geography if needed', description: 'If your target city is slow, add one or two more markets — or remote roles.', priority: 2, recommended_months: ALL, student_year: 'recent_grad', goal: 'fulltime', industry_tags: ['all'], estimated_time: '20 min', reason: 'A wider map can double your live opportunities overnight.' },
  { id: 'rg_interview', title: 'Continue interviewing weekly', description: 'Mock sessions if real ones are scarce. The skill decays fast without reps.', priority: 2, recommended_months: ALL, student_year: 'recent_grad', goal: 'fulltime', industry_tags: ['all'], estimated_time: '30 min', reason: 'When the right interview comes, you want to be sharp — not rusty.', action_route: '#/MockInterview' },
];

// CLIFF's coach voice per year — never textbook language.
export const YEAR_VOICE = {
  freshman: "You're earlier than you think. This is the perfect time to build your foundation.",
  sophomore: "Recruiting begins earlier than most students realize. Let's get ahead of it.",
  junior: "This is the month that matters. You're entering recruiting season — let's get ahead of it.",
  senior: "This is the home stretch. Quality, momentum, and follow-through win from here.",
  recent_grad: "The search isn't over — it's just year-round now. Steady momentum wins.",
};

// What can wait — CLIFF explicitly takes things off the plate.
export const CAN_WAIT = {
  freshman: "Don't worry about applying yet. You're building the foundation.",
  sophomore: "Don't stress about interviews yet — applications come first.",
  junior: "Don't worry about salary negotiation yet. Land the interviews first.",
  senior: "Don't chase every posting. Your shortlist deserves your energy.",
  recent_grad: "Don't rewrite your resume from scratch again. Tailor and send.",
};