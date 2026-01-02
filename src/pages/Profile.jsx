import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { User } from '@/entities/User';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Briefcase, GraduationCap, MapPin, Linkedin, Loader2, AlertTriangle, Calendar, Users, FileText, MessageSquare } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import { useParams } from '@/components/utils/navigation';
import { getDisplayName, getInitials } from '@/components/utils/nameUtils';
import NotificationSettings from '@/components/notifications/NotificationSettings';
import { StudentContextBadges, TIMELINE_LABELS } from '@/components/common/StudentInfoBadges';
import { Badge } from '@/components/ui/badge';

// Convert grad year to class year
function getClassYear(gradYear) {
  if (!gradYear) return null;
  const year = typeof gradYear === 'string' ? parseInt(gradYear) : gradYear;
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const academicYear = currentMonth >= 7 ? currentYear + 1 : currentYear;
  const yearsUntilGrad = year - academicYear;
  
  if (yearsUntilGrad <= 0) return 'Senior';
  if (yearsUntilGrad === 1) return 'Junior';
  if (yearsUntilGrad === 2) return 'Sophomore';
  if (yearsUntilGrad === 3) return 'Freshman';
  return `Class of ${year}`;
}

export default function Profile() {
  const { user: currentUser, isLoading: authIsLoading } = useAuth();
  const { id } = useParams();

  const [profileUser, setProfileUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      
      const profileId = id || currentUser?.id;

      if (!profileId) {
        if (!authIsLoading) {
            setIsLoading(false);
            setError("No profile to display. Please log in.");
        }
        return;
      }
      
      try {
        const userToDisplay = await User.get(profileId);
        setProfileUser(userToDisplay);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Could not load profile. The user may not exist.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [id, currentUser, authIsLoading]);

  if (authIsLoading || isLoading) {
    return (
        <div className="flex items-center justify-center h-screen bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-slate-600">Loading Profile...</p>
            </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex items-center justify-center h-screen bg-slate-50">
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-800">Error</h2>
                <p className="text-slate-600 mt-2">{error}</p>
                <Button onClick={() => navigate('Dashboard')} className="mt-6">Go to Dashboard</Button>
            </div>
        </div>
    );
  }

  if (!profileUser) {
    return (
        <div className="flex items-center justify-center h-screen bg-slate-50">
             <div className="text-center">
                <p className="text-slate-600">Please log in to see your profile.</p>
                <Button onClick={() => User.login()} className="mt-4">Login</Button>
            </div>
        </div>
    );
  }

  const isMyProfile = currentUser && profileUser && currentUser.id === profileUser.id;
  const displayName = profileUser ? getDisplayName(profileUser) : 'Unknown User';
  const initials = profileUser ? getInitials(profileUser) : 'GU';

  // Get appropriate default headline based on persona
  const getDefaultHeadline = (user) => {
    if (user.headline) return user.headline;
    
    switch (user.persona) {
      case 'student':
        return 'Student';
      case 'alumni':
        return 'UF Alumni';
      case 'parent':
        return 'UF Parent';
      default:
        return 'Gator Enthusiast';
    }
  };

  // Get user's headline/position - returns empty string if no meaningful data
  const getUserHeadline = (profileUser) => {
    if (!profileUser) return '';
    
    // Check if user has position or company
    const hasPosition = profileUser.current_position && profileUser.current_position.trim();
    const hasCompany = profileUser.current_company && profileUser.current_company.trim();
    
    // If has both, join with 'at'
    if (hasPosition && hasCompany) {
      return `${profileUser.current_position} at ${profileUser.current_company}`;
    }
    
    // If only has position, return it
    if (hasPosition) {
      return profileUser.current_position;
    }
    
    // If only has company, return it
    if (hasCompany) {
      return profileUser.current_company;
    }
    
    // If neither, return default based on persona
    return getDefaultHeadline(profileUser);
  };

  const headline = getUserHeadline(profileUser);
  const isStudent = profileUser.persona === 'student' || profileUser.persona === 'gator';
  const classYear = getClassYear(profileUser.graduation_year);

  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="overflow-hidden shadow-lg">
          <div className="bg-gradient-to-br from-blue-700 to-orange-500 h-32" />
          <CardHeader className="flex flex-col sm:flex-row items-center gap-6 -mt-16 p-6 bg-white border-b">
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
              <AvatarImage src={profileUser.profile_image_url} alt={displayName} />
              <AvatarFallback className="text-3xl font-bold bg-[#0021A5] text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-slate-900">{displayName}</h1>
              {/* Enhanced student details header */}
              {isStudent && (
                <div className="mt-2">
                  <p className="text-base font-semibold text-slate-700">
                    {[classYear, profileUser.major].filter(Boolean).join(' · ')}
                    {profileUser.minor && <span className="text-slate-500 font-normal"> · Minor: {profileUser.minor}</span>}
                  </p>
                  {profileUser.pre_professional_track && (
                    <p className="text-sm font-semibold text-blue-600 mt-0.5">{profileUser.pre_professional_track}</p>
                  )}
                </div>
              )}
              {!isStudent && headline && <p className="text-slate-600 mt-1">{headline}</p>}
            </div>
            {isMyProfile && (
              <Button onClick={() => navigate('ProfileEdit')}>Edit Profile</Button>
            )}
          </CardHeader>
          
          {/* Student context badges - location, timeline, help types */}
          {isStudent && (profileUser.preferred_work_location || profileUser.target_timeline || profileUser.seeking_type?.length > 0 || profileUser.help_needed?.length > 0) && (
            <div className="px-6 py-4 bg-slate-50 border-b">
              <StudentContextBadges
                location={profileUser.preferred_work_location}
                timeline={profileUser.target_timeline}
                seekingTypes={profileUser.seeking_type || []}
                helpTypes={profileUser.help_needed || []}
                className="justify-center sm:justify-start"
              />
              {profileUser.industries_interested?.length > 0 && (
                <p className="text-sm text-slate-600 mt-2 text-center sm:text-left">
                  <span className="font-medium">Interested in:</span> {profileUser.industries_interested.slice(0, 5).join(', ')}
                  {profileUser.industries_interested.length > 5 && ` +${profileUser.industries_interested.length - 5} more`}
                </p>
              )}
            </div>
          )}
          
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">Details</h2>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-500 flex-shrink-0" />
                <span className="break-all">{profileUser.email}</span>
              </div>
              {!isStudent && headline && headline !== getDefaultHeadline(profileUser) && (
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  <span>{headline}</span>
                </div>
              )}
              {(profileUser.graduation_year || profileUser.major) && (
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  <span>
                    {profileUser.graduation_year && (isStudent ? `Class of ${profileUser.graduation_year}` : `Graduated ${profileUser.graduation_year}`)}
                    {profileUser.graduation_year && profileUser.major && ' · '}
                    {profileUser.major}
                  </span>
                </div>
              )}
              {profileUser.minor && (
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-600">Minor: {profileUser.minor}</span>
                </div>
              )}
              {(profileUser.location || profileUser.preferred_work_location) && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  <span>{profileUser.preferred_work_location || profileUser.location}</span>
                </div>
              )}
              {profileUser.linkedin_url && (
                <div className="flex items-center gap-3">
                  <Linkedin className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  <a href={profileUser.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                    LinkedIn Profile
                  </a>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">About</h2>
              <p className="text-slate-700 whitespace-pre-wrap">
                {profileUser.bio || 'No bio provided.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings - only show for own profile and parents/alumni */}
        {isMyProfile && (profileUser.persona === 'parent' || profileUser.persona === 'alumni' || profileUser.roles?.includes('parent') || profileUser.roles?.includes('alumni')) && (
          <div className="mt-6">
            <NotificationSettings user={profileUser} />
          </div>
        )}
      </div>
    </div>
  );
}