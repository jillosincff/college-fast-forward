// CLIFF Career Trajectory Intelligence — Phase 1.
// "You do not need to qualify for the final destination today. You need the
// right next step." Personalizes reviewed, approved pathway templates —
// never invents pathways at runtime.
import { deriveStudentProfile, getCareerSeason } from '@/lib/careerIntelligence/engine';

// Supportive stage framing — never a judgment.
export const STAGE_COPY = {
  exploring: { label: 'the exploring stage', copy: 'The best next move is ruling directions in or out — not committing to a final role.' },
  foundation_building: { label: 'the foundation-building stage', copy: 'The best next move is building your base — skills, involvement, and a first resume — not already qualifying for the final role.' },
  experience_building: { label: 'the experience-building stage', copy: 'The best next move is gaining proof through projects, campus leadership, or an internship — not already qualifying for the final role.' },
  internship_ready: { label: 'the internship-ready stage', copy: 'The best next move is landing a stepping-stone internship and turning it into proof.' },
  entry_level_ready: { label: 'the entry-level-ready stage', copy: 'The best next move is targeting realistic entry points — not the destination title.' },
  early_career: { label: 'the early-career stage', copy: 'Your next role only needs to move you one step closer.' },
  advancing: { label: 'the advancing stage', copy: 'You have momentum — the goal now is choosing moves that compound.' },
};

const YEAR_TO_STAGE = {
  freshman: 'foundation_building',
  sophomore: 'experience_building',
  junior: 'internship_ready',
  senior: 'entry_level_ready',
  recent_grad: 'early_career',
};

export const REASSURANCES = [
  "You do not need to be qualified for the final role yet — you're building toward it.",
  'This is a normal entry point. Your next role only needs to move you one step closer.',
  'There is more than one way to reach this career.',
];

const norm = (s) => String(s || '').toLowerCase();
const GENERIC = new Set(['intern', 'internship', 'summer', 'assistant', 'associate', 'senior', 'junior', 'staff', 'lead', 'role', 'roles', 'manager', 'management', 'director', 'coordinator', 'specialist', 'analyst', 'engineer', 'representative']);
const tokens = (s) => norm(s).split(/[^a-z]+/).filter(w => w.length > 3 && !GENERIC.has(w));

// Match a student's goal text to an approved template. Conservative: no match
// means no match — CLIFF never invents a pathway.
export function matchTemplate(goalText, templates) {
  const text = norm(goalText);
  if (!text.trim()) return null;
  let best = null;
  for (const t of templates) {
    if (t.review_status !== 'approved') continue;
    let hits = 0;
    for (const k of t.match_keywords || []) if (text.includes(norm(k))) hits++;
    if (text.includes(norm(t.target_role))) hits += 2;
    if (text.includes(norm(t.career_family))) hits += 2;
    if (hits > 0 && (!best || hits > best.hits)) best = { template: t, hits };
  }
  if (!best) return null;
  return { template: best.template, confidence: best.hits >= 2 ? 'high' : 'medium' };
}

const dedupe = (arr) => [...new Set(arr.filter(Boolean))];

// Personalize an approved template for this student.
export function buildTrajectory(user, template) {
  const profile = deriveStudentProfile(user);
  const stageKey = YEAR_TO_STAGE[profile.studentYear] || 'exploring';
  const stage = STAGE_COPY[stageKey];

  const primaryPath = dedupe([
    (template.starting_roles || [])[0],
    (template.stepping_stone_roles || [])[0],
    (template.stepping_stone_roles || [])[1],
    template.target_role,
  ]).slice(0, 4);

  const alt = (template.alternative_paths || [])[0] || null;
  const altPath = alt ? dedupe([...(alt.steps || [])]) : [];

  // Strongest next step by stage
  const earlyStage = stageKey === 'foundation_building' || stageKey === 'experience_building';
  const internships = (template.internship_types || []).slice(0, 3);
  const campus = template.campus_experiences || [];
  let nextRoles, nextStepText;
  if (earlyStage) {
    nextRoles = internships.map(i => `${i} internship`);
    nextStepText = `Right now, your best targets are ${internships.map(i => i.toLowerCase()).join(', ')} internships${campus[0] ? `, plus campus proof like: ${campus[0].toLowerCase()}` : ''}.`;
  } else if (stageKey === 'internship_ready') {
    nextRoles = internships.map(i => `${i} internship`);
    nextStepText = `Right now, your best targets are ${internships.map(i => i.toLowerCase()).join(', ')} internships — the stepping stones that commonly lead toward ${template.target_role} roles.`;
  } else {
    const entry = dedupe([...(template.starting_roles || []), ...(template.stepping_stone_roles || [])]).slice(0, 3);
    nextRoles = entry;
    nextStepText = `Right now, your strongest targets are ${entry.join(', ')} roles — realistic entry points that build toward ${template.target_role}.`;
  }

  // Why this fits where you are — real student context, conservative language
  const yearLabel = profile.studentYear === 'recent_grad' ? 'recent graduate' : profile.studentYear;
  const season = getCareerSeason(profile.studentYear, profile.goal, new Date().getMonth() + 1);
  const majorBit = profile.major ? ` studying ${profile.major}` : '';
  const whyFits = `You're a ${yearLabel}${majorBit} in ${stage.label}. ${stage.copy} ${season.why}`;

  return {
    stageKey,
    stageLabel: stage.label,
    stageCopy: stage.copy,
    primaryPath,
    altPath,
    altPathName: alt?.name || null,
    altPathNote: alt?.note || null,
    nextRoles,
    nextStepText,
    whyFits,
    campusActions: earlyStage ? campus.slice(0, 3) : [],
    reassurance: REASSURANCES,
  };
}

// Trajectory value of a specific job vs. the student's saved trajectory.
// Internal signal — never a numeric score. Returns null when neutral.
export function jobTrajectoryValue(jobTitle, traj) {
  const jt = tokens(jobTitle);
  if (!jt.length || !traj) return null;
  const overlap = (roles) => (roles || []).some(r => tokens(r).some(w => jt.includes(w)));
  // "Directly in line" only on an exact title match — never on loose token overlap
  if (norm(jobTitle).includes(norm(traj.target_role))) {
    return { value: 'target', message: `This is directly in line with your ${traj.target_role} goal.` };
  }
  if (overlap([traj.target_role]) || overlap(traj.recommended_next_roles) || overlap(traj.long_term_path) || overlap(traj.recommended_internship_types)) {
    return { value: 'strong_stepping_stone', message: `This is not your final goal, but it's a strong stepping stone — roles like this commonly build the experience used in ${traj.target_role} roles.` };
  }
  if (overlap(traj.alternative_path)) {
    return { value: 'adjacent', message: `This sits on an alternative route toward ${traj.target_role} — useful adjacent experience.` };
  }
  return null;
}

// One actionable trajectory item for the timeline — only when it changes what
// the student should do now. Never generic career tips.
export function getTrajectoryTimelineItem(user, trajectory) {
  if (!trajectory || trajectory.status !== 'active') return null;
  const { studentYear } = deriveStudentProfile(user);
  const target = trajectory.target_role;
  const next2 = (trajectory.recommended_next_roles || []).slice(0, 2).join(' and ');
  const map = {
    freshman: { text: `Build proof before recruiting starts — one project or org this month moves you toward ${target}.`, cta: 'Show my next step' },
    sophomore: { text: `Get internship-ready — your stepping-stone roles toward ${target} begin recruiting soon.`, cta: 'Show my path' },
    junior: { text: `Focus on roles that move you forward — target the internships that build toward ${target}.`, cta: 'Review my path' },
    senior: { text: `Use the right entry point toward ${target} — your strongest current targets are ${next2 || 'realistic stepping-stone'} roles.`, cta: 'Show my path' },
    recent_grad: { text: `Keep moving one step closer to ${target} — your strongest current targets are ${next2 || 'realistic stepping-stone'} roles.`, cta: 'Show my path' },
  };
  const m = map[studentYear] || map.junior;
  return { date: new Date().toISOString(), emoji: '📍', text: m.text, cta: m.cta, action: { type: 'event', event: 'cliff:showPath' } };
}