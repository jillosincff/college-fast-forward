import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getTodaysBestMoves } from '@/functions/getTodaysBestMoves';
import { openCliffWorkspace } from '@/lib/cliffWorkspace';
import MissionDraftModal from './MissionDraftModal';
import { Sparkles, ArrowRight, Clock, Check } from 'lucide-react';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";
const MEDALS = ['🥇', '🥈', '🥉'];

// The primary daily experience: CLIFF's ranked plan for today.
// Not a list of jobs — the 3 highest-leverage moves, each with a ready next action.
export default function TodaysBestMoves({ user, onShowMoreJobs }) {
  const [state, setState] = useState(null); // { moves, done: [bool] }
  const [loading, setLoading] = useState(true);
  const [draftTask, setDraftTask] = useState(null);
  const [whyOpen, setWhyOpen] = useState(null); // index of the move showing "Why this, not that?"
  const today = new Date().toISOString().slice(0, 10);
  const storageKey = `cliff_best_moves_v2_${user?.email}_${today}`;

  useEffect(() => {
    if (!user?.email) return;
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (saved?.moves) { setState(saved); setLoading(false); return; }
    } catch {}
    let cancelled = false;
    getTodaysBestMoves({})
      .then(res => {
        if (cancelled) return;
        const data = res?.data || res;
        const s = { moves: data?.moves || [], done: (data?.moves || []).map(() => false) };
        try { localStorage.setItem(storageKey, JSON.stringify(s)); } catch {}
        setState(s);
      })
      .catch(() => { if (!cancelled) setState({ moves: [], done: [] }); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?.email]);

  const save = (next) => {
    setState(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
  };

  const markDone = (i) => save({ ...state, done: state.done.map((d, j) => (j === i ? true : d)) });

  const go = (m, i) => {
    if (m.discoveryId) base44.entities.CliffDiscovery.update(m.discoveryId, { status: 'actioned' }).catch(() => {});
    const a = m.action || {};
    if (a.type === 'followup') { setDraftTask({ ...a, kind: 'followup', index: i }); return; }
    markDone(i);
    if (a.type === 'workspace') openCliffWorkspace({ company: a.company, role: a.role || '', jobUrl: a.jobUrl || '', location: a.location || '' });
    else if (a.route?.startsWith('#/')) {
      let route = a.route;
      // Keep Mission and Tracker synchronized: highlight the referenced application
      if (a.company && route.toLowerCase().includes('applicationtracker')) {
        route += (route.includes('?') ? '&' : '?') + 'highlight=' + encodeURIComponent(a.company);
      }
      window.location.hash = route;
    }
  };

  if (loading) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '24px 20px', textAlign: 'center' }}>
        <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#7c3aed', margin: 0 }}>Planning your day…</p>
      </div>
    );
  }

  const moves = state?.moves || [];
  const doneCount = (state?.done || []).filter(Boolean).length;
  const allComplete = moves.length > 0 && doneCount === moves.length;
  const nothingToday = moves.length === 0;

  return (
    <div style={{ background: '#fff', border: allComplete ? '1px solid #a7f3d0' : '1px solid #e5e7eb', borderRadius: 16, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={16} color="#7c3aed" />
          <h3 style={{ fontFamily: dm, fontSize: 15, fontWeight: 900, color: '#111827', margin: 0 }}>Today's Best Moves</h3>
        </div>
        {moves.length > 0 && (
          <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#6b7280' }}>{doneCount}/{moves.length} done</span>
        )}
      </div>

      {nothingToday || allComplete ? (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 12, padding: '20px 18px', textAlign: 'center', marginTop: 10 }}>
          <p style={{ fontFamily: dm, fontSize: 24, margin: '0 0 6px' }}>🎉</p>
          <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 900, color: '#065f46', margin: '0 0 4px' }}>You're done for today.</p>
          <p style={{ fontFamily: dm, fontSize: 12, color: '#047857', margin: 0, lineHeight: 1.5 }}>
            {allComplete ? 'That was the highest-leverage work available — no busywork needed. ' : 'Nothing important is waiting on you right now. '}
            I'll have fresh moves ready tomorrow morning.
          </p>
        </div>
      ) : (
        <>
          <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: '0 0 14px' }}>
            If you only have 20 minutes today, this is where they should go.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {moves.map((m, i) => {
              const done = state.done[i];
              return (
                <div key={i} style={{ background: done ? '#f0fdf4' : '#f8f9fc', border: done ? '1px solid #bbf7d0' : '1px solid #eef0f5', borderRadius: 14, padding: '14px 16px', opacity: done ? 0.7 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.3 }}>{MEDALS[i]}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 900, color: done ? '#6b7280' : '#111827', margin: '0 0 6px', textDecoration: done ? 'line-through' : 'none', wordBreak: 'break-word' }}>{m.title}</p>
                      {!done && (m.reasons || []).map((r, j) => (
                        <p key={j} style={{ fontFamily: dm, fontSize: 12, color: '#4b5563', margin: '0 0 3px', lineHeight: 1.45 }}>· {r}</p>
                      ))}
                      {!done && i === 0 && (
                        <p style={{ fontFamily: dm, fontSize: 11, fontStyle: 'italic', color: '#7c3aed', margin: '6px 0 0' }}>I think this is your best use of time today.</p>
                      )}
                      {!done && m.why_not?.length > 0 && (
                        <>
                          <button onClick={() => setWhyOpen(whyOpen === i ? null : i)}
                            style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 8, minHeight: 'auto', minWidth: 'auto', textDecoration: 'underline', display: 'block' }}>
                            {whyOpen === i ? 'Hide' : 'Why this, not something else?'}
                          </button>
                          {whyOpen === i && (
                            <div style={{ background: '#f5f3ff', border: '1px solid #ede9fe', borderRadius: 10, padding: '10px 12px', marginTop: 6 }}>
                              {m.why_not.map((w, j) => (
                                <p key={j} style={{ fontFamily: dm, fontSize: 12, color: '#4c1d95', margin: j === 0 ? 0 : '6px 0 0', lineHeight: 1.5 }}>{w}</p>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  {!done && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingLeft: 28 }}>
                      <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={11} /> {m.time}
                      </span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => markDone(i)} aria-label="Mark done"
                          style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#6b7280', background: 'none', border: '1px solid #e5e7eb', borderRadius: 999, padding: '7px 12px', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Check size={12} /> Did it
                        </button>
                        <button onClick={() => go(m, i)}
                          style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 999, padding: '7px 16px', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                          {m.action_label || 'Go'} <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Escape hatch — secondary by design; the primary experience is trusting CLIFF */}
      {onShowMoreJobs && (
        <button onClick={onShowMoreJobs}
          style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: '10px 0 0', minHeight: 'auto', textDecoration: 'underline', display: 'block', margin: '4px auto 0' }}>
          Show me more jobs
        </button>
      )}

      {draftTask && (
        <MissionDraftModal
          task={draftTask}
          user={user}
          onClose={() => setDraftTask(null)}
          onSent={() => { markDone(draftTask.index); setDraftTask(null); }}
        />
      )}
    </div>
  );
}