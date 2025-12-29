import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

/**
 * Get initials from user - first name initial + last name initial
 * e.g., "Lindsey M. Osinoff" -> "LO", not "OM"
 */
function getUserInitials(user) {
  if (!user) return 'GU';
  
  // Priority 1: Use first_name and last_name fields directly
  if (user.first_name && user.last_name) {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  }
  
  // Priority 2: Try email first if it has firstname.lastname format (more reliable)
  if (user.email) {
    const emailName = user.email.split('@')[0];
    if (emailName.includes('.')) {
      const parts = emailName.split('.').filter(p => p && p.length > 0);
      if (parts.length >= 2) {
        // Use first and last parts of email (e.g., lindsey.osinoff -> LO)
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
    }
  }
  
  // Priority 3: Parse full_name - take FIRST word and LAST word (skip middle names/initials)
  const fullName = user.full_name || user.name || '';
  if (fullName && typeof fullName === 'string') {
    const nameParts = fullName.trim().split(/\s+/).filter(part => part && part.length > 0);
    
    if (nameParts.length >= 2) {
      // Always use first word and last word (skip middle names/initials)
      const firstInitial = nameParts[0][0];
      const lastInitial = nameParts[nameParts.length - 1][0];
      return `${firstInitial}${lastInitial}`.toUpperCase();
    }
    
    if (nameParts.length === 1 && nameParts[0].length >= 2) {
      return nameParts[0].slice(0, 2).toUpperCase();
    }
  }
  
  // Fallback: use email username
  if (user.email) {
    const emailName = user.email.split('@')[0];
    return emailName.slice(0, 2).toUpperCase();
  }
  
  return 'GU';
}

export default function UserAvatar({ 
  user, 
  className = "w-10 h-10", 
  showFallback = true,
}) {
  if (!user && !showFallback) {
    return null;
  }

  const initials = getUserInitials(user);
  
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