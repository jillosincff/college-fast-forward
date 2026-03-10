import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const URLS_TO_SCRAPE = [
  'https://careerhub.ufl.edu/events/',
  'https://careerhub.ufl.edu/events/2026/04/',
  'https://careerhub.ufl.edu/events/2026/05/',
];

const CAREER_FAIRS_URL = 'https://career.ufl.edu/events-and-programs/career-fairs';

function makeHash(title, startDate) {
  return `${(title || '').toLowerCase().replace(/\s+/g, '_').substring(0, 60)}_${(startDate || '').substring(0, 10)}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    console.log('[UF Scraper] Starting career event scrape...');

    // Step 1: Fetch all event pages
    const pageContents = [];

    for (const url of URLS_TO_SCRAPE) {
      try {
        const resp = await fetch(url);
        if (resp.ok) {
          const html = await resp.text();
          // Strip HTML to text-ish content for LLM
          const text = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .substring(0, 8000);
          pageContents.push({ url, content: text });
          console.log(`[UF Scraper] Fetched ${url} (${text.length} chars)`);
        }
      } catch (e) {
        console.log(`[UF Scraper] Failed to fetch ${url}: ${e.message}`);
      }
    }

    // Also fetch career fairs page
    try {
      const resp = await fetch(CAREER_FAIRS_URL);
      if (resp.ok) {
        const html = await resp.text();
        const text = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .substring(0, 8000);
        pageContents.push({ url: CAREER_FAIRS_URL, content: text });
        console.log(`[UF Scraper] Fetched career fairs page (${text.length} chars)`);
      }
    } catch (e) {
      console.log(`[UF Scraper] Failed to fetch career fairs: ${e.message}`);
    }

    if (pageContents.length === 0) {
      return Response.json({ success: false, error: 'Could not fetch any event pages' });
    }

    // Step 2: Use LLM to extract structured events from all page content
    const combinedContent = pageContents.map(p => `--- SOURCE: ${p.url} ---\n${p.content}`).join('\n\n');

    const extractionResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are extracting upcoming career-related events from the University of Florida Career Connections Center website content. Focus ONLY on events from March 2026 onward (or any future dates). Ignore past events (before March 10, 2026).

For each relevant event, output structured data. Each object must have these exact fields:

- title: The full event name/title (clean it up, remove "Event:" prefix)
- start_date: ISO datetime (YYYY-MM-DDTHH:MM:SS) — use best guess for time, default 09:00:00 if unknown
- end_date: ISO datetime or null
- deadline: Application/registration deadline as ISO date or null
- description: Short 1-2 sentence summary of what the event is, who it's for, and key details
- event_type: One of: "career_trek", "career_fair", "workshop", "resume_lab", "drop_in", "virtual_series", "info_session", "other"
- url: Full direct link to the event page (use the careerhub.ufl.edu link from the source)
- location: Physical or virtual location (e.g., "Reitz Union", "Virtual", "Career Connections Center")

Only include events that are upcoming. Prioritize high-value student events: career treks, fairs, employer info sessions, resume help, drop-ins, networking events.

Skip counseling groups, study abroad advising, and non-career events.

PAGE CONTENT:
${combinedContent.substring(0, 12000)}

Return ONLY the events array.`,
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
                event_type: { type: "string", enum: ["career_trek", "career_fair", "workshop", "resume_lab", "drop_in", "virtual_series", "info_session", "other"] },
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

    const events = extractionResult.events || [];
    console.log(`[UF Scraper] LLM extracted ${events.length} events`);

    // Step 3: Upsert into SchoolCareerEvent (deduplicate by source_hash)
    const existing = await base44.asServiceRole.entities.SchoolCareerEvent.filter({ school_code: 'UF' });
    const existingHashes = new Set((existing || []).map(e => e.source_hash));

    let created = 0, skipped = 0;
    for (const event of events) {
      const hash = makeHash(event.title, event.start_date);
      if (existingHashes.has(hash)) {
        skipped++;
        continue;
      }

      try {
        await base44.asServiceRole.entities.SchoolCareerEvent.create({
          school_code: 'UF',
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
        console.log(`[UF Scraper] Failed to create event "${event.title}": ${e.message}`);
      }
    }

    // Step 4: Mark past events as inactive
    let deactivated = 0;
    const now = new Date();
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

    const summary = { success: true, total_extracted: events.length, created, skipped, deactivated, active_count: (existing || []).filter(e => e.is_active).length + created };
    console.log('[UF Scraper] Done:', JSON.stringify(summary));
    return Response.json(summary);

  } catch (error) {
    console.error('[UF Scraper] Error:', error.message);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});