import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

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
      persona,
    } = await req.json();

    // Distinguish parents vs alumni — default to parent
    const userPersona = persona === 'alumni' ? 'alumni' : 'parent';

    // Validate required fields
    if (!email || !full_name || !school) {
      return Response.json(
        { error: 'Missing required fields: email, full_name, school' },
        { status: 400, headers: corsHeaders }
      );
    }

    const lowerEmail = email.toLowerCase().trim();

    // Build the profile payload shared by create + update paths
    const profileData = {
      persona: userPersona,
      roles: [userPersona],
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
    };

    // If a user with this email already exists, just update their profile
    const existingUsers = await base44.asServiceRole.entities.User.filter({ email: lowerEmail });
    if (existingUsers && existingUsers.length > 0) {
      const updated = await base44.asServiceRole.entities.User.update(existingUsers[0].id, profileData);
      console.log('✅ Existing parent profile updated:', lowerEmail);
      return Response.json({
        success: true,
        user: {
          id: updated.id,
          email: lowerEmail,
          full_name: profileData.full_name,
          persona: userPersona,
        },
        message: 'Parent profile updated successfully',
      }, { headers: corsHeaders });
    }

    // Create the parent record (platform-native, no external auth provider)
    const newUser = await base44.asServiceRole.entities.User.create({
      email: lowerEmail,
      email_verified: false,
      profile_completion_score: 30,
      ...profileData,
    });

    console.log('✅ Parent created:', lowerEmail);

    return Response.json({
      success: true,
      user: {
        id: newUser.id,
        email: lowerEmail,
        full_name: profileData.full_name,
        persona: userPersona,
      },
      message: 'Parent user created successfully',
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Parent creation error:', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
});