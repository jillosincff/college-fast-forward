import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import { Unlock, Lock, ArrowRight } from 'lucide-react';

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
  const lockedCount = Math.max(0, (total_pool || 1) - 1);

  return (
    <div style={{ background: '#fff', border: '1px solid #c7d2fe', borderRadius: 16, padding: '18px 20px', marginBottom: 16, boxShadow: '0 4px 16px rgba(79,70,229,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <Unlock size={13} color="#16a34a" />
        <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, color: '#16a34a', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Your first warm connection — unlocked free
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontFamily: dm, fontSize: 20, fontWeight: 800, color: '#fff' }}>{initial}</span>
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 800, color: '#111827', margin: '0 0 2px' }}>
            {parent.first_name}
          </p>
          <p style={{ fontFamily: dm, fontSize: 12, color: '#4b5563', margin: 0 }}>
            {hasRealTitle ? <>{parent.role_title} at </> : <>Works at </>}<strong style={{ color: '#111827' }}>{parent.company_name}</strong>
          </p>
          <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: '2px 0 0' }}>
            {school_code} parent network — willing to help students like you
          </p>
        </div>
        <button
          onClick={() => navigate('/OutreachDrafts')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#fff', background: '#4f46e5', border: 'none', borderRadius: 10, padding: '11px 16px', cursor: 'pointer', minHeight: 'auto', whiteSpace: 'nowrap' }}
        >
          Draft my intro <ArrowRight size={13} />
        </button>
      </div>

      {lockedCount > 0 && (
        <button
          onClick={() => onUpgrade?.('Warm Network')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', marginTop: 14, background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', minHeight: 'auto', textAlign: 'left' }}
        >
          <Lock size={13} color="#94a3b8" style={{ flexShrink: 0 }} />
          <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 600, color: '#64748b', flex: 1 }}>
            <strong style={{ color: '#374151' }}>{lockedCount} more warm connection{lockedCount === 1 ? '' : 's'}</strong> at other companies in your network
          </span>
          <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#4f46e5', whiteSpace: 'nowrap' }}>Unlock all →</span>
        </button>
      )}
    </div>
  );
}