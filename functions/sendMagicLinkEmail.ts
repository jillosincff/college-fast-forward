import { createClient } from 'npm:@base44/sdk@0.1.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { email } = await req.json();
        if (!email) {
            return new Response(JSON.stringify({ error: "Email is required." }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const emailLower = email.toLowerCase();
        
        const base44 = createClient({
            appId: Deno.env.get('BASE44_APP_ID'),
            serviceRoleKey: Deno.env.get('BASE44_SERVICE_ROLE_KEY'),
        });
        
        // Check if user exists - but don't require it
        let userExists = false;
        try {
            const { data: users } = await base44.entities.User.filter({ email: emailLower });
            userExists = users && users.length > 0;
        } catch (error) {
            // If we can't check users, continue anyway - the magic link verification will handle it
        }

        const token = `ml_${crypto.randomUUID()}`;
        const expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

        await base44.entities.MagicLink.create({
            email: emailLower,
            token,
            expires_at,
        });

        const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
        if (!SENDGRID_API_KEY) {
            throw new Error("Email provider API key is not configured.");
        }
        
        // Use environment-aware origin
        const originHeader = req.headers.get('origin');
        const forwardedHost = req.headers.get('x-forwarded-host');
        const appOrigin = originHeader || (forwardedHost ? `https://${forwardedHost}` : 'https://collegefastforward.com');
        
        const magicLink = `${appOrigin}/#MagicLogin?token=${token}`;
        
        // Dynamic email content based on whether user exists
        const actionText = userExists ? 'sign in to' : 'join';
        const welcomeText = userExists ? 'Welcome back!' : 'Welcome to College Fast Forward!';
        
        const emailBody = `
            <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px;">
                <h1 style="color: #0021A5; text-align: center;">${welcomeText}</h1>
                <p>Hi,</p>
                <p>Click the button below to ${actionText} your College Fast Forward account. This link is valid for 15 minutes and can only be used once.</p>
                <div style="text-align: center; margin: 20px 0;">
                  <a href="${magicLink}" style="display: inline-block; background-color: #FA4616; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    ${userExists ? 'Sign In Securely' : 'Join College Fast Forward'}
                  </a>
                </div>
                <p>If you did not request this email, you can safely ignore it.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #777;">Go Gators! 🐊</p>
            </div>
        `;
        
        const sendgridPayload = {
          personalizations: [{ to: [{ email: emailLower }] }],
          from: { email: 'hello@collegefastforward.com', name: 'College Fast Forward' },
          subject: userExists ? '🐊 Your Secure Sign-In Link' : '🐊 Welcome to College Fast Forward!',
          content: [{ type: 'text/html', value: emailBody }],
        };

        const sendgridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(sendgridPayload),
        });

        if (!sendgridResponse.ok) {
            const errorText = await sendgridResponse.text();
            throw new Error("Failed to send login email.");
        }

        return new Response(JSON.stringify({ success: true }), { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: `An unexpected error occurred: ${e.message}` }), { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
    }
});