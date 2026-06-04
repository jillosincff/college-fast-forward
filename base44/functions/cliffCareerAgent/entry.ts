import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const message = body.message;
    const conversationHistory = body.history || []; // optional prior turns

    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    // DIAGNOSTIC: Confirm every unique prompt is hitting the backend
    console.log('[CLIFF] Incoming user prompt:', message);
    console.log('[CLIFF] History turns received:', conversationHistory.length);

    const schoolAbbr = user.school_abbreviation || user.school_code?.toUpperCase() || 'UF';

    // ─── 1. COMPANY LOOKUP QUERIES ──────────────────────────────────────────
    // e.g. "Who do we have at Spotify or Disney?"
    const companyQueryPatterns = [
      /who do (?:we|you) have at\s+([\w\s,&]+)/i,
      /who (?:do we have|works?)\s+(?:at|@)\s+([\w\s,&]+)/i,
      /(?:any(?:one)?|do you have (?:anyone|contacts?))\s+at\s+([\w\s,&]+)/i,
      /(?:contacts?|people|connections?)\s+at\s+([\w\s,&]+)/i,
      /(?:alumni|parents?|gators?)\s+at\s+([\w\s,&]+)/i,
    ];

    for (const pattern of companyQueryPatterns) {
      const match = message.match(pattern);
      if (match) {
        const companiesRaw = match[1].trim();
        const companies = companiesRaw.split(/\s+(?:or|and)\s+/i).map(c => c.trim()).filter(Boolean);

        console.log('[CLIFF] Company lookup for:', companies.join(', '));

        // Fetch once, filter per company
        const [discovered, allUsers] = await Promise.all([
          base44.asServiceRole.entities.DiscoveredAlumni.filter({}),
          base44.asServiceRole.entities.User.filter({}),
        ]);

        const allResults = [];
        for (const company of companies) {
          const companyLower = company.toLowerCase();

          discovered
            .filter(a => (a.company || '').toLowerCase().includes(companyLower))
            .slice(0, 4)
            .forEach(a => allResults.push({
              name: a.name,
              title: a.role_title || 'Professional',
              company: a.company,
              linkedin: a.linkedin_url,
              type: 'alumni',
              degree: a.degree_info,
            }));

          allUsers
            .filter(u => (u.current_company || '').toLowerCase().includes(companyLower) && u.persona)
            .slice(0, 3)
            .forEach(u => allResults.push({
              name: u.full_name || u.email?.split('@')[0],
              title: u.current_role || 'Professional',
              company: u.current_company || company,
              linkedin: u.linkedin_url,
              type: u.persona,
            }));
        }

        if (allResults.length === 0) {
          return Response.json({
            success: true,
            response: `I didn't find any ${schoolAbbr} network members at **${companies.join(' or ')}** right now.\n\nTry asking by industry — e.g. "Any alumni in entertainment?" — or I can help draft a cold outreach.`,
            message_type: 'text',
          });
        }

        const formatted = allResults.map((r, i) => {
          const typeLabel = r.type === 'parent' ? '💼 Parent' : `🎓 ${schoolAbbr} Alum`;
          const degreeNote = r.degree ? ` (${r.degree})` : '';
          return `${i + 1}. **${r.name}** — ${r.title} at ${r.company} [${typeLabel}]${degreeNote}${r.linkedin ? `\n   🔗 [LinkedIn](${r.linkedin})` : ''}`;
        }).join('\n\n');

        return Response.json({
          success: true,
          response: `Found **${allResults.length} connection${allResults.length !== 1 ? 's' : ''}** at ${companies.join(' / ')}:\n\n${formatted}\n\nWant me to draft a personalized outreach to any of them?`,
          message_type: 'network_results',
        });
      }
    }

    // (Section 2 — field/persona lookups — now unified into Section 3 broad network intent below)

    // ─── 3. BROAD NETWORK / PEOPLE LOOKUP — catches any "find me a contact" intent ─
    // Covers: "UF parents in marketing", "alumni with finance background", "anyone in tech", etc.
    const networkIntentPatterns = [
      /(?:find|show|get|list|pull up|do you have|any(?:one)?)\s+.{0,40}(?:parents?|alumni|gators?|network|contacts?|connections?|people|members?)/i,
      /(?:parents?|alumni|gators?|connections?)\s+(?:with|who have|who work(?:ed)?|in|at|from|with a?|background)/i,
      /(?:marketing|finance|tech|engineering|consulting|banking|media|advertising|sales|healthcare|law|real estate|accounting)\s+(?:parents?|alumni|contacts?|background|experience|professionals?)/i,
      /who (?:in (?:the |our )?(?:network|database|app|cliff))/i,
      /(?:inside|in)\s+(?:the|our|your|cliff'?s?)\s+(?:network|database|app|system)/i,
    ];

    for (const pattern of networkIntentPatterns) {
      if (pattern.test(message)) {
        // Extract industry/field keyword from message
        // Try to extract a clean industry/field keyword — stop at noise words
        const fieldMatch = message.match(/\b(marketing|finance|tech|technology|engineering|consulting|banking|media|advertising|sales|healthcare|law|real estate|accounting|operations|hr|human resources|product|design|data|analytics|supply chain|logistics|retail|hospitality|education|nonprofit)\b/i);

        const field = fieldMatch ? fieldMatch[1].trim().toLowerCase() : null;
        const personaWord = message.toLowerCase();
        let personaFilter = 'all';
        if (personaWord.includes('parent')) personaFilter = 'parent';
        else if (personaWord.includes('alumni') || personaWord.includes('alum')) personaFilter = 'alumni';

        console.log(`[CLIFF] Broad network lookup — persona: ${personaFilter}, field: ${field}`);

        const [allUsers, discoveredAlumni] = await Promise.all([
          base44.asServiceRole.entities.User.filter({}),
          field ? base44.asServiceRole.entities.DiscoveredAlumni.filter({}) : Promise.resolve([]),
        ]);

        const userResults = allUsers.filter(u => {
          if (!u.persona) return false;
          if (personaFilter !== 'all' && u.persona !== personaFilter) return false;
          if (!field) return true; // no field filter — return all network members of persona
          const blob = [u.current_role, u.current_company, u.industry, u.bio, ...(u.expertise_tags || [])].join(' ').toLowerCase();
          return blob.includes(field);
        }).slice(0, 8);

        const alumniResults = field ? discoveredAlumni.filter(a => {
          if (personaFilter === 'parent') return false;
          const blob = [a.role_title, a.company, a.degree_info, a.description].join(' ').toLowerCase();
          return blob.includes(field);
        }).slice(0, 4) : [];

        const totalCount = userResults.length + alumniResults.length;

        if (totalCount === 0) {
          return Response.json({
            success: true,
            response: `I searched the CLiFF database and didn't find verified ${personaFilter !== 'all' ? personaFilter + 's' : 'network members'}${field ? ` in **${field}**` : ''} yet.\n\nTry a broader term (e.g. "marketing" instead of "brand strategy"), or ask me about a specific company: "Who do we have at Google?"`,
            message_type: 'text',
          });
        }

        const lines = [];
        let idx = 1;

        for (const u of userResults) {
          const typeLabel = u.persona === 'parent' ? '💼 Parent' : `🎓 ${schoolAbbr} Alum`;
          const title = u.current_role || 'Professional';
          const company = u.current_company ? ` at ${u.current_company}` : '';
          const linkedin = u.linkedin_url ? ` — 🔗 [LinkedIn](${u.linkedin_url})` : '';
          lines.push(`${idx++}. **${u.full_name || u.email?.split('@')[0]}** — ${title}${company} [${typeLabel}]${linkedin}`);
        }
        for (const a of alumniResults) {
          const title = a.role_title || 'Professional';
          const linkedin = a.linkedin_url ? ` — 🔗 [LinkedIn](${a.linkedin_url})` : '';
          lines.push(`${idx++}. **${a.name}** — ${title} at ${a.company} [🎓 ${schoolAbbr} Alum]${linkedin}`);
        }

        const fieldLabel = field ? ` in **${field}**` : '';
        const personaLabel = personaFilter !== 'all' ? personaFilter + 's' : 'network members';

        return Response.json({
          success: true,
          response: `Found **${totalCount} verified ${personaLabel}**${fieldLabel} in the CLiFF database:\n\n${lines.join('\n\n')}\n\nWant me to draft a personalized outreach message for any of them?`,
          message_type: 'network_results',
        });
      }
    }

    // ─── 3b. EXA LINKEDIN ALUMNI SEARCH ────────────────────────────────────
    // Triggered when user asks to "find alumni on LinkedIn" or broad open-web alumni discovery
    const exaAlumniPatterns = [
      /find (?:me |us )?(?:uf |university of florida |uf )?alumni (?:on linkedin|who work|in |at )/i,
      /(?:search|look up|look for|find) (?:uf |university of florida )?alumni (?:on linkedin|in |at |who )/i,
      /(?:uf |university of florida )?alumni (?:on linkedin|working at|in the|at |who work)/i,
      /(?:any|show me|pull up|get me) (?:uf |university of florida )?alumni (?:on linkedin|in |at |who )/i,
    ];

    const wantsExaSearch = exaAlumniPatterns.some(p => p.test(message));

    if (wantsExaSearch) {
      // Strip out "find me UF alumni on LinkedIn" boilerplate — keep the meaningful query part
      const queryClean = message
        .replace(/find (?:me |us )?(?:uf |university of florida )?alumni (?:on linkedin\s*)?(?:that |who )?/i, '')
        .replace(/(?:search|look up|look for) (?:uf |university of florida )?alumni (?:on linkedin\s*)?(?:that |who )?/i, '')
        .replace(/(?:any|show me|pull up|get me) (?:uf |university of florida )?alumni (?:on linkedin\s*)?(?:that |who )?/i, '')
        .replace(/on linkedin/i, '')
        .trim();

      console.log('[CLIFF] Exa alumni search query:', queryClean);

      try {
        const exaRes = await base44.asServiceRole.functions.invoke('exaService', {
          action: 'searchAlumni',
          params: {
            query: queryClean,
            universityName: user.school_name || user.school || 'University of Florida',
            maxResults: 6,
          },
        });

        const profiles = exaRes?.profiles || [];

        if (profiles.length === 0) {
          return Response.json({
            success: true,
            response: `I searched LinkedIn for **${schoolAbbr} alumni** matching "${queryClean}" but didn't find strong matches right now.\n\nTry rephrasing — e.g. "find UF alumni who work at tech startups in NYC" or "find UF alumni in product management".`,
            message_type: 'text',
          });
        }

        const lines = profiles.map((p, i) => {
          const headline = p.headline ? ` — ${p.headline}` : '';
          const summary = p.summary ? `\n   _${p.summary.slice(0, 120).trim()}..._` : '';
          const link = p.linkedin_url ? `\n   🔗 [LinkedIn](${p.linkedin_url})` : '';
          return `${i + 1}. **${p.full_name}**${headline}${summary}${link}`;
        }).join('\n\n');

        return Response.json({
          success: true,
          response: `Found **${profiles.length} ${schoolAbbr} alumni** matching "${queryClean}" on LinkedIn:\n\n${lines}\n\nWant me to draft a personalized outreach message for any of them?`,
          message_type: 'network_results',
        });

      } catch (exaErr) {
        console.error('[CLIFF] Exa alumni search failed:', exaErr.message);
        // Fall through to general LLM response
      }
    }

    // ─── 4. GENERAL CAREER Q&A — LLM WITH HARD GUARDRAILS ──────────────────
    const systemPrompt = `You are CLiFF, an elite career agent embedded inside the CLiFF platform for ${schoolAbbr} students. You are the DIRECT INTERFACE to the CLiFF proprietary network database.

HARD RULES — never break these:
1. NEVER tell users to log into external platforms (LinkedIn, Handshake, GatorLink, Gator CareerLink, etc.) to find contacts. CLiFF IS the tool.
2. NEVER tell users to "email the alumni association", "check your university portal", or do any manual research outside this app.
3. If the user asks for specific people, contacts, alumni, or parents — you MUST query the CLiFF database (the backend already handles this before reaching you, so redirect them to ask more specifically: "Try asking: 'Any alumni in marketing?' or 'Who do we have at Nike?'")
4. Be direct, specific, and actionable. Under 200 words unless user asks for detail.
5. No corporate buzzwords. No generic career center advice.

You help with: networking strategy, outreach scripts, interview prep, salary negotiation, resume tailoring, job search tactics — all powered by CLiFF's internal data and AI.`;

    // Sanitize history: enforce strict alternating user/assistant roles
    const sanitizedHistory = [];
    for (const turn of conversationHistory) {
      if (turn.role === 'user' || turn.role === 'assistant') {
        sanitizedHistory.push({ role: turn.role, content: String(turn.content || '') });
      }
    }

    // Build the final messages array: system + history + current user message
    const messages = [
      ...sanitizedHistory,
      { role: 'user', content: message }, // ← dynamic — never hardcoded
    ];

    // Build full prompt: inject system context + sanitized history + current message
    // Temperature is controlled via the InvokeLLM model parameter (claude_sonnet_4_6 is highest quality available)
    const historyText = sanitizedHistory.length > 0
      ? sanitizedHistory.map(t => `${t.role === 'user' ? 'Student' : 'CLiFF'}: ${t.content}`).join('\n')
      : '';

    const fullPrompt = `${systemPrompt}\n\n${historyText ? `Conversation so far:\n${historyText}\n\n` : ''}Student: ${message}\n\nCLiFF:`;

    console.log('[CLIFF] Sending to LLM. History turns:', sanitizedHistory.length, '| Current prompt:', message);

    const reply = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: fullPrompt,
      model: 'claude_sonnet_4_6', // high-quality, dynamic responses
    });

    console.log('[CLIFF] Response generated successfully.');

    return Response.json({
      success: true,
      response: reply,
      message_type: 'text',
    });

  } catch (error) {
    console.error('[CLIFF] Fatal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});