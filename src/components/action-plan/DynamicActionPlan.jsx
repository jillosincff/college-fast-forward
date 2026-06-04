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
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-bold text-slate-900 text-sm">No Action Plan Yet</p>
          <p className="text-xs text-slate-500 mt-1">Chat with the Action Plan Architect to get a custom roadmap built for you in 60 seconds.</p>
        </div>
        <a
          href="/#/action-plan-architect"
          className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
          style={{ minHeight: 'auto' }}
        >
          Build My Plan <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <p className="font-bold text-slate-900 text-sm">Your Personalized Action Plan</p>
          </div>
          <a
            href="/#/action-plan-architect"
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-0.5"
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
          <span className="text-xs font-semibold text-slate-500 shrink-0">{done}/{total}</span>
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