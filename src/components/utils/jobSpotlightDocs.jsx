/**
 * 🎓 UF Fast Forward — "Jobs Nobody Told You About"
 * Microcopy System & Style Guide
 * 
 * Complete documentation for the Job Spotlight feature
 */

export const JOB_SPOTLIGHT_DOCUMENTATION = {
  
  // ============================================
  // 🧭 OVERVIEW
  // ============================================
  overview: {
    purpose: "Help students discover modern, exciting career paths they may never have heard of — presented in warm, human, and inspiring language.",
    includes: [
      "Voice & tone for all career microcopy",
      "Templates for modal structure",
      "Tag-based mappings for automated generation",
      "Default role progressions (so even new jobs have a starter path instantly)"
    ]
  },

  // ============================================
  // ✍️ BRAND VOICE PRINCIPLES
  // ============================================
  brandVoice: {
    tone: {
      description: "Friendly, encouraging, mentor-like",
      example: "Here's how to break in."
    },
    language: {
      description: "Clear, conversational, no jargon",
      example: "You'll work with creative teams to make apps easy to use."
    },
    energy: {
      description: "Upbeat, forward-looking",
      example: "This field is growing fast — and it's perfect for problem solvers."
    },
    focus: {
      description: "Show possibilities, not limitations",
      example: "Even if you've never coded, this is your door into tech."
    }
  },

  // ============================================
  // 🪄 MODAL MICROCOPY TEMPLATE
  // ============================================
  modalTemplate: {
    sections: {
      intro_line: {
        purpose: "Hook; defines the role in human terms",
        example: "A fast-moving role where creativity meets analytics.",
        guidelines: [
          "Usually starts with 'A [descriptor] role that…'",
          "Frame the role in a human way, not a job posting",
          "Keep it to 1 sentence"
        ]
      },
      why_it_matters: {
        purpose: "Context + motivation (why students should care)",
        example: "🚀 Startups and brands depend on growth marketers to run campaigns that drive real results.",
        guidelines: [
          "Show why this role is relevant/growing",
          "Use emoji at the beginning for hierarchy",
          "Keep it to 1 sentence"
        ]
      },
      starter_path: {
        purpose: "Clear 3-step progression with active verbs",
        example: "Start as a Marketing Intern, grow into a Growth Associate, then level up to Growth Marketing Manager.",
        guidelines: [
          "Use active verbs: Start, grow, level up",
          "Keep it short (3 roles max)",
          "Bold the job titles"
        ]
      }
    }
  },

  // ============================================
  // 🧠 LANGUAGE RULES
  // ============================================
  languageRules: {
    dos: [
      "Use short, active sentences",
      "Use verbs like: start, grow, build, lead, design, create",
      "Bold job titles in the path",
      "Limit each modal to ~60–80 words total",
      "Keep sentences under 20 words"
    ],
    donts: [
      "Avoid jargon (e.g., 'synergy', 'stakeholder alignment')",
      "Avoid vague verbs like 'pursue', 'leverage', 'utilize'",
      "Don't use corporate speak"
    ],
    examples: {
      bad: "This position leverages cross-functional alignment to drive outcomes.",
      good: "You'll work across teams to help make ideas happen."
    }
  },

  // ============================================
  // 🧭 EMOJI GUIDELINES
  // ============================================
  emojiGuidelines: {
    usage: {
      creative: "🎨",
      tech: "💻",
      clientFacing: "🤝",
      growth: "📈",
      operations: "🧮",
      startups: "🚀",
      leadership: "🧭",
      motivation: "✨🔥"
    },
    rules: [
      "Use 1–2 emojis total per modal",
      "Use 1 emoji at start of 'why it matters'",
      "Optional: 1 emoji in intro line",
      "Always include emoji before starter path",
      "Avoid emoji spam"
    ]
  },

  // ============================================
  // 🪜 TAG → DEFAULT MICROCOPY MAPPING
  // ============================================
  tagMicrocopy: {
    creative: {
      intro_line: "A creative role that blends design, storytelling, and strategy. Here's how to break in.",
      why_it_matters: "🎨 Creative talent is in demand across industries—from startups to global brands—as companies compete to stand out.",
      starter_path_template: "Start as a {entry_role}, grow into a {mid_role}, and rise to {target_role}."
    },
    tech: {
      intro_line: "A role that blends technical skill with innovation.",
      why_it_matters: "💻 The tech industry continues to grow rapidly, creating opportunities for problem solvers and builders.",
      starter_path_template: "Begin as a {entry_role}, develop your skills as a {mid_role}, and advance to {target_role}."
    },
    "non-coding": {
      intro_line: "A powerful entry point into the tech world — no coding required.",
      why_it_matters: "🤝 Non-technical roles are crucial in modern companies, bridging communication between teams and customers.",
      starter_path_template: "Start in a {entry_role}, grow into a {mid_role}, and step up to {target_role}."
    },
    ops: {
      intro_line: "The behind-the-scenes role that keeps organizations running smoothly.",
      why_it_matters: "📊 Ops roles are foundational to scale—startups and large companies alike rely on them to build efficient systems.",
      starter_path_template: "Begin as an {entry_role}, grow into an {mid_role}, and advance to {target_role}."
    },
    startup: {
      intro_line: "A role at the cutting edge of innovation and growth.",
      why_it_matters: "🚀 Startups move fast and reward initiative — making this an ideal path for ambitious early-career talent.",
      starter_path_template: "Start as a {entry_role}, expand your impact as a {mid_role}, and grow into {target_role}."
    },
    "client-facing": {
      intro_line: "A people-driven role where communication and trust are everything.",
      why_it_matters: "🤝 Client-facing professionals are critical to driving adoption, renewals, and long-term relationships.",
      starter_path_template: "Begin as a {entry_role}, strengthen your skills as a {mid_role}, and become a {target_role}."
    },
    "high-growth": {
      intro_line: "A future-proof role in one of the fastest-growing sectors.",
      why_it_matters: "🔥 Demand for this skill set is accelerating fast, opening doors to high-impact opportunities.",
      starter_path_template: "Start as a {entry_role}, grow into a {mid_role}, and level up to {target_role}."
    },
    leadership: {
      intro_line: "A strategic role designed for those who want to lead, not just follow.",
      why_it_matters: "🧭 Leadership-track roles set you up for influence, ownership, and impact early in your career.",
      starter_path_template: "Begin as a {entry_role}, take initiative as a {mid_role}, and rise to {target_role}."
    }
  },

  // ============================================
  // 🧩 TAG → DEFAULT ROLE PROGRESSIONS
  // ============================================
  roleProgressions: {
    creative: { entry_role: "Design Intern", mid_role: "Junior Designer" },
    tech: { entry_role: "Technical Support Intern", mid_role: "Junior Engineer" },
    "non-coding": { entry_role: "Coordinator", mid_role: "Specialist" },
    ops: { entry_role: "Operations Assistant", mid_role: "Operations Associate" },
    startup: { entry_role: "Campus Ambassador", mid_role: "Growth Associate" },
    "client-facing": { entry_role: "Customer Support Rep", mid_role: "Account Associate" },
    "high-growth": { entry_role: "Analyst Intern", mid_role: "Associate" },
    leadership: { entry_role: "Team Lead", mid_role: "Manager" }
  },

  // ============================================
  // 🧾 EDITORIAL CHECKLIST
  // ============================================
  editorialChecklist: [
    "Does the intro sound conversational, not corporate?",
    "Does 'Why it matters' tell the student why they should care?",
    "Is the starter path realistic for a college-aged reader?",
    "Are job titles bolded and verbs active?",
    "Are emojis used sparingly but effectively?"
  ],

  // ============================================
  // 🧭 EXAMPLE OUTPUT (AUTO-GENERATED)
  // ============================================
  example: {
    tag: "creative",
    jobTitle: "UX Designer",
    output: {
      intro: "A creative role that blends design, storytelling, and strategy. Here's how to break in.",
      why: "🎨 Creative talent is in demand across industries—from startups to global brands—as companies compete to stand out.",
      path: "Start as a Design Intern, grow into a Junior Designer, and rise to UX Designer."
    }
  },

  // ============================================
  // 📊 TRACKING & ANALYTICS
  // ============================================
  analytics: {
    keyMetrics: [
      "spotlight_learn_more_opened - how many students click through",
      "spotlight_save_clicked - how many actually save",
      "spotlight_resource_clicked - resource engagement",
      "spotlight_saved - conversion metric"
    ],
    insights: "Analyze by tag to see which categories/intros drive most engagement."
  }
};

// Export for programmatic access
export default JOB_SPOTLIGHT_DOCUMENTATION;