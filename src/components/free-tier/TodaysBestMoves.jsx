import { useState, useEffect } from 'react';
import { loadBestMoves, completeMove, runMoveAction, readMovesCache, MOVES_UPDATED } from '@/lib/bestMoves';
import MissionDraftModal from './MissionDraftModal';
import { ListChecks, ArrowRight, Clock, Check } from 'lucide-react';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// Today's plan: the SHORT backup queue behind the Next Move hero.
// The hero owns the #1 action — this block only ever shows what comes after it,
// so the two never disagree. Max 2 rows, each with a real target and one button.
export default function TodaysBestMoves({ user, onShowMoreJobs }) {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draftTask, setDraftTask] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    let cancelled = false;
    loadBestMoves(user.email)
      .then(s => { if (!cancelled) setState(s); })
      .catch(() => { if (!cancelled) setState({ moves: [], done: [] }); })
      .finally(() => { if (!cancelled) setLoading(false); });
    // The hero and this list share one cache — when the hero advances, re-read it
    const sync = () => { const c = readMovesCache(user.email); if (c && !cancelled) setState(c); };
    window.addEventListener(MOVES_UPDATED, sync);
    return () => { cancelled = true; window.removeEventListener(MOVES_UPDATED, sync); };
  }, [user?.email]);

  const markDone = (i, sentViaModal = false) => setState(completeMove(user.email, state, i, { sentViaModal }));

  const go = (m, i) => {
    if (runMoveAction(m) === 'followup') { setDraftTask({ ...m.action, kind: 'followup', index: i }); return; }
    markDone(i);
  };

  if (loading) return null;

  const moves = state?.moves || [];
  const done = state?.done || [];
  // The hero renders the first not-yet-done move. The plan starts after it.
  const heroIdx = moves.findIndex((_, i) => !done[i]);
  const backups = moves
    .map((m, i) => ({ m, i }))
    .filter(({ i }) => !done[i] && i !== heroIdx)
    .slice(0, 2);

  // Nothing urgent behind the hero: say so plainly, never invent filler.
  if (backups.length === 0) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <ListChecks size={15} color="#7c3aed" />
          <h3 style={{ fontFamily: dm, fontSize: 14, fontWeight: 900, color: '#111827', margin: 0 }}>Today's plan</h3>
        </div>
        <p style={{ fontFamily: dm, fontSize: 13, color: '#4b5563', margin: 0, lineHeight: 1.5 }}>
          You're clear for now — new roles land with the next drop.
        </p>
        {onShowMoreJobs && (
          <button onClick={onShowMoreJobs}
            style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: '10px 0 0', minHeight: 'auto', textDecoration: 'underline', display: 'block' }}>
            Pick a role from opportunities
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <ListChecks size={15} color="#7c3aed" />
        <h3 style={{ fontFamily: dm, fontSize: 14, fontWeight: 900, color: '#111827', margin: 0 }}>Today's plan</h3>
      </div>
      <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: '0 0 12px' }}>
        After your next move, these are up.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {backups.map(({ m, i }) => (
          <div key={i} style={{ background: '#f8f9fc', border: '1px solid #eef0f5', borderRadius: 12, padding: '12px 14px' }}>
            <p style={{ fontFamily: dm, fontSize: 13.5, fontWeight: 800, color: '#111827', margin: '0 0 8px', lineHeight: 1.35, wordBreak: 'break-word' }}>
              {m.title}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
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
                  {m.action_label || 'Continue'} <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {draftTask && (
        <MissionDraftModal
          task={draftTask}
          user={user}
          onClose={() => setDraftTask(null)}
          onSent={() => { markDone(draftTask.index, true); setDraftTask(null); }}
        />
      )}
    </div>
  );
}