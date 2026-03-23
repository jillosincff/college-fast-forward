import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { email } = await req.json();
        if (!email) {
            return new Response(JSON.stringify({ error: "Email is required." }), { 
                status: 400, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            });
        }

        const emailLower = email.toLowerCase().trim();
        const base44 = createClientFromRequest(req);
        
        // Generate token and store in MagicLink entity
        const token = `ml_${crypto.randomUUID()}`;
        const expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString();

        console.log(`🔐 Creating magic link for: ${emailLower}`);
        
        await base44.asServiceRole.entities.MagicLink.create({
            email: emailLower,
            token,
            expires_at,
            used: false
        });

        const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
        if (!SENDGRID_API_KEY) {
            throw new Error("Email service not configured.");
        }
        
        const originHeader = req.headers.get('origin');
        const forwardedHost = req.headers.get('x-forwarded-host');
        const appOrigin = originHeader || (forwardedHost ? `https://${forwardedHost}` : 'https://collegefastforward.com');
        
        // Link directly to GatorAuth with token - skips MagicLogin page entirely
        const magicLink = `${appOrigin}/#GatorAuth?magic_token=${token}&role=parent`;
        
        const emailBody = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; color: #333; max-width: 600px; margin: auto;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #0021A5; margin: 0;">🐊 College Fast Forward</h1>
                </div>
                <div style="background: #f8f9fa; border-radius: 12px; padding: 30px; border: 1px solid #e9ecef;">
                    <h2 style="color: #333; margin-top: 0;">Sign in to your account</h2>
                    <p style="color: #666; line-height: 1.6;">Click the button below to securely sign in. This link expires in 15 minutes.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #FA4616 0%, #e03d12 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            Sign In Securely
                        </a>
                    </div>
                    <p style="color: #999; font-size: 13px; margin-bottom: 0;">If you didn't request this email, you can safely ignore it.</p>
                </div>
                <p style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
                    Go Gators! 🐊
                </p>
            </div>
        `;
        
        const sendgridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${SENDGRID_API_KEY}`, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                personalizations: [{ to: [{ email: emailLower }] }],
                from: { email: 'hello@collegefastforward.com', name: 'College Fast Forward' },
                subject: '🐊 Your Sign-In Link for College Fast Forward',
                content: [{ type: 'text/html', value: emailBody }],
            }),
        });
        
        if (!sendgridResponse.ok) {
            const errorText = await sendgridResponse.text();
            console.error('❌ SendGrid error:', sendgridResponse.status, errorText);
            throw new Error(`Email delivery failed (${sendgridResponse.status})`);
        }

        console.log('✅ Magic link email sent successfully');
        
        return new Response(JSON.stringify({ success: true }), { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
    } catch (e) {
        console.error('❌ Magic link error:', e.message);
        return new Response(JSON.stringify({ error: e.message || 'Failed to send magic link' }), { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
    }
});