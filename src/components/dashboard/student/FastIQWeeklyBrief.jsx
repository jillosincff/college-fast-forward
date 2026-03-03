import React, { useState, useEffect } from 'react';
import { Zap, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';

export default function FastIQWeeklyBrief({ user }) {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.FastTrackProProfile.filter({ user_email: user.email })
      .then(profiles => {
        const profile = profiles?.[0];
        if (!profile?.weekly_scout_summary) return;
        try {
          const parsed = JSON.parse(profile.weekly_scout_summary);
          if (parsed.new_opps > 0) setSummary(parsed);
        } catch {}
      })
      .catch(() => {});
  }, [user?.email]);

  if (!summary) return null;

  return (
    <div
      className="rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all"
      style={{
        background: 'linear-gradient(135deg, #0A1628 0%, #0021A5 100%)',
        border: '1px solid rgba(250,70,22,0.2)',
      }}
      onClick={() => navigate('FastIQ?view=alerts')}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(250,70,22,0.15)' }}>
          <Zap className="w-5 h-5 text-orange-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-orange-400 font-bold uppercase tracking-wider mb-1">📊 FASTIQ Weekly Brief</p>
          <p className="text-[13px] text-white leading-relaxed">
            <span className="font-bold">{summary.new_opps}</span> new {summary.new_opps === 1 ? 'opportunity' : 'opportunities'} found
            {summary.at_target_companies > 0 && <>, <span className="font-bold">{summary.at_target_companies}</span> at your target companies</>}
            {summary.alumni_identified > 0 && <>, <span className="font-bold">{summary.alumni_identified}</span> UF alumni identified</>}
            .
          </p>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-[11px] font-semibold" style={{ color: '#FA4616' }}>Open FASTIQ</span>
            <ArrowRight className="w-3 h-3" style={{ color: '#FA4616' }} />
          </div>
        </div>
      </div>
    </div>
  );
}