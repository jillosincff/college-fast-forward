import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// CLIFF Learning Engine — records every recommendation and its early signals.
// events: 'shown' (verdict rendered) | 'pursued' (student acted) | 'applied'
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { company, role, event, recommendation_level, verdict, score, job_id } = await req.json();
    if (!company || !event) return Response.json({ error: 'company and event are required' }, { status: 400 });

    const db = base44.asServiceRole.entities;
    const jobKey = `${String(company).toLowerCase().trim()}||${String(role || '').toLowerCase().trim()}`;

    const existing = await db.RecommendationOutcome.filter({ user_id: user.id, job_key: jobKey }, '-created_date', 1);
    let record = existing?.[0];

    if (!record) {
      const plans = await db.UserAccessPlan.filter({ user_id: user.id }, '-created_date', 1);
      const fields: Record<string, unknown> = {
        user_id: user.id,
        user_email: user.email,
        job_key: jobKey,
        job_id: job_id || '',
        company_name: company,
        job_title: role || '',
        recommendation_level: ['best', 'good', 'low'].includes(recommendation_level) ? recommendation_level : 'good',
        verdict: ['pursue', 'consider', 'skip'].includes(verdict) ? verdict : 'consider',
        school_code: user.school_code || '',
        plan: plans?.[0]?.plan || 'free',
      };
      if (typeof score === 'number') fields.confidence_before = score;
      record = await db.RecommendationOutcome.create(fields);
    }

    const updates: Record<string, boolean> = {};
    if (event === 'pursued' && !record.pursued) updates.pursued = true;
    if (event === 'applied') {
      if (!record.pursued) updates.pursued = true;
      if (!record.applied) updates.applied = true;
    }
    if (Object.keys(updates).length > 0) await db.RecommendationOutcome.update(record.id, updates);

    return Response.json({ success: true, id: record.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});