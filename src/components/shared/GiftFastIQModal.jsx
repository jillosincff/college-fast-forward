import { useState } from 'react';
import { X, Loader2, Gift } from 'lucide-react';
import { giftFastIQToStudent } from '@/functions/giftFastIQToStudent';

export default function GiftFastIQModal({ user, onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [status, setStatus] = useState(null); // 'activated' | 'pending'

  const savedEmail = user?.student_emails?.[0] || null;

  const handleGift = async (emailToUse) => {
    const target = (emailToUse || email).trim();
    if (!target) return;
    setLoading(true);
    const res = await giftFastIQToStudent({ studentEmail: target });
    const resultStatus = res?.data?.status || 'activated';
    setStatus(resultStatus);
    setDone(true);
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ background: '#0A0A0A', padding: '28px 28px 24px' }}>
          <div className="flex items-start justify-between">
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#E85D20', margin: '0 0 8px' }}>
                🎁 FASTIQ GIFT
              </p>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.3 }}>
                Give Your Student<br />FastIQ Free
              </h2>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', padding: 4, marginTop: -4 }}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div style={{ padding: '24px 28px 28px' }}>
          {done ? (
            <div className="text-center">
              <p style={{ fontSize: 32, marginBottom: 12 }}>🎉</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>
                {status === 'activated' ? 'Gift activated!' : 'Invite sent!'}
              </p>
              <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 20 }}>
                {status === 'already_active'
                  ? 'Your student already has an active FastIQ subscription — no action needed!'
                  : status === 'activated'
                  ? 'Your student now has 7 days of full FastIQ access. We sent them an email to let them know.'
                  : "We sent your student an invite. Once they sign up, FastIQ will activate automatically."}
              </p>
              <button
                onClick={onClose}
                style={{ background: '#E85D20', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', minHeight: 'auto' }}
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, marginBottom: 20 }}>
                Your student gets <strong>7 days of full FastIQ access</strong> — alumni search, AI outreach drafts, resume tailoring, mock interviews, and their personalized daily briefing.
                <br /><br />
                <span style={{ color: '#22C55E', fontWeight: 600 }}>No credit card needed. No commitment.</span>
              </p>

              <label style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
                Student's email address
              </label>
              <input
                type="email"
                placeholder="student@university.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGift()}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1.5px solid #E0E0E0', fontSize: 15, outline: 'none', marginBottom: 12, boxSizing: 'border-box' }}
              />

              <button
                onClick={() => handleGift()}
                disabled={!email.trim() || loading}
                style={{ width: '100%', background: email.trim() ? '#E85D20' : '#E0E0E0', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 600, color: '#fff', cursor: email.trim() ? 'pointer' : 'default', minHeight: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Gift →'}
              </button>

              {savedEmail && (
                <button
                  onClick={() => handleGift(savedEmail)}
                  disabled={loading}
                  style={{ width: '100%', background: 'none', border: 'none', marginTop: 12, fontSize: 13, color: '#E85D20', cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline' }}
                >
                  Use {savedEmail} on file →
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}