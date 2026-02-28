import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, conversation_history } = await req.json();
    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    // Load FastTrackProProfile
    const profiles = await base44.entities.FastTrackProProfile.filter({ user_email: user.email });
    const profile = profiles?.[0] || {};

    const systemPrompt = `You are Fast Track Pro — an elite AI career agent for University of Florida (UF) students. You combine real-time company intelligence, alumni discovery, and personalized coaching.

STUDENT PROFILE:
- Name: ${user.full_name || 'Gator Student'}
- Email: ${user.email}
- Major: ${user.major || 'undeclared'}
- Graduation: ${user.graduation_year || 'unknown'}
- Target Industry: ${profile.target_industry || 'not specified'}
- Target Companies: ${(profile.target_companies || []).join(', ') || 'none set'}
- Timeline: ${profile.career_timeline || 'not set'}
- Current Stage: ${profile.current_stage || 'not set'}
- Biggest Challenge: ${profile.biggest_challenge || 'not set'}

CAPABILITIES & WHEN TO USE EACH message_type:
1. "company_intel" — When the student asks about a specific company (hiring, roles, salary, culture, news). Payload must include: company (string), hiring_signal (hot/warm/cool), summary (string), open_roles (array of strings), salary_range (string), recent_news (array of strings), interview_tips (array of strings).
2. "alumni_card" — When the student asks to find alumni or connections at a company. Payload must include: alumni (array of objects with name, role_title, company, match_score 0-100, degree_info, location, connection_reason).
3. "outreach_draft" — When the student asks to draft a message, email, or LinkedIn outreach. Payload must include: recipient (string), channel (LinkedIn/Email/Cold Email), subject (string, optional), message (string).
4. "roadmap" — When the student asks for a career plan, action plan, or roadmap. Payload must include: title (string), weeks (array of objects with week_number, focus, tasks array of strings).
5. "text" — For all other conversational responses (advice, encouragement, clarifications, follow-ups).

RULES:
- Always be specific to UF and reference the student's actual profile data.
- For company_intel, use your web search knowledge to provide real, current information.
- For alumni_card, generate plausible UF alumni based on web search results. Use realistic names and titles.
- Be confident, strategic, and actionable. You're an elite career advisor, not a generic chatbot.
- Keep the "response" field as a conversational summary. The rich data goes in "payload".

CONVERSATION HISTORY:
${conversation_history || 'No previous messages.'}

STUDENT'S MESSAGE: ${message}

Respond with the appropriate message_type and structured payload.`;

  // First call with web search for context (no JSON schema - not supported together)
  const webContext = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `Search the web and provide current information about this request from a UF student: "${message}". Include hiring data, recent news, salary info, alumni connections if relevant. Be thorough.`,
    add_context_from_internet: true,
  });

  console.log('Web context type:', typeof webContext, 'length:', String(webContext).length);

  // Second call with JSON schema using the web context
  const webContextStr = typeof webContext === 'string' ? webContext : JSON.stringify(webContext);
  const enrichedPrompt = systemPrompt + `\n\nWEB RESEARCH CONTEXT:\n${webContextStr.substring(0, 3000)}\n\nRespond with the appropriate message_type and structured payload.`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: enrichedPrompt,
    response_json_schema: {
      type: "object",
      properties: {
        response: {
          type: "string",
          description: "Conversational text response to show the student"
        },
        message_type: {
          type: "string",
          enum: ["text", "company_intel", "alumni_card", "outreach_draft", "roadmap"],
          description: "Type of response for rich card rendering"
        },
        payload: {
          type: "object",
          description: "Structured data for the rich card. Shape depends on message_type."
        }
      },
      required: ["response", "message_type"]
    }
  });

  console.log('Structured result:', JSON.stringify(result).substring(0, 1000));

  return Response.json({
    success: true,
    response: result?.response || 'I could not process that request.',
    message_type: result?.message_type || 'text',
    payload: result?.payload || null
  });
  } catch (error) {
    console.error('fastTrackProAgent error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});