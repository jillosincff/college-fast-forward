import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * getSocialDiscoveries — Dual-Engine Pipeline
 *
 * LAYER 1 (INGESTION):  Proxycurl or Exa → fresh LinkedIn hiring posts
 * LAYER 2 (ENRICHMENT): Exa AI category:"people" → alumni graph matching
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

    if (!EXA_API_KEY) return Response.json({ error: 'EXA_API_KEY not set' }, { status: 500 });

    let rawPosts = [];

    // ─────────────────────────────────────────────────────────────
    // LAYER 1: INGESTION — Try Proxycurl first (real-time), fallback to Exa
    // ─────────────────────────────────────────────────────────────
    if (PROXYCURL_KEY) {
      try {
        const keywords = [
          `hiring ${targetRole} internship ${targetLocation}`,
          `entry level ${targetRole} ${targetLocation}`,
          `#internship #entrylevel ${targetRole}`,
        ];

        const postPromises = keywords.map(async (kw) => {
          const params = new URLSearchParams({
            keyword: kw,
            sort_by: 'date',
            count: '8',
          });

          const res = await fetch(`https://nubela.co/proxycurl/api/linkedin/post/search?${params}`, {
            headers: { Authorization: `Bearer ${PROXYCURL_KEY}` },
          });

          if (!res.ok) return [];
          const data = await res.json();
          return (data.items || data.posts || []).map(p => ({
            url: p.post_url || p.url,
            title: p.text?.slice(0, 120) || p.title || '',
            text: p.text || p.body || '',
            publishedDate: p.published_at || p.date,
            _source: 'proxycurl',
          }));
        });

        const batches = await Promise.allSettled(postPromises);
        rawPosts = batches.filter(r => r.status === 'fulfilled').flatMap(r => r.value);
        console.log(`[getSocialDiscoveries] Proxycurl posts: ${rawPosts.length}`);
      } catch (e) {
        console.warn('[getSocialDiscoveries] Proxycurl failed:', e.message);
      }
    }

    // Fallback to Exa if Proxycurl returned 0 posts
    if (!rawPosts.length) {
      console.log('[getSocialDiscoveries] Using Exa fallback for post ingestion');
      const locationFilter = targetLocation ? ` AND ("${targetLocation}" OR "United States")` : '';
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
        rawPosts = (exaData.results || [])
          .filter(r => r.url && r.title)
          .map(r => ({
            url: r.url,
            title: r.title,
            text: r.text || r.title,
            publishedDate: r.publishedDate,
            _source: 'exa_fallback',
          }));
      }
      console.log(`[getSocialDiscoveries] Exa fallback posts: ${rawPosts.length}`);
    }

    if (!rawPosts.length) {
      return Response.json({ success: true, discoveries: [], source: 'no_results' });
    }

    // ─────────────────────────────────────────────────────────────
    // Extract company name from post
    // ─────────────────────────────────────────────────────────────
    const extractCompany = (post) => {
      const title = post.title || '';
      const text = post.text || '';
      const combined = `${title} ${text}`;

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

      // LinkedIn job URL parsing
      if (post.url && post.url.includes('/jobs/view/')) {
        const jobText = title.replace(/-\s*$/, '').trim();
        const parts = jobText.split(/\s*[-–—]\s*/);
        if (parts.length >= 2) {
          const companyCandidate = parts[parts.length - 1].trim();
          if (companyCandidate.length > 2 && companyCandidate.length < 50) {
            return companyCandidate;
          }
        }
      }

      const titleWords = title.replace(/[#@]/g, '').trim().split(/\s+/).slice(0, 4).join(' ');
      return titleWords.length > 2 ? titleWords : null;
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
    // LAYER 2: ENRICHMENT — Exa People Search (category: "people")
    // ─────────────────────────────────────────────────────────────
    const enrichPost = async (post) => {
      const company = post._company;

      let insiders = [];
      try {
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
      } catch (_) {}

      const postText = post.text || post.title || '';
      const roleMatch = postText.match(/(?:hiring|role|position|opening)[:\s]+([^|.\n]{3,60})/i);
      const role = roleMatch?.[1]?.trim() || targetRole || 'Open Role';
      const alumniMatched = insiders.length > 0;

      let companyDomain = null;
      try {
        if (post.url) {
          const url = new URL(post.url);
          companyDomain = url.hostname.replace('www.', '');
        }
      } catch {}

      return {
        company,
        role,
        company_domain: companyDomain,
        opportunity_url: post.url || null,
        post_title: post.title || post.text?.slice(0, 100) || company,
        post_snippet: postText.slice(0, 400),
        published_date: post.publishedDate || null,
        insiders,
        alumni_count: insiders.length,
        alumni_matched: alumniMatched,
        source_type: 'social_scout',
        source: post._source,
        source_label: alumniMatched
          ? '🎯 Network Match | Alumni found at this company'
          : '🔥 Direct Manager Access | Live hiring post — pitch the publisher directly',
        hashtags: ['#internship', '#entrylevel', '#hiring'],
      };
    };

    const discoveries = await Promise.all(uniquePosts.slice(0, 10).map(enrichPost));

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