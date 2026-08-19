// CI fixture — chip fidelity of the Magic Moment hero picker.
// Pure logic, no browser, no network. Runs in seconds and fails the PR if
// anyone reintroduces a shared generic fallback ("Deloitte Analyst for all").
import { test, expect } from '@playwright/test';
import { chipKeywordsFor, checkOnChip, GENERIC_TITLE } from '../../src/lib/chipGate.js';
import { getChipCuratedJobs, detectChipKey } from '../../base44/shared/curatedJobs.ts';

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
});