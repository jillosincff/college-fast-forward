import { useState } from 'react';
import { giftProCheckout } from '@/functions/giftProCheckout';

const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const GRAD = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';

// Parent-facing gift card: buy CLIFF Pro for their student, right after signup.
export default function GiftProCard() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const origin = (window.location.origin && window.location.origin !== 'null')
    ? window.location.origin
    : 'https://collegefastforward.com';

  const handleGift = async () => {
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter your student's email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await giftProCheckout({
        studentEmail: email.trim(),
        successUrl: `${origin}/#/ParentAllSet?gift=success`,
        cancelUrl: `${origin}/#/ParentAllSet`,
      });
      const data = res?.data || res;
      if (data?.url) { window.location.href = data.url; return; }
      setError(data?.error || 'Something went wrong. Please try again.');
    } catch (e) {
      setError(e?.response?.data?.error || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      background: GRAD, borderRadius: 18, padding: '26px 24px', marginBottom: 24,
      textAlign: 'left', boxShadow: '0 16px 40px rgba(109,40,217,0.28)',
    }}>
      <p style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'rgba(255,255,255,0.75)', margin: '0 0 10px' }}>
        🎁 Want to go further?
      </p>
      <h2 style={{ fontFamily: SF, fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 8px', lineHeight: 1.2 }}>
        Give your student CLIFF Pro
      </h2>
      <p style={{ fontFamily: SF, fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, margin: '0 0 14px' }}>
        You're not buying another app your kid has to remember to open. CLIFF does the work <em>for</em> them — overnight, with no prompting.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, margin: '0 0 18px' }}>
        {[
          ['3 resumes', 'tailored to real openings before they wake up'],
          ['2 warm intros', 'to alumni at their target companies, drafted and ready'],
          ['1 follow-up', 'sent on every application that goes quiet'],
        ].map(([n, t]) => (
          <div key={n} style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontFamily: SF, fontSize: 13, fontWeight: 800, color: '#fff', minWidth: 92, flexShrink: 0 }}>{n}</span>
            <span style={{ fontFamily: SF, fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.45 }}>{t}</span>
          </div>
        ))}
      </div>
      <p style={{ fontFamily: SF, fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, margin: '0 0 18px' }}>
        They get an email each morning with what CLIFF finished overnight. $19.96/mo, cancel anytime.
      </p>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Your student's email"
        style={{
          width: '100%', boxSizing: 'border-box', fontFamily: SF, fontSize: 15,
          padding: '13px 16px', borderRadius: 12, border: 'none', outline: 'none',
          marginBottom: 10, color: '#0f172a', background: '#fff',
        }}
      />
      <button
        onClick={handleGift}
        disabled={loading}
        style={{
          width: '100%', fontFamily: SF, fontSize: 15, fontWeight: 800,
          color: '#6d28d9', background: '#fff', border: 'none', borderRadius: 12,
          padding: '14px 20px', cursor: loading ? 'wait' : 'pointer', minHeight: 50,
          opacity: loading ? 0.7 : 1, touchAction: 'manipulation',
        }}
      >
        {loading ? 'Opening secure checkout…' : 'Gift CLIFF Pro — $19.96/mo →'}
      </button>
      {error && (
        <p style={{ fontFamily: SF, fontSize: 13, fontWeight: 600, color: '#fde68a', margin: '10px 0 0', lineHeight: 1.5 }}>
          {error}
        </p>
      )}
      <p style={{ fontFamily: SF, fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: '12px 0 0', lineHeight: 1.5 }}>
        Haven't they signed up yet? No problem — Pro activates automatically when they join with this email.
      </p>
    </div>
  );
}