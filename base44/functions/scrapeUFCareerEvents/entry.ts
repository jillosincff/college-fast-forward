/**
 * scrapeUFCareerEvents.js
 * Weekly scheduled job: scrape career events for one or more schools via Firecrawl,
 * extract structured events via LLM, upsert into SchoolCareerEvent, deactivate past events.
 *
 * Called by automation with function_args: { school_codes: ['UF'] }
 * Defaults to ['UF'] if not provided.
 *
 * To add a new school:
 *   1. Add its career URL to SCHOOL_CAREER_URLS below
 *   2. Optionally add extra pages to SCHOOL_EXTRA_URLS
 *   3. Add its school_code to the automation's function_args
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// ── Firecrawl config ──────────────────────────────────────────────────────────
const FIRECRAWL_API_BASE = 'https://api.firecrawl.dev/v1';

const SCHOOL_CAREER_URLS = {
  UF:  'https://careerhub.ufl.edu/events/',
  FSU: 'https://career.fsu.edu/events',
  UCF: 'https://careerservices.ucf.edu',
};

const SCHOOL_EXTRA_URLS = {
  UF: ['https://career.ufl.edu/events-and-programs/career-fairs'],
  // Add per-school supplementary pages here
};

async function firecrawlScrape(url, apiKey) {
  const resp = await fetch(`${FIRECRAWL_API_BASE}/scrape`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, formats: ['markdown'] }),
  });
  if (!resp.ok) {
    console.error(`[Firecrawl] HTTP ${resp.status} for ${url}`);
    return null;
  }
  const data = await resp.json();
  const content = data?.data?.markdown || null;
  if (content) console.log(`[Firecrawl] ✓ ${url} → ${content.length} chars`);
  return content;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeHash(title, startDate) {
  return `${(title || '').toLowerCase().replace(/\s+/g, '_').substring(0, 60)}_${(startDate || '').substring(0, 10)}`;
}

function buildExtractionPrompt(schoolCode, combinedContent, nowISO) {
  const SCHOOL_NAMES = {
    UF: 'University of Florida Career Connections Center',
    FSU: 'Florida State University Career Center',
    UCF: 'University of Central Florida Career Services',
  };
  const schoolName = SCHOOL_NAMES[schoolCode] || `${schoolCode} Career Center`;

  return `You are extracting upcoming career-related events from the ${schoolName} website. Focus ONLY on events from ${nowISO.substring(0, 10)} onward. Ignore past events.

For each relevant event, output structured data with these exact fields:
- title: Full event name (clean it, remove "Event:" prefix)
- start_date: ISO datetime (YYYY-MM-DDTHH:MM:SS), default time 09:00:00 if unknown
- end_date: ISO datetime or null
- deadline: Registration/application deadline as ISO date or null
- description: 1-2 sentence summary of what it is, who it's for, key details
- event_type: One of: "career_trek", "career_fair", "workshop", "resume_lab", "drop_in", "virtual_series", "info_session", "other"
- url: Full direct link to the event page
- location: Physical or virtual location (e.g., "Reitz Union", "Virtual", "Career Center")

Only include upcoming, high-value student events: career treks, fairs, employer info sessions, resume help, drop-ins, networking events.
Skip counseling groups, study abroad advising, and non-career events.

PAGE CONTENT:
${combinedContent.substring(0, 12000)}

Return ONLY the events array.`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Scheduled automation — no user auth required.
    let body = {};
    try { body = await req.json(); } catch(e) {}

    const schoolCodes = body.school_codes || body.function_args?.school_codes || ['UF'];
    console.log(`[CareerEventsScraper] Starting scrape for schools: ${schoolCodes.join(', ')}`);

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return Response.json({ success: false, error: 'FIRECRAWL_API_KEY not set' }, { status: 500 });
    }

    const now = new Date();
    const nowISO = now.toISOString();
    const summary = {};

    for (const schoolCode of schoolCodes) {
      console.log(`\n[CareerEventsScraper] ── Processing ${schoolCode} ──`);

      // Step 1: Firecrawl
      const primaryUrl = SCHOOL_CAREER_URLS[schoolCode];
      if (!primaryUrl) {
        console.warn(`[CareerEventsScraper] No career URL for "${schoolCode}" — skipping.`);
        summary[schoolCode] = { success: false, error: `No career URL configured for "${schoolCode}"` };
        continue;
      }

      const urlsToScrape = [primaryUrl, ...(SCHOOL_EXTRA_URLS[schoolCode] || [])];
      const scrapeResults = await Promise.all(
        urlsToScrape.map(async (u) => {
          const content = await firecrawlScrape(u, apiKey);
          return content ? { url: u, content } : null;
        })
      );
      const pageContents = scrapeResults.filter(Boolean);

      if (pageContents.length === 0) {
        console.warn(`[CareerEventsScraper] No pages scraped for ${schoolCode} — skipping.`);
        summary[schoolCode] = { success: false, error: 'No pages scraped — check FIRECRAWL_API_KEY and school URL config' };
        continue;
      }

      const totalChars = pageContents.reduce((sum, p) => sum + (p.content?.length || 0), 0);
      console.log(`[CareerEventsScraper] Scraped ${totalChars} chars from ${pageContents.length} pages for ${schoolCode}`);

      // Step 2: LLM extraction
      const combinedContent = pageContents
        .map(p => `--- SOURCE: ${p.url} ---\n${p.content}`)
        .join('\n\n');

      let events = [];
      try {
        const extractionResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: buildExtractionPrompt(schoolCode, combinedContent, nowISO),
          response_json_schema: {
            type: "object",
            properties: {
              events: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    start_date: { type: "string" },
                    end_date: { type: "string" },
                    deadline: { type: "string" },
                    description: { type: "string" },
                    event_type: {
                      type: "string",
                      enum: ["career_trek", "career_fair", "workshop", "resume_lab", "drop_in", "virtual_series", "info_session", "other"]
                    },
                    url: { type: "string" },
                    location: { type: "string" }
                  },
                  required: ["title", "start_date", "event_type"]
                }
              }
            },
            required: ["events"]
          }
        });
        events = extractionResult.events || [];
        console.log(`[CareerEventsScraper] LLM extracted ${events.length} events for ${schoolCode}`);
      } catch (e) {
        console.error(`[CareerEventsScraper] LLM extraction failed for ${schoolCode}: ${e.message}`);
        summary[schoolCode] = { success: false, error: `LLM extraction failed: ${e.message}` };
        continue;
      }

      // Step 3: Upsert — deduplicate by source_hash
      const existing = await base44.asServiceRole.entities.SchoolCareerEvent.filter({ school_code: schoolCode });
      const existingHashes = new Set((existing || []).map(e => e.source_hash));

      let created = 0, skipped = 0;
      for (const event of events) {
        const hash = makeHash(event.title, event.start_date);
        if (existingHashes.has(hash)) { skipped++; continue; }
        try {
          await base44.asServiceRole.entities.SchoolCareerEvent.create({
            school_code: schoolCode,
            title: event.title,
            start_date: event.start_date || null,
            end_date: event.end_date || null,
            deadline: event.deadline || null,
            description: event.description || '',
            event_type: event.event_type || 'other',
            url: event.url || '',
            location: event.location || '',
            is_active: true,
            source_hash: hash,
          });
          created++;
        } catch (e) {
          console.warn(`[CareerEventsScraper] Failed to create event "${event.title}": ${e.message}`);
        }
      }

      // Step 4: Deactivate past events
      let deactivated = 0;
      for (const e of (existing || [])) {
        if (!e.is_active) continue;
        const endOrStart = e.end_date || e.start_date;
        if (endOrStart && new Date(endOrStart) < now) {
          try {
            await base44.asServiceRole.entities.SchoolCareerEvent.update(e.id, { is_active: false });
            deactivated++;
          } catch (err) {}
        }
      }

      const schoolResult = {
        success: true,
        school_code: schoolCode,
        pages_scraped: pageContents.length,
        total_chars: totalChars,
        events_extracted: events.length,
        created,
        skipped,
        deactivated,
        active_count: (existing || []).filter(e => e.is_active).length + created - deactivated,
      };
      summary[schoolCode] = schoolResult;
      console.log(`[CareerEventsScraper] ✓ ${schoolCode} done:`, JSON.stringify(schoolResult));
    }

    const overallSuccess = Object.values(summary).some(s => s.success);
    console.log('\n[CareerEventsScraper] All schools complete:', JSON.stringify(summary));
    return Response.json({ success: overallSuccess, schools: summary });

  } catch (error) {
    console.error('[CareerEventsScraper] Fatal error:', error.message);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});