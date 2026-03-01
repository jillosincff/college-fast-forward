import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Detect if user is asking about alumni/connections at a company
function detectAlumniQuery(message) {
  const alumniPatterns = [
    /(?:find|show|who|any|look for|search|discover)\s+(?:uf\s+)?(?:alumni|gators?|connections?|people|grads?)\s+(?:at|from|who work at|working at)\s+(\w[\w\s&.''-]{1,40})/i,
    /(?:alumni|gators?|connections?|people|grads?)\s+(?:at|from|who work at|working at)\s+(\w[\w\s&.''-]{1,40})/i,
    /(?:who|anyone)\s+(?:works?|is)\s+at\s+(\w[\w\s&.''-]{1,40})\s+(?:from uf|from university of florida|who went to uf)/i,
    /(?:uf|university of florida)\s+(?:alumni|grads?|people)\s+(?:at|from)\s+(\w[\w\s&.''-]{1,40})/i,
    /(?:know anyone|connections?)\s+at\s+(\w[\w\s&.''-]{1,40})/i,
  ];
  for (const pattern of alumniPatterns) {
    const match = message.match(pattern);
    if (match) {
      return match[1].trim().replace(/\s+/g, ' ').replace(/[?.!]+$/, '');
    }
  }
  return null;
}

// Check DiscoveredAlumni cache for a company
async function getCachedAlumni(base44, companyName) {
  try {
    const cached = await base44.entities.DiscoveredAlumni.filter({
      company: companyName,
      school_code: 'UF'
    });
    if (cached && cached.length > 0) {
      // Filter to only non-expired entries
      const now = new Date();
      const valid = cached.filter(a => new Date(a.expires_at) > now);
      if (valid.length > 0) {
        console.log('Alumni cache HIT for', companyName, '-', valid.length, 'alumni');
        return valid;
      }
      console.log('Alumni cache EXPIRED for', companyName);
      // Cleanup expired entries
      for (const a of cached) {
        try { await base44.asServiceRole.entities.DiscoveredAlumni.delete(a.id); } catch (e) {}
      }
    }
  } catch (e) {
    console.log('Alumni cache lookup failed:', e.message);
  }
  return null;
}

// Save alumni to DiscoveredAlumni entities with 24h TTL
async function saveAlumniCache(base44, alumni) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  for (const a of alumni) {
    try {
      await base44.asServiceRole.entities.DiscoveredAlumni.create({
        name: a.name,
        role_title: a.role_title,
        company: a.company,
        school_code: 'UF',
        match_score: a.match_score || 0,
        degree_info: a.degree_info || '',
        location: a.location || '',
        expires_at: expiresAt,
      });
    } catch (e) {
      console.log('Failed to cache alumni:', a.name, e.message);
    }
  }
  console.log('Cached', alumni.length, 'alumni until', expiresAt);
}

// Detect if user is asking about a specific company
function detectCompanyQuery(message) {
  const lower = message.toLowerCase();
  const companyPatterns = [
    /(?:research|tell me about|look into|check|what about|how is|is)\s+(\w[\w\s&.''-]{1,40}?)(?:\s+hiring|\s+jobs|\s+careers|\s+salary|\s+for me|\s*\?|$)/i,
    /(?:hiring|jobs|careers|openings|roles)\s+(?:at|for)\s+(\w[\w\s&.''-]{1,40})/i,
    /(\w[\w\s&.''-]{1,30}?)\s+(?:hiring|jobs|careers|openings|internships)/i,
  ];
  for (const pattern of companyPatterns) {
    const match = message.match(pattern);
    if (match) {
      return match[1].trim().replace(/\s+/g, ' ');
    }
  }
  return null;
}

// Check CompanyIntelCache, return valid cache or null
async function getCachedCompanyIntel(base44, companyName) {
  try {
    const cached = await base44.entities.CompanyIntelCache.filter({ 
      company_name: companyName 
    });
    if (cached && cached.length > 0) {
      const entry = cached[0];
      const expiresAt = new Date(entry.expires_at);
      if (expiresAt > new Date()) {
        console.log('Cache HIT for', companyName, '- expires', entry.expires_at);
        return entry;
      }
      console.log('Cache EXPIRED for', companyName);
      // Delete expired entry
      try { await base44.entities.CompanyIntelCache.delete(entry.id); } catch (e) {}
    }
  } catch (e) {
    console.log('Cache lookup failed:', e.message);
  }
  return null;
}

// Save company intel to cache with 24h TTL
async function saveCompanyIntelCache(base44, companyName, intelData) {
  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await base44.asServiceRole.entities.CompanyIntelCache.create({
      company_name: companyName,
      school_code: 'UF',
      hiring_score: intelData.hiring_score || 0,
      hiring_signal: intelData.hiring_signal || 'cool',
      intel_summary: intelData.summary || '',
      open_roles_count: intelData.open_roles_count || 0,
      salary_range: intelData.salary_range || '',
      expires_at: expiresAt,
    });
    console.log('Cached company intel for', companyName, 'until', expiresAt);
  } catch (e) {
    console.log('Cache save failed:', e.message);
  }
}

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

    // --- COMPANY INTEL FLOW: detect company → check cache → research → cache → return ---
    const detectedCompany = detectCompanyQuery(message);

    if (detectedCompany) {
      console.log('Company query detected:', detectedCompany);

      // Check cache first
      const cached = await getCachedCompanyIntel(base44, detectedCompany);
      if (cached) {
        console.log('Cache HIT — returning cached data for', detectedCompany);
        return Response.json({
          success: true,
          response: `Here's the latest intel on ${detectedCompany} (cached):`,
          message_type: 'company_intel',
          payload: {
            company: detectedCompany,
            hiring_score: cached.hiring_score,
            hiring_signal: cached.hiring_signal,
            company_summary: cached.intel_summary,
            open_roles_count: cached.open_roles_count,
            salary_range: cached.salary_range,
            recent_news: '',
            cached: true,
          }
        });
      }

      // Cache miss — Step 1: web research
      console.log('Cache MISS for', detectedCompany, '- researching...');

      const webResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Research ${detectedCompany}: current hiring activity, open roles, salary ranges for entry-level and mid-level positions, recent company news, and interview process.`,
        add_context_from_internet: true,
      });

      const webContext = typeof webResult === 'string' ? webResult : JSON.stringify(webResult);

      // Step 2: Synthesize into structured company briefing
      const companyIntel = await base44.integrations.Core.InvokeLLM({
        prompt: `You are Fast Track Pro, an elite career agent for UF students.

${profileContext}

Synthesize the following research about ${detectedCompany} into a structured company briefing for this student.

RESEARCH:
${webContext.substring(0, 4000)}

STUDENT'S REQUEST: "${message}"

Rules:
- hiring_score: integer 0-100 (80+ means hot, 50-79 warm, below 50 cool)
- hiring_signal: must be "hot", "warm", or "cool" matching the score
- salary_range: string like "$70K-$130K" covering entry to mid-level
- open_roles_count: integer, best estimate of total open roles
- company_summary: 2-3 sentence overview of the company's current hiring landscape
- recent_news: 1-2 sentence summary of recent relevant company news
- response: brief 2-3 sentence conversational message to the student referencing their UF background`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string", description: "Brief conversational message to the student" },
            hiring_score: { type: "integer", description: "0-100 hiring health score" },
            hiring_signal: { type: "string", enum: ["hot", "warm", "cool"] },
            salary_range: { type: "string", description: "Salary range e.g. $70K-$130K" },
            open_roles_count: { type: "integer", description: "Total open roles found" },
            company_summary: { type: "string", description: "2-3 sentence hiring overview" },
            recent_news: { type: "string", description: "1-2 sentence recent company news" }
          },
          required: ["response", "hiring_score", "hiring_signal", "salary_range", "open_roles_count", "company_summary", "recent_news"]
        }
      });

      // Save to cache with 24h TTL
      saveCompanyIntelCache(base44, detectedCompany, {
        hiring_score: companyIntel.hiring_score,
        hiring_signal: companyIntel.hiring_signal,
        summary: companyIntel.company_summary,
        open_roles_count: companyIntel.open_roles_count,
        salary_range: companyIntel.salary_range,
      });

      return Response.json({
        success: true,
        response: companyIntel.response || `Here's the latest intel on ${detectedCompany}:`,
        message_type: 'company_intel',
        payload: {
          company: detectedCompany,
          hiring_score: companyIntel.hiring_score,
          hiring_signal: companyIntel.hiring_signal,
          company_summary: companyIntel.company_summary,
          open_roles_count: companyIntel.open_roles_count,
          salary_range: companyIntel.salary_range,
          recent_news: companyIntel.recent_news,
          cached: false,
        }
      });
    }

    // --- GENERAL FLOW (non-company queries) ---
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
          message_type: { type: "string", enum: ["text", "alumni_card", "outreach_draft", "roadmap"] },
          payload: { type: "object", description: "Structured data matching the message_type schema" }
        },
        required: ["response", "message_type"]
      }
    });

    // Result logged for debugging

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