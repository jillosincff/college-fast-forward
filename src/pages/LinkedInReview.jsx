import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { Home, FileText, Search, Building2, MessageSquare } from 'lucide-react';

function SideNav() {
  const NAV = [
    { label: 'Home', icon: Home, page: 'FreeTierDashboard' },
    { label: 'Resume', icon: FileText, page: 'ResumeTailoring' },
    { label: 'Alumni', icon: Search, page: 'FreeTierDashboard?tab=alumni_search' },
    { label: 'Companies', icon: Building2, page: 'FreeTierDashboard?tab=company_intel' },
    { label: 'Messages', icon: MessageSquare, page: 'MyMessages' },
  ];
  return (
    <div style={{
      width: 60, background: '#fff', borderRight: '1px solid #E5E5E5',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingTop: 20, position: 'sticky', top: 0, height: '100vh'
    }}>
      {NAV.map(item => {
        const Icon = item.icon;
        return (
          <button key={item.page} onClick={() => navigate(item.page)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 44, height: 44, borderRadius: 8, background: 'none',
            border: 'none', cursor: 'pointer', color: '#666',
            minHeight: 'auto', minWidth: 'auto'
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
            title={item.label}
          >
            <Icon size={18} />
          </button>
        );
      })}
    </div>
  );
}

const scoreColor = (score) =>
  score >= 80 ? '#22C55E' : score >= 60 ? '#F59E0B' : '#EF4444';

export default function LinkedInReview({ onOpenUpgrade: onOpenUpgradeProp }) {
  const { user } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const onOpenUpgrade = onOpenUpgradeProp || (() => setShowUpgradeModal(true));

  const [url, setUrl] = useState(user?.linkedin_url || '');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  const isFastIQ = !!(
    user?.fastiq_setup_complete ||
    user?.subscription_status === 'active' ||
    user?.membership_tier === 'fastiq'
  );

  const handleReview = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setAnalysis(null);
    try {
      const res = await base44.functions.invoke('reviewLinkedInProfile', {
        linkedinUrl: url.trim(),
        careerGoals: user?.career_goals,
        major: user?.major,
      });
      if (res?.data?.success) {
        setAnalysis(res.data.analysis);
        setProfile(res.data.profile);
        base44.auth.updateMe({ linkedin_url: url.trim() }).catch(() => {});
      } else {
        setError(res?.data?.error || 'Something went wrong. Please try again.');
      }
    } catch (e) {
      setError('Could not analyze profile. Please check the URL and try again.');
    }
    setLoading(false);
  };

  // FastIQ gate
  if (!isFastIQ) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <SideNav />
        <div style={{ flex: 1, maxWidth: 600, margin: '80px auto', textAlign: 'center', padding: '0 24px' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#E8F4FD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 24px' }}>🔗</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#1A1A1A', margin: '0 0 12px' }}>LinkedIn Profile Review</h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#888', margin: '0 0 32px', lineHeight: 1.6 }}>
            Paste your LinkedIn URL and FastIQ will score every section of your profile against your target role — with specific rewrites for your headline, about section, and more.
          </p>
          <button onClick={() => onOpenUpgrade()} style={{ background: '#E85D20', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 15, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            Unlock FastIQ →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SideNav />
      <div style={{ flex: 1, maxWidth: 720, margin: '0 auto', padding: '40px 24px', width: '100%' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E85D20', margin: '0 0 8px' }}>LINKEDIN PROFILE REVIEW</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>
            Let's optimize your LinkedIn.
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888', margin: 0 }}>
            FastIQ will score every section against your target role and tell you exactly what to fix.
          </p>
        </div>

        {/* URL input */}
        {!analysis && !loading && (
          <div style={{ marginBottom: 32 }}>
            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', display: 'block', marginBottom: 8 }}>
              Your LinkedIn URL
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleReview()}
                placeholder="https://linkedin.com/in/yourname"
                style={{ flex: 1, fontSize: 14, padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: 10, background: '#fff', color: '#1A1A1A', fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box' }}
              />
              <button
                onClick={handleReview}
                disabled={!url.trim()}
                style={{ background: !url.trim() ? '#F0F0F0' : '#E85D20', border: 'none', borderRadius: 10, padding: '0 24px', fontSize: 14, fontWeight: 600, color: !url.trim() ? '#CCC' : '#fff', cursor: !url.trim() ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', minHeight: 'auto' }}
              >
                Review My Profile →
              </button>
            </div>
            {error && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#EF4444', margin: '8px 0 0' }}>{error}</p>}
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#AAAAAA', margin: '8px 0 0' }}>
              Make sure your LinkedIn profile is set to public before analyzing.
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ background: '#0A0A0A', borderRadius: 16, padding: '40px', textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid rgba(232,93,32,0.2)', borderTop: '4px solid #E85D20', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>Analyzing your LinkedIn profile...</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              Scoring against your {user?.career_goals?.target_roles?.[0] || 'target'} goals. Takes about 15 seconds.
            </p>
          </div>
        )}

        {/* Results */}
        {analysis && !loading && (
          <div>
            {/* Profile header */}
            {profile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, background: '#fff', border: '1px solid #E5E5E5', borderRadius: 14, padding: '16px 20px' }}>
                {profile.profile_pic_url ? (
                  <img src={profile.profile_pic_url} alt={profile.full_name} style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#0077B5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
                    {profile.full_name?.[0] || 'L'}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: '#1A1A1A', margin: '0 0 2px' }}>{profile.full_name}</p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: 0 }}>{profile.headline}</p>
                </div>
                <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#0077B5', fontWeight: 600, textDecoration: 'none' }}>
                  View Profile →
                </a>
              </div>
            )}

            {/* Overall score */}
            <div style={{ background: '#0A0A0A', borderRadius: 16, padding: '28px 32px', marginBottom: 24 }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E85D20', margin: '0 0 20px' }}>
                LINKEDIN ANALYSIS · MATCHED TO YOUR GOALS
              </p>
              <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ width: 90, height: 90, borderRadius: '50%', border: `4px solid ${scoreColor(analysis.overall_score)}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{analysis.overall_score}</span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>/100</span>
                  </div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: scoreColor(analysis.overall_score), margin: '8px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {analysis.score_label}
                  </p>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#fff', margin: '0 0 16px', lineHeight: 1.6 }}>{analysis.summary}</p>
                  <div style={{ background: 'rgba(232,93,32,0.15)', border: '1px solid rgba(232,93,32,0.3)', borderRadius: 10, padding: '14px 16px' }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: '#E85D20', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>⚡ TOP 3 FIXES</p>
                    {analysis.top_3_fixes?.map((fix, i) => (
                      <p key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: i < 2 ? '0 0 8px' : 0, lineHeight: 1.5, paddingLeft: 8, borderLeft: '2px solid rgba(232,93,32,0.4)' }}>
                        {i + 1}. {fix}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>

              {/* Headline */}
              <SectionCard title="📌 Headline" score={analysis.sections?.headline?.score}>
                <p style={feedbackStyle}><strong>Current:</strong> "{analysis.sections?.headline?.current}"</p>
                <p style={feedbackStyle}>{analysis.sections?.headline?.feedback}</p>
                {analysis.sections?.headline?.suggested && (
                  <SuggestedBox label="SUGGESTED HEADLINE">
                    "{analysis.sections?.headline?.suggested}"
                  </SuggestedBox>
                )}
              </SectionCard>

              {/* About */}
              <SectionCard title="📝 About / Summary" score={analysis.sections?.about?.score}>
                <p style={feedbackStyle}>{analysis.sections?.about?.feedback}</p>
                {analysis.sections?.about?.suggested && (
                  <SuggestedBox label="SUGGESTED OPENING">
                    <em>"{analysis.sections?.about?.suggested}"</em>
                  </SuggestedBox>
                )}
              </SectionCard>

              {/* Experience */}
              <SectionCard title="💼 Experience" score={analysis.sections?.experience?.score}>
                <p style={feedbackStyle}>{analysis.sections?.experience?.feedback}</p>
                {analysis.sections?.experience?.top_fix && (
                  <div style={{ background: '#FFF5F0', border: '1px solid rgba(232,93,32,0.2)', borderRadius: 8, padding: '10px 14px' }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: '#E85D20', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>⚡ TOP FIX</p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#1A1A1A', margin: 0 }}>{analysis.sections?.experience?.top_fix}</p>
                  </div>
                )}
              </SectionCard>

              {/* Skills */}
              <SectionCard title="🛠 Skills" score={analysis.sections?.skills?.score}>
                <p style={feedbackStyle}>{analysis.sections?.skills?.feedback}</p>
                {analysis.sections?.skills?.missing_keywords?.length > 0 && (
                  <div>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: '#888', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>ADD THESE KEYWORDS:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {analysis.sections?.skills?.missing_keywords?.map(kw => (
                        <span key={kw} style={{ background: '#F0FFF4', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#22C55E', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
              </SectionCard>

              {/* Completeness */}
              <SectionCard title="✅ Profile Completeness" score={analysis.sections?.completeness?.score}>
                <p style={feedbackStyle}>{analysis.sections?.completeness?.feedback}</p>
                {analysis.sections?.completeness?.missing?.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {analysis.sections?.completeness?.missing?.map(item => (
                      <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: '#EF4444', fontSize: 14 }}>❌</span>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#555', margin: 0 }}>{item}</p>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>

              {/* Keywords */}
              {analysis.keywords_to_add?.length > 0 && (
                <div style={{ background: '#0A0A0A', borderRadius: 14, padding: '20px 24px' }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E85D20', margin: '0 0 12px' }}>
                    🔑 KEYWORDS TO ADD FOR {(user?.career_goals?.target_roles?.[0] || 'YOUR ROLE').toUpperCase()}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {analysis.keywords_to_add?.map(kw => (
                      <span key={kw} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: '5px 14px', fontSize: 13, color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>{kw}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => { setAnalysis(null); setProfile(null); setError(''); }}
              style={{ background: 'none', border: '1px solid #E0E0E0', borderRadius: 10, padding: '12px', fontSize: 13, color: '#888', cursor: 'pointer', width: '100%', fontFamily: "'DM Sans', sans-serif" }}
            >
              ← Analyze a Different Profile
            </button>
          </div>
        )}

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

// Small helpers to keep JSX clean
const feedbackStyle = { fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#555', margin: '0 0 12px', lineHeight: 1.5 };

function SectionCard({ title, score, children }) {
  const color = score >= 80 ? '#22C55E' : score >= 60 ? '#F59E0B' : '#EF4444';
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 14, padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>{title}</p>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color }}>{score}/100</span>
      </div>
      {children}
    </div>
  );
}

function SuggestedBox({ label, children }) {
  return (
    <div style={{ background: '#F0FFF4', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '10px 14px' }}>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: '#22C55E', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>✨ {label}</p>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#1A1A1A', margin: 0, fontWeight: 600 }}>{children}</p>
    </div>
  );
}