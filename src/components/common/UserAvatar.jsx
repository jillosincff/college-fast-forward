import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/components/utils/nameUtils';

export default function UserAvatar({ 
  user, 
  className = "w-10 h-10", 
  showFallback = true,
}) {
  if (!user && !showFallback) {
    return null;
  }

  const initials = getInitials(user);
  
  // Determine background color based on persona
  const isParent = user?.persona === 'parent' || user?.roles?.includes('parent');
  const bgColor = isParent ? 'bg-[#FA4616]' : 'bg-[#0021A5]';

  return (
    <Avatar className={className}>
      <AvatarFallback className={`${bgColor} text-white font-bold`}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}