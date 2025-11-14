// Tag-based microcopy mapping for Job Spotlight feature
// Provides consistent, motivating copy for career guidance

export const TAG_MICROCOPY = {
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
  
  'non-coding': {
    intro_line: "A powerful entry point into the tech world — no coding required.",
    why_it_matters: "🤝 Non-technical roles are crucial in modern companies, bridging communication between teams and customers.",
    starter_path_template: "Start in a {entry_role}, grow into a {mid_role}, and step up to {target_role}."
  },
  
  ops: {
    intro_line: "The behind-the-scenes role that keeps organizations running smoothly.",
    why_it_matters: "📈 Ops roles are foundational to scale—startups and large companies alike rely on them to build efficient systems.",
    starter_path_template: "Begin as an {entry_role}, grow into an {mid_role}, and advance to {target_role}."
  },
  
  startup: {
    intro_line: "A role at the cutting edge of innovation and growth.",
    why_it_matters: "🚀 Startups move fast and reward initiative — making this an ideal path for ambitious early-career talent.",
    starter_path_template: "Start as a {entry_role}, expand your impact as a {mid_role}, and grow into {target_role}."
  },
  
  'client-facing': {
    intro_line: "A people-driven role where communication and trust are everything.",
    why_it_matters: "🤝 Client-facing professionals are critical to driving adoption, renewals, and long-term relationships.",
    starter_path_template: "Begin as a {entry_role}, strengthen your skills as a {mid_role}, and become a {target_role}."
  },
  
  'high-growth': {
    intro_line: "A future-proof role in one of the fastest-growing sectors.",
    why_it_matters: "🔥 Demand for this skill set is accelerating fast, opening doors to high-impact opportunities.",
    starter_path_template: "Start as a {entry_role}, grow into a {mid_role}, and level up to {target_role}."
  },
  
  leadership: {
    intro_line: "A strategic role designed for those who want to lead, not just follow.",
    why_it_matters: "🧭 Leadership-track roles set you up for influence, ownership, and impact early in your career.",
    starter_path_template: "Begin as a {entry_role}, take initiative as a {mid_role}, and rise to {target_role}."
  },
  
  // Additional helpful tags
  'data-driven': {
    intro_line: "A data-focused role perfect for analytical minds.",
    why_it_matters: "📊 Every company needs people who can turn data into decisions — this skill is future-proof.",
    starter_path_template: "Start as a {entry_role}, grow into a {mid_role}, and advance to {target_role}."
  },
  
  'people-skills': {
    intro_line: "A people-focused role where relationships drive results.",
    why_it_matters: "🤝 Relationship-driven roles are recession-proof — people buy from people they trust.",
    starter_path_template: "Begin as a {entry_role}, grow into a {mid_role}, and become a {target_role}."
  },
  
  hot: {
    intro_line: "A high-demand role in a fast-moving field.",
    why_it_matters: "🔥 This field is growing fast — early movers have a huge advantage.",
    starter_path_template: "Start as a {entry_role}, grow into a {mid_role}, and level up to {target_role}."
  },
  
  emerging: {
    intro_line: "An emerging role at the forefront of industry change.",
    why_it_matters: "✨ New roles mean less competition and more opportunity to shape the field.",
    starter_path_template: "Begin as a {entry_role}, expand into a {mid_role}, and pioneer as a {target_role}."
  }
};

// Default role progressions for each tag when entry/mid roles aren't specified
export const TAG_ROLE_PROGRESSIONS = {
  creative: {
    entry_role: "Design Intern",
    mid_role: "Junior Designer"
  },
  tech: {
    entry_role: "Technical Support Intern",
    mid_role: "Junior Engineer"
  },
  'non-coding': {
    entry_role: "Coordinator",
    mid_role: "Specialist"
  },
  ops: {
    entry_role: "Operations Assistant",
    mid_role: "Operations Associate"
  },
  startup: {
    entry_role: "Campus Ambassador",
    mid_role: "Growth Associate"
  },
  'client-facing': {
    entry_role: "Customer Support Rep",
    mid_role: "Account Associate"
  },
  'high-growth': {
    entry_role: "Analyst Intern",
    mid_role: "Associate"
  },
  leadership: {
    entry_role: "Team Lead",
    mid_role: "Manager"
  },
  'data-driven': {
    entry_role: "Data Analyst Intern",
    mid_role: "Junior Analyst"
  },
  'people-skills': {
    entry_role: "Associate",
    mid_role: "Coordinator"
  },
  hot: {
    entry_role: "Intern",
    mid_role: "Associate"
  },
  emerging: {
    entry_role: "Early Career Role",
    mid_role: "Mid-Level Role"
  }
};

/**
 * Generates microcopy for a job based on its tags and existing copy
 * Priority: custom copy → primary tag → fallback
 * Auto-generates role progressions using tag defaults
 */
export function getJobMicrocopy(job) {
  // If job already has all custom copy, return as-is
  if (job.intro_line && job.why_it_matters && job.starter_path_copy) {
    return job;
  }
  
  // Get primary tag (first one)
  const primaryTag = job.tags?.[0];
  const mapping = TAG_MICROCOPY[primaryTag];
  const roleDefaults = TAG_ROLE_PROGRESSIONS[primaryTag];
  
  // Parse starter path to extract roles, with tag-based defaults as fallback
  const parseStarterPath = (path) => {
    if (!path) {
      return { 
        entry_role: roleDefaults?.entry_role || 'Intern', 
        mid_role: roleDefaults?.mid_role || 'Associate', 
        target_role: job.title 
      };
    }
    
    const steps = path.split('→').map(s => s.trim());
    return {
      entry_role: steps[0] || roleDefaults?.entry_role || 'Intern',
      mid_role: steps[1] || roleDefaults?.mid_role || 'Associate',
      target_role: steps[2] || job.title
    };
  };
  
  const roles = parseStarterPath(job.starter_path);
  
  // Generate starter path copy from template
  let generatedStarterPath = '';
  if (mapping?.starter_path_template) {
    generatedStarterPath = mapping.starter_path_template
      .replace('{entry_role}', roles.entry_role)
      .replace('{mid_role}', roles.mid_role)
      .replace('{target_role}', roles.target_role);
  }
  
  return {
    ...job,
    intro_line: job.intro_line || mapping?.intro_line || "Here's how to break into this growing field.",
    why_it_matters: job.why_it_matters || mapping?.why_it_matters || "📈 This role offers strong career growth and is valued across industries.",
    starter_path_copy: job.starter_path_copy || generatedStarterPath || job.starter_path
  };
}

/**
 * Get just the intro line for a job (used in cards/previews)
 */
export function getJobIntroLine(job) {
  if (job.intro_line) return job.intro_line;
  
  const primaryTag = job.tags?.[0];
  const mapping = TAG_MICROCOPY[primaryTag];
  
  return mapping?.intro_line || "Here's how to break into this growing field.";
}

/**
 * Get just the why-it-matters line for a job
 */
export function getJobWhyItMatters(job) {
  if (job.why_it_matters) return job.why_it_matters;
  
  const primaryTag = job.tags?.[0];
  const mapping = TAG_MICROCOPY[primaryTag];
  
  return mapping?.why_it_matters || "📈 This role offers strong career growth and is valued across industries.";
}

/**
 * Get formatted starter path copy
 */
export function getJobStarterPathCopy(job) {
  if (job.starter_path_copy) return job.starter_path_copy;
  
  const primaryTag = job.tags?.[0];
  const mapping = TAG_MICROCOPY[primaryTag];
  const roleDefaults = TAG_ROLE_PROGRESSIONS[primaryTag];
  
  if (!mapping?.starter_path_template || !job.starter_path) {
    // If no starter_path at all, try to generate from tag defaults
    if (mapping?.starter_path_template && roleDefaults) {
      return mapping.starter_path_template
        .replace('{entry_role}', roleDefaults.entry_role)
        .replace('{mid_role}', roleDefaults.mid_role)
        .replace('{target_role}', job.title);
    }
    return job.starter_path || '';
  }
  
  const steps = job.starter_path.split('→').map(s => s.trim());
  const roles = {
    entry_role: steps[0] || roleDefaults?.entry_role || 'Intern',
    mid_role: steps[1] || roleDefaults?.mid_role || 'Associate',
    target_role: steps[2] || job.title
  };
  
  return mapping.starter_path_template
    .replace('{entry_role}', roles.entry_role)
    .replace('{mid_role}', roles.mid_role)
    .replace('{target_role}', roles.target_role);
}