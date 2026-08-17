import { test, expect } from '@playwright/test';
import {
  TESTIDS, BANNED_PHRASES, byTestId, runMagicMoment, expectBlockFilled, MAGIC_MOMENT_URL,
} from './constants';

// ── Full cycle renders all four artifacts [critical] ──────────────────────
test('Magic Moment renders all four artifacts [critical]', async ({ page }) => {
  await runMagicMoment(page);

  await expectBlockFilled(page, TESTIDS.job);
  await expectBlockFilled(page, TESTIDS.resume);
  // Alumni block: either a list or the fallback is acceptable — but not empty.
  const alumniList = page.locator(byTestId(TESTIDS.alumniList));
  const alumniFallback = page.locator(byTestId(TESTIDS.alumniFallback));
  await expect(alumniList.or(alumniFallback)).toBeVisible();
  await expectBlockFilled(page, TESTIDS.outreachDraft);
});

// ── Outreach draft is non-empty and rejects banned phrases [critical] ─────
test('outreach draft is non-empty and free of banned phrases [critical]', async ({ page }) => {
  await runMagicMoment(page);
  const text = await expectBlockFilled(page, TESTIDS.outreachDraft);
  expect(text.length).toBeGreaterThan(20);
  const lower = text.toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    expect(lower, `outreach contained banned phrase "${phrase}"`).not.toContain(phrase);
  }
});

// ── Copy shows confirmation (outreach_copied) [critical] ─────────────────
test('copy message shows confirmation and is verifiable [critical]', async ({ page }) => {
  await runMagicMoment(page);
  await expect(page.locator(byTestId(TESTIDS.copySend))).toBeVisible();
  await page.locator(byTestId(TESTIDS.copySend)).click();
  // The confirmation element only renders after a successful copy — its
  // presence is the verifiable signal that trackOutreachCopied fired.
  await expect(page.locator(byTestId(TESTIDS.copyConfirmation))).toBeVisible({ timeout: 10_000 });
});

// ── No-resume path still shows a resume artifact (starter/profile) ───────
test.describe('no-resume student', () => {
  test.use({ storageState: 'tests/.auth/noresume.json' });
  test('shows starter resume artifact when no resume is uploaded [critical]', async ({ page }) => {
    await runMagicMoment(page);
    const resume = page.locator(byTestId(TESTIDS.resume));
    await expect(resume).toBeVisible();
    const text = (await resume.innerText()).trim();
    expect(text.length).toBeGreaterThan(3);
    // A download button (not just an upload prompt) proves an artifact was generated.
    await expect(resume.getByRole('button', { name: /download/i })).toBeVisible();
  });
});

// ── No-alumni path shows the fallback, not an empty block ────────────────
test.describe('zero-alumni company', () => {
  test.use({ storageState: 'tests/.auth/zeroalumni.json' });
  test('shows alumni fallback, not an empty state [critical]', async ({ page }) => {
    await runMagicMoment(page);
    await expect(page.locator(byTestId(TESTIDS.alumniFallback))).toBeVisible();
    await expect(page.locator(byTestId(TESTIDS.alumniList))).toHaveCount(0);
    const text = (await page.locator(byTestId(TESTIDS.alumniFallback)).innerText()).trim();
    expect(text.length).toBeGreaterThan(10);
  });
});

// ── After the free cycle, a second attempt shows the soft wall ────────────
test('second cycle attempt shows soft wall with Upgrade + Ask a parent [critical]', async ({ page }) => {
  // First visit consumes the one-time free cycle.
  await runMagicMoment(page);
  await expect(page.locator(byTestId(TESTIDS.job))).toBeVisible();

  // Second visit must hit the hard paywall (soft wall) on a gated step.
  await page.goto(MAGIC_MOMENT_URL);
  await expect(page.locator(byTestId(TESTIDS.softWallModal))).toBeVisible({ timeout: 170_000 });
  await expect(page.locator(byTestId(TESTIDS.softWallUpgrade))).toBeVisible();
  await expect(page.locator(byTestId(TESTIDS.ctaParent))).toBeVisible();
  // Both CTAs are reachable from the soft wall (it hands off to the hard paywall).
  await page.locator(byTestId(TESTIDS.softWallUpgrade)).click();
  await expect(page.locator(byTestId(TESTIDS.ctaUpgrade))).toBeVisible({ timeout: 10_000 });
  await expect(page.locator(byTestId(TESTIDS.ctaParent))).toBeVisible();
});