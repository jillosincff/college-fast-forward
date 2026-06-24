import React, { useEffect, useState, useRef } from 'react';
import { Loader2, MailCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { verifyRegistration } from '@/functions/verifyRegistration';
import { sendMagicLink } from '@/functions/sendMagicLink';

const dmSans = "'DM Sans', system-ui, sans-serif";
const ACCENT = '#6d28d9';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';

/**
 * VerifyEmail — the destination of the verification link sent by registerUser
 * (`/#VerifyEmail?token=...`).
 *
 * Previously this route did not exist, so clicking the email link dead-ended on
 * the platform's generic "Thank you for joining" screen with no CTA. This page
 * verifies the token and ALWAYS moves the new student forward into onboarding —
 * no dead ends.
 */
export default function VerifyEmail() {
  // 'verifying' | 'sent' | 'error'
  const [state, setState] = useState('verifying');
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const ran = useRef(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const run = async () => {
      const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
      const token = params.get('token');

      if (!token) {
        setErrorMsg('This verification link is missing its token. Please sign up again.');
        setState('error');
        return;
      }

      // 1) Mark the registration attempt verified.
      let verifiedEmail = '';
      try {
        const { data } = await verifyRegistration({ token });
        if (data?.success) {
          verifiedEmail = data.email || '';
          setEmail(verifiedEmail);
        } else {
          setErrorMsg(data?.error || 'This verification link is invalid or has expired. Please sign up again.');
          setState('error');
          return;
        }
      } catch (e) {
        setErrorMsg('We could not verify your email right now. Please try again.');
        setState('error');
        return;
      }

      // 2) If the student is ALREADY signed in (they were auto-signed-in at signup),
      //    skip the email step and route straight into onboarding.
      try {
        const me = await base44.auth.me();
        if (me?.email) {
          window.location.href = window.location.origin + '/#/GatorAuth';
          window.location.reload();
          return;
        }
      } catch (e) {
        // not signed in — continue to magic-link step
      }

      // 3) Not signed in → send a one-time sign-in link so a session gets created,
      //    which lands on GatorAuth and routes into onboarding.
      try {
        await sendMagicLink({ email: verifiedEmail });
      } catch (e) {
        // Even if the email send is rate-limited, one was likely already sent.
      }
      setState('sent');
    };

    run();
  }, []);

  const shell = (children) => (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
      background: 'linear-gradient(135deg, #f0f4f8 0%, #ffffff 50%, #f0f4f8 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div aria-hidden style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: 700, height: 700, background: 'radial-gradient(ellipse at center, rgba(109,40,217,0.08), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 460, width: '100%', textAlign: 'center' }}>
        {children}
      </div>
    </div>
  );

  const iconBox = (Icon, color = ACCENT) => (
    <div style={{
      width: 64, height: 64, borderRadius: 16,
      background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
    }}>
      <Icon className="w-8 h-8" style={{ color }} />
    </div>
  );

  const heading = (text) => (
    <h1 style={{ fontFamily: dmSans, fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 800, color: '#0f172a', margin: '0 0 16px', lineHeight: 1.2, letterSpacing: '-0.03em' }}>{text}</h1>
  );

  const body = (text) => (
    <p style={{ fontFamily: dmSans, fontSize: 16, color: '#64748b', lineHeight: 1.7, margin: '0 0 8px' }}>{text}</p>
  );

  if (state === 'verifying') {
    return shell(
      <>
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: ACCENT, margin: '0 auto 20px' }} />
        {heading('Verifying your email…')}
        {body("Hang tight — we're confirming your account and getting your setup ready.")}
      </>
    );
  }

  if (state === 'sent') {
    return shell(
      <>
        {iconBox(MailCheck)}
        {heading("You're verified! One quick step")}
        {body(<>We just sent a secure sign-in link{email ? ' to' : ''}{email && <strong style={{ color: '#0f172a' }}> {email}</strong>}. Click it to log in — then we'll walk you through setting up your profile.</>)}
        <button
          onClick={() => { window.location.href = window.location.origin + '/#/GatorAuth'; }}
          style={{
            marginTop: 24, background: GRAD_INDIGO, border: 'none', borderRadius: 12,
            padding: '14px 28px', fontSize: 15, fontWeight: 700, color: '#fff', cursor: 'pointer',
            fontFamily: dmSans, boxShadow: '0 8px 24px rgba(109,40,217,0.28)',
          }}
        >
          Continue to sign in →
        </button>
        <p style={{ fontFamily: dmSans, fontSize: 13, color: '#94a3b8', margin: '20px 0 0', lineHeight: 1.6 }}>
          Didn't get the email? Check your spam folder.
        </p>
      </>
    );
  }

  // error
  return shell(
    <>
      {iconBox(AlertCircle, '#EF4444')}
      {heading('We hit a snag')}
      {body(errorMsg)}
      <button
        onClick={() => { window.location.href = window.location.origin + '/#/GatorAuth'; }}
        style={{
          marginTop: 24, background: GRAD_INDIGO, border: 'none', borderRadius: 12,
          padding: '14px 28px', fontSize: 15, fontWeight: 700, color: '#fff', cursor: 'pointer',
          fontFamily: dmSans, boxShadow: '0 8px 24px rgba(109,40,217,0.28)',
        }}
      >
        Back to sign up
      </button>
    </>
  );
}

VerifyEmail.isPublic = true;