import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const MAX_FREE_QUESTIONS = 3;

export default function CompanyResearchChat({ company, user, isFastIQ, onClose, onUpgrade }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Researching ${company.name} for a ${(user?.career_goals?.target_roles || user?.target_roles || ['candidate'])[0]} candidate...\n\nAsk me anything about ${company.name} — culture, interview process, what they look for, or how to stand out.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const questionCount = useRef(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    if (!isFastIQ && questionCount.current >= MAX_FREE_QUESTIONS) return;

    setInput('');
    const newMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(newMessages);
    setLoading(true);
    questionCount.current += 1;

    try {
      const role = (user?.career_goals?.target_roles || user?.target_roles || [])[0] || 'entry-level candidate';
      const industry = (user?.career_goals?.target_industries || user?.target_industries || [])[0] || 'their industry';
      const history = newMessages.map(m => `${m.role === 'user' ? 'Student' : 'FastIQ'}: ${m.content}`).join('\n\n');

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FastIQ, an honest career advisor. A student targeting a "${role}" role in "${industry}" is researching ${company.name}.

Company context:
- Hiring signal: ${company.hiring_signal}
- Known for: ${company.known_for}
- What they look for: ${(company.what_they_look_for || []).join('; ')}
- Application timeline: ${company.application_timeline || 'not specified'}

Conversation so far:
${history}

Respond in 2-4 sentences. Be specific, honest, and actionable. No markdown. No bullet points in the prose. Plain conversational text only.`,
      });

      setMessages(prev => [...prev, { role: 'assistant', content: result || 'I had trouble responding. Please try again.' }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
    }
    setLoading(false);
  };

  const atLimit = !isFastIQ && questionCount.current >= MAX_FREE_QUESTIONS;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#fff',
        borderRadius: '16px 16px 0 0',
        width: '100%',
        maxWidth: 640,
        height: '75vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E85D20', margin: 0 }}>⚡ FASTIQ COMPANY RESEARCH</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: '#0d1117', margin: '2px 0 0' }}>{company.name}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 4 }}>
            <X style={{ width: 20, height: 20, color: '#666' }} />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 16 }}>
              <div style={{
                maxWidth: '80%',
                background: msg.role === 'user' ? '#0d1117' : '#f9f9f9',
                color: msg.role === 'user' ? '#fff' : '#1A1A1A',
                border: msg.role === 'user' ? 'none' : '1px solid #e5e5e5',
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                padding: '12px 16px',
                fontSize: 14,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#888', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
              <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> Researching...
            </div>
          )}
          {atLimit && (
            <div style={{ background: '#FFF5F0', border: '1px solid #FDDBC8', borderRadius: 12, padding: '16px 20px', marginTop: 8, textAlign: 'center' }}>
              <Lock style={{ width: 20, height: 20, color: '#E85D20', margin: '0 auto 8px' }} />
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: '0 0 6px' }}>
                Unlock FastIQ for unlimited company research
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#666', margin: '0 0 14px' }}>
                Get unlimited research, interview prep, and AI-drafted alumni outreach for every company on your list.
              </p>
              <button onClick={onUpgrade}
                style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 'auto', fontFamily: "'DM Sans', sans-serif" }}>
                Unlock FastIQ →
              </button>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {!atLimit && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', flexShrink: 0 }}>
            {!isFastIQ && (
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#aaa', textAlign: 'right', margin: '0 0 8px' }}>
                {MAX_FREE_QUESTIONS - questionCount.current} free question{MAX_FREE_QUESTIONS - questionCount.current !== 1 ? 's' : ''} remaining
              </p>
            )}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', background: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: 16, padding: '8px 12px' }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={`Ask anything about ${company.name}...`}
                rows={1}
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', resize: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.5, maxHeight: 100 }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                style={{ background: input.trim() && !loading ? '#E85D20' : '#e0e0e0', border: 'none', borderRadius: 10, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !loading ? 'pointer' : 'default', flexShrink: 0, minHeight: 'auto' }}
              >
                <Send style={{ width: 14, height: 14, color: '#fff' }} />
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}