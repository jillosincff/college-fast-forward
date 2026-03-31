import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { responses, careerGoals, major, name } = await req.json();

    const responseSummary = responses.map((r, i) =>
      `Q${i + 1}: "${r.question}" → Score: ${r.score}/5 (${r.score <= 2 ? 'Disagree' : r.score === 3 ? 'Neutral' : 'Agree'})`
    ).join('\n');

    const prompt = `You are an expert career psychologist and coach. Based on this student's assessment responses, generate their unique Career Archetype.

STUDENT PROFILE:
- Name: ${name || 'Student'}
- Major: ${major || 'Undeclared'}
- Target Roles: ${careerGoals?.target_roles?.join(', ') || 'Not specified'}
- Target Industries: ${careerGoals?.target_industries?.join(', ') || 'Not specified'}
- Graduating: ${careerGoals?.graduation_year || 'Not specified'}

ASSESSMENT RESPONSES (1=Strongly Disagree, 5=Strongly Agree):
${responseSummary}

Based on these responses, analyze across 6 dimensions:
1. Thinking Style: Analytical/Systematic vs. Intuitive/Creative
2. Work Style: Independent/Autonomous vs. Collaborative/Team-oriented  
3. Motivation: Achievement/Results vs. Impact/Mission vs. Stability/Security
4. Leadership: Directive/Decisive vs. Supportive/Facilitative
5. Risk Appetite: Builder/Creator/Risk-taker vs. Optimizer/Executor/Risk-averse
6. Orientation: People-focused vs. Ideas/Concepts-focused vs. Systems/Process-focused

Generate a UNIQUE custom archetype name (not from PrinciplesYou — create something original and memorable like "The Strategic Connector" or "The Empathetic Builder" or "The Analytical Visionary").

Respond ONLY with valid JSON (no markdown, no preamble):
{
  "archetype_name": "<unique memorable name>",
  "archetype_tagline": "<one sentence that captures their essence>",
  "archetype_emoji": "<single emoji>",
  "summary": "<3-4 sentences describing who they are, how they think, and what drives them>",
  "dimensions": {
    "thinking": { "label": "<e.g. Analytical Thinker>", "score": <1-10>, "description": "<2 sentences>" },
    "work_style": { "label": "<e.g. Collaborative Leader>", "score": <1-10>, "description": "<2 sentences>" },
    "motivation": { "label": "<e.g. Impact-Driven>", "score": <1-10>, "description": "<2 sentences>" },
    "leadership": { "label": "<e.g. Facilitative Leader>", "score": <1-10>, "description": "<2 sentences>" },
    "risk": { "label": "<e.g. Calculated Risk-Taker>", "score": <1-10>, "description": "<2 sentences>" },
    "orientation": { "label": "<e.g. People-First>", "score": <1-10>, "description": "<2 sentences>" }
  },
  "superpowers": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "watch_out_for": ["<growth area 1>", "<growth area 2>"],
  "ideal_roles": ["<role 1>", "<role 2>", "<role 3>", "<role 4>", "<role 5>"],
  "ideal_environments": ["<environment 1>", "<environment 2>", "<environment 3>"],
  "career_path_insight": "<2-3 sentences connecting their archetype to their specific target roles/industries>",
  "famous_archetype": "<a well-known person who shares this archetype and why>",
  "advice": "<3-4 sentences of honest, specific career advice for this exact person>"
}`;

    const archetype = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: 'claude_sonnet_4_6',
      response_json_schema: {
        type: 'object',
        properties: {
          archetype_name: { type: 'string' },
          archetype_tagline: { type: 'string' },
          archetype_emoji: { type: 'string' },
          summary: { type: 'string' },
          dimensions: { type: 'object' },
          superpowers: { type: 'array', items: { type: 'string' } },
          watch_out_for: { type: 'array', items: { type: 'string' } },
          ideal_roles: { type: 'array', items: { type: 'string' } },
          ideal_environments: { type: 'array', items: { type: 'string' } },
          career_path_insight: { type: 'string' },
          famous_archetype: { type: 'string' },
          advice: { type: 'string' },
        },
        required: ['archetype_name', 'archetype_tagline', 'summary', 'dimensions'],
      },
    });

    return Response.json({ success: true, archetype });
  } catch (error) {
    console.error('generateCareerArchetype error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});