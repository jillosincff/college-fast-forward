import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, RefreshCw, Loader2 } from 'lucide-react';

const SYSTEM_PROMPT = `You are FastIQ, the AI career intelligence engine inside College Fast Forward (CFF) — a platform that connects college students with parent and alumni professional networks.

Your role on this page is to help students explore career paths in a personalized, conversational way. You know the student's target industries and roles from their Career Goals. Use that context to make every response feel tailored — not generic.

Guidelines:
- Be conversational, specific, and encouraging — not textbook-dry
- When discussing career paths, cover: typical entry points, skills required, realistic timelines, day-to-day reality, and common pivots
- Reference real companies and roles where helpful
- If the student's goals are vague, help them narrow down through questions
- Keep responses focused — 3–5 short paragraphs max, use bullet points for lists
- After every response, suggest 3 natural follow-up questions the student might want to ask next (return these as a JSON array in the field "suggested_prompts")
- Never say "As an AI" or break character
- You are NOT a job board. You help students understand paths, build strategy, and think clearly about their future.`;

function buildOpeningMessage(goals) {
  const role = goals?.role || (goals?.target_roles?.[0]) || null;
  const industry = goals?.industries?.[0] || goals?.target_industries?.[0] || null;

  if (role && industry) {
    return `You mentioned you're interested in ${role} roles in ${industry}. Want to explore what a typical career path looks like, what skills you'll need, or what your first 1–3 years might involve?`;
  }
  if (industry) {
    return `You've been exploring opportunities in ${industry}. Want to map out what career paths are most common there, or dig into a specific role?`;
  }
  return `I don't see any career goals set yet — but that's okay. Just tell me what you're interested in and we'll explore together. Or head to Career Goals to set your target industries and roles so I can give you a fully personalized path breakdown.`;
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 16 }}>
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

export default function FreeTierCareerPathTab({ user, onTabChange }) {
  const [messages, setMessages] = useState([]);
  const [suggestedPrompts, setSuggestedPrompts] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Seed opening message on load
  useEffect(() => {
    if (initialized) return;
    setInitialized(true);
    const goals = user?.career_goals || {};
    const opening = buildOpeningMessage(goals);
    setMessages([{ role: 'assistant', content: opening }]);
    setSuggestedPrompts([
      'What does a typical first year look like in this field?',
      'What skills do I need that I probably don\'t have yet?',
      'How competitive is this path for college students?',
    ]);
  }, [user, initialized]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, suggestedPrompts, loading]);

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;
    setInput('');
    setError(false);
    setSuggestedPrompts([]);

    const goals = user?.career_goals || {};
    const role = goals?.role || '';
    const industry = goals?.industries?.[0] || '';

    const newMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const contextPrefix = (role || industry)
        ? `[Student context — target role: "${role || 'not set'}", target industry: "${industry || 'not set'}", school: "${user?.school || user?.university || 'University of Florida'}"]`
        : '';

      const llmMessages = newMessages.map((m, i) => {
        if (i === 0 && m.role === 'assistant') {
          return { role: 'assistant', content: m.content };
        }
        return m;
      });

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `${contextPrefix}\n\nConversation so far:\n${llmMessages.map(m => `${m.role === 'user' ? 'Student' : 'FastIQ'}: ${m.content}`).join('\n\n')}\n\nStudent's latest message: ${trimmed}\n\n${SYSTEM_PROMPT}\n\nRespond with a JSON object containing "response_text" (your reply) and "suggested_prompts" (array of 3 follow-up questions).`,
        response_json_schema: {
          type: 'object',
          properties: {
            response_text: { type: 'string' },
            suggested_prompts: { type: 'array', items: { type: 'string' } },
          },
          required: ['response_text', 'suggested_prompts'],
        },
      });

      const reply = result?.response_text || 'I had trouble generating a response. Please try again.';
      const prompts = Array.isArray(result?.suggested_prompts) ? result.suggested_prompts.slice(0, 3) : [];

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      setSuggestedPrompts(prompts);
    } catch (e) {
      console.error('Career path chat failed:', e);
      setError(true);
      setMessages(prev => prev.slice(0, -1)); // remove the user message so they can retry
      setInput(trimmed);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '70vh' }}>
      {/* Header */}
      <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #F0F0F0', flexShrink: 0 }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 4px' }}>
          CAREER PATH RESEARCH
        </p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' }}>
          Explore where your goals can take you.
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: 0 }}>
          Ask FastIQ anything about career paths, skills, timelines, or what to do next.
        </p>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 8px' }}>
        {messages.map((msg, i) => {
          const isLastAssistant = msg.role === 'assistant' && i === messages.length - 1 && !loading;
          return (
            <React.Fragment key={i}>
              <MessageBubble message={msg} />
              {isLastAssistant && (
                <SuggestedPrompts prompts={suggestedPrompts} onSelect={(p) => sendMessage(p)} />
              )}
            </React.Fragment>
          );
        })}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E85D20', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>⚡</div>
            <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: '4px 18px 18px 18px', padding: '12px 16px', display: 'flex', gap: 6, alignItems: 'center' }}>
              {[0, 150, 300].map(d => (
                <span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: '#E85D20', display: 'inline-block', animation: 'bounce 1.2s ease-in-out infinite', animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: '#FFF5F0', border: '1px solid #E85D20', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 13, color: '#E85D20', margin: 0 }}>FastIQ is having trouble connecting. Try again in a moment.</p>
            <button onClick={() => { setError(false); sendMessage(input); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E85D20', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
              <RefreshCw style={{ width: 14, height: 14 }} /> Retry
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #F0F0F0', flexShrink: 0, background: '#fff' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', background: '#F9F9F9', border: '1px solid #E0E0E0', borderRadius: 16, padding: '8px 12px' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about career paths, skills, timelines, or what to do next..."
            rows={1}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', resize: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#1A1A1A', lineHeight: 1.5, maxHeight: 120, overflowY: 'auto' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{ background: input.trim() && !loading ? '#E85D20' : '#E0E0E0', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !loading ? 'pointer' : 'default', flexShrink: 0, minHeight: 'auto', transition: 'background 0.2s' }}
          >
            {loading ? <Loader2 style={{ width: 16, height: 16, color: '#fff', animation: 'spin 1s linear infinite' }} /> : <Send style={{ width: 16, height: 16, color: '#fff' }} />}
          </button>
        </div>
        <p style={{ fontSize: 11, color: '#BBB', textAlign: 'center', margin: '8px 0 0', fontFamily: "'DM Sans', sans-serif" }}>
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}