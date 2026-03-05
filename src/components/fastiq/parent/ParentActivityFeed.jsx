import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, MessageSquare, Map } from 'lucide-react';
import moment from 'moment';

const ACTION_CONFIG = {
  company_search: { icon: Building2, color: '#3B82F6', verb: 'Researched' },
  alumni_view: { icon: Users, color: '#FA4616', verb: 'Found alumni at' },
  message_draft: { icon: MessageSquare, color: '#22C55E', verb: 'Drafted outreach to' },
  roadmap_created: { icon: Map, color: '#A855F7', verb: 'Created roadmap for' },
};

export default function ParentActivityFeed({ activities }) {
  if (!activities?.length) {
    return (
      <div className="rounded-xl p-6 text-center" style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-sm text-slate-500">No activity yet — they'll get started soon!</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
      <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.15em] mb-4">Recent Activity</h2>
      <div className="space-y-1">
        {activities.map((a, i) => {
          const cfg = ACTION_CONFIG[a.action_type] || ACTION_CONFIG.company_search;
          const Icon = cfg.icon;
          return (
            <div
              key={a.id || i}
              className="rounded-lg px-4 py-3 flex items-center gap-3"
              style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.04)' }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${cfg.color}15` }}>
                <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-white truncate">
                  {cfg.verb} <span className="font-semibold capitalize">{a.target_name || 'a company'}</span>
                </p>
              </div>
              <span className="text-[10px] text-slate-500 flex-shrink-0">
                {moment(a.timestamp || a.created_date).fromNow()}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}