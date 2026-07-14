import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { buildCareerPlan } from '@/functions/buildCareerPlan';
import { getPlanOpportunities } from '@/functions/getPlanOpportunities';
import PlanOpportunityCard from './PlanOpportunityCard';
import { Sparkles, Check } from 'lucide-react';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

const EXAMPLES = ['Marketing internship', 'Finance internship in NYC', 'I want to work at Nike', 'Remote UX internship', "I don't know yet"];
const BUILD_STEPS = ['Building your plan…', 'Reading opportunities…', 'Filtering low-value jobs…', 'Ranking your best opportunities…', 'Checking your existing progress…'];

// Goal Search: students don't search for jobs — they tell CLIFF what they want.
// CLIFF interprets the goal, builds a CareerPlan, and returns 3 explained picks.
export default function GoalHero({ user }) {
  const [phase, setPhase] = useState('loading'); // loading | input | interpreting | building | plan
  const [goal, setGoal] = useState('');
  const [ack, setAck] = useState('');
  const [plan, setPlan] = useState(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [error, setError] = useState('');

  // Load the active plan — if opportunities already exist, show "Continue My Plan"
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

  // Cycle the planning steps while CLIFF works
  useEffect(() => {
    if (phase !== 'building') return;
    const t = setInterval(() => setStepIdx(i => Math.min(i + 1, BUILD_STEPS.length - 1)), 2600);
    return () => clearInterval(t);
  }, [phase]);

  const build = async (e) => {
    e?.preventDefault();
    const text = goal.trim();
    if (!text) return;
    setError('');
    setPhase('interpreting');
    try {
      const res = await buildCareerPlan({ goal: text });
      const data = res?.data || res;
      setAck(data.ack || 'Got it — building your plan.');
      setStepIdx(0);
      setPhase('building');
      const oppRes = await getPlanOpportunities({ planId: data.plan?.id });
      const oppData = oppRes?.data || oppRes;
      setPlan({ ...data.plan, opportunities: oppData.opportunities || [], skipped_note: oppData.skipped_note || '' });
      setPhase('plan');
    } catch {
      setError("I couldn't build your plan just now — try again in a moment.");
      setPhase('input');
    }
  };

  const changeGoal = () => { setGoal(''); setAck(''); setPhase('input'); };

  const shell = (children) => (
    <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 55%, #6d28d9 100%)', borderRadius: 20, padding: '24px 22px', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 32px rgba(109,40,217,0.25)', marginBottom: 20 }}>
      <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(167,139,250,0.25)', filter: 'blur(50px)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );

  if (phase === 'loading') return null;

  // ── Active plan: goal + 3 best opportunities ─────────────────────────
  if (phase === 'plan' && plan) {
    return shell(
      <>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#c4b5fd', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={13} /> Your Goal
          </p>
          <button onClick={changeGoal}
            style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', minWidth: 'auto', textDecoration: 'underline' }}>
            Change my goal
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

  // ── Input: "What are you trying to get?" ─────────────────────────────
  return shell(
    <>
      <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#c4b5fd', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Sparkles size={13} /> Tell CLIFF your goal
      </p>
      <h2 style={{ fontFamily: dm, fontSize: 21, fontWeight: 900, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.01em' }}>
        What are you trying to get?
      </h2>
      <form onSubmit={build}>
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
          Build My Plan
        </button>
      </form>
      {error && <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#fca5a5', margin: '10px 0 0' }}>{error}</p>}
    </>
  );
}