import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * getSocialDiscoveries
 * Ingests hiring posts from LinkedIn via Exa (hashtag tracking),
 * domain-locks the company, then hydrates with school alumni via Exa People Search.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const targetRole = body.target_role || user.career_goals?.target_role || user.career_goals?.target_roles?.[0] || 'analyst';
    const targetIndustries = body.target_industries || user.career_goals?.target_industries || [];
    const targetLocation = body.target_location || user.career_goals?.location_preference || user.location || '';
    const schoolName = user.school_name || user.school || 'University of Florida';
    const schoolCode = (user.school_code || 'UF').toUpperCase();

    const EXA_API_KEY = Deno.env.get('EXA_API_KEY');
    if (!EXA_API_KEY) return Response.json({ error: 'EXA_API_KEY not set' }, { status: 500 });

    // Strict 14-day recency window
    const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

    // Build role search terms from target_role + industries
    const roleTerms = targetRole
      ? `"${targetRole}"`
      : targetIndustries.length
        ? `"${targetIndustries[0]} role"`
        : '"entry level role"';

    const locationFilter = targetLocation ? ` AND ("${targetLocation}" OR "United States" OR "USA")` : ' AND ("United States" OR "USA")';

    const query = `hiring for ${roleTerms} AND ("#internship" OR "intern" OR "#entrylevel" OR "entry level" OR "junior")${locationFilter}`;

    console.log(`[getSocialDiscoveries] Query: ${query}`);

    // Step 1: Fetch LinkedIn hiring posts via Exa
    const exaSearchRes = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: { 'x-api-key': EXA_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        numResults: 12,
        includeDomains: ['linkedin.com'],
        startCrawlDate: cutoff,
        type: 'neural',
        contents: { text: { maxCharacters: 800 } },
      }),
    });

    if (!exaSearchRes.ok) {
      const err = await exaSearchRes.text();
      console.error('[getSocialDiscoveries] Exa search failed:', err);
      return Response.json({ discoveries: [] });
    }

    const exaData = await exaSearchRes.json();
    const rawPosts = (exaData.results || []).filter(r => r.url && r.title);

    console.log(`[getSocialDiscoveries] Raw LinkedIn posts: ${rawPosts.length}`);

    if (!rawPosts.length) {
      return Response.json({ discoveries: [], source: 'linkedin_hashtag' });
    }

    // Step 2: Extract company name from each post title/text
    const extractCompany = (post) => {
      const text = `${post.title || ''} ${post.text || ''}`;
      // Common patterns: "at CompanyName", "join CompanyName", "CompanyName is hiring"
      const atMatch = text.match(/\bat\s+([A-Z][A-Za-z0-9& ]{2,30}?)(?:\s*[,.|!?\n]|$)/);
      const joinMatch = text.match(/join\s+([A-Z][A-Za-z0-9& ]{2,30}?)(?:\s*[,.|!?\n]|$)/);
      const hiringMatch = text.match(/([A-Z][A-Za-z0-9& ]{2,30}?)\s+is\s+hiring/i);
      const company = (atMatch?.[1] || joinMatch?.[1] || hiringMatch?.[1] || '').trim();
      return company.length > 2 ? company : null;
    };

    // Step 3: For each post with a detected company, domain-lock + alumni lookup
    const discoveries = [];
    const processedCompanies = new Set();

    for (const post of rawPosts.slice(0, 10)) {
      const company = extractCompany(post);
      if (!company || processedCompanies.has(company.toLowerCase())) continue;
      processedCompanies.add(company.toLowerCase());

      // Domain-lock: resolve exact corporate career domain
      let companyDomain = null;
      try {
        const domainQuery = `${company} official careers jobs site`;
        const domainRes = await fetch('https://api.exa.ai/search', {
          method: 'POST',
          headers: { 'x-api-key': EXA_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: domainQuery,
            numResults: 1,
            type: 'neural',
            contents: { text: { maxCharacters: 100 } },
          }),
        });
        if (domainRes.ok) {
          const domainData = await domainRes.json();
          const domainUrl = domainData.results?.[0]?.url || '';
          if (domainUrl) {
            try {
              const parsed = new URL(domainUrl);
              companyDomain = parsed.hostname.replace('www.', '');
            } catch {}
          }
        }
      } catch (e) {
        console.warn(`[getSocialDiscoveries] Domain lookup failed for ${company}: ${e.message}`);
      }

      // Alumni lookup via Exa People Search using domain-locked constraint
      let insiders = [];
      try {
        const alumniQuery = companyDomain
          ? `Professionals who graduated from ${schoolName} and currently work at ${companyDomain}`
          : `${schoolCode} alumni working at ${company}`;

        const alumniRes = await fetch('https://api.exa.ai/search', {
          method: 'POST',
          headers: { 'x-api-key': EXA_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: alumniQuery,
            numResults: 3,
            includeDomains: ['linkedin.com'],
            type: 'neural',
            contents: { text: { maxCharacters: 300 } },
          }),
        });
        if (alumniRes.ok) {
          const alumniData = await alumniRes.json();
          insiders = (alumniData.results || []).map(r => ({
            name: (r.title || '').split(/[|\-·]/)[0].trim(),
            headline: r.title || '',
            url: r.url || null,
          })).filter(a => a.name.length > 1);
        }
      } catch (e) {
        console.warn(`[getSocialDiscoveries] Alumni lookup failed for ${company}: ${e.message}`);
      }

      // Extract role from post text
      const roleMatch = (post.title || '').match(/(?:hiring|role|position|opening)[:\s]+([^|.\n]{3,60})/i);
      const role = roleMatch?.[1]?.trim() || targetRole || 'Open Role';

      // Alumni check is a RANKING factor, NOT a filter — always include the post
      const alumniMatched = insiders.length > 0;

      discoveries.push({
        company,
        role,
        company_domain: companyDomain,
        opportunity_url: post.url,
        post_title: post.title || '',
        post_snippet: (post.text || '').slice(0, 400),
        published_date: post.publishedDate || null,
        insiders,
        alumni_count: insiders.length,
        alumni_matched: alumniMatched,
        source_type: 'social_scout',
        source_label: alumniMatched
          ? '🎯 Network Match | Alumni found at this company'
          : '🔥 Direct Manager Access | Live hiring post — pitch the publisher directly',
        hashtags: ['#internship', '#entrylevel', '#hiring'],
      });
    }

    console.log(`[getSocialDiscoveries] Final discoveries: ${discoveries.length}`);

    return Response.json({
      success: true,
      discoveries,
      source: 'linkedin_hashtag',
      query_used: query,
    });

  } catch (error) {
    console.error('[getSocialDiscoveries]', error.message);
    return Response.json({ error: error.message, discoveries: [] }, { status: 500 });
  }
});