import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// AUTOMATION: Daily at 7:30 AM ET (11:30 UTC) — runs AFTER both trial automations complete.
// Reads today's SchedulerRun records and sends a summary email to support@collegefastforward.com.
// If either automation didn't run today, the email explicitly says so — this is the monitoring layer.

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const callerUser = await base44.auth.me().catch(() => null);
  if (callerUser !== null && callerUser?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const today = new Date();
  const todayStr = today.toDateString();
  const dateLabel = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Fetch today's SchedulerRun records for both automations
  let allRuns = [];
  try {
    allRuns = await base44.asServiceRole.entities.SchedulerRun.list('-run_at', 50);
  } catch (e) {
    console.error('[sendDailyTrialAutomationSummary] Could not fetch SchedulerRun:', e.message);
  }

  const todayRuns = allRuns.filter(r => new Date(r.run_at).toDateString() === todayStr);

  const expiryRun = todayRuns.find(r => r.automation_name === 'checkTrialExpiry');
  const schedulerRun = todayRuns.find(r => r.automation_name === 'trialEmailScheduler');

  // Build summary sections
  const formatRun = (run, name) => {
    if (!run) {
      return `❌ ${name}: DID NOT RUN TODAY — check automation is enabled and function is deployed.`;
    }
    const errList = run.errors?.length > 0
      ? `\n  Errors (${run.errors.length}):\n` + run.errors.map(e => `    - ${e.user_id}: ${e.error_message}`).join('\n')
      : '';
    const details = run.details && Object.keys(run.details).length > 0
      ? '\n  Breakdown: ' + Object.entries(run.details).map(([k, v]) => `${k}=${v}`).join(', ')
      : '';
    return `✅ ${name}: scanned=${run.users_scanned}, actions=${run.actions_taken}, errors=${run.errors?.length || 0}, duration=${run.duration_ms}ms${details}${errList}`;
  };

  const expirySummary = formatRun(expiryRun, 'checkTrialExpiry');
  const schedulerSummary = formatRun(schedulerRun, 'trialEmailScheduler');

  const hasErrors = (expiryRun?.errors?.length > 0) || (schedulerRun?.errors?.length > 0) || !expiryRun || !schedulerRun;
  const statusEmoji = hasErrors ? '⚠️' : '✅';

  const emailBody = `Trial Automation Summary — ${dateLabel}

${expirySummary}

${schedulerSummary}

---
If you're not seeing this email by 8 AM ET each morning, one or both automations have stopped running. Check the Base44 automation dashboard.

College Fast Forward · support@collegefastforward.com`;

  try {
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'support@collegefastforward.com',
      subject: `${statusEmoji} Trial Automation Summary — ${dateLabel}`,
      body: emailBody,
    });
  } catch (e) {
    console.error('[sendDailyTrialAutomationSummary] Failed to send summary email:', e.message);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }

  return Response.json({
    success: true,
    expiry_run_found: !!expiryRun,
    scheduler_run_found: !!schedulerRun,
    has_errors: hasErrors,
  });
});