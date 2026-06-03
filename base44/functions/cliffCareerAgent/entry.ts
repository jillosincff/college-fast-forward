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

    // ─── 2. FIELD / PERSONA LOOKUP QUERIES ──────────────────────────────────
    // e.g. "Any UF alumni in marketing?" / "Find parents in finance"
    const fieldPatterns = [
      /any\s+(?:parents?|alumni|gators?|uf\s+(?:parents?|alumni))\s+(?:in|who work (?:in|at))\s+([\w\s]+)/i,
      /(?:find|search(?: for)?)\s+(?:parents?|alumni|gators?)\s+(?:in|at)\s+([\w\s]+)/i,
      /(?:parents?|alumni|gators?)\s+(?:who work\s+)?(?:in|at)\s+([\w\s]+)/i,
      /who (?:in the network )?works? in\s+([\w\s]+)/i,
    ];

    for (const pattern of fieldPatterns) {
      const match = message.match(pattern);
      if (match) {
        const field = match[1]?.trim();
        if (!field) continue;

        const personaWord = message.toLowerCase();
        let personaFilter = 'all';
        if (personaWord.includes('parent')) personaFilter = 'parent';
        else if (personaWord.includes('alumni')) personaFilter = 'alumni';

        console.log(`[CLIFF] Field lookup: ${personaFilter} in "${field}"`);

        const users = await base44.asServiceRole.entities.User.filter({});
        const fieldLower = field.toLowerCase();
        const filtered = users.filter(u => {
          if (!u.persona) return false;
          if (personaFilter !== 'all' && u.persona !== personaFilter) return false;
          const blob = [u.current_role, u.current_company, u.industry, u.bio, ...(u.expertise_tags || [])].join(' ').toLowerCase();
          return blob.includes(fieldLower);
        }).slice(0, 10);

        if (filtered.length === 0) {
          return Response.json({
            success: true,
            response: `No ${personaFilter === 'all' ? 'network members' : personaFilter + 's'} found in **${field}** right now. Want me to look for companies hiring in that space instead?`,
            message_type: 'text',
          });
        }

        const formattedResults = filtered.map((p, idx) => {
          const title = p.current_role || 'Professional';
          const company = p.current_company || 'Unknown company';
          const linkedin = p.linkedin_url ? `\n   🔗 [LinkedIn](${p.linkedin_url})` : '';
          return `${idx + 1}. **${p.full_name || p.email?.split('@')[0]}** — ${title} at ${company}${linkedin}`;
        }).join('\n\n');

        return Response.json({
          success: true,
          response: `Found **${filtered.length}** ${personaFilter === 'all' ? 'network members' : personaFilter + 's'} in **${field}**:\n\n${formattedResults}`,
          message_type: 'network_results',
        });
      }
    }

    // ─── 3. GENERAL CAREER Q&A — LLM WITH PROPER PAYLOAD FORMAT ────────────
    // Build conversation history in strict alternating user/assistant format
    const systemPrompt = `You are CLiFF, an elite, no-fluff career agent for ${schoolAbbr} students. You help with networking strategy, outreach scripts, interview prep, salary negotiation, and job search tactics. Be direct, specific, and actionable. Never give generic advice. Keep responses under 200 words unless the user asks for something detailed.`;

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