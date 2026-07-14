import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Admin-only historical backfill. Uses only trustworthy completion records:
// - TailoredResume.downloaded_at            → tailored_resume_completed
// - NetworkingPipeline.reached_out_date     → outreach_sent
// - NetworkingPipeline.follow_up_date       → follow_up_sent
// - NetworkingPipeline applied + status_date → application_submitted
// - MockInterviewSession with overall_score → interview_practice_completed
// No inference from page views. No trustworthy proof → TTFMP stays unknown.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    const isAdmin = me && (me.role === 'admin' || (me.roles || []).includes('admin'));
    if (!isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const [students, gators, resumes, pipeline, interviews] = await Promise.all([
      base44.asServiceRole.entities.User.filter({ persona: 'student' }, '-created_date', 5000).catch(() => []),
      base44.asServiceRole.entities.User.filter({ persona: 'gator' }, '-created_date', 5000).catch(() => []),
      base44.asServiceRole.entities.TailoredResume.filter({}, '-created_date', 3000).catch(() => []),
      base44.asServiceRole.entities.NetworkingPipeline.filter({}, '-created_date', 3000).catch(() => []),
      base44.asServiceRole.entities.MockInterviewSession.filter({}, '-created_date', 2000).catch(() => []),
    ]);

    const users = [...(students || []), ...(gators || [])].filter(u =>
      !u.exclude_from_analytics &&
      u.role !== 'admin' && !(u.roles || []).includes('admin') &&
      !u.first_meaningful_progress_at
    );

    // Build candidate completion events per email
    const candidates = {}; // email -> [{ts, type, rid, company}]
    const add = (email, ts, type, rid, company) => {
      if (!email || !ts) return;
      (candidates[email.toLowerCase()] = candidates[email.toLowerCase()] || []).push({ ts, type, rid, company: company || '' });
    };
    for (const r of (resumes || [])) {
      if (r.downloaded_at) add(r.user_email, r.downloaded_at, 'tailored_resume_completed', r.id, r.company_name);
    }
    for (const p of (pipeline || [])) {
      if (p.reached_out_date) add(p.user_email, p.reached_out_date, 'outreach_sent', p.id, p.company);
      if (p.follow_up_date) add(p.user_email, p.follow_up_date, 'follow_up_sent', p.id, p.company);
      if (p.status === 'applied' && p.status_date) add(p.user_email, p.status_date, 'application_submitted', p.id, p.company);
    }
    for (const s of (interviews || [])) {
      const email = s.user_email || s.student_email || s.created_by;
      if (typeof s.overall_score === 'number') add(email, s.updated_date || s.created_date, 'interview_practice_completed', s.id, s.company_name);
    }

    let backfilled = 0, insufficient = 0, impossible = 0;
    for (const u of users) {
      const list = (candidates[(u.email || '').toLowerCase()] || [])
        // Guard against impossible data: completion must be after signup
        .filter(c => new Date(c.ts).getTime() >= new Date(u.created_date).getTime());
      const rawCount = (candidates[(u.email || '').toLowerCase()] || []).length;
      if (!list.length) { rawCount ? impossible++ : insufficient++; continue; }

      const earliest = list.sort((a, b) => new Date(a.ts) - new Date(b.ts))[0];
      const event_key = `${u.id}|${earliest.type}|${earliest.rid || 'none'}`;
      let event = (await base44.asServiceRole.entities.StudentAnalyticsEvent.filter({ event_key }))[0];
      if (!event) {
        event = await base44.asServiceRole.entities.StudentAnalyticsEvent.create({
          student_id: u.id, user_email: u.email,
          event_name: earliest.type, event_key,
          event_timestamp: earliest.ts, related_record_id: earliest.rid || '',
          company_name: earliest.company, source_feature: 'Historical Backfill',
          delivery_channel: 'In App', metadata: {},
          is_meaningful_progress: true, historically_backfilled: true,
        });
      }
      const seconds = Math.round((new Date(earliest.ts).getTime() - new Date(u.created_date).getTime()) / 1000);
      await base44.asServiceRole.entities.User.update(u.id, {
        first_meaningful_progress_at: earliest.ts,
        first_meaningful_progress_type: earliest.type,
        first_meaningful_progress_event_id: event.id,
        ttfmp_seconds: seconds,
        ttfmp_under_10_minutes: seconds <= 600,
        ttfmp_backfilled: true,
      });
      backfilled++;
    }

    return Response.json({ ok: true, students_scanned: users.length, backfilled, insufficient_data: insufficient, impossible_timestamps_skipped: impossible });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});