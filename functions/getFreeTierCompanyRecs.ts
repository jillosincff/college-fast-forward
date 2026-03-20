import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const goals = body.career_goals || user.career_goals || {};

  const role = goals.role || 'entry-level roles';
  const industries = (goals.industries || []).join(', ') || 'general industries';
  const locations = (goals.locations || []).join(', ') || 'remote-friendly locations';
  const existingTargets = (goals.target_companies || user.target_companies || []).join(', ');

  // Derive size preference label
  const sizePref = goals.company_size_preference || ['large', 'mid', 'startup'];
  const sizeLabels = { large: 'large enterprise companies (1000+ employees)', mid: 'mid-size companies (100-999 employees)', startup: 'startups (under 100 employees)' };
  const primarySize = sizeLabels[sizePref[0]] || 'a balanced mix of company sizes';
  const secondarySize = sizePref[1] ? ` and some ${sizeLabels[sizePref[1]]}` : '';

  const prompt = `You are a career research assistant helping a college student find companies actively hiring right now.

Student profile:
- Target role: ${role}
- Industries of interest: ${industries}
- Preferred locations: ${locations}
- Company size preference: primarily ${primarySize}${secondarySize}
${existingTargets ? `- Already has these as targets (do NOT suggest these): ${existingTargets}` : ''}

Find 3 companies that are actively hiring ${role} positions in ${industries} right now.
Weight your suggestions toward ${primarySize}.
Include a mix of well-known and lesser-known companies when possible.
For each company, explain in one short sentence why it specifically fits this student's profile.

Return exactly 3 companies as a JSON array.`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    add_context_from_internet: true,
    model: 'gemini_3_flash',
    response_json_schema: {
      type: 'object',
      properties: {
        companies: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              industry: { type: 'string' },
              size: { type: 'string', enum: ['startup', 'mid', 'large'] },
              hiring_signal: { type: 'string', enum: ['hot', 'warm', 'cool'] },
              hiring_description: { type: 'string' },
              why_recommended: { type: 'string' },
              careers_url: { type: 'string' },
            },
          },
        },
      },
    },
  });

  const companies = result?.companies || [];
  return Response.json({ companies, generated_at: new Date().toISOString() });
});