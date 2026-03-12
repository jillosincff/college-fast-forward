import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";

function buildReminderEmail(firstName) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #374151; background: #ffffff; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 32px 24px;">

    <p style="font-size: 16px; margin: 0 0 20px 0;">Hey ${firstName},</p>

    <p style="font-size: 15px; margin: 0 0 16px 0;">Just a quick follow-up — I wanted to make sure you saw my note about <strong>FASTIQ</strong>. It's a free AI career tool inside CFF that can find UF alumni at any company and help you reach out to them.</p>

    <p style="font-size: 15px; margin: 0 0 16px 0;">Takes 2 minutes to set up: just log in to CFF and click the <strong>FASTIQ</strong> tab.</p>

    <p style="font-size: 15px; margin: 0 0 16px 0;">If you already checked it out, I'd love to hear what you thought. If not, give it a try — I think you'll be surprised.</p>

    <p style="font-size: 15px; margin: 0 0 20px 0;">Jill</p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0 16px 0;" />
    <p style="font-size: 11px; color: #9ca3af; margin: 0;">College Fast Forward · 8731 Lewis River Road, Delray Beach, FL 33446</p>
    <p style="font-size: 11px; color: #9ca3af; margin: 6px 0 0 0;"><a href="${APP_BASE_URL}/#ProfileEdit" style="color: #9ca3af;">Unsubscribe</a></p>
  </div>
</body>
</html>`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Admin-only
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { dry_run = false } = await req.json().catch(() => ({}));

    console.log(`=== FASTIQ Reminder Email Campaign ===`);
    console.log(`Mode: ${dry_run ? 'DRY RUN' : 'LIVE SEND'}`);

    // Step 1: Find all intro emails sent 5+ days ago
    const allIntroEmails = await base44.asServiceRole.entities.FastiqOutreachEmail.filter({
      email_type: 'zero_response_intro'
    });

    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    const eligibleForReminder = allIntroEmails.filter(e => {
      if (!e.sent_date) return false;
      return new Date(e.sent_date) <= fiveDaysAgo;
    });
    console.log(`Intro emails sent 5+ days ago: ${eligibleForReminder.length}`);

    // Step 2: Check who already got a reminder
    const existingReminders = await base44.asServiceRole.entities.FastiqOutreachEmail.filter({
      email_type: 'zero_response_reminder'
    });
    const alreadyReminded = new Set(existingReminders.map(e => e.user_email?.toLowerCase()));
    console.log(`Already reminded (skip): ${alreadyReminded.size}`);

    // Step 3: Check who already activated FASTIQ since the intro email
    const fastiqProfiles = await base44.asServiceRole.entities.FastTrackProProfile.filter({
      assessment_complete: true
    });
    const alreadyActiveFastiq = new Set(fastiqProfiles.map(p => p.user_email?.toLowerCase()));
    console.log(`Already active FASTIQ (skip): ${alreadyActiveFastiq.size}`);

    // Step 4: Build send list
    const toSend = [];
    let skippedAlreadyReminded = 0;
    let skippedActivatedFastiq = 0;

    for (const introEmail of eligibleForReminder) {
      const emailLower = (introEmail.user_email || '').toLowerCase();
      if (!emailLower) continue;

      if (alreadyReminded.has(emailLower)) {
        skippedAlreadyReminded++;
        continue;
      }

      if (alreadyActiveFastiq.has(emailLower)) {
        skippedActivatedFastiq++;
        continue;
      }

      toSend.push({
        email: emailLower,
        firstName: introEmail.student_name || 'there',
        introSentDate: introEmail.sent_date,
      });
    }

    console.log(`\n=== Summary ===`);
    console.log(`Students to remind: ${toSend.length}`);
    console.log(`Skipped (already reminded): ${skippedAlreadyReminded}`);
    console.log(`Skipped (activated FASTIQ since intro): ${skippedActivatedFastiq}`);

    if (dry_run) {
      console.log(`\n=== DRY RUN — No emails sent ===`);
      return Response.json({
        success: true,
        dry_run: true,
        eligible_for_reminder: eligibleForReminder.length,
        to_send: toSend.length,
        skipped_already_reminded: skippedAlreadyReminded,
        skipped_activated_fastiq: skippedActivatedFastiq,
        recipients: toSend.map(s => ({ email: s.email, firstName: s.firstName })),
      });
    }

    // Step 5: Send emails with rate limiting
    let totalSent = 0;
    let totalFailed = 0;

    for (const student of toSend) {
      try {
        const emailHtml = buildReminderEmail(student.firstName);

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: student.email,
          subject: `Quick reminder — FASTIQ is ready for you, ${student.firstName}`,
          body: emailHtml,
          from_name: 'Jill Osinoff / College Fast Forward'
        });

        await base44.asServiceRole.entities.FastiqOutreachEmail.create({
          user_email: student.email,
          email_type: 'zero_response_reminder',
          sent_date: new Date().toISOString(),
          opened: false,
          clicked_fastiq: false,
          student_name: student.firstName,
        });

        totalSent++;
        console.log(`  ✅ Reminder sent to ${student.email} (${student.firstName})`);

        await sleep(2000);
      } catch (err) {
        totalFailed++;
        console.error(`  ❌ Failed for ${student.email}:`, err.message);
      }
    }

    console.log(`\n=== Reminder Campaign Complete ===`);
    console.log(`Total sent: ${totalSent}`);
    console.log(`Total failed: ${totalFailed}`);

    return Response.json({
      success: true,
      eligible_for_reminder: eligibleForReminder.length,
      emails_sent: totalSent,
      emails_failed: totalFailed,
      skipped_already_reminded: skippedAlreadyReminded,
      skipped_activated_fastiq: skippedActivatedFastiq,
    });

  } catch (error) {
    console.error('sendFastiqReminderEmails error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});