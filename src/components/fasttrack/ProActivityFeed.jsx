import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, MessageSquare, Map, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import moment from 'moment';

const ACTION_CONFIG = {
  company_search: { icon: Building2, label: 'Researched', badgeLabel: 'target intel' },
  alumni_view: { icon: Users, label: 'Discovered alumni at', badgeLabel: 'leverage found' },
  message_draft: { icon: MessageSquare, label: 'Drafted message to', badgeLabel: 'outreach' },
  roadmap_created: { icon: Map, label: 'Created roadmap', badgeLabel: 'warm path' },
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
          <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="p-6 text-center rounded-xl border-2 border-dashed border-slate-200">
        <Clock className="w-7 h-7 mx-auto mb-2 text-slate-300" />
        <p className="text-sm text-slate-400">No activity yet. Start chatting with your AI agent!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((a) => {
        const config = ACTION_CONFIG[a.action_type] || ACTION_CONFIG.company_search;
        const Icon = config.icon;
        const timeAgo = moment(a.timestamp || a.created_date).fromNow();

        return (
          <div
            key={a.id}
            className="p-3 rounded-xl bg-white transition-colors hover:border-slate-300"
            style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-600">
                  <span className="font-medium">{config.label}</span>
                  {a.target_name && (
                    <span className="font-semibold text-slate-900"> {a.target_name}</span>
                  )}
                </p>
                <p className="text-[10px] text-slate-400">{timeAgo}</p>
              </div>
              <Badge
                variant="outline"
                className="text-[9px] flex-shrink-0 border-0 uppercase tracking-wider font-medium bg-slate-50 text-slate-500"
              >
                {config.badgeLabel || a.action_type.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}