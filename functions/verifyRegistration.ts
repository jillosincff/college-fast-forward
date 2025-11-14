import { createClient } from 'npm:@base44/sdk@0.1.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { token } = await req.json().catch(() => ({}));
    if (!token) {
      return new Response(JSON.stringify({ success: false, error: 'Missing verification token.' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const base44 = createClient({
      appId: Deno.env.get('BASE44_APP_ID'),
      serviceRoleKey: Deno.env.get('BASE44_SERVICE_ROLE_KEY'),
    });

    const attempts = await base44.entities.RegistrationAttempt.filter({ token });
    if (!attempts || attempts.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid or expired verification link. Please register again.' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const attempt = attempts[0];

    if (attempt.status === 'processed') {
      return new Response(JSON.stringify({ success: true, message: 'Already verified. You can sign in now.', email: attempt.email }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    await base44.entities.RegistrationAttempt.update(attempt.id, { status: 'processed' });

    // We do NOT create/update the User here to avoid "Entity User not found".
    // Frontend will now send a Magic Link to the verified email for sign-in.
    return new Response(JSON.stringify({ success: true, message: 'Email verified!', email: attempt.email }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('verifyRegistration error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Verification failed. Please try again.' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});