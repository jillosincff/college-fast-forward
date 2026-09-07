import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Gift, Loader2, Check } from 'lucide-react';

const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const INTER = "'Inter', system-ui, sans-serif";
const TEXT = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';
const INDIGO = '#6d28d9';
const INDIGO_DIM = '#5b21b6';
const INDIGO_BORDER = 'rgba(109,40,217,0.20)';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';

// Parent-pay beat on /pricing only. Wires to the SAME gift checkout used
// by Magic Moment "Ask a parent" — giftProCheckout creates a Stripe session
// with gift_student_email metadata so the webhook activates the student's Pro.
export default function ParentGiftCard() {
  const { user } = useAuth();
  const [studentEmail, setStudentEmail] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleUnlock = async () => {
    setError('');
    const sEmail = studentEmail.trim().toLowerCase();
    if (!sEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sEmail)) {
      setError('Enter your student\u2019s email address.');
      return;
    }
    setBusy(true);
    try {
      const res = await base44.functions.invoke('giftProCheckout', {
        studentEmail: sEmail,
        plan: 'pro_monthly',
      });
      const result = res?.data || res;
      if (result?.url) {
        window.location.href = result.url;
        return;
      }
      if (result?.already_pro) {
        setDone(true);
      } else {
        setError(result?.error || 'Could not start checkout. Please try again.');
      }
    } catch (e) {
      setError(e?.response?.data?.error || e?.data?.error || 'Could not start checkout. Please try again.');
    }
    setBusy(false);
  };

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 4px' }}>
        <div style={{ width: 48, height: 48, borderRadius: 999, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <Check size={24} color="#16a34a" />
        </div>
        <p style={{ fontFamily: SF, fontSize: 16, fontWeight: 700, color: TEXT, margin: '0 0 6px' }}>This student already has CLIFF Pro!</p>
        <p style={{ fontFamily: INTER, fontSize: 14, color: TEXT2, margin: 0 }}>No payment needed {'\u2014'} they{'\u2019'}re all set. \u2014 they\u2019re all set.</p>
      </div>
    );
  }

  return (
    <div style={{
      background: '#faf7ff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: 18,
      padding: '28px 26px', maxWidth: 560, margin: '0 auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Gift size={18} color={INDIGO} />
        <span style={{ fontFamily: SF, fontSize: 12, fontWeight: 800, color: INDIGO, textTransform: 'uppercase', letterSpacing: '0.08em' }}>For Parents</span>
      </div>
      <h3 style={{ fontFamily: SF, fontSize: 20, fontWeight: 800, color: TEXT, margin: '0 0 8px', lineHeight: 1.25 }}>
        Unlock CLIFF Pro for your student
      </h3>
      <p style={{ fontFamily: INTER, fontSize: 14, color: TEXT2, lineHeight: 1.55, margin: '0 0 18px' }}>
        $19.96/mo ($4.99/week billed monthly). Unlimited warm intros + resume tailoring.
      </p>

      {!user && (
        <div style={{ background: '#fff', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
          <p style={{ fontFamily: INTER, fontSize: 13, color: TEXT2, margin: 0, lineHeight: 1.5 }}>
            <a href="#/GetStarted" style={{ color: INDIGO_DIM, fontWeight: 700, textDecoration: 'none' }}>Create a free account</a> first, then come back to unlock Pro for your student.
          </p>
        </div>
      )}

      <label style={{ fontFamily: SF, fontSize: 11, fontWeight: 800, color: INDIGO_DIM, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
        Student{'\u2019'}s email
      </label>
      <input
        type="email"
        value={studentEmail}
        placeholder="student@college.edu"
        onChange={(e) => setStudentEmail(e.target.value)}
        style={{
          width: '100%', boxSizing: 'border-box', fontFamily: INTER, fontSize: 15, color: TEXT,
          background: '#fff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: 10,
          padding: '13px 14px', outline: 'none', marginBottom: 14,
        }}
      />

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: 13, fontFamily: INTER }}>
          {error}
        </div>
      )}

      <button
        onClick={handleUnlock}
        disabled={busy || !user}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontFamily: SF, fontSize: 15, fontWeight: 800, color: '#fff', background: GRAD_INDIGO,
          border: 'none', borderRadius: 999, padding: '15px', cursor: busy ? 'default' : 'pointer',
          boxShadow: '0 6px 18px rgba(109,40,217,0.32)', opacity: busy || !user ? 0.7 : 1,
        }}
      >
        {busy ? <><Loader2 size={16} className="animate-spin" /> Starting checkout{'\u2026'}</> : <>Unlock Pro for my student {'\u2192'}</>}
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, flexWrap: 'wrap', gap: 8 }}>
        <a href="#/ParentLandingPage" style={{ fontFamily: INTER, fontSize: 12, color: TEXT3, textDecoration: 'none' }}>
          Parents who want to add professional info (not pay) {'\u2192'}
        </a>
        <button
          onClick={() => {
            const el = document.getElementById('compare');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          style={{ fontFamily: INTER, fontSize: 12, color: TEXT3, textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0 }}
        >
          See what{'\u2019'}s free vs Pro {'\u2192'}
        </button>
      </div>
    </div>
  );
}