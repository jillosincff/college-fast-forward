import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const TEST_NAMES = ['test', 'movie', 'demo', 'sample', 'fake'];

function isTestAccount(u) {
  const name = (u.full_name || u.first_name || '').toLowerCase().trim();
  const email = (u.email || '').toLowerCase();
  if (TEST_NAMES.some(t => name === t || name.startsWith(t + ' '))) return true;
  if (email.includes('test') || email.includes('demo')) return true;
  return false;
}

function getCompany(u) {
  return u.company || u.current_company || u.employer || null;
}

function getIndustry(u) {
  return u.industry || u.industry_category || null;
}

function hasMinimumData(u) {
  const name = u.full_name || u.first_name;
  const isParent = u.persona === 'parent' || (Array.isArray(u.roles) && u.roles.includes('parent'));
  const isAlumni = u.persona === 'alumni' || (Array.isArray(u.roles) && u.roles.includes('alumni'));
  // Parents show if onboarding complete OR they have company/job title data
  if (isParent) return !!(name && (u.onboarding_completed || getCompany(u) || u.job_title || u.current_position));
  // Alumni show if onboarding complete OR they have company/job title data
  if (isAlumni) return !!(name && (u.onboarding_completed || getCompany(u) || u.job_title || u.current_position));
  return !!(name && (getCompany(u) || getIndustry(u) || u.onboarding_completed));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let user;
    try {
      user = await base44.auth.me();
    } catch (authErr) {
      return Response.json({ error: 'Authentication required', success: false }, { status: 401 });
    }
    if (!user) {
      return Response.json({ error: 'Authentication required', success: false }, { status: 401 });
    }

    const isAdmin = user.roles?.includes('admin') || user.role === 'admin';
    const isParentUser = user.persona === 'parent' || (Array.isArray(user.roles) && user.roles.includes('parent'));

    // School isolation — derive from session, never trust client
    const schoolCode = user.school_code || user.school_name || user.school || user.university || '';
    if (!isAdmin && !schoolCode) {
      return Response.json({
        success: false,
        error: 'incomplete_profile',
        message: isParentUser
          ? "Please add your student's school to your profile to see your network."
          : 'Please complete your profile to see your network.',
        cta: isParentUser ? 'ParentProfileEdit' : 'CompleteProfile',
        data: [],
      });
    }

    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);
    
    // DEBUG: Log current user's school and first 10 returned users' schools
    console.log('=== DIRECTORY DEBUG ===');
    console.log('Current user school_code:', schoolCode);
    console.log('First 10 users school values:');
    (allUsers || []).slice(0, 10).forEach((u, i) => {
      console.log(`  ${i}: id=${u.id}, school_code=${u.school_code}, school_name=${u.school_name}, school=${u.school}, university=${u.university}`);
    });
    
    // Check total UF users in database
    const ufUsers = await base44.asServiceRole.entities.User.filter({ school_code: 'ufl' });
    console.log('Total UF users (school_code=ufl):', ufUsers.length);
    console.log('Visible in directory:', ufUsers.filter(u => u.visible_in_directory !== false).length);
    console.log('=======================');

    const directoryUsers = [];
    
    // DEBUG: Track filtering
    let filtered = { rejected: 0, noPersona: 0, wrongSchool: 0, hidden: 0, noName: 0, testAccount: 0, noMinData: 0 };

    for (const u of (allUsers || [])) {
      const isParent = u.persona === 'parent' || (Array.isArray(u.roles) && u.roles.includes('parent'));
      const isAlumni = u.persona === 'alumni' || (Array.isArray(u.roles) && u.roles.includes('alumni'));
      const isStudent = u.persona === 'gator' || u.persona === 'student' || (Array.isArray(u.roles) && (u.roles.includes('gator') || u.roles.includes('student')));
      if (!isParent && !isAlumni && !isStudent) { filtered.noPersona++; continue; }

      // School isolation: only show users from the same school (admins see all)
      if (!isAdmin) {
        const userSchoolCode = u.school_code || '';
        const userSchoolName = u.school_name || u.school || u.university || '';
        const viewerSchoolCode = schoolCode || '';
        const viewerSchoolName = user.school_name || user.school || user.university || '';

        // Match by school_code, OR fall back to school_name if code is missing
        const codeMatch = userSchoolCode.toLowerCase() === viewerSchoolCode.toLowerCase();
        const nameMatch = userSchoolName.toLowerCase() === viewerSchoolName.toLowerCase() && userSchoolName;

        if (!codeMatch && !nameMatch) { filtered.wrongSchool++; continue; }
      }

      // Respect visibility setting — hidden profiles are excluded (except the viewer's own)
      if (u.visible_in_directory === false && u.id !== user.id) { filtered.hidden++; continue; }

      const hasName = !!(u.full_name || u.first_name);
      if (!hasName) { filtered.noName++; continue; }

      if (isTestAccount(u)) { filtered.testAccount++; continue; }

      if (!hasMinimumData(u)) { filtered.noMinData++; continue; }

      const company = getCompany(u);
      const industry = getIndustry(u);
      const jobTitle = u.job_title || u.current_position || u.position || u.title || u.role_title || u.current_role || null;

      let availability = 'unknown';
      const rawAvail = u.intro_willingness || u.intro_availability || u.open_to_intros || u.availability;
      if (rawAvail === 'yes' || rawAvail === 'happy_to_help' || rawAvail === 'open' || rawAvail === true || rawAvail === 'true') {
        availability = 'yes';
      } else if (rawAvail === 'occasionally' || rawAvail === 'sometimes' || rawAvail === 'maybe') {
        availability = 'occasionally';
      } else if (rawAvail === 'no' || rawAvail === 'not_now' || rawAvail === false) {
        availability = 'not_now';
      }

      const waysToHelp = u.ways_to_help || u.expertise_areas || u.help_categories || [];

      let fullName = u.full_name;
      if (!fullName || fullName.includes('@')) {
        const parts = [u.first_name, u.last_name].filter(Boolean);
        if (parts.length > 0) {
          fullName = parts.join(' ');
        } else {
          // Fall back to a readable version of the email prefix
          const prefix = (u.email || '').split('@')[0];
          // Convert "aargyrakis" -> "Aargyrakis", "john.doe" -> "John Doe"
          fullName = prefix
            .replace(/[._-]+/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase())
            .trim() || 'CFF Member';
        }
      }

      const persona = isParent ? 'parent' : isAlumni ? 'alumni' : 'student';

      directoryUsers.push({
        id: u.id,
        email: u.email,
        full_name: fullName,
        first_name: u.first_name || fullName.split(' ')[0] || '',
        last_name: u.last_name || '',
        persona,
        roles: u.roles || [],
        company,
        industry,
        job_title: jobTitle,
        major: u.major || '',
        graduation_year: u.graduation_year || '',
        school: u.school || u.university || '',
        linkedin_url: u.linkedin_url || '',
        career_background: u.career_background || '',
        bio: u.bio || '',
        ways_to_help: waysToHelp,
        expertise_areas: u.expertise_areas || [],
        mentorship_topics: u.mentorship_topics || [],
        can_provide_referrals: u.can_provide_referrals || false,
        intro_willingness: availability,
        is_founding_member: u.is_founding_member || false,
        onboarding_completed: u.onboarding_completed || false,
        profile_image_url: u.profile_image_url || '',
        visible_in_directory: u.visible_in_directory !== false,
        subscription_status: u.subscription_status || '',
        updated_date: u.updated_date,
      });
    }

    console.log(`Directory: returning ${directoryUsers.length} members for school: ${schoolCode || 'ALL (admin)'}`);
    console.log('Filter breakdown:', filtered);

    return Response.json({
      success: true,
      data: directoryUsers,
      count: directoryUsers.length,
      school: schoolCode || null,
    });

  } catch (error) {
    console.error('getDirectoryUsers error:', error);
    return Response.json({ error: 'Failed to load directory', details: error.message }, { status: 500 });
  }
});