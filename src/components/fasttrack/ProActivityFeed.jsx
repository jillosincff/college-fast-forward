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

export default function ProActivityFeed({ userEmail, darkMode }) {
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
          <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : '#f1f5f9' }} />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div
        className="p-6 text-center rounded-xl"
        style={darkMode
          ? { border: '1px dashed rgba(255,255,255,0.08)' }
          : { border: '2px dashed #e2e8f0' }
        }
      >
        <Clock className={`w-7 h-7 mx-auto mb-2 ${darkMode ? 'text-white/15' : 'text-slate-300'}`} />
        <p className={`text-sm ${darkMode ? 'text-white/25' : 'text-slate-500'}`}>No activity yet. Start chatting with your AI agent!</p>
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
            className="p-3 rounded-lg transition-colors"
            style={darkMode
              ? { background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }
              : { border: '1px solid #e2e8f0' }
            }
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={darkMode ? { background: 'rgba(255,255,255,0.05)' } : { background: '#eff6ff' }}
              >
                <Icon className={`w-3.5 h-3.5 ${darkMode ? 'text-white/35' : 'text-blue-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-slate-700'}`}>
                  <span className="font-medium">{config.label}</span>
                  {a.target_name && (
                    <span className={`font-semibold ${darkMode ? 'text-white/70' : 'text-slate-900'}`}> {a.target_name}</span>
                  )}
                </p>
                <p className={`text-[10px] ${darkMode ? 'text-white/18' : 'text-slate-400'}`}>{timeAgo}</p>
              </div>
              <Badge
                variant="outline"
                className={`text-[9px] flex-shrink-0 border-0 uppercase tracking-wider font-medium ${
                  darkMode ? 'bg-white/5 text-white/30' : 'bg-blue-50 text-blue-700'
                }`}
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