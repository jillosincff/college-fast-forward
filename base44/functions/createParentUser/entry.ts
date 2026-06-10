import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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
    const base44 = createClientFromRequest(req);
    
    const { 
      email, 
      full_name, 
      school, 
      school_name, 
      school_code,
      company, 
      career_background,
      industry,
      industries,
      intro_willingness,
      ways_to_help,
      help_types,
      visible_in_directory,
      directory_consent_given,
      linkedin_url,
    } = await req.json();

    // Validate required fields
    if (!email || !full_name || !school) {
      return Response.json(
        { error: 'Missing required fields: email, full_name, school' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if user already exists
    const existingUsers = await base44.asServiceRole.entities.User.filter({ email: email.toLowerCase().trim() });
    if (existingUsers && existingUsers.length > 0) {
      return Response.json(
        { error: 'A user with this email already exists' },
        { status: 409, headers: corsHeaders }
      );
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-12) + 'Aa1!';

    // Create user via Supabase admin API
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return Response.json(
        { error: 'Server configuration error' },
        { status: 500, headers: corsHeaders }
      );
    }

    const { createClient } = await import('npm:@supabase/supabase-js@2.39.3');
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Create auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: full_name.trim(),
        persona: 'parent',
        onboarding_completed: true,
      }
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return Response.json(
        { error: `Failed to create user: ${authError.message}` },
        { status: 500, headers: corsHeaders }
      );
    }

    // Update user entity with parent profile data
    await base44.asServiceRole.entities.User.update(authUser.user.id, {
      persona: 'parent',
      roles: ['parent'],
      full_name: full_name.trim(),
      school: school.trim(),
      school_name: school_name || school.trim(),
      school_code: school_code || '',
      current_company: company?.trim() || '',
      company: company?.trim() || '',
      career_background: career_background?.trim() || '',
      industry: industry || '',
      industries: industries || [industry || ''],
      intro_willingness: intro_willingness || 'yes',
      ways_to_help: ways_to_help || ['networking_intros', 'career_advice'],
      help_types: help_types || ['networking_intros', 'career_advice'],
      visible_in_directory: visible_in_directory !== false,
      directory_consent_given: directory_consent_given !== false,
      linkedin_url: linkedin_url?.trim() || '',
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
      pledge_taken: true,
      pledge_taken_at: new Date().toISOString(),
    });

    console.log('✅ Parent created:', email);

    return Response.json({
      success: true,
      user: {
        id: authUser.user.id,
        email: authUser.user.email,
        full_name: full_name.trim(),
        persona: 'parent',
      },
      message: 'Parent user created successfully'
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Parent creation error:', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
});