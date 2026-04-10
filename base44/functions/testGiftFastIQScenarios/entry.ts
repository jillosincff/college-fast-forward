import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// ── Test runner for all 6 GiftFastIQ scenarios ──────────────────────────────
// Admin-only. Uses an in-memory mock store — no real DB writes needed.

const TEST_SCHOOL = 'test_school_giftiq';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let caller = null;
  try { caller = await base44.auth.me(); } catch (_) {}
  const isAdmin = caller && (caller.role === 'admin' || caller.roles?.includes('admin'));
  if (!isAdmin) {
    return Response.json({ error: 'Admin only' }, { status: 403 });
  }

  const results = [];
  const pass = (scenario, note) => { results.push({ scenario, status: 'PASS', note }); console.log('✅', scenario, note); };
  const fail = (scenario, note) => { results.push({ scenario, status: 'FAIL', note }); console.error('❌', scenario, note); };

  // ── In-memory mock store ───────────────────────────────────────────────────
  const store = {};

  const mkParent = (suffix, extra = {}) => {
    const u = {
      id: `parent-${suffix}`,
      full_name: `Test Parent ${suffix}`,
      first_name: 'Test',
      email: `test-parent-${suffix}@giftiq-test.invalid`,
      persona: 'parent',
      school_code: TEST_SCHOOL,
      pending_fastiq_gift_emails: [],
      student_emails: [],
      ...extra,
    };
    store[u.id] = u;
    return u;
  };

  const mkStudent = (suffix, extra = {}) => {
    const u = {
      id: `student-${suffix}`,
      full_name: `Test Student ${suffix}`,
      first_name: 'Test',
      last_name: `Student${suffix}`,
      email: `test-student-${suffix}@giftiq-test.invalid`.toLowerCase(),
      persona: 'student',
      school_code: TEST_SCHOOL,
      ...extra,
    };
    store[u.id] = u;
    return u;
  };

  const getUser = (id) => {
    if (!store[id]) throw new Error(`User not found in store: ${id}`);
    return { ...store[id] };
  };

  const updateUser = (id, updates) => {
    store[id] = { ...store[id], ...updates };
  };

  const filterByEmail = (email) => Object.values(store).filter(u => u.email === email);

  const fastiqActive = (u) => !!(
    u.fastiq_setup_complete || u.subscription_status === 'active' ||
    u.membership_tier === 'fastiq' || u.trial_status === 'active' || u.fastiq_trial_active
  );

  // ── callGift: mirrors giftFastIQToStudent logic using mock store ───────────
  const callGift = (parentId, payload) => {
    const parent = getUser(parentId);
    const { studentId, studentEmail: rawEmail } = payload;
    const studentEmail = rawEmail?.trim().toLowerCase() || null;

    let student = null;
    if (studentId) {
      student = getUser(studentId);
      if (student.school_code !== parent.school_code) return { error: 'school_mismatch' };
    } else if (studentEmail) {
      const r = filterByEmail(studentEmail);
      student = r[0] || null;
    }

    // Already active?
    if (student && fastiqActive(student)) {
      return { status: 'already_active', studentName: student.first_name };
    }

    if (student) {
      const now = new Date();
      const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      updateUser(student.id, {
        fastiq_active: true, is_fastiq: true, fastiq_setup_complete: true,
        membership_tier: 'fastiq', subscription_status: 'active',
        trial_start_date: now.toISOString(), trial_end_date: end.toISOString(),
        trial_status: 'active', fastiq_trial_active: true,
        gifted_by_parent_email: parent.email,
        linked_parent_name: parent.first_name,
      });
      return { status: 'activated', studentName: student.first_name };
    }

    // Pending
    if (studentEmail) {
      const pending = parent.pending_fastiq_gift_emails || [];
      if (!pending.includes(studentEmail)) {
        updateUser(parent.id, { pending_fastiq_gift_emails: [...pending, studentEmail] });
      }
      return { status: 'pending', email: studentEmail };
    }

    return { error: 'not_found' };
  };

  // ── Scenario 1: found, no FastIQ → activates ──────────────────────────────
  try {
    const parent = mkParent('s1');
    const student = mkStudent('S1');
    const res = callGift(parent.id, { studentId: student.id });
    const updated = getUser(student.id);
    if (res.status === 'activated' && fastiqActive(updated) && updated.gifted_by_parent_email === parent.email) {
      pass('Scenario 1', `Trial activated. gifted_by_parent_email set correctly.`);
    } else {
      fail('Scenario 1', `Result: ${JSON.stringify(res)}, fastiqActive: ${fastiqActive(updated)}`);
    }
  } catch (e) { fail('Scenario 1', e.message); }

  // ── Scenario 2: student already has FastIQ → "already covered" ────────────
  try {
    const parent = mkParent('s2');
    mkStudent('S2', { fastiq_trial_active: true, trial_status: 'active', membership_tier: 'fastiq' });
    const s2 = Object.values(store).find(u => u.id === 'student-S2');
    const res = callGift(parent.id, { studentId: s2.id });
    if (res.status === 'already_active') {
      pass('Scenario 2', `Correctly returned already_active.`);
    } else {
      fail('Scenario 2', `Expected already_active, got: ${JSON.stringify(res)}`);
    }
  } catch (e) { fail('Scenario 2', e.message); }

  // ── Scenario 3: multiple same-name, disambiguate by email ─────────────────
  try {
    const parent = mkParent('s3');
    // Two students with the same display name but different emails
    const s3a = mkStudent('S3a');
    const s3b = mkStudent('S3b');
    // Manually set same last name to simulate name collision
    store[s3b.id] = { ...store[s3b.id], last_name: 'StudentS3a', full_name: store[s3a.id].full_name };
    // Parent disambiguates by providing s3a's exact email
    const res = callGift(parent.id, { studentEmail: s3a.email });
    const updatedA = getUser(s3a.id);
    const updatedB = getUser(s3b.id);
    if (res.status === 'activated' && fastiqActive(updatedA) && !fastiqActive(updatedB)) {
      pass('Scenario 3', `Email disambiguation activated only the correct student.`);
    } else {
      fail('Scenario 3', `res: ${JSON.stringify(res)}, s3a active: ${fastiqActive(updatedA)}, s3b active: ${fastiqActive(updatedB)}`);
    }
  } catch (e) { fail('Scenario 3', e.message); }

  // ── Scenario 4: no student found → pending gift stored ────────────────────
  try {
    const parent = mkParent('s4');
    const ghostEmail = `ghost-student-s4@giftiq-test.invalid`;
    const res = callGift(parent.id, { studentEmail: ghostEmail });
    const updatedParent = getUser(parent.id);
    if (res.status === 'pending' && updatedParent.pending_fastiq_gift_emails?.includes(ghostEmail)) {
      pass('Scenario 4', `Pending gift stored for unknown email.`);
    } else {
      fail('Scenario 4', `Result: ${JSON.stringify(res)}, pending: ${JSON.stringify(updatedParent.pending_fastiq_gift_emails)}`);
    }
  } catch (e) { fail('Scenario 4', e.message); }

  // ── Scenario 5: student signs up while pending gift exists → activates ─────
  try {
    const parent = mkParent('s5');
    const pendingEmail = `late-student-s5@giftiq-test.invalid`;
    // Store pending gift on parent
    updateUser(parent.id, { pending_fastiq_gift_emails: [pendingEmail] });

    // Simulate student signup
    const newStudent = mkStudent('S5new', { email: pendingEmail });

    // Replicate createUserFromVerification pending-gift resolution
    const matchingParents = Object.values(store).filter(u =>
      u.persona === 'parent' &&
      Array.isArray(u.pending_fastiq_gift_emails) &&
      u.pending_fastiq_gift_emails.includes(pendingEmail)
    );
    if (matchingParents.length > 0) {
      const p = matchingParents[0];
      const trialStart = new Date();
      const trialEnd = new Date(trialStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      updateUser(newStudent.id, {
        fastiq_active: true, is_fastiq: true, fastiq_setup_complete: true,
        membership_tier: 'fastiq', subscription_status: 'active',
        trial_start_date: trialStart.toISOString(), trial_end_date: trialEnd.toISOString(),
        trial_status: 'active', fastiq_trial_active: true,
        gifted_by_parent_email: p.email,
        linked_parent_name: p.first_name,
      });
      updateUser(p.id, {
        pending_fastiq_gift_emails: (p.pending_fastiq_gift_emails || []).filter(e => e !== pendingEmail),
      });
    }

    const updatedStudent = getUser(newStudent.id);
    const updatedParent = getUser(parent.id);
    if (fastiqActive(updatedStudent) && !updatedParent.pending_fastiq_gift_emails?.includes(pendingEmail)) {
      pass('Scenario 5', `Trial auto-activated on signup. Pending email removed from parent.`);
    } else {
      fail('Scenario 5', `fastiqActive: ${fastiqActive(updatedStudent)}, pendingStillHas: ${updatedParent.pending_fastiq_gift_emails?.includes(pendingEmail)}`);
    }
  } catch (e) { fail('Scenario 5', e.message); }

  // ── Scenario 6: parent gifts same student twice → no duplicate ────────────
  try {
    const parent = mkParent('s6');
    const student = mkStudent('S6');
    const res1 = callGift(parent.id, { studentId: student.id });
    const trialStartAfterFirst = getUser(student.id).trial_start_date;
    // Small delay to ensure timestamps would differ if a second write occurred
    await new Promise(r => setTimeout(r, 10));
    const res2 = callGift(parent.id, { studentId: student.id });
    const trialStartAfterSecond = getUser(student.id).trial_start_date;
    if (res1.status === 'activated' && res2.status === 'already_active' && trialStartAfterFirst === trialStartAfterSecond) {
      pass('Scenario 6', `First gift activated. Second correctly returned already_active. trial_start_date unchanged.`);
    } else {
      fail('Scenario 6', `res1: ${JSON.stringify(res1)}, res2: ${JSON.stringify(res2)}, dates match: ${trialStartAfterFirst === trialStartAfterSecond}`);
    }
  } catch (e) { fail('Scenario 6', e.message); }

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  console.log(`\nTest complete: ${passed} passed, ${failed} failed.`);

  return Response.json({ summary: { passed, failed, total: results.length, cleanedUp: 0 }, results });
});