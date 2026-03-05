import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import moment from 'moment';

const SIGNAL_BADGES = {
  hot: { label: '🔥 Hot', bg: 'bg-red-500/20', text: 'text-red-400' },
  warm: { label: '☀️ Warm', bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  cool: { label: '❄️ Cool', bg: 'bg-blue-500/20', text: 'text-blue-400' },
};

export default function ParentTargetCompanies({ companies, intelCache, alumniCounts }) {
  if (!companies?.length) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.15em] mb-4">Target Companies</h2>
      <div className="space-y-2">
        {companies.map((name, i) => {
          const intel = intelCache[name.toLowerCase()];
          const alumniCount = alumniCounts[name.toLowerCase()] || 0;
          const signal = intel?.hiring_signal;
          const badge = signal ? SIGNAL_BADGES[signal] : null;

          return (
            <div
              key={i}
              className="rounded-xl p-4"
              style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate capitalize">{name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {alumniCount > 0 && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Users className="w-3 h-3" /> {alumniCount} alumni
                        </span>
                      )}
                      {intel?.expires_at && (
                        <span className="text-[10px] text-slate-500">
                          Researched {moment(intel.expires_at).subtract(24, 'hours').fromNow()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {badge && (
                    <Badge className={`${badge.bg} ${badge.text} border-0 text-[10px] px-2 py-0.5`}>
                      {badge.label}
                    </Badge>
                  )}
                  {intel?.hiring_score != null && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> {intel.hiring_score}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}