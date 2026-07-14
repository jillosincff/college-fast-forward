import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Admin: CLIFF Accuracy metrics — did following CLIFF's recommendations pay off?
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const db = base44.asServiceRole.entities;
    const rows: any[] = [];
    let skip = 0;
    while (skip < 10000) {
      const batch = await db.RecommendationOutcome.list('-created_date', 500);
      rows.push(...(batch || []));
      if (!batch || batch.length < 500) break;
      // list has no skip in SDK — cap at first 500 newest; enough until volume grows
      break;
    }

    const pct = (num: number, den: number) => (den > 0 ? Math.round((num / den) * 100) : null);
    const stats = (subset: any[]) => ({
      total: subset.length,
      interviews: subset.filter(r => r.interview).length,
      offers: subset.filter(r => r.offer).length,
      interview_rate: pct(subset.filter(r => r.interview).length, subset.length),
      offer_rate: pct(subset.filter(r => r.offer).length, subset.length),
    });

    const followed = rows.filter(r => r.pursued);
    const ignored = rows.filter(r => !r.pursued);
    const byLevel: Record<string, any> = {};
    for (const level of ['best', 'good', 'low']) {
      const subset = rows.filter(r => r.recommendation_level === level);
      byLevel[level] = {
        ...stats(subset),
        pursued: subset.filter(r => r.pursued).length,
        adoption_rate: pct(subset.filter(r => r.pursued).length, subset.length),
      };
    }

    const feedback: Record<string, number> = {};
    for (const r of rows) {
      if (r.student_feedback) feedback[r.student_feedback] = (feedback[r.student_feedback] || 0) + 1;
    }

    return Response.json({
      total_recommendations: rows.length,
      followed: stats(followed),
      ignored: stats(ignored),
      by_level: byLevel,
      adoption_rate_best: byLevel.best.adoption_rate,
      feedback_breakdown: feedback,
      applied_total: rows.filter(r => r.applied).length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});