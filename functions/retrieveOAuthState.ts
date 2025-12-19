import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { token } = await req.json();

    if (!token) {
      return Response.json({ error: 'Token required' }, { status: 400 });
    }

    console.log('🔍 [retrieveOAuthState] Looking up token:', token);

    // Use service role to bypass auth (user isn't logged in yet)
    const states = await base44.asServiceRole.entities.OAuthState.filter({ 
      token,
      used: false 
    });

    if (states.length === 0) {
      console.log('❌ [retrieveOAuthState] Token not found or already used');
      return Response.json({ error: 'Invalid or expired token' }, { status: 404 });
    }

    const state = states[0];
    
    // Check expiration
    if (new Date(state.expires_at) < new Date()) {
      console.log('❌ [retrieveOAuthState] Token expired');
      await base44.asServiceRole.entities.OAuthState.delete(state.id);
      return Response.json({ error: 'Token expired' }, { status: 410 });
    }

    console.log('✅ [retrieveOAuthState] Retrieved state:', state);

    // Mark as used and delete
    await base44.asServiceRole.entities.OAuthState.delete(state.id);

    return Response.json({
      success: true,
      role: state.role,
      invite_code: state.invite_code,
      email: state.email,
      referral_code: state.referral_code
    });
  } catch (error) {
    console.error('❌ [retrieveOAuthState] Error:', error);
    return Response.json({ 
      error: 'Failed to retrieve OAuth state',
      details: error.message 
    }, { status: 500 });
  }
});