import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, Building2, Users, Map, MessageSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import FastTrackQuickActions from './FastTrackQuickActions';

const SUGGESTED_PROMPTS = [
  { icon: '🏢', text: "Research Accenture for me — are they hiring?" },
  { icon: '🔍', text: "Find UF alumni working at Goldman Sachs" },
  { icon: '📝', text: "Draft a LinkedIn message to a recruiter at Google" },
  { icon: '🗺️', text: "Create a 4-week job search plan for tech PM roles" },
];

export default function FastTrackChat({ user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildSystemPrompt = () => {
    const profile = {
      name: user?.full_name || 'Student',
      email: user?.email,
      major: user?.major || 'undeclared',
      graduation_year: user?.graduation_year || 'unknown',
      industries: user?.industries_interested?.join(', ') || 'not specified',
      seeking: user?.seeking_type?.join(', ') || 'opportunities',
      location: user?.preferred_work_location || user?.location_city || 'flexible',
      skills: user?.skills || '',
      linkedin: user?.linkedin_url || '',
    };

    return `You are Fast Track Pro — an elite AI career agent for University of Florida students. You combine company intelligence, alumni discovery, and personalized coaching.

STUDENT PROFILE:
- Name: ${profile.name}
- Major: ${profile.major}
- Graduation: ${profile.graduation_year}
- Target Industries: ${profile.industries}
- Seeking: ${profile.seeking}
- Location Preference: ${profile.location}
${profile.skills ? `- Skills: ${profile.skills}` : ''}
${profile.linkedin ? `- LinkedIn: ${profile.linkedin}` : ''}

CAPABILITIES:
1. COMPANY INTELLIGENCE: When asked about a company, provide hiring health (🟢 Hot / 🟡 Warm / 🔴 Cool), open roles, salary ranges, recent news, and interview tips. Use your training knowledge.
2. ALUMNI DISCOVERY: When asked to find alumni, describe the types of UF alumni likely at that company by department, role type, and seniority. Suggest search strategies.
3. OUTREACH DRAFTING: Draft personalized LinkedIn messages or emails referencing shared UF connection and the student's specific background.
4. CAREER ROADMAP: Create week-by-week action plans with specific tasks, deadlines, and milestones.

PERSONALITY: Confident, direct, encouraging. You're a strategic career advisor — not a generic chatbot. Use data and specifics. Be concise but thorough. Use markdown formatting with headers, bullet points, and bold text for readability.

IMPORTANT: Always reference the student's actual profile data (major, grad year, industries) in your responses to make advice personalized.`;
  };

  const sendMessage = async (messageText) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const conversationHistory = [...messages, userMessage]
      .slice(-10) // Keep last 10 messages for context
      .map(m => `${m.role === 'user' ? 'Student' : 'Agent'}: ${m.content}`)
      .join('\n\n');

    const prompt = `${buildSystemPrompt()}

CONVERSATION HISTORY:
${conversationHistory}

Respond to the student's latest message. Be specific, actionable, and reference their profile.`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
      });

      const assistantMessage = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Fast Track chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (actionId) => {
    const prompts = {
      company: "What company should I research for you? Tell me a company name and I'll get you hiring intelligence.",
      alumni: "What company do you want me to find UF alumni at?",
      roadmap: "Let me create a personalized career roadmap for you. What's your target role and timeline?",
      outreach: "I'll draft a personalized outreach message. Who do you want to reach out to and at what company?",
    };
    const prompt = prompts[actionId];
    if (prompt) {
      setMessages(prev => [...prev, { role: 'assistant', content: prompt }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col">
      {/* Empty State */}
      {messages.length === 0 && (
        <div className="mb-6">
          <FastTrackQuickActions onAction={handleQuickAction} />
          
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Try asking...</p>
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => sendMessage(prompt.text)}
                className="flex items-center gap-3 w-full text-left p-3 bg-white rounded-xl border border-slate-200 hover:border-[#0021A5]/30 hover:bg-blue-50/50 transition-all group"
                style={{ minHeight: 'auto', minWidth: 'auto' }}
              >
                <span className="text-lg">{prompt.icon}</span>
                <span className="text-sm text-slate-700 group-hover:text-[#0021A5]">{prompt.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div className="space-y-4 mb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-[#0021A5] to-[#FA4616] rounded-lg flex items-center justify-center mr-3 flex-shrink-0 mt-1">
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
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start">
              <div className="w-8 h-8 bg-gradient-to-br from-[#0021A5] to-[#FA4616] rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-[#0021A5] animate-spin" />
                  <span className="text-sm text-slate-500">Researching...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      )}

      {/* Input Area */}
      <div className="sticky bottom-16 md:bottom-0 bg-slate-50 pt-3 pb-4">
        <div className="flex items-end gap-2 bg-white border-2 border-slate-200 focus-within:border-[#0021A5] rounded-2xl p-2 transition-colors shadow-sm">
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
        <p className="text-[10px] text-slate-400 text-center mt-2">
          Fast Track Pro uses AI with web search. Verify important information independently.
        </p>
      </div>
    </div>
  );
}