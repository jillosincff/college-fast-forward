import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// ═══════════════════════════════════════════════════════════
//  INTENT DETECTION HELPERS
// ═══════════════════════════════════════════════════════════

function detectAlumniQuery(message) {
  const patterns = [
    /(?:find|show|who|any|look for|search|discover)\s+(?:me\s+)?(?:uf\s+)?(?:alumni|gators?|connections?|people|grads?|insiders?)\s+(?:at|from|who work at|working at|who work there)\s*(\w[\w\s&.''-]{1,40})?/i,
    /(?:alumni|gators?|connections?|people|grads?|insiders?)\s+(?:at|from|who work at|working at)\s+(\w[\w\s&.''-]{1,40})/i,
    /(?:who|anyone)\s+(?:works?|is)\s+at\s+(\w[\w\s&.''-]{1,40})\s+(?:from uf|from university of florida|who went to uf)/i,
    /(?:uf|university of florida)\s+(?:alumni|grads?|people)\s+(?:at|from)\s+(\w[\w\s&.''-]{1,40})/i,
    /(?:know anyone|connections?)\s+at\s+(\w[\w\s&.''-]{1,40})/i,
    /find\s+(?:me\s+)?(?:uf\s+)?(?:alumni|people|insiders?|gators?)\s+(?:who\s+)?work\s+there/i,
    /(?:who works?|anyone)\s+there\s+(?:from uf|from university of florida|who went to uf|that went to uf)/i,
    /(?:find|show|any)\s+(?:me\s+)?(?:uf\s+)?(?:alumni|insiders?|gators?)\s+there/i,
    /find\s+(?:me\s+)?uf\s+alumni/i,
  ];
  for (const p of patterns) {
    const m = message.match(p);
    if (m) return m[1]?.trim().replace(/\s+/g, ' ').replace(/[?.!]+$/, '') || 'RESOLVE_FROM_CONTEXT';
  }
  return null;
}

function resolveCompanyFromContext(history) {
  if (!history) return null;
  const lines = history.split('\n').reverse();
  for (const line of lines) {
    let m = line.match(/(?:intel on|researching|research)\s+([A-Z][\w\s&.''-]{1,40}?)(?:\s*[\(:]|\s*$)/i);
    if (m) return m[1].trim();
    m = line.match(/(?:alumni.*?at|work.*?at|hired at|hiring at)\s+([A-Z][\w\s&.''-]{1,40}?)(?:\s*[\(:.!?]|\s*$)/i);
    if (m) return m[1].trim();
    m = line.match(/Student:\s*(?:Research|Tell me about|Look into|Check)\s+([A-Z][\w\s&.''-]{1,40}?)(?:\s+hiring|\s*$)/i);
    if (m) return m[1].trim();
  }
  return null;
}

function detectOutreachQuery(message) {
  const alumniKeywords = /\b(?:find|show|discover|search for|look for|who works?|any)\s+(?:me\s+)?(?:uf\s+)?(?:alumni|gators?|insiders?|connections?|people|grads?)/i;
  if (alumniKeywords.test(message)) return null;
  const patterns = [
    /(?:draft|write|compose|create|help me write)\s+(?:a\s+)?(?:message|email|linkedin message|outreach|note|dm|intro)\s+(?:to|for)\s+(\w[\w\s.''-]{1,40})/i,
    /(?:draft|write|compose)\s+(?:a\s+)?(?:cold email|cold message|introduction|outreach)\s+(?:to|for)\s+(\w[\w\s.''-]{1,40})/i,
    /(?:help me reach out|help me contact)\s+(\w[\w\s.''-]{1,40})/i,
    /(?:draft outreach|write outreach)\s+(?:to|for)\s+(\w[\w\s.''-]{1,40})/i,
  ];
  for (const p of patterns) {
    const m = message.match(p);
    if (m) {
      const name = m[1].trim().replace(/\s+/g, ' ').replace(/[?.!]+$/, '');
      if (['a','an','the','someone','them','anyone','recruiter','hiring manager'].includes(name.toLowerCase())) return null;
      return name;
    }
  }
  return null;
}

function detectRoadmapQuery(message) {
  const lower = message.toLowerCase();
  const patterns = [
    /(?:create|build|make|give me|generate|plan)\s+(?:a\s+)?(?:career|job search|action|weekly|4.week|8.week|roadmap|plan|timeline|strategy)/i,
    /(?:career|job search|action|weekly)\s+(?:roadmap|plan|timeline|strategy)/i,
    /(?:what should i do|next steps|week.by.week|step.by.step)\s+(?:to|for|in)\s+(?:get|find|land|my|a)\s+(?:job|career|internship|role)/i,
    /(?:roadmap|plan|action plan|game plan|strategy)\s+(?:for|to)\s+(?:my|the|a)?\s*(?:career|job|internship|search)/i,
  ];
  if (patterns.some(p => p.test(message))) return true;
  return ['roadmap','action plan','career plan','week by week','step by step','game plan'].some(k => lower.includes(k));
}

function detectOpportunityDiscovery(message) {
  const patterns = [
    /(?:find|suggest|recommend|show)\s+(?:me\s+)?companies/i,
    /(?:where|what)\s+(?:should|can|could)\s+(?:i|we)\s+(?:apply|look|work|target)/i,
    /(?:don'?t|do not)\s+know\s+(?:where|what)\s+to\s+(?:apply|look|target)/i,
    /(?:help me find|looking for)\s+companies/i,
    /(?:what|which)\s+(?:companies|employers|firms)\s+(?:should|are|would|could)/i,
    /(?:companies|employers)\s+(?:hiring|that hire|looking for)\s+(?:in|for|at)/i,
    /(?:mid.?size|startup|large)\s+companies\s+(?:in|for|hiring)/i,
    /(?:not sure|unsure|no idea)\s+(?:where|what)\s+(?:to apply|companies)/i,
    /(?:explore|discover)\s+(?:companies|employers|opportunities)/i,
  ];
  return patterns.some(p => p.test(message));
}

function detectCompanyQuery(message) {
  const patterns = [
    /(?:research|tell me about|look into|check|what about|how is|is)\s+(\w[\w\s&.''-]{1,40}?)(?:\s+hiring|\s+jobs|\s+careers|\s+salary|\s+for me|\s*\?|$)/i,
    /(?:hiring|jobs|careers|openings|roles)\s+(?:at|for)\s+(\w[\w\s&.''-]{1,40})/i,
    /(\w[\w\s&.''-]{1,30}?)\s+(?:hiring|jobs|careers|openings|internships)/i,
  ];
  for (const p of patterns) {
    const m = message.match(p);
    if (m) return m[1].trim().replace(/\s+/g, ' ');
  }
  return null;
}

// NEW INTENT DETECTORS

function detectResumeReview(message) {
  const lower = message.toLowerCase();
  return /(?:review|check|score|feedback|critique|analyze|look at)\s+(?:my\s+)?resume/i.test(message) ||
    /(?:how'?s?\s+(?:my\s+)?resume|resume\s+(?:review|feedback|score|check))/i.test(message) ||
    lower.includes('uploaded my resume') || lower.includes('here is my resume') || lower.includes('here\'s my resume');
}

function detectResumeMatch(message) {
  return /(?:match|compare|fit|align)\s+(?:my\s+)?resume\s+(?:to|with|against|for|vs)/i.test(message) ||
    /(?:does\s+)?my\s+resume\s+(?:fit|match|work for)/i.test(message) ||
    /resume\s+(?:vs|versus|against|compared to)/i.test(message);
}

function detectResumeTailor(message) {
  return /(?:tailor|rewrite|customize|adjust|optimize)\s+(?:my\s+)?resume/i.test(message) ||
    /(?:resume\s+for|rewrite.*?for)\s+(\w[\w\s]{1,30})/i.test(message);
}

function detectInterviewPrep(message) {
  return /(?:prep|prepare)\s+(?:me\s+)?(?:for\s+)?(?:an?\s+)?interview/i.test(message) ||
    /interview\s+(?:questions?|prep|tips|practice|at|for)/i.test(message) ||
    /(?:what will they ask|mock interview|behavioral questions)/i.test(message) ||
    /(?:interview at|interviewing at|interviewing with)\s+(\w[\w\s&.''-]{1,40})/i.test(message);
}

function detectLinkedInReview(message) {
  return /(?:review|check|optimize|improve|fix|look at)\s+(?:my\s+)?linkedin/i.test(message) ||
    /linkedin\s+(?:profile|review|tips|help|optimization)/i.test(message);
}

function detectSalaryNegotiation(message) {
  const lower = message.toLowerCase();
  return /(?:salary|negotiate|compensation|how much|what do they pay|pay range)/i.test(message) ||
    lower.includes('what should i ask') || lower.includes('what should i negotiate') ||
    lower.includes('salary data') || lower.includes('salary range');
}

function detectCoverLetter(message) {
  return /(?:cover letter|application letter|write a letter)/i.test(message) ||
    /(?:write|draft|create)\s+(?:a\s+)?cover\s+letter/i.test(message);
}

// ═══════════════════════════════════════════════════════════
//  DATA / CACHE HELPERS
// ═══════════════════════════════════════════════════════════

async function getCachedAlumni(base44, company) {
  try {
    const cached = await base44.entities.DiscoveredAlumni.filter({ company, school_code: 'UF' });
    if (cached?.length > 0) {
      const now = new Date();
      const valid = cached.filter(a => new Date(a.expires_at) > now);
      if (valid.length > 0) return valid;
      for (const a of cached) { try { await base44.asServiceRole.entities.DiscoveredAlumni.delete(a.id); } catch(e){} }
    }
  } catch(e) { console.log('Alumni cache error:', e.message); }
  return null;
}

async function saveAlumniCache(base44, alumni) {
  const exp = new Date(Date.now() + 24*60*60*1000).toISOString();
  for (const a of alumni) {
    try {
      await base44.asServiceRole.entities.DiscoveredAlumni.create({
        name: a.name, role_title: a.role_title, company: a.company, school_code: 'UF',
        match_score: a.match_score || 0, degree_info: a.degree_info || '',
        location: a.location || '', expires_at: exp,
      });
    } catch(e) {}
  }
}

async function getCachedCompanyIntel(base44, company) {
  try {
    const cached = await base44.entities.CompanyIntelCache.filter({ company_name: company });
    if (cached?.length > 0 && new Date(cached[0].expires_at) > new Date()) return cached[0];
    // Return expired cache as "previous" for delta comparison, then delete
    if (cached?.length > 0) {
      const expired = cached[0];
      try { await base44.entities.CompanyIntelCache.delete(expired.id); } catch(e){}
      return { ...expired, _expired: true };
    }
  } catch(e) {}
  return null;
}

// Build persistent memory context — compare new intel against previous data
function buildMemoryContext(previousIntel, newIntel, companyName) {
  if (!previousIntel) return '';
  const lines = [];
  const prevRoles = previousIntel.open_roles_count;
  const newRoles = newIntel.open_roles_count;
  if (prevRoles != null && newRoles != null && prevRoles !== newRoles) {
    const diff = newRoles - prevRoles;
    if (diff > 0) lines.push(`MEMORY: Last time you researched ${companyName}, they had ${prevRoles} open roles. Now they have ${newRoles} — hiring is RAMPING UP (+${diff} roles).`);
    else lines.push(`MEMORY: Last time you researched ${companyName}, they had ${prevRoles} open roles. Now it dropped to ${newRoles} — they may be slowing down hiring (${diff} roles).`);
  }
  const prevScore = previousIntel.hiring_score;
  const newScore = newIntel.hiring_score;
  if (prevScore != null && newScore != null && Math.abs(prevScore - newScore) >= 10) {
    if (newScore > prevScore) lines.push(`MEMORY: Their hiring score improved from ${prevScore} to ${newScore} since you last checked.`);
    else lines.push(`MEMORY: Their hiring score dropped from ${prevScore} to ${newScore} since you last checked.`);
  }
  const prevSignal = previousIntel.hiring_signal;
  const newSignal = newIntel.hiring_signal;
  if (prevSignal && newSignal && prevSignal !== newSignal) {
    lines.push(`MEMORY: Hiring signal changed from ${prevSignal.toUpperCase()} to ${newSignal.toUpperCase()}.`);
  }
  return lines.join('\n');
}

// Cross-reference alumni against CFF member database
async function crossReferenceCFF(base44, alumni) {
  if (!alumni || alumni.length === 0) return alumni;
  // Load CFF parent/alumni members
  let cffMembers = [];
  try {
    const [parents, users] = await Promise.all([
      base44.entities.ParentExpertise.filter({}, '-last_active_at', 200).catch(() => []),
      base44.asServiceRole.entities.User.list('-created_date', 200).catch(() => []),
    ]);
    // Build lookup by name (lowercase)
    const parentNames = new Map();
    (parents || []).forEach(p => {
      if (p.parent_name) parentNames.set(p.parent_name.toLowerCase().trim(), { email: p.parent_email, company: p.current_company, role: p.current_role });
    });
    const userNames = new Map();
    (users || []).forEach(u => {
      if (u.full_name) userNames.set(u.full_name.toLowerCase().trim(), { email: u.email, id: u.id });
    });
    cffMembers = { parentNames, userNames };
  } catch(e) {
    console.log('CFF cross-reference error:', e.message);
    return alumni.map(a => ({ ...a, is_cff_member: false, cff_channel: 'linkedin' }));
  }

  return alumni.map(a => {
    const nameKey = (a.name || '').toLowerCase().trim();
    const parentMatch = cffMembers.parentNames.get(nameKey);
    const userMatch = cffMembers.userNames.get(nameKey);
    if (parentMatch || userMatch) {
      return {
        ...a,
        is_cff_member: true,
        cff_email: parentMatch?.email || userMatch?.email || '',
        cff_user_id: userMatch?.id || '',
        cff_channel: 'cff_message',
      };
    }
    return { ...a, is_cff_member: false, cff_channel: 'linkedin' };
  });
}

async function saveCompanyIntelCache(base44, company, data) {
  try {
    await base44.asServiceRole.entities.CompanyIntelCache.create({
      company_name: company, school_code: 'UF',
      hiring_score: data.hiring_score || 0, hiring_signal: data.hiring_signal || 'cool',
      intel_summary: data.summary || '', open_roles_count: data.open_roles_count || 0,
      salary_range: data.salary_range || '', expires_at: new Date(Date.now() + 24*60*60*1000).toISOString(),
    });
  } catch(e) {}
}

async function trackActivity(base44, email, profileId, actionType, targetName) {
  try {
    await base44.entities.ProActivityLog.create({
      user_email: email, action_type: actionType,
      target_name: targetName || '', timestamp: new Date().toISOString(),
    });
  } catch(e) {}
  if (profileId) {
    const fieldMap = { company_search: 'companies_researched', alumni_view: 'alumni_discovered', message_draft: 'messages_drafted', roadmap_created: 'roadmaps_generated' };
    const field = fieldMap[actionType];
    if (field) {
      try {
        const ps = await base44.entities.FastTrackProProfile.filter({ id: profileId });
        if (ps?.[0]) await base44.entities.FastTrackProProfile.update(profileId, { [field]: (ps[0][field] || 0) + 1 });
      } catch(e) {}
    }
  }
}

async function saveToPipeline(base44, email, company, alumni) {
  try {
    const existing = await base44.entities.NetworkingPipeline.filter({ user_email: email, company });
    const names = new Set((existing||[]).map(e => e.alumni_name?.toLowerCase()));
    const now = new Date().toISOString();
    for (const a of alumni) {
      if (names.has(a.name?.toLowerCase())) continue;
      try {
        await base44.entities.NetworkingPipeline.create({
          user_email: email, company, alumni_name: a.name, alumni_role: a.role_title || '',
          alumni_source: 'fastiq', status: 'identified', status_date: now, identified_date: now,
        });
      } catch(e) {}
    }
  } catch(e) {}
}

function titleCase(str) {
  if (!str) return '';
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

const UF_FILTER = `CRITICAL: Only include people who attended the University of Florida (UF) in Gainesville. Do NOT include alumni from FIU, FSU, UCF, USF, or any other school.`;
const NON_UF_SCHOOLS = ['fiu','florida international','fsu','florida state','ucf','central florida','usf','south florida','famu','fgcu'];

function filterAndDedupAlumni(rawAlumni, fallbackCompany) {
  const processed = rawAlumni.map(a => ({ ...a, company: a.company || fallbackCompany }));
  const filtered = processed.filter(a => {
    const deg = (a.degree_info || '').toLowerCase();
    if (NON_UF_SCHOOLS.some(s => deg.includes(s))) return false;
    if (!a.match_score || a.match_score <= 0) return false;
    return true;
  });
  const seen = new Set();
  return filtered.filter(a => {
    const key = `${(a.name||'').toLowerCase()}_${(a.role_title||'').toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ═══════════════════════════════════════════════════════════
//  CONTEXT-AWARE INTENT CLASSIFICATION (LLM fallback)
// ═══════════════════════════════════════════════════════════

async function classifyIntentWithContext(base44, message, recentMessages, profileContext) {
  // Build conversation snippet for LLM
  const convoSnippet = recentMessages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content?.substring(0, 300)}`).join('\n');

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `You are an intent classifier for FASTIQ, a career AI for UF students.

${profileContext}

RECENT CONVERSATION:
${convoSnippet}
User: ${message}

Given this conversation context, classify the user's CURRENT message intent.

CRITICAL RULES:
- If the assistant just asked a clarifying question (like "Which company?", "What company?", "Tell me about which company?") and the user responded with a company name or short answer, treat the user's message as the ANSWER to that question, NOT a new standalone query.
- Map the answer back to the ORIGINAL intent. For example:
  - If assistant asked "Which company do you want me to scan for UF alumni?" and user says "Disney" → intent is "alumni_discovery" with company "Disney"
  - If assistant asked "Which company should I research?" and user says "Google" → intent is "company_intel" with company "Google"  
  - If assistant asked "Who should I draft a message to?" and user says "John Smith" → intent is "outreach_draft" with target "John Smith"
  - If assistant suggested "Want me to find UF alumni there?" and user says "yes" or "sure" → intent is "alumni_discovery" with company from previous context
- If the message is a standalone request, classify normally.

Possible intents: alumni_discovery, company_intel, outreach_draft, roadmap, resume_review, resume_match, resume_tailor, interview_prep, linkedin_review, salary_negotiation, cover_letter, opportunity_discovery, career_advice

Return the intent and any extracted entity (company name, person name, etc).`,
    response_json_schema: {
      type: "object",
      properties: {
        intent: { type: "string", enum: ["alumni_discovery", "company_intel", "outreach_draft", "roadmap", "resume_review", "resume_match", "resume_tailor", "interview_prep", "linkedin_review", "salary_negotiation", "cover_letter", "opportunity_discovery", "career_advice"] },
        company: { type: "string", description: "Company name if relevant, empty string if not" },
        person: { type: "string", description: "Person name if relevant (for outreach), empty string if not" },
        confidence: { type: "string", enum: ["high", "medium", "low"] },
        reasoning: { type: "string", description: "Brief explanation of classification" }
      },
      required: ["intent", "company", "confidence"]
    }
  });

  return result;
}

// Check if the assistant's last message was a clarifying question
function isAssistantAskingClarification(lastAssistantContent) {
  if (!lastAssistantContent) return false;
  const lower = lastAssistantContent.toLowerCase();
  const patterns = [
    /which company/i, /what company/i, /tell me (?:about )?which/i,
    /which (?:one|firm|employer|organization)/i,
    /want me to (?:scan|research|look into|check)/i,
    /should i (?:scan|research|look into|check)/i,
    /who should i (?:draft|write|compose)/i,
    /who do you want me to/i,
    /what (?:role|position|job)/i,
    /\?\s*$/  // ends with a question mark
  ];
  return patterns.some(p => p.test(lower));
}

// Check if user message is a short answer (likely replying to a question)
function isShortAnswer(message) {
  const words = message.trim().split(/\s+/);
  // Short answers: 1-4 words, or "yes/sure/yeah" affirmatives
  if (words.length <= 4) return true;
  if (/^(?:yes|yeah|yep|sure|ok|okay|please|definitely|absolutely|do it|go ahead|sounds good)/i.test(message.trim())) return true;
  return false;
}

// ═══════════════════════════════════════════════════════════
//  MAIN HANDLER
// ═══════════════════════════════════════════════════════════

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const message = body.message;
    const conversation_history = body.conversation_history || '';
    if (!message) return Response.json({ error: 'Message is required' }, { status: 400 });

    // Load recent conversation messages from DB for context tracking
    let recentDbMessages = [];
    try {
      const dbMessages = await base44.entities.ProAgentConversation.filter(
        { user_email: user.email }, '-created_date', 6
      );
      // Reverse to chronological order (oldest first)
      recentDbMessages = (dbMessages || []).reverse();
    } catch(e) { console.log('Could not load conversation history:', e.message); }

    // Load profile
    let profile = {};
    try {
      const profiles = await base44.entities.FastTrackProProfile.filter({ user_email: user.email });
      profile = profiles?.[0] || {};
    } catch(e) {}

    // Load pipeline for memory context
    let pipelineData = [];
    try {
      pipelineData = await base44.entities.NetworkingPipeline.filter({ user_email: user.email }, '-status_date', 50).catch(() => []);
    } catch(e) {}

    const pipelineSummary = pipelineData.length > 0
      ? `\n- Pipeline: ${pipelineData.length} contacts (${pipelineData.filter(p => p.status === 'identified').length} identified, ${pipelineData.filter(p => p.status === 'reached_out').length} reached out, ${pipelineData.filter(p => p.status === 'replied').length} replied)`
      : '';
    const staleOutreach = pipelineData.filter(p => {
      if (p.status !== 'reached_out' || !p.reached_out_date) return false;
      return (Date.now() - new Date(p.reached_out_date).getTime()) > 3 * 24 * 60 * 60 * 1000;
    });
    const staleSummary = staleOutreach.length > 0
      ? `\n- Stale outreach: ${staleOutreach.map(s => `${s.alumni_name} at ${s.company} (sent ${Math.round((Date.now() - new Date(s.reached_out_date).getTime()) / (1000*60*60*24))} days ago)`).join('; ')}`
      : '';

    const profileContext = `STUDENT PROFILE:
- Name: ${user.full_name || 'Gator Student'}
- Major: ${user.major || 'undeclared'}
- Graduation: ${user.graduation_year || 'unknown'}
- Target Industry: ${profile.target_industry || 'not specified'}
- Target Companies: ${(profile.target_companies || []).join(', ') || 'none set'}
- Company Size: ${profile.company_size_preference || 'not set'}
- Location: ${profile.location_preference || 'not set'}
- Timeline: ${profile.career_timeline || 'not set'}
- Stage: ${profile.current_stage || 'not set'}
- Challenge: ${profile.biggest_challenge || 'not set'}
- Stats: ${profile.alumni_discovered || 0} alumni found, ${profile.messages_drafted || 0} messages drafted, ${profile.companies_researched || 0} companies researched${pipelineSummary}${staleSummary}`;

    // Resolve target company references (#1 target, my dream company, etc.)
    let resolvedMessage = message;
    const targetCompanies = profile.target_companies || [];
    if (targetCompanies.length > 0) {
      const lower = message.toLowerCase();
      let idx = -1;
      if (/#1\s*target/i.test(lower) || /\b(?:first|top|primary|main|dream|#1)\s+(?:target\s+)?company/i.test(lower) || /my\s+(?:target\s+)?company/i.test(lower)) idx = 0;
      else if (/#2\s*target/i.test(lower) || /\b(?:second|#2)\s+(?:target\s+)?company/i.test(lower)) idx = 1;
      else if (/#3\s*target/i.test(lower) || /\b(?:third|#3)\s+(?:target\s+)?company/i.test(lower)) idx = 2;
      else if (/#4\s*target/i.test(lower) || /\b(?:fourth|#4)\s+(?:target\s+)?company/i.test(lower)) idx = 3;
      else if (/#5\s*target/i.test(lower) || /\b(?:fifth|#5)\s+(?:target\s+)?company/i.test(lower)) idx = 4;
      if (idx >= 0 && idx < targetCompanies.length) {
        resolvedMessage = `Research ${targetCompanies[idx]} hiring`;
        console.log(`Resolved target #${idx+1} → ${targetCompanies[idx]}`);
      }
    }

    // ═══════════════════════════════════════════════════════
    //  CONVERSATION CONTEXT RESOLUTION
    //  If the user's message is a short answer to a clarifying question,
    //  use LLM to classify the REAL intent from conversation context
    // ═══════════════════════════════════════════════════════

    let contextOverrideIntent = null;
    let contextOverrideCompany = null;
    let contextOverridePerson = null;

    if (recentDbMessages.length >= 2 && isShortAnswer(message)) {
      // Find the last assistant message
      const lastAssistantMsg = [...recentDbMessages].reverse().find(m => m.role === 'assistant');
      if (lastAssistantMsg && isAssistantAskingClarification(lastAssistantMsg.content)) {
        console.log('Context: Detected short answer to clarifying question. Running LLM intent classification...');
        try {
          const classification = await classifyIntentWithContext(base44, message, recentDbMessages.slice(-4), profileContext);
          console.log('Context classification:', JSON.stringify(classification));
          if (classification && classification.confidence !== 'low') {
            contextOverrideIntent = classification.intent;
            contextOverrideCompany = classification.company || null;
            contextOverridePerson = classification.person || null;
            // Rewrite resolvedMessage to make regex-based detectors work
            if (contextOverrideCompany && contextOverrideIntent === 'alumni_discovery') {
              resolvedMessage = `Find UF alumni at ${contextOverrideCompany}`;
              console.log(`Context override: alumni_discovery → "${resolvedMessage}"`);
            } else if (contextOverrideCompany && contextOverrideIntent === 'company_intel') {
              resolvedMessage = `Research ${contextOverrideCompany} hiring`;
              console.log(`Context override: company_intel → "${resolvedMessage}"`);
            } else if (contextOverridePerson && contextOverrideIntent === 'outreach_draft') {
              resolvedMessage = `Draft a message to ${contextOverridePerson}`;
              console.log(`Context override: outreach_draft → "${resolvedMessage}"`);
            } else if (contextOverrideIntent === 'interview_prep' && contextOverrideCompany) {
              resolvedMessage = `Prepare me for an interview at ${contextOverrideCompany}`;
              console.log(`Context override: interview_prep → "${resolvedMessage}"`);
            } else if (contextOverrideIntent === 'roadmap') {
              resolvedMessage = `Create a career roadmap for me`;
            } else if (contextOverrideIntent === 'opportunity_discovery') {
              resolvedMessage = `Find companies hiring in my field`;
            }
          }
        } catch(e) {
          console.log('Context classification failed (continuing with regex):', e.message);
        }
      }
    }

    // ═══════════════════════════════════════════════════════
    //  INTENT ROUTING (order matters!)
    // ═══════════════════════════════════════════════════════

    // 1. RESUME REVIEW
    if (detectResumeReview(resolvedMessage)) {
      console.log('Intent: resume_review');
      const resumeText = profile.resume_text || '';
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FASTIQ, an elite AI career center for UF students.\n\n${profileContext}\n\nReview this student's resume and provide a detailed analysis.\n\n${resumeText ? `RESUME TEXT:\n${resumeText}\n\n` : 'The student has not uploaded a resume yet. Provide general resume advice based on their profile, and encourage them to paste their resume text.\n\n'}Analyze: formatting, action verbs, quantified achievements, missing sections, length, keyword density for ${profile.target_industry || 'their target industry'} roles. Be specific and actionable.`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            overall_score: { type: "integer", description: "0-100" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            missing_keywords: { type: "array", items: { type: "string" } },
            summary: { type: "string" }
          },
          required: ["response", "overall_score", "strengths", "improvements", "summary"]
        }
      });
      return Response.json({
        success: true, response: result.response || "Here's your resume review:",
        message_type: 'resume_review',
        payload: { overall_score: result.overall_score, strengths: result.strengths, improvements: result.improvements, missing_keywords: result.missing_keywords || [], summary: result.summary }
      });
    }

    // 2. RESUME MATCH
    if (detectResumeMatch(resolvedMessage)) {
      console.log('Intent: resume_match');
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FASTIQ. Compare this student's resume against a job description.\n\n${profileContext}\n\n${profile.resume_text ? `RESUME:\n${profile.resume_text}\n\n` : ''}Student's request: "${resolvedMessage}"\n\nAnalyze how well the resume matches the role. Be specific about matching skills, missing skills, and exact changes needed.`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            match_score: { type: "integer" },
            matching_skills: { type: "array", items: { type: "string" } },
            missing_skills: { type: "array", items: { type: "string" } },
            suggested_changes: { type: "array", items: { type: "object", properties: { section: { type: "string" }, change: { type: "string" } }, required: ["section","change"] } },
            summary: { type: "string" }
          },
          required: ["response", "match_score", "matching_skills", "missing_skills", "summary"]
        }
      });
      return Response.json({
        success: true, response: result.response || "Here's how your resume matches:",
        message_type: 'resume_match', payload: result
      });
    }

    // 3. RESUME TAILOR
    if (detectResumeTailor(resolvedMessage)) {
      console.log('Intent: resume_tailor');
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FASTIQ. Tailor this student's resume for a specific role.\n\n${profileContext}\n\n${profile.resume_text ? `RESUME:\n${profile.resume_text}\n\n` : ''}Request: "${resolvedMessage}"\n\nRewrite bullet points and summary to target the specific role. Show original vs suggested text for each section.`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            sections: { type: "array", items: { type: "object", properties: { section_name: { type: "string" }, original_text: { type: "string" }, suggested_text: { type: "string" }, reason: { type: "string" } }, required: ["section_name","suggested_text","reason"] } }
          },
          required: ["response", "sections"]
        }
      });
      return Response.json({
        success: true, response: result.response || "Here's your tailored resume:",
        message_type: 'resume_tailor', payload: result
      });
    }

    // 4. INTERVIEW PREP
    if (detectInterviewPrep(resolvedMessage)) {
      console.log('Intent: interview_prep');
      const companyMatch = resolvedMessage.match(/(?:interview\s+(?:at|for|with)|prep.*?for)\s+(\w[\w\s&.''-]{1,40})/i);
      const company = companyMatch?.[1]?.trim() || targetCompanies[0] || '';
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FASTIQ. Prepare this student for an interview.\n\n${profileContext}\n\nRequest: "${resolvedMessage}"\n${company ? `Company: ${company}` : ''}\n\nResearch the company's interview process. Personalize questions based on the student's major (${user.major || 'their field'}) and target role. Include behavioral, technical, and culture-fit questions.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            company_name: { type: "string" }, role: { type: "string" },
            interview_format: { type: "string" },
            likely_questions: { type: "array", items: { type: "object", properties: { question: { type: "string" }, what_they_look_for: { type: "string" }, approach: { type: "string" } }, required: ["question"] } },
            tips: { type: "array", items: { type: "string" } },
            culture_notes: { type: "string" }
          },
          required: ["response", "likely_questions"]
        }
      });
      return Response.json({
        success: true, response: result.response || "Here's your interview prep:",
        message_type: 'interview_prep', payload: result
      });
    }

    // 5. LINKEDIN REVIEW
    if (detectLinkedInReview(resolvedMessage)) {
      console.log('Intent: linkedin_review');
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FASTIQ. Review this student's LinkedIn profile.\n\n${profileContext}\n\nLinkedIn URL: ${profile.linkedin_url || 'not provided'}\nRequest: "${resolvedMessage}"\n\nAnalyze their headline, summary, experience, skills, and recommendations. Score the profile and provide specific improvement suggestions for ${profile.target_industry || 'their target industry'} roles.`,
        add_context_from_internet: !!profile.linkedin_url,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            overall_score: { type: "integer" },
            headline_suggestion: { type: "string" },
            summary_suggestion: { type: "string" },
            improvements: { type: "array", items: { type: "object", properties: { section: { type: "string" }, issue: { type: "string" }, suggestion: { type: "string" } }, required: ["section","suggestion"] } }
          },
          required: ["response", "overall_score"]
        }
      });
      return Response.json({
        success: true, response: result.response || "Here's your LinkedIn review:",
        message_type: 'linkedin_review', payload: result
      });
    }

    // 6. SALARY NEGOTIATION
    if (detectSalaryNegotiation(resolvedMessage)) {
      console.log('Intent: salary_negotiation');
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FASTIQ. Provide salary intelligence for this student.\n\n${profileContext}\n\nRequest: "${resolvedMessage}"\n\nFind real salary data for entry-level ${profile.target_industry || ''} roles${profile.location_preference ? ' in ' + profile.location_preference : ''}. Include negotiation tactics and a sample negotiation script.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            role: { type: "string" }, location: { type: "string" },
            salary_range: { type: "string" }, median_salary: { type: "string" },
            negotiation_tips: { type: "array", items: { type: "string" } },
            sample_script: { type: "string" }
          },
          required: ["response", "salary_range", "negotiation_tips"]
        }
      });
      return Response.json({
        success: true, response: result.response || "Here's the salary intel:",
        message_type: 'salary_intel', payload: result
      });
    }

    // 7. COVER LETTER
    if (detectCoverLetter(resolvedMessage)) {
      console.log('Intent: cover_letter');
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FASTIQ. Write a tailored cover letter for this student.\n\n${profileContext}\n\nRequest: "${resolvedMessage}"\n\nWrite a professional, personalized cover letter. Reference the student's UF background, major, and target industry. Keep it concise (3-4 paragraphs).`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            recipient: { type: "string" }, company: { type: "string" }, role: { type: "string" },
            letter_text: { type: "string" }
          },
          required: ["response", "letter_text"]
        }
      });
      return Response.json({
        success: true, response: result.response || "Here's your cover letter:",
        message_type: 'cover_letter', payload: result
      });
    }

    // 8. ALUMNI DISCOVERY (checked before outreach to prevent misclassification)
    let alumniCompany = detectAlumniQuery(resolvedMessage);
    if (alumniCompany === 'RESOLVE_FROM_CONTEXT') {
      alumniCompany = resolveCompanyFromContext(conversation_history) || null;
    }

    if (alumniCompany) {
      console.log('Intent: alumni_discovery for', alumniCompany);
      alumniCompany = titleCase(alumniCompany);

      const cached = await getCachedAlumni(base44, alumniCompany);
      if (cached) {
        const enrichedCached = await crossReferenceCFF(base44, cached.map(a => ({ name: a.name, role_title: a.role_title, company: a.company, match_score: a.match_score, degree_info: a.degree_info, location: a.location })));
        saveToPipeline(base44, user.email, alumniCompany, enrichedCached);
        trackActivity(base44, user.email, profile.id, 'alumni_view', alumniCompany);
        const guidance = await generateAlumniGuidance(base44, enrichedCached, alumniCompany, profileContext);
        return Response.json({
          success: true, response: guidance,
          message_type: 'alumni_card',
          payload: { alumni: enrichedCached, cached: true }
        });
      }

      // Web research
      const webResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Find alumni of the University of Florida (UF, in Gainesville, Florida) who currently work at ${alumniCompany}.\n\n${UF_FILTER}\n\nFor each confirmed UF alumni found, provide their full name, current job title, UF degree info, and location.`,
        add_context_from_internet: true,
      });

      const alumniResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Parse research into structured alumni profiles for UF alumni at ${alumniCompany}.

${profileContext}

${UF_FILTER}
- DEDUPLICATE same name+title

MATCH SCORE ALGORITHM (0-100):
Score each alumni based on how useful they are for THIS specific student. Add points from each factor:

1. COMPANY MATCH (0-40 points):
   - Works at student's target company: +40
   - Works at competitor/partner in same industry: +20
   - Works in same industry but different company: +10

2. INDUSTRY/FIELD ALIGNMENT (0-25 points):
   - Role is directly in student's target industry (${profile.target_industry || 'their field'}): +25
   - Role is adjacent (e.g. student wants finance, alumni is in consulting at a bank): +15
   - Role is in a different field at the target company: +8

3. ROLE RELEVANCE to student's major (${user.major || 'their major'}) (0-20 points):
   - Role directly uses skills from student's major: +20
   - Role somewhat related to student's major: +10
   - Role unrelated but at a target company: +5

4. SENIORITY / NETWORKING VALUE (0-15 points):
   - VP/Director/C-suite (great for warm intros and referrals): +15
   - Senior/Manager (great for career advice and internal referrals): +12
   - Mid-level/experienced (great for realistic advice): +8
   - Entry-level/recent grad (great for realistic expectations, interview tips): +5

EXAMPLES:
- UF alum who is VP of Engineering at student's #1 target company, student is CS major → 40+25+20+15 = 100
- UF alum who is Marketing Manager at student's target company, student is Marketing major → 40+25+20+12 = 97
- UF alum who is Software Engineer at a competitor, student is CS major → 20+15+20+8 = 63
- UF alum who is HR Coordinator at target company, student is Finance major → 40+8+5+5 = 58

CRITICAL: An alum at the student's TARGET COMPANY in a related role should score 60-90+. Do NOT give 10-20% to someone at a target company.

RESEARCH:
${String(typeof webResult === 'string' ? webResult : JSON.stringify(webResult)).substring(0,4000)}`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            alumni: { type: "array", items: { type: "object", properties: { name: { type: "string" }, role_title: { type: "string" }, company: { type: "string" }, degree_info: { type: "string" }, location: { type: "string" }, match_score: { type: "integer" }, seniority_level: { type: "string", enum: ["entry","mid","senior","director","vp_plus"] } }, required: ["name","role_title","company","match_score"] } }
          },
          required: ["response","alumni"]
        }
      });

      const alumni = filterAndDedupAlumni(alumniResult.alumni || [], alumniCompany);

      if (alumni.length > 0) {
        // Cross-reference against CFF member database
        const enrichedAlumni = await crossReferenceCFF(base44, alumni);
        saveAlumniCache(base44, enrichedAlumni);
        saveToPipeline(base44, user.email, alumniCompany, enrichedAlumni);
        trackActivity(base44, user.email, profile.id, 'alumni_view', alumniCompany);
        const guidance = await generateAlumniGuidance(base44, enrichedAlumni, alumniCompany, profileContext);
        return Response.json({
          success: true, response: guidance,
          message_type: 'alumni_card', payload: { alumni: enrichedAlumni, cached: false }
        });
      }

      // WARM PATH FALLBACKS (Layers 1-5)
      console.log('Zero alumni at', alumniCompany, '— running warm-path fallback');
      const industry = profile.target_industry || 'the same industry';

      let nearbyAlumni = [], partnerAlumni = [], recruiters = [], linkedinStrategy = null, cffInsiders = [];

      // Run fallbacks in parallel
      const [nearbyRes, partnerRes, recruiterRes, stratRes, expertiseRes] = await Promise.allSettled([
        base44.integrations.Core.InvokeLLM({
          prompt: `Find UF alumni at competitors of ${alumniCompany} in ${industry}. Return 3-5 with connection_note explaining how they help reach ${alumniCompany}.\n${UF_FILTER}`,
          add_context_from_internet: true,
          response_json_schema: { type: "object", properties: { alumni: { type: "array", items: { type: "object", properties: { name: { type: "string" }, role_title: { type: "string" }, company: { type: "string" }, degree_info: { type: "string" }, location: { type: "string" }, match_score: { type: "integer" }, connection_note: { type: "string" } }, required: ["name","role_title","company"] } } }, required: ["alumni"] }
        }),
        base44.integrations.Core.InvokeLLM({
          prompt: `Find major clients/partners/vendors of ${alumniCompany}. Then find UF alumni at those companies.\n${UF_FILTER}`,
          add_context_from_internet: true,
          response_json_schema: { type: "object", properties: { alumni: { type: "array", items: { type: "object", properties: { name: { type: "string" }, role_title: { type: "string" }, company: { type: "string" }, degree_info: { type: "string" }, location: { type: "string" }, match_score: { type: "integer" }, connection_note: { type: "string" } }, required: ["name","role_title","company"] } } }, required: ["alumni"] }
        }),
        base44.integrations.Core.InvokeLLM({
          prompt: `Find 2-3 recruiting firms that place candidates at ${alumniCompany} or in ${industry}.`,
          add_context_from_internet: true,
          response_json_schema: { type: "object", properties: { recruiters: { type: "array", items: { type: "object", properties: { firm_name: { type: "string" }, specialization: { type: "string" }, contact_tip: { type: "string" } }, required: ["firm_name","specialization"] } } }, required: ["recruiters"] }
        }),
        base44.integrations.Core.InvokeLLM({
          prompt: `Action plan for a UF ${profile.current_stage || 'student'} to build connections at ${alumniCompany} with no direct alumni. Include 3-4 steps, LinkedIn groups, and events.`,
          add_context_from_internet: true,
          response_json_schema: { type: "object", properties: { steps: { type: "array", items: { type: "string" } }, groups: { type: "array", items: { type: "string" } }, events: { type: "array", items: { type: "string" } } }, required: ["steps"] }
        }),
        base44.entities.ParentExpertise.filter({ industry, available: true }, '-last_active_at', 10).catch(() => [])
      ]);

      if (nearbyRes.status === 'fulfilled') { nearbyAlumni = nearbyRes.value?.alumni || []; if (nearbyAlumni.length > 0) { saveAlumniCache(base44, nearbyAlumni); for (const a of nearbyAlumni) saveToPipeline(base44, user.email, a.company, [a]); } }
      if (partnerRes.status === 'fulfilled') { partnerAlumni = partnerRes.value?.alumni || []; if (partnerAlumni.length > 0) saveAlumniCache(base44, partnerAlumni); }
      if (recruiterRes.status === 'fulfilled') recruiters = recruiterRes.value?.recruiters || [];
      if (stratRes.status === 'fulfilled') linkedinStrategy = stratRes.value;
      if (expertiseRes.status === 'fulfilled') cffInsiders = (expertiseRes.value || []).slice(0,4).map(p => ({ name: p.parent_name || 'CFF Member', role: p.current_role || '', company: p.current_company || '', email: p.parent_email || '', industry: p.industry || industry }));

      trackActivity(base44, user.email, profile.id, 'alumni_view', alumniCompany);
      const totalPaths = nearbyAlumni.length + cffInsiders.length + partnerAlumni.length + recruiters.length + (linkedinStrategy ? 1 : 0);

      return Response.json({
        success: true,
        response: `I didn't find UF alumni directly at ${alumniCompany} — but FASTIQ never hits a dead end. I found ${totalPaths} warm paths into this company:`,
        message_type: 'warm_path',
        payload: { target_company: alumniCompany, nearby_alumni: nearbyAlumni, cff_insiders: cffInsiders, partner_alumni: partnerAlumni, recruiters, linkedin_strategy: linkedinStrategy }
      });
    }

    // 9. OPPORTUNITY DISCOVERY
    if (detectOpportunityDiscovery(resolvedMessage)) {
      console.log('Intent: opportunity_discovery');
      const sizePref = { large: 'large corporation', mid_size: 'mid-size company', startup: 'startup' }[profile.company_size_preference] || '';
      const industry = profile.target_industry || 'any industry';
      const major = user.major || 'their field';
      const locPref = profile.location_preference || '';

      const webResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Find 5-8 companies hiring entry-level ${major} roles in ${industry}${sizePref ? ', focusing on ' + sizePref + ' companies' : ''}${locPref ? ' near ' + locPref : ''}. Student request: "${resolvedMessage}"`,
        add_context_from_internet: true,
      });

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FASTIQ.\n\n${profileContext}\n\nBased on research, suggest 5-8 companies for this ${major} student.\n\nRESEARCH:\n${String(typeof webResult === 'string' ? webResult : JSON.stringify(webResult)).substring(0,4000)}\n\nEvery company MUST have roles for a ${major} graduate. Be realistic.`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            suggestions: { type: "array", items: { type: "object", properties: { company_name: { type: "string" }, reason: { type: "string" }, size: { type: "string", enum: ["large","mid_size","startup"] }, hiring_status: { type: "string", enum: ["actively_hiring","some_openings","unknown"] }, location: { type: "string" } }, required: ["company_name","reason","size","hiring_status"] } }
          },
          required: ["response","suggestions"]
        }
      });

      trackActivity(base44, user.email, profile.id, 'company_search', industry);
      return Response.json({
        success: true, response: result.response || "Here are companies for you:",
        message_type: 'company_suggestions', payload: { suggestions: result.suggestions || [] }
      });
    }

    // 10. ROADMAP
    if (detectRoadmapQuery(resolvedMessage)) {
      console.log('Intent: roadmap');
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FASTIQ.\n\n${profileContext}\n\nGenerate a 4-8 week career action plan tailored to this student. Start with foundational tasks and progress to active outreach. Reference their target companies when possible.`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" }, title: { type: "string" },
            steps: { type: "array", items: { type: "object", properties: { week_number: { type: "integer" }, title: { type: "string" }, description: { type: "string" }, action_items: { type: "array", items: { type: "string" } } }, required: ["week_number","title","description","action_items"] } }
          },
          required: ["response","title","steps"]
        }
      });
      trackActivity(base44, user.email, profile.id, 'roadmap_created', result.title || 'Career Plan');
      return Response.json({
        success: true, response: result.response || "Here's your plan:",
        message_type: 'roadmap', payload: { title: result.title || 'Your Career Action Plan', steps: result.steps || [] }
      });
    }

    // 11. OUTREACH DRAFT
    const outreachTarget = detectOutreachQuery(resolvedMessage);
    if (outreachTarget) {
      console.log('Intent: outreach_draft for', outreachTarget);
      let alumniRecord = null;
      try {
        const all = await base44.entities.DiscoveredAlumni.filter({ school_code: 'UF' });
        const valid = (all||[]).filter(a => new Date(a.expires_at) > new Date());
        alumniRecord = valid.find(a => a.name.toLowerCase().includes(outreachTarget.toLowerCase()) || outreachTarget.toLowerCase().includes(a.name.toLowerCase().split(' ')[0]));
      } catch(e) {}

      const recipientName = alumniRecord?.name || outreachTarget;
      const recipientTitle = alumniRecord?.role_title || '';
      const recipientCompany = alumniRecord?.company || '';
      const lower = message.toLowerCase();
      let askType = 'informational interview';
      if (lower.includes('referral')) askType = 'referral';
      else if (lower.includes('advice')) askType = 'career advice';
      else if (lower.includes('coffee')) askType = 'coffee chat';
      let channel = lower.includes('email') ? 'Email' : 'LinkedIn';

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FASTIQ. Draft a ${channel} ${askType} outreach message.\n\n${profileContext}\n\nTo: ${recipientName}, ${recipientTitle} at ${recipientCompany}\nAsk: ${askType}\n\nOpen with shared UF connection. Reference their role. Keep it 100-150 words. No placeholders.`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" }, recipient: { type: "string" }, channel: { type: "string" },
            subject: { type: "string" }, message_body: { type: "string" }
          },
          required: ["response","recipient","channel","message_body"]
        }
      });

      trackActivity(base44, user.email, profile.id, 'message_draft', recipientName);
      return Response.json({
        success: true, response: result.response || `Here's your draft to ${recipientName}:`,
        message_type: 'outreach_draft',
        payload: { recipient: result.recipient || recipientName, recipient_title: recipientTitle, recipient_company: recipientCompany, channel: result.channel || channel, subject: result.subject || '', message: result.message_body || '', ask_type: askType }
      });
    }

    // 12. COMPANY INTEL
    let detectedCompany = detectCompanyQuery(resolvedMessage);
    if (detectedCompany) {
      const bad = ['are they','is it','my','the','a','it','they','this','that','are','is'];
      if (detectedCompany.length < 2 || bad.includes(detectedCompany.toLowerCase())) detectedCompany = null;
    }

    if (detectedCompany) {
      console.log('Intent: company_intel for', detectedCompany);
      detectedCompany = titleCase(detectedCompany);

      // Helper: run personalized analysis on intel results
      const runPersonalizedAnalysis = async (companyName, intelData, memoryContext) => {
        try {
          const analysisResult = await base44.integrations.Core.InvokeLLM({
            prompt: `You are FASTIQ, an elite AI career center for UF students. You just researched ${companyName} for this student. Now ANALYZE what the research means specifically for them.

${profileContext}

${memoryContext ? `PERSISTENT MEMORY (changes since last research):\n${memoryContext}\n\nIMPORTANT: If there are memory deltas, LEAD with what changed. Example: "Last time you looked at Disney, they had 35 open roles — now it's 28. They may be slowing down. Consider accelerating your outreach before the window closes."\n` : ''}
COMPANY INTEL:
- Company: ${companyName}
- Hiring Score: ${intelData.hiring_score}/100 (${intelData.hiring_signal})
- Open Roles: ${intelData.open_roles_count}
- Salary Range: ${intelData.salary_range || 'unknown'}
- Summary: ${intelData.company_summary || ''}
- Recent News: ${(intelData.recent_news || []).join('; ')}
- Interview Process: ${intelData.interview_process || 'unknown'}

INSTRUCTIONS:
Based on the student's profile (major, graduation year, career stage, target industry, location preference, career timeline) and the company intel, write a SHORT personalized assessment (3-5 sentences max).

Consider these scenarios:
- If roles are too senior: flag it and suggest finding entry-level pipelines via alumni or suggest similar companies hiring entry-level
- If it's a great match: say so and suggest immediate next steps (find alumni, draft cover letter, etc.)
- If there's a hiring freeze/layoffs: warn them and suggest alternatives or watchlisting
- If location doesn't match: highlight which roles might work and which don't
- If industry alignment is weak: note the gap and suggest how to bridge it

End with exactly 2 concrete suggested next actions formatted as arrows (→). Each action should be specific and actionable, like "Find UF alumni at ${companyName} who could give you a warm intro" or "Research similar companies that are hiring entry-level right now".

Be direct, warm, and strategic. Never dump data — always tell them what it MEANS for them.`,
            response_json_schema: {
              type: "object",
              properties: {
                assessment: { type: "string", description: "The personalized analysis paragraph (3-5 sentences)" },
                next_actions: { type: "array", items: { type: "string" }, description: "Exactly 2 suggested next actions starting with →" },
                match_level: { type: "string", enum: ["strong_match", "moderate_match", "weak_match", "caution"], description: "How well this company fits the student" }
              },
              required: ["assessment", "next_actions", "match_level"]
            }
          });
          return analysisResult;
        } catch (e) {
          console.log('Personalized analysis error:', e.message);
          return null;
        }
      };

      const cached = await getCachedCompanyIntel(base44, detectedCompany);
      if (cached && !cached._expired) {
        trackActivity(base44, user.email, profile.id, 'company_search', detectedCompany);
        const cachedIntelData = { hiring_score: cached.hiring_score, hiring_signal: cached.hiring_signal, company_summary: cached.intel_summary, open_roles_count: cached.open_roles_count, salary_range: cached.salary_range, recent_news: [], interview_process: '' };
        const analysis = await runPersonalizedAnalysis(detectedCompany, cachedIntelData);
        return Response.json({
          success: true,
          response: analysis ? analysis.assessment : `Here's intel on ${detectedCompany}:`,
          message_type: 'company_intel',
          payload: { company: detectedCompany, hiring_score: cached.hiring_score, hiring_signal: cached.hiring_signal, company_summary: cached.intel_summary, open_roles_count: cached.open_roles_count, salary_range: cached.salary_range, cached: true, personalized_analysis: analysis || null }
        });
      }
      // Keep expired cache for memory delta comparison
      const previousIntel = (cached && cached._expired) ? cached : null;

      const webResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Research ${detectedCompany} as of 2026. Hiring status, open roles count, salary ranges, recent news, interview process. Be specific.`,
        add_context_from_internet: true,
      });

      const intel = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FASTIQ.\n\n${profileContext}\n\nSynthesize research about ${detectedCompany} into a briefing.\n\nRESEARCH:\n${String(typeof webResult === 'string' ? webResult : JSON.stringify(webResult)).substring(0,4000)}\n\nhiring_score: 0-100 (80+=hot, 50-79=warm, <50=cool). salary_range: specific like "$65K-$95K". recent_news: array of 2-4 factual items.`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" }, hiring_score: { type: "integer" }, hiring_signal: { type: "string", enum: ["hot","warm","cool"] },
            salary_range: { type: "string" }, open_roles_count: { type: "integer" }, company_summary: { type: "string" },
            recent_news: { type: "array", items: { type: "string" } }, interview_process: { type: "string" }
          },
          required: ["response","hiring_score","hiring_signal","salary_range","open_roles_count","company_summary"]
        }
      });

      saveCompanyIntelCache(base44, detectedCompany, { hiring_score: intel.hiring_score, hiring_signal: intel.hiring_signal, summary: intel.company_summary, open_roles_count: intel.open_roles_count, salary_range: intel.salary_range });
      trackActivity(base44, user.email, profile.id, 'company_search', detectedCompany);

      const news = Array.isArray(intel.recent_news) ? intel.recent_news : (intel.recent_news ? [intel.recent_news] : []);
      const intelForAnalysis = { ...intel, recent_news: news };
      // Build memory delta context from previous intel
      const memoryCtx = buildMemoryContext(previousIntel, intel, detectedCompany);
      const analysis = await runPersonalizedAnalysis(detectedCompany, intelForAnalysis, memoryCtx);

      return Response.json({
        success: true,
        response: analysis ? analysis.assessment : (intel.response || `Here's intel on ${detectedCompany}:`),
        message_type: 'company_intel',
        payload: { company: detectedCompany, hiring_score: intel.hiring_score, hiring_signal: intel.hiring_signal, company_summary: intel.company_summary, open_roles_count: intel.open_roles_count, salary_range: intel.salary_range, recent_news: news, interview_process: intel.interview_process || '', cached: false, personalized_analysis: analysis || null }
      });
    }

    // 13. CAREER ADVICE (DEFAULT FALLBACK)
    console.log('Intent: career_advice (default)');
    const webResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a career research assistant for a UF student.\n\n${profileContext}\n\nRequest: "${resolvedMessage}"\n\n${conversation_history ? 'Context:\n' + conversation_history : ''}\n\nProvide detailed, personalized career advice.`,
      add_context_from_internet: true,
    });

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are FASTIQ, a full-service AI career center for UF students.\n\n${profileContext}\n\nRESEARCH:\n${String(typeof webResult === 'string' ? webResult : JSON.stringify(webResult)).substring(0,4000)}\n\nRequest: "${resolvedMessage}"\n\nProvide personalized career advice. At the END, suggest 2-3 relevant FASTIQ actions like "Want me to find companies hiring for this?" or "Find UF alumni in this field?"`,
      response_json_schema: {
        type: "object",
        properties: {
          response: { type: "string" },
          suggested_actions: { type: "array", items: { type: "string" }, description: "2-3 follow-up action suggestions" }
        },
        required: ["response"]
      }
    });

    return Response.json({
      success: true, response: result.response || String(typeof webResult === 'string' ? webResult : JSON.stringify(webResult)).substring(0,2000),
      message_type: 'career_advice',
      payload: { suggested_actions: result.suggested_actions || [] }
    });

  } catch (error) {
    console.error('fastTrackProAgent error:', error.message);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});