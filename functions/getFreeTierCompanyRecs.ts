import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

async function getExternalRecs(base44, role, industriesStr, locationsStr, primarySize, secondarySize, existingTargets) {
  const prompt = `You are a career research assistant helping a college student find companies actively hiring right now.

Student profile:
- Target role: ${role}
- Industries of interest: ${industriesStr}
- Preferred locations: ${locationsStr}
- Company size preference: primarily ${primarySize}${secondarySize}
${existingTargets ? `- Already has these as targets (do NOT suggest these): ${existingTargets}` : ''}

Find 5 companies that are actively hiring ${role} positions in ${industriesStr} right now.
Weight your suggestions toward ${primarySize}.
Include a mix of well-known and lesser-known companies when possible.
For each company, explain in one short sentence why it specifically fits this student's profile.

Return exactly 5 companies as a JSON array.`;

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

  return result?.companies || [];
}

async function getCFFNetworkMatches(base44, industriesArr, targetCompaniesArr, studentSchool) {
  const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);

  const industriesLower = industriesArr.map(i => i.toLowerCase());
  const companiesLower = targetCompaniesArr.map(c => c.toLowerCase());
  const schoolWord = (studentSchool || '').toLowerCase().split(' ')[0];

  // Only include users who have opted into directory visibility
  const eligible = allUsers.filter(u => {
    if (u.persona !== 'parent' && u.persona !== 'alumni') return false;
    if (!u.show_in_directory && !u.directory_visible && !u.is_directory_visible) return false;
    const uIndustry = (u.industry || u.expertise_areas || '').toLowerCase();
    const uCompany = (u.company || u.current_company || '').toLowerCase();
    const industryMatch = industriesLower.some(i => uIndustry.includes(i.split(',')[0].trim()));
    const companyMatch = companiesLower.some(c => c && uCompany.includes(c));
    return industryMatch || companyMatch;
  });

  // Group by company
  const companyMap = {};
  for (const u of eligible) {
    const company = (u.company || u.current_company || '').trim();
    if (!company) continue;
    if (!companyMap[company]) {
      companyMap[company] = { name: company, connections: [], alumni_count: 0, parent_count: 0 };
    }
    const uSchool = (u.school || u.university || '').toLowerCase();
    const isSchoolMatch = schoolWord && uSchool.includes(schoolWord);
    companyMap[company].connections.push({
      persona: u.persona,
      role: u.role_title || u.current_role || '',
      school_match: isSchoolMatch,
    });
    if (u.persona === 'alumni') companyMap[company].alumni_count++;
    else companyMap[company].parent_count++;
  }

  return Object.values(companyMap).map(c => {
    const hasAlumni = c.alumni_count > 0;
    const hasParent = c.parent_count > 0;
    const schoolMatch = c.connections.some(conn => conn.school_match);
    const connectionType = hasAlumni && hasParent ? 'both' : hasAlumni ? 'alumni' : 'parent';
    const sampleRoles = [...new Set(c.connections.map(conn => conn.role).filter(Boolean))].slice(0, 3);
    return {
      name: c.name,
      cff_connection_count: c.connections.length,
      connection_type: connectionType,
      school_match: schoolMatch,
      sample_roles: sampleRoles,
    };
  });
}

function mergeAndRank(external, internal, sizePref) {
  const internalMap = {};
  for (const c of internal) internalMap[c.name.toLowerCase()] = c;

  const seen = new Set();
  const scored = [];

  for (const c of external) {
    const key = c.name.toLowerCase();
    seen.add(key);
    const cffData = internalMap[key];
    let score = 1; // external only baseline
    if (cffData) {
      score += 3; // appears in both
    }
    if (c.hiring_signal === 'hot') score += 2;
    else if (c.hiring_signal === 'warm') score += 1;
    if (sizePref[0] && c.size === sizePref[0]) score += 1;
    if (cffData?.school_match) score += 0.5;

    // Build merged why_recommended
    let why = c.why_recommended || '';
    if (cffData && cffData.cff_connection_count > 0) {
      if (c.hiring_signal === 'hot' || c.hiring_signal === 'warm') {
        why = `Actively hiring + ${cffData.cff_connection_count} CFF connection${cffData.cff_connection_count > 1 ? 's' : ''} — your strongest opportunity`;
      } else {
        why = `${cffData.cff_connection_count} CFF connection${cffData.cff_connection_count > 1 ? 's' : ''} work here — warm path available`;
      }
    }

    scored.push({ ...c, score, cff_data: cffData || null, why_recommended: why });
  }

  // Add internal-only companies (not in external results)
  for (const c of internal) {
    const key = c.name.toLowerCase();
    if (seen.has(key)) continue;
    scored.push({
      name: c.name,
      industry: '',
      size: null,
      hiring_signal: 'warm',
      hiring_description: `${c.cff_connection_count} CFF member${c.cff_connection_count > 1 ? 's' : ''} work here.`,
      why_recommended: `${c.cff_connection_count} CFF connection${c.cff_connection_count > 1 ? 's' : ''} work here — warm path available`,
      careers_url: '',
      score: 2 + (c.school_match ? 0.5 : 0),
      cff_data: c,
    });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const goals = body.career_goals || user.career_goals || {};

    // Apply fallback defaults
    const role = goals.role || 'entry-level roles';
    const industriesArr = (goals.industries?.length > 0) ? goals.industries
      : (user.target_industries?.length > 0) ? user.target_industries : ['general business'];
    const locationsArr = (goals.locations?.length > 0) ? goals.locations
      : (user.location_preferences?.length > 0) ? user.location_preferences : ['United States'];
    const targetCompaniesArr = goals.target_companies || user.target_companies || [];
    const studentSchool = user.school || user.university || '';

    const sizePref = (goals.company_size_preference?.length > 0) ? goals.company_size_preference : ['large', 'mid', 'startup'];
    const sizeLabels = {
      large: 'large enterprise companies (1000+ employees)',
      mid: 'mid-size companies (100-999 employees)',
      startup: 'startups (under 100 employees)',
    };
    const primarySize = sizeLabels[sizePref[0]] || 'a balanced mix of company sizes';
    const secondarySize = sizePref[1] ? ` and some ${sizeLabels[sizePref[1]]}` : '';
    const existingTargets = targetCompaniesArr.join(', ');
    const industriesStr = industriesArr.join(', ');
    const locationsStr = locationsArr.join(', ');

    console.log('getFreeTierCompanyRecs query:', JSON.stringify({ role, industriesStr, locationsStr, primarySize }));

    // Run both queries in parallel
    const makeExternalCall = () => getExternalRecs(base44, role, industriesStr, locationsStr, primarySize, secondarySize, existingTargets);
    const makeInternalCall = () => getCFFNetworkMatches(base44, industriesArr, targetCompaniesArr, studentSchool);

    let external = [], internal = [];
    try {
      [external, internal] = await Promise.all([
        Promise.race([makeExternalCall(), new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 20000))]),
        makeInternalCall(),
      ]);
    } catch (firstErr) {
      console.warn('First attempt failed, retrying external query:', firstErr.message);
      await new Promise(r => setTimeout(r, 3000));
      try {
        [external, internal] = await Promise.all([
          Promise.race([makeExternalCall(), new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 20000))]),
          makeInternalCall(),
        ]);
      } catch (secondErr) {
        console.error('Both attempts failed:', secondErr.message);
        // Try to at least return internal results
        try { internal = await makeInternalCall(); } catch (_) {}
      }
    }

    const companies = mergeAndRank(external, internal, sizePref);
    console.log('getFreeTierCompanyRecs merged result count:', companies.length);

    return Response.json({
      companies,
      generated_at: new Date().toISOString(),
      internal_generated_at: new Date().toISOString(),
    });

  } catch (error) {
    console.error('getFreeTierCompanyRecs error:', error.message);
    return Response.json({ error: error.message, companies: [] }, { status: 500 });
  }
});