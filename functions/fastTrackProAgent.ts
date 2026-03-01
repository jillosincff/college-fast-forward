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

// Detect if user is asking to draft outreach to an alumni
function detectOutreachQuery(message) {
  const outreachPatterns = [
    /(?:draft|write|compose|create|help me write|send)\s+(?:a\s+)?(?:message|email|linkedin message|outreach|note|dm|intro)\s+(?:to|for)\s+(\w[\w\s.''-]{1,40})/i,
    /(?:reach out|message|email|contact)\s+(\w[\w\s.''-]{1,40})/i,
    /(?:outreach|message|email)\s+(?:to|for)\s+(\w[\w\s.''-]{1,40})/i,
    /(?:cold email|cold message|introduction|intro message)\s+(?:to|for)\s+(\w[\w\s.''-]{1,40})/i,
  ];
  for (const pattern of outreachPatterns) {
    const match = message.match(pattern);
    if (match) {
      const name = match[1].trim().replace(/\s+/g, ' ').replace(/[?.!]+$/, '');
      // Filter out generic words that aren't names
      const skipWords = ['a', 'an', 'the', 'someone', 'them', 'anyone', 'recruiter', 'hiring manager'];
      if (skipWords.includes(name.toLowerCase())) return null;
      return name;
    }
  }
  return null;
}

// Detect if user is asking for a career roadmap / plan
function detectRoadmapQuery(message) {
  const lower = message.toLowerCase();
  const roadmapPatterns = [
    /(?:create|build|make|give me|generate|plan)\s+(?:a\s+)?(?:career|job search|action|weekly|4.week|8.week|roadmap|plan|timeline|strategy)/i,
    /(?:career|job search|action|weekly)\s+(?:roadmap|plan|timeline|strategy)/i,
    /(?:what should i do|next steps|week.by.week|step.by.step)\s+(?:to|for|in)\s+(?:get|find|land|my|a)\s+(?:job|career|internship|role)/i,
    /(?:roadmap|plan|action plan|game plan|strategy)\s+(?:for|to)\s+(?:my|the|a)?\s*(?:career|job|internship|search)/i,
  ];
  for (const pattern of roadmapPatterns) {
    if (pattern.test(message)) return true;
  }
  // Keyword combos
  const keywords = ['roadmap', 'action plan', 'career plan', 'week by week', 'step by step', 'game plan'];
  return keywords.some(k => lower.includes(k));
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

// Track activity: increment profile counter + log activity
async function trackActivity(base44, userEmail, profileId, actionType, targetName) {
  const ts = new Date().toISOString();
  // Log activity
  try {
    await base44.entities.ProActivityLog.create({
      user_email: userEmail,
      action_type: actionType,
      target_name: targetName || '',
      timestamp: ts,
    });
  } catch (e) {
    console.log('Activity log failed:', e.message);
  }
  // Increment profile counter
  if (profileId) {
    const fieldMap = {
      company_search: 'companies_researched',
      alumni_view: 'alumni_discovered',
      message_draft: 'messages_drafted',
      roadmap_created: 'roadmaps_generated',
    };
    const field = fieldMap[actionType];
    if (field) {
      try {
        const profiles = await base44.entities.FastTrackProProfile.filter({ id: profileId });
        const p = profiles?.[0];
        if (p) {
          await base44.entities.FastTrackProProfile.update(profileId, {
            [field]: (p[field] || 0) + 1,
          });
        }
      } catch (e) {
        console.log('Profile counter update failed:', e.message);
      }
    }
  }
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

    // --- ALUMNI DISCOVERY FLOW: detect alumni query → check cache → research → cache → return ---
    const alumniCompany = detectAlumniQuery(message);

    if (alumniCompany) {
      console.log('Alumni query detected for:', alumniCompany);

      // Check cache first
      const cachedAlumni = await getCachedAlumni(base44, alumniCompany);
      if (cachedAlumni) {
        console.log('Alumni cache HIT — returning', cachedAlumni.length, 'cached alumni');
        trackActivity(base44, user.email, profile.id, 'alumni_view', alumniCompany);
        return Response.json({
          success: true,
          response: `Here are UF alumni I found at ${alumniCompany}:`,
          message_type: 'alumni_card',
          payload: {
            alumni: cachedAlumni.map(a => ({
              name: a.name,
              role_title: a.role_title,
              company: a.company,
              match_score: a.match_score,
              degree_info: a.degree_info,
              location: a.location,
            })),
            cached: true,
          }
        });
      }

      // Cache miss — Step 1: web research
      console.log('Alumni cache MISS for', alumniCompany, '- researching...');

      const webResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Find University of Florida alumni who currently work at ${alumniCompany}. For each person found, provide their full name, current job title, degree info if available, and location.`,
        add_context_from_internet: true,
      });

      const webContext = typeof webResult === 'string' ? webResult : JSON.stringify(webResult);

      // Step 2: Parse into structured alumni profiles
      const alumniResult = await base44.integrations.Core.InvokeLLM({
        prompt: `You are Fast Track Pro, an elite career agent for UF students.

${profileContext}

Parse the following research into structured alumni profiles for UF alumni at ${alumniCompany}.

RESEARCH:
${webContext.substring(0, 4000)}

Rules for match_score (0-100):
- Higher if alumni's role aligns with student's target_industry: "${profile.target_industry || 'not specified'}"
- Higher if alumni's seniority matches student's current_stage: "${profile.current_stage || 'not set'}"
- 90+ = perfect match, 70-89 = strong, 50-69 = moderate, below 50 = loose connection
- response: brief 2-3 sentence conversational message to the student about these alumni connections`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string", description: "Brief conversational message to the student" },
            alumni: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Full name" },
                  role_title: { type: "string", description: "Current job title" },
                  company: { type: "string", description: "Company name" },
                  degree_info: { type: "string", description: "UF degree info if available" },
                  location: { type: "string", description: "Current location" },
                  match_score: { type: "integer", description: "0-100 relevance score" }
                },
                required: ["name", "role_title", "company", "match_score"]
              }
            }
          },
          required: ["response", "alumni"]
        }
      });

      const alumni = (alumniResult.alumni || []).map(a => ({
        ...a,
        company: a.company || alumniCompany,
      }));

      // Save to cache with 24h TTL
      if (alumni.length > 0) {
        saveAlumniCache(base44, alumni);
      }

      trackActivity(base44, user.email, profile.id, 'alumni_view', alumniCompany);

      return Response.json({
        success: true,
        response: alumniResult.response || `Here are UF alumni I found at ${alumniCompany}:`,
        message_type: 'alumni_card',
        payload: {
          alumni,
          cached: false,
        }
      });
    }

    // --- ROADMAP FLOW: detect roadmap query → generate week-by-week plan → return ---
    if (detectRoadmapQuery(message)) {
      console.log('Roadmap query detected');

      const roadmapResult = await base44.integrations.Core.InvokeLLM({
        prompt: `You are Fast Track Pro, an elite AI career agent for University of Florida (UF) students.

${profileContext}

Generate a detailed week-by-week career action plan tailored to this student.

RULES:
- Generate 4-8 steps (weeks), each with a clear focus area
- Each step has: week_number (integer starting at 1), title (short 3-6 word title), description (1-2 sentences explaining the focus), action_items (array of 2-4 concrete, actionable task strings)
- Tailor the plan to the student's target industry (${profile.target_industry || 'general'}), target companies (${(profile.target_companies || []).join(', ') || 'not set'}), current stage (${profile.current_stage || 'exploring'}), timeline (${profile.career_timeline || 'flexible'}), and biggest challenge (${profile.biggest_challenge || 'not specified'})
- Start with foundational tasks (resume, LinkedIn, research) and progress to active outreach and applications
- Reference specific companies from their target list when possible
- Be specific and actionable — no vague advice
- response: brief 2-3 sentence conversational note introducing the plan`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string", description: "Brief intro note to the student" },
            title: { type: "string", description: "Plan title e.g. 'Your 6-Week Finance Career Plan'" },
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  week_number: { type: "integer", description: "Week number starting at 1" },
                  title: { type: "string", description: "Short title for this week" },
                  description: { type: "string", description: "1-2 sentence description of the focus" },
                  action_items: {
                    type: "array",
                    items: { type: "string" },
                    description: "2-4 concrete action items"
                  }
                },
                required: ["week_number", "title", "description", "action_items"]
              }
            }
          },
          required: ["response", "title", "steps"]
        }
      });

      trackActivity(base44, user.email, profile.id, 'roadmap_created', roadmapResult.title || 'Career Plan');

      return Response.json({
        success: true,
        response: roadmapResult.response || "Here's your personalized career action plan:",
        message_type: 'roadmap',
        payload: {
          title: roadmapResult.title || 'Your Career Action Plan',
          steps: roadmapResult.steps || [],
        }
      });
    }

    // --- OUTREACH DRAFT FLOW: detect outreach request → find alumni → generate message ---
    const outreachTarget = detectOutreachQuery(message);

    if (outreachTarget) {
      console.log('Outreach query detected for:', outreachTarget);

      // Try to find the alumni in DiscoveredAlumni cache
      let alumniRecord = null;
      try {
        const allAlumni = await base44.entities.DiscoveredAlumni.filter({ school_code: 'UF' });
        const now = new Date();
        const valid = (allAlumni || []).filter(a => new Date(a.expires_at) > now);
        alumniRecord = valid.find(a =>
          a.name.toLowerCase().includes(outreachTarget.toLowerCase()) ||
          outreachTarget.toLowerCase().includes(a.name.toLowerCase().split(' ')[0])
        );
      } catch (e) {
        console.log('Alumni lookup for outreach failed:', e.message);
      }

      const recipientName = alumniRecord?.name || outreachTarget;
      const recipientTitle = alumniRecord?.role_title || '';
      const recipientCompany = alumniRecord?.company || '';
      const recipientDegree = alumniRecord?.degree_info || '';

      // Determine ask type from message context
      let askType = 'informational interview';
      const lower = message.toLowerCase();
      if (lower.includes('referral') || lower.includes('refer')) askType = 'referral';
      else if (lower.includes('advice') || lower.includes('guidance')) askType = 'career advice';
      else if (lower.includes('coffee') || lower.includes('chat')) askType = 'coffee chat';

      // Determine channel from message context
      let channel = 'LinkedIn';
      if (lower.includes('email')) channel = 'Email';

      const outreachResult = await base44.integrations.Core.InvokeLLM({
        prompt: `You are Fast Track Pro, an elite career agent for UF students. Draft a personalized ${channel} outreach message.

${profileContext}

RECIPIENT INFO:
- Name: ${recipientName}
- Current Role: ${recipientTitle || 'unknown'}
- Company: ${recipientCompany || 'unknown'}
- UF Degree: ${recipientDegree || 'Fellow Gator'}

ASK TYPE: ${askType}

RULES:
- Open with the shared UF connection — mention being a fellow Gator
- Reference their current role at ${recipientCompany || 'their company'} specifically
- Mention the student's target industry (${profile.target_industry || 'their field'}) and current stage (${profile.current_stage || 'career exploration'})
- Make a specific ask: ${askType} (e.g. "15-minute call", "quick question about your path", etc.)
- Keep it professional but warm, 100-150 words max
- Do NOT use brackets or placeholders — use real details from the profile
- If channel is Email, include a subject line. If LinkedIn, no subject needed.
- response: a brief 1-2 sentence conversational note to the student about the draft`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string", description: "Brief note to the student about this draft" },
            recipient: { type: "string", description: "Full name of recipient" },
            channel: { type: "string", description: "LinkedIn or Email" },
            subject: { type: "string", description: "Email subject line (empty for LinkedIn)" },
            message_body: { type: "string", description: "The full outreach message text" }
          },
          required: ["response", "recipient", "channel", "message_body"]
        }
      });

      trackActivity(base44, user.email, profile.id, 'message_draft', recipientName);

      return Response.json({
        success: true,
        response: outreachResult.response || `Here's a draft ${channel} message to ${recipientName}:`,
        message_type: 'outreach_draft',
        payload: {
          recipient: outreachResult.recipient || recipientName,
          recipient_title: recipientTitle,
          recipient_company: recipientCompany,
          channel: outreachResult.channel || channel,
          subject: outreachResult.subject || '',
          message: outreachResult.message_body || '',
          ask_type: askType,
        }
      });
    }

    // --- COMPANY INTEL FLOW: detect company → check cache → research → cache → return ---
    const detectedCompany = detectCompanyQuery(message);

    if (detectedCompany) {
      console.log('Company query detected:', detectedCompany);

      // Check cache first
      const cached = await getCachedCompanyIntel(base44, detectedCompany);
      if (cached) {
        console.log('Cache HIT — returning cached data for', detectedCompany);
        trackActivity(base44, user.email, profile.id, 'company_search', detectedCompany);
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

      trackActivity(base44, user.email, profile.id, 'company_search', detectedCompany);

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