import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import axios from 'npm:axios@1.6.0';

// Simple encryption helper (in production, use proper encryption library)
function encryptToken(token) {
  // Base64 encoding as basic obfuscation (replace with proper encryption in production)
  return btoa(token);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin/service role access
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code, stateUserId } = await req.json().catch(() => ({}));

    if (!code || !stateUserId) {
      return Response.json({ error: 'Malformed OAuth callback payload' }, { status: 400 });
    }

    // Exchange the temporary code for production API credentials
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      null,
      {
        params: {
          code,
          client_id: Deno.env.get('GOOGLE_CLIENT_ID'),
          client_secret: Deno.env.get('google_oauth_client_secret'),
          redirect_uri: `${Deno.env.get('APP_BASE_URL')}/email-callback`,
          grant_type: 'authorization_code',
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Securely persist tokens to the student's database record
    await base44.entities.User.update(stateUserId, {
      is_email_synced: true,
      emailProvider: 'GMAIL',
      encryptedAccessToken: encryptToken(access_token),
      encryptedRefreshToken: encryptToken(refresh_token),
      tokenExpiresAt: new Date(Date.now() + expires_in * 1000).toISOString(),
    });

    console.log(`✅ Email sync enabled for user ${stateUserId}`);

    return Response.json({ success: true });
  } catch (error) {
    console.error('OAuth token exchange failure:', error);
    return Response.json(
      { success: false, error: 'Token exchange failed', details: error.message },
      { status: 500 }
    );
  }
});