import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// CLIFF Job Fit analysis for the Job Workspace.
// Returns a simple fit label + reasons — never a fabricated interview probability.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { company, role, jobDescription, location } = await req.json().catch(() => ({}));
    if (!company || !role) {
      return Response.json({ error: 'company and role are required' }, { status: 400 });
    }

    const goals = user.career_goals || {};
    const targetRole = goals.target_role || (Array.isArray(goals.target_roles) ? goals.target_roles[0] : goals.target_roles) || '';
    const industries = (goals.target_industries || goals.industries || []).filter(Boolean).join(', ');
    const seeking = goals.seeking || 'both';
    const locPref = goals.location_preference || user.location_preference || '';

    // Best-effort resume context — fit analysis still works from goals alone.
    let resumeText = '';
    try {
      const resumes = await base44.entities.Resume.list('-created_date', 1);
      const r = resumes?.[0];
      resumeText = (r?.parsed_text || r?.resume_text || r?.content || r?.text || '').slice(0, 4000);
    } catch { /* no resume yet */ }

    const prompt = `You are CLIFF, a career agent helping a college student decide whether to pursue a job.

STUDENT PROFILE:
- School: ${user.school || user.school_code || 'unknown'}
- Target role: ${targetRole || 'not specified'}
- Target industries: ${industries || 'not specified'}
- Seeking: ${seeking === 'internship' ? 'internships' : seeking === 'fulltime' ? 'entry-level full-time roles' : 'internships or entry-level roles'}
- Preferred location: ${locPref || 'not specified'}
${resumeText ? `- Resume excerpt:\n${resumeText}` : '- No resume on file (base your analysis on the profile above).'}

JOB:
- Company: ${company}
- Role: ${role}
- Location: ${location || 'not specified'}
- Description: ${(jobDescription || '').slice(0, 5000) || 'not provided'}

Analyze the fit. Rules:
- fit_label must be exactly one of: "Strong Match", "Good Match", "Stretch Opportunity", "Low Priority".
- why_match: 1-2 plain sentences on why this job does or doesn't match the student's goals.
- matching_qualifications: 2-4 short bullets of relevant qualifications the student likely already has (from resume/profile). If nothing is known, use profile-level fits (e.g. target role alignment).
- gaps: 1-3 short bullets of possible gaps or concerns. Be honest but encouraging.
- deadline: the application deadline if it appears in the description, otherwise null.
- recommendation: one sentence — whether CLIFF recommends applying and the single best next step.
- NEVER state or imply a numeric probability of getting an interview or offer.
Write in a warm, direct tone addressed to the student ("you").`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          fit_label: { type: 'string', enum: ['Strong Match', 'Good Match', 'Stretch Opportunity', 'Low Priority'] },
          why_match: { type: 'string' },
          matching_qualifications: { type: 'array', items: { type: 'string' } },
          gaps: { type: 'array', items: { type: 'string' } },
          deadline: { type: ['string', 'null'] },
          recommendation: { type: 'string' },
          recommend_applying: { type: 'boolean' },
        },
        required: ['fit_label', 'why_match', 'recommendation'],
      },
    });

    return Response.json({ success: true, fit: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});