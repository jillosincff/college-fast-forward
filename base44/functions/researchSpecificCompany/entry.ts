import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { companyName, userId, schoolCode } = await req.json();
    if (!companyName) return Response.json({ error: 'companyName is required' }, { status: 400 });

    // Step 1 — Find the real careers page URL using Exa.ai
    let careersUrl = `https://www.${companyName.toLowerCase().replace(/\s+/g, '')}.com/careers`;
    try {
      const exaRes = await fetch('https://api.exa.ai/search', {
        method: 'POST',
        headers: {
          'x-api-key': Deno.env.get('EXA_API_KEY'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `${companyName} official careers jobs page site`,
          numResults: 3,
          useAutoprompt: true,
        }),
      });
      const exaData = await exaRes.json();
      const firstResult = exaData?.results?.[0]?.url;
      if (firstResult) careersUrl = firstResult;
      console.log(`[researchSpecificCompany] Careers URL found: ${careersUrl}`);
    } catch (e) {
      console.warn('[researchSpecificCompany] Exa search failed, using fallback URL:', e.message);
    }

    // Step 2 — Scrape the careers page using Firecrawl
    let pageContent = '';
    try {
      const fireRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('FIRECRAWL_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: careersUrl,
          formats: ['markdown'],
          onlyMainContent: true,
        }),
      });
      const fireData = await fireRes.json();
      pageContent = fireData?.data?.markdown || '';
      console.log(`[researchSpecificCompany] Scraped ${pageContent.length} chars from ${careersUrl}`);
    } catch (e) {
      console.warn('[researchSpecificCompany] Firecrawl scrape failed:', e.message);
    }

    // Step 3 — Use LLM to extract structured intel
    let intel = {
      company_name: companyName,
      careers_url: careersUrl,
      is_actively_hiring: null,
      hiring_summary: 'Could not retrieve hiring data.',
      open_role_types: [],
      culture_notes: '',
      application_tips: '',
    };

    const prompt = pageContent.length > 100
      ? `Based on this careers page content, extract structured intel about ${companyName}. Return ONLY valid JSON, no markdown, no backticks:
{
  "company_name": "${companyName}",
  "careers_url": "${careersUrl}",
  "is_actively_hiring": true or false,
  "hiring_summary": "1-2 sentence summary of current hiring activity",
  "open_role_types": ["list", "of", "role", "categories"],
  "culture_notes": "brief culture or values summary from the page",
  "application_tips": "any specific tips visible on the page"
}

Page content:
${pageContent.slice(0, 3000)}`
      : `You are a career intelligence assistant. Based on your knowledge of ${companyName}, return structured hiring intel as JSON only, no markdown:
{
  "company_name": "${companyName}",
  "careers_url": "${careersUrl}",
  "is_actively_hiring": true or false,
  "hiring_summary": "1-2 sentence summary of typical hiring activity at this company",
  "open_role_types": ["list", "of", "common", "role", "types"],
  "culture_notes": "brief culture or values summary",
  "application_tips": "general application tips for this company"
}`;

    try {
      const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        model: 'claude_sonnet_4_6',
      });
      // InvokeLLM returns a string when no response_json_schema is set
      const raw = typeof llmRes === 'string' ? llmRes : JSON.stringify(llmRes);
      const clean = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      if (parsed && parsed.company_name) intel = parsed;
    } catch (e) {
      console.warn('[researchSpecificCompany] LLM extraction failed:', e.message);
    }

    // Step 4 — Save to CompanyIntelCache entity and return
    try {
      await base44.asServiceRole.entities.CompanyIntelCache.create({
        company_name: intel.company_name,
        careers_url: intel.careers_url,
        is_actively_hiring: intel.is_actively_hiring,
        hiring_summary: intel.hiring_summary,
        open_role_types: intel.open_role_types || [],
        culture_notes: intel.culture_notes || '',
        application_tips: intel.application_tips || '',
        created_by: userId || user.id,
        school_code: schoolCode || '',
        source: 'manual_search',
        last_enriched: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('[researchSpecificCompany] Failed to save to cache:', e.message);
    }

    return Response.json({ success: true, data: intel });
  } catch (error) {
    console.error('[researchSpecificCompany] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});