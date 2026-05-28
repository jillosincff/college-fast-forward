import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * getVerifiedNetworkCompanies
 *
 * Hard-Data First: query the actual verified alumni/parent directory,
 * group by current employer, and return companies that have at least
 * one confirmed in-network person — along with counts and member previews.
 *
 * No AI generation. No web scraping. Only real records.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const schoolCode = (user.school_code || '').toLowerCase();
    const schoolName = (user.school_name || user.school || user.university || '').toLowerCase();

    // Pull all users once
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);

    // companyKey -> { alumniCount, parentCount, members[] }
    const companyMap = {};

    for (const u of (allUsers || [])) {
      const isParent = u.persona === 'parent' || (Array.isArray(u.roles) && u.roles.includes('parent'));
      const isAlumni = u.persona === 'alumni' || (Array.isArray(u.roles) && u.roles.includes('alumni'));
      if (!isParent && !isAlumni) continue;
      if (!u.full_name) continue;
      if (u.visible_in_directory === false) continue;

      // School isolation — only show people from the same school
      if (schoolCode || schoolName) {
        const uCode = (u.school_code || '').toLowerCase();
        const uName = (u.school_name || u.school || u.university || '').toLowerCase();
        const codeMatch = schoolCode && uCode === schoolCode;
        const nameMatch = schoolName && uName === schoolName;
        if (!codeMatch && !nameMatch) continue;
      }

      // Must have a current company on record
      const rawCompany = (u.company || u.current_company || u.employer || '').trim();
      if (!rawCompany) continue;

      // Normalize company key (lowercase, no punctuation)
      const key = rawCompany.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
      if (!key) continue;

      if (!companyMap[key]) {
        companyMap[key] = {
          company: rawCompany, // preserve original casing from first hit
          alumniCount: 0,
          parentCount: 0,
          members: [],
        };
      }

      if (isAlumni) companyMap[key].alumniCount++;
      if (isParent) companyMap[key].parentCount++;

      // Store member preview (max 10 per company to keep payload small)
      if (companyMap[key].members.length < 10) {
        companyMap[key].members.push({
          id: u.id,
          full_name: u.full_name,
          title: u.job_title || u.current_position || u.position || '',
          persona: isParent ? 'parent' : 'alumni',
          graduation_year: u.graduation_year || u.class_year || '',
          linkedin_url: u.linkedin_url || null,
          student_name: isParent ? (u.student_name || null) : null,
        });
      }
    }

    // Convert to sorted array: prioritize by total network size
    const companies = Object.values(companyMap)
      .filter(c => c.alumniCount + c.parentCount > 0)
      .sort((a, b) => (b.alumniCount + b.parentCount) - (a.alumniCount + a.parentCount))
      .slice(0, 20); // top 20 companies max

    console.log(`[getVerifiedNetworkCompanies] Found ${companies.length} companies with verified members for school: ${schoolCode || schoolName}`);

    return Response.json({ success: true, companies });

  } catch (error) {
    console.error('[getVerifiedNetworkCompanies]', error.message);
    return Response.json({ error: error.message, companies: [] }, { status: 500 });
  }
});