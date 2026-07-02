import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import { ListChecks, ArrowRight } from 'lucide-react';

const dm = "'DM Sans', system-ui, sans-serif";
const todayKey = () => `cff_today_actions_${new Date().toISOString().slice(0, 10)}`;

// "Today's 3 actions" — a small daily digest computed from the student's real pipeline.
export default function TodaysActionsCard({ user }) {
  const [actions, setActions] = useState(null);
  const [hidden, setHidden] = useState(() => {
    try { return localStorage.getItem(todayKey()) === '1'; } catch { return false; }
  });

  useEffect(() => {
    if (!user?.email || hidden) return;
    let cancelled = false;
    base44.entities.NetworkingPipeline.filter({ user_email: user.email }, '-created_date', 100)
      .then(records => {
        if (cancelled) return;
        const now = Date.now();
        const daysSince = r => (now - new Date(r.status_date || r.created_date).getTime()) / 86400000;
        const list = [];

        const needsFollowUp = records.find(r => ['reached_out', 'messaged'].includes(r.status) && daysSince(r) >= 5);
        if (needsFollowUp) {
          list.push({
            text: `Follow up with ${needsFollowUp.alumni_name || needsFollowUp.company} — no reply in ${Math.floor(daysSince(needsFollowUp))} days`,
            cta: 'Draft it',
            go: () => navigate('ApplicationTracker'),
          });
        }

        const staleApplied = records.find(r => ['applied', 'identified', 'matched'].includes(r.status) && daysSince(r) >= 7);
        if (staleApplied) {
          list.push({
            text: `Update your ${staleApplied.company} application — did you hear back?`,
            cta: 'Update',
            go: () => navigate('ApplicationTracker'),
          });
        }

        list.push({
          text: records.length === 0
            ? 'Submit your first application from today\'s matches'
            : 'Review today\'s new job matches below',
          cta: 'View',
          go: () => document.getElementById('cff-daily-feed')?.scrollIntoView({ behavior: 'smooth' }),
        });

        setActions(list.slice(0, 3));
      })
      .catch(() => setActions(null));
    return () => { cancelled = true; };
  }, [user?.email, hidden]);

  if (hidden || !actions?.length) return null;

  const dismiss = () => {
    setHidden(true);
    try { localStorage.setItem(todayKey(), '1'); } catch {}
  };

  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16,
      padding: '18px 20px', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ListChecks size={16} color="#4F46E5" />
          <h3 style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#111827', margin: 0 }}>
            Today's {actions.length === 1 ? 'action' : `${actions.length} actions`}
          </h3>
        </div>
        <button
          onClick={dismiss}
          style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 16, cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', padding: 0, lineHeight: 1 }}
        >×</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {actions.map((a, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10, background: '#f8f9fc',
            borderRadius: 10, padding: '10px 14px',
          }}>
            <span style={{
              width: 20, height: 20, borderRadius: '50%', background: '#EEF2FF', color: '#4F46E5',
              fontFamily: dm, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>{i + 1}</span>
            <p style={{ fontFamily: dm, fontSize: 13, color: '#374151', margin: 0, flex: 1, lineHeight: 1.4 }}>
              {a.text}
            </p>
            <button
              onClick={a.go}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, fontFamily: dm, fontSize: 12,
                fontWeight: 700, color: '#4F46E5', background: 'none', border: 'none',
                cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', padding: '4px 6px',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              {a.cta} <ArrowRight size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}