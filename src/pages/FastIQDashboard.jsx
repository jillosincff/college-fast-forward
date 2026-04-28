import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { Zap } from 'lucide-react';
import FoundingMemberBanner from '@/components/shared/FoundingMemberBanner';
import { checkIsFastIQ } from '@/utils/isFastIQ';

export default function FastIQDashboard({ onOpenUpgrade }) {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(true);
  const isFastIQ = checkIsFastIQ(user);

  // When rendered standalone (direct URL, no parent passing onOpenUpgrade),
  // fall back to navigating to FreeTierDashboard with the upgrade modal open.
  const handleUpgrade = () => {
    if (onOpenUpgrade) {
      onOpenUpgrade();
    } else {
      navigate('FreeTierDashboard?upgrade=true');
    }
  };

  const isFounding = !!(user?.founding_offer_redeemed || user?.founding_member_plan);
  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState('');

  const handleManageBilling = async () => {
    setPortalLoading(true);
    setPortalError('');
    try {
      const res = await base44.functions.invoke('createCustomerPortal', {
        customerId: user?.stripe_customer_id,
        returnUrl: 'https://collegefastforward.com/#FastIQDashboard',
      });
      if (res?.data?.success && res?.data?.url) {
        window.location.href = res.data.url;
      } else {
        setPortalError(res?.data?.error || 'Unable to open billing portal. Please email support@collegefastforward.com');
      }
    } catch (e) {
      console.error('Portal error:', e);
      setPortalError('Something went wrong. Please email support@collegefastforward.com');
    }
    setPortalLoading(false);
  };

  const FASTIQ_FEATURES = [
    { icon: '📄', label: 'Resume Hub', desc: 'Upload, score, and tailor your resume to any job', page: 'ResumeTailoring' },
    { icon: '🎯', label: 'Company Intel', desc: 'Hiring signals at companies matching your goals', page: 'FreeTierDashboard' },
    { icon: '🔍', label: 'Alumni Search', desc: 'Find UF alumni at any company — unlimited searches', page: 'AlumniSearch' },
    { icon: '🤝', label: 'CFF Connections', desc: 'Warm intros from parents and alumni in the network', page: 'FreeTierDashboard' },
    { icon: '🎤', label: 'Mock Interviews', desc: 'Full STAR method interview simulation', page: 'MockInterview' },
    { icon: '🔗', label: 'LinkedIn Review', desc: 'Score and optimize every section of your profile', page: 'LinkedInReview' },
    { icon: '🧠', label: 'Career Assessment', desc: 'Discover your unique career archetype', page: 'CareerAssessment' },
    { icon: '✉️', label: 'Outreach Drafts', desc: 'AI-written messages to alumni and connections', page: 'OutreachDrafts' },
  ];

  // FastIQ gate — show upgrade prompt
  if (!isFastIQ) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 24px 48px' }}>
        <FoundingMemberBanner
          show={showBanner}
          onUpgrade={handleUpgrade}
          onDismiss={() => setShowBanner(false)}
        />
        <div style={{ marginTop: 32 }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.12em',
          color: '#E85D20', margin: '0 0 12px'
        }}>FASTIQ™ — FOR YOUR STUDENT</p>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 30, fontWeight: 700,
          color: '#1A1A1A', margin: '0 0 14px', lineHeight: 1.2
        }}>
          Give your student the unfair advantage in a brutal job market.
        </h1>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15, color: '#555',
          margin: '0 0 36px', lineHeight: 1.7
        }}>
          FastIQ is your student's personal career agent — available 24/7. It combines the power of the free parent & alumni network at their school with intelligent AI that actually moves the needle.
        </p>

        {/* Feature list */}
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          color: '#888', margin: '0 0 16px'
        }}>WHAT FASTIQ DOES FOR YOUR STUDENT</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 40 }}>
          {[
            { icon: '🔍', text: 'Finds alumni at the exact companies they want to work for and crafts personalized outreach messages that get real replies' },
            { icon: '📄', text: 'Tailors their resume to every job or internship they apply to' },
            { icon: '🔗', text: 'Optimizes their LinkedIn profile so recruiters and hiring managers actually notice them' },
            { icon: '📡', text: 'Spots hiring signals and hidden opportunities at companies in their industry' },
            { icon: '🎤', text: 'Runs full mock interviews using the STAR method with detailed feedback' },
            { icon: '🧠', text: 'Includes a personality & career assessment to help them figure out what they really want to do' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start',
              gap: 14, padding: '14px 0',
              borderBottom: '1px solid #F5F5F5',
            }}>
              <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, color: '#333',
                margin: 0, lineHeight: 1.6,
              }}>{item.text}</p>
            </div>
          ))}
        </div>

        <button
          onClick={handleUpgrade}
          style={{
            background: '#E85D20', border: 'none',
            borderRadius: 10, padding: '16px',
            fontSize: 15, fontWeight: 700,
            color: '#fff', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            width: '100%',
          }}
        >
          Unlock FastIQ for my student &rarr;
        </button>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13, color: '#888', textAlign: 'center',
          margin: '8px 0 0',
        }}>
          $29/month &middot; 5-day free trial &middot; Cancel anytime
        </p>
        </div>
      </div>
    );
  }

  // Active FastIQ dashboard
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>

      {/* Header */}
      <div style={{
        background: '#0A0A0A', borderRadius: 20,
        padding: '32px 36px', marginBottom: 32,
      }}>
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', gap: 16,
          flexWrap: 'wrap',
        }}>
          <div>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.15em',
              color: '#E85D20', margin: '0 0 8px'
            }}>⚡ FASTIQ™ ACTIVE</p>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 26, fontWeight: 700,
              color: '#fff', margin: '0 0 8px'
            }}>
              {user?.persona === 'parent' ? "Your student's AI career engine is on." : 'Your AI career engine is on.'}
            </h1>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14, color: 'rgba(255,255,255,0.5)',
              margin: 0
            }}>
              {user?.persona === 'parent' 
                ? 'FastIQ is now active for your student. Every feature below helps them navigate their career with intelligence and confidence.' 
                : 'Every feature below is powered by FastIQ and personalized to your goals.'}
            </p>
          </div>

          {isFounding && (
            <div style={{
              background: 'rgba(232,93,32,0.15)',
              border: '1px solid rgba(232,93,32,0.3)',
              borderRadius: 10, padding: '8px 16px',
              flexShrink: 0,
            }}>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11, fontWeight: 700,
                color: '#E85D20', margin: '0 0 2px',
                textTransform: 'uppercase', letterSpacing: '0.08em'
              }}>🎖 FOUNDING MEMBER</p>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12, color: 'rgba(255,255,255,0.6)',
                margin: 0
              }}>50% off forever locked in</p>
            </div>
          )}
        </div>
      </div>

      {/* Feature grid */}
      <div style={{ marginBottom: 32 }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.12em',
          color: '#888', margin: '0 0 16px'
        }}>YOUR FASTIQ FEATURES</p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 12,
        }}>
          {FASTIQ_FEATURES.map(f => (
            <div
              key={f.label}
              onClick={() => navigate(f.page)}
              style={{
                background: '#fff',
                border: '1px solid #E5E5E5',
                borderRadius: 14, padding: '16px 20px',
                display: 'flex', alignItems: 'center',
                gap: 14, cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#E85D20'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E5E5'}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: '#FFF5F0',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 20,
                flexShrink: 0,
              }}>
                {f.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14, fontWeight: 600,
                  color: '#1A1A1A', margin: '0 0 2px'
                }}>{f.label}</p>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12, color: '#888',
                  margin: 0, lineHeight: 1.4
                }}>{f.desc}</p>
              </div>
              <span style={{ color: '#CCCCCC', fontSize: 16, flexShrink: 0 }}>→</span>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription management */}
      <div style={{
        background: '#F5F5F5',
        borderRadius: 14, padding: '20px 24px',
      }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          color: '#888', margin: '0 0 16px'
        }}>SUBSCRIPTION</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Plan', value: isFounding ? 'FastIQ — Founding Member (50% off forever)' : 'FastIQ Monthly' },
            { label: 'Status', value: '✅ Active' },
            { label: 'Account', value: user?.email || '—' },
          ].map(row => (
            <div key={row.label} style={{
              display: 'flex', gap: 16,
              alignItems: 'center',
            }}>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12, fontWeight: 600,
                color: '#AAAAAA', margin: 0,
                minWidth: 100, flexShrink: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>{row.label}</p>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, color: '#1A1A1A',
                margin: 0,
              }}>{row.value}</p>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 16, paddingTop: 16,
          borderTop: '1px solid #E0E0E0',
          display: 'flex', gap: 12,
          flexWrap: 'wrap', alignItems: 'center',
        }}>
          <button
            onClick={handleManageBilling}
            disabled={portalLoading}
            style={{
              background: 'none', border: 'none', padding: 0,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13, color: portalLoading ? '#AAAAAA' : '#555',
              cursor: portalLoading ? 'not-allowed' : 'pointer',
              textDecoration: 'underline', minHeight: 'auto', minWidth: 'auto',
            }}
          >
            {portalLoading ? 'Loading...' : 'Manage billing →'}
          </button>
          <span style={{ color: '#E0E0E0' }}>·</span>
          <a
            href="mailto:support@collegefastforward.com"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13, color: '#555',
              textDecoration: 'none',
            }}
          >
            Contact support →
          </a>
          {portalError && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#EF4444', margin: '8px 0 0', width: '100%' }}>
              {portalError}
            </p>
          )}
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#AAAAAA', margin: '8px 0 0', lineHeight: 1.5, width: '100%' }}>
            To cancel your subscription, click "Manage billing" above. You'll retain access until the end of your billing period.
          </p>
        </div>
      </div>

    </div>
  );
}