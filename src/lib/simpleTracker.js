// Simple application tracker — status moves from user actions, not alerts.

const DAY_MS = 24 * 60 * 60 * 1000;

// NetworkingPipeline status → tab group
const STATUS_GROUP = {
  applied: 'applied',
  identified: 'applied',
  matched: 'applied',
  reached_out: 'applied',
  messaged: 'applied',
  coffee_chat: 'applied',
  intro_made: 'applied',
  replied: 'waiting',
  interview: 'interviews',
  offer: 'offers',
  no_response: 'done',
};

export const TABS = [
  { id: 'applied', label: 'Applied' },
  { id: 'waiting', label: 'Waiting' },
  { id: 'interviews', label: 'Interviews' },
  { id: 'offers', label: 'Offers' },
  { id: 'done', label: 'Done' },
];

const STATUS_LABELS = {
  applied: { label: 'Waiting on them', color: '#6b7280', bg: '#f3f4f6' },
  identified: { label: 'Waiting on them', color: '#6b7280', bg: '#f3f4f6' },
  matched: { label: 'Waiting on them', color: '#6b7280', bg: '#f3f4f6' },
  reached_out: { label: 'Waiting on them', color: '#6b7280', bg: '#f3f4f6' },
  messaged: { label: 'Waiting on them', color: '#6b7280', bg: '#f3f4f6' },
  replied: { label: 'Waiting on you', color: '#d97706', bg: '#fffbeb' },
  interview: { label: 'Interview', color: '#6d28d9', bg: '#f5f3ff' },
  offer: { label: 'Offer', color: '#059669', bg: '#ecfdf5' },
  no_response: { label: 'Closed', color: '#9ca3af', bg: '#f3f4f6' },
};

export function getStatusGroup(status) {
  return STATUS_GROUP[status] || 'applied';
}

export function getStatusLabel(status) {
  return STATUS_LABELS[status] || STATUS_LABELS.applied;
}

export function getFollowUpSentDate(record) {
  return record.reached_out_date || null;
}

export function daysSince(dateStr) {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / DAY_MS);
}

// Show follow-up nudge if 3+ days since applied, no reply, no follow-up sent
export function needsFollowUp(record) {
  if (getStatusGroup(record.status) !== 'applied') return false;
  if (getFollowUpSentDate(record)) return false;
  return daysSince(record.created_date) >= 3;
}

export function buildFollowUpDraft(record, user) {
  const company = record.company || 'the company';
  const role = record.job_title || 'the role';
  const dateStr = record.created_date
    ? new Date(record.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'recently';
  const school = user?.school_name || user?.school || '';
  const firstName = user?.full_name?.split(' ')[0] || '';
  const schoolClause = school ? `I'm a student at ${school} and ` : '';
  return `Hi ${company} team,

I'm following up on my application for the ${role} role, submitted on ${dateStr}. ${schoolClause}I'd love to know if there's any update on my application status.

Thank you,
${firstName}`.trim();
}

// Available status-transition actions for a given tab group
export function getActions(group) {
  switch (group) {
    case 'applied':
      return [
        { label: 'I heard back', target: 'replied', primary: true },
        { label: 'Interview', target: 'interview' },
        { label: 'Offer', target: 'offer' },
        { label: 'Close', target: 'no_response' },
      ];
    case 'waiting':
      return [
        { label: 'I replied', target: 'applied', primary: true },
        { label: 'Interview', target: 'interview' },
        { label: 'Offer', target: 'offer' },
        { label: 'Close', target: 'no_response' },
      ];
    case 'interviews':
      return [
        { label: 'Offer received', target: 'offer', primary: true },
        { label: 'Close', target: 'no_response' },
      ];
    case 'offers':
      return [
        { label: 'Accept / Close', target: 'no_response', primary: true },
      ];
    case 'done':
      return [
        { label: 'Reopen', target: 'applied', primary: true },
      ];
    default:
      return [];
  }
}

export function formatAppliedDate(dateStr) {
  if (!dateStr) return 'Recently added';
  const diff = daysSince(dateStr);
  const dateLabel = new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (diff === 0) return 'Applied today';
  if (diff === 1) return 'Applied yesterday';
  if (diff <= 7) return `Applied ${diff} days ago`;
  return `Applied ${dateLabel}`;
}

export function formatInterviewDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}