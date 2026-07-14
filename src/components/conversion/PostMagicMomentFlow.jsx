import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import ReflectionStep from './ReflectionStep';
import ContinuationStep from './ContinuationStep';
import ProOfferStep from './ProOfferStep';

const device = () => (window.innerWidth < 768 ? 'mobile' : 'desktop');

// The core conversion arc, shown ONCE after the Magic Moment completes:
// Reflection (real completed work) → Continuation (real next move) → Pro offer.
// Backend guarantees: only shows for free users, only once, only real data.
export default function PostMagicMomentFlow({ user, onUpgrade }) {
  const [data, setData] = useState(null);
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    let cancelled = false;
    base44.functions.invoke('conversionEngine', { action: 'reflection', device: device() })
      .then(res => {
        const d = res?.data || res;
        if (!cancelled && d?.show) { setData(d); setOpen(true); }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user?.email]);

  if (!open || !data) return null;

  const log = (event_name, extra = {}) =>
    base44.functions.invoke('conversionEngine', {
      action: 'log', event_name, device: device(), company_name: data.company_name, ...extra,
    }).catch(() => {});

  const promptAction = (act) =>
    base44.functions.invoke('conversionEngine', {
      action: 'promptAction', trigger: 'post_magic_moment', act, device: device(), company_name: data.company_name,
    }).catch(() => {});

  const goToContinuation = () => { log('next_action_displayed'); setStep(1); };
  const goToOffer = () => { log('pro_offer_viewed', { trigger: 'post_magic_moment' }); setStep(2); };

  // Soft close before the offer — counts as a dismissal, work is preserved
  const softClose = () => { promptAction('dismissed'); setOpen(false); };
  // Explicit "Continue with Free" — suppress non-essential prompts for 7 days
  const continueFree = () => { promptAction('continue_free'); setOpen(false); };
  const keepWorking = () => {
    promptAction('cta_clicked');
    setOpen(false);
    onUpgrade?.('CLIFF Pro', 'post_magic_moment');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', zIndex: 60000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 'clamp(20px, 4vw, 32px)', maxWidth: 520, width: '100%', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.28)' }}>
        {step === 0 && <ReflectionStep data={data} onNext={goToContinuation} onClose={softClose} />}
        {step === 1 && <ContinuationStep move={data.next_move} onNext={goToOffer} onClose={softClose} />}
        {step === 2 && <ProOfferStep pitch={data.pro_pitch} onKeepWorking={keepWorking} onContinueFree={continueFree} />}
      </div>
    </div>
  );
}