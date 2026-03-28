import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Loader2 } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import { getIndustryChipsForMajor } from '@/constants/majorToIndustries';
import GoalsSummaryCard from './GoalsSummaryCard';
import LeadsSection from './LeadsSection';
import SavedLeads from './SavedLeads';
import InlineMessageComposer from './InlineMessageComposer';
import CareerProfileCard from './CareerProfileCard';

// ── Helpers ────────────────────────────────────────────────────────────────────

function hasExistingGoals(user) {
  const g = user?.career_goals;
  return !!(g?.target_roles?.length || g?.target_industries?.length);
}

// ── Question definitions ───────────────────────────────────────────────────────

const QUESTIONS = {
  q1_major: {
    message: (user) => `Let's build your career plan. You're studying ${user?.major || 'your major'} at ${user?.school_name || 'your school'} — is that right?`,
    chips: (user) => ['Yes, that\'s right', 'Update my major'],
    freeText: false,
    next: () => 'q2_direction',
    save: null,
  },
  q2_direction: {
    message: () => `Do you have a clear direction, or are you still figuring it out?`,
    chips: () => ["I have a pretty good idea →", "Still figuring it out"],
    freeText: false,
    next: (ans) => ans === "I have a pretty good idea →" ? 'pathA_q3_role' : 'pathB_q3_environment',
    save: (ans) => ({ has_direction: ans === "I have a pretty good idea →" }),
  },

  // PATH A
  pathA_q3_role: {
    message: () => `What role or type of work are you targeting?`,
    chips: () => [],
    freeText: true,
    placeholder: 'e.g. Marketing Manager, Software Engineer, Investment Banker...',
    next: () => 'pathA_q4_industry',
    save: (ans) => ({ target_roles: ans.split(',').map(r => r.trim()).filter(Boolean) }),
  },
  pathA_q4_industry: {
    message: () => `What industry are you targeting?`,
    chips: (user) => getIndustryChipsForMajor(user?.major),
    freeText: false,
    next: () => 'pathA_q5_jobtype',
    save: (ans) => ({ target_industries: ans === 'Something else' ? [] : [ans] }),
  },
  pathA_q5_jobtype: {
    message: () => `Are you looking for an internship or full-time role?`,
    chips: () => ['Internship', 'Full-time', 'Both'],
    freeText: false,
    next: (ans) => ans === 'Internship' ? 'pathA_q6_location' : 'pathA_q5b_gradyear',
    save: (ans) => ({ seeking: ans }),
  },
  pathA_q5b_gradyear: {
    message: () => `What year do you graduate?`,
    chips: () => ['2025', '2026', '2027', '2028+'],
    freeText: false,
    next: () => 'pathA_q6_location',
    save: (ans) => ({ graduation_year: ans }),
  },
  pathA_q6_location: {
    message: () => `What city or region are you targeting?`,
    chips: () => ['New York', 'Miami', 'Remote', 'Open to anything'],
    freeText: true,
    placeholder: 'Or type a city...',
    next: () => 'pathA_q7_companysize',
    save: (ans) => ({ location_preference: ans }),
  },
  pathA_q7_companysize: {
    message: () => `Any preference on company size?`,
    chips: () => ['Big company (Fortune 500)', 'Mid-size', 'Startup', 'No preference'],
    freeText: false,
    next: () => 'pathA_q8_companies',
    save: (ans) => ({ company_size_preference: [ans] }),
  },
  pathA_q8_companies: {
    message: () => `Any companies you'd love to work at?`,
    chips: () => ["No idea yet"],
    freeText: true,
    placeholder: 'Type company names separated by commas...',
    next: () => 'shared_q9_struggle',
    save: (ans) => ({ target_companies: ans === 'No idea yet' ? [] : ans.split(',').map(c => c.trim()).filter(Boolean) }),
  },

  // PATH B
  pathB_q3_environment: {
    message: () => `No worries — let's figure it out together. What kind of work environment sounds most like you?`,
    chips: () => ['Fast-paced and entrepreneurial', 'Structured and corporate', 'Creative and collaborative', 'Mission-driven and purpose-led'],
    freeText: false,
    next: () => 'pathB_q4_strength',
    save: (ans) => ({ work_environment: ans }),
  },
  pathB_q4_strength: {
    message: () => `What's your natural strength?`,
    chips: () => ['Talking to people / relationships', 'Analyzing data / solving problems', 'Creating things / design / writing', 'Leading / organizing / making things happen'],
    freeText: false,
    next: () => 'pathB_q5_motivation',
    save: (ans) => ({ natural_strength: ans }),
  },
  pathB_q5_motivation: {
    message: () => `What motivates you most?`,
    chips: () => ['Making a lot of money', 'Making an impact', 'Helping others / mission-driven', 'Stability and work-life balance'],
    freeText: false,
    next: () => 'pathB_q6_gradyear',
    save: (ans) => ({ motivation: ans }),
  },
  pathB_q6_gradyear: {
    message: () => `When do you graduate?`,
    chips: () => ['2025', '2026', '2027', '2028+'],
    freeText: false,
    next: () => 'pathB_q7_struggle',
    save: (ans) => ({ graduation_year: ans }),
  },
  pathB_q7_struggle: {
    message: () => `What are you struggling with most right now?`,
    chips: () => ["Don't know where to begin", "Applied but no answers", "Not sure how to network"],
    freeText: false,
    next: () => 'pathB_synthesis',
    save: (ans) => ({ perceived_gap: ans }),
  },

  // SHARED
  shared_q9_struggle: {
    message: () => `Last one — what are you struggling with most right now?`,
    chips: () => ["Don't know where to begin", "Applied but no answers", "Not sure how to network"],
    freeText: false,
    next: () => 'complete',
    save: (ans) => ({ perceived_gap: ans }),
  },
};

// ── Small UI components ────────────────────────────────────────────────────────

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 20 }}>
      {!isUser && (
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0d1117', border: '1px solid rgba(232,93,32,0.4)', color: '#E85D20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, marginRight: 10, marginTop: 2 }}>
          ⚡
        </div>
      )}
      <div style={{
        maxWidth: isUser ? '65%' : '75%',
        background: isUser ? '#0d1117' : '#fff',
        color: isUser ? '#fff' : '#1A1A1A',
        border: isUser ? 'none' : '1px solid #E5E5E5',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        padding: isUser ? '12px 18px' : '14px 18px',
        fontSize: 14, lineHeight: 1.6,
        fontFamily: "'DM Sans', sans-serif",
        boxShadow: isUser ? 'none' : '0 1px 3px rgba(0,0,0,0.08)',
      }}>
        {message.content}
      </div>
    </div>
  );
}

function ChipRow({ chips, onSelect }) {
  if (!chips?.length) return null;
  return (
    <div style={{ marginLeft: 42, marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {chips.map((chip, i) => (
        <button key={i} onClick={() => onSelect(chip)}
          style={{ background: '#fff', border: '1.5px solid #E85D20', color: '#E85D20', borderRadius: 100, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', minHeight: 'auto', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#E85D20'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#E85D20'; }}
        >
          {chip}
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

// ── Main component ─────────────────────────────────────────────────────────────

export default function FreeTierCareerGoalsTab({ user, onTabChange, onOpenUpgrade, onGoalsSaved }) {
  const [mode, setMode] = useState(hasExistingGoals(user) ? 'summary' : 'chat');
  const [currentPhase, setCurrentPhase] = useState('chat');

  // Chat state
  const [messages, setMessages] = useState([]);
  const [currentQ, setCurrentQ] = useState('q1_major');
  const [path, setPath] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [awaitingFreeText, setAwaitingFreeText] = useState(false);
  const [activeChips, setActiveChips] = useState([]);

  // Summary state
  const [showLeads, setShowLeads] = useState(false);
  const [savedLeads, setSavedLeads] = useState(() => user?.saved_leads || []);
  const [activeComposer, setActiveComposer] = useState(null);
  const [showLeadsArrow, setShowLeadsArrow] = useState(false);
  const leadsRef = useRef(null);

  // Synthesis result (Path B)
  const [synthesisRoles, setSynthesisRoles] = useState([]);

  const isFastIQ = !!(user?.fastiq_setup_complete || user?.subscription_status === 'active' || user?.membership_tier === 'fastiq');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Seed first question on chat start
  useEffect(() => {
    if (mode !== 'chat' || messages.length > 0) return;
    const q = QUESTIONS['q1_major'];
    const chips = q.chips(user);
    setMessages([{ role: 'assistant', content: q.message(user) }]);
    setActiveChips(chips);
    setAwaitingFreeText(false);
    setCurrentQ('q1_major');
  }, [mode]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChips, loading]);

  const addMessage = (msg) => {
    setMessages(prev => [...prev, msg]);
  };

  const loadQuestion = (key, user) => {
    const q = QUESTIONS[key];
    if (!q) return;
    const chips = q.chips(user);
    addMessage({ role: 'assistant', content: q.message(user) });
    setActiveChips(chips);
    setAwaitingFreeText(!!q.freeText && chips.length === 0);
    setCurrentQ(key);
  };

  const saveAnswer = async (update) => {
    const newAnswers = { ...answers, ...update };
    setAnswers(newAnswers);
    await base44.auth.updateMe({
      career_goals: {
        ...(user?.career_goals || {}),
        ...newAnswers,
        saved_at: new Date().toISOString(),
      }
    }).catch(() => {});
    return newAnswers;
  };

  const handleAnswer = async (questionKey, answer) => {
    const q = QUESTIONS[questionKey];
    setActiveChips([]);
    setAwaitingFreeText(false);
    setInputValue('');

    // Save answer
    let newAnswers = answers;
    if (q.save) {
      const update = q.save(answer);
      newAnswers = { ...answers, ...update };
      setAnswers(newAnswers);
      await base44.auth.updateMe({
        career_goals: { ...(user?.career_goals || {}), ...newAnswers, saved_at: new Date().toISOString() }
      }).catch(() => {});
    }

    addMessage({ role: 'user', content: answer });

    // Handle branching
    if (answer === "I have a pretty good idea →") setPath('A');
    if (answer === "Still figuring it out") setPath('B');

    const nextKey = q.next(answer);

    if (nextKey === 'complete') {
      setIsComplete(true);
      if (onGoalsSaved) onGoalsSaved();
      addMessage({ role: 'assistant', content: "That's everything. Here's your career profile." });
      return;
    }

    if (nextKey === 'pathB_synthesis') {
      generateSynthesis(newAnswers);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      loadQuestion(nextKey, user);
    }, 600);
  };

  const generateSynthesis = async (currentAnswers) => {
    addMessage({ role: 'assistant', content: "Give me a second — I'm putting together some role ideas based on what you told me..." });
    setLoading(true);
    try {
      const res = await base44.functions.invoke('generateCareerSynthesis', {
        major: user?.major,
        work_environment: currentAnswers.work_environment,
        natural_strength: currentAnswers.natural_strength,
        motivation: currentAnswers.motivation,
        graduation_year: currentAnswers.graduation_year,
        biggest_struggle: currentAnswers.perceived_gap,
      });
      const synthesis = res?.data?.synthesis || res?.synthesis || "Based on what you've shared, I have some great role ideas for you.";
      const roles = res?.data?.suggested_roles || res?.suggested_roles || [];
      if (roles.length > 0) {
        await base44.auth.updateMe({
          career_goals: { ...(user?.career_goals || {}), ...currentAnswers, target_roles: roles, saved_at: new Date().toISOString() }
        }).catch(() => {});
        setSynthesisRoles(roles);
      }
      addMessage({ role: 'assistant', content: synthesis });
      if (roles.length > 0) {
        addMessage({ role: 'assistant', content: `Based on your answers, here are roles that could be a great fit for you: ${roles.join(', ')}.` });
      }
    } catch {
      addMessage({ role: 'assistant', content: "Based on what you've shared, I have some great role ideas for you. Let's get your profile set up and I'll show you exactly who to talk to." });
    }
    setLoading(false);
    setIsComplete(true);
    if (onGoalsSaved) onGoalsSaved();
  };

  const handleFreeTextSubmit = () => {
    const val = inputValue.trim();
    if (!val) return;
    handleAnswer(currentQ, val);
  };

  const handleChipOrText = (chip) => {
    const q = QUESTIONS[currentQ];
    if (q?.freeText && chip === null) {
      handleFreeTextSubmit();
    } else {
      handleAnswer(currentQ, chip);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleFreeTextSubmit(); }
  };

  const startOver = () => {
    setMessages([]);
    setCurrentQ('q1_major');
    setPath(null);
    setAnswers({});
    setIsComplete(false);
    setInputValue('');
    setActiveChips([]);
    setAwaitingFreeText(false);
    setSynthesisRoles([]);
    setCurrentPhase('chat');
    setMode('chat');
    base44.auth.updateMe({ career_goals_conversation: null }).catch(() => {});
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
    const updated = [...savedLeads.filter(l => l.id !== lead.id), { ...lead, saved_at: new Date().toISOString(), contacted: false }];
    setSavedLeads(updated);
    await base44.auth.updateMe({ saved_leads: updated }).catch(() => {});
  };

  const handleUnsaveLead = async (id) => {
    const updated = savedLeads.filter(l => l.id !== String(id));
    setSavedLeads(updated);
    await base44.auth.updateMe({ saved_leads: updated }).catch(() => {});
  };

  // ── Summary view ─────────────────────────────────────────────────────────────
  if (mode === 'summary') {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 4px' }}>CAREER GOALS</p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Your Career Goals.</h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#888', margin: '0 0 28px', lineHeight: 1.5 }}>The more we know about you, the better we can help you.</p>

        <GoalsSummaryCard
          goals={user?.career_goals}
          user={user}
          onTabChange={onTabChange}
          onFindLeads={handleFindLeads}
          onOpenUpgrade={onOpenUpgrade}
          onGoalsUpdated={() => {}}
          showLeadsArrow={showLeadsArrow}
          onRestart={startOver}
        />

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
              onUnlockFastIQ={() => onOpenUpgrade?.()}
              leadsRef={leadsRef}
            />
            <SavedLeads savedLeads={savedLeads} onContact={setActiveComposer} onRemove={handleUnsaveLead} />
          </>
        )}

        {activeComposer && (
          <InlineMessageComposer
            lead={activeComposer}
            user={user}
            isFastIQ={isFastIQ}
            onClose={() => setActiveComposer(null)}
            onMarkContacted={() => setActiveComposer(null)}
            onSaveToNotebook={(msg) => {
              base44.entities.NotebookEntry.create({ user_email: user.email, content: msg, source_page: 'career_goals', source_label: 'Outreach Message', tags: ['outreach'], saved_at: new Date().toISOString() }).catch(() => {});
            }}
          />
        )}
      </div>
    );
  }

  // ── Chat view ─────────────────────────────────────────────────────────────────
  const currentQDef = QUESTIONS[currentQ];
  const showFreeTextInput = !isComplete && currentQDef?.freeText;
  const showChips = !isComplete && !loading && activeChips.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '70vh' }}>
      {/* Header */}
      <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #F0F0F0', flexShrink: 0 }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 4px' }}>CAREER GOALS</p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' }}>
          {isComplete ? 'Your Career Goals.' : "Tell us what you're looking for."}
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: 0 }}>The more we share, the better we can help you.</p>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 24px' }}>
        {messages.map((msg, i) => <MessageBubble key={i} message={msg} />)}

        {loading && <TypingIndicator />}

        {/* Chips */}
        {showChips && <ChipRow chips={activeChips} onSelect={(chip) => handleChipOrText(chip)} />}

        {/* Complete state — phase progression */}
        {isComplete && currentPhase === 'chat' && (
          <div style={{ marginLeft: 42, marginTop: 8 }}>
            <button
              onClick={() => setCurrentPhase('snapshot')}
              style={{ background: '#E85D20', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 15, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", minHeight: 'auto' }}
            >
              Continue →
            </button>
          </div>
        )}

        {/* Snapshot phase */}
        {isComplete && currentPhase === 'snapshot' && (() => {
          const snap = { ...(user?.career_goals || {}), ...answers };
          return (
          <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 0' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 32 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#E85D20', fontSize: 16 }}>⚡</span>
              </div>
              <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 16, borderTopLeftRadius: 4, padding: '16px 20px', maxWidth: 480 }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#1A1A1A', margin: 0, lineHeight: 1.6 }}>Here's what I've got on you so far. Does this look right?</p>
              </div>
            </div>
            <div style={{ background: '#0A0A0A', borderRadius: 16, padding: '28px 32px', marginBottom: 24 }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E85D20', margin: '0 0 20px' }}>YOUR CAREER SNAPSHOT</p>
              {[
                { icon: '🎯', label: 'Target Roles', value: snap.target_roles?.join(', ') || '—' },
                { icon: '🏢', label: 'Industries', value: snap.target_industries?.join(', ') || '—' },
                { icon: '📍', label: 'Location', value: snap.location_preference || '—' },
                { icon: '🎓', label: 'Graduating', value: snap.graduation_year || '—' },
                { icon: '💭', label: 'Biggest struggle', value: snap.perceived_gap || '—' },
                { icon: '🏭', label: 'Target companies', value: snap.target_companies?.join(', ') || 'Not set yet' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', gap: 16, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{row.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{row.label}</p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#fff', margin: 0, lineHeight: 1.5 }}>{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <button onClick={() => setCurrentPhase('resume')} style={{ background: '#E85D20', border: 'none', borderRadius: 10, padding: '14px 28px', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', flex: 1, fontFamily: "'DM Sans', sans-serif", minHeight: 'auto' }}>Looks good →</button>
              <button onClick={() => setCurrentPhase('chat')} style={{ background: 'none', border: '1px solid #E0E0E0', borderRadius: 10, padding: '14px 28px', fontSize: 14, color: '#555', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", minHeight: 'auto' }}>Edit something</button>
            </div>
            <p onClick={startOver} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#AAAAAA', cursor: 'pointer', textAlign: 'center', margin: 0 }}>← Start over</p>
          </div>
          );
        })()}

        {/* Resume phase */}
        {isComplete && currentPhase === 'resume' && (
          <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 0' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 32 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#E85D20', fontSize: 16 }}>⚡</span>
              </div>
              <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 16, borderTopLeftRadius: 4, padding: '16px 20px', maxWidth: 480 }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#1A1A1A', margin: 0, lineHeight: 1.6 }}>Now let's get your resume sorted. Do you have one?</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div onClick={() => navigate('ResumeTailoring')} style={{ background: '#fff', border: '2px solid #E85D20', borderRadius: 14, padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: '#FFF5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📄</div>
                <div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: '#1A1A1A', margin: '0 0 4px' }}>Upload my resume</p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: 0 }}>We'll analyze it and help you tailor it to any job</p>
                </div>
                <span style={{ marginLeft: 'auto', color: '#E85D20', fontSize: 18, flexShrink: 0 }}>→</span>
              </div>
              <div onClick={() => isFastIQ ? navigate('ResumeTailoring') : onOpenUpgrade?.()} style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: 14, padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>✨</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>Help me create one</p>
                    <span style={{ background: '#FFF5F0', color: '#E85D20', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, letterSpacing: '0.05em' }}>FASTIQ</span>
                  </div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: 0 }}>Answer a few questions and we'll build one for you</p>
                </div>
                <span style={{ marginLeft: 'auto', color: '#CCCCCC', fontSize: 18, flexShrink: 0 }}>→</span>
              </div>
            </div>
            <p onClick={() => { setMode('summary'); }} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#AAAAAA', cursor: 'pointer', textAlign: 'center', margin: '24px 0 0' }}>Skip for now — go to my profile →</p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Free text input */}
      {showFreeTextInput && !loading && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid #F0F0F0', flexShrink: 0, background: '#fff', position: 'sticky', bottom: 0 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', background: '#F9F9F9', border: '1px solid #E0E0E0', borderRadius: 16, padding: '8px 12px' }}>
            <input
              ref={inputRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={currentQDef?.placeholder || 'Type your answer...'}
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#1A1A1A' }}
            />
            <button
              onClick={handleFreeTextSubmit}
              disabled={!inputValue.trim()}
              style={{ background: inputValue.trim() ? '#E85D20' : '#E0E0E0', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: inputValue.trim() ? 'pointer' : 'default', flexShrink: 0, minHeight: 'auto', transition: 'background 0.2s' }}
            >
              <Send style={{ width: 16, height: 16, color: '#fff' }} />
            </button>
          </div>
          {activeChips.length > 0 && (
            <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {activeChips.map((chip, i) => (
                <button key={i} onClick={() => handleChipOrText(chip)}
                  style={{ background: '#fff', border: '1.5px solid #E85D20', color: '#E85D20', borderRadius: 100, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', minHeight: 'auto', fontFamily: "'DM Sans', sans-serif" }}>
                  {chip}
                </button>
              ))}
            </div>
          )}
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