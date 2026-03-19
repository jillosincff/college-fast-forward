import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate, useParams } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import GoogleSignInButton from '@/components/onboarding/student/GoogleSignInButton';
import SchoolSearchInput from '@/components/onboarding/student/SchoolSearchInput';
import FastIQActivatingScreen from '@/components/onboarding/student/FastIQActivatingScreen';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const ORANGE = '#E85D20';

/**
 * FLOW A — Student invited by parent.
 * Triggered via invite link: #StudentInvitedOnboarding?email=...&parent=...&school=...
 * 3 screens: Landing → Confirm Details → FastIQ Activation
 */
export default function StudentInvitedOnboarding() {
  const { user, refreshUser, isLoading } = useAuth();
  const params = useParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data from invite link
  const parentName = params.parent || 'Your parent';
  const prefilledEmail = params.email || '';
  const prefilledSchool = params.school || '';

  // Form state
  const [firstName, setFirstName] = useState('');
  const [school, setSchool] = useState(prefilledSchool);
  const [editingSchool, setEditingSchool] = useState(false);

  // Load fonts
  useEffect(() => {
    if (!document.getElementById('student-onb-fonts')) {
      const link = document.createElement('link');
      link.id = 'student-onb-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,400&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  // After OAuth, pre-fill name and advance to step 2
  useEffect(() => {
    if (user && step === 1) {
      const name = user.full_name?.split(' ')[0] || '';
      setFirstName(name);
      setStep(2);
    }
  }, [user, step]);

  const handleGoogleSignIn = () => {
    setLoading(true);
    setError(null);
    // Store invite context so it survives OAuth redirect
    try {
      localStorage.setItem('pending_invite_role', 'gator');
      localStorage.setItem('pending_student_invite_parent', parentName);
      localStorage.setItem('pending_student_invite_school', prefilledSchool);
      localStorage.setItem('pending_student_invite_email', prefilledEmail);
    } catch (e) { /* private browsing */ }

    const callbackUrl = window.location.origin + '/#StudentInvitedOnboarding?email=' + encodeURIComponent(prefilledEmail) + '&parent=' + encodeURIComponent(parentName) + '&school=' + encodeURIComponent(prefilledSchool);
    base44.auth.redirectToLogin(callbackUrl);
  };

  const handleConfirm = async () => {
    if (!firstName.trim() || !school.trim()) return;
    setLoading(true);

    const updateData = {
      persona: 'gator',
      roles: ['gator'],
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
      is_new_signup: true,
      invite_code_used: 'parent_invite',
      school: school.trim(),
      university: school.trim(),
      first_name: firstName.trim(),
    };

    // Only update full_name if it's different
    if (user.full_name !== firstName.trim()) {
      updateData.full_name = firstName.trim();
    }

    await base44.auth.updateMe(updateData);

    // Auto-link to parent (non-blocking)
    base44.functions.invoke('linkStudentToParent', {
      action: 'auto_link',
      studentUserId: user.id,
      studentEmailAddress: user.email,
    }).catch(() => {});

    // Award karma (non-blocking)
    base44.functions.invoke('awardStudentKarma', {
      userId: user.id, userEmail: user.email,
      actionType: 'complete_profile', description: 'Completed student profile (invited)',
    }).catch(() => {});

    // Welcome email (non-blocking)
    base44.functions.invoke('sendWelcomeEmail', {
      userId: user.id, userEmail: user.email,
      userName: firstName.trim(), persona: 'gator',
    }).catch(() => {});

    // Clean up
    localStorage.removeItem('pending_invite_role');
    localStorage.removeItem('pending_student_invite_parent');
    localStorage.removeItem('pending_student_invite_school');
    localStorage.removeItem('pending_student_invite_email');

    if (refreshUser) await refreshUser();
    setLoading(false);
    setStep(3);
  };

  const handleActivationComplete = useCallback(() => {
    navigate('Dashboard');
  }, []);

  // Handle OAuth error
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    if (hashParams.get('error')) {
      setError('Something went wrong. Please try again.');
    }
  }, []);

  // ── SCREEN 3: FastIQ Activation ──
  if (step === 3) {
    return <FastIQActivatingScreen onComplete={handleActivationComplete} />;
  }

  // ── SCREEN 2: Confirm Details ──
  if (step === 2 && user) {
    const isValid = firstName.trim().length > 0 && school.trim().length > 0;
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ maxWidth: 480, width: '100%' }}>
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 12, padding: '40px 32px' }}>
            <h1 style={{ fontFamily: dmSans, fontWeight: 700, fontSize: 24, color: '#fff', lineHeight: 1.3, marginBottom: 8 }}>
              Quick — just confirm these details.
            </h1>
            <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: '#888', lineHeight: 1.6, marginBottom: 32 }}>
              Your parent already set most of this up. Just make sure it's right.
            </p>

            {/* First name */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
                Your first name
              </label>
              <input
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Your first name"
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.06)',
                  border: '1px solid #2A2A2A', borderRadius: 12, padding: '14px 16px',
                  fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: '#fff', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = ORANGE; }}
                onBlur={e => { e.target.style.borderColor = '#2A2A2A'; }}
              />
            </div>

            {/* School */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: 'block', fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
                Your school
              </label>
              {!editingSchool && school ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#fff',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid #2A2A2A',
                    borderRadius: 100, padding: '10px 20px',
                  }}>
                    {school}
                  </span>
                  <button
                    onClick={() => setEditingSchool(true)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: ORANGE,
                      minHeight: 'auto', width: 'auto', padding: 0,
                    }}
                  >
                    Change →
                  </button>
                </div>
              ) : (
                <SchoolSearchInput
                  value={school}
                  onChange={val => { setSchool(val); if (val) setEditingSchool(false); }}
                />
              )}
            </div>

            {/* CTA */}
            <button
              onClick={handleConfirm}
              disabled={!isValid || loading}
              style={{
                width: '100%', padding: '16px 24px', borderRadius: 100, border: 'none',
                background: isValid && !loading ? ORANGE : 'rgba(232,93,32,0.3)',
                color: '#fff', fontFamily: dmSans, fontSize: 16, fontWeight: 600,
                cursor: isValid && !loading ? 'pointer' : 'not-allowed',
                minHeight: 'auto', transition: 'background 0.2s',
              }}
            >
              {loading ? 'Setting up...' : "That's right — let's go →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── SCREEN 1: Personal Landing Page ──
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        {/* Parent invite label */}
        <p style={{
          fontFamily: dmSans, fontSize: 11, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.14em',
          color: ORANGE, marginBottom: 24,
        }}>
          {parentName} invited you to College Fast Forward
        </p>

        {/* Header */}
        <h1 style={{
          fontFamily: dmSans, fontWeight: 700, fontSize: 'clamp(26px, 5vw, 36px)',
          color: '#fff', lineHeight: 1.2, marginBottom: 12,
        }}>
          {parentName} just set something up for you.
        </h1>

        {/* Subhead */}
        <p style={{
          fontFamily: playfair, fontWeight: 400, fontStyle: 'italic',
          fontSize: 'clamp(18px, 3vw, 24px)', color: ORANGE,
          lineHeight: 1.4, marginBottom: 20,
        }}>
          Your job search just got a serious upgrade.
        </p>

        {/* Body */}
        <p style={{
          fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: '#fff',
          lineHeight: 1.7, marginBottom: 40, maxWidth: 400, margin: '0 auto 40px',
        }}>
          FastIQ is ready to build your career plan — target companies, alumni to contact, and personalized outreach messages. All you need to do is get started.
        </p>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
            <p style={{ fontFamily: dmSans, fontSize: 13, color: '#e53935', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* CTA */}
        <GoogleSignInButton onClick={handleGoogleSignIn} loading={loading} />

        {/* Fine print */}
        <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#888', marginTop: 16 }}>
          Takes less than 60 seconds to get started.
        </p>
      </div>
    </div>
  );
}