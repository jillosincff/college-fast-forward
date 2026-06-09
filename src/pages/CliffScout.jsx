import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import MessageBubble from '@/components/cliff-scout/MessageBubble';
import { Send, Zap, ArrowLeft } from 'lucide-react';

async function fetchJobSearchContext(userEmail) {
  try {
    const [pipeline, activityLog] = await Promise.all([
      base44.entities.NetworkingPipeline.filter({ user_email: userEmail }, '-status_date', 20),
      base44.entities.ActivityLog.filter({ student_email: userEmail }, '-created_date', 10),
    ]);

    const totalContacts = pipeline.length;
    const statusCounts = pipeline.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});

    const reachedOut = (statusCounts['reached_out'] || 0) + (statusCounts['messaged'] || 0);
    const replies = statusCounts['replied'] || 0;
    const interviews = statusCounts['interview'] || 0;
    const offers = statusCounts['offer'] || 0;
    const identified = statusCounts['identified'] || 0;
    const matched = statusCounts['matched'] || 0;

    const topCompanies = [...new Set(pipeline.map(p => p.company).filter(Boolean))].slice(0, 5);

    const recentActivity = activityLog.slice(0, 5).map(a => a.type).filter(Boolean);

    const stale = pipeline.filter(p =>
      ['identified', 'matched', 'reached_out'].includes(p.status) &&
      p.status_date &&
      (Date.now() - new Date(p.status_date).getTime()) > 7 * 24 * 60 * 60 * 1000
    );

    const staleSummary = stale.length > 0
      ? `${stale.length} contact(s) haven't been followed up on in over 7 days (e.g. ${stale.slice(0, 2).map(s => `${s.alumni_name} at ${s.company}`).join(', ')})`
      : null;

    return {
      totalContacts,
      identified,
      matched,
      reachedOut,
      replies,
      interviews,
      offers,
      topCompanies,
      recentActivity,
      staleSummary,
      pipelineEmpty: totalContacts === 0,
    };
  } catch {
    return null;
  }
}

function buildGreeting(firstName, ctx) {
  const name = firstName ? `Hey ${firstName}!` : 'Hey!';
  if (!ctx || ctx.pipelineEmpty) {
    return `${name} I'm CLiFF Scout — your UF alumni network agent. You're starting fresh. Tell me a target company, role, or industry and I'll find your warm path in.`;
  }
  if (ctx.offers > 0) {
    return `${name} You've got ${ctx.offers} offer${ctx.offers > 1 ? 's' : ''} in your pipeline — congrats! Want to talk negotiation strategy or compare options?`;
  }
  if (ctx.interviews > 0) {
    return `${name} You have ${ctx.interviews} interview${ctx.interviews > 1 ? 's' : ''} scheduled. Need prep help, salary intel, or a thank-you note draft?`;
  }
  if (ctx.staleSummary) {
    return `${name} ${ctx.staleSummary.replace(/^\d+ contact/, (m) => `You have ${m}`).replace('contact(s)', `contact${ctx.stale > 1 ? 's' : ''}`)} — want me to draft quick follow-up messages?`;
  }
  if (ctx.replies > 0) {
    return `${name} Nice — you have ${ctx.replies} repl${ctx.replies > 1 ? 'ies' : 'y'} in your pipeline. Want to keep the momentum? I can help schedule coffee chats or draft next steps.`;
  }
  if (ctx.reachedOut > 0) {
    return `${name} You've messaged ${ctx.reachedOut} contact${ctx.reachedOut > 1 ? 's' : ''} so far. Want to find more leads or draft follow-ups for anyone who hasn't responded?`;
  }
  if (ctx.identified > 0 || ctx.matched > 0) {
    const count = ctx.identified + ctx.matched;
    return `${name} You have ${count} contact${count > 1 ? 's' : ''} ready to go but haven't reached out yet. Want me to draft the first message?`;
  }
  return `${name} I'm CLiFF Scout — your UF alumni network agent. Tell me a target company, role, or industry and I'll find your warm path in.`;
}

function getSuggestedPrompts(ctx) {
  if (!ctx || ctx.pipelineEmpty) {
    return [
      'Find UF alumni at fintech startups in NYC',
      'Who do I know at Google or Meta?',
      'Find contacts at consulting firms in Florida',
      'Help me target mid-size tech companies',
    ];
  }
  const prompts = [];
  if (ctx.staleSummary) prompts.push('Help me draft follow-up messages for stale contacts');
  if (ctx.identified > 0 || ctx.matched > 0) prompts.push('Draft outreach messages for my identified contacts');
  if (ctx.replies > 0) prompts.push('Help me schedule coffee chats with people who replied');
  if (ctx.interviews > 0) prompts.push('Help me prep for my upcoming interviews');
  prompts.push('Find more alumni at my target companies');
  prompts.push('Show me my full networking pipeline');
  return prompts.slice(0, 4);
}

export default function CliffScout() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState(null);
  const [jobSearchCtx, setJobSearchCtx] = useState(null);
  const [greeting, setGreeting] = useState(null);
  const subscriptionRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;

    const initConversation = async () => {
      const ctx = await fetchJobSearchContext(user.email);
      setJobSearchCtx(ctx);
      setGreeting(buildGreeting(user.full_name?.split(' ')[0] || '', ctx));

      // Build a dynamic context summary for the agent
      let activityContext = '';
      if (ctx) {
        if (ctx.pipelineEmpty) {
          activityContext = 'The student has NO contacts in their networking pipeline yet — they are just getting started. Do NOT mention any saved jobs, opportunities, or pipeline stats.';
        } else {
          const lines = [
            `Networking pipeline: ${ctx.totalContacts} total contacts tracked (these are people/alumni contacts, NOT job listings or opportunities).`,
            ctx.identified > 0 ? `${ctx.identified} contacts identified (not yet reached out).` : null,
            ctx.matched > 0 ? `${ctx.matched} contacts matched (ready to contact).` : null,
            ctx.reachedOut > 0 ? `${ctx.reachedOut} contacts already messaged.` : null,
            ctx.replies > 0 ? `${ctx.replies} contacts have replied.` : null,
            ctx.interviews > 0 ? `${ctx.interviews} interview(s) scheduled.` : null,
            ctx.offers > 0 ? `${ctx.offers} offer(s) received.` : null,
            ctx.topCompanies.length > 0 ? `Target companies in pipeline: ${ctx.topCompanies.join(', ')}.` : null,
            ctx.staleSummary ? `⚠️ Follow-up needed: ${ctx.staleSummary}.` : null,
            'IMPORTANT: Do NOT fabricate or guess any numbers. Only reference the exact numbers above. Do NOT mention "active opportunities saved" or "sprint objective" — use plain direct language.',
          ].filter(Boolean);
          activityContext = lines.join(' ');
        }
      }

      try {
        const conv = await base44.agents.createConversation({
          agent_name: 'cliff_scout',
          metadata: { name: 'CLiFF Scout Session' },
          variables: {
            user: {
              almaMater: user.school_name || user.school || user.schoolName || '',
              firstName: user.full_name?.split(' ')[0] || '',
              activityContext,
            },
          },
        });
        setConversation(conv);
      } catch (err) {
        console.error(err);
      }
    };

    initConversation();
  }, [user]);

  // Subscription is set up lazily on first send — not on conversation create
  // This prevents the agent's auto-opening message from ever reaching the UI
  useEffect(() => {
    return () => {
      // Cleanup subscription on unmount
      if (subscriptionRef.current) subscriptionRef.current();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || sending || !conversation) return;
    setInput('');
    setSending(true);

    // Set up subscription on first send only — avoids catching agent's auto-open message
    if (!subscriptionRef.current) {
      subscriptionRef.current = base44.agents.subscribeToConversation(conversation.id, (data) => {
        const allMsgs = data.messages || [];
        const firstUserIdx = allMsgs.findIndex(m => m.role === 'user');
        if (firstUserIdx === -1) return;
        setMessages(allMsgs.slice(firstUserIdx));
      });
    }

    try {
      await base44.agents.addMessage(conversation, { role: 'user', content: msg });
    } catch (err) {
      console.error('Send failed:', err);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const isLoading = messages.length > 0 && messages[messages.length - 1]?.role === 'user';

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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 leading-none">CLiFF Scout</p>
            <p className="text-xs text-slate-500 mt-0.5">UF Alumni Network Agent</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-slate-500 font-medium">Active</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && !sending && (
          <div className="flex flex-col h-full gap-4 pt-2">
            {/* Greeting: skeleton while loading, dynamic content once ready */}
            {!greeting ? (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center mt-0.5 shrink-0">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 max-w-sm space-y-2">
                  <div className="h-3 bg-slate-200 rounded animate-pulse w-48" />
                  <div className="h-3 bg-slate-200 rounded animate-pulse w-36" />
                </div>
              </div>
            ) : (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center mt-0.5 shrink-0">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 max-w-sm">
                  {greeting}
                </div>
              </div>
            )}
            <div className="flex flex-col gap-2 mt-2">
              {getSuggestedPrompts(jobSearchCtx).map((p, i) => (
                <button
                  key={i}
                  onClick={() => send(p)}
                  className="text-left text-sm text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-2.5 hover:border-blue-400 hover:bg-blue-50 transition-all"
                  style={{ minHeight: 'auto', cursor: 'pointer' }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center mt-0.5 shrink-0">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex gap-1 items-center">
              {[0, 1, 2].map(n => (
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
            placeholder="Target company, role, industry, or location…"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
            style={{ maxHeight: 120, fontSize: 14 }}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || sending || !conversation}
            className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 flex items-center justify-center transition-colors shrink-0"
            style={{ minHeight: 'auto', minWidth: 'auto', cursor: input.trim() && !sending ? 'pointer' : 'default' }}
          >
            <Send className="w-4 h-4 text-white disabled:text-slate-400" />
          </button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-2">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}