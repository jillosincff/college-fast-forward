import { test, expect } from '@playwright/test';

// Seeds Magic Moment fixtures (known alumni + zero-alumni company) before the
// E2E/API suites run. Authenticates as the admin fixture account.
import { base44Endpoint } from './helpers';

test('seed Magic Moment fixtures [critical]', async ({ request }) => {
  const schoolCode = process.env.FIXTURE_SCHOOL_CODE || 'UF';
  const alumniCompany = process.env.FIXTURE_ALUMNI_COMPANY || 'Meridian Labs';
  const zeroAlumniCompany = process.env.FIXTURE_ZERO_ALUMNI_COMPANY || 'Zyzzyx Test Corp';

  const res = await request.post(`${base44Endpoint()}/seedMagicMomentFixtures`, {
    data: { school_code: schoolCode, alumni_company: alumniCompany, zero_alumni_company: zeroAlumniCompany },
  });
  expect(res.ok(), `seed failed: ${res.status()}`).toBeTruthy();
  const body = await res.json();
  expect(body.success).toBe(true);
  expect(body.school_code).toBe(schoolCode);
  expect(body.alumni_company).toBe(alumniCompany);
  expect(body.zero_alumni_company).toBe(zeroAlumniCompany);
});