import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Search, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function OpportunityCard({ opp, onResearch, onFindAlumni, onDismiss }) {
  const postedText = opp.posting_date
    ? formatDistanceToNow(new Date(opp.posting_date), { addSuffix: true })
    : opp.scouted_date
    ? `Found ${formatDistanceToNow(new Date(opp.scouted_date), { addSuffix: true })}`
    : '';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
      className="relative rounded-lg p-4 group"
      style={{ background: '#1E293B', border: '1px solid rgba(250,70,22,0.15)' }}
    >
      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(opp)}
        className="absolute top-2 right-2 p-1 rounded-md opacity-40 hover:opacity-100 hover:bg-white/10 transition-all"
        style={{ minHeight: 'auto', minWidth: 'auto', width: 'auto' }}
      >
        <X className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {/* Company + role */}
      <div className="pr-6">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-semibold text-white text-[13px]">{opp.company_name}</span>
          <span className="text-[10px] text-slate-500">•</span>
          <span className="text-[12px] text-slate-300">{opp.role_title}</span>
        </div>

        {/* Posted time */}
        {postedText && (
          <p className="text-[10px] text-slate-500 mb-1.5">
            {opp.posting_date ? `Posted ${postedText}` : postedText}
          </p>
        )}

        {/* Match reason */}
        {opp.match_reason && (
          <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{opp.match_reason}</p>
        )}

        {/* Alumni badge */}
        {opp.alumni_available && opp.alumni_count > 0 && (
          <p className="text-[11px] font-semibold mb-2" style={{ color: '#FA4616' }}>
            ✨ {opp.alumni_count} UF {opp.alumni_count === 1 ? 'alum works' : 'alumni work'} here
          </p>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={() => onResearch(opp.company_name)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-semibold text-blue-400 hover:bg-blue-500/10 transition-colors"
            style={{ border: '1px solid rgba(59,130,246,0.2)', minHeight: 'auto', minWidth: 'auto', width: 'auto' }}
          >
            <Search className="w-3 h-3" /> Research →
          </button>
          <button
            onClick={() => onFindAlumni(opp.company_name)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-semibold transition-colors hover:bg-orange-500/10"
            style={{ border: '1px solid rgba(250,70,22,0.2)', color: '#FA4616', minHeight: 'auto', minWidth: 'auto', width: 'auto' }}
          >
            <Users className="w-3 h-3" /> Find Alumni →
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ScoutedAlerts({ userEmail, onOpenChat, onAlertsCountChange, forceOpen }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  // When forceOpen changes to true, expand the section
  useEffect(() => {
    if (forceOpen) setCollapsed(false);
  }, [forceOpen]);

  const loadAlerts = useCallback(async () => {
    if (!userEmail) return;
    const data = await base44.entities.ScoutedOpportunity.filter(
      { user_email: userEmail, is_new: true },
      '-scouted_date',
      20
    );
    setAlerts(data || []);
    setLoading(false);
    if (onAlertsCountChange) onAlertsCountChange(data?.length || 0);
  }, [userEmail]);

  useEffect(() => { loadAlerts(); }, [loadAlerts]);

  const handleDismiss = async (opp) => {
    // Optimistic update
    setAlerts(prev => prev.filter(a => a.id !== opp.id));
    await base44.entities.ScoutedOpportunity.update(opp.id, { is_new: false, status: 'viewed' });

    // Decrement profile alert count
    const profiles = await base44.entities.FastTrackProProfile.filter({ user_email: userEmail });
    if (profiles?.[0]) {
      const current = profiles[0].new_alerts_count || 0;
      await base44.entities.FastTrackProProfile.update(profiles[0].id, {
        new_alerts_count: Math.max(0, current - 1),
      });
    }

    if (onAlertsCountChange) onAlertsCountChange(alerts.length - 1);
  };

  const handleDismissAll = async () => {
    const ids = alerts.map(a => a.id);
    setAlerts([]);
    if (onAlertsCountChange) onAlertsCountChange(0);

    for (const id of ids) {
      await base44.entities.ScoutedOpportunity.update(id, { is_new: false, status: 'viewed' });
    }

    const profiles = await base44.entities.FastTrackProProfile.filter({ user_email: userEmail });
    if (profiles?.[0]) {
      await base44.entities.FastTrackProProfile.update(profiles[0].id, { new_alerts_count: 0 });
    }
  };

  const handleResearch = (company) => {
    onOpenChat(`Research ${company} for me — are they hiring? What roles, salary ranges, and interview process should I know about?`);
  };

  const handleFindAlumni = (company) => {
    onOpenChat(`Find UF Gator alumni who work at ${company} — I need insider connections to get my foot in the door.`);
  };

  if (loading || alerts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Alert header */}
      <div
        className="rounded-t-lg px-4 py-3 flex items-center justify-between cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, rgba(250,70,22,0.15), rgba(250,70,22,0.05))',
          border: '1px solid rgba(250,70,22,0.2)',
          borderBottom: collapsed ? '1px solid rgba(250,70,22,0.2)' : 'none',
          borderRadius: collapsed ? '8px' : '8px 8px 0 0',
        }}
        onClick={() => setCollapsed(prev => !prev)}
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Bell className="w-4 h-4" style={{ color: '#FA4616' }} />
          </motion.div>
          <span className="text-[13px] font-bold text-white">
            FASTIQ found {alerts.length} new opportunit{alerts.length === 1 ? 'y' : 'ies'}
          </span>
          <span className="text-[10px] text-slate-500">since your last visit</span>
        </div>
        <div className="flex items-center gap-2">
          {!collapsed && (
            <button
              onClick={(e) => { e.stopPropagation(); handleDismissAll(); }}
              className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
              style={{ minHeight: 'auto', minWidth: 'auto', width: 'auto' }}
            >
              Dismiss all
            </button>
          )}
          <span className="text-[10px] text-slate-500">{collapsed ? '▼' : '▲'}</span>
        </div>
      </div>

      {/* Alert body */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden rounded-b-lg"
            style={{
              background: 'rgba(250,70,22,0.03)',
              border: '1px solid rgba(250,70,22,0.2)',
              borderTop: 'none',
            }}
          >
            <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
              <AnimatePresence>
                {alerts.map(opp => (
                  <OpportunityCard
                    key={opp.id}
                    opp={opp}
                    onResearch={handleResearch}
                    onFindAlumni={handleFindAlumni}
                    onDismiss={handleDismiss}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}