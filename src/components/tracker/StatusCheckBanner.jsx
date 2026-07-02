import { useState } from 'react';

const dm = "'DM Sans', system-ui, sans-serif";

const OPTIONS = [
  { key: 'in_review', label: "Yes — I'm in review", color: '#3B82F6' },
  { key: 'interviewing', label: 'Interview scheduled!', color: '#8B5CF6' },
  { key: 'rejected', label: 'Rejected', color: '#EF4444' },
];

// Surfaces one stale "Applied" application (7+ days old) and asks the student
// if they've heard back — one tap updates the status.
export default function StatusCheckBanner({ applications, onRespond }) {
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('cff_status_checks') || '[]'); } catch { return []; }
  });
  const [saving, setSaving] = useState(false);

  const stale = applications.find(a =>
    a.status === 'applied' &&
    !dismissed.includes(a.id) &&
    (Date.now() - new Date(a.dateApplied).getTime()) / 86400000 >= 7
  );
  if (!stale) return null;

  const dismiss = () => {
    const next = [...dismissed, stale.id];
    setDismissed(next);
    try { sessionStorage.setItem('cff_status_checks', JSON.stringify(next)); } catch {}
  };

  const pick = async (key) => {
    setSaving(true);
    try { await onRespond(stale, key); } finally { setSaving(false); dismiss(); }
  };

  return (
    <div style={{
      background: '#FFF9F5', border: '1.5px solid #F5D5C0', borderRadius: 12,
      padding: '16px 18px', marginBottom: 20,
    }}>
      <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' }}>
        Did you hear back from {stale.company}?
      </p>
      <p style={{ fontFamily: dm, fontSize: 12, color: '#888', margin: '0 0 12px' }}>
        You applied to {stale.jobTitle} on {new Date(stale.dateApplied).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — keeping this updated makes your stats accurate.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {OPTIONS.map(opt => (
          <button
            key={opt.key}
            disabled={saving}
            onClick={() => pick(opt.key)}
            style={{
              fontFamily: dm, fontSize: 12, fontWeight: 600, color: opt.color,
              background: '#fff', border: `1.5px solid ${opt.color}44`, borderRadius: 100,
              padding: '7px 14px', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto',
              opacity: saving ? 0.5 : 1,
            }}
          >
            {opt.label}
          </button>
        ))}
        <button
          disabled={saving}
          onClick={dismiss}
          style={{
            fontFamily: dm, fontSize: 12, fontWeight: 600, color: '#888',
            background: 'none', border: 'none', padding: '7px 10px',
            cursor: 'pointer', minHeight: 'auto', minWidth: 'auto',
          }}
        >
          Not yet
        </button>
      </div>
    </div>
  );
}