import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import bcrypt from 'npm:bcryptjs@2.4.3';

// Centralized function to send the verification email
async function triggerVerificationEmail(email, token, origin) {
  const verificationUrl = `${origin}/#/VerifyEmail?token=${token}`;
  
  const emailBody = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; background: #F5F5F5; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <p style="font-size: 13px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: #E85D20; margin: 0;">CLIFF · COLLEGE FAST FORWARD</p>
      </div>
      <div style="background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <div style="background: #0A0A0A; padding: 36px 36px 32px;">
          <p style="font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #E85D20; margin: 0 0 12px;">👋 VERIFY YOUR EMAIL</p>
          <h1 style="font-size: 26px; font-weight: 700; color: #fff; margin: 0 0 10px; line-height: 1.3;">One last step.</h1>
          <p style="font-size: 15px; color: rgba(255,255,255,0.55); margin: 0; line-height: 1.6;">Confirm your email to activate your account and start finding warm paths into the companies you care about.</p>
        </div>
        <div style="padding: 28px 36px 32px;">
          <p style="font-size: 15px; color: #444; line-height: 1.7; margin: 0 0 16px;">Thanks for joining College Fast Forward. Click the button below to verify your email address and finish setting up your account.</p>
          <div style="text-align: center; margin: 8px 0 20px;">
            <a href="${verificationUrl}" style="display: inline-block; background: #E85D20; color: #fff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 10px;">Verify My Email →</a>
          </div>
          <p style="font-size: 13px; color: #888; line-height: 1.6; margin: 0;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #E85D20; word-break: break-all;">${verificationUrl}</a>
          </p>
        </div>
      </div>
      <div style="text-align: center; margin-top: 24px;">
        <p style="font-size: 12px; color: #AAAAAA; margin: 0;">College Fast Forward · support@collegefastforward.com</p>
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
      subject: 'Verify your email for College Fast Forward',
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

const ALLOWED_ORIGINS = ['https://collegefastforward.com', 'https://www.collegefastforward.com'];
function getCORSHeaders(req) {
  const origin = req.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

Deno.serve(async (req) => {
  const corsHeaders = getCORSHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("=== REGISTRATION STARTED ===");
    console.log("Timestamp:", new Date().toISOString());
    console.log("Request URL:", req.url);
    console.log("Request method:", req.method);
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));
    
    const { email, password, full_name, persona, referral_code } = await req.json();
    console.log("Request data:", { email, full_name, persona, referral_code, hasPassword: !!password });

    if (!email || !password || !full_name) {
      console.error("Missing required fields");
      return new Response(JSON.stringify({ error: 'Missing required fields: email, password, full_name' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const emailLower = email.toLowerCase().trim();

    console.log("Initializing Base44 client...");
    const base44 = createClientFromRequest(req);

    console.log("Checking for existing users...");
    const existingUsers = await base44.asServiceRole.entities.User.filter({ email: emailLower });
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

    // Get current user count to assign signup_order
    console.log("Getting current user count for signup_order...");
    let signupOrder = null;
    try {
      const allUsers = await base44.asServiceRole.entities.User.filter({});
      signupOrder = (allUsers?.length || 0) + 1;
      console.log("Assigned signup_order:", signupOrder);
    } catch (countErr) {
      console.error("Failed to get user count for signup_order:", countErr);
    }

    // Look up ambassador if referral code provided
    let ambassadorId = null;
    let teamLeadId = null;
    if (referral_code && referral_code.trim()) {
      console.log("Looking up referral code:", referral_code);
      try {
        // Try to find user with matching referral code pattern (stored as ambassador code)
        const ambassadors = await base44.asServiceRole.entities.User.filter({ ambassador_code: referral_code.trim().toUpperCase() });
        if (ambassadors && ambassadors.length > 0) {
          ambassadorId = ambassadors[0].id;
          teamLeadId = ambassadors[0].team_lead_id || null;
          console.log("Found ambassador:", ambassadorId, "team_lead:", teamLeadId);
        } else {
          console.log("No ambassador found for code:", referral_code);
        }
      } catch (lookupErr) {
        console.error("Failed to lookup referral code:", lookupErr);
      }
    }

    console.log("Creating registration attempt...");
    await base44.asServiceRole.entities.RegistrationAttempt.create({
      email: emailLower,
      full_name,
      password_hash: passwordHash,
      token: verificationToken,
      status: 'pending',
      persona: persona || 'student',
      signup_order: signupOrder,
      referral_code: referral_code?.trim()?.toUpperCase() || null,
      ambassador_id: ambassadorId,
      team_lead_id: teamLeadId
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