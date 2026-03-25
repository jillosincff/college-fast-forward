/**
 * firecrawlService.js
 * Reusable Firecrawl.dev scraping service for the FASTIQ backend.
 *
 * Called from other functions via:
 *   const result = await base44.asServiceRole.functions.invoke('firecrawlService', {
 *     action: 'scrapeUrl',           url: 'https://...'
 *   });
 *   const result = await base44.asServiceRole.functions.invoke('firecrawlService', {
 *     action: 'scrapeCareerEvents',  school_code: 'UF'
 *   });
 *   const result = await base44.asServiceRole.functions.invoke('firecrawlService', {
 *     action: 'scrapeCompanySite',   url: 'https://careers.google.com'
 *   });
 *
 * Returns: { success: bool, pages: [{url, content}] } for multi-page actions,
 *          { success: bool, content: string } for single-page scrape.
 *
 * To add a new school, add it to SCHOOL_CAREER_URLS + SCHOOL_EXTRA_URLS below.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const FIRECRAWL_API_BASE = 'https://api.firecrawl.dev/v1';

// ── School → Career Hub URL map (school-agnostic) ──────────────────────────────
const SCHOOL_CAREER_URLS = {
  UF:  'https://careerhub.ufl.edu/events/',
  FSU: 'https://career.fsu.edu/events',
  UCF: 'https://careerservices.ucf.edu',
  // Add more: 'SCHOOL_CODE': 'https://...'
};

// Additional per-school pages scraped alongside the main career hub
// Keep only stable, fast-loading pages. Monthly sub-pages time out and aren't needed
// since the main hub already includes upcoming events inline.
const SCHOOL_EXTRA_URLS = {
  UF: [
    'https://career.ufl.edu/events-and-programs/career-fairs',
  ],
  // Add new schools here alongside SCHOOL_CAREER_URLS above
};

async function firecrawlScrape(url, apiKey, formats = ['markdown']) {
  const resp = await fetch(`${FIRECRAWL_API_BASE}/scrape`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, formats }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    console.error(`[FirecrawlService] HTTP ${resp.status} for ${url}: ${errText}`);
    return null;
  }

  const data = await resp.json();
  const content = data?.data?.markdown || data?.data?.html || null;
  if (content) {
    console.log(`[FirecrawlService] ✓ ${url} → ${content.length} chars`);
  } else {
    console.warn(`[FirecrawlService] Empty response from ${url}`);
  }
  return content;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Internal utility — called only by other backend functions (e.g. scrapeUFCareerEvents)
    // No user auth needed; FIRECRAWL_API_KEY is the real secret gate
    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');

    const { action, url, school_code, formats } = await req.json();

    // ── Action: scrapeUrl / scrapeCompanySite ────────────────────────────────
    if (action === 'scrapeUrl' || action === 'scrapeCompanySite') {
      if (!url) return Response.json({ success: false, error: 'url is required' }, { status: 400 });
      const content = await firecrawlScrape(url, apiKey, formats || ['markdown']);
      return Response.json({ success: !!content, content });
    }

    // ── Action: scrapeCareerEvents ───────────────────────────────────────────
    if (action === 'scrapeCareerEvents') {
      const code = (school_code || '').toUpperCase();
      const primaryUrl = SCHOOL_CAREER_URLS[code];

      if (!primaryUrl) {
        console.warn(`[FirecrawlService] No career URL for school "${code}". Add it to SCHOOL_CAREER_URLS.`);
        return Response.json({ success: false, error: `No career URL configured for school "${code}"`, pages: [] });
      }

      const urlsToScrape = [primaryUrl, ...(SCHOOL_EXTRA_URLS[code] || [])];
      console.log(`[FirecrawlService] Scraping ${urlsToScrape.length} pages for "${code}"...`);

      const results = await Promise.all(
        urlsToScrape.map(async (u) => {
          const content = await firecrawlScrape(u, apiKey, ['markdown']);
          return content ? { url: u, content } : null;
        })
      );

      const pages = results.filter(Boolean);
      console.log(`[FirecrawlService] ✓ ${pages.length}/${urlsToScrape.length} pages scraped for "${code}"`);
      return Response.json({ success: true, school_code: code, pages });
    }

    return Response.json({ error: `Unknown action "${action}". Use: scrapeUrl, scrapeCompanySite, scrapeCareerEvents` }, { status: 400 });

  } catch (error) {
    console.error('[FirecrawlService] Error:', error.message);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});