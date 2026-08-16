import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getCliffReadiness } from '@/functions/getCliffReadiness';
import { useAuth } from '@/lib/AuthContext';
import SoftWallModal from '@/components/conversion/SoftWallModal';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";
const device = () => (window.innerWidth < 768 ? 'mobile' : 'desktop');

// "CLIFF Is Ready" preview card: shows Free students (post-Magic-Moment) that
// CLIFF has already assessed this opportunity and knows exactly what it would do.
// Backend guarantees: real assessment only, never for Pro/excluded/suppressed users.
export default function CliffReadyCard({ job }) {
  const [data, setData] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!job?.company) return;
    let cancelled = false;
    getCliffReadiness({
      company: job.company,
      role: job.role || job.job_title || '',
      jobDescription: job.jobDescription || '',
    })
      .then(res => {
        const d = res?.data || res;
        if (!cancelled && d?.show && d.items?.length) {
          setData(d);
          base44.functions.invoke('conversionEngine', {
            action: 'promptAction', trigger: 'cliff_ready_card', act: 'shown',
            device: device(), company_name: job.company, job_title: job.role || job.job_title,
          }).catch(() => {});
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [job?.company]);

  if (!data) return null;

  const prepare = () => {
    base44.functions.invoke('conversionEngine', {
      action: 'promptAction', trigger: 'cliff_ready_card', act: 'cta_clicked',
      device: device(), company_name: job.company, job_title: job.role || job.job_title,
    }).catch(() => {});
    setShowPaywall(true);
  };

  return (
    <div style={{ background: '#fff', border: '1.5px solid #c4b5fd', borderRadius: 16, padding: '18px 20px', marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        <h3 style={{ fontFamily: dm, fontSize: 16, fontWeight: 900, color: '#111827', margin: 0, lineHeight: 1.3 }}>
          CLIFF is ready to help with this opportunity.
        </h3>
        <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, color: '#6d28d9', background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.2)', borderRadius: 100, padding: '3px 10px', textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0 }}>
          CLIFF Pro
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
        {data.items.map((it, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ fontSize: 13, flexShrink: 0 }}>{it.icon}</span>
            <div>
              <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#374151', margin: 0 }}>✓ {it.label}</p>
              {it.detail && <p style={{ fontFamily: dm, fontSize: 11.5, color: '#9ca3af', margin: '1px 0 0' }}>{it.detail}</p>}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={prepare}
        style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 999, padding: '12px 26px', cursor: 'pointer', width: '100%', boxShadow: '0 6px 18px rgba(109,40,217,0.25)' }}
      >
        Let CLIFF Prepare It
      </button>

      {showPaywall && user && (
        <SoftWallModal user={user} onClose={() => setShowPaywall(false)} source="cliff_ready_card" />
      )}
    </div>
  );
}