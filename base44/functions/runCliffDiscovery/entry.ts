import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { normText, daysSinceStatus } from '../../shared/studentSignals.ts';

// CLIFF Discovery Engine (MVP): proactively scans for high-value, actionable
// changes relevant to the student's pursuits. Runs at most once per 12 hours
// per student; every discovery must change what the student should do next.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const email = user.email;
    const now = Date.now();

    const all = await base44.entities.CliffDiscovery.filter({ user_email: email }, '-created_date', 40).catch(() => []);
    const activeOf = (rows) => (rows || []).filter(d => ['new', 'viewed'].includes(d.status) && (!d.expires_date || new Date(d.expires_date).getTime() > now));

    // Throttle: generate at most once every 12 hours
    const newest = (all || [])[0];
    if (newest && now - new Date(newest.created_date).getTime() < 12 * 3600000) {
      return Response.json({ discoveries: activeOf(all).slice(0, 2) });
    }

    const [pursuits, pipeline, drops, parents] = await Promise.all([
      base44.entities.JobPursuit.filter({ user_email: email }, '-updated_date', 20).catch(() => []),
      base44.entities.NetworkingPipeline.filter({ user_email: email }, '-created_date', 100).catch(() => []),
      base44.entities.UserDailyDrop.filter({ user_email: email, drop_date: new Date().toISOString().slice(0, 10) }).catch(() => []),
      user.school_code
        ? base44.asServiceRole.entities.ParentNetworkProfile.filter({ school_code: user.school_code, is_active: true }, '-created_date', 100).catch(() => [])
        : Promise.resolve([]),
    ]);

    const seen = new Set((all || []).map(d => d.discovery_key).filter(Boolean));
    const found = [];
    const expiry = new Date(now + 3 * 86400000).toISOString();
    const norm = normText;
    const tokens = (s) => norm(s).split(/[^a-z]+/).filter(w => w.length > 3 && !['intern', 'internship', 'summer'].includes(w));
    const activePursuits = (pursuits || []).filter(p => !['archived', 'rejected', 'withdrawn'].includes(p.application_status));

    // 1. Better job found — today's feed has a similar role at a different company
    const slots = ((drops || [])[0]?.slots) || [];
    // Shared Location Intelligence: a job is only "better" if it's still better
    // AFTER location — never suggest relocation the student explicitly rejected.
    const slotLoc: any = {};
    if (slots.length) {
      try {
        const locRes = await base44.functions.invoke('locationIntelligence', {
          jobs: slots.map((s: any, i: number) => ({ key: String(i), location: s.location || '', title: s.role || s.title || s.job_title || '' })),
          log_context: 'discovery',
        });
        for (const ev of ((locRes as any)?.data?.evaluations || (locRes as any)?.evaluations || [])) slotLoc[ev.key] = ev;
      } catch (e) { /* service optional */ }
    }
    outer: for (const p of activePursuits) {
      const pt = tokens(p.job_title);
      if (!pt.length) continue;
      for (let si = 0; si < slots.length; si++) {
        const s = slots[si];
        const sEval = slotLoc[String(si)];
        if (sEval?.hard_constraint_violation || sEval?.location_match === 'mismatch') continue;
        const sCompany = s.company || s.company_name || '';
        const sRole = s.role || s.title || s.job_title || '';
        if (!sCompany || !sRole || norm(sCompany) === norm(p.company_name)) continue;
        const overlap = tokens(sRole).filter(w => pt.includes(w));
        if (overlap.length >= 1) {
          const key = `better:${norm(sCompany)}:${norm(sRole)}`;
          if (!seen.has(key)) {
            found.push({
              user_email: email, discovery_key: key, discovery_type: 'better_job',
              headline: `I found a role at ${sCompany} worth a look`,
              detail: `${sRole} at ${sCompany} looks like a strong fit alongside your ${p.company_name} pursuit.${sEval?.display_explanation && ['strong', 'tradeoff'].includes(sEval.location_match) ? ` ${sEval.display_explanation}` : ''}`,
              reason: 'Similar role, fresh posting — more shots on goal for the same prep.',
              action_label: 'View Job', action_route: 'workspace',
              company_name: sCompany, job_title: sRole, job_url: s.job_url || s.url || '',
              expires_date: expiry,
            });
          }
          break outer;
        }
      }
    }

    // 2. New connection — recently joined network member at a company you're pursuing
    const targetCompanies = new Set([
      ...activePursuits.map(p => norm(p.company_name)),
      ...(pipeline || []).map(r => norm(r.company)),
    ].filter(Boolean));
    const recentMembers = (parents || []).filter(pp => now - new Date(pp.created_date).getTime() < 14 * 86400000);
    for (const pp of recentMembers) {
      if (targetCompanies.has(norm(pp.company_name))) {
        const key = `conn:${norm(pp.company_name)}`;
        if (!seen.has(key)) {
          found.push({
            user_email: email, discovery_key: key, discovery_type: 'new_connection',
            headline: `I found a possible connection at ${pp.company_name}`,
            detail: `Someone in your network who works at ${pp.company_name} just became available to help.`,
            reason: 'A warm intro can multiply your odds on this application.',
            action_label: 'View Connection', action_route: 'workspace',
            company_name: pp.company_name,
            job_title: activePursuits.find(p => norm(p.company_name) === norm(pp.company_name))?.job_title || '',
            expires_date: expiry,
          });
        }
        break;
      }
    }

    // 3. Follow-up opportunity — applied 10+ days ago, no movement
    const daysSince = daysSinceStatus;
    const staleApplied = (pipeline || []).find(r => r.status === 'applied' && daysSince(r) >= 10);
    if (staleApplied) {
      const key = `followup:${norm(staleApplied.company)}`;
      if (!seen.has(key)) {
        found.push({
          user_email: email, discovery_key: key, discovery_type: 'follow_up',
          headline: `Good moment to follow up with ${staleApplied.company}`,
          detail: `It's been ${Math.floor(daysSince(staleApplied))} days since you applied — a short check-in keeps you on their radar.`,
          reason: 'Polite follow-ups around day 10 often revive quiet applications.',
          action_label: 'Draft Follow-Up', action_route: '#/ApplicationTracker',
          company_name: staleApplied.company, expires_date: expiry,
        });
      }
    }

    // 4. Interview prep — an interview is in play
    const interviewing = (pipeline || []).find(r => r.status === 'interview');
    if (interviewing) {
      const key = `prep:${norm(interviewing.company)}`;
      if (!seen.has(key)) {
        found.push({
          user_email: email, discovery_key: key, discovery_type: 'interview_prep',
          headline: `Let's prep for your ${interviewing.company} interview`,
          detail: 'Five focused minutes of practice now beats an hour of nerves later.',
          reason: 'You have an interview in play — the highest-leverage move on your board.',
          action_label: 'Practice Now', action_route: '#/MockInterview',
          company_name: interviewing.company, expires_date: expiry,
        });
      }
    }

    // High-relevance only: surface at most the top 2
    const toCreate = found.slice(0, 2);
    const created = toCreate.length ? await base44.entities.CliffDiscovery.bulkCreate(toCreate) : [];
    return Response.json({ discoveries: [...(created || []), ...activeOf(all)].slice(0, 2) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});