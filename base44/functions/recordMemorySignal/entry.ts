import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// CLIFF memory engine.
// - Explicit statements ({ text }) → LLM-extracted lasting preferences, confidence 100, active immediately.
// - Behavioral signals ({ event, company, role, location }) → confidence builds with repetition;
//   a memory only becomes active (and starts influencing recommendations) at confidence >= 50 (~3 repeats).
// One accidental click never creates an active memory.

const FAMILIES = {
  sales: ['sales', 'account executive', 'business development', 'bdr', 'sdr'],
  marketing: ['marketing', 'brand', 'social media', 'content', 'growth'],
  finance: ['finance', 'financial', 'banking', 'accounting', 'audit', 'investment'],
  engineering: ['engineer', 'developer', 'software', 'devops'],
  healthcare: ['nurse', 'clinical', 'health', 'medical', 'pharma'],
  data: ['data', 'analytics', 'analyst', 'machine learning'],
  design: ['design', 'ux', 'ui', 'creative'],
  operations: ['operations', 'logistics', 'supply chain'],
  consulting: ['consultant', 'consulting'],
  hr: ['recruit', 'human resources', 'people ops', 'talent'],
};

const familyOf = (role) => {
  const r = (role || '').toLowerCase();
  for (const [fam, kws] of Object.entries(FAMILIES)) {
    if (kws.some(k => r.includes(k))) return fam;
  }
  return null;
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const email = user.email;

    const upsert = async (category, value, explicit) => {
      const v = (value || '').toLowerCase().trim();
      if (!category || !v) return null;
      const existing = await base44.entities.StudentMemory.filter({ user_email: email, category, value: v });
      if (existing?.length) {
        const m = existing[0];
        const count = (m.signal_count || 0) + 1;
        const confidence = explicit ? 100 : Math.max(m.confidence || 0, Math.min(90, count * 18));
        return await base44.entities.StudentMemory.update(m.id, {
          signal_count: count,
          confidence,
          // Respect a student's manual off-switch — never silently re-activate
          active: m.active === false && m.signal_count > 1 ? false : confidence >= 50,
          source: explicit ? 'explicit' : (m.source || 'behavior'),
        });
      }
      return await base44.entities.StudentMemory.create({
        user_email: email,
        category,
        value: v,
        confidence: explicit ? 100 : 18,
        signal_count: 1,
        source: explicit ? 'explicit' : 'behavior',
        active: !!explicit,
      });
    };

    const results = [];

    if (body.text) {
      // Explicit statement — extract only lasting, recommendation-relevant preferences
      const extracted = await base44.integrations.Core.InvokeLLM({
        prompt: `A college student told their career coach: "${body.text}".
Extract only LASTING career preferences that would improve future job recommendations. Ignore temporary searches, one-time remarks, emotional statements, and anything sensitive or personal.
For each preference output:
- category: exactly one of: preferred_industries, disliked_industries, preferred_locations, excluded_locations, target_companies, avoided_companies, preferred_work_style, salary_goals, internship_vs_fulltime, remote_preference, networking_comfort, interview_confidence, career_priorities
- value: a short lowercase value (e.g. "sales", "florida", "remote", "under 1000 employees")
If nothing qualifies, return an empty list.`,
        response_json_schema: {
          type: 'object',
          properties: {
            memories: {
              type: 'array',
              items: { type: 'object', properties: { category: { type: 'string' }, value: { type: 'string' } } },
            },
          },
        },
      });
      for (const m of (extracted?.memories || [])) {
        results.push(await upsert(m.category, m.value, true));
      }
    } else if (body.event === 'job_dismissed' || body.event === 'job_saved') {
      const saved = body.event === 'job_saved';
      const fam = familyOf(body.role);
      if (fam) results.push(await upsert(saved ? 'preferred_industries' : 'disliked_industries', fam, false));
      if (saved && body.company) results.push(await upsert('target_companies', body.company, false));
      if (saved && body.location) {
        const city = (body.location || '').split(',')[0].trim();
        if (city && !/remote/i.test(city)) results.push(await upsert('preferred_locations', city, false));
      }
    } else if (body.category && body.value) {
      results.push(await upsert(body.category, body.value, body.explicit !== false));
    }

    return Response.json({ ok: true, memories: results.filter(Boolean) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});