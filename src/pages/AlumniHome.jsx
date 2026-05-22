import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import DashboardNav from '@/components/dashboard-v2/DashboardNav';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const FOUNDING_DEADLINE = new Date('2026-04-30T23:59:59');

function getDayTime() {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const day = days[now.getDay()];
  const month = months[now.getMonth()];
  const date = now.getDate();
  const hours = now.getHours();
  const mins = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${day}, ${month} ${date} · ${h12}:${mins} ${ampm}`;
}

function getProfileStrength(user) {
  if (!user) return { score: 0, tip: '', nextField: '' };
  const fields = [
    { key: 'full_name', label: 'full name', weight: 10 },
    { key: 'company', label: 'company', weight: 20 },
    { key: 'job_title', label: 'job title', weight: 15 },
    { key: 'industry', label: 'industry', weight: 15 },
    { key: 'bio', label: 'bio', weight: 15 },
    { key: 'linkedin_url', label: 'LinkedIn URL', weight: 15 },
    { key: 'ways_to_help', label: 'ways you can help', weight: 10 },
  ];

  let score = 0;
  let firstMissing = null;

  for (const f of fields) {
    const val = user[f.key];
    const filled = Array.isArray(val) ? val.length > 0 : !!val;
    if (filled) {
      score += f.weight;
    } else if (!firstMissing) {
      firstMissing = f;
    }
  }

  const tips = {
    company: 'Alumni with a company get 3x more student messages',
    linkedin_url: 'Add your LinkedIn — students love to research before reaching out',
    bio: 'A short bio helps students know how you can help them',
    job_title: 'Your role helps students find you by industry',
    industry: 'Adding your industry makes you more discoverable',
    ways_to_help: 'Tell students how you can help so the right ones reach out',
  };

  return {
    score: Math.min(score, 100),
    tip: firstMissing ? (tips[firstMissing.key] || `Add your ${firstMissing.label} to strengthen your profile`) : 'Your profile is complete!',
    complete: score >= 100,
  };
}

export default function AlumniHome() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const firstName = user?.first_name || user?.full_name?.split(' ')[0] || 'there';
  const schoolName = user?.school_name || 'your school';
  const profile = getProfileStrength(user);
  const foundingActive = new Date() < FOUNDING_DEADLINE;

  // Load fonts
  useEffect(() => {
    if (!document.getElementById('alumni-home-fonts')) {
      const link = document.createElement('link');
      link.id = 'alumni-home-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap';
      document.head.appendChild(link);
    }
    setMounted(true);
  }, []);

  // Load unread message count
  useEffect(() => {
    const loadUnread = async () => {
      if (!user?.id) return;
      try {
        const msgs = await base44.asServiceRole?.entities?.Message?.filter?.({
          recipient_id: user.id,
          read: false,
        }) || [];
        setUnreadCount(msgs.length);
      } catch (e) {
        // Silent fail — messages tab still works
      } finally {
        setLoadingMessages(false);
      }
    };
    loadUnread();
  }, [user]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d1117',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: dmSans,
    }}>

      {/* Background glow */}
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: `
          radial-gradient(ellipse 60% 40% at 50% 0%, rgba(109,40,217,0.10) 0%, transparent 55%),
          radial-gradient(ellipse 40% 30% at 90% 80%, rgba(124,58,237,0.06) 0%, transparent 50%)
        `,
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Grid texture */}
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>

        <DashboardNav user={user} currentPage="Home" />

        {/* ── MAIN CONTENT ── */}
        <main style={{
          flex: 1,
          maxWidth: 640,
          margin: '0 auto',
          width: '100%',
          padding: '48px 24px 80px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}>

          {/* ── GREETING ── */}
          <div style={{ marginBottom: 8 }}>
            <h1 style={{
              fontFamily: playfair,
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              margin: '0 0 6px',
            }}>
              Welcome back,{' '}
              <span style={{ color: '#a78bfa', fontStyle: 'italic' }}>{firstName}.</span>
            </h1>
            <p style={{
              fontFamily: dmSans, fontSize: 14,
              color: 'rgba(255,255,255,0.35)', margin: 0,
            }}>
              {getDayTime()}
            </p>
          </div>

          {/* ── UNREAD MESSAGES ALERT ── */}
          {!loadingMessages && unreadCount > 0 && (
            <button
              onClick={() => navigate('Messages')}
              style={{
                width: '100%',
                background: 'rgba(109,40,217,0.1)',
                border: '1px solid rgba(109,40,217,0.35)',
                borderRadius: 14,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                cursor: 'pointer',
                minHeight: 'auto',
                textAlign: 'left',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(109,40,217,0.15)'; e.currentTarget.style.borderColor = '#7c3aed'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(109,40,217,0.1)'; e.currentTarget.style.borderColor = 'rgba(109,40,217,0.35)'; }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: '#7c3aed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0,
              }}>
                📬
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontFamily: dmSans, fontSize: 15, fontWeight: 600,
                  color: '#fff', margin: '0 0 2px',
                }}>
                  {unreadCount === 1
                    ? '1 student is waiting to hear from you'
                    : `${unreadCount} students are waiting to hear from you`}
                </p>
                <p style={{
                  fontFamily: dmSans, fontSize: 13,
                  color: 'rgba(255,255,255,0.45)', margin: 0,
                }}>
                  Go to Messages →
                </p>
              </div>
            </button>
          )}

          {/* ── PROFILE STRENGTH ── */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14,
            padding: '20px 22px',
          }}>
            <p style={{
              fontFamily: dmSans, fontSize: 11, fontWeight: 700,
              color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em',
              textTransform: 'uppercase', margin: '0 0 14px',
            }}>
              Your Profile
            </p>

            {/* Progress bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                Profile strength
              </p>
              <p style={{
                fontFamily: dmSans, fontSize: 14, fontWeight: 700,
                color: profile.score >= 80 ? '#4ade80' : profile.score >= 50 ? '#a78bfa' : 'rgba(255,255,255,0.5)',
                margin: 0,
              }}>
                {profile.score}%
              </p>
            </div>

            <div style={{
              height: 6, background: 'rgba(255,255,255,0.08)',
              borderRadius: 3, marginBottom: 12, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${profile.score}%`,
                background: profile.score >= 80
                  ? 'linear-gradient(90deg, #4ade80, #22c55e)'
                  : 'linear-gradient(90deg, #6d28d9, #7c3aed)',
                borderRadius: 3,
                transition: 'width 1s ease',
              }} />
            </div>

            {!profile.complete && (
              <p style={{
                fontFamily: dmSans, fontSize: 13,
                color: 'rgba(255,255,255,0.4)', margin: '0 0 14px',
                lineHeight: 1.5,
              }}>
                {profile.tip}
              </p>
            )}

            <button
              onClick={() => navigate('ProfileEdit')}
              style={{
                fontFamily: dmSans, fontSize: 13, fontWeight: 600,
                color: '#a78bfa', background: 'none',
                border: '1px solid rgba(109,40,217,0.3)',
                borderRadius: 8, padding: '9px 20px',
                cursor: 'pointer', minHeight: 'auto',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(109,40,217,0.08)'; e.currentTarget.style.borderColor = '#7c3aed'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(109,40,217,0.3)'; }}
            >
              {profile.complete ? 'View My Profile →' : 'Complete My Profile →'}
            </button>
          </div>

          {/* ── YOUR NETWORK ── */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14,
            padding: '20px 22px',
          }}>
            <p style={{
              fontFamily: dmSans, fontSize: 11, fontWeight: 700,
              color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em',
              textTransform: 'uppercase', margin: '0 0 14px',
            }}>
              Your Network
            </p>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(109,40,217,0.12)',
                border: '1px solid rgba(109,40,217,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0,
              }}>
                🎓
              </div>
              <div>
                <p style={{
                  fontFamily: dmSans, fontSize: 15, fontWeight: 600,
                  color: '#fff', margin: '0 0 4px',
                }}>
                  You're live in the {schoolName} network
                </p>
                <p style={{
                  fontFamily: dmSans, fontSize: 13,
                  color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.5,
                }}>
                  Students can find you by industry, company, and the ways you're willing to help.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('Directory')}
              style={{
                fontFamily: dmSans, fontSize: 13, fontWeight: 600,
                color: '#fff', background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', border: 'none',
                  borderRadius: 8, padding: '10px 20px',
                  cursor: 'pointer', minHeight: 'auto',
                  boxShadow: '0 4px 12px rgba(109,40,217,0.25)',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              Browse the Directory →
            </button>
          </div>

          {/* ── HOW IT WORKS (first time) ── */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 14,
            padding: '20px 22px',
          }}>
            <p style={{
              fontFamily: dmSans, fontSize: 11, fontWeight: 700,
              color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em',
              textTransform: 'uppercase', margin: '0 0 14px',
            }}>
              What happens next
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: '🔍', text: `A student from ${schoolName} finds your profile in the directory` },
                { icon: '✉️', text: 'They send you a message through the platform' },
                { icon: '🔔', text: "You get notified immediately — you decide if and how you want to help" },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                  <p style={{
                    fontFamily: dmSans, fontSize: 14,
                    color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6,
                  }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── FASTIQ SUBTLE LINK ── */}
          {foundingActive && (
            <div style={{ textAlign: 'center', paddingTop: 8 }}>
              <p style={{
                fontFamily: dmSans, fontSize: 13,
                color: 'rgba(255,255,255,0.25)', margin: '0 0 4px',
              }}>
                Looking for a new job yourself?
              </p>
              <button
                onClick={() => navigate('FastIQDashboard')}
                style={{
                  fontFamily: dmSans, fontSize: 13, fontWeight: 500,
                  color: 'rgba(255,255,255,0.35)', background: 'none',
                  border: 'none', cursor: 'pointer', minHeight: 'auto',
                  padding: 0, textDecoration: 'underline',
                  textDecorationColor: 'rgba(255,255,255,0.2)',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#a78bfa'; e.currentTarget.style.textDecorationColor = '#a78bfa'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; e.currentTarget.style.textDecorationColor = 'rgba(255,255,255,0.2)'; }}
              >
                FastIQ can help — $14.50/mo founding rate until April 30 →
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}