import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Proxycurl/NinjaPear API is sunset. All alumni lookups now route through Exa.
// This service is kept as a thin proxy to exaService for backward compatibility.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, params } = await req.json();

    // ── getAlumniCount → Exa alumni search (count only)
    if (action === 'getAlumniCount') {
      const { companyLinkedInUrl, universityName, companyName } = params;

      const EXA_API_KEY = Deno.env.get('EXA_API_KEY');
      if (!EXA_API_KEY) return Response.json({ error: 'EXA_API_KEY not set' }, { status: 500 });

      const universityShortName = universityName
        .replace(/^University of /i, '')
        .replace(/ University$/i, '')
        .replace(/ College$/i, '')
        .trim();

      const query = `${universityShortName} alumni graduate works at ${companyName} site:linkedin.com/in`;

      const res = await fetch('https://api.exa.ai/search', {
        method: 'POST',
        headers: { 'x-api-key': EXA_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          type: 'auto',
          category: 'people',
          numResults: 10,
          contents: { highlights: { maxCharacters: 200 } },
        }),
      });
      const data = await res.json();
      const count = (data.results || []).length;

      return Response.json({
        company: companyName,
        alumni_count: count,
        confidence: count > 0 ? 'estimated' : 'none',
        source: 'exa',
      });
    }

    // ── getAlumniProfiles → Exa alumni search with profiles
    if (action === 'getAlumniProfiles') {
      const { universityName, companyName, maxResults = 10 } = params;

      const EXA_API_KEY = Deno.env.get('EXA_API_KEY');
      if (!EXA_API_KEY) return Response.json({ error: 'EXA_API_KEY not set' }, { status: 500 });

      const universityShortName = universityName
        .replace(/^University of /i, '')
        .replace(/ University$/i, '')
        .replace(/ College$/i, '')
        .trim();

      const res = await fetch('https://api.exa.ai/search', {
        method: 'POST',
        headers: { 'x-api-key': EXA_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `${universityShortName} alumnus alumna graduate works at ${companyName} site:linkedin.com/in`,
          type: 'auto',
          category: 'people',
          numResults: maxResults,
          contents: { highlights: { maxCharacters: 400 } },
        }),
      });
      const data = await res.json();

      const profiles = (data.results || []).map(r => {
        const parts = (r.title || '').split(/[|\-·]/).map(s => s.trim()).filter(Boolean);
        return {
          full_name: parts[0]?.trim() || 'Unknown',
          headline: parts.slice(1).join(' · ') || '',
          linkedin_url: r.url || '',
          source: 'exa',
        };
      }).filter(p => p.full_name !== 'Unknown');

      return Response.json({
        company: companyName,
        profiles,
        total_count: profiles.length,
        confidence: 'estimated',
        source: 'exa',
      });
    }

    // ── getNetworkCount → Exa alumni count + local ParentNetworkProfile count in parallel
    if (action === 'getNetworkCount') {
      const { companyName, companyDomain, universityName, schoolCode } = params;

      const EXA_API_KEY = Deno.env.get('EXA_API_KEY');
      if (!EXA_API_KEY) return Response.json({ error: 'EXA_API_KEY not set' }, { status: 500 });

      const universityShortName = (universityName || '')
        .replace(/^University of /i, '')
        .replace(/ University$/i, '')
        .replace(/ College$/i, '')
        .trim();

      // Fire Exa alumni search + parent DB query in parallel
      const [exaRes, parentProfiles] = await Promise.all([
        fetch('https://api.exa.ai/search', {
          method: 'POST',
          headers: { 'x-api-key': EXA_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `${universityShortName} alumni graduate works at ${companyName} site:linkedin.com/in`,
            type: 'auto',
            category: 'people',
            numResults: 10,
            contents: { highlights: { maxCharacters: 200 } },
          }),
        }).then(r => r.json()).catch(() => ({ results: [] })),

        base44.asServiceRole.entities.ParentNetworkProfile.filter({
          company_domain: (companyDomain || companyName || '').toLowerCase().replace(/\s+/g, ''),
          school_code: (schoolCode || '').toUpperCase(),
          is_active: true,
        }).catch(() => []),
      ]);

      const alumniCount = (exaRes.results || []).length;
      const parentCount = Array.isArray(parentProfiles) ? parentProfiles.length : 0;

      // Sample connections: parents first (warm), then alumni
      const parentSamples = (Array.isArray(parentProfiles) ? parentProfiles : []).slice(0, 2).map(p => ({
        name: `${p.first_name} ${p.last_name}`,
        role_title: p.role_title,
        linkedin_url: p.linkedin_url || null,
        connection_type: 'parent',
      }));

      const alumniSamples = (exaRes.results || []).slice(0, 3 - parentSamples.length).map(r => {
        const parts = (r.title || '').split(/[|\-·]/).map(s => s.trim()).filter(Boolean);
        return {
          name: parts[0] || 'Alumni',
          role_title: parts.slice(1).join(' · ') || '',
          linkedin_url: r.url || null,
          connection_type: 'alum',
        };
      });

      return Response.json({
        company: companyName,
        alumni_count: alumniCount,
        parent_count: parentCount,
        sample_connections: [...parentSamples, ...alumniSamples],
        source: 'exa+local',
      });
    }

    // ── enrichParentProfile → graceful no-op (Proxycurl is sunset)
    if (action === 'enrichParentProfile') {
      return Response.json({
        full_name: '',
        headline: '',
        current_title: '',
        current_company: '',
        industry: '',
        location: '',
        summary: '',
        skills: [],
        profile_pic: null,
        enriched_at: new Date().toISOString(),
        source: 'unavailable',
        note: 'Profile enrichment via Proxycurl is no longer available.',
      });
    }

    // ── getAlumniByRole → delegate to exaService searchAlumni
    if (action === 'getAlumniByRole') {
      const { jobTitle, universityName, location, maxResults = 10 } = params;
      const result = await base44.asServiceRole.functions.invoke('exaService', {
        action: 'searchAlumni',
        query: `${jobTitle} ${location || ''}`.trim(),
        universityName,
        maxResults,
      });
      return Response.json(result?.data || result);
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error('[proxycurlService] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});