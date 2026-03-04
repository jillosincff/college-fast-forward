import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Analyzes a resume using AI and provides improvement suggestions.
 * Optionally accepts a job description to tailor suggestions.
 * 
 * Input:
 * - resume_url: URL of the uploaded resume file
 * - job_description (optional): Target job description for tailored suggestions
 * 
 * Output:
 * - overall_score: 0-100 rating
 * - strengths: Array of strong points
 * - improvements: Array of suggested improvements
 * - keywords_missing: Keywords from job description not in resume
 * - formatting_tips: Tips for better formatting
 * - ats_friendly: Boolean indicating if resume is ATS-friendly
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const { resume_url, job_description } = await req.json();
    
    if (!resume_url) {
      return Response.json({ error: 'resume_url is required' }, { status: 400 });
    }

    // Build AI prompt
    const prompt = `You are an expert career counselor and ATS (Applicant Tracking System) specialist analyzing a resume.

Resume URL: ${resume_url}
${job_description ? `Target Job Description: ${job_description}` : 'General Resume Analysis'}

Analyze this resume and provide:
1. An overall quality score (0-100)
2. Key strengths (what's working well)
3. Specific improvement suggestions
4. ATS-friendliness assessment
5. Formatting recommendations
${job_description ? '6. Keywords from the job description that are missing from the resume' : ''}

Focus on:
- Content quality and relevance
- Quantifiable achievements
- Action verbs and impact statements
- ATS compatibility
- Professional formatting
- Tailoring to the target role (if job description provided)

Provide actionable, specific advice that will help the candidate stand out.`;

    // Define response schema
    const responseSchema = {
      type: "object",
      properties: {
        overall_score: {
          type: "number",
          description: "Overall resume quality score from 0-100"
        },
        strengths: {
          type: "array",
          items: { type: "string" },
          description: "List of resume strengths"
        },
        improvements: {
          type: "array",
          items: {
            type: "object",
            properties: {
              category: { type: "string" },
              suggestion: { type: "string" },
              priority: { type: "string", enum: ["high", "medium", "low"] }
            }
          },
          description: "Specific improvement suggestions with priorities"
        },
        keywords_missing: {
          type: "array",
          items: { type: "string" },
          description: "Important keywords missing from resume (if job description provided)"
        },
        formatting_tips: {
          type: "array",
          items: { type: "string" },
          description: "Formatting and presentation tips"
        },
        ats_friendly: {
          type: "boolean",
          description: "Whether the resume is ATS-friendly"
        },
        ats_issues: {
          type: "array",
          items: { type: "string" },
          description: "Specific ATS compatibility issues"
        },
        summary: {
          type: "string",
          description: "Brief summary of the analysis"
        }
      },
      required: ["overall_score", "strengths", "improvements", "ats_friendly", "summary"]
    };

    // Call AI integration with the resume file
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: responseSchema,
      file_urls: [resume_url]
    });

    // Save analysis to user profile
    await base44.auth.updateMe({
      resume_analysis: {
        ...analysis,
        analyzed_at: new Date().toISOString(),
        job_description: job_description || null
      }
    });

    return Response.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Error analyzing resume:', error);
    return Response.json({ 
      success: false,
      error: 'Failed to analyze resume',
      details: error.message 
    }, { status: 500 });
  }
});