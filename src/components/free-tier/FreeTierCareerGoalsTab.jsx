import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, RefreshCw, Loader2 } from 'lucide-react';
import { getAlumniByRole } from './alumniExplorerUtils';
import GoalsSummaryCard from './GoalsSummaryCard';
import CareerProfileCard from './CareerProfileCard';
import SaveToNotebookButton from './SaveToNotebookButton';
import LeadsSection from './LeadsSection';
import SavedLeads from './SavedLeads';
import InlineMessageComposer from './InlineMessageComposer';

// ─── System prompts ───────────────────────────────────────────────────────────

const SYSTEM_PROMPT_BRANCHING = `You are FastIQ, the AI career advisor inside College Fast Forward (CFF). You are running a structured 8-question intake conversation to understand a college student's career goals.

QUESTION SEQUENCE (exactly 8 questions):
Q1 (already answered — major) — saved, skip to Q2.
Q2: Do you have a clear direction or are you still figuring it out? Chips: ["I have a pretty good idea →", "Still figuring it out"]

PATH A (has direction — answered Q2 with direction):
Q3: What role or type of work are you targeting?
Q4: What industry? (3 chips relevant to their major + "Something else")
Q5: Internship or full-time? Chips: ["Internship", "Full-time", "Both"]
Q5b: (only if full-time or both) What year do you graduate? Chips: ["2025", "2026", "2027", "2028+"]
Q6: What city or region? Chips: ["New York", "Miami", "Remote", "Open to anything"]
Q7: Company size preference? Chips: ["Big company (Fortune 500)", "Mid-size", "Startup", "No preference"]
Q8: Any companies you'd love to work at — or types of companies that appeal to you? And what's your biggest gap right now? Free text + chips: ["No internship experience yet", "Not sure what I want to do", "Don't know how to network", "Not sure my major is right"]

PATH B (figuring it out — answered Q2 with undecided):
Q3: Work environment — what sounds most like you? Chips based on major.
Q4: What's your natural strength? Chips: ["Talking to people / relationships", "Analyzing data / solving problems", "Creating things / design / writing", "Leading / organizing / making things happen"]
Q5: What motivates you most? Chips: ["Making a lot of money", "Making an impact", "Building something of my own", "Stability and work-life balance"]
Q6: Graduation year? Chips: ["2025", "2026", "2027", "2028+"]
Q7: Biggest gap or concern? Chips: ["No internship experience yet", "Not sure my major is right", "Don't know how to network", "Something else"]
After Q7 on Path B: synthesize all answers into role recommendations.

STUDENT MAJOR: The student's major is provided in the conversation context. ALWAYS use it to:
1. Personalize acknowledgments ("Finance — solid foundation for analyst roles." / "English — more flexible than people think. Consulting, marketing, media, law, and tech all hire English majors.")
2. Only suggest roles realistic for their major — never suggest software engineering to a Communications major unless they explicitly want it
3. Flag honest gaps: if their target doesn't match major, acknowledge directly
4. Suggest major-specific clubs, certifications, or experiences

Rules:
- Always acknowledge the previous answer in ONE short sentence before asking the next question.
  Tone: confident and direct, like a sharp recruiter — NOT cheerful or enthusiastic.
  NO exclamation points. NO adjectives like "fantastic", "exciting", "vibrant", "great", "solid".
  Good: "Social Media Marketing — strong direction for a Marketing major."
  Good: "Media & Entertainment — good fit given your role target."
  Good: "Miami — focusing your leads there."
  Good: "Mid-size — noted, that'll shape your company list."
  Bad: "Social Media Marketing is an exciting field!"
  Bad: "Media & Entertainment is a vibrant industry!"
  Bad: "Mid-size companies often offer great growth opportunities!"
- One question at a time — never list multiple questions
- After key answers, remind student their data is being used: "Finance — already narrowing your company list." / "NYC — focusing your leads there."
  These reminders replace the acknowledgment — don't do both. One sentence total.
- Keep responses SHORT — one acknowledgment/reminder + the next question
- For Path A: set is_final=true after Q8 with goals_summary populated
- For Path B: set is_final=true after Q8 WITH full synthesis, role_recommendations, career_profile, AND goals_summary
- NEVER add guilt or pressure to skipped questions. If student skips, say "No problem — moving on." and ask the next question.
- GRADUATION YEAR: If not captured by Q5b/Q7, ask explicitly. NEVER assume. When asking graduation year, ALWAYS use exactly these 4 chips: ["2025", "2026", "2027", "2028+"]. NEVER use any other chips for this question.
- NO EXPERIENCE: When student says no experience, say exactly: "Starting from zero is totally fine — and honestly, a lot of CFF parents specifically remember what it felt like and are the most generous with their time. We'll build your path with that in mind."
- SKIP CHIPS: Always include suggested_prompts. Do NOT add skip to suggested_prompts — it's handled separately in the UI.
- PRELIMINARY ARCHETYPE: Always infer preliminary_archetype from conversation, even mid-conversation.
- CRITICAL: NEVER put chip options inside the message text. Do not write 'Chips: [...]' or list options in the message. The message field must read like natural speech. Options belong ONLY in suggested_prompts.

CRITICAL FORMATTING RULES:
- Never use markdown in your responses
- Never use **bold**, *italic*, or # headers
- Never use bullet points with - or •
- Never use numbered lists with 1. 2. 3.
- Write in plain conversational prose only
- Use line breaks for separation if needed

FINAL MESSAGE RULE (when is_final = true):
Your "message" field must contain exactly ONE sentence — a warm bridge to the profile card. Nothing else.
Examples: "Based on everything you shared — here's your personalized career profile." / "Perfect. Here's what we found for you."
Do NOT include role recommendations, goals summaries, skills advice, or questions in the message. The profile card contains all the detail.

CHIP RULES (HARD LIMITS):
- Maximum 4 chips per question — NEVER more than 4
- Each chip label maximum 4 words
- Always include a catch-all as the last chip ("Something else" or "Not sure yet")
- GOOD chips: ["Finance", "Tech", "Nonprofit", "Something else"]
- BAD chips: ["Full-time — graduating 2025", "Full-time — graduating 2026", "Full-time — graduating 2027", "Full-time — graduating 2028"]
- Graduation year chips must always be exactly: ["2025", "2026", "2027", "2028+"] — never more

INDUSTRY & FUNCTION TAXONOMY (CRITICAL):
When populating goals_summary.target_industries, you MUST map the student's answer to values from this exact list only. Never store free-form text as an industry.

VALID target_industries values:
- "Technology & Software"
- "Financial Services & Banking"
- "Consulting"
- "Healthcare & Life Sciences"
- "Consumer Goods & Retail"
- "Media & Entertainment"
- "Real Estate"
- "Energy & Utilities"
- "Government & Nonprofit"
- "Logistics & Supply Chain"
- "Sports & Athletics"
- "Education"

When populating goals_summary.target_functions, map the student's target role to values from this list only:
- "Software Engineering"
- "Product Management"
- "Sales & Business Development"
- "Marketing & Brand"
- "Finance & Accounting"
- "Operations & Strategy"
- "Data & Analytics"
- "Human Resources"
- "Consulting / Advisory"
- "Supply Chain & Logistics"
- "Healthcare / Clinical"
- "Legal & Compliance"

If a student's answer maps to multiple values, include all that apply (max 3).
If a student's answer is ambiguous, pick the closest match — never leave as free text.
"Corporate" → "Consulting" or "Operations & Strategy" depending on context
"Marketing" → target_functions: "Marketing & Brand" (NOT an industry)
"Business" → infer from context; default to "Operations & Strategy"

WRONG message field: "Fashion is great! What industry? Chips: ['Tech', 'Fashion', 'Healthcare']"
CORRECT message field: "Fashion — what industry are you targeting for this role?"
CORRECT suggested_prompts: ["Tech", "Fashion", "Healthcare", "Something else"]

Return JSON with: message, is_final (bool), suggested_prompts (2-3 chips, NO skip option), preliminary_archetype (always), goals_summary (null until final), role_recommendations (null unless final), about_you (null unless final), top_strengths (null unless final), work_environment (null unless final), honest_challenge (null unless final), cff_network_recommendation (null unless final)

goals_summary shape when final:
{
  target_industries: string[],   // FROM VALID INDUSTRIES LIST ONLY
  target_functions: string[],    // FROM VALID FUNCTIONS LIST ONLY — NEW FIELD
  target_roles: string[],        // Specific job titles e.g. "Account Executive"
  target_companies: string[],    // Named companies if mentioned
  dream_company: string,
  graduation_year: number,
  company_size_preference: string[],
  location_preference: string,
  major: string,
  seeking: string,               // REQUIRED — map Q5 answer exactly: "Internship", "Full-time", or "Both"
  experience_level: string,      // REQUIRED — infer from Q8/conversation: "None" (no experience), "Entry-level" (1 internship/coursework), "Some" (multiple internships), "Experienced" (full-time work history)
}`;

const SYNTHESIS_SUFFIX = `

The student has completed the discovery questions. Now synthesize their responses and generate a personalized career profile and role recommendations.

Be genuinely creative — consider: traditional corporate paths, startups, entrepreneurship/founder paths, field-based roles (sales, consulting, real estate, logistics), creative industries, mission-driven/nonprofit, emerging roles in AI/sustainability/creator economy, roles they may never have heard of but would love.

ROLE QUALITY REQUIREMENTS — for each best-fit role you MUST include:
- The specific role title (not generic — "Real Estate Financial Analyst" not "Financial Analyst")
- Which specific company types or named companies hire for this role
- Exactly why it fits THIS student based on what they told you — every sentence must reference their actual answers
- A specific, honest challenge relevant to their experience level and situation — NEVER generic advice
- What the student needs to do first if they have no experience (no_experience_first_step)
- Whether a CFF parent intro would be particularly valuable for this role

HONEST CHALLENGE REQUIREMENTS:
BAD: "You might need to learn quickly on the job as this role can be fast-paced."
GOOD: "Real talk — financial analyst roles at real estate firms almost always require Excel modeling and basic accounting. With no experience yet, your first move should be a free Excel modeling course (CFI has good ones) and one CFF parent coffee chat in the real estate space before you apply anywhere."
Be honest. Be specific. Students trust advisors who tell them the truth.

Return 4-6 role recommendations ranked by fit. Set is_final=true and populate ALL fields including about_you, top_strengths, work_environment, honest_challenge, cff_network_recommendation, and preliminary_archetype.

FINAL suggested_prompts rule: when is_final is true, suggested_prompts must be exactly 3 items, maximum 4 words each. Use: ["Tell me more →", "Show companies →", "Start over →"]`;

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    is_final: { type: 'boolean' },
    suggested_prompts: { type: 'array', items: { type: 'string' } },
    preliminary_archetype: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        confidence: { type: 'string' },
        label: { type: 'string' },
      },
    },
    about_you: { type: 'string' },
    top_strengths: { type: 'array', items: { type: 'string' } },
    work_environment: { type: 'string' },
    honest_challenge: { type: 'string' },
    cff_network_recommendation: { type: 'string' },
    role_recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          specific_companies: { type: 'array', items: { type: 'string' } },
          why_it_fits: { type: 'string' },
          honest_challenge: { type: 'string' },
          no_experience_first_step: { type: 'string' },
          cff_intro_value: { type: 'string' },
          entrepreneurship_path: { type: 'boolean' },
        },
      },
    },
    goals_summary: {
      type: 'object',
      properties: {
        target_roles: { type: 'array', items: { type: 'string' } },
        target_industries: { type: 'array', items: { type: 'string' } },
        target_functions: { type: 'array', items: { type: 'string' } },
        target_companies: { type: 'array', items: { type: 'string' } },
        seeking: { type: 'string' },
        graduation_year: { type: 'string' },
        location_preference: { type: 'string' },
        experience_level: { type: 'string' },
        company_size_preference: { type: 'array', items: { type: 'string' } },
        dream_company: { type: 'string' },
        perceived_gap: { type: 'string' },
        work_environment: { type: 'string' },
        preliminary_archetype: { type: 'string' },
        career_profile_summary: { type: 'string' },
        major: { type: 'string' },
        seeking: {
          type: 'string',
          enum: ['Internship', 'Full-time', 'Both'],
          description: "Employment type from Q5 — exactly as student selected: Internship, Full-time, or Both",
        },
        experience_level: {
          type: 'string',
          enum: ['None', 'Entry-level', 'Some', 'Experienced'],
          description: "Student experience level — None if no internship/experience yet, Entry-level if 1 internship or coursework, Some if multiple internships, Experienced if full-time work history",
        },
      },
    },
  },
  required: ['message', 'is_final', 'suggested_prompts'],
};

const MAJOR_CHIPS = [
  'Finance',
  'Marketing',
  'Computer Science',
  'Business Administration',
  'Communications',
  'Engineering',
  'Psychology',
  'Other / Type mine →',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hasExistingGoals(user) {
  const g = user?.career_goals;
  return !!(g?.target_roles?.length || g?.target_industries?.length || g?.role || g?.industries?.length);
}

const VALID_INDUSTRIES = [
  "Technology & Software",
  "Financial Services & Banking",
  "Consulting",
  "Healthcare & Life Sciences",
  "Consumer Goods & Retail",
  "Media & Entertainment",
  "Real Estate",
  "Energy & Utilities",
  "Government & Nonprofit",
  "Logistics & Supply Chain",
  "Sports & Athletics",
  "Education"
];

const VALID_FUNCTIONS = [
  "Software Engineering",
  "Product Management",
  "Sales & Business Development",
  "Marketing & Brand",
  "Finance & Accounting",
  "Operations & Strategy",
  "Data & Analytics",
  "Human Resources",
  "Consulting / Advisory",
  "Supply Chain & Logistics",
  "Healthcare / Clinical",
  "Legal & Compliance"
];

function normalizeGoals(goals) {
  if (!goals) return goals;

  // Rescue: if a function-type value landed in target_industries, move it
  const rawIndustries = goals.target_industries || [];
  const rescuedFunctions = rawIndustries.filter(v => VALID_FUNCTIONS.includes(v));
  const cleanedIndustries = rawIndustries.filter(v => VALID_INDUSTRIES.includes(v));

  // Rescue: if an industry-type value landed in target_functions, move it
  const rawFunctions = [...(goals.target_functions || []), ...rescuedFunctions];
  const rescuedIndustries = rawFunctions.filter(v => VALID_INDUSTRIES.includes(v));
  const cleanedFunctions = rawFunctions.filter(v => VALID_FUNCTIONS.includes(v));

  const finalIndustries = [...new Set([...cleanedIndustries, ...rescuedIndustries])];
  const finalFunctions = [...new Set(cleanedFunctions)];

  return {
    ...goals,
    target_industries: finalIndustries,
    target_functions: finalFunctions,
  };
}

// ─── Small UI components ──────────────────────────────────────────────────────

// Strip markdown and leaked chip instructions from LLM messages
const cleanMessage = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/^[-•]\s/gm, '')
    .replace(/^\d+\.\s/gm, '')
    .replace(/Chips:\s*\[.*?\]/gs, '')
    .replace(/Options:\s*\[.*?\]/gs, '')
    .replace(/suggested_prompts:\s*\[.*?\]/gs, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className="chat-exchange" style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 24 }}>
      {!isUser && (
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0d1117', border: '1px solid rgba(232,93,32,0.4)', color: '#E85D20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, marginRight: 10, marginTop: 2 }}>
          ⚡
        </div>
      )}
      <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'} style={{
        maxWidth: isUser ? '65%' : '75%',
        background: isUser ? '#0d1117' : '#fff',
        color: isUser ? '#fff' : '#1A1A1A',
        border: isUser ? 'none' : '1px solid #E5E5E5',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        padding: isUser ? '12px 18px' : '14px 18px',
        fontSize: 14,
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
        fontFamily: "'DM Sans', sans-serif",
        boxShadow: isUser ? 'none' : '0 1px 3px rgba(0,0,0,0.08)',
        marginBottom: 8,
      }}>
        {isUser ? message.content : cleanMessage(message.content)}
      </div>
    </div>
  );
}

function SuggestedPrompts({ prompts, onSelect, onSkip }) {
  if (!prompts?.length) return null;
  return (
    <div style={{ marginLeft: 42, marginBottom: 16 }}>
      <div className="chips-container" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        {prompts.map((p, i) => (
          <button key={i} onClick={() => onSelect(p)}
            className="chat-chip"
            style={{ background: '#fff', border: '1.5px solid #E85D20', color: '#E85D20', borderRadius: 100, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', minHeight: 'auto', textAlign: 'left', whiteSpace: 'nowrap', transition: 'all 0.15s ease', fontFamily: "'DM Sans', sans-serif" }}>
            {p}
          </button>
        ))}
      </div>
      {onSkip && (
        <div style={{ textAlign: 'right' }}>
          <button onClick={onSkip}
            style={{ background: 'none', border: 'none', color: '#AAAAAA', fontSize: 12, cursor: 'pointer', minHeight: 'auto', padding: '2px 0' }}>
            Skip this →
          </button>
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0d1117', border: '1px solid rgba(232,93,32,0.4)', color: '#E85D20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>⚡</div>
      <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: '4px 18px 18px 18px', padding: '12px 16px', display: 'flex', gap: 6, alignItems: 'center' }}>
        {[0, 150, 300].map(d => (
          <span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: '#E85D20', display: 'inline-block', animation: 'dotBounce 1.2s ease-in-out infinite', animationDelay: `${d}ms` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function FreeTierCareerGoalsTab({ user, onTabChange, onOpenUpgrade }) {
  const [mode, setMode] = useState(hasExistingGoals(user) ? 'summary' : 'chat');
  const [showLeads, setShowLeads] = useState(false);
  const [showLeadsArrow, setShowLeadsArrow] = useState(false);
  const [savedLeads, setSavedLeads] = useState(() => user?.saved_leads || []);
  const [activeComposer, setActiveComposer] = useState(null);
  const leadsRef = useRef(null);
  const isFastIQ = !!(user?.fastiq_setup_complete || user?.subscription_status === 'active' || user?.membership_tier === 'fastiq');
  const [messages, setMessages] = useState([]);
  const [suggestedPrompts, setSuggestedPrompts] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryText, setRetryText] = useState('');
  const [savedGoals, setSavedGoals] = useState(user?.career_goals || null);
  const [careerProfile, setCareerProfile] = useState(null);
  const [roleRecs, setRoleRecs] = useState(null);
  const [conversationDone, setConversationDone] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [restoredBanner, setRestoredBanner] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [restoredAt, setRestoredAt] = useState(null);
  const [aboutYou, setAboutYou] = useState(null);
  const [topStrengths, setTopStrengths] = useState(null);
  const [workEnvironment, setWorkEnvironment] = useState(null);
  const [honestChallenge, setHonestChallenge] = useState(null);
  const [cffNetwork, setCffNetwork] = useState(null);
  const [prelimArchetype, setPrelimArchetype] = useState(null);
  // Major-first flow
  const [majorInput, setMajorInput] = useState('');
  const [majorSaved, setMajorSaved] = useState(!!(user?.major || user?.career_goals?.major));
  const [majorFilter, setMajorFilter] = useState('');
  const [awaitingMajor, setAwaitingMajor] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const freshStartRef = useRef(false);
  const [isFreshStart, setIsFreshStart] = useState(false);
  const [alumniClusters, setAlumniClusters] = useState([]);
  const [loadingAlumni, setLoadingAlumni] = useState(false);
  const [alumniLoading, setAlumniLoading] = useState(false);
  const [outreachDraft, setOutreachDraft] = useState(null);
  // Outreach composer state
  const [connectLoading, setConnectLoading] = useState(null);
  const [outreachModal, setOutreachModal] = useState(null);
  const [editedDraft, setEditedDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState([]);
  const [copyToast, setCopyToast] = useState(false);

  // Block 1: Read cache on load (FastIQ users)
  useEffect(() => {
    if (!user?.id || mode !== 'summary') return;
    if (!user.is_fastiq && !user.fastiq_setup_complete && user.subscription_status !== 'active' && user.membership_tier !== 'fastiq') return;
    if (!savedGoals?.target_functions?.length) return;

    const cached = user.alumni_explorer_cache;
    const cachedAt = user.alumni_explorer_cached_at;
    const isStale = !cachedAt || (Date.now() - new Date(cachedAt).getTime()) > 24 * 60 * 60 * 1000;

    if (cached?.length && !isStale) {
      setAlumniClusters(cached);
    } else {
      setAlumniLoading(true);
      fetchAlumniClusters();
    }
  }, [user?.id, savedGoals?.target_functions, mode]);

  // Block 2: Fetch function
  const fetchAlumniClusters = async () => {
    try {
      const clusters = await getAlumniByRole(
        savedGoals.target_functions || [],
        savedGoals.target_roles || [],
        savedGoals.location_preference || ''
      );
      setAlumniClusters(clusters);
      await base44.auth.updateMe({
        alumni_explorer_cache: clusters,
        alumni_explorer_cached_at: new Date().toISOString(),
      }).catch(() => {});
    } catch (e) {
      console.error('Alumni fetch failed:', e);
    } finally {
      setAlumniLoading(false);
    }
  };

  const handleConnect = async (alum) => {
    const targetRole = (savedGoals?.target_roles || [])[0] || 'this role';
    try {
      const draft = await base44.functions.invoke('generateOutreachDraft', {
        studentName: user?.full_name || 'Student',
        major: user?.major || savedGoals?.major || '',
        targetRole,
        graduationYear: savedGoals?.graduation_year || '',
        alumniName: alum.name,
        alumniTitle: alum.title,
        alumniCompany: alum.company,
      });
      setOutreachDraft({ alum, message: draft?.message || '' });
    } catch (e) {
      console.error('Draft generation failed:', e);
    }
  };

  const isUndecided = !savedGoals?.target_roles?.length || savedGoals.target_roles[0]?.toLowerCase().includes('undecided');
  const primaryRole = (savedGoals?.target_roles || [])[0] || 'your target role';

  // Sync draft into editable state when modal opens
  useEffect(() => {
    if (outreachModal?.draft) {
      setEditedDraft(outreachModal.draft);
    }
  }, [outreachModal?.draft]);

  // Generate AI outreach draft via backend function
  const generateOutreachDraft = async (alum) => {
    try {
      const res = await base44.functions.invoke('generateOutreachDraft', {
        studentName: user?.full_name || 'Student',
        major: user?.major || savedGoals?.major || '',
        targetRole: (savedGoals?.target_roles || [])[0] || alum.title || '',
        graduationYear: savedGoals?.graduation_year || '',
        alumniName: alum.name,
        alumniTitle: alum.title,
        alumniCompany: alum.company,
      });
      return res?.data?.message || res?.message || '';
    } catch (e) {
      console.error('Draft generation failed:', e);
      return '';
    }
  };

  // Handle Connect button click
  const handleConnectClick = async (alum) => {
    if (sentTo.includes(alum.linkedin_url)) return;
    setConnectLoading(alum.linkedin_url);
    try {
      const draft = await generateOutreachDraft(alum);
      const isCFFMember = !!alum.cff_user_id;
      setOutreachModal({
        open: true,
        alum,
        draft,
        mode: isCFFMember ? 'cff' : 'linkedin',
      });
    } catch (e) {
      setOutreachModal({
        open: true,
        alum,
        draft: '',
        mode: alum.cff_user_id ? 'cff' : 'linkedin',
      });
    } finally {
      setConnectLoading(null);
    }
  };

  // Send message via CFF (to alumni email)
  const handleSendCFF = async () => {
    if (!outreachModal || !editedDraft.trim()) return;
    setSending(true);
    try {
      const conversation = await base44.entities.Conversation.create({
        participant_emails: [user.email, outreachModal.alum.email],
        participant_names: {
          [user.email]: user.full_name,
          [outreachModal.alum.email]: outreachModal.alum.name,
        },
        subject: `${user.full_name} → ${outreachModal.alum.name}`,
      });
      await base44.entities.Message.create({
        conversation_id: conversation.id,
        sender_email: user.email,
        sender_name: user.full_name,
        recipient_email: outreachModal.alum.email,
        subject: 'Reaching out from CFF',
        body: editedDraft,
        message_type: 'intro_offer',
        is_read: false,
      });
      await base44.functions.invoke('sendMessageNotification', {
        recipient_email: outreachModal.alum.email,
        sender_name: user.full_name,
        message_preview: editedDraft.slice(0, 100),
      });
      await base44.functions.invoke('trackMessage', {
        type: 'alumni_outreach',
        student_id: user.id,
        recipient_name: outreachModal.alum.name,
        recipient_title: outreachModal.alum.title,
        recipient_company: outreachModal.alum.company,
      });
      setSentTo(prev => [...prev, outreachModal.alum.linkedin_url]);
      setOutreachModal(null);
    } catch (e) {
      console.error('Send failed:', e);
    } finally {
      setSending(false);
    }
  };

  // Send message via LinkedIn (copy to clipboard)
  const handleSendLinkedIn = () => {
    if (!outreachModal) return;
    navigator.clipboard.writeText(editedDraft).then(() => {
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 3000);
    });
    window.open(outreachModal.alum.linkedin_url, '_blank');
    setSentTo(prev => [...prev, outreachModal.alum.linkedin_url]);
    setOutreachModal(null);
  };

  // Seed opener on chat start — restore saved conversation if exists
  useEffect(() => {
    if (mode !== 'chat' || messages.length > 0) return;
    const savedConv = isFreshStart ? null : user?.career_goals_conversation;
    const savedAt = isFreshStart ? null : user?.career_goals_conversation_updated_at;
    if (savedConv?.length > 0) {
      setMessages(savedConv);
      const lastAssistant = [...savedConv].reverse().find(m => m.role === 'assistant');
      if (lastAssistant?.suggested_prompts) setSuggestedPrompts(lastAssistant.suggested_prompts);
      setQuestionCount(savedConv.length);
      setRestoredBanner(true);
      setRestoredAt(savedAt ? new Date(savedAt) : null);
      setMajorSaved(true);
      return;
    }
    const firstName = user?.full_name?.split(' ')[0] || 'there';
    const existingMajor = user?.major || user?.career_goals?.major;
    if (existingMajor) {
      setMajorSaved(true);
      setMessages([{
        role: 'assistant',
        content: `Hey ${firstName}! I have 8 quick questions — takes about 3 minutes. No wrong answers, and you can skip anything. Let's figure out what you're looking for. Ready?`,
      }]);
      setSuggestedPrompts(["Let's go →", "I'll do it later"]);
      setQuestionCount(1);
    } else {
      setAwaitingMajor(true);
      setMessages([{
        role: 'assistant',
        content: `Hey ${firstName}! I have 8 quick questions — takes about 3 minutes. No wrong answers, and you can skip anything.\n\nFirst: what's your major? This helps me point you toward roles that actually make sense for your degree.`,
      }]);
      setSuggestedPrompts([]);
      setQuestionCount(1);
    }
    setIsFreshStart(false);
  }, [mode, messages.length, user, majorSaved, isFreshStart]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, suggestedPrompts, loading, conversationDone]);

  const handleSkip = async () => {
    if (loading) return;
    setSuggestedPrompts([]);
    const skipMsg = { role: 'user', content: 'Skip' };
    const newMessages = [...messages, skipMsg];
    setMessages(newMessages);
    setLoading(true);
    try {
      const history = newMessages.map(m => `${m.role === 'user' ? 'Student' : 'FastIQ'}: ${m.content}`).join('\n\n');
      const major = user?.major || user?.career_goals?.major || '';
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `${SYSTEM_PROMPT_BRANCHING}\n\nStudent major: ${major || 'not provided'}\n\nConversation so far:\n${history}\n\nThe student skipped this question. Acknowledge gracefully in one sentence ("No problem — moving on.") then ask the next question.`,
        response_json_schema: RESPONSE_SCHEMA,
      });
      const reply = result?.message || 'No problem — moving on.';
      const prompts = Array.isArray(result?.suggested_prompts) ? result.suggested_prompts.slice(0, 3) : [];
      const isFinal = result?.is_final === true;
      const allMessages = [...newMessages, { role: 'assistant', content: reply, suggested_prompts: isFinal ? [] : prompts }];
      setMessages(allMessages);
      setSuggestedPrompts(isFinal ? [] : prompts);
      setQuestionCount(prev => prev + 1);
      base44.auth.updateMe({ career_goals_conversation: allMessages, career_goals_conversation_updated_at: new Date().toISOString() }).catch(() => {});
      if (isFinal) {
        if (result?.role_recommendations?.length) setRoleRecs(result.role_recommendations);
        if (result?.about_you) setAboutYou(result.about_you);
        if (result?.top_strengths?.length) setTopStrengths(result.top_strengths);
        if (result?.work_environment) setWorkEnvironment(result.work_environment);
        if (result?.honest_challenge) setHonestChallenge(result.honest_challenge);
        if (result?.cff_network_recommendation) setCffNetwork(result.cff_network_recommendation);
        if (result?.preliminary_archetype) setPrelimArchetype(result.preliminary_archetype);
        if (result?.goals_summary) await saveGoals(result.goals_summary, result.preliminary_archetype);
        else setConversationDone(true);
      }
    } catch (e) {
      console.error('Skip failed:', e);
    }
    setLoading(false);
  };

  const handleMajorSubmit = async (major) => {
    if (!major.trim()) return;
    setAwaitingMajor(false);
    setMajorSaved(true);
    setMajorFilter('');
    const userMsg = { role: 'user', content: major.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    base44.auth.updateMe({ major: major.trim() }).catch(() => {});
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `${SYSTEM_PROMPT_BRANCHING}\n\nStudent major: ${major.trim()}\n\nConversation so far:\n${newMessages.map(m => `${m.role === 'user' ? 'Student' : 'FastIQ'}: ${m.content}`).join('\n\n')}\n\nThe student just told you their major. Acknowledge it in one direct sentence, then ask Q2: do they have a clear direction or are they still figuring it out?`,
        response_json_schema: RESPONSE_SCHEMA,
      });
      const reply = result?.message || "Got it. Do you have a sense of what you want to do, or are you still figuring it out?";
      const prompts = Array.isArray(result?.suggested_prompts) ? result.suggested_prompts.slice(0, 3) : ["I have a pretty good idea →", "Still figuring it out"];
      const allMessages = [...newMessages, { role: 'assistant', content: reply, suggested_prompts: prompts }];
      setMessages(allMessages);
      setSuggestedPrompts(prompts);
      setQuestionCount(2);
      base44.auth.updateMe({ career_goals_conversation: allMessages, career_goals_conversation_updated_at: new Date().toISOString() }).catch(() => {});
    } catch (e) {
      const fallback = [...newMessages, { role: 'assistant', content: "Got it. Do you have a sense of what you want to do, or are you still figuring it out?", suggested_prompts: ["I have a pretty good idea →", "Still figuring it out"] }];
      setMessages(fallback);
      setSuggestedPrompts(["I have a pretty good idea →", "Still figuring it out"]);
      setQuestionCount(2);
    }
    setLoading(false);
  };

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;
    if (trimmed === "I'll do it later") {
      setMode('summary');
      return;
    }
    setInput('');
    setError(null);
    setSuggestedPrompts([]);
    const major = user?.major || user?.career_goals?.major || '';
    const isLikelyB9 = questionCount >= 10;
    const newMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const history = newMessages.map(m => `${m.role === 'user' ? 'Student' : 'FastIQ'}: ${m.content}`).join('\n\n');
      const extraSuffix = isLikelyB9 ? SYNTHESIS_SUFFIX : '';

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `${SYSTEM_PROMPT_BRANCHING}${extraSuffix}\n\nStudent major: ${major || 'not provided'}\n\nConversation so far:\n${history}\n\nRespond to the student's latest message.`,
        response_json_schema: RESPONSE_SCHEMA,
      });

      const reply = result?.message || 'I had trouble responding. Please try again.';
      const prompts = Array.isArray(result?.suggested_prompts) ? result.suggested_prompts.slice(0, 3) : [];
      const isFinal = result?.is_final === true;

      const allMessages = [...newMessages, { role: 'assistant', content: reply, timestamp: new Date().toISOString(), suggested_prompts: isFinal ? [] : prompts }];
      setMessages(allMessages);
      setSuggestedPrompts(isFinal ? [] : prompts);
      base44.auth.updateMe({
        career_goals_conversation: allMessages,
        career_goals_conversation_updated_at: new Date().toISOString(),
      }).catch(() => {});
      setQuestionCount(prev => prev + 1);

      if (isFinal) {
        if (result?.career_profile) setCareerProfile(result.career_profile);
        if (result?.role_recommendations?.length) setRoleRecs(result.role_recommendations);
        if (result?.about_you) setAboutYou(result.about_you);
        if (result?.top_strengths?.length) setTopStrengths(result.top_strengths);
        if (result?.work_environment) setWorkEnvironment(result.work_environment);
        if (result?.honest_challenge) setHonestChallenge(result.honest_challenge);
        if (result?.cff_network_recommendation) setCffNetwork(result.cff_network_recommendation);
        if (result?.preliminary_archetype) setPrelimArchetype(result.preliminary_archetype);
        if (result?.goals_summary) await saveGoals(result.goals_summary, result.preliminary_archetype);
        else setConversationDone(true);
      }
    } catch (e) {
      console.error('Goals chat failed:', e);
      setError('llm');
      setRetryText(trimmed);
      setMessages(prev => prev.slice(0, -1));
      setInput(trimmed);
    }
    setLoading(false);
    setIsSynthesizing(false);
  };

  const saveGoals = async (goalsSummary, prelimArch) => {
    try {
      const goalsData = { ...goalsSummary, saved_at: new Date().toISOString() };
      const normalizedGoals = normalizeGoals(goalsData);
      await base44.auth.updateMe({
        career_goals: normalizedGoals,
        ...(prelimArch?.name ? { preliminary_archetype: prelimArch.name } : {}),
        ...(goalsSummary?.graduation_year ? { graduation_year: goalsSummary.graduation_year } : {}),
      });
      setSavedGoals(goalsData);
      setConversationDone(true);

      // Block 3: Prefetch alumni after save (FastIQ users)
      const isFastIQ = !!(user?.fastiq_setup_complete || user?.subscription_status === 'active' || user?.membership_tier === 'fastiq');
      if (isFastIQ) {
        setAlumniLoading(true);
        setTimeout(() => {
          getAlumniByRole(
            goalsData.target_functions || [],
            goalsData.target_roles || [],
            goalsData.location_preference || ''
          ).then(clusters => {
            setAlumniClusters(clusters);
            base44.auth.updateMe({
              alumni_explorer_cache: clusters,
              alumni_explorer_cached_at: new Date().toISOString(),
            }).catch(() => {});
            setAlumniLoading(false);
          }).catch(e => {
            console.error('Alumni prefetch failed:', e);
            setAlumniLoading(false);
          });
        }, 100);
      }
    } catch (e) {
      console.error('Goals save failed:', e);
      setError('save');
    }
  };

  const handleFindLeads = () => {
    setShowLeads(true);
    setShowLeadsArrow(true);
    setTimeout(() => {
      leadsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setShowLeadsArrow(false);
    }, 600);
  };

  const handleSaveLead = async (lead) => {
    const updated = [...savedLeads.filter(l => l.id !== lead.id), { ...lead, saved_at: new Date().toISOString(), contacted: false, contacted_at: null, follow_up_sent: false }];
    setSavedLeads(updated);
    await base44.auth.updateMe({ saved_leads: updated }).catch(() => {});
    const el = document.createElement('div');
    el.textContent = '🔖 Saved to your leads list';
    el.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1A1A1A;color:#fff;padding:10px 20px;border-radius:100px;font-size:13px;font-family:DM Sans,sans-serif;z-index:9999;pointer-events:none;';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  };

  const handleUnsaveLead = async (id) => {
    const updated = savedLeads.filter(l => l.id !== String(id));
    setSavedLeads(updated);
    await base44.auth.updateMe({ saved_leads: updated }).catch(() => {});
  };

  const handleMarkContacted = async (leadId) => {
    const updated = savedLeads.map(l => l.id === String(leadId || activeComposer?.id)
      ? { ...l, contacted: true, contacted_at: new Date().toISOString() } : l);
    if (activeComposer && !updated.find(l => l.id === String(activeComposer.id))) {
      updated.push({ ...activeComposer, saved_at: new Date().toISOString(), contacted: true, contacted_at: new Date().toISOString(), follow_up_sent: false });
    }
    setSavedLeads(updated);
    await base44.auth.updateMe({ saved_leads: updated }).catch(() => {});
    const el = document.createElement('div');
    el.textContent = 'Marked as contacted.';
    el.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1A1A1A;color:#fff;padding:10px 20px;border-radius:100px;font-size:13px;font-family:DM Sans,sans-serif;z-index:9999;pointer-events:none;';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleChipSelect = (p) => {
    if (p === "This doesn't feel right — let's try again") { startChat(); return; }
    sendMessage(p);
  };

  const startChat = () => {
    setMessages([]);
    setSuggestedPrompts([]);
    setConversationDone(false);
    setRoleRecs(null);
    setCareerProfile(null);
    setQuestionCount(0);
    setRestoredBanner(false);
    setConfirmClear(false);
    setMajorSaved(!!(user?.major || user?.career_goals?.major));
    setAwaitingMajor(false);
    setIsFreshStart(true);
    setMode('chat');
    base44.auth.updateMe({ career_goals_conversation: null, career_goals_conversation_updated_at: null }).catch(() => {});
  };

  // ── Summary view (returning user) ──────────────────────────────────────────
  if (mode === 'summary') {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 4px' }}>CAREER GOALS</p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px', letterSpacing: '-0.02em', transition: 'opacity 0.3s' }}>
          {showLeads ? 'Your Goals & Leads.' : 'Your Career Goals.'}
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#888', margin: '0 0 28px', lineHeight: 1.5 }}>The more we know about you, the better we can help you.</p>

        <GoalsSummaryCard
          goals={savedGoals || user?.career_goals}
          user={user}
          onTabChange={onTabChange}
          onFindLeads={handleFindLeads}
          onGoalsUpdated={(updated) => {
            setSavedGoals({ ...(savedGoals || user?.career_goals), ...updated });
            const el = document.createElement('div');
            el.textContent = '✓ Goals updated — refreshing your leads...';
            el.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1A1A1A;color:#fff;padding:10px 20px;border-radius:100px;font-size:13px;font-family:DM Sans,sans-serif;z-index:9999;pointer-events:none;';
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 2500);
          }}
          showLeadsArrow={showLeadsArrow}
          onRestart={startChat}
        />

        {showLeads && (
          <button
            onClick={() => { setShowLeads(false); setTimeout(() => setShowLeads(true), 100); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E85D20', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, minHeight: 'auto', marginBottom: 16 }}>
            ⟳ Refresh My Leads
          </button>
        )}

        {showLeads && (
          <>
            <LeadsSection
              user={user}
              onContact={setActiveComposer}
              savedLeads={savedLeads}
              onSaveLead={handleSaveLead}
              onUnsaveLead={handleUnsaveLead}
              onUpgrade={() => onOpenUpgrade?.()}
              onOpenUpgrade={() => onOpenUpgrade?.()}
              leadsRef={leadsRef}
            />
            <SavedLeads
              savedLeads={savedLeads}
              onContact={setActiveComposer}
              onRemove={handleUnsaveLead}
            />
          </>
        )}

        {activeComposer && (
          <InlineMessageComposer
            lead={activeComposer}
            user={user}
            isFastIQ={isFastIQ}
            onClose={() => setActiveComposer(null)}
            onMarkContacted={handleMarkContacted}
            onSaveToNotebook={(msg) => {
              base44.entities.NotebookEntry.create({
                user_email: user.email,
                content: msg,
                source_page: 'career_goals',
                source_label: 'Outreach Message',
                tags: ['outreach'],
                saved_at: new Date().toISOString(),
              }).catch(() => {});
            }}
          />
        )}
      </div>
    );
  }

  // ── Chat view ──────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '70vh' }}>
      <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #F0F0F0', flexShrink: 0 }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 4px' }}>
          CAREER GOALS
        </p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px', transition: 'opacity 0.3s' }}>
          {conversationDone ? 'Your Career Goals.' : 'Tell FastIQ what you\'re looking for.'}
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: 0 }}>
          The more we know about you, the better we can help you.
        </p>
      </div>

      {questionCount >= 1 && !conversationDone && (
        <div style={{ padding: '12px 24px', background: '#FAFAFA', borderBottom: '1px solid #F0F0F0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', margin: 0, flexShrink: 0, whiteSpace: 'nowrap' }}>
              The more you share...
            </p>
            <div style={{ flex: 1, height: 3, background: '#EEEEEE', borderRadius: 100, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, Math.round((Math.min(questionCount, 8) / 8) * 100))}%`, background: '#E85D20', borderRadius: 100, transition: 'width 0.4s ease' }} />
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', margin: 0, flexShrink: 0, whiteSpace: 'nowrap' }}>
              {Math.min(questionCount, 8)} of 8
            </p>
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 24px' }}>
        {restoredBanner && !conversationDone && (() => {
          const daysDiff = restoredAt ? Math.floor((Date.now() - restoredAt.getTime()) / (1000 * 60 * 60 * 24)) : 0;
          const isStale = daysDiff >= 7;
          return (
            <div style={{ borderTop: '2px solid #E85D20', background: '#FFF5F0', padding: '10px 14px', borderRadius: 8, marginBottom: 14 }}>
              {confirmClear ? (
                <div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#1A1A1A', margin: '0 0 8px' }}>Start a new conversation? Your previous one will be cleared.</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={startChat} style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '6px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>Yes, start fresh</button>
                    <button onClick={() => setConfirmClear(false)} style={{ background: 'none', border: '1px solid #E0E0E0', borderRadius: 100, padding: '6px 16px', fontSize: 12, color: '#666', cursor: 'pointer', minHeight: 'auto' }}>Never mind</button>
                  </div>
                </div>
              ) : isStale ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#E85D20', margin: 0 }}>⚡ You have a saved conversation from {daysDiff} days ago. Continue or start fresh?</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setRestoredBanner(false)} style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '5px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>Continue</button>
                    <button onClick={() => setConfirmClear(true)} style={{ background: 'none', border: '1px solid #E85D20', color: '#E85D20', borderRadius: 100, padding: '5px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>Start Fresh</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#E85D20', margin: 0 }}>⚡ Picking up where you left off</p>
                  <button onClick={() => setConfirmClear(true)} style={{ background: 'none', border: 'none', color: '#E85D20', fontSize: 12, fontWeight: 500, cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline' }}>Start fresh →</button>
                </div>
              )}
            </div>
          );
        })()}

        {messages.map((msg, i) => {
          const isLastAssistant = msg.role === 'assistant' && i === messages.length - 1 && !loading && !conversationDone;
          const showSkip = isLastAssistant && !awaitingMajor && suggestedPrompts.length > 0 && questionCount > 1;
          const showSaveIcon = i >= 2;
          return (
            <React.Fragment key={i}>
              <MessageBubble message={msg} />
              {msg.role === 'assistant' && showSaveIcon && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 42, marginTop: -6, marginBottom: 8 }}>
                  <SaveToNotebookButton content={msg.content} sourcePage="career_goals" userEmail={user?.email} />
                </div>
              )}
              {isLastAssistant && awaitingMajor && !loading && (
                <div style={{ marginLeft: 42, marginBottom: 16 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {MAJOR_CHIPS.map(m => (
                      <button key={m}
                        onClick={() => {
                          if (m === 'Other / Type mine →') { inputRef.current?.focus(); return; }
                          handleMajorSubmit(m);
                        }}
                        className="major-chip"
                        style={{ background: '#fff', border: '1.5px solid #e0e0e0', color: '#555', borderRadius: 100, padding: '8px 16px', fontSize: 14, fontWeight: 400, cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s ease', fontFamily: "'DM Sans', sans-serif" }}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {isLastAssistant && !awaitingMajor && suggestedPrompts.length > 0 && (
                <>
                  <SuggestedPrompts prompts={suggestedPrompts} onSelect={handleChipSelect} onSkip={showSkip ? handleSkip : null} />
                  <p style={{ fontSize: '11px', color: 'rgba(0,0,0,0.35)', margin: '2px 0 0 42px', fontFamily: "'DM Sans', sans-serif" }}>Or type your own answer below</p>
                </>
              )}
            </React.Fragment>
          );
        })}

        {loading && <TypingIndicator />}

        {conversationDone && roleRecs?.length > 0 && (
          <CareerProfileCard
            careerProfile={careerProfile}
            roleRecommendations={roleRecs}
            aboutYou={aboutYou}
            topStrengths={topStrengths}
            workEnvironment={workEnvironment}
            honestChallenge={honestChallenge}
            cffNetwork={cffNetwork}
            preliminaryArchetype={prelimArchetype}
            userEmail={user?.email}
            user={user}
            onTabChange={onTabChange}
            onFindLeads={() => { setMode('summary'); setTimeout(handleFindLeads, 200); }}
            onRestart={startChat}
            onPromptSelect={handleChipSelect}
          />
        )}

        {conversationDone && !roleRecs?.length && savedGoals && (
          <>
            <GoalsSummaryCard
              goals={savedGoals}
              onTabChange={onTabChange}
              onFindLeads={() => { setMode('summary'); setTimeout(handleFindLeads, 200); }}
              onRestart={startChat}
            />

            {/* Alumni Explorer — gated by FastIQ, cache-aware */}
            {user.is_fastiq || user.fastiq_setup_complete || user.subscription_status === 'active' || user.membership_tier === 'fastiq' ? (
              alumniLoading ? (
                <div style={{ marginTop: '32px', fontSize: '13px', color: '#888' }}>
                  Finding alumni in your target roles...
                </div>
              ) : alumniClusters.length > 0 ? (
                <div style={{
                  marginTop: '32px',
                  background: '#FAFAFA',
                  border: '1px solid #E5E5E5',
                  borderRadius: '12px',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '24px',
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '16px' }}>🔒</span>
                      <span style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#1A1A1A',
                      }}>
                        Connect with alumni in your target role
                      </span>
                    </div>
                    <p style={{
                      fontSize: '13px',
                      color: '#666',
                      margin: 0,
                      lineHeight: '1.5',
                      maxWidth: '420px',
                    }}>
                      See which UF alumni have the exact job you're targeting — 
                      and reach out with an AI-drafted message in one click.
                    </p>
                  </div>
                  <button
                    onClick={onOpenUpgrade}
                    style={{
                      background: '#E85D20',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 18px',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#fff',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      minHeight: 'auto',
                    }}
                  >
                    Unlock FastIQ →
                  </button>
                </div>
              ) : null
            ) : alumniClusters?.length > 0 ? (
              <div style={{ marginTop: '32px' }}>
                <div style={{ marginBottom: '16px' }}>
                  {isUndecided ? (
                    <>
                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0', color: '#1A1A1A' }}>
                        Not sure which direction to go?
                      </h3>
                      <p style={{ fontSize: '13px', color: '#666', margin: 0, lineHeight: 1.5 }}>
                        Talk to someone who's been there. Connect with UF alumni who have roles you're exploring.
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0', color: '#1A1A1A' }}>
                        Want to know what a {primaryRole} is really like?
                      </h3>
                      <p style={{ fontSize: '13px', color: '#666', margin: 0, lineHeight: 1.5 }}>
                        Connect with UF alumni who have the exact role you're targeting.
                      </p>
                    </>
                  )}
                </div>

                {alumniClusters.map(cluster => (
                  <div key={cluster.cluster} style={{ marginBottom: '24px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px',
                    }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A1A', fontFamily: "'DM Sans', sans-serif" }}>
                        {cluster.cluster}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                      {cluster.alumni.map(alum => (
                        <div key={alum.linkedin_url} style={{
                          background: '#FAFAFA',
                          border: '1px solid #E5E5E5',
                          borderRadius: '10px',
                          padding: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                        }}>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A1A', fontFamily: "'DM Sans', sans-serif" }}>
                            {alum.name}
                          </span>
                          <span style={{ fontSize: '12px', color: '#555', fontFamily: "'DM Sans', sans-serif" }}>
                            {alum.title}
                          </span>
                          <span style={{ fontSize: '12px', color: '#888', fontFamily: "'DM Sans', sans-serif" }}>
                            {alum.company}
                          </span>
                          <button
                            onClick={() => handleConnectClick(alum)}
                            disabled={connectLoading === alum.linkedin_url || sentTo.includes(alum.linkedin_url)}
                            style={{
                              marginTop: '8px',
                              background: 'none',
                              border: '1px solid #E85D20',
                              borderRadius: '6px',
                              padding: '5px 10px',
                              fontSize: '12px',
                              color: '#E85D20',
                              cursor: sentTo.includes(alum.linkedin_url) ? 'default' : 'pointer',
                              fontFamily: "'DM Sans', sans-serif",
                              fontWeight: 500,
                              minHeight: 'auto',
                              transition: 'all 0.2s ease',
                              opacity: connectLoading === alum.linkedin_url || sentTo.includes(alum.linkedin_url) ? 0.7 : 1,
                              }}
                              onMouseEnter={(e) => {
                              if (!sentTo.includes(alum.linkedin_url)) {
                                e.target.style.background = '#E85D20';
                                e.target.style.color = '#fff';
                              }
                              }}
                              onMouseLeave={(e) => {
                              if (!sentTo.includes(alum.linkedin_url)) {
                                e.target.style.background = 'none';
                                e.target.style.color = '#E85D20';
                              }
                              }}
                              >
                              {connectLoading === alum.linkedin_url
                              ? 'Drafting...'
                              : sentTo.includes(alum.linkedin_url)
                              ? 'Message sent ✓'
                              : 'Connect →'}
                              </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: '#0d1117', border: '1px solid rgba(232,93,32,0.3)', borderRadius: 16, padding: '24px', marginTop: '32px', textAlign: 'center' }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E85D20', margin: '0 0 8px' }}>🔒 FASTIQ FEATURE</p>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>Connect with UF Alumni</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6 }}>See real alumni in your target roles and reach out directly. Available with FastIQ.</p>
              </div>
            )
            }
          </>
        )}

        {error === 'llm' && (
          <div style={{ background: '#FFF5F0', border: '1px solid #E85D20', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <p style={{ fontSize: 13, color: '#E85D20', margin: 0 }}>FastIQ hit a snag. Tap to retry.</p>
            <button onClick={() => { setError(null); sendMessage(retryText); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E85D20', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
              <RefreshCw style={{ width: 14, height: 14 }} /> Retry
            </button>
          </div>
        )}

        {error === 'save' && (
          <div style={{ background: '#FFF5F0', border: '1px solid #E85D20', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <p style={{ fontSize: 13, color: '#E85D20', margin: 0 }}>Your goals couldn't be saved. Try again.</p>
            <button onClick={() => { setError(null); saveGoals(savedGoals); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E85D20', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
              <RefreshCw style={{ width: 14, height: 14 }} /> Retry
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Outreach Modal */}
      {outreachModal?.open && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50, padding: '20px',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '28px',
            width: '100%',
            maxWidth: '520px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            {/* Header */}
            <div>
              <p style={{
                fontSize: '11px',
                color: '#888',
                margin: '0 0 4px 0',
                textTransform: 'uppercase',
                letterSpacing: '.06em',
                fontWeight: 600,
              }}>
                {outreachModal.mode === 'linkedin' ? 'Reaching out via LinkedIn' : 'Sending via CFF'}
              </p>
              <p style={{ fontSize: '15px', fontWeight: '500', color: '#1A1A1A', margin: 0 }}>
                {outreachModal.alum.name}
              </p>
              <p style={{ fontSize: '13px', color: '#666', margin: '2px 0 0 0' }}>
                {outreachModal.alum.title} · {outreachModal.alum.company}
              </p>
            </div>

            {/* Mode-specific instruction */}
            {outreachModal.mode === 'linkedin' ? (
              <div style={{
                background: '#F0F7FF',
                border: '1px solid #B3D9FF',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '12px',
                color: '#0057B8',
                lineHeight: '1.5',
              }}>
                Edit your message below, then click "Copy & Open LinkedIn" — paste it into your connection request.
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: '#E85D20' }}>⚡</span>
                <span style={{ fontSize: '12px', color: '#888' }}>
                  FastIQ drafted this for you — edit freely before sending
                </span>
              </div>
            )}

            {/* Editable draft */}
            <textarea
              value={editedDraft}
              onChange={e => setEditedDraft(e.target.value)}
              rows={6}
              style={{
                width: '100%',
                fontSize: '13px',
                lineHeight: '1.6',
                color: '#1A1A1A',
                background: '#F9F9F9',
                border: '1px solid #E0E0E0',
                borderRadius: '8px',
                padding: '12px',
                resize: 'vertical',
                fontFamily: "'DM Sans', sans-serif",
                boxSizing: 'border-box',
              }}
            />

            {/* Character count */}
            <p style={{
              fontSize: '11px',
              color: editedDraft.length > 300 && outreachModal.mode === 'linkedin'
                ? '#EF4444'
                : '#888',
              margin: '-8px 0 0 0',
              textAlign: 'right',
            }}>
              {editedDraft.length} characters
              {outreachModal.mode === 'linkedin' && editedDraft.length > 300 && (
                <span> — LinkedIn limit is 300</span>
              )}
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setOutreachModal(null)}
                style={{
                  background: 'none',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px', padding: '8px 16px',
                  fontSize: '13px', color: '#666', cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  minHeight: 'auto',
                }}
              >
                Cancel
              </button>

              {outreachModal.mode === 'linkedin' ? (
                <button
                  onClick={handleSendLinkedIn}
                  disabled={!editedDraft.trim()}
                  style={{
                    background: '#0077B5',
                    border: 'none', borderRadius: '8px',
                    padding: '8px 20px', fontSize: '13px',
                    fontWeight: '500', color: '#fff',
                    cursor: !editedDraft.trim() ? 'not-allowed' : 'pointer',
                    opacity: !editedDraft.trim() ? 0.7 : 1,
                    fontFamily: "'DM Sans', sans-serif",
                    minHeight: 'auto',
                  }}
                >
                  Copy & Open LinkedIn →
                </button>
              ) : (
                <button
                  onClick={handleSendCFF}
                  disabled={sending || !editedDraft.trim()}
                  style={{
                    background: '#E85D20',
                    border: 'none', borderRadius: '8px',
                    padding: '8px 20px', fontSize: '13px',
                    fontWeight: '500', color: '#fff',
                    cursor: sending || !editedDraft.trim() ? 'not-allowed' : 'pointer',
                    opacity: sending || !editedDraft.trim() ? 0.7 : 1,
                    fontFamily: "'DM Sans', sans-serif",
                    minHeight: 'auto',
                  }}
                >
                  {sending ? 'Sending...' : 'Send message →'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Copy toast */}
      {copyToast && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%',
          transform: 'translateX(-50%)',
          background: '#fff',
          border: '1px solid #E0E0E0',
          borderRadius: '8px', padding: '10px 18px',
          fontSize: '13px', color: '#1A1A1A',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 100,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          ✓ Message copied — paste it into your LinkedIn connection request
        </div>
      )}

      {!conversationDone && (
        <div className="chat-input-bar" style={{ padding: '12px 16px', borderTop: '1px solid #F0F0F0', flexShrink: 0, background: '#fff', position: 'sticky', bottom: 0, zIndex: 100 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', background: '#F9F9F9', border: '1px solid #E0E0E0', borderRadius: 16, padding: '8px 12px' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={awaitingMajor ? "Or type your major here..." : "Type your answer..."}
              rows={1}
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', resize: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#1A1A1A', lineHeight: 1.5, maxHeight: 120, overflowY: 'auto' }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{ background: input.trim() && !loading ? '#E85D20' : '#E0E0E0', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !loading ? 'pointer' : 'default', flexShrink: 0, minHeight: 'auto', transition: 'background 0.2s' }}
            >
              {loading
                ? <Loader2 style={{ width: 16, height: 16, color: '#fff', animation: 'spin 1s linear infinite' }} />
                : <Send style={{ width: 16, height: 16, color: '#fff' }} />}
            </button>
          </div>
          <p style={{ fontSize: 11, color: '#BBB', textAlign: 'center', margin: '6px 0 0', fontFamily: "'DM Sans', sans-serif" }}>
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      )}

      <style>{`
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        button:focus { outline: none; box-shadow: 0 0 0 2px #E85D20; }
        input:focus, textarea:focus { outline: none; box-shadow: 0 0 0 2px #E85D20; }
        .major-chip:hover { border-color: #E85D20 !important; color: #E85D20 !important; }
        .chat-chip:hover { background: #E85D20 !important; color: #fff !important; }
        @media (max-width: 768px) {
          .chat-bubble-ai { max-width: 88% !important; }
          .chat-bubble-user { max-width: 80% !important; }
          .chips-container { flex-direction: column !important; width: 100%; }
          .chips-container .chat-chip { width: 100%; text-align: center; }
        }
      `}</style>
    </div>
  );
}