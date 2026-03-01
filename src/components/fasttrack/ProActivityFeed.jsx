import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, MessageSquare, Map, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import moment from 'moment';

const ACTION_CONFIG = {
  company_search: { icon: Building2, label: 'Researched', color: 'bg-blue-100 text-blue-600', badgeColor: 'bg-blue-50 text-blue-700' },
  alumni_view: { icon: Users, label: 'Discovered alumni at', color: 'bg-purple-100 text-purple-600', badgeColor: 'bg-purple-50 text-purple-700' },
  message_draft: { icon: MessageSquare, label: 'Drafted message to', color: 'bg-orange-100 text-orange-600', badgeColor: 'bg-orange-50 text-orange-700' },
  roadmap_created: { icon: Map, label: 'Created roadmap', color: 'bg-green-100 text-green-600', badgeColor: 'bg-green-50 text-green-700' },
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
          <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="p-6 text-center border-2 border-dashed border-slate-200">
        <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-500">No activity yet. Start chatting with your AI agent!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((a) => {
        const config = ACTION_CONFIG[a.action_type] || ACTION_CONFIG.company_search;
        const Icon = config.icon;
        const timeAgo = moment(a.timestamp || a.created_date).fromNow();

        return (
          <Card key={a.id} className="p-3 border border-slate-100 hover:border-slate-200 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700">
                  <span className="font-medium">{config.label}</span>
                  {a.target_name && <span className="font-semibold text-slate-900"> {a.target_name}</span>}
                </p>
                <p className="text-xs text-slate-400">{timeAgo}</p>
              </div>
              <Badge variant="outline" className={`text-[10px] flex-shrink-0 ${config.badgeColor} border-0`}>
                {a.action_type.replace('_', ' ')}
              </Badge>
            </div>
          </Card>
        );
      })}
    </div>
  );
}