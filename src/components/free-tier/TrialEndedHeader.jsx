import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

/**
 * Post-expiry paywall header — loss-framed: shows exactly what the student
 * built during their trial and what goes read-only, with one reactivation CTA.
 */
export default function TrialEndedHeader({ firstName, theme, onReactivate, user }) {
  const [built, setBuilt] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    Promise.all([
      base44.entities.NetworkingPipeline.filter({ user_email: user.email }),
      base44.entities.TailoredResume.filter({ user_email: user.email }),
    ]).then(([pipeline, resumes]) => {
      setBuilt({
        apps: pipeline?.length || 0,
        contacts: (pipeline || []).filter(p => p.alumni_name).length,
        resumes: resumes?.length || 0,
      });
    }).catch(() => {});
  }, [user?.email]);

  const builtItems = built ? [
    built.apps > 0 && { count: built.apps, label: `tracked application${built.apps === 1 ? '' : 's'}` },
    built.contacts > 0 && { count: built.contacts, label: `warm contact${built.contacts === 1 ? '' : 's'} identified` },
    built.resumes > 0 && { count: built.resumes, label: `tailored resume${built.resumes === 1 ? '' : 's'}` },
  ].filter(Boolean) : [];

  const paused = ['Warm alumni matching', 'AI outreach scripts', 'Daily job signals', 'CLiFF career agent'];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
      border: '1px solid rgba(167,139,250,0.3)',
      borderRadius: 16,
      padding: '22px 24px',
      marginBottom: 16,
      boxShadow: '0 4px 24px rgba(124,58,237,0.18)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#c4b5fd', background: 'rgba(196,181,253,0.14)', border: '1px solid rgba(196,181,253,0.28)', borderRadius: 100, padding: '4px 12px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Trial Ended — Agent Paused
        </span>
      </div>

      <h2 style={{ fontFamily: dm, fontSize: 19, fontWeight: 800, color: '#fff', margin: '0 0 10px', lineHeight: 1.3, letterSpacing: '-0.02em' }}>
        {firstName}, your trial ended — here's what you built, now in read-only.
      </h2>
      <p style={{ fontFamily: dm, fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '0 0 16px', lineHeight: 1.65, fontWeight: 500 }}>
        Everything is saved, but CLiFF stopped working in the background — no new matches, scripts, or signals. Reactivate to pick up exactly where you left off.
      </p>

      {/* What you built — concrete loss framing */}
      {builtItems.length > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', marginBottom: 14 }}>
          <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px' }}>
            Your progress during the trial
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {builtItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: dm, fontSize: 20, fontWeight: 900, color: '#a78bfa' }}>{item.count}</span>
                <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* What's paused */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
        {paused.map((label) => (
          <span key={label} style={{ fontFamily: dm, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '5px 12px' }}>
            {label} <span style={{ color: '#c4b5fd' }}>· paused</span>
          </span>
        ))}
      </div>

      <button
        onClick={onReactivate}
        style={{
          fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#1e1b4b',
          background: '#fff', border: 'none', borderRadius: 999,
          padding: '12px 24px', cursor: 'pointer', minHeight: 44,
          boxShadow: '0 4px 14px rgba(167,139,250,0.3)', transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(167,139,250,0.4)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(167,139,250,0.3)'; }}
      >
        Reactivate Premium — $4.99/wk
      </button>
      <p style={{ fontFamily: dm, fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: '10px 0 0' }}>
        Billed monthly at $19.96/mo · Cancel anytime
      </p>
    </div>
  );
}