import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { linkedinUrl, careerGoals, major } = await req.json();
    if (!linkedinUrl) return Response.json({ success: false, error: 'LinkedIn URL is required.' }, { status: 400 });

    const PROXYCURL_KEY = Deno.env.get('PROXYCURL_API_KEY');

    // Step 1 — Scrape LinkedIn via Proxycurl
    let profile = null;
    const px = await fetch(
      `https://nubela.co/proxycurl/api/v2/linkedin?url=${encodeURIComponent(linkedinUrl)}&use_cache=if-present`,
      { headers: { 'Authorization': `Bearer ${PROXYCURL_KEY}` } }
    );
    profile = await px.json();

    if (!profile || profile.code === 404 || px.status === 404) {
      return Response.json({ success: false, error: 'LinkedIn profile not found. Make sure the URL is correct and your profile is public.' }, { status: 404 });
    }

    if (px.status !== 200) {
      return Response.json({ success: false, error: 'Could not fetch LinkedIn profile. Make sure your profile is public.' }, { status: 400 });
    }

    // Step 2 — Build profile summary
    const profileSummary = `
Name: ${profile.full_name || 'Unknown'}
Headline: ${profile.headline || 'None'}
Summary/About: ${profile.summary || 'None'}
Current Role: ${profile.experiences?.[0]?.title || 'None'} at ${profile.experiences?.[0]?.company || 'None'}
Experience count: ${profile.experiences?.length || 0}
Education: ${profile.education?.[0]?.school || 'None'}, ${profile.education?.[0]?.field_of_study || ''}
Skills: ${profile.skills?.slice(0, 20).join(', ') || 'None listed'}
Connections: ${profile.connections || 'Unknown'}
Profile photo: ${profile.profile_pic_url ? 'Yes' : 'No'}
Recommendations: ${profile.recommendations?.length || 0}
Certifications: ${profile.certifications?.length || 0}
    `.trim();

    // Step 3 — Analyze via InvokeLLM
    const prompt = `You are an expert LinkedIn coach helping a college student optimize their profile for job searching.

STUDENT'S CAREER GOALS:
- Target Roles: ${careerGoals?.target_roles?.join(', ') || 'Not specified'}
- Target Industries: ${careerGoals?.target_industries?.join(', ') || 'Not specified'}
- Major: ${major || 'Not specified'}
- Graduating: ${careerGoals?.graduation_year || 'Not specified'}
- Location: ${careerGoals?.location || 'Not specified'}

THEIR LINKEDIN PROFILE:
${profileSummary}

Analyze this LinkedIn profile and respond ONLY with valid JSON (no markdown, no preamble) matching this structure exactly:
{
  "overall_score": <number 0-100>,
  "score_label": "<Needs Work | Getting There | Strong | Excellent>",
  "summary": "<2-3 sentence honest assessment in casual smart-friend tone>",
  "sections": {
    "headline": {
      "score": <0-100>,
      "current": "<their current headline>",
      "feedback": "<specific feedback>",
      "suggested": "<a better headline you'd write for them>"
    },
    "about": {
      "score": <0-100>,
      "feedback": "<specific feedback on their summary>",
      "suggested": "<a rewritten opening 2-3 sentences for their about section>"
    },
    "experience": {
      "score": <0-100>,
      "feedback": "<feedback on their experience descriptions>",
      "top_fix": "<single most important improvement>"
    },
    "skills": {
      "score": <0-100>,
      "feedback": "<feedback on skills section>",
      "missing_keywords": ["<keyword 1>", "<keyword 2>", "<keyword 3>", "<keyword 4>", "<keyword 5>"]
    },
    "completeness": {
      "score": <0-100>,
      "missing": ["<missing element 1>", "<missing element 2>"],
      "feedback": "<what's missing from a complete profile>"
    }
  },
  "top_3_fixes": [
    "<most impactful fix #1>",
    "<most impactful fix #2>",
    "<most impactful fix #3>"
  ],
  "keywords_to_add": ["<keyword 1>", "<keyword 2>", "<keyword 3>", "<keyword 4>", "<keyword 5>"]
}`;

    const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: 'claude_sonnet_4_6',
      response_json_schema: {
        type: 'object',
        properties: {
          overall_score: { type: 'number' },
          score_label: { type: 'string' },
          summary: { type: 'string' },
          sections: { type: 'object' },
          top_3_fixes: { type: 'array', items: { type: 'string' } },
          keywords_to_add: { type: 'array', items: { type: 'string' } },
        },
        required: ['overall_score', 'score_label', 'summary', 'sections', 'top_3_fixes'],
      },
    });

    return Response.json({
      success: true,
      analysis,
      profile: {
        full_name: profile.full_name,
        headline: profile.headline,
        profile_pic_url: profile.profile_pic_url,
        connections: profile.connections,
      },
    });
  } catch (error) {
    console.error('reviewLinkedInProfile error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});