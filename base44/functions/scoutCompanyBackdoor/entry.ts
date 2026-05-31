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
      // Record the unlock
      const existingUnlocks = await base44.asServiceRole.entities.NetworkingPipeline.filter({
        user_id: user.id,
        job_id: jobId
      });
      const existingUnlock = existingUnlocks[0];

      if (existingUnlock) {
        await base44.asServiceRole.entities.NetworkingPipeline.update(existingUnlock.id, {
          unlocked: true,
          unlocked_at: new Date().toISOString(),
          insider_count: foundInsiders.length,
          insider_type: foundInsiders[0].role || 'ALUMNI'
        });
      } else {
        await base44.asServiceRole.entities.NetworkingPipeline.create({
          user_id: user.id,
          job_id: jobId,
          company_name: companyName,
          unlocked: true,
          unlocked_at: new Date().toISOString(),
          insider_count: foundInsiders.length,
          insider_type: foundInsiders[0].role || 'ALUMNI',
          status: 'unlocked'
        });
      }

      return Response.json({
        success: true,
        insiderFound: true,
        message: `CLiFF successfully mapped ${foundInsiders.length} insider connection points for ${companyName}.`,
        connectionsCount: foundInsiders.length
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
        message: 'LinkedIn search unavailable. Queued for background crawl.'
      });
    }

    try {
      // Search for alumni from user's school at target company
      const searchQuery = `${userSchool} ${companyName}`;
      const proxycurlUrl = `https://nubela.co/proxycurl/api/v2/search/advance/`;
      
      const response = await fetch(proxycurlUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PROXYCURL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          keyword: searchQuery,
          company_name: companyName,
          school: userSchool,
          size: 10
        })
      });

      if (!response.ok) {
        console.error(`[scoutCompanyBackdoor] Proxycurl API error: ${response.status}`);
        throw new Error(`Proxycurl API returned ${response.status}`);
      }

      const linkedinResults = await response.json();
      console.log(`[scoutCompanyBackdoor] Found ${linkedinResults?.results?.length || 0} alumni on LinkedIn`);

      if (linkedinResults?.results && linkedinResults.results.length > 0) {
        // Save discovered alumni to database
        const newAlumni = linkedinResults.results.slice(0, 5).map(profile => ({
          school_code: userSchoolCode,
          verified: false,
          role_title: profile.headline || profile.occupation || '',
          match_score: 85,
          source_url: profile.profile_url || '',
          verified_by: null,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          name: profile.full_name || profile.first_name + ' ' + profile.last_name || '',
          degree_info: profile.education?.[0]?.school_name || userSchool,
          greek_organization: null,
          company: profile.experiences?.[0]?.company || companyName,
          location: profile.city + ', ' + profile.country || '',
          linkedin_url: profile.profile_url || ''
        }));

        await base44.asServiceRole.entities.DiscoveredAlumni.bulkCreate(newAlumni);

        // Record the unlock
        await base44.asServiceRole.entities.NetworkingPipeline.create({
          user_id: user.id,
          job_id: jobId,
          company_name: companyName,
          unlocked: true,
          unlocked_at: new Date().toISOString(),
          insider_count: newAlumni.length,
          insider_type: 'ALUMNI',
          status: 'unlocked'
        });

        return Response.json({
          success: true,
          insiderFound: true,
          message: `Found ${newAlumni.length} ${userSchoolCode} alumni at ${companyName} on LinkedIn!`,
          connectionsCount: newAlumni.length,
          newlyDiscovered: true
        });
      }
    } catch (error) {
      console.error('[scoutCompanyBackdoor] LinkedIn search failed:', error);
    }

    // Step 3: No LinkedIn results - queue for background crawling
    await base44.asServiceRole.entities.NetworkingPipeline.create({
      user_id: user.id,
      job_id: jobId,
      company_name: companyName,
      clean_name: cleanJobCompany,
      unlocked: false,
      status: 'pending_crawl',
      created_at: new Date().toISOString()
    });

    return Response.json({
      success: true,
      insiderFound: false,
      message: `No alumni found at ${companyName} yet. Added to priority crawl queue.`
    });

  } catch (error) {
    console.error('On-Demand Crawler Pipeline Exception:', error);
    return Response.json({ 
      success: false, 
      message: 'Scout routing failed to process transaction.' 
    }, { status: 500 });
  }
});