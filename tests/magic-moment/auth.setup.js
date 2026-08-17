import { test as setup, expect } from '@playwright/test';

// Logs each fixture account in via the GatorAuth email/password flow and saves
// the authenticated session to tests/.auth/<name>.json. Fixture accounts must
// already exist in the platform (create them once via the app or createTestUser)
// and are configured through CI secrets / a local .env.
//
// Required env:
//   ADMIN_EMAIL / ADMIN_PASSWORD
//   USER_EMAIL / USER_PASSWORD            (student with a resume + alumni company)
//   NO_RESUME_EMAIL / NO_RESUME_PASSWORD  (student with no resume uploaded)
//   ZERO_ALUMNI_EMAIL / ZERO_ALUMNI_PASSWORD (student whose target company has no alumni)
//   API_EMAIL / API_PASSWORD              (dedicated account for API/shape tests)
//
// All fixture accounts share the same school_code as the seeded alumni so the
// alumni fixture surfaces for them.

const AUTH_ROUTE = '/#/GatorAuth';

async function loginAs(page, email, password, label) {
  if (!email || !password) throw new Error(`Missing credentials for ${label} (set the env vars).`);
  await page.goto(AUTH_ROUTE);
  // The email/password fallback form. Fill by input type to stay resilient to
  // label/placeholder copy changes.
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: /sign in|log in|continue|get started/i }).click();
  // Wait until we've left the auth screen.
  await page.waitForURL((url) => !url.hash.toLowerCase().includes('gatorauth'), { timeout: 60_000 });
}

const save = (name) => `tests/.auth/${name}.json`;

setup('authenticate admin', async ({ page }) => {
  await loginAs(page, process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD, 'admin');
  await page.context().storageState({ path: save('admin') });
});

setup('authenticate user (with resume)', async ({ page }) => {
  await loginAs(page, process.env.USER_EMAIL, process.env.USER_PASSWORD, 'user');
  await page.context().storageState({ path: save('user') });
});

setup('authenticate no-resume student', async ({ page }) => {
  await loginAs(page, process.env.NO_RESUME_EMAIL, process.env.NO_RESUME_PASSWORD, 'no-resume');
  await page.context().storageState({ path: save('noresume') });
});

setup('authenticate zero-alumni student', async ({ page }) => {
  await loginAs(page, process.env.ZERO_ALUMNI_EMAIL, process.env.ZERO_ALUMNI_PASSWORD, 'zero-alumni');
  await page.context().storageState({ path: save('zeroalumni') });
});

setup('authenticate api test account', async ({ page }) => {
  await loginAs(page, process.env.API_EMAIL, process.env.API_PASSWORD, 'api');
  await page.context().storageState({ path: save('api') });
});