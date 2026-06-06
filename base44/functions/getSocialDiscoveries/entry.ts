import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * getSocialDiscoveries — Dual-Engine Pipeline
 *
 * INGESTION LAYER:  Proxycurl LinkedIn Posts API  → real-time, fresh hiring posts
 * ENRICHMENT LAYER: Exa AI (category: "people")   → alumni graph matching by company domain
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const targetRole = body.target_role || user.career_goals?.target_role || user.career_goals?.target_roles?.[0] || 'analyst';
    const targetLocation = body.target_location || user.career_goals?.location_preference || user.location || '';
    const schoolName = user.school_name || user.school || 'University of Florida';
    const schoolCode = (user.school_code || 'UF').toUpperCase();

    const PROXYCURL_KEY = Deno.env.get('PROXYCURL_API_KEY');
    const EXA_API_KEY = Deno.env.get('EXA_API_KEY');

    if (!PROXYCURL_KEY) return Response.json({ error: 'PROXYCURL_API_KEY not set' }, { status: 500 });
    if (!EXA_API_KEY) return Response.json({ error: 'EXA_API_KEY not set' }, { status: 500 });

    // ─────────────────────────────────────────────────────────────
    // LAYER 1: INGESTION — Proxycurl Live LinkedIn Post Search
    // Proxycurl's /linkedin/post/search endpoint returns real-time
    // posts by keyword, bypassing Exa's crawl-delay limitation.
    // ─────────────────────────────────────────────────────────────
    const keywords = [
      `hiring ${targetRole} internship`,
      `entry level ${targetRole} ${targetLocation}`,
      `#internship #entrylevel ${targetRole}`,
    ];

    // Try multiple keyword combos in parallel to maximize post volume
    const postFetchPromises = keywords.map(async (kw) => {
      const params = new URLSearchParams({
        keyword: kw,
        ...(targetLocation ? { geo_urn: '' } : {}), // geo enrichment optional
        sort_by: 'date',
        count: '10',
      });

      const res = await fetch(`https://nubela.co/proxycurl/api/v2/linkedin/post/search?${params}`, {
        headers: { Authorization: `Bearer ${PROXYCURL_KEY}` },
      });

      if (!res.ok) return [];
      const data = await res.json();
      return data.items || data.posts || [];
    });

    const postBatches = await Promise.allSettled(postFetchPromises);
    let rawPosts = postBatches
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value);

    console.log(`[getSocialDiscoveries] Proxycurl raw posts: ${rawPosts.length}`);

    // ─────────────────────────────────────────────────────────────
    // FALLBACK: If Proxycurl returns 0 posts (endpoint unavailable
    // or rate-limited), fall back to Exa for post ingestion.
    // This ensures the feed never goes dark.
    // ─────────────────────────────────────────────────────────────
    if (!rawPosts.length) {
      console.log('[getSocialDiscoveries] Proxycurl returned 0 — falling back to Exa ingestion');

      const locationFilter = targetLocation
        ? ` AND ("${targetLocation}" OR "United States")`
        : ' AND ("United States")';
      const query = `hiring "${targetRole}" ("#internship" OR "entry level" OR "intern" OR "junior")${locationFilter}`;

      const exaRes = await fetch('https://api.exa.ai/search', {
        method: 'POST',
        headers: { 'x-api-key': EXA_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          numResults: 12,
          includeDomains: ['linkedin.com'],
          type: 'neural',
          contents: { text: { maxCharacters: 800 } },
        }),
      });

      if (exaRes.ok) {
        const exaData = await exaRes.json();
        // Normalize Exa results to match the shape we expect below
        rawPosts = (exaData.results || [])
          .filter(r => r.url && r.title)
          .map(r => ({
            url: r.url,
            text: r.title || '',
            body: r.text || '',
            author_name: null,
            author_profile_url: null,
            published_at: r.publishedDate || null,
            _source: 'exa_fallback',
          }));
      }
      console.log(`[getSocialDiscoveries] Exa fallback posts: ${rawPosts.length}`);
    }

    if (!rawPosts.length) {
      return Response.json({ success: true, discoveries: [], source: 'no_results' });
    }

    // ─────────────────────────────────────────────────────────────
    // Extract company name from a post object
    // Proxycurl posts have richer structure; Exa fallback uses text
    // ─────────────────────────────────────────────────────────────
    const extractCompany = (post) => {
      // Proxycurl posts may have author_company or company fields
      if (post.company_name) return post.company_name;
      if (post.author_company) return post.author_company;

      const title = post.title || post.text || '';
      const body = post.body || post.snippet || '';
      const combined = `${title} ${body}`;

      const patterns = [
        /\bat\s+([A-Z][A-Za-z0-9&.,\- ]{1,40}?)(?:\s*[|!?\n,]|$)/,
        /join\s+(?:the\s+)?([A-Z][A-Za-z0-9&.,\- ]{1,40}?)(?:\s+team|\s*[,|!?\n]|$)/i,
        /([A-Z][A-Za-z0-9&.,\- ]{1,40}?)\s+is\s+hiring/i,
        /([A-Z][A-Za-z0-9&.,\- ]{1,40}?)\s+(?:is\s+)?looking\s+for/i,
      ];

      for (const pattern of patterns) {
        const m = combined.match(pattern);
        const candidate = m?.[1]?.trim();
        if (candidate && candidate.length > 2 && candidate.length < 50) return candidate;
      }

      // Fallback: parse LinkedIn company URL if available
      if (post.company_url || post.author_profile_url) {
        try {
          const slug = new URL(post.company_url || post.author_profile_url)
            .pathname.split('/').filter(Boolean).pop() || '';
          if (slug && slug.length > 2) {
            return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).slice(0, 40);
          }
        } catch {}
      }

      // Last resort: first words of title
      const titleWords = title.replace(/[#@]/g, '').trim().split(/\s+/).slice(0, 4).join(' ');
      return titleWords.length > 2 ? titleWords : null;
    };

    // Deduplicate by company name
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

    // ─────────────────────────────────────────────────────────────
    // LAYER 2: ENRICHMENT — Exa AI People Search (alumni matching)
    // For each unique company, query Exa's category:"people" index
    // with a domain-aware school alumni query.
    // ─────────────────────────────────────────────────────────────
    const enrichPost = async (post) => {
      const company = post._company;

      let insiders = [];
      try {
        // Use Exa's category: "people" for maximum profile coverage
        const alumniRes = await fetch('https://api.exa.ai/search', {
          method: 'POST',
          headers: { 'x-api-key': EXA_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `"${schoolName}" graduate OR "${schoolCode}" alumni working at ${company}`,
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
      } catch (_) {
        // Alumni failure never blocks the card
      }

      const postText = post.text || post.body || post.title || '';
      const roleMatch = postText.match(/(?:hiring|role|position|opening)[:\s]+([^|.\n]{3,60})/i);
      const role = roleMatch?.[1]?.trim() || targetRole || 'Open Role';
      const alumniMatched = insiders.length > 0;

      return {
        company,
        role,
        company_domain: post.company_url ? (() => {
          try { return new URL(post.company_url).hostname.replace('www.', ''); } catch { return null; }
        })() : null,
        opportunity_url: post.url || post.post_url || null,
        post_title: post.title || post.text?.slice(0, 100) || company,
        post_snippet: postText.slice(0, 400),
        published_date: post.published_at || post.publishedDate || null,
        author_name: post.author_name || null,
        author_profile_url: post.author_profile_url || null,
        insiders,
        alumni_count: insiders.length,
        alumni_matched: alumniMatched,
        source_type: 'social_scout',
        source: post._source === 'exa_fallback' ? 'exa_fallback' : 'proxycurl',
        source_label: alumniMatched
          ? '🎯 Network Match | Alumni found at this company'
          : '🔥 Direct Manager Access | Live hiring post — pitch the publisher directly',
        hashtags: ['#internship', '#entrylevel', '#hiring'],
      };
    };

    const discoveries = await Promise.all(uniquePosts.slice(0, 8).map(enrichPost));

    console.log(`[getSocialDiscoveries] Final discoveries: ${discoveries.length}`);

    return Response.json({
      success: true,
      discoveries,
      source: discoveries[0]?.source || 'unknown',
    });

  } catch (error) {
    console.error('[getSocialDiscoveries]', error.message);
    return Response.json({ error: error.message, discoveries: [] }, { status: 500 });
  }
});