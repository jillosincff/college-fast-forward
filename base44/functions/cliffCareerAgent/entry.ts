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
      /any\s+(parents?|alumni|gators?|uf\s+parents?|uf\s+alumni)\s+(?:in|who work (?:in|at))\s+([\w\s]+)/i,
      /do you know any\s+(parents?|alumni|gators?)\s+(?:in|at)\s+([\w\s]+)/i,
      /who (?:in the network )?works? in\s+([\w\s]+)/i,
      /are there\s+(parents?|alumni|gators?)\s+(?:in|at)\s+([\w\s]+)/i,
      /(?:parents?|alumni|gators?)\s+(?:who work)?\s+(?:in|at)\s+([\w\s]+)/i,
      /(?:parents?|alumni|gators?)\s+in\s+([\w\s]+)/i,
      /find\s+(parents?|alumni|gators?)\s+(?:in|at)\s+([\w\s]+)/i,
      /search\s+for\s+(parents?|alumni|gators?)\s+(?:in|at)\s+([\w\s]+)/i,
      // Contact-specific queries
      /do you have (?:contact info|a number|an email) for (.+)/i,
      /how can i (?:reach|contact) (.+)/i,
      /(?:contact|reach|get in touch with) (.+)/i,
      /tell me about (.+)/i,
      /who is (.+)/i,
    ];

    for (const pattern of networkPatterns) {
      const match = message.match(pattern);
      if (match) {
        const personaWord = match[1]?.toLowerCase() || '';
        const field = match[2]?.trim() || match[1]?.trim() || '';
        
        if (!field) continue;
        
        // Check if this is a contact-specific query (by name)
        const contactPatterns = [
          /do you have (?:contact info|a number|an email) for (.+)/i,
          /how can i (?:reach|contact) (.+)/i,
          /(?:contact|reach|get in touch with) (.+)/i,
          /tell me about (.+)/i,
          /who is (.+)/i,
        ];
        
        let isContactQuery = false;
        let contactName = null;
        for (const cp of contactPatterns) {
          const cm = message.match(cp);
          if (cm) {
            isContactQuery = true;
            contactName = cm[1]?.trim();
            break;
          }
        }
        
        // If asking about a specific person by name
        if (isContactQuery && contactName) {
          console.log(`[CLIFF] Contact query detected: ${contactName}`);
          
          // Search for this person in the network
          const results = await base44.asServiceRole.entities.User.filter({});
          const nameLower = contactName.toLowerCase();
          
          const found = results.find(u => {
            const fullName = (u.full_name || '').toLowerCase();
            const emailPrefix = (u.email || '').split('@')[0].toLowerCase();
            return fullName.includes(nameLower) || emailPrefix.includes(nameLower);
          });
          
          if (found) {
            const fullName = found.full_name || found.email?.split('@')[0] || 'Network Member';
            const title = found.current_role || 'Professional';
            const company = found.current_company || 'Company';
            const linkedin = found.linkedin_url || '';
            const email = found.email || '';
            
            let response = `**${fullName}**\n`;
            response += `${title} at ${company}\n`;
            if (linkedin) response += `\n🔗 [LinkedIn Profile](${linkedin})`;
            if (email) response += `\n📧 Email: ${email}`;
            
            return Response.json({
              success: true,
              response: response,
              message_type: 'contact_info',
              payload: {
                contact: {
                  name: fullName,
                  title: title,
                  company: company,
                  linkedin_url: linkedin,
                  email: email
                },
                suggested_actions: ['Draft outreach message', 'Search for more contacts']
              }
            });
          } else {
            return Response.json({
              success: true,
              response: `I don't have **${contactName}** in my network database right now. But I can help you find other ${user.school_abbreviation || 'UF'} parents or alumni in similar fields. Want me to search?`,
              message_type: 'text',
              payload: { suggested_actions: ['Find similar contacts', 'Try a different search'] }
            });
          }
        }
        
        // Determine persona filter for field-based queries
        let personaFilter = 'all';
        if (personaWord && personaWord.includes('parent')) personaFilter = 'parent';
        else if (personaWord && personaWord.includes('alumni')) personaFilter = 'alumni';
        
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
        const formattedResults = filtered.map((p, idx) => {
          const fullName = p.full_name || p.email?.split('@')[0] || 'Network Member';
          const title = p.current_role || 'Professional';
          const company = p.current_company || 'Company';
          const linkedin = p.linkedin_url || '';
          
          return `${idx + 1}. **${fullName}**\n   ${title} at ${company}${linkedin ? `\n   🔗 [LinkedIn Profile](${linkedin})` : ''}`;
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