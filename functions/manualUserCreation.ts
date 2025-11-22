import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin
    const admin = await base44.auth.me();
    if (!admin?.roles?.includes('admin')) {
      return Response.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403, headers: corsHeaders }
      );
    }

    const { email, full_name, persona, password } = await req.json();

    if (!email || !full_name || !persona) {
      return Response.json(
        { error: 'Missing required fields: email, full_name, persona' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Initialize Supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return Response.json(
        { error: 'Server configuration error' },
        { status: 500, headers: corsHeaders }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password: password || Math.random().toString(36).slice(-12) + 'Aa1!',
      email_confirm: true,
      user_metadata: {
        full_name: full_name.trim(),
        persona: persona,
        onboarding_completed: false,
        manually_created: true,
        created_by_admin: admin.email
      }
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return Response.json(
        { error: `Failed to create auth user: ${authError.message}` },
        { status: 500, headers: corsHeaders }
      );
    }

    // Update user metadata in User entity via service role
    await base44.asServiceRole.entities.User.update(authUser.user.id, {
      full_name: full_name.trim(),
      persona: persona,
      onboarding_completed: false
    });

    console.log('✅ User manually created:', email);

    return Response.json({
      success: true,
      user: {
        id: authUser.user.id,
        email: authUser.user.email,
        full_name: full_name.trim(),
        persona: persona
      },
      message: 'User created successfully',
      password_sent: !password
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Manual user creation error:', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
});