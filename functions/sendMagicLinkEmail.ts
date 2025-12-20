import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

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
        
        // Initialize Base44 SDK
        const base44 = createClientFromRequest(req);
        
        // Get the redirect URL from request origin
        const originHeader = req.headers.get('origin');
        const forwardedHost = req.headers.get('x-forwarded-host');
        const appOrigin = originHeader || (forwardedHost ? `https://${forwardedHost}` : 'https://collegefastforward.com');
        const redirectUrl = `${appOrigin}/#GatorAuth`;
        
        console.log(`🔐 Sending magic link to: ${emailLower}, redirect: ${redirectUrl}`);
        
        // Use Base44's built-in signInWithOtp which sends the email and handles auth
        const result = await base44.asServiceRole.auth.signInWithOtp({
            email: emailLower,
            options: {
                emailRedirectTo: redirectUrl,
                shouldCreateUser: true // Allow new users to sign up via magic link
            }
        });
        
        console.log('✅ signInWithOtp result:', JSON.stringify(result));

        return new Response(JSON.stringify({ success: true }), { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
    } catch (e) {
        console.error('❌ Magic link error:', e);
        return new Response(JSON.stringify({ error: e.message || 'Failed to send magic link' }), { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
    }
});