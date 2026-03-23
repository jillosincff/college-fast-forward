import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const base44 = createClient({
    appId: Deno.env.get('BASE44_APP_ID'),
});

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { new_email } = await req.json();

        const authHeader = req.headers.get('Authorization');
        if (!authHeader) throw new Error('Unauthorized');
        
        const token = authHeader.split(' ')[1];
        base44.auth.setToken(token);

        const { data: { user }, error: userError } = await base44.auth.getUser();
        if (userError || !user) throw new Error('User not found');
        
        return new Response(JSON.stringify({ success: true, message: 'Email change request received.' }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});