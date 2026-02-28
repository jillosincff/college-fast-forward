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
      console.log('Profile load failed (ok for new users):', e.message);
    }

    const systemPrompt = `You are Fast Track Pro — an elite AI career agent for University of Florida (UF) students.

STUDENT PROFILE:
- Name: ${user.full_name || 'Gator Student'}
- Major: ${user.major || 'undeclared'}
- Graduation: ${user.graduation_year || 'unknown'}
- Target Industry: ${profile.target_industry || 'not specified'}
- Target Companies: ${(profile.target_companies || []).join(', ') || 'none set'}
- Timeline: ${profile.career_timeline || 'not set'}
- Current Stage: ${profile.current_stage || 'not set'}
- Biggest Challenge: ${profile.biggest_challenge || 'not set'}

CAPABILITIES & message_type RULES:
1. "company_intel" — When student asks about a specific company. Payload: { company, hiring_signal (hot/warm/cool), summary, open_roles (string array), salary_range, recent_news (string array), interview_tips (string array) }
2. "alumni_card" — When student asks to find alumni. Payload: { alumni: [{ name, role_title, company, match_score, degree_info, location, connection_reason }] }
3. "outreach_draft" — When student asks to draft a message. Payload: { recipient, channel, subject, message }
4. "roadmap" — When student asks for a plan. Payload: { title, weeks: [{ week_number, focus, tasks: string[] }] }
5. "text" — All other responses. Payload can be null or empty object.

CONVERSATION HISTORY:
${conversation_history || 'No previous messages.'}

STUDENT'S MESSAGE: ${message}

Be specific to UF, reference the student's profile data, and be strategic and actionable.`;

    console.log('Calling InvokeLLM...');
    
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: systemPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          response: { type: "string" },
          message_type: { type: "string", enum: ["text", "company_intel", "alumni_card", "outreach_draft", "roadmap"] },
          payload: { type: "object" }
        },
        required: ["response", "message_type"]
      }
    });

    // InvokeLLM with response_json_schema returns a dict directly
    const resultStr = JSON.stringify(result);
    console.log('LLM returned:', resultStr.substring(0, 2000));

    // Handle both dict result and edge cases
    if (result && typeof result === 'object' && result.response) {
      return Response.json({
        success: true,
        response: result.response,
        message_type: result.message_type || 'text',
        payload: result.payload || null
      });
    }

    // Fallback: if result is a string somehow
    return Response.json({
      success: true,
      response: typeof result === 'string' ? result : 'I processed your request but got an unexpected format.',
      message_type: 'text',
      payload: null
    });
  } catch (error) {
    console.error('fastTrackProAgent error:', error.message, error.stack);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});