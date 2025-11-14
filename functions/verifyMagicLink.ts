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
    const { token } = await req.json();
    if (!token) {
      return new Response(JSON.stringify({ error: 'Token is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const base44 = createClient({
      appId: Deno.env.get('BASE44_APP_ID'),
      serviceRoleKey: Deno.env.get('BASE44_SERVICE_ROLE_KEY'),
    });

    // Find magic link by token
    const links = await base44.entities.MagicLink.filter({ token });
    const link = Array.isArray(links) ? links[0] : (links?.[0] || null);

    if (!link) {
      return new Response(JSON.stringify({ error: 'Invalid or expired link.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate expiration and usage
    const now = new Date();
    const expiresAt = new Date(link.expires_at);
    if (link.used === true || now > expiresAt) {
      return new Response(JSON.stringify({ error: 'This link has expired or already been used.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mark as used
    await base44.entities.MagicLink.update(link.id, {
      used: true,
      used_at: new Date().toISOString(),
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || '',
      user_agent: req.headers.get('user-agent') || '',
    });

    // Success; frontend will now trigger a proper login redirect
    return new Response(JSON.stringify({ success: true, email: link.email }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('verifyMagicLink error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Unexpected error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});