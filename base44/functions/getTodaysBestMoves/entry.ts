import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// CLIFF's daily ranking engine. Answers one question:
// "If the student only has 20 minutes today, what should they do?"
// Returns at most 3 fully-actionable moves — never "browse" or "explore".

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const email = user.email;
    const today = new Date().toISOString().slice(0, 10);

    const [memories, pipelineRaw, resumesRaw, drops, discoveries] = await Promise.all([
      base44.entities.StudentMemory.filter({ user_email: email, active: true }, '-confidence', 100).catch(() => []),
      base44.entities.NetworkingPipeline.filter({ user_email: email }, '-created_date', 100).catch(() => []),
      base44.entities.TailoredResume.filter({ user_email: email }, '-created_date', 30).catch(() => []),
      base44.entities.UserDailyDrop.filter({ user_email: email, drop_date: today }).catch(() => []),
      base44.entities.CliffDiscovery.filter({ user_email: email, status: 'new' }, '-created_date', 10).catch(() => []),
    ]);

    // Demo/test employers must never reach a live queue
    const DEMO_COMPANIES = new Set(['acme', 'acme corp', 'acme inc', 'globex', 'initech', 'test company', 'demo company']);
    const isDemo = (name) => DEMO_COMPANIES.has(String(name || '').toLowerCase().trim());
    const pipeline = (pipelineRaw || []).filter(r => !isDemo(r.company));
    const resumes = (resumesRaw || []).filter(r => !isDemo(r.company_name));

    const daysSince = (r) => Math.floor((Date.now() - new Date(r.status_date || r.created_date).getTime()) / 86400000);
    // Every next-move title names the role + company so a student never sees a
    // vague "Apply to Acme Corp" when the role is known. Falls back to company
    // only when no role is available (never a dangling "at ").
    const roleAt = (role, company) => {
      const r = (role || '').trim();
      return r ? `${r} at ${company}` : company;
    };
    const avoids = (memories || []).filter(m => (m.confidence || 0) >= 70 && ['disliked_industries', 'avoided_companies', 'excluded_locations'].includes(m.category));
    const prefers = (memories || []).filter(m => (m.confidence || 0) >= 50 && ['preferred_industries', 'preferred_locations', 'target_companies'].includes(m.category));

    const candidates = [];

    // Resume already prepared → apply is nearly free.
    // Never surface a move with a missing company — "Apply to " with no target
    // is a broken hero. Skip resumes whose company we can't resolve.
    const readyResume = (resumes || []).find(r => r.status === 'completed' && !r.downloaded_at && (r.company_name || '').trim());
    if (readyResume) {
      const company = readyResume.company_name.trim();
      const role = (readyResume.role_title || '').trim();
      const conn = (pipeline || []).find(r => (r.company || '').toLowerCase() === company.toLowerCase() && r.alumni_name);
      const reasons = ['Resume ready — apply when you\'re set'];
      if ((readyResume.ats_score || 0) >= 75) reasons.unshift('Strong fit for your background');
      if (conn) reasons.push(`One possible connection available: ${conn.alumni_name}`);
      candidates.push({
        score: 92, kind: 'apply',
        title: `Apply to ${roleAt(role, company)}`,
        reasons, time: '6 min', action_label: 'Continue',
        action: { type: 'workspace', company, role, jobUrl: readyResume.job_url || '' },
        company,
        _warm: !!conn,
      });
    }

    // Follow-up window open, draft ready. Skip if company is missing.
    // A completed follow-up never resurfaces for at least 5 days, and leads
    // older than 21 days with no reply are cold — stop nagging about them.
    const daysFrom = (iso) => Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
    const followUp = (pipeline || []).find(r =>
      ((['reached_out', 'messaged'].includes(r.status) && daysSince(r) >= 5) || (r.status === 'applied' && daysSince(r) >= 7)) &&
      daysSince(r) <= 21 &&
      (r.follow_up_count || 0) < 2 &&
      (!r.follow_up_date || daysFrom(r.follow_up_date) >= 5) &&
      (r.company || '').trim()
    );
    if (followUp) {
      const company = followUp.company.trim();
      candidates.push({
        score: 88, kind: 'followup',
        title: `Follow up on ${roleAt(followUp.job_title, company)}`,
        reasons: [
          `You ${followUp.status === 'applied' ? 'applied' : 'reached out'} ${daysSince(followUp)} days ago — this is usually the right follow-up window`,
          'Your draft is already prepared',
        ],
        time: '30 sec', action_label: 'Send',
        action: { type: 'followup', company, role: followUp.job_title || '', contactName: followUp.alumni_name || '', pipelineId: followUp.id, followUpCount: followUp.follow_up_count || 0 },
        company,
      });
    }

    // Actionable discoveries (follow-up / interview types are already covered above)
    for (const d of (discoveries || [])) {
      if (['follow_up', 'interview_prep', 'company_news', 'pattern_insight'].includes(d.discovery_type)) continue;
      candidates.push({
        score: 72, kind: 'discovery',
        title: d.headline,
        reasons: [d.reason || d.detail].filter(Boolean),
        time: '3 min', action_label: d.action_label || 'Review',
        action: d.action_route && d.action_route !== 'workspace'
          ? { type: 'route', route: d.action_route }
          : { type: 'workspace', company: d.company_name || '', role: d.job_title || '', jobUrl: d.job_url || '' },
        company: d.company_name || '',
        discoveryId: d.id,
      });
    }

    // Mirror of the workspace verdict engine (cliffVerdict.js). A job that would
    // show "Skip" in the workspace must never be recommended as the next move —
    // recommending it and then telling the student to skip it is a contradiction.
    const goals = user.career_goals || {};
    const goalTargets = [goals.target_role, ...(goals.target_roles || [])].filter(Boolean).map(t => String(t).toLowerCase());
    const goalIndustries = (goals.target_industries || []).map(i => String(i).toLowerCase());
    const prefLocs = (user.preferred_locations || [])
      .map(l => String(l.display_label || l.city || l.metro || l.state || '').toLowerCase())
      .filter(Boolean);
    const strictLocation = user.location_flexibility === 'stay' || user.relocation_openness === 'no';
    const verdictScore = (s) => {
      const role = String(s.role || s.title || s.job_title || '').toLowerCase();
      const location = String(s.location || '').toLowerCase();
      let score = 0;
      const targetHit = goalTargets.find(t => role.includes(t) || t.includes(role));
      const industryHit = goalIndustries.find(i => role.includes(i));
      if (targetHit) score += 3;
      else if (industryHit) score += 2;
      else if (goalTargets.length || goalIndustries.length) score -= 1;
      // Level fit: internship vs full-time (mirrors cliffVerdict.js)
      const seeking = String(goals.seeking || '').toLowerCase();
      const looksIntern = /\bintern(ship)?\b|co-?op/.test(role);
      if (seeking === 'internship' && role && !looksIntern) score -= 3;
      else if (seeking === 'fulltime' && looksIntern) score -= 3;
      const isRemote = /remote/.test(location) || s.is_remote === true;
      if (isRemote && ['required', 'preferred'].includes(user.remote_preference)) score += 2;
      if (prefLocs.length) {
        const locMatch = prefLocs.find(p => location.includes(p) || (p.includes(',') && location.includes(p.split(',')[0].trim())));
        if (locMatch) score += 2;
        else if (!isRemote && location) {
          if (strictLocation) score -= 3;
          else if (user.relocation_openness !== 'yes') score -= 1;
        }
      }
      for (const m of (memories || [])) {
        const v = String(m.value || '').toLowerCase();
        if (!v) continue;
        if (m.category === 'preferred_locations' && !prefLocs.length && location.includes(v)) score += 2;
        else if (m.category === 'preferred_industries' && role.includes(v) && !industryHit) score += 1;
        else if (m.category === 'disliked_industries' && role.includes(v)) score -= 2;
      }
      if (s.hasAlumni || (s.alumniCount || 0) > 0 || (s.parentCount || 0) > 0) score += 3;
      if (s.posted_date) {
        const days = Math.floor((Date.now() - new Date(s.posted_date).getTime()) / 86400000);
        if (days >= 0 && days <= 3) score += 2;
        else if (days > 21) score -= 1;
      }
      return score;
    };

    // One best new job from today's curated drop — memory-aware, CLIFF picks it
    const drop = (drops || [])[0];
    if (drop) {
      const actioned = new Set(drop.actioned_keys || []);
      let skippedBy = null;
      const passes = (drop.slots || []).filter(s => {
        if (actioned.has(s.key)) return false;
        const hit = avoids.find(m => {
          const v = (m.value || '').toLowerCase();
          if (!v) return false;
          if (m.category === 'avoided_companies') return (s.company || '').toLowerCase().includes(v);
          if (m.category === 'excluded_locations') return (s.location || '').toLowerCase().includes(v);
          return (s.role || s.title || '').toLowerCase().includes(v);
        });
        if (hit) { skippedBy = hit; return false; }
        return true;
      });
      const prefHit = (s) => prefers.find(m => {
        const v = (m.value || '').toLowerCase();
        if (!v) return false;
        if (m.category === 'preferred_locations') return (s.location || '').toLowerCase().includes(v);
        if (m.category === 'target_companies') return (s.company || '').toLowerCase().includes(v);
        return (s.role || s.title || '').toLowerCase().includes(v);
      });
      // Shared Location Intelligence: a hard location violation never becomes a Best Move
      const locByKey = {};
      try {
        const locRes = await base44.functions.invoke('locationIntelligence', {
          jobs: passes.map((s, i) => ({ key: String(i), location: s.location || '', title: s.role || s.title || '' })),
          log_context: 'best_moves',
        });
        for (const ev of (locRes?.data?.evaluations || locRes?.evaluations || [])) locByKey[ev.key] = ev;
      } catch (e) { /* service optional — never block the move list */ }
      passes.forEach((s, i) => { s._loc = locByKey[String(i)] || null; });
      const nonViolating = passes.filter(s => !s._loc?.hard_constraint_violation);
      const locSkipped = passes.length - nonViolating.length;
      const rankedAll = nonViolating.length ? nonViolating : passes;
      // Never recommend a job the workspace would grade "Skip" (score < 2 = low tier)
      const ranked = rankedAll.filter(s => verdictScore(s) >= 2);
      ranked.sort((a, b) =>
        ((b._loc?.ranking_adjustment || 0) + (prefHit(b) ? 1 : 0)) - ((a._loc?.ranking_adjustment || 0) + (prefHit(a) ? 1 : 0)));
      const best = ranked[0];
      if (best && (best.company || '').trim()) {
        const pref = prefHit(best);
        const reasons = ['Strong match for your goals, and it recently opened — early applicants stand out'];
        if (best._loc?.display_explanation && ['strong', 'tradeoff'].includes(best._loc.location_match)) reasons.push(best._loc.display_explanation);
        if (locSkipped > 0) reasons.push(`I skipped ${locSkipped} similar role${locSkipped === 1 ? '' : 's'} because ${locSkipped === 1 ? 'it' : 'they'} didn't fit your location preferences`);
        if (pref && !best._loc?.display_explanation) reasons.push(pref.category === 'preferred_locations' ? `I prioritized ${pref.value} opportunities like you prefer` : `I know you're targeting ${pref.value}`);
        if (skippedBy) reasons.push(`I skipped ${skippedBy.value} ${skippedBy.category === 'excluded_locations' ? 'listings' : 'roles'} because ${skippedBy.source === 'explicit' ? "you told me you're not interested" : "you keep passing on them"}`);
        candidates.push({
          score: 65, kind: 'newjob',
          title: `Apply to ${roleAt(best.role || best.title, best.company)}`,
          reasons, time: '5 min', action_label: 'Apply',
          action: { type: 'workspace', company: best.company, role: best.role || best.title || '', jobUrl: best.jobUrl || best.job_url || '', location: best.location || '' },
          company: best.company,
          runner_up: ranked[1]?.company || '',
        });
      }
    }

    // Half-started application — finishing beats starting something new.
    // Skip if the company is missing so we never render a dangling title.
    const unprepared = (pipeline || []).find(r =>
      ['identified', 'matched'].includes(r.status) &&
      (r.company || '').trim() &&
      !(resumes || []).some(t => (t.company_name || '').toLowerCase() === (r.company || '').toLowerCase())
    );
    if (unprepared) {
      const company = unprepared.company.trim();
      candidates.push({
        score: 55, kind: 'complete',
        title: `Finish your ${roleAt(unprepared.job_title, company)} application`,
        reasons: ['You already started this one — finishing it beats starting something new'],
        time: '6 min', action_label: 'Complete',
        action: { type: 'workspace', company, role: unprepared.job_title || '' },
        company,
        _warm: !!unprepared.alumni_name,
      });
    }

    // Verdict gate: apply/complete moves point at jobs the workspace grades.
    // If the workspace would say "Skip", never recommend it as the next move.
    // (+2 mirrors the workspace's existing-progress bonus; >= 2 = at least "consider".)
    const gated = candidates.filter(c => {
      if (!['apply', 'complete'].includes(c.kind)) return true;
      return verdictScore({ role: c.action?.role || '', company: c.company, hasAlumni: c._warm }) + 2 >= 2;
    });

    // Rank, dedupe by company, keep 3. Never pad with busywork.
    gated.sort((a, b) => b.score - a.score);
    const moves = [];
    for (const c of gated) {
      if (moves.length >= 3) break;
      if (c.company && moves.some(m => (m.company || '').toLowerCase() === c.company.toLowerCase())) continue;
      const { score: _score, _warm: _w, ...move } = c; // confidence is advice, not a number — never expose scores
      moves.push(move);
    }

    // "Why This, Not That?" — explain each pick against what it beat
    const EDGE = {
      apply: 'your resume there is already prepared, so applying costs you almost nothing',
      followup: 'this follow-up window is closing — other opportunities will still be there tomorrow',
      discovery: 'it changes what your best next step is right now',
      newjob: 'it matches your goals and preferences more closely',
      complete: "you've already invested in it — finishing beats starting something new",
    };
    const label = (c) => c.kind === 'followup' ? `following up with ${c.company}` : (c.company || c.title);
    const chosen = new Set(moves.map(m => m.title));
    const passedOver = gated.filter(c => !chosen.has(c.title));
    moves.forEach((m, i) => {
      const whyNot = [];
      const alt = passedOver.find(c => (c.company || '').toLowerCase() !== (m.company || '').toLowerCase());
      if (alt) whyNot.push(`I also looked at ${label(alt)}, but ${EDGE[m.kind] || 'this is the better use of your time today'}.`);
      else if (moves[i + 1]) whyNot.push(`I put this ahead of ${label(moves[i + 1])} because ${EDGE[m.kind] || 'it moves you forward fastest'}.`);
      if (m.kind === 'newjob' && m.runner_up) whyNot.push(`${m.runner_up} is also open, but you have no clear edge there right now — ${m.company} gives you a stronger starting position.`);
      m.why_not = whyNot.slice(0, 2);
      delete m.runner_up;
    });

    return Response.json({ moves, all_done: moves.length === 0 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});