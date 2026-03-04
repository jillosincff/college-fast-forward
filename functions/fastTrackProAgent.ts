import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// ═══════════════════════════════════════════════════════════
//  INTENT DETECTION HELPERS
// ═══════════════════════════════════════════════════════════

function detectAlumniQuery(message) {
  // Skip if this is a batch target command
  if (detectBatchTargetCommand(message)) return null;

  const patterns = [
    /(?:find|show|who|any|look for|search|discover)\s+(?:me\s+)?(?:uf\s+)?(?:alumni|gators?|connections?|people|grads?|insiders?)\s+(?:at|from|who work at|working at|who work there)\s+(\w[\w\s&.''-]{1,40}?)(?:\s+(?:who|that|which|to|can|could|for|in)\b|$)/i,
    /(?:find|show|who|any|look for|search|discover)\s+(?:me\s+)?(?:uf\s+)?(?:alumni|gators?|connections?|people|grads?|insiders?)\s+(?:at|from|who work at|working at|who work there)\s*(\w[\w\s&.''-]{1,40})?/i,
    /(?:alumni|gators?|connections?|people|grads?|insiders?)\s+(?:at|from|who work at|working at)\s+(\w[\w\s&.''-]{1,40}?)(?:\s+(?:who|that|which|to|can|could|for|in)\b|$)/i,
    /(?:alumni|gators?|connections?|people|grads?|insiders?)\s+(?:at|from|who work at|working at)\s+(\w[\w\s&.''-]{1,40})/i,
    /(?:who|anyone)\s+(?:works?|is)\s+at\s+(\w[\w\s&.''-]{1,40})\s+(?:from uf|from university of florida|who went to uf)/i,
    /(?:uf|university of florida)\s+(?:alumni|grads?|people)\s+(?:at|from)\s+(\w[\w\s&.''-]{1,40})/i,
    /(?:know anyone|connections?)\s+at\s+(\w[\w\s&.''-]{1,40})/i,
    /find\s+(?:me\s+)?(?:uf\s+)?(?:alumni|people|insiders?|gators?)\s+(?:who\s+)?work\s+there/i,
    /(?:who works?|anyone)\s+there\s+(?:from uf|from university of florida|who went to uf|that went to uf)/i,
    /(?:find|show|any)\s+(?:me\s+)?(?:uf\s+)?(?:alumni|insiders?|gators?)\s+there/i,
    /find\s+(?:me\s+)?uf\s+alumni/i,
  ];
  for (const p of patterns) {
    const m = message.match(p);
    if (m) {
      const candidate = m[1]?.trim().replace(/\s+/g, ' ').replace(/[?.!]+$/, '');
      if (candidate && !isLikelyCompanyName(candidate)) {
        console.log(`Rejected "${candidate}" as company name in alumni query`);
        return null;
      }
      return candidate || 'RESOLVE_FROM_CONTEXT';
    }
  }
  return null;
}

function resolveCompanyFromContext(history) {
  if (!history) return null;
  const lines = history.split('\n').reverse();
  for (const line of lines) {
    let m = line.match(/(?:intel on|researching|research)\s+([A-Z][\w\s&.''-]{1,40}?)(?:\s*[\(:]|\s*$)/i);
    if (m) return m[1].trim();
    m = line.match(/(?:alumni.*?at|work.*?at|hired at|hiring at)\s+([A-Z][\w\s&.''-]{1,40}?)(?:\s*[\(:.!?]|\s*$)/i);
    if (m) return m[1].trim();
    m = line.match(/Student:\s*(?:Research|Tell me about|Look into|Check)\s+([A-Z][\w\s&.''-]{1,40}?)(?:\s+hiring|\s*$)/i);
    if (m) return m[1].trim();
  }
  return null;
}

function detectOutreachQuery(message) {
  const alumniKeywords = /\b(?:find|show|discover|search for|look for|who works?|any)\s+(?:me\s+)?(?:uf\s+)?(?:alumni|gators?|insiders?|connections?|people|grads?)/i;
  if (alumniKeywords.test(message)) return null;
  const patterns = [
    /(?:draft|write|compose|create|help me write)\s+(?:a\s+)?(?:warm\s+)?(?:message|email|linkedin message|outreach|note|dm|intro(?:duction)?)\s+(?:message\s+)?(?:to|for)\s+(\w[\w\s.''-]{1,40})/i,
    /(?:draft|write|compose)\s+(?:a\s+)?(?:cold email|cold message|introduction|outreach)\s+(?:to|for)\s+(\w[\w\s.''-]{1,40})/i,
    /(?:help me reach out|help me contact)\s+(\w[\w\s.''-]{1,40})/i,
    /(?:draft outreach|write outreach)\s+(?:to|for)\s+(\w[\w\s.''-]{1,40})/i,
    /(?:draft|write|compose|create)\s+(?:a\s+)?(?:warm\s+)?(?:intro|introduction)\s+(?:message\s+)?(?:to|for)\s+(\w[\w\s.''-]{1,40})/i,
  ];
  for (const p of patterns) {
    const m = message.match(p);
    if (m) {
      const name = m[1].trim().replace(/\s+/g, ' ').replace(/[?.!]+$/, '');
      if (['a','an','the','someone','them','anyone','recruiter','hiring manager'].includes(name.toLowerCase())) return null;
      return name;
    }
  }
  return null;
}

function detectRoadmapQuery(message) {
  const lower = message.toLowerCase();
  const patterns = [
    /(?:create|build|make|give me|generate|plan)\s+(?:a\s+)?(?:career|job search|action|weekly|4.week|8.week|roadmap|plan|timeline|strategy)/i,
    /(?:career|job search|action|weekly)\s+(?:roadmap|plan|timeline|strategy)/i,
    /(?:what should i do|next steps|week.by.week|step.by.step)\s+(?:to|for|in)\s+(?:get|find|land|my|a)\s+(?:job|career|internship|role)/i,
    /(?:roadmap|plan|action plan|game plan|strategy)\s+(?:for|to)\s+(?:my|the|a)?\s*(?:career|job|internship|search)/i,
  ];
  if (patterns.some(p => p.test(message))) return true;
  return ['roadmap','action plan','career plan','week by week','step by step','game plan'].some(k => lower.includes(k));
}

function detectBatchTargetCommand(message) {
  const lower = message.toLowerCase();
  const patterns = [
    /(?:my|your|the)\s+target\s+companies/i,
    /(?:all|each|every)\s+(?:of\s+)?(?:my|your|the)\s+(?:target\s+)?companies/i,
    /(?:my|your|the)\s+targets/i,
    /(?:all|each|every)\s+(?:of\s+)?(?:my|your|the)\s+targets/i,
    /(?:all|each)\s+(?:my|the)\s+companies/i,
    /(?:research|scan|check|find|identify|show|look)\s+(?:\w+\s+){0,4}(?:at\s+)?(?:my|your|the)\s+target/i,
    /(?:internships?|roles?|jobs?|openings?|opportunities?)\s+(?:at|for|across)\s+(?:my|your|the|all)\s+(?:target\s+)?compan/i,
  ];
  return patterns.some(p => p.test(message));
}

function detectOpportunityDiscovery(message) {
  const patterns = [
    /(?:find|suggest|recommend|show)\s+(?:me\s+)?companies/i,
    /(?:where|what)\s+(?:should|can|could)\s+(?:i|we)\s+(?:apply|look|work|target)/i,
    /(?:don'?t|do not)\s+know\s+(?:where|what)\s+to\s+(?:apply|look|target)/i,
    /(?:help me find|looking for)\s+companies/i,
    /(?:what|which)\s+(?:companies|employers|firms)\s+(?:should|are|would|could)/i,
    /(?:companies|employers)\s+(?:hiring|that hire|looking for)\s+(?:in|for|at)/i,
    /(?:mid.?size|startup|large)\s+companies\s+(?:in|for|hiring)/i,
    /(?:not sure|unsure|no idea)\s+(?:where|what)\s+(?:to apply|companies)/i,
    /(?:explore|discover)\s+(?:companies|employers|opportunities)/i,
  ];
  return patterns.some(p => p.test(message));
}

// ═══════════════════════════════════════════════════════════
//  LAYER 1 — COMPANY NAME VALIDATION
// ═══════════════════════════════════════════════════════════

// Words that are NEVER company names
const COMPANY_NAME_BLOCKLIST = [
  'identify','relevant','find','show','help','research','draft','review',
  'prep','explore','build','create','scan','check','look','tell','give',
  'get','what','where','how','should','could','would','please','do',
  'internships','openings','roles','jobs','careers','opportunities',
  'hiring','my','your','the','all','each','every','about','into','at','for',
  'entry','level','target','companies','company',
];

// Common phrases that are commands, not company names
const COMMAND_PHRASES = [
  'my target companies','relevant internships','entry level roles',
  'target companies','all companies','my companies','my targets',
  'entry level','full time','part time','new grad','recent grad',
  'open roles','open positions','job openings','career opportunities',
  'internship opportunities','summer internships','fall internships',
];

function isLikelyCompanyName(name) {
  if (!name) return false;
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();
  const words = trimmed.split(/\s+/);

  // Rule 1: More than 4 words → not a company name
  if (words.length > 4) {
    console.log(`[Layer1] Rejected "${trimmed}": too many words (${words.length})`);
    return false;
  }

  // Rule 2: Check if the entire phrase matches a known command phrase
  if (COMMAND_PHRASES.some(phrase => lower.includes(phrase) || phrase.includes(lower))) {
    console.log(`[Layer1] Rejected "${trimmed}": matches command phrase`);
    return false;
  }

  // Rule 3: If ANY word is in the blocklist, reject (single blocklist word = definitely not a company)
  const lowerWords = words.map(w => w.toLowerCase().replace(/[^a-z]/g, ''));
  for (const w of lowerWords) {
    if (COMPANY_NAME_BLOCKLIST.includes(w)) {
      console.log(`[Layer1] Rejected "${trimmed}": contains blocklisted word "${w}"`);
      return false;
    }
  }

  // Rule 4: If more than half the words are common sentence words, reject
  const sentenceWords = ['a','an','the','is','are','was','were','be','been','being','am',
    'do','does','did','have','has','had','will','shall','may','might','can','to','of','in',
    'on','with','by','from','up','out','if','or','and','but','not','no','so','as','than'];
  const sentenceCount = lowerWords.filter(w => sentenceWords.includes(w)).length;
  if (sentenceCount >= Math.ceil(words.length / 2)) {
    console.log(`[Layer1] Rejected "${trimmed}": too many sentence words`);
    return false;
  }

  return true;
}

// ═══════════════════════════════════════════════════════════
//  LAYER 2 — WELL-KNOWN COMPANY LIST (for confirmation gate)
// ═══════════════════════════════════════════════════════════

const WELL_KNOWN_COMPANIES = new Set([
  // Big Tech
  'apple','google','alphabet','microsoft','amazon','meta','facebook','netflix','nvidia','tesla',
  'ibm','oracle','salesforce','adobe','intel','amd','qualcomm','cisco','hp','dell',
  'uber','lyft','airbnb','spotify','snap','pinterest','twitter','x','tiktok','bytedance',
  'palantir','snowflake','databricks','stripe','plaid','square','block','shopify','zoom','slack',
  'dropbox','twilio','cloudflare','datadog','mongodb','elastic','confluent','okta','crowdstrike',
  // Finance
  'jpmorgan','goldman sachs','morgan stanley','bank of america','citigroup','wells fargo',
  'blackrock','vanguard','fidelity','charles schwab','td ameritrade','citadel','two sigma',
  'jane street','bridgewater','kkr','blackstone','carlyle','apollo','bain capital',
  'visa','mastercard','american express','paypal','robinhood','coinbase','sofi',
  // Consulting
  'mckinsey','bain','bcg','boston consulting','deloitte','ey','ernst young','pwc','kpmg',
  'accenture','booz allen','oliver wyman','strategy&','a.t. kearney','roland berger',
  // Healthcare / Pharma
  'johnson & johnson','j&j','pfizer','merck','abbvie','amgen','gilead','moderna','eli lilly',
  'unitedhealth','cvs','anthem','cigna','humana','medtronic','abbott','stryker','baxter',
  // Consumer / Retail
  'walmart','target','costco','home depot','lowes','nike','adidas','starbucks','coca cola',
  'pepsi','pepsico','procter gamble','p&g','unilever','nestle','kraft heinz','general mills',
  'disney','warner bros','paramount','comcast','nbcuniversal','fox','viacom',
  // Industrial / Aerospace / Defense
  'boeing','lockheed martin','raytheon','northrop grumman','general dynamics','l3harris',
  'ge','general electric','honeywell','3m','caterpillar','john deere','siemens',
  'spacex','blue origin','virgin galactic',
  // Auto
  'ford','gm','general motors','toyota','honda','bmw','mercedes','volkswagen','rivian','lucid',
  // Energy
  'exxon','exxonmobil','chevron','shell','bp','conocophillips','duke energy','nextera',
  // Telecom
  'at&t','verizon','t-mobile','comcast',
  // Other notable
  'bloomberg','reuters','mckinsey','mit','nasa','world bank','un','united nations',
  'wegmans','publix','chick-fil-a','raising canes','ernst & young',
  // Common startups / unicorns
  'doordash','instacart','figma','notion','airtable','canva','vercel','linear','ramp',
  'brex','scale ai','openai','anthropic','cohere','hugging face','anduril','flexport',
  'rippling','gusto','lattice','deel','remote','loom','miro','asana','monday',
]);

function isWellKnownCompany(name) {
  if (!name) return false;
  const lower = name.toLowerCase().trim();
  // Direct match
  if (WELL_KNOWN_COMPANIES.has(lower)) return true;
  // Check if any well-known name is contained in the input or vice versa
  for (const known of WELL_KNOWN_COMPANIES) {
    if (lower.includes(known) || known.includes(lower)) return true;
  }
  return false;
}

// Determine if we should ask for confirmation before researching a company
// Returns false if company is trusted (in targets or well-known), true if we should confirm
function shouldConfirmCompany(companyName, targetCompanies) {
  if (!companyName) return true;
  const lower = companyName.toLowerCase().trim();
  // Check target companies
  if ((targetCompanies || []).some(tc => tc.toLowerCase().trim() === lower || lower.includes(tc.toLowerCase().trim()) || tc.toLowerCase().trim().includes(lower))) {
    return false; // In targets — trusted
  }
  // Check well-known list
  if (isWellKnownCompany(companyName)) {
    return false; // Well-known — trusted
  }
  return true; // Unknown — ask for confirmation
}

function detectCompanyQuery(message) {
  // Skip if this is a batch target command — not a single company query
  if (detectBatchTargetCommand(message)) return null;

  const patterns = [
    /(?:research|tell me about|look into|check|what about|how is|is)\s+(\w[\w\s&.''-]{1,40}?)(?:\s+hiring|\s+jobs|\s+careers|\s+salary|\s+for me|\s*\?|$)/i,
    /(?:hiring|jobs|careers|openings|roles)\s+(?:at|for)\s+(\w[\w\s&.''-]{1,40})/i,
    /(\w[\w\s&.''-]{1,30}?)\s+(?:hiring|jobs|careers|openings|internships)/i,
    /(?:show me|give me|get me|what'?s? the|latest|current)\s+(?:the\s+)?(?:intel|intelligence|info|information|data|details|briefing)\s+(?:on|for|about)\s+(\w[\w\s&.''-]{1,40})/i,
    /(?:intel|intelligence|briefing|info)\s+(?:on|for|about)\s+(\w[\w\s&.''-]{1,40})/i,
  ];
  for (const p of patterns) {
    const m = message.match(p);
    if (m) {
      const candidate = m[1].trim().replace(/\s+/g, ' ');
      // Guard: reject full sentences disguised as company names
      if (!isLikelyCompanyName(candidate)) {
        console.log(`Rejected "${candidate}" as company name (too many words or sentence-like)`);
        return null;
      }
      return candidate;
    }
  }
  return null;
}

// NEW INTENT DETECTORS

function detectResumeReview(message) {
  const lower = message.toLowerCase();
  return /(?:review|check|score|feedback|critique|analyze|look at)\s+(?:my\s+)?resume/i.test(message) ||
    /(?:how'?s?\s+(?:my\s+)?resume|resume\s+(?:review|feedback|score|check))/i.test(message) ||
    lower.includes('uploaded my resume') || lower.includes('here is my resume') || lower.includes('here\'s my resume');
}

function detectResumeMatch(message) {
  return /(?:match|compare|fit|align)\s+(?:my\s+)?resume\s+(?:to|with|against|for|vs)/i.test(message) ||
    /(?:does\s+)?my\s+resume\s+(?:fit|match|work for)/i.test(message) ||
    /resume\s+(?:vs|versus|against|compared to)/i.test(message);
}

function detectResumeTailor(message) {
  const lower = message.toLowerCase();
  return /(?:tailor|rewrite|customize|adjust|optimize)\s+(?:my\s+)?resume/i.test(message) ||
    /(?:resume\s+for|rewrite.*?for)\s+(\w[\w\s]{1,30})/i.test(message) ||
    /(?:make|get)\s+(?:my\s+)?resume\s+(?:match|fit|work for)/i.test(message) ||
    (lower.includes('resume') && (lower.includes('job description') || lower.includes('this job') || lower.includes('this role') || lower.includes('this position')));
}

function detectInterviewPrep(message) {
  return /(?:prep|prepare)\s+(?:me\s+)?(?:for\s+)?(?:an?\s+)?interview/i.test(message) ||
    /interview\s+(?:questions?|prep|tips|practice|at|for)/i.test(message) ||
    /(?:what will they ask|mock interview|behavioral questions)/i.test(message) ||
    /(?:interview at|interviewing at|interviewing with)\s+(\w[\w\s&.''-]{1,40})/i.test(message);
}

function detectLinkedInReview(message) {
  return /(?:review|check|optimize|improve|fix|look at)\s+(?:my\s+)?linkedin/i.test(message) ||
    /linkedin\s+(?:profile|review|tips|help|optimization)/i.test(message);
}

function detectSalaryNegotiation(message) {
  const lower = message.toLowerCase();
  return /(?:salary|negotiate|compensation|how much|what do they pay|pay range)/i.test(message) ||
    lower.includes('what should i ask') || lower.includes('what should i negotiate') ||
    lower.includes('salary data') || lower.includes('salary range');
}

function detectResumeBuilder(message) {
  const lower = message.toLowerCase();
  return /(?:help me )?build (?:a |my )?resume/i.test(message) ||
    /(?:don'?t|do not) have a resume/i.test(message) ||
    /(?:create|make|write) (?:a |my )?resume (?:from scratch|for me)/i.test(message) ||
    /no resume yet/i.test(message) ||
    lower.includes('build my resume') || lower.includes('build a resume') ||
    lower.includes('create my resume') || lower.includes('help me make a resume');
}

function detectCoverLetter(message) {
  return /(?:cover letter|application letter|write a letter)/i.test(message) ||
    /(?:write|draft|create)\s+(?:a\s+)?cover\s+letter/i.test(message);
}

function detectFollowUp(message) {
  const lower = message.toLowerCase();
  return /(?:follow.?up|followup)\s+(?:message|email|note|to|for|with)/i.test(message) ||
    /(?:draft|write|send)\s+(?:a\s+)?follow.?up/i.test(message) ||
    /haven'?t\s+heard\s+back/i.test(message) ||
    /no\s+(?:reply|response)\s+(?:yet|from)/i.test(message) ||
    lower.includes('follow up') || lower.includes('followup');
}

function detectReplyHelp(message) {
  const lower = message.toLowerCase();
  return /(?:they|he|she|alumni|contact)\s+(?:replied|responded|wrote back|got back)/i.test(message) ||
    /(?:help me|craft|write)\s+(?:a\s+)?(?:response|reply)/i.test(message) ||
    /(?:here'?s?\s+(?:what|their)\s+(?:they|reply|response)|paste[d]?\s+(?:their|the)\s+reply)/i.test(message) ||
    /(?:replied to my|responded to my)\s+(?:outreach|message|email)/i.test(message) ||
    /(?:got a reply|got a response|received a reply|received a response)\s+(?:from|back)/i.test(message) ||
    /(?:i got a reply|i received a reply)/i.test(message) ||
    lower.includes('they replied') || lower.includes('got a reply') || lower.includes('they responded') ||
    lower.includes('here\'s what they said') || lower.includes('here is what they said') ||
    lower.includes('they wrote back') || lower.includes('replied!');
}

function detectThankYouNote(message) {
  const lower = message.toLowerCase();
  return /(?:thank.?you|thanks)\s+(?:note|email|message|letter)/i.test(message) ||
    /(?:draft|write|send)\s+(?:a\s+)?thank.?you/i.test(message) ||
    /(?:after\s+(?:the|my)\s+interview)/i.test(message) && /(?:thank|follow)/i.test(message) ||
    lower.includes('thank you note') || lower.includes('thank-you note') || lower.includes('thank you email');
}

function detectOfferNegotiation(message) {
  const lower = message.toLowerCase();
  return /(?:got|received|have)\s+(?:an?\s+)?offer/i.test(message) ||
    /(?:offer\s+from|job\s+offer)/i.test(message) ||
    /(?:negotiate|negotiation)\s+(?:the|my|an?)\s+(?:offer|salary|comp)/i.test(message) ||
    /(?:evaluate|assess)\s+(?:the|my|an?)\s+offer/i.test(message);
}

function detectNetworkThankYou(message) {
  const lower = message.toLowerCase();
  return /(?:thank|message)\s+(?:everyone|all|my\s+network|my\s+contacts|everyone\s+who\s+helped)/i.test(message) ||
    /(?:draft\s+thank.?you\s+(?:to|for)\s+(?:everyone|all|my\s+network))/i.test(message) ||
    lower.includes('thank my network') || lower.includes('thank everyone who helped');
}

// ═══════════════════════════════════════════════════════════
//  DATA / CACHE HELPERS
// ═══════════════════════════════════════════════════════════

async function getCachedAlumni(base44, company) {
  try {
    const cached = await base44.entities.DiscoveredAlumni.filter({ company, school_code: 'UF' });
    if (cached?.length > 0) {
      const now = new Date();
      const valid = cached.filter(a => new Date(a.expires_at) > now);
      if (valid.length > 0) return valid;
      for (const a of cached) { try { await base44.asServiceRole.entities.DiscoveredAlumni.delete(a.id); } catch(e){} }
    }
  } catch(e) { console.log('Alumni cache error:', e.message); }
  return null;
}

async function saveAlumniCache(base44, alumni) {
  const exp = new Date(Date.now() + 24*60*60*1000).toISOString();
  for (const a of alumni) {
    try {
      await base44.asServiceRole.entities.DiscoveredAlumni.create({
        name: a.name, role_title: a.role_title, company: a.company, school_code: 'UF',
        match_score: a.match_score || 0, degree_info: a.degree_info || '',
        location: a.location || '', linkedin_url: a.linkedin_url || '', expires_at: exp,
      });
    } catch(e) {}
  }
}

async function getCachedCompanyIntel(base44, company) {
  try {
    const cached = await base44.entities.CompanyIntelCache.filter({ company_name: company });
    if (cached?.length > 0 && new Date(cached[0].expires_at) > new Date()) return cached[0];
    // Return expired cache as "previous" for delta comparison, then delete
    if (cached?.length > 0) {
      const expired = cached[0];
      try { await base44.entities.CompanyIntelCache.delete(expired.id); } catch(e){}
      return { ...expired, _expired: true };
    }
  } catch(e) {}
  return null;
}

// Build persistent memory context — compare new intel against previous data
function buildMemoryContext(previousIntel, newIntel, companyName) {
  if (!previousIntel) return '';
  const lines = [];
  const prevRoles = previousIntel.open_roles_count;
  const newRoles = newIntel.open_roles_count;
  if (prevRoles != null && newRoles != null && prevRoles !== newRoles) {
    const diff = newRoles - prevRoles;
    if (diff > 0) lines.push(`MEMORY: Last time you researched ${companyName}, they had ${prevRoles} open roles. Now they have ${newRoles} — hiring is RAMPING UP (+${diff} roles).`);
    else lines.push(`MEMORY: Last time you researched ${companyName}, they had ${prevRoles} open roles. Now it dropped to ${newRoles} — they may be slowing down hiring (${diff} roles).`);
  }
  const prevScore = previousIntel.hiring_score;
  const newScore = newIntel.hiring_score;
  if (prevScore != null && newScore != null && Math.abs(prevScore - newScore) >= 10) {
    if (newScore > prevScore) lines.push(`MEMORY: Their hiring score improved from ${prevScore} to ${newScore} since you last checked.`);
    else lines.push(`MEMORY: Their hiring score dropped from ${prevScore} to ${newScore} since you last checked.`);
  }
  const prevSignal = previousIntel.hiring_signal;
  const newSignal = newIntel.hiring_signal;
  if (prevSignal && newSignal && prevSignal !== newSignal) {
    lines.push(`MEMORY: Hiring signal changed from ${prevSignal.toUpperCase()} to ${newSignal.toUpperCase()}.`);
  }
  return lines.join('\n');
}

// Cross-reference alumni against CFF member database
async function crossReferenceCFF(base44, alumni) {
  if (!alumni || alumni.length === 0) return alumni;
  // Load CFF parent/alumni members
  let cffMembers = [];
  try {
    const [parents, users] = await Promise.all([
      base44.entities.ParentExpertise.filter({}, '-last_active_at', 200).catch(() => []),
      base44.asServiceRole.entities.User.list('-created_date', 200).catch(() => []),
    ]);
    // Build lookup by name (lowercase)
    const parentNames = new Map();
    (parents || []).forEach(p => {
      if (p.parent_name) parentNames.set(p.parent_name.toLowerCase().trim(), { email: p.parent_email, company: p.current_company, role: p.current_role });
    });
    const userNames = new Map();
    (users || []).forEach(u => {
      if (u.full_name) userNames.set(u.full_name.toLowerCase().trim(), { email: u.email, id: u.id });
    });
    cffMembers = { parentNames, userNames };
  } catch(e) {
    console.log('CFF cross-reference error:', e.message);
    return alumni.map(a => ({ ...a, is_cff_member: false, cff_channel: 'linkedin' }));
  }

  return alumni.map(a => {
    const nameKey = (a.name || '').toLowerCase().trim();
    const parentMatch = cffMembers.parentNames.get(nameKey);
    const userMatch = cffMembers.userNames.get(nameKey);
    if (parentMatch || userMatch) {
      return {
        ...a,
        is_cff_member: true,
        cff_email: parentMatch?.email || userMatch?.email || '',
        cff_user_id: userMatch?.id || '',
        cff_channel: 'cff_message',
      };
    }
    return { ...a, is_cff_member: false, cff_channel: 'linkedin' };
  });
}

async function saveCompanyIntelCache(base44, company, data) {
  try {
    await base44.asServiceRole.entities.CompanyIntelCache.create({
      company_name: company, school_code: 'UF',
      hiring_score: data.hiring_score || 0, hiring_signal: data.hiring_signal || 'cool',
      intel_summary: data.summary || '', open_roles_count: data.open_roles_count || 0,
      salary_range: data.salary_range || '', expires_at: new Date(Date.now() + 24*60*60*1000).toISOString(),
    });
  } catch(e) {}
}

async function trackActivity(base44, email, profileId, actionType, targetName) {
  try {
    await base44.entities.ProActivityLog.create({
      user_email: email, action_type: actionType,
      target_name: targetName || '', timestamp: new Date().toISOString(),
    });
  } catch(e) {}
  if (profileId) {
    const fieldMap = { company_search: 'companies_researched', alumni_view: 'alumni_discovered', message_draft: 'messages_drafted', roadmap_created: 'roadmaps_generated' };
    const field = fieldMap[actionType];
    if (field) {
      try {
        const ps = await base44.entities.FastTrackProProfile.filter({ id: profileId });
        if (ps?.[0]) await base44.entities.FastTrackProProfile.update(profileId, { [field]: (ps[0][field] || 0) + 1 });
      } catch(e) {}
    }
  }
}

async function saveToPipeline(base44, email, company, alumni) {
  try {
    const existing = await base44.entities.NetworkingPipeline.filter({ user_email: email, company });
    const names = new Set((existing||[]).map(e => e.alumni_name?.toLowerCase()));
    const now = new Date().toISOString();
    for (const a of alumni) {
      if (names.has(a.name?.toLowerCase())) continue;
      try {
        await base44.entities.NetworkingPipeline.create({
          user_email: email, company, alumni_name: a.name, alumni_role: a.role_title || '',
          alumni_source: 'fastiq', status: 'identified', status_date: now, identified_date: now,
        });
      } catch(e) {}
    }
  } catch(e) {}
}

function titleCase(str) {
  if (!str) return '';
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

// Generate contextual guidance after showing alumni results
// Returns { guidance, top_match, recommendation_reason }
async function generateAlumniGuidance(base44, alumni, company, profileContext) {
  try {
    const alumniSummary = alumni.slice(0, 5).map(a =>
      `- ${a.name}: ${a.role_title} (score: ${a.match_score}%, CFF: ${a.is_cff_member ? 'yes' : 'no'})`
    ).join('\n');
    const cffCount = alumni.filter(a => a.is_cff_member).length;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are FASTIQ. You just found these UF alumni at ${company} for a student. Write a SHORT personalized analysis (3-5 sentences) about WHO to reach out to first and WHY.

${profileContext}

ALUMNI FOUND:
${alumniSummary}
CFF Members: ${cffCount}

INSTRUCTIONS:
1. Note the pattern in roles (e.g. "These are mostly senior engineering roles" or "Good mix of levels")
2. Recommend ONE specific person to reach out to FIRST, using their FIRST NAME only. Explain why (e.g. seniority for referrals, CFF member for easy contact, similar background, their role bridges the student's major with the company)
3. If there are CFF members, highlight that they can be messaged directly on the platform
4. End with a specific prompt like "Want me to draft that message?" or "Want me to draft a warm intro to [first name]?"
5. CRITICAL: In recommended_full_name, return the FULL NAME (exactly as it appears in the alumni list) of the person you recommend. In recommendation_reason, explain the SPECIFIC strategic reason — e.g. "As a Marketing student, Jessica's role as Hardware Engineering Manager gives you a unique angle to ask how marketing and engineering teams collaborate at Apple."

Be warm, strategic, and direct. Use first names only in the guidance text. Max 4 sentences.`,
      response_json_schema: {
        type: "object",
        properties: {
          guidance: { type: "string" },
          recommended_full_name: { type: "string", description: "The EXACT full name of the recommended person from the alumni list" },
          recommendation_reason: { type: "string", description: "The specific strategic reason for recommending this person, referencing the student's background and the alumni's role" }
        },
        required: ["guidance", "recommended_full_name", "recommendation_reason"]
      }
    });

    const topMatch = result.recommended_full_name || '';
    const reason = result.recommendation_reason || '';

    // Validate recommended name exists in alumni list
    let validatedTopMatch = topMatch;
    if (topMatch) {
      const found = alumni.find(a => a.name?.toLowerCase() === topMatch.toLowerCase());
      if (!found) {
        // Fuzzy match: check if first name matches
        const firstName = topMatch.split(' ')[0].toLowerCase();
        const fuzzy = alumni.find(a => a.name?.toLowerCase().startsWith(firstName));
        validatedTopMatch = fuzzy ? fuzzy.name : '';
      }
    }

    // Fallback to highest match_score if no valid recommendation
    if (!validatedTopMatch && alumni.length > 0) {
      const sorted = [...alumni].sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
      validatedTopMatch = sorted[0].name;
    }

    return {
      guidance: result.guidance || `Here are UF alumni I found at ${company}:`,
      top_match: validatedTopMatch,
      recommendation_reason: reason
    };
  } catch (e) {
    console.log('Alumni guidance generation error:', e.message);
    const cffCount = alumni.filter(a => a.is_cff_member).length;
    const cffNote = cffCount > 0 ? ` ${cffCount} of them ${cffCount === 1 ? 'is a' : 'are'} CFF member${cffCount === 1 ? '' : 's'} — you can message them directly on CFF!` : '';
    // Fallback top_match to highest score
    const fallbackTop = alumni.length > 0 ? [...alumni].sort((a, b) => (b.match_score || 0) - (a.match_score || 0))[0].name : '';
    return {
      guidance: `Here are UF alumni I found at ${company}:` + cffNote,
      top_match: fallbackTop,
      recommendation_reason: ''
    };
  }
}

const UF_FILTER = `CRITICAL: Only include people who attended the University of Florida (UF) in Gainesville. Do NOT include alumni from FIU, FSU, UCF, USF, or any other school.`;
const NON_UF_SCHOOLS = ['fiu','florida international','fsu','florida state','ucf','central florida','usf','south florida','famu','fgcu'];

function filterAndDedupAlumni(rawAlumni, fallbackCompany) {
  const processed = rawAlumni.map(a => ({ ...a, company: a.company || fallbackCompany }));
  const filtered = processed.filter(a => {
    const deg = (a.degree_info || '').toLowerCase();
    if (NON_UF_SCHOOLS.some(s => deg.includes(s))) return false;
    if (!a.match_score || a.match_score < 50) {
      // Enforce minimum 50 for alumni at the searched company
      a.match_score = Math.max(a.match_score || 50, 50);
    }
    return true;
  });
  const seen = new Set();
  return filtered.filter(a => {
    const key = `${(a.name||'').toLowerCase()}_${(a.role_title||'').toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ═══════════════════════════════════════════════════════════
//  CONTEXT-AWARE INTENT CLASSIFICATION (LLM fallback)
// ═══════════════════════════════════════════════════════════

async function classifyIntentWithContext(base44, message, recentMessages, profileContext) {
  // Build conversation snippet for LLM
  const convoSnippet = recentMessages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content?.substring(0, 300)}`).join('\n');

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `You are an intent classifier for FASTIQ, a career AI for UF students.

${profileContext}

RECENT CONVERSATION:
${convoSnippet}
User: ${message}

Given this conversation context, classify the user's CURRENT message intent.

CRITICAL RULES:
- If the assistant just asked a clarifying question (like "Which company?", "What company?", "Tell me about which company?") and the user responded with a company name or short answer, treat the user's message as the ANSWER to that question, NOT a new standalone query.
- Map the answer back to the ORIGINAL intent. For example:
  - If assistant asked "Which company do you want me to scan for UF alumni?" and user says "Disney" → intent is "alumni_discovery" with company "Disney"
  - If assistant asked "Which company should I research?" and user says "Google" → intent is "company_intel" with company "Google"  
  - If assistant asked "Who should I draft a message to?" and user says "John Smith" → intent is "outreach_draft" with target "John Smith"
  - If assistant suggested "Want me to find UF alumni there?" and user says "yes" or "sure" → intent is "alumni_discovery" with company from previous context
- If the message is a standalone request, classify normally.

Possible intents: alumni_discovery, company_intel, outreach_draft, roadmap, resume_review, resume_match, resume_tailor, interview_prep, linkedin_review, salary_negotiation, cover_letter, opportunity_discovery, career_advice

Return the intent and any extracted entity (company name, person name, etc).`,
    response_json_schema: {
      type: "object",
      properties: {
        intent: { type: "string", enum: ["alumni_discovery", "company_intel", "outreach_draft", "roadmap", "resume_review", "resume_match", "resume_tailor", "interview_prep", "linkedin_review", "salary_negotiation", "cover_letter", "opportunity_discovery", "career_advice"] },
        company: { type: "string", description: "Company name if relevant, empty string if not" },
        person: { type: "string", description: "Person name if relevant (for outreach), empty string if not" },
        confidence: { type: "string", enum: ["high", "medium", "low"] },
        reasoning: { type: "string", description: "Brief explanation of classification" }
      },
      required: ["intent", "company", "confidence"]
    }
  });

  return result;
}

// Check if the assistant's last message was a clarifying question
function isAssistantAskingClarification(lastAssistantContent) {
  if (!lastAssistantContent) return false;
  const lower = lastAssistantContent.toLowerCase();
  const patterns = [
    /which company/i, /what company/i, /tell me (?:about )?which/i,
    /which (?:one|firm|employer|organization)/i,
    /want me to (?:scan|research|look into|check)/i,
    /should i (?:scan|research|look into|check)/i,
    /who should i (?:draft|write|compose)/i,
    /who do you want me to/i,
    /what (?:role|position|job)/i,
    /\?\s*$/  // ends with a question mark
  ];
  return patterns.some(p => p.test(lower));
}

// Check if user message is a short answer (likely replying to a question)
function isShortAnswer(message) {
  const words = message.trim().split(/\s+/);
  // Short answers: 1-4 words, or "yes/sure/yeah" affirmatives
  if (words.length <= 4) return true;
  if (/^(?:yes|yeah|yep|sure|ok|okay|please|definitely|absolutely|do it|go ahead|sounds good)/i.test(message.trim())) return true;
  return false;
}

// ═══════════════════════════════════════════════════════════
//  FOLLOW-UP DRAFT HANDLER
// ═══════════════════════════════════════════════════════════

async function handleFollowUpDraft(base44, user, profile, resolvedMessage, pipelineData, staleOutreach, profileContext) {
  console.log('Intent: follow_up_draft');
  const followUpNameMatch = resolvedMessage.match(/follow.?up\s+(?:message\s+)?(?:to|with|for)\s+(\w[\w\s.''-]{1,40}?)(?:\s+at\s+(\w[\w\s&.''-]{1,40}))?/i);
  let targetName = followUpNameMatch?.[1]?.trim() || '';
  let targetCompanyName = followUpNameMatch?.[2]?.trim() || '';

  let pipelineRecord = null;
  if (targetName && pipelineData.length > 0) {
    pipelineRecord = pipelineData.find(p => p.status === 'reached_out' && (p.alumni_name?.toLowerCase().includes(targetName.toLowerCase()) || targetName.toLowerCase().includes(p.alumni_name?.toLowerCase().split(' ')[0] || '')));
    if (!pipelineRecord) pipelineRecord = pipelineData.find(p => p.alumni_name?.toLowerCase().includes(targetName.toLowerCase()) || targetName.toLowerCase().includes(p.alumni_name?.toLowerCase().split(' ')[0] || ''));
  }
  if (!pipelineRecord && staleOutreach.length > 0) pipelineRecord = staleOutreach[0];

  targetName = pipelineRecord?.alumni_name || targetName || 'the contact';
  targetCompanyName = pipelineRecord?.company || targetCompanyName || '';
  const daysSince = pipelineRecord?.reached_out_date ? Math.round((Date.now() - new Date(pipelineRecord.reached_out_date).getTime()) / (1000*60*60*24)) : 5;
  const followUpCount = pipelineRecord?.follow_up_count || 0;

  // SECOND FOLLOW-UP: 14+ days total and already sent 1 follow-up → suggest alternatives, no 3rd message
  if (followUpCount >= 1 && daysSince >= 14) {
    console.log('Second follow-up limit reached for', targetName);
    const otherTargets = (profile.target_companies || []).filter(c => c.toLowerCase() !== targetCompanyName.toLowerCase());
    if (pipelineRecord?.id) {
      base44.entities.NetworkingPipeline.update(pipelineRecord.id, { status: 'no_response', status_date: new Date().toISOString(), notes: (pipelineRecord.notes || '') + `\nMarked no_response after 2 attempts on ${new Date().toLocaleDateString()}` }).catch(() => {});
    }
    return Response.json({
      success: true,
      response: `**${targetName}** hasn't replied after your follow-up. That happens — it doesn't mean they're not interested. I'd suggest:\n\n→ **Try connecting on LinkedIn** with a brief note instead\n→ **Look for other UF alumni at ${targetCompanyName}** — sometimes a different contact works better\n→ **Move on to other targets** — you have ${otherTargets.length > 0 ? otherTargets.length + ' other companies' : 'other companies'} to pursue\n\nTwo outreach attempts is the professional limit. I've moved ${targetName} to "no response" in your pipeline.`,
      message_type: 'career_advice',
      payload: { suggested_actions: [`Find other UF alumni at ${targetCompanyName}`, otherTargets.length > 0 ? `Research ${otherTargets[0]} for me` : 'Help me find new companies to target', 'Show my networking pipeline'] }
    });
  }
  // Already sent 1 follow-up but not 14 days yet
  if (followUpCount >= 1) {
    return Response.json({
      success: true,
      response: `You already sent a follow-up to **${targetName}** at ${targetCompanyName}. Wait about 7 more days — if they still haven't responded, I'll suggest alternative strategies.`,
      message_type: 'career_advice',
      payload: { suggested_actions: [`Find other UF alumni at ${targetCompanyName}`, 'Research my #1 target company'] }
    });
  }

  // Load original outreach for context
  let originalMessage = '';
  if (pipelineRecord?.outreach_message_id) {
    try { const c = await base44.entities.ProAgentConversation.filter({ id: pipelineRecord.outreach_message_id }); if (c?.[0]?.content) originalMessage = c[0].content.substring(0, 500); } catch(e) {}
  }

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `You are FASTIQ. Draft a follow-up message for this student.

${profileContext}

CONTEXT:
- Original outreach was sent to ${targetName}, ${pipelineRecord?.alumni_role || ''} at ${targetCompanyName} approximately ${daysSince} days ago
- No reply received yet
- Student's name: ${user.full_name || 'Gator Student'}
- Student's major: ${user.major || 'undeclared'}
${originalMessage ? `\nORIGINAL MESSAGE:\n${originalMessage}` : ''}

RULES:
1. Keep it SHORT — 3-4 sentences max
2. Reference the original message: "I reached out last week about..."
3. Add a new hook — mention something current about the company or a different angle
4. One clear, low-pressure ask: "If you have 15 minutes, I'd love to hear about your experience at ${targetCompanyName}"
5. Do NOT sound desperate, passive-aggressive, or robotic
6. Do NOT say "I'm sure you're busy" or "I know you're busy" — it's presumptuous
7. Tone: warm, confident, brief
8. Sign off with first name only (not full signature again)`,
    add_context_from_internet: true,
    response_json_schema: { type: "object", properties: { response: { type: "string" }, recipient: { type: "string" }, channel: { type: "string" }, subject: { type: "string" }, message_body: { type: "string" } }, required: ["response", "recipient", "message_body"] }
  });

  // Update pipeline
  if (pipelineRecord?.id) {
    const now = new Date().toISOString();
    base44.entities.NetworkingPipeline.update(pipelineRecord.id, { follow_up_date: now, follow_up_count: followUpCount + 1, status_date: now, notes: (pipelineRecord.notes || '') + `\nFollow-up sent ${new Date().toLocaleDateString()}` }).catch(() => {});
  }

  trackActivity(base44, user.email, profile.id, 'message_draft', targetName);
  return Response.json({
    success: true, response: result.response || `Here's your follow-up to ${targetName}:`,
    message_type: 'outreach_draft',
    payload: { recipient: result.recipient || targetName, recipient_title: pipelineRecord?.alumni_role || '', recipient_company: targetCompanyName, channel: result.channel || 'LinkedIn', subject: result.subject || '', message: result.message_body || '', ask_type: 'follow_up' }
  });
}

// ═══════════════════════════════════════════════════════════
//  REPLY HELP HANDLER
// ═══════════════════════════════════════════════════════════

async function handleReplyHelp(base44, user, profile, resolvedMessage, pipelineData, profileContext) {
  console.log('Intent: reply_help');
  let contactName = '', contactCompany = '', pipelineRecord = null;
  const nameMatch = resolvedMessage.match(/(?:from|to|with)\s+(\w[\w\s.''-]+?)(?:\s+at\s+(\w[\w\s&.''-]{1,40}))?(?:\s*[!.:,]|\s+(?:here|she|he|they|said|replied))/i);
  if (nameMatch) { contactName = nameMatch[1]?.trim() || ''; contactCompany = nameMatch[2]?.trim() || ''; }
  if (contactName && pipelineData.length > 0) {
    pipelineRecord = pipelineData.find(p => (p.status === 'replied' || p.status === 'reached_out') && (p.alumni_name?.toLowerCase().includes(contactName.toLowerCase()) || contactName.toLowerCase().includes(p.alumni_name?.toLowerCase().split(' ')[0] || '')));
  }
  if (!pipelineRecord) pipelineRecord = pipelineData.find(p => p.status === 'replied') || pipelineData.find(p => p.status === 'reached_out');
  contactName = pipelineRecord?.alumni_name || contactName || 'the contact';
  contactCompany = pipelineRecord?.company || contactCompany || '';

  // Strip the trigger phrase to get the actual reply content
  const replyContent = resolvedMessage
    .replace(/^.*?(?:here'?s?\s+what\s+(?:they|she|he)\s+said:?|what\s+(?:they|she|he)\s+said:?|their\s+reply:?|the\s+reply:?)/i, '')
    .replace(/^.*?(?:got a reply from\s+[\w\s.''-]+?(?:at\s+[\w\s&.''-]+?)?[!.:]\s*)/i, '')
    .replace(/^.*?(?:they\s+(?:replied|responded|wrote\s+back|said):?\s*)/i, '')
    .replace(/^.*?(?:replied!\s*)/i, '')
    .trim();
  const isJustTrigger = replyContent.length < 30 && !/[.!?,;:]/.test(replyContent.slice(10));
  if (isJustTrigger) {
    if (pipelineRecord?.id && pipelineRecord.status !== 'replied') base44.entities.NetworkingPipeline.update(pipelineRecord.id, { status: 'replied', replied_date: new Date().toISOString(), status_date: new Date().toISOString() }).catch(() => {});
    return Response.json({ success: true, response: `That's great news! 🎉 Paste **${contactName}**'s reply below and I'll analyze it and draft your perfect response.`, message_type: 'text', payload: {} });
  }

  let originalMessage = '';
  if (pipelineRecord?.outreach_message_id) { try { const c = await base44.entities.ProAgentConversation.filter({ id: pipelineRecord.outreach_message_id }); if (c?.[0]?.content) originalMessage = c[0].content.substring(0, 500); } catch(e) {} }

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `You are FASTIQ. A student received a reply from an alumni contact. Analyze it and draft the perfect response.\n\n${profileContext}\n\nCONTACT: ${contactName}${pipelineRecord?.alumni_role ? ', ' + pipelineRecord.alumni_role : ''} at ${contactCompany}\n${originalMessage ? 'ORIGINAL OUTREACH:\n' + originalMessage + '\n' : ''}THEIR REPLY:\n"${replyContent}"\n\nCLASSIFY into exactly ONE type:\nA) positive — meeting/call offered → suggest 2-3 time slots, offer coffee/phone/video, reiterate one topic\nB) warm — vague openness → propose specific day/time, make it easy to say yes\nC) referral — suggested another person → draft thank-you to original + message to referred person mentioning the referral\nD) advice — answered question but no meeting → thank specifically, mention what you'll act on, ask one follow-up\nE) declined — too busy/can't help → thank graciously, leave door open\n\nRULES: Under 100 words per draft. Be specific. Student: ${user.full_name || 'Gator Student'}, ${user.major || 'undeclared'} at UF, class of ${user.graduation_year || 'upcoming'}. No clichés.`,
    response_json_schema: { type: "object", properties: { analysis: { type: "string" }, reply_classification: { type: "string", enum: ["positive","warm","referral","advice","declined"] }, reply_draft: { type: "string" }, reply_subject: { type: "string" }, referred_person_name: { type: "string" }, referral_draft: { type: "string" }, referral_subject: { type: "string" }, suggested_actions: { type: "array", items: { type: "string" } }, prep_offer: { type: "string" } }, required: ["analysis","reply_classification","reply_draft","suggested_actions"] }
  });

  if (pipelineRecord?.id) {
    const updates = { status: 'replied', replied_date: new Date().toISOString(), status_date: new Date().toISOString(), notes: (pipelineRecord.notes || '') + `\nReplied (${result.reply_classification}) on ${new Date().toLocaleDateString()}` };
    if (result.reply_classification === 'positive') { updates.status = 'interview'; updates.interview_date = new Date().toISOString(); }
    base44.entities.NetworkingPipeline.update(pipelineRecord.id, updates).catch(() => {});
  }
  if (result.reply_classification === 'referral' && result.referred_person_name) {
    base44.entities.NetworkingPipeline.create({ user_email: user.email, company: contactCompany, alumni_name: result.referred_person_name, alumni_source: 'fastiq', status: 'identified', status_date: new Date().toISOString(), identified_date: new Date().toISOString(), notes: `Referred by ${contactName} on ${new Date().toLocaleDateString()}` }).catch(() => {});
  }
  trackActivity(base44, user.email, profile.id, 'message_draft', contactName);

  const labels = { positive: `**${contactName}** wants to connect! Here's a response that locks in the meeting:`, warm: `Good sign — **${contactName}** is open! The key is turning this into a specific time:`, referral: `Even better — a warm referral from **${contactName}**!`, advice: `**${contactName}** gave you great insight! Here's a response that keeps the door open:`, declined: `That's okay — not every door opens on the first try:` };
  let responseText = (result.analysis || '') + '\n\n' + (labels[result.reply_classification] || '');
  if (result.reply_classification === 'positive' && result.prep_offer) responseText += '\n\n' + result.prep_offer;
  if (result.reply_classification === 'declined') responseText += `\n\nWant me to find other UF alumni at ${contactCompany}? Or try a different company?`;

  return Response.json({ success: true, response: responseText, message_type: 'reply_response', payload: { reply_classification: result.reply_classification, reply_draft: result.reply_draft || '', reply_subject: result.reply_subject || '', referred_person_name: result.referred_person_name || '', referral_draft: result.referral_draft || '', referral_subject: result.referral_subject || '', suggested_actions: result.suggested_actions || [], contact_name: contactName, contact_company: contactCompany } });
}

// ═══════════════════════════════════════════════════════════
//  MAIN HANDLER
// ═══════════════════════════════════════════════════════════

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const message = body.message;
    const conversation_history = body.conversation_history || '';
    if (!message) return Response.json({ error: 'Message is required' }, { status: 400 });

    // Load recent conversation messages from DB for context tracking
    let recentDbMessages = [];
    try {
      const dbMessages = await base44.entities.ProAgentConversation.filter(
        { user_email: user.email }, '-created_date', 6
      );
      // Reverse to chronological order (oldest first)
      recentDbMessages = (dbMessages || []).reverse();
    } catch(e) { console.log('Could not load conversation history:', e.message); }

    // Load profile
    let profile = {};
    try {
      const profiles = await base44.entities.FastTrackProProfile.filter({ user_email: user.email });
      profile = profiles?.[0] || {};
    } catch(e) {}

    // Load pipeline for memory context
    let pipelineData = [];
    try {
      pipelineData = await base44.entities.NetworkingPipeline.filter({ user_email: user.email }, '-status_date', 50).catch(() => []);
    } catch(e) {}

    const pipelineSummary = pipelineData.length > 0
      ? `\n- Pipeline: ${pipelineData.length} contacts (${pipelineData.filter(p => p.status === 'identified').length} identified, ${pipelineData.filter(p => p.status === 'reached_out').length} reached out, ${pipelineData.filter(p => p.status === 'replied').length} replied)`
      : '';
    const staleOutreach = pipelineData.filter(p => {
      if (p.status !== 'reached_out' || !p.reached_out_date) return false;
      return (Date.now() - new Date(p.reached_out_date).getTime()) > 3 * 24 * 60 * 60 * 1000;
    });
    const staleSummary = staleOutreach.length > 0
      ? `\n- Stale outreach: ${staleOutreach.map(s => `${s.alumni_name} at ${s.company} (sent ${Math.round((Date.now() - new Date(s.reached_out_date).getTime()) / (1000*60*60*24))} days ago)`).join('; ')}`
      : '';

    const profileContext = `STUDENT PROFILE:
- Name: ${user.full_name || 'Gator Student'}
- Major: ${user.major || 'undeclared'}
- Graduation: ${user.graduation_year || 'unknown'}
- Target Industry: ${profile.target_industry || 'not specified'}
- Target Companies: ${(profile.target_companies || []).join(', ') || 'none set'}
- Company Size: ${profile.company_size_preference || 'not set'}
- Location: ${profile.location_preference || 'not set'}
- Timeline: ${profile.career_timeline || 'not set'}
- Stage: ${profile.current_stage || 'not set'}
- Challenge: ${profile.biggest_challenge || 'not set'}
- Stats: ${profile.alumni_discovered || 0} alumni found, ${profile.messages_drafted || 0} messages drafted, ${profile.companies_researched || 0} companies researched${pipelineSummary}${staleSummary}`;

    // Detect explicit confirmation responses like "Yes, research X" → bypass Layer 2
    const confirmationMatch = message.match(/^(?:yes|yeah|yep|sure|ok|okay|correct|right|go ahead)[,.]?\s*(?:research|look into|check|find|scan)\s+(.+)/i);
    const isConfirmation = confirmationMatch || /^(?:yes|yeah|yep|sure|ok|okay|correct|right|go ahead|do it|please)[.!,]?\s*$/i.test(message.trim());
    if (isConfirmation) {
      console.log('[Layer2 Bypass] User confirmed — skipping confirmation gate this turn');
    }

    // Resolve target company references (#1 target, my dream company, etc.)
    let resolvedMessage = message;
    const targetCompanies = profile.target_companies || [];
    if (targetCompanies.length > 0) {
      const lower = message.toLowerCase();
      let idx = -1;
      if (/#1\s*target/i.test(lower) || /\b(?:first|top|primary|main|dream|#1)\s+(?:target\s+)?company/i.test(lower) || /my\s+(?:target\s+)?company/i.test(lower)) idx = 0;
      else if (/#2\s*target/i.test(lower) || /\b(?:second|#2)\s+(?:target\s+)?company/i.test(lower)) idx = 1;
      else if (/#3\s*target/i.test(lower) || /\b(?:third|#3)\s+(?:target\s+)?company/i.test(lower)) idx = 2;
      else if (/#4\s*target/i.test(lower) || /\b(?:fourth|#4)\s+(?:target\s+)?company/i.test(lower)) idx = 3;
      else if (/#5\s*target/i.test(lower) || /\b(?:fifth|#5)\s+(?:target\s+)?company/i.test(lower)) idx = 4;
      if (idx >= 0 && idx < targetCompanies.length) {
        resolvedMessage = `Research ${targetCompanies[idx]} hiring`;
        console.log(`Resolved target #${idx+1} → ${targetCompanies[idx]}`);
      }
    }

    // ═══════════════════════════════════════════════════════
    //  CONVERSATION CONTEXT RESOLUTION
    //  If the user's message is a short answer to a clarifying question,
    //  use LLM to classify the REAL intent from conversation context
    // ═══════════════════════════════════════════════════════

    let contextOverrideIntent = null;
    let contextOverrideCompany = null;
    let contextOverridePerson = null;

    if (recentDbMessages.length >= 2 && isShortAnswer(message)) {
      // Find the last assistant message
      const lastAssistantMsg = [...recentDbMessages].reverse().find(m => m.role === 'assistant');
      if (lastAssistantMsg && isAssistantAskingClarification(lastAssistantMsg.content)) {
        console.log('Context: Detected short answer to clarifying question. Running LLM intent classification...');
        try {
          const classification = await classifyIntentWithContext(base44, message, recentDbMessages.slice(-4), profileContext);
          console.log('Context classification:', JSON.stringify(classification));
          if (classification && classification.confidence !== 'low') {
            contextOverrideIntent = classification.intent;
            contextOverrideCompany = classification.company || null;
            contextOverridePerson = classification.person || null;
            // Rewrite resolvedMessage to make regex-based detectors work
            if (contextOverrideCompany && contextOverrideIntent === 'alumni_discovery') {
              resolvedMessage = `Find UF alumni at ${contextOverrideCompany}`;
              console.log(`Context override: alumni_discovery → "${resolvedMessage}"`);
            } else if (contextOverrideCompany && contextOverrideIntent === 'company_intel') {
              resolvedMessage = `Research ${contextOverrideCompany} hiring`;
              console.log(`Context override: company_intel → "${resolvedMessage}"`);
            } else if (contextOverridePerson && contextOverrideIntent === 'outreach_draft') {
              resolvedMessage = `Draft a message to ${contextOverridePerson}`;
              console.log(`Context override: outreach_draft → "${resolvedMessage}"`);
            } else if (contextOverrideIntent === 'interview_prep' && contextOverrideCompany) {
              resolvedMessage = `Prepare me for an interview at ${contextOverrideCompany}`;
              console.log(`Context override: interview_prep → "${resolvedMessage}"`);
            } else if (contextOverrideIntent === 'roadmap') {
              resolvedMessage = `Create a career roadmap for me`;
            } else if (contextOverrideIntent === 'opportunity_discovery') {
              resolvedMessage = `Find companies hiring in my field`;
            }
          }
        } catch(e) {
          console.log('Context classification failed (continuing with regex):', e.message);
        }
      }
    }

    // ═══════════════════════════════════════════════════════
    //  INTENT ROUTING (order matters!)
    // ═══════════════════════════════════════════════════════

    // 0. RESUME BUILDER
    if (detectResumeBuilder(resolvedMessage)) {
      console.log('Intent: resume_builder');
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FASTIQ, a supportive AI career center for UF students. A student wants help building their resume from scratch. Many students feel embarrassed about not having one — your job is to be encouraging and make them feel confident.

${profileContext}

Start the conversational resume builder. Walk them through Step 1: Contact Info.

Your response should:
1. Be warm and encouraging — "No problem! Lots of students don't have a resume yet."
2. Normalize it — "Campus jobs totally count. Class projects are great. You'd be surprised how much you've already done that employers value."
3. Ask for: Full name, best email, phone number, and LinkedIn URL (if they have one)
4. Keep it conversational, not like a form
5. End with: "Once I have these basics, we'll move to your education — and your UF degree is already a huge asset!"

Be genuinely encouraging and warm. This student might feel behind — make them feel like they're about to create something great.`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            suggested_actions: { type: "array", items: { type: "string" } }
          },
          required: ["response"]
        }
      });
      return Response.json({
        success: true,
        response: result.response || "Let's build your resume! No problem at all — I'll walk you through it step by step. Let's start with the basics: what's your full name, email, and phone number?",
        message_type: 'career_advice',
        payload: { suggested_actions: result.suggested_actions || ['Type your name, email, and phone number', 'Include LinkedIn URL if you have one'] }
      });
    }

    // 1. RESUME REVIEW
    if (detectResumeReview(resolvedMessage)) {
      console.log('Intent: resume_review');
      const resumeText = profile.resume_text || '';
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FASTIQ, an elite AI career center for UF students.\n\n${profileContext}\n\nReview this student's resume and provide a detailed analysis.\n\n${resumeText ? `RESUME TEXT:\n${resumeText}\n\n` : 'The student has not uploaded a resume yet. Provide general resume advice based on their profile, and encourage them to paste their resume text.\n\n'}Analyze: formatting, action verbs, quantified achievements, missing sections, length, keyword density for ${profile.target_industry || 'their target industry'} roles. Be specific and actionable.`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            overall_score: { type: "integer", description: "0-100" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            missing_keywords: { type: "array", items: { type: "string" } },
            summary: { type: "string" }
          },
          required: ["response", "overall_score", "strengths", "improvements", "summary"]
        }
      });
      return Response.json({
        success: true, response: result.response || "Here's your resume review:",
        message_type: 'resume_review',
        payload: { overall_score: result.overall_score, strengths: result.strengths, improvements: result.improvements, missing_keywords: result.missing_keywords || [], summary: result.summary }
      });
    }

    // 2. RESUME MATCH
    if (detectResumeMatch(resolvedMessage)) {
      console.log('Intent: resume_match');
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FASTIQ. Compare this student's resume against a job description.\n\n${profileContext}\n\n${profile.resume_text ? `RESUME:\n${profile.resume_text}\n\n` : ''}Student's request: "${resolvedMessage}"\n\nAnalyze how well the resume matches the role. Be specific about matching skills, missing skills, and exact changes needed.`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            match_score: { type: "integer" },
            matching_skills: { type: "array", items: { type: "string" } },
            missing_skills: { type: "array", items: { type: "string" } },
            suggested_changes: { type: "array", items: { type: "object", properties: { section: { type: "string" }, change: { type: "string" } }, required: ["section","change"] } },
            summary: { type: "string" }
          },
          required: ["response", "match_score", "matching_skills", "missing_skills", "summary"]
        }
      });
      return Response.json({
        success: true, response: result.response || "Here's how your resume matches:",
        message_type: 'resume_match', payload: result
      });
    }

    // 3. RESUME TAILOR
    if (detectResumeTailor(resolvedMessage)) {
      console.log('Intent: resume_tailor');
      const resumeText = profile.resume_text || '';

      if (!resumeText) {
        return Response.json({
          success: true,
          response: "I need your master resume first before I can tailor it. Want to **upload one** or **build one together**?",
          message_type: 'career_advice',
          payload: { suggested_actions: ['Upload my resume', 'Help me build a resume'] }
        });
      }

      // Extract job description from the message (anything after common delimiters or long text)
      const jdMatch = resolvedMessage.match(/(?:job description|jd|posting|here'?s?\s+the\s+(?:job|role|posting)):?\s*([\s\S]{50,})/i);
      const jobDescription = jdMatch ? jdMatch[1].trim() : '';

      if (!jobDescription && resolvedMessage.length < 200) {
        return Response.json({
          success: true,
          response: "I'd love to tailor your resume! Paste the **job description** here — or if you saw a role through FASTIQ, just tell me which company and position.",
          message_type: 'text',
          payload: {}
        });
      }

      // The message itself may contain the JD if long enough
      const jdText = jobDescription || resolvedMessage;

      // Extract company/role from message
      const roleMatch = resolvedMessage.match(/(?:for|at)\s+(?:the\s+)?(\w[\w\s&.''-]{1,40}?)(?:\s+(?:role|position|job|at)\s+(\w[\w\s&.''-]{1,40}))?/i);
      const extractedRole = roleMatch?.[1]?.trim() || '';
      const extractedCompany = roleMatch?.[2]?.trim() || '';

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert resume writer and ATS optimization specialist. Rewrite this student's resume to maximize their chances for the specific job described below.

STUDENT PROFILE:
- Name: ${user.full_name || 'Gator Student'}
- Major: ${user.major || 'undeclared'}, University of Florida, Class of ${user.graduation_year || 'upcoming'}
- Target industry: ${profile.target_industry || 'not specified'}

MASTER RESUME:
${resumeText}

JOB DESCRIPTION:
${jdText}

INSTRUCTIONS:
1. Rewrite the professional summary to directly address this role's core requirements
2. Reorder experience to put the most relevant items first
3. Rewrite bullet points to emphasize skills and achievements that match the job description
4. Incorporate exact keywords from the job description naturally throughout (critical for ATS scanning)
5. Quantify achievements wherever possible — use realistic metrics if the original is vague
6. Create a tailored Skills section highlighting skills mentioned in the job description
7. Feature relevant projects or coursework prominently if applicable
8. De-emphasize irrelevant experience (keep it but reduce space)
9. Keep to one page
10. Do NOT fabricate experience or skills the student doesn't have — only reframe what exists

Return as JSON with these exact fields:`,
        response_json_schema: {
          type: "object",
          properties: {
            resume: {
              type: "object",
              properties: {
                contact: { type: "object", properties: { name: { type: "string" }, email: { type: "string" }, phone: { type: "string" }, linkedin: { type: "string" }, location: { type: "string" } } },
                summary: { type: "string" },
                education: { type: "array", items: { type: "object", properties: { school: { type: "string" }, degree: { type: "string" }, graduation_date: { type: "string" }, gpa: { type: "string" }, relevant_coursework: { type: "string" } } } },
                experience: { type: "array", items: { type: "object", properties: { company: { type: "string" }, title: { type: "string" }, dates: { type: "string" }, bullets: { type: "array", items: { type: "string" } } } } },
                skills: { type: "object", properties: { technical: { type: "array", items: { type: "string" } }, tools: { type: "array", items: { type: "string" } }, soft: { type: "array", items: { type: "string" } } } },
                projects: { type: "array", items: { type: "object", properties: { name: { type: "string" }, bullets: { type: "array", items: { type: "string" } } } } },
                certifications: { type: "array", items: { type: "string" } }
              }
            },
            keywords_matched: { type: "array", items: { type: "string" }, description: "Keywords from JD found in resume" },
            keywords_added: { type: "array", items: { type: "string" }, description: "Keywords woven into the rewrite" },
            keywords_missing: { type: "array", items: { type: "string" }, description: "Keywords from JD NOT in resume because student lacks the skill — include a brief explanation for each" },
            ats_score: { type: "integer", description: "Estimated ATS match percentage 0-100" },
            changes_summary: { type: "string", description: "2-3 sentences explaining what was changed and why" },
            changes: { type: "array", items: { type: "object", properties: { section: { type: "string" }, before: { type: "string" }, after: { type: "string" }, keywords_added: { type: "array", items: { type: "string" } } } } },
            company_name: { type: "string" },
            role_title: { type: "string" }
          },
          required: ["resume", "keywords_matched", "keywords_added", "keywords_missing", "ats_score", "changes_summary", "company_name", "role_title"]
        }
      });

      const companyName = result.company_name || extractedCompany || 'Unknown Company';
      const roleTitle = result.role_title || extractedRole || 'Target Role';

      // Save to TailoredResume entity
      try {
        await base44.entities.TailoredResume.create({
          user_email: user.email,
          company_name: companyName,
          role_title: roleTitle,
          job_description_text: jdText.substring(0, 5000),
          tailored_resume_json: JSON.stringify(result.resume || {}),
          ats_score: result.ats_score || 0,
          keywords_matched: (result.keywords_matched?.length || 0) + (result.keywords_added?.length || 0),
          keywords_total: (result.keywords_matched?.length || 0) + (result.keywords_added?.length || 0) + (result.keywords_missing?.length || 0),
          changes_summary: result.changes_summary || '',
        });
      } catch(e) { console.log('Failed to save tailored resume:', e.message); }

      return Response.json({
        success: true,
        response: result.changes_summary || `Your resume has been tailored for ${roleTitle} at ${companyName}!`,
        message_type: 'resume_tailored',
        payload: {
          resume: result.resume || {},
          ats_score: result.ats_score || 0,
          keywords_matched: result.keywords_matched || [],
          keywords_added: result.keywords_added || [],
          keywords_missing: result.keywords_missing || [],
          changes_summary: result.changes_summary || '',
          changes: result.changes || [],
          company_name: companyName,
          role_title: roleTitle,
        }
      });
    }

    // 4. INTERVIEW PREP
    if (detectInterviewPrep(resolvedMessage)) {
      console.log('Intent: interview_prep');
      const companyMatch = resolvedMessage.match(/(?:interview\s+(?:at|for|with)|prep.*?for)\s+(\w[\w\s&.''-]{1,40})/i);
      const company = companyMatch?.[1]?.trim() || targetCompanies[0] || '';
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FASTIQ. Prepare this student for an interview.\n\n${profileContext}\n\nRequest: "${resolvedMessage}"\n${company ? `Company: ${company}` : ''}\n\nResearch the company's interview process. Personalize questions based on the student's major (${user.major || 'their field'}) and target role. Include behavioral, technical, and culture-fit questions.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            company_name: { type: "string" }, role: { type: "string" },
            interview_format: { type: "string" },
            likely_questions: { type: "array", items: { type: "object", properties: { question: { type: "string" }, what_they_look_for: { type: "string" }, approach: { type: "string" } }, required: ["question"] } },
            tips: { type: "array", items: { type: "string" } },
            culture_notes: { type: "string" }
          },
          required: ["response", "likely_questions"]
        }
      });
      return Response.json({
        success: true, response: result.response || "Here's your interview prep:",
        message_type: 'interview_prep', payload: result
      });
    }

    // 5. LINKEDIN REVIEW
    if (detectLinkedInReview(resolvedMessage)) {
      console.log('Intent: linkedin_review');
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FASTIQ. Review this student's LinkedIn profile.\n\n${profileContext}\n\nLinkedIn URL: ${profile.linkedin_url || 'not provided'}\nRequest: "${resolvedMessage}"\n\nAnalyze their headline, summary, experience, skills, and recommendations. Score the profile and provide specific improvement suggestions for ${profile.target_industry || 'their target industry'} roles.`,
        add_context_from_internet: !!profile.linkedin_url,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            overall_score: { type: "integer" },
            headline_suggestion: { type: "string" },
            summary_suggestion: { type: "string" },
            improvements: { type: "array", items: { type: "object", properties: { section: { type: "string" }, issue: { type: "string" }, suggestion: { type: "string" } }, required: ["section","suggestion"] } }
          },
          required: ["response", "overall_score"]
        }
      });
      return Response.json({
        success: true, response: result.response || "Here's your LinkedIn review:",
        message_type: 'linkedin_review', payload: result
      });
    }

    // 6. SALARY NEGOTIATION
    if (detectSalaryNegotiation(resolvedMessage)) {
      console.log('Intent: salary_negotiation');
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FASTIQ. Provide salary intelligence for this student.\n\n${profileContext}\n\nRequest: "${resolvedMessage}"\n\nFind real salary data for entry-level ${profile.target_industry || ''} roles${profile.location_preference ? ' in ' + profile.location_preference : ''}. Include negotiation tactics and a sample negotiation script.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            role: { type: "string" }, location: { type: "string" },
            salary_range: { type: "string" }, median_salary: { type: "string" },
            negotiation_tips: { type: "array", items: { type: "string" } },
            sample_script: { type: "string" }
          },
          required: ["response", "salary_range", "negotiation_tips"]
        }
      });
      return Response.json({
        success: true, response: result.response || "Here's the salary intel:",
        message_type: 'salary_intel', payload: result
      });
    }

    // 7. COVER LETTER
    if (detectCoverLetter(resolvedMessage)) {
      console.log('Intent: cover_letter');
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FASTIQ. Write a tailored cover letter for this student.\n\n${profileContext}\n\nRequest: "${resolvedMessage}"\n\nWrite a professional, personalized cover letter. Reference the student's UF background, major, and target industry. Keep it concise (3-4 paragraphs).`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            recipient: { type: "string" }, company: { type: "string" }, role: { type: "string" },
            letter_text: { type: "string" }
          },
          required: ["response", "letter_text"]
        }
      });
      return Response.json({
        success: true, response: result.response || "Here's your cover letter:",
        message_type: 'cover_letter', payload: result
      });
    }

    // 7.5 BATCH TARGET COMMAND — must be checked BEFORE alumni/company/opportunity detectors
    if (detectBatchTargetCommand(resolvedMessage) && targetCompanies.length > 0) {
      console.log('Intent: batch_target_scan for', targetCompanies.join(', '));
      const major = user.major || 'their field';
      const industry = profile.target_industry || 'any industry';
      const gradYear = user.graduation_year || 'upcoming';

      // Research all target companies in parallel
      const batchPromises = targetCompanies.map(company =>
        base44.integrations.Core.InvokeLLM({
          prompt: `Find current entry-level and intern ${major} roles at ${company} in 2026. Include role titles, locations, whether applications are open, and how well they match a ${major} major graduating ${gradYear}. Be specific and factual.`,
          add_context_from_internet: true,
        }).then(webRes =>
          base44.integrations.Core.InvokeLLM({
            prompt: `You are FASTIQ. Parse research into structured roles found at ${company} for a ${major} student in ${industry}.\n\nRESEARCH:\n${String(typeof webRes === 'string' ? webRes : JSON.stringify(webRes)).substring(0, 3000)}\n\nReturn relevant entry-level/intern roles. hiring_signal: hot (many openings), warm (some), cool (few/none). profile_match: how well the roles fit a ${major} major (strong/moderate/weak).`,
            response_json_schema: {
              type: "object",
              properties: {
                company_name: { type: "string" },
                hiring_signal: { type: "string", enum: ["hot", "warm", "cool"] },
                profile_match: { type: "string", enum: ["strong", "moderate", "weak"] },
                roles: { type: "array", items: { type: "object", properties: { title: { type: "string" }, location: { type: "string" }, type: { type: "string", enum: ["internship", "entry_level", "mid_level"] }, applications_open: { type: "boolean" } }, required: ["title"] } },
                summary: { type: "string" }
              },
              required: ["company_name", "hiring_signal", "profile_match", "roles", "summary"]
            }
          })
        ).catch(e => ({ company_name: company, hiring_signal: 'cool', profile_match: 'weak', roles: [], summary: `Could not research ${company}: ${e.message}` }))
      );

      const batchResults = await Promise.all(batchPromises);

      // Generate overall summary
      const summaryLines = batchResults.map(r => `${r.company_name}: ${r.hiring_signal} hiring, ${r.roles?.length || 0} roles, ${r.profile_match} match`).join('\n');
      const bestMatch = batchResults.reduce((best, r) => {
        const score = (r.profile_match === 'strong' ? 3 : r.profile_match === 'moderate' ? 2 : 1) + (r.hiring_signal === 'hot' ? 3 : r.hiring_signal === 'warm' ? 2 : 1);
        return score > best.score ? { company: r.company_name, score } : best;
      }, { company: '', score: 0 });

      trackActivity(base44, user.email, profile.id, 'company_search', 'batch_targets');

      return Response.json({
        success: true,
        response: `Here's what I found across your ${targetCompanies.length} target companies. ${bestMatch.company ? `**${bestMatch.company}** looks like your strongest opportunity right now.` : ''}`,
        message_type: 'batch_target_scan',
        payload: { companies: batchResults, best_match: bestMatch.company, summary: summaryLines }
      });
    }

    // If batch target command detected but NO target companies set, tell the user
    if (detectBatchTargetCommand(resolvedMessage) && targetCompanies.length === 0) {
      return Response.json({
        success: true,
        response: "You don't have any target companies set yet. Add your target companies first (up to 5), and then I can scan all of them for relevant roles.",
        message_type: 'text',
        payload: {}
      });
    }

    // 8. ALUMNI DISCOVERY (checked before outreach to prevent misclassification)
    let alumniCompany = detectAlumniQuery(resolvedMessage);
    if (alumniCompany === 'RESOLVE_FROM_CONTEXT') {
      alumniCompany = resolveCompanyFromContext(conversation_history) || null;
    }

    // LAYER 2: Confirmation gate for unknown companies (alumni path)
    if (alumniCompany && !isConfirmation && shouldConfirmCompany(alumniCompany, targetCompanies)) {
      console.log(`[Layer2] Unknown company "${alumniCompany}" in alumni query — asking confirmation`);
      return Response.json({
        success: true,
        response: `Just to make sure — did you want me to find UF alumni at a company called **"${titleCase(alumniCompany)}"**? Or were you asking me to do something else?\n\nYou can say:\n→ **"Yes, research ${titleCase(alumniCompany)}"** to continue\n→ Or tell me the specific company name you meant`,
        message_type: 'text',
        payload: {}
      });
    }

    if (alumniCompany) {
      console.log('Intent: alumni_discovery for', alumniCompany);
      alumniCompany = titleCase(alumniCompany);

      const cached = await getCachedAlumni(base44, alumniCompany);
      if (cached) {
        const enrichedCached = await crossReferenceCFF(base44, cached.map(a => ({
          name: a.name, role_title: a.role_title, company: a.company,
          match_score: Math.max(a.match_score || 50, 50),
          degree_info: a.degree_info, location: a.location,
          linkedin_url: a.linkedin_url || '', verified: a.verified || false
        })));
        saveToPipeline(base44, user.email, alumniCompany, enrichedCached);
        trackActivity(base44, user.email, profile.id, 'alumni_view', alumniCompany);
        const guidanceResult = await generateAlumniGuidance(base44, enrichedCached, alumniCompany, profileContext);
        return Response.json({
          success: true, response: guidanceResult.guidance,
          message_type: 'alumni_card',
          payload: { alumni: enrichedCached, cached: true, top_match: guidanceResult.top_match, recommendation_reason: guidanceResult.recommendation_reason }
        });
      }

      // Web research
      const webResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Find alumni of the University of Florida (UF, in Gainesville, Florida) who currently work at ${alumniCompany}.\n\n${UF_FILTER}\n\nFor each confirmed UF alumni found, provide their full name, current job title, UF degree info, and location.`,
        add_context_from_internet: true,
      });

      const alumniResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Parse research into structured alumni profiles for UF alumni at ${alumniCompany}.

${profileContext}

${UF_FILTER}
- DEDUPLICATE same name+title
- For each alumni, try to find their LinkedIn profile URL. If found in the research data, include it. Format: https://www.linkedin.com/in/username

MATCH SCORE RULES — MINIMUM 50% for ANY UF alum at this company:
The student specifically searched for alumni at ${alumniCompany}. Every alum found here is a HIGH-VALUE contact by definition.

SCORING TIERS:
- FLOOR: 50% — Any UF alum at this company, regardless of role (they're a fellow Gator at a company the student cares about)
- SAME INDUSTRY as student's target (${profile.target_industry || 'their field'}): 60%+
- RELEVANT DEPARTMENT for student's major (${user.major || 'their major'}): 70%+
- REACHABLE ROLE the student could realistically contact (similar function, approachable seniority): 80%+
- PERFECT MATCH (relevant dept + reachable + senior enough to refer): 85-95%

SENIORITY BONUS (add on top of tier score):
- Entry-level/recent grad: +0
- Mid-level (3-8 years): +3
- Senior/Manager: +5
- Director/VP/C-suite: +8

EXAMPLES for a Finance major searching alumni at JPMorgan:
- VP of Investment Banking → 80% + 8 = 88% (relevant dept, reachable for advice, senior enough for referral)
- Risk Analyst → 70% + 0 = 70% (relevant dept, entry-level peer)
- Marketing Director → 60% + 8 = 68% (same industry, different dept, senior)
- HR Coordinator → 50% + 0 = 50% (baseline — still a Gator at JPMorgan)

EXAMPLES for a CS major searching alumni at Google:
- Software Engineer (mid) → 80% + 3 = 83%
- Engineering Manager → 80% + 5 = 85%
- VP of Engineering → 80% + 8 = 88%
- Product Manager → 70% + 5 = 75%
- Recruiter → 50% + 3 = 53%

ABSOLUTE RULE: No score below 50 for anyone at this company. They are all UF connections at a company the student chose to search.

RESEARCH:
${String(typeof webResult === 'string' ? webResult : JSON.stringify(webResult)).substring(0,4000)}`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            alumni: { type: "array", items: { type: "object", properties: { name: { type: "string" }, role_title: { type: "string" }, company: { type: "string" }, degree_info: { type: "string" }, location: { type: "string" }, match_score: { type: "integer" }, seniority_level: { type: "string", enum: ["entry","mid","senior","director","vp_plus"] }, linkedin_url: { type: "string", description: "LinkedIn profile URL if found" } }, required: ["name","role_title","company","match_score"] } }
          },
          required: ["response","alumni"]
        }
      });

      const alumni = filterAndDedupAlumni(alumniResult.alumni || [], alumniCompany);

      // LAYER 3: Graceful recovery for alumni — if 0 real alumni AND the response text suggests confusion
      if (alumni.length === 0 && !alumniResult.response?.toLowerCase().includes('alumni')) {
        console.log(`[Layer3] Alumni search for "${alumniCompany}" returned 0 results and confused response — recovering`);
        return Response.json({
          success: true,
          response: `Hmm, I might have misunderstood. It looks like **"${alumniCompany}"** isn't matching a real company. Did you mean something else?\n\nYou can try:\n→ Naming a specific company like **"Find alumni at Apple"** or **"Find alumni at ${targetCompanies[0] || 'Google'}"**\n→ Or asking me to **"find internships at my target companies"**`,
          message_type: 'text',
          payload: {}
        });
      }

      if (alumni.length > 0) {
        // Cross-reference against CFF member database
        const enrichedAlumni = await crossReferenceCFF(base44, alumni);
        saveAlumniCache(base44, enrichedAlumni);
        saveToPipeline(base44, user.email, alumniCompany, enrichedAlumni);
        trackActivity(base44, user.email, profile.id, 'alumni_view', alumniCompany);
        const guidanceResult = await generateAlumniGuidance(base44, enrichedAlumni, alumniCompany, profileContext);
        return Response.json({
          success: true, response: guidanceResult.guidance,
          message_type: 'alumni_card', payload: { alumni: enrichedAlumni, cached: false, top_match: guidanceResult.top_match, recommendation_reason: guidanceResult.recommendation_reason }
        });
      }

      // WARM PATH FALLBACKS (Layers 1-5)
      console.log('Zero alumni at', alumniCompany, '— running warm-path fallback');
      const industry = profile.target_industry || 'the same industry';

      let nearbyAlumni = [], partnerAlumni = [], recruiters = [], linkedinStrategy = null, cffInsiders = [];

      // Run fallbacks in parallel
      const [nearbyRes, partnerRes, recruiterRes, stratRes, expertiseRes] = await Promise.allSettled([
        base44.integrations.Core.InvokeLLM({
          prompt: `Find UF alumni at competitors of ${alumniCompany} in ${industry}. Return 3-5 with connection_note explaining how they help reach ${alumniCompany}.\n${UF_FILTER}`,
          add_context_from_internet: true,
          response_json_schema: { type: "object", properties: { alumni: { type: "array", items: { type: "object", properties: { name: { type: "string" }, role_title: { type: "string" }, company: { type: "string" }, degree_info: { type: "string" }, location: { type: "string" }, match_score: { type: "integer" }, connection_note: { type: "string" } }, required: ["name","role_title","company"] } } }, required: ["alumni"] }
        }),
        base44.integrations.Core.InvokeLLM({
          prompt: `Find major clients/partners/vendors of ${alumniCompany}. Then find UF alumni at those companies.\n${UF_FILTER}`,
          add_context_from_internet: true,
          response_json_schema: { type: "object", properties: { alumni: { type: "array", items: { type: "object", properties: { name: { type: "string" }, role_title: { type: "string" }, company: { type: "string" }, degree_info: { type: "string" }, location: { type: "string" }, match_score: { type: "integer" }, connection_note: { type: "string" } }, required: ["name","role_title","company"] } } }, required: ["alumni"] }
        }),
        base44.integrations.Core.InvokeLLM({
          prompt: `Find 2-3 recruiting firms that place candidates at ${alumniCompany} or in ${industry}.`,
          add_context_from_internet: true,
          response_json_schema: { type: "object", properties: { recruiters: { type: "array", items: { type: "object", properties: { firm_name: { type: "string" }, specialization: { type: "string" }, contact_tip: { type: "string" } }, required: ["firm_name","specialization"] } } }, required: ["recruiters"] }
        }),
        base44.integrations.Core.InvokeLLM({
          prompt: `Action plan for a UF ${profile.current_stage || 'student'} to build connections at ${alumniCompany} with no direct alumni. Include 3-4 steps, LinkedIn groups, and events.`,
          add_context_from_internet: true,
          response_json_schema: { type: "object", properties: { steps: { type: "array", items: { type: "string" } }, groups: { type: "array", items: { type: "string" } }, events: { type: "array", items: { type: "string" } } }, required: ["steps"] }
        }),
        base44.entities.ParentExpertise.filter({ industry, available: true }, '-last_active_at', 10).catch(() => [])
      ]);

      if (nearbyRes.status === 'fulfilled') { nearbyAlumni = nearbyRes.value?.alumni || []; if (nearbyAlumni.length > 0) { saveAlumniCache(base44, nearbyAlumni); for (const a of nearbyAlumni) saveToPipeline(base44, user.email, a.company, [a]); } }
      if (partnerRes.status === 'fulfilled') { partnerAlumni = partnerRes.value?.alumni || []; if (partnerAlumni.length > 0) saveAlumniCache(base44, partnerAlumni); }
      if (recruiterRes.status === 'fulfilled') recruiters = recruiterRes.value?.recruiters || [];
      if (stratRes.status === 'fulfilled') linkedinStrategy = stratRes.value;
      if (expertiseRes.status === 'fulfilled') cffInsiders = (expertiseRes.value || []).slice(0,4).map(p => ({ name: p.parent_name || 'CFF Member', role: p.current_role || '', company: p.current_company || '', email: p.parent_email || '', industry: p.industry || industry }));

      trackActivity(base44, user.email, profile.id, 'alumni_view', alumniCompany);
      const totalPaths = nearbyAlumni.length + cffInsiders.length + partnerAlumni.length + recruiters.length + (linkedinStrategy ? 1 : 0);

      return Response.json({
        success: true,
        response: `I didn't find UF alumni directly at ${alumniCompany} — but FASTIQ never hits a dead end. I found ${totalPaths} warm paths into this company:`,
        message_type: 'warm_path',
        payload: { target_company: alumniCompany, nearby_alumni: nearbyAlumni, cff_insiders: cffInsiders, partner_alumni: partnerAlumni, recruiters, linkedin_strategy: linkedinStrategy }
      });
    }

    // 9. OPPORTUNITY DISCOVERY
    if (detectOpportunityDiscovery(resolvedMessage)) {
      console.log('Intent: opportunity_discovery');
      const sizePref = { large: 'large corporation', mid_size: 'mid-size company', startup: 'startup' }[profile.company_size_preference] || '';
      const industry = profile.target_industry || 'any industry';
      const major = user.major || 'their field';
      const locPref = profile.location_preference || '';

      const webResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Find 5-8 companies hiring entry-level ${major} roles in ${industry}${sizePref ? ', focusing on ' + sizePref + ' companies' : ''}${locPref ? ' near ' + locPref : ''}. Student request: "${resolvedMessage}"`,
        add_context_from_internet: true,
      });

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FASTIQ.\n\n${profileContext}\n\nBased on research, suggest 5-8 companies for this ${major} student.\n\nRESEARCH:\n${String(typeof webResult === 'string' ? webResult : JSON.stringify(webResult)).substring(0,4000)}\n\nEvery company MUST have roles for a ${major} graduate. Be realistic.`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            suggestions: { type: "array", items: { type: "object", properties: { company_name: { type: "string" }, reason: { type: "string" }, size: { type: "string", enum: ["large","mid_size","startup"] }, hiring_status: { type: "string", enum: ["actively_hiring","some_openings","unknown"] }, location: { type: "string" } }, required: ["company_name","reason","size","hiring_status"] } }
          },
          required: ["response","suggestions"]
        }
      });

      trackActivity(base44, user.email, profile.id, 'company_search', industry);
      return Response.json({
        success: true, response: result.response || "Here are companies for you:",
        message_type: 'company_suggestions', payload: { suggestions: result.suggestions || [] }
      });
    }

    // 10. ROADMAP
    if (detectRoadmapQuery(resolvedMessage)) {
      console.log('Intent: roadmap');
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FASTIQ.\n\n${profileContext}\n\nGenerate a 4-8 week career action plan tailored to this student. Start with foundational tasks and progress to active outreach. Reference their target companies when possible.`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" }, title: { type: "string" },
            steps: { type: "array", items: { type: "object", properties: { week_number: { type: "integer" }, title: { type: "string" }, description: { type: "string" }, action_items: { type: "array", items: { type: "string" } } }, required: ["week_number","title","description","action_items"] } }
          },
          required: ["response","title","steps"]
        }
      });
      trackActivity(base44, user.email, profile.id, 'roadmap_created', result.title || 'Career Plan');
      return Response.json({
        success: true, response: result.response || "Here's your plan:",
        message_type: 'roadmap', payload: { title: result.title || 'Your Career Action Plan', steps: result.steps || [] }
      });
    }

    // 11. OUTREACH DRAFT
    const outreachTarget = detectOutreachQuery(resolvedMessage);
    if (outreachTarget) {
      console.log('Intent: outreach_draft for', outreachTarget);
      let alumniRecord = null;
      try {
        const all = await base44.entities.DiscoveredAlumni.filter({ school_code: 'UF' });
        const valid = (all||[]).filter(a => new Date(a.expires_at) > new Date());
        alumniRecord = valid.find(a => a.name.toLowerCase().includes(outreachTarget.toLowerCase()) || outreachTarget.toLowerCase().includes(a.name.toLowerCase().split(' ')[0]));
      } catch(e) {}

      const recipientName = alumniRecord?.name || outreachTarget;
      const recipientTitle = alumniRecord?.role_title || '';
      const recipientCompany = alumniRecord?.company || '';
      const lower = message.toLowerCase();
      let askType = 'informational interview';
      if (lower.includes('referral')) askType = 'referral';
      else if (lower.includes('advice')) askType = 'career advice';
      else if (lower.includes('coffee')) askType = 'coffee chat';
      let channel = lower.includes('email') ? 'Email' : 'LinkedIn';

      // Look for recommendation_reason from recent conversation context
      let recommendationReason = '';
      try {
        const recentAssistant = [...recentDbMessages].reverse().find(m => m.role === 'assistant' && m.message_type === 'alumni_card');
        if (recentAssistant?.payload) {
          const parsed = typeof recentAssistant.payload === 'string' ? JSON.parse(recentAssistant.payload) : recentAssistant.payload;
          if (parsed?.recommendation_reason) recommendationReason = parsed.recommendation_reason;
        }
      } catch(e) {}

      // Also check the conversation_history for contextual clues about why this person was recommended
      let conversationContext = '';
      if (conversation_history) {
        const recentLines = conversation_history.split('\n').slice(-6).join('\n');
        conversationContext = recentLines;
      }

      const studentName = user.full_name || 'Gator Student';
      const studentMajor = user.major || 'undeclared';
      const gradYear = user.graduation_year || 'upcoming';
      const targetIndustry = profile.target_industry || 'their target industry';

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Draft a ${channel} message from ${studentName}, a ${studentMajor} major at the University of Florida (class of ${gradYear}), to ${recipientName}, ${recipientTitle} at ${recipientCompany}.

Context: The student is interested in ${targetIndustry} and chose to reach out to this person because ${recommendationReason || 'they are a fellow UF alum in a role relevant to the student\'s career goals'}.

${conversationContext ? `RECENT CONVERSATION CONTEXT:\n${conversationContext}\n` : ''}

Rules:
1. Reference something SPECIFIC about the alumni's role or background — never generic
2. Connect the student's major/interests to the alumni's work in a specific way
3. Ask ONE clear, specific question — not "any advice" but something like "I'd love to hear how your team approaches X" or "I'm curious whether a background in Y translates well into Z"
4. Keep it under 100 words — busy people don't read essays
5. Tone: confident but not arrogant, curious but not needy, specific but not stalkerish
6. Sign off with full name, university, and graduation year
7. Do NOT use "I hope this message finds you well" or any other cliche opener
8. No placeholders — use real names and details from above`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" }, recipient: { type: "string" }, channel: { type: "string" },
            subject: { type: "string" }, message_body: { type: "string" }
          },
          required: ["response","recipient","channel","message_body"]
        }
      });

      trackActivity(base44, user.email, profile.id, 'message_draft', recipientName);
      return Response.json({
        success: true, response: result.response || `Here's your draft to ${recipientName}:`,
        message_type: 'outreach_draft',
        payload: { recipient: result.recipient || recipientName, recipient_title: recipientTitle, recipient_company: recipientCompany, channel: result.channel || channel, subject: result.subject || '', message: result.message_body || '', ask_type: askType }
      });
    }

    // 12. COMPANY INTEL
    let detectedCompany = detectCompanyQuery(resolvedMessage);
    if (detectedCompany) {
      const bad = ['are they','is it','my','the','a','it','they','this','that','are','is'];
      if (detectedCompany.length < 2 || bad.includes(detectedCompany.toLowerCase())) detectedCompany = null;
    }

    // LAYER 2: Confirmation gate for unknown companies (company intel path)
    if (detectedCompany && !isConfirmation && shouldConfirmCompany(detectedCompany, targetCompanies)) {
      console.log(`[Layer2] Unknown company "${detectedCompany}" in company query — asking confirmation`);
      return Response.json({
        success: true,
        response: `Just to make sure — did you want me to research a company called **"${titleCase(detectedCompany)}"**? Or were you asking me to do something else?\n\nYou can say:\n→ **"Yes, research ${titleCase(detectedCompany)}"** to continue\n→ Or name a specific company like **"Research Apple"**\n→ Or ask me to **"find internships at my target companies"**`,
        message_type: 'text',
        payload: {}
      });
    }

    if (detectedCompany) {
      console.log('Intent: company_intel for', detectedCompany);
      detectedCompany = titleCase(detectedCompany);

      // Helper: run personalized analysis on intel results
      const runPersonalizedAnalysis = async (companyName, intelData, memoryContext) => {
        try {
          const analysisResult = await base44.integrations.Core.InvokeLLM({
            prompt: `You are FASTIQ, an elite AI career center for UF students. You just researched ${companyName} for this student. Now ANALYZE what the research means specifically for them.

${profileContext}

${memoryContext ? `PERSISTENT MEMORY (changes since last research):\n${memoryContext}\n\nIMPORTANT: If there are memory deltas, LEAD with what changed. Example: "Last time you looked at Disney, they had 35 open roles — now it's 28. They may be slowing down. Consider accelerating your outreach before the window closes."\n` : ''}
COMPANY INTEL:
- Company: ${companyName}
- Hiring Score: ${intelData.hiring_score}/100 (${intelData.hiring_signal})
- Open Roles: ${intelData.open_roles_count}
- Salary Range: ${intelData.salary_range || 'unknown'}
- Summary: ${intelData.company_summary || ''}
- Recent News: ${(intelData.recent_news || []).join('; ')}
- Interview Process: ${intelData.interview_process || 'unknown'}

INSTRUCTIONS:
Based on the student's profile (major, graduation year, career stage, target industry, location preference, career timeline) and the company intel, write a SHORT personalized assessment (3-5 sentences max).

Consider these scenarios:
- If roles are too senior: flag it and suggest finding entry-level pipelines via alumni or suggest similar companies hiring entry-level
- If it's a great match: say so and suggest immediate next steps (find alumni, draft cover letter, etc.)
- If there's a hiring freeze/layoffs: warn them and suggest alternatives or watchlisting
- If location doesn't match: highlight which roles might work and which don't
- If industry alignment is weak: note the gap and suggest how to bridge it

End with exactly 2 concrete suggested next actions formatted as arrows (→). Each action should be specific and actionable, like "Find UF alumni at ${companyName} who could give you a warm intro" or "Research similar companies that are hiring entry-level right now".

Be direct, warm, and strategic. Never dump data — always tell them what it MEANS for them.`,
            response_json_schema: {
              type: "object",
              properties: {
                assessment: { type: "string", description: "The personalized analysis paragraph (3-5 sentences)" },
                next_actions: { type: "array", items: { type: "string" }, description: "Exactly 2 suggested next actions starting with →" },
                match_level: { type: "string", enum: ["strong_match", "moderate_match", "weak_match", "caution"], description: "How well this company fits the student" }
              },
              required: ["assessment", "next_actions", "match_level"]
            }
          });
          return analysisResult;
        } catch (e) {
          console.log('Personalized analysis error:', e.message);
          return null;
        }
      };

      const cached = await getCachedCompanyIntel(base44, detectedCompany);
      if (cached && !cached._expired) {
        trackActivity(base44, user.email, profile.id, 'company_search', detectedCompany);
        const cachedIntelData = { hiring_score: cached.hiring_score, hiring_signal: cached.hiring_signal, company_summary: cached.intel_summary, open_roles_count: cached.open_roles_count, salary_range: cached.salary_range, recent_news: [], interview_process: '' };
        const analysis = await runPersonalizedAnalysis(detectedCompany, cachedIntelData);
        return Response.json({
          success: true,
          response: analysis ? analysis.assessment : `Here's intel on ${detectedCompany}:`,
          message_type: 'company_intel',
          payload: { company: detectedCompany, hiring_score: cached.hiring_score, hiring_signal: cached.hiring_signal, company_summary: cached.intel_summary, open_roles_count: cached.open_roles_count, salary_range: cached.salary_range, cached: true, personalized_analysis: analysis || null }
        });
      }
      // Keep expired cache for memory delta comparison
      const previousIntel = (cached && cached._expired) ? cached : null;

      const webResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Research ${detectedCompany} as of 2026. Hiring status, open roles count, salary ranges, recent news, interview process. Be specific.`,
        add_context_from_internet: true,
      });

      const intel = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FASTIQ.\n\n${profileContext}\n\nSynthesize research about ${detectedCompany} into a briefing.\n\nRESEARCH:\n${String(typeof webResult === 'string' ? webResult : JSON.stringify(webResult)).substring(0,4000)}\n\nhiring_score: 0-100 (80+=hot, 50-79=warm, <50=cool). salary_range: specific like "$65K-$95K". recent_news: array of 2-4 factual items. If the company doesn't appear to be a real company or the research returned no meaningful results, set hiring_score to 0 and company_summary to "NOT_FOUND".`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" }, hiring_score: { type: "integer" }, hiring_signal: { type: "string", enum: ["hot","warm","cool"] },
            salary_range: { type: "string" }, open_roles_count: { type: "integer" }, company_summary: { type: "string" },
            recent_news: { type: "array", items: { type: "string" } }, interview_process: { type: "string" }
          },
          required: ["response","hiring_score","hiring_signal","salary_range","open_roles_count","company_summary"]
        }
      });

      // LAYER 3: Graceful recovery — if company not found or nonsensical results
      if (intel.company_summary === 'NOT_FOUND' || (intel.hiring_score === 0 && intel.open_roles_count === 0 && (!intel.company_summary || intel.company_summary.length < 20))) {
        console.log(`[Layer3] Company "${detectedCompany}" returned nonsensical results — recovering gracefully`);
        return Response.json({
          success: true,
          response: `Hmm, I might have misunderstood. It looks like **"${detectedCompany}"** isn't matching a real company. Did you mean something else?\n\nYou can try:\n→ Naming a specific company like **"Research Apple"** or **"Research ${targetCompanies[0] || 'Google'}"**\n→ Or asking me to **"find internships at my target companies"**\n→ Or **"help me find companies to target"**`,
          message_type: 'text',
          payload: {}
        });
      }

      saveCompanyIntelCache(base44, detectedCompany, { hiring_score: intel.hiring_score, hiring_signal: intel.hiring_signal, summary: intel.company_summary, open_roles_count: intel.open_roles_count, salary_range: intel.salary_range });
      trackActivity(base44, user.email, profile.id, 'company_search', detectedCompany);

      const news = Array.isArray(intel.recent_news) ? intel.recent_news : (intel.recent_news ? [intel.recent_news] : []);
      const intelForAnalysis = { ...intel, recent_news: news };
      // Build memory delta context from previous intel
      const memoryCtx = buildMemoryContext(previousIntel, intel, detectedCompany);
      const analysis = await runPersonalizedAnalysis(detectedCompany, intelForAnalysis, memoryCtx);

      return Response.json({
        success: true,
        response: analysis ? analysis.assessment : (intel.response || `Here's intel on ${detectedCompany}:`),
        message_type: 'company_intel',
        payload: { company: detectedCompany, hiring_score: intel.hiring_score, hiring_signal: intel.hiring_signal, company_summary: intel.company_summary, open_roles_count: intel.open_roles_count, salary_range: intel.salary_range, recent_news: news, interview_process: intel.interview_process || '', cached: false, personalized_analysis: analysis || null }
      });
    }

    // 13. FOLLOW-UP DRAFT
    if (detectFollowUp(resolvedMessage)) {
      return await handleFollowUpDraft(base44, user, profile, resolvedMessage, pipelineData, staleOutreach, profileContext);
    }

    // 14. REPLY HELP — student got a reply and needs help responding
    if (detectReplyHelp(resolvedMessage)) {
      return await handleReplyHelp(base44, user, profile, resolvedMessage, pipelineData, profileContext);
    }

    // 15. THANK-YOU NOTE (after interview)
    if (detectThankYouNote(resolvedMessage)) {
      console.log('Intent: thank_you_note');
      const companyMatch = resolvedMessage.match(/(?:at|for|with)\s+(\w[\w\s&.''-]{1,40})/i);
      const company = companyMatch?.[1]?.trim() || targetCompanies[0] || '';

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FASTIQ. Draft a personalized thank-you email after an interview.

${profileContext}

Request: "${resolvedMessage}"
Company: ${company}

RULES:
1. Reference SPECIFIC topics from the interview (ask the student to provide bullet points if not included in their message)
2. Reiterate enthusiasm for the role and company
3. Include one specific detail that shows you were paying attention
4. Keep it concise — 3-4 short paragraphs
5. Professional but genuine tone
6. Include a forward-looking statement ("I'm excited about the possibility of contributing to...")
7. Sign with full name and contact info`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            recipient: { type: "string" }, channel: { type: "string" },
            subject: { type: "string" }, message_body: { type: "string" }
          },
          required: ["response", "message_body"]
        }
      });

      trackActivity(base44, user.email, profile.id, 'message_draft', company);
      return Response.json({
        success: true, response: result.response || `Here's your thank-you note:`,
        message_type: 'outreach_draft',
        payload: { recipient: result.recipient || 'Interviewer', recipient_title: '', recipient_company: company, channel: result.channel || 'Email', subject: result.subject || `Thank you — ${company} Interview`, message: result.message_body || '', ask_type: 'thank_you' }
      });
    }

    // 16. OFFER EVALUATION & NEGOTIATION
    if (detectOfferNegotiation(resolvedMessage)) {
      console.log('Intent: offer_negotiation');
      const companyMatch = resolvedMessage.match(/(?:offer\s+from|at|with)\s+(\w[\w\s&.''-]{1,40})/i);
      const company = companyMatch?.[1]?.trim() || targetCompanies[0] || '';

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FASTIQ. A student just received a job offer! Help them evaluate and negotiate.

${profileContext}

Request: "${resolvedMessage}"
Company: ${company || 'the company'}

INSTRUCTIONS:
1. First CELEBRATE — this is a big deal!
2. Research the salary range for this role and level at this company and in this market
3. Identify negotiation leverage points (competing offers, unique skills, market data)
4. Provide a specific negotiation script/email template
5. List what to negotiate beyond salary (signing bonus, start date, PTO, remote work, stock/equity, professional development budget)
6. Provide a timeline: when to respond, when to negotiate, when to accept
7. Include a "what to say if they say no" script`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            role: { type: "string" }, location: { type: "string" },
            salary_range: { type: "string" }, median_salary: { type: "string" },
            negotiation_tips: { type: "array", items: { type: "string" } },
            sample_script: { type: "string" },
            beyond_salary: { type: "array", items: { type: "string" } },
            suggested_actions: { type: "array", items: { type: "string" } }
          },
          required: ["response", "salary_range", "negotiation_tips", "sample_script"]
        }
      });

      return Response.json({
        success: true, response: result.response || "Congratulations! Here's your negotiation strategy:",
        message_type: 'salary_intel',
        payload: { ...result, company: company }
      });
    }

    // 17. NETWORK THANK-YOU (thank everyone who helped)
    if (detectNetworkThankYou(resolvedMessage)) {
      console.log('Intent: network_thank_you');
      // Find all contacts who helped (replied, interview, or offer status)
      const helpfulContacts = pipelineData.filter(p => ['replied', 'interview', 'offer'].includes(p.status));

      if (helpfulContacts.length === 0) {
        return Response.json({
          success: true,
          response: "It looks like you don't have any alumni contacts marked as 'replied' or 'interview' in your pipeline yet. Once you start getting responses, I can help you draft personalized thank-you messages to everyone who helped!",
          message_type: 'career_advice',
          payload: { suggested_actions: ['Research a target company', 'Find UF alumni at your dream companies'] }
        });
      }

      const contactsList = helpfulContacts.map(c => `- ${c.alumni_name} at ${c.company} (${c.status})`).join('\n');

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FASTIQ. The student wants to thank everyone who helped them in their job search.

${profileContext}

CONTACTS WHO HELPED:
${contactsList}

INSTRUCTIONS:
1. For EACH contact, draft a SHORT personalized thank-you message (2-3 sentences)
2. Reference what they specifically helped with (based on their status: replied = initial advice, interview = referral/connection, offer = advocacy)
3. Include the outcome if applicable (got the offer, learned something valuable, etc.)
4. Make each message feel personal, not templated
5. Sign with first name

Return ALL messages in the response field, clearly separated with the contact name as a header.`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string", description: "All thank-you messages formatted with headers" },
            suggested_actions: { type: "array", items: { type: "string" } }
          },
          required: ["response"]
        }
      });

      return Response.json({
        success: true,
        response: result.response || "Here are thank-you messages for your network:",
        message_type: 'career_advice',
        payload: { suggested_actions: result.suggested_actions || ['Copy and send these messages', 'Update your pipeline status'] }
      });
    }

    // 18. CAREER ADVICE (DEFAULT FALLBACK)
    console.log('Intent: career_advice (default)');
    const webResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a career research assistant for a UF student.\n\n${profileContext}\n\nRequest: "${resolvedMessage}"\n\n${conversation_history ? 'Context:\n' + conversation_history : ''}\n\nProvide detailed, personalized career advice.`,
      add_context_from_internet: true,
    });

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are FASTIQ, a full-service AI career center for UF students.\n\n${profileContext}\n\nRESEARCH:\n${String(typeof webResult === 'string' ? webResult : JSON.stringify(webResult)).substring(0,4000)}\n\nRequest: "${resolvedMessage}"\n\nProvide personalized career advice. At the END, suggest 2-3 relevant FASTIQ actions like "Want me to find companies hiring for this?" or "Find UF alumni in this field?"`,
      response_json_schema: {
        type: "object",
        properties: {
          response: { type: "string" },
          suggested_actions: { type: "array", items: { type: "string" }, description: "2-3 follow-up action suggestions" }
        },
        required: ["response"]
      }
    });

    return Response.json({
      success: true, response: result.response || String(typeof webResult === 'string' ? webResult : JSON.stringify(webResult)).substring(0,2000),
      message_type: 'career_advice',
      payload: { suggested_actions: result.suggested_actions || [] }
    });

  } catch (error) {
    console.error('fastTrackProAgent error:', error.message);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});