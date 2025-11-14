import { createClient } from 'npm:@base44/sdk@0.1.0';

// Initialize with Admin API Key to bypass RLS for reading user/attempt data
const base44 = createClient({
  appId: Deno.env.get('BASE44_APP_ID'),
  apiKey: Deno.env.get('BASE44_API_KEY'),
});

async function sendVerificationEmail(email, token) {
    const verificationUrl = `https://preview--college-fast-forward-fce23588.base44.app/#VerifyEmail?token=${token}`;
    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY');
    if (!sendGridApiKey) throw new Error('Email service not configured.');

    const emailData = {
        personalizations: [{ to: [{ email }] }],
        from: { email: 'jill@uffastforward.com', name: 'GatorConnect' },
        subject: 'Verify your GatorConnect Account (New Link)',
        content: [{ type: 'text/html', value: `<p>Here is your new verification link: <a href="${verificationUrl}">${verificationUrl}</a></p>` }]
    };

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${sendGridApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
    });

    if (!response.ok) {
        const responseBodyText = await response.text();
        throw new Error(`SendGrid API error (${response.status}): ${responseBodyText}`);
    }
}


Deno.serve(async (req) => {
  try {
    const { email } = await req.json();
    const lowerCaseEmail = email.toLowerCase();

    if (!lowerCaseEmail) {
      return new Response(JSON.stringify({ success: false, error: 'Email is required.' }), { status: 400 });
    }

    const { data: users } = await base44.entities.User.filter({ email: lowerCaseEmail });
    if (users && users.length > 0 && users[0].email_verified) {
        return new Response(JSON.stringify({ success: false, error: 'This email address has already been verified.' }), { status: 400 });
    }

    // Find the latest pending registration attempt for this email
    const { data: attempts } = await base44.entities.RegistrationAttempt.filter({ email: lowerCaseEmail, status: 'pending' }, '-created_date', 1);

    if (!attempts || attempts.length === 0) {
        return new Response(JSON.stringify({ success: false, error: 'No pending registration found for this email. Please sign up again.' }), { status: 404 });
    }

    const registrationAttempt = attempts[0];
    
    // We can just resend the email with the existing token
    await sendVerificationEmail(lowerCaseEmail, registrationAttempt.token);

    return new Response(JSON.stringify({ success: true, message: 'A new verification email has been sent.' }), { status: 200 });
  } catch (err) {
    console.error('Resend verification error:', err);
    return new Response(JSON.stringify({ success: false, error: 'An internal server error occurred.' }), { status: 500 });
  }
});