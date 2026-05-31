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

    // Step 2: No insiders in database - search using Exa API (web search for LinkedIn profiles)
    console.log(`[scoutCompanyBackdoor] No database matches for ${companyName}. Searching via Exa...`);
    
    const EXA_API_KEY = Deno.env.get('EXA_API_KEY');
    if (!EXA_API_KEY) {
      console.error('[scoutCompanyBackdoor] EXA_API_KEY not configured');
      return Response.json({
        success: true,
        insiderFound: false,
        message: `No ${userSchoolCode} alumni found at ${companyName} yet.`,
        connectionsCount: 0,
        alumni: []
      });
    }

    try {
      // Search for LinkedIn profiles of university alumni at the target company
      const searchQuery = `"${userSchool}" "${companyName}" site:linkedin.com/in`;
      
      const exaResponse = await fetch('https://api.exa.ai/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${EXA_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: searchQuery,
          type: 'keyword',
          numResults: 10,
          includeDomains: ['linkedin.com'],
          text: true
        })
      });

      if (!exaResponse.ok) {
        throw new Error(`Exa API returned ${exaResponse.status}`);
      }

      const exaData = await exaResponse.json();
      const results = exaData.results || [];
      console.log(`[scoutCompanyBackdoor] Found ${results.length} LinkedIn profiles via Exa`);

      if (results.length > 0) {
        // Extract alumni info from search results
        const newAlumni = results.slice(0, 5).map(result => {
          // Extract name from URL or title
          const nameMatch = result.title?.match(/^(.+?)\s*[-|]/) || result.url?.match(/\/in\/([^/?]+)/);
          const name = nameMatch ? nameMatch[1].trim() : 'LinkedIn Professional';
          
          // Extract job title from the title (after the name) or from snippet
          const titleParts = result.title?.split('-').map(s => s.trim());
          const jobTitle = titleParts?.length > 1 ? titleParts.slice(1).join(' - ') : 
                          result.text?.match(/([^|]+)\|/)?.[1]?.trim() || 'Professional';
          
          return {
            school_code: userSchoolCode,
            verified: false,
            role_title: jobTitle,
            match_score: 85,
            source_url: result.url || '',
            verified_by: null,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            name: name,
            degree_info: userSchool,
            greek_organization: null,
            company: companyName,
            location: 'Unknown',
            linkedin_url: result.url || '',
            description: `Found via Exa search: ${result.text?.substring(0, 200) || ''}`
          };
        });

        console.log(`[scoutCompanyBackdoor] Saving ${newAlumni.length} alumni to DiscoveredAlumni entity`);
        await base44.asServiceRole.entities.DiscoveredAlumni.bulkCreate(newAlumni);

        return Response.json({
          success: true,
          insiderFound: true,
          message: `Found ${newAlumni.length} ${userSchoolCode} alumni at ${companyName}!`,
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
      console.error('[scoutCompanyBackdoor] Exa search failed:', error);
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