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
  const schoolAbbr = user?.school_abbreviation || user?.school_code?.toUpperCase() || 'your university';

  const defaultGreeting = `Hi ${firstName}! 📎 I'm CliFF, your CFF Career Agent. Ask me anything — tricky interview follow-ups, salary negotiations, or how to reach out to that alum at your target company. I'm locked in 24/7.`;

  const [messages, setMessages] = useState([{ role: 'agent', text: defaultGreeting }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [parentMatch, setParentMatch] = useState(null);
  const [matchDismissed, setMatchDismissed] = useState(false);
  const [interviewData, setInterviewData] = useState(null);
  const [interviewDismissed, setInterviewDismissed] = useState(false);
  const bottomRef = useRef(null);

  // On mount — run both checks in parallel; interview prep takes priority over parent match
  useEffect(() => {
    if (!user?.id) return;

    Promise.all([
      base44.functions.invoke('checkUpcomingInterviews', {}).catch(() => null),
      base44.functions.invoke('getDashboardParentMatch', {}).catch(() => null),
    ]).then(([intRes, parentRes]) => {
      const interview = intRes?.data ?? intRes ?? {};
      const parentD = parentRes?.data ?? parentRes ?? {};

      if (interview?.has_upcoming && interview?.interview) {
        const { company, role } = interview.interview;
        setInterviewData(interview.interview);
        const roleStr = role ? ` for the ${role} role` : '';
        const greeting = `Hey ${firstName}! 📎 I noticed you have an interview coming up${roleStr} at ${company}. Let's make sure you're absolutely locked in.\n\nWant to run a quick 10-minute mock interview right now to prep for the questions they're going to throw at you?`;
        setMessages([{ role: 'agent', text: greeting }]);
      } else if (parentD?.match_found && parentD?.parent) {
        setParentMatch(parentD);
        const { parent, industry, school_code } = parentD;
        const school = school_code || schoolAbbr;
        const greeting = `Hey ${firstName}! 📎 I was just scanning our network and found a ${school} parent — ${parent.first_name}, a ${parent.role_title} at ${parent.company_name}. They've explicitly opted in to backchanneling resumes and mentoring students in ${industry}. Want to connect with them for insider advice or a warm referral?`;
        setMessages([{ role: 'agent', text: greeting }]);
      }
    });
  }, [user?.id]);

  // Reset greeting whenever a coffee-chat signal is selected
  useEffect(() => {
    if (!selectedSignal) return;
    const { company, alumniCount, parentCount, sampleConnections } = selectedSignal;

    const parentContact = (sampleConnections || []).find(c => c.connection_type === 'parent');
    const alumContact = (sampleConnections || []).find(c => c.connection_type === 'alum');

    let greeting;
    if (parentCount > 0 && parentContact) {
      greeting = `Hi ${firstName}! 📎 I found a ${schoolAbbr} parent — ${parentContact.name}, ${parentContact.role_title} at ${company}. Parents who've opted into our network are 10× more likely to pick up the phone. Let me write them a targeted, warm message that leads with your ${schoolAbbr} connection. Just say "write it" and I'll draft it now.`;
    } else if (parentCount > 0) {
      greeting = `Hi ${firstName}! 📎 There ${parentCount === 1 ? 'is' : 'are'} ${parentCount} opted-in ${schoolAbbr} parent${parentCount > 1 ? 's' : ''} at ${company} — these are your highest-conversion contacts. Want me to write a targeted outreach that opens with your shared ${schoolAbbr} connection?`;
    } else if (alumniCount > 0 && alumContact) {
      greeting = `Hi ${firstName}! 📎 I'm looking at ${company} — ${alumniCount} ${schoolAbbr} grads work there. I found ${alumContact.name} (${alumContact.role_title}) as a warm lead. Want me to draft a concise coffee chat request that's personalized to their background? Just say "write it."`;
    } else if (alumniCount > 0) {
      greeting = `Hi ${firstName}! 📎 There are ${alumniCount} ${schoolAbbr} grads at ${company}. Want me to draft a warm coffee chat outreach — short, personal, and impossible to ignore?`;
    } else {
      greeting = `Hi ${firstName}! 📎 I'm on ${company} for you. No direct contacts mapped yet, but I can write a cold outreach that still feels warm based on your background. Ready to craft your pitch?`;
    }

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
      <div style={{ padding: '14px 16px', maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
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
            {/* Interview prep action buttons — shown only under the first agent message */}
            {i === 0 && m.role === 'agent' && interviewData && !interviewDismissed && messages.length <= 1 && (
              <div style={{ marginTop: 8, background: 'rgba(79,70,229,0.05)', border: '1px solid rgba(79,70,229,0.15)', borderRadius: 12, padding: '10px 12px', maxWidth: '82%' }}>
                <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#4f46e5', margin: '0 0 8px' }}>🎯 Recommended Prep Event Triggered</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => {
                      setInterviewDismissed(true);
                      const params = new URLSearchParams({ company: interviewData.company });
                      if (interviewData.role) params.set('role', interviewData.role);
                      window.location.hash = `#MockInterview?${params.toString()}`;
                    }}
                    style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#fff', background: '#4f46e5', border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', minHeight: 'auto', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#4338ca'}
                    onMouseLeave={e => e.currentTarget.style.background = '#4f46e5'}
                  >
                    🎙️ Start Practice Session
                  </button>
                  <button
                    onClick={() => setInterviewDismissed(true)}
                    style={{ fontFamily: dm, fontSize: 11, fontWeight: 500, color: '#6b7280', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', minHeight: 'auto', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            )}

            {/* Parent match action buttons — shown only under the first agent message */}
            {i === 0 && m.role === 'agent' && parentMatch && !matchDismissed && messages.length <= 1 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button
                  onClick={() => {
                    setMatchDismissed(true);
                    sendMessage(`Yes, draft an opener for ${parentMatch.parent.first_name} at ${parentMatch.parent.company_name}`);
                  }}
                  style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#fff', background: '#4f46e5', border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', minHeight: 'auto', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#4338ca'}
                  onMouseLeave={e => e.currentTarget.style.background = '#4f46e5'}
                >
                  ⚡ Yes, draft an opener
                </button>
                <button
                  onClick={() => setMatchDismissed(true)}
                  style={{ fontFamily: dm, fontSize: 11, fontWeight: 500, color: '#6b7280', background: '#f1f5f9', border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', minHeight: 'auto', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
                >
                  Not right now
                </button>
              </div>
            )}
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