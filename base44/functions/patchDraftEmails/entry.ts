import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const patch = (str) => {
  if (!str) return str;
  return str
    .replaceAll('background:#2563eb', 'background:#7c3aed')
    .replaceAll('— CFF</p>', '— The CFF Team</p>')
    .replaceAll('— CFF\n', '— The CFF Team\n')
    .replaceAll('CLIFF', 'CLiFF')
    .replaceAll("it's been about <strong>Infinity days</strong>", "it's been a little while")
    .replaceAll("it's been about Infinity days", "it's been a little while");
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const db = base44.asServiceRole.entities;

    let patched = 0;
    let errors = 0;
    let skip = 0;
    const limit = 50;

    while (true) {
      const page = await db.EngagementEmail.filter({ status: 'pending_approval' }, '-created_date', limit, skip);
      if (!page || page.length === 0) break;

      for (const r of page) {
        const newHtml = patch(r.body_html);
        const newText = patch(r.body_text);

        if (newHtml === r.body_html && newText === r.body_text) continue;

        try {
          await db.EngagementEmail.update(r.id, { body_html: newHtml, body_text: newText });
          patched++;
        } catch (err) {
          console.error(`Failed to update ${r.id}: ${err.message}`);
          errors++;
        }

        await sleep(200);
      }

      if (page.length < limit) break;
      skip += limit;
    }

    return Response.json({ success: true, patched, errors });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});