import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subject, body, sent_date } = await req.json();

    if (!body && !subject) {
      return Response.json({ error: 'Email subject or body is required' }, { status: 400 });
    }

    const systemPrompt = `You are an expert at parsing job search emails. Given the full email (subject + body), extract structured data for an Application Tracker.

Detection Rules (Priority Order):
1. Application Confirmation → Keywords: "thank you for applying", "application received", "application submitted", "we've received your application"
2. Interview Invite → Keywords: "interview", "schedule", "speak with", "meet with", "calendar invite", "Zoom", "Teams link"  
3. Rejection → Keywords: "regret", "not moving forward", "we've decided to move forward with other candidates", "thank you but"
4. Offer → Keywords: "offer", "excited to extend", "formal offer"

Rules:
- Be conservative with confidence. If unsure about status, default to "Applied".
- Only use information clearly present in the email — never hallucinate.
- If multiple applications are mentioned, prioritize the most recent or clearest one.
- For interview_time, use 24h format (HH:MM).
- For dates, use ISO format (YYYY-MM-DD).

Return ONLY valid JSON, no markdown, no explanation.`;

    const userPrompt = `Parse this job-related email and extract structured data.

Sent Date (if available): ${sent_date || 'unknown'}
Subject: ${subject || '(no subject)'}
Body:
${body}

Return JSON with these fields:
{
  "company_name": string or null,
  "job_title": string or null,
  "application_date": "YYYY-MM-DD" or null,
  "status": "Applied" | "In Review" | "Interview Scheduled" | "Offer Received" | "Rejected" | "Other",
  "interview_date": "YYYY-MM-DD" or null,
  "interview_time": "HH:MM" or null,
  "interview_format": "Zoom" | "Phone" | "In-person" | "On-site" | "Teams" | "Unknown" or null,
  "interviewer_name": string or null,
  "interviewer_title": string or null,
  "job_posting_url": string or null,
  "rejection_reason": string or null,
  "email_type": "application_confirmation" | "interview_invite" | "rejection" | "offer" | "status_update" | "unknown",
  "confidence": number between 0 and 1
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: userPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          company_name: { type: 'string' },
          job_title: { type: 'string' },
          application_date: { type: 'string' },
          status: { type: 'string' },
          interview_date: { type: 'string' },
          interview_time: { type: 'string' },
          interview_format: { type: 'string' },
          interviewer_name: { type: 'string' },
          interviewer_title: { type: 'string' },
          job_posting_url: { type: 'string' },
          rejection_reason: { type: 'string' },
          email_type: { type: 'string' },
          confidence: { type: 'number' },
        },
      },
    });

    return Response.json({ success: true, parsed: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});