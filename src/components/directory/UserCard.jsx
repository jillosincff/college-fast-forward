import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Eye, GraduationCap, MapPin, Building2, Handshake, Award, Briefcase, Crown } from 'lucide-react';
import { getDisplayName, getInitials } from '@/components/utils/nameUtils';
import { formatLabel } from '@/components/utils/format';

export default function UserCard({ user, onMessage, onViewProfile }) {
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

  return (
    <Card className={`overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 bg-white ${cardBorderClass} group`}>
      <div className="p-6">
        {/* Header with Avatar and Name */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="w-16 h-16 flex-shrink-0">
            <AvatarImage src={user.profile_image} alt={displayName} />
            <AvatarFallback className="bg-[#0021A5] text-white text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 truncate">
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
          <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-700 mb-1">What they do:</p>
            <p className={`text-sm text-slate-600 ${!isDescriptionExpanded && user.description_of_work.length > 100 ? 'line-clamp-2' : ''}`}>
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
          {(user.company || user.job_title) && (
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

        {/* Ways to Help - Color Coded - Parents/Alumni Only */}
        {isParentOrAlumni && hasWaysToHelp && (
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

        {/* Action Buttons with Pulse Animation on Message Button */}
        <div className="flex gap-2">
          <Button
            onClick={() => onViewProfile(user.id)}
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
          >
            <Eye className="w-4 h-4" />
            View Profile
          </Button>
          <Button
            onClick={() => onMessage(user)}
            size="sm"
            className="flex-1 gap-2 bg-[#0021A5] hover:bg-[#001580] text-white relative group-hover:animate-pulse"
          >
            <MessageSquare className="w-4 h-4" />
            Message
          </Button>
        </div>
      </div>
    </Card>
  );
}