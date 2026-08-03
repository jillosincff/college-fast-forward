import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { normKey, daysSinceStatus } from '../../shared/studentSignals.ts';

// CLIFF's overnight run.
// The promise is "you did almost nothing and things started happening" — so the
// work has to be FINISHED before the student opens the app, not queued as a task.
// For each Pro student this prepares ONE complete application package:
//   1. picks the best untouched opportunity from their curated drop
//   2. tailors their resume against it (the heavy lift, done in advance)
//   3. looks for a warm network contact at that company
//   4. writes a NightlyBrief the dashboard reads back as "here's what I did"
// Cost control: one tailoring per student per night, capped batch per run.

const MAX_STUDENTS_PER_RUN = 25;

function briefDate() {
  const et = new Date(Date.now() - 4 * 3600000);
  return et.toISOString().slice(0, 10);
}

const norm = normKey;

const PRO_STATES = ['pro_active', 'trial_active', 'admin_granted', 'grandfathered', 'canceled_active_until_period_end'];

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me();
    if (!caller || caller.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const date = briefDate();
    const svc = base44.asServiceRole;

    const plans = await svc.entities.UserAccessPlan.filter({ plan: 'pro' }, '-updated_date', 200).catch(() => []);
    const eligible = (plans || []).filter(p => PRO_STATES.includes(p.access_state) && p.user_email);

    const results = { date, considered: eligible.length, prepared: 0, skipped: 0, reasons: {} as Record<string, number> };
    const skip = (why) => { results.skipped++; results.reasons[why] = (results.reasons[why] || 0) + 1; };

    for (const plan of eligible.slice(0, MAX_STUDENTS_PER_RUN)) {
      const email = plan.user_email;

      // Never write two briefs for the same night.
      const already = await svc.entities.NightlyBrief.filter({ user_email: email, brief_date: date }).catch(() => []);
      if (already?.length) { skip('already_ran'); continue; }

      const users = await svc.entities.User.filter({ email }).catch(() => []);
      const student = users?.[0];
      if (!student) { skip('no_user'); continue; }

      const [resumes, tailored, drops, pipeline] = await Promise.all([
        svc.entities.Resume.filter({ student_email: email }, '-updated_date', 5).catch(() => []),
        svc.entities.TailoredResume.filter({ user_email: email }, '-created_date', 40).catch(() => []),
        svc.entities.UserDailyDrop.filter({ user_email: email }, '-drop_date', 3).catch(() => []),
        svc.entities.NetworkingPipeline.filter({ user_email: email }, '-created_date', 100).catch(() => []),
      ]);

      const resume = (resumes || []).find(r => (r.parsed_text || '').length > 200);
      if (!resume) { skip('no_resume_text'); continue; }

      // Don't re-prepare a company they already have a package for.
      const covered = new Set((tailored || []).map(t => norm(t.company_name)));
      const slots = (drops || []).flatMap(d => d.slots || []);
      const target = slots.find(s => s.company && s.role && !covered.has(norm(s.company)));
      if (!target) { skip('no_new_opportunity'); continue; }

      const jd = target.jobDescription || `${target.company} is hiring for ${target.role}.`;
      const llm = await svc.integrations.Core.InvokeLLM({
        prompt: `You are CLIFF, tailoring a student's resume for a specific role so it is ready to submit.

STUDENT RESUME:
${(resume.parsed_text || '').substring(0, 6000)}

TARGET ROLE: ${target.role}
COMPANY: ${target.company}
JOB DESCRIPTION:
${jd.substring(0, 4000)}

Rules: never invent experience, keep all dates/companies/titles exactly, only reframe real experience in the job's language. Max 8 changes.
Return original_score, tailored_score, keywords_added, keywords_missing, changes (id, section, type, original, tailored, reason), tailored_content (the complete tailored resume as plain text), and changes_summary.`,
        response_json_schema: {
          type: 'object',
          properties: {
            original_score: { type: 'number' },
            tailored_score: { type: 'number' },
            keywords_added: { type: 'array', items: { type: 'string' } },
            keywords_missing: { type: 'array', items: { type: 'string' } },
            changes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  section: { type: 'string' },
                  type: { type: 'string' },
                  original: { type: 'string' },
                  tailored: { type: 'string' },
                  reason: { type: 'string' },
                },
              },
            },
            tailored_content: { type: 'string' },
            changes_summary: { type: 'string' },
          },
          required: ['tailored_content'],
        },
      }).catch((e) => { console.error('[runOvernightPrep] LLM failed for', email, e.message); return null; });

      if (!llm?.tailored_content || llm.tailored_content.trim().length < 100) { skip('tailoring_failed'); continue; }

      const resumeRecord = await svc.entities.TailoredResume.create({
        user_email: email,
        source_resume_id: resume.id,
        company_name: target.company,
        role_title: target.role,
        job_description_text: jd.substring(0, 5000),
        tailored_content: llm.tailored_content,
        changes: (llm.changes || []).map(c => ({ ...c, accepted: null })),
        original_score: llm.original_score || 0,
        ats_score: llm.tailored_score || 0,
        keywords_added: llm.keywords_added || [],
        keywords_missing: llm.keywords_missing || [],
        changes_summary: llm.changes_summary || '',
        status: 'completed',
      });

      const items = [`I tailored your resume for the ${target.role} role at ${target.company} — it's ready to send.`];

      // Warm path: is anyone in this student's school network inside that company?
      let contact = null;
      if (student.school_code) {
        const members = await svc.entities.ParentNetworkProfile.filter({
          school_code: student.school_code,
          is_active: true,
        }, '-created_date', 200).catch(() => []);
        contact = (members || []).find(m => norm(m.company_name) === norm(target.company)) || null;
      }
      if (contact) {
        items.push(`${contact.first_name} ${contact.last_name} (${contact.role_title}) is inside ${target.company} and open to helping students from your school.`);
      }

      // Follow-ups that came due overnight — time-driven work, no student input needed.
      const daysSince = daysSinceStatus;
      const due = (pipeline || []).filter(r =>
        ((['reached_out', 'messaged'].includes(r.status) && daysSince(r) >= 5) ||
         (r.status === 'applied' && daysSince(r) >= 7)) && (r.follow_up_count || 0) < 2
      );
      for (const r of due.slice(0, 2)) {
        items.push(`Your ${r.company} follow-up came due — I have the draft ready.`);
      }

      await svc.entities.NightlyBrief.create({
        user_email: email,
        brief_date: date,
        items,
        prepared_company: target.company,
        prepared_role: target.role,
        prepared_job_url: target.jobSource || target.job_url || '',
        tailored_resume_id: resumeRecord.id,
        warm_contact_name: contact ? `${contact.first_name} ${contact.last_name}` : '',
        warm_contact_role: contact?.role_title || '',
        status: 'new',
      });

      results.prepared++;
      console.log(`[runOvernightPrep] Prepared ${target.company} package for ${email}`);
    }

    return Response.json(results);
  } catch (error) {
    console.error('[runOvernightPrep] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}