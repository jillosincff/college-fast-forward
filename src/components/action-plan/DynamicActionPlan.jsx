import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Circle, Zap, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PHASE_COLORS = {
  'Foundation': 'bg-blue-100 text-blue-700',
  'Network Building': 'bg-purple-100 text-purple-700',
  'Outreach': 'bg-orange-100 text-orange-700',
  'Interview Prep': 'bg-green-100 text-green-700',
  'General': 'bg-slate-100 text-slate-600',
};

function TaskRow({ task, onToggle }) {
  const isComplete = task.status === 'complete';
  const hasScout = task.title?.includes('CLiFF Scout') || task.title?.includes('alumni');

  return (
    <div className={`flex items-start gap-3 py-3 px-4 rounded-xl transition-all ${isComplete ? 'opacity-50' : 'hover:bg-slate-50'}`}>
      <button
        onClick={() => onToggle(task.id, !isComplete)}
        className="mt-0.5 shrink-0 text-slate-400 hover:text-blue-600 transition-colors"
        style={{ minHeight: 'auto', minWidth: 'auto', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
      >
        {isComplete
          ? <CheckCircle2 className="w-5 h-5 text-green-500" />
          : <Circle className="w-5 h-5" />}
      </button>
      <span className={`flex-1 text-sm leading-relaxed ${isComplete ? 'line-through text-slate-400' : 'text-slate-700'}`}>
        {task.title}
      </span>
      {hasScout && !isComplete && (
        <button
          onClick={() => window.location.href = '/#/cliff-scout'}
          className="shrink-0 flex items-center gap-1 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1 hover:bg-blue-100 transition-colors"
          style={{ minHeight: 'auto', minWidth: 'auto', cursor: 'pointer' }}
        >
          <Zap className="w-3 h-3" />
          Scout
        </button>
      )}
    </div>
  );
}

export default function DynamicActionPlan({ user }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.ActionPlan.filter({ student_email: user.email })
      .then(results => {
        if (results && results.length > 0) setPlan(results[0]);
      })
      .finally(() => setLoading(false));
  }, [user?.email]);

  const toggleTask = async (taskId, markComplete) => {
    if (!plan) return;
    const updated = plan.milestones.map(m =>
      m.id === taskId
        ? { ...m, status: markComplete ? 'complete' : 'pending', completed_at: markComplete ? new Date().toISOString() : '' }
        : m
    );
    setPlan(prev => ({ ...prev, milestones: updated }));
    await base44.entities.ActionPlan.update(plan.id, { milestones: updated });
  };

  const total = plan?.milestones?.length || 0;
  const done = plan?.milestones?.filter(m => m.status === 'complete').length || 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  // Group by phase
  const phases = {};
  (plan?.milestones || []).forEach(m => {
    const ph = m.phase || 'General';
    if (!phases[ph]) phases[ph] = [];
    phases[ph].push(m);
  });

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/2 mb-3" />
        <div className="h-3 bg-slate-100 rounded w-full mb-2" />
        <div className="h-3 bg-slate-100 rounded w-3/4" />
      </div>
    );
  }

  if (!plan || total === 0) {
    const goals = user?.career_goals || {};
    const firstName = user?.full_name?.split(' ')[0] || null;
    const targetRoles = goals.target_roles?.slice(0, 2).join(' or ') || 'your target role';
    const major = user?.major || 'your major';
    const school = user?.school_name || user?.school || 'your school';
    const gradYear = user?.graduation_year;
    const timeline = gradYear ? `Class of ${gradYear}` : null;

    const SEEKING_LABELS = {
      internship: 'Internship',
      fulltime: 'Full-time job',
      both: 'Internships & full-time',
      exploring: 'Exploring options',
    };
    const lsSeeking = (() => { try { return localStorage.getItem('cff_seeking') || ''; } catch { return ''; } })();
    const seeking = user?.seeking || goals.seeking || lsSeeking;
    const seekingLabel = SEEKING_LABELS[seeking] || null;

    // Map blocker keys to human-readable frustrations
    const BLOCKER_LABELS = {
      resume: "your resume isn't getting responses",
      ghosted: "you're getting ghosted after applying",
      no_direction: "you're not sure what direction to take yet",
      which_jobs: "you don't know which jobs to apply for",
      outreach: "you don't know how to reach the right people",
      disorganized: "you're losing track of everything",
      interviews: "interviewing makes you nervous",
    };
    // Also check localStorage for users who onboarded before career_blockers was saved to the profile
    const lsBlockers = (() => { try { return JSON.parse(localStorage.getItem('cff_blockers') || '[]'); } catch { return []; } })();
    const rawBlockers = (user?.career_blockers?.length ? user.career_blockers : null) || goals.blockers || lsBlockers || [];
    const blockerLines = rawBlockers.slice(0, 2).map(k => BLOCKER_LABELS[k]).filter(Boolean);

    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Personalized hook header */}
        <div className="px-5 pt-5 pb-4" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-white/80" />
            <p className="text-xs font-semibold text-white/80 uppercase tracking-wide">Action Plan Architect</p>
          </div>
          <p className="text-white font-bold text-sm leading-snug">
            Hey{firstName ? ` ${firstName}` : ''}! I've synced your profile. Here's what I'm tracking:
          </p>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-xs">🏫</span>
              <span className="text-white/90 text-xs font-medium">{school}</span>
              {timeline && <span className="text-white/60 text-xs">· {timeline}</span>}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-xs">📚</span>
              <span className="text-white/90 text-xs font-medium">{major}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-xs">🎯</span>
              <span className="text-white/90 text-xs font-medium">{targetRoles}</span>
            </div>
            {seekingLabel && (
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-xs">🔍</span>
                <span className="text-white/90 text-xs font-medium">{seekingLabel}</span>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          {blockerLines.length > 0 ? (
            <p className="text-sm text-slate-600 leading-relaxed">
              I can see {blockerLines.length === 1
                ? blockerLines[0]
                : `${blockerLines[0]} and ${blockerLines[1]}`
              }{seekingLabel ? ` — and you're hunting for a ${seekingLabel.toLowerCase()}` : ''}. That's exactly what this plan is built to fix. Tap below and I'll unlock your custom roadmap.
            </p>
          ) : (
            <p className="text-sm text-slate-600 leading-relaxed">
              {firstName ? `${firstName}, you're` : "You're"} looking for {seekingLabel ? `a ${seekingLabel.toLowerCase()}` : 'your next opportunity'} and the traditional job hunt is a black hole. Tap below and I'll architect a step-by-step roadmap to get you in front of the right people.
            </p>
          )}
          <button
            onClick={() => { window.location.hash = '/action-plan-architect'; }}
            className="mt-4 w-full text-sm font-bold text-white px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', minHeight: 'auto', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}
          >
            <Sparkles className="w-4 h-4" />
            ✨ Generate My Action Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <p className="font-bold text-slate-900 text-sm">Your Personalized Action Plan</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'linear-gradient(135deg, #ede9fe, #f0f9ff)', color: '#6d28d9', border: '1px solid #c4b5fd' }}>
              🪄 Live Strategy
            </span>
          </div>
          <a
            href="/#/action-plan-architect"
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-0.5 shrink-0"
            style={{ minHeight: 'auto' }}
          >
            Rebuild <ChevronRight className="w-3 h-3" />
          </a>
        </div>
        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-indigo-600 shrink-0">{pct}% Completed</span>
        </div>
      </div>

      {/* Tasks by phase */}
      <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
        {Object.entries(phases).map(([phase, tasks]) => (
          <div key={phase}>
            <div className="px-4 pt-3 pb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PHASE_COLORS[phase] || PHASE_COLORS['General']}`}>
                {phase}
              </span>
            </div>
            {tasks.map(task => (
              <TaskRow key={task.id} task={task} onToggle={toggleTask} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}