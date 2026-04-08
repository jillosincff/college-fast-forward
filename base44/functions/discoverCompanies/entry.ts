import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { query } = await req.json();
    if (!query?.trim()) return Response.json({ error: 'Query required' }, { status: 400 });

    const schoolCode = user.school_name || user.school || user.university || '';

    const EXA_API_KEY = Deno.env.get('EXA_API_KEY');
    const exaRes = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: { 'x-api-key': EXA_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `${query} company careers jobs`,
        numResults: 8,
        useAutoprompt: true,
        category: 'company',
        contents: { highlights: { maxCharacters: 300 } },
      }),
    });
    const exaData = await exaRes.json();

    const rawCompanies = (exaData.results || [])
      .map(r => ({
        name: r.title?.split(/[|\-·]/)[0]?.trim() || '',
        url: r.url,
        snippet: r.highlights?.[0] || '',
      }))
      .filter(c => c.name.length > 1 && c.name.length < 60);

    // Enrich each company with careers intel (parallel, max 6)
    const toEnrich = rawCompanies.slice(0, 6);
    const enriched = await Promise.all(
      toEnrich.map(async (c) => {
        try {
          const res = await base44.asServiceRole.functions.invoke('researchSpecificCompany', {
            companyName: c.name,
            userId: user.id,
            schoolCode,
          });
          const d = res?.data || res;
          if (d?.success && d?.data) {
            const intel = d.data;
            return {
              name: intel.company_name || c.name,
              careers_url: intel.careers_url || c.url,
              hiring_summary: intel.hiring_summary || c.snippet,
              open_role_types: intel.open_role_types || [],
              hiring_signal: intel.is_actively_hiring ? 'active' : 'selective',
              culture_notes: intel.culture_notes || '',
            };
          }
        } catch (_) {}
        // fallback to Exa-only data
        return {
          name: c.name,
          careers_url: c.url,
          hiring_summary: c.snippet,
          open_role_types: [],
          hiring_signal: 'unknown',
          culture_notes: '',
        };
      })
    );

    return Response.json({ success: true, companies: enriched.filter(Boolean) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});