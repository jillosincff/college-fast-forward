import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle2 } from 'lucide-react';
import { getDueConfirmation, resolveConfirmation, snoozeConfirmation } from '@/lib/applyConfirmations';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// One-tap loop closer: "Did you finish?" — keeps the tracker accurate without
// asking the student to do any bookkeeping.
export default function ApplyConfirmToast() {
  const [pending, setPending] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const check = () => setPending(prev => prev || getDueConfirmation());
    check();
    const t = setInterval(check, 60000);
    return () => clearInterval(t);
  }, []);

  if (!pending) return null;

  const finish = async (didApply) => {
    setSaving(true);
    try {
      if (didApply) {
        await base44.entities.NetworkingPipeline.update(pending.pipelineId, {
          status: 'applied',
          status_date: new Date().toISOString(),
        });
        resolveConfirmation(pending.pipelineId);
      } else {
        // Roll the record back to "not applied yet" so CLIFF surfaces it as an
        // unfinished application instead of counting it as submitted.
        await base44.entities.NetworkingPipeline.update(pending.pipelineId, {
          status: 'identified',
          status_date: new Date().toISOString(),
        });
        snoozeConfirmation(pending.pipelineId);
      }
      window.dispatchEvent(new CustomEvent('cff:pipeline-changed'));
    } catch {}
    setSaving(false);
    setPending(null);
  };

  return (
    <div style={{
      position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, background: '#0f172a', color: '#fff', borderRadius: 16,
      padding: '16px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
      maxWidth: 440, width: 'calc(100% - 40px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <CheckCircle2 size={18} color="#a78bfa" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontFamily: dm, fontSize: 13.5, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.5 }}>
          Did you finish your {pending.company} application?
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => finish(true)} disabled={saving}
          style={{ flex: 1, fontFamily: dm, fontSize: 13, fontWeight: 900, color: '#0f172a', background: '#fff', border: 'none', borderRadius: 999, padding: '11px 14px', cursor: 'pointer', minHeight: 'auto', opacity: saving ? 0.6 : 1 }}>
          Yes, submitted
        </button>
        <button onClick={() => finish(false)} disabled={saving}
          style={{ flex: 1, fontFamily: dm, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)', background: 'none', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 999, padding: '11px 14px', cursor: 'pointer', minHeight: 'auto', opacity: saving ? 0.6 : 1 }}>
          Not yet
        </button>
      </div>
    </div>
  );
}