import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  let base44 = null;
  let reservedPlan = null; // magic-moment reservation, released on any failure
  try {
    base44 = createClientFromRequest(req);
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

    // ── Latency-as-a-Feature: free users get 1 instant freebie, then 24h queue ──
    const isPremium = user.subscription_status === 'active' ||
      user.membership_tier === 'fastiq' ||
      user.is_founding_member === true ||
      user.fastiq_active === true ||
      user.is_fastiq === true ||
      user.trial_status === 'active' ||
      user.fastiq_trial_active === true ||
      user.membership_tier === 'fastiq_trial' ||
      (user.fastiq_setup_complete && user.trial_status !== 'expired');

    let isFreeMagicMoment = false;
    let accessPlan = null;
    if (!isPremium && !(adminTest && user.role === 'admin')) {
      // Canonical magic-moment source: UserAccessPlan (admins can reset it).
      // Fallback: completed tailoring history for accounts without a plan record.
      const plans = await base44.asServiceRole.entities.UserAccessPlan.filter({ user_id: user.id });
      accessPlan = plans[0] || null;
      if (accessPlan) {
        const inProgressRecently = accessPlan.magic_moment_status === 'in_progress' &&
          accessPlan.magic_moment_started_at &&
          (Date.now() - new Date(accessPlan.magic_moment_started_at).getTime()) < 3 * 60 * 1000;
        isFreeMagicMoment = accessPlan.magic_moment_eligible !== false &&
          accessPlan.magic_moment_status !== 'completed' &&
          !inProgressRecently;
      } else {
        const existingTailored = await base44.entities.TailoredResume.filter({ user_email: user.email });
        isFreeMagicMoment = (existingTailored || []).filter(t => t.status !== 'pending').length === 0;
      }

      if (!isFreeMagicMoment) {
        // No 24-hour queue — the free cycle is one-time. Any further tailoring
        // hits the hard paywall; the client shows the upgrade modal.
        return Response.json({
          success: false,
          upgrade_required: true,
          message: "That was your free cycle. Upgrade to CLIFF Pro to tailor your resume for every job.",
        }, { status: 402 });
      }

      // Reserve the magic moment so duplicate clicks can't start two free workflows.
      // The benefit is only marked consumed after the deliverable is shown.
      const reservation = { magic_moment_status: 'in_progress', magic_moment_started_at: new Date().toISOString() };
      if (accessPlan) {
        await base44.asServiceRole.entities.UserAccessPlan.update(accessPlan.id, reservation);
        reservedPlan = accessPlan;
      } else {
        reservedPlan = await base44.asServiceRole.entities.UserAccessPlan.create({
          user_id: user.id,
          user_email: user.email,
          plan: 'free',
          access_state: 'free',
          access_source: 'default_free',
          magic_moment_eligible: true,
          ...reservation,
        });
      }
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
      // Release the reservation — a failed run must never burn the free benefit
      if (reservedPlan) {
        await base44.asServiceRole.entities.UserAccessPlan.update(reservedPlan.id, { magic_moment_status: 'available' }).catch(() => {});
        reservedPlan = null;
      }
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

    // One-time free "magic moment" — record consumption in the entitlement system.
    // Consumed only now: the tailored resume completed and is about to be shown.
    if (isFreeMagicMoment) {
      if (reservedPlan) {
        // Keep the magic moment reserved (in_progress) so the rest of the free
        // cycle (alumni + outreach) still clears the soft-wall gate. The cycle
        // is marked 'completed' once, at the end, by completeMagicMoment.
        await base44.asServiceRole.entities.UserAccessPlan.update(reservedPlan.id, {
          magic_moment_status: 'in_progress',
          magic_moment_job_id: tailoredResume.id,
        }).catch(() => {});
        reservedPlan = null;
      }
      try {
        const nowIso = new Date().toISOString();
        const existing = await base44.asServiceRole.entities.FeatureUsage.filter({
          user_id: user.id,
          capability_name: 'resume_tailor',
        });
        if (existing[0]) {
          await base44.asServiceRole.entities.FeatureUsage.update(existing[0].id, {
            usage_count: (existing[0].usage_count || 0) + 1,
            lifetime_count: (existing[0].lifetime_count || 0) + 1,
            last_used_at: nowIso,
          });
        } else {
          await base44.asServiceRole.entities.FeatureUsage.create({
            user_id: user.id,
            user_email: user.email,
            capability_name: 'resume_tailor',
            usage_count: 1,
            period_type: 'lifetime',
            period_start: '1970-01-01T00:00:00.000Z',
            period_end: '9999-12-31T00:00:00.000Z',
            lifetime_count: 1,
            last_used_at: nowIso,
          });
        }
      } catch (e) {
        console.log('FeatureUsage log failed (non-critical):', e.message);
      }
    }

    // TTFMP: record tailored_resume_completed as a meaningful-progress event.
    try {
      const evKey = `${user.id}|tailored_resume_completed|${tailoredResume.id}`;
      const existingEv = await base44.asServiceRole.entities.StudentAnalyticsEvent.filter({ event_key: evKey });
      if (!existingEv?.length) {
        const nowIso = new Date().toISOString();
        await base44.asServiceRole.entities.StudentAnalyticsEvent.create({
          student_id: user.id,
          user_email: user.email,
          event_name: 'tailored_resume_completed',
          event_key: evKey,
          event_timestamp: nowIso,
          related_record_id: tailoredResume.id,
          company_name: companyName || '',
          source_feature: 'Resume Tailor',
          delivery_channel: 'In App',
          is_meaningful_progress: true,
          historically_backfilled: false,
        });
        if (!user.first_meaningful_progress_at) {
          const seconds = Math.max(0, Math.round((new Date(nowIso).getTime() - new Date(user.created_date).getTime()) / 1000));
          await base44.asServiceRole.entities.User.update(user.id, {
            first_meaningful_progress_at: nowIso,
            first_meaningful_progress_type: 'tailored_resume_completed',
            first_meaningful_progress_event_id: tailoredResume.id,
            ttfmp_seconds: seconds,
            ttfmp_under_10_minutes: seconds <= 600,
            ttfmp_backfilled: false,
          });
        }
      }
    } catch (e) {
      console.log('TTFMP log failed (non-critical):', e.message);
    }

    return Response.json({
      success: true,
      tailoredResume,
      magic_moment: isFreeMagicMoment,
      originalScore: result.original_score || 0,
      tailoredScore: result.tailored_score || 0,
    });
  } catch (error) {
    console.error('tailorResume error:', error);
    // Release the magic-moment reservation so a failed run never burns the benefit
    if (reservedPlan && base44) {
      try {
        await base44.asServiceRole.entities.UserAccessPlan.update(reservedPlan.id, { magic_moment_status: 'available' });
      } catch (releaseError) {
        console.error('Reservation release failed:', releaseError.message);
      }
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
});