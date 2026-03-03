import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, Sparkles, Loader2, ArrowLeft, User, SidebarOpen, SidebarClose } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { fastTrackProAgent } from '@/functions/fastTrackProAgent';
import { CompanyIntelCard, AlumniListCard, OutreachDraftCard } from './RichCards';
import RoadmapTimelineCard from './RoadmapTimelineCard';
import TargetsPanel from './TargetsPanel';
import titleCase from '@/components/utils/titleCase';

const SUGGESTED_PROMPTS = [
  { icon: '🏢', text: "Research my #1 target company — are they hiring?" },
  { icon: '🔍', text: "Find UF Gator alumni at my dream companies" },
  { icon: '📝', text: "Draft a LinkedIn message to a recruiter" },
  { icon: '🗺️', text: "Create a 4-week career action plan for me" },
];

function RichCardRenderer({ message_type, payload, profileId }) {
  if (!payload) return null;
  switch (message_type) {
    case 'company_intel': return <CompanyIntelCard data={payload} />;
    case 'alumni_card': return <AlumniListCard data={payload} />;
    case 'outreach_draft': return <OutreachDraftCard data={payload} />;
    case 'roadmap': return <RoadmapTimelineCard data={payload} profileId={profileId} />;
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
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const sentInitialRef = useRef(false);

  // Keep profile in sync
  useEffect(() => { setCurrentProfile(initialProfile); }, [initialProfile]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialMessage && !sentInitialRef.current) {
      sentInitialRef.current = true;
      sendMessage(initialMessage);
    }
  }, [initialMessage]);

  const buildConversationHistory = (extraMsg) => {
    const all = [...messages];
    if (extraMsg) all.push(extraMsg);
    return all
      .slice(-10)
      .map(m => `${m.role === 'user' ? 'Student' : 'Agent'}: ${m.content}`)
      .join('\n\n');
  };

  const sendMessage = async (messageText) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 45000)
      );
      const call = fastTrackProAgent({
        message: text,
        conversation_history: buildConversationHistory(userMessage),
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
          <p className="text-white/60 text-xs">Intelligent networking engine</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            className="hidden md:flex w-8 h-8 bg-white/10 rounded-lg items-center justify-center hover:bg-white/20 transition-colors"
            style={{ minHeight: 'auto', minWidth: 'auto' }}
            title={sidebarOpen ? 'Hide targets' : 'Show targets'}
          >
            {sidebarOpen ? <SidebarClose className="w-4 h-4 text-white" /> : <SidebarOpen className="w-4 h-4 text-white" />}
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
            />
          </div>
        )}

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0021A5]/10 to-[#FA4616]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-[#0021A5]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">You don't have to figure this out alone anymore.</h3>
                <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                  FASTIQ is your personal networking engine. Every week, I find companies hiring in your field, discover UF alumni who can help — even ones NOT on CFF — and write you a message to reach out. No other tool does this.
                </p>
                <div className="space-y-2 max-w-sm mx-auto">
                  {SUGGESTED_PROMPTS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(p.text)}
                      className="flex items-center gap-3 w-full text-left p-3 bg-white rounded-xl border border-slate-200 hover:border-[#0021A5]/30 hover:bg-blue-50/50 transition-all"
                      style={{ minHeight: 'auto', minWidth: 'auto' }}
                    >
                      <span className="text-lg">{p.icon}</span>
                      <span className="text-sm text-slate-700">{p.text}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-6 mx-auto max-w-sm bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs text-amber-800 leading-relaxed">💡 CFF connects you with parents and alumni who've signed up. FASTIQ goes further — searching the entire web to find UF alumni at ANY company. That's your unfair advantage.</p>
                </div>
              </div>
            )}

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
                        <div className="prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                          <ReactMarkdown components={mdComponents}>{msg.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                    {/* Rich Card below the text bubble */}
                    {msg.role === 'assistant' && msg.message_type !== 'text' && (
                      <RichCardRenderer message_type={msg.message_type} payload={msg.payload} profileId={currentProfile?.id} />
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
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask FASTIQ anything..."
                rows={1}
                className="flex-1 resize-none text-sm px-2 py-2 outline-none bg-transparent max-h-32"
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