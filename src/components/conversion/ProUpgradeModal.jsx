import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  FONT, TEXT, TEXT2, TEXT3, INDIGO, INDIGO_DIM, INDIGO_BORDER, GRAD_INDIGO, R,
} from '@/components/onboarding-flow/onboardingShared';
import {
  trackUpgradeModalViewed, trackUpgradeClicked,
  trackParentSendInitiated, trackParentSendCompleted,
} from '@/lib/tracking';
import { X, Loader2, Check, Gift, Sparkles, Lock } from 'lucide-react';

// The hard paywall. Direct, low-hype. Two primary paths the student can take:
// pay (Monthly / Annual shown) or send to a parent. Fires the conversion
// tracking events at each step.

const UNLOCKS = [
  'Unlimited job cycles with alumni matches',
  'Ready-to-send warm outreach for every role',
  'Unlimited resume tailoring',
  'Mock interviews + LinkedIn review',
  'Full tracking and follow-up reminders',
];

export default function ProUpgradeModal({ user, onClose, source = 'magic_moment' }) {
  const [view, setView] = useState('main'); // main | parent | sent
  const [parentEmail, setParentEmail] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('annual'); // 'annual' | 'monthly'

  useEffect(() => { trackUpgradeModalViewed({ source }); }, []);

  const startPro = async () => {
    setBusy(true); setError('');
    trackUpgradeClicked({ plan: selectedPlan, source });
    try {
      // createCheckoutSession defaults success/cancel to the production URLs,
      // which avoids the sandboxed `window.location.origin === null` bug.
      const returnTo = (window.location.hash.replace(/^#/, '').split('?')[0]) || '/FreeTierDashboard';
      const res = await base44.functions.invoke('createCheckoutSession', {
        plan: selectedPlan === 'annual' ? 'pro_annual' : 'pro_monthly',
        user: { id: user.id, email: user.email },
        returnTo,
        source,
      });
      const url = res?.data?.url || res?.url;
      if (url) { window.location.href = url; return; }
      setError('Could not start checkout. Try again.');
    } catch (e) { setError('Could not start checkout. Try again.'); }
    setBusy(false);
  };

  const openParent = () => { setView('parent'); setError(''); trackParentSendInitiated({ source }); };

  const sendParent = async () => {
    const e = parentEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { setError('Enter a valid email.'); return; }
    setBusy(true); setError('');
    try {
      const res = await base44.functions.invoke('sendParentProInvite', { parentEmail: e, note: note.trim(), plan: selectedPlan === 'annual' ? 'pro_annual' : 'pro_monthly' });
      if (res?.data?.success || res?.success) {
        trackParentSendCompleted({ parent_email_domain: e.split('@')[1] });
        setView('sent');
      } else {
        setError(res?.data?.error || res?.error || 'Could not send. Try again.');
      }
    } catch (err) { setError('Could not send. Try again.'); }
    setBusy(false);
  };

  const overlay = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100, padding: 0 };
  const sheet = { width: '100%', maxWidth: 440, background: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 22px calc(28px + env(safe-area-inset-bottom))', maxHeight: '92vh', overflowY: 'auto' };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={sheet} onClick={(ev) => ev.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', color: TEXT3, padding: 0 }}><X size={20} /></button>
        </div>

        {view === 'main' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f5f3ff', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 999, padding: '5px 12px', marginBottom: 12 }}>
                <Lock size={12} color={INDIGO} />
                <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 800, color: INDIGO, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your free cycle is done</span>
              </div>
              <h1 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 800, color: TEXT, margin: '0 0 6px', lineHeight: 1.2 }}>Unlock CLIFF Pro</h1>
              <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, margin: 0, lineHeight: 1.5 }}>Run this exact plan for every job you want — not just one.</p>
            </div>

            <div style={{ background: '#faf7ff', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
              {UNLOCKS.map((u) => (
                <div key={u} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <Check size={15} color={INDIGO} style={{ flex: '0 0 auto', marginTop: 2 }} />
                  <span style={{ fontFamily: FONT, fontSize: 13, color: TEXT, lineHeight: 1.45 }}>{u}</span>
                </div>
              ))}
            </div>

            {/* Billing options — select Monthly or Annual (Annual = best value) */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
              <div onClick={() => setSelectedPlan('monthly')} style={{ flex: 1, cursor: 'pointer', borderRadius: 12, padding: '12px 14px', border: selectedPlan === 'monthly' ? `2px solid ${INDIGO}` : `1.5px solid #e2e8f0`, background: selectedPlan === 'monthly' ? '#fff' : '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 800, color: selectedPlan === 'monthly' ? TEXT : TEXT2 }}>Monthly</span>
                  {selectedPlan === 'monthly' && <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: '#fff', background: GRAD_INDIGO, padding: '2px 8px', borderRadius: 999 }}>SELECTED</span>}
                </div>
                <span style={{ fontFamily: FONT, fontSize: 18, fontWeight: 800, color: selectedPlan === 'monthly' ? TEXT : TEXT2 }}>$19.96</span>
                <span style={{ fontFamily: FONT, fontSize: 12, color: TEXT2 }}> /month</span>
              </div>
              <div onClick={() => setSelectedPlan('annual')} style={{ flex: 1, cursor: 'pointer', borderRadius: 12, padding: '12px 14px', border: selectedPlan === 'annual' ? `2px solid ${INDIGO}` : `1.5px solid #e9d5ff`, background: selectedPlan === 'annual' ? '#fff' : '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 800, color: selectedPlan === 'annual' ? TEXT : TEXT2 }}>Annual</span>
                  {selectedPlan === 'annual'
                    ? <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: '#fff', background: GRAD_INDIGO, padding: '2px 8px', borderRadius: 999 }}>SELECTED</span>
                    : <span style={{ fontFamily: FONT, fontSize: 9, fontWeight: 700, color: INDIGO_DIM, background: '#ede9fe', padding: '2px 8px', borderRadius: 999 }}>BEST VALUE</span>}
                </div>
                <span style={{ fontFamily: FONT, fontSize: 18, fontWeight: 800, color: selectedPlan === 'annual' ? TEXT : TEXT2 }}>$149</span>
                <span style={{ fontFamily: FONT, fontSize: 12, color: TEXT3 }}> /year</span>
                <p style={{ fontFamily: FONT, fontSize: 10.5, color: TEXT3, margin: '4px 0 0', lineHeight: 1.4 }}>$12.42/mo billed annually</p>
              </div>
            </div>

            {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: 12.5, fontFamily: FONT }}>{error}</div>}

            <button onClick={startPro} disabled={busy} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: FONT, fontSize: 15, fontWeight: 800, color: '#fff', background: GRAD_INDIGO, border: 'none', borderRadius: 999, padding: '15px', cursor: busy ? 'default' : 'pointer', boxShadow: '0 6px 18px rgba(109,40,217,0.32)', opacity: busy ? 0.7 : 1 }}>
              {busy ? <><Loader2 size={16} className="animate-spin" /> Starting checkout…</> : <>Start CLIFF Pro</>}
            </button>

            <button onClick={openParent} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: FONT, fontSize: 14, fontWeight: 700, color: INDIGO_DIM, background: '#fff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: 999, padding: '14px', cursor: 'pointer', marginTop: 10 }}>
              <Gift size={15} color={INDIGO} /> Ask a parent to unlock
            </button>

            <p style={{ fontFamily: FONT, fontSize: 11, color: TEXT3, textAlign: 'center', margin: '14px 0 0', lineHeight: 1.5 }}>Cancel anytime. Students who use CLIFF Pro apply to 3× more roles.</p>
          </>
        )}

        {view === 'parent' && (
          <>
            <button onClick={() => { setView('main'); setError(''); }} style={{ background: 'none', border: 'none', fontFamily: FONT, fontSize: 13, color: TEXT3, cursor: 'pointer', minHeight: 'auto', padding: 0, marginBottom: 14 }}>← Back</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Gift size={16} color={INDIGO} />
              <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 800, color: INDIGO, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ask a parent to unlock</span>
            </div>
            <h1 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 800, color: TEXT, margin: '0 0 6px', lineHeight: 1.25 }}>Have a parent unlock it for you</h1>
            <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, margin: '0 0 18px', lineHeight: 1.5 }}>Enter your parent's email and we'll send them a link to pay. The moment they pay, your account upgrades.</p>

            {/* Plan selector for the gift — default Annual (best value) */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <button type="button" onClick={() => setSelectedPlan('annual')} style={{ flex: 1, fontFamily: FONT, fontSize: 12, fontWeight: 700, color: selectedPlan === 'annual' ? '#fff' : INDIGO_DIM, background: selectedPlan === 'annual' ? GRAD_INDIGO : '#fff', border: `1.5px solid ${selectedPlan === 'annual' ? 'transparent' : INDIGO_BORDER}`, borderRadius: 10, padding: '10px', cursor: 'pointer', minHeight: 'auto' }}>Annual · $149/yr <span style={{ fontSize: 10, opacity: 0.9 }}>· Best value</span></button>
              <button type="button" onClick={() => setSelectedPlan('monthly')} style={{ flex: 1, fontFamily: FONT, fontSize: 12, fontWeight: 700, color: selectedPlan === 'monthly' ? '#fff' : INDIGO_DIM, background: selectedPlan === 'monthly' ? GRAD_INDIGO : '#fff', border: `1.5px solid ${selectedPlan === 'monthly' ? 'transparent' : INDIGO_BORDER}`, borderRadius: 10, padding: '10px', cursor: 'pointer', minHeight: 'auto' }}>Monthly · $19.96/mo</button>
            </div>

            <label style={{ fontFamily: FONT, fontSize: 11, fontWeight: 800, color: INDIGO_DIM, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Parent's email</label>
            <input type="email" value={parentEmail} placeholder="parent@email.com" onChange={(e) => setParentEmail(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', fontFamily: FONT, fontSize: 15, color: TEXT, background: '#fafafa', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: 10, padding: '13px 14px', outline: 'none', marginBottom: 12 }} />

            <label style={{ fontFamily: FONT, fontSize: 11, fontWeight: 800, color: INDIGO_DIM, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Note (optional)</label>
            <textarea value={note} placeholder="Hey — could you help me with CLIFF Pro? It finds jobs and tailors my resume for me." onChange={(e) => setNote(e.target.value)} rows={3} style={{ width: '100%', boxSizing: 'border-box', fontFamily: FONT, fontSize: 14, color: TEXT, background: '#fafafa', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: 10, padding: '12px 14px', outline: 'none', resize: 'none', marginBottom: 14 }} />

            {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: 12.5, fontFamily: FONT }}>{error}</div>}

            <button onClick={sendParent} disabled={busy} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: FONT, fontSize: 15, fontWeight: 800, color: '#fff', background: GRAD_INDIGO, border: 'none', borderRadius: 999, padding: '15px', cursor: busy ? 'default' : 'pointer', boxShadow: '0 6px 18px rgba(109,40,217,0.32)', opacity: busy ? 0.7 : 1 }}>
              {busy ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : <>Send to parent</>}
            </button>
          </>
        )}

        {view === 'sent' && (
          <div style={{ textAlign: 'center', padding: '20px 4px' }}>
            <div style={{ width: 56, height: 56, borderRadius: 999, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Check size={28} color="#16a34a" />
            </div>
            <h1 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 800, color: TEXT, margin: '0 0 8px' }}>Sent!</h1>
            <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, margin: '0 0 20px', lineHeight: 1.5 }}>We emailed your parent a link to pay. The moment they pay, CLIFF Pro unlocks on your account — we'll let you know.</p>
            <button onClick={onClose} style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: INDIGO_DIM, background: '#fff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: 999, padding: '13px 28px', cursor: 'pointer', minHeight: 'auto' }}>Back to my plan</button>
          </div>
        )}
      </div>
    </div>
  );
}