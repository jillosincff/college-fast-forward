import { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { useAuth } from '@/components/auth/AuthContext';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

const C = {
  bg: '#0d0d14',
  card: '#13131f',
  cardBorder: 'rgba(255,255,255,0.07)',
  orange: '#E85D20',
  orangeLight: 'rgba(232,93,32,0.12)',
  orangeBorder: 'rgba(232,93,32,0.25)',
  white: '#ffffff',
  muted: 'rgba(255,255,255,0.5)',
  hint: 'rgba(255,255,255,0.25)',
  green: '#22c55e',
  greenLight: 'rgba(34,197,94,0.1)',
};



export default function ParentHome() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(40);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false);
  const [inviteLink, setInviteLink] = useState(null);
  const [inviteLinkLoading, setInviteLinkLoading] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  const generateInviteLink = async () => {
    setInviteLinkLoading(true);
    try {
      const res = await fetch('https://growth-hacker-marketing-agent-101dbdc8.base44.app/functions/generateParentInviteLink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (data.invite_url) setInviteLink(data.invite_url);
    } catch (e) {
      console.error('Failed to generate invite link:', e);
    } finally {
      setInviteLinkLoading(false);
    }
  };

  const copyInviteLink = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink).then(() => {
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2000);
    });
  };

  // Check for post-Stripe redirect once on mount only
  useEffect(() => {
    const hashPart = window.location.hash.split('?')[1] || '';
    const params = new URLSearchParams(hashPart);
    if (params.get('upgraded') === 'true') {
      setShowUpgradeSuccess(true);
      window.history.replaceState(null, '', '#ParentHome');
    }
  }, []);

  useEffect(() => {
    setMounted(true);

    if (user) {
      const fields = [
        user.full_name, user.email, user.company,
        user.job_title, user.industry, user.linkedin_url,
        user.bio, user.ways_to_help?.length > 0,
        user.profile_photo, user.school,
      ];
      const filled = fields.filter(Boolean).length;
      setProfileCompletion(Math.round((filled / fields.length) * 100));
    }

    const updateTime = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
    };
    updateTime();
    const t = setInterval(updateTime, 60000);
    return () => clearInterval(t);
  }, [user]);

  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const linkedInMissing = !user?.linkedin_url;
  const profileIncomplete = profileCompletion < 100;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: dmSans, padding: '0 0 80px' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: '#0d1117', height: 56,
        padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <button onClick={() => navigate('ParentHome')} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#f4f0e8',
          minHeight: 'auto',
        }}>
          <span>C</span><span style={{ color: C.orange }}>FF</span>
        </button>
        <div style={{ display: 'flex', gap: 24 }}>
          {[{ label: 'Home', page: 'ParentHome' }, { label: 'Directory', page: 'Directory' }, { label: 'Messages', page: 'MyMessages' }].map(l => (
            <button key={l.page} onClick={() => navigate(l.page)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: dmSans, fontSize: 13, fontWeight: 400,
              color: l.page === 'ParentHome' ? '#f4f0e8' : 'rgba(244,240,232,0.45)',
              minHeight: 'auto',
            }}>
              {l.label}
            </button>
          ))}
        </div>
        <button onClick={() => navigate('Profile')} style={{
          width: 32, height: 32, borderRadius: '50%', background: '#0d1117',
          border: `2px solid ${C.orange}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#fff',
          cursor: 'pointer', minHeight: 'auto', minWidth: 'auto',
        }}>
          {(user?.full_name?.[0] || 'P').toUpperCase()}
        </button>
      </nav>

      {/* ── UPGRADE SUCCESS BANNER ── */}
      {showUpgradeSuccess && (
        <div style={{
          background: 'linear-gradient(135deg, #0A0A0A 0%, #1a1a1a 100%)',
          borderBottom: '1px solid rgba(232,93,32,0.3)',
          padding: '16px 32px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
        }}>
          <div>
            <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.orange, margin: '0 0 4px' }}>⚡ FASTIQ ACTIVATED</p>
            <p style={{ fontFamily: playfair, fontSize: 18, fontWeight: 700, color: C.white, margin: '0 0 2px' }}>Welcome to FastIQ, {firstName}! 🎉</p>
            <p style={{ fontFamily: dmSans, fontSize: 13, color: C.muted, margin: 0 }}>Your student's full AI career engine is now unlocked. Check your email for a receipt.</p>
          </div>
          <button onClick={() => setShowUpgradeSuccess(false)} style={{ background: 'none', border: `1px solid rgba(255,255,255,0.2)`, borderRadius: 8, padding: '8px 16px', fontSize: 13, color: C.muted, cursor: 'pointer', fontFamily: dmSans, minHeight: 'auto' }}>
            Dismiss
          </button>
        </div>
      )}

      {/* ── HEADER ── */}
      <div style={{
        background: 'linear-gradient(180deg, #1a0a05 0%, #0d0d14 100%)',
        borderBottom: `1px solid ${C.cardBorder}`,
        padding: '48px 32px 40px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -40, width: 400, height: 400, background: 'radial-gradient(ellipse, rgba(232,93,32,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: dmSans, fontSize: 13, color: C.hint, margin: '0 0 8px', letterSpacing: '0.02em' }}>
            {currentDate} · {currentTime}
          </p>
          <h1 style={{
            fontFamily: playfair, fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: 700, color: C.white, lineHeight: 1.1, letterSpacing: '-0.02em',
            margin: '0 0 4px',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.6s ease',
          }}>
            Welcome back, <span style={{ color: C.orange, fontStyle: 'italic' }}>{firstName}.</span>
          </h1>
          <p style={{
            fontFamily: dmSans, fontSize: 15, color: C.muted, margin: '8px 0 0',
            opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease 0.1s',
          }}>
            You're live in the network. Students can find you and reach out.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 32px 0' }}>

        {/* ── QUICK ACTIONS ── */}
        <div style={{
          display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease 0.15s',
        }}>
          <button onClick={() => navigate('Directory')} style={{
            fontFamily: dmSans, fontSize: 14, fontWeight: 700,
            color: '#fff', background: C.orange, border: 'none',
            borderRadius: 12, padding: '13px 28px', cursor: 'pointer',
            minHeight: 'auto', boxShadow: '0 4px 20px rgba(232,93,32,0.3)',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Browse Directory →
          </button>
          <button onClick={() => navigate('MyMessages')} style={{
            fontFamily: dmSans, fontSize: 14, fontWeight: 600,
            color: C.muted, background: C.card,
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 12, padding: '13px 24px', cursor: 'pointer',
            minHeight: 'auto', transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.color = C.muted; }}
          >
            Messages
          </button>
          <button onClick={() => navigate('Profile')} style={{
            fontFamily: dmSans, fontSize: 14, fontWeight: 600,
            color: C.muted, background: C.card,
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 12, padding: '13px 24px', cursor: 'pointer',
            minHeight: 'auto', transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.color = C.muted; }}
          >
            My Profile
          </button>
        </div>

        {/* ── MAIN GRID ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16, marginBottom: 16,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease 0.2s',
        }}>

          {/* Profile card */}
          <div style={{
            background: C.card, border: `1px solid ${C.cardBorder}`,
            borderRadius: 20, padding: '28px',
            display: 'flex', flexDirection: 'column', gap: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: C.hint, letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
                Your Profile
              </p>
              <span style={{
                fontFamily: dmSans, fontSize: 12, fontWeight: 700,
                color: profileCompletion === 100 ? C.green : C.orange,
                background: profileCompletion === 100 ? C.greenLight : C.orangeLight,
                border: `1px solid ${profileCompletion === 100 ? 'rgba(34,197,94,0.25)' : C.orangeBorder}`,
                borderRadius: 100, padding: '3px 10px',
              }}>
                {profileCompletion}% complete
              </span>
            </div>
            <div>
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 4, height: 6, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ width: `${profileCompletion}%`, height: '100%', background: profileCompletion === 100 ? C.green : C.orange, borderRadius: 4, transition: 'width 0.8s ease' }} />
              </div>
              {profileIncomplete ? (
                <p style={{ fontFamily: dmSans, fontSize: 13, color: C.muted, margin: 0, lineHeight: 1.5 }}>
                  {linkedInMissing
                    ? '💡 Add your LinkedIn URL — parents with LinkedIn get 3x more intro requests'
                    : '✨ Almost there — complete your profile to get more student requests'}
                </p>
              ) : (
                <p style={{ fontFamily: dmSans, fontSize: 13, color: C.green, margin: 0 }}>
                  ✅ Your profile is complete — students can find all your details
                </p>
              )}
            </div>
            <button onClick={() => navigate('ParentProfileEdit')} style={{
              fontFamily: dmSans, fontSize: 13, fontWeight: 700,
              color: C.orange, background: 'none',
              border: `1px solid ${C.orangeBorder}`,
              borderRadius: 10, padding: '11px 0',
              cursor: 'pointer', minHeight: 'auto', width: '100%', transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = C.orangeLight; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              {profileIncomplete ? 'Complete My Profile →' : 'Edit Profile →'}
            </button>
          </div>

          {/* Student card */}
          <div style={{
            background: C.card, border: `1px solid ${C.cardBorder}`,
            borderRadius: 20, padding: '28px',
            display: 'flex', flexDirection: 'column', gap: 20,
          }}>
            <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: C.hint, letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
              Your Student
            </p>
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.cardBorder}`,
              borderRadius: 12, padding: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.orangeLight, border: `1px solid ${C.orangeBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: dmSans, fontSize: 12, fontWeight: 700, color: C.orange }}>
                  S
                </div>
                <div>
                  <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: C.white, margin: 0 }}>
                    {user?.student_emails?.[0] || 'No student invited yet'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
                    <p style={{ fontFamily: dmSans, fontSize: 11, color: '#f59e0b', margin: 0, fontWeight: 600 }}>Invitation Pending</p>
                  </div>
                </div>
              </div>
              <p style={{ fontFamily: dmSans, fontSize: 12, color: C.hint, margin: '0 0 12px' }}>
                Invited · awaiting signup
              </p>
              <button onClick={() => navigate('ParentOnboarding?step=invite')} style={{
                fontFamily: dmSans, fontSize: 12, fontWeight: 600,
                color: C.orange, background: 'none', border: 'none',
                cursor: 'pointer', minHeight: 'auto', padding: 0,
              }}>
                Invite Another Student →
              </button>
            </div>
            <button onClick={() => navigate('FastIQDashboard')} style={{
              fontFamily: dmSans, fontSize: 13, fontWeight: 700,
              color: '#fff', background: 'linear-gradient(135deg, #E85D20, #c9471a)',
              border: 'none', borderRadius: 10, padding: '13px 0',
              cursor: 'pointer', minHeight: 'auto', width: '100%',
              boxShadow: '0 4px 16px rgba(232,93,32,0.25)', transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              🎁 Unlock FastIQ for My Student →
            </button>
          </div>
        </div>

        {/* ── INVITE YOUR STUDENT ── */}
        <div style={{
          background: C.card, border: `1px solid ${C.cardBorder}`,
          borderRadius: 20, padding: '28px',
          marginBottom: 16,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease 0.28s',
        }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, color: C.hint, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 8px' }}>
            Invite Your Student
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 14, color: C.muted, margin: '0 0 16px', lineHeight: 1.6 }}>
            Share this link with <strong style={{ color: C.white }}>{user?.student_emails?.[0] || 'your student'}</strong> to connect their account to yours.
          </p>
          {!inviteLink ? (
            <button onClick={generateInviteLink} disabled={inviteLinkLoading} style={{
              fontFamily: dmSans, fontSize: 13, fontWeight: 700,
              color: C.orange, background: 'none',
              border: `1px solid ${C.orangeBorder}`,
              borderRadius: 10, padding: '11px 20px',
              cursor: inviteLinkLoading ? 'not-allowed' : 'pointer',
              minHeight: 'auto', transition: 'all 0.15s',
              opacity: inviteLinkLoading ? 0.6 : 1,
            }}>
              {inviteLinkLoading ? 'Generating…' : 'Generate Invite Link →'}
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8, alignItems: 'stretch', flexWrap: 'wrap' }}>
              <div style={{
                flex: 1, background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 10, padding: '10px 14px',
                fontFamily: dmSans, fontSize: 12, color: C.muted,
                wordBreak: 'break-all', lineHeight: 1.5, minWidth: 0,
              }}>
                {inviteLink}
              </div>
              <button onClick={copyInviteLink} style={{
                fontFamily: dmSans, fontSize: 13, fontWeight: 700,
                color: inviteCopied ? C.green : C.orange,
                background: inviteCopied ? C.greenLight : C.orangeLight,
                border: `1px solid ${inviteCopied ? 'rgba(34,197,94,0.25)' : C.orangeBorder}`,
                borderRadius: 10, padding: '10px 18px',
                cursor: 'pointer', minHeight: 'auto', flexShrink: 0, transition: 'all 0.2s',
              }}>
                {inviteCopied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          )}
        </div>

        {/* ── NETWORK NUDGE ── */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(232,93,32,0.08) 0%, rgba(232,93,32,0.03) 100%)',
          border: `1px solid ${C.orangeBorder}`,
          borderRadius: 16, padding: '20px 24px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease 0.35s',
        }}>
          <div>
            <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 700, color: C.white, margin: '0 0 4px' }}>
              Know another parent at your kid's school?
            </p>
            <p style={{ fontFamily: dmSans, fontSize: 13, color: C.muted, margin: 0 }}>
              The bigger the network, the better the chances — for every student.
            </p>
          </div>
          <button onClick={() => navigate('ParentLandingPage')} style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 700,
            color: C.orange, background: 'none',
            border: `1px solid ${C.orangeBorder}`,
            borderRadius: 10, padding: '10px 20px',
            cursor: 'pointer', minHeight: 'auto', flexShrink: 0, transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = C.orangeLight; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
          >
            Invite a parent →
          </button>
        </div>

      </div>
    </div>
  );
}