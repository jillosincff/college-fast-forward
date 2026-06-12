import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { resumeText, jobTitle, companyName, jobDescription = '', sourceResumeId, adminTest } = await req.json();

    if (!resumeText) {
      return Response.json({ error: 'Resume text is required' }, { status: 400 });
    }

    // If no job description provided, optimize against career goals (general improvement mode)
    const effectiveJD = jobDescription || `Optimize this resume for general career readiness. Improve clarity, impact language, and professional framing. Target role: ${jobTitle || 'professional role'}. Company: ${companyName || 'any company'}.`;

    // Server-side trial enforcement — return basic keyword score only if trial expired
    const trialExpired = user.trial_status === 'expired' && user.subscription_status !== 'active' && !(adminTest && user.role === 'admin');
    if (trialExpired) {
      const basicResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Score this resume against the job description on a scale of 0-100 and list the top 5 missing keywords. Resume: ${resumeText.substring(0, 3000)} Job Description: ${effectiveJD.substring(0, 2000)}`,
        response_json_schema: {
          type: 'object',
          properties: {
            original_score: { type: 'number' },
            keywords_missing: { type: 'array', items: { type: 'string' } },
          }
        }
      });
      return Response.json({
        success: true,
        trial_expired: true,
        originalScore: basicResult.original_score || 0,
        tailoredScore: null,
        keywords_missing: basicResult.keywords_missing || [],
        message: 'Upgrade to FastIQ for full resume tailoring.',
        upgrade_required: true,
      });
    }

    const prompt = `You are FASTIQ, an AI career advisor helping a UF student tailor their resume.

STUDENT RESUME:
${resumeText.substring(0, 6000)}

JOB TITLE: ${jobTitle || 'Not specified'}
COMPANY: ${companyName || 'Not specified'}
JOB DESCRIPTION:
${effectiveJD.substring(0, 4000)}

Analyze the resume against the job description and generate:

1. original_score: match score (0-100) for the ORIGINAL resume against this JD
2. tailored_score: projected match score (0-100) after your changes
3. keywords_added: array of keywords you added from the JD
4. keywords_missing: array of important JD keywords you couldn't naturally add
5. changes: array of specific changes (max 10), each with:
   - id: "c1", "c2", etc.
   - section: "summary" | "experience" | "skills" | "education" | "projects"
   - type: "modified" | "added" | "reordered" | "removed"
   - original: the original text
   - tailored: the new text
   - reason: one sentence explaining WHY (mention specific JD keywords/phrases)
6. tailored_content: the COMPLETE tailored resume as plain text
7. changes_summary: one sentence summarizing all changes

Rules:
- Never fabricate experience or skills the student doesn't have
- Only reframe existing experience using JD language
- Keep all dates, companies, and titles exactly as they are
- Aim for score improvement of 20-40 points
- Maximum 10 changes — quality over quantity
- Each reason should reference specific JD language

Return as JSON.`;

    const llmSchema = {
        type: "object",
        properties: {
          original_score: { type: "number" },
          tailored_score: { type: "number" },
          keywords_added: { type: "array", items: { type: "string" } },
          keywords_missing: { type: "array", items: { type: "string" } },
          changes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                section: { type: "string" },
                type: { type: "string" },
                original: { type: "string" },
                tailored: { type: "string" },
                reason: { type: "string" }
              }
            }
          },
          tailored_content: { type: "string" },
          changes_summary: { type: "string" }
        },
        required: ["original_score", "tailored_score", "changes", "tailored_content"]
    };

    let result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: llmSchema,
    });

    // Validate output — retry once if the tailored content came back empty
    if (!result?.tailored_content || result.tailored_content.trim().length < 100) {
      console.warn('Empty tailored_content, retrying');
      result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: llmSchema,
      });
    }

    if (!result?.tailored_content || result.tailored_content.trim().length < 100) {
      console.error('Tailoring failed: empty tailored_content after retry');
      return Response.json({
        success: false,
        error: 'The AI couldn\'t generate your tailored resume. Please try again.',
      }, { status: 502 });
    }

    // Save to TailoredResume entity
    const tailoredResume = await base44.entities.TailoredResume.create({
      user_email: user.email,
      source_resume_id: sourceResumeId || '',
      company_name: companyName || '',
      role_title: jobTitle || '',
      job_description_text: jobDescription.substring(0, 5000),
      tailored_content: result.tailored_content || '',
      changes: (result.changes || []).map(c => ({ ...c, accepted: null })),
      original_score: result.original_score || 0,
      ats_score: result.tailored_score || 0,
      keywords_added: result.keywords_added || [],
      keywords_missing: result.keywords_missing || [],
      keywords_matched: (result.keywords_added || []).length,
      keywords_total: (result.keywords_added || []).length + (result.keywords_missing || []).length,
      changes_summary: result.changes_summary || '',
    });

    // Auto-log activity
    try {
      await base44.entities.ActivityLog.create({
        student_email: user.email,
        type: 'resume_tailored',
        company_name: companyName || '',
        notes: `Tailored for: ${jobTitle || 'role'} · Match score: ${result.original_score || 0}% → ${result.tailored_score || 0}%`,
        fastiq_generated: true,
      });
    } catch (e) {
      console.log('Activity log failed (non-critical):', e.message);
    }

    // Log feature usage (fire-and-forget)
    base44.asServiceRole.entities.AnalyticsEvent.create({
      event_name: 'fastiq_feature_used',
      user_id: user.id,
      user_email: user.email,
      school_code: user.school_name || user.school || '',
      properties: { feature_type: 'resume_tailoring', original_score: result.original_score || 0 },
    }).catch(() => {});

    return Response.json({
      success: true,
      tailoredResume,
      originalScore: result.original_score || 0,
      tailoredScore: result.tailored_score || 0,
    });
  } catch (error) {
    console.error('tailorResume error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});