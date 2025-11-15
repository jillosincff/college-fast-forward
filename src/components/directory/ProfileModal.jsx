import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, Mail, Briefcase, GraduationCap, MapPin, Linkedin, MessageSquare, X, Handshake, Award, Building2, TrendingUp } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getDisplayName, getInitials } from '@/components/utils/nameUtils';
import { formatLabel } from '@/components/utils/format';

export default function ProfileModal({ isOpen, onClose, userId, onMessage }) {
  const [profileUser, setProfileUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      const fetchProfile = async () => {
        setIsLoading(true);
        setError(null);
        setProfileUser(null);
        try {
          // Use the backend function to get public user info
          const response = await base44.functions.invoke('getPublicUserInfo', { userId });
          
          if (response?.data?.data) {
            setProfileUser(response.data.data);
          } else {
            throw new Error('Could not load profile data');
          }
        } catch (err) {
          console.error("Failed to fetch profile for modal:", err);
          setError("Could not load profile. The user may not exist or there was a network issue.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchProfile();
    }
  }, [isOpen, userId]);

  const handleMessageClick = () => {
    if (onMessage && profileUser) {
      onMessage(profileUser);
      onClose(); // Close profile to open message modal
    }
  };
  
  const getDefaultHeadline = (user) => {
    if (!user) return '';
    if (user.bio) return user.bio;
    if (user.job_title && user.company) return `${user.job_title} at ${user.company}`;
    if (user.major) return `${user.major} Major`;
    switch (user.persona) {
      case 'student': return 'Student';
      case 'gator': return 'UF Gator';
      case 'alumni': return 'UF Alumni';
      case 'parent': return 'UF Parent';
      default: return 'Gator Supporter';
    }
  };

  const displayName = profileUser ? getDisplayName(profileUser) : 'Loading...';
  const initials = profileUser ? getInitials(profileUser) : 'GU';

  const isParentOrAlumni = profileUser && (profileUser.persona === 'alumni' || profileUser.persona === 'parent');
  const hasExpertise = profileUser?.expertise_areas && profileUser.expertise_areas.length > 0;
  const hasMentorshipTopics = profileUser?.mentorship_topics && profileUser.mentorship_topics.length > 0;
  const hasWaysToHelp = profileUser?.ways_to_help && profileUser.ways_to_help.length > 0;
  const hasCompanies = profileUser?.companies_worked_at && profileUser.companies_worked_at.length > 0;
  const canProvideReferrals = profileUser?.can_provide_referrals === true;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full">
            <X className="h-4 w-4" />
        </Button>
        
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="text-slate-600">Loading Profile...</p>
          </div>
        )}
        
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center h-96 gap-4 text-center p-8">
            <AlertTriangle className="w-12 h-12 text-red-500" />
            <h2 className="text-xl font-bold text-slate-800">Error Loading Profile</h2>
            <p className="text-slate-600 mt-2">{error}</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        )}

        {profileUser && !isLoading && (
          <>
            {/* Header with gradient */}
            <div className="relative -mx-6 -mt-6 mb-6">
              <div className="h-24 bg-gradient-to-r from-[#0021A5] to-[#FA4616]" />
              <div className="absolute -bottom-12 left-6">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                  <AvatarImage src={profileUser?.profile_image} alt={displayName} />
                  <AvatarFallback className="bg-[#0021A5] text-white text-2xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            <div className="mt-14 px-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900">{displayName}</h2>
                  <DialogDescription className="text-slate-600 mt-1">{getDefaultHeadline(profileUser)}</DialogDescription>
                  {canProvideReferrals && (
                    <Badge className="mt-2 bg-green-100 text-green-800 border-green-200">
                      ✨ Can Provide Job Referrals
                    </Badge>
                  )}
                </div>
                <div>
                   <Button onClick={handleMessageClick} className="bg-blue-600 hover:bg-blue-700">
                    <MessageSquare className="w-4 h-4 mr-2" /> Message
                   </Button>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-6 space-y-6">
              {/* Expertise Profile Section - Prominent for Parents/Alumni */}
              {isParentOrAlumni && (hasExpertise || hasMentorshipTopics || hasWaysToHelp) && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border-2 border-purple-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="w-6 h-6 text-purple-600" />
                    <h3 className="text-xl font-bold text-purple-900">Expertise Profile</h3>
                  </div>

                  {/* Expertise Areas */}
                  {hasExpertise && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-purple-800 mb-2">Areas of Expertise</h4>
                      <div className="flex flex-wrap gap-2">
                        {profileUser.expertise_areas.map((expertise, idx) => (
                          <Badge key={idx} className="bg-purple-100 text-purple-800 border-purple-300">
                            {formatLabel(expertise)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mentorship Topics */}
                  {hasMentorshipTopics && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-blue-800 mb-2">Can Mentor On</h4>
                      <div className="flex flex-wrap gap-2">
                        {profileUser.mentorship_topics.map((topic, idx) => (
                          <Badge key={idx} className="bg-blue-100 text-blue-800 border-blue-300">
                            {formatLabel(topic)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ways to Help */}
                  {hasWaysToHelp && (
                    <div>
                      <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                        <Handshake className="w-4 h-4" />
                        Ways I Can Help
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {profileUser.ways_to_help.map((help, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-green-800 bg-white/50 px-3 py-2 rounded-lg">
                            <div className="w-1.5 h-1.5 bg-green-600 rounded-full flex-shrink-0" />
                            <span>{formatLabel(help)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Professional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2 text-slate-800">Professional Details</h3>
                  
                  {profileUser.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-5 h-5 text-slate-500 flex-shrink-0" />
                      <span className="truncate">{profileUser.email}</span>
                    </div>
                  )}

                  {(profileUser.job_title || profileUser.company) && (
                    <div className="flex items-center gap-3 text-sm">
                      <Briefcase className="w-5 h-5 text-slate-500 flex-shrink-0" />
                      <span>
                        {profileUser.job_title}
                        {profileUser.job_title && profileUser.company && ' at '}
                        {profileUser.company}
                      </span>
                    </div>
                  )}

                  {profileUser.industry && (
                    <div className="flex items-center gap-3 text-sm">
                      <TrendingUp className="w-5 h-5 text-slate-500 flex-shrink-0" />
                      <span>{profileUser.industry}</span>
                    </div>
                  )}

                  {profileUser.years_of_experience && (
                    <div className="flex items-center gap-3 text-sm">
                      <Award className="w-5 h-5 text-slate-500 flex-shrink-0" />
                      <span>{profileUser.years_of_experience} years of experience</span>
                    </div>
                  )}

                  {(profileUser.graduation_year || profileUser.major) && (
                    <div className="flex items-center gap-3 text-sm">
                      <GraduationCap className="w-5 h-5 text-slate-500 flex-shrink-0" />
                      <span>
                        {profileUser.major}
                        {profileUser.major && profileUser.graduation_year && ' • '}
                        {profileUser.graduation_year && `Class of ${profileUser.graduation_year}`}
                      </span>
                    </div>
                  )}

                  {(profileUser.location_city || profileUser.location_state) && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-5 h-5 text-slate-500 flex-shrink-0" />
                      <span>
                        {profileUser.location_city}
                        {profileUser.location_city && profileUser.location_state && ', '}
                        {profileUser.location_state}
                      </span>
                    </div>
                  )}

                  {profileUser.linkedin_url && (
                    <div className="flex items-center gap-3 text-sm">
                      <Linkedin className="w-5 h-5 text-slate-500 flex-shrink-0" />
                      <a 
                        href={profileUser.linkedin_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline truncate"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}

                  {/* Companies Worked At */}
                  {hasCompanies && (
                    <div className="pt-2 border-t">
                      <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Notable Companies
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {profileUser.companies_worked_at.map((company, idx) => (
                          <Badge key={idx} variant="outline" className="bg-slate-50">
                            {company}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Bio */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2 text-slate-800">About</h3>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {profileUser.bio || 'No bio provided.'}
                  </p>
                </div>
              </div>

              {/* CTA to Message */}
              <div className="pt-6 border-t">
                <Button 
                  onClick={handleMessageClick} 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6"
                  size="lg"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Send {displayName.split(' ')[0]} a Message
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}