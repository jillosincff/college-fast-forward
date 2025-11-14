import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

// Helper to build the 3 prompt shapes (system/developer/user)
function buildMessages(payload) {
  const baseSystem = `You are "Coach Gator," a concise, professional resume editor for College Fast Forward (UF). Your goal is to help students improve their resumes. Preserve all factual information (names, dates, companies, schools). Your role is to enhance clarity, quantify impact, and improve ATS-friendliness. Do not invent facts. The user is a UF student or recent alum.`;

  // Default: generic resume optimizer
  return {
    prompt: `${baseSystem}\n\nTask: Perform a general review of the attached resume.
1.  Write a new, concise professional summary (3-4 sentences).
2.  Identify the resume's top 3 strengths.
3.  Identify the top 3 areas for improvement.
4.  Rewrite 3-5 existing bullet points to be more results-oriented using the STAR method (Situation, Task, Action, Result).
5.  Provide an overall score out of 100 and a rationale.`,
    schema: {
      type: "object",
      properties: {
        summary: { type: "string", description: "The new, improved professional summary." },
        strengths: { type: "array", items: { type: "string" }, description: "The top 3 strengths of the resume." },
        improvement_areas: { type: "array", items: { type: "string" }, description: "The top 3 areas needing improvement." },
        rewritten_bullets: { type: "array", items: { type: "string" }, description: "A list of 3-5 rewritten, high-impact bullet points." },
        resume_score_out_of_100: { type: "number", description: "An overall score for the resume from 0-100." },
        score_rationale: { type: "string", description: "A brief explanation for the score." },
      },
      required: ["summary", "strengths", "improvement_areas", "rewritten_bullets", "resume_score_out_of_100", "score_rationale"]
    }
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Check authentication first
    let user;
    try {
      user = await base44.auth.me();
    } catch (authError) {
      console.error('Authentication failed:', authError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Authentication required. Please sign in again.' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!user) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'User not authenticated.' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('User authenticated:', user.email);

    const body = await req.json();
    console.log('Request body:', body);

    if (!body?.resume_url) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Missing required field: resume_url" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { prompt, schema } = buildMessages(body);
    
    console.log('Calling InvokeLLM with file URL:', body.resume_url);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      file_urls: [body.resume_url],
      response_json_schema: schema
    });

    console.log('InvokeLLM result:', result);

    if (!result || typeof result !== 'object') {
      return new Response(JSON.stringify({ 
        success: false,
        error: "AI did not return a valid response object."
      }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Resume optimization error:', error);
    const isAuthError = error.status === 401 || (error.message && error.message.toLowerCase().includes('unauthorized'));
    
    return new Response(JSON.stringify({ 
      success: false,
      error: isAuthError ? "Authentication failed. Please sign in again." : "An internal error occurred during resume analysis.",
      detail: error.message 
    }), {
      status: isAuthError ? 401 : 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});