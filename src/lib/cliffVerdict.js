// CLIFF Confidence Engine — deterministic, honest verdicts from real signals.
// No percentages, no fake precision. Just coaching.

export const TIER_DISPLAY = {
  best: { icon: '🔥', label: 'Best Opportunity', line: 'Worth applying today.', bg: '#fff7ed', border: '#fdba74', text: '#c2410c' },
  good: { icon: '⭐', label: 'Good Opportunity', line: 'Worth applying if you have time.', bg: '#eef2ff', border: '#c7d2fe', text: '#4338ca' },
  low: { icon: '⚪', label: 'Low Priority', line: "I'd focus elsewhere.", bg: '#f9fafb', border: '#e5e7eb', text: '#6b7280' },
};

export function computeCliffVerdict(lead, ctx = {}) {
  const { memories = [], careerGoals = {}, pursuit = null, locationPrefs = null } = ctx;
  const role = (lead.role || lead.job_title || '').toLowerCase();
  const location = (lead.location || lead.location_text || '').toLowerCase();

  const reasons = [];
  const cautions = [];
  let score = 0;

  // Role fit vs stated goals
  const targets = [careerGoals.target_role, ...(careerGoals.target_roles || [])]
    .filter(Boolean).map(t => t.toLowerCase());
  const industries = (careerGoals.target_industries || []).map(i => i.toLowerCase());
  const targetHit = targets.find(t => role.includes(t) || t.includes(role));
  const industryHit = industries.find(i => role.includes(i));
  if (targetHit) { score += 3; reasons.push(`Strong ${targetHit} fit`); }
  else if (industryHit) { score += 2; reasons.push(`Matches your ${industryHit} focus`); }
  else if (targets.length || industries.length) { score -= 1; cautions.push('Outside your stated targets'); }

  // Explicit work-location preferences (onboarding / dashboard prompt)
  const lp = locationPrefs || {};
  const prefLocs = (lp.preferred_locations || [])
    .map(l => (l.display_label || l.city || l.metro || l.state || '').toLowerCase())
    .filter(Boolean);
  const isRemoteLead = /remote/.test(location) || lead.is_remote === true;
  const strictLocation = lp.location_flexibility === 'stay' || lp.relocation_openness === 'no';

  if (isRemoteLead && ['required', 'preferred'].includes(lp.remote_preference)) {
    score += 2; reasons.push('Remote role — you marked remote as preferred');
  }
  if (prefLocs.length) {
    const locMatch = prefLocs.find(p => location.includes(p) || (p.includes(',') && location.includes(p.split(',')[0].trim())));
    if (locMatch) { score += 2; reasons.push(`Matches your ${locMatch} preference`); }
    else if (!isRemoteLead && location) {
      if (strictLocation) { score -= 3; cautions.push('Outside your required locations'); }
      else if (lp.relocation_openness === 'yes') { cautions.push('Outside your preferred area — surfaced because the fit is strong'); }
      else { score -= 1; cautions.push('Outside your preferred area'); }
    }
  }

  // CLIFF memory alignment
  for (const m of memories) {
    const v = (m.value || '').toLowerCase();
    if (!v) continue;
    if (m.category === 'preferred_locations' && !prefLocs.length && location.includes(v)) { score += 2; reasons.push(`Matches your ${m.value} preference`); }
    else if (m.category === 'preferred_industries' && role.includes(v) && !industryHit) { score += 1; reasons.push(`Fits your interest in ${m.value}`); }
    else if (m.category === 'disliked_industries' && role.includes(v)) { score -= 2; cautions.push(`You've been skipping ${m.value} roles`); }
  }

  // Warm network advantage
  if (lead.hasAlumni || (lead.alumniCount || 0) > 0 || (lead.parentCount || 0) > 0) {
    score += 3; reasons.push('Warm connection available — real advantage');
  } else {
    cautions.push('No networking advantage yet');
  }

  // Timing
  if (lead.posted_date) {
    const days = Math.floor((Date.now() - new Date(lead.posted_date)) / 86400000);
    if (days >= 0 && days <= 3) { score += 2; reasons.push('Fresh posting — early applicants stand out'); }
    else if (days > 21) { score -= 1; cautions.push('Posting is getting old'); }
  }

  // Existing progress
  if (pursuit) {
    score += 2;
    if (['ready_for_review', 'approved', 'complete'].includes(pursuit.resume_status)) reasons.push('Resume already aligned');
    else reasons.push("You've already started on this one");
  }

  let tier, verdict;
  if (score >= 5) { tier = 'best'; verdict = 'pursue'; }
  else if (score >= 2) { tier = 'good'; verdict = 'consider'; }
  else { tier = 'low'; verdict = 'skip'; }

  return { tier, verdict, score, reasons: reasons.slice(0, 4), cautions: cautions.slice(0, 3) };
}