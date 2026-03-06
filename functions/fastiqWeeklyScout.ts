import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Load all active FastTrackProProfiles with assessment complete
    const allProfiles = await base44.asServiceRole.entities.FastTrackProProfile.filter(
      { assessment_complete: true },
      '-updated_date',
      100
    );

    console.log(`Found ${allProfiles.length} active profiles to scout`);

    let totalNewOpps = 0;
    const results = [];

    for (const profile of allProfiles) {
      try {
        const { user_email, target_industry, target_companies, location_preference, current_stage } = profile;

        // Skip users with no target companies — nothing to scout
        if (!target_companies || target_companies.length === 0) {
          console.log(`Skipping ${user_email} — no target companies set (industry-only is not enough for scouting)`);
          continue;
        }

        if (!target_industry && target_companies.length === 0) {
          console.log(`Skipping ${user_email} — no industry or companies set`);
          continue;
        }

        const companiesList = (target_companies || []).join(', ');
        const location = location_preference || 'any location in the US';
        const industry = target_industry || 'any industry';

        // Search for new opportunities via web-connected LLM — ENTRY-LEVEL/INTERN ONLY
        const searchResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Find new entry-level and internship job postings posted in the last 48 hours for ${industry} roles. Location preference: ${location}.

CRITICAL FILTER: ONLY include positions suitable for a college student or recent graduate:
- Entry-level roles (0-2 years experience required)
- Internship programs
- New grad programs
- Associate/junior level positions

Do NOT include: senior roles, manager roles, director roles, VP roles, or any position requiring 3+ years of experience. These are irrelevant to this student.

Student is at the "${current_stage || 'exploring'}" stage. ${companiesList ? `Also check for new postings at these specific companies: ${companiesList}.` : ''} Return up to 8 of the most relevant ENTRY-LEVEL/INTERN opportunities only. For each, provide: company name, role title, posting date (ISO format or approximate), location, a direct application link if available, and a brief 1-sentence reason why this is relevant to a ${industry} student.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              opportunities: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    company_name: { type: "string" },
                    role_title: { type: "string" },
                    posting_date: { type: "string", description: "ISO date or approximate like 'yesterday'" },
                    location: { type: "string" },
                    source_url: { type: "string", description: "Direct link to posting or empty string" },
                    match_reason: { type: "string", description: "1-sentence reason why this fits the student" }
                  },
                  required: ["company_name", "role_title", "match_reason"]
                }
              }
            },
            required: ["opportunities"]
          }
        });

        const opportunities = searchResult?.opportunities || [];
        console.log(`Found ${opportunities.length} opportunities for ${user_email}`);

        // Fetch existing scouted opportunities to deduplicate
        const existing = await base44.asServiceRole.entities.ScoutedOpportunity.filter(
          { user_email },
          '-scouted_date',
          200
        );
        const existingKeys = new Set(
          (existing || []).map(e => `${e.company_name?.toLowerCase()}|${e.role_title?.toLowerCase()}`)
        );

        // Check alumni availability from cache
        const alumniCache = await base44.asServiceRole.entities.DiscoveredAlumni.filter({}, '-created_date', 500);
        const alumniByCompany = {};
        for (const a of alumniCache) {
          const key = a.company?.toLowerCase();
          if (key) alumniByCompany[key] = (alumniByCompany[key] || 0) + 1;
        }

        let newCount = 0;
        const now = new Date().toISOString();

        for (const opp of opportunities) {
          const key = `${opp.company_name?.toLowerCase()}|${opp.role_title?.toLowerCase()}`;
          if (existingKeys.has(key)) {
            console.log(`Skipping duplicate: ${opp.company_name} - ${opp.role_title}`);
            continue;
          }

          const companyKey = opp.company_name?.toLowerCase();
          const alumniCount = alumniByCompany[companyKey] || 0;

          await base44.asServiceRole.entities.ScoutedOpportunity.create({
            user_email,
            company_name: opp.company_name,
            role_title: opp.role_title,
            location: opp.location || '',
            posting_date: opp.posting_date || now,
            source_url: opp.source_url || '',
            match_reason: opp.match_reason || '',
            status: 'new',
            alumni_available: alumniCount > 0,
            alumni_count: alumniCount,
            scouted_date: now,
            is_new: true,
          });

          newCount++;
          existingKeys.add(key);
        }

        // Update the profile's alert count and scout timestamp
        if (newCount > 0) {
          const currentAlerts = profile.new_alerts_count || 0;
          const isTargetCompanyOpp = opportunities.filter(o =>
            (target_companies || []).some(tc => 
              o.company_name?.toLowerCase().includes(tc.toLowerCase())
            )
          ).length;

          await base44.asServiceRole.entities.FastTrackProProfile.update(profile.id, {
            new_alerts_count: currentAlerts + newCount,
            last_scout_run: now,
            weekly_scout_summary: JSON.stringify({
              new_opps: newCount,
              at_target_companies: isTargetCompanyOpp,
              alumni_identified: Object.values(alumniByCompany).reduce((s, v) => s + v, 0),
              run_date: now,
            }),
          });
        } else {
          await base44.asServiceRole.entities.FastTrackProProfile.update(profile.id, {
            last_scout_run: now,
          });
        }

        totalNewOpps += newCount;
        results.push({ user_email, new_opportunities: newCount });

      } catch (profileError) {
        console.error(`Error processing ${profile.user_email}:`, profileError.message);
        results.push({ user_email: profile.user_email, error: profileError.message });
      }
    }

    console.log(`Scout complete. ${totalNewOpps} total new opportunities across ${allProfiles.length} profiles.`);

    return Response.json({
      success: true,
      profiles_processed: allProfiles.length,
      total_new_opportunities: totalNewOpps,
      results,
    });

  } catch (error) {
    console.error('fastiqWeeklyScout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});