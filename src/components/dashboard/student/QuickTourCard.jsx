import React, { useState } from 'react';
import { X, FileText, Briefcase, Star, MessageSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const TOUR_ITEMS = [
  { icon: FileText, label: 'My Requests', description: 'View, edit, or delete your help requests' },
  { icon: Briefcase, label: 'My Applications', description: 'Track jobs & internships you\'ve applied to' },
  { icon: Star, label: 'My Favorites', description: 'People & opportunities you\'ve saved' },
  { icon: MessageSquare, label: 'My Messages', description: 'Conversations with parents & alumni' },
];

export default function QuickTourCard({ user, onDismiss }) {
  const [dismissing, setDismissing] = useState(false);

  const handleDismiss = async () => {
    setDismissing(true);
    try {
      await base44.auth.updateMe({ quick_tour_dismissed: true });
      if (onDismiss) onDismiss();
    } catch (error) {
      console.error('Failed to dismiss tour:', error);
      if (onDismiss) onDismiss();
    }
  };

  if (user?.quick_tour_dismissed) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 relative shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <h3 className="font-semibold text-slate-800 text-sm">Quick Tour: Here's where to find everything</h3>
        </div>
        <button
          onClick={handleDismiss}
          disabled={dismissing}
          className="text-slate-400 hover:text-slate-600 hover:bg-blue-100 rounded-full p-1 transition-colors"
          aria-label="Dismiss tour"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tour Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        {TOUR_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-sm">
            <item.icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="font-medium text-slate-700">{item.label}</span>
            <span className="text-slate-500 hidden md:inline">— {item.description}</span>
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <p className="text-xs text-slate-500">
        Find these anytime in your menu → <span className="font-medium">(click your avatar in top right)</span>
      </p>
    </div>
  );
}