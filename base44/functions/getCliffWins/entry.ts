import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Admin "CLIFF Wins" — a chronological feed of REAL student outcomes
// (interviews, offers, networking replies, completed applications, magic moments,
// resume improvements). Plus internal trust metrics (never shown to students).
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    const sr = base44.asServiceRole;

    const [pipeline, accessPlans, appEvents, resumes, outcomes] = await Promise.all([
      sr.entities.NetworkingPipeline.list('-updated_date', 300).catch(() => []),
      sr.entities.UserAccessPlan.filter({ magic_moment_status: 'completed' }).catch(() => []),
      sr.entities.StudentAnalyticsEvent.filter({ event_name: 'application_submitted' }, '-event_timestamp', 60).catch(() => []),
      sr.entities.TailoredResume.filter({ status: 'completed' }, '-created_date', 40).catch(() => []),
      sr.entities.RecommendationOutcome.list('-updated_date', 500).catch(() => []),
    ]);

    const wins = [];
    for (const p of pipeline || []) {
      if (p.offer_date) wins.push({ email: p.user_email, type: 'offer', headline: `Offer at ${p.company}`, date: p.offer_date });
      if (p.interview_date) wins.push({ email: p.user_email, type: 'interview', headline: `Interview at ${p.company}`, date: p.interview_date });
      if (p.replied_date) wins.push({ email: p.user_email, type: 'reply', headline: `${p.alumni_name ? p.alumni_name + ' replied' : 'Networking reply'} at ${p.company}`, date: p.replied_date });
    }
    for (const a of accessPlans || []) {
      if (a.magic_moment_completed_at) wins.push({ email: a.user_email, type: 'magic_moment', headline: 'Magic Moment completed', date: a.magic_moment_completed_at });
    }
    for (const e of appEvents || []) {
      wins.push({ email: e.user_email, type: 'application', headline: `Application completed${e.company_name ? ' at ' + e.company_name : ''}`, date: e.event_timestamp });
    }
    for (const r of resumes || []) {
      wins.push({ email: r.user_email, type: 'resume', headline: `Resume improvement completed for ${r.company_name}`, date: r.created_date });
    }

    wins.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const top = wins.slice(0, 60);

    // Resolve school codes for the feed
    const emails = [...new Set(top.map((w) => w.email).filter(Boolean))].slice(0, 60);
    let schoolMap = {};
    try {
      const users = await sr.entities.User.filter({ email: { $in: emails } });
      for (const u of users || []) schoolMap[u.email] = (u.school_code || '').toUpperCase();
    } catch { schoolMap = {}; }
    const feed = top.map((w) => ({ school: schoolMap[w.email] || '—', type: w.type, headline: w.headline, date: w.date }));

    // Internal trust metrics — recommendation accuracy funnel (admin-only)
    const total = (outcomes || []).length;
    const pursued = (outcomes || []).filter((o) => o.pursued || o.applied).length;
    const interviews = (outcomes || []).filter((o) => o.interview).length;
    const offers = (outcomes || []).filter((o) => o.offer).length;
    const pct = (n, d) => (d > 0 ? Math.round((n / d) * 100) : 0);
    const trust = {
      recommendations: total,
      adoption_rate: pct(pursued, total),
      interview_conversion: pct(interviews, pursued),
      offer_conversion: pct(offers, interviews),
    };

    return Response.json({ feed, trust });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});