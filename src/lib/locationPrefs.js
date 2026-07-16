// Work-location preferences — shared constants + helpers.
// Used by onboarding (WorkLocationScreen), the dashboard prompt for existing
// students (LocationPrefPrompt), and the ranking engine (cliffVerdict).

// Primary selection options. `type` values match location_preference_type.
export const LOCATION_OPTIONS = [
  { type: 'school_area', emoji: '🎓', label: 'Near my school' },
  { type: 'home_area', emoji: '🏠', label: 'Near home' },
  { type: 'specific_locations', emoji: '📍', label: 'A specific city or area' },
  { type: 'remote', emoji: '💻', label: 'Remote' },
  { type: 'nationwide', emoji: '🇺🇸', label: 'Anywhere in the U.S.' },
  { type: 'flexible', emoji: '✈️', label: 'Open to relocating' },
  { type: 'unknown', emoji: '🤔', label: 'Not sure yet' },
];

export const CITY_EXAMPLES = ['Tampa, FL', 'New York, NY', 'South Florida', 'Chicago, IL', 'Texas'];

export const FLEXIBILITY_OPTIONS = [
  { key: 'stay', label: 'I need to stay in these locations' },
  { key: 'relocate', label: "I'd relocate for the right opportunity" },
  { key: 'remote_ideal', label: 'Remote is ideal' },
  { key: 'open', label: "I'm open to almost anywhere" },
];

const US_STATE_ABBR = ['al','ak','az','ar','ca','co','ct','de','fl','ga','hi','id','il','in','ia','ks','ky','la','me','md','ma','mi','mn','ms','mo','mt','ne','nv','nh','nj','nm','ny','nc','nd','oh','ok','or','pa','ri','sc','sd','tn','tx','ut','vt','va','wa','wv','wi','wy'];

// Parse a free-text location string into a structured record.
export function normalizeLocation(raw) {
  const display = (raw || '').trim();
  if (!display) return null;
  const parts = display.split(',').map(p => p.trim()).filter(Boolean);
  const rec = { display_label: display, country: 'US' };
  if (parts.length >= 2) {
    rec.city = parts[0];
    rec.state = parts[1];
  } else {
    const one = parts[0];
    // A bare 2-letter token or a known state name → treat as state/region, not city
    if (one.length <= 3 && US_STATE_ABBR.includes(one.toLowerCase())) rec.state = one;
    else rec.metro = one; // e.g. "South Florida", "Texas"
  }
  return rec;
}

// Adapt supporting copy to the student's goal.
export function locationSubcopy(seeking) {
  if (seeking === 'internship') return 'Where would you be willing to spend a summer or semester?';
  if (seeking === 'fulltime') return 'Where would you like to work after graduation?';
  return 'Which locations should I prioritize while we explore?';
}

// Whether the flexibility follow-up adds value for the current selection.
export function needsFlexibilityQuestion(types) {
  const t = new Set(types || []);
  const constrained = t.has('school_area') || t.has('home_area') || t.has('specific_locations');
  const alreadyClear = t.has('flexible') || t.has('nationwide') || t.has('remote') || t.has('unknown');
  return constrained && !alreadyClear;
}

// Derive remote_preference / relocation_openness from selection + flexibility answer.
function deriveFlex(types, flexibility) {
  const t = new Set(types || []);
  let remote_preference = 'unknown';
  let relocation_openness = 'unknown';

  if (t.has('remote')) remote_preference = t.size === 1 ? 'required' : 'preferred';
  if (flexibility === 'remote_ideal') remote_preference = 'preferred';

  if (t.has('flexible') || t.has('nationwide')) relocation_openness = 'yes';
  if (flexibility === 'stay') relocation_openness = 'no';
  else if (flexibility === 'relocate' || flexibility === 'open') relocation_openness = 'yes';
  else if (flexibility === 'remote_ideal') relocation_openness = 'maybe';

  return { remote_preference, relocation_openness };
}

// Build the object we persist onto the User record via updateMe.
export function buildLocationPayload(value) {
  const { types = [], locations = [], flexibility = '' } = value || {};
  const { remote_preference, relocation_openness } = deriveFlex(types, flexibility);
  return {
    preferred_locations: locations,
    location_preference_type: types,
    remote_preference,
    relocation_openness,
    location_flexibility: flexibility || '',
    location_confidence: types.includes('unknown') ? 'low' : 'high',
    location_source: 'onboarding',
    location_updated_at: new Date().toISOString(),
  };
}

// Build high-confidence CLIFF memories from explicit location statements.
export function buildLocationMemories(value, userEmail) {
  if (!userEmail) return [];
  const payload = buildLocationPayload(value);
  const mems = [];
  const push = (category, val) => {
    if (!val) return;
    mems.push({ user_email: userEmail, category, value: String(val).toLowerCase(), source: 'explicit', confidence: 100, signal_count: 1, active: true, pinned: true });
  };
  (payload.preferred_locations || []).forEach(l => push('preferred_locations', l.display_label || l.city || l.metro));
  if ((value?.types || []).includes('school_area')) push('preferred_locations', 'near my school');
  if ((value?.types || []).includes('home_area')) push('preferred_locations', 'near home');
  if (payload.remote_preference && payload.remote_preference !== 'unknown') push('remote_preference', payload.remote_preference);
  return mems;
}

// Short CLIFF acknowledgment after the student answers.
export function buildLocationAck(value) {
  const { types = [], locations = [] } = value || {};
  const t = new Set(types);
  const locLabel = locations.map(l => l.display_label).filter(Boolean).slice(0, 2).join(' and ');
  if (t.has('remote') && locLabel) return `Perfect. I'll prioritize ${locLabel} and remote roles.`;
  if (locLabel) return `Perfect. I'll prioritize ${locLabel}.`;
  if (t.has('school_area')) return "Got it. I'll keep the search close to campus.";
  if (t.has('home_area')) return "Got it. I'll focus the search near home.";
  if (t.has('remote')) return "Great. I'll prioritize remote opportunities.";
  if (t.has('flexible') || t.has('nationwide')) return "Great. I'll cast a wider net and surface only the opportunities worth relocating for.";
  return "No problem. I'll start broad and learn what you prefer over time.";
}

// Read location prefs off a User record for the ranking engine.
export function locationPrefsFromUser(user) {
  if (!user) return null;
  return {
    preferred_locations: user.preferred_locations || [],
    location_preference_type: user.location_preference_type || [],
    remote_preference: user.remote_preference || 'unknown',
    relocation_openness: user.relocation_openness || 'unknown',
    location_flexibility: user.location_flexibility || '',
  };
}