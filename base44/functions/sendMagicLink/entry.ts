import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

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
    const token = `ml_${crypto.randomUUID()}`;
    const expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    await base44.asServiceRole.entities.MagicLink.create({
      email: emailLower,
      token,
      expires_at,
    });

    const magicLink = `https://www.collegefastforward.com/#PreAuth?token=${token}`;

    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');

    const emailBody = `
      <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px;">
        <h1 style="color: #0021A5; text-align: center;">Your College Fast Forward Login Link</h1>
        <p>Hi,</p>
        <p>Click the button below to sign in to your account. This link is valid for 15 minutes and can only be used once.</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${magicLink}" style="display: inline-block; background-color: #FA4616; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Sign In Securely</a>
        </div>
        <p>If the button doesn't work, copy and paste this link:</p>
        <p style="word-break: break-all;"><a href="${magicLink}">${magicLink}</a></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #777;">Go Gators! 🐊</p>
      </div>
    `;

    if (SENDGRID_API_KEY) {
      const sendgridPayload = {
        personalizations: [{ to: [{ email: emailLower }] }],
        from: { email: 'hello@collegefastforward.com', name: 'College Fast Forward' },
        subject: '🐊 Your Secure Sign-In Link',
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
        // Return success with link so user can still sign in manually if email fails
        return new Response(JSON.stringify({ success: true, emailed: false, link: magicLink, note: `Email send failed (${sgRes.status})` }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true, emailed: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // If email provider is not configured, don't fail; return the link
      return new Response(JSON.stringify({ success: true, emailed: false, link: magicLink, note: 'Email provider not configured' }), {
        status: 200,
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