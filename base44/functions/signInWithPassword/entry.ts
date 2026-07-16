import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import bcrypt from 'npm:bcryptjs@2.4.3';

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
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const emailLower = email.toLowerCase().trim();
    const base44 = createClientFromRequest(req);

    // The User record's password is always authoritative (it's updated on password
    // reset). Only fall back to the original signup record if the account has no
    // password stored directly.
    const users = await base44.asServiceRole.entities.User.filter({ email: emailLower });
    const userRecord = users?.[0];

    if (!userRecord) {
      return new Response(JSON.stringify({ error: 'No account found with this email. Try signing in with Google or create a new account.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let passwordValid = false;

    if (userRecord.hashed_password) {
      passwordValid = await bcrypt.compare(password, userRecord.hashed_password);
    } else {
      // Fall back to the most recent signup record's password hash
      const attempts = await base44.asServiceRole.entities.RegistrationAttempt.filter({ email: emailLower });
      const attempt = attempts
        ?.filter(a => a.password_hash)
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];

      if (!attempt) {
        return new Response(JSON.stringify({ error: 'Your account exists but has no password set. Use the magic link or reset your password to continue.' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      passwordValid = await bcrypt.compare(password, attempt.password_hash);
    }

    if (!passwordValid) {
      return new Response(JSON.stringify({ error: 'Incorrect password. Try a magic link if you recently changed your password.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Password is valid — generate a one-time magic link to create a real session
    const token = `ml_${crypto.randomUUID()}`;
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    await base44.asServiceRole.entities.MagicLink.create({
      email: emailLower,
      token,
      expires_at,
    });

    const origin = req.headers.get('origin') || 'https://www.collegefastforward.com';
    const magicLink = `${origin}/#/MigrationSignIn?token=${token}`;

    return new Response(JSON.stringify({ success: true, magicLink }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error('signInWithPassword error:', e);
    return new Response(JSON.stringify({ error: 'Sign in failed. Please try again.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});