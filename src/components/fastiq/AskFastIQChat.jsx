import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import { cliffCareerAgent } from '@/functions/cliffCareerAgent';
import { findContactEmail } from '@/functions/findContactEmail';

const dmSans = "'DM Sans', system-ui, sans-serif";

const SUGGESTIONS = [
  "Any UF parents in marketing?",
  "Help me prioritize which company to target first",
  "Find me UF alumni at Nike",
  "Help me tailor my resume",
];

// Derives a best-guess company domain from a company name
function guessDomain(company) {
  if (!company) return null;
  const cleaned = company.toLowerCase()
    .replace(/\b(inc|llc|ltd|corp|co|group|partners|associates|international|services|solutions|consulting)\b\.?/gi, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)[0]; // use first word as the domain slug
  return `${cleaned}.com`;
}

// Individual contact card with its own email-lookup state
function ContactCard({ c, idx }) {
  const [emailState, setEmailState] = useState('idle'); // idle | loading | found | not_found
  const [foundEmail, setFoundEmail] = useState(null);

  const handleEmailDirect = async () => {
    if (emailState === 'found' && foundEmail) {
      window.location.href = `mailto:${foundEmail}`;
      return;
    }
    setEmailState('loading');
    const domain = guessDomain(c.company);
    if (!domain) { setEmailState('not_found'); return; }
    try {
      const result = await findContactEmail({ contactName: c.name, companyDomain: domain });
      if (result?.success && result.email) {
        setFoundEmail(result.email);
        setEmailState('found');
      } else {
        setEmailState('not_found');
      }
    } catch {
      setEmailState('not_found');
    }
  };

  return (
    <div style={{
      background: '#1E1E1E', border: '1px solid #2A2A2A', borderRadius: 12,
      padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'DM Sans', system-ui", fontWeight: 600, fontSize: 14, color: '#fff' }}>{c.name}</span>
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: c.isParent ? 'rgba(232,93,32,0.12)' : 'rgba(79,140,255,0.12)', color: c.isParent ? '#E85D20' : '#4F8CFF', fontWeight: 500 }}>
            {c.isParent ? '💼 Parent' : '🎓 Alum'}
          </span>
        </div>
        <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: 13, color: '#888', margin: '2px 0 0', lineHeight: 1.4 }}>
          {c.title}{c.company ? ` · ${c.company}` : ''}
        </p>
        {emailState === 'found' && foundEmail && (
          <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: 12, color: '#4ade80', margin: '4px 0 0' }}>
            📧 {foundEmail}
          </p>
        )}
        {emailState === 'not_found' && (
          <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: 12, color: '#888', margin: '4px 0 0' }}>
            No email found — try LinkedIn
          </p>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        {c.linkedin && (
          <a href={c.linkedin} target="_blank" rel="noopener noreferrer" style={{
            fontSize: 11, padding: '5px 10px', borderRadius: 8,
            background: 'rgba(79,140,255,0.1)', color: '#4F8CFF',
            border: '1px solid rgba(79,140,255,0.2)', textDecoration: 'none',
            fontFamily: "'DM Sans', system-ui", fontWeight: 500, whiteSpace: 'nowrap',
            minHeight: 'auto', minWidth: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>🔗 LinkedIn</a>
        )}
        <button
          onClick={handleEmailDirect}
          disabled={emailState === 'loading'}
          style={{
            fontSize: 11, padding: '5px 10px', borderRadius: 8,
            background: emailState === 'found' ? 'rgba(74,222,128,0.1)' : 'rgba(232,93,32,0.1)',
            color: emailState === 'found' ? '#4ade80' : '#E85D20',
            border: `1px solid ${emailState === 'found' ? 'rgba(74,222,128,0.25)' : 'rgba(232,93,32,0.25)'}`,
            cursor: emailState === 'loading' ? 'wait' : 'pointer',
            fontFamily: "'DM Sans', system-ui", fontWeight: 600, whiteSpace: 'nowrap',
            minHeight: 'auto', minWidth: 'auto', opacity: emailState === 'loading' ? 0.6 : 1,
          }}
        >
          {emailState === 'loading' ? '⏳ Finding...' : emailState === 'found' ? '📨 Open Email' : '✉️ Email Direct'}
        </button>
      </div>
    </div>
  );
}

// Parses markdown contact list from CLiFF and renders interactive rich cards
function NetworkResultCards({ content, onEmailDirect }) {
  // Split off the intro line and trailing CTA
  const lines = content.split('\n').filter(l => l.trim());
  const introLine = lines.find(l => /^found\b/i.test(l.trim().replace(/\*+/g, '')));
  const ctaLine = lines.find(l => /want me to draft/i.test(l));

  // Extract numbered contact rows: "1. **Name** — Title at Company [Label]"
  const contactLines = lines.filter(l => /^\d+\.\s+\*\*/.test(l.trim()));

  const contacts = contactLines.map(line => {
    const nameMatch = line.match(/\*\*([^*]+)\*\*/);
    const name = nameMatch ? nameMatch[1].trim() : 'Unknown';

    // Remove markdown bold/links to get plain text
    const plain = line.replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/🔗/g, '').trim();

    // Extract title and company: "Name — Title at Company [Label]"
    const afterName = plain.replace(/^\d+\.\s+/, '').replace(name, '').replace(/^[\s—-]+/, '');
    const labelMatch = afterName.match(/\[(.*?)\]/);
    const label = labelMatch ? labelMatch[1] : '';
    const withoutLabel = afterName.replace(/\[.*?\]/, '').trim();

    const atIdx = withoutLabel.indexOf(' at ');
    const title = atIdx !== -1 ? withoutLabel.slice(0, atIdx).replace(/^[\s—-]+/, '').trim() : withoutLabel.replace(/^[\s—-]+/, '').trim();
    const company = atIdx !== -1 ? withoutLabel.slice(atIdx + 4).replace(/^[\s,—-]+/, '').trim() : '';

    // LinkedIn URL
    const linkedinMatch = line.match(/\(https?:\/\/(?:www\.)?linkedin\.com[^\)]+\)/);
    const linkedin = linkedinMatch ? linkedinMatch[0].slice(1, -1) : null;

    const isParent = label.toLowerCase().includes('parent');

    return { name, title, company, linkedin, label, isParent };
  });

  if (contacts.length === 0) {
    // Fallback to plain markdown if parsing fails
    return (
      <div style={{ maxWidth: '90%', borderRadius: 14, padding: '10px 14px', background: '#1E1E1E', border: '1px solid #2A2A2A', color: '#fff', fontFamily: "'DM Sans', system-ui", fontSize: 14, lineHeight: 1.6 }}>
        <ReactMarkdown className="text-sm prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{content}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '92%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Intro line */}
      {introLine && (
        <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: 13, color: '#aaa', margin: 0, paddingLeft: 4 }}>
          {introLine.replace(/\*\*/g, '')}
        </p>
      )}

      {/* Contact cards */}
      {contacts.map((c, idx) => (
        <ContactCard key={idx} c={c} idx={idx} />
      ))}

      {/* CTA */}
      {ctaLine && (
        <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: 12, color: '#666', margin: 0, paddingLeft: 4 }}>
          {ctaLine}
        </p>
      )}
    </div>
  );
}

export default function AskFastIQChat({ onOpenChat }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // No subscription needed - direct function call

  const ask = async (q) => {
    const question = q || query;
    if (!question.trim() || loading) return;
    setQuery('');
    setLoading(true);

    // Optimistically add user message
    setMessages(prev => [...prev, { role: 'user', content: question }]);

    try {
      console.log('[AskFastIQChat] Calling CLIFF function with:', question);
      const result = await cliffCareerAgent({ message: question });
      console.log('[AskFastIQChat] CLIFF response:', result);
      
      if (result.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: result.response, message_type: result.message_type || 'text' }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${result.error || 'Unknown error'}. Please try again.`, message_type: 'text' }]);
      }
    } catch (error) {
      console.error('[AskFastIQChat] CLIFF error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message || 'Unknown error'}. Please try again.` }]);
    } finally {
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
        <div style={{ maxHeight: 420, overflowY: 'auto', marginBottom: 14 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
              {m.role === 'user' ? (
                <div style={{
                  maxWidth: '85%', borderRadius: 14, padding: '10px 14px',
                  background: '#2A2A2A', color: '#fff',
                  fontFamily: dmSans, fontSize: 14, lineHeight: 1.6,
                }}>{m.content}</div>
              ) : m.message_type === 'network_results' ? (
                <NetworkResultCards content={m.content} onEmailDirect={(name, company) => ask(`Draft an outreach email for ${name} at ${company}`)} />
              ) : (
                <div style={{
                  maxWidth: '85%', borderRadius: 14, padding: '10px 14px',
                  background: '#1E1E1E', color: '#fff',
                  border: '1px solid #2A2A2A',
                  fontFamily: dmSans, fontSize: 14, lineHeight: 1.6,
                }}>
                  <ReactMarkdown className="text-sm prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{m.content}</ReactMarkdown>
                </div>
              )}
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