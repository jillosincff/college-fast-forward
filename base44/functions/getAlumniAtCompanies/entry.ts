import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * getAlumniAtCompanies
 * Given a list of company names, find alumni and parents in the CFF network who work there.
 * First checks the platform directory, then falls back to Exa web search for LinkedIn profiles.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { companies = [] } = await req.json();
    if (!companies.length) {
      return Response.json({ success: false, error: 'No companies provided', results: [] });
    }

    const schoolCode = user.school_code || '';
    const schoolName = user.school_name || user.school || user.university || '';

    // Step 1: Search in-network users (alumni + parents) by company name
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 3000);
    const networkMap = {}; // company name -> array of members

    for (const u of (allUsers || [])) {
      const isParent = u.persona === 'parent' || (Array.isArray(u.roles) && u.roles.includes('parent'));
      const isAlumni = u.persona === 'alumni' || (Array.isArray(u.roles) && u.roles.includes('alumni'));
      if (!isParent && !isAlumni) continue;
      if (!u.full_name) continue;
      if (u.visible_in_directory === false) continue;

      // School isolation
      if (schoolCode) {
        const userSchool = u.school_code || '';
        const userSchoolName = u.school_name || u.school || u.university || '';
        const codeMatch = userSchool.toLowerCase() === schoolCode.toLowerCase();
        const nameMatch = userSchoolName && userSchoolName.toLowerCase() === schoolName.toLowerCase();
        if (!codeMatch && !nameMatch) continue;
      }

      const userCompany = (u.company || u.current_company || u.employer || '').toLowerCase().trim();
      if (!userCompany) continue;

      for (const companyName of companies) {
        const normalizedCompany = companyName.toLowerCase().trim();
        // Fuzzy match: company name contains the search term or vice versa
        if (userCompany.includes(normalizedCompany) || normalizedCompany.includes(userCompany)) {
          if (!networkMap[companyName]) networkMap[companyName] = [];
          networkMap[companyName].push({
            id: u.id,
            full_name: u.full_name,
            job_title: u.job_title || u.current_position || u.position || '',
            persona: isParent ? 'parent' : 'alumni',
            linkedin_url: u.linkedin_url || '',
            profile_image_url: u.profile_image_url || '',
            intro_willingness: u.intro_willingness || u.open_to_intros || 'unknown',
            source: 'network',
          });
          break;
        }
      }
    }

    // Step 2: For companies with no in-network results, try Exa LinkedIn search
    const companiesWithNoMatch = companies.filter(c => !networkMap[c] || networkMap[c].length === 0);

    if (companiesWithNoMatch.length > 0 && schoolName) {
      for (const companyName of companiesWithNoMatch.slice(0, 3)) { // limit Exa calls
        try {
          const exaRes = await base44.asServiceRole.functions.invoke('exaService', {
            action: 'searchAlumni',
            jobTitle: '',
            universityName: schoolName,
            companyName: companyName,
            maxResults: 2,
          });

          if (exaRes?.profiles?.length > 0) {
            networkMap[companyName] = exaRes.profiles.map(p => ({
              id: null,
              full_name: p.full_name || p.name || 'Alumni',
              job_title: p.headline || p.title || '',
              persona: 'alumni',
              linkedin_url: p.linkedin_url || '',
              profile_image_url: '',
              intro_willingness: 'unknown',
              source: 'exa',
            }));
          }
        } catch (e) {
          console.warn(`[getAlumniAtCompanies] Exa failed for ${companyName}:`, e.message);
        }
      }
    }

    // Build final results
    const results = companies.map(companyName => ({
      company: companyName,
      alumni: networkMap[companyName] || [],
      has_network_connection: (networkMap[companyName]?.length || 0) > 0,
    }));

    const totalFound = results.reduce((sum, r) => sum + r.alumni.length, 0);
    console.log(`[getAlumniAtCompanies] Found ${totalFound} connections across ${companies.length} companies`);

    return Response.json({ success: true, results });

  } catch (error) {
    console.error('[getAlumniAtCompanies] Error:', error.message);
    return Response.json({ error: error.message, results: [] }, { status: 500 });
  }
});