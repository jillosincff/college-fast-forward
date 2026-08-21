// Release-bar test for the Magic Moment gates. Pure logic, no browser, no
// network — fails the PR if anyone weakens a gate so that a dead Apply, a
// costume title, a missing stack, or an invented person could ship.
// Live-path verification (Sales/Marketing/Comms + NYC) runs via the
// runMagicMomentScenario backend function.
import { test, expect } from '@playwright/test';
import { gateJobRealSync, gateJobMatches, gatePersonReal, gateDraftHonest, gateVolume } from '../../src/lib/magicMomentGates.js';

const freshIso = () => new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

test('Gate 1 — dead apply URL fails (no Apply on a closed role)', () => {
  expect(gateJobRealSync(null).ok).toBe(false);
  expect(gateJobRealSync({ job_title: 'X' }).ok).toBe(false);            // no url
  expect(gateJobRealSync({ job_url: 'https://x.com/j/1' }).ok).toBe(false); // no date
  expect(gateJobRealSync({ job_url: 'https://x.com/j/1', posted_date: freshIso() }).ok).toBe(true);
});

test('Gate 2 — costume title fails chip (no "matches your Sales" on Analyst)', () => {
  expect(gateJobMatches({ job_title: 'Analyst' }, 'Sales').ok).toBe(false);
  expect(gateJobMatches({ job_title: 'Analyst (Remote)' }, 'Sales').ok).toBe(false);
  expect(gateJobMatches({ job_title: 'Sales Development Representative' }, 'Sales').ok).toBe(true);
  expect(gateJobMatches({ job_title: 'Marketing Coordinator' }, 'Marketing').ok).toBe(true);
  expect(gateJobMatches({ job_title: 'Communications Specialist' }, 'Communications').ok).toBe(true);
});

test('Gate 3 — invented person fails (no source, no name)', () => {
  expect(gatePersonReal(null).ok).toBe(false);
  expect(gatePersonReal({ name: 'Danny', role_title: 'Affiliate' }).ok).toBe(false); // no source
  expect(gatePersonReal({ name: '', source_url: 'https://x.com' }).ok).toBe(false);
  expect(gatePersonReal({ name: 'Danny', role_title: 'Affiliate', company: 'VistaPrint', source_url: 'https://linkedin.com/in/x' }).ok).toBe(true);
});

test('Gate 4 — draft claiming applied when not live fails', () => {
  expect(gateDraftHonest({ message: 'hi' }, { applied: true, live: false }).ok).toBe(false);
  expect(gateDraftHonest({ message: 'hi' }, { applied: false, live: false }).ok).toBe(true);
  expect(gateDraftHonest(null, { applied: false, live: false }).ok).toBe(false);
});

test('Gate 6 — missing stack fails (≥4 on-chip roles on first screen)', () => {
  expect(gateVolume([]).ok).toBe(false);
  expect(gateVolume([1, 2, 3]).ok).toBe(false);
  expect(gateVolume([1, 2, 3, 4]).ok).toBe(true);
});