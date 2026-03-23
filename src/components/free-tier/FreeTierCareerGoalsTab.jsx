import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, RefreshCw, Loader2, Target } from 'lucide-react';

const SYSTEM_PROMPT = `You are FastIQ, the AI career advisor inside College Fast Forward (CFF). You are conducting a friendly, one-question-at-a-time intake conversation to understand a college student's career goals.

Your job is to:
- Ask each question conversationally and warmly — not like a form
- Acknowledge what the student says before moving to the next question (e.g., "Finance — great, lots of strong CFF connections there.")
- If a student says "I don't know" or is unsure, respond supportively and move on — never push
- Keep your responses short — one acknowledgment sentence + the next question only
- The questions to work through (in order):
  Q1: What kind of role are they hoping to land?
  Q2: What industries are they most drawn to?
  Q3: Internship vs full-time + graduation year?
  Q4: Location preferences?
  Q5: Any prior internships or work experience?
  Q6: Company size preference?
  Q7: Dream company (even if it feels like a stretch)?
  Q8: What do they feel is missing / holding them back?
- After Q8 is answered, give a warm closing message and set is_final to true with a populated goals_summary
- Never repeat a question already answered

Return your response as JSON with these exact fields:
- "message": your conversational reply
- "is_final": boolean (true only after Q8 is answered)
- "suggested_prompts": array of 2-3 short chips the student can tap (e.g., "I'm not sure yet", "Open to anything")
- "goals_summary": null unless is_final is true, then a structured object`;

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    is_final: { type: 'boolean' },
    suggested_prompts: { type: 'array', items: { type: 'string' } },
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
      },
    },
  },
  required: ['message', 'is_final', 'suggested_prompts'],
};

function GoalsSummaryCard({ goals, onTabChange, onRestart }) {
  const roles = goals?.target_roles?.join(', ') || goals?.role || '—';
  const industries = goals?.target_industries?.join(', ') || goals?.industries?.join(', ') || '—';
  const seeking = goals?.seeking || '—';
  const gradYear = goals?.graduation_year || goals?.graduation_year?.toString() || '—';
  const location = goals?.location_preference || (goals?.locations?.[0]) || '—';
  const dreamCo = goals?.dream_company || '—';
  const experience = goals?.experience_level || '—';

  return (
    <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 16, padding: 24, marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Target style={{ width: 20, height: 20, color: '#E85D20' }} />
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Your Career Goals</p>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {[
          ['Target Roles', roles],
          ['Industries', industries],
          ['Looking for', `${seeking}${gradYear !== '—' ? ` · Graduating ${gradYear}` : ''}`],
          ['Location', location],
          ['Dream Company', dreamCo],
          ['Experience', experience],
        ].map(([label, value]) => (
          <div key={label} style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#888', minWidth: 120 }}>{label}:</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#1A1A1A' }}>{value}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
        <button onClick={() => onTabChange?.('company_intel')}
          style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
          Explore My Company List →
        </button>
        <button onClick={() => onTabChange?.('career_path')}
          style={{ background: 'none', border: '1.5px solid #E85D20', color: '#E85D20', borderRadius: 100, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
          Explore Career Paths →
        </button>
        {onRestart && (
          <button onClick={onRestart}
            style={{ background: 'none', border: 'none', color: '#999', fontSize: 13, cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline', padding: '10px 4px' }}>
            Update my goals
          </button>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 14 }}>
      {!isUser && (
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E85D20', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, marginRight: 10, marginTop: 2 }}>
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
          style={{ background: '#FFF5F0', border: '1px solid #E85D20', color: '#E85D20', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', minHeight: 'auto' }}>
          {p}
        </button>
      ))}
    </div>
  );
}

export default function FreeTierCareerGoalsTab({ user, onTabChange }) {
  const hasGoals = !!(user?.career_goals?.target_roles?.length || user?.career_goals?.target_industries?.length || user?.career_goals?.role || user?.career_goals?.industries?.length);

  const [mode, setMode] = useState(hasGoals ? 'summary' : 'chat'); // 'summary' | 'chat'
  const [messages, setMessages] = useState([]);
  const [suggestedPrompts, setSuggestedPrompts] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // null | 'llm' | 'save'
  const [retryText, setRetryText] = useState('');
  const [savedGoals, setSavedGoals] = useState(user?.career_goals || null);
  const [conversationDone, setConversationDone] = useState(false);
  const bottomRef = useRef(null);

  // Seed opening message when chat starts
  useEffect(() => {
    if (mode !== 'chat' || messages.length > 0) return;
    const firstName = user?.full_name?.split(' ')[0] || 'there';
    setMessages([{
      role: 'assistant',
      content: `Hey ${firstName}! I'm going to ask you a few quick questions so I can personalize your entire CFF experience — company lists, career paths, outreach help, all of it. Let's start simple: what kind of role are you hoping to land? Could be a specific title, a general field, or even just "I'm not sure yet" — all good.`,
    }]);
    setSuggestedPrompts(["I'm not sure yet", "A few different things", "Let me think..."]);
  }, [mode, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, suggestedPrompts, loading]);

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;
    setInput('');
    setError(null);
    setSuggestedPrompts([]);

    const newMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const history = newMessages.map(m => `${m.role === 'user' ? 'Student' : 'FastIQ'}: ${m.content}`).join('\n\n');
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `${SYSTEM_PROMPT}\n\nConversation so far:\n${history}\n\nNow respond to the student's latest message. Remember: one acknowledgment + next question only (unless this is the final question).`,
        response_json_schema: RESPONSE_SCHEMA,
      });

      const reply = result?.message || 'I had trouble generating a response. Please try again.';
      const prompts = Array.isArray(result?.suggested_prompts) ? result.suggested_prompts.slice(0, 3) : [];
      const isFinal = result?.is_final === true;
      const goalsSummary = result?.goals_summary || null;

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      setSuggestedPrompts(prompts);

      if (isFinal && goalsSummary) {
        await saveGoals(goalsSummary);
      }
    } catch (e) {
      console.error('Goals chat failed:', e);
      setError('llm');
      setRetryText(trimmed);
      setMessages(prev => prev.slice(0, -1));
      setInput(trimmed);
    }
    setLoading(false);
  };

  const saveGoals = async (goalsSummary) => {
    try {
      const goalsData = {
        ...goalsSummary,
        saved_at: new Date().toISOString(),
      };
      await base44.auth.updateMe({ career_goals: goalsData });
      setSavedGoals(goalsData);
      setConversationDone(true);
    } catch (e) {
      console.error('Goals save failed:', e);
      setError('save');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const startChat = () => {
    setMode('chat');
    setMessages([]);
    setSuggestedPrompts([]);
    setConversationDone(false);
    setError(null);
  };

  // Summary view for returning users
  if (mode === 'summary') {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 4px' }}>CAREER GOALS</p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' }}>Your Goals</h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888', margin: '0 0 24px' }}>
          Tell FastIQ what you're looking for. The more you share, the smarter your entire experience gets.
        </p>
        <GoalsSummaryCard goals={savedGoals || user?.career_goals} onTabChange={onTabChange} onRestart={startChat} />
        <div style={{ textAlign: 'center', padding: '16px 0', borderTop: '1px solid #F0F0F0' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#666', marginBottom: 12 }}>
            Want to update your goals? FastIQ will re-personalize everything.
          </p>
          <button onClick={startChat}
            style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
            Update My Goals →
          </button>
        </div>
      </div>
    );
  }

  // Chat view
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

        {/* Post-conversation summary */}
        {conversationDone && savedGoals && (
          <div style={{ marginBottom: 24 }}>
            <GoalsSummaryCard goals={savedGoals} onTabChange={onTabChange} />
          </div>
        )}

        {messages.map((msg, i) => {
          const isLastAssistant = msg.role === 'assistant' && i === messages.length - 1 && !loading && !conversationDone;
          return (
            <React.Fragment key={i}>
              <MessageBubble message={msg} />
              {isLastAssistant && (
                <SuggestedPrompts prompts={suggestedPrompts} onSelect={sendMessage} />
              )}
            </React.Fragment>
          );
        })}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E85D20', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>⚡</div>
            <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: '4px 18px 18px 18px', padding: '12px 16px', display: 'flex', gap: 6, alignItems: 'center' }}>
              {[0, 150, 300].map(d => (
                <span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: '#E85D20', display: 'inline-block', animation: 'dotBounce 1.2s ease-in-out infinite', animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
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
            <button onClick={() => saveGoals(savedGoals)}
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