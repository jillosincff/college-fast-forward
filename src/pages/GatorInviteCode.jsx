import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import { useAuth } from '@/components/auth/AuthContext';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';
const orangeHover = '#d44e14';

export default function GatorInviteCode() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showJoinWithout, setShowJoinWithout] = useState(false);

  const pendingRole = localStorage.getItem('pending_invite_role');

  // Check for approved invite (auto-fill)
  useEffect(() => {
    if (!user?.email) return;
    (async () => {
      try {
        const response = await base44.functions.invoke('checkApprovedInvite', { email: user.email });
        if (response.data?.success && response.data?.has_approved_invite && response.data?.code_valid) {
          setReferralCode(response.data.invite_code);
        }
      } catch {}
    })();
  }, [user?.email]);

  // Clear stale pending data
  useEffect(() => {
    const ts = localStorage.getItem('pending_invite_timestamp');
    if (ts && Date.now() - parseInt(ts) > 30 * 60 * 1000) {
      localStorage.removeItem('pending_invite_code');
      localStorage.removeItem('pending_invite_timestamp');
      localStorage.removeItem('pending_invite_role');
    }
  }, []);

  const handleContinue = async () => {
    setError('');
    setShowJoinWithout(false);
    const trimmed = referralCode.trim().toUpperCase();

    // If no code entered, skip straight to onboarding
    if (!trimmed) {
      proceedToOnboarding(null);
      return;
    }

    setIsVerifying(true);

    try {
      let response;
      try {
        response = await base44.functions.invoke('verifyInviteCode', { code: trimmed });
      } catch (firstErr) {
        await new Promise(r => setTimeout(r, 2000));
        response = await base44.functions.invoke('verifyInviteCode', { code: trimmed });
      }

      if (response.data?.success) {
        // Valid code — attribute and proceed
        const userSelectedRole = localStorage.getItem('pending_invite_role');
        const codeRole = response.data.role;
        const role = userSelectedRole || codeRole || 'parent';

        localStorage.setItem('pending_invite_code', trimmed);
        localStorage.setItem('pending_invite_role', role);
        localStorage.setItem('pending_invite_timestamp', Date.now().toString());

        if (user) {
          navigate('GatorWelcome');
        } else {
          navigate('GatorAuth');
        }
      } else {
        // Invalid code — show subtle error but don't block
        setError("That code doesn't look right.");
        setShowJoinWithout(true);
        setIsVerifying(false);
      }
    } catch (err) {
      // Network/server error — show subtle message, still allow proceeding
      setError("That code doesn't look right.");
      setShowJoinWithout(true);
      setIsVerifying(false);
    }
  };

  const proceedToOnboarding = async (code) => {
    // Try to attribute referral code to ambassador
    if (code) {
      try {
        const ambassadors = await base44.entities.Ambassador.filter({ code: code });
        if (ambassadors.length > 0) {
          const amb = ambassadors[0];
          await base44.entities.Ambassador.update(amb.id, { referral_count: (amb.referral_count || 0) + 1 });
          if (user) {
            await base44.auth.updateMe({ referral_code: code, referred_by: amb.id });
          }
        }
      } catch (e) {
        console.log('Ambassador attribution failed (non-critical):', e.message);
      }
    }

    // Store role and code (use 'direct' when no code provided so routing doesn't block)
    const role = localStorage.getItem('pending_invite_role') || 'parent';
    localStorage.setItem('pending_invite_role', role);
    localStorage.setItem('pending_invite_code', code || 'direct');
    localStorage.setItem('pending_invite_timestamp', Date.now().toString());
    sessionStorage.setItem('pending_invite_role', role);
    sessionStorage.setItem('pending_invite_code', code || 'direct');

    if (user) {
      navigate('GatorWelcome');
    } else {
      navigate('GatorAuth');
    }
  };

  const handleJoinWithoutCode = () => {
    proceedToOnboarding(null);
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0d1117',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
        @keyframes inviteFadeUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        .invite-field:focus { border-color: rgba(232,93,32,0.4) !important; outline: none; }
        .invite-field::placeholder { color: rgba(244,240,232,0.25); }
      `}</style>

      <div style={{
        maxWidth: 480, width: '100%', padding: '80px 40px',
        animation: 'inviteFadeUp 0.6s ease both',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 40, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#fff' }}>College Fast</span>
          <span style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: orange }}>F</span>
          <span style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#fff' }}>orward</span>
        </div>

        {/* Headline */}
        <h1 style={{ marginBottom: 12 }}>
          <span style={{ fontFamily: playfair, fontWeight: 700, fontSize: 28, color: '#f4f0e8', display: 'block', lineHeight: 1.3 }}>
            Welcome to{' '}
          </span>
          <span style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', fontSize: 28, color: orange }}>
            College Fast Forward.
          </span>
        </h1>

        {/* Subhead */}
        <p style={{
          fontFamily: dmSans, fontSize: 14, fontWeight: 300,
          color: 'rgba(244,240,232,0.55)', lineHeight: 1.7, marginBottom: 32,
        }}>
          You're joining a community of parents who help each other's students land jobs through real connections. If you have a referral code from an ambassador, enter it below.
        </p>

        {/* Referral code field */}
        <div style={{ marginBottom: 24 }}>
          <label style={{
            display: 'block', fontFamily: dmSans, fontSize: 13, fontWeight: 500,
            color: 'rgba(244,240,232,0.6)', marginBottom: 8,
          }}>
            Referral code <span style={{ fontWeight: 300, color: 'rgba(244,240,232,0.3)' }}>(optional)</span>
          </label>
          <input
            className="invite-field"
            style={{
              width: '100%', background: 'rgba(255,255,255,0.06)',
              border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 12,
              padding: '12px 16px', fontFamily: dmSans, fontSize: 14, fontWeight: 300,
              color: '#f4f0e8', boxSizing: 'border-box', transition: 'border-color 0.2s',
            }}
            value={referralCode}
            onChange={e => { setReferralCode(e.target.value.toUpperCase()); setError(''); setShowJoinWithout(false); }}
            placeholder="e.g. UF-SARAH"
            onKeyDown={e => e.key === 'Enter' && handleContinue()}
          />
          {error ? (
            <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: 'rgba(229,57,53,0.7)', marginTop: 6 }}>
              {error}
            </p>
          ) : (
            <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: 'rgba(244,240,232,0.3)', marginTop: 6 }}>
              Have a code from an ambassador? Enter it to give them credit.
            </p>
          )}
        </div>

        {/* Continue button */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={isVerifying}
          style={{
            width: '100%', padding: 14, borderRadius: 100, border: 'none',
            background: orange, color: '#fff',
            fontFamily: dmSans, fontSize: 15, fontWeight: 500,
            cursor: 'pointer', transition: 'all 0.2s', minHeight: 'auto',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
          onMouseEnter={e => { if (!isVerifying) e.currentTarget.style.background = orangeHover; }}
          onMouseLeave={e => { if (!isVerifying) e.currentTarget.style.background = orange; }}
        >
          {isVerifying ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : 'Join the Network →'}
        </button>

        {/* Join without code option */}
        {showJoinWithout && (
          <button
            type="button"
            onClick={handleJoinWithoutCode}
            style={{
              display: 'block', width: '100%', marginTop: 12, textAlign: 'center',
              background: 'none', border: 'none',
              fontFamily: dmSans, fontSize: 13, fontWeight: 300,
              color: 'rgba(244,240,232,0.4)', cursor: 'pointer',
              transition: 'color 0.2s', minHeight: 'auto',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(244,240,232,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(244,240,232,0.4)'; }}
          >
            Join without a code →
          </button>
        )}

        {/* Back link */}
        <button
          type="button"
          onClick={() => { localStorage.removeItem('pending_invite_role'); navigate('GatorAuth'); }}
          style={{
            display: 'block', width: '100%', marginTop: 32, textAlign: 'center',
            background: 'none', border: 'none',
            fontFamily: dmSans, fontSize: 12, fontWeight: 300,
            color: 'rgba(244,240,232,0.3)', cursor: 'pointer',
            transition: 'color 0.2s', minHeight: 'auto',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'rgba(244,240,232,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(244,240,232,0.3)'; }}
        >
          ← Back to role selection
        </button>
      </div>
    </div>
  );
}