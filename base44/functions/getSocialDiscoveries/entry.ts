import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * getSocialDiscoveries — Compliant Real-Time LinkedIn Pipeline
 *
 * Exa semantic search over LinkedIn's public index.
 * - 14-day recency enforced at the source via Exa startPublishedDate
 * - Public People Search for alumni mapping (public index only)
 * - No account-dependent scraping, no automated browser, no LinkedIn API
 *
 * The earlier Apify hashtag-URL fallback was removed: it returned URLs
 * only (no post bodies), so the downstream keyword + company-extraction
 * filters wiped every Apify result. The architecture is also out of
 * scope of the compliant-public-data design doc.
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

    console.log('[getSocialDiscoveries] Starting social discoveries pipeline...');

    let rawPosts = [];

    // Exa semantic search over LinkedIn's public index.
    console.log('[getSocialDiscoveries] Querying Exa for LinkedIn posts...');

    // Build the query without hardcoding a city. The user's own location
    // (if any) is the only city we should bias on. We rely on includeDomains
    // for the LinkedIn restriction and the URL allowlist below for the post
    // restriction — adding a Google-style site: operator confused Exa's
    // neural search and zeroed out results.
    const locationQuery = targetLocation ? `"${targetLocation}"` : '';
    const hashtagPhrase = '("#internship" OR "#hiringinterns" OR "#entryleveljob" OR "#hiring")';
    const rolePhrase = `("${targetRole} intern" OR "${targetRole} internship" OR "hiring ${targetRole}" OR "${targetRole} summer intern" OR "${targetRole} new grad")`;
    const query = locationQuery
      ? `${rolePhrase} ${hashtagPhrase} ${locationQuery}`
      : `${rolePhrase} ${hashtagPhrase}`;
    console.log(`[getSocialDiscoveries] Query: ${query}`);

    // Push the 14-day window down to Exa so we don't burn results on stale posts.
    // IMPORTANT: use startPublishedDate, not startCrawlDate — Exa's crawlDate is
    // when Exa fetched the page, which can be days after the post was actually
    // written; startPublishedDate is the post's own date. Using crawlDate let
    // through old posts that happened to be re-crawled recently (14→1 attrition
    // in the post-fetch filter; see logs from previous deploy).
    const startPublishedDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

    // URL allowlist — keep only social-content URLs. Rejects /jobs/ (the
    // "no longer accepting applications" listings that were leaking through),
    // /in/ (profiles), /company/ (company pages). Accepts /posts/ and
    // /feed/update/ (actual posts) plus /pulse/ (LinkedIn articles —
    // hiring managers sometimes use these for announcements).
    const isPostUrl = (url) => {
      if (!url) return false;
      try {
        const u = new URL(url);
        if (!u.hostname.endsWith('linkedin.com')) return false;
        return /^\/(posts|feed\/update|pulse)\//i.test(u.pathname);
      } catch {
        return false;
      }
    };

    try {
      const exaRes = await fetch('https://api.exa.ai/search', {
        method: 'POST',
        headers: { 'x-api-key': EXA_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          numResults: 100,
          includeDomains: ['linkedin.com'],
          startPublishedDate,
          type: 'neural',
          contents: { text: { maxCharacters: 800 } },
        }),
      });

      if (exaRes.ok) {
        const exaData = await exaRes.json();
        const allResults = exaData.results || [];
        // Sample what Exa returned so we can see the URL shapes we're working with.
        console.log(`[getSocialDiscoveries] Sample Exa URLs:`, allResults.slice(0, 5).map(r => r.url).join(' | '));

        const postResults = allResults.filter(r => isPostUrl(r.url));
        const dropped = allResults.filter(r => !isPostUrl(r.url));
        if (dropped.length) {
          console.log(`[getSocialDiscoveries] Dropped ${dropped.length} non-post URLs. Sample:`, dropped.slice(0, 5).map(r => r.url).join(' | '));
        }

        rawPosts = postResults.map(r => ({
          text: r.text || r.title || '',
          postUrl: r.url,
          publishedDate: r.publishedDate || r.crawlDate || null,
          authorName: r.author || 'Hiring Manager',
          caption: r.text || r.title || '',
        }));
        console.log(`[getSocialDiscoveries] Exa returned ${rawPosts.length} LinkedIn posts (from ${allResults.length} total results)`);
      } else {
        const errText = await exaRes.text().catch(() => 'unknown error');
        console.warn(`[getSocialDiscoveries] Exa returned ${exaRes.status}: ${errText.slice(0, 200)}`);
      }
    } catch (exaError) {
      console.warn('[getSocialDiscoveries] Exa search failed:', exaError.message);
    }

    console.log(`[getSocialDiscoveries] Total raw posts: ${rawPosts.length}`);

    // Enforce 14-day recency filter (defense-in-depth: Exa's startPublishedDate
    // already handles this at the source, but some results lack a date).
    rawPosts = rawPosts.filter(p => {
      if (!p.publishedDate) return true;
      const postAge = Date.now() - new Date(p.publishedDate).getTime();
      return postAge <= 14 * 24 * 60 * 60 * 1000;
    });

    console.log(`[getSocialDiscoveries] After 14-day filter: ${rawPosts.length}`);

    // Filter: must contain internship/hiring keywords in text.
    const internshipKeywords = ['intern', 'internship', 'hiring', 'joining', 'excited to announce', 'summer 2026', 'fall 2026'];
    const beforeKeyword = rawPosts.length;
    rawPosts = rawPosts.filter(p => {
      const text = (p.text || p.caption || '').toLowerCase();
      return internshipKeywords.some(keyword => text.includes(keyword));
    });
    console.log(`[getSocialDiscoveries] After keyword filter: ${rawPosts.length} (was ${beforeKeyword})`);
    if (rawPosts[0]) {
      console.log(`[getSocialDiscoveries] First surviving post text:`, (rawPosts[0].text || '').slice(0, 200));
    }

    // Location filter — only reject posts that explicitly name a DIFFERENT
    // identifiable city. Posts with no city mention (e.g. "we're hiring
    // marketing interns") are location-neutral and pass through. Mirrors
    // the carousel's passesLocation pattern so a Toronto post can be
    // correctly rejected for an NY user while still keeping any post
    // that doesn't tip its hand on location.
    if (targetLocation) {
      const fullLoc = targetLocation.trim().toLowerCase();
      const cityOnly = targetLocation.split(',')[0].trim().toLowerCase();

      // Common aliases for major US cities (extend as needed).
      const CITY_ALIASES = {
        'new york': ['new york', 'new york, ny', 'new york city', 'nyc', 'manhattan', 'brooklyn', 'queens', 'bronx'],
        'san francisco': ['san francisco', 'san francisco, ca', 'sf', 'sf bay area', 'bay area'],
        'los angeles': ['los angeles', 'los angeles, ca', 'la,', 'l.a.'],
        'washington': ['washington', 'washington, dc', 'washington dc', 'dc,'],
      };
      const userAliases = CITY_ALIASES[cityOnly] || [fullLoc, cityOnly].filter(Boolean);

      // Cities we recognize as "a specific other place." Posts mentioning one
      // of these (and NOT the user's city) get rejected. Anything not on this
      // list is treated as ambiguous → keep.
      const KNOWN_CITIES = [
        'new york', 'new york, ny', 'nyc', 'manhattan', 'brooklyn',
        'san francisco', 'san francisco, ca', 'sf bay area',
        'los angeles', 'la,', 'seattle', 'chicago', 'boston', 'austin',
        'atlanta', 'miami', 'denver', 'dallas', 'houston', 'phoenix',
        'philadelphia', 'pittsburgh', 'charlotte', 'nashville', 'portland',
        'san diego', 'minneapolis', 'orlando', 'tampa', 'gainesville',
        'cincinnati', 'cleveland', 'detroit', 'washington, dc', 'washington dc',
        'mountain view', 'menlo park', 'cupertino', 'palo alto', 'redmond',
        // International — common rejection targets for US-based searches
        'toronto', 'vancouver', 'montreal', 'london', 'dublin', 'berlin',
        'amsterdam', 'paris', 'tokyo', 'singapore', 'sydney', 'tel aviv',
      ];

      const beforeCount = rawPosts.length;
      rawPosts = rawPosts.filter(p => {
        const text = (p.text || p.caption || '').toLowerCase();
        // KEEP if post mentions any user-city alias.
        if (userAliases.some(a => text.includes(a))) return true;
        // REJECT if post mentions a different identifiable city.
        if (KNOWN_CITIES.some(c => !userAliases.includes(c) && text.includes(c))) return false;
        // Otherwise location-neutral — keep.
        return true;
      });
      console.log(`[getSocialDiscoveries] After location filter: ${rawPosts.length} (was ${beforeCount})`);
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

    // Extract company name from post
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

    // ENRICHMENT: Domain resolution + Exa People Search for alumni
    const enrichPost = async (post) => {
      const company = post._company;

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