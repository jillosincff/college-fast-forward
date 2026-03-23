import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();
    if (!token) {
      return new Response(JSON.stringify({ error: 'Token is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('🔐 Verifying magic link token...');

    const base44 = createClientFromRequest(req);

    // Find magic link by token using service role (unauthenticated request)
    const links = await base44.asServiceRole.entities.MagicLink.filter({ token });
    const link = Array.isArray(links) ? links[0] : (links?.[0] || null);

    if (!link) {
      console.log('❌ Magic link not found');
      return new Response(JSON.stringify({ error: 'Invalid or expired link.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate expiration and usage
    const now = new Date();
    const expiresAt = new Date(link.expires_at);
    if (link.used === true || now > expiresAt) {
      console.log('❌ Magic link expired or used');
      return new Response(JSON.stringify({ error: 'This link has expired or already been used.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const email = link.email.toLowerCase().trim();
    console.log('✅ Magic link valid for:', email);

    // Mark as used immediately to prevent replay attacks
    await base44.asServiceRole.entities.MagicLink.update(link.id, {
      used: true,
      used_at: new Date().toISOString(),
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || '',
      user_agent: req.headers.get('user-agent') || '',
    });

    // Find existing user (don't create - OAuth will handle that)
    let user = null;
    const existingUsers = await base44.asServiceRole.entities.User.filter({ email });
    user = Array.isArray(existingUsers) ? existingUsers[0] : null;

    if (user) {
      console.log('✅ Existing user found:', user.id);
    } else {
      console.log('📝 New user - will be created during OAuth');
    }

    console.log('✅ Magic link verified for:', email, user ? `(user: ${user.id})` : '(new user)');

    return new Response(JSON.stringify({ 
      success: true, 
      email: email,
      user_id: user?.id || null,
      full_name: user?.full_name || null,
      is_new_user: !user || !user.onboarding_completed,
      persona: user?.persona || null,
      onboarding_completed: user?.onboarding_completed || false
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('❌ verifyMagicLink error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Unexpected error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});