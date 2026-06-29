import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Keeps the current parent/alumni user's matchable ParentNetworkProfile in sync
// with their profile edits. The matcher (findParentsAtCompany / getDashboardParentMatch)
// ONLY reads ParentNetworkProfile, so without this, profile edits never surface to students.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const sr = base44.asServiceRole;

    const company = (user.current_company || user.company || '').trim();
    const schoolCode = (user.school_code || user.data?.school_code || '').toUpperCase();

    // Can't be surfaced to students without a company + school ecosystem.
    if (!company || !schoolCode) {
      return Response.json({ updated: false, reason: 'missing_company_or_school' });
    }

    const nameParts = (user.full_name || '').trim().split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || (user.full_name || '').trim() || 'Member';
    const lastName = nameParts.slice(1).join(' ') || firstName;
    const deriveDomain = (name) => {
      const clean = (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return clean ? `${clean}.com` : '';
    };
    const persona = user.persona === 'alumni' || user.data?.persona === 'alumni' ? 'alumni' : 'parent';

    const profileData = {
      first_name: firstName,
      last_name: lastName,
      company_name: company,
      company_domain: deriveDomain(company),
      role_title: (user.career_background || '').trim() || 'Professional',
      linkedin_url: (user.linkedin_url || '').trim(),
      school_code: schoolCode,
      persona,
      is_active: user.visible_in_directory !== false,
    };

    // Find this member's existing profile within their school ecosystem.
    const existing = await sr.entities.ParentNetworkProfile.filter({
      school_code: schoolCode,
    }, '-created_date', 10000).catch(() => []);

    const match = (existing || []).find((p) => {
      const sameLinkedin = profileData.linkedin_url &&
        (p.linkedin_url || '').toLowerCase().trim() === profileData.linkedin_url.toLowerCase().trim();
      const sameName =
        (p.first_name || '').toLowerCase().trim() === firstName.toLowerCase().trim() &&
        (p.last_name || '').toLowerCase().trim() === lastName.toLowerCase().trim();
      return sameLinkedin || sameName;
    });

    if (match) {
      await sr.entities.ParentNetworkProfile.update(match.id, profileData);
      return Response.json({ updated: true, profile_id: match.id, created: false });
    }

    const created = await sr.entities.ParentNetworkProfile.create(profileData);
    return Response.json({ updated: true, profile_id: created.id, created: true });
  } catch (error) {
    console.error('[upsertMyParentNetworkProfile]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});