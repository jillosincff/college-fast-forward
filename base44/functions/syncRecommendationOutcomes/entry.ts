import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Entity-automation handler: grades recommendations from real tracker progress.
// Watches NetworkingPipeline and JobPursuit changes and updates the matching
// RecommendationOutcome (pursued → applied → interview → offer / rejected).
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const { event, data } = payload;
    if (!event?.entity_name || !data) return Response.json({ skipped: 'no event data' });

    let email = '', company = '', status = '', interviewStatus = '';
    if (event.entity_name === 'NetworkingPipeline') {
      email = data.user_email || data.created_by || '';
      company = data.company || '';
      status = data.status || '';
    } else if (event.entity_name === 'JobPursuit') {
      email = data.user_email || '';
      company = data.company_name || '';
      status = data.application_status || '';
      interviewStatus = data.interview_status || '';
    } else {
      return Response.json({ skipped: 'unhandled entity' });
    }
    if (!email || !company) return Response.json({ skipped: 'missing email or company' });

    const db = base44.asServiceRole.entities;
    const rows = await db.RecommendationOutcome.filter({ user_email: email }, '-created_date', 200);
    const c = company.toLowerCase().trim();
    const rec = (rows || []).find((r: any) => (r.company_name || '').toLowerCase().trim() === c);
    if (!rec) return Response.json({ skipped: 'no matching recommendation' });

    const updates: Record<string, boolean> = {};
    const pursuedStatuses = ['identified', 'matched', 'reached_out', 'messaged', 'replied', 'coffee_chat', 'intro_made', 'preparing', 'ready_to_apply'];
    if (pursuedStatuses.includes(status) && !rec.pursued) updates.pursued = true;
    if (['identified', 'applied', 'follow_up_due'].includes(status) && !rec.applied) { updates.applied = true; updates.pursued = true; }
    if (status === 'interview' || status === 'interviewing' || interviewStatus === 'scheduled' || interviewStatus === 'completed') {
      if (!rec.interview) { updates.interview = true; updates.applied = true; updates.pursued = true; }
    }
    if (status === 'offer') {
      if (!rec.offer) { updates.offer = true; updates.interview = true; updates.applied = true; updates.pursued = true; }
    }
    if ((status === 'no_response' || status === 'rejected') && !rec.rejected) updates.rejected = true;

    if (Object.keys(updates).length > 0) await db.RecommendationOutcome.update(rec.id, updates);
    return Response.json({ success: true, updated: Object.keys(updates) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});