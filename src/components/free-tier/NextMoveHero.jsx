import { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Clock, Check } from 'lucide-react';
import { loadBestMoves, writeMovesCache, runMoveAction } from '@/lib/bestMoves';
import MissionDraftModal from './MissionDraftModal';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// The single most important thing on the dashboard: CLIFF's #1 move right now,
// with the reasoning visible. If a student does only one thing, it's this.
const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

export default function NextMoveHero({ user, firstName }) {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draftTask, setDraftTask] = useState(null);
  const [whyOpen, setWhyOpen] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    let cancelled = false;
    loadBestMoves(user.email)
      .then(s => { if (!cancelled) setState(s); })
      .catch(() => { if (!cancelled) setState({ moves: [], done: [] }); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?.email]);

  const moves = state?.moves || [];
  const doneFlags = state?.done || [];
  const idx = moves.findIndex((_, i) => !doneFlags[i]);
  const move = idx >= 0 ? moves[idx] : null;
  const remaining = doneFlags.filter((d, i) => !d && i !== idx).length;

  const markDone = (i) => {
    const next = { ...state, done: doneFlags.map((d, j) => (j === i ? true : d)) };
    setState(next);
    writeMovesCache(user.email, next);
    setWhyOpen(false);
  };

  const go = () => {
    if (runMoveAction(move) === 'followup') setDraftTask({ ...move.action, kind: 'followup', index: idx });
    else markDone(idx);
  };

  if (loading) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, padding: '28px 20px', textAlign: 'center', marginBottom: 16 }}>
        <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#7c3aed', margin: 0 }}>Working out your next move…</p>
      </div>
    );
  }

  if (!move) {
    return (
      <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 20, padding: '26px 22px', textAlign: 'center', marginBottom: 16 }}>
        <p style={{ fontSize: 26, margin: '0 0 6px' }}>🎉</p>
        <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#047857', margin: '0 0 6px' }}>
          {greeting()}{firstName ? `, ${firstName}` : ''}.
        </p>
        <p style={{ fontFamily: dm, fontSize: 17, fontWeight: 900, color: '#065f46', margin: '0 0 4px' }}>You're done for today.</p>
        <p style={{ fontFamily: dm, fontSize: 13, color: '#047857', margin: 0, lineHeight: 1.55 }}>
          That was the highest-leverage work available — no busywork needed. I'll have your next move ready tomorrow.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)',
      borderRadius: 20, padding: 'clamp(20px, 4vw, 28px)', marginBottom: 16,
      boxShadow: '0 8px 28px rgba(76,29,149,0.28)',
    }}>
      <p style={{ fontFamily: dm, fontSize: 13.5, fontWeight: 800, color: 'rgba(255,255,255,0.75)', margin: '0 0 8px' }}>
        {greeting()}{firstName ? `, ${firstName}` : ''}. Here's where I'd start.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
        <Sparkles size={14} color="#c4b5fd" />
        <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 900, color: '#c4b5fd', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Your next move
        </span>
      </div>

      <h2 style={{ fontFamily: dm, fontSize: 'clamp(21px, 5vw, 28px)', fontWeight: 900, color: '#fff', margin: '0 0 12px', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
        {move.title}
      </h2>

      {(move.reasons || []).map((r, j) => (
        <p key={j} style={{ fontFamily: dm, fontSize: 14, color: 'rgba(255,255,255,0.82)', margin: '0 0 5px', lineHeight: 1.5 }}>
          · {r}
        </p>
      ))}

      {move.why_not?.length > 0 && (
        <>
          <button onClick={() => setWhyOpen(!whyOpen)}
            style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#c4b5fd', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 10, minHeight: 'auto', minWidth: 'auto', textDecoration: 'underline', display: 'block' }}>
            {whyOpen ? 'Hide' : 'Why this, not something else?'}
          </button>
          {whyOpen && (
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 14px', marginTop: 8 }}>
              {move.why_not.map((w, j) => (
                <p key={j} style={{ fontFamily: dm, fontSize: 13, color: 'rgba(255,255,255,0.88)', margin: j === 0 ? 0 : '7px 0 0', lineHeight: 1.5 }}>{w}</p>
              ))}
            </div>
          )}
        </>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
        <button onClick={go}
          style={{ fontFamily: dm, fontSize: 15, fontWeight: 900, color: '#4c1d95', background: '#fff', border: 'none', borderRadius: 999, padding: '13px 26px', cursor: 'pointer', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 7 }}>
          {move.action_label || 'Go'} <ArrowRight size={16} />
        </button>
        <button onClick={() => markDone(idx)}
          style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.85)', background: 'none', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 999, padding: '12px 18px', cursor: 'pointer', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Check size={14} /> Did it
        </button>
        <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={12} /> {move.time}
        </span>
      </div>

      {remaining > 0 && (
        <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', margin: '14px 0 0' }}>
          {remaining} more move{remaining === 1 ? '' : 's'} after this — I'll surface them one at a time.
        </p>
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