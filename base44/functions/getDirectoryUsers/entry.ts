import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

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
  return !!(name && (getCompany(u) || getIndustry(u) || u.onboarding_completed));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);

    const directoryUsers = [];

    for (const u of (allUsers || [])) {
      const isParent = u.persona === 'parent' || (Array.isArray(u.roles) && u.roles.includes('parent'));
      if (!isParent) continue;

      const hasName = !!(u.full_name || u.first_name);
      if (!hasName) continue;

      if (isTestAccount(u)) continue;

      if (!hasMinimumData(u)) continue;

      const company = getCompany(u);
      const industry = getIndustry(u);
      const jobTitle = u.job_title || u.current_position || null;

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

    console.log('Directory: returning ' + directoryUsers.length + ' parents');

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