import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * getSocialDiscoveries — Trending LinkedIn hashtag feed
 *
 * Returns recent (last 14 days) LinkedIn posts containing the
 * intent-appropriate hashtags from the user's target city. Uses Exa's
 * public LinkedIn index. Intentionally simple: no role/company extraction,
 * no alumni lookup, no body-text keyword filtering — just hashtag + city
 * + recency.
 *
 * Hashtag set picks itself based on the user's seeking / job_type:
 *   - Internship seeker → #internship / #interns / #hiringinterns / #summerinterns
 *   - Full-time seeker  → #entrylevel / #entryleveljobs
 *   - Both / unset      → union of the two sets
 *
 * #hiring is intentionally excluded — it pulls in too many senior-level roles.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const targetLocation = body.target_location
      || user.career_goals?.location_preference
      || user.location
      || '';

    // What's the user actually looking for? Accept any of the
    // historical field names; tolerate both 'fulltime' (onboarding) and
    // 'full_time' (Goals tab) shapes.
    const rawSeeking = (body.target_seeking
      || user.career_goals?.job_type
      || user.career_goals?.seeking
      || ''
    ).toLowerCase().trim();
    const isIntern = /intern/.test(rawSeeking);
    const isFulltime = /full[_-]?time|new[_-]?grad|entry[_-]?level/.test(rawSeeking);
    const isBoth = rawSeeking === 'both' || (!isIntern && !isFulltime);

    const INTERN_HASHTAGS = ['#internship', '#interns', '#hiringinterns', '#summerinterns'];
    const FULLTIME_HASHTAGS = ['#entrylevel', '#entryleveljobs'];
    const activeHashtags = isBoth
      ? [...INTERN_HASHTAGS, ...FULLTIME_HASHTAGS]
      : isIntern
        ? INTERN_HASHTAGS
        : FULLTIME_HASHTAGS;

    const EXA_API_KEY = Deno.env.get('EXA_API_KEY');
    if (!EXA_API_KEY) return Response.json({ error: 'EXA_API_KEY not set' }, { status: 500 });

    console.log(`[getSocialDiscoveries] Seeking="${rawSeeking}", hashtags=${activeHashtags.join(',')}`);

    // Just the hashtags + the user's city portion. No role phrase, no
    // hardcoded city fallback, no body keyword requirements.
    const cityOnly = targetLocation.split(',')[0].trim(); // "New York, NY" → "New York"
    const cityPart = cityOnly ? ` "${cityOnly}"` : '';
    const hashtagPart = '(' + activeHashtags.map(h => `"${h}"`).join(' OR ') + ')';
    const query = `${hashtagPart}${cityPart}`;
    console.log(`[getSocialDiscoveries] Query: ${query}`);

    // 14-day window enforced at the source on the post's publish date.
    const startPublishedDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

    // Keep only LinkedIn social-content URLs. Rejects /jobs/, /in/, /company/.
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

    let postResults = [];
    try {
      const exaRes = await fetch('https://api.exa.ai/search', {
        method: 'POST',
        headers: { 'x-api-key': EXA_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          numResults: 100,
          includeDomains: ['linkedin.com'],
          startPublishedDate,
          type: 'auto',
          contents: { text: { maxCharacters: 800 } },
        }),
      });

      if (exaRes.ok) {
        const exaData = await exaRes.json();
        const allResults = exaData.results || [];
        console.log(`[getSocialDiscoveries] Sample Exa URLs:`, allResults.slice(0, 5).map(r => r.url).join(' | '));
        postResults = allResults.filter(r => isPostUrl(r.url));
        console.log(`[getSocialDiscoveries] Kept ${postResults.length} LinkedIn posts (from ${allResults.length} total)`);
      } else {
        const errText = await exaRes.text().catch(() => 'unknown error');
        console.warn(`[getSocialDiscoveries] Exa returned ${exaRes.status}: ${errText.slice(0, 200)}`);
      }
    } catch (exaError) {
      console.warn('[getSocialDiscoveries] Exa search failed:', exaError.message);
    }

    // Deduplicate by URL.
    const seenUrls = new Set();
    postResults = postResults.filter(r => {
      if (!r.url || seenUrls.has(r.url)) return false;
      seenUrls.add(r.url);
      return true;
    });

    if (!postResults.length) {
      return Response.json({
        success: true,
        discoveries: [],
        source: 'no_posts_found',
        message: 'No recent LinkedIn hashtag posts found for your location',
      });
    }

    // Pull the author from Exa's title field — LinkedIn pages typically
    // present as "Author Name on LinkedIn: <first line>" or "Author Name's Post".
    const extractAuthor = (r) => {
      const t = (r.title || '').trim();
      if (t) {
        const onLi = t.match(/^(.+?)\s+on\s+LinkedIn[:|]/i);
        if (onLi) return onLi[1].trim();
        const possessive = t.match(/^(.+?)['’]s\s+Post/i);
        if (possessive) return possessive[1].trim();
        const byMatch = t.match(/^Post\s+by\s+(.+)$/i);
        if (byMatch) return byMatch[1].trim();
      }
      return r.author || 'LinkedIn user';
    };

    // Show the first hashtag in the post body; fall back to the first
    // active hashtag (matches the user's intent — intern vs full-time).
    const fallbackHashtag = activeHashtags[0] || '#internship';
    const findHashtag = (text) => {
      const m = (text || '').match(/#\w+/);
      return m ? m[0] : fallbackHashtag;
    };

    const cleanSnippet = (text) => (text || '')
      .replace(/\[Skip to.*?\]/g, '')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/Show less/gi, '')
      .replace(/…more/gi, '')
      .trim()
      .slice(0, 400);

    const discoveries = postResults.slice(0, 12).map(r => {
      const text = r.text || '';
      const author = extractAuthor(r);
      const hashtag = findHashtag(text);
      return {
        // Card fields — author becomes the headline in the orange
        // "Direct Manager Access" tier of SocialDiscoveryCard.
        company: author,
        role: hashtag,
        company_domain: null,
        opportunity_url: r.url,
        post_title: author,
        post_snippet: cleanSnippet(text),
        published_date: r.publishedDate || null,
        poster_name: author,
        insiders: [],
        alumni_count: 0,
        alumni_matched: false,
        source_type: 'linkedin_hashtag',
        source_label: '🏷️ Trending LinkedIn Hashtag',
        hashtags: activeHashtags,
      };
    });

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
      source: 'error',
    }, { status: 500 });
  }
});
