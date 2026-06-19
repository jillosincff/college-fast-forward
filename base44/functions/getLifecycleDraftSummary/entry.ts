import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all lifecycle pending_approval records using service role
    const records = await base44.asServiceRole.entities.EngagementEmail.filter({
      workflow: 'lifecycle',
      status: 'pending_approval',
    }, 'created_date', 500);

    const segments = {
      never_activated: 0,
      gone_quiet: 0,
      cliff_ready: 0,
    };

    let oldestDate = null;

    for (const record of records || []) {
      const templateId = record.template_id || '';
      if (templateId.includes('never_activated')) {
        segments.never_activated++;
      } else if (templateId.includes('gone_quiet')) {
        segments.gone_quiet++;
      } else if (templateId.includes('cliff_ready')) {
        segments.cliff_ready++;
      }

      const createdDate = record.created_date;
      if (createdDate && (!oldestDate || createdDate < oldestDate)) {
        oldestDate = createdDate;
      }
    }

    return Response.json({
      success: true,
      total_pending: (records || []).length,
      segments,
      oldest_draft_date: oldestDate || null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});