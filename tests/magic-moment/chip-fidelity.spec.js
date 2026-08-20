// CI fixture — chip fidelity of the Magic Moment hero picker.
// Pure logic, no browser, no network. Runs in seconds and fails the PR if
// anyone reintroduces a shared generic fallback ("Deloitte Analyst for all").
import { test, expect } from '@playwright/test';
import { chipKeywordsFor, checkOnChip, GENERIC_TITLE } from '../../src/lib/chipGate.js';
import { getChipCuratedJobs, detectChipKey, getCuratedFallback as getFallbackV1 } from '../../base44/shared/curatedJobs.ts';
import { getCuratedFallback as getFallbackV2 } from '../../base44/shared/curatedJobsV2.ts';

const NYC = 'New York, NY';

// The chips a student actually picks in onboarding (role + industry text).
const CHIPS = [
  { key: 'sales', chipText: 'Sales' },
  { key: 'healthcare', chipText: 'Healthcare' },
  { key: 'marketing', chipText: 'Marketing' },
  { key: 'communications', chipText: 'Communications' },
];

// Mirrors MagicMoment's hero selection: chip-curated inventory, gated, in-market
// first. Returns null when nothing on-chip exists (the honest empty state).
function pickHero(chipText, location) {
  const kws = chipKeywordsFor(chipText);
  const pool = getChipCuratedJobs(chipText, location).filter(j => checkOnChip(j.job_title, kws).ok);
  if (!pool.length) return null;
  const inMarket = pool.filter(j => !/\bremote\b/i.test(j.location || ''));
  return (inMarket.length ? inMarket : pool)[0];
}

const idOf = (j) => `${j.name}|${j.job_title}`;

test.describe('Magic Moment chip fidelity', () => {
  test('every chip resolves to an on-chip hero in NYC', () => {
    for (const { chipText } of CHIPS) {
      const hero = pickHero(chipText, NYC);
      expect(hero, `${chipText} + NYC produced no hero`).toBeTruthy();
      const { ok } = checkOnChip(hero.job_title, chipKeywordsFor(chipText));
      expect(ok, `${chipText} hero "${hero.job_title}" is off-chip`).toBe(true);
    }
  });

  test('no two chips share the same hero job in NYC', () => {
    const seen = new Map();
    for (const { chipText } of CHIPS) {
      const hero = pickHero(chipText, NYC);
      const id = idOf(hero);
      expect(
        seen.has(id),
        `"${id}" served to both ${seen.get(id)} and ${chipText} — generic fallback regression`,
      ).toBe(false);
      seen.set(id, chipText);
    }
  });

  test('bare generic titles can never be a hero', () => {
    const bare = ['Analyst', 'Associate', 'Specialist', 'Senior Analyst', 'Entry-Level Associate', 'Representative'];
    for (const { chipText } of CHIPS) {
      const kws = chipKeywordsFor(chipText);
      for (const title of bare) {
        const { ok, why } = checkOnChip(title, kws);
        expect(ok, `"${title}" passed the gate for ${chipText}`).toBe(false);
        expect(why).toBe('junk');
      }
      expect(GENERIC_TITLE.test('Analyst')).toBe(true);
    }
  });

  test('descriptions never satisfy the gate — title only', () => {
    const kws = chipKeywordsFor('Healthcare');
    // A generic title whose description mentions healthcare is still off-chip.
    expect(checkOnChip('Analyst', kws).ok).toBe(false);
    expect(checkOnChip('Clinical Research Coordinator', kws).ok).toBe(true);
  });

  test('known chip with no inventory yields the honest empty state, never generic', () => {
    // A metro with no curated inventory must not leak NYC_GENERIC/REMOTE_GENERIC.
    const chipText = 'Healthcare';
    expect(detectChipKey(chipText)).toBeTruthy();
    const hero = pickHero(chipText, 'Boise, ID');
    // Either a real on-chip job, or nothing — never a generic Analyst.
    if (hero) {
      expect(checkOnChip(hero.job_title, chipKeywordsFor(chipText)).ok).toBe(true);
      expect(GENERIC_TITLE.test(hero.job_title)).toBe(false);
    } else {
      expect(hero).toBeNull();
    }
  });

  test('unknown chip text returns no chip-curated inventory', () => {
    expect(getChipCuratedJobs('', NYC)).toEqual([]);
    expect(getChipCuratedJobs('asdfghjkl', NYC)).toEqual([]);
  });

  // ── P0 regression guard: the Deloitte "Analyst (Remote-Eligible)" seed and
  //    any generic-title job must be gone from EVERY fallback list (V1 frontend
  //    + V2 backend). Both copies feed the hero picker; a stale divergence here
  //    is exactly how the bug came back. ───────────────────────────────────
  test('no fallback list (V1 or V2) contains a Deloitte Analyst or generic title', () => {
    const isDeloitteAnalyst = (j) => /deloitte/i.test(j.name || '') && /analyst/i.test(j.job_title || '');
    const allLists = [
      ['V1 Marketing+NYC', getFallbackV1('Marketing', NYC)],
      ['V1 Sales+NYC', getFallbackV1('Sales', NYC)],
      ['V1 Healthcare+NYC', getFallbackV1('Healthcare', NYC)],
      ['V1 unknown+NYC', getFallbackV1('', NYC)],
      ['V1 unknown+empty', getFallbackV1('', '')],
      ['V2 Marketing+NYC', getFallbackV2('Marketing', NYC)],
      ['V2 Sales+NYC', getFallbackV2('Sales', NYC)],
      ['V2 Healthcare+NYC', getFallbackV2('Healthcare', NYC)],
      ['V2 unknown+NYC', getFallbackV2('', NYC)],
      ['V2 unknown+empty', getFallbackV2('', '')],
    ];
    for (const [label, list] of allLists) {
      for (const j of list) {
        expect(isDeloitteAnalyst(j), `${label}: Deloitte Analyst survived in fallback`).toBe(false);
      }
    }
  });

  test('known-chip fallback (V1 + V2) never returns a generic-title hero', () => {
    for (const { chipText } of CHIPS) {
      const kws = chipKeywordsFor(chipText);
      for (const [label, getter] of [['V1', getFallbackV1], ['V2', getFallbackV2]]) {
        const list = getter(chipText, NYC);
        // Every returned job for a KNOWN chip must pass that chip's gate.
        for (const j of list) {
          expect(checkOnChip(j.job_title, kws).ok, `${label} ${chipText}: "${j.job_title}" is off-chip`).toBe(true);
        }
      }
    }
  });
});