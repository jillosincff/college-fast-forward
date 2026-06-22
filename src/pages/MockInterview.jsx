import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { maybeActivateTrial } from '@/utils/trialActivation';
import { navigate } from '@/components/utils/navigation';
import PostTrialUpgradePrompt from '@/components/free-tier/PostTrialUpgradePrompt';
import { Home, FileText, Search, Building2, MessageSquare } from 'lucide-react';
import { checkIsFastIQ } from '@/utils/isFastIQ';

function TopNav() {
  return null;
}

function SideNav() {
  const NAV = [
    { icon: Home, page: 'FreeTierDashboard' },
    { icon: FileText, page: 'ResumeTailoring' },
    { icon: Search, page: 'FreeTierDashboard?tab=alumni_search' },
    { icon: Building2, page: 'FreeTierDashboard?tab=company_intel' },
    { icon: MessageSquare, page: 'MyMessages' },
  ];
  return (
    <div style={{ width: 60, background: '#fff', borderRight: '1px solid #E5E5E5', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 20, position: 'sticky', top: 0, height: '100vh' }}>
      {NAV.map(item => {
        const Icon = item.icon;
        return (
          <button key={item.page} onClick={() => navigate(item.page)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#666', minHeight: 'auto', minWidth: 'auto' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <Icon size={18} />
          </button>
        );
      })}
    </div>
  );
}

const buildSystemPrompt = (user, prefillCompany, prefillRole) => {
  const companyLine = prefillCompany ? `\nTarget Company: ${prefillCompany} — adopt the persona of a senior hiring manager at ${prefillCompany} and tailor ALL questions to this company's culture, values, and known interview style.` : '';
  const roleLine = prefillRole ? `\nTarget Role: ${prefillRole} — every question must be specifically relevant to this exact position.` : '';

  return `You are a professional interviewer${prefillCompany ? ` at ${prefillCompany}` : ''} conducting a realistic mock interview.${companyLine}${roleLine}

Student profile:
- Name: ${user?.full_name?.split(' ')[0] || 'the student'}
- Major: ${user?.major || 'undeclared'}
- Target roles: ${prefillRole || user?.career_goals?.target_roles?.join(', ') || 'not specified'}
- Target industries: ${user?.career_goals?.target_industries?.join(', ') || 'not specified'}
- Graduating: ${user?.career_goals?.graduation_year || 'not specified'}

Interview rules:
1. Introduce yourself by name as a hiring manager${prefillCompany ? ` at ${prefillCompany}` : ''}, acknowledge the specific role${prefillRole ? ` (${prefillRole})` : ''}, then immediately ask "Tell me about yourself"
2. Ask ONE highly specific question at a time — never multiple questions
3. After each answer, give brief constructive STAR feedback (2-3 sentences max): what they did well, what was missing, one specific improvement tip
4. If their answer is vague or misses STAR structure, dig deeper exactly as a real recruiter would
5. Cover: Tell me about yourself, Teamwork, Challenge/failure, Leadership, Why this company/role, Strength and weakness
6. After 6-7 questions, wrap up with encouragement and an overall score out of 10
7. Keep tone warm, professional, and pressured — like a real interview not a casual chat`;
};

export default function MockInterview({ onOpenUpgrade: onOpenUpgradeProp }) {
  const { user, refreshUser } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const onOpenUpgrade = onOpenUpgradeProp || (() => setShowUpgradeModal(true));

  // Read company + role from URL params (injected by CliFF's proactive button)
  const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const urlCompany = hashParams.get('company') || '';
  const urlRole = hashParams.get('role') || '';

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const messagesEndRef = useRef(null);

  const isFastIQ = checkIsFastIQ(user);
  const trialExpired = user?.trial_status === 'expired' && user?.subscription_status !== 'active';

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildPrompt = (history, newUserMessage) => {
    const system = buildSystemPrompt(user, urlCompany, urlRole);
    const historyText = history.map(m =>
      `${m.role === 'user' ? 'Student' : 'Interviewer'}: ${m.content}`
    ).join('\n\n');
    const userPart = newUserMessage ? `\n\nStudent: ${newUserMessage}` : '\n\nStudent: Please start the interview.';
    return `${system}\n\n--- CONVERSATION SO FAR ---\n${historyText}${userPart}\n\nInterviewer:`;
  };

  // Auto-start when company+role are pre-loaded from CliFF's proactive button
  useEffect(() => {
    if (urlCompany && urlRole && user && isFastIQ && !started && !loading) {
      startInterview();
    }
  }, [user, isFastIQ]);

  const startInterview = async () => {
    // Try to activate trial if not yet a FastIQ member
    if (!isFastIQ) {
      const activated = await maybeActivateTrial(user, refreshUser);
      if (!activated) { onOpenUpgrade(); return; }
    }
    setStarted(true);
    setLoading(true);
    try {
      const aiMessage = await base44.integrations.Core.InvokeLLM({
        prompt: buildPrompt([], null),
        model: 'claude_sonnet_4_6',
      });
      setMessages([{ role: 'assistant', content: aiMessage }]);
      setQuestionCount(1);
    } catch (e) {
      console.error('Interview start failed:', e);
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const aiMessage = await base44.integrations.Core.InvokeLLM({
        prompt: buildPrompt(messages, userMessage),
        model: 'claude_sonnet_4_6',
      });
      setMessages(prev => [...prev, { role: 'assistant', content: aiMessage }]);
      const newCount = questionCount + 1;
      setQuestionCount(newCount);
      if (
        aiMessage.toLowerCase().includes('overall score') ||
        aiMessage.toLowerCase().includes('out of 10') ||
        newCount >= 8
      ) {
        setIsComplete(true);
        if (!user?.has_done_mock_interview) {
          base44.auth.updateMe({ has_done_mock_interview: true }).catch(() => {});
        }
      }
    } catch (e) {
      console.error('Message failed:', e);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, something went wrong. Please try again.",
      }]);
    }
    setLoading(false);
  };

  // Trial expired gate
  if (trialExpired) {
    return (
      <>
        <TopNav />
        <PostTrialUpgradePrompt message="Practice AI mock interviews, get STAR method feedback, and sharpen your answers." />
      </>
    );
  }

  // FastIQ gate
  if (!isFastIQ) {
    return (
      <>
        <TopNav />
        <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center', padding: '0 24px' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#FFF5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 24px' }}>🎤</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#1A1A1A', margin: '0 0 12px' }}>Mock Interview</h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#888', margin: '0 0 32px', lineHeight: 1.6 }}>
          Practice with an AI interviewer that knows your target role and gives real STAR method feedback. FastIQ only.
        </p>
        <button onClick={() => onOpenUpgrade()} style={{ background: '#E85D20', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 15, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
          Unlock FastIQ to Practice →
        </button>
      </div>
      </>
    );
  }

  // Pre-start screen
  if (!started) {
    return (
      <>
        <TopNav />
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px' }}>
        <button onClick={() => navigate('FreeTierDashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#64748b', marginBottom: 24, padding: 0, minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          ← Back to Dashboard
        </button>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#7c3aed', margin: '0 0 12px' }}>Mock Interview</p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#1A1A1A', margin: '0 0 12px', lineHeight: 1.2 }}>
          Let's practice, {firstName}.
        </h1>
        {urlCompany && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.2)', borderRadius: 10, padding: '8px 14px', marginBottom: 16 }}>
            <span style={{ fontSize: 14 }}>🎯</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#4f46e5' }}>
              {urlRole ? `${urlRole} at ${urlCompany}` : urlCompany} — questions tailored to this role
            </span>
          </div>
        )}
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#888', margin: '0 0 40px', lineHeight: 1.6 }}>
          Your AI interviewer will ask questions tailored to your target role and give you real STAR method feedback after every answer. About 15 minutes.
        </p>

        <div style={{ background: '#F5F5F5', borderRadius: 14, padding: '24px 28px', marginBottom: 32 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px' }}>WHAT TO EXPECT</p>
          {[
            { icon: '👋', text: 'Start with "Tell me about yourself"' },
            { icon: '⭐', text: 'STAR method feedback after every answer' },
            { icon: '🎯', text: `Questions tailored to ${user?.career_goals?.target_roles?.[0] || 'your target role'}` },
            { icon: '📊', text: 'Overall score and tips at the end' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < 3 ? 12 : 0 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#555', margin: 0 }}>{item.text}</p>
            </div>
          ))}
        </div>

        <div style={{ background: '#FFF5F0', border: '1px solid rgba(232,93,32,0.2)', borderRadius: 14, padding: '20px 24px', marginBottom: 32 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: '#E85D20', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>💡 STAR METHOD REMINDER</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { letter: 'S', word: 'Situation', desc: 'Set the context' },
              { letter: 'T', word: 'Task', desc: 'Your responsibility' },
              { letter: 'A', word: 'Action', desc: 'What YOU did' },
              { letter: 'R', word: 'Result', desc: 'The outcome' },
            ].map(s => (
              <div key={s.letter} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#E85D20', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0, fontFamily: "'DM Sans', sans-serif" }}>{s.letter}</div>
                <div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: '0 0 2px' }}>{s.word}</p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', margin: 0 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={startInterview} style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 10, padding: '16px', fontSize: 15, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", width: '100%' }}>
          Start My Interview →
        </button>
      </div>
      </>
    );
  }

  // Interview screen
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SideNav />
      <div style={{ flex: 1, maxWidth: 720, margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 0px)', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexShrink: 0 }}>
        <div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#7c3aed', margin: '0 0 4px' }}>Mock Interview · Live</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: 0 }}>
            Question {Math.min(questionCount, 7)} of 7 · STAR method feedback after each answer
          </p>
        </div>
        {isComplete && (
          <button onClick={() => { setStarted(false); setMessages([]); setQuestionCount(0); setIsComplete(false); }} style={{ background: 'none', border: '1px solid #E0E0E0', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: '#555', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            Practice Again →
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 16 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 12, alignItems: 'flex-start' }}>
            {msg.role === 'assistant' && (
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>⚡</div>
            )}
            <div style={{ background: msg.role === 'user' ? '#E85D20' : '#fff', border: msg.role === 'user' ? 'none' : '1px solid #E5E5E5', borderRadius: 16, borderTopLeftRadius: msg.role === 'assistant' ? 4 : 16, borderTopRightRadius: msg.role === 'user' ? 4 : 16, padding: '14px 18px', maxWidth: '75%' }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.6, color: msg.role === 'user' ? '#fff' : '#1A1A1A', margin: 0, whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>⚡</div>
            <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 16, borderTopLeftRadius: 4, padding: '14px 18px' }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#E85D20', animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {!isComplete && (
        <div style={{ flexShrink: 0, display: 'flex', gap: 10, paddingTop: 16, borderTop: '1px solid #F0F0F0' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Type your answer... (Shift+Enter for new line)"
            rows={3}
            style={{ flex: 1, fontSize: 14, lineHeight: 1.6, color: '#1A1A1A', background: '#F9F9F9', border: '1px solid #E0E0E0', borderRadius: 10, padding: '12px 16px', resize: 'none', fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box' }}
          />
          <button onClick={sendMessage} disabled={!input.trim() || loading} style={{ background: !input.trim() || loading ? '#F0F0F0' : '#E85D20', border: 'none', borderRadius: 10, padding: '0 20px', fontSize: 20, color: !input.trim() || loading ? '#CCC' : '#fff', cursor: !input.trim() || loading ? 'not-allowed' : 'pointer', flexShrink: 0 }}>
            →
          </button>
        </div>
      )}

      {isComplete && (
        <div style={{ flexShrink: 0, background: '#F5F5F5', borderRadius: 12, padding: '16px 20px', textAlign: 'center', marginTop: 16 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#555', margin: '0 0 12px' }}>
            Interview complete! 🎉 Practice again to improve your score.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button onClick={() => { setStarted(false); setMessages([]); setQuestionCount(0); setIsComplete(false); }} style={{ background: '#E85D20', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              Practice Again →
            </button>
            <button onClick={() => navigate('FreeTierDashboard')} style={{ background: 'none', border: '1px solid #E0E0E0', borderRadius: 8, padding: '10px 24px', fontSize: 13, color: '#555', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }`}</style>
    </div>
    </div>
  );
}