import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import { Unlock, ArrowRight } from 'lucide-react';

const dm = "'DM Sans', system-ui, sans-serif";

// Day-one "aha moment": one fully unlocked warm connection from the parent/alumni
// network, shown free — with the rest of the pool as the upgrade hook.
export default function FirstWarmMatchCard({ user, onUpgrade }) {
  const [match, setMatch] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    base44.functions.invoke('getDashboardParentMatch', {})
      .then(res => {
        const data = res?.data || res;
        if (!cancelled && data?.match_found) setMatch(data);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, []);

  if (!loaded || !match) return null;

  const { parent, total_pool, school_code } = match;
  const initial = (parent.first_name || '?')[0].toUpperCase();
  // Many imported contacts only have a placeholder title — hide it rather than
  // showing a meaningless "Professional at X" line.
  const hasRealTitle = parent.role_title && !/^(professional|n\/a|unknown)$/i.test(parent.role_title.trim());
  return (
    <div style={{ background: '#fff', border: '1px solid #c7d2fe', borderRadius: 16, padding: '16px 18px', marginBottom: 16, boxShadow: '0 4px 16px rgba(79,70,229,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <Unlock size={13} color="#16a34a" />
        <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, color: '#16a34a', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Your free warm connection
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontFamily: dm, fontSize: 18, fontWeight: 800, color: '#fff' }}>{initial}</span>
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 800, color: '#111827', margin: '0 0 2px' }}>
            {parent.first_name}
          </p>
          <p style={{ fontFamily: dm, fontSize: 12, color: '#4b5563', margin: '0 0 2px' }}>
            {hasRealTitle ? <>{parent.role_title} · </> : null}<strong style={{ color: '#111827' }}>{parent.company_name}</strong>
          </p>
          <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: 0 }}>
            {school_code} parent network
          </p>
        </div>
        <button
          onClick={() => navigate('/OutreachDrafts')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff', background: '#4f46e5', border: 'none', borderRadius: 10, padding: '12px 18px', cursor: 'pointer', minHeight: 44, whiteSpace: 'nowrap' }}
        >
          Draft my intro <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}