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

    // 1. Sanitize name: strip credentials (MBA, PhD, etc.), punctuation, middle initials
    const credentialsRegex = /\b(MBA|PhD|Ph\.D|MD|JD|CPA|CFA|MS|BSc|BA|MA|Esq|Jr|Sr|II|III|IV)\b\.?/gi;
    const cleanedName = contactName
      .replace(credentialsRegex, '')
      .replace(/[^a-zA-Z\s'-]/g, '')
      .replace(/\b[A-Z]\.\s*/g, '') // strip middle initials like "J. "
      .trim();
    const nameParts = cleanedName.split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

    // 2. Sanitize domain: strip protocol, www, subdomains — keep only root domain
    const cleanDomain = companyDomain
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .split('/')[0]  // strip any path
      .toLowerCase()
      .trim();

    // 3. Hunter Email Finder — explicit endpoint with separated params
    const finderUrl = `https://api.hunter.io/v2/email-finder?domain=${encodeURIComponent(cleanDomain)}&first_name=${encodeURIComponent(firstName)}&last_name=${encodeURIComponent(lastName)}&api_key=${HUNTER_API_KEY}`;
    
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
      return Response.json({
        success: true,
        email: data.data.email,
        score: data.data.score || 0,
        source: 'email_finder'
      });
    }

    // Pattern-based confidence fallback: if Hunter knows the domain pattern, construct the email
    if (data.data?.pattern && firstName && lastName) {
      const confidence = data.data.score || 0;
      if (confidence >= 70) {
        const pattern = data.data.pattern; // e.g. "{first}.{last}", "{first_initial}{last}", etc.
        const f = firstName.toLowerCase();
        const l = lastName.toLowerCase();
        const fi = f[0] || '';
        const li = l[0] || '';
        const constructed = pattern
          .replace('{first}', f)
          .replace('{last}', l)
          .replace('{first_initial}', fi)
          .replace('{last_initial}', li)
          .replace('{f}', fi)
          .replace('{l}', li);
        const email = `${constructed}@${cleanDomain}`;
        console.log(`[Hunter] Pattern-constructed email: ${email} (confidence ${confidence}%)`);
        return Response.json({
          success: true,
          email,
          score: confidence,
          source: 'pattern_constructed'
        });
      }
    }

    // Fallback: domain search
    const domainUrl = `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(cleanDomain)}&limit=100&api_key=${HUNTER_API_KEY}`;
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
      // Try exact name match using cleaned name
      const fullName = cleanedName.toLowerCase();
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