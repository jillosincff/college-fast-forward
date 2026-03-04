import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, MessageSquare, Map, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import moment from 'moment';
import titleCase from '@/components/utils/titleCase';

const ACTION_CONFIG = {
  company_search: { icon: Building2, label: 'Researched', badgeLabel: 'target intel', color: '#3B82F6', bg: '#EFF6FF' },
  alumni_view: { icon: Users, label: 'Found alumni at', badgeLabel: 'insider found', color: '#EA580C', bg: '#FFF7ED' },
  message_draft: { icon: MessageSquare, label: 'Drafted outreach for', badgeLabel: 'outreach', color: '#16A34A', bg: '#F0FDF4' },
  roadmap_created: { icon: Map, label: 'Created career roadmap', badgeLabel: 'warm path', color: '#7C3AED', bg: '#F5F3FF' },
};

function cleanTargetName(actionType, rawName) {
  if (!rawName) return '';
  const rawIntents = ['company_search', 'alumni_view', 'message_draft', 'roadmap_created', 'opportunity_discovery'];
  if (rawIntents.includes(rawName.toLowerCase())) {
    if (rawName.toLowerCase() === 'opportunity_discovery') return 'your target companies';
    return '';
  }
  if (rawName.length > 40) {
    const atMatch = rawName.match(/at\s+([A-Z][a-zA-Z\s&]+)/);
    if (atMatch) return titleCase(atMatch[1].trim());
    const words = rawName.split(/\s+/).slice(0, 3).join(' ');
    return titleCase(words);
  }
  return titleCase(rawName);
}

function deduplicateActivities(logs) {
  const seen = new Map();
  return logs.filter(a => {
    const key = `${a.action_type}_${(a.target_name || '').toLowerCase()}`;
    const time = new Date(a.timestamp || a.created_date).getTime();
    if (seen.has(key)) {
      const prevTime = seen.get(key);
      if (Math.abs(time - prevTime) < 30 * 60 * 1000) return false;
    }
    seen.set(key, time);
    return true;
  });
}

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
          20
        );
        setActivities(deduplicateActivities(logs || []).slice(0, 10));
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
          <div key={i} className="h-14 rounded-xl animate-pulse bg-slate-100" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="p-6 text-center rounded-xl bg-white border border-slate-200">
        <Clock className="w-7 h-7 mx-auto mb-2 text-slate-300" />
        <p className="text-sm text-slate-500 font-medium">No activity recorded yet.</p>
        <p className="text-[11px] text-slate-400 mt-1">Use the chat to research companies or find alumni — your actions will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((a) => {
        const config = ACTION_CONFIG[a.action_type] || ACTION_CONFIG.company_search;
        const Icon = config.icon;
        const timeAgo = moment(a.timestamp || a.created_date).fromNow();
        const isRecent = moment().diff(moment(a.timestamp || a.created_date), 'hours') < 6;

        return (
          <div
            key={a.id}
            className="p-3 rounded-xl transition-colors bg-white border border-slate-200 hover:border-slate-300"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: config.bg }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
                </div>
                {isRecent && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500">
                    <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-50" />
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700">
                  <span className="font-medium">{config.label}</span>
                  {(() => {
                    const cleaned = cleanTargetName(a.action_type, a.target_name);
                    return cleaned ? <span className="font-semibold text-slate-900"> {cleaned}</span> : null;
                  })()}
                </p>
                <p className="text-[10px] text-slate-400">{timeAgo}</p>
              </div>
              <Badge
                variant="outline"
                className="text-[9px] flex-shrink-0 border-0 uppercase tracking-wider font-semibold"
                style={{ background: config.bg, color: config.color }}
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