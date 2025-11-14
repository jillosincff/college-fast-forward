// Job Spotlight Microcopy Style Guide
// "Jobs Nobody Told You About" — UF Fast Forward

/**
 * BRAND VOICE PRINCIPLES
 * 
 * 🎯 Tone: Friendly, encouraging, approachable — like a mentor sharing advice
 * 💬 Language: Plain English, no jargon. Speak to students, not professionals
 * ✨ Energy: Upbeat, future-forward, confidence-building
 * 🧠 Clarity: Understand in one scroll. Short sentences. Active verbs.
 * 
 * MODAL MICROCOPY STRUCTURE
 * 
 * 1. Intro line (1 sentence)
 *    - Frame the role in a human way
 *    - Usually starts with "A [descriptor] role that…"
 * 
 * 2. Why it matters (1 sentence)
 *    - Show why this role is relevant/growing
 *    - Use emoji at the beginning for hierarchy
 * 
 * 3. Starter path (1 line)
 *    - Use active verbs: Start, grow, level up
 *    - Keep it short (3 roles max)
 * 
 * EXAMPLE — Growth Marketer:
 * 
 * 💬 "A fast-moving role where creativity meets analytics."
 * 🚀 "Startups and brands depend on growth marketers to run campaigns that drive real results."
 * 🪜 Start as a Marketing Intern, become a Growth Associate, then level up to Growth Marketing Manager.
 * 
 * LANGUAGE RULES
 * 
 * ✅ Use active verbs: Start, grow, level up, lead, build, create
 * ❌ Avoid vague verbs: "pursue," "leverage," "utilize"
 * ✅ Keep sentences under 20 words
 * ❌ No corporate jargon
 * 
 * Bad: "This position leverages cross-functional alignment to drive outcomes."
 * Good: "You'll work across teams to help make ideas happen."
 * 
 * EMOJI USAGE
 * 
 * ✅ Use 1 emoji at start of "why it matters"
 * 💬 Optional: 1 emoji in intro line
 * 🪜 Always include emoji before starter path
 * ❌ Avoid more than 2-3 emojis per modal
 * 
 * Common emojis:
 * 💻 Tech | 🎨 Creative | 🤝 Client-facing | 🧮 Ops
 * 📈 Growth | 🚀 Startups | 🔥 Hot | 🧭 Leadership
 * 
 * STARTER PATH RULES
 * 
 * Always use 3-step pattern:
 * "Start as [entry], grow into [mid], and level up to [target]."
 * 
 * Use action verbs:
 * - Start / Begin
 * - Grow / Build
 * - Level up / Rise / Advance / Step up
 * 
 * Weak: "Intern → Junior → Senior"
 * Strong: "Start as an Intern, grow into a Junior Designer, and level up to Product Design Lead."
 * 
 * TAG-BASED AUTOMATION
 * 
 * Priority: custom copy → primary tag → fallback
 * 
 * Always include:
 * - intro_line (from tag or custom)
 * - why_it_matters (from tag or custom)  
 * - starter_path_copy (from tag + defaults + job title)
 * 
 * EDITORIAL CHECKLIST
 * 
 * Before publishing:
 * ✅ Sounds like a peer, not HR?
 * ✅ Intro is exciting, not intimidating?
 * ✅ Path is clear and realistic?
 * ✅ Has emoji for scannability?
 * ✅ Job titles are emphasized?
 * 
 * TRACKING METRICS
 * 
 * - spotlight_learn_more_opened (engagement)
 * - spotlight_save_clicked (intent)
 * - spotlight_resource_clicked (utilization)
 * - spotlight_saved (conversion)
 * 
 * Analyze by tag to see which categories/intros drive most engagement.
 */

export const STYLE_GUIDE = {
  version: '1.0',
  updated: '2025-01-20',
  
  examples: {
    customer_success: {
      intro: "A people-first role at the heart of tech companies — no coding required.",
      why: "🤝 Customer success roles are booming as more companies shift to subscription models and need trusted relationship builders.",
      path: "Begin as a Support or Sales Associate, grow into a Customer Success Manager, and advance to CS Team Lead."
    },
    
    venture_scout: {
      intro: "A role for the curious — helping investors find the next breakout startup.",
      why: "🔥 Venture scouting gives students a front-row seat to the startup world — and can lead to VC or founder paths.",
      path: "Start as a Campus Scout, grow into a VC Analyst, and step up to Associate."
    }
  }
};