/**
 * Conversational openers for FASTIQ quick actions.
 * Each action key maps to:
 *   - userMessage: short text shown as the user's message
 *   - getAssistantMessage(profile): returns the agent's conversational opener
 */

const OPENERS = {
  interview_prep: {
    userMessage: "I need help with interview prep",
    getAssistantMessage: () =>
      "I'd love to help you prep! Tell me a little about the interview:\n\n" +
      "- **What company and role?**\n" +
      "- **When is the interview?**\n" +
      "- **Do you know the format?** (phone screen, video, in-person, panel)\n" +
      "- **Anything specific you're nervous about?**\n\n" +
      "Even if you only know the company, that's enough — I'll figure out the rest."
  },

  resume_review: {
    userMessage: "I need help with my resume",
    getAssistantMessage: () =>
      "I'm ready to review your resume! You can either **paste it here**, **upload it**, or **tell me about it**.\n\n" +
      "Also, is there a specific role or company you're targeting? That way I can tailor my feedback to what they're actually looking for."
  },

  linkedin_review: {
    userMessage: "I want to optimize my LinkedIn",
    getAssistantMessage: () =>
      "Let's optimize your LinkedIn! Paste your **LinkedIn URL** or tell me what your current headline and summary say.\n\n" +
      "Are you targeting a specific industry? I'll make sure your profile speaks to the right people."
  },

  salary_intel: {
    userMessage: "I need help with salary negotiation",
    getAssistantMessage: () =>
      "Let's make sure you get paid what you're worth! Tell me:\n\n" +
      "- **What role** are you looking at?\n" +
      "- **What company** (or what size/type of company)?\n" +
      "- **What location?**\n\n" +
      "I'll pull real salary data and help you build a negotiation plan."
  },

  find_companies: {
    userMessage: "Help me find companies to target",
    getAssistantMessage: (profile) => {
      const industry = profile?.target_industry;
      const location = profile?.location_preference;
      const parts = [industry, location].filter(Boolean);
      const context = parts.length > 0
        ? `I already know you're interested in **${parts.join('** in **')}**. Want me to search based on that, or do you have something more specific in mind`
        : "Tell me a bit about what you're looking for";
      return `Let's find companies that are right for you! ${context} — like company size, culture, or a particular niche?`;
    }
  },

  draft_outreach: {
    userMessage: "I need to draft an outreach message",
    getAssistantMessage: () =>
      "Who are you reaching out to? Tell me their **name, role, and company** — or if you found them through FASTIQ, just say which alumni and I'll pull up their details.\n\n" +
      "I'll write something personalized that references your shared UF connection."
  },

  explore_careers: {
    userMessage: "I want to explore career paths",
    getAssistantMessage: (profile) => {
      const major = profile?.target_industry || 'your';
      return `Let's explore what's out there for you! As a **${major}** major, you have more options than you might think.\n\n` +
        "Want me to show you the **most common career paths**, the **highest-paying ones**, or the **most in-demand roles** right now? Or tell me what you're curious about and I'll dig in.";
    }
  },

  career_plan: {
    userMessage: "I want to build a career action plan",
    getAssistantMessage: (profile) => {
      const stage = profile?.current_stage || 'getting started';
      const timeline = profile?.career_timeline || 'your timeline';
      return `Let's build your action plan! I know you're **${stage}** with a timeline of **${timeline}**.\n\n` +
        "Before I create your plan, what's your biggest priority right now — **finding companies to target**, **building your network**, **polishing your resume**, or something else?";
    }
  },

  scan_insiders: {
    userMessage: "I want to find UF alumni at a company",
    getAssistantMessage: () =>
      "Which company do you want me to scan for UF alumni? I'll search the entire web — LinkedIn, company pages, news — not just CFF.\n\n" +
      "If you're not sure which company, I can suggest some based on your interests."
  },

  resume_tailor: {
    userMessage: "I want to tailor my resume for a job",
    getAssistantMessage: () =>
      "I'd love to tailor your resume! Paste the **job description** here — or if you saw a role through FASTIQ, just tell me which company and position.\n\n" +
      "I'll rewrite your resume to maximize ATS match score and highlight the most relevant experience."
  },

  resume_builder: {
    userMessage: "Help me build a resume",
    getAssistantMessage: (profile) => {
      const name = profile?.user_email ? '' : '';
      return "No problem! Lots of students don't have a resume yet — and that's totally fine. I'll help you build a professional one right now. It only takes a few minutes, and you'd be surprised how much you've already done that employers value.\n\n" +
        "Let's start with the basics! What's your **full name**? And what's the **best email and phone number** for employers to reach you?\n\n" +
        "If you have a **LinkedIn profile**, include that too — if not, no worries, we can set that up later.";
    }
  },
};

/**
 * Maps a legacy prompt string to an opener key.
 * Returns the key if matched, or null if the prompt should be sent as-is.
 */
export function matchPromptToOpener(promptText) {
  const t = (promptText || '').toLowerCase();

  if (t.includes('interview') || t.includes('prep me')) return 'interview_prep';
  if (t.includes('tailor') && t.includes('resume')) return 'resume_tailor';
  if (t.includes('customize') && t.includes('resume')) return 'resume_tailor';
  if (t.includes('optimize') && t.includes('resume') && (t.includes('job') || t.includes('role'))) return 'resume_tailor';
  if (t.includes('resume') && (t.includes('review') || t.includes('my resume'))) return 'resume_review';
  if (t.includes('linkedin')) return 'linkedin_review';
  if (t.includes('salary') || t.includes('negotiate')) return 'salary_intel';
  if (t.includes('find companies') || t.includes('companies to target') || t.includes('companies that') || t.includes('mid-size companies')) return 'find_companies';
  if (t.includes('draft') || t.includes('intro message') || t.includes('outreach')) return 'draft_outreach';
  if (t.includes('explore') || t.includes('career paths')) return 'explore_careers';
  if (t.includes('action plan') || t.includes('career plan') || t.includes('4-week')) return 'career_plan';
  if (t.includes('find uf alumni') || t.includes('scan') || t.includes('insiders') || t.includes('alumni at my')) return 'scan_insiders';
  if (t.includes('build a resume') || t.includes('build my resume') || t.includes('don\'t have a resume') || t.includes('no resume')) return 'resume_builder';

  return null;
}

/**
 * Gets the conversational opener for a given key.
 * Returns { userMessage, assistantMessage } or null if key not found.
 */
export function getConversationalOpener(key, profile) {
  const opener = OPENERS[key];
  if (!opener) return null;
  return {
    userMessage: opener.userMessage,
    assistantMessage: opener.getAssistantMessage(profile),
  };
}