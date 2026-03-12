import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";

function parseFirstName(fullName) {
  if (!fullName) return 'there';
  return fullName.split(' ')[0];
}

function buildIntroEmail(firstName) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #374151; background: #ffffff; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 32px 24px;">

    <p style="font-size: 16px; margin: 0 0 20px 0;">Hey ${firstName},</p>

    <p style="font-size: 15px; margin: 0 0 16px 0;">I noticed you posted about looking for career help on CFF and I wanted to reach out personally. We're still growing the parent and alumni network, and I know it can be frustrating when you're waiting for responses.</p>

    <p style="font-size: 15px; margin: 0 0 16px 0;">That's exactly why we just built something new: <strong>FASTIQ</strong>.</p>

    <p style="font-size: 15px; margin: 0 0 16px 0;">FASTIQ is an AI career tool inside CFF that doesn't wait for someone to respond to you — it goes out and finds UF alumni at companies YOU care about, across the entire web. LinkedIn, company pages, everywhere. Then it drafts a personalized message you can send with one tap.</p>

    <p style="font-size: 15px; margin: 0 0 16px 0;">It also builds and tailors resumes, preps you for interviews, and tracks everyone you've reached out to so nothing falls through the cracks.</p>

    <p style="font-size: 15px; font-weight: 600; margin: 0 0 12px 0;">Here's how to try it:</p>
    <ol style="font-size: 15px; margin: 0 0 20px 0; padding-left: 24px;">
      <li style="margin-bottom: 6px;">Log in to CFF</li>
      <li style="margin-bottom: 6px;">Click the <strong>FASTIQ</strong> tab in the navigation</li>
      <li style="margin-bottom: 6px;">Complete the quick 2-minute setup</li>
      <li style="margin-bottom: 6px;">Try: "Find UF alumni at [a company you're interested in]" or "Help me find companies hiring in [your field]"</li>
    </ol>

    <p style="font-size: 15px; margin: 0 0 16px 0;">It's completely free for all CFF members — no catch, no upgrade required. I built this because I don't want any student sitting with zero responses. FASTIQ works for you 24/7.</p>

    <p style="font-size: 15px; margin: 0 0 16px 0;">Give it a shot and let me know what you think. I'm reading every piece of feedback.</p>

    <p style="font-size: 15px; margin: 0 0 4px 0;">Go Gators 🐊</p>
    <p style="font-size: 15px; font-weight: 600; margin: 0 0 20px 0;">Jill</p>

    <p style="font-size: 13px; color: #6b7280; margin: 0 0 0 0;">P.S. One warm intro is worth more than 100 cold applications. FASTIQ finds those warm intros.</p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0 16px 0;" />
    <p style="font-size: 11px; color: #9ca3af; margin: 0;">College Fast Forward · 8731 Lewis River Road, Delray Beach, FL 33446</p>
    <p style="font-size: 11px; color: #9ca3af; margin: 6px 0 0 0;"><a href="${APP_BASE_URL}/#ProfileEdit" style="color: #9ca3af;">Unsubscribe</a></p>
  </div>
</body>
</html>`;
}

// Sleep helper
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

    const { dry_run = false, batch_size = 50 } = await req.json().catch(() => ({}));

    console.log(`=== FASTIQ Intro Email Campaign ===`);
    console.log(`Mode: ${dry_run ? 'DRY RUN' : 'LIVE SEND'}`);

    // Step 1: Get all JobRequests with zero responses
    // We need to paginate since there could be many
    const allJobRequests = await base44.asServiceRole.entities.JobRequest.filter({});
    console.log(`Total JobRequests found: ${allJobRequests.length}`);

    const zeroResponseRequests = allJobRequests.filter(jr => {
      const answers = jr.answer_count || 0;
      const messages = jr.messages_count || 0;
      const intros = jr.intros_count || 0;
      return answers === 0 && messages === 0 && intros === 0;
    });
    console.log(`Zero-response JobRequests: ${zeroResponseRequests.length}`);

    // Deduplicate by poster email (a student may have multiple requests)
    const studentMap = new Map();
    for (const jr of zeroResponseRequests) {
      const email = jr.poster_email || jr.created_by;
      if (!email) continue;
      if (!studentMap.has(email)) {
        studentMap.set(email, jr);
      }
    }
    console.log(`Unique students with zero responses: ${studentMap.size}`);

    // Step 2: Load existing outreach records to avoid duplicates
    const existingOutreach = await base44.asServiceRole.entities.FastiqOutreachEmail.filter({
      email_type: 'zero_response_intro'
    });
    const alreadyEmailed = new Set(existingOutreach.map(e => e.user_email?.toLowerCase()));
    console.log(`Already emailed (skip): ${alreadyEmailed.size}`);

    // Step 3: Load FASTIQ profiles to check who already has it
    const fastiqProfiles = await base44.asServiceRole.entities.FastTrackProProfile.filter({
      assessment_complete: true
    });
    const alreadyActiveFastiq = new Set(fastiqProfiles.map(p => p.user_email?.toLowerCase()));
    console.log(`Already active FASTIQ (skip): ${alreadyActiveFastiq.size}`);

    // Step 4: Build final send list
    const toSend = [];
    let skippedAlreadyEmailed = 0;
    let skippedAlreadyFastiq = 0;
    let skippedNoEmail = 0;

    for (const [email, jr] of studentMap) {
      const emailLower = email.toLowerCase();

      if (alreadyEmailed.has(emailLower)) {
        skippedAlreadyEmailed++;
        continue;
      }

      if (alreadyActiveFastiq.has(emailLower)) {
        skippedAlreadyFastiq++;
        continue;
      }

      const firstName = jr.poster_first_name || parseFirstName(jr.poster_name) || parseFirstName(jr.created_by?.split('@')[0]);
      
      toSend.push({
        email: emailLower,
        firstName,
        jobRequestId: jr.id,
      });
    }

    console.log(`\n=== Summary ===`);
    console.log(`Students to email: ${toSend.length}`);
    console.log(`Skipped (already emailed): ${skippedAlreadyEmailed}`);
    console.log(`Skipped (already on FASTIQ): ${skippedAlreadyFastiq}`);

    if (dry_run) {
      console.log(`\n=== DRY RUN — No emails sent ===`);
      console.log(`Would send to:`, toSend.map(s => s.email));
      return Response.json({
        success: true,
        dry_run: true,
        total_zero_response: zeroResponseRequests.length,
        unique_students: studentMap.size,
        to_send: toSend.length,
        skipped_already_emailed: skippedAlreadyEmailed,
        skipped_already_fastiq: skippedAlreadyFastiq,
        recipients: toSend.map(s => ({ email: s.email, firstName: s.firstName })),
      });
    }

    // Step 5: Send in batches
    let totalSent = 0;
    let totalFailed = 0;
    const batchCount = Math.ceil(toSend.length / batch_size);

    for (let batchIndex = 0; batchIndex < batchCount; batchIndex++) {
      const batchStart = batchIndex * batch_size;
      const batch = toSend.slice(batchStart, batchStart + batch_size);

      console.log(`\n--- Batch ${batchIndex + 1}/${batchCount}: ${batch.length} emails ---`);

      for (const student of batch) {
        try {
          const emailHtml = buildIntroEmail(student.firstName);

          await base44.asServiceRole.integrations.Core.SendEmail({
            to: student.email,
            subject: `${student.firstName} — I built something to help you find opportunities faster`,
            body: emailHtml,
            from_name: 'Jill Osinoff / College Fast Forward'
          });

          // Track the send
          await base44.asServiceRole.entities.FastiqOutreachEmail.create({
            user_email: student.email,
            email_type: 'zero_response_intro',
            sent_date: new Date().toISOString(),
            opened: false,
            clicked_fastiq: false,
            job_request_id: student.jobRequestId,
            student_name: student.firstName,
          });

          totalSent++;
          console.log(`  ✅ Sent to ${student.email} (${student.firstName})`);

          // Rate limit: 2 second delay between emails
          await sleep(2000);
        } catch (err) {
          totalFailed++;
          console.error(`  ❌ Failed for ${student.email}:`, err.message);
        }
      }

      // If more batches remain, wait 5 minutes (but cap to avoid Deno timeout)
      // NOTE: Deno functions have ~60s timeout. For large batches, re-run the function.
      if (batchIndex < batchCount - 1) {
        console.log(`Batch ${batchIndex + 1} complete. Next batch starting...`);
        // In practice, Deno will timeout for 5-min waits. 
        // We process what we can in one run; already-sent tracking prevents duplicates.
        await sleep(5000); // 5s gap between batches within one run
      }
    }

    console.log(`\n=== Campaign Complete ===`);
    console.log(`Total sent: ${totalSent}`);
    console.log(`Total failed: ${totalFailed}`);

    return Response.json({
      success: true,
      total_zero_response: zeroResponseRequests.length,
      unique_students: studentMap.size,
      emails_sent: totalSent,
      emails_failed: totalFailed,
      skipped_already_emailed: skippedAlreadyEmailed,
      skipped_already_fastiq: skippedAlreadyFastiq,
    });

  } catch (error) {
    console.error('sendFastiqIntroEmails error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});