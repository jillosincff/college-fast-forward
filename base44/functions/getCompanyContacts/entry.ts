import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const defaultRole = user.career_goals?.target_roles?.[0] || 'entry level';

    // Gather the student's companies: pipeline companies + followed companies
    const [pipeline, followed] = await Promise.all([
      base44.entities.NetworkingPipeline.filter({ user_email: user.email }, '-created_date', 100),
      base44.entities.FollowedCompany.filter({ student_email: user.email }, '-created_date', 50),
    ]);

    // Build unique company list (pipeline first — most intent), cap at 8
    const companyMap = new Map();
    for (const p of pipeline || []) {
      if (p.company && !companyMap.has(p.company.toLowerCase())) {
        companyMap.set(p.company.toLowerCase(), { name: p.company, role: p.job_title || defaultRole });
      }
    }
    for (const f of followed || []) {
      if (f.company_name && !companyMap.has(f.company_name.toLowerCase())) {
        companyMap.set(f.company_name.toLowerCase(), { name: f.company_name, role: defaultRole });
      }
    }
    const targets = Array.from(companyMap.values()).slice(0, 8);

    if (targets.length === 0) {
      return Response.json({
        success: true,
        companies: [],
        message: 'No companies tracked yet. Add companies to your pipeline to see hiring manager intelligence.',
      });
    }

    // Enrich each company with real contacts
    const enrichedCompanies = await Promise.all(
      targets.map(async ({ name: companyName, role: roleInterest }) => {
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
            for (const result of exaData.results.slice(0, 3)) {
              const parts = (result.title || '').split(/[|\-·]/).map(s => s.trim()).filter(Boolean);
              const name = parts[0]?.replace(/\s+Bio$/i, '').trim();

              if (!name) continue;

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
                confidence,
              });
            }
          }

          return {
            company: companyName,
            roleOfInterest: roleInterest,
            contacts,
            contactCount: contacts.length,
            hasEmails: contacts.some(c => c.email),
          };
        } catch (error) {
          console.error(`Failed to enrich ${companyName}:`, error);
          return {
            company: companyName,
            roleOfInterest: roleInterest,
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