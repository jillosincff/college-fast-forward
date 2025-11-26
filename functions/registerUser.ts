import { createClient } from 'npm:@base44/sdk@0.8.4';
import bcrypt from 'npm:bcryptjs@2.4.3';

// Centralized function to send the verification email
async function triggerVerificationEmail(email, token, origin) {
  const verificationUrl = `${origin}/#VerifyEmail?token=${token}`;
  
  const emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🐊 Welcome to College Fast Forward!</h1>
      </div>
      <div style="padding: 30px 20px;">
        <h2 style="color: #333; margin-top: 0;">One last step...</h2>
        <p style="color: #555; line-height: 1.6;">
          Thanks for joining the Gator Network! To secure your account and start connecting, please verify your email address.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #FA4616; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Verify My Email
          </a>
        </div>
        <p style="color: #777; font-size: 14px;">
          If the button doesn't work, you can copy and paste this link into your browser:
          <br>
          <a href="${verificationUrl}" style="color: #0021A5; word-break: break-all;">${verificationUrl}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">Go Gators!</p>
      </div>
    </div>
  `;

  const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
  if (!SENDGRID_API_KEY) {
      console.error("SENDGRID_API_KEY not set");
      return { success: false, error: "Email service not configured." };
  }

  const sendgridPayload = {
      personalizations: [{ to: [{ email }] }],
      from: { email: 'hello@collegefastforward.com', name: 'College Fast Forward' },
      subject: '🐊 Verify Your Email for College Fast Forward',
      content: [{ type: 'text/html', value: emailBody }],
  };

  try {
    const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(sendgridPayload),
    });

    if (!sgRes.ok) {
        const errorBody = await sgRes.text();
        console.error('SendGrid error:', sgRes.status, errorBody);
        return { success: false, error: "Could not send verification email due to a server error." };
    }
    return { success: true };
  } catch (e) {
      console.error("Error sending verification email:", e);
      return { success: false, error: "Failed to connect to email service." };
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("=== REGISTRATION STARTED ===");
    console.log("Timestamp:", new Date().toISOString());
    console.log("Request URL:", req.url);
    console.log("Request method:", req.method);
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));
    
    const { email, password, full_name, persona } = await req.json();
    console.log("Request data:", { email, full_name, persona, hasPassword: !!password });

    if (!email || !password || !full_name) {
      console.error("Missing required fields");
      return new Response(JSON.stringify({ error: 'Missing required fields: email, password, full_name' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const emailLower = email.toLowerCase().trim();

    // Initialize Base44 client with service role key
    const appId = Deno.env.get('BASE44_APP_ID');
    const serviceRoleKey = Deno.env.get('BASE44_SERVICE_ROLE_KEY');
    
    if (!appId || !serviceRoleKey) {
      console.error("Missing BASE44_APP_ID or BASE44_SERVICE_ROLE_KEY");
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("Initializing Base44 client with service role...");
    const base44 = createClient({
      appId,
      serviceRoleKey,
    });

    console.log("Checking for existing users...");
    const existingUsers = await base44.entities.User.filter({ email: emailLower });
    if (existingUsers && existingUsers.length > 0) {
      console.log("User already exists:", emailLower);
      return new Response(JSON.stringify({ error: 'An account with this email already exists.' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("Hashing password...");
    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomUUID();

    console.log("Creating registration attempt...");
    await base44.entities.RegistrationAttempt.create({
      email: emailLower,
      full_name,
      password_hash: passwordHash,
      token: verificationToken,
      status: 'pending',
      persona: persona || 'student'
    });

    console.log("Registration attempt created, sending email...");
    const origin = req.headers.get('origin') || `https://${req.headers.get('host')}`;
    const emailResult = await triggerVerificationEmail(emailLower, verificationToken, origin);
    
    if (!emailResult.success) {
        console.error("Failed to send verification email:", emailResult.error);
        return new Response(JSON.stringify({
          error: emailResult.error,
          message: 'Account created, but failed to send verification email.'
        }), {
            status: 502,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
    
    console.log("=== REGISTRATION SUCCESSFUL ===");
    return new Response(JSON.stringify({
      success: true,
      message: 'Verification email sent. Please check your inbox.',
      email: emailLower
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error("=== REGISTRATION ERROR ===");
    console.error("Error details:", e);
    console.error("Error message:", e.message);
    console.error("Error stack:", e.stack);
    
    return new Response(JSON.stringify({ 
      error: e.message || 'An unexpected error occurred during registration.',
      details: e.stack
    }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});