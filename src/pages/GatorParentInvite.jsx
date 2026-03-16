import React, { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { trackEvent } from '@/components/utils/analytics';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle, ArrowLeft, Lock } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';
const orangeHover = '#d44e14';

function TicketIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="20" height="16" rx="3" stroke={orange} strokeWidth="1.8"/>
      <path d="M2 10h20M9 4v16" stroke={orange} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="13.5" cy="14" r="1" fill={orange}/>
      <circle cx="16.5" cy="14" r="1" fill={orange}/>
    </svg>
  );
}

function RequestIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="2" width="16" height="20" rx="2" stroke={orange} strokeWidth="1.8"/>
      <path d="M8 7h8M8 11h8M8 15h5" stroke={orange} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

export default function GatorParentInvite() {
  const { toast } = useToast();

  // Have Code state
  const [inviteCode, setInviteCode] = useState('');
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [codeUserType, setCodeUserType] = useState('');

  // Request Access state
  const [userType, setUserType] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  useEffect(() => {
    if (!document.getElementById('join-page-fonts')) {
      const link = document.createElement('link');
      link.id = 'join-page-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const handleJoinWithCode = async () => {
    if (!inviteCode.trim()) {
      toast({ title: "Code Required", description: "Please enter your invite code", variant: "destructive" });
      return;
    }
    if (!codeUserType) {
      toast({ title: "Please Select Role", description: "Please select whether you're an alumni or parent", variant: "destructive" });
      return;
    }

    setIsVerifyingCode(true);
    const code = inviteCode.trim().toUpperCase();

    try {
      let response;
      try {
        response = await base44.functions.invoke('verifyInviteCode', { code });
      } catch (firstErr) {
        await new Promise(r => setTimeout(r, 2000));
        response = await base44.functions.invoke('verifyInviteCode', { code });
      }

      if (!response.data?.success) {
        toast({ title: "Invalid Code", description: response.data?.error || 'Invalid invite code. Please check and try again.', variant: "destructive" });
        setIsVerifyingCode(false);
        return;
      }

      const role = codeUserType === 'alumni' ? 'alumni' : 'parent';
      localStorage.setItem('pending_invite_role', role);
      localStorage.setItem('pending_invite_code', code);
      localStorage.setItem('pending_invite_timestamp', Date.now().toString());
      navigate('GatorAuth');
    } catch (error) {
      toast({ title: "Error", description: "Failed to verify invite code. Please try again.", variant: "destructive" });
      setIsVerifyingCode(false);
    }
  };

  const handleRequestInvite = async () => {
    if (!userType || !fullName.trim() || !email.trim()) {
      toast({ title: "Missing Information", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    trackEvent('parent_invite_request_submitted', { userType });

    try {
      const role = userType === 'alumni' ? 'alumni' : 'parent';

      await base44.entities.InviteRequest.create({
        email: email.trim(),
        full_name: fullName.trim(),
        name: fullName.trim(),
        user_type: userType,
        role,
        reason: reason.trim(),
        status: 'pending'
      });

      try {
        const allUsers = await base44.entities.User.list();
        const admins = allUsers.filter(u => u.roles?.includes('admin') || u.role === 'admin');
        for (const admin of admins) {
          await base44.entities.Notification.create({
            recipient_email: admin.email,
            type: 'application_received',
            title: '🆕 New Invite Request',
            message: `${fullName.trim()} (${email.trim()}) requested to join as ${role}`,
            action_url: 'AdminDashboard',
            action_label: 'Review Request',
            priority: 'high'
          });
        }
      } catch {}

      setRequestSubmitted(true);
    } catch (error) {
      toast({ title: "Submission Failed", description: "Please try again or contact support.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen
  if (requestSubmitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f2ee', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 420, width: '100%', background: '#fff', borderRadius: 20, padding: '48px 32px', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle style={{ width: 32, height: 32, color: '#16a34a' }} />
          </div>
          <h2 style={{ fontFamily: playfair, fontSize: 26, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>Request Submitted!</h2>
          <p style={{ fontFamily: dmSans, fontSize: 15, color: '#666', lineHeight: 1.6, marginBottom: 16 }}>
            Thanks! We'll review your request and send you an invite code within 24-48 hours.
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 13, color: '#999', marginBottom: 28 }}>
            Check your email: <span style={{ fontWeight: 600, color: '#555' }}>{email}</span>
          </p>
          <button
            onClick={() => navigate('LandingPage')}
            style={{
              width: '100%', padding: 14, borderRadius: 100, border: 'none',
              background: orange, color: '#fff', fontFamily: dmSans, fontSize: 15,
              fontWeight: 600, cursor: 'pointer', minHeight: 48,
            }}
          >
            Back to Homepage
          </button>
        </div>
      </div>
    );
  }

  const toggleBtnStyle = (active) => ({
    flex: 1, padding: '12px 16px', borderRadius: 10, border: 'none',
    background: active ? orange : '#fff',
    color: active ? '#fff' : '#666',
    fontFamily: dmSans, fontSize: 14, fontWeight: 500,
    cursor: 'pointer', transition: 'all 0.2s',
    outline: active ? 'none' : '1.5px solid rgba(0,0,0,0.12)',
    minHeight: 'auto',
  });

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    border: '1.5px solid rgba(0,0,0,0.12)', fontFamily: dmSans,
    fontSize: 14, color: '#1a1a1a', background: '#fff',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
  };

  const ctaBtnStyle = (enabled) => ({
    width: '100%', padding: 14, borderRadius: 12, border: 'none',
    background: enabled ? orange : 'rgba(0,0,0,0.08)',
    color: enabled ? '#fff' : '#bbb',
    fontFamily: dmSans, fontSize: 15, fontWeight: 600,
    cursor: enabled ? 'pointer' : 'not-allowed',
    transition: 'all 0.2s', minHeight: 48,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f4f2ee', padding: '40px 16px 60px', overflowX: 'hidden' }}>
      <style>{`
        .join-input:focus { border-color: ${orange} !important; }
        .join-input::placeholder { color: rgba(0,0,0,0.3); }
        @keyframes joinFade { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
      `}</style>

      <div style={{ maxWidth: 840, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36, animation: 'joinFade 0.4s ease both' }}>
          <p style={{ fontFamily: dmSans, fontSize: 18, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.02em', marginBottom: 8 }}>CFF</p>
          <h1 style={{ fontFamily: playfair, fontSize: 32, fontWeight: 700, color: '#1a1a1a', marginBottom: 8, lineHeight: 1.2 }}>
            Join College Fast Forward
          </h1>
          <p style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 400, color: '#999' }}>
            For Parents &amp; Alumni
          </p>
        </div>

        {/* Two cards */}
        <div style={{ display: 'grid', gap: 20 }} className="join-cards-grid">
          {/* LEFT — Have Code */}
          <div style={{
            background: '#fff', borderRadius: 20, padding: '32px 28px',
            border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            animation: 'joinFade 0.4s 0.1s ease both',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: 'rgba(232,93,32,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <TicketIcon />
              </div>
              <h2 style={{ fontFamily: dmSans, fontSize: 20, fontWeight: 700, color: '#1a1a1a' }}>
                I Have an Invite Code
              </h2>
            </div>

            <p style={{ fontFamily: dmSans, fontSize: 14, color: '#888', lineHeight: 1.6, marginBottom: 20 }}>
              Got a code from a student or family member? Enter it below to join.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 8 }}>
                  I am a: <span style={{ color: '#ef4444' }}>★</span>
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={toggleBtnStyle(codeUserType === 'alumni')} onClick={() => setCodeUserType('alumni')}>Alumni</button>
                  <button style={toggleBtnStyle(codeUserType === 'parent')} onClick={() => setCodeUserType('parent')}>Parent</button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 8 }}>
                  Invite Code
                </label>
                <input
                  className="join-input"
                  type="text"
                  placeholder="CFF-XXXXX"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  style={{ ...inputStyle, textAlign: 'center', letterSpacing: '0.08em', fontWeight: 500, fontSize: 16 }}
                  maxLength={20}
                />
              </div>

              <button
                onClick={handleJoinWithCode}
                disabled={!inviteCode.trim() || !codeUserType || isVerifyingCode}
                style={ctaBtnStyle(!!inviteCode.trim() && !!codeUserType && !isVerifyingCode)}
                onMouseEnter={e => { if (inviteCode.trim() && codeUserType && !isVerifyingCode) e.currentTarget.style.background = orangeHover; }}
                onMouseLeave={e => { if (inviteCode.trim() && codeUserType && !isVerifyingCode) e.currentTarget.style.background = orange; }}
              >
                {isVerifyingCode ? (
                  <><Loader2 style={{ width: 18, height: 18, animation: 'spin 0.8s linear infinite' }} /> Verifying...</>
                ) : 'Join with Code →'}
              </button>
            </div>
          </div>

          {/* RIGHT — Request Invite */}
          <div style={{
            background: '#fff', borderRadius: 20, padding: '32px 28px',
            border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            animation: 'joinFade 0.4s 0.2s ease both',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: 'rgba(232,93,32,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <RequestIcon />
              </div>
              <h2 style={{ fontFamily: dmSans, fontSize: 20, fontWeight: 700, color: '#1a1a1a' }}>
                Request an Invite Code
              </h2>
            </div>

            <p style={{ fontFamily: dmSans, fontSize: 14, color: '#888', lineHeight: 1.6, marginBottom: 20 }}>
              Don't have a code? Request access and we'll send you an invite within 24-48 hours.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 8 }}>
                  I am a: <span style={{ color: '#ef4444' }}>★</span>
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={toggleBtnStyle(userType === 'alumni')} onClick={() => setUserType('alumni')}>Alumni</button>
                  <button style={toggleBtnStyle(userType === 'parent')} onClick={() => setUserType('parent')}>Parent of a Student</button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 8 }}>
                  Full Name <span style={{ color: '#ef4444' }}>★</span>
                </label>
                <input
                  className="join-input"
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 8 }}>
                  Email <span style={{ color: '#ef4444' }}>★</span>
                </label>
                <input
                  className="join-input"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 8 }}>
                  Why do you want to join? <span style={{ fontWeight: 300, color: '#bbb' }}>(optional)</span>
                </label>
                <textarea
                  className="join-input"
                  placeholder="e.g., Want to help students in marketing"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={200}
                  style={{ ...inputStyle, minHeight: 72, resize: 'none', fontFamily: dmSans }}
                />
                <p style={{ fontFamily: dmSans, fontSize: 11, color: '#ccc', textAlign: 'right', marginTop: 4 }}>{reason.length}/200</p>
              </div>

              <button
                onClick={handleRequestInvite}
                disabled={!userType || !fullName.trim() || !email.trim() || isSubmitting}
                style={ctaBtnStyle(!!userType && !!fullName.trim() && !!email.trim() && !isSubmitting)}
                onMouseEnter={e => { if (userType && fullName.trim() && email.trim() && !isSubmitting) e.currentTarget.style.background = orangeHover; }}
                onMouseLeave={e => { if (userType && fullName.trim() && email.trim() && !isSubmitting) e.currentTarget.style.background = orange; }}
              >
                {isSubmitting ? (
                  <><Loader2 style={{ width: 18, height: 18, animation: 'spin 0.8s linear infinite' }} /> Submitting...</>
                ) : 'Request Invite →'}
              </button>

              <p style={{ fontFamily: dmSans, fontSize: 12, color: '#bbb', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Lock style={{ width: 12, height: 12 }} />
                Your info is secure and only used to process your invite request
              </p>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button
            onClick={() => navigate('LandingPage')}
            style={{
              background: 'none', border: 'none', fontFamily: dmSans,
              fontSize: 13, color: '#aaa', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              minHeight: 'auto', width: 'auto',
            }}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} />
            Back to homepage
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .join-cards-grid {
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 768px) {
          .join-cards-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}