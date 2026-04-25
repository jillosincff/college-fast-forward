import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    // Get all OSU users
    const osuUsers = await base44.asServiceRole.entities.User.filter({ school_code: 'osu' });
    const osuParents = osuUsers.filter(u => u.persona === 'parent' || (Array.isArray(u.roles) && u.roles.includes('parent')));
    const osuAlumni = osuUsers.filter(u => u.persona === 'alumni' || (Array.isArray(u.roles) && u.roles.includes('alumni')));

    // Check filtering reasons
    const filtered = {
      noVisibility: 0,
      noOnboarding: 0,
      noMinData: 0,
      noName: 0,
      testAccount: 0,
      total: osuParents.length + osuAlumni.length,
    };

    const TEST_NAMES = ['test', 'movie', 'demo', 'sample', 'fake'];
    const isTestAccount = (u) => {
      const name = (u.full_name || u.first_name || '').toLowerCase().trim();
      const email = (u.email || '').toLowerCase();
      if (TEST_NAMES.some(t => name === t || name.startsWith(t + ' '))) return true;
      if (email.includes('test') || email.includes('demo')) return true;
      return false;
    };

    const getCompany = (u) => u.company || u.current_company || u.employer || null;
    const hasMinData = (u) => {
      const name = u.full_name || u.first_name;
      const company = getCompany(u);
      const jobTitle = u.job_title || u.current_position;
      return !!(name && (u.onboarding_completed || company || jobTitle));
    };

    // Analyze each user
    const samples = [];
    for (const u of osuParents.concat(osuAlumni)) {
      if (u.visible_in_directory === false) {
        filtered.noVisibility++;
      } else if (!u.onboarding_completed && !getCompany(u) && !u.job_title && !u.current_position) {
        filtered.noMinData++;
        if (samples.length < 5) samples.push({ email: u.email, reason: 'no onboarding + no company/job', ...u });
      } else if (!hasMinData(u)) {
        filtered.noMinData++;
      } else if (!u.full_name && !u.first_name) {
        filtered.noName++;
      } else if (isTestAccount(u)) {
        filtered.testAccount++;
      }
    }

    return Response.json({
      osu_total: filtered.total,
      osu_parents: osuParents.length,
      osu_alumni: osuAlumni.length,
      filtering_breakdown: filtered,
      sample_missing_users: samples.slice(0, 5).map(u => ({
        email: u.email,
        full_name: u.full_name,
        first_name: u.first_name,
        onboarding_completed: u.onboarding_completed,
        company: getCompany(u),
        job_title: u.job_title,
        visible_in_directory: u.visible_in_directory,
      })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});