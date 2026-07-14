import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// CLIFF Weekly Report — sent Sunday evenings to students with activity this week.
// Idempotent per week via EmailLog (weekly_digest). Supports { dry_run: true, only_email }.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let payload: Record<string, unknown> = {};
    try { payload = await req.json(); } catch { /* scheduled runs may send no body */ }
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const db = base44.asServiceRole.entities;
    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 86400000).toISOString();
    const dryRun = payload.dry_run === true;
    const onlyEmail = typeof payload.only_email === 'string' ? payload.only_email : null;

    const events = await db.StudentAnalyticsEvent.filter({ event_timestamp: { $gte: weekStart } }, '-event_timestamp', 1000);
    const interviews = await db.NetworkingPipeline.filter({ interview_date: { $gte: now.toISOString() } }, 'interview_date', 500);
    const discoveries = await db.CliffDiscovery.filter({ created_date: { $gte: weekStart } }, '-created_date', 1000);

    const byUser: Record<string, { apps: number; followUps: number; outreach: number; resumes: number; interviews: any[]; discoveries: number }> = {};
    const bucket = (email: string) => (byUser[email] = byUser[email] || { apps: 0, followUps: 0, outreach: 0, resumes: 0, interviews: [], discoveries: 0 });
    for (const e of events || []) {
      if (!e.user_email) continue;
      const b = bucket(e.user_email);
      if (e.event_name === 'application_submitted') b.apps++;
      else if (e.event_name === 'follow_up_sent') b.followUps++;
      else if (e.event_name === 'outreach_sent') b.outreach++;
      else if (e.event_name === 'tailored_resume_completed') b.resumes++;
    }
    for (const p of interviews || []) { const em = p.user_email || p.created_by; if (em) bucket(em).interviews.push(p); }
    for (const d of discoveries || []) { if (d.user_email) bucket(d.user_email).discoveries++; }

    let emails = Object.keys(byUser).filter(e => {
      const b = byUser[e];
      return b.apps + b.followUps + b.outreach + b.resumes + b.interviews.length + b.discoveries > 0;
    }).slice(0, 100);
    if (onlyEmail) emails = [onlyEmail];

    const results: any[] = [];
    for (const email of emails) {
      const b = byUser[email] || { apps: 0, followUps: 0, outreach: 0, resumes: 0, interviews: [], discoveries: 0 };

      // Never double-send within the same week
      const recent = await db.EmailLog.filter({ user_email: email, email_type: 'weekly_digest' }, '-sent_at', 1);
      if (!dryRun && recent?.[0]?.sent_at && new Date(recent[0].sent_at) > new Date(now.getTime() - 6 * 86400000)) {
        results.push({ email, skipped: 'already_sent_this_week' });
        continue;
      }

      const users = await db.User.filter({ email });
      const u = users?.[0];
      if (!u) { results.push({ email, skipped: 'no_user' }); continue; }
      const firstName = (u.full_name || '').split(' ')[0] || 'there';

      const pursuits = await db.JobPursuit.filter({ user_email: email }, '-updated_date', 5);
      const priority = (pursuits || []).find((p: any) => ['preparing', 'ready_to_apply', 'recommended'].includes(p.application_status));

      const mems = await db.StudentMemory.filter({ user_email: email, category: 'preferred_industries', active: true }, '-confidence', 1);
      const focus = mems?.[0]?.value || u.career_goals?.target_industries?.[0] || null;

      const actions = b.apps + b.followUps + b.outreach;
      const momentum = actions >= 4 ? 'Excellent' : actions >= 1 ? 'Building' : "Time for a restart";

      const lines: string[] = [];
      lines.push(`Hi ${firstName},`, '', 'Your Weekly Career Report', '', 'This week:');
      if (b.apps) lines.push(`✅ ${b.apps} application${b.apps === 1 ? '' : 's'} submitted`);
      if (b.resumes) lines.push(`✅ ${b.resumes} resume${b.resumes === 1 ? '' : 's'} tailored`);
      if (b.outreach) lines.push(`✅ ${b.outreach} outreach message${b.outreach === 1 ? '' : 's'} sent`);
      if (b.followUps) lines.push(`✅ ${b.followUps} follow-up${b.followUps === 1 ? '' : 's'} sent`);
      if (!b.apps && !b.resumes && !b.outreach && !b.followUps) lines.push(`• A quiet week — that's okay. Let's get one thing moving.`);
      if (b.interviews.length) {
        const iv = b.interviews[0];
        const day = iv.interview_date ? new Date(iv.interview_date).toLocaleDateString('en-US', { weekday: 'long' }) : '';
        lines.push(`🎤 Interview coming up${iv.company ? ` at ${iv.company}` : ''}${day ? ` on ${day}` : ''}`);
      }
      lines.push('', 'CLIFF worked while you were away:');
      lines.push(b.discoveries > 0
        ? `I found ${b.discoveries} new thing${b.discoveries === 1 ? '' : 's'} worth your attention.`
        : 'I kept scanning — nothing beat what you already have.');
      if (priority) lines.push(`Your priority Monday: ${priority.job_title} at ${priority.company_name}.`);
      lines.push('', `Momentum: ${momentum}.`);
      if (focus) lines.push(`Next week's focus: ${focus}.`);
      const baseUrl = Deno.env.get('APP_BASE_URL') || '';
      if (baseUrl) lines.push('', `Open your dashboard: ${baseUrl}/#/FreeTierDashboard`);
      lines.push('', '— CLIFF');

      const subject = `Your Weekly Career Report — momentum: ${momentum.toLowerCase()}`;
      if (!dryRun) {
        await base44.asServiceRole.integrations.Core.SendEmail({ to: email, subject, body: lines.join('\n'), from_name: 'CLIFF' });
        await db.EmailLog.create({
          user_email: email,
          user_id: u.id,
          email_type: 'weekly_digest',
          subject,
          status: 'sent',
          sent_at: new Date().toISOString(),
          content_preview: `apps:${b.apps} followups:${b.followUps} outreach:${b.outreach} discoveries:${b.discoveries}`,
          metadata: { apps: b.apps, follow_ups: b.followUps, outreach: b.outreach, resumes: b.resumes, discoveries: b.discoveries, momentum },
        });
      }
      results.push({ email, momentum, apps: b.apps, followUps: b.followUps, outreach: b.outreach, discoveries: b.discoveries, sent: !dryRun });
    }

    return Response.json({ success: true, week_start: weekStart, recipients: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});