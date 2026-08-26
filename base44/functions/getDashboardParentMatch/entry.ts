import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { resolveStudentProfile } from '../../shared/studentProfile.ts';

// Returns the best parent match for the student's target industry + school ecosystem.
// Used by CliFF to power the personalized welcome bubble on dashboard mount.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Single profile source of truth — the same resolver the job feed and
    // next-move queue use. The legacy `target_industry` flat field is stale for
    // many students (e.g. "Engineering & Technology" left over from onboarding)
    // and must never override the field their career goals actually state.
    const profile = resolveStudentProfile(user, []);
    const desiredIndustry = profile.field;
    const schoolCode = (user.school_code || '').toUpperCase();

    // School is required; industry only improves ranking — new students without a
    // target industry still get their first warm match from the full school pool.
    if (!schoolCode) {
      return Response.json({ match_found: false });
    }

    // Seniority keywords ordered by priority — highest first
    const SENIOR_KEYWORDS = ['ceo', 'cto', 'coo', 'cfo', 'chief', 'president', 'vp', 'vice president', 'svp', 'evp', 'partner', 'director', 'head', 'principal', 'senior manager', 'manager'];

    // Fetch all active parents in this school ecosystem
    const parents = await base44.asServiceRole.entities.ParentNetworkProfile.filter({
      school_code: schoolCode,
      is_active: true,
    });

    if (!parents || parents.length === 0) {
      return Response.json({ match_found: false });
    }

    // Filter to parents whose company or role title matches the student's field
    const industryKeywords = profile.fieldTerms;
    const matching = parents.filter(p => {
      const haystack = `${p.role_title} ${p.company_name} ${p.company_domain}`.toLowerCase();
      return industryKeywords.some(kw => haystack.includes(kw));
    });

    // A student with a stated field never gets an unrelated parent presented as
    // their warm connection — an honest "no match yet" beats a random one.
    if (industryKeywords.length > 0 && matching.length === 0) {
      return Response.json({ match_found: false });
    }
    const pool = matching.length > 0 ? matching : parents;

    // Sort by seniority — pick the most senior person first
    const ranked = pool.sort((a, b) => {
      const aRank = SENIOR_KEYWORDS.findIndex(k => (a.role_title || '').toLowerCase().includes(k));
      const bRank = SENIOR_KEYWORDS.findIndex(k => (b.role_title || '').toLowerCase().includes(k));
      const aScore = aRank === -1 ? 99 : aRank;
      const bScore = bRank === -1 ? 99 : bRank;
      return aScore - bScore;
    });

    // Rotate daily through the top of the pool so the card never feels frozen —
    // same student, different (still strong) warm connection across days.
    const rotationPool = ranked.slice(0, Math.min(ranked.length, 5));
    const dayNumber = Math.floor(Date.now() / 86400000);
    const best = rotationPool[dayNumber % rotationPool.length];

    return Response.json({
      match_found: true,
      parent: {
        first_name: best.first_name,
        role_title: best.role_title,
        company_name: best.company_name,
        linkedin_url: best.linkedin_url || null,
      },
      industry: desiredIndustry,
      school_code: schoolCode,
      total_pool: pool.length,
    });
  } catch (error) {
    console.error('[getDashboardParentMatch]', error.message);
    return Response.json({ match_found: false, error: error.message }, { status: 500 });
  }
});