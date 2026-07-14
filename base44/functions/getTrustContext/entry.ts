import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// CLIFF Trust Engine — explains CLIFF's thinking for one opportunity.
// Never exposes raw scores. Only reasons derived from REAL data:
// fit assessment, tailored resume, networking value, the student's goal,
// and actual skip decisions. Also derives the outcome timeline and
// "what changed" from real record history — never invented progress.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { companyName, roleTitle = '' } = await req.json().catch(() => ({}));
    if (!companyName) return Response.json({ error: 'companyName required' }, { status: 400 });

    const [pursuits, resumes, netRecs, plans, skips, pipeline] = await Promise.all([
      base44.entities.JobPursuit.filter({ user_email: user.email, company_name: companyName }).catch(() => []),
      base44.entities.TailoredResume.filter({ user_email: user.email, company_name: companyName }, '-created_date', 3).catch(() => []),
      base44.entities.NetworkingRecommendation.filter({ user_email: user.email, company_name: companyName }).catch(() => []),
      base44.entities.CareerPlan.filter({ user_email: user.email, status: 'active' }).catch(() => []),
      base44.entities.RecommendationOutcome.filter({ user_email: user.email, verdict: 'skip' }, '-created_date', 6).catch(() => []),
      base44.entities.NetworkingPipeline.filter({ user_email: user.email, company: companyName }).catch(() => []),
    ]);

    const pursuit = (pursuits || [])[0] || null;
    const resume = (resumes || []).find((r) => r.status === 'completed') || (resumes || [])[0] || null;
    const netRec = (netRecs || [])[0] || null;
    const plan = (plans || [])[0] || null;
    const pipe = (pipeline || [])[0] || null;

    // ── "Why this?" — natural reasons, only from real signals ──
    const reasons = [];
    if (plan?.goal_summary) {
      const roleLower = (roleTitle || '').toLowerCase();
      const matchesGoal = (plan.target_roles || []).some((r) => roleLower.includes((r || '').toLowerCase()) || (r || '').toLowerCase().includes(roleLower.split(' ')[0] || '@'));
      reasons.push(matchesGoal
        ? `It closely matches your goal: ${plan.goal_summary}.`
        : `It fits the direction you set with me: ${plan.goal_summary}.`);
    }
    if (pursuit?.fit_level) {
      reasons.push(pursuit.fit_explanation
        ? `${pursuit.fit_explanation}`
        : `I assessed this as a ${pursuit.fit_level} for your background.`);
    }
    if (resume?.ats_score >= 75) reasons.push('Your tailored resume is already a strong match here.');
    else if (resume) reasons.push('You already have a tailored resume in motion for this role.');
    if (netRec?.networking_value === 'HIGH') reasons.push(`There's a real networking advantage here — ${netRec.best_contact_name} is a warm path in.`);
    else if (netRec?.networking_value === 'MEDIUM') reasons.push('There may be a networking angle worth using here.');
    else if (netRec?.networking_value === 'NONE') reasons.push("Networking won't move the needle here, so a strong application is the whole game — and yours can be strong.");
    if (reasons.length === 0) reasons.push('It aligns with what I know about your goals and background so far.');

    // ── "Why not the others?" — only real skip decisions ──
    const whyNot = [];
    for (const s of (skips || []).slice(0, 4)) {
      whyNot.push({ company: s.company_name, role: s.job_title || '', reason: s.reason_if_known || 'weaker fit with your goals than this one' });
    }
    if (plan?.skipped_note) whyNot.push({ company: '', role: '', reason: plan.skipped_note });

    // ── Confidence label — never a number ──
    let conf = 0;
    const fitStr = ((pursuit?.fit_level || '') + ' ' + (pursuit?.fit_explanation || '')).toLowerCase();
    if (/strong|excellent|great/.test(fitStr)) conf += 2;
    else if (/good|solid|promising/.test(fitStr)) conf += 1;
    else if (/weak|poor|stretch|low/.test(fitStr)) conf -= 2;
    if (resume?.ats_score >= 80) conf += 1;
    if (netRec?.networking_value === 'HIGH') conf += 1;
    const confidence = conf <= -1 ? 'Not recommended' : conf >= 3 ? 'Very confident' : conf === 2 ? 'Confident' : 'Worth considering';

    // ── Outcome timeline — derived from real records only ──
    const applied = ['applied', 'follow_up_due', 'interviewing', 'offer'].includes(pursuit?.application_status || '');
    const interviewed = pursuit?.application_status === 'interviewing' || pursuit?.interview_status !== 'none' && !!pursuit?.interview_status || !!pipe?.interview_date;
    const offered = pursuit?.application_status === 'offer' || !!pipe?.offer_date;
    const timeline = [
      { key: 'recommended', label: 'Recommendation made', done: !!pursuit, date: pursuit?.created_date || null },
      { key: 'resume', label: 'Resume prepared', done: !!resume && resume.status !== 'pending', date: resume?.created_date || null },
      { key: 'applied', label: 'Application submitted', done: applied, date: null },
      { key: 'follow_up', label: 'Follow-up sent', done: !!pipe?.follow_up_date, date: pipe?.follow_up_date || null },
      { key: 'interview', label: 'Interview earned', done: !!interviewed, date: pipe?.interview_date || null },
      { key: 'offer', label: 'Offer received', done: !!offered, date: pipe?.offer_date || null },
    ];

    // ── "What changed?" — real deltas since the original recommendation ──
    const changes = [];
    const t = (d) => (d ? new Date(d).getTime() : 0);
    if (pursuit && resume && t(resume.created_date) > t(pursuit.created_date) + 60000) {
      changes.push({ when: resume.created_date, text: 'Your resume improved after my original recommendation — this opportunity got stronger for you.' });
    }
    if (pursuit && netRec && t(netRec.created_date) > t(pursuit.created_date) + 60000 && ['HIGH', 'MEDIUM'].includes(netRec.networking_value)) {
      changes.push({ when: netRec.created_date, text: 'Networking became worthwhile — I found a connection after first recommending this.' });
    }
    if (pursuit?.next_action_due_date && t(pursuit.next_action_due_date) - Date.now() < 3 * 86400000 && t(pursuit.next_action_due_date) > Date.now() - 86400000) {
      changes.push({ when: pursuit.next_action_due_date, text: 'A follow-up is coming due — timing matters now.' });
    }
    changes.sort((a, b) => t(a.when) - t(b.when));

    return Response.json({ confidence, reasons, why_not: whyNot, timeline, changes });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});