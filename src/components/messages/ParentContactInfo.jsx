import React from 'react';
import { Mail, Linkedin, Lock } from 'lucide-react';
import { useAccessControl } from '@/components/access/useAccessControl';

/**
 * Component that shows/hides parent contact info based on student's premium status
 * Premium students see full email + LinkedIn
 * Free students see blurred/hidden info with upgrade prompt
 */
export default function ParentContactInfo({ parentUser, currentUser, className = '' }) {
  const accessInfo = useAccessControl(currentUser);
  
  // If current user is not a student (gator), show full info
  if (currentUser?.persona !== 'gator') {
    return (
      <div className={`space-y-2 ${className}`}>
        {parentUser?.email && (
          <a 
            href={`mailto:${parentUser.email}`}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
          >
            <Mail className="w-4 h-4" />
            {parentUser.email}
          </a>
        )}
        {parentUser?.linkedin_url && (
          <a 
            href={parentUser.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
          >
            <Linkedin className="w-4 h-4" />
            View LinkedIn Profile
          </a>
        )}
      </div>
    );
  }
  
  // Premium students can see full contact info
  if (accessInfo.canSeeFullContactInfo) {
    return (
      <div className={`space-y-2 ${className}`}>
        {parentUser?.full_name && (
          <p className="font-medium text-slate-900">{parentUser.full_name}</p>
        )}
        {parentUser?.email && (
          <a 
            href={`mailto:${parentUser.email}`}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
          >
            <Mail className="w-4 h-4" />
            {parentUser.email}
          </a>
        )}
        {parentUser?.linkedin_url && (
          <a 
            href={parentUser.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
          >
            <Linkedin className="w-4 h-4" />
            View LinkedIn Profile
          </a>
        )}
      </div>
    );
  }
  
  // Free tier students see blurred/locked contact info
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative">
        <div className="flex items-center gap-2 text-slate-400 text-sm blur-sm select-none">
          <Mail className="w-4 h-4" />
          parent@example.com
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-1 text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-full">
            <Lock className="w-3 h-3" />
            Upgrade to see
          </div>
        </div>
      </div>
      
      {parentUser?.linkedin_url && (
        <div className="relative">
          <div className="flex items-center gap-2 text-slate-400 text-sm blur-sm select-none">
            <Linkedin className="w-4 h-4" />
            LinkedIn Profile
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-1 text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-full">
              <Lock className="w-3 h-3" />
              Premium only
            </div>
          </div>
        </div>
      )}
      
      <p className="text-xs text-slate-500 mt-2">
        Upgrade to Full Access ($9/mo) to see email & LinkedIn
      </p>
    </div>
  );
}