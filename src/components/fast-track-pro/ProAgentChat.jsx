import React, { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { fastTrackProAgent } from '@/functions/fastTrackProAgent';
import { base44 } from '@/api/base44Client';
import { CompanyIntelCard, AlumniListCard, OutreachDraftCard } from './RichCards';
import SuggestedActions from './SuggestedActions';
import RoadmapTimelineCard from './RoadmapTimelineCard';
import CompanySuggestionsCard from './CompanySuggestionsCard';
import WarmPathCard from './WarmPathCard';
import ResumeReviewCard from './ResumeReviewCard';
import ResumeTailoredCard from './ResumeTailoredCard';
import InterviewPrepCard from './InterviewPrepCard';
import SalaryIntelCard from './SalaryIntelCard';
import CoverLetterCard from './CoverLetterCard';
import LinkedInReviewCard from './LinkedInReviewCard';
import BatchTargetScanCard from './BatchTargetScanCard';
import ReplyResponseCard from './ReplyResponseCard';
import ThankYouNoteCard from './ThankYouNoteCard';
import OfferCelebrationCard from './OfferCelebrationCard';
import NetworkThankYouCard from './NetworkThankYouCard';
import titleCase from '@/components/utils/titleCase';
import { matchPromptToOpener, getConversationalOpener } from '@/components/fastiq/conversationalOpeners';
import FollowUpNudgeBanner from '@/components/fastiq/FollowUpNudgeBanner';
import InlineSuggestionButtons from './InlineSuggestionButtons';
import ChatSidebar from './ChatSidebar';
import ChatWelcome from './ChatWelcome';
import MobileSidebarSheet from './MobileSidebarSheet';

const dmSans = "'DM Sans', sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';

function RichCardRenderer({ message_type, payload, profileId, onResearchCompany, profile, onProfileUpdated, onSendMessage, user }) {
  if (!payload) return null;
  const handleDraftMessage = (name) => {
    if (onSendMessage && name) onSendMessage(`Draft a warm intro message to ${name}`);
  };
  switch (message_type) {
    case 'company_intel': return <CompanyIntelCard data={payload} onSendMessage={onSendMessage} user={user} />;
    case 'alumni_card': return <AlumniListCard data={payload} onDraftMessage={handleDraftMessage} onResearchCompany={onResearchCompany} />;
    case 'outreach_draft': case 'follow_up_draft': return <OutreachDraftCard data={payload} onSendMessage={onSendMessage} />;
    case 'roadmap': return <RoadmapTimelineCard data={payload} profileId={profileId} />;
    case 'company_suggestions': return <CompanySuggestionsCard data={payload} onResearchCompany={onResearchCompany} profile={profile} onProfileUpdated={onProfileUpdated} onSendMessage={onSendMessage} />;
    case 'warm_path': return <WarmPathCard data={payload} onOpenChat={onSendMessage} />;
    case 'resume_review': case 'resume_match': return <ResumeReviewCard data={payload} onSendMessage={onSendMessage} />;
    case 'resume_tailored': return <ResumeTailoredCard data={payload} onSendMessage={onSendMessage} />;
    case 'resume_tailor': return <ResumeReviewCard data={payload} onSendMessage={onSendMessage} />;
    case 'interview_prep': return <InterviewPrepCard data={payload} onSendMessage={onSendMessage} />;
    case 'salary_intel': return <SalaryIntelCard data={payload} onSendMessage={onSendMessage} />;
    case 'cover_letter': return <CoverLetterCard data={payload} onSendMessage={onSendMessage} />;
    case 'linkedin_review': return <LinkedInReviewCard data={payload} onSendMessage={onSendMessage} />;
    case 'batch_target_scan': return <BatchTargetScanCard data={payload} onResearchCompany={onResearchCompany} onSendMessage={onSendMessage} />;
    case 'reply_response': return <ReplyResponseCard data={payload} onSendMessage={onSendMessage} />;
    case 'thank_you_note': return <ThankYouNoteCard data={payload} onSendMessage={onSendMessage} />;
    case 'offer_celebration': return <OfferCelebrationCard data={payload} onSendMessage={onSendMessage} />;
    case 'network_thank_you': return <NetworkThankYouCard data={payload} onSendMessage={onSendMessage} />;
    case 'career_events': case 'career_advice': {
      const actions = payload?.suggested_actions || payload?.suggested_next_steps || payload?.next_steps || [];
      return actions.length > 0 ? <div className="mt-2"><SuggestedActions actions={actions} onSendMessage={onSendMessage} accentColor="#0021A5" label="Next Steps" /></div> : null;
    }
    default: return null;
  }
}

const mdComponents = {
  h1: ({ children }) => <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f4f0e8', marginTop: 12, marginBottom: 8 }}>{children}</h3>,
  h2: ({ children }) => <h4 style={{ fontSize: 14, fontWeight: 700, color: '#f4f0e8', marginTop: 12, marginBottom: 6 }}>{children}</h4>,
  h3: ({ children }) => <h5 style={{ fontSize: 13, fontWeight: 600, color: '#f4f0e8', marginTop: 8, marginBottom: 4 }}>{children}</h5>,
  p: ({ children }) => <p style={{ fontSize: 14, color: 'rgba(244,240,232,0.8)', marginBottom: 8, lineHeight: 1.6, fontWeight: 300 }}>{children}</p>,
  ul: ({ children }) => <ul style={{ fontSize: 14, marginBottom: 8, marginLeft: 16, listStyleType: 'disc' }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ fontSize: 14, marginBottom: 8, marginLeft: 16, listStyleType: 'decimal' }}>{children}</ol>,
  li: ({ children }) => <li style={{ fontSize: 14, color: 'rgba(244,240,232,0.8)', marginBottom: 4, fontWeight: 300 }}>{children}</li>,
  strong: ({ children }) => <strong style={{ fontWeight: 600, color: '#f4f0e8' }}>{children}</strong>,
  a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: orange, textDecoration: 'underline' }}>{children}</a>,
};

export default function ProAgentChat({ user, profile: initialProfile, initialMessage, onBack, onRerunAssessment }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(initialProfile);
  const [isUploading, setIsUploading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const sentInitialRef = useRef(false);
  const [knownAlumni, setKnownAlumni] = useState([]);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  useEffect(() => { setCurrentProfile(initialProfile); }, [initialProfile]);

  useEffect(() => {
    if (!user?.email) return;
    const targets = (initialProfile?.target_companies || []).map(c => c.toLowerCase());
    if (targets.length === 0) return;
    base44.entities.DiscoveredAlumni.filter({}, '-created_date', 50)
      .then(all => {
        const valid = (all || []).filter(a =>
          a.company && targets.includes(a.company.toLowerCase()) &&
          new Date(a.expires_at) > new Date() && a.verified !== false
        );
        setKnownAlumni(valid.slice(0, 5));
      }).catch(() => {});
  }, [user?.email, initialProfile?.target_companies]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialMessage && !sentInitialRef.current) {
      sentInitialRef.current = true;
      const openerKey = matchPromptToOpener(initialMessage);
      if (openerKey) startConversation(openerKey);
      else sendMessage(initialMessage);
    }
  }, [initialMessage]);

  const persistMessage = async (role, content, messageType) => {
    if (!user?.email) return;
    const payload = { user_email: user.email, role, content: (content || '').substring(0, 2000), message_type: messageType || 'text' };
    try { await base44.entities.ProAgentConversation.create(payload); } catch (e) {
      try { await base44.entities.ProAgentConversation.create(payload); } catch (e2) { console.error('Persist failed:', e2.message); }
    }
  };

  const startConversation = async (openerKey) => {
    const opener = getConversationalOpener(openerKey, currentProfile);
    if (!opener) return;
    setMessages(prev => [
      ...prev,
      { role: 'user', content: opener.userMessage },
      { role: 'assistant', content: opener.assistantMessage, message_type: 'text' },
    ]);
    await persistMessage('user', opener.userMessage, 'text');
    await persistMessage('assistant', opener.assistantMessage, 'text');
    if (openerKey === 'resume_builder' && currentProfile?.id) {
      try {
        await base44.entities.FastTrackProProfile.update(currentProfile.id, { active_flow: 'resume_builder', flow_step: 'contact_info', flow_data: '{}' });
        setCurrentProfile(prev => ({ ...prev, active_flow: 'resume_builder', flow_step: 'contact_info' }));
      } catch (e) { console.error('Failed to set active_flow:', e.message); }
    }
  };

  const sendMessage = async (messageText) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;
    const openerKey = matchPromptToOpener(text);
    if (openerKey && messages.length === 0) { startConversation(openerKey); setInput(''); return; }
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setIsLoading(true);
    await persistMessage('user', text, 'text');
    try {
      const isBatchOp = /(?:my|all|each|every)\s+(?:target\s+)?companies|(?:scan|research|check)\s+(?:\w+\s+){0,4}(?:my|all)\s+targets/i.test(text);
      const timeoutMs = isBatchOp ? 120000 : 90000;
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs));
      const call = fastTrackProAgent({ message: text });
      const res = await Promise.race([call, timeout]);
      const data = res.data;
      if (data?.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response, message_type: data.message_type || 'text', payload: data.payload }]);
        persistMessage('assistant', data.response, data.message_type || 'text');
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data?.error || 'Something went wrong. Please try again.', message_type: 'text' }]);
      }
    } catch (err) {
      const errorMsg = err.message === 'timeout'
        ? "This is taking longer than expected — FASTIQ is doing deep research. You can wait or come back and I'll have results ready."
        : 'Something went wrong. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg, message_type: 'text' }]);
    } finally { setIsLoading(false); }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      sendMessage(`Here's my resume: [${file.name || 'resume'}](${file_url})\n\nPlease review it and give me feedback.`);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, the file upload failed. Please try again or paste your resume text directly.', message_type: 'text' }]);
    } finally { setIsUploading(false); }
  };

  const handleResearchCompany = (company) => {
    sendMessage(`Research ${titleCase(company)} for me — are they hiring? What roles, salary ranges, and interview process should I know about?`);
  };

  const hasContent = input.trim().length > 0;

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0d1117', fontFamily: dmSans, overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Space+Mono:wght@400;700&display=swap');
        @keyframes fiqDotBounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-4px)} }
        @keyframes fastiqPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.05);opacity:0.85} }
        .fiq-chat-input:focus { outline: none; }
        .fiq-chat-input::placeholder { color: rgba(244,240,232,0.25); }
        @media (max-width: 768px) {
          .fastiq-prompt-text, .fastiq-chat-text { color: rgba(244,240,232,0.9) !important; }
          .fastiq-prompt-card { min-height: 52px !important; padding: 14px 16px !important; }
          .fastiq-prompt-card .fastiq-prompt-text { font-size: 15px !important; line-height: 1.5 !important; }
          .fastiq-tool-card { min-height: 80px !important; padding: 16px !important; }
          .fastiq-tools-grid { grid-template-columns: 1fr !important; }
          .fastiq-section-label { font-size: 11px !important; letter-spacing: 0.1em !important; color: rgba(244,240,232,0.35) !important; }
          .fastiq-welcome-headline { font-size: 22px !important; }
          .fastiq-welcome-subhead { font-size: 17px !important; }
          .fastiq-callout-text { font-size: 14px !important; line-height: 1.65 !important; }
          .fiq-chat-input { font-size: 16px !important; }
          .fastiq-disclaimer { font-size: 9px !important; color: rgba(244,240,232,0.08) !important; padding: 3px 0 6px !important; }
          .fastiq-send-btn { width: 40px !important; height: 40px !important; }
          .fastiq-input-wrap { padding: 12px 16px !important; }
        }
        @media (max-width: 380px) {
          .fastiq-prompt-card .fastiq-prompt-text { font-size: 14px !important; }
          .fastiq-welcome-headline { font-size: 20px !important; }
        }
        @media (min-width: 769px) {
          .fiq-chat-input { font-size: 14px !important; }
        }
      `}</style>

      {/* Left Sidebar — desktop only */}
      <div className="hidden md:flex">
        <ChatSidebar
          profile={currentProfile}
          onBack={onBack}
          onResearchCompany={handleResearchCompany}
          onRerunAssessment={onRerunAssessment}
          onProfileUpdated={setCurrentProfile}
          onOpenChat={(msg) => sendMessage(msg)}
        />
      </div>

      {/* Mobile sidebar bottom sheet */}
      <MobileSidebarSheet
        open={showMobileSidebar}
        onClose={() => setShowMobileSidebar(false)}
        profile={currentProfile}
        onBack={onBack}
        onResearchCompany={handleResearchCompany}
        onRerunAssessment={onRerunAssessment}
        onProfileUpdated={setCurrentProfile}
        onOpenChat={(msg) => sendMessage(msg)}
      />

      {/* Center Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Chat header */}
        <div style={{
          background: '#0d1117', borderBottom: '0.5px solid rgba(255,255,255,0.06)',
          padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Mobile back */}
            <button onClick={onBack} className="md:hidden" style={{
              background: 'none', border: 'none', color: 'rgba(244,240,232,0.5)',
              cursor: 'pointer', padding: 0, marginRight: 4, minHeight: 'auto', width: 'auto',
              fontFamily: dmSans, fontSize: 13,
            }}>← FASTIQ</button>
            <svg width="14" height="14" viewBox="0 0 22 22" fill="none" stroke={orange} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L4 13h8l-2 7 10-12h-8l2-6z"/>
            </svg>
            <span style={{ fontFamily: playfair, fontWeight: 700, fontSize: 16, color: '#f4f0e8' }}>FASTIQ™</span>
            <div style={{
              width: 6, height: 6, borderRadius: '50%', background: '#4ADE80',
              boxShadow: '0 0 6px rgba(74,222,128,0.5)',
            }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="hidden md:inline" style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: 'rgba(244,240,232,0.3)' }}>
              Active · Web search on
            </span>
            {/* Mobile menu icon — opens sidebar sheet */}
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="md:hidden"
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                minHeight: 'auto', width: 'auto', display: 'flex', flexDirection: 'column', gap: 3,
              }}
            >
              <span style={{ width: 18, height: 1.5, background: 'rgba(244,240,232,0.4)', borderRadius: 1, display: 'block' }} />
              <span style={{ width: 18, height: 1.5, background: 'rgba(244,240,232,0.4)', borderRadius: 1, display: 'block' }} />
              <span style={{ width: 18, height: 1.5, background: 'rgba(244,240,232,0.4)', borderRadius: 1, display: 'block' }} />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          <FollowUpNudgeBanner userEmail={user?.email} onSendMessage={sendMessage} />

          {messages.length === 0 && !isLoading && (
            <ChatWelcome profile={currentProfile} onSend={sendMessage} />
          )}

          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', gap: 12, marginBottom: 16, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
              >
                {msg.role === 'assistant' && (
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0, marginTop: 4,
                    background: 'rgba(232,93,32,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke={orange} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z"/>
                    </svg>
                  </div>
                )}
                <div style={{ maxWidth: '85%' }}>
                  <div style={{
                    borderRadius: 16, padding: '12px 16px',
                    background: msg.role === 'user' ? orange : 'rgba(255,255,255,0.06)',
                    border: msg.role === 'user' ? 'none' : '0.5px solid rgba(255,255,255,0.08)',
                  }}>
                    {msg.role === 'user' ? (
                      <p style={{ fontSize: 14, lineHeight: 1.6, color: '#fff', margin: 0, fontWeight: 400 }}>{msg.content}</p>
                    ) : (
                      <>
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown components={mdComponents}>{msg.content}</ReactMarkdown>
                        </div>
                        {(!msg.message_type || msg.message_type === 'text') && (
                          <InlineSuggestionButtons text={msg.content} onSendMessage={sendMessage} />
                        )}
                      </>
                    )}
                  </div>
                  {/* Alumni quick-select chips */}
                  {msg.role === 'assistant' && (msg.content?.includes('name, role, and company') || msg.content?.includes('name, role,')) && knownAlumni.filter(a => a.verified !== false).length > 0 && (
                    <div style={{
                      marginTop: 8, background: 'rgba(255,255,255,0.04)',
                      border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 12,
                    }}>
                      <p style={{ fontFamily: dmSans, fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(244,240,232,0.25)', marginBottom: 8 }}>From your targets:</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {knownAlumni.filter(a => a.verified !== false).map((a, idx) => (
                          <button
                            key={a.id || idx}
                            onClick={() => sendMessage(`Draft a warm intro message to ${a.name}, ${a.role_title || 'professional'} at ${titleCase(a.company)}`)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              padding: '6px 10px', background: 'rgba(255,255,255,0.04)',
                              border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8,
                              cursor: 'pointer', transition: 'all 0.2s', minHeight: 'auto', width: 'auto',
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(232,93,32,0.3)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                          >
                            <div>
                              <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#f4f0e8', display: 'block' }}>{a.name}</span>
                              <span style={{ fontFamily: dmSans, fontSize: 10, color: 'rgba(244,240,232,0.4)' }}>{a.role_title} at {titleCase(a.company)}</span>
                            </div>
                            <span style={{ fontFamily: dmSans, fontSize: 10, color: orange, fontWeight: 500 }}>Draft →</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Rich cards */}
                  {msg.role === 'assistant' && msg.message_type && msg.message_type !== 'text' && (
                    <RichCardRenderer
                      message_type={msg.message_type} payload={msg.payload}
                      profileId={currentProfile?.id} onResearchCompany={handleResearchCompany}
                      profile={currentProfile} onProfileUpdated={setCurrentProfile}
                      onSendMessage={sendMessage} user={user}
                    />
                  )}
                </div>
                {msg.role === 'user' && (
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0, marginTop: 4,
                    background: 'rgba(244,240,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="rgba(244,240,232,0.5)" strokeWidth="1.5" strokeLinecap="round">
                      <circle cx="8" cy="5" r="3"/><path d="M2 14c0-3 2.7-5 6-5s6 2 6 5"/>
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: 'rgba(232,93,32,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke={orange} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z"/>
                </svg>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)',
                borderRadius: 16, padding: '12px 16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0, 150, 300].map(delay => (
                      <span key={delay} style={{
                        width: 6, height: 6, borderRadius: '50%', background: orange,
                        display: 'inline-block',
                        animation: `fiqDotBounce 1.2s infinite ${delay}ms`,
                      }} />
                    ))}
                  </div>
                  <span style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(244,240,232,0.4)', fontWeight: 300 }}>Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <div style={{
          padding: '16px 24px', borderTop: '0.5px solid rgba(255,255,255,0.06)',
          background: '#0d1117', flexShrink: 0,
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        }}>
          <div className="fastiq-input-wrap" style={{
            display: 'flex', alignItems: 'flex-end', gap: 10,
            background: 'rgba(255,255,255,0.05)',
            border: '0.5px solid rgba(255,255,255,0.1)',
            borderRadius: 14, padding: '10px 14px',
            transition: 'border-color 0.2s',
          }}
            onFocus={e => e.currentTarget.style.borderColor = 'rgba(232,93,32,0.4)'}
            onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
          >
            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg" className="hidden" onChange={handleFileUpload} />
            {/* Paperclip */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isLoading}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                minHeight: 'auto', width: 'auto', flexShrink: 0, transition: 'color 0.2s',
              }}
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'rgba(244,240,232,0.3)' }} />
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="rgba(244,240,232,0.3)" strokeWidth="1.5" strokeLinecap="round"
                  onMouseEnter={e => e.currentTarget.setAttribute('stroke', 'rgba(244,240,232,0.6)')}
                  onMouseLeave={e => e.currentTarget.setAttribute('stroke', 'rgba(244,240,232,0.3)')}
                >
                  <path d="M13 8l-5 5a3 3 0 01-4.24-4.24l5-5a2 2 0 012.83 2.83l-5 5a1 1 0 01-1.42-1.42L10 5.5"/>
                </svg>
              )}
            </button>
            {/* Input */}
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask FASTIQ anything..."
              rows={1}
              className="fiq-chat-input"
              style={{
                background: 'none', border: 'none', outline: 'none',
                fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#f4f0e8',
                flex: 1, resize: 'none', minHeight: 22, maxHeight: 120, lineHeight: 1.5,
              }}
            />
            {/* Send */}
            <button
              onClick={() => sendMessage()}
              disabled={!hasContent || isLoading}
              className="fastiq-send-btn"
              style={{
                width: 32, height: 32, borderRadius: '50%', border: 'none',
                background: hasContent ? orange : 'rgba(232,93,32,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: hasContent ? 'pointer' : 'default', flexShrink: 0,
                transition: 'all 0.2s', minHeight: 'auto', minWidth: 'auto',
              }}
              onMouseEnter={e => { if (hasContent) e.currentTarget.style.background = '#d44e14'; }}
              onMouseLeave={e => { e.currentTarget.style.background = hasContent ? orange : 'rgba(232,93,32,0.3)'; }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 8h12M10 4l4 4-4 4"/>
              </svg>
            </button>
          </div>
          {/* Disclaimer — below input, subtle */}
          <p className="fastiq-disclaimer" style={{
            fontFamily: dmSans, fontSize: 10, fontWeight: 300,
            color: 'rgba(244,240,232,0.12)', textAlign: 'center',
            padding: '4px 0 8px', userSelect: 'none',
          }}>
            FASTIQ uses AI with web search. Verify important information independently.
          </p>
        </div>
      </div>
    </div>
  );
}