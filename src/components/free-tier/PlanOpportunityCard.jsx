import { Clock, ArrowRight } from 'lucide-react';
import { openCliffWorkspace } from '@/lib/cliffWorkspace';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

const TIERS = {
  best: { icon: '🔥', label: 'Best Opportunity', bg: '#fff7ed', border: '#fdba74', text: '#c2410c' },
  good: { icon: '⭐', label: 'Good Opportunity', bg: '#eef2ff', border: '#c7d2fe', text: '#4338ca' },
  low: { icon: '⚪', label: 'Low Priority', bg: '#f9fafb', border: '#e5e7eb', text: '#6b7280' },
};

// One of the student's 3 best opportunities: verdict, why, why it beat others, effort.
export default function PlanOpportunityCard({ opp }) {
  const t = TIERS[opp.tier] || TIERS.good;

  const go = () => openCliffWorkspace({
    company: opp.company,
    role: opp.role,
    jobUrl: opp.url || '',
    location: opp.location || '',
  });

  return (
    <div style={{ background: '#fff', border: `1px solid ${opp.tier === 'best' ? '#fdba74' : '#e5e7eb'}`, borderRadius: 14, padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 900, color: '#111827', margin: 0, wordBreak: 'break-word' }}>{opp.role}</p>
          <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#6b7280', margin: '2px 0 0' }}>
            {opp.company}{opp.location ? ` · ${opp.location}` : ''}
          </p>
        </div>
        <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 900, background: t.bg, color: t.text, border: `1px solid ${t.border}`, borderRadius: 999, padding: '4px 11px', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {t.icon} {t.label}
        </span>
      </div>

      {(opp.why || []).map((r, i) => (
        <p key={i} style={{ fontFamily: dm, fontSize: 12.5, color: '#4b5563', margin: '0 0 3px', lineHeight: 1.5 }}>· {r}</p>
      ))}
      {opp.beat_others && (
        <p style={{ fontFamily: dm, fontSize: 12, fontStyle: 'italic', color: '#6d28d9', margin: '8px 0 0', lineHeight: 1.5 }}>
          Why it beat similar roles: {opp.beat_others}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 12 }}>
        <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={11} /> {opp.effort || '~20 min with CLIFF'}
        </span>
        <button onClick={go}
          style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 999, padding: '9px 18px', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
          Continue <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}