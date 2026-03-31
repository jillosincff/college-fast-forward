import { useAuth } from '@/lib/AuthContext';
import { navigate } from '@/components/utils/navigation';

export default function FastIQDashboard() {
  const { user } = useAuth();

  const isFastIQ = !!(
    user?.fastiq_setup_complete ||
    user?.subscription_status === 'active' ||
    user?.membership_tier === 'fastiq'
  );

  const isFounding = user?.membership_tier === 'founding';
  const firstName = user?.full_name?.split(' ')[0] || 'there';

  const FASTIQ_FEATURES = [
    { icon: '📄', label: 'Resume Hub', desc: 'Upload, score, and tailor your resume to any job', page: 'ResumeTailoring' },
    { icon: '🎯', label: 'Company Intel', desc: 'Hiring signals at companies matching your goals', page: 'FreeTierDashboard?tab=company_intel' },
    { icon: '🔍', label: 'Alumni Search', desc: 'Find UF alumni at any company — unlimited searches', page: 'FreeTierDashboard?tab=alumni_search' },
    { icon: '🤝', label: 'CFF Connections', desc: 'Warm intros from parents and alumni in the network', page: 'FreeTierDashboard' },
    { icon: '🎤', label: 'Mock Interviews', desc: 'Full STAR method interview simulation', page: 'MockInterview' },
    { icon: '🔗', label: 'LinkedIn Review', desc: 'Score and optimize every section of your profile', page: 'LinkedInReview' },
    { icon: '🧠', label: 'Career Assessment', desc: 'Discover your unique career archetype', page: 'CareerAssessment' },
    { icon: '✉️', label: 'Outreach Engine', desc: 'AI-written messages to alumni and connections', page: 'FreeTierDashboard?tab=alumni_search' },
  ];

  // FastIQ gate — show upgrade prompt
  if (!isFastIQ) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px' }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.12em',
          color: '#E85D20', margin: '0 0 12px'
        }}>⚡ FASTIQ™</p>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 32, fontWeight: 700,
          color: '#1A1A1A', margin: '0 0 12px'
        }}>
          The AI engine behind CFF.
        </h1>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15, color: '#888',
          margin: '0 0 40px', lineHeight: 1.6
        }}>
          FastIQ powers every intelligent feature in College Fast Forward — from scoring your resume against your goals to finding alumni at your dream companies and drafting outreach that actually gets responses.
        </p>

        {/* Feature list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
          {FASTIQ_FEATURES.map(f => (
            <div key={f.label} style={{
              display: 'flex', alignItems: 'center',
              gap: 16, padding: '14px 0',
              borderBottom: '1px solid #F5F5F5',
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{f.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14, fontWeight: 600,
                  color: '#1A1A1A', margin: '0 0 2px'
                }}>{f.label}</p>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12, color: '#888', margin: 0
                }}>{f.desc}</p>
              </div>
              <span style={{ color: '#E85D20', fontSize: 16 }}>🔒</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('FreeTierDashboard')}
          style={{
            background: '#E85D20', border: 'none',
            borderRadius: 10, padding: '16px',
            fontSize: 15, fontWeight: 600,
            color: '#fff', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            width: '100%', minHeight: 'auto'
          }}
        >
          Unlock FastIQ — $29/month →
        </button>
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
              Your AI career engine is on.
            </h1>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14, color: 'rgba(255,255,255,0.5)',
              margin: 0
            }}>
              Every feature below is powered by FastIQ and personalized to your goals.
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
        }}>
          <a
            href="#"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13, color: '#555',
              textDecoration: 'none', cursor: 'pointer',
            }}
          >
            Manage billing →
          </a>
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
        </div>
      </div>

    </div>
  );
}