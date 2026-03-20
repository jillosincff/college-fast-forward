import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const goals = body.career_goals || user.career_goals || {};

    // Apply fallback defaults — never send all-null fields
    const role = goals.role || 'entry-level roles';
    const industriesArr = (goals.industries && goals.industries.length > 0)
      ? goals.industries
      : (user.target_industries && user.target_industries.length > 0)
        ? user.target_industries
        : ['general business'];
    const industriesStr = industriesArr.join(', ');
    const locationsArr = (goals.locations && goals.locations.length > 0)
      ? goals.locations
      : (user.location_preferences && user.location_preferences.length > 0)
        ? user.location_preferences
        : ['United States'];
    const locationsStr = locationsArr.join(', ');
    const existingTargets = (goals.target_companies || user.target_companies || []).join(', ');

    const sizePref = (goals.company_size_preference && goals.company_size_preference.length > 0)
      ? goals.company_size_preference
      : ['large', 'mid', 'startup'];
    const sizeLabels = {
      large: 'large enterprise companies (1000+ employees)',
      mid: 'mid-size companies (100-999 employees)',
      startup: 'startups (under 100 employees)'
    };
    const primarySize = sizeLabels[sizePref[0]] || 'a balanced mix of company sizes';
    const secondarySize = sizePref[1] ? ` and some ${sizeLabels[sizePref[1]]}` : '';

    console.log('getFreeTierCompanyRecs query:', JSON.stringify({ role, industriesStr, locationsStr, primarySize, existingTargets }));

    const prompt = `You are a career research assistant helping a college student find companies actively hiring right now.

Student profile:
- Target role: ${role}
- Industries of interest: ${industriesStr}
- Preferred locations: ${locationsStr}
- Company size preference: primarily ${primarySize}${secondarySize}
${existingTargets ? `- Already has these as targets (do NOT suggest these): ${existingTargets}` : ''}

Find 3 companies that are actively hiring ${role} positions in ${industriesStr} right now.
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
    console.log('getFreeTierCompanyRecs result count:', companies.length);
    return Response.json({ companies, generated_at: new Date().toISOString() });

  } catch (error) {
    console.error('getFreeTierCompanyRecs error:', error.message);
    return Response.json({ error: error.message, companies: [] }, { status: 500 });
  }
});