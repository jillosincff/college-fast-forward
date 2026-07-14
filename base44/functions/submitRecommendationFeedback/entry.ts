import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Student answers "What happened?" on a graded recommendation.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { outcome_id, student_feedback, reason } = await req.json();
    const allowed = ['resume_screen', 'gpa_requirement', 'technical_interview', 'position_filled', 'no_response', 'other'];
    if (!outcome_id || !allowed.includes(student_feedback)) {
      return Response.json({ error: 'outcome_id and a valid student_feedback are required' }, { status: 400 });
    }

    const db = base44.asServiceRole.entities;
    const record = await db.RecommendationOutcome.get(outcome_id);
    if (!record || record.user_email !== user.email) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    await db.RecommendationOutcome.update(outcome_id, {
      student_feedback,
      reason_if_known: reason || '',
      follow_up_completed: true,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});