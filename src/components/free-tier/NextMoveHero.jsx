import { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Clock, Check } from 'lucide-react';
import { loadBestMoves, completeMove, runMoveAction } from '@/lib/bestMoves';
import { base44 } from '@/api/base44Client';
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
  const [justDone, setJustDone] = useState(false);

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

  // Defensive: a move title must always name its target. If the backend ever
  // returns a dangling title ("Apply to " / "Follow up with " with no company)
  // or an empty title, never render the broken hero — fall back to a neutral
  // "pick your next role" card that points at the opportunities below.
  const BROKEN_TAIL = /^(apply to|follow up with|start your|finish your)\s*$/i;
  const titleBroken = !move || !move.title || !move.title.trim() || BROKEN_TAIL.test(move.title.trim());
  const showFallback = !!move && titleBroken;

  const markDone = (i, sentViaModal = false) => {
    const next = completeMove(user.email, state, i, { sentViaModal });
    setState(next);
    setWhyOpen(false);
    setJustDone(true);
    setTimeout(() => setJustDone(false), 1600);
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

  if (!move || showFallback) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)',
        borderRadius: 20, padding: 'clamp(20px, 4vw, 28px)', marginBottom: 16,
        boxShadow: '0 8px 28px rgba(76,29,149,0.28)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
          <Sparkles size={14} color="#c4b5fd" />
          <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 900, color: '#c4b5fd', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {greeting()}{firstName ? `, ${firstName}` : ''} · Your next move
          </span>
        </div>
        <h2 style={{ fontFamily: dm, fontSize: 'clamp(21px, 5vw, 28px)', fontWeight: 900, color: '#fff', margin: '0 0 10px', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
          Pick your next role
        </h2>
        <p style={{ fontFamily: dm, fontSize: 14, color: 'rgba(255,255,255,0.82)', margin: '0 0 16px', lineHeight: 1.55 }}>
          CLIFF has opportunities ready below — I'll line up the strongest fit and your next move as soon as you pick one.
        </p>
        <button
          onClick={() => {
            try { base44.analytics.track({ eventName: 'next_move_fallback_clicked' }); } catch {}
            const el = document.getElementById('cff-daily-feed');
            if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
            else { window.dispatchEvent(new CustomEvent('cff:focus-opportunities')); }
          }}
          style={{ fontFamily: dm, fontSize: 15, fontWeight: 900, color: '#4c1d95', background: '#fff', border: 'none', borderRadius: 999, padding: '13px 26px', cursor: 'pointer', minHeight: 'auto', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          See today's opportunities <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)',
      borderRadius: 20, padding: 'clamp(20px, 4vw, 28px)', marginBottom: 16,
      boxShadow: '0 8px 28px rgba(76,29,149,0.28)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
        <Sparkles size={14} color="#c4b5fd" />
        <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 900, color: '#c4b5fd', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {greeting()}{firstName ? `, ${firstName}` : ''} · Your next move
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
          style={{
            fontFamily: dm, fontSize: 13, fontWeight: 700,
            color: justDone ? '#065f46' : 'rgba(255,255,255,0.85)',
            background: justDone ? '#a7f3d0' : 'transparent',
            border: justDone ? '1px solid #6ee7b7' : '1px solid rgba(255,255,255,0.3)',
            borderRadius: 999, padding: '12px 18px', cursor: 'pointer',
            minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 5,
            transition: 'all 0.25s ease',
          }}>
          <Check size={14} /> {justDone ? 'Nice — logged' : 'Did it'}
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
          onSent={() => { markDone(draftTask.index, true); setDraftTask(null); }}
        />
      )}
    </div>
  );
}