import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Sparkles, Loader2, ArrowLeft, Building2, Users, Mail, ThumbsUp, ThumbsDown, Bot, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const SUGGESTED_PROMPTS = [
  { icon: '🏢', text: "Research Accenture — are they hiring?" },
  { icon: '🔍', text: "Find UF alumni at Goldman Sachs" },
  { icon: '📝', text: "Draft a LinkedIn message to a recruiter at Google" },
  { icon: '🗺️', text: "Create a 4-week job search plan" },
];

function CompanyIntelCard({ data }) {
  if (!data) return null;
  return (
    <Card className="p-4 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 mt-2 mb-1">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-[#0021A5] rounded-xl flex items-center justify-center">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-slate-900">{data.company}</p>
          <Badge className={`text-xs ${data.hiring_health === 'hot' ? 'bg-green-100 text-green-700' : data.hiring_health === 'warm' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
            {data.hiring_health === 'hot' ? '🟢 Hot' : data.hiring_health === 'warm' ? '🟡 Warm' : '🔴 Cool'} Hiring
          </Badge>
        </div>
      </div>
      {data.summary && <p className="text-sm text-slate-700 mb-2">{data.summary}</p>}
      {data.roles?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {data.roles.slice(0, 4).map((r, i) => <Badge key={i} variant="outline" className="text-xs">{r}</Badge>)}
        </div>
      )}
    </Card>
  );
}

function AlumniCard({ data }) {
  if (!data) return null;
  return (
    <Card className="p-4 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-fuchsia-50 mt-2 mb-1">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-slate-900">{data.name}</p>
          <p className="text-xs text-slate-500">{data.title} at {data.company}</p>
        </div>
        {data.relevance_score && (
          <Badge className="ml-auto bg-purple-100 text-purple-700 text-xs">{data.relevance_score}% match</Badge>
        )}
      </div>
      {data.connection_reason && <p className="text-sm text-slate-600">{data.connection_reason}</p>}
    </Card>
  );
}

function OutreachCard({ data }) {
  if (!data) return null;
  return (
    <Card className="p-4 border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 mt-2 mb-1">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="w-4 h-4 text-[#FA4616]" />
        <p className="font-semibold text-slate-900 text-sm">Draft Message</p>
        {data.channel && <Badge variant="outline" className="text-xs ml-auto">{data.channel}</Badge>}
      </div>
      <div className="bg-white rounded-lg p-3 border border-orange-200">
        <p className="text-sm text-slate-800 whitespace-pre-wrap">{data.message}</p>
      </div>
      {data.recipient && <p className="text-xs text-slate-500 mt-2">To: {data.recipient}</p>}
    </Card>
  );
}

export default function FastTrackAgentChat({ user, profile, initialMessage, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const sentInitialRef = useRef(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialMessage && !sentInitialRef.current) {
      sentInitialRef.current = true;
      sendMessage(initialMessage);
    }
  }, [initialMessage]);

  const buildSystemPrompt = () => {
    return `You are Fast Track Pro — an elite AI career agent for University of Florida students. You combine real-time company intelligence, alumni discovery, and personalized coaching.

STUDENT PROFILE:
- Name: ${user?.full_name || 'Student'}
- Email: ${user?.email || ''}
- Major: ${user?.major || 'undeclared'}
- Graduation: ${user?.graduation_year || 'unknown'}
- Target Role: ${profile?.dream_role || 'not set'}
- Target Companies: ${profile?.target_companies?.join(', ') || 'none'}
- Target Industries: ${profile?.target_industries?.join(', ') || user?.industries_interested?.join(', ') || 'not specified'}
- Timeline: ${profile?.job_search_timeline || 'not set'}
- Biggest Challenge: ${profile?.biggest_challenge || 'not set'}
- Skills: ${user?.skills || ''}
- LinkedIn: ${user?.linkedin_url || ''}
- Location: ${user?.preferred_work_location || user?.location_city || 'flexible'}

CAPABILITIES:
1. COMPANY INTELLIGENCE: When asked about a company, search for real-time hiring data. Provide hiring health (🟢 Hot / 🟡 Warm / 🔴 Cool), open roles, salary ranges, recent news, interview tips.
2. ALUMNI DISCOVERY: When asked to find alumni, search for UF alumni at that company. Describe likely connections by department and seniority. Suggest outreach strategies.
3. OUTREACH DRAFTING: Draft personalized LinkedIn messages or emails referencing shared UF connection and the student's background.
4. CAREER ROADMAP: Create week-by-week action plans with specific tasks, deadlines, and milestones.

RESPONSE FORMAT: Use markdown with headers, bullet points, and bold text. Be concise but thorough. Always reference the student's actual profile data. Be confident and strategic — you're a career advisor, not a generic chatbot.`;
  };

  const sendMessage = async (messageText) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const conversationHistory = [...messages, userMessage]
      .slice(-10)
      .map(m => `${m.role === 'user' ? 'Student' : 'Agent'}: ${m.content}`)
      .join('\n\n');

    const prompt = `${buildSystemPrompt()}

CONVERSATION:
${conversationHistory}

Respond to the student's latest message. Be specific, actionable, and personalized.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
    });

    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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
          <h2 className="text-white font-bold text-sm">Fast Track Pro Agent</h2>
          <p className="text-white/60 text-xs">AI-powered career intelligence</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#0021A5]/10 to-[#FA4616]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-[#0021A5]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Your AI Career Agent</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
              Research companies, discover alumni, draft outreach messages, and build your career roadmap.
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
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-[#0021A5] text-white'
                  : 'bg-white border border-slate-200 shadow-sm'
              }`}>
                {msg.role === 'user' ? (
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                ) : (
                  <div className="prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <h3 className="text-base font-bold text-slate-900 mt-3 mb-2">{children}</h3>,
                        h2: ({ children }) => <h4 className="text-sm font-bold text-slate-900 mt-3 mb-1.5">{children}</h4>,
                        h3: ({ children }) => <h5 className="text-sm font-semibold text-slate-800 mt-2 mb-1">{children}</h5>,
                        p: ({ children }) => <p className="text-sm text-slate-700 mb-2 leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="text-sm mb-2 ml-4 list-disc">{children}</ul>,
                        ol: ({ children }) => <ol className="text-sm mb-2 ml-4 list-decimal">{children}</ol>,
                        li: ({ children }) => <li className="text-sm text-slate-700 mb-1">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                        code: ({ children }) => <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{children}</code>,
                        a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#0021A5] underline">{children}</a>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
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
                <span className="text-sm text-slate-500">Researching...</span>
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
            placeholder="Ask your career agent anything..."
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
        <p className="text-[10px] text-slate-400 text-center mt-2">Fast Track Pro uses AI with web search. Verify important information independently.</p>
      </div>
    </div>
  );
}