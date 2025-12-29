import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Eye, GraduationCap, MapPin, Building2, Handshake, Award, Briefcase, Crown, Lock } from 'lucide-react';
import { getDisplayName, getInitials } from '@/components/utils/nameUtils';
import { formatLabel } from '@/components/utils/format';
import FoundingGatorBadge from '@/components/common/FoundingGatorBadge';

export default function UserCard({ user, onMessage, onViewProfile, isLimitedMode = false, viewMode = 'grid' }) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const displayName = getDisplayName(user);
  const initials = getInitials(user);

  const isParent = user.persona === 'parent';
  const isGator = user.persona === 'student' || user.persona === 'gator' || user.persona === 'alumni';
  
  const getRoleBadgeColor = () => {
    switch (user.persona) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'gator': return 'bg-blue-100 text-blue-800';
      case 'alumni': return 'bg-blue-100 text-blue-800';
      case 'parent': return 'bg-orange-100 text-orange-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getRoleDisplay = () => {
    switch (user.persona) {
      case 'student': return 'Gator';
      case 'gator': return 'Gator';
      case 'alumni': return 'Gator';
      case 'parent': return 'Gator Parent';
      default: return 'Member';
    }
  };

  // Enhanced glow border styles
  const cardBorderClass = isParent 
    ? 'border-2 border-orange-400/70 shadow-[0_0_25px_rgba(250,70,22,0.25)]' 
    : 'border-2 border-blue-400/70 shadow-[0_0_25px_rgba(0,33,165,0.25)]';

  const isParentOrAlumni = user.persona === 'alumni' || user.persona === 'parent';
  const hasExpertise = user.expertise_areas && user.expertise_areas.length > 0;
  const hasWaysToHelp = user.ways_to_help && user.ways_to_help.length > 0;
  const canProvideReferrals = user.can_provide_referrals === true;

  // Map ways_to_help to color-coded chips
  const getHelpChipColor = (help) => {
    const helpLower = help.toLowerCase();
    if (helpLower.includes('introduce') || helpLower.includes('introduction')) {
      return 'bg-green-100 text-green-800 border-green-300';
    }
    if (helpLower.includes('career') || helpLower.includes('advice')) {
      return 'bg-blue-100 text-blue-800 border-blue-300';
    }
    if (helpLower.includes('lead') || helpLower.includes('referral')) {
      return 'bg-purple-100 text-purple-800 border-purple-300';
    }
    return 'bg-slate-100 text-slate-700 border-slate-300';
  };

  // List view rendering
  if (viewMode === 'list') {
    return (
      <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 bg-white ${cardBorderClass}`}>
        <div className="p-5 flex items-center gap-6">
          {/* Avatar */}
          <Avatar className="w-14 h-14 flex-shrink-0">
            <AvatarImage src={user.profile_image} alt={displayName} />
            <AvatarFallback className="bg-[#0021A5] text-white text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-slate-900">{displayName}</h3>
              <Badge className={`${getRoleBadgeColor()} flex items-center gap-1`}>
                {isParent && <Crown className="w-3 h-3 text-yellow-500" />}
                {getRoleDisplay()}
              </Badge>
              {user.is_founding_member && <FoundingGatorBadge size="sm" />}
            </div>
            <p className="text-sm text-slate-600 mt-1">
              {user.current_position || user.job_title}
              {(user.current_position || user.job_title) && (user.current_company || user.company) && ' at '}
              {user.current_company || user.company}
              {!user.current_position && !user.job_title && user.major && user.major}
            </p>
            {user.industry && (
              <p className="text-xs text-slate-500 mt-0.5">{user.industry}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0">
            {isLimitedMode ? (
              <Button disabled className="gap-2 bg-slate-300 text-slate-500 cursor-not-allowed">
                <Lock className="w-4 h-4" />
                Message
              </Button>
            ) : (
              <Button
                onClick={() => onMessage(user)}
                className="gap-2 bg-[#FA4616] hover:bg-orange-600 text-white font-semibold"
              >
                <MessageSquare className="w-4 h-4" />
                Message
              </Button>
            )}
            <Button
              onClick={() => onViewProfile(user.id)}
              variant="outline"
              className="text-slate-600"
            >
              Profile
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Grid view rendering (default)
  return (
    <Card className={`overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 bg-white ${cardBorderClass} group`}>
      <div className="p-6">
        {/* Header with Avatar and Name - Larger for better readability */}
        <div className="flex items-start gap-5 mb-5">
          <Avatar className="w-18 h-18 flex-shrink-0" style={{ width: '72px', height: '72px' }}>
            <AvatarImage src={user.profile_image} alt={displayName} />
            <AvatarFallback className="bg-[#0021A5] text-white text-xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-slate-900 truncate">
              {displayName}
            </h3>
            <div className="flex flex-wrap gap-1 mt-1">
              <Badge className={`${getRoleBadgeColor()} flex items-center gap-1.5`}>
                {isParent && (
                  <div className="relative">
                    <div className="absolute inset-0 blur-sm">
                      <Crown className="w-4 h-4 text-yellow-500" />
                    </div>
                    <Crown className="w-4 h-4 text-yellow-500 relative drop-shadow-[0_0_4px_rgba(234,179,8,0.8)]" />
                  </div>
                )}
                {getRoleDisplay()}
              </Badge>
              {user.is_founding_member && (
                <FoundingGatorBadge size="sm" />
              )}
              {user.is_boosted && user.boost_expires_at && new Date(user.boost_expires_at) > new Date() && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold flex items-center gap-1 animate-pulse">
                  ⭐ Boosted
                </Badge>
              )}
              {canProvideReferrals && (
                <Badge className="bg-green-100 text-green-800 text-xs">
                  Can Refer
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Bio/Headline */}
        {user.bio && (
          <p className="text-sm text-slate-600 line-clamp-2 mb-4">
            {user.bio}
          </p>
        )}

        {/* Description of Work - Parents/Alumni Only */}
        {isParentOrAlumni && user.description_of_work && (
          <div className="mb-4 p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              What they do:
            </p>
            <p className={`text-sm text-slate-700 ${!isDescriptionExpanded && user.description_of_work.length > 100 ? 'line-clamp-2' : ''}`}>
              {user.description_of_work}
            </p>
            {user.description_of_work.length > 100 && (
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="text-xs text-blue-600 hover:text-blue-800 mt-1 font-medium"
              >
                {isDescriptionExpanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )}

        {/* Skills & Quick Info Badges */}
        {(user.skills?.length > 0 || user.open_to_coffee_chats) && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {user.open_to_coffee_chats && (
              <Badge className="bg-green-100 text-green-800 text-xs border border-green-300">
                ☕ Open to coffee chats
              </Badge>
            )}
            {user.skills?.slice(0, 3).map((skill, idx) => (
              <Badge key={idx} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                {skill}
              </Badge>
            ))}
            {user.skills?.length > 3 && (
              <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600">
                +{user.skills.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Key Info */}
        <div className="space-y-2 mb-4">
          {/* Students: Major */}
          {user.major && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <GraduationCap className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="truncate">{user.major}</span>
            </div>
          )}

          {/* Parents/Alumni: Company & Title */}
          {(user.current_company || user.current_position) && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="truncate">
                {user.current_position && `${user.current_position}`}
                {user.current_position && user.current_company && ' at '}
                {user.current_company}
              </span>
            </div>
          )}
          
          {/* Legacy company/job_title fields for backwards compatibility */}
          {!user.current_company && !user.current_position && (user.company || user.job_title) && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="truncate">
                {user.job_title && `${user.job_title}`}
                {user.job_title && user.company && ' at '}
                {user.company}
              </span>
            </div>
          )}

          {/* Industry */}
          {user.industry && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="truncate">{user.industry}</span>
            </div>
          )}

          {/* Location */}
          {(user.location_city || user.location_state) && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="truncate">
                {user.location_city}
                {user.location_city && user.location_state && ', '}
                {user.location_state}
              </span>
            </div>
          )}
        </div>

        {/* Expertise Areas - Parents/Alumni Only */}
        {isParentOrAlumni && hasExpertise && (
          <div className="mb-4 pb-4 border-b border-slate-100">
            <div className="flex items-start gap-2 mb-2">
              <Award className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
              <span className="text-xs font-semibold text-purple-800">Expertise:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 ml-6">
              {user.expertise_areas.slice(0, 2).map((expertise, idx) => (
                <Badge key={idx} variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                  {formatLabel(expertise)}
                </Badge>
              ))}
              {user.expertise_areas.length > 2 && (
                <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200">
                  +{user.expertise_areas.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Primary Goal (from onboarding) - Parents Only */}
        {isParent && user.primary_goal && user.primary_goal.length > 0 && (
          <div className="mb-4">
            <div className="flex items-start gap-2 mb-2">
              <Handshake className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-xs font-semibold text-green-800">Can help with:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 ml-6">
              {user.primary_goal.slice(0, 3).map((goal, idx) => (
                <Badge key={idx} variant="outline" className="text-xs border bg-green-50 text-green-700 border-green-300">
                  {goal === 'career_advice' && '💼 Career advice & mock interviews'}
                  {goal === 'job_leads' && '🎯 Job leads at my network'}
                  {goal === 'resume_reviews' && '📄 Resume & LinkedIn reviews'}
                  {goal === 'friendly_ear' && '💬 Friendly Gator ear'}
                  {goal === 'all_in' && '🌟 All of the above'}
                </Badge>
              ))}
              {user.primary_goal.length > 3 && (
                <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200">
                  +{user.primary_goal.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {/* Ways to Help - Color Coded - Alumni Only (legacy field) */}
        {!isParent && isParentOrAlumni && hasWaysToHelp && (
          <div className="mb-4">
            <div className="flex items-start gap-2 mb-2">
              <Handshake className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-xs font-semibold text-green-800">Can help with:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 ml-6">
              {user.ways_to_help.slice(0, 3).map((help, idx) => (
                <Badge key={idx} variant="outline" className={`text-xs border ${getHelpChipColor(help)}`}>
                  {formatLabel(help)}
                </Badge>
              ))}
              {user.ways_to_help.length > 3 && (
                <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200">
                  +{user.ways_to_help.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons - Message is primary (orange), Profile is secondary */}
        <div className="flex gap-3 mt-2">
          {isLimitedMode ? (
            <div className="relative group flex-1">
              <Button
                disabled
                className="w-full h-11 gap-2 bg-slate-300 text-slate-500 cursor-not-allowed"
              >
                <Lock className="w-4 h-4" />
                Message
              </Button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                VIP Only — Invite your parent to upgrade
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => onMessage(user)}
              className="flex-1 h-11 gap-2 bg-[#FA4616] hover:bg-orange-600 text-white font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              Message
            </Button>
          )}
          <Button
            onClick={() => onViewProfile(user.id)}
            variant="outline"
            className="h-11 gap-2 text-slate-600 hover:text-slate-800 border-slate-300"
          >
            <Eye className="w-4 h-4" />
            Profile
          </Button>
        </div>
      </div>
    </Card>
  );
}