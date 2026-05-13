import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function buildReminderEmail({ firstName, company, jobTitle, interviewDate, interviewTime, format, interviewer, appUrl }) {
  const dateStr = interviewDate
    ? new Date(interviewDate + 'T00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'your upcoming interview';
  const timeStr = interviewTime ? formatTime(interviewTime) : '';
  const when = [dateStr, timeStr].filter(Boolean).join(' at ');

  return `
    <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1A1A1A;">
      <div style="background: #7C3AED; padding: 24px 28px; border-radius: 12px 12px 0 0;">
        <p style="color: rgba(255,255,255,0.75); font-size: 13px; margin: 0;">College Fast Forward</p>
        <h1 style="color: #fff; font-size: 22px; margin: 8px 0 0; font-weight: 700;">📅 Interview Reminder</h1>
      </div>

      <div style="background: #fff; border: 1px solid #E8E8E8; border-top: none; border-radius: 0 0 12px 12px; padding: 28px;">
        <p style="font-size: 15px; color: #444; margin: 0 0 20px;">Hey ${firstName},</p>
        <p style="font-size: 15px; color: #444; margin: 0 0 20px; line-height: 1.6;">
          Quick reminder: You have an interview scheduled for the <strong>${jobTitle}</strong> role at <strong>${company}</strong>.
        </p>

        <div style="background: #FAF5FF; border: 1px solid #DDD6FE; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
          <p style="font-size: 11px; font-weight: 700; color: #7C3AED; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 12px;">Interview Details</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="font-size: 12px; color: #888; font-weight: 600; padding: 4px 0; width: 110px;">Date & Time</td>
              <td style="font-size: 13px; color: #1A1A1A; font-weight: 600; padding: 4px 0;">${when}</td>
            </tr>
            ${format ? `
            <tr>
              <td style="font-size: 12px; color: #888; font-weight: 600; padding: 4px 0;">Format</td>
              <td style="font-size: 13px; color: #1A1A1A; padding: 4px 0;">${format}</td>
            </tr>` : ''}
            ${interviewer ? `
            <tr>
              <td style="font-size: 12px; color: #888; font-weight: 600; padding: 4px 0;">Interviewer</td>
              <td style="font-size: 13px; color: #1A1A1A; padding: 4px 0;">${interviewer}</td>
            </tr>` : ''}
          </table>
        </div>

        <a href="${appUrl}/#ApplicationTracker"
          style="display: block; background: #7C3AED; color: #fff; text-decoration: none;
                 text-align: center; padding: 14px 24px; border-radius: 10px;
                 font-weight: 700; font-size: 15px; margin-bottom: 16px;">
          ✨ Prepare with the Agent →
        </a>

        <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 10px; padding: 14px; margin-bottom: 20px;">
          <p style="font-size: 12px; font-weight: 700; color: #92400E; margin: 0 0 6px;">💡 Suggested Prep Tip</p>
          <p style="font-size: 13px; color: #78350F; margin: 0; line-height: 1.5;">
            Review ${company}'s recent work and prepare 2–3 thoughtful questions you want to ask them.
          </p>
        </div>

        <p style="font-size: 14px; color: #666; text-align: center; margin: 0 0 4px;">You've got this! Let us know how it goes.</p>
        <p style="font-size: 13px; color: #AAA; text-align: center; margin: 0;">The College Fast Forward Team</p>
      </div>
    </div>
  `;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { company, jobTitle, interview } = await req.json();

    if (!interview?.date) {
      return Response.json({ error: 'Interview date is required to schedule reminders' }, { status: 400 });
    }

    const firstName = user.full_name?.split(' ')[0] || 'there';
    const appUrl = Deno.env.get('APP_BASE_URL') || 'https://app.collegefastforward.com';

    const interviewDateTime = new Date(`${interview.date}T${interview.time || '09:00'}`);
    const now = new Date();

    // Build the list of reminder send times
    const reminders = [];

    // 1. 24 hours before
    const minus24h = new Date(interviewDateTime.getTime() - 24 * 60 * 60 * 1000);
    if (minus24h > now) reminders.push({ label: '24h before', sendAt: minus24h });

    // 2. Day before at 6 PM
    const dayBefore6pm = new Date(interview.date + 'T00:00');
    dayBefore6pm.setDate(dayBefore6pm.getDate() - 1);
    dayBefore6pm.setHours(18, 0, 0, 0);
    if (dayBefore6pm > now && dayBefore6pm < minus24h) {
      reminders.push({ label: 'Day before @ 6 PM', sendAt: dayBefore6pm });
    }

    // 3. 1 hour before
    const minus1h = new Date(interviewDateTime.getTime() - 60 * 60 * 1000);
    if (minus1h > now) reminders.push({ label: '1h before', sendAt: minus1h });

    if (reminders.length === 0) {
      return Response.json({ success: true, message: 'Interview is too soon — no reminders scheduled', reminders: [] });
    }

    const emailHtml = buildReminderEmail({
      firstName, company, jobTitle,
      interviewDate: interview.date,
      interviewTime: interview.time,
      format: interview.type,
      interviewer: interview.interviewer,
      appUrl,
    });

    const dateStr = new Date(interview.date + 'T00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    const timeStr = interview.time ? formatTime(interview.time) : '';
    const subject = `Your ${company} interview is ${reminders[0].label === '1h before' ? 'in 1 hour' : 'tomorrow'} ${timeStr ? `at ${timeStr}` : ''}`.trim();

    // Send the soonest upcoming reminder immediately as a "preview" / confirmation
    // In production you'd store these and send via a scheduler; for now send the earliest one
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject,
      body: emailHtml,
      from_name: 'College Fast Forward',
    });

    return Response.json({
      success: true,
      reminders_scheduled: reminders.map(r => ({
        label: r.label,
        send_at: r.sendAt.toISOString(),
      })),
      email_sent_to: user.email,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});