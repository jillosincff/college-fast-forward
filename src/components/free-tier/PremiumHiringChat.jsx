import { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const dm = "'DM Sans', system-ui, sans-serif";

const STARTER_PROMPTS = [
  "How do I follow up after an interview without being annoying?",
  "I got a rejection — should I ask for feedback?",
  "How do I negotiate salary for my first job?",
];

export default function PremiumHiringChat({ user, selectedSignal }) {
  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const schoolAbbr = user?.school_abbreviation || user?.school_code?.toUpperCase() || 'alumni';

  const defaultGreeting = `Hi ${firstName}! 📎 I'm CliFF, your CFF Career Agent. Ask me anything — tricky interview follow-ups, salary negotiations, or how to reach out to that alum at your target company. I'm locked in 24/7.`;

  const [messages, setMessages] = useState([{ role: 'agent', text: defaultGreeting }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Reset greeting whenever a coffee-chat signal is selected
  useEffect(() => {
    if (!selectedSignal) return;
    const { company, alumniCount } = selectedSignal;
    const greeting = alumniCount > 0
      ? `Hi ${firstName}! 📎 I see there are ${alumniCount} ${schoolAbbr} grads at ${company}. Want me to draft a warm coffee chat outreach message to one of them? I'll keep it short, personal, and impossible to ignore.`
      : `Hi ${firstName}! 📎 I'm looking at ${company} for you. I don't have direct alumni contacts mapped here yet, but I can still write a highly tailored outreach based on your background. Ready to craft your pitch?`;
    setMessages([{ role: 'agent', text: greeting }]);
    setInput('');
  }, [selectedSignal]);

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
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#000' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22, animation: 'clipBounce 2s ease-in-out infinite' }}>📎</span>
          <style>{`@keyframes clipBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>
          <div>
            <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>Chat with CliFF</p>
            <p style={{ fontFamily: dm, fontSize: 11, color: '#94a3b8', margin: 0 }}>Your CFF Career Agent</p>
          </div>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(6,78,59,0.5)', border: '1px solid #065f46', borderRadius: 6, padding: '4px 10px' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
          <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#34d399', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Online 24/7</span>
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