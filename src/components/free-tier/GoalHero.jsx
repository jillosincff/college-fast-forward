import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { buildCareerPlan } from '@/functions/buildCareerPlan';
import { getPlanOpportunities } from '@/functions/getPlanOpportunities';
import { routeGoal } from '@/functions/routeGoal';
import { openCliffWorkspace } from '@/lib/cliffWorkspace';
import PlanOpportunityCard from './PlanOpportunityCard';
import { Sparkles, Check } from 'lucide-react';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

const EXAMPLES = ['Find me a marketing internship in South Florida', 'Prepare me for my Nike interview', "I haven't heard back from Deloitte", 'I want to work in sports', 'Show me what I should focus on'];
const BUILD_STEPS = ['Building your plan…', 'Reading opportunities…', 'Filtering low-value jobs…', 'Ranking your best opportunities…', 'Checking your existing progress…'];

const timeGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

// CLIFF OS home: one question, one input, one CTA. The student states the goal
// in any form — CLIFF classifies the intent and runs the right workflow.
export default function GoalHero({ user }) {
  const [phase, setPhase] = useState('loading'); // loading | input | interpreting | building | plan
  const [goal, setGoal] = useState('');
  const [ack, setAck] = useState('');
  const [plan, setPlan] = useState(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [error, setError] = useState('');
  const [showInput, setShowInput] = useState(false); // ask a new goal even when a plan exists

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.CareerPlan.filter({ user_email: user.email, status: 'active' }, '-created_date', 1)
      .then(plans => {
        const p = plans?.[0];
        if (p?.opportunities?.length) { setPlan(p); setPhase('plan'); }
        else setPhase('input');
      })
      .catch(() => setPhase('input'));
  }, [user?.email]);

  useEffect(() => {
    if (phase !== 'building') return;
    const t = setInterval(() => setStepIdx(i => Math.min(i + 1, BUILD_STEPS.length - 1)), 2600);
    return () => clearInterval(t);
  }, [phase]);

  const runPlanFlow = async (text) => {
    const res = await buildCareerPlan({ goal: text });
    const data = res?.data || res;
    setAck(data.ack || 'Got it — building your plan.');
    setStepIdx(0);
    setPhase('building');
    const oppRes = await getPlanOpportunities({ planId: data.plan?.id });
    const oppData = oppRes?.data || oppRes;
    setPlan({ ...data.plan, opportunities: oppData.opportunities || [], skipped_note: oppData.skipped_note || '' });
    setShowInput(false);
    setPhase('plan');
  };

  const submit = async (e) => {
    e?.preventDefault();
    const text = goal.trim();
    if (!text) return;
    try { base44.analytics.track({ eventName: 'goal_input_submitted' }); } catch {}
    setError('');
    setAck('');
    setPhase('interpreting');
    try {
      const res = await routeGoal({ goal: text });
      const r = res?.data || res;
      if (r.intent === 'found_job' && (r.company || r.job_url)) {
        setAck(r.ack);
        setTimeout(() => openCliffWorkspace({ company: r.company, role: r.role || '', jobUrl: r.job_url || '' }), 1200);
        return;
      }
      if (r.intent === 'interview_prep') {
        setAck(r.ack);
        setTimeout(() => { window.location.hash = '#/MockInterview'; }, 1200);
        return;
      }
      if (r.intent === 'no_response') {
        setAck(r.ack);
        setTimeout(() => { window.location.hash = '#/ApplicationTracker'; }, 1200);
        return;
      }
      // new_goal / find_better → build (or rebuild) the plan
      await runPlanFlow(text);
    } catch {
      setError("I couldn't work on that just now — try again in a moment.");
      setPhase('input');
    }
  };

  const changeGoal = () => { setGoal(''); setAck(''); setShowInput(true); setPhase('input'); };

  const shell = (children) => (
    <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 55%, #6d28d9 100%)', borderRadius: 20, padding: '24px 22px', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 32px rgba(109,40,217,0.25)', marginBottom: 16 }}>
      <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(167,139,250,0.25)', filter: 'blur(50px)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );

  if (phase === 'loading') return null;

  // ── Active plan: goal + 3 best opportunities ─────────────────────────
  if (phase === 'plan' && plan && !showInput) {
    return shell(
      <>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#c4b5fd', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={13} /> Your Goal
          </p>
          <button onClick={changeGoal}
            style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', minWidth: 'auto', textDecoration: 'underline' }}>
            New goal
          </button>
        </div>
        <h2 style={{ fontFamily: dm, fontSize: 19, fontWeight: 900, color: '#fff', margin: '0 0 14px', letterSpacing: '-0.01em' }}>{plan.goal_summary}</h2>
        <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#c4b5fd', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your 3 Best Opportunities</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {plan.opportunities.map((opp, i) => <PlanOpportunityCard key={i} opp={opp} />)}
        </div>
        {plan.skipped_note && (
          <p style={{ fontFamily: dm, fontSize: 12, fontStyle: 'italic', color: 'rgba(255,255,255,0.75)', margin: '12px 0 0', lineHeight: 1.55 }}>
            {plan.skipped_note}
          </p>
        )}
      </>
    );
  }

  // ── CLIFF working: conversational ack + planning steps ───────────────
  if (phase === 'interpreting' || phase === 'building') {
    return shell(
      <>
        {ack && <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 800, color: '#fff', margin: '0 0 14px', lineHeight: 1.5 }}>{ack}</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(phase === 'interpreting' ? ['Understanding your goal…'] : BUILD_STEPS.slice(0, stepIdx + 1)).map((s, i, arr) => (
            <p key={s} style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: i === arr.length - 1 ? '#c4b5fd' : 'rgba(255,255,255,0.55)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              {i === arr.length - 1
                ? <span style={{ width: 12, height: 12, border: '2px solid rgba(196,181,253,0.35)', borderTop: '2px solid #c4b5fd', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                : <Check size={13} color="#4ade80" />}
              {s}
            </p>
          ))}
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </>
    );
  }

  // ── Home: greeting + one question ────────────────────────────────────
  return shell(
    <>
      <h2 style={{ fontFamily: dm, fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.01em' }}>
        What's our goal today?
      </h2>
      <form onSubmit={submit}>
        <textarea
          value={goal}
          onChange={e => setGoal(e.target.value)}
          placeholder="Describe your goal..."
          rows={2}
          style={{ width: '100%', background: 'rgba(255,255,255,0.97)', border: 'none', borderRadius: 12, padding: '13px 16px', fontFamily: dm, fontSize: 14, color: '#111827', outline: 'none', resize: 'none', marginBottom: 10 }}
        />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {EXAMPLES.map(ex => (
            <button key={ex} type="button" onClick={() => setGoal(ex)}
              style={{ fontFamily: dm, fontSize: 11.5, fontWeight: 700, color: 'rgba(255,255,255,0.85)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, padding: '6px 12px', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto' }}>
              {ex}
            </button>
          ))}
        </div>
        <button type="submit" disabled={!goal.trim()}
          style={{ width: '100%', background: goal.trim() ? 'linear-gradient(135deg, #f59e0b, #f97316)' : 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontFamily: dm, fontSize: 15, fontWeight: 900, cursor: goal.trim() ? 'pointer' : 'default', boxShadow: goal.trim() ? '0 6px 18px rgba(249,115,22,0.4)' : 'none', minHeight: 48 }}>
          Let's Go
        </button>
      </form>
      {ack && <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#c4b5fd', margin: '10px 0 0' }}>{ack}</p>}
      {error && <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#fca5a5', margin: '10px 0 0' }}>{error}</p>}
      {plan && showInput && (
        <button onClick={() => { setShowInput(false); setPhase('plan'); }}
          style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', minWidth: 'auto', textDecoration: 'underline', marginTop: 10 }}>
          ← Back to my current plan
        </button>
      )}
    </>
  );
}