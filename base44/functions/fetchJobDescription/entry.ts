import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Fetches a job posting URL and extracts the clean job description text,
// so the tailoring screen can pre-fill it for the student.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { url } = await req.json();
    if (!url) return Response.json({ success: false, error: 'url is required' }, { status: 400 });

    // Scrape the posting page (markdown) via Firecrawl directly
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    let content = null;
    try {
      const resp = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('FIRECRAWL_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, formats: ['markdown'] }),
        signal: controller.signal,
      });
      if (resp.ok) {
        const data = await resp.json();
        content = data?.data?.markdown || null;
      }
    } catch (_e) {
      // timed out or fetch failed — handled below
    } finally {
      clearTimeout(timer);
    }
    if (!content || content.length < 100) {
      return Response.json({ success: false, error: 'Could not read the job posting page' });
    }

    // Extract just the job description from the page content
    const extracted = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Below is the scraped content of a job posting web page. Extract ONLY the job description itself: the role summary, responsibilities, requirements/qualifications, and any compensation/benefits details. Preserve the original wording. Exclude navigation, cookie banners, footers, "similar jobs" listings, and application form text. If the page does not contain a job description, return exactly "NONE".\n\nPAGE CONTENT:\n${content.slice(0, 20000)}`,
    });

    const jd = typeof extracted === 'string' ? extracted.trim() : '';
    if (!jd || jd === 'NONE' || jd.length < 100) {
      return Response.json({ success: false, error: 'No job description found on the page' });
    }

    return Response.json({ success: true, jobDescription: jd });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});