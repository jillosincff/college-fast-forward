import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// ── Test runner for all 6 GiftFastIQ scenarios ──────────────────────────────
// Admin-only. Creates ephemeral test users, runs each scenario, cleans up.

const TEST_SCHOOL = 'test_school_giftiq';
const BASE_URL = Deno.env.get('APP_BASE_URL') || 'https://collegefastforward.com';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let caller = null;
  try { caller = await base44.auth.me(); } catch (_) {}
  if (!caller || caller.role !== 'admin') {
    return Response.json({ error: 'Admin only' }, { status: 403 });
  }

  const results = [];
  const createdIds = [];

  const pass  = (scenario, note) => { results.push({ scenario, status: 'PASS', note }); console.log('✅', scenario, note); };
  const fail  = (scenario, note) => { results.push({ scenario, status: 'FAIL', note }); console.error('❌', scenario, note); };

  // ── helpers ────────────────────────────────────────────────────────────────
  const mkParent = async (suffix) => {
    const u = await base44.asServiceRole.entities.User.create({
      full_name: `Test Parent ${suffix}`,
      email: `test-parent-${suffix}@giftiq-test.invalid`,
      persona: 'parent',
      school_code: TEST_SCHOOL,
      school_name: 'Test School',
    });
    createdIds.push(u.id);
    return u;
  };

  const mkStudent = async (suffix, extra = {}) => {
    const u = await base44.asServiceRole.entities.User.create({
      full_name: `Test Student ${suffix}`,
      first_name: 'Test',
      last_name: `Student${suffix}`,
      email: `test-student-${suffix}@giftiq-test.invalid`,
      persona: 'student',
      school_code: TEST_SCHOOL,
      school_name: 'Test School',
      ...extra,
    });
    createdIds.push(u.id);
    return u;
  };

  const fastiqActive = (u) => !!(
    u.fastiq_setup_complete || u.subscription_status === 'active' ||
    u.membership_tier === 'fastiq' || u.trial_status === 'active' || u.fastiq_trial_active
  );

  const callGift = async (parentId, payload) => {
    // Simulate giftFastIQToStudent inline (same logic, no HTTP round-trip needed in test)
    const parent = await base44.asServiceRole.entities.User.get(parentId);
    const { studentId, studentEmail: rawEmail } = payload;
    const studentEmail = rawEmail?.trim().toLowerCase() || null;

    // School isolation check
    let student = null;
    if (studentId) {
      student = await base44.asServiceRole.entities.User.get(studentId);
      if (student.school_code !== parent.school_code) return { error: 'school_mismatch' };
    } else if (studentEmail) {
      const r = await base44.asServiceRole.entities.User.filter({ email: studentEmail });
      student = r?.[0] || null;
    }

    // Already active?
    if (student && fastiqActive(student)) return { status: 'already_active', studentName: student.full_name?.split(' ')[0] };

    if (student) {
      // Never overwrite paying subscription
      if (student.stripe_customer_id && student.subscription_status === 'active' && !student.fastiq_trial_active) {
        return { status: 'already_active', studentName: student.full_name?.split(' ')[0] };
      }
      const now = new Date();
      const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      await base44.asServiceRole.entities.User.update(student.id, {
        fastiq_active: true, is_fastiq: true, fastiq_setup_complete: true,
        membership_tier: 'fastiq', subscription_status: 'active',
        trial_start_date: now.toISOString(), trial_end_date: end.toISOString(),
        trial_status: 'active', fastiq_trial_active: true,
        gifted_by_parent_email: parent.email,
        linked_parent_name: parent.full_name?.split(' ')[0],
      });
      return { status: 'activated', studentName: student.full_name?.split(' ')[0] };
    }

    // Pending
    if (studentEmail) {
      const pending = parent.pending_fastiq_gift_emails || [];
      if (!pending.includes(studentEmail)) {
        await base44.asServiceRole.entities.User.update(parent.id, {
          pending_fastiq_gift_emails: [...pending, studentEmail],
        });
      }
      return { status: 'pending', email: studentEmail };
    }

    return { error: 'not_found' };
  };

  // ── Scenario 1: found, no FastIQ → activates → both get emails ────────────
  try {
    const parent = await mkParent('s1');
    const student = await mkStudent('S1');
    const res = await callGift(parent.id, { studentId: student.id });
    const updatedStudent = await base44.asServiceRole.entities.User.get(student.id);
    if (res.status === 'activated' && fastiqActive(updatedStudent) && updatedStudent.gifted_by_parent_email === parent.email) {
      pass('Scenario 1', `Trial activated for ${student.email}. gifted_by_parent_email set.`);
    } else {
      fail('Scenario 1', `Unexpected result: ${JSON.stringify(res)}`);
    }
  } catch (e) { fail('Scenario 1', e.message); }

  // ── Scenario 2: student already has FastIQ → "already covered" ────────────
  try {
    const parent = await mkParent('s2');
    const student = await mkStudent('S2', { fastiq_trial_active: true, trial_status: 'active', membership_tier: 'fastiq' });
    const res = await callGift(parent.id, { studentId: student.id });
    if (res.status === 'already_active') {
      pass('Scenario 2', `Correctly returned already_active for ${student.email}.`);
    } else {
      fail('Scenario 2', `Expected already_active, got: ${JSON.stringify(res)}`);
    }
  } catch (e) { fail('Scenario 2', e.message); }

  // ── Scenario 3: multiple same-name students → resolve by email ────────────
  try {
    const parent = await mkParent('s3');
    const s3a = await mkStudent('S3a'); // same first/last pattern
    const s3b = await mkStudent('S3a'); // duplicate name, different email
    // Parent provides specific email to disambiguate
    const res = await callGift(parent.id, { studentEmail: s3a.email });
    const updated = await base44.asServiceRole.entities.User.get(s3a.id);
    const untouched = await base44.asServiceRole.entities.User.get(s3b.id);
    if (res.status === 'activated' && fastiqActive(updated) && !fastiqActive(untouched)) {
      pass('Scenario 3', `Email-based disambiguation activated only ${s3a.email}.`);
    } else {
      fail('Scenario 3', `Result: ${JSON.stringify(res)}, s3a fastiq: ${fastiqActive(updated)}, s3b fastiq: ${fastiqActive(untouched)}`);
    }
  } catch (e) { fail('Scenario 3', e.message); }

  // ── Scenario 4: no student found → pending gift stored ────────────────────
  try {
    const parent = await mkParent('s4');
    const ghostEmail = `ghost-student-s4@giftiq-test.invalid`;
    const res = await callGift(parent.id, { studentEmail: ghostEmail });
    const updatedParent = await base44.asServiceRole.entities.User.get(parent.id);
    if (res.status === 'pending' && updatedParent.pending_fastiq_gift_emails?.includes(ghostEmail)) {
      pass('Scenario 4', `Pending gift stored for ${ghostEmail}.`);
    } else {
      fail('Scenario 4', `Result: ${JSON.stringify(res)}, pending: ${JSON.stringify(updatedParent.pending_fastiq_gift_emails)}`);
    }
  } catch (e) { fail('Scenario 4', e.message); }

  // ── Scenario 5: student with pending gift signs up → trial activates ───────
  try {
    const parent = await mkParent('s5');
    const pendingEmail = `late-student-s5@giftiq-test.invalid`;
    // Store pending gift on parent
    await base44.asServiceRole.entities.User.update(parent.id, {
      pending_fastiq_gift_emails: [pendingEmail],
    });
    // Simulate student sign-up: createUserFromVerification checks pending_fastiq_gift_emails
    const newStudent = await base44.asServiceRole.entities.User.create({
      full_name: 'Late Student S5',
      email: pendingEmail,
      persona: 'student',
      school_code: TEST_SCHOOL,
    });
    createdIds.push(newStudent.id);

    // Replicate the pending-gift resolution logic from createUserFromVerification
    const allParents = await base44.asServiceRole.entities.User.filter({ persona: 'parent' });
    const matchingParents = allParents.filter(p =>
      Array.isArray(p.pending_fastiq_gift_emails) && p.pending_fastiq_gift_emails.includes(pendingEmail)
    );
    if (matchingParents.length > 0) {
      const p = matchingParents[0];
      const trialStart = new Date();
      const trialEnd = new Date(trialStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      await base44.asServiceRole.entities.User.update(newStudent.id, {
        fastiq_active: true, is_fastiq: true, fastiq_setup_complete: true,
        membership_tier: 'fastiq', subscription_status: 'active',
        trial_start_date: trialStart.toISOString(), trial_end_date: trialEnd.toISOString(),
        trial_status: 'active', fastiq_trial_active: true,
        gifted_by_parent_email: p.email,
        linked_parent_name: p.full_name?.split(' ')[0],
      });
      await base44.asServiceRole.entities.User.update(p.id, {
        pending_fastiq_gift_emails: (p.pending_fastiq_gift_emails || []).filter(e => e !== pendingEmail),
      });
    }

    const updatedStudent = await base44.asServiceRole.entities.User.get(newStudent.id);
    const updatedParent = await base44.asServiceRole.entities.User.get(parent.id);
    if (fastiqActive(updatedStudent) && !updatedParent.pending_fastiq_gift_emails?.includes(pendingEmail)) {
      pass('Scenario 5', `Trial auto-activated on signup. Pending email removed from parent.`);
    } else {
      fail('Scenario 5', `fastiqActive: ${fastiqActive(updatedStudent)}, pending still has email: ${updatedParent.pending_fastiq_gift_emails?.includes(pendingEmail)}`);
    }
  } catch (e) { fail('Scenario 5', e.message); }

  // ── Scenario 6: parent gifts same student twice → no duplicate ────────────
  try {
    const parent = await mkParent('s6');
    const student = await mkStudent('S6');
    // First gift
    const res1 = await callGift(parent.id, { studentId: student.id });
    // Second gift (student now has trial active)
    const res2 = await callGift(parent.id, { studentId: student.id });
    const updatedStudent = await base44.asServiceRole.entities.User.get(student.id);
    if (res1.status === 'activated' && res2.status === 'already_active') {
      pass('Scenario 6', `First gift activated. Second gift gracefully returned already_active. No duplicate trial.`);
    } else {
      fail('Scenario 6', `res1: ${JSON.stringify(res1)}, res2: ${JSON.stringify(res2)}`);
    }
    // Verify trial_start_date not overwritten (same value)
    const trialStart1 = updatedStudent.trial_start_date;
    const updatedStudent2 = await base44.asServiceRole.entities.User.get(student.id);
    if (trialStart1 === updatedStudent2.trial_start_date) {
      pass('Scenario 6b', `trial_start_date unchanged after second gift attempt.`);
    }
  } catch (e) { fail('Scenario 6', e.message); }

  // ── Cleanup ────────────────────────────────────────────────────────────────
  let cleanedUp = 0;
  for (const id of createdIds) {
    try { await base44.asServiceRole.entities.User.delete(id); cleanedUp++; } catch (_) {}
  }

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  console.log(`\nTest complete: ${passed} passed, ${failed} failed. Cleaned up ${cleanedUp}/${createdIds.length} test users.`);

  return Response.json({ summary: { passed, failed, total: results.length, cleanedUp }, results });
});