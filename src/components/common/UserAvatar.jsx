import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getDisplayName, getInitials } from '@/components/utils/nameUtils';

export default function UserAvatar({ 
  user, 
  className = "w-10 h-10", 
  showFallback = true,
  fallbackColor = "bg-[#0021A5] text-white"
}) {
  if (!user && !showFallback) {
    return null;
  }

  const displayName = getDisplayName(user);
  const initials = getInitials(user);

  return (
    <Avatar className={className}>
      {user?.profile_image_url && (
        <AvatarImage src={user.profile_image_url} alt={displayName} />
      )}
      <AvatarFallback className={`${fallbackColor} font-semibold text-sm`}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}