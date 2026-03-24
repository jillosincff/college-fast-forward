/**
 * firecrawlService.js
 * Reusable Firecrawl.dev helper for the FASTIQ backend.
 *
 * Firecrawl turns any URL into clean markdown/JSON — no fragile HTML parsing needed.
 * All scraping goes through this service so we have one place to manage the API key,
 * rate-limiting, error handling, and school-specific URL mappings.
 *
 * To add a new school, just add its career URL to SCHOOL_CAREER_URLS below.
 *
 * Usage (from any other function):
 *   import { scrapeUrl, scrapeCareerEvents } from './firecrawlService.js';
 *
 *   const markdown = await scrapeUrl('https://careers.google.com');
 *   const eventsMarkdown = await scrapeCareerEvents('UF');
 */

import FirecrawlApp from 'npm:@mendable/firecrawl-js@1.13.5';

// ── School → Career Hub URL map (school-agnostic, easy to extend) ─────────────
const SCHOOL_CAREER_URLS = {
  UF:  'https://careerhub.ufl.edu/events/',
  FSU: 'https://career.fsu.edu/events',   // example — add real URL when needed
  UCF: 'https://careerservices.ucf.edu',   // example
  // Add more schools here: SCHOOL_CODE: 'https://...'
};

// Additional UF-specific pages to scrape alongside the main career hub
const UF_EXTRA_URLS = [
  'https://careerhub.ufl.edu/events/2026/04/',
  'https://careerhub.ufl.edu/events/2026/05/',
  'https://career.ufl.edu/events-and-programs/career-fairs',
];

let _client = null;

/**
 * Get (or lazily initialize) the Firecrawl client.
 * Logs a clear warning if the API key is missing so it's easy to diagnose.
 */
function getClient() {
  if (_client) return _client;
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!apiKey) {
    console.warn('[FirecrawlService] FIRECRAWL_API_KEY is not set — scraping will fail. Add it in Base44 Secrets.');
  }
  _client = new FirecrawlApp({ apiKey: apiKey || '' });
  return _client;
}

/**
 * Scrape a single URL and return clean markdown (or raw result for other formats).
 *
 * @param {string} url - The URL to scrape
 * @param {string[]} formats - Firecrawl formats, default ['markdown']
 * @returns {Promise<string|null>} - Markdown string, or null on failure
 */
export async function scrapeUrl(url, formats = ['markdown']) {
  const client = getClient();
  try {
    console.log(`[FirecrawlService] Scraping: ${url}`);
    const result = await client.scrapeUrl(url, { formats });
    const content = result?.markdown || result?.html || null;
    if (content) {
      console.log(`[FirecrawlService] ✓ Got ${content.length} chars from ${url}`);
    } else {
      console.warn(`[FirecrawlService] Empty response from ${url}`);
    }
    return content;
  } catch (e) {
    console.error(`[FirecrawlService] ✗ Scrape failed for ${url}: ${e.message}`);
    return null;
  }
}

/**
 * Scrape a company website or job posting page.
 * Returns clean markdown suitable for passing directly to an LLM.
 *
 * @param {string} companyUrl - e.g. 'https://careers.google.com'
 * @returns {Promise<string|null>}
 */
export async function scrapeCompanySite(companyUrl) {
  return scrapeUrl(companyUrl);
}

/**
 * Scrape the career events hub for a given school.
 * Returns an array of { url, markdown } objects — one per page scraped.
 * Automatically handles school-specific extra pages (e.g. UF career fairs).
 *
 * @param {string} schoolCode - e.g. 'UF', 'FSU'
 * @returns {Promise<Array<{url: string, content: string}>>} - Array of scraped pages
 */
export async function scrapeCareerEvents(schoolCode) {
  const code = (schoolCode || '').toUpperCase();
  const primaryUrl = SCHOOL_CAREER_URLS[code];

  if (!primaryUrl) {
    console.warn(`[FirecrawlService] No career URL configured for school "${code}". Add it to SCHOOL_CAREER_URLS.`);
    return [];
  }

  // Build list of URLs to scrape for this school
  const urlsToScrape = [primaryUrl];
  if (code === 'UF') {
    urlsToScrape.push(...UF_EXTRA_URLS);
  }
  // Future: add per-school extra URL arrays here

  console.log(`[FirecrawlService] Scraping ${urlsToScrape.length} pages for school "${code}"`);

  // Scrape all pages in parallel
  const results = await Promise.all(
    urlsToScrape.map(async (url) => {
      const content = await scrapeUrl(url);
      return content ? { url, content } : null;
    })
  );

  const pages = results.filter(Boolean);
  console.log(`[FirecrawlService] Successfully scraped ${pages.length}/${urlsToScrape.length} pages for "${code}"`);
  return pages;
}