import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { company, role, jobDescription } = await req.json();

    if (!company) {
      return Response.json({ error: 'Company is required' }, { status: 400 });
    }

    // Step 1: Use Exa to find REAL people at this company with relevant titles
    const exaResponse = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('EXA_API_KEY'),
      },
      body: JSON.stringify({
        query: `${role} ${company} manager director vp head site:linkedin.com/in`,
        type: 'auto',
        numResults: 5,
        includeDomains: ['linkedin.com'],
      }),
    });
    
    const exaData = await exaResponse.json();
    
    let targetName = 'Hiring Manager';
    let targetTitle = 'Team Lead';
    let linkedinUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(role + ' manager')}&company=${encodeURIComponent(company)}`;
    
    if (exaData.results && exaData.results.length > 0) {
      // Extract the best match
      const bestMatch = exaData.results[0];
      
      // Parse name from LinkedIn title format: "Name - Title | Company"
      const parts = (bestMatch.title || '').split(/[|\-·]/).map(s => s.trim()).filter(Boolean);
      targetName = parts[0]?.replace(/\s+Bio$/i, '').trim() || 'Hiring Manager';
      
      // Get title from highlights or second part
      const highlights = bestMatch.highlights || [];
      if (highlights.length > 0) {
        const titleMatch = highlights[0].match(/([A-Za-z\s]+(?:Manager|Director|VP|Lead|Head|Chief|President|Engineer|Developer|Designer))[,\s]/i);
        targetTitle = titleMatch ? titleMatch[1].trim() : (parts[1] || 'Team Lead');
      } else {
        targetTitle = parts[1] || 'Team Lead';
      }
      
      linkedinUrl = bestMatch.url || linkedinUrl;
      
      console.log(`[scoutCompanyTarget] Found real person: ${targetName} (${targetTitle}) at ${company}`);
    } else {
      console.log(`[scoutCompanyTarget] No Exa results, using fallback for ${company}`);
    }

    // Step 2: Use AI to generate strategy for the real person found
    const aiResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a career coach helping a student get a warm introduction at ${company} for a "${role}" role.

You found a real person: ${targetName} (${targetTitle})

Your job: generate outreach strategy for this person.

Return JSON with:
{
  "strategy": "one of: Founder Direct, Hiring Manager, Department Lead",
  "reasoning": "2-3 sentences on why this is the best target and how to approach them",
  "suggestedApproach": "1-2 sentences on what angle to use in the outreach"
}`,
      response_json_schema: {
        type: 'object',
        properties: {
          strategy: { type: 'string' },
          reasoning: { type: 'string' },
          suggestedApproach: { type: 'string' },
        },
      },
    });

    return Response.json({
      success: true,
      company,
      recommendedTarget: {
        name: targetName,
        title: targetTitle,
        linkedinUrl,
      },
      strategy: aiResult.strategy || 'Department Lead',
      reasoning: aiResult.reasoning || `Reaching out to ${targetName} bypasses ATS filters and gets your message in front of decision-makers.`,
      suggestedApproach: aiResult.suggestedApproach || 'Reference the company mission and connect your skills to their team goals.',
    });

  } catch (error) {
    console.error('ScoutCompanyTarget error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});