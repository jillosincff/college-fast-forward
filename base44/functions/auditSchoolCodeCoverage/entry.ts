import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);

    // ── 1. Students missing school_code — check created_date ─────────────────
    const studentsMissing = allUsers
      .filter(u => u.persona === 'student' && !u.school_code?.trim())
      .map(u => ({
        email: u.email,
        created_date: u.created_date,
        school_name: u.school_name || u.school || u.university || null,
        last_login: u.last_login_date || u.last_login || u.last_seen || null,
        onboarding_completed: u.onboarding_completed || false,
      }))
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

    // ── 2. Category C users — no school data at all ───────────────────────────
    const categoryC = allUsers
      .filter(u => !u.school_code?.trim() && !(u.school_name || u.school || u.university)?.trim())
      .map(u => ({
        email: u.email,
        persona: u.persona || null,
        created_date: u.created_date,
        last_login: u.last_login_date || u.last_login || u.last_seen || null,
        onboarding_completed: u.onboarding_completed || false,
      }))
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

    // ── 3. Check OutreachDraft activity for Category C emails ─────────────────
    const catCEmails = new Set(categoryC.map(u => u.email));
    let outreachActivity = [];
    try {
      const drafts = await base44.asServiceRole.entities.OutreachDraft.list('-created_date', 2000);
      outreachActivity = drafts
        .filter(d => catCEmails.has(d.created_by))
        .map(d => ({ email: d.created_by, status: d.status, created_date: d.created_date }));
    } catch (_) {}

    // ── 4. Check JobRequest activity ──────────────────────────────────────────
    let jobRequestActivity = [];
    try {
      const jobs = await base44.asServiceRole.entities.JobRequest.list('-created_date', 2000);
      jobRequestActivity = jobs
        .filter(j => catCEmails.has(j.poster_email) || catCEmails.has(j.created_by))
        .map(j => ({ email: j.poster_email || j.created_by, role: j.role, created_date: j.created_date }));
    } catch (_) {}

    // ── 5. Check Message activity ─────────────────────────────────────────────
    let messageActivity = [];
    try {
      const msgs = await base44.asServiceRole.entities.Message.list('-created_date', 2000);
      messageActivity = msgs
        .filter(m => catCEmails.has(m.sender_email))
        .map(m => ({ email: m.sender_email, subject: m.subject, created_date: m.created_date }));
    } catch (_) {}

    // Build per-user activity summary for Category C
    const categoryCWithActivity = categoryC.map(u => ({
      ...u,
      outreach_count: outreachActivity.filter(o => o.email === u.email).length,
      job_requests_count: jobRequestActivity.filter(j => j.email === u.email).length,
      messages_sent: messageActivity.filter(m => m.email === u.email).length,
      verdict: (
        outreachActivity.filter(o => o.email === u.email).length +
        jobRequestActivity.filter(j => j.email === u.email).length +
        messageActivity.filter(m => m.email === u.email).length
      ) > 0 ? 'ACTIVE — email to complete profile' : 'ZOMBIE — safe to deactivate',
    }));

    return Response.json({
      students_missing_school_code: studentsMissing,
      category_c_no_school_data: categoryCWithActivity,
      cutoff_note: 'Any student created after 2026-04-01 would indicate a live onboarding bug',
    });

  } catch (e) {
    console.error('auditSchoolCodeCoverage error:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
});