import { Anthropic } from "npm:@anthropic-ai/sdk";

const client = new Anthropic();

const INTENT_PROMPTS = {
  career_advice: "I want to learn about how they broke into their industry and get their perspective on my career path.",
  info_interview: "I'd like to have a 15-minute informational interview to learn about their career journey.",
  company_question: "I want to ask them what it's like to work at their company and get insights into the culture and role.",
  referral: "I'm looking for introductions or referrals to other people or companies they might recommend.",
  resume_feedback: "I'd like them to review my resume and give me feedback.",
};

const DRAFTING_PROMPT = `You are an expert at helping college students write short, professional outreach messages to professionals (parents and alumni in their school's network).

**Hard Rules (NEVER VIOLATE):**
1. Always open with EXACTLY: "I saw you on College Fast Forward and I'd love to set up a time to connect."
2. Total message: 3-4 sentences (not counting opener and signoff)
3. Always mention the student's school in the second sentence
4. The ask in sentence 3 must specifically match the intent
5. Always close with EXACTLY: "Thanks — [First name]"
6. NEVER include these phrases: "pick your brain", "reach out", "touch base", "I hope this finds you well", "would love to connect" (already in opener), "if it's not too much trouble", "I would be honored", "it would mean the world", "passionate about", "excited to learn"
7. No filler, no flattery, no self-deprecation, no casual language
8. Keep it polite, direct, simple

**Draft Structure:**
1. Opening (provided, fixed): "I saw you on College Fast Forward and I'd love to set up a time to connect."
2. Student context: One sentence - what they're studying/year at school
3. Ask based on intent: One sentence - specifically about the selected intent
4. Time request: One sentence - polite ask for time (e.g., "Would you have 15 minutes?")
5. Closing (provided, fixed): "Thanks — [First name]"

**Context:**
- Student: {STUDENT_CONTEXT}
- Professional: {PROFESSIONAL_CONTEXT}
- Intent: {INTENT_DESCRIPTION}

Generate a professional message draft following all rules above. Output only the message, nothing else.`;

Deno.serve(async (req) => {
  try {
    const base44 = await import("npm:@base44/sdk@0.8.25").then(
      (m) => m.createClientFromRequest(req)
    );
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipientProfile, studentProfile, intent } = await req.json();

    if (!recipientProfile || !studentProfile || !intent) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const studentContext = [
      studentProfile.full_name,
      `${studentProfile.graduation_year || "Student"} at ${studentProfile.school || "their school"}`,
      studentProfile.major && `studying ${studentProfile.major}`,
      studentProfile.target_industry &&
        `interested in ${studentProfile.target_industry}`,
    ]
      .filter(Boolean)
      .join(", ");

    const professionalContext = [
      recipientProfile.full_name,
      recipientProfile.job_title && `${recipientProfile.job_title}`,
      recipientProfile.company && `at ${recipientProfile.company}`,
      recipientProfile.industry && `in ${recipientProfile.industry}`,
    ]
      .filter(Boolean)
      .join(", ");

    const intentDescription = INTENT_PROMPTS[intent] || INTENT_PROMPTS.career_advice;

    const prompt = DRAFTING_PROMPT.replace(
      "{STUDENT_CONTEXT}",
      studentContext
    )
      .replace("{PROFESSIONAL_CONTEXT}", professionalContext)
      .replace("{INTENT_DESCRIPTION}", intentDescription);

    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const draft = message.content[0].type === "text" ? message.content[0].text : "";

    // Verify draft passes quality checks
    const checks = validateDraft(draft, studentProfile.full_name);
    if (!checks.passed) {
      // If validation fails, regenerate once
      const message2 = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content:
              prompt +
              "\n\nPrevious attempt failed validation. Make sure to follow ALL hard rules exactly.",
          },
        ],
      });
      const draft2 =
        message2.content[0].type === "text" ? message2.content[0].text : draft;
      return Response.json({ draft: draft2.trim() });
    }

    return Response.json({ draft: draft.trim() });
  } catch (error) {
    console.error("Error generating draft:", error);
    return Response.json(
      { error: "Failed to generate draft" },
      { status: 500 }
    );
  }
});

function validateDraft(draft, studentFirstName) {
  const checks = {
    startsCorrectly:
      draft.includes(
        "I saw you on College Fast Forward and I'd love to set up a time to connect"
      ) || draft.includes("I saw you on College Fast Forward"),
    hasSignoff:
      draft.includes("Thanks —") ||
      draft.includes(`Thanks — ${studentFirstName.split(" ")[0]}`),
    sentenceCount: (draft.match(/[.!?]/g) || []).length >= 5, // opener + 3-4 body + signoff
    noBannedPhrases: !/(pick your brain|reach out|touch base|hope this finds you well|would love to connect|if it's not too much trouble|I would be honored|it would mean the world|passionate about|excited to learn)/i.test(
      draft
    ),
  };

  return {
    passed:
      checks.startsCorrectly &&
      checks.hasSignoff &&
      checks.sentenceCount &&
      checks.noBannedPhrases,
    checks,
  };
}