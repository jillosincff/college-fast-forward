import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { pastedContent, targetRole, mode, rawMaterial } = await req.json();

    // Get student profile for context
    const profiles = await base44.entities.FastTrackProProfile.filter({ user_email: user.email });
    const profile = profiles[0] || {};

    let prompt;

    if (mode === 'build') {
      prompt = `You are FASTIQ, an AI career advisor for UF students. Build a complete LinkedIn profile from scratch.

STUDENT INFO:
Name: ${user.full_name || 'Student'}
Email domain: ${user.email?.split('@')[1] || ''}
Major: ${profile.major || 'Unknown'}
Graduation: ${profile.graduation_year || 'Unknown'}
Target industries: ${(profile.selected_industries || []).join(', ') || 'Unknown'}
Target role: ${targetRole || 'general career opportunities'}

RAW MATERIAL FROM STUDENT:
${rawMaterial || 'No additional material provided.'}

RESUME TEXT (if available):
${profile.resume_text || 'No resume on file.'}

Generate a COMPLETE LinkedIn profile. Return JSON:
{
  "overall_score": 85,
  "section_scores": { "headline": 90, "about": 85, "experience": 80, "skills": 85, "education": 90, "completeness": 75 },
  "optimized_headline": "...",
  "optimized_about": "3 paragraphs: who you are, what you've done, what you're looking for",
  "optimized_experience": "Formatted experience with bullet points using their raw material",
  "optimized_skills": ["skill1", "skill2", ...up to 15 relevant skills],
  "optimized_education": "Education section text",
  "featured_suggestion": "What to feature on their profile",
  "recommendations_strategy": "Who to ask for recommendations and how",
  "suggestions": [
    { "id": "s1", "section": "Photo", "priority": "high", "issue": "No profile photo", "suggestion": "Add a professional headshot - profiles with photos get 21x more views", "example_content": "" }
  ],
  "next_steps": ["Step 1", "Step 2", "Step 3"]
}`;
    } else {
      prompt = `You are FASTIQ, an AI career advisor analyzing a UF student's LinkedIn profile. Be honest — weak profiles should score below 50.

STUDENT PROFILE CONTENT:
${pastedContent}

TARGET ROLE: ${targetRole || 'general career opportunities'}

STUDENT CONTEXT:
Name: ${user.full_name || 'Student'}
Major: ${profile.major || 'Unknown'}
Graduation: ${profile.graduation_year || 'Unknown'}
Industries: ${(profile.selected_industries || []).join(', ') || 'Unknown'}

Analyze and return JSON:
{
  "overall_score": number (0-100, be honest),
  "section_scores": { "headline": number, "about": number, "experience": number, "skills": number, "education": number, "completeness": number },
  "parsed_headline": "their current headline",
  "parsed_about": "their current about section",
  "parsed_experience": "their experience section",
  "parsed_skills": "their skills",
  "optimized_headline": "Your rewritten headline: role target + value prop + school, e.g. 'Marketing Student at UF | Brand Strategy & Consumer Insights | Seeking Summer 2026 Internship'",
  "optimized_about": "Your rewritten About: 3 paragraphs, conversational but professional, include keywords for target role",
  "optimized_skills": ["top 15 skills ordered by relevance to target role"],
  "skills_to_remove": ["generic or irrelevant skills to remove"],
  "suggestions": [
    { "id": "s1", "section": "Headline", "priority": "high", "issue": "specific issue", "suggestion": "what to change", "example_content": "exact rewritten text they can copy" }
  ] (max 8, sorted high->medium->low)
}

Score guide: 90-100 recruiter magnet, 70-89 strong, 50-69 needs work, 30-49 weak, 0-29 incomplete.`;
    }

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          overall_score: { type: "number" },
          section_scores: { type: "object" },
          parsed_headline: { type: "string" },
          parsed_about: { type: "string" },
          parsed_experience: { type: "string" },
          parsed_skills: { type: "string" },
          optimized_headline: { type: "string" },
          optimized_about: { type: "string" },
          optimized_experience: { type: "string" },
          optimized_skills: { type: "array", items: { type: "string" } },
          skills_to_remove: { type: "array", items: { type: "string" } },
          optimized_education: { type: "string" },
          featured_suggestion: { type: "string" },
          recommendations_strategy: { type: "string" },
          suggestions: { type: "array", items: { type: "object", properties: { id: { type: "string" }, section: { type: "string" }, priority: { type: "string" }, issue: { type: "string" }, suggestion: { type: "string" }, example_content: { type: "string" } } } },
          next_steps: { type: "array", items: { type: "string" } }
        }
      },
      model: "claude_sonnet_4_6"
    });

    // Save to entity
    const saved = await base44.entities.LinkedInProfile.create({
      user_email: user.email,
      mode,
      pasted_content: pastedContent || '',
      target_role: targetRole || '',
      overall_score: result.overall_score || 0,
      section_scores: result.section_scores || {},
      suggestions: (result.suggestions || []).map(s => ({ ...s, implemented: false })),
      optimized_headline: result.optimized_headline || '',
      optimized_about: result.optimized_about || '',
      optimized_skills: result.optimized_skills || [],
      parsed_headline: result.parsed_headline || '',
      parsed_about: result.parsed_about || '',
      parsed_experience: result.parsed_experience || '',
      parsed_skills: result.parsed_skills || '',
    });

    return Response.json({ success: true, ...result, savedId: saved.id });
  } catch (error) {
    console.error('LinkedIn analysis error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});