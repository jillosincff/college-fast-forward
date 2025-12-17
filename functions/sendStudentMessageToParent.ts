import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { match_id, message } = await req.json();

    if (!match_id || !message) {
      return Response.json({ 
        error: 'match_id and message are required' 
      }, { status: 400 });
    }

    // Get match details
    const matches = await base44.asServiceRole.entities.Match.filter({ id: match_id });
    const match = matches?.[0];
    
    if (!match) {
      return Response.json({ error: 'Match not found' }, { status: 404 });
    }

    // Get help request details
    const helpRequests = await base44.asServiceRole.entities.HelpRequest.filter({ 
      id: match.help_request_id 
    });
    const helpRequest = helpRequests?.[0];
    
    if (!helpRequest) {
      return Response.json({ error: 'Help request not found' }, { status: 404 });
    }

    // Get parent details
    const parentUsers = await base44.asServiceRole.entities.User.filter({ id: match.parent_id });
    const parent = parentUsers?.[0];
    
    const parentExpertise = await base44.asServiceRole.entities.ParentExpertise.filter({ parent_id: match.parent_id });
    const expertise = parentExpertise?.[0];

    // Format help types
    const helpTypeLabels = {
      career_advice: 'Career advice',
      internship_leads: 'Internship leads',
      resume_review: 'Resume review',
      interview_prep: 'Interview prep',
      industry_insights: 'Industry insights',
      networking_intros: 'Networking intros',
      informational_interview: 'Informational interview'
    };

    const helpTypesText = (helpRequest.help_types || [])
      .map(t => helpTypeLabels[t] || t)
      .join(', ');

    const timelineLabels = {
      this_week: 'This week',
      this_month: 'This month',
      no_rush: 'No rush, flexible timeline'
    };
    
    const formattedTimeline = timelineLabels[helpRequest.timeline] || helpRequest.timeline;
    const isUrgent = helpRequest.timeline === 'this_week';

    const studentName = user.full_name || user.email;
    const studentEmail = user.email;
    const studentMajor = helpRequest.student_major || '';
    const studentYear = helpRequest.student_year || '';

    const subject = `${studentName.split(' ')[0]} wants to connect about ${helpTypesText.split(',')[0]}`;

    // SendGrid API call
    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY');
    
    const emailHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background-color: #f9fafb; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #fa4616 0%, #e63e13 100%); color: white; padding: 2rem; text-align: center; }
    .header h1 { margin: 0; font-size: 1.5rem; font-weight: 700; }
    .content { padding: 2rem; }
    .student-info { background: #f9fafb; border-left: 4px solid #fa4616; padding: 1.25rem; margin: 1.5rem 0; border-radius: 6px; }
    .student-info p { margin: 0.5rem 0; font-size: 0.95rem; }
    .student-info strong { color: #111827; font-weight: 600; }
    .message-section h2 { color: #111827; font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem; }
    .message-box { background: #ffffff; border: 2px solid #e5e7eb; border-left: 4px solid #fa4616; padding: 1.25rem; border-radius: 6px; white-space: pre-wrap; line-height: 1.7; color: #1f2937; }
    .cta-section { text-align: center; margin: 2rem 0; padding: 1.5rem; background: #fef2f2; border-radius: 8px; }
    .cta-button { display: inline-block; background: #fa4616; color: white; text-decoration: none; padding: 0.875rem 2rem; border-radius: 8px; font-weight: 600; font-size: 1rem; margin-top: 1rem; }
    .footer { background: #f9fafb; padding: 1.5rem 2rem; text-align: center; color: #6b7280; font-size: 0.875rem; border-top: 1px solid #e5e7eb; }
    .badge { display: inline-block; padding: 0.25rem 0.75rem; background: #fee2e2; color: #991b1b; border-radius: 12px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; margin-left: 0.5rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 A UF Student Wants Your Help!</h1>
    </div>
    <div class="content">
      <p>Hi ${parent?.full_name || 'there'},</p>
      <p>Great news! A UF student you matched with on the Gator Network has reached out for help.</p>
      <div class="student-info">
        <p><strong>Student:</strong> ${studentName}</p>
        <p><strong>Email:</strong> <a href="mailto:${studentEmail}" style="color: #fa4616;">${studentEmail}</a></p>
        ${studentMajor ? `<p><strong>Major:</strong> ${studentMajor}</p>` : ''}
        ${studentYear ? `<p><strong>Year:</strong> ${studentYear}</p>` : ''}
        <p><strong>Looking for:</strong> ${helpTypesText}</p>
        <p><strong>Timeline:</strong> ${formattedTimeline}${isUrgent ? ' <span class="badge">Urgent</span>' : ''}</p>
      </div>
      <div class="message-section">
        <h2>Their Message:</h2>
        <div class="message-box">${message}</div>
      </div>
      <div class="cta-section">
        <p style="margin: 0 0 0.5rem 0; color: #111827; font-weight: 600;">Ready to help?</p>
        <p style="margin: 0 0 1rem 0; color: #6b7280; font-size: 0.9rem;">Reply directly to ${studentName.split(' ')[0]} at their email</p>
        <a href="mailto:${studentEmail}?subject=Re: Your request for ${helpTypesText.split(',')[0]}" class="cta-button">Reply to ${studentName.split(' ')[0]}</a>
      </div>
      <p style="color: #6b7280; font-size: 0.9rem; margin-top: 2rem;"><strong>Why you received this:</strong> You matched with ${studentName}'s request because of your ${expertise?.industry || ''} experience and ability to help with ${helpTypesText.toLowerCase()}.</p>
    </div>
    <div class="footer">
      <p><strong>You're making a difference! 🙌</strong></p>
      <p>Thanks for being part of the Gator Network and helping students succeed.</p>
    </div>
  </div>
</body>
</html>`;

    const emailText = `A UF Student Wants Your Help!

Hi ${parent?.full_name || 'there'},

Great news! A UF student you matched with on the Gator Network has reached out for help.

STUDENT INFO:
Name: ${studentName}
Email: ${studentEmail}
${studentMajor ? `Major: ${studentMajor}` : ''}
${studentYear ? `Year: ${studentYear}` : ''}
Looking for: ${helpTypesText}
Timeline: ${formattedTimeline}

THEIR MESSAGE:

${message}

---

READY TO HELP?
Reply directly to ${studentName} at: ${studentEmail}

Why you received this: You matched with ${studentName}'s request because of your ${expertise?.industry || ''} experience and ability to help with ${helpTypesText.toLowerCase()}.

Thanks for being part of the Gator Network!`;

    // Send via SendGrid
    const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: parent?.email || parent_email }],
          subject: subject
        }],
        from: {
          email: 'noreply@collegefastforward.com',
          name: 'Gator Network'
        },
        reply_to: {
          email: studentEmail,
          name: studentName
        },
        content: [
          {
            type: 'text/plain',
            value: emailText
          },
          {
            type: 'text/html',
            value: emailHtml
          }
        ]
      })
    });

    if (!sendGridResponse.ok) {
      const errorText = await sendGridResponse.text();
      console.error('SendGrid error:', errorText);
      throw new Error('Failed to send email via SendGrid');
    }

    return Response.json({
      success: true,
      message: 'Message sent successfully to parent'
    });

  } catch (error) {
    console.error('Error sending message to parent:', error);
    return Response.json({ 
      error: 'Failed to send message',
      details: error.message 
    }, { status: 500 });
  }
});