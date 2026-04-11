import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import bcrypt from 'npm:bcryptjs@2.4.3';

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
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const emailLower = email.toLowerCase().trim();
    const base44 = createClientFromRequest(req);

    // First check RegistrationAttempt entity (new signups)
    const attempts = await base44.asServiceRole.entities.RegistrationAttempt.filter({ email: emailLower });
    const attempt = attempts
      ?.filter(a => a.password_hash)
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];

    let passwordValid = false;

    if (attempt) {
      passwordValid = await bcrypt.compare(password, attempt.password_hash);
    } else {
      // Fall back to hashed_password stored directly on User record (original/migrated users)
      const users = await base44.asServiceRole.entities.User.filter({ email: emailLower });
      const userRecord = users?.[0];
      if (!userRecord?.hashed_password) {
        return new Response(JSON.stringify({ error: 'No account found with this email. Try signing in with Google or use a magic link.' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      passwordValid = await bcrypt.compare(password, userRecord.hashed_password);
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
    const magicLink = `${origin}/#MigrationSignIn?token=${token}`;

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