import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const message = body.message;
    const conversation_history = body.conversation_history || '';

    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    // Load FastTrackProProfile
    let profile = {};
    try {
      const profiles = await base44.entities.FastTrackProProfile.filter({ user_email: user.email });
      profile = profiles?.[0] || {};
    } catch (e) {
      console.log('Profile load failed:', e.message);
    }

    const profileContext = `STUDENT PROFILE:
- Name: ${user.full_name || 'Gator Student'}
- Major: ${user.major || 'undeclared'}
- Graduation: ${user.graduation_year || 'unknown'}
- Target Industry: ${profile.target_industry || 'not specified'}
- Target Companies: ${(profile.target_companies || []).join(', ') || 'none set'}
- Timeline: ${profile.career_timeline || 'not set'}
- Current Stage: ${profile.current_stage || 'not set'}
- Biggest Challenge: ${profile.biggest_challenge || 'not set'}`;

    // Step 1: Web search for real-time context
    const webPrompt = `You are a career research assistant for a University of Florida student. Research the following request and provide detailed, factual information:

${profileContext}

Student's request: "${message}"

${conversation_history ? 'Conversation context:\n' + conversation_history : ''}

Provide detailed findings including: company hiring status, open roles, salary data, alumni info, or whatever is relevant to the student's request. Be thorough and factual.`;

    const webResult = await base44.integrations.Core.InvokeLLM({
      prompt: webPrompt,
      add_context_from_internet: true,
    });

    const webContext = typeof webResult === 'string' ? webResult : JSON.stringify(webResult);

    // Step 2: Structure the response with JSON schema
    const structurePrompt = `You are Fast Track Pro — an elite AI career agent for University of Florida (UF) students.

${profileContext}

Based on the following research, create a structured response for the student.

RESEARCH FINDINGS:
${webContext.substring(0, 4000)}

STUDENT'S ORIGINAL REQUEST: "${message}"

RESPONSE RULES:
- Pick the BEST message_type for the content:
  * "company_intel" — company research (payload: company, hiring_signal hot/warm/cool, summary, open_roles array, salary_range, recent_news array, interview_tips array)
  * "alumni_card" — alumni discovery (payload: alumni array with name, role_title, company, match_score 0-100, degree_info, location, connection_reason)
  * "outreach_draft" — message drafting (payload: recipient, channel, subject, message)
  * "roadmap" — career plan (payload: title, weeks array with week_number, focus, tasks array)
  * "text" — general advice (payload can be null)
- The "response" field should be a brief conversational summary (2-4 sentences max). The detailed data goes in payload.
- Reference the student's UF background and profile data.
- Be confident and strategic.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: structurePrompt,
      response_json_schema: {
        type: "object",
        properties: {
          response: { type: "string", description: "Brief conversational summary for the student" },
          message_type: { type: "string", enum: ["text", "company_intel", "alumni_card", "outreach_draft", "roadmap"] },
          payload: { type: "object", description: "Structured data matching the message_type schema" }
        },
        required: ["response", "message_type"]
      }
    });

    console.log('Structured result:', JSON.stringify(result).substring(0, 1500));

    if (result && typeof result === 'object' && result.response) {
      return Response.json({
        success: true,
        response: result.response,
        message_type: result.message_type || 'text',
        payload: result.payload || null
      });
    }

    // Fallback
    return Response.json({
      success: true,
      response: typeof result === 'string' ? result : webContext.substring(0, 2000),
      message_type: 'text',
      payload: null
    });
  } catch (error) {
    console.error('fastTrackProAgent error:', error.message);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});