import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { giftFastIQToStudent } from '@/functions/giftFastIQToStudent';
import { findStudentOnCFF } from '@/functions/findStudentOnCFF';

// step: 'search' | 'results' | 'email' | 'done'
export default function GiftFastIQModal({ user, onClose }) {
  const [step, setStep] = useState('search');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [searching, setSearching] = useState(false);
  const [matches, setMatches] = useState([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [doneStatus, setDoneStatus] = useState(null); // { status, studentName, email }

  const savedEmail = user?.student_emails?.[0] || null;

  // Step 1 — Search by name
  const handleSearch = async () => {
    if (!firstName.trim() || !lastName.trim()) return;
    setSearching(true);
    try {
      const res = await findStudentOnCFF({ firstName: firstName.trim(), lastName: lastName.trim() });
      const found = res?.data?.matches || [];
      setMatches(found);
      setStep('results');
    } catch (e) {
      console.error(e);
      setMatches([]);
      setStep('results');
    }
    setSearching(false);
  };

  // Step 2a — Gift to found student by ID
  const handleGiftById = async (studentId, studentName) => {
    setLoading(true);
    try {
      const res = await giftFastIQToStudent({ studentId });
      const status = res?.data?.status || 'activated';
      setDoneStatus({ status, studentName, email: null });
      setStep('done');
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  // Step 2b — Gift by email (student not found or parent enters manually)
  const handleGiftByEmail = async (emailToUse) => {
    const target = (emailToUse || email).trim().toLowerCase();
    if (!target) return;
    setLoading(true);
    try {
      const res = await giftFastIQToStudent({ studentEmail: target });
      const status = res?.data?.status || 'activated';
      setDoneStatus({ status, studentName: null, email: target });
      setStep('done');
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    border: '1.5px solid #E0E0E0', fontSize: 15, outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit',
  };

  const btnPrimary = (disabled) => ({
    width: '100%', background: disabled ? '#E0E0E0' : '#E85D20',
    border: 'none', borderRadius: 10, padding: '13px',
    fontSize: 15, fontWeight: 600, color: '#fff',
    cursor: disabled ? 'default' : 'pointer',
    minHeight: 'auto', display: 'flex',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  });

  const btnGhost = {
    background: 'none', border: 'none', fontSize: 13,
    color: '#E85D20', cursor: 'pointer', minHeight: 'auto',
    textDecoration: 'underline', width: '100%', marginTop: 10, padding: 0,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>

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

          {/* STEP: search */}
          {step === 'search' && (
            <>
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, marginBottom: 20 }}>
                Your student gets <strong>7 days of full FastIQ access</strong> — alumni search, AI outreach drafts, resume tailoring, mock interviews, and their personalized daily briefing.{' '}
                <span style={{ color: '#22C55E', fontWeight: 600 }}>No credit card. No commitment.</span>
              </p>

              <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginBottom: 12 }}>
                Is your student already on CFF?
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>First Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Alex"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Last Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Smith"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    style={inputStyle}
                  />
                </div>
              </div>

              <button
                onClick={handleSearch}
                disabled={!firstName.trim() || !lastName.trim() || searching}
                style={btnPrimary(!firstName.trim() || !lastName.trim() || searching)}
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search →'}
              </button>

              <button onClick={() => setStep('email')} style={btnGhost}>
                Skip — I'll enter their email directly
              </button>

              {savedEmail && (
                <button onClick={() => handleGiftByEmail(savedEmail)} disabled={loading} style={{ ...btnGhost, color: '#555' }}>
                  Use {savedEmail} on file →
                </button>
              )}
            </>
          )}

          {/* STEP: results */}
          {step === 'results' && (
            <>
              <button onClick={() => setStep('search')} style={{ background: 'none', border: 'none', fontSize: 13, color: '#888', cursor: 'pointer', minHeight: 'auto', padding: '0 0 16px', display: 'block' }}>
                ← Back
              </button>

              {matches.length === 0 ? (
                <>
                  <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, marginBottom: 20 }}>
                    No match found for <strong>{firstName} {lastName}</strong> at your school. They may not have signed up yet — enter their email and we'll send them an invite.
                  </p>
                  <button onClick={() => setStep('email')} style={btnPrimary(false)}>
                    Enter Their Email →
                  </button>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 13, color: '#555', marginBottom: 16 }}>
                    We found {matches.length} match{matches.length > 1 ? 'es' : ''} — is this your student?
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                    {matches.map(m => (
                      <div key={m.id} style={{ border: '1.5px solid #E0E0E0', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#0A0A0A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                            {m.avatar_initials}
                          </div>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: '0 0 2px' }}>{m.first_name} {m.last_name}</p>
                            <p style={{ fontSize: 12, color: '#888', margin: 0 }}>{m.school_name || 'CFF Member'}</p>
                          </div>
                        </div>
                        {m.already_has_fastiq ? (
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#22C55E', background: '#F0FFF4', border: '1px solid #BBF7D0', borderRadius: 20, padding: '3px 10px', whiteSpace: 'nowrap' }}>
                            Active ✓
                          </span>
                        ) : (
                          <button
                            onClick={() => handleGiftById(m.id, m.first_name)}
                            disabled={loading}
                            style={{ background: '#E85D20', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', minHeight: 'auto', flexShrink: 0 }}
                          >
                            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Gift →'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setStep('email')} style={btnGhost}>
                    Not them — use email instead
                  </button>
                </>
              )}
            </>
          )}

          {/* STEP: email */}
          {step === 'email' && (
            <>
              <button onClick={() => setStep('search')} style={{ background: 'none', border: 'none', fontSize: 13, color: '#888', cursor: 'pointer', minHeight: 'auto', padding: '0 0 16px', display: 'block' }}>
                ← Back
              </button>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
                Student's email address
              </label>
              <input
                type="email"
                placeholder="student@university.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGiftByEmail()}
                style={{ ...inputStyle, marginBottom: 12 }}
              />
              <button
                onClick={() => handleGiftByEmail()}
                disabled={!email.trim() || loading}
                style={btnPrimary(!email.trim() || loading)}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Gift →'}
              </button>
              {savedEmail && (
                <button onClick={() => handleGiftByEmail(savedEmail)} disabled={loading} style={btnGhost}>
                  Use {savedEmail} on file →
                </button>
              )}
            </>
          )}

          {/* STEP: done */}
          {step === 'done' && doneStatus && (
            <div className="text-center">
              <p style={{ fontSize: 32, marginBottom: 12 }}>
                {doneStatus.status === 'already_active' ? '✅' : '🎉'}
              </p>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>
                {doneStatus.status === 'already_active'
                  ? 'Already active!'
                  : doneStatus.status === 'activated'
                  ? `Done! ${doneStatus.studentName || doneStatus.email || 'Your student'}'s access is live.`
                  : 'Invite sent!'}
              </p>
              <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 20 }}>
                {doneStatus.status === 'already_active'
                  ? 'Your student already has an active FastIQ subscription — no action needed!'
                  : doneStatus.status === 'activated'
                  ? `We've emailed ${doneStatus.studentName || doneStatus.email} their access. They can start using FastIQ immediately.`
                  : `We sent an invite to ${doneStatus.email}. Once they sign up, FastIQ will activate automatically.`}
              </p>
              <button onClick={onClose} style={{ background: '#E85D20', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', minHeight: 'auto' }}>
                Done
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}