import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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

    // Fetch ALL users with completed onboarding using pagination
    // Each page fetches up to 200 users (API limit)
    let allUsers = [];
    let page = 0;
    const PAGE_SIZE = 200;
    const MAX_PAGES = 10; // Safety limit: 2000 users max
    
    while (page < MAX_PAGES) {
      const batch = await base44.asServiceRole.entities.User.filter(
        { onboarding_completed: true },
        '-created_date',
        PAGE_SIZE,
        { skip: page * PAGE_SIZE }
      );
      
      if (!batch || batch.length === 0) break;
      allUsers = allUsers.concat(batch);
      
      // If we got fewer than PAGE_SIZE, we've reached the end
      if (batch.length < PAGE_SIZE) break;
      page++;
    }

    console.log(`📊 Total users with onboarding_completed=true: ${allUsers.length} (fetched ${page + 1} pages)`);

    // Filter and format users for directory
    const directoryUsers = [];
    let filteredCount = 0;
    
    for (const u of allUsers) {
      // Must have some form of name
      const hasValidName = (u.first_name && u.last_name) || 
                          (u.full_name && u.full_name.trim() !== '' && !u.full_name.includes('@'));
      
      if (!hasValidName) {
        filteredCount++;
        continue;
      }
      
      // Must have persona/role OR substantive profile content
      const hasPersonaOrRole = (u.persona && ['student', 'alumni', 'parent', 'gator'].includes(u.persona)) ||
                               (u.roles && Array.isArray(u.roles) && u.roles.some(r => ['student', 'alumni', 'parent', 'gator'].includes(r)));
      
      const hasProfileContent = u.major || u.current_company || u.current_position || u.industry || u.bio || 
                                (u.graduation_year && u.graduation_year > 1900);
      
      if (!hasPersonaOrRole && !hasProfileContent) {
        filteredCount++;
        continue;
      }

      // Build name
      let fullName = u.full_name;
      let firstName = u.first_name;
      let lastName = u.last_name;
      
      if (fullName && !fullName.includes('@') && (!firstName || !lastName)) {
        const parts = fullName.trim().split(' ').filter(Boolean);
        firstName = firstName || parts[0];
        lastName = lastName || (parts.length >= 2 ? parts.slice(1).join(' ') : '');
      }
      
      if (!fullName || fullName.includes('@')) {
        fullName = (firstName && lastName) ? `${firstName} ${lastName}`.trim() 
                 : firstName || lastName || u.email.split('@')[0];
      }

      // Determine display persona
      let displayPersona = u.persona;
      if (displayPersona === 'gator') displayPersona = 'student';
      if (!displayPersona) {
        if (u.roles?.length > 0) {
          displayPersona = u.roles[0] === 'gator' ? 'student' : u.roles[0];
        } else if (u.major || (u.graduation_year && u.graduation_year > new Date().getFullYear() - 2)) {
          displayPersona = 'student';
        } else {
          displayPersona = 'alumni';
        }
      }

      directoryUsers.push({
        id: u.id,
        email: u.email,
        first_name: firstName || '',
        last_name: lastName || '',
        full_name: fullName,
        persona: displayPersona,
        roles: u.roles || [],
        graduation_year: u.graduation_year || '',
        major: u.major || '',
        current_company: u.current_company || '',
        current_position: u.current_position || '',
        company: u.current_company || u.company || '',
        job_title: u.current_position || u.job_title || '',
        industry: u.industry || '',
        linkedin_url: u.linkedin_url || '',
        bio: u.bio || '',
        ways_to_help: u.ways_to_help || [],
        expertise_areas: u.expertise_areas || [],
        mentorship_topics: u.mentorship_topics || [],
        can_provide_referrals: u.can_provide_referrals || false,
        is_founding_member: u.is_founding_member || false,
        profile_image_url: u.profile_image_url || ''
      });
    }

    console.log(`✅ Directory: Returning ${directoryUsers.length} users for ${user.email} (filtered out: ${filteredCount})`);

    return Response.json({
      success: true,
      data: directoryUsers,
      count: directoryUsers.length
    });

  } catch (error) {
    console.error('❌ getDirectoryUsers error:', error);
    return Response.json({
      error: 'Failed to load directory',
      details: error.message
    }, { status: 500 });
  }
});