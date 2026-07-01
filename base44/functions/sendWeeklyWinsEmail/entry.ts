import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Weekly "wins" digest for premium students — visible proof the agent worked
// for them this week. Runs on a weekly schedule; respects EmailPreference and
// dedupes so no user gets more than one per 6 days.
// All data is batch-fetched up front (7 queries total) to stay under rate limits.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    // Allow: admins, or unauthenticated scheduled-automation invocations.
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { dry_run = false, only_email = null } = await req.json().catch(() => ({}));

    const svc = base44.asServiceRole;
    const appUrl = Deno.env.get('APP_BASE_URL') || 'https://collegefastforward.com';
    const weekAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const sixDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);

    // ── Batch fetch everything up front ──
    const [allUsers, allPrefs, recentDigestLogs, newPipeline, repliedPipeline, newResumes, newDrops] = await Promise.all([
      svc.entities.User.list(null, 500),
      svc.entities.EmailPreference.list(null, 500),
      svc.entities.EmailLog.filter({ email_type: 'weekly_digest', created_date: { $gte: sixDaysAgo.toISOString() } }, null, 500),
      svc.entities.NetworkingPipeline.filter({ created_date: { $gte: weekAgoIso } }, null, 500),
      svc.entities.NetworkingPipeline.filter({ replied_date: { $gte: weekAgoIso } }, null, 500),
      svc.entities.TailoredResume.filter({ created_date: { $gte: weekAgoIso } }, null, 500),
      svc.entities.UserDailyDrop.filter({ created_date: { $gte: weekAgoIso } }, null, 500),
    ]);

    const groupBy = (arr, key) => {
      const m = {};
      for (const r of arr || []) {
        const k = r[key];
        if (!k) continue;
        (m[k] = m[k] || []).push(r);
      }
      return m;
    };
    const prefsByEmail = groupBy(allPrefs, 'user_email');
    const logsByEmail = groupBy(recentDigestLogs, 'user_email');
    const pipelineByEmail = groupBy(newPipeline, 'user_email');
    const repliesByEmail = groupBy(repliedPipeline, 'user_email');
    const resumesByEmail = groupBy(newResumes, 'user_email');
    const dropsByEmail = groupBy(newDrops, 'user_email');

    const isStudentPremium = (u) => {
      const d = u.data || u;
      const persona = (d.persona || '').toLowerCase();
      if (persona === 'parent' || persona === 'alumni') return false;
      const tier = (d.membership_tier || '').toLowerCase();
      return tier && tier !== 'free';
    };
    let candidates = allUsers.filter(isStudentPremium);
    if (only_email) candidates = candidates.filter(u => u.email === only_email);
    candidates = candidates.slice(0, 200);

    const results = [];
    for (const u of candidates) {
      const d = u.data || u;
      const email = u.email;
      if (!email) continue;
      const firstName = (d.full_name || u.full_name || 'there').split(' ')[0];

      const pref = prefsByEmail[email]?.[0];
      if (pref && (pref.all_emails === false || pref.weekly_digest === false)) {
        results.push({ email, status: 'skipped_prefs' });
        continue;
      }
      if (logsByEmail[email]?.length) {
        results.push({ email, status: 'skipped_recent' });
        continue;
      }

      const weekPipeline = pipelineByEmail[email] || [];
      const newApps = weekPipeline.length;
      const warmContacts = weekPipeline.filter(p => p.alumni_name).length;
      const resumeCount = (resumesByEmail[email] || []).length;
      const replies = (repliesByEmail[email] || []).length;
      const rolesSurfaced = (dropsByEmail[email] || []).reduce((s, dr) => s + (dr.slots?.length || 0), 0);

      const lines = [];
      if (rolesSurfaced > 0) lines.push(`- CLIFF surfaced ${rolesSurfaced} curated role${rolesSurfaced === 1 ? '' : 's'} matched to your goals`);
      if (warmContacts > 0) lines.push(`- ${warmContacts} warm contact${warmContacts === 1 ? '' : 's'} identified at your target companies`);
      if (newApps > 0) lines.push(`- ${newApps} new application${newApps === 1 ? '' : 's'} added to your pipeline`);
      if (resumeCount > 0) lines.push(`- ${resumeCount} resume${resumeCount === 1 ? '' : 's'} tailored for specific roles`);
      if (replies > 0) lines.push(`- ${replies} repl${replies === 1 ? 'y' : 'ies'} received from your outreach — keep those conversations going!`);

      if (lines.length === 0) {
        results.push({ email, status: 'skipped_no_activity' });
        continue;
      }

      const subject = replies > 0
        ? `${firstName}, you got ${replies === 1 ? 'a reply' : 'replies'} this week 🎉 — your weekly wins`
        : `${firstName}, here's what CLIFF did for you this week`;

      const body = `Hi ${firstName},

Your weekly wins from College Fast Forward:

${lines.join('\n')}

Your agent keeps working while you sleep — log in to see today's drop and your warm paths:
${appUrl}/#/FreeTierDashboard

Keep the momentum going,
CLIFF — your career agent at CFF

---
Manage email preferences or unsubscribe: ${appUrl}/#/Unsubscribe?email=${encodeURIComponent(email)}`;

      if (dry_run) {
        results.push({ email, status: 'would_send', subject, wins: lines.length });
        continue;
      }

      await svc.integrations.Core.SendEmail({ to: email, subject, body, from_name: 'CLIFF at CFF' });
      await svc.entities.EmailLog.create({
        user_id: u.id,
        user_email: email,
        email_type: 'weekly_digest',
        subject,
        content_preview: lines.join(' | ').slice(0, 200),
        status: 'sent',
        sent_at: new Date().toISOString(),
        metadata: { rolesSurfaced, warmContacts, newApps, resumeCount, replies },
      });
      results.push({ email, status: 'sent', subject });
    }

    return Response.json({
      success: true,
      dry_run,
      candidates: candidates.length,
      sent: results.filter(r => r.status === 'sent').length,
      results: results.slice(0, 50),
      skipped_no_activity: results.filter(r => r.status === 'skipped_no_activity').length,
    });
  } catch (error) {
    console.error('[sendWeeklyWinsEmail]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});