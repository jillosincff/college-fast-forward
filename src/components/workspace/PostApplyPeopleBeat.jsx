import { useState } from 'react';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// Post-apply success beat. After a student marks a role as applied, offer to
// surface people at THAT company — never auto-search, never a job board.
//
// On "Yes" it hands off to BestAdvantageCard (the single, authoritative people
// panel in the workspace) and renders nothing itself. This is deliberate: two
// people panels with two different backends used to stack and contradict each
// other (e.g. "None found yet — I'll keep looking" here while BestAdvantageCard
// showed "🔥 Best Path …"). One panel, one source of truth.
export default function PostApplyPeopleBeat({ company, onOptIn }) {
  const [choice, setChoice] = useState('ask'); // 'ask' | 'handoff' | 'dismissed'

  if (choice === 'handoff') return null;

  if (choice === 'dismissed') {
    return (
      <div style={{ marginTop: 14, textAlign: 'center' }}>
        <button onClick={() => { window.location.hash = '#/FreeTierDashboard'; }} style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto' }}>
          Find more opportunities →
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 14, background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 12, padding: '16px 16px' }}>
      <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
        Got it — we'll track this in Application History.
      </p>
      <p style={{ fontFamily: dm, fontSize: 13, color: '#4c1d95', margin: '0 0 12px', lineHeight: 1.5 }}>
        You have a better chance of getting hired through someone you know. Want CLIFF to look for alumni or parents at {company}?
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => { onOptIn?.(); setChoice('handoff'); }} style={yesBtn}>Yes — look for people</button>
        <button onClick={() => setChoice('dismissed')} style={noBtn}>No</button>
      </div>
    </div>
  );
}

const yesBtn = { flex: 1, fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 999, padding: '12px 16px', cursor: 'pointer', minHeight: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5 };
const noBtn = { fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#6b7280', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 999, padding: '12px 16px', cursor: 'pointer', minHeight: 'auto' };