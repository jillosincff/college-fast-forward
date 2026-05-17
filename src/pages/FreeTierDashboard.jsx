import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import UpgradeModal from '@/components/free-tier/UpgradeModal';
import FreeTierNav from '@/components/free-tier/FreeTierNav';
import ApplicationTracker from '@/components/free-tier/ApplicationPipeline';
import TeaserSignalsCard from '@/components/free-tier/TeaserSignalsCard';
import ResumeAtsTeaser from '@/components/free-tier/ResumeAtsTeaser';
import ParentNetworkWidget from '@/components/free-tier/ParentNetworkWidget';
import { getThemeForSchool } from '@/lib/campusThemes';

export default function FreeTierDashboard() {
  const [user, setUser] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');
  const [parentCount, setParentCount] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      // Count parents matching this exact school — no regional fallbacks
      const school = u?.school_code || u?.school || null;
      if (school) {
        base44.entities.User.filter({ persona: 'parent', school_code: school })
          .then(results => setParentCount(results?.length ?? 0))
          .catch(() => setParentCount(0));
      } else {
        setParentCount(0);
      }
    }).catch(() => {});
  }, []);

  const triggerUpgrade = (featureName) => {
    setUpgradeFeature(featureName);
    setShowUpgrade(true);
  };

  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const college = (() => {
    try { return localStorage.getItem('cff_college') || user?.school || 'your university'; } catch { return 'your university'; }
  })();
  const campusTheme = getThemeForSchool(college);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <FreeTierNav user={user} onUpgrade={() => triggerUpgrade('Premium Sprint')} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* ── Welcome Banner ── */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, padding: '24px 28px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div>
            <h1 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
              Welcome back, {firstName} 👋
            </h1>
            <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 14, color: '#6b7280', margin: 0 }}>
              Free Tier · Track up to 5 applications manually
            </p>
          </div>
          <button
            onClick={() => triggerUpgrade('Premium Sprint')}
            style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 14, fontWeight: 700, color: '#fff', background: `linear-gradient(135deg, ${campusTheme.primary}, ${campusTheme.secondary || campusTheme.primary})`, border: 'none', borderRadius: 12, padding: '12px 24px', cursor: 'pointer', minHeight: 'auto', boxShadow: `0 4px 14px ${campusTheme.primary}44`, whiteSpace: 'nowrap' }}
          >
            ⚡ Upgrade to Premium — $4.99/wk
          </button>
        </div>

        {/* ── Main Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 24, alignItems: 'start' }} className="ftd-grid">

          {/* ── Left Column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <ApplicationTracker onUpgrade={triggerUpgrade} />
            <TeaserSignalsCard onUnlock={() => triggerUpgrade('Backdoor Lead Signals')} college={college} theme={campusTheme} />
          </div>

          {/* ── Right Column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="ftd-sidebar">

            {/* Resume ATS Check */}
            <ResumeAtsTeaser onUpgrade={() => triggerUpgrade('Resume Wow Rewrite')} />

            {/* Alumni Outreach Generator — campus-themed */}
            <div
              onClick={() => triggerUpgrade('AI Outreach Generator')}
              style={{ background: '#fff', border: `1px solid ${campusTheme.primary}`, borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = `0 6px 20px ${campusTheme.primary}22`}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'}
            >
              <div style={{ background: `linear-gradient(135deg, ${campusTheme.bgTint}, rgba(255,255,255,0.8))`, padding: '16px 20px', borderBottom: `1px solid ${campusTheme.primary}33` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>✉️</span>
                    <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>Alumni Outreach Generator</p>
                  </div>
                  <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 10, fontWeight: 700, color: campusTheme.primary, background: campusTheme.bgTint, border: `1px solid ${campusTheme.primary}44`, borderRadius: 100, padding: '3px 10px' }}>PREMIUM</span>
                </div>
              </div>
              <div style={{ padding: '16px 20px', opacity: 0.7, position: 'relative' }}>
                <div style={{ background: campusTheme.bgTint, borderRadius: 10, padding: '12px 14px', marginBottom: 10, border: `1px solid ${campusTheme.primary}22` }}>
                  <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 12, fontWeight: 600, color: '#374151', margin: '0 0 6px', lineHeight: 1.5 }}>
                    Hi Sarah, I noticed you graduated from <strong style={{ color: campusTheme.primary }}>{college}</strong> and currently work as a Product Manager at <span style={{ background: '#e5e7eb', borderRadius: 3, padding: '0 6px', filter: 'blur(4px)', userSelect: 'none' }}>████████ Co</span>. I'm a senior at <strong style={{ color: campusTheme.primary }}>{college}</strong> studying...
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {[1, 2, 3].map((_, i) => (
                      <div key={i} style={{ height: 8, background: `${campusTheme.primary}22`, borderRadius: 4, width: i === 2 ? '60%' : '100%' }} />
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 12, color: campusTheme.secondary, fontWeight: 700, margin: 0 }}>Click to unlock personalized scripts →</p>
                </div>
              </div>
            </div>

            {/* Parent Network Widget — only shown when ≥20 parents from this exact school */}
            {parentCount >= 20 && (
              <ParentNetworkWidget
                onUnlock={() => triggerUpgrade('Parent Network Introductions')}
                college={college}
                theme={campusTheme}
              />
            )}

            {/* Hiring Experts Chat */}
            <div
              onClick={() => triggerUpgrade('Hiring Expert Chat')}
              style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer' }}
            >
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>💬</span>
                  <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>Hiring Experts Chat</p>
                </div>
                <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 10, fontWeight: 700, color: '#fff', background: '#6b7280', borderRadius: 100, padding: '3px 10px' }}>PREMIUM ONLY</span>
              </div>
              <div style={{ padding: '16px 20px', opacity: 0.5 }}>
                {[
                  { from: 'Agent', msg: 'I found 3 hiring managers at your target company active this week.' },
                  { from: 'You', msg: 'Can you draft an intro message for me?' },
                  { from: 'Agent', msg: "Absolutely — here's a personalized script based on your background..." },
                ].map((m, i) => (
                  <div key={i} style={{ marginBottom: 8, textAlign: m.from === 'You' ? 'right' : 'left' }}>
                    <div style={{ display: 'inline-block', background: m.from === 'You' ? '#eff6ff' : '#f9fafb', border: `1px solid ${m.from === 'You' ? '#bfdbfe' : '#e5e7eb'}`, borderRadius: 10, padding: '8px 12px', maxWidth: '80%' }}>
                      <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 11, color: '#374151', margin: 0, lineHeight: 1.5 }}>{m.msg}</p>
                    </div>
                  </div>
                ))}
                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 12, color: '#2563eb', fontWeight: 600, margin: 0 }}>Unlock to chat with your Agent →</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {showUpgrade && (
        <UpgradeModal
          featureName={upgradeFeature}
          onClose={() => setShowUpgrade(false)}
          onUpgrade={() => {
            setShowUpgrade(false);
            base44.auth.redirectToLogin('/#FreeTierDashboard');
          }}
        />
      )}
    </div>
  );
}