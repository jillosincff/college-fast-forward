import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * getStandoutInsight
 *
 * Given a job description + student profile context, returns:
 *   - competitiveness_score (0-100)
 *   - standout_tip (CLIFF AI-generated, personalized to the student)
 *   - application_paths: which of the 3 paths are available
 *
 * POST body:
 *   { company, job_title, job_description, job_url, school_code }
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { company, job_title, job_description, job_url } = body;

    if (!company || !job_title) {
      return Response.json({ error: 'company and job_title are required' }, { status: 400 });
    }

    const db = base44.asServiceRole.entities;

    // ── 1. Check alumni availability for this company ──────────────────────
    const schoolCode = user.school_code || '';
    let alumniCount = 0;
    try {
      const alumni = await db.DiscoveredAlumni.filter({ company, school_code: schoolCode });
      alumniCount = (alumni || []).length;
    } catch {}

    // ── 2. Check if we have a hiring manager contact for this company ───────
    let hiringManagerFound = false;
    try {
      const pipeline = await base44.entities.NetworkingPipeline.filter({
        user_email: user.email,
        company,
        application_path: 'hiring_manager',
      });
      hiringManagerFound = (pipeline || []).length > 0;
    } catch {}

    // ── 3. Build student context for personalization ────────────────────────
    const goals = user.career_goals || {};
    const targetRole = (Array.isArray(goals.target_roles) ? goals.target_roles[0] : goals.target_roles) || job_title;
    const major = user.major || goals.major || '';
    const school = user.school_name || schoolCode || 'your school';
    const resumeUrl = user.resume_url || null;

    // ── 4. Call CLIFF AI for personalized standout tip + competitiveness ────
    const prompt = `You are CLIFF, an AI career advisor for college students.

A student is evaluating this job opportunity:
Company: ${company}
Role: ${job_title}
${job_description ? `Job Description:\n${job_description.slice(0, 1500)}` : ''}

Student profile:
- School: ${school}
- Major: ${major || 'not specified'}
- Target role: ${targetRole}
- Alumni network: ${alumniCount > 0 ? `${alumniCount} alumni from ${school} work at ${company}` : 'No alumni found yet'}
- Has resume on file: ${resumeUrl ? 'Yes' : 'No'}

Respond ONLY with valid JSON in this exact format:
{
  "competitiveness_score": <integer 0-100, where 100 = most competitive/hardest>,
  "competitiveness_label": "<one of: Low, Moderate, High, Very High>",
  "standout_tip": "<2-3 sentences. Specific, actionable advice on how this student can differentiate themselves for THIS role. Reference the job description details if provided. Mention the alumni network advantage if alumni exist.>",
  "estimated_applicants": "<human-readable estimate e.g. '200-400 applicants' or 'Highly competitive'>",
  "best_path": "<one of: cold_apply, alumni_outreach, hiring_manager>"
}`;

    let insight = {
      competitiveness_score: 65,
      competitiveness_label: 'High',
      standout_tip: alumniCount > 0
        ? `With ${alumniCount} ${school} alumni at ${company}, your strongest move is a warm intro before applying. A 15-minute coffee chat with one of them can get your resume seen by the right person — cold applications to ${company} typically compete with hundreds of candidates.`
        : `To stand out at ${company} for this ${job_title} role, tailor your resume to match the specific skills mentioned in the posting and reach out to the hiring team directly on LinkedIn before submitting. Mentioning relevant coursework or projects that mirror the job responsibilities dramatically increases response rates.`,
      estimated_applicants: '200-400 applicants',
      best_path: alumniCount > 0 ? 'alumni_outreach' : 'cold_apply',
    };

    try {
      const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            competitiveness_score: { type: 'number' },
            competitiveness_label: { type: 'string' },
            standout_tip: { type: 'string' },
            estimated_applicants: { type: 'string' },
            best_path: { type: 'string' },
          },
        },
      });
      if (llmRes && llmRes.standout_tip) {
        insight = { ...insight, ...llmRes };
      }
    } catch (e) {
      console.warn('[getStandoutInsight] LLM call failed, using fallback:', e.message);
    }

    // ── 5. Build application paths availability ─────────────────────────────
    const application_paths = {
      cold_apply: {
        available: true,
        label: 'Apply Directly',
        description: 'Submit your tailored application through the job posting',
        job_url: job_url || null,
      },
      alumni_outreach: {
        available: alumniCount > 0,
        label: 'Alumni Outreach',
        description: alumniCount > 0
          ? `${alumniCount} ${school} alumni at ${company} — get a warm intro`
          : `No alumni found at ${company} yet`,
        alumni_count: alumniCount,
      },
      hiring_manager: {
        available: true, // always surfaced as an option; contact lookup is on-demand
        label: 'Contact Hiring Manager',
        description: 'Bypass HR with a direct outreach to the decision-maker',
        contact_found: hiringManagerFound,
      },
    };

    return Response.json({
      success: true,
      company,
      job_title,
      ...insight,
      application_paths,
      alumni_count: alumniCount,
    });

  } catch (error) {
    console.error('[getStandoutInsight] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});