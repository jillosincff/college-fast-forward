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

    // Step 2: Extract company name from each post title/text — lenient, never blocks
    const extractCompany = (post) => {
      const title = post.title || '';
      const text = post.text || '';
      const combined = `${title} ${text}`;

      // Try title patterns first (most reliable)
      const patterns = [
        /\bat\s+([A-Z][A-Za-z0-9&.,\- ]{1,40}?)(?:\s*[|!?\n]|$)/,
        /join\s+(?:the\s+)?([A-Z][A-Za-z0-9&.,\- ]{1,40}?)(?:\s+team|\s*[,|!?\n]|$)/i,
        /([A-Z][A-Za-z0-9&.,\- ]{1,40}?)\s+is\s+hiring/i,
        /([A-Z][A-Za-z0-9&.,\- ]{1,40}?)\s+(?:is\s+)?looking\s+for/i,
        /^([A-Z][A-Za-z0-9&.,\- ]{1,40}?)[\s|·\-]/,
      ];

      for (const pattern of patterns) {
        const m = combined.match(pattern);
        const candidate = m?.[1]?.trim();
        if (candidate && candidate.length > 2 && candidate.length < 50) return candidate;
      }

      // Fallback: use the author/profile name extracted from LinkedIn URL slug
      if (post.url) {
        try {
          const urlSlug = new URL(post.url).pathname.split('/').filter(Boolean).pop() || '';
          if (urlSlug && urlSlug.length > 2) {
            return urlSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).slice(0, 40);
          }
        } catch {}
      }

      // Last resort: use first meaningful words from title
      const titleWords = title.replace(/[#@]/g, '').trim().split(/\s+/).slice(0, 4).join(' ');
      return titleWords.length > 2 ? titleWords : 'Unknown Company';
    };

    // Step 3: Process all posts in parallel — alumni lookup is a ranking signal, never a filter
    const processPost = async (post) => {
      const company = extractCompany(post);

      // Alumni lookup — runs in parallel with other posts, times out gracefully
      let insiders = [];
      try {
        const alumniQuery = `${schoolCode} alumni OR "${schoolName}" graduate working at ${company}`;
        const alumniRes = await fetch('https://api.exa.ai/search', {
          method: 'POST',
          headers: { 'x-api-key': EXA_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: alumniQuery,
            numResults: 3,
            includeDomains: ['linkedin.com'],
            type: 'neural',
            contents: { text: { maxCharacters: 200 } },
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
        // Alumni lookup failure never blocks the card from appearing
      }

      const roleMatch = (post.title || '').match(/(?:hiring|role|position|opening)[:\s]+([^|.\n]{3,60})/i);
      const role = roleMatch?.[1]?.trim() || targetRole || 'Open Role';
      const alumniMatched = insiders.length > 0;

      return {
        company,
        role,
        company_domain: null,
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
      };
    };

    const discoveries = await Promise.all(rawPosts.slice(0, 8).map(processPost));

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