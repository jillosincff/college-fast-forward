import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Admin-only
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const db = base44.asServiceRole.entities;

    // Fetch all pending_approval EngagementEmail records
    const records = await db.EngagementEmail.filter({ status: 'pending_approval' }, '-created_date', 500);

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

    let patched = 0;
    for (const r of records) {
      const newHtml = patch(r.body_html);
      const newText = patch(r.body_text);

      const changed = newHtml !== r.body_html || newText !== r.body_text;
      if (!changed) continue;

      await db.EngagementEmail.update(r.id, { body_html: newHtml, body_text: newText });
      patched++;
    }

    return Response.json({ success: true, patched, total_checked: records.length });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});