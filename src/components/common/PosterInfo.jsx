import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import { getDisplayName, getInitials } from '@/components/utils/nameUtils';

export default function PosterInfo({ user, postDate, postedByParent = false, showRole = false }) {
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
            GU
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-700">Gator User</span>
          {postDate && (
            <span className="text-xs text-slate-500">
              {formatDistanceToNow(new Date(postDate), { addSuffix: true })}
            </span>
          )}
        </div>
      </div>
    );
  }

  const displayName = getDisplayName(user);
  const initials = getInitials(user);

  return (
    <div className="flex items-center gap-2">
      <Avatar className="w-8 h-8">
        <AvatarImage src={user.profile_image_url} alt={displayName} />
        <AvatarFallback className="bg-[#0021A5] text-white text-xs font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">
            {displayName}
          </span>
          {postedByParent && (
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1">
              <Heart className="w-3 h-3" />
              Parent
            </Badge>
          )}
          {showRole && user.persona && (
            <Badge variant="outline" className="text-xs">
              {user.persona.charAt(0).toUpperCase() + user.persona.slice(1)}
            </Badge>
          )}
        </div>
        {postDate && (
          <span className="text-xs text-slate-500">
            {formatDistanceToNow(new Date(postDate), { addSuffix: true })}
          </span>
        )}
      </div>
    </div>
  );
}