import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Admin-only: this runs on a schedule, no user context
    const authCheck = await base44.auth.isAuthenticated();
    if (!authCheck) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date().toISOString();

    // Find all pending records past their available_at time
    const pendingRecords = await base44.asServiceRole.entities.TailoredResume.filter({
      status: 'pending',
    });

    const readyToProcess = (pendingRecords || []).filter(r =>
      r.available_at && new Date(r.available_at) <= new Date(now)
    );

    if (readyToProcess.length === 0) {
      return Response.json({ success: true, processed: 0, message: 'No pending records ready.' });
    }

    let processed = 0;
    let failed = 0;

    for (const record of readyToProcess) {
      try {
        const resumeText = record.resume_text_snapshot || '';
        if (!resumeText || resumeText.trim().length < 50) {
          // Can't process without the resume snapshot — mark as failed
          await base44.asServiceRole.entities.TailoredResume.update(record.id, {
            status: 'failed',
          });
          failed++;
          continue;
        }

        const jobTitle = record.role_title || '';
        const companyName = record.company_name || '';
        const jobDescription = record.job_description_text || '';
        const effectiveJD = jobDescription || `Optimize this resume for general career readiness. Target role: ${jobTitle}. Company: ${companyName}.`;

        const prompt = `You are CLIFF, an AI career advisor helping a student tailor their resume.

STUDENT RESUME:
${resumeText.substring(0, 6000)}

JOB TITLE: ${jobTitle}
COMPANY: ${companyName}
JOB DESCRIPTION:
${effectiveJD.substring(0, 4000)}

Analyze the resume against the job description and generate:
1. original_score: match score (0-100) for the ORIGINAL resume
2. tailored_score: projected match score (0-100) after changes
3. keywords_added: array of keywords you added from the JD
4. keywords_missing: array of important JD keywords you couldn't add
5. changes: array of specific changes (max 10), each with id, section, type, original, tailored, reason
6. tailored_content: the COMPLETE tailored resume as plain text
7. changes_summary: one sentence summarizing all changes

Rules:
- Never fabricate experience or skills the student doesn't have
- Only reframe existing experience using JD language
- Keep all dates, companies, and titles exactly as they are
- Aim for score improvement of 20-40 points
- Maximum 10 changes

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

        let result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: llmSchema,
        });

        // Retry once if empty
        if (!result?.tailored_content || result.tailored_content.trim().length < 100) {
          result = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: llmSchema,
          });
        }

        if (!result?.tailored_content || result.tailored_content.trim().length < 100) {
          await base44.asServiceRole.entities.TailoredResume.update(record.id, {
            status: 'failed',
          });
          failed++;
          continue;
        }

        // Update the pending record with results
        await base44.asServiceRole.entities.TailoredResume.update(record.id, {
          status: 'completed',
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

        // Log activity
        try {
          const user = await base44.asServiceRole.entities.User.filter({ email: record.user_email });
          if (user && user.length > 0) {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: record.user_email,
              subject: `Your tailored resume for ${companyName || jobTitle || 'your role'} is ready!`,
              body: `<p>Hi ${user[0].full_name?.split(' ')[0] || 'there'},</p><p>Your batch-processed resume tailoring is now complete!</p><p><strong>Role:</strong> ${jobTitle}<br><strong>Company:</strong> ${companyName}<br><strong>Match Score:</strong> ${result.original_score || 0}% → ${result.tailored_score || 0}%</p><p><a href="${Deno.env.get('APP_BASE_URL') || ''}/#ResumeTailoring">View your tailored resume →</a></p><p>— The CFF Team</p>`,
            });
          }
        } catch (e) {
          console.log('Notification email failed (non-critical):', e.message);
        }

        processed++;
      } catch (e) {
        console.error('Failed to process pending record:', record.id, e.message);
        failed++;
      }
    }

    return Response.json({
      success: true,
      processed,
      failed,
      total_ready: readyToProcess.length,
    });
  } catch (error) {
    console.error('processPendingTailoring error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});