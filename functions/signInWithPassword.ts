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
        const { email, password } = await req.json();
        
        if (!email || !password) {
            return new Response(JSON.stringify({ 
                error: "Email and password are required." 
            }), { 
                status: 400, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            });
        }

        // For now, just return a success response
        return new Response(JSON.stringify({ 
            success: true,
            message: "Sign in request received. We're working on authenticating you!",
            debug: {
                email: email.toLowerCase()
            }
        }), { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });

    } catch (e) {
        console.error('Sign in error:', e);
        return new Response(JSON.stringify({ 
            error: "Sign in failed. Please try again.",
            details: e.message 
        }), { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
    }
});