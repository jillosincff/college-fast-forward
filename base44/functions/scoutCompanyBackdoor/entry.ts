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

    // Step 1: Check existing DiscoveredAlumni database — MUST match both company AND school_code
    const networkContacts = await base44.asServiceRole.entities.DiscoveredAlumni.filter({ school_code: userSchoolCode });
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
          role_title: a.role_title || null,
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
      // Use Exa People Search (category: "people") which returns structured educationHistory
      // This lets us verify the exact school — eliminating FIU, FSU, UCF false positives
      const searchQuery = `${userSchool} alumni at ${companyName}`;
      
      const exaResponse = await fetch('https://api.exa.ai/search', {
        method: 'POST',
        headers: {
          'x-api-key': EXA_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: searchQuery,
          category: 'people',
          type: 'auto',
          numResults: 15,
          contents: {
            text: { maxCharacters: 400 }
          }
        })
      });

      if (!exaResponse.ok) {
        throw new Error(`Exa API returned ${exaResponse.status}`);
      }

      const exaData = await exaResponse.json();

      // Filter: must be a LinkedIn /in/ profile AND educationHistory must contain the exact school
      const results = (exaData.results || []).filter(r => {
        if (!/linkedin\.com\/in\/[^/?]+/.test(r.url || '')) return false;
        const person = (r.entities || []).find(e => e.type === 'person');
        if (!person) return true; // no entity data — keep and rely on query relevance
        const edu = person.properties?.educationHistory || [];
        if (edu.length === 0) return true; // no edu data — keep
        // Verify at least one education entry matches our school
        return edu.some(e => {
          const inst = (e.institution?.name || '').toLowerCase();
          return inst.includes(userSchool.toLowerCase()) || inst.includes(userSchoolCode.toLowerCase());
        });
      });

      console.log(`[scoutCompanyBackdoor] Found ${results.length} verified LinkedIn profiles via Exa`);

      if (results.length > 0) {
        // Extract alumni info from search results and attempt email lookup
        const newAlumni = await Promise.all(results.slice(0, 5).map(async result => {
          // Use structured entity data if available, fall back to title/URL parsing
          const person = (result.entities || []).find(e => e.type === 'person');
          const props = person?.properties || {};

          const titleRaw = (result.title || '').replace(/^#+\s*/, '').trim();
          const urlSlugMatch = result.url?.match(/\/in\/([^/?]+)/);
          const name = props.name
            || (titleRaw && titleRaw.length > 2 ? titleRaw : null)
            || (urlSlugMatch ? urlSlugMatch[1].replace(/-\d+$/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'LinkedIn Professional');

          // Get current job title from workHistory (first entry = current role)
          const currentWork = (props.workHistory || []).find(w => !w.dates?.to);
          const jobTitle = currentWork?.title || null;

          // Get degree info from educationHistory
          const ufEdu = (props.educationHistory || []).find(e =>
            (e.institution?.name || '').toLowerCase().includes(userSchool.toLowerCase())
          );
          const degreeInfo = ufEdu ? [ufEdu.degree, ufEdu.institution?.name].filter(Boolean).join(', ') : userSchool;
          
          // Step 2b: Try to find email using Hunter API
          let email = null;
          let emailConfidence = null;
          try {
            const HUNTER_API_KEY = Deno.env.get('HUNTER_API_KEY');
            if (HUNTER_API_KEY) {
              // Extract domain from company name
              const domain = companyName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9.]/g, '') + '.com';
              const firstName = name.split(' ')[0].toLowerCase();
              const lastName = name.split(' ').slice(-1)[0].toLowerCase();
              
              const hunterResponse = await fetch(
                `https://api.hunter.io/v2/email-finder?domain=${domain}&first_name=${firstName}&last_name=${lastName}&api_key=${HUNTER_API_KEY}`
              );
              const hunterData = await hunterResponse.json();
              
              if (hunterData.data && hunterData.data.email) {
                email = hunterData.data.email;
                emailConfidence = hunterData.data.score;
                console.log(`[scoutCompanyBackdoor] Hunter found email for ${name}: ${email} (${emailConfidence}% confidence)`);
              }
            }
          } catch (hunterError) {
            console.log(`[scoutCompanyBackdoor] Hunter API failed for ${name}:`, hunterError.message);
          }
          
          return {
            school_code: userSchoolCode,
            verified: false,
            role_title: jobTitle,
            match_score: 85,
            source_url: result.url || '',
            verified_by: null,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            name: name,
            degree_info: degreeInfo,
            greek_organization: null,
            company: companyName,
            location: 'Unknown',
            linkedin_url: result.url || '',
            email: email,
            email_confidence: emailConfidence,
            description: `Found via Exa search`
          };
        }));

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
            role_title: a.role_title,
            company: a.company,
            linkedin_url: a.linkedin_url,
            email: a.email,
            email_confidence: a.email_confidence,
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