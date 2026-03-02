import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, MessageSquare, Map, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import moment from 'moment';

const ACTION_CONFIG = {
  company_search: { icon: Building2, label: 'Researched', badgeLabel: 'target intel', color: '#3B82F6' },
  alumni_view: { icon: Users, label: 'Discovered alumni at', badgeLabel: 'insider found', color: '#FA4616' },
  message_draft: { icon: MessageSquare, label: 'Drafted message to', badgeLabel: 'outreach', color: '#22C55E' },
  roadmap_created: { icon: Map, label: 'Created roadmap', badgeLabel: 'warm path', color: '#A855F7' },
};

export default function ProActivityFeed({ userEmail }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) return;
    (async () => {
      try {
        const logs = await base44.entities.ProActivityLog.filter(
          { user_email: userEmail },
          '-created_date',
          10
        );
        setActivities(logs || []);
      } catch (e) {
        console.log('Failed to load activity log:', e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [userEmail]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="p-6 text-center rounded-lg" style={{ border: '1px dashed rgba(255,255,255,0.1)' }}>
        <Clock className="w-7 h-7 mx-auto mb-2 text-slate-600" />
        <p className="text-sm text-slate-500">No activity yet. Activate FASTIQ to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((a, idx) => {
        const config = ACTION_CONFIG[a.action_type] || ACTION_CONFIG.company_search;
        const Icon = config.icon;
        const timeAgo = moment(a.timestamp || a.created_date).fromNow();
        const isRecent = moment().diff(moment(a.timestamp || a.created_date), 'hours') < 6;

        return (
          <div
            key={a.id}
            className="p-3 rounded-lg transition-colors"
            style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-3">
              {/* Green pulse for recent items */}
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${config.color}18` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
                </div>
                {isRecent && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: '0 0 6px rgba(34,197,94,0.6)' }}>
                    <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-50" />
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-300">
                  <span className="font-medium">{config.label}</span>
                  {a.target_name && (
                    <span className="font-semibold text-white"> {a.target_name}</span>
                  )}
                </p>
                <p className="text-[10px] text-slate-500">{timeAgo}</p>
              </div>
              <Badge
                variant="outline"
                className="text-[9px] flex-shrink-0 border-0 uppercase tracking-wider font-semibold"
                style={{ background: `${config.color}15`, color: config.color }}
              >
                {config.badgeLabel}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}