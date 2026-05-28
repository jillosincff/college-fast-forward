import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { career_goals, major, school_name, target_roles, target_industries } = user;
    
    const prompt = `You are a LinkedIn profile optimization expert for college students. Generate an ATS-optimized, recruiter-magnetic LinkedIn profile for a student.

Student Profile:
- School: ${school_name || 'University'}
- Major: ${major || 'Undeclared'}
- Target Roles: ${(target_roles || []).join(', ') || 'Entry-level positions'}
- Target Industries: ${(target_industries || []).join(', ') || 'Open to opportunities'}
- Career Goals: ${JSON.stringify(career_goals || {})}

Generate THREE sections:

1. HEADLINE (120 characters max): Must include target role, school affiliation, key skills, and value proposition. Use pipe separators. Make it punchy and keyword-rich.

2. ABOUT/SUMMARY (3-4 short paragraphs): 
   - Para 1: Hook - who they are + passion
   - Para 2: Skills + what they're studying
   - Para 3: What they're seeking + call to action
   - Use first person, conversational but professional tone
   - Include relevant keywords for ATS

3. TOP 5 SKILLS: List exactly 5 hard/technical skills relevant to their target role that should be added to LinkedIn Skills section.

Format response as JSON:
{
  "headline": "string",
  "about": "string",
  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"]
}`;

    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          headline: { type: 'string' },
          about: { type: 'string' },
          skills: { type: 'array', items: { type: 'string' } },
        },
        required: ['headline', 'about', 'skills'],
      },
      model: 'claude_sonnet_4_6',
    });

    const optimization = response;

    // Save to user entity
    await base44.auth.updateMe({
      linkedin_optimization: optimization,
      linkedin_optimization_generated_at: new Date().toISOString(),
    });

    return Response.json({ optimization });
  } catch (error) {
    console.error('generateLinkedInOptimization error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});