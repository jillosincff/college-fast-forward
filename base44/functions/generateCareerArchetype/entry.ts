import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ARCHETYPE_MAPPING = {
  analyzing_independent_mastery: {
    archetype: 'The Analyst',
    description: 'You excel at deep technical work, breaking down complex systems, and becoming a subject matter expert. Think data scientist, quantitative analyst, or research scientist.',
    top_industries: ['Technology & Software', 'Finance & FinTech', 'Research & Academia'],
    ideal_roles: ['Data Scientist', 'Quantitative Analyst', 'Research Scientist', 'Business Intelligence Analyst'],
    strengths: ['Critical thinking', 'Pattern recognition', 'Independent problem-solving', 'Technical mastery'],
    blind_spots: ['May avoid leadership roles', 'Can over-analyze decisions', 'Prefers working alone'],
  },
  analyzing_structured_wealth: {
    archetype: 'The Strategist',
    description: 'You combine analytical rigor with systematic execution to drive business outcomes. Natural fit for consulting, operations, or strategic finance.',
    top_industries: ['Management Consulting', 'Investment Banking', 'Corporate Strategy'],
    ideal_roles: ['Management Consultant', 'Strategy Analyst', 'Operations Manager', 'Financial Analyst'],
    strengths: ['Systems thinking', 'Data-driven decisions', 'Process optimization', 'Strategic planning'],
    blind_spots: ['May prioritize logic over relationships', 'Can be overly critical', 'Risk-averse'],
  },
  creating_flexible_impact: {
    archetype: 'The Innovator',
    description: 'You thrive in dynamic environments where you can build new products, experiment with ideas, and make a tangible impact through creation.',
    top_industries: ['Startups & Venture Capital', 'Product & Design', 'Media & Entertainment'],
    ideal_roles: ['Product Manager', 'UX Designer', 'Content Creator', 'Entrepreneur'],
    strengths: ['Creative problem-solving', 'Adaptability', 'Vision thinking', 'Rapid prototyping'],
    blind_spots: ['May struggle with routine tasks', 'Can start but not finish', 'Impatient with bureaucracy'],
  },
  creating_collaborative_balance: {
    archetype: 'The Collaborator',
    description: 'You bring teams together to create something greater than the sum of its parts. Excel in roles that blend creativity with people leadership.',
    top_industries: ['Marketing & Advertising', 'Human Resources', 'Education Technology'],
    ideal_roles: ['Marketing Manager', 'HR Business Partner', 'Team Lead', 'Program Manager'],
    strengths: ['Team building', 'Communication', 'Creative facilitation', 'Work-life harmony'],
    blind_spots: ['May avoid difficult conversations', 'Can prioritize harmony over results', 'Dislikes conflict'],
  },
  helping_collaborative_impact: {
    archetype: 'The Advocate',
    description: 'You are driven by making a difference in peoples lives through direct support, advocacy, and community building.',
    top_industries: ['Healthcare & Biotech', 'Non-Profit & Social Impact', 'Education'],
    ideal_roles: ['Patient Advocate', 'Community Manager', 'Social Worker', 'Healthcare Administrator'],
    strengths: ['Empathy', 'Active listening', 'Relationship building', 'Mission-driven'],
    blind_spots: ['May burn out from over-giving', 'Can take things personally', 'Avoids self-promotion'],
  },
  leading_structured_wealth: {
    archetype: 'The Executive',
    description: 'You are built for leadership, driving teams toward ambitious goals with clear structure and accountability. Natural CEO material.',
    top_industries: ['Corporate Leadership', 'Private Equity', 'Real Estate'],
    ideal_roles: ['General Manager', 'VP of Operations', 'Private Equity Associate', 'Real Estate Developer'],
    strengths: ['Decisive leadership', 'Strategic vision', 'Team motivation', 'Results orientation'],
    blind_spots: ['May be overly demanding', 'Can micromanage', 'Impatient with slower performers'],
  },
  leading_flexible_wealth: {
    archetype: 'The Entrepreneur',
    description: 'You thrive in uncertainty, building ventures from the ground up and leading through vision and adaptability.',
    top_industries: ['Entrepreneurship & Startups', 'Sales & Business Development', 'Consulting'],
    ideal_roles: ['Founder', 'Business Development Manager', 'Sales Director', 'Growth Hacker'],
    strengths: ['Risk tolerance', 'Persuasion', 'Opportunity recognition', 'Resilience'],
    blind_spots: ['May chase too many ideas', 'Can neglect details', 'Impatient with processes'],
  },
  independent_mastery_balance: {
    archetype: 'The Craftsman',
    description: 'You value deep expertise and autonomy above all. Excel in specialized roles where mastery is rewarded and bureaucracy is minimal.',
    top_industries: ['Software Engineering', 'Creative Arts', 'Skilled Trades'],
    ideal_roles: ['Software Engineer', 'Graphic Designer', 'Technical Writer', 'Specialized Consultant'],
    strengths: ['Deep focus', 'Quality orientation', 'Self-management', 'Continuous learning'],
    blind_spots: ['May resist feedback', 'Can isolate from team', 'Avoids visibility'],
  },
};

// Helper to combine answers into a key
const getArchetypeKey = (answers) => {
  const { energy_source, work_style, success_metric } = answers;
  return `${energy_source}_${work_style}_${success_metric}`;
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { answers } = await req.json();

    if (!answers || typeof answers !== 'object') {
      return Response.json({ error: 'Invalid answers' }, { status: 400 });
    }

    // Get archetype from mapping
    const key = getArchetypeKey(answers);
    let archetype = ARCHETYPE_MAPPING[key];

    // If no exact match, use LLM to generate custom archetype
    if (!archetype) {
      const llmResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on these career assessment answers, generate a personalized career archetype:
        - Energy Source: ${answers.energy_source}
        - Work Style: ${answers.work_style}
        - Success Metric: ${answers.success_metric}

        Return a JSON object with:
        - archetype: A compelling 2-3 word title (e.g. "The Growth Strategist", "The Creative Technologist")
        - description: 2-3 sentence description of who they are and what they excel at
        - top_industries: Array of 3 industry names
        - ideal_roles: Array of 4 specific job titles
        - strengths: Array of 4 strength descriptions
        - blind_spots: Array of 3 potential weaknesses to watch`,
        response_json_schema: {
          type: 'object',
          properties: {
            archetype: { type: 'string' },
            description: { type: 'string' },
            top_industries: { type: 'array', items: { type: 'string' } },
            ideal_roles: { type: 'array', items: { type: 'string' } },
            strengths: { type: 'array', items: { type: 'string' } },
            blind_spots: { type: 'array', items: { type: 'string' } }
          }
        }
      });
      archetype = llmResult;
    }

    // Save to user profile
    await base44.auth.updateMe({
      career_archetype: archetype.archetype,
      career_archetype_data: archetype,
    });

    return Response.json({
      success: true,
      archetype: archetype.archetype,
      description: archetype.description,
      top_industries: archetype.top_industries,
      ideal_roles: archetype.ideal_roles,
      strengths: archetype.strengths,
      blind_spots: archetype.blind_spots,
    });

  } catch (error) {
    console.error('Career archetype generation failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});