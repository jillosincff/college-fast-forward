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

    // Derive a lowercase company domain for fast matching (e.g. "Google" -> "google.com")
    const deriveDomain = (name) => {
      const clean = (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return clean ? `${clean}.com` : '';
    };

    // Upsert the matchable ParentNetworkProfile record the matching engine reads.
    // Without this, parents are captured in User but never surfaced to students.
    const upsertNetworkProfile = async () => {
      const sc = (school_code || '').toUpperCase();
      const companyName = (company || '').trim();
      // The matcher requires school_code + company_name to be useful — skip if missing.
      if (!sc || !companyName) return;
      const nameParts = full_name.trim().split(/\s+/);
      const firstName = nameParts[0] || full_name.trim();
      const lastName = nameParts.slice(1).join(' ') || firstName;
      const profileData = {
        first_name: firstName,
        last_name: lastName,
        company_name: companyName,
        company_domain: deriveDomain(companyName),
        role_title: (career_background || '').trim() || 'Professional',
        linkedin_url: linkedin_url?.trim() || '',
        school_code: sc,
        persona: userPersona,
        is_active: visible_in_directory !== false,
      };
      const existingProfiles = await base44.asServiceRole.entities.ParentNetworkProfile.filter({
        school_code: sc,
        first_name: firstName,
        last_name: lastName,
        company_name: companyName,
      }).catch(() => []);
      if (existingProfiles && existingProfiles.length > 0) {
        await base44.asServiceRole.entities.ParentNetworkProfile.update(existingProfiles[0].id, profileData);
      } else {
        await base44.asServiceRole.entities.ParentNetworkProfile.create(profileData);
      }
    };

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
      // Never let an unauthenticated caller overwrite an existing account's profile:
      // only the account owner (or an admin) may update it.
      const caller = await base44.auth.me().catch(() => null);
      const isOwner = caller && caller.email?.toLowerCase() === lowerEmail;
      if (!isOwner && caller?.role !== 'admin') {
        return Response.json(
          { error: 'An account with this email already exists. Please sign in to update your profile.' },
          { status: 409, headers: corsHeaders }
        );
      }
      const updated = await base44.asServiceRole.entities.User.update(existingUsers[0].id, profileData);
      await upsertNetworkProfile();
      console.log('✅ Existing parent profile updated:', lowerEmail);
      return Response.json({
        success: true,
        already_exists: true,
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

    await upsertNetworkProfile();

    // Notify admin of the new signup (non-blocking)
    try {
      await base44.functions.invoke('notifyAdminNewSignup', {
        full_name: profileData.full_name,
        email: lowerEmail,
        persona: userPersona,
        school_name: profileData.school_name,
      });
    } catch (notifyErr) {
      console.error('[createParentUser] Admin notify failed:', notifyErr.message);
    }

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