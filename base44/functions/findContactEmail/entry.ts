import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contactName, companyDomain } = await req.json();
    
    if (!contactName || !companyDomain) {
      return Response.json({ error: 'Missing contactName or companyDomain' }, { status: 400 });
    }

    // Use Hunter API to find professional email
    const HUNTER_API_KEY = Deno.env.get('HUNTER_API_KEY');
    
    if (!HUNTER_API_KEY) {
      return Response.json({ 
        error: 'Email enrichment not configured',
        fallback: 'linkedin_only'
      }, { status: 503 });
    }

    // Hunter API: Email Finder
    const hunterUrl = new URL('https://api.hunter.io/v2/email-finder');
    hunterUrl.searchParams.set('domain', companyDomain);
    hunterUrl.searchParams.set('first_name', contactName.split(' ')[0]);
    hunterUrl.searchParams.set('last_name', contactName.split(' ').slice(-1)[0]);
    hunterUrl.searchParams.set('api_key', HUNTER_API_KEY);

    const response = await fetch(hunterUrl.toString());
    const data = await response.json();

    if (data.data && data.data.email && data.data.score > 50) {
      return Response.json({
        success: true,
        email: data.data.email,
        score: data.data.score,
        source: data.data.source
      });
    }

    // Try domain search as fallback
    const domainUrl = new URL(`https://api.hunter.io/v2/domain-search/${companyDomain}`);
    domainUrl.searchParams.set('api_key', HUNTER_API_KEY);
    domainUrl.searchParams.set('limit', '100');

    const domainResponse = await fetch(domainUrl.toString());
    const domainData = await domainResponse.json();

    if (domainData.data && domainData.data.emails) {
      const match = domainData.data.emails.find(
        e => e.first_name && e.last_name && 
             `${e.first_name} ${e.last_name}`.toLowerCase() === contactName.toLowerCase()
      );
      
      if (match && match.score > 50) {
        return Response.json({
          success: true,
          email: match.email,
          score: match.score,
          source: 'domain_search'
        });
      }
    }

    return Response.json({
      success: false,
      error: 'Email not found',
      fallback: 'linkedin_only'
    });

  } catch (error) {
    console.error('Email enrichment error:', error);
    return Response.json({ 
      error: error.message,
      fallback: 'linkedin_only'
    }, { status: 500 });
  }
});