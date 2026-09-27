import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Read-only admin export: non-founding_gator students who "activated" by doing
// any of: completed Magic Moment, own a TailoredResume, or own a NetworkingPipeline
// row. Deduped by user id. Flags close_to_paying for the students with a
// pro_cta_clicked or checkout_started ConversionEvent, sorts them first, then the
// rest by last active (most recent AnalyticsEvent, fallback updated_date).
// Returns the CSV string + a count; the admin dashboard triggers a browser
// download. Never mutates any record.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !(user.role === 'admin' || user.roles?.includes('admin'))) {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }
    const db = base44.asServiceRole.entities;
    const L = 10000;
    const [users, tailored, pipeline, mocks, conv, events] = await Promise.all([
      db.User.list('-created_date', L),
      db.TailoredResume.list('-created_date', L),
      db.NetworkingPipeline.list('-created_date', L),
      db.MockInterviewSession.list('-created_date', L),
      db.ConversionEvent.list('-created_date', L),
      db.AnalyticsEvent.list('-created_date', L),
    ]);
    const list = r => Array.isArray(r) ? r : (r?.data || []);
    const userList = list(users), tailoredList = list(tailored), pipeList = list(pipeline),
      mockList = list(mocks), convList = list(conv), evList = list(events);

    const key = e => (e || '').toLowerCase().trim();
    const isStudent = u => u.persona === 'student' || (Array.isArray(u.roles) && u.roles.includes('student'));
    const nonFoundingStudent = u => isStudent(u) && u.membership_tier !== 'founding_gator';

    // Per-user aggregates keyed by email
    const tBy = new Map();
    for (const t of tailoredList) { const k = key(t.user_email); if (k) tBy.set(k, (tBy.get(k) || 0) + 1); }
    const mBy = new Map();
    for (const m of mockList) { const k = key(m.user_email); if (k) mBy.set(k, (mBy.get(k) || 0) + 1); }
    const appliedS = ['reached_out', 'messaged', 'replied', 'coffee_chat', 'intro_made', 'no_response'];
    const interviewS = ['interview', 'offer'];
    const pBy = new Map();
    for (const p of pipeList) {
      const k = key(p.user_email); if (!k) continue;
      const o = pBy.get(k) || { applied: 0, interview: 0 };
      if (appliedS.includes(p.status)) o.applied++;
      if (interviewS.includes(p.status)) o.interview++;
      pBy.set(k, o);
    }
    const lastBy = new Map();
    for (const e of evList) {
      const k = key(e.user_email); if (!k) continue;
      const d = e.created_date || ''; if (!d) continue;
      const cur = lastBy.get(k);
      if (!cur || d > cur) lastBy.set(k, d);
    }
    const closeEmails = new Set();
    for (const c of convList) {
      if (c.event_name === 'pro_cta_clicked' || c.event_name === 'checkout_started') {
        const k = key(c.user_email); if (k) closeEmails.add(k);
      }
    }

    const esc = v => {
      if (v == null) return '';
      const s = String(v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const proFeatureUsed = (k) => (mBy.get(k) || 0) > 0 || (pBy.get(k)?.applied || 0) > 0 || (tBy.get(k) || 0) > 1;

    const header = [
      'name', 'email', 'school', 'grad year', 'target role/industry', 'signup date',
      'last active date', 'magic_moment_completed', 'tailored resumes count',
      'NetworkingPipeline rows (applied/interview)', 'mock interview sessions',
      'Pro-only features used (yes/no)', 'phone', 'close_to_paying', 'qualified_by'
    ];

    const rows = [];
    const seen = new Set();
    for (const u of userList) {
      if (!nonFoundingStudent(u)) continue;
      const k = key(u.email);
      const hasMM = u.magic_moment_completed === true;
      const hasResume = tBy.has(k);
      const hasTracker = pBy.has(k);
      if (!hasMM && !hasResume && !hasTracker) continue; // must have activated
      if (seen.has(u.id)) continue;
      seen.add(u.id);

      const reasons = [];
      if (hasMM) reasons.push('MM');
      if (hasResume) reasons.push('resume');
      if (hasTracker) reasons.push('tracker');

      const school = u.school_name || u.school_code || u.school || '';
      const grad = u.graduation_year || u.grad_year || '';
      const target = u.target_role
        || (Array.isArray(u.preferred_industries) ? u.preferred_industries.join('; ') : (u.preferred_industries || u.industry || ''));
      const signup = (u.created_date || '').slice(0, 10);
      const lastActive = lastBy.get(k) || u.updated_date || '';
      const pp = pBy.get(k) || { applied: 0, interview: 0 };
      const phone = u.phone || u.phone_number || '';
      const closeToPaying = closeEmails.has(k) ? 'yes' : 'no';

      rows.push({
        lastActive,
        closeToPaying,
        line: [
          u.full_name || '', u.email || '', school, grad, target, signup,
          (lastActive || '').slice(0, 10), hasMM ? 'yes' : 'no', tBy.get(k) || 0,
          `${pp.applied} / ${pp.interview}`, mBy.get(k) || 0,
          proFeatureUsed(k) ? 'yes' : 'no', phone, closeToPaying, reasons.join('; ')
        ]
      });
    }

    // close_to_paying first, then everyone by last active newest first
    rows.sort((a, b) => {
      const ca = a.closeToPaying === 'yes' ? 0 : 1;
      const cb = b.closeToPaying === 'yes' ? 0 : 1;
      if (ca !== cb) return ca - cb;
      return (b.lastActive || '').localeCompare(a.lastActive || '');
    });

    const csv = [header.map(esc).join(',')].concat(rows.map(r => r.line.map(esc).join(','))).join('\n');

    return Response.json({
      csv,
      count: rows.length,
      closeToPaying: rows.filter(r => r.closeToPaying === 'yes').length,
      qualifiedMM: rows.filter(r => r.line[14]?.includes('MM')).length,
      qualifiedResume: rows.filter(r => r.line[14]?.includes('resume')).length,
      qualifiedTracker: rows.filter(r => r.line[14]?.includes('tracker')).length,
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('exportActivatedStudentsCsv error:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
});