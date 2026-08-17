import { test, expect } from '@playwright/test';
import { invokeInPage } from './helpers';
import { BANNED_PHRASES } from './constants';

// API-level checks for the Magic Moment cycle: response shape, the free-cycle
// flag, and upgrade_required on the second run. These run inside a browser
// page so the Base44 SDK is initialized exactly as the app uses it.

test('getLiveJobMatchesFn returns a non-empty job array with required fields [critical]', async ({ page }) => {
  await page.goto('/'); // initialize the SDK
  const res = await invokeInPage(page, 'getLiveJobMatchesFn', {
    career_goals: { role: 'Software Engineer', industries: ['Technology'], locations: [], seeking: 'both' },
    force_refresh: true,
  });
  const companies = res?.companies || [];
  expect(companies.length, 'expected at least one job match').toBeGreaterThan(0);
  const top = companies[0];
  expect(top).toHaveProperty('job_title');
  expect(top).toHaveProperty('name');
  expect(String(top.job_title).length).toBeGreaterThan(0);
});

test('findWorkspaceConnections returns a connections array or upgrade_required [critical]', async ({ page }) => {
  await page.goto('/');
  const res = await invokeInPage(page, 'findWorkspaceConnections', {
    companyName: 'Meridian Labs', targetRole: 'Software Engineer', magic_moment: true,
  });
  expect(res).toBeTruthy();
  expect('upgrade_required' in res || Array.isArray(res.connections)).toBeTruthy();
});

test('generateOutreachDraft returns a non-empty message free of banned phrases [critical]', async ({ page }) => {
  await page.goto('/');
  const res = await invokeInPage(page, 'generateOutreachDraft', {
    studentName: 'Test Student', major: 'Technology', targetRole: 'Software Engineer',
    graduationYear: '2027', school: 'UF', alumniName: 'Maya Chen',
    alumniTitle: 'Senior Software Engineer', alumniCompany: 'Meridian Labs',
    cold: false, magic_moment: true,
  });
  expect(res).toBeTruthy();
  const message = String(res?.message || res?.body || '');
  expect(message.length, 'outreach message was empty').toBeGreaterThan(20);
  const lower = message.toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    expect(lower, `outreach contained banned phrase "${phrase}"`).not.toContain(phrase);
  }
});

test('completeMagicMoment marks the free cycle and second outreach returns upgrade_required', async ({ page }) => {
  await page.goto('/');
  // First run within the cycle is allowed.
  const first = await invokeInPage(page, 'generateOutreachDraft', {
    studentName: 'Test Student', major: 'Technology', targetRole: 'Software Engineer',
    graduationYear: '2027', school: 'UF', alumniName: 'Maya Chen',
    alumniTitle: 'Senior Software Engineer', alumniCompany: 'Meridian Labs',
    cold: false, magic_moment: true,
  });
  expect(first).toBeTruthy();
  expect(first?.upgrade_required).toBeFalsy();

  // Mark the one-time free cycle complete.
  const done = await invokeInPage(page, 'completeMagicMoment', {});
  expect(done?.success !== false).toBeTruthy();

  // Second run must be gated.
  const second = await invokeInPage(page, 'generateOutreachDraft', {
    studentName: 'Test Student', major: 'Technology', targetRole: 'Software Engineer',
    graduationYear: '2027', school: 'UF', alumniName: 'Maya Chen',
    alumniTitle: 'Senior Software Engineer', alumniCompany: 'Meridian Labs',
    cold: false, magic_moment: true,
  });
  expect(second?.upgrade_required, 'second outreach did not return upgrade_required').toBe(true);
});