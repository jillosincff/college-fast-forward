import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { ArrowLeft, Send, Sparkles, Lock } from 'lucide-react';
import { checkIsFastIQ } from '@/utils/isFastIQ';

const FONT = "'DM Sans', system-ui, sans-serif";
const INDIGO = '#7c3aed';
const VIOLET = '#6d28d9';
const GRAD = 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)';

const FREE_LIMIT = 8;

export default function CliffChatPage({ onOpenUpgrade }) {
  const { user } = useAuth();
  const isPremium = checkIsFastIQ(user);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dailyCount, setDailyCount] = useState(0);
  const [showLimitToast, setShowLimitToast] = useState(false);
  const messagesEndRef = useRef(null);

  // Contextual mode: opened from a specific application ("Ask CLIFF" on a tracker card)
  const [appCtx] = useState(() => {
    try {
      const p = new URLSearchParams(window.location.hash.split('?')[1] || '');
      if (p.get('context') === 'application' && p.get('company')) {
        return { company: p.get('company'), role: p.get('role') || '', stage: p.get('stage') || '' };
      }
    } catch {}
    return null;
  });

  useEffect(() => {
    if (!user?.email) return;
    const storageKey = `cliff_chat_count_${user.email}`;
    const today = new Date().toDateString();
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      const { date, count } = JSON.parse(stored);
      if (date === today) {
        setDailyCount(count || 0);
      } else {
        localStorage.setItem(storageKey, JSON.stringify({ date: today, count: 0 }));
        setDailyCount(0);
      }
    } else {
      localStorage.setItem(storageKey, JSON.stringify({ date: today, count: 0 }));
    }
  }, [user?.email]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const incrementCount = () => {
    if (!user?.email) return;
    const storageKey = `cliff_chat_count_${user.email}`;
    const today = new Date().toDateString();
    const stored = localStorage.getItem(storageKey);
    const newCount = (stored ? JSON.parse(stored).count : 0) + 1;
    localStorage.setItem(storageKey, JSON.stringify({ date: today, count: newCount }));
    setDailyCount(newCount);
  };

  const canSendMessage = isPremium || dailyCount < FREE_LIMIT;

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    if (!canSendMessage) {
      setShowLimitToast(true);
      setTimeout(() => setShowLimitToast(false), 4000);
      return;
    }

    const userMessage = input.trim();
    // First message of a contextual chat carries the application context so
    // CLIFF never starts generic — it already knows the company, role, and stage.
    const outbound = appCtx && messages.length === 0
      ? `[Context: we're discussing my application to ${appCtx.company}${appCtx.role ? ` for the ${appCtx.role} role` : ''}${appCtx.stage ? `, currently at stage: ${appCtx.stage}` : ''}. Answer with this specific application in mind.]\n\n${userMessage}`
      : userMessage;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    incrementCount();

    try {
      const res = await base44.functions.invoke('cliffCareerAgent', {
        message: outbound,
        history: messages.slice(-6),
      });

      const aiMessage = res?.data?.response || res?.data?.message || "I'm here to help with your job search! What would you like to know?";
      setMessages(prev => [...prev, { role: 'assistant', content: aiMessage }]);
    } catch (e) {
      console.error('Chat failed:', e);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having trouble connecting right now. Please try again in a moment." 
      }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#faf5ff', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e9d5ff',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexShrink: 0,
      }}>
        <button
          onClick={() => navigate('FreeTierDashboard')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: FONT,
            fontSize: 13,
            color: '#64748b',
            padding: 0,
            minHeight: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          ← Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: GRAD,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <div>
            <p style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>CLIFF Career Agent</p>
            <p style={{ fontFamily: FONT, fontSize: 13, color: '#64748b', margin: 0 }}>
              {isPremium ? '✓ Premium — Unlimited access' : `Free tier — ${FREE_LIMIT - dailyCount} messages left today`}
            </p>
          </div>
        </div>
      </div>

      {/* Application context banner */}
      {appCtx && (
        <div style={{ background: '#f5f3ff', borderBottom: '1px solid #e9d5ff', padding: '10px 24px' }}>
          <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: '#6d28d9', margin: 0, maxWidth: 800, marginLeft: 'auto', marginRight: 'auto' }}>
            💬 Talking about your {appCtx.company} application{appCtx.role ? ` — ${appCtx.role}` : ''}{appCtx.stage ? ` (${appCtx.stage})` : ''}
          </p>
        </div>
      )}

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.length === 0 && (
          <div style={{
            maxWidth: 640,
            margin: '40px auto',
            textAlign: 'center',
            padding: '40px 24px',
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #e9d5ff',
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎯</div>
            <h1 style={{ fontFamily: FONT, fontSize: 24, fontWeight: 700, color: '#1e293b', margin: '0 0 8px' }}>
              Hi {user?.full_name?.split(' ')[0] || 'there'}! I'm CLIFF
            </h1>
            <p style={{ fontFamily: FONT, fontSize: 15, color: '#64748b', margin: '0 0 24px', lineHeight: 1.6 }}>
              Your AI hiring companion. Ask me anything about resumes, interviews, job search strategy, or career planning.
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 12,
              textAlign: 'left',
            }}>
              {(appCtx ? [
                { icon: '📊', q: `What are my chances at ${appCtx.company}, and how do I improve them?` },
                { icon: '📨', q: `Help me write a follow-up message to ${appCtx.company}` },
                { icon: '🎤', q: `What interview questions should I expect for ${appCtx.role || 'this role'} at ${appCtx.company}?` },
                { icon: '🧭', q: `What should my next move be for this application?` },
              ] : [
                { icon: '📄', q: 'How do I tailor my resume for a specific job description?' },
                { icon: '🎤', q: 'What are common behavioral interview questions and how should I answer them?' },
                { icon: '🤝', q: 'Help me write a networking message to reach out to alumni' },
                { icon: '🎯', q: 'What companies should I target based on my major and interests?' },
              ]).map(s => (
                <button
                  key={s.q}
                  onClick={() => setInput(s.q)}
                  style={{
                    background: '#faf5ff',
                    border: '1px solid #e9d5ff',
                    borderRadius: 12,
                    padding: '16px',
                    fontFamily: FONT,
                    fontSize: 13,
                    color: '#475569',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#f5f3ff';
                    e.currentTarget.style.borderColor = INDIGO;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#faf5ff';
                    e.currentTarget.style.borderColor = '#e9d5ff';
                  }}
                >
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                  <span>{s.q}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: 800,
              margin: '0 auto',
              width: '100%',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              maxWidth: '85%',
            }}>
              {msg.role === 'assistant' && (
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: GRAD,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Sparkles size={18} color="#fff" />
                </div>
              )}
              <div style={{
                padding: '14px 18px',
                borderRadius: 16,
                borderTopLeftRadius: msg.role === 'assistant' ? 4 : 16,
                borderTopRightRadius: msg.role === 'user' ? 4 : 16,
                background: msg.role === 'user' ? GRAD : '#fff',
                color: msg.role === 'user' ? '#fff' : '#1e293b',
                fontFamily: FONT,
                fontSize: 14,
                lineHeight: 1.6,
                border: msg.role === 'assistant' ? '1px solid #e9d5ff' : 'none',
              }}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            maxWidth: 800,
            margin: '0 auto',
            width: '100%',
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: GRAD,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Sparkles size={18} color="#fff" />
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: INDIGO,
                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div style={{
        background: '#fff',
        borderTop: '1px solid #e9d5ff',
        padding: '20px 24px',
        display: 'flex',
        gap: 12,
        flexShrink: 0,
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={canSendMessage ? "Ask CLIFF anything about your job search..." : "Daily limit reached — upgrade for unlimited access"}
          rows={1}
          disabled={!canSendMessage || loading}
          style={{
            flex: 1,
            fontFamily: FONT,
            fontSize: 14,
            padding: '14px 18px',
            border: '1px solid #e9d5ff',
            borderRadius: 12,
            background: canSendMessage ? '#fff' : '#f5f5f5',
            color: canSendMessage ? '#1e293b' : '#94a3b8',
            resize: 'none',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading || !canSendMessage}
          style={{
            background: !input.trim() || loading || !canSendMessage ? '#e9d5ff' : GRAD,
            border: 'none',
            borderRadius: 12,
            padding: '0 24px',
            fontFamily: FONT,
            fontSize: 14,
            fontWeight: 600,
            color: !input.trim() || loading || !canSendMessage ? '#c4b5fd' : '#fff',
            cursor: !input.trim() || loading || !canSendMessage ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexShrink: 0,
          }}
        >
          <Send size={18} />
          Send
        </button>
      </div>

      {/* Limit toast */}
      {showLimitToast && (
        <div style={{
          position: 'fixed',
          top: 100,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#fff',
          border: '1px solid #e9d5ff',
          borderRadius: 16,
          padding: '20px 24px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          zIndex: 1000,
          width: '90%',
          maxWidth: 400,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Lock size={20} color='#d97706' />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>
                Daily limit reached
              </p>
              <p style={{ fontFamily: FONT, fontSize: 13, color: '#64748b', margin: 0 }}>
                You've used all {FREE_LIMIT} free messages today. Upgrade for unlimited CLIFF access.
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenUpgrade?.()}
            style={{
              background: GRAD,
              border: 'none',
              borderRadius: 10,
              padding: '12px 20px',
              fontFamily: FONT,
              fontSize: 14,
              fontWeight: 600,
              color: '#fff',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Upgrade for Unlimited Access →
          </button>
        </div>
      )}

      <style>{`@keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }`}</style>
    </div>
  );
}