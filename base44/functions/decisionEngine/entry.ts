import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// CLIFF Decision Engine — pure logic, no AI.
// Every piece of state answers one question: does it change the student's
// best next move? Exactly ONE move surfaces. Everything else is either
// scheduled on the timeline or suppressed with a stated reason (overridable).
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [pipelineRaw, resumesRaw, plans, masterResumesRaw] = await Promise.all([
      base44.entities.NetworkingPipeline.filter({ user_email: user.email }, '-created_date', 100).catch(() => []),
      base44.entities.TailoredResume.filter({ user_email: user.email }, '-created_date', 20).catch(() => []),
      base44.entities.CareerPlan.filter({ user_email: user.email, status: 'active' }, '-created_date', 1).catch(() => []),
      base44.entities.Resume.filter({ student_email: user.email }, '-created_date', 1).catch(() => []),
    ]);
    const pipeline = pipelineRaw || [];
    const resumes = resumesRaw || [];
    const plan = plans?.[0] || null;

    const now = Date.now();
    const daysSince = (r) => (now - new Date(r.status_date || r.created_date).getTime()) / 86400000;
    const atDay = (offset) => { const d = new Date(); d.setDate(d.getDate() + offset); return d.toISOString(); };
    const today = new Date().toISOString();
    const route = (r) => ({ type: 'route', route: r });
    const ws = (p) => ({ type: 'workspace', payload: p });

    const timeline: any[] = [];
    const suppressed: string[] = [];

    // 🎉 Wins first — celebrate before directing
    const win = pipeline.find(r => ['replied', 'interview', 'offer'].includes(r.status) && daysSince(r) < 3);
    if (win) {
      const msg = win.status === 'offer' ? `You got the offer from ${win.company}. You CLIFFed it. 🎉`
        : win.status === 'interview' ? `You got the ${win.company} interview. You CLIFFed it.`
        : `${win.alumni_name || win.company} replied — momentum!`;
      timeline.push({ emoji: '🎉', date: today, text: msg, cta: 'View', action: route('#/ApplicationTracker') });
    }

    // ── Candidate facts ─────────────────────────────────────────────────
    const offer = pipeline.find(r => r.status === 'offer' && daysSince(r) < 14);
    const interviews = pipeline.filter(r => r.status === 'interview');
    const interviewSoon = interviews.find(r => {
      if (!r.interview_date) return false;
      const hrs = (new Date(r.interview_date).getTime() - now) / 3600000;
      return hrs > 0 && hrs <= 48;
    });
    const followUpsDue = pipeline.filter(r => ['reached_out', 'messaged'].includes(r.status) && daysSince(r) >= 5)
      .sort((a, b) => daysSince(b) - daysSince(a));
    const followUpsLater = pipeline.filter(r => ['reached_out', 'messaged'].includes(r.status) && daysSince(r) < 5);
    const readyResume = resumes.find(r => r.status === 'completed' && !r.downloaded_at);
    const unprepared = pipeline.find(r => ['identified', 'matched'].includes(r.status)
      && !resumes.some(t => (t.company_name || '').toLowerCase() === (r.company || '').toLowerCase()));
    const opps = plan?.opportunities || [];
    // No master resume on file — blocks every application CLIFF could prepare.
    // Deliberately ranked BELOW offers, imminent interviews, and due follow-ups:
    // adding a resume never outranks a live deadline.
    const noResume = !(masterResumesRaw || []).length;

    // ── THE decision: one move, strict priority ladder ─────────────────
    let move: any; let urgency = 'normal';
    if (offer) {
      urgency = 'high';
      move = { title: `Respond to your ${offer.company} offer`, reason: 'An offer on the table outranks everything else on your plate.', time: '~10 minutes', outcome: 'A decision made — or terms negotiated.', cta: 'Review', action: route('#/ApplicationTracker') };
    } else if (interviewSoon) {
      urgency = 'high';
      move = { title: `Practice your ${interviewSoon.company} interview`, reason: 'Your interview is the highest-stakes event on your calendar right now.', time: '~15 minutes', outcome: 'Walk in with rehearsed answers instead of nerves.', cta: 'Practice', action: route('#/MockInterview') };
    } else if (followUpsDue[0]) {
      urgency = 'high';
      const f = followUpsDue[0];
      move = { title: `Send your ${f.company} follow-up`, reason: `It's been ${Math.floor(daysSince(f))} days with no reply — a short nudge now keeps you on their radar.`, time: '~2 minutes', outcome: 'Roughly doubles your chance of a response versus staying silent.', cta: 'Send', action: route('#/ApplicationTracker') };
      // Only send this ONE today — hold the rest, scheduled tomorrow onward
      followUpsDue.slice(1, 3).forEach((r, i) => {
        suppressed.push(`I'm holding your ${r.company} follow-up until tomorrow — one nudge at a time gets replies.`);
        timeline.push({ emoji: '⏰', date: atDay(i + 1), text: `Follow up with ${r.alumni_name || r.company}`, cta: 'Follow up', action: route('#/ApplicationTracker') });
      });
    } else if (noResume && (unprepared || opps.length)) {
      const target = unprepared?.company || opps[0]?.company || '';
      move = { title: 'Add your resume', reason: `You're ready to apply${target ? ` to ${target}` : ''} — I just need your resume to prepare a strong, tailored application.`, time: '~1 minute', outcome: 'Unlocks tailored applications and sharper matches — even a rough draft works.', cta: 'Add resume', action: route('#/ResumeTailoring') };
    } else if (readyResume && (readyResume.company_name || '').trim()) {
      // Apply task → job workspace, NOT Resume Studio. The resume is already
      // tailored; the workspace is where the student reviews it and submits.
      const company = readyResume.company_name.trim();
      move = { title: `Apply to ${company}`, reason: "I already tailored your resume — review it and submit your application.", time: '~5 minutes', outcome: `A submitted application at ${company}.`, cta: 'Continue', action: ws({ company, role: readyResume.role_title || '', jobDescription: readyResume.job_description || '', jobUrl: readyResume.job_url || '', location: readyResume.location || '' }) };
    } else if (unprepared && (unprepared.company || '').trim()) {
      const company = unprepared.company.trim();
      move = { title: `Apply to ${company}`, reason: "It's already in your pipeline — I'll prep the whole application with you.", time: '~20 minutes', outcome: `A submit-ready application at ${company}.`, cta: 'Continue', action: ws({ company, role: unprepared.job_title || '', jobDescription: unprepared.job_description || '', jobUrl: unprepared.job_url || '', location: unprepared.location || '' }) };
    } else if (opps[0]) {
      // Shared Location Intelligence: never pick a plan opportunity that violates
      // an explicit location constraint; explain location fit in the reason.
      let oppEvals: any[] = [];
      try {
        const locRes = await base44.functions.invoke('locationIntelligence', {
          jobs: opps.map((x: any, i: number) => ({ key: String(i), location: x.location || '', title: x.role || '' })),
          log_context: 'decision_engine',
        });
        oppEvals = (locRes as any)?.data?.evaluations || (locRes as any)?.evaluations || [];
      } catch (e) { /* service optional */ }
      const evalOf = (i: number) => oppEvals.find((ev: any) => ev.key === String(i));
      let pickIdx = opps.findIndex((_x: any, i: number) => !evalOf(i)?.hard_constraint_violation);
      if (pickIdx < 0) pickIdx = 0;
      const o = opps[pickIdx];
      const oLoc = evalOf(pickIdx);
      // Never build an "Apply to" move without a resolvable company+role target.
      if (!(o.company || '').trim() || !(o.role || '').trim()) {
        move = { title: 'Tell me your goal', reason: "I don't have an active plan for you yet — give me a goal and I'll line everything up.", time: '~30 seconds', outcome: 'A full plan with your 3 best opportunities.', cta: 'Start', action: { type: 'goal' } };
      } else {
        let reason = o.beat_others || `It's my top pick for "${plan.goal_summary}".`;
        if (oLoc?.display_explanation && ['strong', 'tradeoff'].includes(oLoc.location_match)) reason += ` ${oLoc.display_explanation}`;
        move = { title: `Apply to ${o.company.trim()}`, reason, time: o.effort || '~20 minutes', outcome: 'Your strongest current shot at your goal.', cta: 'Continue', action: ws({ company: o.company.trim(), role: o.role, jobUrl: o.url || '', location: o.location || '' }) };
      }
      const held = opps.filter((_x: any, i: number) => i !== pickIdx);
      if (held.length) {
        suppressed.push(`I'm holding ${held.map((x: any) => x.company).join(' and ')} until ${o.company} is submitted — one great application beats three rushed ones.`);
      }
    } else {
      move = { title: 'Tell me your goal', reason: "I don't have an active plan for you yet — give me a goal and I'll line everything up.", time: '~30 seconds', outcome: 'A full plan with your 3 best opportunities.', cta: 'Start', action: { type: 'goal' } };
    }
    timeline.push({ emoji: '🔥', date: today, text: move.title, cta: move.cta, action: move.action });

    // ── Scheduled (not decisions for today) ─────────────────────────────
    for (const r of followUpsLater.slice(0, 2)) {
      const due = new Date(new Date(r.status_date || r.created_date).getTime() + 5 * 86400000);
      timeline.push({ emoji: '⏰', date: due.toISOString(), text: `Follow up with ${r.alumni_name || r.company}`, cta: 'Follow up', action: route('#/ApplicationTracker') });
    }
    const interviewLater = !interviewSoon && interviews[0];
    if (interviewLater) {
      const iDate = interviewLater.interview_date ? new Date(interviewLater.interview_date) : new Date(atDay(2));
      const prep = new Date(iDate.getTime() - 86400000);
      timeline.push({ emoji: '🎤', date: (prep < new Date() ? new Date() : prep).toISOString(), text: `Practice interview for ${interviewLater.company}`, cta: 'Practice', action: route('#/MockInterview') });
    }
    const stale = pipeline.find(r => r.status === 'applied' && daysSince(r) >= 7);
    if (stale) timeline.push({ emoji: '⏰', date: atDay(1), text: `Check in on your ${stale.company} application`, cta: 'Update', action: route('#/ApplicationTracker') });

    timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const waiting = pipeline.filter(r => r.status === 'applied' && daysSince(r) < 7)
      .slice(0, 2).map(r => `${r.company} application under review`);

    return Response.json({ move, urgency, timeline: timeline.slice(0, 5), waiting, suppressed: suppressed.slice(0, 3) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});