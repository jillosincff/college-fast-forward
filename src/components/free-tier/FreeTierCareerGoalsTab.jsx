import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, RefreshCw, Loader2 } from 'lucide-react';
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
Q8: Do you have a dream company in mind? And what's your biggest gap right now? Free text + chips: ["No dream company yet", "Still building skills"]

PATH B (figuring it out — answered Q2 with undecided):
Q3: Work environment — what sounds most like you? Chips based on major.
Q4: What's your natural strength? Chips: ["Talking to people / relationships", "Analyzing data / solving problems", "Creating things / design / writing", "Leading / organizing / making things happen"]
Q5: What motivates you most? Chips: ["Making a lot of money", "Making an impact", "Building something of my own", "Stability and work-life balance"]
Q6: Are you interested in entrepreneurship or starting something? Chips: ["Definitely", "Maybe someday", "Not really"]
Q7: Graduation year? Chips: ["2025", "2026", "2027", "2028+"]
Q8: Biggest gap or concern? Chips: ["No internship experience yet", "Not sure my major is right", "Don't know how to network", "Something else"]
After Q8 on Path B: synthesize all answers into role recommendations.

STUDENT MAJOR: The student's major is provided in the conversation context. ALWAYS use it to:
1. Personalize acknowledgments ("Finance — great foundation for analyst roles." / "English — more flexible than people think. Consulting, marketing, media, law, and tech all hire English majors.")
2. Only suggest roles realistic for their major — never suggest software engineering to a Communications major unless they explicitly want it
3. Flag honest gaps: if their target doesn't match major, acknowledge directly
4. Suggest major-specific clubs, certifications, or experiences

Rules:
- Always acknowledge the previous answer warmly before the next question (1 sentence max)
- One question at a time — never list multiple questions
- After key answers, remind student their data is being used: "Finance — already narrowing your company list." / "NYC — focusing your leads there."
- Keep responses SHORT — one acknowledgment + the next question
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

WRONG message field: "Fashion is great! What industry? Chips: ['Tech', 'Fashion', 'Healthcare']"
CORRECT message field: "Fashion is great! What industry are you targeting for this role?"
CORRECT suggested_prompts: ["Tech", "Fashion", "Healthcare", "Something else"]

Return JSON with: message, is_final (bool), suggested_prompts (2-3 chips, NO skip option), preliminary_archetype (always), goals_summary (null until final), role_recommendations (null unless final), about_you (null unless final), top_strengths (null unless final), work_environment (null unless final), honest_challenge (null unless final), cff_network_recommendation (null unless final)`;

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



  // Removed frontend diagnostic block — now using backend getLeadsForStudent

  // Seed opener on chat start — restore saved conversation if exists
  useEffect(() => {
    if (mode !== 'chat' || messages.length > 0) return;
    const savedConv = user?.career_goals_conversation;
    const savedAt = user?.career_goals_conversation_updated_at;
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
      // Skip major Q1 — go straight to opener
      setMajorSaved(true);
      setMessages([{
        role: 'assistant',
        content: `Hey ${firstName}! I have 8 quick questions — takes about 3 minutes. No wrong answers, and you can skip anything. Let's figure out what you're looking for. Ready?`,
      }]);
      setSuggestedPrompts(["Let's go →", "I'll do it later"]);
      setQuestionCount(1);
    } else {
      // Ask major first
      setAwaitingMajor(true);
      setMessages([{
        role: 'assistant',
        content: `Hey ${firstName}! I have 8 quick questions — takes about 3 minutes. No wrong answers, and you can skip anything.\n\nFirst: what's your major? This helps me point you toward roles that actually make sense for your degree.`,
      }]);
      setSuggestedPrompts([]);
      setQuestionCount(1);
    }
  }, [mode, messages.length, user]);

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
    // Save major immediately
    base44.auth.updateMe({ major: major.trim() }).catch(() => {});
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `${SYSTEM_PROMPT_BRANCHING}\n\nStudent major: ${major.trim()}\n\nConversation so far:\n${newMessages.map(m => `${m.role === 'user' ? 'Student' : 'FastIQ'}: ${m.content}`).join('\n\n')}\n\nThe student just told you their major. Acknowledge it with a brief personalized comment (1 sentence) that shows you understood the relevance of their major, then ask Q2: do they have a clear direction or are they still figuring it out?`,
        response_json_schema: RESPONSE_SCHEMA,
      });
      const reply = result?.message || "Got it! Do you have a sense of what you want to do, or are you still figuring it out?";
      const prompts = Array.isArray(result?.suggested_prompts) ? result.suggested_prompts.slice(0, 3) : ["I have a pretty good idea →", "Still figuring it out"];
      const allMessages = [...newMessages, { role: 'assistant', content: reply, suggested_prompts: prompts }];
      setMessages(allMessages);
      setSuggestedPrompts(prompts);
      setQuestionCount(2);
      base44.auth.updateMe({ career_goals_conversation: allMessages, career_goals_conversation_updated_at: new Date().toISOString() }).catch(() => {});
    } catch (e) {
      const fallback = [...newMessages, { role: 'assistant', content: "Got it! Do you have a sense of what you want to do, or are you still figuring it out?", suggested_prompts: ["I have a pretty good idea →", "Still figuring it out"] }];
      setMessages(fallback);
      setSuggestedPrompts(["I have a pretty good idea →", "Still figuring it out"]);
      setQuestionCount(2);
    }
    setLoading(false);
  };

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;
    // Handle "I'll do it later" on opener
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
      // Persist conversation to DB
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
      await base44.auth.updateMe({
        career_goals: goalsData,
        ...(prelimArch?.name ? { preliminary_archetype: prelimArch.name } : {}),
        ...(goalsSummary?.graduation_year ? { graduation_year: goalsSummary.graduation_year } : {}),
      });
      setSavedGoals(goalsData);
      setConversationDone(true);
    } catch (e) {
      console.error('Goals save failed:', e);
      setError('save');
    }
  };

  const startChat = () => {
    freshStartRef.current = true;
    // Clear saved conversation from DB
    base44.auth.updateMe({ career_goals_conversation: null, career_goals_conversation_updated_at: null }).catch(() => {});
    setMode('chat');
    setMessages([]);
    setSuggestedPrompts([]);
    setConversationDone(false);
    setCareerProfile(null);
    setRoleRecs(null);
    setError(null);
    setQuestionCount(0);
    setAboutYou(null);
    setTopStrengths(null);
    setWorkEnvironment(null);
    setHonestChallenge(null);
    setCffNetwork(null);
    setPrelimArchetype(null);
    setRestoredBanner(false);
    setConfirmClear(false);
    setRestoredAt(null);
    setAwaitingMajor(false);
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
    // toast
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
    // If lead wasn't saved yet, add it as contacted
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

  // ── Summary view (returning user) ──────────────────────────────────────────
  if (mode === 'summary') {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
        {/* Page header */}
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 4px' }}>CAREER GOALS</p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px', letterSpacing: '-0.02em', transition: 'opacity 0.3s' }}>
          {showLeads ? 'Your Goals & Leads.' : 'Your Career Goals.'}
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#888', margin: '0 0 28px', lineHeight: 1.5 }}>The more we know about you, the better we can help you.</p>

        {/* Goals card */}
        <GoalsSummaryCard
          goals={savedGoals || user?.career_goals}
          user={user}
          onTabChange={onTabChange}
          onFindLeads={handleFindLeads}
          onGoalsUpdated={(updated) => {
            setSavedGoals({ ...(savedGoals || user?.career_goals), ...updated });
            // Toast
            const el = document.createElement('div');
            el.textContent = '✓ Goals updated — refreshing your leads...';
            el.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1A1A1A;color:#fff;padding:10px 20px;border-radius:100px;font-size:13px;font-family:DM Sans,sans-serif;z-index:9999;pointer-events:none;';
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 2500);
          }}
          showLeadsArrow={showLeadsArrow}
        />

        {/* Refresh link + missing goals prompt */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, margin: '8px 0 16px' }}>
          {/* Missing goals nudge card */}
          {(() => {
            const g = savedGoals || user?.career_goals;
            const missing = [];
            if (!g?.graduation_year) missing.push({ key: 'grad', label: '+ Graduation year' });
            if (!g?.dream_company) missing.push({ key: 'dream', label: '+ Dream company' });
            if (!g?.company_size_preference?.length) missing.push({ key: 'size', label: '+ Company size preference' });
            if (missing.length === 0) return null;
            return (
              <div style={{ background: '#FFF5F0', border: '1px solid #FDDBC8', borderRadius: 12, padding: '14px 18px' }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: '#E85D20', margin: '0 0 4px' }}>⚡ Add {missing.length} more detail{missing.length > 1 ? 's' : ''} for better lead matches</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', margin: '0 0 10px' }}>These fields help FastIQ find more relevant parents and alumni for you.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {missing.map(m => (
                    <button key={m.key} onClick={startChat}
                      style={{ background: '#fff', border: '1px solid #FDDBC8', color: '#E85D20', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}
          {/* Refresh leads */}
          {showLeads && (
            <button
              onClick={() => { setShowLeads(false); setTimeout(() => setShowLeads(true), 100); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E85D20', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, minHeight: 'auto', marginLeft: 'auto' }}>
              ⟳ Refresh My Leads
            </button>
          )}
        </div>

        {/* Leads section */}
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

        {/* Inline message composer */}
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
      {/* Header */}
      <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #F0F0F0', flexShrink: 0 }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 4px' }}>
          CAREER GOALS
        </p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px', transition: 'opacity 0.3s' }}>
          {conversationDone ? 'Your Career Goals.' : 'Tell FastIQ what you’re looking for.'}
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: 0 }}>
          The more we know about you, the better we can help you.
        </p>
      </div>

      {/* Progress bar */}
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

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 24px' }}>

        {/* Restored conversation banner */}
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
              {/* Major chips — shown directly below the first assistant message */}
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
                <SuggestedPrompts prompts={suggestedPrompts} onSelect={handleChipSelect} onSkip={showSkip ? handleSkip : null} />
              )}
            </React.Fragment>
          );
        })}

        {loading && <TypingIndicator />}

        {/* Path B reveal card */}
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
            onTabChange={onTabChange}
            onFindLeads={() => { setMode('summary'); setTimeout(handleFindLeads, 200); }}
            onRestart={startChat}
            onPromptSelect={handleChipSelect}
          />
        )}

        {/* Path A summary card */}
        {conversationDone && !roleRecs?.length && savedGoals && (
          <GoalsSummaryCard
            goals={savedGoals}
            onTabChange={onTabChange}
            onFindLeads={() => { setMode('summary'); setTimeout(handleFindLeads, 200); }}
            onRestart={startChat}
          />
        )}

        {/* Error states */}
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

      {/* Input bar — hidden when done */}
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