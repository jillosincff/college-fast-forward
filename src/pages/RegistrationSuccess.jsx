import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { createCheckoutSession } from '@/functions/createCheckoutSession';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

export default function RegistrationSuccess() {
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const email = urlParams.get('email') || '';
  const persona = urlParams.get('persona') || 'student';
  const isParent = persona === 'parent';

  const [checkingOut, setCheckingOut] = useState(false);

  const handleFastIQ = async () => {
    setCheckingOut(true);
    try {
      const response = await createCheckoutSession({
        plan: 'fastiq_monthly',
        successUrl: `${window.location.origin}/#FreeTierDashboard?upgraded=true`,
        cancelUrl: `${window.location.origin}/#RegistrationSuccess`,
        user: { email },
      });
      const url = response?.data?.url;
      if (url) window.location.href = url;
    } catch (e) {
      console.error('Checkout error:', e);
    }
    setCheckingOut(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
      background: 'linear-gradient(160deg, #0d1117 0%, #0a0f1a 100%)',
    }}>
      <div style={{ maxWidth: 520, width: '100%' }}>

        {/* Thank you hero */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>🐊</div>
          <h1 style={{
            fontFamily: playfair,
            fontSize: 'clamp(28px, 5vw, 40px)',
            fontWeight: 700, color: '#fff',
            margin: '0 0 16px', lineHeight: 1.15,
            letterSpacing: '-0.02em',
          }}>
            Thank you for joining<br />
            <span style={{ color: '#E85D20', fontStyle: 'italic' }}>College Fast Forward.</span>
          </h1>
          <p style={{
            fontFamily: dmSans,
            fontSize: 16, color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.7, margin: '0 0 8px',
          }}>
            {isParent
              ? "You're now part of a network of families who believe in paying it forward — helping students find the connections and opportunities that change their lives."
              : "You're now part of something real — a network of students, parents, and alumni who show up for each other when it matters most."}
          </p>
          {email && (
            <p style={{
              fontFamily: dmSans,
              fontSize: 13, color: 'rgba(255,255,255,0.35)',
              margin: '12px 0 0',
            }}>
              A verification email is on its way to <strong style={{ color: 'rgba(255,255,255,0.55)' }}>{email}</strong>
            </p>
          )}
        </div>

        {/* FastIQ for your kid — shown for parents, or as a nudge for students */}
        {isParent ? (
          <div style={{
            background: '#0A0A0A',
            border: '1px solid rgba(232,93,32,0.3)',
            borderRadius: 16, padding: '28px',
            marginBottom: 20,
          }}>
            <p style={{
              fontFamily: dmSans,
              fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.12em',
              color: '#E85D20', margin: '0 0 10px',
            }}>⚡ FastIQ — For Your Student</p>
            <h2 style={{
              fontFamily: playfair,
              fontSize: 22, fontWeight: 700,
              color: '#fff', margin: '0 0 10px', lineHeight: 1.3,
            }}>
              Give your kid the AI career engine that works while they sleep.
            </h2>
            <p style={{
              fontFamily: dmSans,
              fontSize: 14, color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.6, margin: '0 0 20px',
            }}>
              FastIQ finds UF alumni at their target companies, drafts personalized outreach, tailors their resume to every job, and builds a daily action plan. Less than a textbook. Better than a career coach.
            </p>
            <button
              onClick={handleFastIQ}
              disabled={checkingOut}
              style={{
                width: '100%', background: '#E85D20', border: 'none',
                borderRadius: 12, padding: '14px',
                fontFamily: dmSans, fontSize: 15, fontWeight: 700,
                color: '#fff', cursor: checkingOut ? 'not-allowed' : 'pointer',
                opacity: checkingOut ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                minHeight: 'auto',
              }}
            >
              {checkingOut && <Loader2 className="w-4 h-4 animate-spin" />}
              {checkingOut ? 'Loading checkout...' : 'Activate FastIQ for My Student — $29/mo →'}
            </button>
            <p style={{
              fontFamily: dmSans, fontSize: 12,
              color: 'rgba(255,255,255,0.25)',
              textAlign: 'center', margin: '10px 0 0',
            }}>
              7-day free trial · Cancel anytime
            </p>
          </div>
        ) : (
          <div style={{
            background: 'rgba(232,93,32,0.06)',
            border: '1px solid rgba(232,93,32,0.2)',
            borderRadius: 16, padding: '20px 24px',
            marginBottom: 20,
          }}>
            <p style={{
              fontFamily: dmSans, fontSize: 14,
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.6, margin: '0 0 12px',
            }}>
              ⚡ <strong style={{ color: '#E85D20' }}>FastIQ</strong> — your personal AI career agent — is waiting for you. Find alumni, get outreach drafted, and build your action plan.
            </p>
            <button
              onClick={() => window.location.hash = '#FreeTierDashboard'}
              style={{
                fontFamily: dmSans, fontSize: 14, fontWeight: 700,
                color: '#E85D20', background: 'none', border: 'none',
                cursor: 'pointer', padding: 0, minHeight: 'auto',
              }}
            >
              Explore FastIQ →
            </button>
          </div>
        )}

        {/* Profile CTAs */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => window.location.hash = '#ProfileEdit'}
            style={{
              flex: 1, fontFamily: dmSans, fontSize: 14, fontWeight: 600,
              color: '#fff', background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12, padding: '13px',
              cursor: 'pointer', minHeight: 'auto',
            }}
          >
            Edit My Profile
          </button>
          <button
            onClick={() => window.location.hash = '#Profile'}
            style={{
              flex: 1, fontFamily: dmSans, fontSize: 14, fontWeight: 600,
              color: 'rgba(255,255,255,0.5)', background: 'none',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12, padding: '13px',
              cursor: 'pointer', minHeight: 'auto',
            }}
          >
            View My Profile
          </button>
        </div>

        <p style={{
          fontFamily: dmSans, fontSize: 12,
          color: 'rgba(255,255,255,0.2)',
          textAlign: 'center', margin: '24px 0 0',
        }}>
          Go Gators. 🐊
        </p>
      </div>
    </div>
  );
}

RegistrationSuccess.isPublic = true;