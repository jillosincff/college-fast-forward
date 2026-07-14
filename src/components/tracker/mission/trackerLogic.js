// CLIFF Mission Control logic — every application always gets a health
// indicator, a plain-language recommendation, and a next action.

export const HEALTH = {
  green: { icon: '🟢', label: 'On Track', color: '#059669', bg: '#ecfdf5' },
  yellow: { icon: '🟡', label: 'Needs Attention Soon', color: '#b45309', bg: '#fffbeb' },
  red: { icon: '🔴', label: 'Action Needed', color: '#dc2626', bg: '#fef2f2' },
  waiting: { icon: '⚪', label: 'Waiting on Employer', color: '#6b7280', bg: '#f9fafb' },
  done: { icon: '✓', label: 'Completed', color: '#9ca3af', bg: '#f9fafb' },
};

export const FILTERS = [
  { id: 'attention', label: 'Needs My Attention' },
  { id: 'waiting', label: 'Waiting' },
  { id: 'interviewing', label: 'Interviewing' },
  { id: 'offers', label: 'Offers' },
  { id: 'completed', label: 'Completed' },
];

const daysBetween = (from) => Math.floor((Date.now() - new Date(from).getTime()) / 86400000);

// Derive everything the UI needs from one pipeline-backed application record
export function deriveInsight(app) {
  const daysSince = daysBetween(app.statusDate || app.dateApplied);
  const followedUp = (app.followUpCount || 0) > 0;

  if (app.status === 'rejected') {
    return {
      group: 'completed', health: HEALTH.done, stage: 'Closed', daysSince,
      cliffSays: "This one's closed. Your effort here still sharpened your materials for the next one.",
      action: null, priority: 0,
    };
  }
  if (app.status === 'offered') {
    return {
      group: 'offers', health: HEALTH.green, stage: 'Offer Received', daysSince,
      cliffSays: 'You have an offer on the table. Review it carefully — I can help you think it through.',
      action: { label: 'Review Offer', type: 'detail', estMinutes: 10 },
      priority: 90,
      whyNow: 'Offers usually have a response deadline. Reviewing it today gives you time to negotiate or compare.',
    };
  }
  if (app.status === 'interviewing') {
    return {
      group: 'interviewing', health: HEALTH.green, stage: 'Interviewing', daysSince,
      cliffSays: 'Practice your interview today. Even one round of practice measurably improves your answers.',
      action: { label: 'Practice', type: 'practice', estMinutes: 8 },
      priority: 80,
      whyNow: 'Interview prep compounds — practicing a few days before beats cramming the night before.',
    };
  }
  if (app.status === 'in_review') {
    // They engaged — respond while warm
    return {
      group: 'attention', health: HEALTH.red, stage: 'In Review', daysSince,
      cliffSays: "There's movement here — respond while you're top of mind.",
      action: { label: 'Reply', type: 'followup', estMinutes: 5 },
      priority: 70 + Math.min(daysSince, 20),
      whyNow: 'Replies within 24–48 hours keep the conversation warm. Waiting longer risks losing momentum.',
    };
  }

  // Applied / waiting states
  if (followedUp && daysSince < 7) {
    return {
      group: 'waiting', health: HEALTH.waiting, stage: 'Follow-Up Sent', daysSince,
      cliffSays: "Nothing needed. Your follow-up is out — I'm monitoring this.",
      waiting: { window: 7 - daysSince },
      action: { label: 'Monitoring', type: 'none' }, priority: 5,
    };
  }
  if (daysSince >= 7) {
    return {
      group: 'attention', health: HEALTH.red, stage: 'Applied', daysSince,
      cliffSays: `${daysSince} days since you applied. This is the ideal follow-up window.`,
      action: { label: 'Send Follow-Up', type: 'followup', estMinutes: 3 },
      priority: 50 + Math.min(daysSince, 30),
      whyNow: `Most recruiters respond to follow-ups sent 7–14 days after applying. You're at day ${daysSince} — acting today keeps you in the strongest window before your application goes cold.`,
    };
  }
  if (daysSince >= 5) {
    return {
      group: 'attention', health: HEALTH.yellow, stage: 'Applied', daysSince,
      cliffSays: 'Nothing to do yet — your follow-up window opens in a couple of days. I\'ll flag it.',
      action: { label: 'Nothing Right Now', type: 'none' }, priority: 20,
    };
  }
  return {
    group: 'waiting', health: HEALTH.waiting, stage: 'Applied', daysSince,
    cliffSays: "Nothing needed. I'm monitoring this application.",
    waiting: { window: Math.max(7 - daysSince, 1) },
    action: { label: 'Monitoring', type: 'none' }, priority: 5,
  };
}

// Visual timeline steps for one application
export function buildTimeline(app, insight) {
  const closed = app.status === 'rejected';
  const steps = [
    { label: 'Resume Ready', done: app.resumeVersion && app.resumeVersion !== '—' },
    { label: 'Applied', done: true },
    { label: 'Follow-Up Sent', done: (app.followUpCount || 0) > 0 || insight.stage === 'Follow-Up Sent' },
    { label: 'Interview', done: ['interviewing', 'offered'].includes(app.status) },
    { label: 'Offer', done: app.status === 'offered' },
  ];
  if (closed) steps.push({ label: 'Closed', done: true, terminal: true });
  return steps;
}