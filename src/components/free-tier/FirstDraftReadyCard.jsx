import { useState } from 'react';
import useAlumniTeaser from '@/hooks/useAlumniTeaser';

const dm = "'DM Sans', system-ui, sans-serif";

// Zeigarnik onboarding close — shows once after onboarding completes,
// framed as an unfinished artifact CliFF already started. Only renders
// when a REAL alumni match exists (shares the cached teaser fetch).
export default function FirstDraftReadyCard({ theme, onOpen }) {
  const match = useAlumniTeaser();
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem('cff_first_draft_pending') !== 'true'; } catch { return true; }
  });

  if (dismissed || !match?.found) return null;

  const clear = () => {
    try { localStorage.removeItem('cff_first_draft_pending'); } catch {}
    setDismissed(true);
  };

  const primary = theme?.primary || '#4F46E5';

  return (
    <div style={{
      background: 'linear-gradient(135deg, #fffbeb 0%, #fff 60%)',
      border: '1.5px solid #fcd34d', borderRadius: 16, padding: '18px 20px',
      display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
      boxShadow: '0 4px 16px rgba(245,158,11,0.10)', position: 'relative',
    }}>
      <button onClick={clear} aria-label="Dismiss" style={{ position: 'absolute', top: 8, right: 12, background: 'none', border: 'none', color: '#9ca3af', fontSize: 16, cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', padding: 4, width: 'auto' }}>✕</button>

      <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>✍️</div>

      <div style={{ flex: 1, minWidth: 220 }}>
        <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, color: '#b45309', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 3px' }}>
          1 unfinished draft
        </p>
        <p style={{ fontFamily: dm, fontSize: 14.5, fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>
          CliFF already started your first outreach message
        </p>
        <p style={{ fontFamily: dm, fontSize: 12.5, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
          Drafted for the <strong style={{ color: '#374151' }}>{match.role_title}</strong> at <strong style={{ color: '#374151' }}>{match.company}</strong> — it's waiting for you to review and send.
        </p>
      </div>

      <button
        onClick={() => { clear(); onOpen?.(); }}
        style={{
          fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#fff',
          background: primary, border: 'none', borderRadius: 10,
          padding: '11px 22px', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', width: 'auto',
          boxShadow: `0 4px 12px ${primary}40`, whiteSpace: 'nowrap', flexShrink: 0,
        }}
      >
        Open My Draft →
      </button>
    </div>
  );
}