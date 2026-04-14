import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

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
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { email } = await req.json().catch(() => ({}));
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const emailLower = String(email).toLowerCase().trim();

    const base44 = createClientFromRequest(req);

    // Create a one-time magic link token
    // Rate limit: block if a link was already sent in the last 2 minutes
    const recentLinks = await base44.asServiceRole.entities.MagicLink.filter({ email: emailLower });
    const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000);
    const recentlySent = recentLinks?.some(l => !l.used && new Date(l.created_date) > twoMinsAgo);
    if (recentlySent) {
      return new Response(JSON.stringify({ success: false, error: 'A magic link was already sent recently. Please check your inbox or wait 2 minutes before trying again.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = `ml_${crypto.randomUUID()}`;
    const expires_at = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 60 minutes

    await base44.asServiceRole.entities.MagicLink.create({
      email: emailLower,
      token,
      expires_at,
    });

    const appBaseUrl = Deno.env.get('APP_BASE_URL') || 'https://www.collegefastforward.com';
    const magicLink = `${appBaseUrl}/#MigrationSignIn?token=${token}`;

    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');

    const emailBody = `
      <div style="font-family: 'DM Sans', sans-serif; background: #0d1117; padding: 40px 20px; min-height: 100vh;">
        <div style="max-width: 520px; margin: 0 auto; background: #13191f; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden;">
          <div style="padding: 40px 40px 32px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.06);">
            <h1 style="font-family: Georgia, serif; font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 8px; letter-spacing: -0.02em;">COLLEGE FAST FORWARD</h1>
            <p style="font-size: 13px; color: rgba(255,255,255,0.4); margin: 0;">Your network. Your career.</p>
          </div>
          <div style="padding: 40px;">
            <p style="font-size: 15px; color: rgba(255,255,255,0.75); margin: 0 0 12px; line-height: 1.6;">Here's your secure sign-in link.</p>
            <p style="font-size: 14px; color: rgba(255,255,255,0.45); margin: 0 0 32px; line-height: 1.6;">Click the button below to access your account. This link expires in 15 minutes and can only be used once.</p>
            <div style="text-align: center; margin-bottom: 32px;">
              <a href="${magicLink}" style="display: inline-block; background: #E85D20; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px;">Sign In to My Account →</a>
            </div>
            <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 16px;">
              <p style="font-size: 12px; color: rgba(255,255,255,0.3); margin: 0 0 6px;">If the button doesn't work, copy this link:</p>
              <p style="font-size: 12px; color: rgba(232,93,32,0.8); margin: 0; word-break: break-all;">${magicLink}</p>
            </div>
          </div>
          <div style="padding: 24px 40px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center;">
            <p style="font-size: 12px; color: rgba(255,255,255,0.2); margin: 0;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        </div>
      </div>
    `;

    if (SENDGRID_API_KEY) {
      const sendgridPayload = {
        personalizations: [{ to: [{ email: emailLower }] }],
        from: { email: 'hello@collegefastforward.com', name: 'College Fast Forward' },
        subject: 'Your College Fast Forward Sign-In Link',
        content: [{ type: 'text/html', value: emailBody }],
      };

      const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sendgridPayload),
      });

      if (!sgRes.ok) {
        const txt = await sgRes.text();
        console.error('SendGrid failed:', sgRes.status, txt);
        return new Response(JSON.stringify({ success: false, error: 'Failed to send email. Please try again.' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true, emailed: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      console.error('SendGrid API key not configured');
      return new Response(JSON.stringify({ success: false, error: 'Email service not configured.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || 'Unexpected error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});