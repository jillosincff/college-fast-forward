import React from 'react';
import { Building2, Users, Map, MessageSquare } from 'lucide-react';

const actions = [
  { id: 'company', icon: Building2, label: 'Search Company', desc: 'Get hiring intelligence', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 'alumni', icon: Users, label: 'Find Alumni', desc: 'Discover connections', color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { id: 'roadmap', icon: Map, label: 'My Roadmap', desc: 'Week-by-week plan', color: 'bg-green-50 text-green-600 border-green-200' },
  { id: 'outreach', icon: MessageSquare, label: 'Draft Message', desc: 'AI-written outreach', color: 'bg-orange-50 text-orange-600 border-orange-200' },
];

export default function FastTrackQuickActions({ onAction }) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            onClick={() => onAction?.(action.id)}
            className={`flex items-start gap-3 p-4 rounded-xl border ${action.color} text-left transition-all hover:shadow-md active:scale-[0.98]`}
            style={{ minHeight: 'auto', minWidth: 'auto', width: 'auto' }}
          >
            <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">{action.label}</p>
              <p className="text-xs opacity-70">{action.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}