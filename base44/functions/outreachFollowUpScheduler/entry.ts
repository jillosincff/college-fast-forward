import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Daily scheduler: nudges students to follow up on outreach that's gone
// unanswered for 4+ days. Max 1 nudge email per contact (nudge_email_sent_at),
// max 1 email per student per run. Respects EmailPreference opt-outs.

const STALE_DAYS = 4;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow system/scheduled runs (no user) or admins only
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin' && !user.roles?.includes('admin')) {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { dryRun = false } = await req.json().catch(() => ({}));

    const cutoff = Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000;
    const pipeline = await base44.asServiceRole.entities.NetworkingPipeline.filter(
      { status: 'reached_out' }, '-reached_out_date', 500
    );

    const stale = (pipeline || []).filter(p =>
      p.reached_out_date &&
      new Date(p.reached_out_date).getTime() < cutoff &&
      !p.nudge_email_sent_at &&
      p.alumni_name &&
      p.user_email
    );

    // Group by student — one nudge email per student per run (oldest contact first)
    const byUser = {};
    for (const p of stale) {
      if (!byUser[p.user_email]) byUser[p.user_email] = [];
      byUser[p.user_email].push(p);
    }

    const results = { scanned: pipeline?.length || 0, stale: stale.length, sent: 0, skippedOptOut: 0, errors: [] };

    for (const [email, contacts] of Object.entries(byUser)) {
      try {
        // Opt-out check
        const prefs = await base44.asServiceRole.entities.EmailPreference.filter({ user_email: email });
        const pref = prefs?.[0];
        if (pref && (pref.all_emails === false || pref.nudge_emails === false)) {
          results.skippedOptOut++;
          continue;
        }

        // Oldest stale contact for this student
        const contact = contacts.sort((a, b) =>
          new Date(a.reached_out_date) - new Date(b.reached_out_date)
        )[0];
        const daysSinceSent = Math.round((Date.now() - new Date(contact.reached_out_date).getTime()) / (1000 * 60 * 60 * 24));

        const users = await base44.asServiceRole.entities.User.filter({ email });
        const firstName = users?.[0]?.full_name?.split(' ')[0] || email.split('@')[0];

        if (!dryRun) {
          const res = await base44.asServiceRole.functions.invoke('sendOutreachFollowUpEmail', {
            to: email,
            firstName,
            recipientName: contact.alumni_name,
            recipientTitle: contact.alumni_role || '',
            daysSinceSent,
            internalSecret: Deno.env.get('BASE44_SERVICE_ROLE_KEY'),
          });
          if (res?.data?.error) throw new Error(res.data.error);

          await base44.asServiceRole.entities.NetworkingPipeline.update(contact.id, {
            nudge_email_sent_at: new Date().toISOString(),
          });
        }
        results.sent++;
      } catch (e) {
        results.errors.push({ email, error: e.message });
      }
    }

    console.log('outreachFollowUpScheduler results:', JSON.stringify(results));
    return Response.json({ success: true, dryRun, ...results });
  } catch (error) {
    console.error('outreachFollowUpScheduler failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});