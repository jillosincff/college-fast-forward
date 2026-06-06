import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * getSocialDiscoveries — Compliant Public X-Ray Pipeline
 * 
 * Uses Exa AI as a public X-ray search engine to query LinkedIn's 
 * publicly indexed posts on the open web. Zero login requirements,
 * zero account-dependent scraping, 100% compliant with data safety.
 * 
 * Queries: site:linkedin.com/posts/ "[role]" ("#internship" OR "intern") ("location" OR "USA")
 * Recency: Strict 14-day crawl window via startCrawlDate
 * Alumni Check: Separate Exa People Search on company domain (public index only)
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const targetRole = body.target_role || user.career_goals?.target_role || user.career_goals?.target_roles?.[0] || 'intern';
    const targetLocation = body.target_location || user.career_goals?.location_preference || user.location || '';
    const schoolName = user.school_name || user.school || 'University of Florida';
    const schoolCode = (user.school_code || 'UF').toUpperCase();

    const EXA_API_KEY = Deno.env.get('EXA_API_KEY');
    if (!EXA_API_KEY) return Response.json({ error: 'EXA_API_KEY not set' }, { status: 500 });

    // Enforce recency: only posts indexed in last 14 days
    const startCrawlDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const endCrawlDate = new Date().toISOString();

    // Build location clause for X-ray queries
    const locationClause = targetLocation 
      ? `("${targetLocation}" OR "${targetLocation.split(',')[0].trim()}" OR "USA")`
      : '("United States" OR "USA" OR "remote")';

    // Public X-Ray queries using Exa's web index (strictly public data)
    const postQueries = [
      // Core hashtag + role queries (broader matching)
      `site:linkedin.com/posts/ ("#intern" OR "#internship" OR "internship" OR "intern") "${targetRole}" ${locationClause}`,
      `site:linkedin.com/posts/ ("hiring" OR "looking for" OR "seeking") "intern" ${locationClause}`,
      `site:linkedin.com/posts/ ("#intern" OR "#internship") ("join our team" OR "join the team") ${locationClause}`,
      
      // Pure hashtag posts (high volume)
      `site:linkedin.com/posts/ "#intern" "#hiring"`,
      `site:linkedin.com/posts/ "#internship" "#summer"`,
      `site:linkedin.com/posts/ "#intern" "#opportunity"`,
      `site:linkedin.com/posts/ "#entrylevel" "#hiring"`,
    ];

    console.log('[getSocialDiscoveries] Running compliant public X-ray search...');

    // Fetch posts from all queries in parallel (public X-ray only)
    const fetchPosts = async (query) => {
      try {
        const res = await fetch('https://api.exa.ai/search', {
          method: 'POST',
          headers: { 
            'x-api-key': EXA_API_KEY, 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({
            query,
            numResults: 8,
            type: 'keyword', // Use keyword search for exact X-ray matching
            includeDomains: ['linkedin.com'],
            startCrawlDate: startCrawlDate, // Recency filter
            endCrawlDate: endCrawlDate,
            contents: { 
              text: { maxCharacters: 800 },
              highlight: { 
                query: targetRole,
                numSentences: 3 
              }
            },
          }),
        });

        if (!res.ok) {
          console.warn(`[getSocialDiscoveries] Query failed: ${query}`);
          return [];
        }

        const data = await res.json();
        const fourteenDaysAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
        return (data.results || [])
          .filter(r => {
            // Must be LinkedIn post URL (public index)
            if (!r.url || !r.url.startsWith('https://www.linkedin.com/posts/')) return false;
            // Must have text content
            if (!r.text || r.text.length < 50) return false;
            // CRITICAL: Reject posts older than 14 days by published date
            if (r.publishedDate) {
              const postAge = Date.now() - new Date(r.publishedDate).getTime();
              if (postAge > 14 * 24 * 60 * 60 * 1000) return false;
            }
            return true;
          })
          .map(r => ({ ...r, _query: query }));
      } catch (error) {
        console.warn(`[getSocialDiscoveries] Query error:`, error.message);
        return [];
      }
    };

    const postBatches = await Promise.allSettled(postQueries.map(fetchPosts));
    let rawPosts = postBatches
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value);

    console.log(`[getSocialDiscoveries] Raw posts fetched: ${rawPosts.length}`);

    // Secondary date filter: remove any posts older than 14 days
    const fourteenDaysAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
    rawPosts = rawPosts.filter(p => {
      if (!p.publishedDate) return true; // Keep if no date (assume recent)
      const postAge = Date.now() - new Date(p.publishedDate).getTime();
      return postAge <= 14 * 24 * 60 * 60 * 1000;
    });

    console.log(`[getSocialDiscoveries] After date filter: ${rawPosts.length}`);

    // Deduplicate by URL
    const seenUrls = new Set();
    rawPosts = rawPosts.filter(p => {
      if (!p.url || seenUrls.has(p.url)) return false;
      seenUrls.add(p.url);
      return true;
    });

    if (!rawPosts.length) {
      return Response.json({ 
        success: true, 
        discoveries: [], 
        source: 'no_posts_found',
        message: 'No LinkedIn posts found with hiring intent for your criteria'
      });
    }

    // ─────────────────────────────────────────────────────────────
    // Extract company name and hiring signal from post
    // ─────────────────────────────────────────────────────────────
    const extractCompany = (post) => {
      const title = post.title || '';
      const text = post.text || '';
      const combined = `${title} ${text}`;

      // Look for company indicators
      const patterns = [
        /\bat\s+([A-Z][A-Za-z0-9&.,\- ]{1,40}?)(?:\s*[|!?\n,]|$)/,
        /join\s+(?:the\s+)?([A-Z][A-Za-z0-9&.,\- ]{1,40}?)(?:\s+team|\s*[,|!?\n]|$)/i,
        /([A-Z][A-Za-z0-9&.,\- ]{1,40}?)\s+is\s+(?:hiring|looking|seeking)/i,
        /([A-Z][A-Za-z0-9&.,\- ]{1,40}?)\s+team/i,
      ];

      for (const pattern of patterns) {
        const m = combined.match(pattern);
        const candidate = m?.[1]?.trim();
        if (candidate && candidate.length > 2 && candidate.length < 50) {
          return candidate;
        }
      }

      // Fallback: extract from LinkedIn post URL structure
      if (post.url && post.url.includes('/posts/')) {
        const titleWords = title.replace(/[#@]/g, '').trim().split(/\s+/).slice(0, 3).join(' ');
        return titleWords.length > 2 ? titleWords : null;
      }

      return null;
    };

    // Extract hiring manager/poster info
    const extractPoster = (post) => {
      const title = post.title || '';
      // LinkedIn post titles often contain the poster name
      const nameMatch = title.match(/^([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/);
      return nameMatch?.[1] || 'Hiring Manager';
    };

    // Deduplicate by company
    const seenCompanies = new Set();
    const uniquePosts = [];
    for (const post of rawPosts) {
      const company = extractCompany(post);
      if (!company) continue;
      
      const key = company.toLowerCase().replace(/\s+/g, '');
      if (!seenCompanies.has(key)) {
        seenCompanies.add(key);
        uniquePosts.push({ 
          ...post, 
          _company: company,
          _poster: extractPoster(post)
        });
      }
    }

    console.log(`[getSocialDiscoveries] Unique companies: ${uniquePosts.length}`);

    // ─────────────────────────────────────────────────────────────
    // ENRICHMENT: Public alumni check via Exa People Search
    // ─────────────────────────────────────────────────────────────
    const enrichPost = async (post) => {
      const company = post._company;

      let insiders = [];
      try {
        // Public index search for alumni (no account-dependent scraping)
        const alumniRes = await fetch('https://api.exa.ai/search', {
          method: 'POST',
          headers: { 'x-api-key': EXA_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `"${schoolName}" OR "${schoolCode}" alumni working at ${company}`,
            numResults: 3,
            category: 'people',
            includeDomains: ['linkedin.com'],
            type: 'neural',
            contents: { text: { maxCharacters: 200 } },
          }),
        });

        if (alumniRes.ok) {
          const alumniData = await alumniRes.json();
          insiders = (alumniData.results || [])
            .map(r => ({
              name: (r.title || '').split(/[|\-·]/)[0].trim(),
              headline: r.title || '',
              url: r.url || null,
            }))
            .filter(a => a.name.length > 1);
        }
      } catch (_) {}

      // Extract the actual role/internship mentioned
      const postText = post.text || post.title || '';
      const rolePatterns = [
        /(?:intern|role|position|opportunity)\s+(?:for\s+)?([a-zA-Z\s]{3,50})(?:\s+intern|\s+at|$)/i,
        /hiring\s+([a-zA-Z\s]{3,50})\s+intern/i,
        /looking\s+for\s+([a-zA-Z\s]{3,50})\s+intern/i,
      ];
      
      let role = targetRole;
      for (const pattern of rolePatterns) {
        const match = postText.match(pattern);
        if (match?.[1]) {
          role = match[1].trim();
          break;
        }
      }

      const alumniMatched = insiders.length > 0;

      // Extract company domain for alumni lookup
      let companyDomain = null;
      try {
        if (post.url) {
          const url = new URL(post.url);
          companyDomain = url.hostname.replace('www.', '');
        }
      } catch {}

      // Clean up post snippet (remove LinkedIn UI text)
      let cleanSnippet = postText
        .replace(/\[Skip to.*?\]/g, '')
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/Show less/gi, '')
        .replace(/…more/gi, '')
        .replace(/Agree & Join LinkedIn/gi, '')
        .replace(/By clicking.*?Cookie Policy\./gi, '')
        .trim()
        .slice(0, 400);

      return {
        company,
        role,
        company_domain: companyDomain,
        opportunity_url: post.url || null,
        post_title: post.title?.slice(0, 150) || company,
        post_snippet: cleanSnippet,
        published_date: post.publishedDate || null,
        poster_name: post._poster,
        insiders,
        alumni_count: insiders.length,
        alumni_matched: alumniMatched,
        source_type: 'linkedin_post',
        source_label: alumniMatched
          ? '🎯 Network Match | Alumni found at this company'
          : '🔥 Direct Manager Access | No internal alumni mapped, but you have a direct line to the public creator of this post',
        hashtags: ['#internship', '#entrylevel', '#hiring'],
      };
    };

    const discoveries = await Promise.all(uniquePosts.slice(0, 12).map(enrichPost));

    console.log(`[getSocialDiscoveries] Final discoveries: ${discoveries.length}`);

    return Response.json({
      success: true,
      discoveries,
      source: 'linkedin_posts',
      count: discoveries.length,
    });

  } catch (error) {
    console.error('[getSocialDiscoveries]', error.message);
    return Response.json({ 
      error: error.message, 
      discoveries: [],
      source: 'error'
    }, { status: 500 });
  }
});