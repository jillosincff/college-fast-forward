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

    // Part 1 — 3 parallel Exa queries
    const queries = [
      `${query} company hiring jobs`,
      `top ${query} companies careers`,
      `best ${query} employers`,
    ];

    const exaResults = await Promise.all(
      queries.map(q =>
        fetch('https://api.exa.ai/search', {
          method: 'POST',
          headers: { 'x-api-key': EXA_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: q,
            numResults: 15,
            useAutoprompt: true,
            contents: { highlights: { maxCharacters: 300 } },
          }),
        }).then(r => r.json()).catch(() => ({ results: [] }))
      )
    );

    // Merge and deduplicate by domain
    console.log('Exa raw result counts:', exaResults.map(r => r.results?.length || 0));

    const seen = new Set();
    const rawCompanies = exaResults
      .flatMap(r => r.results || [])
      .filter(r => {
        if (!r?.url) return false;
        try {
          const domain = new URL(r.url).hostname.replace('www.', '');
          if (seen.has(domain)) return false;
          seen.add(domain);
          return true;
        } catch { return false; }
      })
      .map(r => ({
        name: r.title?.split(/[|\-·]/)[0]?.trim() || '',
        url: r.url,
        snippet: r.highlights?.[0] || '',
      }))
      .filter(c => c.name && c.name.length > 1 && c.name.length < 60)
      .slice(0, 12);

    console.log('Exa merged companies:', rawCompanies.map(c => c.name));

    // Part 2 — Claude validation + gap-fill
    let finalNames = rawCompanies.map(c => c.name);
    try {
      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': Deno.env.get('ANTHROPIC_API_KEY'),
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 800,
          messages: [{
            role: 'user',
            content: `A student is looking for: "${query}"

Here are companies found so far: ${finalNames.join(', ')}

Do two things:
1. Remove any companies that clearly don't match the query
2. Add up to 5 more well-known companies that match the query but aren't in the list

Return ONLY a JSON array of company names, no markdown, no explanation:
["Company A", "Company B", "Company C"]`,
          }],
        }),
      });
      const claudeData = await claudeRes.json();
      const rawText = claudeData?.content?.[0]?.text || '[]';
      const parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());
      if (Array.isArray(parsed) && parsed.length > 0) finalNames = parsed;
    } catch (e) {
      console.warn('[discoverCompanies] Claude validation failed, using Exa results:', e.message);
    }

    // Part 3 — Parallel enrichment via researchSpecificCompany
    const toEnrich = finalNames.slice(0, 8);
    const enriched = await Promise.all(
      toEnrich.map(async (name) => {
        try {
          const res = await base44.asServiceRole.functions.invoke('researchSpecificCompany', {
            companyName: name,
            userId: user.id,
            schoolCode,
          });
          const d = res?.data || res;
          if (d?.success && d?.data) {
            const intel = d.data;
            return {
              name: intel.company_name || name,
              careers_url: intel.careers_url || '',
              hiring_summary: intel.hiring_summary || '',
              open_role_types: intel.open_role_types || [],
              hiring_signal: intel.is_actively_hiring ? 'active' : 'selective',
              culture_notes: intel.culture_notes || '',
            };
          }
        } catch (_) {}
        // Fallback to Exa snippet data
        const exaMatch = rawCompanies.find(c => c.name.toLowerCase() === name.toLowerCase());
        return {
          name,
          careers_url: exaMatch?.url || '',
          hiring_summary: exaMatch?.snippet || '',
          open_role_types: [],
          hiring_signal: 'unknown',
          culture_notes: '',
        };
      })
    );

    const validResults = enriched.filter(Boolean);

    return Response.json({
      success: true,
      companies: validResults,
      total: validResults.length,
    });
  } catch (error) {
    console.error('[discoverCompanies] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});