import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Check authentication
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

    const { question, answer, role, industry, difficulty } = body;

    if (!question || !answer) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Missing required fields: question and answer" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const prompt = `You are an expert interview coach evaluating a candidate's interview response.

Interview Context:
- Role: ${role || 'General'}
- Industry: ${industry || 'General'}
- Experience Level: ${difficulty || 'entry'}

Question: ${question}

Candidate's Answer: ${answer}

Please provide a comprehensive evaluation with:
1. Overall score (0-100)
2. Top 3 strengths in their answer
3. Top 3 areas for improvement
4. Specific actionable feedback
5. Whether they used the STAR method effectively (for behavioral questions)
6. Suggestions for making their answer more compelling

Be encouraging but honest. Focus on actionable feedback.`;

    const schema = {
      type: "object",
      properties: {
        score: {
          type: "number",
          description: "Overall score from 0-100"
        },
        strengths: {
          type: "array",
          items: { type: "string" },
          description: "Top 3 strengths in the answer"
        },
        improvements: {
          type: "array",
          items: { type: "string" },
          description: "Top 3 areas for improvement"
        },
        feedback: {
          type: "string",
          description: "Detailed actionable feedback"
        },
        used_star_method: {
          type: "boolean",
          description: "Whether they effectively used STAR method"
        },
        suggestions: {
          type: "array",
          items: { type: "string" },
          description: "Specific suggestions to improve the answer"
        }
      },
      required: ["score", "strengths", "improvements", "feedback", "suggestions"]
    };

    console.log('Calling InvokeLLM for interview evaluation...');

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: schema
    });

    console.log('InvokeLLM result:', result);

    if (!result || typeof result !== 'object') {
      return new Response(JSON.stringify({ 
        success: false,
        error: "AI did not return a valid response."
      }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      evaluation: result 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Interview evaluation error:', error);
    const isAuthError = error.status === 401 || (error.message && error.message.toLowerCase().includes('unauthorized'));
    
    return new Response(JSON.stringify({ 
      success: false,
      error: isAuthError ? "Authentication failed. Please sign in again." : "An error occurred during evaluation.",
      detail: error.message 
    }), {
      status: isAuthError ? 401 : 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});