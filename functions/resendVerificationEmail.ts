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
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto;">
      <h2 style="color:#0021A5;margin:0 0 10px;">Verify your email</h2>
      <p>Click the button below to verify your email and continue.</p>
      <p style="text-align:center;margin:20px 0;">
        <a href="${link}" style="display:inline-block;background:#FA4616;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700">Verify Email</a>
      </p>
      <p>If the button doesn't work, copy and paste this link:</p>
      <p style="word-break:break-all;color:#374151;"><a href="${link}">${link}</a></p>
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