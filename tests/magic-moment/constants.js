// Centralized testids, banned phrases, and helpers for the Magic Moment matrix.
// Keep selectors here so UI renames only need one update.
import { expect } from '@playwright/test';

export const TESTIDS = {
  freeCyclePill: 'mm-free-cycle-pill',
  job: 'mm-job',
  resume: 'mm-resume',
  alumni: 'mm-alumni',
  alumniList: 'mm-alumni-list',
  alumniFallback: 'mm-alumni-fallback',
  outreachDraft: 'mm-outreach-draft',
  copySend: 'mm-copy-send',
  copyConfirmation: 'mm-copy-confirmation',
  softWallModal: 'soft-wall-modal',
  softWallUpgrade: 'soft-wall-upgrade',
  ctaUpgrade: 'cta-upgrade',
  ctaParent: 'cta-parent',
};

// Phrases the outreach draft must never contain (brand-safety guardrails).
export const BANNED_PHRASES = ['fellow student', 'go gators', 'go gators!'];

export const byTestId = (id) => `[data-testid="${id}"]`;

// Magic Moment lives at the hash route /#/MagicMoment
export const MAGIC_MOMENT_URL = '/#/MagicMoment';

// Navigate to Magic Moment and wait for the cycle to finish (results render)
// OR a soft wall / error to appear. Returns once the results screen is up.
export async function runMagicMoment(page) {
  await page.goto(MAGIC_MOMENT_URL);
  // The cycle shows a loading phase first, then renders results. Wait for any
  // terminal surface to appear.
  await page.waitForSelector(
    `${byTestId(TESTIDS.job)}, ${byTestId(TESTIDS.softWallModal)}, .text-destructive`,
    { timeout: 170_000 },
  );
}

// Assert a block is present and has non-empty visible text (no empty blocks).
export async function expectBlockFilled(page, testid) {
  const el = page.locator(byTestId(testid));
  await expect(el).toBeVisible();
  const text = (await el.innerText()).trim();
  if (text.length < 3) throw new Error(`Block ${testid} rendered empty`);
  return text;
}