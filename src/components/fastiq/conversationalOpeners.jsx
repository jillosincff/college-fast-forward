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
      const industry = profile?.target_industry || 'your field';
      const hasSize = !!profile?.company_size_preference;
      const hasLocation = !!profile?.location_preference;
      let msg = `Let's find the right companies for you! I already know you're interested in **${industry}**.`;
      if (!hasSize) {
        msg += `\n\nWhat size company appeals to you?\n- 🏢 **Big names** everyone knows (Apple, Google, Disney)\n- 📈 **Mid-size companies** with strong growth\n- 🚀 **Startups** where you'd wear many hats\n- 🤷 **Open to anything**`;
      }
      if (!hasLocation) {
        msg += `\n\nAnd location — any preference?\n- 🌴 I want to stay in **Florida**\n- 🌎 **Open to relocating** anywhere\n- 📍 A **specific city** (tell me which)`;
      }
      if (hasSize && hasLocation) {
        msg += ` Want me to search based on that, or do you have something more specific in mind — like company culture or a particular niche?`;
      } else {
        msg += `\n\nJust tell me and I'll find companies that are actually hiring for your background!`;
      }
      return msg;
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
      return "No problem! Lots of students don't have a resume yet — and that's totally fine. I'll help you build a professional one right now. It only takes a few minutes, and you'd be surprised how much you've already done that employers value.\n\n" +
        "Let's start with the basics! What's your **full name**? And what's the **best email and phone number** for employers to reach you?\n\n" +
        "If you have a **LinkedIn profile**, include that too — if not, no worries, we can set that up later.";
    }
  },

  thank_you_note: {
    userMessage: "I need to write a thank-you note after my interview",
    getAssistantMessage: () =>
      "I'd love to help you write a killer thank-you note! 📝 Tell me:\n\n" +
      "- **Who interviewed you?** (name and title if you know it)\n" +
      "- **What did you talk about?** Any specific topics, projects, or questions they asked?\n" +
      "- **Anything you wish you had said** or want to emphasize?\n" +
      "- **When did they say they'd get back to you?**\n\n" +
      "The more detail you give me, the more personal — and effective — the note will be."
  },

  offer_received: {
    userMessage: "I got a job offer!",
    getAssistantMessage: () =>
      "🎉🎉🎉 **CONGRATULATIONS!** That's incredible! All your hard work paid off.\n\n" +
      "Before you accept, let me help you make sure you're getting the best deal. Tell me:\n\n" +
      "- **Company name**\n" +
      "- **Role title**\n" +
      "- **Base salary**\n" +
      "- **Bonus** (if any)\n" +
      "- **Equity/stock** (if any)\n" +
      "- **Location**\n" +
      "- **Start date**\n" +
      "- **Any other benefits** they mentioned\n\n" +
      "I'll research how this compares to market rates and build your negotiation strategy."
  },

  network_thank_you: {
    userMessage: "I want to thank everyone who helped me",
    getAssistantMessage: () =>
      "That's a great instinct! 🤝 Thanking the people who helped you strengthens the Gator network and creates lasting goodwill.\n\n" +
      "I'll pull up everyone in your networking pipeline who replied, helped with introductions, or supported you. Then I'll draft personalized thank-you messages for each person.\n\n" +
      "Did you accept an offer? If so, tell me the **company and role** — sharing good news makes the thank-you even more meaningful!"
  },
};

/**
 * Maps a legacy prompt string to an opener key.
 * Returns the key if matched, or null if the prompt should be sent as-is.
 */
export function matchPromptToOpener(promptText) {
  const t = (promptText || '').toLowerCase();

  // Thank-you/post-interview checks BEFORE interview_prep
  if ((t.includes('thank') && (t.includes('note') || t.includes('email')) && t.includes('interview')) || t.includes('post-interview') || t.includes('had my interview')) return 'thank_you_note';
  if ((t.includes('got') || t.includes('received')) && (t.includes('offer') || t.includes('job offer'))) return 'offer_received';
  if (t.includes('thank everyone') || t.includes('thank my network') || t.includes('thank all') || t.includes('everyone who helped')) return 'network_thank_you';
  if ((t.includes('interview') && !t.includes('thank') && !t.includes('had my')) || t.includes('prep me')) return 'interview_prep';
  if (t.includes('tailor') && t.includes('resume')) return 'resume_tailor';
  if (t.includes('customize') && t.includes('resume')) return 'resume_tailor';
  if (t.includes('optimize') && t.includes('resume') && (t.includes('job') || t.includes('role'))) return 'resume_tailor';
  if (t.includes('resume') && (t.includes('review') || t.includes('my resume'))) return 'resume_review';
  if (t.includes('linkedin')) return 'linkedin_review';
  if (t.includes('salary') || t.includes('negotiate')) return 'salary_intel';
  if (t.includes('find companies') || t.includes('companies to target') || t.includes('companies that') || t.includes('mid-size companies') || t.includes('don\'t know where to apply') || t.includes('where should i apply') || t.includes('what companies should') || t.includes('help me find a job') || t.includes('where to apply')) return 'find_companies';
  if (t.includes('they replied') || t.includes('got a reply') || t.includes('they responded') || t.includes('wrote back') || t.includes('here\'s what they said')) return null; // Let reply help go to backend handler
  if (t.includes('follow-up') || t.includes('follow up') || t.includes('followup') || t.includes('stale outreach')) return null; // Let follow-up go to backend handler
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