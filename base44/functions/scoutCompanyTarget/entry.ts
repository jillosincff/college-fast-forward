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

    // Use AI to identify the best real target person at this company
    const aiResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a career coach helping a student get a warm introduction at ${company} for a "${role}" role.

Your job: identify the SINGLE best real person to cold-reach at ${company} for this role.

Rules:
- Pick the most likely REAL hiring manager or team lead for this role (not a recruiter, not HR)
- For startups (<500 employees): target the founding team or a department head
- For large companies: target the engineering/product/design manager for this specific function
- The name must be a REAL, likely person — use common professional names that plausibly exist at this company based on its known team makeup
- DO NOT make up a name that sounds fake. Use professional first+last name combinations.

Return JSON with:
{
  "name": "First Last",
  "title": "Their likely job title",
  "strategy": "one of: Founder Direct, Hiring Manager, Department Lead",
  "reasoning": "2-3 sentences on why this is the best target and how to approach them",
  "suggestedApproach": "1-2 sentences on what angle to use in the outreach"
}`,
      response_json_schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          title: { type: 'string' },
          strategy: { type: 'string' },
          reasoning: { type: 'string' },
          suggestedApproach: { type: 'string' },
        },
      },
    });

    const name = aiResult.name || 'Hiring Manager';
    const title = aiResult.title || 'Team Lead';

    // Build a LinkedIn people-search URL using name + company so the link lands on the right person
    const linkedinSearchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(name)}&company=${encodeURIComponent(company)}`;

    return Response.json({
      success: true,
      company,
      recommendedTarget: {
        name,
        title,
        linkedinUrl: linkedinSearchUrl,
      },
      strategy: aiResult.strategy || 'Department Lead',
      reasoning: aiResult.reasoning || `Reaching out to a senior team member at ${company} bypasses ATS filters and gets your message in front of decision-makers.`,
      suggestedApproach: aiResult.suggestedApproach || 'Reference the company mission and connect your skills to their team goals.',
    });

  } catch (error) {
    console.error('ScoutCompanyTarget error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});