import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { MessageCircle, X, Send, Sparkles, Lock } from 'lucide-react';

const FONT = "'DM Sans', system-ui, sans-serif";
const INDIGO = '#7c3aed';
const VIOLET = '#6d28d9';
const GRAD = `linear-gradient(135deg, ${INDIGO}, ${VIOLET})`;
const FREE_LIMIT = 10;

export default function CliffChatWidget({ onOpenUpgrade, embedded = false }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dailyCount, setDailyCount] = useState(0);
  const [showLimitToast, setShowLimitToast] = useState(false);
  const messagesEndRef = useRef(null);

  const canSendMessage = dailyCount < FREE_LIMIT;

  useEffect(() => {
    const stored = localStorage.getItem(`cliff_chat_${user?.email}`);
    if (stored) {
      const { messages: savedMessages, date, count } = JSON.parse(stored);
      const today = new Date().toDateString();
      if (date === today) {
        setMessages(savedMessages || []);
        setDailyCount(count || 0);
      } else {
        localStorage.setItem(`cliff_chat_${user?.email}`, JSON.stringify({
          messages: [],
          date: today,
          count: 0,
        }));
        setDailyCount(0);
      }
    }
  }, [user?.email]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const saveState = (newMessages, newCount) => {
    localStorage.setItem(`cliff_chat_${user?.email}`, JSON.stringify({
      messages: newMessages,
      date: new Date().toDateString(),
      count: newCount,
    }));
  };

  const sendMessage = async () => {
    if (!input.trim() || !canSendMessage || loading) return;

    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are CLIFF, a friendly and knowledgeable career coach for college students. Help students with job search advice, resume tips, interview prep, networking strategies, and career guidance. Be encouraging, practical, and specific. Current user context: ${user?.major || 'student'} interested in ${user?.career_goals?.target_roles?.[0] || 'their career'}. Keep responses concise and actionable.`,
        model: 'claude_sonnet_4_6',
      });

      const assistantMessage = { role: 'assistant', content: response };
      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      saveState(updatedMessages, dailyCount + 1);
      setDailyCount(prev => prev + 1);

      if (dailyCount + 1 >= FREE_LIMIT) {
        setShowLimitToast(true);
        setTimeout(() => setShowLimitToast(false), 8000);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = { role: 'assistant', content: "I'm having trouble connecting right now. Please try again in a moment." };
      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "How do I tailor my resume for a specific job?",
    "What should I ask in a coffee chat?",
    "How do I follow up after applying?",
    "Tips for acing behavioral interviews?",
  ];

  if (embedded) {
    return (
      <>
        {/* Floating button */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            style={{
              position: 'fixed',
              bottom: 100,
              right: 24,
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: GRAD,
              border: 'none',
              boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <MessageCircle size={24} color="#fff" />
          </button>
        )}

        {/* Chat window */}
        {isOpen && (
          <div style={{
            position: 'fixed',
            bottom: 170,
            right: 24,
            width: 380,
            height: 520,
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid #e9d5ff',
          }}>
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              background: GRAD,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Sparkles size={18} color="#fff" />
                </div>
                <div>
                  <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>
                    CLIFF AI Coach
                  </p>
                  <p style={{ fontFamily: FONT, fontSize: 11, color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                    {dailyCount}/{FREE_LIMIT} free messages today
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} color="#fff" />
              </button>
            </div>

            {/* Usage meter — always-visible so the limit never feels like a surprise wall */}
            <div style={{ height: 4, background: '#ede9fe', flexShrink: 0 }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, (dailyCount / FREE_LIMIT) * 100)}%`,
                background: dailyCount >= FREE_LIMIT ? '#dc2626' : dailyCount >= FREE_LIMIT - 2 ? '#d97706' : '#a78bfa',
                transition: 'width 0.3s ease',
              }} />
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              background: '#faf5ff',
            }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: GRAD,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}>
                    <Sparkles size={24} color="#fff" />
                  </div>
                  <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: '#1e293b', margin: '0 0 4px' }}>
                    Hi! I'm CLIFF
                  </p>
                  <p style={{ fontFamily: FONT, fontSize: 12, color: '#64748b', margin: '0 0 16px' }}>
                    Your AI career coach. Ask me anything!
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {quickQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(q)}
                        style={{
                          background: '#fff',
                          border: '1px solid #e9d5ff',
                          borderRadius: 10,
                          padding: '10px 14px',
                          fontFamily: FONT,
                          fontSize: 12,
                          color: '#475569',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#f5f3ff';
                          e.currentTarget.style.borderColor = INDIGO;
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = '#fff';
                          e.currentTarget.style.borderColor = '#e9d5ff';
                        }}
                      >
                        {q}
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
                  }}
                >
                  <div style={{
                    maxWidth: '80%',
                    padding: '12px 16px',
                    borderRadius: 16,
                    borderTopLeftRadius: msg.role === 'assistant' ? 4 : 16,
                    borderTopRightRadius: msg.role === 'user' ? 4 : 16,
                    background: msg.role === 'user' ? GRAD : '#fff',
                    color: msg.role === 'user' ? '#fff' : '#1e293b',
                    fontFamily: FONT,
                    fontSize: 13,
                    lineHeight: 1.5,
                    border: msg.role === 'assistant' ? '1px solid #e9d5ff' : 'none',
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: GRAD,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Sparkles size={16} color="#fff" />
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

            {/* Input */}
            <div style={{
              padding: '16px',
              background: '#fff',
              borderTop: '1px solid #e9d5ff',
              display: 'flex',
              gap: 10,
              flexShrink: 0,
            }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={canSendMessage ? "Ask CLIFF anything..." : "Daily limit reached — upgrade for unlimited"}
                rows={1}
                disabled={!canSendMessage || loading}
                style={{
                  flex: 1,
                  fontFamily: FONT,
                  fontSize: 13,
                  padding: '12px 14px',
                  border: '1px solid #e9d5ff',
                  borderRadius: 10,
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
                  borderRadius: 10,
                  width: 44,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: !input.trim() || loading || !canSendMessage ? 'not-allowed' : 'pointer',
                  flexShrink: 0,
                }}
              >
                <Send size={18} color={!input.trim() || loading || !canSendMessage ? '#c4b5fd' : '#fff'} />
              </button>
            </div>

            {/* Limit toast */}
            {showLimitToast && (
              <div style={{
                position: 'absolute',
                top: 80,
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#fff',
                border: '1px solid #e9d5ff',
                borderRadius: 12,
                padding: '16px 20px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                zIndex: 1001,
                width: '90%',
                maxWidth: 340,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: '#fef3c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Lock size={18} color='#d97706' />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: '#1e293b', margin: '0 0 2px' }}>
                      Daily limit reached
                    </p>
                    <p style={{ fontFamily: FONT, fontSize: 12, color: '#64748b', margin: 0 }}>
                      You've used all {FREE_LIMIT} free messages today.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenUpgrade?.();
                  }}
                  style={{
                    background: GRAD,
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 16px',
                    fontFamily: FONT,
                    fontSize: 13,
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
          </div>
        )}

        <style>{`@keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }`}</style>
      </>
    );
  }

  // Full page mode (Tools section)
  return null;
}