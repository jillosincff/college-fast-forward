import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipientEmail, title, message, actionUrl, actionLabel } = await req.json();

    if (!recipientEmail || !title || !message) {
      return Response.json({ 
        error: 'Missing required fields: recipientEmail, title, message' 
      }, { status: 400 });
    }

    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    if (!SENDGRID_API_KEY) {
      console.error('SENDGRID_API_KEY not configured');
      return Response.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const actionButton = actionUrl ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
        <tr>
          <td align="center">
            <a href="${actionUrl}" style="display: inline-block; padding: 12px 32px; background-color: #0021A5; color: white; text-decoration: none; border-radius: 9999px; font-weight: bold;">
              ${actionLabel || 'View Details'}
            </a>
          </td>
        </tr>
      </table>
    ` : '';

    const emailBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">College Fast Forward</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #0021A5; margin-top: 0;">${title}</h2>
            <p style="font-size: 16px; color: #4b5563; margin-bottom: 20px;">${message}</p>
            
            ${actionButton}
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center;">
              <p>You received this notification from College Fast Forward</p>
              <p>To manage your notification preferences, visit your profile settings</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: recipientEmail }],
          subject: title
        }],
        from: {
          email: 'notifications@collegefastforward.com',
          name: 'College Fast Forward'
        },
        content: [{
          type: 'text/html',
          value: emailBody
        }]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('SendGrid error:', error);
      return Response.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return Response.json({ success: true });

  } catch (error) {
    console.error('Error sending notification email:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});