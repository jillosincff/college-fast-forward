export const dmSans = "'DM Sans', system-ui, sans-serif";
export const playfair = "'Playfair Display', Georgia, serif";

export const STAGES = [
  { key: 'matched', label: 'Matched', dot: '#888', bg: 'rgba(0,0,0,0.04)', color: '#888', border: 'rgba(0,0,0,0.1)' },
  { key: 'messaged', label: 'Messaged', dot: '#1565c0', bg: 'rgba(33,150,243,0.08)', color: '#1565c0', border: 'rgba(33,150,243,0.2)' },
  { key: 'replied', label: 'Replied', dot: '#6a1b9a', bg: 'rgba(156,39,176,0.08)', color: '#6a1b9a', border: 'rgba(156,39,176,0.2)' },
  { key: 'coffee_chat', label: 'Coffee Chat', dot: '#e65100', bg: 'rgba(255,152,0,0.08)', color: '#e65100', border: 'rgba(255,152,0,0.25)' },
  { key: 'intro_made', label: 'Intro Made', dot: '#2e7d32', bg: 'rgba(76,175,80,0.08)', color: '#2e7d32', border: 'rgba(76,175,80,0.2)' },
  { key: 'offer', label: 'Offer', dot: '#E85D20', bg: 'rgba(232,93,32,0.1)', color: '#E85D20', border: 'rgba(232,93,32,0.3)' },
];

export const SOURCE_LABELS = {
  top_match: 'Top Match', strong_match: 'Strong Match', fastiq: 'FASTIQ',
  community: 'Community', manual: 'Manual', cff: 'Community',
};

export const AVATAR_COLORS = ['#0d1117', '#2a4a8a', '#3a5a3a', '#4a3a6a', '#c62828', '#5a4a2a'];

export function getStage(key) {
  return STAGES.find(s => s.key === key) || STAGES[0];
}

export function daysSince(dateStr) {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

export function firstName(fullName) {
  if (!fullName) return 'them';
  return fullName.split(/[\s,]+/)[0];
}