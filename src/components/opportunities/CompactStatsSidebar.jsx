
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, Plus, Bell, FileText } from 'lucide-react';
import UserAvatar from '@/components/common/UserAvatar';

const topContributors = [
    { id: 1, name: 'Sarah Johnson', count: 12, avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
    { id: 2, name: 'Mike Chen', count: 8, avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705d' },
    { id: 3, name: 'Jennifer Garcia', count: 6, avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026706d' }
];

export default function CompactStatsSidebar({ 
    resultsCount, 
    newThisWeek, 
    onPostOpportunity, 
    onSetJobAlerts, 
    onResumeReview,
    filteredOpportunities, // New prop
    searchQuery,            // New prop
    typeFilter,             // New prop
    locationFilter          // New prop
}) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 shadow-lg text-white">
        <h3 className="font-bold text-lg mb-3">Don't see what you're looking for?</h3>
        <p className="text-sm text-white/90 mb-4">Let the Gator Network know what you need. Get personalized help and warm introductions.</p>
        <Button 
            className="w-full bg-white text-orange-600 font-bold hover:bg-orange-50"
            onClick={onPostOpportunity}
        >
            <Plus className="w-4 h-4 mr-2"/>
            Post a Request
        </Button>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4 text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-500" />
            Search Summary
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Showing Results</span>
            <span className="font-bold text-gray-800 text-base">{resultsCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">New This Week</span>
            <span className="font-bold text-green-600">+{newThisWeek}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4 text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-500" />
            Top Contributors
        </h3>
        <div className="space-y-3">
          {topContributors.map((contributor, index) => (
            <div key={contributor.id} className="flex items-center gap-3">
              <UserAvatar user={{ full_name: contributor.name, profile_image_url: contributor.avatarUrl }} className="w-8 h-8"/>
              <div>
                <div className="text-sm font-medium text-gray-900">{contributor.name}</div>
                <div className="text-xs text-gray-500">{contributor.count} opportunities</div>
              </div>
              <div className="ml-auto text-sm font-bold text-gray-400">#{index + 1}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4 text-base">Quick Actions</h3>
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={onSetJobAlerts}>
            <Bell className="w-4 h-4 text-blue-600" />
            Set Job Alerts
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={onResumeReview}>
            <FileText className="w-4 h-4 text-blue-600" />
            AI Resume Review
          </Button>
          {/* Removed Track Applications - now on Student Dashboard */}
        </div>
      </div>
    </div>
  );
}
