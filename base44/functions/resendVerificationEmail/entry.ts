import { createClient } from 'npm:@base44/sdk@0.1.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function sendVerificationEmail(req, email, link) {
  const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
  if (!SENDGRID_API_KEY) return { sent: false, reason: 'SENDGRID_API_KEY not set', link };

  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F5F5F5; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <p style="font-size: 13px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: #E85D20; margin: 0;">CLIFF · COLLEGE FAST FORWARD</p>
      </div>
      <div style="background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <div style="background: #0A0A0A; padding: 36px 36px 32px;">
          <p style="font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #E85D20; margin: 0 0 12px;">👋 VERIFY YOUR EMAIL</p>
          <h1 style="font-size: 26px; font-weight: 700; color: #fff; margin: 0 0 10px; line-height: 1.3;">One last step.</h1>
          <p style="font-size: 15px; color: rgba(255,255,255,0.55); margin: 0; line-height: 1.6;">Confirm your email to activate your account and continue.</p>
        </div>
        <div style="padding: 28px 36px 32px;">
          <p style="font-size: 15px; color: #444; line-height: 1.7; margin: 0 0 16px;">Click the button below to verify your email and continue.</p>
          <div style="text-align: center; margin: 8px 0 20px;">
            <a href="${link}" style="display:inline-block;background:#E85D20;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;">Verify Email →</a>
          </div>
          <p style="font-size: 13px; color: #888; line-height: 1.6; margin: 0;">
            If the button doesn't work, copy and paste this link:<br>
            <a href="${link}" style="color:#E85D20;word-break:break-all;">${link}</a>
          </p>
        </div>
      </div>
      <div style="text-align: center; margin-top: 24px;">
        <p style="font-size: 12px; color: #AAAAAA; margin: 0;">College Fast Forward · support@collegefastforward.com</p>
      </div>
    </div>
  `;

  try {
    const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email }] }],
        from: { email: 'hello@collegefastforward.com', name: 'College Fast Forward' },
        subject: 'Verify your email',
        content: [{ type: 'text/html', value: html }],
      }),
    });
    if (!resp.ok) {
      const txt = await resp.text();
      return { sent: false, reason: `SendGrid error ${resp.status}`, link };
    }
    return { sent: true };
  } catch (e) {
    return { sent: false, reason: 'Email service unreachable', link };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { email } = await req.json().catch(() => ({}));
    if (!email) {
      return new Response(JSON.stringify({ success: false, error: 'Email is required.' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const base44 = createClient({
      appId: Deno.env.get('BASE44_APP_ID'),
      serviceRoleKey: Deno.env.get('BASE44_SERVICE_ROLE_KEY'),
    });

    const emailLower = String(email).toLowerCase().trim();

    // Find the most recent pending attempt
    const pending = await base44.entities.RegistrationAttempt.filter(
      { email: emailLower, status: 'pending' },
      '-created_date',
      1
    );

    if (!pending || pending.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'No pending registration found for this email. Please sign up again.' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const attempt = pending[0];

    const originHeader = req.headers.get('origin');
    const forwardedHost = req.headers.get('x-forwarded-host');
    const appOrigin = originHeader || (forwardedHost ? `https://${forwardedHost}` : 'https://collegefastforward.com');
    const verificationLink = `${appOrigin}/#VerifyEmail?token=${attempt.token}`;

    const emailRes = await sendVerificationEmail(req, emailLower, verificationLink);

    return new Response(JSON.stringify({
      success: true,
      message: 'Verification email sent. Please check your inbox.',
      emailed: emailRes.sent,
      note: emailRes.sent ? undefined : emailRes.reason,
      verificationLink
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: 'Could not resend verification email. Please try again.' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});