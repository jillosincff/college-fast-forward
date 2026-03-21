import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const TEST_NAMES = ['test', 'movie', 'demo', 'sample', 'fake'];
const TEST_EMAIL_PATTERNS = ['test', 'demo'];

function isTestAccount(u) {
  const name = (u.full_name || u.first_name || '').toLowerCase().trim();
  const email = (u.email || '').toLowerCase();
  if (TEST_NAMES.some(t => name === t || name.startsWith(t + ' '))) return true;
  if (TEST_EMAIL_PATTERNS.some(p => email.includes(p))) return true;
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
  return !!(name && (getCompany(u) || getIndustry(u) || u.onboarding_completed));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all users - we'll filter server-side for max compatibility with old data
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);

    const directoryUsers = [];

    for (const u of (allUsers || [])) {
      // Must be a parent
      const isParent = u.persona === 'parent' || u.roles?.includes('parent');
      if (!isParent) continue;

      // Must have a real name
      const hasName = !!(u.full_name || u.first_name);
      if (!hasName) continue;

      // Exclude test accounts
      if (isTestAccount(u)) continue;

      // Must have at least company OR industry OR completed onboarding
      if (!hasMinimumData(u)) continue;

      const company = getCompany(u);
      const industry = getIndustry(u);
      const jobTitle = u.job_title || u.current_position || null;

      // Availability — map all known field names/values
      let availability = 'unknown';
      const rawAvail = u.intro_willingness || u.intro_availability || u.open_to_intros || u.availability;
      if (['yes', 'happy_to_help', 'open', true, 'true', '1'].includes(rawAvail)) availability = 'yes';
      else if (['occasionally', 'sometimes', 'maybe'].includes(rawAvail)) availability = 'occasionally';
      else if (['no', 'not_now', 'not_right_now', false, 'false', '0'].includes(rawAvail)) availability = 'not_now';

      // Ways to help — check all known field names
      const waysToHelp = u.ways_to_help || u.expertise_areas || u.help_categories || [];

      let fullName = u.full_name;
      if (!fullName || fullName.includes('@')) {
        const parts = [u.first_name, u.last_name].filter(Boolean);
        fullName = parts.length > 0 ? parts.join(' ') : (u.email || '').split('@')[0];
      }

      directoryUsers.push({
        id: u.id,
        email: u.email,
        full_name: fullName,
        first_name: u.first_name || fullName.split(' ')[0] || '',
        last_name: u.last_name || '',
        persona: 'parent',
        company,
        industry,
        job_title: jobTitle,
        linkedin_url: u.linkedin_url || '',
        ways_to_help: waysToHelp,
        intro_willingness: availability,
        is_founding_member: u.is_founding_member || false,
        onboarding_completed: u.onboarding_completed || false,
        profile_image_url: u.profile_image_url || '',
        updated_date: u.updated_date,
      });
    }

    console.log(`Directory: returning ${directoryUsers.length} parents`);

    return Response.json({
      success: true,
      data: directoryUsers,
      count: directoryUsers.length,
    });

  } catch (error) {
    console.error('getDirectoryUsers error:', error);
    return Response.json({ error: 'Failed to load directory', details: error.message }, { status: 500 });
  }
});
    }

    // Fetch users in batches of 500 to get all onboarded users
    let allUsers = [];
    const PAGE_SIZE = 500;
    
    // Batch 1: newest 500
    const batch1 = await base44.asServiceRole.entities.User.filter(
      { onboarding_completed: true },
      '-created_date',
      PAGE_SIZE
    );
    allUsers = batch1 || [];
    console.log(`Batch 1: ${allUsers.length} users`);
    
    // If we got exactly 500, there may be more - fetch batch 2
    if (allUsers.length >= PAGE_SIZE) {
      const oldestDateInBatch1 = allUsers[allUsers.length - 1]?.created_date;
      if (oldestDateInBatch1) {
        const batch2 = await base44.asServiceRole.entities.User.filter(
          { onboarding_completed: true, created_date: { $lt: oldestDateInBatch1 } },
          '-created_date',
          PAGE_SIZE
        );
        if (batch2 && batch2.length > 0) {
          const existingIds = new Set(allUsers.map(u => u.id));
          const newUsers = batch2.filter(u => !existingIds.has(u.id));
          allUsers = allUsers.concat(newUsers);
          console.log(`Batch 2: ${batch2.length} users (${newUsers.length} new)`);
        }
      }
    }

    console.log(`Total users with onboarding_completed=true: ${allUsers.length}`);

    // Filter and format users for directory
    const directoryUsers = [];
    let filteredCount = 0;
    
    for (const u of allUsers) {
      const hasValidName = (u.first_name && u.last_name) || 
                          (u.full_name && u.full_name.trim() !== '' && !u.full_name.includes('@'));
      
      if (!hasValidName) {
        filteredCount++;
        continue;
      }
      
      const hasPersonaOrRole = (u.persona && ['student', 'alumni', 'parent', 'gator'].includes(u.persona)) ||
                               (u.roles && Array.isArray(u.roles) && u.roles.some(r => ['student', 'alumni', 'parent', 'gator'].includes(r)));
      
      const hasProfileContent = u.major || u.current_company || u.current_position || u.industry || u.bio || 
                                (u.graduation_year && u.graduation_year > 1900);
      
      if (!hasPersonaOrRole && !hasProfileContent) {
        filteredCount++;
        continue;
      }

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

    console.log(`Directory: Returning ${directoryUsers.length} users (filtered out: ${filteredCount})`);

    return Response.json({
      success: true,
      data: directoryUsers,
      count: directoryUsers.length
    });

  } catch (error) {
    console.error('getDirectoryUsers error:', error);
    return Response.json({
      error: 'Failed to load directory',
      details: error.message
    }, { status: 500 });
  }
});