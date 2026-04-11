import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import bcrypt from 'npm:bcryptjs@2.4.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { token, new_password } = await req.json().catch(() => ({}));

    if (!token || !new_password) {
      return Response.json({ error: 'Token and new password are required.' }, { status: 400, headers: corsHeaders });
    }

    if (!token.startsWith('pr_')) {
      return Response.json({ error: 'Invalid reset token.' }, { status: 400, headers: corsHeaders });
    }

    if (new_password.length < 8) {
      return Response.json({ error: 'Password must be at least 8 characters.' }, { status: 400, headers: corsHeaders });
    }

    const base44 = createClientFromRequest(req);

    // Find and validate the token
    const links = await base44.asServiceRole.entities.MagicLink.filter({ token });
    const link = links?.[0];

    if (!link) {
      return Response.json({ error: 'Invalid or expired reset link.' }, { status: 400, headers: corsHeaders });
    }

    if (link.used || new Date() > new Date(link.expires_at)) {
      return Response.json({ error: 'This reset link has already been used or has expired.' }, { status: 400, headers: corsHeaders });
    }

    // Mark token as used immediately
    await base44.asServiceRole.entities.MagicLink.update(link.id, {
      used: true,
      used_at: new Date().toISOString(),
    });

    // Find the user
    const users = await base44.asServiceRole.entities.User.filter({ email: link.email });
    const user = users?.[0];

    if (!user) {
      return Response.json({ error: 'No account found for this email.' }, { status: 404, headers: corsHeaders });
    }

    // Hash the new password and update
    const hashed_password = await bcrypt.hash(new_password, 12);
    await base44.asServiceRole.entities.User.update(user.id, { hashed_password });

    console.log('✅ Password reset successful for:', link.email);
    return Response.json({ success: true }, { headers: corsHeaders });

  } catch (e) {
    console.error('resetPasswordWithToken error:', e);
    return Response.json({ error: 'Unexpected error.' }, { status: 500, headers: corsHeaders });
  }
});