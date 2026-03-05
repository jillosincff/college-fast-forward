import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, Sparkles, Loader2, ArrowLeft, User, ChevronLeft, ChevronRight, Paperclip } from 'lucide-react';
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
import TargetsPanel from './TargetsPanel';
import titleCase from '@/components/utils/titleCase';
import { matchPromptToOpener, getConversationalOpener } from '@/components/fastiq/conversationalOpeners';
import FollowUpNudgeBanner from '@/components/fastiq/FollowUpNudgeBanner';
import InlineSuggestionButtons from './InlineSuggestionButtons';

function getSuggestedPrompts(profile) {
  const hasTargets = (profile?.target_companies || []).length > 0;
  const prompts = [];

  if (hasTargets) {
    prompts.push({ icon: '🏢', text: "Research my #1 target company — are they hiring?", category: 'find' });
    prompts.push({ icon: '🔍', text: "Find UF alumni at my dream companies", category: 'find' });
  } else {
    prompts.push({ icon: '🔍', text: "Help me find companies to target", category: 'find' });
    prompts.push({ icon: '🏢', text: "What mid-size companies should I look at?", category: 'find' });
  }
  prompts.push({ icon: '✉️', text: "Draft a warm intro message", category: 'find' });
  prompts.push({ icon: '📬', text: "Draft follow-up messages for stale outreach", category: 'find' });
  prompts.push({ icon: '🎉', text: "I got a reply from a contact — help me respond", category: 'find' });
  prompts.push({ icon: '📄', text: "Review my resume", category: 'tools' });
  prompts.push({ icon: '✨', text: "Tailor my resume for a job", category: 'tools' });
  prompts.push({ icon: '💼', text: "Prep me for an interview", category: 'tools' });
  prompts.push({ icon: '🔗', text: "Review my LinkedIn profile", category: 'tools' });
  prompts.push({ icon: '🗺️', text: "Build my career action plan", category: 'tools' });
  prompts.push({ icon: '💰', text: "What should I negotiate for salary?", category: 'tools' });
  prompts.push({ icon: '🙏', text: "Draft a thank-you note after my interview", category: 'tools' });
  prompts.push({ icon: '🎉', text: "I got a job offer!", category: 'tools' });
  prompts.push({ icon: '❤️', text: "Thank everyone who helped me in my job search", category: 'tools' });
  prompts.push({ icon: '🧭', text: "Explore career paths for my major", category: 'explore' });

  return prompts;
}

function RichCardRenderer({ message_type, payload, profileId, onResearchCompany, profile, onProfileUpdated, onSendMessage }) {
  if (!payload) return null;
  const handleDraftMessage = (name) => {
    if (onSendMessage && name) onSendMessage(`Draft a warm intro message to ${name}`);
  };
  switch (message_type) {
    case 'company_intel': return <CompanyIntelCard data={payload} onSendMessage={onSendMessage} />;
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
    case 'career_advice': {
      const actions = payload?.suggested_actions || payload?.suggested_next_steps || payload?.next_steps || [];
      return actions.length > 0 ? (
        <div className="mt-2">
          <SuggestedActions actions={actions} onSendMessage={onSendMessage} accentColor="#0021A5" label="Suggested Actions" />
        </div>
      ) : null;
    }
    default: return null;
  }
}

const mdComponents = {
  h1: ({ children }) => <h3 className="text-base font-bold text-slate-900 mt-3 mb-2">{children}</h3>,
  h2: ({ children }) => <h4 className="text-sm font-bold text-slate-900 mt-3 mb-1.5">{children}</h4>,
  h3: ({ children }) => <h5 className="text-sm font-semibold text-slate-800 mt-2 mb-1">{children}</h5>,
  p: ({ children }) => <p className="text-sm text-slate-700 mb-2 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="text-sm mb-2 ml-4 list-disc">{children}</ul>,
  ol: ({ children }) => <ol className="text-sm mb-2 ml-4 list-decimal">{children}</ol>,
  li: ({ children }) => <li className="text-sm text-slate-700 mb-1">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
  a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#0021A5] underline">{children}</a>,
};

export default function ProAgentChat({ user, profile: initialProfile, initialMessage, onBack, onRerunAssessment }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentProfile, setCurrentProfile] = useState(initialProfile);
  const [isUploading, setIsUploading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const sentInitialRef = useRef(false);

  // Keep profile in sync
  useEffect(() => { setCurrentProfile(initialProfile); }, [initialProfile]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialMessage && !sentInitialRef.current) {
      sentInitialRef.current = true;
      // Check if initial message maps to a conversational opener
      const openerKey = matchPromptToOpener(initialMessage);
      if (openerKey) {
        startConversation(openerKey);
      } else {
        sendMessage(initialMessage);
      }
    }
  }, [initialMessage]);

  // P2 FIX: Removed buildConversationHistory — backend now uses DB as single source of truth

  // P2 FIX: Persist messages with retry on failure
  const persistMessage = async (role, content, messageType) => {
    if (!user?.email) return;
    const payload = {
      user_email: user.email,
      role,
      content: (content || '').substring(0, 2000),
      message_type: messageType || 'text',
    };
    try {
      await base44.entities.ProAgentConversation.create(payload);
    } catch (e) {
      console.warn('Persist message failed, retrying:', e.message);
      try {
        await base44.entities.ProAgentConversation.create(payload);
      } catch (e2) {
        console.error('Persist message failed after retry:', e2.message);
      }
    }
  };

  // Start a conversational opener: show user message + instant assistant reply, no API call
  const startConversation = (openerKey) => {
    const opener = getConversationalOpener(openerKey, currentProfile);
    if (!opener) return;
    setMessages(prev => [
      ...prev,
      { role: 'user', content: opener.userMessage },
      { role: 'assistant', content: opener.assistantMessage, message_type: 'text' },
    ]);
    // Persist both messages for context tracking
    persistMessage('user', opener.userMessage, 'text');
    persistMessage('assistant', opener.assistantMessage, 'text');
  };

  const sendMessage = async (messageText) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    // Check if this prompt maps to a conversational opener
    const openerKey = matchPromptToOpener(text);
    if (openerKey && messages.length === 0) {
      // First interaction — start a conversation instead of hitting the API
      startConversation(openerKey);
      setInput('');
      return;
    }

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Persist user message for context tracking
    persistMessage('user', text, 'text');

    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 45000)
      );
      // P2 FIX: No longer sending conversation_history — backend reads from DB
      const call = fastTrackProAgent({
        message: text,
      });
      const res = await Promise.race([call, timeout]);

      const data = res.data;
      if (data?.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response,
          message_type: data.message_type || 'text',
          payload: data.payload,
        }]);
        // Persist assistant response for context tracking
        persistMessage('assistant', data.response, data.message_type || 'text');
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data?.error || 'Something went wrong. Please try again.',
          message_type: 'text',
        }]);
      }
    } catch (err) {
      const errorMsg = err.message === 'timeout'
        ? 'Research is taking longer than expected. Try asking about a specific company or topic.'
        : 'Something went wrong. Please try again.';
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMsg,
        message_type: 'text',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so user can re-upload same file
    e.target.value = '';
    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const fileName = file.name || 'resume';
      sendMessage(`Here's my resume: [${fileName}](${file_url})\n\nPlease review it and give me feedback.`);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, the file upload failed. Please try again or paste your resume text directly.',
        message_type: 'text',
      }]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleResearchCompany = (company) => {
    sendMessage(`Research ${titleCase(company)} for me — are they hiring? What roles, salary ranges, and interview process should I know about?`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-[#0021A5] to-[#0033CC] px-4 py-3 flex items-center gap-3 shadow-md">
        <button onClick={onBack} className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors" style={{ minHeight: 'auto', minWidth: 'auto' }}>
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-white font-bold text-sm">FASTIQ™</h2>
          <p className="text-white/60 text-xs">Your personal career center</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            className="hidden md:flex w-8 h-8 bg-white/10 rounded-lg items-center justify-center hover:bg-white/20 transition-colors"
            style={{ minHeight: 'auto', minWidth: 'auto' }}
            title={sidebarOpen ? 'Hide targets' : 'Show targets'}
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4 text-white" /> : <ChevronRight className="w-4 h-4 text-white" />}
          </button>
          <Badge className="bg-gradient-to-r from-[#0021A5] to-[#FA4616] text-white px-3 py-1 rounded-full text-xs font-bold border-0">FASTIQ</Badge>
        </div>
      </div>

      {/* Mobile: Collapsible Targets Panel at top */}
      <div className="md:hidden">
        <TargetsPanel
          profile={currentProfile}
          onResearchCompany={handleResearchCompany}
          onRerunAssessment={onRerunAssessment}
          onProfileUpdated={setCurrentProfile}
          onOpenChat={(msg) => sendMessage(msg)}
        />
      </div>

      {/* Desktop: Sidebar + Chat layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        {sidebarOpen && (
          <div className="hidden md:block w-72 flex-shrink-0 border-r border-slate-200 overflow-y-auto bg-slate-50 p-3">
            <TargetsPanel
              profile={currentProfile}
              onResearchCompany={handleResearchCompany}
              onRerunAssessment={onRerunAssessment}
              onProfileUpdated={setCurrentProfile}
              onOpenChat={(msg) => sendMessage(msg)}
            />
          </div>
        )}

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {/* Follow-up nudge banner */}
            <FollowUpNudgeBanner userEmail={user?.email} onSendMessage={sendMessage} />

            {messages.length === 0 && !isLoading && (() => {
              const allPrompts = getSuggestedPrompts(currentProfile);
              const findPrompts = allPrompts.filter(p => p.category === 'find');
              const toolPrompts = allPrompts.filter(p => p.category === 'tools');
              const explorePrompts = allPrompts.filter(p => p.category === 'explore');
              return (
                <div className="py-6 max-w-lg mx-auto">
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#0021A5]/10 to-[#FA4616]/10 rounded-2xl flex items-center justify-center mx-auto mb-3 animate-bounce" style={{ animationDuration: '3s' }}>
                      <Sparkles className="w-7 h-7 text-[#0021A5]" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Your career center is ready.</h3>
                    <p className="text-sm font-semibold bg-gradient-to-r from-[#0021A5] to-[#FA4616] bg-clip-text text-transparent">What should we tackle first?</p>
                    <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
                      I find companies hiring in your field, discover UF alumni who can open doors — even ones not on CFF — and write you a message to reach out. No other tool does this.
                    </p>
                  </div>

                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">🔍 Find Opportunities</p>
                  <div className="space-y-2 mb-4">
                    {findPrompts.map((p, i) => (
                      <button key={i} onClick={() => sendMessage(p.text)}
                        className="flex items-center gap-3 w-full text-left p-3 bg-white rounded-xl border border-slate-200 hover:border-[#0021A5]/30 hover:bg-blue-50/50 hover:-translate-y-0.5 transition-all"
                        style={{ minHeight: 'auto', minWidth: 'auto' }}>
                        <span className="text-lg flex-shrink-0">{p.icon}</span>
                        <span className="text-sm text-slate-700 flex-1">{p.text}</span>
                        <span className="text-slate-300 text-xs">→</span>
                      </button>
                    ))}
                  </div>

                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">🛠️ Career Tools</p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {toolPrompts.map((p, i) => (
                      <button key={i} onClick={() => sendMessage(p.text)}
                        className="flex items-center gap-2 text-left p-3 bg-white rounded-xl border border-slate-200 hover:border-[#0021A5]/30 hover:bg-blue-50/50 hover:-translate-y-0.5 transition-all"
                        style={{ minHeight: 'auto', minWidth: 'auto' }}>
                        <span className="text-base flex-shrink-0">{p.icon}</span>
                        <span className="text-xs text-slate-700">{p.text}</span>
                      </button>
                    ))}
                  </div>

                  {explorePrompts.length > 0 && (
                    <>
                      <div className="space-y-2 mb-4">
                        {explorePrompts.map((p, i) => (
                          <button key={i} onClick={() => sendMessage(p.text)}
                            className="flex items-center gap-3 w-full text-left p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200 hover:border-cyan-400 hover:-translate-y-0.5 transition-all"
                            style={{ minHeight: 'auto', minWidth: 'auto' }}>
                            <span className="text-lg flex-shrink-0">{p.icon}</span>
                            <span className="text-sm text-slate-700 flex-1">{p.text}</span>
                            <span className="text-cyan-400 text-xs">→</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-xs text-amber-800 leading-relaxed">💡 CFF connects you with parents and alumni who've signed up. FASTIQ goes further — searching the entire web to find UF alumni at ANY company. That's your unfair advantage.</p>
                  </div>
                </div>
              );
            })()}

            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-[#0021A5] to-[#FA4616] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[85%] ${msg.role === 'user' ? '' : ''}`}>
                    <div className={`rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-[#0021A5] text-white'
                        : 'bg-white border border-slate-200 shadow-sm'
                    }`}>
                      {msg.role === 'user' ? (
                        <p className="text-sm leading-relaxed text-white">{msg.content}</p>
                      ) : (
                        <>
                          <div className="prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                            <ReactMarkdown components={mdComponents}>{msg.content}</ReactMarkdown>
                          </div>
                          {/* Inline suggestion buttons parsed from text */}
                          {(!msg.message_type || msg.message_type === 'text') && (
                            <InlineSuggestionButtons text={msg.content} onSendMessage={sendMessage} />
                          )}
                        </>
                      )}
                    </div>
                    {/* Rich Card below the text bubble */}
                    {msg.role === 'assistant' && msg.message_type && msg.message_type !== 'text' && (
                      <RichCardRenderer
                        message_type={msg.message_type}
                        payload={msg.payload}
                        profileId={currentProfile?.id}
                        onResearchCompany={handleResearchCompany}
                        profile={currentProfile}
                        onProfileUpdated={setCurrentProfile}
                        onSendMessage={sendMessage}
                      />
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 bg-[#FA4616] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#0021A5] to-[#FA4616] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-[#0021A5] animate-spin" />
                    <span className="text-sm text-slate-500">FASTIQ is researching...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-4 safe-area-bottom">
            <div className="max-w-4xl mx-auto flex items-end gap-2 bg-white border-2 border-slate-200 focus-within:border-[#0021A5] rounded-2xl p-2 transition-colors shadow-sm">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isLoading}
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:bg-slate-100 text-slate-400 hover:text-[#0021A5]"
                style={{ minHeight: 'auto', minWidth: 'auto', width: '40px' }}
                title="Upload resume or file"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
              </button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask FASTIQ anything..."
                rows={1}
                className="flex-1 resize-none text-sm px-2 py-2 outline-none bg-transparent max-h-32 focus:ring-0 focus:outline-none border-none shadow-none"
                style={{ minHeight: '40px' }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                  input.trim() && !isLoading
                    ? 'bg-[#0021A5] text-white hover:bg-[#001580] shadow-md'
                    : 'bg-slate-100 text-slate-400'
                }`}
                style={{ minHeight: 'auto', minWidth: 'auto', width: '40px' }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2">FASTIQ uses AI with web search. Verify important information independently.</p>
          </div>
        </div>
      </div>
    </div>
  );
}