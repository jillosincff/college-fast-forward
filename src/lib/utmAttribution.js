// First-touch UTM + referral attribution for student signups.
// UTMs are captured once on first visit (localStorage) and persisted onto the
// User record the first time a student is finalized (onboarding completion).
// Never overwrites an existing attribution — first-touch wins.

const UTM_KEY = 'cff_utm';
const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

function readUrlParams() {
  const params = new URLSearchParams();
  try {
    const search = new URLSearchParams(window.location.search);
    for (const k of UTM_PARAMS) {
      const v = search.get(k);
      if (v) params.set(k, v);
    }
  } catch (e) {}
  try {
    const hash = window.location.hash || '';
    const hashQuery = hash.split('?')[1] || '';
    const hashParams = new URLSearchParams(hashQuery);
    for (const k of UTM_PARAMS) {
      const v = hashParams.get(k);
      if (v && !params.has(k)) params.set(k, v);
    }
  } catch (e) {}
  return params;
}

// Capture UTMs on first visit. First-touch wins — never overwrite an existing cff_utm.
export function captureUtm() {
  try {
    if (localStorage.getItem(UTM_KEY)) return;
    const params = readUrlParams();
    const hasAny = UTM_PARAMS.some(k => params.has(k));
    if (!hasAny) return;
    const data = { captured_at: new Date().toISOString() };
    for (const k of UTM_PARAMS) {
      const v = params.get(k);
      if (v) data[k] = v;
    }
    localStorage.setItem(UTM_KEY, JSON.stringify(data));
  } catch (e) { /* private browsing */ }
}

export function getUtm() {
  try {
    const raw = localStorage.getItem(UTM_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) { return null; }
}

function getReferralCode() {
  try {
    return localStorage.getItem('pendingReferralCode')
      || localStorage.getItem('cff_parent_ref_code')
      || '';
  } catch (e) { return ''; }
}

// Build the attribution fields to spread into the first updateMe that finalizes
// a student. signup_source: utm_source if present, else "referral" if a referral
// code exists, else "direct". Only includes non-empty UTM fields.
export function getSignupAttribution() {
  const utm = getUtm() || {};
  const referralCode = getReferralCode();
  const utmSource = utm.utm_source || '';
  const signupSource = utmSource || (referralCode ? 'referral' : 'direct');
  const out = { signup_source: signupSource };
  if (utmSource) out.utm_source = utmSource;
  if (utm.utm_medium) out.utm_medium = utm.utm_medium;
  if (utm.utm_campaign) out.utm_campaign = utm.utm_campaign;
  if (utm.utm_content) out.utm_content = utm.utm_content;
  if (utm.utm_term) out.utm_term = utm.utm_term;
  if (referralCode) out.referral_code = referralCode;
  return out;
}