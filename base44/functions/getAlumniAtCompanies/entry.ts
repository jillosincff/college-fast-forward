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

    // Step 2: Exa fallback — find real LinkedIn alumni profiles for companies with no network matches
    const EXA_API_KEY = Deno.env.get('EXA_API_KEY');
    const companiesWithoutMatches = companies.filter(c => !networkMap[c] || networkMap[c].length === 0);
    
    if (EXA_API_KEY && companiesWithoutMatches.length > 0) {
      const exaFetch = async (companyName) => {
        const query = `${schoolName || schoolCode} alumnus alumna graduate "${companyName}" LinkedIn NOT "director of athletics" NOT "assistant coach" NOT "staff" NOT "faculty" NOT "administrator"`;
        try {
          const res = await fetch('https://api.exa.ai/search', {
            method: 'POST',
            headers: { 
              'x-api-key': EXA_API_KEY, 
              'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
              query,
              type: 'auto',
              category: 'people',
              numResults: 3,
              contents: { highlights: { maxCharacters: 500 } },
            }),
          });
          return res.json();
        } catch (e) {
          console.warn(`[Exa] Failed to search ${companyName}:`, e.message);
          return { results: [] };
        }
      };

      const exaResults = await Promise.all(companiesWithoutMatches.map(c => exaFetch(c)));
      
      exaResults.forEach((data, idx) => {
        const companyName = companiesWithoutMatches[idx];
        const profiles = (data.results || []).map(r => {
          const parts = (r.title || '').split(/[|\-·]/).map(s => s.trim()).filter(Boolean);
          const full_name = parts[0]?.replace(/\s+ Bio$/i, '').trim() || 'Unknown';
          const headline = parts.slice(1).join(' · ') || '';
          return {
            id: `exa-${r.url}`,
            full_name,
            job_title: headline,
            persona: 'alumni',
            linkedin_url: r.url,
            profile_image_url: '',
            intro_willingness: 'unknown',
            source: 'exa',
          };
        }).filter(p => p.full_name !== 'Unknown' && p.full_name.length < 50 && p.linkedin_url?.includes('linkedin.com/in/'));
        
        if (!networkMap[companyName]) networkMap[companyName] = [];
        networkMap[companyName].push(...profiles.slice(0, 3));
      });
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