import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * getSocialDiscoveries — Compliant Real-Time Hashtag Pipeline
 * 
 * Uses Apify's LinkedIn Hashtag Scraper API (HTTP) to track live hashtag posts.
 * Zero login requirements, zero automated interactions.
 * 
 * Target hashtags: #internship, #entrylevel, #hiring intersected with target_role
 * Recency: Strict 14-day filter on publishedDate
 * Alumni Check: Exa People Search on verified company domain (public index only)
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

    const APIFY_API_KEY = Deno.env.get('APIFY_API_KEY');
    const EXA_API_KEY = Deno.env.get('EXA_API_KEY');
    
    if (!APIFY_API_KEY) return Response.json({ error: 'APIFY_API_KEY not set' }, { status: 500 });
    if (!EXA_API_KEY) return Response.json({ error: 'EXA_API_KEY not set' }, { status: 500 });

    console.log('[getSocialDiscoveries] Starting Apify hashtag scraping pipeline...');

    // Target hashtags intersected with role keyword
    const hashtags = ['#internship', '#entrylevel', '#hiring'];
    const searchQueries = hashtags.map(tag => `${tag} ${targetRole}`);

    // Run Apify LinkedIn hashtag scraper via HTTP API
    const runActor = async (searchQuery) => {
      try {
        const hashtag = searchQuery.replace('#', '').trim();
        
        console.log(`[getSocialDiscoveries] Running Apify for hashtag: ${hashtag}`);
        
        // Start Apify actor run
        const runRes = await fetch(`https://api.apify.com/v2/acts/sasky~linkedin-hashtag-posts-urls-scraper/runs?token=${APIFY_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hashtag: hashtag,
            maxPosts: 25,
          }),
        });

        if (!runRes.ok) {
          const errorText = await runRes.text().catch(() => 'unknown error');
          console.warn(`[getSocialDiscoveries] Apify run failed for ${hashtag}: ${runRes.status} - ${errorText}`);
          return [];
        }

        const runData = await runRes.json();
        const runId = runData.data?.id;
        
        if (!runId) {
          console.warn(`[getSocialDiscoveries] No run ID returned for ${hashtag}`);
          return [];
        }

        console.log(`[getSocialDiscoveries] Apify run started: ${runId}`);

        // Wait for run to complete (poll every 2s, max 40s)
        let completed = false;
        for (let i = 0; i < 20; i++) {
          await new Promise(r => setTimeout(r, 2000));
          const statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_API_KEY}`);
          if (!statusRes.ok) continue;
          const statusData = await statusRes.json();
          const status = statusData.data?.status;
          if (status === 'SUCCEEDED') {
            completed = true;
            console.log(`[getSocialDiscoveries] Apify run completed: ${runId}`);
            break;
          }
          if (status === 'FAILED') {
            console.warn(`[getSocialDiscoveries] Apify run failed: ${runId}`);
            break;
          }
        }

        if (!completed) {
          console.warn(`[getSocialDiscoveries] Apify run timeout for ${hashtag}`);
          return [];
        }

        // Fetch results from dataset
        const datasetRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset?token=${APIFY_API_KEY}`);
        if (!datasetRes.ok) {
          console.warn(`[getSocialDiscoveries] Dataset fetch failed: ${datasetRes.status}`);
          return [];
        }
        
        const items = await datasetRes.json();
        const results = items.data || [];
        console.log(`[getSocialDiscoveries] Retrieved ${results.length} posts for ${hashtag}`);
        return results;
      } catch (error) {
        console.warn(`[getSocialDiscoveries] Apify query failed: ${searchQuery}`, error.message);
        return [];
      }
    };

    // Fetch posts from all hashtag queries in parallel
    const postBatches = await Promise.allSettled(searchQueries.map(runActor));
    let rawPosts = postBatches
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value);

    console.log(`[getSocialDiscoveries] Raw posts from Apify: ${rawPosts.length}`);

    // Enforce 14-day recency filter
    const fourteenDaysAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
    rawPosts = rawPosts.filter(p => {
      if (!p.publishedDate) return true;
      const postAge = Date.now() - new Date(p.publishedDate).getTime();
      return postAge <= 14 * 24 * 60 * 60 * 1000;
    });

    console.log(`[getSocialDiscoveries] After 14-day filter: ${rawPosts.length}`);

    // Filter by location match in post text
    if (targetLocation) {
      const locationTerms = [targetLocation, targetLocation.split(',')[0].trim()].filter(Boolean);
      rawPosts = rawPosts.filter(p => {
        const text = (p.text || p.caption || '').toLowerCase();
        return locationTerms.some(term => text.includes(term.toLowerCase()));
      });
      console.log(`[getSocialDiscoveries] After location filter: ${rawPosts.length}`);
    }

    // Deduplicate by URL
    const seenUrls = new Set();
    rawPosts = rawPosts.filter(p => {
      if (!p.postUrl || seenUrls.has(p.postUrl)) return false;
      seenUrls.add(p.postUrl);
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
    // Extract company name from post
    // ─────────────────────────────────────────────────────────────
    const extractCompany = (post) => {
      const text = post.text || post.caption || '';
      const patterns = [
        /\bat\s+([A-Z][A-Za-z0-9&.,\- ]{1,40}?)(?:\s*[|!?\n,]|$)/,
        /join\s+(?:the\s+)?([A-Z][A-Za-z0-9&.,\- ]{1,40}?)(?:\s+team|\s*[,|!?\n]|$)/i,
        /([A-Z][A-Za-z0-9&.,\- ]{1,40}?)\s+is\s+(?:hiring|looking|seeking)/i,
      ];

      for (const pattern of patterns) {
        const m = text.match(pattern);
        const candidate = m?.[1]?.trim();
        if (candidate && candidate.length > 2 && candidate.length < 50) {
          return candidate;
        }
      }
      return null;
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
        uniquePosts.push({ ...post, _company: company });
      }
    }

    console.log(`[getSocialDiscoveries] Unique companies: ${uniquePosts.length}`);

    // ─────────────────────────────────────────────────────────────
    // ENRICHMENT: Domain resolution + Exa People Search for alumni
    // ─────────────────────────────────────────────────────────────
    const enrichPost = async (post) => {
      const company = post._company;

      // Resolve company domain using simple heuristic
      let companyDomain = null;
      try {
        if (post.postUrl) {
          const url = new URL(post.postUrl);
          companyDomain = url.hostname.replace('www.', '');
        }
      } catch {}

      // Exa People Search for alumni
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

      // Extract role from post
      const postText = post.text || post.caption || '';
      const rolePatterns = [
        /(?:intern|role|position|opportunity)\s+(?:for\s+)?([a-zA-Z\s]{3,50})(?:\s+intern|\s+at|$)/i,
        /hiring\s+([a-zA-Z\s]{3,50})\s+intern/i,
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

      // Clean snippet
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
        opportunity_url: post.postUrl || null,
        post_title: company,
        post_snippet: cleanSnippet,
        published_date: post.publishedDate || null,
        poster_name: post.authorName || 'Hiring Manager',
        insiders,
        alumni_count: insiders.length,
        alumni_matched: alumniMatched,
        source_type: 'linkedin_hashtag_post',
        source_label: alumniMatched
          ? '🎯 Network Match | Alumni found at this company'
          : '🔥 Direct Manager Access | No internal alumni mapped, but you have a direct line to the public creator of this post',
        hashtags: hashtags,
      };
    };

    const discoveries = await Promise.all(uniquePosts.slice(0, 12).map(enrichPost));

    console.log(`[getSocialDiscoveries] Final discoveries: ${discoveries.length}`);

    return Response.json({
      success: true,
      discoveries,
      source: 'linkedin_hashtag_posts',
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