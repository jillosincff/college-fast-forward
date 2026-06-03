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

    const HUNTER_API_KEY = Deno.env.get('HUNTER_API_KEY');
    
    if (!HUNTER_API_KEY) {
      return Response.json({ success: false, error: 'Email enrichment not configured', fallback: 'linkedin_only' }, { status: 503 });
    }

    const nameParts = contactName.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

    // Hunter Email Finder
    const finderUrl = `https://api.hunter.io/v2/email-finder?domain=${encodeURIComponent(companyDomain)}&first_name=${encodeURIComponent(firstName)}&last_name=${encodeURIComponent(lastName)}&api_key=${HUNTER_API_KEY}`;
    
    const response = await fetch(finderUrl);
    const text = await response.text();
    
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error('Hunter API non-JSON response:', text.slice(0, 200));
      return Response.json({ success: false, error: 'Hunter API error', fallback: 'linkedin_only' });
    }

    console.log('Hunter finder response:', JSON.stringify(data).slice(0, 300));

    if (data.data?.email) {
      const score = data.data.score || 0;
      // Accept any found email (even low confidence — better than nothing)
      return Response.json({
        success: true,
        email: data.data.email,
        score,
        source: 'email_finder'
      });
    }

    // Fallback: domain search
    const domainUrl = `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(companyDomain)}&limit=100&api_key=${HUNTER_API_KEY}`;
    const domainResponse = await fetch(domainUrl);
    const domainText = await domainResponse.text();

    let domainData;
    try {
      domainData = JSON.parse(domainText);
    } catch {
      console.error('Hunter domain search non-JSON:', domainText.slice(0, 200));
      return Response.json({ success: false, error: 'Email not found', fallback: 'linkedin_only' });
    }

    console.log('Hunter domain response emails count:', domainData.data?.emails?.length || 0);

    if (domainData.data?.emails?.length > 0) {
      // Try exact name match
      const fullName = contactName.toLowerCase();
      const exactMatch = domainData.data.emails.find(e =>
        `${e.first_name} ${e.last_name}`.toLowerCase() === fullName
      );
      if (exactMatch) {
        return Response.json({ success: true, email: exactMatch.value, score: exactMatch.confidence || 0, source: 'domain_search' });
      }
      // Try first name match
      const firstNameMatch = domainData.data.emails.find(e =>
        e.first_name?.toLowerCase() === firstName.toLowerCase()
      );
      if (firstNameMatch) {
        return Response.json({ success: true, email: firstNameMatch.value, score: firstNameMatch.confidence || 0, source: 'domain_search_firstname' });
      }
    }

    return Response.json({ success: false, error: 'Email not found', fallback: 'linkedin_only' });

  } catch (error) {
    console.error('Email enrichment error:', error);
    return Response.json({ success: false, error: error.message, fallback: 'linkedin_only' }, { status: 500 });
  }
});