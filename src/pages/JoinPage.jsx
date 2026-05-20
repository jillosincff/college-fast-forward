import React, { useEffect, useState } from 'react';
import { getUniversityBrand } from '@/lib/universityBrand';
import OnboardingFlow from '@/components/onboarding-flow/OnboardingFlow';

// Campus-keyed gradient themes (Tailwind literal classes for scanner)
const CAMPUS_THEMES = {
  uf:      { from: '#0021A5', to: '#FA4616' },
  fsu:     { from: '#782F40', to: '#CEB888' },
  ucf:     { from: '#000000', to: '#FFC904' },
  osu:     { from: '#BB0000', to: '#666666' },
  umich:   { from: '#00274C', to: '#FFCB05' },
  uga:     { from: '#BA0C2F', to: '#000000' },
  psu:     { from: '#1E407C', to: '#FFFFFF' },
  usc:     { from: '#990000', to: '#FFC72C' },
  tulane:  { from: '#006747', to: '#418FDE' },
  umd:     { from: '#E03A3E', to: '#FFD520' },
  default: { from: '#6366F1', to: '#8B5CF6' },
};

function getCampusTheme(key) {
  return CAMPUS_THEMES[key] || CAMPUS_THEMES.default;
}

export default function JoinPage() {
  const [referrerId, setReferrerId] = useState(null);
  const [referrerName, setReferrerName] = useState('A classmate');
  const [campusKey, setCampusKey] = useState('default');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    try {
      // Parse from query string (?r=...&campus=...&name=...)
      const params = new URLSearchParams(window.location.search);
      // Also check hash params e.g. /#/join?r=...
      const hashSearch = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
      const hashParams = new URLSearchParams(hashSearch);

      const urlReferrerId = params.get('r') || hashParams.get('r');
      const urlCampus = (params.get('campus') || hashParams.get('campus') || '').toLowerCase();
      const urlName = params.get('name') || hashParams.get('name');

      if (urlReferrerId) {
        localStorage.setItem('cff_referrer_id', urlReferrerId);
        setReferrerId(urlReferrerId);
        if (urlName) setReferrerName(urlName);
      } else {
        const stored = localStorage.getItem('cff_referrer_id');
        if (stored) setReferrerId(stored);
      }

      if (urlCampus) {
        localStorage.setItem('cff_referrer_campus', urlCampus);
        setCampusKey(urlCampus);
      } else {
        const storedCampus = localStorage.getItem('cff_referrer_campus');
        if (storedCampus) setCampusKey(storedCampus);
      }
    } catch {}
  }, []);

  const brand = getUniversityBrand(campusKey);
  const theme = getCampusTheme(campusKey);
  const hasReferral = !!referrerId;

  const handleStartScan = () => {
    try {
      localStorage.setItem('pending_invite_role', 'student');
      sessionStorage.setItem('cff_onboarding_type', 'student');
    } catch {}
    setShowOnboarding(true);
  };

  if (showOnboarding) {
    return <OnboardingFlow onClose={() => setShowOnboarding(false)} />;
  }

  return (
    <div
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
      className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-6 select-none relative overflow-hidden"
    >
      {/* Ambient glows */}
      <div className="absolute top-0 left-[-10%] w-[70%] h-[45%] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(ellipse, ${theme.from}33 0%, transparent 70%)`, filter: 'blur(60px)' }} />
      <div className="absolute bottom-0 right-[-10%] w-[60%] h-[40%] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(ellipse, ${theme.to}22 0%, transparent 70%)`, filter: 'blur(80px)' }} />

      {/* Top brand */}
      <div className="pt-2 flex items-center gap-2 relative z-10">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shadow-md text-white"
          style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}>
          CF
        </div>
        <span className="text-xs font-black tracking-widest uppercase text-slate-400">
          College Fast Forward
        </span>
      </div>

      {/* Main content */}
      <div className="max-w-md mx-auto w-full my-auto space-y-8 relative z-10 pt-10 pb-16">

        {/* Invitation banner — always shown, personalized if referral present */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-base shadow-inner flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}>
            🎓
          </div>
          <div className="space-y-0.5 min-w-0">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {hasReferral ? 'Campus Invitation Active' : 'Exclusive Access'}
            </p>
            <p className="text-xs font-black text-white leading-snug">
              {hasReferral
                ? <>{referrerName} opened an <span style={{ color: theme.from === theme.to ? '#818CF8' : theme.from }} className="font-black">Inside Track</span> route for <span className="font-black">{brand.shortName}</span> students.</>
                : <>You've been invited to the <span className="font-black">{brand.shortName}</span> Inside Track network.</>
              }
            </p>
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-4">
          <h1 className="text-3xl font-black tracking-tight leading-tight md:text-4xl">
            Bypass the job board black hole.{' '}
            <span className="font-black" style={{ background: `linear-gradient(90deg, ${theme.from}, ${theme.to})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {brand.networkLabel}
            </span>{' '}
            already have the jobs.
          </h1>
          <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-sm">
            Stop applying blindly to portals with 500+ candidates. CFF maps your campus network, optimizes your resume, and writes warm outreach to real hiring managers.
          </p>
        </div>

        {/* Trust signals */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { stat: '2,400+', label: 'Students' },
            { stat: '18%', label: 'Reply rate' },
            { stat: '60s', label: 'To start' },
          ].map(({ stat, label }) => (
            <div key={label} className="bg-white/5 border border-white/8 rounded-xl p-3 text-center">
              <p className="text-lg font-black text-white">{stat}</p>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleStartScan}
            className="w-full text-white font-black text-sm py-4 px-6 rounded-2xl transition-all active:scale-[0.99] flex items-center justify-center gap-2 tracking-wide shadow-xl"
            style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`, minHeight: 'auto' }}
          >
            ⚡ Run My Free Network Scan
          </button>
          <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500">
            <span>🔒 Free account</span>
            <span>•</span>
            <span>⏱️ Under 60 seconds</span>
            <span>•</span>
            <span>No credit card</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/5 pt-4 pb-1 text-center relative z-10">
        <p className="text-[10px] font-semibold text-slate-600 tracking-wide">
          College Fast Forward · The Proactive Agent for Campus Job Seekers
        </p>
      </div>
    </div>
  );
}