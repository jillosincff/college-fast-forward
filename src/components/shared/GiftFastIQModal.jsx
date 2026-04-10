import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { giftFastIQToStudent } from '@/functions/giftFastIQToStudent';
import { findStudentOnCFF } from '@/functions/findStudentOnCFF';

const dm = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

export default function GiftFastIQModal({ user, onClose }) {
  const [step, setStep] = useState('search'); // search | found | multiple | notfound | email | loading | success
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [searching, setSearching] = useState(false);
  const [matches, setMatches] = useState([]);
  const [email, setEmail] = useState('');
  const [gifting, setGifting] = useState(false);
  const [result, setResult] = useState(null); // { status, studentName }

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

  const doGift = async ({ studentId, studentEmail }) => {
    setStep('loading');
    setGifting(true);
    try {
      const payload = studentId ? { studentId } : { studentEmail: studentEmail.trim().toLowerCase() };
      const res = await giftFastIQToStudent(payload);
      const status = res?.data?.status || 'activated';
      const studentName = res?.data?.studentName || (studentId ? matches[0]?.first_name : null) || null;
      setResult({ status, studentName, email: studentEmail || null });
      setStep('success');
    } catch (e) {
      setResult({ status: 'pending', studentName: null, email: studentEmail || null });
      setStep('success');
    }
    setGifting(false);
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

  const backBtn = (
    <button onClick={() => setStep('search')} style={{ background: 'none', border: 'none', fontSize: 13, color: '#888', cursor: 'pointer', minHeight: 'auto', padding: '0 0 16px', display: 'block', fontFamily: dm }}>
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
                Give Your Student<br />FastIQ Free
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
              {backBtn}
              {matches[0].already_has_fastiq ? (
                <>
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <p style={{ fontSize: 28, margin: '0 0 12px' }}>✅</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px', fontFamily: playfair }}>
                      {matches[0].first_name} is already set!
                    </p>
                    <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, fontFamily: dm }}>
                      {matches[0].first_name} is already on CFF with FastIQ access — they're all set!
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
                    <button onClick={() => doGift({ studentId: matches[0].id })} style={{ ...btnOrange(false), flex: 2 }}>
                      Yes, Gift FastIQ Free →
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
              {backBtn}
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, marginBottom: 16, fontFamily: dm }}>
                We found a few students named <strong>{firstName} {lastName}</strong>.<br />Enter their email so we can find the right one:
              </p>
              <input type="email" placeholder="student@university.edu" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && email.trim() && doGift({ studentEmail: email })} style={{ ...inputStyle, marginBottom: 12 }} />
              <button onClick={() => doGift({ studentEmail: email })} disabled={!email.trim()} style={btnOrange(!email.trim())}>
                Find My Student →
              </button>
            </>
          )}

          {/* STEP: no match */}
          {step === 'notfound' && (
            <>
              {backBtn}
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, marginBottom: 16, fontFamily: dm }}>
                We don't see anyone by that name on CFF yet.<br /><br />
                Enter their email and we'll send them a free FastIQ trial invite:
              </p>
              <input type="email" placeholder="student@university.edu" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && email.trim() && doGift({ studentEmail: email })} style={{ ...inputStyle, marginBottom: 12 }} />
              <button onClick={() => doGift({ studentEmail: email })} disabled={!email.trim()} style={btnOrange(!email.trim())}>
                Send Invite →
              </button>
            </>
          )}

          {/* STEP: email (manual entry / skip) */}
          {step === 'email' && (
            <>
              {backBtn}
              <label style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8, fontFamily: dm }}>
                Student's email address
              </label>
              <input type="email" placeholder="student@university.edu" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && email.trim() && doGift({ studentEmail: email })} style={{ ...inputStyle, marginBottom: 12 }} />
              <button onClick={() => doGift({ studentEmail: email })} disabled={!email.trim()} style={btnOrange(!email.trim())}>
                Send Gift →
              </button>
              {savedEmail && (
                <button onClick={() => doGift({ studentEmail: savedEmail })} style={{ ...btnGhost, marginTop: 12 }}>
                  Use {savedEmail} on file →
                </button>
              )}
            </>
          )}

          {/* STEP: loading */}
          {step === 'loading' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ fontSize: 28, marginBottom: 12 }}>🎁</p>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', fontFamily: dm }}>Sending gift...</p>
            </div>
          )}

          {/* STEP: success */}
          {step === 'success' && result && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 32, marginBottom: 12 }}>
                {result.status === 'already_active' ? '✅' : result.status === 'pending' ? '📬' : '🎉'}
              </p>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', marginBottom: 10, fontFamily: playfair }}>
                {result.status === 'already_active'
                  ? 'Already covered!'
                  : result.status === 'pending'
                  ? 'Invite sent!'
                  : 'Done!'}
              </p>
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: 24, fontFamily: dm }}>
                {result.status === 'already_active'
                  ? `${result.studentName || 'Your student'} already has FastIQ access. They're all set.`
                  : result.status === 'activated'
                  ? `${result.studentName ? result.studentName + "'s" : "Your student's"} FastIQ trial is active right now. We've sent them an email so they know. Their trial runs for 7 days. If they love it, lock in $14.50/mo before April 15th.`
                  : `We've emailed ${result.email || 'your student'} with their free FastIQ trial. Their 7-day clock starts the moment they sign up.`}
              </p>
              {result.status === 'activated' && (
                <div style={{ display: 'flex', gap: 10, marginBottom: 4 }}>
                  <a
                    href="https://collegefastforward.com/#FastIQDashboard"
                    style={{ ...btnOrange(false), flex: 2, textDecoration: 'none', fontSize: 13 }}
                  >
                    Lock In Founding Rate →
                  </a>
                  <button onClick={onClose} style={{ ...btnOutline, flex: 1 }}>Close</button>
                </div>
              )}
              {result.status !== 'activated' && (
                <button onClick={onClose} style={btnOrange(false)}>Done</button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}