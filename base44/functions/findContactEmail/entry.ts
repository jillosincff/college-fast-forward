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
      return Response.json({ success: false, error: 'Email not found', fallback: 'linkedin_only' });
    }

    // Sanitize name
    const credentialsRegex = /\b(MBA|PhD|Ph\.D|MD|JD|CPA|CFA|MS|BSc|BA|MA|Esq|Jr|Sr|II|III|IV)\b\.?/gi;
    const cleanedName = contactName
      .replace(credentialsRegex, '')
      .replace(/[^a-zA-Z\s'-]/g, '')
      .replace(/\b[A-Z]\.\s*/g, '')
      .trim();
    const nameParts = cleanedName.split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

    // Sanitize domain
    const cleanDomain = companyDomain
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .split('/')[0]
      .toLowerCase()
      .trim();

    console.log(`Looking up: "${firstName} ${lastName}" at "${cleanDomain}"`);

    // Hunter Email Finder
    try {
      const hRes = await fetch(
        `https://api.hunter.io/v2/email-finder?domain=${encodeURIComponent(cleanDomain)}&first_name=${encodeURIComponent(firstName)}&last_name=${encodeURIComponent(lastName)}&api_key=${HUNTER_API_KEY}`
      );
      const hText = await hRes.text();
      let hData;
      try { hData = JSON.parse(hText); } catch { hData = null; }

      if (hData) {
        console.log('Hunter finder response:', JSON.stringify(hData).slice(0, 300));

        if (hData.data && hData.data.email) {
          return Response.json({ success: true, email: hData.data.email, score: hData.data.score || 0, source: 'hunter' });
        }

        // Pattern-based fallback
        if (hData.data && hData.data.pattern && firstName && lastName && (hData.data.score || 0) >= 70) {
          const pattern = hData.data.pattern;
          const f = firstName.toLowerCase();
          const l = lastName.toLowerCase();
          const fi = f[0] || '';
          const li = l[0] || '';
          const constructed = pattern
            .replace('{first}', f).replace('{last}', l)
            .replace('{first_initial}', fi).replace('{last_initial}', li)
            .replace('{f}', fi).replace('{l}', li);
          return Response.json({ success: true, email: `${constructed}@${cleanDomain}`, score: hData.data.score, source: 'hunter_pattern' });
        }
      }
    } catch (err) {
      console.warn('Hunter email-finder failed:', err.message);
    }

    // Hunter domain search fallback
    try {
      const dRes = await fetch(
        `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(cleanDomain)}&limit=100&api_key=${HUNTER_API_KEY}`
      );
      const dText = await dRes.text();
      let dData;
      try { dData = JSON.parse(dText); } catch { dData = null; }

      if (dData && dData.data && dData.data.emails && dData.data.emails.length > 0) {
        console.log('Hunter domain emails count:', dData.data.emails.length);
        const fullName = cleanedName.toLowerCase();
        const exact = dData.data.emails.find(function(e) {
          return (e.first_name + ' ' + e.last_name).toLowerCase() === fullName;
        });
        if (exact) {
          return Response.json({ success: true, email: exact.value, score: exact.confidence || 0, source: 'hunter_domain' });
        }
        const firstMatch = dData.data.emails.find(function(e) {
          return e.first_name && e.first_name.toLowerCase() === firstName.toLowerCase();
        });
        if (firstMatch) {
          return Response.json({ success: true, email: firstMatch.value, score: firstMatch.confidence || 0, source: 'hunter_domain_firstname' });
        }
      }
    } catch (err) {
      console.warn('Hunter domain-search failed:', err.message);
    }

    // ── RocketReach fallback (allows external product use) ──────────────────
    const ROCKETREACH_API_KEY = Deno.env.get('ROCKETREACH_API_KEY');
    console.log('RocketReach API key present:', !!ROCKETREACH_API_KEY);
    if (ROCKETREACH_API_KEY) {
      try {
        console.log('RocketReach lookup:', firstName, lastName, 'at', cleanDomain);
        
        const rrUrl = 'https://api.rocketreach.co/api/v2/person/lookup';
        const params = new URLSearchParams();
        if (firstName && lastName) params.append('name', `${firstName} ${lastName}`);
        if (cleanDomain) params.append('current_employer', cleanDomain);
        
        const rrRes = await fetch(`${rrUrl}?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Api-Key': ROCKETREACH_API_KEY,
            'Accept': 'application/json'
          }
        });
        
        console.log('RocketReach HTTP status:', rrRes.status);
        const rrData = await rrRes.json();
        console.log('RocketReach response:', JSON.stringify(rrData).slice(0, 500));
        
        if (rrData.emails && rrData.emails.length > 0) {
          const bestEmail = rrData.emails.find((e: any) => e.grade === 'A' && e.type === 'professional') ||
                           rrData.emails.find((e: any) => e.grade === 'A') ||
                           rrData.emails[0];
          
          console.log('RocketReach found email:', bestEmail.email, 'grade:', bestEmail.grade);
          return Response.json({ 
            success: true, 
            email: bestEmail.email, 
            score: bestEmail.grade === 'A' ? 95 : 85, 
            source: 'rocketreach' 
          });
        }
        
        console.log('RocketReach: No emails found');
      } catch (err) {
        console.warn('RocketReach failed:', err.message);
      }
    }

    // ── All sources exhausted → LinkedIn fallback ──────────────────────────
    return Response.json({ success: false, error: 'Email not found', fallback: 'linkedin_only' });

  } catch (error) {
    console.error('Email enrichment error:', error);
    return Response.json({ success: false, error: error.message, fallback: 'linkedin_only' }, { status: 500 });
  }
});