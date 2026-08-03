import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

/**
 * First-morning email — runs daily at 7:00 AM ET (after the 4:30 AM overnight
 * prep). Emails every student whose NightlyBrief for today hasn't been
 * emailed yet, with a deep link back to the dashboard. Idempotent via
 * morning_email_sent_at.
 */
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Today in ET — same clock the overnight run stamps brief_date with
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
    const briefs = await base44.asServiceRole.entities.NightlyBrief.filter({ brief_date: today }, '-created_date', 200);

    const appUrl = (secrets.get('APP_BASE_URL') || '').replace(/\/$/, '');
    const dashboardLink = appUrl ? `${appUrl}/#/FreeTierDashboard` : '';

    let sent = 0, skipped = 0, failed = 0;
    for (const brief of briefs) {
      if (brief.morning_email_sent_at) { skipped++; continue; }
      if (!brief.user_email) { skipped++; continue; }

      const workLines = (brief.items || []).map((i: string) => `  • ${i}`).join('\n');
      const packageLine = brief.prepared_company
        ? `Your headline: a tailored application for ${brief.prepared_role || 'a role'} at ${brief.prepared_company} is ready to send.`
        : `Here's what I got done for you overnight.`;
      const contactLine = brief.warm_contact_name
        ? `I also found a warm contact for you: ${brief.warm_contact_name}${brief.warm_contact_role ? ` (${brief.warm_contact_role})` : ''}.`
        : '';

      const body = [
        `Good morning!`,
        ``,
        `While you slept, I was working on your search. ${packageLine}`,
        ``,
        workLines ? `Overnight brief:\n${workLines}` : '',
        contactLine,
        ``,
        dashboardLink ? `Everything is waiting on your dashboard:\n${dashboardLink}` : `Everything is waiting on your dashboard.`,
        ``,
        `— CLIFF, your career agent`,
      ].filter(l => l !== null).join('\n');

      const subject = brief.prepared_company
        ? `☀️ Your application for ${brief.prepared_company} is ready`
        : `☀️ Your overnight brief is ready`;

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: brief.user_email,
          from_name: 'CLIFF',
          subject,
          body,
        });
        await base44.asServiceRole.entities.NightlyBrief.update(brief.id, {
          morning_email_sent_at: new Date().toISOString(),
        });
        sent++;
      } catch (e) {
        failed++;
      }
    }

    return Response.json({ date: today, total: briefs.length, sent, skipped, failed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}