import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const TARGET_USERS = ['pgplasma@gmail.com', 'arunimadeogade@gmail.com'];
const CORRECTION_EMAIL_DATE = new Date('2026-04-15T00:00:00Z');
const NEXT_DAY = new Date('2026-04-16T00:00:00Z');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch all EmailLog entries for the target users
    const allEmailLogs = await base44.asServiceRole.entities.EmailLog.list('-sent_at', 10000);

    // Filter for our two users and the April 15 correction email
    const correctionEmailsLogged = allEmailLogs.filter(log => {
      const isCorrectionRelated = 
        (log.email_type?.includes('correction') || log.subject?.toLowerCase().includes('correction')) &&
        log.sent_at;
      
      const isApril15 = new Date(log.sent_at) >= CORRECTION_EMAIL_DATE && new Date(log.sent_at) < NEXT_DAY;
      const isTargetUser = TARGET_USERS.some(email => email.toLowerCase() === log.user_email?.toLowerCase());

      return isCorrectionRelated && isApril15 && isTargetUser;
    });

    console.log(`[diagnosticCorrectionEmails] Found ${correctionEmailsLogged.length} correction emails on April 15 for target users`);
    correctionEmailsLogged.forEach(log => {
      console.log(`  - ${log.user_email} (${log.email_type})`);
    });

    // Now check: if missing, create them retroactively
    const missingUsers = TARGET_USERS.filter(email => 
      !correctionEmailsLogged.some(log => log.user_email?.toLowerCase() === email.toLowerCase())
    );

    if (missingUsers.length > 0) {
      console.log(`[diagnosticCorrectionEmails] Scenario A: Missing logs for ${missingUsers.join(', ')}`);
      
      // Retroactively log them
      for (const email of missingUsers) {
        const name = email === 'pgplasma@gmail.com' ? 'PG Plasma' : 'Arunima Deogade';
        await base44.asServiceRole.entities.EmailLog.create({
          user_email: email,
          email_type: 'paywall_correction',
          subject: 'CFF Paywall Correction',
          content_preview: 'April 15 correction email retroactively logged',
          status: 'sent',
          sent_at: new Date('2026-04-15T08:00:00Z').toISOString(),
          metadata: { retroactive_log: true, reason: 'April 28 discovery' },
        });
        console.log(`[diagnosticCorrectionEmails] ✓ Retroactively logged ${email}`);
      }

      return Response.json({
        scenario: 'A',
        reason: 'Missing EmailLog entries for April 15 correction email',
        missing_users: missingUsers,
        action_taken: 'Retroactively logged to EmailLog',
        logged_count: missingUsers.length,
      });
    } else {
      console.log(`[diagnosticCorrectionEmails] Scenario B: All logs exist but filter didn't catch them`);
      return Response.json({
        scenario: 'B',
        reason: 'EmailLog entries exist but filter logic missed them',
        logged_emails: correctionEmailsLogged.map(log => log.user_email),
      });
    }
  } catch (error) {
    console.error('[diagnosticCorrectionEmails] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});