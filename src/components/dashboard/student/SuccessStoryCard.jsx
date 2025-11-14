import UserAvatar from '@/components/common/UserAvatar';
import { Clock } from 'lucide-react';

export default function SuccessStoryCard({ story }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-center space-x-3 mb-3">
        <UserAvatar user={{ full_name: story.name, profile_image_url: story.avatar }} size="sm" />
        <div>
          <p className="font-medium text-gray-900 text-sm">{story.name}</p>
          <p className="text-xs text-gray-600">{story.role}</p>
        </div>
      </div>
      <p className="text-sm text-gray-700 italic mb-2">
        "{story.text}"
      </p>
      <div className="flex items-center text-xs text-gray-500">
        <Clock className="w-3 h-3 mr-1" />
        {story.time}
      </div>
    </div>
  );
}