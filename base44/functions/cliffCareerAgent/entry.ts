import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await req.json();
    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    const messageLower = message.toLowerCase();
    
    // CRITICAL: Detect network lookup queries and call searchNetworkByBackground IMMEDIATELY
    const networkPatterns = [
      /any\s+(parents?|alumni|gators?)\s+(?:in|who work (?:in|at))\s+([\w\s]+)/i,
      /do you know any\s+(parents?|alumni|gators?)\s+(?:in|at)\s+([\w\s]+)/i,
      /who (?:in the network )?works? in\s+([\w\s]+)/i,
      /are there\s+(parents?|alumni|gators?)\s+(?:in|at)\s+([\w\s]+)/i,
      /(?:parents?|alumni|gators?)\s+(?:who work)?\s+(?:in|at)\s+([\w\s]+)/i,
      /(?:parents?|alumni|gators?)\s+in\s+([\w\s]+)/i,
    ];

    for (const pattern of networkPatterns) {
      const match = message.match(pattern);
      if (match) {
        const personaWord = match[1]?.toLowerCase() || '';
        const field = match[2]?.trim() || '';
        
        if (!field) continue;
        
        // Determine persona filter
        let personaFilter = 'all';
        if (personaWord.includes('parent')) personaFilter = 'parent';
        else if (personaWord.includes('alumni')) personaFilter = 'alumni';
        
        console.log(`[CLIFF] Network query detected: ${personaFilter} in ${field}`);
        
        // Call searchNetworkByBackground directly
        const results = await base44.asServiceRole.entities.User.filter({});
        
        // Filter and score results
        const fieldLower = field.toLowerCase();
        const filtered = results.filter(u => {
          if (!u.persona) return false;
          if (personaFilter !== 'all' && u.persona !== personaFilter) return false;
          
          // Check if user's profile matches the field
          const searchText = [
            u.current_role || '',
            u.current_company || '',
            u.industry || '',
            u.bio || '',
            u.expertise_tags || [],
          ].join(' ').toLowerCase();
          
          return searchText.includes(fieldLower);
        }).slice(0, 10);
        
        if (filtered.length === 0) {
          return Response.json({
            success: true,
            response: `I didn't find any ${personaFilter === 'all' ? 'network members' : personaFilter + 's'} in **${field}** in the network right now. Want me to search for companies hiring in that space instead?`,
            message_type: 'text',
            payload: { suggested_actions: ['Find companies hiring in ' + field, 'Try a different search'] }
          });
        }
        
        // Format results
        const formattedResults = filtered.map(p => {
          const fullName = p.full_name || p.email?.split('@')[0] || 'Network Member';
          const title = p.current_role || 'Professional';
          const company = p.current_company || 'Company';
          const linkedin = p.linkedin_url || '';
          
          return `**${fullName}** — ${title} at ${company}${linkedin ? `\n🔗 ${linkedin}` : ''}`;
        }).join('\n\n');
        
        return Response.json({
          success: true,
          response: `I found **${filtered.length} ${personaFilter === 'all' ? 'network members' : personaFilter + 's'}** in **${field}**:\n\n${formattedResults}`,
          message_type: 'network_results',
          payload: { 
            results: filtered.map(p => ({
              name: p.full_name || p.email?.split('@')[0],
              title: p.current_role,
              company: p.current_company,
              linkedin_url: p.linkedin_url,
              persona: p.persona
            })),
            suggested_actions: [`Draft outreach message to one of them`, 'Search for more people']
          }
        });
      }
    }
    
    // If no network query detected, provide general guidance
    return Response.json({
      success: true,
      response: "I'm CLIFF, your career scout! I can help you:\n\n→ **Find alumni and parents** in specific fields or companies\n→ **Discover job opportunities** at target companies\n→ **Draft outreach messages** to network contacts\n→ **Get career advice** tailored to your goals\n\nTry asking: \"Any UF parents in marketing?\" or \"Find alumni at Google\"",
      message_type: 'text',
      payload: { suggested_actions: ['Any UF parents in marketing?', 'Find alumni at Google', 'Help me draft an outreach message'] }
    });
    
  } catch (error) {
    console.error('[CLIFF] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});