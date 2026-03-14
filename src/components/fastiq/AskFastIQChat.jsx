import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';

const dmSans = "'DM Sans', system-ui, sans-serif";

const SUGGESTIONS = [
  "What do I need to know before interviewing at Google?",
  "What are entry-level salaries like in investment banking?",
  "Which companies recruit heavily from UF?",
  "What skills do product managers actually need?",
];

export default function AskFastIQChat() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const ask = async (q) => {
    const question = q || query;
    if (!question.trim() || loading) return;
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setQuery('');
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FASTIQ, an AI career intelligence tool for University of Florida students. You help with company research, salary data, interview prep, and career strategy. Answer concisely (2-3 paragraphs max). Use markdown. Question: ${question}`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
      });
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't process that right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'rgba(232,93,32,0.06)', border: '0.5px solid rgba(232,93,32,0.15)',
      borderRadius: 16, padding: '20px 24px', marginBottom: 24,
    }}>
      <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#1a1a1a', margin: '0 0 4px' }}>Ask FASTIQ™</p>
      <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', margin: '0 0 14px' }}>
        Ask anything about companies, careers, salaries, or interview prep.
      </p>

      {messages.length === 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {SUGGESTIONS.map((s, i) => (
            <button key={i} onClick={() => ask(s)} style={{
              fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: '#888',
              background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 100,
              padding: '6px 14px', cursor: 'pointer', transition: 'all 0.2s',
              minHeight: 'auto', width: 'auto', textAlign: 'left',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = '#E85D20'; e.currentTarget.style.borderColor = 'rgba(232,93,32,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; }}
            >{s}</button>
          ))}
        </div>
      )}

      {messages.length > 0 && (
        <div style={{ maxHeight: 350, overflowY: 'auto', marginBottom: 14 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
              <div style={{
                maxWidth: '85%', borderRadius: 14, padding: '10px 14px',
                background: m.role === 'user' ? '#0d1117' : '#fff',
                color: m.role === 'user' ? '#fff' : '#1a1a1a',
                border: m.role === 'user' ? 'none' : '0.5px solid rgba(0,0,0,0.08)',
                fontFamily: dmSans, fontSize: 14, lineHeight: 1.6,
              }}>
                {m.role === 'user' ? m.content : (
                  <ReactMarkdown className="text-sm prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{m.content}</ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 10 }}>
              <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: '10px 14px' }}>
                <div style={{ width: 20, height: 20, border: '2px solid #E85D20', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && ask()}
          placeholder="Ask FASTIQ anything..."
          disabled={loading}
          style={{
            flex: 1, padding: '10px 16px', border: '0.5px solid rgba(0,0,0,0.1)',
            borderRadius: 100, fontFamily: dmSans, fontSize: 14, outline: 'none',
          }}
        />
        <button onClick={() => ask()} disabled={!query.trim() || loading} style={{
          width: 40, height: 40, borderRadius: '50%', background: '#E85D20',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: (!query.trim() || loading) ? 0.5 : 1, transition: 'opacity 0.2s',
          minHeight: 'auto', minWidth: 'auto',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  );
}