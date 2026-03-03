import React, { useState, useEffect } from 'react';
import { Zap, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import titleCase from '@/components/utils/titleCase';

function plural(count, singular, pluralForm) {
  return count === 1 ? singular : pluralForm;
}

export default function FastIQBanner({ user }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.FastTrackProProfile.filter({ user_email: user.email })
      .then(profiles => setProfile(profiles?.[0] || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.email]);

  if (loading) return null;

  const isActive = profile?.assessment_complete;

  if (isActive) {
    const targets = profile.companies_researched || 0;
    const insiders = profile.alumni_discovered || 0;
    const messages = profile.messages_drafted || 0;
    const newAlerts = profile.new_alerts_count || 0;

    return (
      <div className="w-full cursor-pointer" onClick={() => navigate('FastIQ')}>
        <div
          className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-6"
          style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0021A5 100%)' }}
        >
          {/* Left: Logo + Active */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Zap className="w-4 h-4 text-orange-400" />
            <span className="text-white font-bold text-xs sm:text-sm tracking-wide">FASTIQ™</span>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-500/20 border border-green-500/30">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] font-semibold text-green-400 uppercase">Active</span>
            </div>
          </div>

          {/* Center: alerts or stats */}
          {newAlerts > 0 ? (
            <div className="flex items-center gap-1 text-[12px] font-bold" style={{ color: '#FA4616' }}>
              <span>🔔 {newAlerts} new {plural(newAlerts, 'opportunity', 'opportunities')} found</span>
            </div>
          ) : (
            <>
              <div className="hidden sm:flex items-center gap-1 text-[12px] text-white/60 font-medium">
                <span className="text-white font-bold">{targets}</span> {plural(targets, 'Target', 'Targets')}
                <span className="text-white/30 mx-1">|</span>
                <span className="text-white font-bold">{insiders}</span> {plural(insiders, 'Insider', 'Insiders')}
                <span className="text-white/30 mx-1">|</span>
                <span className="text-white font-bold">{messages}</span> {plural(messages, 'Message', 'Messages')}
              </div>
              <div className="flex sm:hidden items-center gap-1 text-[11px] text-white/60 font-medium">
                <span className="text-white font-bold">{targets}</span>T
                <span className="text-white/30 mx-0.5">·</span>
                <span className="text-white font-bold">{insiders}</span>I
                <span className="text-white/30 mx-0.5">·</span>
                <span className="text-white font-bold">{messages}</span>M
              </div>
            </>
          )}

          {/* Right: CTA */}
          <button
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-bold text-white flex-shrink-0 transition-all hover:brightness-110"
            style={{ background: '#FA4616' }}
          >
            {newAlerts > 0 ? 'View Now' : 'Open FASTIQ'} <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // Not active — upsell banner
  return (
    <div className="w-full cursor-pointer" onClick={() => navigate('FastIQ')}>
      <div
        className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-6"
        style={{ background: 'linear-gradient(135deg, #0021A5 0%, #FA4616 100%)' }}
      >
        <div className="flex items-center gap-2 flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
          <span className="text-white font-bold text-xs sm:text-sm tracking-wide">FASTIQ™</span>
        </div>

        <p className="text-[11px] sm:text-[12px] text-white/85 font-medium truncate">
          Your AI career agent — find alumni, draft outreach, land interviews
        </p>

        <button
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-bold text-white flex-shrink-0 transition-all hover:brightness-110"
          style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}
        >
          Activate <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}