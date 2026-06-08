import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Verify that an Exa people-search result represents someone who actually
 * attended the user's school. Exa's neural search is approximate and
 * will return "University of North Florida" / "University of South Florida"
 * for a "University of Florida" query — we MUST post-filter or these
 * leak through as false-positive alumni.
 *
 * Order of evidence:
 *   1. Structured educationHistory from Exa's entity extraction (most reliable)
 *   2. Fall back to substring check across title/text/highlights
 * Returns false if neither source confirms the school.
 */
function schoolMatchesResult(result, userSchool, userSchoolCode) {
  const schoolLower = (userSchool || '').toLowerCase().trim();
  const codeLower = (userSchoolCode || '').toLowerCase().trim();
  if (!schoolLower && !codeLower) return false;

  const matchesString = (str) => {
    if (!str) return false;
    const lower = str.toLowerCase();
    // Substring match on the full school name. Critically rejects
    // "university of north florida" when matching "university of florida"
    // because the contiguous substring isn't present there.
    if (schoolLower && lower.includes(schoolLower)) return true;
    // Word-boundary match on the school code (e.g. "UF" must be standalone —
    // "STUFF" must not match).
    if (codeLower.length >= 2 && new RegExp(`\\b${codeLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(str)) return true;
    return false;
  };

  // 1. Structured education from Exa entities (preferred)
  const person = (result.entities || []).find(e => e.type === 'person');
  const eduHistory = person?.properties?.educationHistory || [];
  if (eduHistory.length > 0) {
    return eduHistory.some(e => matchesString(e.institution?.name));
  }

  // 2. Fallback: title / text / highlights string search.
  const haystack = [
    result.title || '',
    result.text || '',
    ...(result.highlights || []),
  ].join(' ');
  return matchesString(haystack);
}

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

    // Get user's school for targeted search. Read from both top-level and
    // .data.* shapes — the codebase isn't consistent. Don't default to UF;
    // a missing school means we can't verify alumni anyway.
    const userSchool = user.school_name || user.school || user.university
      || user.data?.school || user.data?.school_name || '';
    const userSchoolCode = user.school_code || user.data?.school_code || '';

    if (!userSchool && !userSchoolCode) {
      console.warn('[scoutCompanyBackdoor] User has no school set; cannot verify alumni');
      return Response.json({
        success: true,
        insiderFound: false,
        message: 'Set your school in your profile to find alumni.',
        connectionsCount: 0,
        alumni: []
      });
    }

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
      const rawResults = (exaData.results || []).filter(r =>
        /linkedin\.com\/in\/[^/?]+/.test(r.url || '')
      );

      // CRITICAL: Exa's neural search is approximate. "University of Florida"
      // query routinely returns "University of North Florida", "USF", "UCF",
      // and "Florida State" profiles. Filter against structured
      // educationHistory (Exa's entity extraction) before treating any of
      // these as alumni.
      const results = rawResults.filter(r => schoolMatchesResult(r, userSchool, userSchoolCode));
      const droppedForSchoolMismatch = rawResults.length - results.length;
      if (droppedForSchoolMismatch > 0) {
        console.log(`[scoutCompanyBackdoor] Rejected ${droppedForSchoolMismatch} LinkedIn results — wrong school per educationHistory`);
      }
      console.log(`[scoutCompanyBackdoor] Found ${results.length} verified ${userSchoolCode || userSchool} profiles via Exa (from ${rawResults.length} raw)`);

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

          // Display only what we actually have from educationHistory. If
          // Exa didn't surface a matching school entry, leave degree_info
          // blank rather than fabricating "University of Florida" — the
          // school filter above already verified this person attended.
          const matchingEdu = (props.educationHistory || []).find(e => {
            const inst = (e.institution?.name || '').toLowerCase();
            return inst && (inst.includes(userSchool.toLowerCase()) || (userSchoolCode && new RegExp(`\\b${userSchoolCode.toLowerCase()}\\b`, 'i').test(e.institution.name)));
          });
          const degreeInfo = matchingEdu
            ? [matchingEdu.degree, matchingEdu.institution?.name].filter(Boolean).join(', ')
            : '';
          
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