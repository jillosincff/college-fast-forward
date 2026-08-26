import { openCliffWorkspace } from '@/lib/cliffWorkspace';
import { base44 } from '@/api/base44Client';
import { ArrowRight, MapPin } from 'lucide-react';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

const CATEGORIES = [
  { icon: '🔥', label: 'Best Opportunity', text: '#c2410c', bg: '#fff7ed', border: '#fdba74' },
  { icon: '⭐', label: 'Strong Opportunity', text: '#4338ca', bg: '#eef2ff', border: '#c7d2fe' },
  { icon: '💡', label: 'Worth Considering', text: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
];

const VERDICT_LABEL = { pursue: 'Pursue', consider: 'Worth pursuing', skip: 'Skip' };

// One of CLIFF's top 3: verdict-first, one primary CTA, everything else behind "More options".
export default function BestOpportunityCard({ lead, verdict, rank, pursuit, onDetails }) {
  const cat = CATEGORIES[Math.min(rank, 2)];
  const company = lead.company || lead.companyName || '';
  const role = lead.role || lead.job_title || '';
  const reasons = (verdict?.reasons || []).slice(0, 2);
  const caution = (verdict?.cautions || [])[0];
  const ctaLabel = 'Prepare this application';

  const pursue = () => {
    try { base44.analytics.track({ eventName: 'best_opportunity_pursued', properties: { company, role, rank } }); } catch {}
    openCliffWorkspace({ company, role, jobUrl: lead.job_url || lead.jobSource || '' });
  };
  const details = () => {
    try { base44.analytics.track({ eventName: 'best_opportunity_opened', properties: { company, role, rank } }); } catch {}
    onDetails?.(lead);
  };

  return (
    <div style={{ background: '#fff', border: `1px solid ${rank === 0 ? cat.border : '#e5e7eb'}`, borderRadius: 16, padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: cat.text, background: cat.bg, border: `1px solid ${cat.border}`, borderRadius: 999, padding: '4px 10px' }}>
          {cat.icon} {cat.label}
        </span>
        <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 900, color: verdict?.verdict === 'pursue' ? '#15803d' : '#4338ca' }}>
          CLIFF's Verdict: {VERDICT_LABEL[verdict?.verdict] || 'Worth pursuing'}
        </span>
      </div>

      <p style={{ fontFamily: dm, fontSize: 15.5, fontWeight: 900, color: '#111827', margin: 0, overflowWrap: 'anywhere' }}>{role}</p>
      <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#6b7280', margin: '1px 0 8px', overflowWrap: 'anywhere' }}>
        {company}
        {lead.location ? <span style={{ fontWeight: 600 }}> · <MapPin size={11} style={{ display: 'inline', verticalAlign: -1 }} /> {lead.location}</span> : null}
      </p>

      {reasons.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: caution ? 4 : 10 }}>
          {reasons.map((r, i) => (
            <p key={i} style={{ fontFamily: dm, fontSize: 12.5, fontWeight: 600, color: '#374151', margin: 0 }}>✓ {r}</p>
          ))}
        </div>
      )}
      {caution && <p style={{ fontFamily: dm, fontSize: 12, color: '#9ca3af', margin: '0 0 10px' }}>△ {caution}</p>}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={pursue}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 999, padding: '10px 20px', cursor: 'pointer', minHeight: 44 }}>
          {ctaLabel} <ArrowRight size={13} />
        </button>
        <button onClick={details}
          style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', minHeight: 44, minWidth: 'auto', padding: '0 4px' }}>
          More options
        </button>
      </div>
    </div>
  );
}