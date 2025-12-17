import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { user_email, user_name, user_persona, user_id } = await req.json();
    
    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY');
    if (!sendGridApiKey) {
      console.error('SENDGRID_API_KEY not set');
      return Response.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const emailBody = {
      personalizations: [{
        to: [{ email: 'josinoff@gmail.com' }],
        subject: `🎉 New User Joined: ${user_name || user_email}`
      }],
      from: {
        email: 'noreply@collegefastforward.com',
        name: 'College Fast Forward'
      },
      content: [{
        type: 'text/html',
        value: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0021A5;">🐊 New User Joined College Fast Forward!</h2>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${user_name || 'Not provided'}</p>
              <p><strong>Email:</strong> ${user_email}</p>
              <p><strong>Role:</strong> ${user_persona || 'Not set'}</p>
              <p><strong>User ID:</strong> ${user_id}</p>
              <p><strong>Joined:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `
      }]
    };

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailBody)
    });

    if (!response.ok) {
      console.error('SendGrid error:', await response.text());
      return Response.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return Response.json({ success: true });

  } catch (error) {
    console.error('Notify new user error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});