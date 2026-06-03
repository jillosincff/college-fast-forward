import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';

const dmSans = "'DM Sans', system-ui, sans-serif";

const SUGGESTIONS = [
  "Any UF parents in marketing?",
  "Help me prioritize which company to target first",
  "Find me UF alumni at Nike",
  "Help me tailor my resume",
];

export default function AskFastIQChat({ onOpenChat }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Subscribe to agent conversation updates for streaming
  useEffect(() => {
    if (!conversation?.id) return;
    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      const agentMessages = (data.messages || []).map(m => ({
        role: m.role,
        content: m.content || '',
      }));
      setMessages(agentMessages);
      // Check if agent is done responding
      const lastMsg = data.messages?.[data.messages.length - 1];
      if (lastMsg?.role === 'assistant') {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [conversation?.id]);

  const ask = async (q) => {
    const question = q || query;
    if (!question.trim() || loading) return;
    setQuery('');
    setLoading(true);

    // Optimistically add user message
    setMessages(prev => [...prev, { role: 'user', content: question }]);

    try {
      let conv = conversation;
      if (!conv) {
        conv = await base44.agents.createConversation({
          agent_name: 'fast_track_scout',
          metadata: { name: 'CLIFF Career Agent' },
        });
        setConversation(conv);
      }

      await base44.agents.addMessage(conv, {
        role: 'user',
        content: question,
      });
      // Response will come via the subscription above
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't process that right now. Please try again." }]);
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#1A1A1A', border: '1px solid #2A2A2A',
      borderRadius: 12, padding: '20px 24px', marginBottom: 24,
    }}>
      {/* Top row: icon + label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <span style={{ fontSize: 20 }}>🎯</span>
        <div>
          <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#fff', margin: 0 }}>CLIFF Career Agent</p>
          <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', margin: 0 }}>
            Your personal career scout. Ask about companies, connections, or next steps.
          </p>
        </div>
      </div>

      {/* Suggestion chips */}
      {messages.length === 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {SUGGESTIONS.map((s, i) => (
            <button key={i} onClick={() => ask(s)} style={{
              fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#888',
              background: 'rgba(255,255,255,0.04)', border: '1px solid #2A2A2A', borderRadius: 8,
              padding: '6px 12px', cursor: 'pointer', transition: 'all 0.2s',
              minHeight: 'auto', width: 'auto', textAlign: 'left',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = '#E85D20'; e.currentTarget.style.borderColor = 'rgba(232,93,32,0.3)'; e.currentTarget.style.background = 'rgba(232,93,32,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            >{s}</button>
          ))}
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div style={{ maxHeight: 350, overflowY: 'auto', marginBottom: 14 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
              <div style={{
                maxWidth: '85%', borderRadius: 14, padding: '10px 14px',
                background: m.role === 'user' ? '#2A2A2A' : '#1E1E1E',
                color: '#fff',
                border: m.role === 'user' ? 'none' : '1px solid #2A2A2A',
                fontFamily: dmSans, fontSize: 14, lineHeight: 1.6,
              }}>
                {m.role === 'user' ? m.content : (
                  <ReactMarkdown className="text-sm prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{m.content}</ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 10 }}>
              <div style={{ background: '#1E1E1E', border: '1px solid #2A2A2A', borderRadius: 14, padding: '10px 14px' }}>
                <div style={{ width: 20, height: 20, border: '2px solid #E85D20', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && ask()}
          placeholder="Ask CLIFF anything..."
          disabled={loading}
          style={{
            flex: 1, padding: '11px 18px', border: '1px solid #2A2A2A',
            borderRadius: 100, fontFamily: dmSans, fontSize: 14, fontWeight: 300,
            color: '#fff', outline: 'none', background: '#0A0A0A',
          }}
          onFocus={e => e.currentTarget.style.borderColor = '#E85D20'}
          onBlur={e => e.currentTarget.style.borderColor = '#2A2A2A'}
        />
        <button onClick={() => ask()} disabled={!query.trim() || loading} style={{
          width: 36, height: 36, borderRadius: '50%', background: '#E85D20',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: (!query.trim() || loading) ? 0.5 : 1, transition: 'all 0.2s',
          minHeight: 'auto', minWidth: 'auto', flexShrink: 0,
        }}
          onMouseEnter={e => { if (query.trim() && !loading) e.currentTarget.style.background = '#d44e14'; }}
          onMouseLeave={e => e.currentTarget.style.background = '#E85D20'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  );
}