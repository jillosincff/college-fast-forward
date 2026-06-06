import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * getSocialDiscoveries — LinkedIn Post Scraper
 * 
 * Scrapes LinkedIn posts (not job listings) where people mention:
 * - "looking for intern"
 * - "hiring intern"
 * - "#intern #summer"
 * - "join our team"
 * 
 * Uses Exa neural search optimized for social posts with hiring intent.
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

    // Build multiple query variations to catch different post styles
    const locationClause = targetLocation 
      ? `("${targetLocation}" OR "${targetLocation.split(',')[0]}" OR "NYC" OR "New York")`
      : '("United States" OR "remote" OR "NYC" OR "SF" OR "Boston")';

    const postQueries = [
      // Direct hiring posts
      `"looking for" intern ${targetRole} ${locationClause} site:linkedin.com/posts`,
      `"hiring" intern ${targetRole} ${locationClause} site:linkedin.com/posts`,
      `"seeking" intern ${targetRole} ${locationClause} site:linkedin.com/posts`,
      
      // Hashtag-heavy posts
      `#intern #summer ${targetRole} ${locationClause} site:linkedin.com/posts`,
      `#internship #entrylevel ${targetRole} ${locationClause} site:linkedin.com/posts`,
      `#hiring #intern ${locationClause} site:linkedin.com/posts`,
      
      // Team/join language
      `"join our team" intern ${locationClause} site:linkedin.com/posts`,
      `"join the team" ${targetRole} ${locationClause} site:linkedin.com/posts`,
      
      // Opportunity/role language
      `"opportunity for" intern ${targetRole} ${locationClause} site:linkedin.com/posts`,
      `"role for" intern ${targetRole} ${locationClause} site:linkedin.com/posts`,
    ];

    console.log('[getSocialDiscoveries] Fetching LinkedIn posts with hiring intent...');

    // Fetch posts from all queries in parallel
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
            numResults: 6,
            type: 'neural',
            contents: { 
              text: { maxCharacters: 800 },
              highlight: { 
                query: query.split('"')[1] || 'intern',
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
        return (data.results || [])
          .filter(r => {
            // Filter to only LinkedIn post URLs (not jobs, not profiles)
            if (!r.url || !r.url.includes('linkedin.com/posts')) return false;
            // Must have some text content
            if (!r.text || r.text.length < 50) return false;
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
    // ENRICHMENT: Check for alumni at each company
    // ─────────────────────────────────────────────────────────────
    const enrichPost = async (post) => {
      const company = post._company;

      let insiders = [];
      try {
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

      // Extract company domain
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
          : '🔥 Direct Post | Hiring manager posted about this opportunity',
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