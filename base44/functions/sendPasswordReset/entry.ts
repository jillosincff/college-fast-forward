import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { email } = await req.json().catch(() => ({}));
    if (!email) {
      return Response.json({ error: 'Email is required.' }, { status: 400, headers: corsHeaders });
    }

    const emailLower = email.toLowerCase().trim();
    const base44 = createClientFromRequest(req);

    // Check user exists and has a custom password
    const users = await base44.asServiceRole.entities.User.filter({ email: emailLower });
    const user = users?.[0];

    // Always return success to prevent email enumeration
    if (!user?.hashed_password) {
      console.log('No custom password found for:', emailLower, '— returning success silently');
      return Response.json({ success: true }, { headers: corsHeaders });
    }

    // Rate limit: block if a reset was sent in the last 5 minutes
    const recentLinks = await base44.asServiceRole.entities.MagicLink.filter({ email: emailLower });
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentReset = recentLinks?.some(l => 
      l.token?.startsWith('pr_') && !l.used && new Date(l.created_date) > fiveMinsAgo
    );
    if (recentReset) {
      return Response.json({ 
        success: false, 
        error: 'A reset link was already sent recently. Please check your inbox or wait 5 minutes.' 
      }, { status: 429, headers: corsHeaders });
    }

    const token = `pr_${crypto.randomUUID()}`;
    const expires_at = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    await base44.asServiceRole.entities.MagicLink.create({ email: emailLower, token, expires_at });

    const appBaseUrl = Deno.env.get('APP_BASE_URL') || 'https://www.collegefastforward.com';
    const resetLink = `${appBaseUrl}/#ResetPassword?token=${token}`;

    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    const emailBody = `
      <div style="font-family: 'DM Sans', sans-serif; background: #0d1117; padding: 40px 20px; min-height: 100vh;">
        <div style="max-width: 520px; margin: 0 auto; background: #13191f; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden;">
          <div style="padding: 40px 40px 32px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.06);">
            <h1 style="font-family: Georgia, serif; font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 8px;">COLLEGE FAST FORWARD</h1>
            <p style="font-size: 13px; color: rgba(255,255,255,0.4); margin: 0;">Password Reset</p>
          </div>
          <div style="padding: 40px;">
            <p style="font-size: 15px; color: rgba(255,255,255,0.75); margin: 0 0 12px; line-height: 1.6;">Hi ${user.full_name?.split(' ')[0] || 'there'},</p>
            <p style="font-size: 14px; color: rgba(255,255,255,0.45); margin: 0 0 32px; line-height: 1.6;">Click the button below to reset your password. This link expires in 1 hour and can only be used once.</p>
            <div style="text-align: center; margin-bottom: 32px;">
              <a href="${resetLink}" style="display: inline-block; background: #E85D20; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px;">Reset My Password →</a>
            </div>
            <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 16px;">
              <p style="font-size: 12px; color: rgba(255,255,255,0.3); margin: 0 0 6px;">If the button doesn't work, copy this link:</p>
              <p style="font-size: 12px; color: rgba(232,93,32,0.8); margin: 0; word-break: break-all;">${resetLink}</p>
            </div>
          </div>
          <div style="padding: 24px 40px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center;">
            <p style="font-size: 12px; color: rgba(255,255,255,0.2); margin: 0;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        </div>
      </div>
    `;

    if (SENDGRID_API_KEY) {
      await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: { Authorization: `Bearer ${SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: emailLower }] }],
          from: { email: 'hello@collegefastforward.com', name: 'College Fast Forward' },
          subject: 'Reset your College Fast Forward password',
          content: [{ type: 'text/html', value: emailBody }],
        }),
      });
    }

    return Response.json({ success: true }, { headers: corsHeaders });
  } catch (e) {
    console.error('sendPasswordReset error:', e);
    return Response.json({ error: 'Unexpected error.' }, { status: 500, headers: corsHeaders });
  }
});