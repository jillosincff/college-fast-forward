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

const SYSTEM_PROMPT_BRANCHING = `You are FastIQ, the AI career advisor inside College Fast Forward (CFF). You are running a branching intake conversation to understand a college student's career goals.

The conversation has TWO paths:
- PATH A: Student has direction → ask Q1–Q8 (role, industry, internship/fulltime+grad year, location, experience, company size, dream company, gaps). One question at a time.
- PATH B: Student is undecided → ask B1–B9 discovery questions one at a time (work environment, variety vs routine, desk/field/remote, strengths, role in groups, problem type, motivation, entrepreneurship interest, self-assessment). After B9, synthesize and generate role recommendations.

Current path is determined by the student's opening response. If they said something like "I have a pretty good idea" → Path A. If "no idea" or "still figuring it out" → Path B.

Rules:
- Always acknowledge the student's previous answer warmly before asking the next question (1 sentence max)
- One question at a time — never list multiple questions
- If student is unsure, be supportive and move on
- Keep responses SHORT — one acknowledgment + the next question
- For Path A: set is_final=true after Q8 with goals_summary populated
- For Path B: set is_final=true after B9 WITH full synthesis, role_recommendations, career_profile, AND goals_summary

CRITICAL RULES:
- GRADUATION YEAR: After the internship vs full-time question, if graduation year was not explicitly stated, ask: "Just so I can give you accurate timeline advice — what year do you graduate? 2025, 2026, 2027?" with suggested_prompts chips: ["2025", "2026", "2027", "2028+"]. NEVER assume or hallucinate graduation timing.
- NO EXPERIENCE ACKNOWLEDGMENT: When a student answers the experience question with "none", "no experience", or similar, your response MUST include this exact acknowledgment before moving on: "Starting from zero is totally fine — and honestly, a lot of CFF parents specifically remember what it felt like and are the most generous with their time. We'll build your path with that in mind."
- ROLE QUALITY: Each role recommendation must use the specific role title (not generic), name specific company types or companies that hire for it, explain exactly why it fits THIS student based on their specific answers, give a specific honest challenge relevant to their experience level, and include no_experience_first_step if they have no experience.
- HONEST CHALLENGE: The honest_challenge must be specific to this student — reference their experience level, goals, and answers. Never write advice that applies to any student.
- PRELIMINARY ARCHETYPE: Always infer a preliminary_archetype from the conversation, even mid-conversation.

Return JSON with: message, is_final (bool), suggested_prompts (2-3 chips), preliminary_archetype (always), goals_summary (null until final), role_recommendations (null unless final), about_you (null unless final), top_strengths (null unless final), work_environment (null unless final), honest_challenge (null unless final), cff_network_recommendation (null unless final)`;

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

Return 4-6 role recommendations ranked by fit. Set is_final=true and populate ALL fields including about_you, top_strengths, work_environment, honest_challenge, cff_network_recommendation, and preliminary_archetype.`;

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hasExistingGoals(user) {
  const g = user?.career_goals;
  return !!(g?.target_roles?.length || g?.target_industries?.length || g?.role || g?.industries?.length);
}

// ─── Small UI components ──────────────────────────────────────────────────────

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 14 }}>
      {!isUser && (
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0d1117', border: '1px solid rgba(232,93,32,0.4)', color: '#E85D20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, marginRight: 10, marginTop: 2 }}>
          ⚡
        </div>
      )}
      <div style={{
        maxWidth: '80%',
        background: isUser ? '#1A1A1A' : '#fff',
        color: isUser ? '#fff' : '#1A1A1A',
        border: isUser ? 'none' : '1px solid #E5E5E5',
        borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
        padding: '12px 16px',
        fontSize: 14,
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {message.content}
      </div>
    </div>
  );
}

function SuggestedPrompts({ prompts, onSelect }) {
  if (!prompts?.length) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginLeft: 42, marginBottom: 16 }}>
      {prompts.map((p, i) => (
        <button key={i} onClick={() => onSelect(p)}
          style={{ background: '#FFF5F0', border: '1px solid #E85D20', color: '#E85D20', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', minHeight: 'auto', textAlign: 'left' }}>
          {p}
        </button>
      ))}
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

export default function FreeTierCareerGoalsTab({ user, onTabChange }) {
  const [mode, setMode] = useState(hasExistingGoals(user) ? 'summary' : 'chat');
  const [showLeads, setShowLeads] = useState(false);
  const [showLeadsArrow, setShowLeadsArrow] = useState(false);
  const [savedLeads, setSavedLeads] = useState(() => user?.saved_leads || []);
  const [activeComposer, setActiveComposer] = useState(null); // lead object
  const leadsRef = useRef(null);
  const isFastIQ = !!(user?.fastiq_setup_complete || user?.subscription_status === 'active' || user?.membership_tier === 'fastiq');
  const [messages, setMessages] = useState([]);
  const [suggestedPrompts, setSuggestedPrompts] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // null | 'llm' | 'save'
  const [retryText, setRetryText] = useState('');
  const [savedGoals, setSavedGoals] = useState(user?.career_goals || null);
  const [careerProfile, setCareerProfile] = useState(null);
  const [roleRecs, setRoleRecs] = useState(null);
  const [conversationDone, setConversationDone] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [questionCount, setQuestionCount] = useState(0); // track how many AI turns to detect B9
  const [restoredBanner, setRestoredBanner] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [restoredAt, setRestoredAt] = useState(null);
  const [aboutYou, setAboutYou] = useState(null);
  const [topStrengths, setTopStrengths] = useState(null);
  const [workEnvironment, setWorkEnvironment] = useState(null);
  const [honestChallenge, setHonestChallenge] = useState(null);
  const [cffNetwork, setCffNetwork] = useState(null);
  const [prelimArchetype, setPrelimArchetype] = useState(null);
  const bottomRef = useRef(null);

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
      return;
    }
    const firstName = user?.full_name?.split(' ')[0] || 'there';
    setMessages([{
      role: 'assistant',
      content: `Hey ${firstName}! I'm going to ask you a few questions so I can personalize your entire CFF experience. There are no wrong answers — even "I have no idea" is a great place to start. So let's begin: do you have a sense of what kind of work you're looking for, or are you still figuring that out?`,
    }]);
    setSuggestedPrompts(["I have a pretty good idea", "I have some ideas but I'm not sure", "Honestly no idea yet"]);
    setQuestionCount(1);
  }, [mode, messages.length, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, suggestedPrompts, loading, conversationDone]);

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;
    setInput('');
    setError(null);
    setSuggestedPrompts([]);

    const newMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(newMessages);
    setLoading(true);

    // Detect if Path B is likely done (after ~10 AI turns = opener + B1-B9)
    const isLikelyB9 = questionCount >= 10;

    try {
      const history = newMessages.map(m => `${m.role === 'user' ? 'Student' : 'FastIQ'}: ${m.content}`).join('\n\n');
      const extraSuffix = isLikelyB9 ? SYNTHESIS_SUFFIX : '';

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `${SYSTEM_PROMPT_BRANCHING}${extraSuffix}\n\nConversation so far:\n${history}\n\nRespond to the student's latest message.`,
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
      });
      setSavedGoals(goalsData);
      setConversationDone(true);
    } catch (e) {
      console.error('Goals save failed:', e);
      setError('save');
    }
  };

  const startChat = () => {
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
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Your Goals &amp; Leads.</h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#888', margin: '0 0 28px', lineHeight: 1.5 }}>Set your goals. See who can help. Start making moves.</p>

        {/* Goals card */}
        <GoalsSummaryCard
          goals={savedGoals || user?.career_goals}
          onTabChange={onTabChange}
          onFindLeads={handleFindLeads}
          onRestart={startChat}
          showLeadsArrow={showLeadsArrow}
        />

        {/* Refresh link (if leads already shown) */}
        {showLeads && (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#AAAAAA', textAlign: 'right', margin: '-12px 0 16px', cursor: 'pointer' }}
            onClick={() => { setShowLeads(false); setTimeout(() => setShowLeads(true), 100); }}>
            Refresh my leads
          </p>
        )}

        {/* Leads section */}
        {showLeads && (
          <>
            <LeadsSection
              user={user}
              onContact={setActiveComposer}
              savedLeads={savedLeads}
              onSaveLead={handleSaveLead}
              onUnsaveLead={handleUnsaveLead}
              onUpgrade={onOpenUpgrade}
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
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' }}>
          Tell FastIQ what you're looking for.
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: 0 }}>
          The more you share, the smarter your entire experience gets.
        </p>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 8px' }}>

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
          return (
            <React.Fragment key={i}>
              <MessageBubble message={msg} />
              {msg.role === 'assistant' && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 42, marginTop: -6, marginBottom: 8 }}>
                  <SaveToNotebookButton content={msg.content} sourcePage="career_goals" userEmail={user?.email} />
                </div>
              )}
              {isLastAssistant && suggestedPrompts.length > 0 && (
                <SuggestedPrompts prompts={suggestedPrompts} onSelect={handleChipSelect} />
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
        <div style={{ padding: '12px 16px', borderTop: '1px solid #F0F0F0', flexShrink: 0, background: '#fff' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', background: '#F9F9F9', border: '1px solid #E0E0E0', borderRadius: 16, padding: '8px 12px' }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer..."
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
      `}</style>
    </div>
  );
}