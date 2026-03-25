import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

async function firecrawlScrape(url) {
  const resp = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('FIRECRAWL_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, formats: ['markdown'] }),
  });
  if (!resp.ok) {
    console.warn(`[Firecrawl] HTTP ${resp.status} for ${url}`);
    return '';
  }
  const data = await resp.json();
  return data?.data?.markdown || '';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { companyName, targetRole, targetIndustry } = await req.json();
    if (!companyName) return Response.json({ error: 'companyName is required' }, { status: 400 });

    const results = {
      company: companyName,
      hiring_signal: 'unknown',
      open_roles: [],
      recent_news: null,
      what_they_look_for: [],
      application_timeline: null,
      scraped_at: new Date().toISOString(),
    };

    // SCRAPE 1 — Indeed job search for real open roles
    try {
      const indeedUrl = `https://www.indeed.com/jobs?q=${encodeURIComponent(targetRole || '')}+${encodeURIComponent(companyName)}&sort=date`;
      const indeedContent = await firecrawlScrape(indeedUrl);

      if (indeedContent) {
        const jobCountMatch = indeedContent.match(/(\d+(?:,\d+)?)\s+jobs?/i);
        const jobCount = jobCountMatch ? parseInt(jobCountMatch[1].replace(',', '')) : 0;

        if (jobCount >= 5) results.hiring_signal = 'active';
        else if (jobCount >= 1) results.hiring_signal = 'selective';
        else results.hiring_signal = 'freeze';

        const jobTitleMatches = indeedContent
          .match(/#{1,3}\s+([^\n]+)/g)
          ?.slice(0, 5)
          ?.map(t => t.replace(/#{1,3}\s+/, '').trim()) || [];

        results.open_roles = jobTitleMatches
          .filter(t => t.length > 3 && t.length < 80 && !t.toLowerCase().includes('indeed'))
          .slice(0, 3);

        console.log(`[Indeed] ${companyName}: jobCount=${jobCount}, signal=${results.hiring_signal}`);
      }
    } catch (err) {
      console.error('[Indeed] scrape failed:', err.message);
    }

    // SCRAPE 2 — Company careers page for what they look for
    try {
      const slug = companyName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
      const careersUrl = `https://${slug}.com/careers`;
      const careersContent = await firecrawlScrape(careersUrl);

      if (careersContent.length > 100) {
        const requirementsResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `From this company careers page content, extract exactly 3 specific requirements or qualities they look for in ${targetRole || 'entry-level'} candidates.\n\nBe specific and honest. Max 8 words each. No marketing fluff. Plain text only.\n\nContent:\n${careersContent.slice(0, 3000)}\n\nReturn JSON array of 3 strings only.`,
          response_json_schema: {
            type: 'object',
            properties: { items: { type: 'array', items: { type: 'string' } } },
          },
        });
        results.what_they_look_for = requirementsResult?.items || [];
        console.log(`[Careers] ${companyName}: ${results.what_they_look_for.length} requirements extracted`);
      }
    } catch (err) {
      console.error('[Careers] scrape failed:', err.message);
    }

    // SCRAPE 3 — Glassdoor for company intel / known_for summary
    try {
      const glassdoorUrl = `https://www.glassdoor.com/Overview/Working-at-${companyName.replace(/\s+/g, '-')}-EI_IE`;
      const glassdoorContent = await firecrawlScrape(glassdoorUrl);

      if (glassdoorContent.length > 100) {
        const summaryResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `From this Glassdoor company page, write ONE sentence (max 15 words) describing what this company is known for in the context of ${targetIndustry || 'their industry'}.\n\nBe specific. No marketing language. Plain text only. No markdown.\n\nContent:\n${glassdoorContent.slice(0, 2000)}`,
        });
        results.recent_news = (summaryResult || '').replace(/```/g, '').trim() || null;
        console.log(`[Glassdoor] ${companyName}: summary="${results.recent_news}"`);
      }
    } catch (err) {
      console.error('[Glassdoor] scrape failed:', err.message);
    }

    return Response.json(results);
  } catch (error) {
    console.error('[enrichCompanyWithFirecrawl] Fatal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});