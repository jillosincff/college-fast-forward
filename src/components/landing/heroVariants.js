import { base44 } from '@/api/base44Client';

// A/B testable hero headline variants. Default: A.
// Force a variant with ?hv=a|b|c (persists for the session) — no rebuild needed.
export const HERO_VARIANTS = {
  a: { line1: 'You live your college life.', line2: 'CLIFF stays on top of your career.' },
  b: { line1: 'Too many jobs.', line2: 'One clear plan.' },
  c: { line1: 'From \u201CWhere do I even start?\u201D', line2: 'to \u201CI got this.\u201D' },
};

export function getHeroVariant() {
  try {
    const search = new URLSearchParams(window.location.search);
    const hashQuery = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
    const hash = new URLSearchParams(hashQuery);
    const forced = (search.get('hv') || hash.get('hv') || '').toLowerCase();
    if (HERO_VARIANTS[forced]) {
      localStorage.setItem('cff_hero_variant', forced);
      return forced;
    }
    const stored = localStorage.getItem('cff_hero_variant');
    if (HERO_VARIANTS[stored]) return stored;
    localStorage.setItem('cff_hero_variant', 'a');
  } catch {}
  return 'a';
}

// Funnel events downstream (onboarding started/completed, magic moment,
// first meaningful progress, Pro conversion) can join on the stored
// cff_hero_variant value via this shared tracker.
export function trackHeroEvent(eventName, variant) {
  try {
    base44.analytics.track({ eventName, properties: { hero_variant: variant || getHeroVariant() } });
  } catch {}
}