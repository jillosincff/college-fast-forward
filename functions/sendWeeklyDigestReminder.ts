import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch recent job requests from the past week to include in the reminder
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentRequests = await base44.asServiceRole.entities.JobRequest.filter(
      { 
        status: 'active',
        created_date: { $gte: oneWeekAgo.toISOString() }
      },
      '-created_date',
      20
    );

    // Build a summary of recent requests for the reminder
    const requestSummary = recentRequests.slice(0, 8).map(r => {
      const name = r.poster_first_name 
        ? `${r.poster_first_name} ${r.poster_last_name?.charAt(0) || ''}.`
        : r.poster_name?.split(' ')[0] || 'A student';
      const industry = r.target_industry || 'various industries';
      const roleType = r.role_type === 'internship' ? 'seeking internships' : 
                       r.role_type === 'full_time' ? 'seeking full-time roles' : 'exploring opportunities';
      const location = r.location_city ? `(${r.location_city})` : '';
      
      return `• ${name} — ${industry}, ${roleType} ${location}`;
    }).join('\n');

    const totalNewRequests = recentRequests.length;
    const additionalCount = Math.max(0, totalNewRequests - 8);

    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0021A5, #FA4616); color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 20px; }
    .requests { background: white; padding: 16px; border-radius: 8px; border-left: 4px solid #0021A5; margin: 16px 0; }
    .requests pre { white-space: pre-wrap; font-family: inherit; margin: 0; font-size: 14px; }
    .template { background: #fffbeb; padding: 16px; border-radius: 8px; border: 1px solid #fcd34d; margin-top: 20px; }
    .template h3 { color: #92400e; margin-top: 0; }
    .template pre { white-space: pre-wrap; font-family: inherit; font-size: 13px; background: white; padding: 12px; border-radius: 6px; }
    .cta { text-align: center; margin: 24px 0; }
    .cta a { background: #0021A5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .footer { text-align: center; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📧 Weekly Digest Reminder</h1>
    <p style="margin: 8px 0 0 0; opacity: 0.9;">Time to write this week's UF community newsletter!</p>
  </div>

  <div class="content">
    <h2>📊 This Week's Stats</h2>
    <p><strong>${totalNewRequests} new student requests</strong> were posted in the last 7 days.</p>

    <div class="requests">
      <h3 style="margin-top: 0;">Recent Requests to Highlight:</h3>
      <pre>${requestSummary || 'No new requests this week'}</pre>
      ${additionalCount > 0 ? `<p style="margin-bottom: 0; color: #64748b; font-size: 13px;">(+ ${additionalCount} more new requests this week)</p>` : ''}
    </div>

    <div class="cta">
      <a href="https://collegefastforward.com/#Connections">View All Requests →</a>
    </div>

    <div class="template">
      <h3>📝 Suggested Email Template</h3>
      <pre>Subject: [Write something catchy here!]

Hey UF Fam

Quick Sunday check-in: here are a few of the newest UF students who just posted what they need. Many match your industry or city.

This week's highlights:
${requestSummary}
${additionalCount > 0 ? `(+ ${additionalCount} more new requests this week)` : ''}

👉 See all new requests (30-second scan)
[Link to: https://collegefastforward.com/#Connections]

P.S. Every time you message or help any student, YOUR Gator's own requests automatically get pinned to the very top of the feed for 7 full days — giving them maximum visibility to the entire network.

One small action from you = huge boost for your student.

Thanks for everything you do,
[Your Name] & the College Fast Forward team

(Not the right week? No problem — we'll catch you next Sunday. University of Florida 🧡💙)</pre>
    </div>
  </div>

  <div class="footer">
    <p>This is an automated reminder from College Fast Forward.<br>
    Scheduled to send every Friday at 8am EST.</p>
  </div>
</body>
</html>
    `;

    await base44.integrations.Core.SendEmail({
      to: 'josinoff@gmail.com',
      subject: `📝 Weekly Digest Reminder: ${totalNewRequests} new student requests to share!`,
      body: emailBody
    });

    return Response.json({ 
      success: true, 
      message: 'Reminder email sent successfully',
      stats: {
        totalNewRequests,
        requestsHighlighted: Math.min(8, totalNewRequests)
      }
    });

  } catch (error) {
    console.error('Failed to send weekly digest reminder:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});