import { useState } from 'react';
import { X, Loader2, CreditCard } from 'lucide-react';
import { giftFastIQToStudent } from '@/functions/giftFastIQToStudent';
import { findStudentOnCFF } from '@/functions/findStudentOnCFF';
import { createCustomerPortal } from '@/functions/createCustomerPortal';
import { createCheckoutSession } from '@/functions/createCheckoutSession';

const dm = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

export default function GiftFastIQModal({ user, onClose }) {
  const [step, setStep] = useState('search'); // search | found | multiple | notfound | email | plan | loading | success | need_card
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [searching, setSearching] = useState(false);
  const [matches, setMatches] = useState([]);
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [pendingGift, setPendingGift] = useState(null); // { studentId, studentEmail } — saved while user adds card
  const [planBackStep, setPlanBackStep] = useState('search'); // which step to return to from plan
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  const savedEmail = user?.student_emails?.[0] || null;

  const handleSearch = async () => {
    if (!firstName.trim() || !lastName.trim()) return;
    setSearching(true);
    try {
      const res = await findStudentOnCFF({ firstName: firstName.trim(), lastName: lastName.trim() });
      const found = res?.data?.matches || [];
      setMatches(found);
      if (found.length === 0) setStep('notfound');
      else if (found.length === 1) setStep('found');
      else setStep('multiple');
    } catch (e) {
      setMatches([]);
      setStep('notfound');
    }
    setSearching(false);
  };

  // Show plan selection before gifting — remember where we came from
  const promptPlan = (giftTarget, fromStep) => {
    setPendingGift(giftTarget);
    setPlanBackStep(fromStep || step);
    setStep('plan');
  };

  const doGift = async ({ studentId, studentEmail, plan }) => {
    setStep('loading');
    try {
      const payload = {
        plan: plan || selectedPlan,
        ...(studentId ? { studentId } : { studentEmail: studentEmail?.trim().toLowerCase() }),
      };
      const res = await giftFastIQToStudent(payload);
      const data = res?.data;

      if (res?.status === 402 || data?.reason === 'credit_card_required') {
        setStep('need_card');
        return;
      }

      const status = data?.status || 'activated';
      const studentName = data?.studentName || (studentId ? matches[0]?.first_name : null) || null;
      setResult({ status, studentName, email: studentEmail || null });
      setStep('success');
    } catch (e) {
      if (e?.response?.status === 402 || e?.message?.includes('credit_card')) {
        setStep('need_card');
        return;
      }
      setResult({ status: 'pending', studentName: null, email: studentEmail || null });
      setStep('success');
    }
  };

  const handleAddCard = async () => {
    const returnUrl = `${window.location.origin}/#ParentHome?gift=open`;
    try {
      if (user?.stripe_customer_id) {
        // Parent already has a Stripe customer — open billing portal to add/update card
        const res = await createCustomerPortal({
          customerId: user.stripe_customer_id,
          returnUrl,
        });
        if (res?.data?.url) window.location.href = res.data.url;
      } else {
        // No Stripe customer yet — use setup mode checkout (no subscription created)
        const res = await createCheckoutSession({
          plan: 'setup_only',
          successUrl: returnUrl,
          cancelUrl: window.location.href,
          user: { id: user?.id, email: user?.email, full_name: user?.full_name },
        });
        if (res?.data?.url) window.location.href = res.data.url;
      }
    } catch (e) {
      console.error('Card add failed:', e.message);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    border: '1.5px solid #E0E0E0', fontSize: 15, outline: 'none',
    boxSizing: 'border-box', fontFamily: dm,
  };

  const btnOrange = (disabled) => ({
    width: '100%', background: disabled ? '#E0E0E0' : '#E85D20',
    border: 'none', borderRadius: 10, padding: '13px',
    fontSize: 15, fontWeight: 600, color: '#fff',
    cursor: disabled ? 'default' : 'pointer', fontFamily: dm,
    minHeight: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  });

  const btnOutline = {
    background: 'none', border: '1.5px solid #E0E0E0', borderRadius: 10,
    padding: '11px', fontSize: 14, fontWeight: 600, color: '#555',
    cursor: 'pointer', fontFamily: dm, minHeight: 'auto', width: '100%',
  };

  const btnGhost = {
    background: 'none', border: 'none', fontSize: 13, color: '#E85D20',
    cursor: 'pointer', fontFamily: dm, minHeight: 'auto', textDecoration: 'underline',
    padding: 0,
  };

  const backBtn = (toStep = 'search') => (
    <button onClick={() => setStep(toStep)} style={{ background: 'none', border: 'none', fontSize: 13, color: '#888', cursor: 'pointer', minHeight: 'auto', padding: '0 0 16px', display: 'block', fontFamily: dm }}>
      ← Back
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: '#0A0A0A', padding: '24px 24px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#E85D20', margin: '0 0 6px', fontFamily: dm }}>
                🎁 FASTIQ GIFT
              </p>
              <h2 style={{ fontSize: 19, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.3, fontFamily: playfair }}>
                Give Your Student<br />FastIQ Access
              </h2>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', padding: 4, marginTop: -4 }}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div style={{ padding: '24px 24px 28px' }}>

          {/* STEP: search */}
          {step === 'search' && (
            <>
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, marginBottom: 20, fontFamily: dm }}>
                First, let's check if your student is already on CFF.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6, fontFamily: dm }}>First Name</label>
                  <input type="text" placeholder="Alex" value={firstName} onChange={e => setFirstName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6, fontFamily: dm }}>Last Name</label>
                  <input type="text" placeholder="Smith" value={lastName} onChange={e => setLastName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} style={inputStyle} />
                </div>
              </div>
              <button onClick={handleSearch} disabled={!firstName.trim() || !lastName.trim() || searching} style={btnOrange(!firstName.trim() || !lastName.trim() || searching)}>
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Find My Student →'}
              </button>
              <div style={{ borderTop: '1px solid #F0F0F0', marginTop: 20, paddingTop: 16, textAlign: 'center' }}>
                <span style={{ fontSize: 13, color: '#888', fontFamily: dm }}>Or skip to </span>
                <button onClick={() => setStep('email')} style={btnGhost}>Enter their email instead →</button>
              </div>
            </>
          )}

          {/* STEP: found (exactly 1 match) */}
          {step === 'found' && matches.length === 1 && (
            <>
              {backBtn()}
              {matches[0].already_has_fastiq ? (
                <>
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <p style={{ fontSize: 28, margin: '0 0 12px' }}>✅</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px', fontFamily: playfair }}>
                      {matches[0].first_name} is already set!
                    </p>
                    <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, fontFamily: dm }}>
                      {matches[0].first_name} already has FastIQ access — they're all set!
                    </p>
                  </div>
                  <button onClick={onClose} style={btnOrange(false)}>Close</button>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#22C55E', marginBottom: 14, fontFamily: dm }}>✅ We found them!</p>
                  <div style={{ border: '1.5px solid #E0E0E0', borderRadius: 12, padding: '16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#0A0A0A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0, fontFamily: dm }}>
                      {matches[0].avatar_initials}
                    </div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', margin: '0 0 2px', fontFamily: dm }}>{matches[0].first_name} {matches[0].last_name}</p>
                      <p style={{ fontSize: 13, color: '#888', margin: 0, fontFamily: dm }}>{matches[0].school_name || 'CFF Member'}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: '#555', marginBottom: 16, fontFamily: dm }}>Is this your student?</p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => promptPlan({ studentId: matches[0].id }, 'found')} style={{ ...btnOrange(false), flex: 2 }}>
                      Yes, Gift FastIQ →
                    </button>
                    <button onClick={() => setStep('email')} style={{ ...btnOutline, flex: 1 }}>
                      Not them
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* STEP: multiple matches */}
          {step === 'multiple' && (
            <>
              {backBtn()}
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, marginBottom: 16, fontFamily: dm }}>
                We found a few students named <strong>{firstName} {lastName}</strong>.<br />Enter their email so we can find the right one:
              </p>
              <input type="email" placeholder="student@university.edu" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && email.trim() && promptPlan({ studentEmail: email })} style={{ ...inputStyle, marginBottom: 12 }} />
              <button onClick={() => promptPlan({ studentEmail: email }, 'multiple')} disabled={!email.trim()} style={btnOrange(!email.trim())}>
                Find My Student →
              </button>
            </>
          )}

          {/* STEP: no match */}
          {step === 'notfound' && (
            <>
              {backBtn()}
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, marginBottom: 16, fontFamily: dm }}>
                We don't see anyone by that name on CFF yet.<br /><br />
                Enter their email and we'll send them a FastIQ trial invite:
              </p>
              <input type="email" placeholder="student@university.edu" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && email.trim() && promptPlan({ studentEmail: email })} style={{ ...inputStyle, marginBottom: 12 }} />
              <button onClick={() => promptPlan({ studentEmail: email }, 'notfound')} disabled={!email.trim()} style={btnOrange(!email.trim())}>
                Continue →
              </button>
            </>
          )}

          {/* STEP: email (manual entry) */}
          {step === 'email' && (
            <>
              {backBtn()}
              <label style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8, fontFamily: dm }}>
                Student's email address
              </label>
              <input type="email" placeholder="student@university.edu" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && email.trim() && promptPlan({ studentEmail: email })} style={{ ...inputStyle, marginBottom: 12 }} />
              <button onClick={() => promptPlan({ studentEmail: email }, 'email')} disabled={!email.trim()} style={btnOrange(!email.trim())}>
                Continue →
              </button>
              {savedEmail && (
                <button onClick={() => promptPlan({ studentEmail: savedEmail }, 'email')} style={{ ...btnGhost, marginTop: 12 }}>
                  Use {savedEmail} on file →
                </button>
              )}
            </>
          )}

          {/* STEP: plan selection */}
          {step === 'plan' && (
            <>
              {backBtn(planBackStep)}
              <p style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', marginBottom: 6, fontFamily: playfair }}>Choose a plan</p>
              <p style={{ fontSize: 13, color: '#888', marginBottom: 20, fontFamily: dm }}>
                Your card will be charged after the 5-day free trial. Cancel anytime from your dashboard.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {[
                  { key: 'monthly', label: 'Monthly', price: '$29/month', sub: 'Billed monthly after trial' },
                  { key: 'annual', label: 'Annual', price: '$249/year', sub: 'Save $99 — billed annually after trial' },
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setSelectedPlan(opt.key)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 16px', borderRadius: 12,
                      border: `2px solid ${selectedPlan === opt.key ? '#E85D20' : '#E0E0E0'}`,
                      background: selectedPlan === opt.key ? '#FFF5F0' : '#fff',
                      cursor: 'pointer', minHeight: 'auto', width: '100%', fontFamily: dm,
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>{opt.label}</p>
                      <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>{opt.sub}</p>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 700, color: selectedPlan === opt.key ? '#E85D20' : '#1A1A1A' }}>
                      {opt.price}
                    </span>
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 12, color: '#AAAAAA', marginBottom: 16, fontFamily: dm, textAlign: 'center' }}>
                5-day free trial · Your card is charged on day 5 · Cancel anytime
              </p>
              <button
                onClick={() => doGift({ ...pendingGift, plan: selectedPlan })}
                style={btnOrange(false)}
              >
                Start 5-Day Free Trial →
              </button>
            </>
          )}

          {/* STEP: need card */}
          {step === 'need_card' && (
            <>
              <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FFF5F0', border: '2px solid #E85D20', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <CreditCard className="w-6 h-6" style={{ color: '#E85D20' }} />
                </div>
                <p style={{ fontSize: 17, fontWeight: 700, color: '#1A1A1A', margin: '0 0 10px', fontFamily: playfair }}>
                  Add a payment method first
                </p>
                <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, marginBottom: 24, fontFamily: dm }}>
                  To gift FastIQ, we need your card on file. You'll be charged {selectedPlan === 'annual' ? '$249/year' : '$29/mo'} after the 5-day free trial. You can cancel anytime.
                </p>
                <button onClick={handleAddCard} style={btnOrange(false)}>
                  Add Payment Method →
                </button>
                <button onClick={onClose} style={{ ...btnGhost, marginTop: 14, display: 'block', width: '100%', textAlign: 'center' }}>
                  Cancel
                </button>
              </div>
            </>
          )}

          {/* STEP: loading */}
          {step === 'loading' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ fontSize: 28, marginBottom: 12 }}>🎁</p>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', fontFamily: dm }}>Activating trial...</p>
            </div>
          )}

          {/* STEP: success */}
          {step === 'success' && result && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 32, marginBottom: 12 }}>
                {result.status === 'already_active' ? '✅' : result.status === 'pending' ? '📬' : '🎉'}
              </p>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', marginBottom: 10, fontFamily: playfair }}>
                {result.status === 'already_active' ? 'Already covered!' : result.status === 'pending' ? 'Invite sent!' : 'Trial activated!'}
              </p>
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: 24, fontFamily: dm }}>
                {result.status === 'already_active'
                  ? `${result.studentName || 'Your student'} already has FastIQ access. They're all set.`
                  : result.status === 'activated'
                  ? `${result.studentName ? result.studentName + "'s" : "Your student's"} 5-day FastIQ trial is now active. Your card will be charged after day 5. We've emailed them to let them know.`
                  : `We've sent an invite to ${result.email || 'your student'}. Their 5-day trial starts the moment they sign up. Your card will be charged after day 5.`}
              </p>
              <button onClick={onClose} style={btnOrange(false)}>Done</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}