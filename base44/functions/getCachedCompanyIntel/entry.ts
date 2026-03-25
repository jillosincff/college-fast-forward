import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { companyName, targetRole, targetIndustry, forceRefresh } = await req.json();
    if (!companyName) return Response.json({ error: 'companyName is required' }, { status: 400 });

    const cacheKey = `company_intel_${companyName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`;

    // Check cache
    const existing = await base44.asServiceRole.entities.CompanyIntelCache.filter({ company_name: companyName });
    const cached = existing?.[0] || null;

    const cacheAge = cached ? Date.now() - new Date(cached.scraped_at || cached.created_date).getTime() : Infinity;
    const cacheValid = cached && !forceRefresh && cacheAge < ONE_DAY_MS;

    if (cacheValid) {
      console.log(`[Cache HIT] ${companyName}`);
      return Response.json(cached);
    }

    console.log(`[Cache MISS] Scraping fresh data for: ${companyName}`);

    // Call enrichCompanyWithFirecrawl
    const freshResult = await base44.asServiceRole.functions.invoke('enrichCompanyWithFirecrawl', {
      companyName,
      targetRole: targetRole || '',
      targetIndustry: targetIndustry || '',
    });
    const freshData = freshResult?.data || freshResult;

    // Map Firecrawl results to CompanyIntelCache fields
    const recordData = {
      company_name: companyName,
      school_code: 'UF', // default; callers can override if needed
      hiring_score: freshData.hiring_signal === 'active' ? 80 : freshData.hiring_signal === 'selective' ? 50 : 20,
      hiring_signal: freshData.hiring_signal || 'unknown',
      overall_signal: freshData.hiring_signal === 'active' ? 'green' : freshData.hiring_signal === 'selective' ? 'yellow' : 'red',
      recommendation: freshData.hiring_signal === 'active' ? 'pursue' : freshData.hiring_signal === 'selective' ? 'cautious' : 'deprioritize',
      recommendation_text: freshData.recent_news || null,
      intel_summary: freshData.recent_news || null,
      open_roles_count: freshData.open_roles?.length || 0,
      expires_at: new Date(Date.now() + ONE_DAY_MS).toISOString(),
    };

    let saved;
    if (cached) {
      saved = await base44.asServiceRole.entities.CompanyIntelCache.update(cached.id, {
        ...recordData,
        scraped_at: new Date().toISOString(),
      });
      console.log(`[Cache UPDATE] ${companyName}`);
    } else {
      saved = await base44.asServiceRole.entities.CompanyIntelCache.create(recordData);
      console.log(`[Cache CREATE] ${companyName}`);
    }

    // Return merged result with raw Firecrawl data attached
    return Response.json({ ...saved, _fresh: freshData });
  } catch (error) {
    console.error('[getCachedCompanyIntel] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});