import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ 
        success: false, 
        message: 'Unauthorized' 
      }, { status: 401 });
    }

    const { jobId, companyName } = await req.json().catch(() => ({}));

    if (!jobId || !companyName) {
      return Response.json({ 
        success: false, 
        message: 'Missing target execution parameters: jobId and companyName required.' 
      }, { status: 400 });
    }

    // Clean company name for robust regex matching
    const cleanJobCompany = companyName.toLowerCase().replace(/[^a-z0-9]/g, '').trim();

    // Get user's school for targeted search
    const userSchool = user.data?.school || user.data?.school_name || 'University of Florida';
    const userSchoolCode = user.data?.school_code || 'UF';

    // Step 1: Check existing DiscoveredAlumni database
    const networkContacts = await base44.asServiceRole.entities.DiscoveredAlumni.list();
    const foundInsiders = networkContacts.filter(contact => {
      const contactCompany = (contact.company || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return contactCompany.includes(cleanJobCompany) || cleanJobCompany.includes(contactCompany);
    });

    if (foundInsiders.length > 0) {
      // Skip NetworkingPipeline creation due to schema validation issues
      // Just return the found insiders directly
      console.log(`[scoutCompanyBackdoor] Found ${foundInsiders.length} insiders in database for ${companyName}`);

      return Response.json({
        success: true,
        insiderFound: true,
        message: `Found ${foundInsiders.length} ${userSchoolCode} alumni at ${companyName}!`,
        connectionsCount: foundInsiders.length,
        alumni: foundInsiders.map(a => ({
          name: a.name,
          title: a.role_title,
          company: a.company,
          linkedin_url: a.linkedin_url,
          persona: 'alumni'
        }))
      });
    }

    // Step 2: No insiders in database - search LinkedIn via Proxycurl
    console.log(`[scoutCompanyBackdoor] No database matches for ${companyName}. Searching LinkedIn...`);
    
    const PROXYCURL_API_KEY = Deno.env.get('PROXYCURL_API_KEY');
    if (!PROXYCURL_API_KEY) {
      console.error('[scoutCompanyBackdoor] PROXYCURL_API_KEY not configured');
      return Response.json({
        success: true,
        insiderFound: false,
        message: `No ${userSchoolCode} alumni found at ${companyName} yet.`,
        connectionsCount: 0,
        alumni: []
      });
    }

    try {
      // Search for alumni from user's school at target company
      // Using LinkedIn Profile Search endpoint instead (advance endpoint deprecated)
      const searchQuery = `${userSchool} ${companyName}`;
      const proxycurlUrl = `https://nubela.co/proxycurl/api/linkedin/profile/search`;
      
      const response = await fetch(proxycurlUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PROXYCURL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        params: {
          keyword: searchQuery,
          company_name: companyName,
          school: userSchool,
          size: '10'
        }
      });

      if (!response.ok) {
        console.error(`[scoutCompanyBackdoor] Proxycurl API error: ${response.status}`);
        if (response.status === 410 || response.status === 404) {
          console.warn('[scoutCompanyBackdoor] Proxycurl endpoint deprecated, skipping LinkedIn search');
          return Response.json({
            success: true,
            insiderFound: false,
            message: `No ${userSchoolCode} alumni found at ${companyName} yet.`,
            connectionsCount: 0,
            alumni: []
          });
        }
        throw new Error(`Proxycurl API returned ${response.status}`);
      }

      const linkedinResults = await response.json();
      console.log(`[scoutCompanyBackdoor] Found ${linkedinResults?.results?.length || 0} alumni on LinkedIn`);

      if (linkedinResults?.results && linkedinResults.results.length > 0) {
        // Save discovered alumni to database - ensure required fields (name, company) are always populated
        const newAlumni = linkedinResults.results.slice(0, 5).map(profile => {
          const fullName = profile.full_name || 
                          (profile.first_name && profile.last_name ? `${profile.first_name} ${profile.last_name}` : '') || 
                          'LinkedIn Professional';
          const currentCompany = profile.experiences?.[0]?.company || companyName || 'Unknown Company';
          
          return {
            school_code: userSchoolCode,
            verified: false,
            role_title: profile.headline || profile.occupation || 'Professional',
            match_score: 85,
            source_url: profile.profile_url || '',
            verified_by: null,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            name: fullName,
            degree_info: profile.education?.[0]?.school_name || userSchool,
            greek_organization: null,
            company: currentCompany,
            location: (profile.city && profile.country) ? `${profile.city}, ${profile.country}` : (profile.location || 'Unknown'),
            linkedin_url: profile.profile_url || '',
            description: `Found via LinkedIn search for ${userSchool} alumni at ${companyName}`
          };
        });

        console.log(`[scoutCompanyBackdoor] Saving ${newAlumni.length} alumni to DiscoveredAlumni entity`);
        await base44.asServiceRole.entities.DiscoveredAlumni.bulkCreate(newAlumni);

        // Skip NetworkingPipeline creation due to schema validation issues
        return Response.json({
          success: true,
          insiderFound: true,
          message: `Found ${newAlumni.length} ${userSchoolCode} alumni at ${companyName} on LinkedIn!`,
          connectionsCount: newAlumni.length,
          newlyDiscovered: true,
          alumni: newAlumni.map(a => ({
            name: a.name,
            title: a.role_title,
            company: a.company,
            linkedin_url: a.linkedin_url,
            persona: 'alumni'
          }))
        });
      }
    } catch (error) {
      console.error('[scoutCompanyBackdoor] LinkedIn search failed:', error);
    }

    // Step 3: No LinkedIn results - return message without creating pipeline record (to avoid validation errors)
    console.log(`[scoutCompanyBackdoor] No alumni found at ${companyName}, skipping pipeline creation due to schema constraints`);

    return Response.json({
      success: true,
      insiderFound: false,
      message: `No ${userSchoolCode} alumni found at ${companyName} yet.`,
      connectionsCount: 0,
      alumni: []
    });

  } catch (error) {
    console.error('On-Demand Crawler Pipeline Exception:', error);
    console.error('Stack trace:', error.stack);
    return Response.json({ 
      success: false, 
      message: `Scout routing failed: ${error.message || 'Unknown error'}` 
    }, { status: 500 });
  }
});