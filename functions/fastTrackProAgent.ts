import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// INTENT DETECTION HELPERS
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

function detectSpecificAlumniQuery(message) {
  const patterns = [
    /(?:tell me about|who is|who'?s|what do you know about|info on|look up)\s+([A-Z][a-zA-Z.''-]+(?:\s+[A-Z][a-zA-Z.''-]+){0,3})\s+(?:at|from|who works at)\s+(\w[\w\s&.''-]{1,40})/i,
    /(?:tell me about|who is|who'?s|what do you know about|info on|look up)\s+([A-Z][a-zA-Z.''-]+(?:\s+[A-Z][a-zA-Z.''-]+){0,3})(?:\s*[?.!]?\s*$)/i,
  ];
  const rejects = ['amazon','google','apple','meta','microsoft','tesla','nvidia','the','a','my','this','it','that'];
  for (const p of patterns) { const m = message.match(p); if (m) { const n = m[1]?.trim(); const c = m[2]?.trim() || ''; if (n && !rejects.includes(n.toLowerCase())) return { name: n, company: c }; } }
  return null;
}

function detectConnectRequest(message) {
  const patterns = [
    /(?:connect with|reach out to|message|contact|send (?:a )?connect(?:ion)? (?:request|message) to)\s+([A-Z][a-zA-Z.''-]+(?:\s+[A-Z][a-zA-Z.''-]+){0,3})\s+(?:on\s+)?linkedin/i,
    /(?:connect with|reach out to|contact)\s+([A-Z][a-zA-Z.''-]+(?:\s+[A-Z][a-zA-Z.''-]+){0,3})\s+(?:at|from)\s+(\w[\w\s&.''-]{1,40})/i,
    /(?:connect with|reach out to|contact)\s+([A-Z][a-zA-Z.''-]+(?:\s+[A-Z][a-zA-Z.''-]+){0,3})(?:\s*[?.!]?\s*$)/i,
  ];
  const rejects = ['amazon','google','apple','meta','microsoft','tesla','nvidia','the','a','my','this','them','someone','anyone'];
  for (const p of patterns) { const m = message.match(p); if (m) { const n = m[1]?.trim(); const c = m[2]?.trim() || ''; if (n && !rejects.includes(n.toLowerCase())) return { name: n, company: c }; } }
  return null;
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
  // Direct thank-you requests
  if (/(?:thank.?you|thanks)\s+(?:note|email|message|letter)/i.test(message)) return true;
  if (/(?:draft|write|send)\s+(?:a\s+)?thank.?you/i.test(message)) return true;
  if (/(?:after\s+(?:the|my)\s+interview)/i.test(message)) return true;
  if (/(?:i had my interview|interview went|interview today|interview yesterday)/i.test(message)) return true;
  if (/(?:just finished|came out of|done with)\s+(?:my|the|an)\s+interview/i.test(message)) return true;
  if (lower.includes('thank you note') || lower.includes('thank-you note') || lower.includes('thank you email')) return true;
  if (lower.includes('i had my interview') || lower.includes('post-interview')) return true;
  // Detect interview detail responses (interviewer + topics)
  if (/(?:interviewed with|interviewer was|met with|spoke with)\s+\w/i.test(message) && /(?:talked about|discussed|mentioned|asked about|we covered)/i.test(message)) return true;
  return false;
}

function detectOfferNegotiation(message) {
  const lower = message.toLowerCase();
  return /(?:got|received|have)\s+(?:an?\s+)?offer/i.test(message) ||
    /(?:offer\s+from|job\s+offer)/i.test(message) ||
    /(?:negotiate|negotiation)\s+(?:the|my|an?)\s+(?:offer|salary|comp)/i.test(message) ||
    /(?:evaluate|assess)\s+(?:the|my|an?)\s+offer/i.test(message) ||
    lower.includes('accepted an offer') || lower.includes('accepted the offer');
}

function detectNetworkThankYou(message) {
  const lower = message.toLowerCase();
  return /(?:thank|message)\s+(?:everyone|all|my\s+network|my\s+contacts|everyone\s+who\s+helped)/i.test(message) ||
    /(?:draft\s+thank.?you\s+(?:to|for)\s+(?:everyone|all|my\s+network))/i.test(message) ||
    lower.includes('thank my network') || lower.includes('thank everyone who helped') ||
    lower.includes('thank the people who helped') || lower.includes('thank everyone in my pipeline');
}

// ═══════════════════════════════════════════════════════════
//  DATA / CACHE HELPERS
// ═══════════════════════════════════════════════════════════

// P2 FIX: Normalize company name to titleCase before cache lookup
async function getCachedAlumni(base44, company) {
  try {
    const normalizedCompany = titleCase(company);
    const cached = await base44.entities.DiscoveredAlumni.filter({ company: normalizedCompany, school_code: 'UF' });
    if (cached?.length > 0) {
      const now = new Date();
      const valid = cached.filter(a => new Date(a.expires_at) > now);
      if (valid.length > 0) return valid;
      for (const a of cached) { try { await base44.asServiceRole.entities.DiscoveredAlumni.delete(a.id); } catch(e){} }
    }
  } catch(e) { console.log('Alumni cache error:', e.message); }
  return null;
}

// P2 FIX: Normalize company name on cache write
async function saveAlumniCache(base44, alumni) {
  const exp = new Date(Date.now() + 24*60*60*1000).toISOString();
  for (const a of alumni) {
    if (a.confidence === 'low' || a.uf_verified === false) continue;
    try { await base44.asServiceRole.entities.DiscoveredAlumni.create({ name: a.name, role_title: a.role_title, company: titleCase(a.company || ''), school_code: 'UF', match_score: a.match_score || 0, degree_info: a.degree_info || '', location: a.location || '', linkedin_url: a.linkedin_url || '', expires_at: exp }); } catch(e) {}
  }
}

// P2 FIX: Normalize company name to titleCase before cache lookup
async function getCachedCompanyIntel(base44, company) {
  try {
    const normalizedCompany = titleCase(company);
    const cached = await base44.entities.CompanyIntelCache.filter({ company_name: normalizedCompany });
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
// P2 FIX: Instead of loading ALL users, we filter by the alumni names we're looking for.
// This is more targeted and scales better than loading 200 users into memory.
async function crossReferenceCFF(base44, alumni) {
  if (!alumni || alumni.length === 0) return alumni;
  let cffMembers = { parentNames: new Map(), userNames: new Map() };
  try {
    // Load parent expertise (these are already CFF participants, smaller set)
    const parents = await base44.entities.ParentExpertise.filter({}, '-last_active_at', 200).catch(() => []);
    const parentNames = new Map();
    (parents || []).forEach(p => {
      if (p.parent_name) parentNames.set(p.parent_name.toLowerCase().trim(), { email: p.parent_email, company: p.current_company, role: p.current_role });
    });

    // For users: only search for names that match alumni we found
    // This avoids loading ALL users into memory
    const userNames = new Map();
    const alumniNames = alumni.map(a => a.name).filter(Boolean);
    // Batch check: search for each alumni name in users
    const userSearches = alumniNames.slice(0, 10).map(name =>
      base44.asServiceRole.entities.User.filter({ full_name: name }).catch(() => [])
    );
    const userResults = await Promise.all(userSearches);
    userResults.flat().forEach(u => {
      if (u?.full_name) userNames.set(u.full_name.toLowerCase().trim(), { email: u.email, id: u.id });
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

// P2 FIX: Normalize company name on cache write
async function saveCompanyIntelCache(base44, company, data) {
  try {
    await base44.asServiceRole.entities.CompanyIntelCache.create({
      company_name: titleCase(company), school_code: 'UF',
      hiring_score: data.hiring_score || 0, hiring_signal: data.hiring_signal || 'cool',
      intel_summary: data.summary || '', open_roles_count: data.open_roles_count || 0,
      entry_level_roles_count: data.entry_level_roles_count || 0, intern_roles_count: data.intern_roles_count || 0,
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

// P2 FIX: Improved titleCase with known company name lookup
const KNOWN_COMPANY_NAMES = {
  'jpmorgan': 'JPMorgan', 'nvidia': 'NVIDIA', 'ibm': 'IBM', 'pwc': 'PwC',
  'ey': 'EY', 'kpmg': 'KPMG', 'bcg': 'BCG', 'hca': 'HCA', 'cvs': 'CVS',
  'ge': 'GE', 'hp': 'HP', 'amd': 'AMD', 'att': 'AT&T', 'at&t': 'AT&T',
  'bmw': 'BMW', 'bp': 'BP', 'kkr': 'KKR', 'j&j': 'J&J', 'p&g': 'P&G',
  'spacex': 'SpaceX', 'linkedin': 'LinkedIn', 'youtube': 'YouTube',
  'github': 'GitHub', 'openai': 'OpenAI', 'hubspot': 'HubSpot',
  'salesforce': 'Salesforce', 'doordash': 'DoorDash', 'tiktok': 'TikTok',
  'mckinsey': 'McKinsey', 'goldman sachs': 'Goldman Sachs',
  'morgan stanley': 'Morgan Stanley', 'bank of america': 'Bank of America',
  'johnson & johnson': 'Johnson & Johnson', 'lockheed martin': 'Lockheed Martin',
  'booz allen': 'Booz Allen', 'raymond james': 'Raymond James',
  'l3harris': 'L3Harris', 'unitedhealth': 'UnitedHealth',
  'ernst young': 'Ernst & Young', 'ernst & young': 'Ernst & Young',
};

function titleCase(str) {
  if (!str) return '';
  const lower = str.toLowerCase().trim();
  // Check known company names first
  if (KNOWN_COMPANY_NAMES[lower]) return KNOWN_COMPANY_NAMES[lower];
  // Fallback: lowercase then capitalize first letters
  return lower.replace(/\b\w/g, c => c.toUpperCase());
}

async function generateAlumniGuidance(base44, alumni, company, profileContext) {
  try {
    const alumniSummary = alumni.slice(0, 5).map(a => `- ${a.name}: ${a.role_title} (score: ${a.match_score}%, CFF: ${a.is_cff_member ? 'yes' : 'no'})`).join('\n');
    const cffCount = alumni.filter(a => a.is_cff_member).length;
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are FASTIQ. ACTION MODE — found UF alumni at ${company}. Write 1 sentence recommending WHO to reach out to first and WHY. The alumni card shows all the data — your text is just the recommendation headline.\n\n${profileContext}\n\nALUMNI:\n${alumniSummary}\nCFF Members: ${cffCount}\n\nRecommend ONE person (by first name). In recommended_full_name return EXACT full name. In recommendation_reason give the strategic reason in under 15 words. guidance should be 1-2 sentences max.`,
      response_json_schema: { type: "object", properties: { guidance: { type: "string" }, recommended_full_name: { type: "string" }, recommendation_reason: { type: "string" } }, required: ["guidance", "recommended_full_name", "recommendation_reason"] }
    });
    let topMatch = result.recommended_full_name || '';
    if (topMatch) { const found = alumni.find(a => a.name?.toLowerCase() === topMatch.toLowerCase()); if (!found) { const fn = topMatch.split(' ')[0].toLowerCase(); const fuzzy = alumni.find(a => a.name?.toLowerCase().startsWith(fn)); topMatch = fuzzy ? fuzzy.name : ''; } }
    if (!topMatch && alumni.length > 0) topMatch = [...alumni].sort((a, b) => (b.match_score || 0) - (a.match_score || 0))[0].name;
    return { guidance: result.guidance || `Here are UF alumni I found at ${company}:`, top_match: topMatch, recommendation_reason: result.recommendation_reason || '' };
  } catch (e) {
    const cffCount = alumni.filter(a => a.is_cff_member).length;
    const cffNote = cffCount > 0 ? ` ${cffCount} are CFF members — message them directly!` : '';
    const fallbackTop = alumni.length > 0 ? [...alumni].sort((a, b) => (b.match_score || 0) - (a.match_score || 0))[0].name : '';
    return { guidance: `Here are UF alumni I found at ${company}:` + cffNote, top_match: fallbackTop, recommendation_reason: '' };
  }
}

const UF_FILTER = `CRITICAL: Only include people who attended the University of Florida (UF) in Gainesville. Do NOT include alumni from FIU, FSU, UCF, USF, or any other school.`;
const NON_UF_SCHOOLS = ['fiu','florida international','fsu','florida state','ucf','central florida','usf','south florida','famu','fgcu'];

// Fuzzy company match: "Amazon" ↔ "AWS", but "Smartsheet" ≠ "Amazon"
function companyMatchesFuzzy(ac, tc) {
  if (!ac || !tc) return false;
  const a = ac.toLowerCase().trim(), t = tc.toLowerCase().trim();
  if (a === t || a.includes(t) || t.includes(a)) return true;
  const AL = { amazon:['amazon.com','amazon web services','aws'], google:['alphabet','google llc','google cloud','youtube','deepmind','waymo'], meta:['facebook','meta platforms','instagram','whatsapp'], microsoft:['microsoft corporation','linkedin','github','azure'], jpmorgan:['jp morgan','jpmorgan chase','j.p. morgan','chase'], 'goldman sachs':['goldman sachs group','gs'], 'morgan stanley':['morgan stanley & co'], 'bank of america':['bofa','merrill lynch','merrill'], deloitte:['deloitte consulting','deloitte llp'], ey:['ernst & young','ernst young','ey llp'], pwc:['pricewaterhousecoopers'], mckinsey:['mckinsey & company'], bcg:['boston consulting group'], 'johnson & johnson':['j&j','janssen'], 'procter & gamble':['p&g'], 'lockheed martin':['lockheed'], raytheon:['raytheon technologies','rtx'], 'general electric':['ge'], 'at&t':['att'], 'coca cola':['coca-cola'], pepsi:['pepsico'] };
  for (const [c, al] of Object.entries(AL)) { const all = [c, ...al]; if (all.some(n => t===n||t.includes(n)||n.includes(t)) && all.some(n => a===n||a.includes(n)||n.includes(a))) return true; }
  return false;
}
function filterAndDedupAlumni(rawAlumni, fallbackCompany) {
  const processed = rawAlumni.map(a => ({ ...a, company: a.company || fallbackCompany }));
  const filtered = processed.filter(a => {
    const deg = (a.degree_info || '').toLowerCase();
    if (NON_UF_SCHOOLS.some(s => deg.includes(s))) return false;
    const listed = (a.company || '').trim();
    if (listed && fallbackCompany && !companyMatchesFuzzy(listed, fallbackCompany)) { console.log(`[CompanyFilter] REMOVED "${a.name}" — works at "${listed}", NOT "${fallbackCompany}"`); return false; }
    if (!a.match_score || a.match_score < 65) a.match_score = Math.max(a.match_score || 65, 65);
    return true;
  });
  const seen = new Set();
  return filtered.filter(a => { const key = `${(a.name||'').toLowerCase()}_${(a.role_title||'').toLowerCase()}`; if (seen.has(key)) return false; seen.add(key); return true; });
}
async function verifyAlumniRoles(b44, alumni, tc) {
  if (!alumni?.length) return alumni;
  const al = alumni.slice(0,8).map(a => ({ name:a.name, claimed_title:a.role_title, claimed_company:a.company, linkedin_url:a.linkedin_url||'', claimed_degree:a.degree_info||'' }));
  try {
    const v = await b44.integrations.Core.InvokeLLM({ prompt:`STRICT verifier. For each person, determine TWO things:\n1. Do they CURRENTLY work at "${tc}"?\n"high": clear recent evidence (2024-2026) at ${tc}. "medium": some connection, unconfirmed. "low": no evidence or works ELSEWHERE or "Ex-${tc}". Past employment ≠ current. AWS certs ≠ Amazon employee.\n2. Did they attend the University of Florida (UF, Gainesville)?\n"confirmed": ONLY if you find EXPLICIT "University of Florida" or "UF" (Gainesville campus) in their education section. Must be the actual school they attended.\n"unconfirmed": if their education lists ANY OTHER school (e.g. Mt. San Antonio College, FIU, FSU, UCF), or if no UF education is found at all. Name similarity alone is NOT evidence of UF attendance. If their LinkedIn education section shows a non-UF school, mark "unconfirmed" and put the actual school in actual_school.\nCRITICAL: Do NOT assume someone attended UF just because their name appears in a search. Verify the EDUCATION SECTION explicitly.\nPEOPLE:\n${JSON.stringify(al)}`, add_context_from_internet:true, model:'gemini_3_flash', response_json_schema:{ type:"object", properties:{ verifications:{ type:"array", items:{ type:"object", properties:{ name:{type:"string"}, confidence:{type:"string",enum:["high","medium","low"]}, actual_company:{type:"string"}, actual_title:{type:"string"}, reason:{type:"string"}, uf_education:{type:"string",enum:["confirmed","unconfirmed"]}, actual_school:{type:"string"} }, required:["name","confidence","reason","uf_education"] } } }, required:["verifications"] } });
    const vm = new Map(); (v.verifications||[]).forEach(x => vm.set(x.name?.toLowerCase()?.trim(), x));
    return alumni.map(a => { const x = vm.get(a.name?.toLowerCase()?.trim()); if (!x) return { ...a, confidence:'medium', verification_note:'Unverified — check LinkedIn', uf_verified: false }; const r = { ...a, confidence:x.confidence, verification_note:x.reason||'', uf_verified: x.uf_education==='confirmed' }; if (x.uf_education==='unconfirmed') { r.confidence = 'low'; r.verification_note = (x.actual_school ? `Education: ${x.actual_school} (not UF). ` : 'UF connection unverified. ') + (x.reason||''); r.match_score = Math.min(r.match_score||0,30); r.uf_verified = false; } if (x.confidence==='low') { r.verification_note = (x.actual_company?`May work at ${x.actual_company}. `:'') + r.verification_note; r.match_score = Math.min(r.match_score||0,40); } if (x.confidence==='medium' && r.uf_verified) r.match_score = Math.min(r.match_score||65,70); if (x.actual_title && x.confidence!=='low') r.role_title = x.actual_title; return r; });
  } catch(e) { return alumni.map(a => ({ ...a, confidence:'medium', verification_note:'Verification unavailable', uf_verified: false })); }
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

// P3 FIX: Stricter short answer detection — reduced threshold to 3 words,
// and exclude messages containing action verbs (those are new commands, not answers).
function isShortAnswer(message) {
  const trimmed = message.trim();
  const words = trimmed.split(/\s+/);
  // Action verbs indicate a new command, not an answer to a clarifying question
  const ACTION_VERBS = /\b(?:draft|find|research|review|tailor|prep|prepare|build|create|help|show|scan|check|explore|negotiate|write|compose)\b/i;
  if (ACTION_VERBS.test(trimmed)) return false;
  // Short answers: 1-3 words, or bare affirmatives
  if (words.length <= 3) return true;
  if (/^(?:yes|yeah|yep|sure|ok|okay|please|definitely|absolutely|do it|go ahead|sounds good)[.!,]?\s*$/i.test(trimmed)) return true;
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
- Student's major: ${profile.target_industry || user.major || 'undeclared'}
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
    success: true, response: `Here's your follow-up to **${targetName}**:`,
    message_type: 'outreach_draft',
    payload: { recipient: result.recipient || targetName, recipient_title: pipelineRecord?.alumni_role || '', recipient_company: targetCompanyName, channel: result.channel || 'LinkedIn', subject: result.subject || '', message: result.message_body || '', ask_type: 'follow_up' }
  });
}

// ═══════════════════════════════════════════════════════════
//  REPLY HELP HANDLER
// ═══════════════════════════════════════════════════════════

async function handleReplyHelp(base44, user, profile, resolvedMessage, pipelineData, profileContext, studentMajor, studentGradYear) {
  console.log('Intent: reply_help');
  let contactName = '', contactCompany = '', pipelineRecord = null;
  // Match "from [Name] at [Company]" — capture name before "at", company after
  const nameMatch = resolvedMessage.match(/(?:reply|response|heard back)\s+from\s+([A-Z][a-zA-Z.''-]+(?:\s+[A-Z][a-zA-Z.''-]+){0,3})\s+at\s+([A-Z][\w\s&.''-]{1,40}?)(?:\s*[!.:,]|\s+(?:here|she|he|they|said))/i);
  const nameOnlyMatch = !nameMatch && resolvedMessage.match(/(?:reply|response|heard back)\s+from\s+([A-Z][a-zA-Z.''-]+(?:\s+[A-Z][a-zA-Z.''-]+){0,3})(?:\s*[!.:,]|\s+(?:here|she|he|they|said))/i);
  if (nameMatch) { contactName = nameMatch[1]?.trim() || ''; contactCompany = nameMatch[2]?.trim() || ''; }
  else if (nameOnlyMatch) { contactName = nameOnlyMatch[1]?.trim() || ''; }
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
//  THANK-YOU NOTE HANDLER
// ═══════════════════════════════════════════════════════════

async function handleThankYouNote(base44, user, profile, resolvedMessage, pipelineData, targetCompanies, profileContext) {
  console.log('Intent: thank_you_note');
  const companyMatch = resolvedMessage.match(/(?:at|for|with)\s+(\w[\w\s&.''-]{1,40})/i);
  const company = companyMatch?.[1]?.trim() || targetCompanies[0] || '';
  const hasDetails = resolvedMessage.length > 80 || /interviewed\s+(?:me|with|by)/i.test(resolvedMessage) || /talked about|discussed|mentioned|specific/i.test(resolvedMessage);
  if (!hasDetails) {
    return Response.json({ success: true, response: `I'd love to help you write a killer thank-you note! 📝 Tell me:\n\n- **Who interviewed you?** (name and title if you know it)\n- **What did you talk about?** Any specific topics, projects, or questions they asked?\n- **Anything you wish you had said** or want to emphasize?\n- **When did they say they'd get back to you?**\n\nThe more detail you give me, the more personal — and effective — the note will be.`, message_type: 'text', payload: {} });
  }
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `You are FASTIQ. Draft a professional thank-you email after an interview.\n\n${profileContext}\n\nRequest/details: "${resolvedMessage}"\nCompany: ${company}\nStudent name: ${user.full_name || 'Gator Student'}\n\nRULES:\n1. Send within 24 hours of the interview\n2. Reference ONE specific thing discussed (personal, not templated)\n3. Briefly reinforce why the student is a strong fit\n4. Express genuine enthusiasm for the team/project/company\n5. Keep under 150 words\n6. Professional but warm tone\n7. Include subject line\n8. Sign with full name\n\nIf multiple interviewers are mentioned, create a separate draft for each referencing something DIFFERENT.`,
    response_json_schema: { type: "object", properties: { response: { type: "string" }, drafts: { type: "array", items: { type: "object", properties: { recipient: { type: "string" }, recipient_title: { type: "string" }, subject: { type: "string" }, message: { type: "string" } }, required: ["recipient","subject","message"] } }, multiple_interviewers_detected: { type: "boolean" }, suggested_actions: { type: "array", items: { type: "string" } } }, required: ["response","drafts"] }
  });
  trackActivity(base44, user.email, profile.id, 'message_draft', company);
  return Response.json({ success: true, response: result.response || `Here's your thank-you note:`, message_type: 'thank_you_note', payload: { drafts: result.drafts || [], ask_about_others: !result.multiple_interviewers_detected, company, suggested_actions: result.suggested_actions || ['Set a reminder to follow up if you don\'t hear back in a week'] } });
}

// ═══════════════════════════════════════════════════════════
//  OFFER NEGOTIATION HANDLER
// ═══════════════════════════════════════════════════════════

async function handleOfferNegotiation(base44, user, profile, resolvedMessage, pipelineData, targetCompanies, profileContext) {
  console.log('Intent: offer_negotiation');
  const lower = resolvedMessage.toLowerCase();
  // If the student says they accepted, redirect to network thank-you
  if (lower.includes('accepted an offer') || lower.includes('accepted the offer') || lower.includes('i accepted')) {
    return await handleNetworkThankYou(base44, user, profile, resolvedMessage, pipelineData, profileContext);
  }
  const companyMatch = resolvedMessage.match(/(?:offer\s+from|at|with)\s+(\w[\w\s&.''-]{1,40})/i);
  const company = companyMatch?.[1]?.trim() || targetCompanies[0] || '';
  const hasOfferDetails = /\$[\d,]+|salary|base|bonus|equity|stock|start date|benefits/i.test(resolvedMessage);
  const offerPipeline = pipelineData.find(p => company && p.company?.toLowerCase().includes(company.toLowerCase()));
  if (offerPipeline?.id) {
    base44.entities.NetworkingPipeline.update(offerPipeline.id, { status: 'offer', offer_date: new Date().toISOString(), status_date: new Date().toISOString() }).catch(() => {});
  }
  if (!hasOfferDetails) {
    return Response.json({ success: true, response: `🎉🎉🎉 **CONGRATULATIONS!** You got an offer from **${company || 'them'}**! All your hard work paid off.\n\nBefore you accept, let me help you make sure you're getting the best deal. Tell me:\n\n- **Role title**\n- **Base salary**\n- **Bonus** (if any)\n- **Equity/stock** (if any)\n- **Location**\n- **Start date**\n- **Any other benefits** they mentioned\n\nI'll research how this compares to market rates and help you negotiate.`, message_type: 'text', payload: {} });
  }
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `You are FASTIQ. A student received a job offer with details. Analyze and help negotiate.\n\n${profileContext}\n\nOFFER DETAILS: "${resolvedMessage}"\nCompany: ${company || 'the company'}\n\nINSTRUCTIONS:\n1. Research salary benchmarks for this role at this company in this location\n2. Determine if above, at, or below market median\n3. If BELOW: provide strong negotiation script with specific dollar amounts\n4. If AT: acknowledge solid, suggest negotiating signing bonus/start date/remote\n5. If ABOVE: celebrate, suggest asking about equity vesting/review timeline/dev budget\n6. Provide complete email negotiation script with specific language\n7. List items to negotiate beyond salary\n8. Include timeline advice`,
    add_context_from_internet: true,
    response_json_schema: { type: "object", properties: { response: { type: "string" }, company: { type: "string" }, role: { type: "string" }, location: { type: "string" }, base_salary: { type: "string" }, total_comp: { type: "string" }, market_median: { type: "string" }, market_comparison: { type: "string", enum: ["above_market","at_market","below_market"] }, market_analysis: { type: "string" }, negotiation_advice: { type: "string" }, negotiation_script: { type: "string" }, beyond_salary: { type: "array", items: { type: "string" } }, suggested_actions: { type: "array", items: { type: "string" } } }, required: ["response","market_comparison","negotiation_script"] }
  });
  return Response.json({ success: true, response: result.response || "🎉 Here's your offer analysis:", message_type: 'offer_celebration', payload: { company: result.company || company, role: result.role || '', location: result.location || '', base_salary: result.base_salary || '', total_comp: result.total_comp || '', market_median: result.market_median || '', market_comparison: result.market_comparison || 'at_market', market_analysis: result.market_analysis || '', negotiation_advice: result.negotiation_advice || '', negotiation_script: result.negotiation_script || '', beyond_salary: result.beyond_salary || [], suggested_actions: result.suggested_actions || ['Thank your network — the people who helped you deserve to know!', 'Set a reminder to respond within the timeline'] } });
}

// ═══════════════════════════════════════════════════════════
//  NETWORK THANK-YOU HANDLER
// ═══════════════════════════════════════════════════════════

async function handleNetworkThankYou(base44, user, profile, resolvedMessage, pipelineData, profileContext) {
  console.log('Intent: network_thank_you');
  const helpfulContacts = pipelineData.filter(p => ['replied','interview','offer'].includes(p.status));
  if (helpfulContacts.length === 0) {
    return Response.json({ success: true, response: "It looks like you don't have any alumni contacts who replied or helped you in your pipeline yet. Once you start getting responses, I can help you draft personalized thank-you messages!", message_type: 'career_advice', payload: { suggested_actions: ['Research a target company', 'Find UF alumni at your dream companies'] } });
  }
  const offerCompany = pipelineData.find(p => p.status === 'offer')?.company || '';
  const contactsList = helpfulContacts.map(c => `- ${c.alumni_name} at ${c.company} (status: ${c.status}, notes: ${(c.notes || '').substring(0,200)})`).join('\n');
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `You are FASTIQ. Draft personalized thank-you messages for the student's network.\n\n${profileContext}\n\n${offerCompany ? `ACCEPTED OFFER AT: ${offerCompany}` : ''}\n\nCONTACTS WHO HELPED:\n${contactsList}\n\nFor EACH contact:\n1. Start with "Hi [First Name],"\n2. If student accepted an offer, share the news\n3. Reference something SPECIFIC from their interaction\n4. Thank genuinely for their specific help\n5. Mention being a fellow Gator\n6. Keep 3-4 sentences max\n7. Sign with student's first name\n8. Make each DIFFERENT — not templated`,
    response_json_schema: { type: "object", properties: { response: { type: "string" }, contacts: { type: "array", items: { type: "object", properties: { name: { type: "string" }, company: { type: "string" }, status: { type: "string" }, message: { type: "string" } }, required: ["name","company","message"] } }, suggested_actions: { type: "array", items: { type: "string" } } }, required: ["response","contacts"] }
  });
  trackActivity(base44, user.email, profile.id, 'message_draft', 'network_thank_you');
  return Response.json({ success: true, response: result.response || `Here are personalized thank-you messages for ${helpfulContacts.length} people who helped you:`, message_type: 'network_thank_you', payload: { contacts: result.contacts || helpfulContacts.map(c => ({ name: c.alumni_name, company: c.company, status: c.status, message: '' })), suggested_actions: result.suggested_actions || ['Update your LinkedIn with your new role', 'Stay connected with these alumni'] } });
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
    if (!message) return Response.json({ error: 'Message is required' }, { status: 400 });

    // Load recent conversation messages from DB — single source of truth
    let recentDbMessages = [];
    try {
      const dbMessages = await base44.entities.ProAgentConversation.filter(
        { user_email: user.email }, '-created_date', 8
      );
      // Reverse to chronological order (oldest first)
      recentDbMessages = (dbMessages || []).reverse();
    } catch(e) { console.log('Could not load conversation history:', e.message); }

    // P1 FIX: Belt-and-suspenders — if the current user message isn't in DB yet
    // (race condition), append it to the in-memory history so we always have context
    const lastUserMsg = [...recentDbMessages].reverse().find(m => m.role === 'user');
    if (!lastUserMsg || lastUserMsg.content?.substring(0, 100) !== message.substring(0, 100)) {
      recentDbMessages.push({ role: 'user', content: message, message_type: 'text' });
    }

    // Build conversation_history string from DB messages
    const conversation_history = recentDbMessages
      .map(m => `${m.role === 'user' ? 'Student' : 'Agent'}: ${(m.content || '').substring(0, 300)}`)
      .join('\n\n');

    // Load profile
    let profile = {};
    try {
      const profiles = await base44.entities.FastTrackProProfile.filter({ user_email: user.email });
      profile = profiles?.[0] || {};
    } catch(e) {}

    // ═══════════════════════════════════════════════════════
    //  ACTIVE FLOW CHECK — OVERRIDES INTENT CLASSIFICATION
    // ═══════════════════════════════════════════════════════
    const EXIT_PHRASES = /^(?:stop|cancel|skip|quit|exit|nevermind|never mind|i'?ll do this later|do this later|go back|back)[.!]?\s*$/i;

    console.log(`[FlowCheck] profile.id=${profile.id}, active_flow="${profile.active_flow || 'null'}", flow_step="${profile.flow_step || 'null'}"`);

    if (profile.active_flow && profile.id) {
      console.log(`[ActiveFlow] INTERCEPTED — routing to "${profile.active_flow}" step="${profile.flow_step}", skipping all intent classification`);

      if (EXIT_PHRASES.test(message.trim())) {
        console.log(`[ActiveFlow] User exited flow`);
        await base44.entities.FastTrackProProfile.update(profile.id, { active_flow: null, flow_step: null });
        return Response.json({ success: true, response: "No problem! You can come back to this anytime. What else can I help with?", message_type: 'career_advice', payload: { suggested_actions: ['Research my target companies', 'Find UF alumni', 'Help me with my career'] } });
      }

      if (profile.active_flow === 'resume_builder') {
        const step = profile.flow_step || 'contact_info';
        let flowData = {};
        try { flowData = JSON.parse(profile.flow_data || '{}'); } catch(e) { flowData = {}; }
        const fn = (user.full_name || '').split(' ')[0] || 'there';
        console.log(`[ResumeBuilder] step="${step}", flowData keys=${Object.keys(flowData).join(',')}`);
        try {
          if (step === 'contact_info') {
            const emailM = message.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
            const phoneM = message.match(/(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/);
            const liM = message.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/i);
            const nameLine = message.split(/\n/)[0].replace(/[\w.+-]+@[\w-]+\.[\w.]+/, '').replace(/(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/, '').trim();
            flowData.contact = { name: nameLine.replace(/[^a-zA-Z\s'-]/g, '').trim() || user.full_name || '', email: emailM?.[0] || user.email || '', phone: phoneM?.[0] || '', linkedin: liM?.[0] || '' };
            await base44.entities.FastTrackProProfile.update(profile.id, { flow_step: 'education', flow_data: JSON.stringify(flowData) });
            return Response.json({ success: true, response: `Got it, ${fn}!\n- **Name:** ${flowData.contact.name || '(not provided)'}\n- **Email:** ${flowData.contact.email || '(not provided)'}\n- **Phone:** ${flowData.contact.phone || '(not provided)'}\n${flowData.contact.linkedin ? `- **LinkedIn:** ${flowData.contact.linkedin}\n` : ''}\n**Step 2: Education** 🎓\nTell me about your education at UF:\n- **Your major** (and minor if you have one)\n- **Expected graduation** (e.g., May 2026)\n- **GPA** (if 3.0+, include it!)\n- **Any relevant coursework**`, message_type: 'career_advice', payload: { suggested_actions: ['Type your major, graduation date, and GPA'] } });
          }
          if (step === 'education') {
            flowData.education = message;
            await base44.entities.FastTrackProProfile.update(profile.id, { flow_step: 'experience', flow_data: JSON.stringify(flowData) });
            return Response.json({ success: true, response: `Awesome — your UF education is a huge asset! 💪\n\n**Step 3: Experience** 💼\nTell me about ANY work experience:\n- **Jobs** (even part-time, retail, food service)\n- **Internships**\n- **Campus jobs** (RA, tutoring, research assistant)\n- **Volunteer work**\n\nFor each: **where**, **what title**, **when**, and **what you did**.\n\nDon't worry if it doesn't feel "impressive" — I'll make it shine!`, message_type: 'career_advice', payload: { suggested_actions: ['Describe your work experience', "I don't have any work experience yet"] } });
          }
          if (step === 'experience') {
            flowData.experience = message;
            await base44.entities.FastTrackProProfile.update(profile.id, { flow_step: 'skills', flow_data: JSON.stringify(flowData) });
            return Response.json({ success: true, response: `Great stuff, ${fn}!\n\n**Step 4: Skills** 🛠️\nList your skills:\n- **Technical** (Excel, Python, SQL, etc.)\n- **Software/tools** (Microsoft Office, Google Suite, etc.)\n- **Languages**\n- **Certifications**\n- **Soft skills** (leadership, teamwork, etc.)\n\nJust list them out — I'll organize them.`, message_type: 'career_advice', payload: { suggested_actions: ['List your skills'] } });
          }
          if (step === 'skills') {
            flowData.skills = message;
            await base44.entities.FastTrackProProfile.update(profile.id, { flow_step: 'projects', flow_data: JSON.stringify(flowData) });
            return Response.json({ success: true, response: `Nice skill set! 🔥\n\n**Step 5 (last one!): Projects & Activities** 🚀\n- **Class projects** (capstone, group projects)\n- **Personal projects** (apps, websites)\n- **Student organizations**\n- **Leadership roles**\n- **Hackathons, competitions, awards**\n\nIf none, just say "none" and I'll build the resume with what we have!`, message_type: 'career_advice', payload: { suggested_actions: ['Describe your projects', "None — let's build the resume"] } });
          }
          if (step === 'projects') {
            flowData.projects = message;
            await base44.entities.FastTrackProProfile.update(profile.id, { flow_step: 'complete', active_flow: null, flow_data: JSON.stringify(flowData) });
            const resumeResult = await base44.integrations.Core.InvokeLLM({
              prompt: `Build a professional one-page resume.\n\nCONTACT: ${JSON.stringify(flowData.contact || {})}\nEDUCATION: ${flowData.education || 'University of Florida'}\nEXPERIENCE: ${flowData.experience || 'None'}\nSKILLS: ${flowData.skills || 'None'}\nPROJECTS: ${flowData.projects || 'None'}\n\nWrite strong action-verb bullets. Quantify where possible. Keep ATS-friendly. Do NOT fabricate.`,
              response_json_schema: { type: "object", properties: { resume: { type: "object", properties: { contact: { type: "object", properties: { name: {type:"string"}, email: {type:"string"}, phone: {type:"string"}, linkedin: {type:"string"}, location: {type:"string"} } }, summary: {type:"string"}, education: { type: "array", items: { type: "object", properties: { school: {type:"string"}, degree: {type:"string"}, graduation_date: {type:"string"}, gpa: {type:"string"}, relevant_coursework: {type:"string"} } } }, experience: { type: "array", items: { type: "object", properties: { company: {type:"string"}, title: {type:"string"}, dates: {type:"string"}, bullets: { type: "array", items: {type:"string"} } } } }, skills: { type: "object", properties: { technical: { type:"array", items:{type:"string"} }, tools: { type:"array", items:{type:"string"} }, soft: { type:"array", items:{type:"string"} } } }, projects: { type: "array", items: { type: "object", properties: { name: {type:"string"}, bullets: { type: "array", items: {type:"string"} } } } } } }, resume_text: {type:"string"}, summary: {type:"string"} }, required: ["resume","resume_text","summary"] }
            });
            if (resumeResult.resume_text) { try { await base44.entities.FastTrackProProfile.update(profile.id, { resume_text: resumeResult.resume_text.substring(0, 10000) }); } catch(e) {} }
            return Response.json({ success: true, response: `🎉 **Your resume is ready, ${fn}!** ${resumeResult.summary || 'Built from everything you shared.'}\n\nYou can now:\n→ **Tailor it** for specific jobs\n→ **Review it** for feedback`, message_type: 'resume_tailored', payload: { resume: resumeResult.resume || {}, ats_score: 75, keywords_matched: [], keywords_added: [], keywords_missing: [], changes_summary: resumeResult.summary || 'Resume built from scratch', changes: [], company_name: 'Master Resume', role_title: 'General' } });
          }
          // Unknown step
          console.log(`[ResumeBuilder] Unknown step "${step}"`);
        } catch (flowErr) {
          console.error(`[ActiveFlow] CRASH in resume_builder: ${flowErr.message}`);
          await base44.entities.FastTrackProProfile.update(profile.id, { active_flow: null, flow_step: null });
          return Response.json({ success: true, response: "Sorry, something went wrong with the resume builder. Say **\"Help me build a resume\"** to try again.", message_type: 'text', payload: {} });
        }
      }

      // Unknown flow — clear and fall through
      await base44.entities.FastTrackProProfile.update(profile.id, { active_flow: null, flow_step: null });
    }

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

    // P0 FIX: Read major/graduation_year from User entity first, fallback to profile fields
    const studentMajor = user.major || profile.target_industry || 'undeclared';
    const studentGradYear = user.graduation_year || 'unknown';

    // Position type config for personalized searches
    const POSITION_TYPE_CONFIGS = {
      summer_internship: { label: 'Summer Internship', searchTerms: 'summer internship, intern', roleLabel: 'internship', outreachPhrase: 'a summer internship', salaryType: 'intern compensation (hourly rate + housing stipend)' },
      semester_internship: { label: 'Internship / Co-op', searchTerms: 'internship, co-op, cooperative education', roleLabel: 'internship', outreachPhrase: 'an internship or co-op', salaryType: 'intern compensation (hourly rate + housing stipend)' },
      entry_level: { label: 'Entry-level / New Grad', searchTerms: 'entry-level, new grad, associate, junior', roleLabel: 'entry-level role', outreachPhrase: 'an entry-level position', salaryType: 'entry-level annual salary' },
      experienced: { label: 'Experienced Position', searchTerms: 'mid-level, experienced, 2-5 years', roleLabel: 'mid-level role', outreachPhrase: 'a position', salaryType: 'salary range' },
      exploring: { label: 'Exploring', searchTerms: 'entry-level, internship, new grad', roleLabel: 'role', outreachPhrase: 'opportunities', salaryType: 'salary range' },
    };
    const positionType = profile.position_type || 'entry_level';
    const ptConfig = POSITION_TYPE_CONFIGS[positionType] || POSITION_TYPE_CONFIGS.entry_level;
    const startTimeline = profile.start_timeline || '';
    const jobSearchType = profile.job_search_type || 'entry_level';
    const JST = { internship: { label: 'internship', plural: 'internships', noun: 'internships', noMatch: 'No internships' }, entry_level: { label: 'entry-level role', plural: 'entry-level roles', noun: 'entry-level roles', noMatch: 'No entry-level roles' }, co_op: { label: 'co-op or internship', plural: 'co-ops and internships', noun: 'co-ops and internships', noMatch: 'No co-ops' }, exploring: { label: 'opportunity', plural: 'opportunities', noun: 'roles', noMatch: 'Limited positions' } };
    const jstConfig = JST[jobSearchType] || JST.entry_level;

    const profileContext = `STUDENT PROFILE:
- Name: ${user.full_name || 'Gator Student'}
- Major: ${studentMajor}
- Graduation: ${studentGradYear}
- Position Type Seeking: ${ptConfig.label}
- Start Timeline: ${startTimeline || 'not set'}
- Target Industry: ${profile.target_industry || 'not specified'}
- Target Companies: ${(profile.target_companies || []).join(', ') || 'none set'}
- Location: ${profile.location_preference || 'not set'}
- Challenge: ${profile.biggest_challenge || 'not set'}
- Stats: ${profile.alumni_discovered || 0} alumni, ${profile.messages_drafted || 0} msgs, ${profile.companies_researched || 0} researched${pipelineSummary}${staleSummary}

CRITICAL POSITION TYPE CONTEXT:
- The student is looking for: ${ptConfig.label}
- When searching for roles, focus on: ${ptConfig.searchTerms}
- When drafting outreach, reference they are looking for: ${ptConfig.outreachPhrase}
- For salary data, show: ${ptConfig.salaryType}`;

    // P3 FIX: Stricter confirmation detection — must be ONLY a confirmation word(s) with no extra content,
    // OR an explicit "yes, research X" pattern. "Ok Google" or "Sure, can you also..." won't match.
    const confirmationMatch = message.match(/^(?:yes|yeah|yep|sure|ok|okay|correct|right|go ahead)[,.]?\s*(?:research|look into|check|find|scan)\s+(.+)/i);
    const isBareSonfirmation = /^(?:yes|yeah|yep|sure|ok|okay|correct|right|go ahead|do it|please|definitely|absolutely)[.!,]?\s*$/i.test(message.trim());
    const isConfirmation = confirmationMatch || isBareSonfirmation;
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

    // 0. RESUME BUILDER — set active_flow and start conversational flow
    if (detectResumeBuilder(resolvedMessage)) {
      console.log('Intent: resume_builder — starting flow');
      if (profile.id) {
        await base44.entities.FastTrackProProfile.update(profile.id, {
          active_flow: 'resume_builder', flow_step: 'contact_info', flow_data: '{}'
        });
      }
      const firstName = (user.full_name || '').split(' ')[0] || 'there';
      const major = studentMajor;
      return Response.json({
        success: true,
        response: `No problem at all, ${firstName}! Lots of students don't have a resume yet — and honestly, you'd be surprised how much you've already done that employers value. Campus jobs, class projects, student orgs — it all counts.\n\nLet's build yours together, step by step. 💪\n\n**Step 1: The basics**\nTell me your:\n- **Full name** (as you want it on the resume)\n- **Best email**\n- **Phone number**\n- **LinkedIn URL** (if you have one — totally fine if not!)\n\nOnce I have these, we'll move to your education — and your UF degree is already a huge asset!`,
        message_type: 'career_advice',
        payload: { suggested_actions: ['Type your name, email, and phone number', 'Include LinkedIn URL if you have one'] }
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
        success: true, response: `Here's your resume review:`,
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
        success: true, response: `Here's how your resume matches:`,
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
- Major: ${studentMajor}, University of Florida, Class of ${studentGradYear}
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
        response: `Your resume has been tailored for **${roleTitle}** at **${companyName}**:`,
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

    // 3.5. THANK-YOU NOTE — must be checked BEFORE interview prep
    if (detectThankYouNote(resolvedMessage)) {
      return await handleThankYouNote(base44, user, profile, resolvedMessage, pipelineData, targetCompanies, profileContext);
    }

    // 4. INTERVIEW PREP
    if (detectInterviewPrep(resolvedMessage)) {
      console.log('Intent: interview_prep');
      const companyMatch = resolvedMessage.match(/(?:interview\s+(?:at|for|with)|prep.*?for)\s+(\w[\w\s&.''-]{1,40})/i);
      const company = companyMatch?.[1]?.trim() || targetCompanies[0] || '';
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FASTIQ. Prepare this student for an interview.\n\n${profileContext}\n\nRequest: "${resolvedMessage}"\n${company ? `Company: ${company}` : ''}\n\nResearch the company's interview process. Personalize questions based on the student's major (${studentMajor}) and target role. Include behavioral, technical, and culture-fit questions.`,
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
        success: true, response: `Here's your interview prep${company ? ' for **' + company + '**' : ''}:`,
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
        success: true, response: `Here's your LinkedIn review:`,
        message_type: 'linkedin_review', payload: result
      });
    }

    // 6. SALARY NEGOTIATION
    if (detectSalaryNegotiation(resolvedMessage)) {
      console.log('Intent: salary_negotiation');
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FASTIQ. Provide salary intelligence for this student.\n\n${profileContext}\n\nRequest: "${resolvedMessage}"\n\nThe student is seeking: ${ptConfig.label}. Find real ${ptConfig.salaryType} data for ${ptConfig.searchTerms} ${profile.target_industry || ''} roles${profile.location_preference ? ' in ' + profile.location_preference : ''}.${positionType === 'summer_internship' || positionType === 'semester_internship' ? ' For internships, show hourly rate, housing stipend if offered, and total estimated compensation.' : ' Include negotiation tactics and a sample negotiation script.'}`,
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
        success: true, response: `Here's the salary data:`,
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
        success: true, response: `Here's your cover letter:`,
        message_type: 'cover_letter', payload: result
      });
    }

    // 7.5 BATCH TARGET COMMAND
    if (detectBatchTargetCommand(resolvedMessage) && targetCompanies.length > 0) {
      console.log('Intent: batch_target_scan for', targetCompanies.join(', '));
      const major = studentMajor, industry = profile.target_industry || 'any industry', gradYear = studentGradYear;
      const batchPromises = targetCompanies.map(company => base44.integrations.Core.InvokeLLM({ prompt: `Find current entry-level and intern ${major} roles at ${company} in 2026. Include role titles, locations, whether applications are open, and match for a ${major} major graduating ${gradYear}.`, add_context_from_internet: true }).then(webRes => base44.integrations.Core.InvokeLLM({ prompt: `You are FASTIQ. Parse research into structured roles at ${company} for a ${major} student in ${industry}.\n\nRESEARCH:\n${String(typeof webRes === 'string' ? webRes : JSON.stringify(webRes)).substring(0, 3000)}\n\nReturn relevant entry-level/intern roles. hiring_signal: hot/warm/cool. profile_match: strong/moderate/weak.`, response_json_schema: { type: "object", properties: { company_name: { type: "string" }, hiring_signal: { type: "string", enum: ["hot","warm","cool"] }, profile_match: { type: "string", enum: ["strong","moderate","weak"] }, roles: { type: "array", items: { type: "object", properties: { title: { type: "string" }, location: { type: "string" }, type: { type: "string", enum: ["internship","entry_level","mid_level"] }, applications_open: { type: "boolean" } }, required: ["title"] } }, summary: { type: "string" } }, required: ["company_name","hiring_signal","profile_match","roles","summary"] } })).catch(e => ({ company_name: company, hiring_signal: 'cool', profile_match: 'weak', roles: [], summary: `Could not research ${company}: ${e.message}` })));
      const batchResults = await Promise.all(batchPromises);
      const summaryLines = batchResults.map(r => `${r.company_name}: ${r.hiring_signal} hiring, ${r.roles?.length || 0} roles, ${r.profile_match} match`).join('\n');
      const bestMatch = batchResults.reduce((best, r) => { const score = (r.profile_match === 'strong' ? 3 : r.profile_match === 'moderate' ? 2 : 1) + (r.hiring_signal === 'hot' ? 3 : r.hiring_signal === 'warm' ? 2 : 1); return score > best.score ? { company: r.company_name, score } : best; }, { company: '', score: 0 });
      trackActivity(base44, user.email, profile.id, 'company_search', 'batch_targets');
      return Response.json({ success: true, response: `Here's what I found across your ${targetCompanies.length} target companies. ${bestMatch.company ? `**${bestMatch.company}** looks like your strongest opportunity right now.` : ''}`, message_type: 'batch_target_scan', payload: { companies: batchResults, best_match: bestMatch.company, summary: summaryLines } });
    }
    if (detectBatchTargetCommand(resolvedMessage) && targetCompanies.length === 0) {
      return Response.json({ success: true, response: "You don't have any target companies set yet. Add your target companies first (up to 5), and then I can scan all of them for relevant roles.", message_type: 'text', payload: {} });
    }

    // 7.6 SPECIFIC ALUMNI PROFILE — "Tell me about Carlos at Amazon"
    const alumniProfileQ = detectSpecificAlumniQuery(resolvedMessage);
    if (alumniProfileQ) {
      console.log('Intent: alumni_profile for', alumniProfileQ.name);
      let ar = null;
      try { const all = await base44.entities.DiscoveredAlumni.filter({ school_code: 'UF' }); ar = (all||[]).filter(a => new Date(a.expires_at) > new Date()).find(a => a.name?.toLowerCase().includes(alumniProfileQ.name.toLowerCase()) || alumniProfileQ.name.toLowerCase().includes(a.name?.toLowerCase().split(' ')[0] || '')); } catch(e) {}
      if (!ar) { const pm = pipelineData.find(p => p.alumni_name?.toLowerCase().includes(alumniProfileQ.name.toLowerCase())); if (pm) ar = { name: pm.alumni_name, role_title: pm.alumni_role, company: pm.company }; }
      const pn = ar?.name || alumniProfileQ.name, pr = ar?.role_title || '', pc = ar?.company || alumniProfileQ.company || '', pf = pn.split(' ')[0];
      if (pr && pc) return Response.json({ success: true, response: `**${pn}** is a ${pr} at ${pc}.${ar?.degree_info ? ' ' + ar.degree_info + '.' : ''} As a fellow Gator, ${pf} is likely to respond to a warm intro.\n\nWant me to draft a message to ${pf}?`, message_type: 'text', payload: { suggested_actions: [`Draft intro to ${pf} →`, `Find more alumni at ${pc} →`] } });
      const pRes = await base44.integrations.Core.InvokeLLM({ prompt: `Find info about ${pn}${pc ? ' at ' + pc : ''}. Current role, company, UF connection. 2-3 sentences max.`, add_context_from_internet: true, response_json_schema: { type: "object", properties: { summary: { type: "string" }, company: { type: "string" } }, required: ["summary"] } });
      return Response.json({ success: true, response: `${pRes.summary || `**${pn}**${pRes.company || pc ? ' works at ' + (pRes.company || pc) : ''}.`}\n\nWant me to draft a warm intro to ${pf}?`, message_type: 'text', payload: { suggested_actions: [`Draft intro to ${pf} →`, (pRes.company || pc) ? `Find more alumni at ${pRes.company || pc} →` : `Research ${pf}'s company →`] } });
    }
    // 7.7 CONNECT REQUEST — "Connect with Carlos on LinkedIn"
    const connectReq = detectConnectRequest(resolvedMessage);
    if (connectReq) {
      console.log('Intent: connect_request for', connectReq.name);
      let ar2 = null;
      try { const all = await base44.entities.DiscoveredAlumni.filter({ school_code: 'UF' }); ar2 = (all||[]).filter(a => new Date(a.expires_at) > new Date()).find(a => a.name?.toLowerCase().includes(connectReq.name.toLowerCase())); } catch(e) {}
      if (!ar2) { const pm = pipelineData.find(p => p.alumni_name?.toLowerCase().includes(connectReq.name.toLowerCase())); if (pm) ar2 = { name: pm.alumni_name, role_title: pm.alumni_role, company: pm.company }; }
      const rN = ar2?.name || connectReq.name, rT = ar2?.role_title || '', rC = ar2?.company || connectReq.company || '';
      const cRes = await base44.integrations.Core.InvokeLLM({ prompt: `Draft a SHORT LinkedIn connection request (under 280 chars) from ${user.full_name || 'a UF student'}, ${studentMajor} major at UF (${studentGradYear}), to ${rN}, ${rT} at ${rC}. Mention shared UF connection, their role, student looking for ${ptConfig.outreachPhrase}. Warm, brief. End with "Go Gators!" No clichés.`, response_json_schema: { type: "object", properties: { message: { type: "string" } }, required: ["message"] } });
      trackActivity(base44, user.email, profile.id, 'message_draft', rN);
      return Response.json({ success: true, response: `Here's your connection request for **${rN}**:`, message_type: 'outreach_draft', payload: { recipient: rN, recipient_title: rT, recipient_company: rC, channel: 'LinkedIn', subject: '', message: cRes.message || '', ask_type: 'connection_request', suggested_next_steps: [`Find more alumni at ${rC || 'their company'} →`, 'Research another company →'] } });
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
          match_score: Math.max(a.match_score || 65, 65),
          degree_info: a.degree_info, location: a.location,
          linkedin_url: a.linkedin_url || '', verified: a.verified || false
        })));
        saveToPipeline(base44, user.email, alumniCompany, enrichedCached);
        trackActivity(base44, user.email, profile.id, 'alumni_view', alumniCompany);
        const guidanceResult = await generateAlumniGuidance(base44, enrichedCached, alumniCompany, profileContext);
        const topName = guidanceResult.top_match || enrichedCached[0]?.name || '';
        const topFirst = topName.split(' ')[0];
        const alumniResp = `I found **${enrichedCached.length} UF alumni** at ${alumniCompany}:`;
        return Response.json({
          success: true, response: alumniResp,
          message_type: 'alumni_card',
          payload: { alumni: enrichedCached, cached: true, top_match: guidanceResult.top_match, recommendation_reason: guidanceResult.recommendation_reason, suggested_actions: topName ? [`Draft message to ${topFirst} →`, `Research ${alumniCompany} →`] : [`Research ${alumniCompany} →`] }
        });
      }

      // Web research — strict current-employee filter with anti-hallucination
      const webResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Find people who attended the University of Florida (UF, Gainesville) and CURRENTLY WORK at ${alumniCompany} as employees.

ANTI-HALLUCINATION RULES (CRITICAL):
- ONLY return alumni where you found EXPLICIT, VERIFIABLE evidence they CURRENTLY work at ${alumniCompany}
- Their LinkedIn headline or current experience MUST list ${alumniCompany} as their CURRENT employer
- Do NOT infer, assume, or project past experience as current employment
- Do NOT include people who USED TO work at ${alumniCompany} but now work elsewhere (look for "Ex-", "Former", or a different current employer)
- Do NOT include people who have ${alumniCompany} certifications, training, or partnerships but work at a DIFFERENT company
- Do NOT include people at companies with similar names, subsidiaries, or partners
- If you cannot confirm from your sources that someone CURRENTLY works at ${alumniCompany}, EXCLUDE them entirely
- It is BETTER to return fewer verified results than many unverified ones
- If you find ZERO confirmed current employees, return an empty list — do NOT fabricate entries

${UF_FILTER}

For each CONFIRMED person, include: full name, CURRENT job title exactly as listed, CURRENT company name exactly as listed, UF degree info, and location.`,
        add_context_from_internet: true,
      });

      const alumniResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Parse research into structured alumni profiles for UF alumni at ${alumniCompany}.

${profileContext}

${UF_FILTER}

COMPANY VALIDATION (CRITICAL — apply BEFORE scoring):
- For each person, set "company" to the EXACT company name listed on their profile/LinkedIn
- ONLY include people whose current employer IS "${alumniCompany}" or a direct division of it (e.g. "Amazon Web Services" counts for Amazon, "Google Cloud" counts for Google)
- EXCLUDE anyone whose current company is a DIFFERENT company, even if they mention ${alumniCompany} as a client, partner, or past employer
- EXCLUDE anyone who USED TO work at ${alumniCompany} but now works elsewhere
- If unsure whether someone currently works at ${alumniCompany}, EXCLUDE them
- DEDUPLICATE same name+title
- For each alumni, try to find their LinkedIn profile URL if in the research data

MATCH SCORE RULES — MINIMUM 65% for verified current employees:
SCORING TIERS:
- FLOOR: 65% — Any UF alum currently employed at ${alumniCompany}
- SAME INDUSTRY as student's target (${profile.target_industry || 'their field'}): 70%+
- RELEVANT DEPARTMENT for student's major (${studentMajor}): 75%+
- REACHABLE ROLE (similar function, approachable seniority): 80%+
- PERFECT MATCH (relevant dept + reachable + senior enough to refer): 85-95%
SENIORITY BONUS: Entry-level +0, Mid-level +3, Senior/Manager +5, Director/VP/C-suite +8

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

      let alumni = filterAndDedupAlumni(alumniResult.alumni || [], alumniCompany);
      if (alumni.length > 0) { alumni = (await verifyAlumniRoles(base44, alumni, alumniCompany)).filter(a => a.confidence !== 'low' && a.uf_verified !== false); }

      // LAYER 3: Graceful recovery for alumni — if 0 real alumni AND the response text suggests confusion
      if (alumni.length === 0 && !String(alumniResult.response || '').toLowerCase().includes('alumni')) {
        console.log(`[Layer3] Alumni search for "${alumniCompany}" returned 0 results and confused response — recovering`);
        return Response.json({
          success: true,
          response: `Hmm, I might have misunderstood. It looks like **"${alumniCompany}"** isn't matching a real company. Did you mean something else?\n\nYou can try:\n→ Naming a specific company like **"Find alumni at Apple"** or **"Find alumni at ${targetCompanies[0] || 'Google'}"**\n→ Or asking me to **"find internships at my target companies"**`,
          message_type: 'text',
          payload: {}
        });
      }

      if (alumni.length > 0) {
        const enrichedAlumni = await crossReferenceCFF(base44, alumni);
        saveAlumniCache(base44, enrichedAlumni);
        saveToPipeline(base44, user.email, alumniCompany, enrichedAlumni);
        trackActivity(base44, user.email, profile.id, 'alumni_view', alumniCompany);
        const guidanceResult = await generateAlumniGuidance(base44, enrichedAlumni, alumniCompany, profileContext);
        const topName = guidanceResult.top_match || enrichedAlumni[0]?.name || '';
        const topFirst = topName.split(' ')[0];
        const alumniResp = `I found **${enrichedAlumni.length} UF alumni** at ${alumniCompany}:`;
        return Response.json({
          success: true, response: alumniResp,
          message_type: 'alumni_card', payload: { alumni: enrichedAlumni, cached: false, top_match: guidanceResult.top_match, recommendation_reason: guidanceResult.recommendation_reason, suggested_actions: topName ? [`Draft message to ${topFirst} →`, `Research ${alumniCompany} →`] : [`Research ${alumniCompany} →`] }
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

    // 9. OPPORTUNITY DISCOVERY (includes guided company discovery for students with no targets)
    if (detectOpportunityDiscovery(resolvedMessage)) {
      console.log('Intent: opportunity_discovery', targetCompanies.length === 0 ? '(no targets — guided discovery)' : '');
      const industry = profile.target_industry || 'any industry';
      const major = studentMajor;
      const sizePref = { large: 'large corporation', mid_size: 'mid-size company', startup: 'startup' }[profile.company_size_preference] || '';
      const locPref = profile.location_preference || '';
      // If no targets and missing preferences, ask conversationally first
      if (targetCompanies.length === 0 && (!profile.company_size_preference || !profile.location_preference)) {
        let q = `Let's find the right companies for you! I already know you're interested in **${industry}**.`;
        if (!profile.company_size_preference) q += `\n\nWhat size company appeals to you?\n- 🏢 **Big names** everyone knows (Apple, Google, Disney)\n- 📈 **Mid-size companies** with strong growth\n- 🚀 **Startups** where you'd wear many hats\n- 🤷 **Open to anything**`;
        if (!profile.location_preference) q += `\n\nAnd location — any preference?\n- 🌴 I want to stay in **Florida**\n- 🌎 **Open to relocating** anywhere\n- 📍 A **specific city** (tell me which)`;
        q += `\n\nJust tell me and I'll find companies that are actually hiring for your background!`;
        return Response.json({ success: true, response: q, message_type: 'text', payload: {} });
      }
      const webResult = await base44.integrations.Core.InvokeLLM({ prompt: `Find 8-10 companies hiring entry-level ${major} roles in ${industry}${sizePref ? ', focusing on ' + sizePref + ' companies' : ''}${locPref ? ' near ' + locPref : ''}. Student request: "${resolvedMessage}". Focus on companies realistically hiring ${major} majors for ${industry} roles at the entry level.`, add_context_from_internet: true });
      const result = await base44.integrations.Core.InvokeLLM({ prompt: `You are FASTIQ.\n\n${profileContext}\n\nBased on research, suggest 8-10 companies for this ${major} student.\n\nRESEARCH:\n${String(typeof webResult === 'string' ? webResult : JSON.stringify(webResult)).substring(0,4000)}\n\nEvery company MUST have roles for a ${major} graduate. Be realistic.${targetCompanies.length === 0 ? ' Emphasize that the student can add any of these to their targets and FASTIQ will start monitoring hiring, finding alumni, and scouting opportunities for them.' : ''}`, response_json_schema: { type: "object", properties: { response: { type: "string" }, suggestions: { type: "array", items: { type: "object", properties: { company_name: { type: "string" }, reason: { type: "string" }, size: { type: "string", enum: ["large","mid_size","startup"] }, hiring_status: { type: "string", enum: ["actively_hiring","some_openings","unknown"] }, location: { type: "string" } }, required: ["company_name","reason","size","hiring_status"] } } }, required: ["response","suggestions"] } });
      trackActivity(base44, user.email, profile.id, 'company_search', industry);
      return Response.json({ success: true, response: result.response || "Here are companies for you:", message_type: 'company_suggestions', payload: { suggestions: result.suggestions || [] } });
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
      const outreachMajor = studentMajor;
      const gradYear = studentGradYear;
      const targetIndustry = profile.target_industry || 'their target industry';

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Draft a ${channel} message from ${studentName}, a ${outreachMajor} major at the University of Florida (class of ${gradYear}), to ${recipientName}, ${recipientTitle} at ${recipientCompany}.

Context: The student is looking for ${ptConfig.outreachPhrase} in ${targetIndustry} and chose to reach out to this person because ${(alumniRecord?.uf_verified===false||alumniRecord?.confidence==='low'||alumniRecord?.confidence==='medium') ? 'they work in a role relevant to the student\'s career interests (UF connection NOT confirmed — do NOT reference UF as shared connection, use shared industry interest instead)' : (recommendationReason || 'they are a fellow UF alum in a role relevant to the student\'s career goals')}.

${conversationContext ? `RECENT CONVERSATION CONTEXT:\n${conversationContext}\n` : ''}

Rules:
1. Reference something SPECIFIC about the alumni's role or background — never generic
2. Connect the student's major/interests to the alumni's work in a specific way
3. ${(alumniRecord?.uf_verified===false||alumniRecord?.confidence==='low'||alumniRecord?.confidence==='medium') ? 'Do NOT mention "fellow Gator", "UF connection", or imply shared alumni status — UF link is unverified. Frame as: "As a UF student interested in [their field], I was excited to see your role..."' : `Naturally mention they are looking for ${ptConfig.outreachPhrase}`}
4. Ask ONE clear, specific question — not "any advice" but something like "I'd love to hear how your team approaches X" or "I'm curious whether a background in Y translates well into Z"
5. Keep it under 100 words — busy people don't read essays
6. Tone: confident but not arrogant, curious but not needy, specific but not stalkerish
7. Sign off with full name, university, and graduation year
8. Do NOT use "I hope this message finds you well" or any other cliche opener
9. No placeholders — use real names and details from above`,
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
      const otherTargets = targetCompanies.filter(c => c.toLowerCase() !== recipientCompany.toLowerCase());
      const outreachNextActions = [];
      if (otherTargets.length > 0) outreachNextActions.push(`Find alumni at ${otherTargets[0]} →`);
      outreachNextActions.push(`Tailor my resume for ${recipientCompany || 'this role'} →`);
      outreachNextActions.push('Research another company →');
      // Build confirmation + draft response
      const confirmLine = alumniRecord
        ? `Got it — **${recipientName}**, ${recipientTitle} at ${recipientCompany}${alumniRecord.verified ? ' (UF connection verified ✅)' : ' (UF alum 🐊)'}. Here's your draft:`
        : `Here's your draft to **${recipientName}**:`;
      return Response.json({
        success: true, response: confirmLine,
        message_type: 'outreach_draft',
        payload: { recipient: result.recipient || recipientName, recipient_title: recipientTitle, recipient_company: recipientCompany, channel: result.channel || channel, subject: result.subject || '', message: result.message_body || '', ask_type: askType, suggested_next_steps: outreachNextActions }
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
          const mRoles = (intelData.entry_level_roles_count || 0) + (intelData.intern_roles_count || 0);
          const tRoles = intelData.open_roles_count || 0;
          const isHiring = intelData.hiring_signal === 'hot' || intelData.hiring_signal === 'warm';
          const scenario = (mRoles > 0 && isHiring) ? 'A' : (isHiring && mRoles === 0) ? 'B' : 'C';
          const scenarioText = { A: `SCENARIO A: ${mRoles} matching ${jstConfig.noun} found. Write ONE sentence: "${companyName} has ${mRoles} ${jstConfig.noun} relevant to [student's field] — strong fit."`, B: `SCENARIO B: Hiring but no match. Write ONE sentence: "${companyName} is hiring (${tRoles} roles), but mostly senior — no direct ${jstConfig.noun} right now."`, C: `SCENARIO C: Not hiring. Write ONE sentence: "${companyName} doesn't appear to be actively hiring at your level."` };
          const r = await base44.integrations.Core.InvokeLLM({
            prompt: `You are FASTIQ. ACTION MODE — produce a SHORT assessment (1-2 sentences MAX). The structured card carries the data — your text is just the headline.\n\n${profileContext}\n\n${memoryContext || ''}\nINTEL: Score ${intelData.hiring_score}/100 (${intelData.hiring_signal}), ${mRoles} matching ${jstConfig.noun}, ${tRoles} total, Salary: ${intelData.salary_range || 'unknown'}\n\n${scenarioText[scenario]}\n\nCRITICAL: 1-2 sentences ONLY. No numbered lists. No tips. No strategy. The card shows the data.`,
            response_json_schema: { type: "object", properties: { assessment: { type: "string" }, scenario: { type: "string", enum: ["A","B","C"] }, match_level: { type: "string", enum: ["strong_match","moderate_match","weak_match","caution"] } }, required: ["assessment","scenario","match_level"] }
          });
          r.scenario = scenario;
          return r;
        } catch (e) { console.log('Analysis error:', e.message); return null; }
      };

      const cached = await getCachedCompanyIntel(base44, detectedCompany);
      if (cached && !cached._expired) {
        trackActivity(base44, user.email, profile.id, 'company_search', detectedCompany);
        const cachedIntelData = { hiring_score: cached.hiring_score, hiring_signal: cached.hiring_signal, company_summary: cached.intel_summary, open_roles_count: cached.open_roles_count, entry_level_roles_count: cached.entry_level_roles_count || 0, intern_roles_count: cached.intern_roles_count || 0, salary_range: cached.salary_range, recent_news: [], interview_process: '' };
        const analysis = await runPersonalizedAnalysis(detectedCompany, cachedIntelData);
        // Auto-check for alumni alongside cached intel
        let cAlumni = []; let cAlumniGuidance = null;
        try { const ca = await getCachedAlumni(base44, detectedCompany); if (ca?.length > 0) { cAlumni = await crossReferenceCFF(base44, ca.map(a => ({ name: a.name, role_title: a.role_title, company: a.company, match_score: Math.max(a.match_score||65,65), degree_info: a.degree_info, location: a.location, linkedin_url: a.linkedin_url||'', verified: a.verified||false }))); cAlumniGuidance = await generateAlumniGuidance(base44, cAlumni, detectedCompany, profileContext); } } catch(e) {}
        let cResp = `Here's what I found on **${detectedCompany}**:`;
        const cActions = [];
        const cScenario = analysis?.scenario || 'A';
        if (cAlumni.length > 0 && cAlumniGuidance) { if (cAlumniGuidance.top_match) cActions.push(`Draft message to ${cAlumniGuidance.top_match} →`); cActions.push(`Tailor my resume for ${detectedCompany} →`); }
        else if (cScenario === 'A') { cActions.push(`Find UF alumni at ${detectedCompany} →`); cActions.push(`Tailor my resume for ${detectedCompany} →`); }
        else if (cScenario === 'B') { cActions.push(`Find UF alumni at ${detectedCompany} →`); cActions.push(`Find similar companies hiring ${jstConfig.noun} →`); }
        else { cActions.push(`Find UF alumni at ${detectedCompany} →`); cActions.push(`Find companies that ARE hiring ${jstConfig.noun} →`); }
        return Response.json({
          success: true, response: cResp, message_type: 'company_intel',
          payload: { company: detectedCompany, hiring_score: cached.hiring_score, hiring_signal: cached.hiring_signal, company_summary: cached.intel_summary, open_roles_count: cached.open_roles_count, entry_level_roles_count: cached.entry_level_roles_count || 0, intern_roles_count: cached.intern_roles_count || 0, salary_range: cached.salary_range, cached: true, personalized_analysis: analysis || null, alumni: cAlumni.length > 0 ? cAlumni : undefined, alumni_top_match: cAlumniGuidance?.top_match || undefined, suggested_actions: cActions, position_type_label: ptConfig.label, roles_found_label: ptConfig.roleLabel, salary_label: ptConfig.salaryType }
        });
      }
      // Keep expired cache for memory delta comparison
      const previousIntel = (cached && cached._expired) ? cached : null;

      const webResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Research ${detectedCompany} hiring activity as of March 2026. The student is specifically looking for: ${ptConfig.label}. Focus on ${ptConfig.searchTerms} positions and roles relevant to a ${studentMajor} major.${positionType === 'experienced' ? '' : ' Do NOT count senior/manager/director/VP roles in hiring score.'} Also find total roles, ${ptConfig.salaryType}, recent news, interview process.`,
        add_context_from_internet: true,
      });

      const intel = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FASTIQ.\n\n${profileContext}\n\nSynthesize research about ${detectedCompany} into a briefing FOCUSED ON ${ptConfig.label.toUpperCase()} ROLES.\n\nRESEARCH:\n${String(typeof webResult === 'string' ? webResult : JSON.stringify(webResult)).substring(0,4000)}\n\nSCORING: hiring_score 0-100 based on ${ptConfig.searchTerms} availability. ${positionType === 'experienced' ? 'Include mid-level roles.' : 'Company with 150 senior roles but 0 matching positions = score <20.'} hiring_signal: hot only if matching positions actively hiring. salary_range: ${ptConfig.salaryType}. If company not real, set hiring_score=0 and company_summary="NOT_FOUND".`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" }, hiring_score: { type: "integer" }, hiring_signal: { type: "string", enum: ["hot","warm","cool"] },
            salary_range: { type: "string" }, open_roles_count: { type: "integer" },
            entry_level_roles_count: { type: "integer" }, intern_roles_count: { type: "integer" },
            company_summary: { type: "string" },
            recent_news: { type: "array", items: { type: "string" } }, interview_process: { type: "string" }
          },
          required: ["response","hiring_score","hiring_signal","salary_range","open_roles_count","entry_level_roles_count","intern_roles_count","company_summary"]
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

      saveCompanyIntelCache(base44, detectedCompany, { hiring_score: intel.hiring_score, hiring_signal: intel.hiring_signal, summary: intel.company_summary, open_roles_count: intel.open_roles_count, entry_level_roles_count: intel.entry_level_roles_count || 0, intern_roles_count: intel.intern_roles_count || 0, salary_range: intel.salary_range });
      trackActivity(base44, user.email, profile.id, 'company_search', detectedCompany);

      const news = Array.isArray(intel.recent_news) ? intel.recent_news : (intel.recent_news ? [intel.recent_news] : []);
      const intelForAnalysis = { ...intel, recent_news: news };
      const memoryCtx = buildMemoryContext(previousIntel, intel, detectedCompany);
      const analysis = await runPersonalizedAnalysis(detectedCompany, intelForAnalysis, memoryCtx);
      // Auto-search for alumni alongside fresh intel
      let fAlumni = []; let fAlumniGuidance = null;
      try {
        const fCached = await getCachedAlumni(base44, detectedCompany);
        if (fCached?.length > 0) { fAlumni = await crossReferenceCFF(base44, fCached.map(a => ({ name: a.name, role_title: a.role_title, company: a.company, match_score: Math.max(a.match_score||65,65), degree_info: a.degree_info, location: a.location, linkedin_url: a.linkedin_url||'', verified: a.verified||false }))); }
        else {
          const aWeb = await base44.integrations.Core.InvokeLLM({ prompt: `Find people who attended the University of Florida and CURRENTLY WORK at ${detectedCompany} as employees. They must be CURRENT employees, not former. Do NOT include people at different companies.\n\n${UF_FILTER}\n\nFor each person, include: full name, current job title, their CURRENT company name exactly as listed, UF degree info, location.`, add_context_from_internet: true });
          const aParsed = await base44.integrations.Core.InvokeLLM({ prompt: `Parse into structured alumni profiles for UF alumni at ${detectedCompany}.\n\n${profileContext}\n\n${UF_FILTER}\n- ONLY include people whose current employer IS "${detectedCompany}" or a direct division\n- EXCLUDE people at different companies\n- DEDUPLICATE same name+title\n- Match score minimum 65%\n- Set "company" to their EXACT current employer name\n\nRESEARCH:\n${String(typeof aWeb === 'string' ? aWeb : JSON.stringify(aWeb)).substring(0,3000)}`, response_json_schema: { type: "object", properties: { alumni: { type: "array", items: { type: "object", properties: { name: { type: "string" }, role_title: { type: "string" }, company: { type: "string" }, degree_info: { type: "string" }, location: { type: "string" }, match_score: { type: "integer" }, linkedin_url: { type: "string" } }, required: ["name","role_title","company","match_score"] } } }, required: ["alumni"] } });
          let rawA = filterAndDedupAlumni(aParsed.alumni || [], detectedCompany);
          if (rawA.length > 0) { rawA = (await verifyAlumniRoles(base44, rawA, detectedCompany)).filter(a => a.confidence !== 'low' && a.uf_verified !== false); }
          if (rawA.length > 0) { fAlumni = await crossReferenceCFF(base44, rawA); saveAlumniCache(base44, fAlumni); saveToPipeline(base44, user.email, detectedCompany, fAlumni); trackActivity(base44, user.email, profile.id, 'alumni_view', detectedCompany); }
        }
        if (fAlumni.length > 0) fAlumniGuidance = await generateAlumniGuidance(base44, fAlumni, detectedCompany, profileContext);
      } catch(e) { console.log('Auto alumni search alongside intel failed:', e.message); }
      let fResp = `Here's what I found on **${detectedCompany}**:`;
      const fActions = [];
      const fScenario = analysis?.scenario || 'A';
      if (fAlumni.length > 0 && fAlumniGuidance) { if (fAlumniGuidance.top_match) fActions.push(`Draft message to ${fAlumniGuidance.top_match} →`); fActions.push(`Tailor my resume for ${detectedCompany} →`); }
      else if (fScenario === 'A') { fActions.push(`Find UF alumni at ${detectedCompany} →`); fActions.push(`Tailor my resume for ${detectedCompany} →`); }
      else if (fScenario === 'B') { fActions.push(`Find UF alumni at ${detectedCompany} →`); fActions.push(`Find similar companies hiring ${jstConfig.noun} →`); }
      else { fActions.push(`Find UF alumni at ${detectedCompany} →`); fActions.push(`Find companies that ARE hiring ${jstConfig.noun} →`); }
      return Response.json({
        success: true, response: fResp, message_type: 'company_intel',
        payload: { company: detectedCompany, hiring_score: intel.hiring_score, hiring_signal: intel.hiring_signal, company_summary: intel.company_summary, open_roles_count: intel.open_roles_count, entry_level_roles_count: intel.entry_level_roles_count || 0, intern_roles_count: intel.intern_roles_count || 0, salary_range: intel.salary_range, recent_news: news, interview_process: intel.interview_process || '', cached: false, personalized_analysis: analysis || null, alumni: fAlumni.length > 0 ? fAlumni : undefined, alumni_top_match: fAlumniGuidance?.top_match || undefined, suggested_actions: fActions, position_type_label: ptConfig.label, roles_found_label: ptConfig.roleLabel, salary_label: ptConfig.salaryType }
      });
    }

    // 13. FOLLOW-UP DRAFT
    if (detectFollowUp(resolvedMessage)) {
      return await handleFollowUpDraft(base44, user, profile, resolvedMessage, pipelineData, staleOutreach, profileContext);
    }

    // 14. REPLY HELP — student got a reply and needs help responding
    if (detectReplyHelp(resolvedMessage)) {
      return await handleReplyHelp(base44, user, profile, resolvedMessage, pipelineData, profileContext, studentMajor, studentGradYear);
    }

    // 15-17: OFFER, NETWORK THANK — handled by extracted helper
    if (detectOfferNegotiation(resolvedMessage)) {
      return await handleOfferNegotiation(base44, user, profile, resolvedMessage, pipelineData, targetCompanies, profileContext);
    }
    if (detectNetworkThankYou(resolvedMessage)) {
      return await handleNetworkThankYou(base44, user, profile, resolvedMessage, pipelineData, profileContext);
    }

    // 18. ADVICE MODE (conversational career guidance — bridges to Action Mode)
    console.log('Intent: advice_mode (default)');
    const webResult = await base44.integrations.Core.InvokeLLM({ prompt: `You are a career research assistant for a UF student.\n\n${profileContext}\n\nRequest: "${resolvedMessage}"\n\n${conversation_history ? 'Context:\n' + conversation_history : ''}\n\nResearch the topic and gather relevant facts for personalized advice.`, add_context_from_internet: true });
    const result = await base44.integrations.Core.InvokeLLM({ prompt: `You are FASTIQ, the student's personal career mentor. This is ADVICE MODE — the student asked a general career question, not a specific action command.\n\n${profileContext}\n\nRESEARCH:\n${String(typeof webResult === 'string' ? webResult : JSON.stringify(webResult)).substring(0,4000)}\n\nRequest: "${resolvedMessage}"\n\nADVICE MODE RULES:\n- Write 2-4 conversational paragraphs (NOT numbered lists, NOT bullet points)\n- Be warm, mentoring, personal — like a trusted advisor who knows this student\n- Reference the student's specific major (${studentMajor}), targets (${targetCompanies.join(', ') || 'none yet'}), and situation\n- Share genuine insight based on the research — things the student wouldn't know\n- Tone: experienced mentor talking to a promising student, not a textbook\n- NEVER use numbered lists of "tips" or "strategies"\n- NEVER use phrases like "Here are some tips" or "Consider the following"\n\nBRIDGE TO ACTION: End with exactly 1-2 specific FASTIQ actions the student can do RIGHT NOW. Frame them as natural next steps, e.g. "Want me to research which of those companies is actually hiring right now?" or "I can find UF alumni at [company] if you want a warm intro."\n\nThe suggested_actions array should contain the action button text for those bridges (e.g. "Research Amazon for me →", "Find UF alumni at Google →").`, response_json_schema: { type: "object", properties: { response: { type: "string" }, suggested_actions: { type: "array", items: { type: "string" } } }, required: ["response"] } });
    let careerResp = result.response || String(typeof webResult === 'string' ? webResult : JSON.stringify(webResult)).substring(0,2000);
    const careerActions = result.suggested_actions || [];
    if (targetCompanies.length === 0 && !careerActions.some(a => a.toLowerCase().includes('find companies'))) careerActions.push('Help me find companies to target →');
    return Response.json({ success: true, response: careerResp, message_type: 'career_advice', payload: { suggested_actions: careerActions } });

  } catch (error) {
    console.error('fastTrackProAgent error:', error.message);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});