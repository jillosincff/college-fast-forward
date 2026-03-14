import React, { useEffect, useState, useRef } from 'react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import confetti from 'canvas-confetti';
import { trackEvent } from '@/components/utils/analytics';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";
const orange = '#E85D20';

const AVATAR_COLORS = [
  'linear-gradient(135deg, #1a237e, #3949ab)',
  'linear-gradient(135deg, #004d40, #00897b)',
  'linear-gradient(135deg, #4a148c, #7b1fa2)',
  'linear-gradient(135deg, #b71c1c, #e53935)',
  'linear-gradient(135deg, #0d47a1, #1976d2)',
];

function ShimmerCard() {
  return (
    <div style={{
      background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%)',
      backgroundSize: '200% 100%',
      animation: 'celebShimmer 1.5s infinite',
      height: 72, borderRadius: 14,
    }} />
  );
}

export default function CelebrationScreen({ user }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFallback, setShowFallback] = useState(false);
  const fallbackTimer = useRef(null);

  const fullName = user?.full_name || '';
  const firstName = fullName.includes(',')
    ? fullName.split(',')[1]?.trim().split(/\s+/)[0] || 'Gator'
    : fullName.split(/\s+/)[0] || 'Gator';

  useEffect(() => {
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 }, colors: ['#0021A5', '#E85D20', '#FF6B35', '#FFD700'] });
    loadMatches();
    trackEvent('celebration_screen_viewed', { user_id: user?.id });

    // After 8s if still loading, show fallback
    fallbackTimer.current = setTimeout(() => {
      setShowFallback(true);
      setLoading(false);
    }, 8000);

    return () => clearTimeout(fallbackTimer.current);
  }, []);

  const loadMatches = async () => {
    try {
      // Try by student_id first (matches are generated with student_id, not always student_email)
      let studentMatches = [];
      if (user?.id) {
        studentMatches = await base44.entities.Match.filter(
          { student_id: user.id },
          '-match_score',
          50
        );
      }
      // Fallback: try by student_email if no results
      if ((!studentMatches || studentMatches.length === 0) && user?.email) {
        studentMatches = await base44.entities.Match.filter(
          { student_email: user.email },
          '-match_score',
          50
        );
      }
      setMatches(studentMatches || []);
    } catch (e) {
      console.error('Failed to load matches:', e);
    } finally {
      clearTimeout(fallbackTimer.current);
      setLoading(false);
    }
  };

  const validMatches = matches.filter(m => {
    const name = m.parent_name || m.peer_name || m.helper_name || '';
    return name && !name.toLowerCase().includes('professional') && !name.toLowerCase().includes('test') && name.trim().length > 2;
  });

  const handleSeeMatches = () => {
    trackEvent('celebration_cta_clicked', { user_id: user?.id, match_count: validMatches.length });
    sessionStorage.setItem('onboarding_matches', JSON.stringify(validMatches));
    navigate('MatchesReview');
  };

  const handleDashboard = () => {
    trackEvent('celebration_skip_to_dashboard', { user_id: user?.id });
    sessionStorage.removeItem('onboarding_matches');
    navigate('Dashboard');
  };

  const handleDirectory = () => {
    navigate('GatorDirectory');
  };

  const getInitials = (name) => {
    if (!name) return 'UF';
    return name.split(/\s+/).map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // "Building matches" fallback screen (shown if matches genuinely empty after timeout)
  if (!loading && showFallback && validMatches.length === 0) {
    return (
      <div style={{ minHeight: '100vh', minHeight: '100dvh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 20px', boxSizing: 'border-box', overflowX: 'hidden' }}>
        <style>{`@keyframes celebPulse{0%,100%{opacity:0.4;transform:scale(1)}50%{opacity:1;transform:scale(1.1)}}`}</style>
        <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: orange, margin: '0 auto 24px', animation: 'celebPulse 2s ease-in-out infinite', opacity: 0.8 }} />
          <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(22px, 5vw, 28px)', color: '#f4f0e8', letterSpacing: '-0.02em', marginBottom: 16 }}>
            We're building your matches.
          </h1>
          <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: 'rgba(244,240,232,0.55)', lineHeight: 1.7, marginBottom: 32, padding: '0 8px' }}>
            With nearly 1,000 UF families on the platform, we're finding the people best suited to help you. Check your dashboard in a few minutes.
          </p>
          <button onClick={handleDashboard} style={{ width: '100%', padding: '15px 0', borderRadius: 100, border: 'none', background: orange, color: '#fff', fontFamily: dmSans, fontSize: 15, fontWeight: 500, cursor: 'pointer', marginBottom: 12, minHeight: 48, WebkitTapHighlightColor: 'transparent' }}>
            Go to my dashboard →
          </button>
          <button onClick={handleDirectory} style={{ width: '100%', padding: '15px 0', borderRadius: 100, border: '0.5px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'rgba(244,240,232,0.6)', fontFamily: dmSans, fontSize: 15, fontWeight: 400, cursor: 'pointer', minHeight: 48, WebkitTapHighlightColor: 'transparent' }}>
            Browse the directory →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', minHeight: '100dvh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 20px', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <style>{`
        @keyframes celebShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes celebFadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:480px){.celeb-upsell{margin-left:-4px;margin-right:-4px}}
      `}</style>
      <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>

        {/* Headline */}
        <h1 style={{
          fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(28px, 5vw, 36px)',
          color: '#f4f0e8', letterSpacing: '-0.02em', marginBottom: 8,
          animation: 'celebFadeUp 0.5s ease both',
        }}>
          You're in, <span style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', color: orange }}>{firstName}.</span>
        </h1>

        <p style={{
          fontFamily: dmSans, fontSize: 15, fontWeight: 300,
          color: 'rgba(244,240,232,0.6)', marginBottom: 36,
          animation: 'celebFadeUp 0.5s 0.1s ease both',
        }}>
          Your question is live. Here are the people best positioned to help you right now.
        </p>

        {/* Loading state */}
        {loading && (
          <div style={{ animation: 'celebFadeUp 0.5s 0.15s ease both' }}>
            <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: 'rgba(244,240,232,0.4)', marginBottom: 16 }}>
              Finding your matches...
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
              <ShimmerCard />
              <ShimmerCard />
              <ShimmerCard />
            </div>
          </div>
        )}

        {/* Loaded state */}
        {!loading && (
          <div style={{ animation: 'celebFadeUp 0.5s 0.15s ease both' }}>
            {/* Match count */}
            {validMatches.length > 0 && (
              <p style={{ fontFamily: playfair, fontWeight: 700, fontSize: 22, color: orange, marginBottom: 24 }}>
                {validMatches.length} {validMatches.length === 1 ? 'person' : 'people'} ready to help you
              </p>
            )}

            {/* Top 3 match cards */}
            {validMatches.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
                {validMatches.slice(0, 3).map((match, i) => {
                  const name = match.parent_name || match.peer_name || match.helper_name || '';
                  const role = match.parent_role || match.helper_title || (match.peer_major ? match.peer_major : '') || '';
                  const company = match.parent_company || match.helper_company || (match.peer_year ? match.peer_year : '') || '';
                  return (
                    <div key={i} style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '0.5px solid rgba(255,255,255,0.1)',
                      borderRadius: 14, padding: '14px 16px',
                      display: 'flex', alignItems: 'center', gap: 14,
                      textAlign: 'left',
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                        background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#fff',
                      }}>
                        {getInitials(name)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#f4f0e8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {name}
                        </p>
                        <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: 'rgba(244,240,232,0.5)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {[role, company].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Primary CTA */}
            {validMatches.length > 0 ? (
              <>
                <button
                  onClick={handleSeeMatches}
                  style={{
                    width: '100%', padding: '15px 0', borderRadius: 100, border: 'none',
                    background: orange, color: '#fff',
                    fontFamily: dmSans, fontSize: 15, fontWeight: 500,
                    cursor: 'pointer', minHeight: 48,
                    transition: 'background 0.2s',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#d44e14'}
                  onMouseLeave={e => e.currentTarget.style.background = orange}
                >
                  See my matches →
                </button>
                <button
                  onClick={handleDashboard}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: dmSans, fontSize: 13, fontWeight: 300,
                    color: 'rgba(244,240,232,0.4)',
                    display: 'block', width: 'auto', minHeight: 44,
                    margin: '8px auto 0',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  Go to my dashboard →
                </button>
              </>
            ) : (
              <>
                <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: 'rgba(244,240,232,0.55)', marginBottom: 20, lineHeight: 1.7 }}>
                  We're still finding the right people for you. Your matches will appear on your dashboard shortly.
                </p>
                <button
                  onClick={handleDashboard}
                  style={{
                    width: '100%', padding: '15px 0', borderRadius: 100, border: 'none',
                    background: orange, color: '#fff',
                    fontFamily: dmSans, fontSize: 15, fontWeight: 500,
                    cursor: 'pointer', minHeight: 48,
                    transition: 'background 0.2s',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#d44e14'}
                  onMouseLeave={e => e.currentTarget.style.background = orange}
                >
                  Go to my dashboard →
                </button>
                <button
                  onClick={() => navigate('GatorDirectory')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: dmSans, fontSize: 13, fontWeight: 300,
                    color: 'rgba(244,240,232,0.4)',
                    display: 'block', width: 'auto', minHeight: 44,
                    margin: '8px auto 0',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  Browse the directory →
                </button>
              </>
            )}

            {/* FASTIQ upsell */}
            <div className="celeb-upsell" style={{
              marginTop: 28, background: 'rgba(232,93,32,0.08)',
              border: '0.5px solid rgba(232,93,32,0.2)',
              borderRadius: 12, padding: '14px 16px', textAlign: 'left',
            }}>
              <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(244,240,232,0.6)', margin: 0, lineHeight: 1.6 }}>
                FASTIQ can find UF alumni at your target companies — beyond the parents already here.
              </p>
              <button
                onClick={() => navigate('FastIQ')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: orange, marginTop: 6, padding: 0, minHeight: 44, width: 'auto', WebkitTapHighlightColor: 'transparent' }}
              >
                Learn about FASTIQ →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}