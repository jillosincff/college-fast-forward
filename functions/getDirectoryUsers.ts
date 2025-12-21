import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ 
        error: 'Unauthorized',
        details: 'You must be logged in to view the directory'
      }, { status: 401 });
    }

    // FIXED: Use service role to bypass RLS restrictions
    // Get ALL users with completed onboarding (not just visible_in_directory=true)
    // Most users haven't explicitly set visible_in_directory, so we include those with onboarding_completed
    const users = await base44.asServiceRole.entities.User.filter({
      onboarding_completed: true
    });

    console.log(`📊 Total users with onboarding_completed=true: ${users.length}`);

    // Filter and format users for directory with lenient criteria
    const directoryUsers = users
      .filter(u => {
        // Must have some form of name (not just email)
        const hasFirstAndLast = u.first_name && u.last_name;
        const hasFullName = u.full_name && u.full_name.trim() !== '' && !u.full_name.includes('@');
        const hasValidName = hasFirstAndLast || hasFullName;
        
        if (!hasValidName) {
          console.log(`❌ Filtered out ${u.email}: No valid name`);
          return false;
        }
        
        // Must have EITHER persona/roles OR substantive profile content
        // Include 'gator' as valid persona
        const hasPersona = u.persona && ['student', 'alumni', 'parent', 'gator'].includes(u.persona);
        const hasValidRole = u.roles && Array.isArray(u.roles) && u.roles.some(role => ['student', 'alumni', 'parent', 'gator'].includes(role));
        const hasPersonaOrRole = hasPersona || hasValidRole;
        
        // Check if user has substantive profile content
        const hasProfileContent = (
          (u.major && u.major.trim() !== '') ||
          (u.current_company && u.current_company.trim() !== '') ||
          (u.current_position && u.current_position.trim() !== '') ||
          (u.industry && u.industry.trim() !== '') ||
          (u.bio && u.bio.trim() !== '') ||
          (u.graduation_year && u.graduation_year > 1900)
        );
        
        // Include if they have persona/role OR they have real profile content
        if (!hasPersonaOrRole && !hasProfileContent) {
          console.log(`❌ Filtered out ${u.email}: No valid persona/role (persona: ${u.persona}, roles: ${JSON.stringify(u.roles)}) AND no substantive profile content`);
          return false;
        }
        
        return true;
      })
      .map(u => {
        // Construct full_name and extract first/last name if not present
        let fullName = u.full_name;
        let firstName = u.first_name;
        let lastName = u.last_name;
        
        // If we have full_name but no first/last, extract them
        if (fullName && !fullName.includes('@') && (!firstName || !lastName)) {
          const nameParts = fullName.trim().split(' ').filter(Boolean);
          if (nameParts.length >= 2) {
            firstName = firstName || nameParts[0];
            lastName = lastName || nameParts.slice(1).join(' ');
          } else if (nameParts.length === 1) {
            firstName = firstName || nameParts[0];
          }
        }
        
        // Construct full_name if not present
        if (!fullName || fullName.includes('@')) {
          if (firstName && lastName) {
            fullName = `${firstName} ${lastName}`.trim();
          } else if (firstName) {
            fullName = firstName;
          } else if (lastName) {
            fullName = lastName;
          } else {
            fullName = u.email.split('@')[0];
          }
        }

        // Use persona if available, otherwise infer from profile or use first role
        let displayPersona = u.persona;
        if (!displayPersona) {
          if (u.roles && u.roles.length > 0) {
            displayPersona = u.roles[0];
          } else if (u.major || (u.graduation_year && u.graduation_year > new Date().getFullYear() - 2)) {
            // Has major or recent grad year - probably student
            displayPersona = 'student';
          } else if (u.current_company || u.current_position) {
            // Has company/position - probably alumni
            displayPersona = 'alumni';
          } else {
            // Default to alumni if we can't determine
            displayPersona = 'alumni';
          }
        }

        return {
          id: u.id,
          email: u.email,
          first_name: firstName || '',
          last_name: lastName || '',
          full_name: fullName,
          persona: displayPersona,
          graduation_year: u.graduation_year,
          major: u.major,
          current_company: u.current_company,
          current_position: u.current_position,
          location: u.location,
          industry: u.industry,
          linkedin_url: u.linkedin_url,
          bio: u.bio,
          headline: u.headline,
          ways_to_help: u.ways_to_help || [],
          profile_image_url: u.profile_image_url
        };
      });

    console.log(`✅ Directory: Returning ${directoryUsers.length} users for ${user.email}`);
    console.log(`📋 Filtered out: ${users.length - directoryUsers.length} users`);

    return Response.json({
      success: true,
      data: directoryUsers,
      count: directoryUsers.length,
      debug: {
        total_opted_in: users.length,
        filtered_out: users.length - directoryUsers.length,
        returned: directoryUsers.length
      }
    });

  } catch (error) {
    console.error('❌ getDirectoryUsers error:', error);
    return Response.json({
      error: 'Failed to load directory',
      details: error.message
    }, { status: 500 });
  }
});