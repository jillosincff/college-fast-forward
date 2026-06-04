import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';
import MessageBubble from '@/components/cliff-scout/MessageBubble';
import { saveActionPlanFromChat } from '@/functions/saveActionPlanFromChat';

const AGENT_NAME = 'action_plan_architect';

function parseActionPlanJson(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    const content = messages[i]?.content || '';
    const match = content.match(/```action_plan_json\s*([\s\S]*?)```/);
    if (match) {
      try {
        return JSON.parse(match[1].trim());
      } catch {}
    }
  }
  return null;
}

export default function ActionPlanArchitect() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;

    // Build a rich profile summary from onboarding data to seed the conversation
    const goals = user.career_goals || {};
    const roles = Array.isArray(goals.target_roles) ? goals.target_roles.join(', ') : (goals.target_roles || '');
    const industries = Array.isArray(goals.target_industries) ? goals.target_industries.join(', ') : (goals.target_industries || '');
    const companySize = Array.isArray(goals.company_size_preference) ? goals.company_size_preference.join(', ') : (goals.company_size_preference || '');
    const location = goals.preferred_location || user.location || '';

    const profileLines = [
      user.major && `Major: ${user.major}`,
      user.graduation_year && `Graduation year: ${user.graduation_year}`,
      (user.school_name || user.school) && `School: ${user.school_name || user.school}`,
      roles && `Target roles: ${roles}`,
      industries && `Target industries: ${industries}`,
      companySize && `Preferred company size: ${companySize}`,
      location && `Location preference: ${location}`,
    ].filter(Boolean).join('\n');

    const seedMessage = profileLines
      ? `Here's my profile info from onboarding:\n${profileLines}\n\nPlease use this to build my personalized action plan — skip any questions you already have answers to.`
      : `Let's build my action plan.`;

    base44.agents.createConversation({
      agent_name: AGENT_NAME,
      metadata: { name: 'Action Plan Session' },
    }).then(conv => {
      setConversation(conv);
      // Auto-send profile as first message
      base44.agents.addMessage(conv, { role: 'user', content: seedMessage }).catch(console.error);
    }).catch(console.error);
  }, [user]);

  useEffect(() => {
    if (!conversation?.id) return;
    const unsub = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
    });
    return unsub;
  }, [conversation?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-detect and save plan when agent outputs JSON
  useEffect(() => {
    if (messages.length === 0 || saving || saved) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role !== 'assistant') return;
    const plan = parseActionPlanJson(messages);
    if (!plan) return;
    setSaving(true);
    const allTasks = (plan.phases || []).flatMap(p => p.tasks || []);
    saveActionPlanFromChat({ tasks: allTasks })
      .then(() => setSaved(true))
      .catch(console.error)
      .finally(() => setSaving(false));
  }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || sending || !conversation) return;
    setInput('');
    setSending(true);
    try {
      await base44.agents.addMessage(conversation, { role: 'user', content: msg });
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const isLoading = messages.length > 0 && messages[messages.length - 1]?.role === 'user';

  // Show the CTA chip after ANY assistant message as long as no plan has been generated yet
  const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
  const planAlreadyGenerated = parseActionPlanJson(messages) !== null;
  const showGenerateCTA = !!lastAssistantMsg && !planAlreadyGenerated && !isLoading;

  return (
    <div className="flex flex-col h-screen bg-slate-50" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shrink-0">
        <button
          onClick={() => window.history.back()}
          className="text-slate-500 hover:text-slate-800 transition-colors"
          style={{ minHeight: 'auto', minWidth: 'auto', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 leading-none">Action Plan Architect</p>
            <p className="text-xs text-slate-500 mt-0.5">Your personalized career roadmap</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          {saving && <span className="text-xs text-indigo-500 font-medium animate-pulse">Saving plan…</span>}
          {saved && (
            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Plan saved to dashboard
            </span>
          )}
          {!saving && !saved && (
            <>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-slate-500 font-medium">Active</span>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 pb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div className="text-center max-w-xs">
              <p className="text-base font-bold text-slate-900">Building your roadmap…</p>
              <p className="text-sm text-slate-500 mt-1">Using your onboarding profile to generate a personalized plan.</p>
            </div>
            <div className="flex gap-1">
              {[0,1,2].map(n => (
                <span key={n} className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${n * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          // Strip the JSON block from assistant messages before rendering
          const cleaned = msg.role === 'assistant' && msg.content
            ? { ...msg, content: msg.content
                .replace(/```action_plan_json[\s\S]*?```/g, '')
                .replace(/```json[\s\S]*?```/g, '')
                .replace(/\{[\s\S]*"phases"[\s\S]*\}/g, '')
                .trim() }
            : msg;
          return <MessageBubble key={i} message={cleaned} />;
        })}

        {/* CTA chip after welcome message */}
        {showGenerateCTA && (
          <div className="flex justify-start pl-10">
            <button
              onClick={() => send('✨ Generate My Action Plan')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', minHeight: 'auto', cursor: 'pointer', boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}
            >
              <Sparkles className="w-4 h-4" />
              ✨ Generate My Action Plan
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mt-0.5 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex gap-1 items-center">
              {[0,1,2].map(n => (
                <span key={n} className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${n * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-200 px-4 py-3 shrink-0">
        <div className="flex gap-2 items-end max-w-3xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Tell the Architect about your goals…"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all"
            style={{ maxHeight: 120, fontSize: 14 }}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || sending || !conversation}
            className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 flex items-center justify-center transition-colors shrink-0"
            style={{ minHeight: 'auto', minWidth: 'auto', cursor: input.trim() && !sending ? 'pointer' : 'default' }}
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-2">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}