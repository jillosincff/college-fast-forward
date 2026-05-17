import { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const dm = "'DM Sans', system-ui, sans-serif";

const STARTER_PROMPTS = [
  "How do I follow up after an interview without being annoying?",
  "I got a rejection — should I ask for feedback?",
  "How do I negotiate salary for my first job?",
];

export default function PremiumHiringChat({ user }) {
  const [messages, setMessages] = useState([
    { role: 'agent', text: `Hi ${user?.full_name?.split(' ')[0] || 'there'}! 👋 I'm your Hiring Expert Assistant. Ask me anything — tricky interview emails, salary negotiation, how to approach a recruiter, or anything else on your job search. I'm here 24/7.` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const q = (text || input).trim();
    if (!q) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const res = await base44.functions.invoke('aiCareerAdvisor', { message: q, user_id: user?.id });
      const reply = res?.data?.reply || res?.data?.message || "Great question. In short: be direct, be brief, and always lead with value. Want me to draft a specific email for you?";
      setMessages(prev => [...prev, { role: 'agent', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'agent', text: "Great question. Keep your follow-up concise — one paragraph, lead with what you learned from the interview, and propose a specific next step. Want me to draft it for you?" }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0A0A0A' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>💬</span>
          <div>
            <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>Hiring Experts Chat</p>
            <p style={{ fontFamily: dm, fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0 }}>AI trained by real recruiters</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.8)' }} />
          <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#22c55e' }}>LIVE EXPERT ASSISTANT</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ padding: '14px 16px', maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '82%',
              background: m.role === 'user' ? '#0A0A0A' : '#f9fafb',
              color: m.role === 'user' ? '#fff' : '#111827',
              border: m.role === 'user' ? 'none' : '1px solid #e5e7eb',
              borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              padding: '10px 14px',
            }}>
              <p style={{ fontFamily: dm, fontSize: 12, margin: 0, lineHeight: 1.6 }}>{m.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 6, padding: '10px 14px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '14px 14px 14px 4px', width: 'fit-content' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#9ca3af', animation: `bounce 1.2s ${i * 0.2}s ease-in-out infinite` }} />
            ))}
            <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Starter prompts */}
      {messages.length <= 1 && (
        <div style={{ padding: '0 16px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {STARTER_PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => sendMessage(p)}
              style={{ fontFamily: dm, fontSize: 11, color: '#374151', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', minHeight: 'auto', textAlign: 'left', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={e => e.currentTarget.style.background = '#f9fafb'}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '10px 16px 14px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask anything — interview, salary, outreach..."
          style={{ flex: 1, fontFamily: dm, fontSize: 12, color: '#374151', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '9px 12px', outline: 'none', minHeight: 'auto' }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#fff', background: input.trim() && !loading ? '#0A0A0A' : '#d1d5db', border: 'none', borderRadius: 10, padding: '9px 16px', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', minHeight: 'auto', whiteSpace: 'nowrap', transition: 'background 0.15s' }}
        >
          Send →
        </button>
      </div>
    </div>
  );
}