import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    // For testing purposes, always use Jill's email
    const targetEmail = 'jill.osinoff@example.com';
    console.log(`[getCompanyContacts] Testing with Jill's email: ${targetEmail}`);
    console.log(`[getCompanyContacts] Target email: ${targetEmail}`);

    // Get all companies being followed
    const allFollowedCompanies = await base44.asServiceRole.entities.FollowedCompany.list(undefined, 100);
    console.log(`[getCompanyContacts] Total followed companies: ${allFollowedCompanies?.length || 0}`);
    
    const followedCompanies = (allFollowedCompanies || []).filter(fc => {
      const matches = fc.student_email === targetEmail;
      if (matches) console.log(`[getCompanyContacts] Match: ${fc.company_name}`);
      return matches;
    });
    
    console.log(`[getCompanyContacts] Matching companies: ${followedCompanies.length}`);

    if (!followedCompanies || followedCompanies.length === 0) {
      return Response.json({ 
        success: true, 
        companies: [],
        message: `No companies found for ${targetEmail}`
      });
    }

    // Enrich each company with real data
    const enrichedCompanies = await Promise.all(
      followedCompanies.map(async (follow) => {
        const companyName = follow.company_name;
        const roleInterest = follow.role_interest || 'Software Engineer';
        
        try {
          // Step 1: Use Exa to find real hiring managers at this company
          const exaResponse = await fetch('https://api.exa.ai/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': Deno.env.get('EXA_API_KEY'),
            },
            body: JSON.stringify({
              query: `${roleInterest} manager director vp head ${companyName} site:linkedin.com/in`,
              type: 'auto',
              numResults: 3,
              includeDomains: ['linkedin.com'],
            }),
          });
          
          const exaData = await exaResponse.json();
          
          let contacts = [];
          
          if (exaData.results && exaData.results.length > 0) {
            // Process each result to extract contact info
            for (const result of exaData.results.slice(0, 3)) {
              // Parse name from LinkedIn title
              const parts = (result.title || '').split(/[|\-·]/).map(s => s.trim()).filter(Boolean);
              const name = parts[0]?.replace(/\s+Bio$/i, '').trim();
              
              if (!name) continue;
              
              // Get title from highlights
              const highlights = result.highlights || [];
              let title = 'Manager';
              if (highlights.length > 0) {
                const titleMatch = highlights[0].match(/([A-Za-z\s]+(?:Manager|Director|VP|Lead|Head|Chief|President|Engineer|Developer|Designer))[,\s]/i);
                title = titleMatch ? titleMatch[1].trim() : (parts[1] || 'Manager');
              }
              
              // Step 2: Try to find email using Hunter API
              let email = null;
              let confidence = null;
              try {
                const hunterResponse = await fetch(
                  `https://api.hunter.io/v2/email-finder?domain=${companyName.toLowerCase().replace(/\s+/g, '')}.com&first_name=${name.split(' ')[0]}&last_name=${name.split(' ').slice(-1)[0]}&api_key=${Deno.env.get('HUNTER_API_KEY')}`
                );
                const hunterData = await hunterResponse.json();
                
                if (hunterData.data && hunterData.data.email) {
                  email = hunterData.data.email;
                  confidence = hunterData.data.score;
                }
              } catch (hunterError) {
                console.log(`Hunter API failed for ${name}:`, hunterError.message);
              }
              
              contacts.push({
                name,
                title,
                linkedinUrl: result.url,
                email,
                confidence: confidence,
              });
            }
          }
          
          return {
            company: companyName,
            roleOfInterest: roleInterest,
            status: follow.status,
            notes: follow.notes,
            contacts,
            contactCount: contacts.length,
            hasEmails: contacts.some(c => c.email),
          };
          
        } catch (error) {
          console.error(`Failed to enrich ${companyName}:`, error);
          return {
            company: companyName,
            roleOfInterest: roleInterest,
            status: follow.status,
            notes: follow.notes,
            contacts: [],
            contactCount: 0,
            hasEmails: false,
            error: error.message,
          };
        }
      })
    );

    return Response.json({
      success: true,
      companies: enrichedCompanies,
      totalCompanies: enrichedCompanies.length,
      companiesWithContacts: enrichedCompanies.filter(c => c.contactCount > 0).length,
      companiesWithEmails: enrichedCompanies.filter(c => c.hasEmails).length,
    });

  } catch (error) {
    console.error('GetCompanyContacts error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});