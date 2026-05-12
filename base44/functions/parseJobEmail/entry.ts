import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Build a human-readable summary of the parsed email update
function buildUpdateSummary(parsed) {
  const parts = [];
  if (parsed.status) parts.push(`Status changed to ${parsed.status}`);
  if (parsed.status === 'Interview Scheduled') {
    if (parsed.interview_date && parsed.interview_time) {
      const d = new Date(`${parsed.interview_date}T${parsed.interview_time}`);
      const dateStr = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
      const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      let line = `Interview scheduled for ${dateStr} at ${timeStr}`;
      if (parsed.interview_format) line += ` via ${parsed.interview_format}`;
      if (parsed.interviewer_name) line += ` with ${parsed.interviewer_name}`;
      parts.push(line);
    }
  }
  if (parsed.status === 'Rejected' && parsed.rejection_reason) {
    parts.push(`Reason: ${parsed.rejection_reason}`);
  }
  return parts;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subject, body, sent_date, send_notification = true } = await req.json();

    if (!body && !subject) {
      return Response.json({ error: 'Email subject or body is required' }, { status: 400 });
    }

    const userPrompt = `You are an expert at parsing job search emails. Given the email below, extract structured data for an Application Tracker.

Detection Rules (Priority Order):
1. Application Confirmation → "thank you for applying", "application received", "application submitted", "we've received your application"
2. Interview Invite → "interview", "schedule", "speak with", "meet with", "calendar invite", "Zoom", "Teams link"
3. Rejection → "regret", "not moving forward", "we've decided to move forward with other candidates", "thank you but"
4. Offer → "offer", "excited to extend", "formal offer", "congratulations"

Rules:
- Be conservative with confidence. If unsure about status, default to "Applied".
- NEVER hallucinate — only use information clearly present in the email.
- For interview_time use 24h format (HH:MM). For dates use ISO format (YYYY-MM-DD).

Sent Date: ${sent_date || 'unknown'}
Subject: ${subject || '(no subject)'}
Body:
${body}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: userPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          company_name: { type: 'string' },
          job_title: { type: 'string' },
          application_date: { type: 'string' },
          status: { type: 'string', enum: ['Applied', 'In Review', 'Interview Scheduled', 'Offer Received', 'Rejected', 'Other'] },
          interview_date: { type: 'string' },
          interview_time: { type: 'string' },
          interview_format: { type: 'string', enum: ['Zoom', 'Phone', 'In-person', 'On-site', 'Teams', 'Unknown'] },
          interviewer_name: { type: 'string' },
          interviewer_title: { type: 'string' },
          job_posting_url: { type: 'string' },
          rejection_reason: { type: 'string' },
          email_type: { type: 'string', enum: ['application_confirmation', 'interview_invite', 'rejection', 'offer', 'status_update', 'unknown'] },
          confidence: { type: 'number' },
        },
      },
    });

    // Send notification email if the parse was meaningful
    if (send_notification && result && result.status && result.status !== 'Other' && result.confidence > 0.6) {
      const updateLines = buildUpdateSummary(result);
      const company = result.company_name || 'the company';
      const role = result.job_title || 'your application';
      const firstName = user.full_name?.split(' ')[0] || 'there';
      const appUrl = Deno.env.get('APP_BASE_URL') || 'https://app.collegefastforward.com';

      const emailBody = `
        <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1A1A1A;">
          <div style="background: #0021A5; padding: 24px 28px; border-radius: 12px 12px 0 0;">
            <p style="color: #fff; font-size: 13px; margin: 0; opacity: 0.8;">College Fast Forward</p>
            <h1 style="color: #fff; font-size: 22px; margin: 8px 0 0; font-weight: 700;">📬 Application Update Detected</h1>
          </div>

          <div style="background: #fff; border: 1px solid #E8E8E8; border-top: none; border-radius: 0 0 12px 12px; padding: 28px;">
            <p style="font-size: 15px; color: #444; margin: 0 0 20px;">Hey ${firstName},</p>
            <p style="font-size: 15px; color: #444; margin: 0 0 20px; line-height: 1.6;">
              Good news — we detected a new email for your <strong>${company} ${role}</strong> application.
            </p>

            <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
              <p style="font-size: 11px; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 10px;">
                What Changed
              </p>
              ${updateLines.map(line => `
                <div style="display: flex; gap: 8px; margin-bottom: 6px; align-items: flex-start;">
                  <span style="color: #10B981; font-size: 14px; flex-shrink: 0;">✓</span>
                  <span style="font-size: 13px; color: #1A1A1A;">${line}</span>
                </div>
              `).join('')}
            </div>

            <a href="${appUrl}/#ApplicationTracker"
              style="display: block; background: #E85D20; color: #fff; text-decoration: none;
                     text-align: center; padding: 14px 24px; border-radius: 10px;
                     font-weight: 700; font-size: 15px; margin-bottom: 16px;">
              View in Application Tracker →
            </a>

            <p style="font-size: 12px; color: #AAA; text-align: center; margin: 0;">
              You're receiving this because you connected your email to CFF Application Tracker.
            </p>
          </div>
        </div>
      `;

      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `Your ${company} application was updated`,
        body: emailBody,
        from_name: 'College Fast Forward',
      });
    }

    return Response.json({ success: true, parsed: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});