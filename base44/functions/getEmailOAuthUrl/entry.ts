import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate OAuth consent URL for Gmail
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify'
    ];

    const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
    
    if (!clientId || !clientSecret) {
      return Response.json({ 
        error: 'Email sync not configured. Please contact support.' 
      }, { status: 503 });
    }

    const redirectUri = `${Deno.env.get('APP_BASE_URL') || window.location.origin}/api/auth/callback/email`;
    const state = btoa(JSON.stringify({ user_id: user.id, email: user.email }));

    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scopes.join(' '))}` +
      `&state=${state}` +
      `&access_type=offline` +
      `&prompt=consent`;

    return Response.json({ url: oauthUrl });

  } catch (error) {
    console.error('getEmailOAuthUrl error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});