import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Upserts the unified JobPursuit record for a student + job, computing each
// material status from real data (tailored resumes, outreach pipeline), deriving
// CLIFF's recommended next action, and keeping one active CliffActivity per pursuit.
// CLIFF only PREPARES here — nothing is submitted or sent without the student.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const p = await req.json().catch(() => ({}));
    const company = (p.company || '').trim();
    const role = (p.role || '').trim();
    if (!company || !role) return Response.json({ error: 'company and role are required' }, { status: 400 });

    const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    const [pursuits, resumes, pipeline] = await Promise.all([
      base44.entities.JobPursuit.filter({ user_email: user.email }, '-created_date', 200).catch(() => []),
      base44.entities.TailoredResume.filter({ user_email: user.email }, '-created_date', 50).catch(() => []),
      base44.entities.NetworkingPipeline.filter({ user_email: user.email }, '-created_date', 100).catch(() => []),
    ]);

    const existing = (pursuits || []).find(
      (x) => norm(x.company_name) === norm(company) && norm(x.job_title) === norm(role)
    );

    // Resume status from real tailoring records
    const resume = (resumes || []).find((r) => {
      if (norm(r.company_name) !== norm(company)) return false;
      const rt = norm(r.role_title);
      const target = norm(role);
      return !rt || rt === target || rt.includes(target) || target.includes(rt);
    });
    let resumeStatus = 'not_started';
    if (resume) {
      if (resume.status === 'pending') resumeStatus = 'generating';
      else if (resume.status === 'completed') resumeStatus = resume.downloaded_at ? 'complete' : 'ready_for_review';
    }

    // Outreach status from the networking pipeline
    const pipe = (pipeline || []).find((r) => norm(r.company) === norm(company));
    let outreachStatus = existing?.outreach_status || 'not_started';
    if (pipe?.alumni_name) {
      if (pipe.status === 'replied' || pipe.status === 'coffee_chat' || pipe.status === 'intro_made') outreachStatus = 'replied';
      else if (pipe.status === 'reached_out' || pipe.status === 'messaged') outreachStatus = 'sent';
      else outreachStatus = 'drafted';
    }

    const connectionStatus = p.connectionsSearched ? 'complete' : (existing?.connection_search_status || 'not_started');
    const researchStatus = p.companyResearched ? 'complete' : (existing?.company_research_status || 'not_started');

    // Never downgrade an application the student already moved forward
    const advanced = ['applied', 'follow_up_due', 'interviewing', 'offer', 'rejected', 'withdrawn', 'archived'];
    let applicationStatus = existing?.application_status;
    if (!applicationStatus || !advanced.includes(applicationStatus)) {
      applicationStatus = (resumeStatus === 'ready_for_review' || resumeStatus === 'approved' || resumeStatus === 'complete')
        ? 'ready_to_apply' : 'preparing';
    }

    // CLIFF's recommended next step (student always executes it)
    let nextAction;
    let actType = 'application_update';
    if (resumeStatus === 'not_started') {
      nextAction = 'Let CLIFF tailor your resume for this role';
      actType = 'resume_review_required';
    } else if (resumeStatus === 'generating') {
      nextAction = 'Your tailored resume is being prepared — check back shortly';
    } else if (resumeStatus === 'ready_for_review') {
      nextAction = 'Review and approve the resume CLIFF prepared for you';
      actType = 'application_ready';
    } else if (outreachStatus === 'drafted') {
      nextAction = "Review and send CLIFF's outreach draft — nothing goes out without you";
      actType = 'outreach_ready';
    } else if (!advanced.includes(applicationStatus)) {
      nextAction = 'Submit your application, then mark it Applied so CLIFF can track it';
      actType = 'application_ready';
    } else {
      nextAction = "You've applied — CLIFF will remind you when a follow-up is due";
    }

    const data = {
      user_id: user.id,
      user_email: user.email,
      job_id: p.jobId || existing?.job_id || '',
      company_name: company,
      job_title: role,
      job_url: p.jobUrl || existing?.job_url || '',
      location: p.location || existing?.location || '',
      fit_level: p.fitLevel || existing?.fit_level || '',
      fit_explanation: p.fitExplanation || existing?.fit_explanation || '',
      cliff_recommendation: p.recommendation || existing?.cliff_recommendation || '',
      resume_status: resumeStatus,
      cover_letter_status: existing?.cover_letter_status || 'not_started',
      company_research_status: researchStatus,
      connection_search_status: connectionStatus,
      outreach_status: outreachStatus,
      application_status: applicationStatus,
      interview_status: existing?.interview_status || 'none',
      next_action: nextAction,
    };

    let pursuit;
    if (existing) {
      pursuit = await base44.entities.JobPursuit.update(existing.id, data);
    } else {
      pursuit = await base44.entities.JobPursuit.create(data);
    }
    const pursuitId = pursuit?.id || existing?.id;

    // Keep exactly one active CliffActivity per pursuit, reflecting the next action
    if (pursuitId) {
      const acts = await base44.entities.CliffActivity.filter(
        { user_email: user.email, job_pursuit_id: pursuitId }, '-created_date', 10
      ).catch(() => []);
      const active = (acts || []).find((a) => a.status === 'new' || a.status === 'viewed');
      if (active) {
        if (active.title !== nextAction) {
          await base44.entities.CliffActivity.update(active.id, { title: nextAction, activity_type: actType });
        }
      } else {
        await base44.entities.CliffActivity.create({
          user_id: user.id,
          user_email: user.email,
          job_pursuit_id: pursuitId,
          activity_type: actType,
          title: nextAction,
          summary: `${role} at ${company}`,
          reason: 'CLIFF is preparing this application with you',
          priority: 'high',
          action_label: 'Open workspace',
          action_route: 'workspace',
          company_name: company,
          job_title: role,
          status: 'new',
        });
      }
    }

    return Response.json({ success: true, pursuit: { ...data, id: pursuitId } });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});