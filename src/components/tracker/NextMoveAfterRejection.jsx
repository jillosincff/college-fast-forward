import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { loadBestMoves, runMoveAction } from '@/lib/bestMoves';

// A rejection should never be a dead end — CLIFF immediately points at the
// next best thing to do instead.
export default function NextMoveAfterRejection({ user }) {
  const [move, setMove] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    loadBestMoves(user.email)
      .then(state => setMove((state.moves || []).find((_, i) => !state.done?.[i]) || null))
      .catch(() => {});
  }, [user?.email]);

  if (!move) return null;

  const go = () => {
    if (runMoveAction(move) === 'followup') window.location.hash = '#/ApplicationTracker';
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', borderRadius: 14, padding: '18px 20px', marginBottom: 20 }}>
      <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.7)', margin: '0 0 6px' }}>
        That one's closed — here's your next move
      </p>
      <p style={{ fontSize: 16, fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>{move.title}</p>
      {move.reasons?.[0] && (
        <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.85)', margin: '0 0 14px', lineHeight: 1.5 }}>{move.reasons[0]}</p>
      )}
      <button
        onClick={go}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#fff', color: '#5b21b6', border: 'none', borderRadius: 999, padding: '11px 20px', fontSize: 13.5, fontWeight: 900, cursor: 'pointer', minHeight: 'auto' }}
      >
        {move.action_label || 'Continue'} <ArrowRight size={15} />
      </button>
    </div>
  );
}