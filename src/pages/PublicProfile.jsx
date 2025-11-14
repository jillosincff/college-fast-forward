import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, Briefcase, GraduationCap, Linkedin, Mail, 
  FileText, Sparkles, Loader2
} from 'lucide-react';
import { useParams } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import UserAvatar from '@/components/common/UserAvatar';

export default function PublicProfile() {
  const params = useParams();
  const slug = params.slug;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setError('No profile slug provided');
      setLoading(false);
      return;
    }

    loadProfile();
  }, [slug]);

  const loadProfile = async () => {
    try {
      // Find user by shareable_profile_slug
      const users = await base44.asServiceRole.entities.User.filter({
        shareable_profile_slug: slug
      });

      if (!users || users.length === 0) {
        setError('Profile not found');
        setLoading(false);
        return;
      }

      const user = users[0];

      // Check visibility settings
      if (user.profile_visibility === 'private') {
        setError('This profile is private');
        setLoading(false);
        return;
      }

      // If gators_only, check if current user is authenticated
      if (user.profile_visibility === 'gators_only') {
        try {
          const currentUser = await base44.auth.me();
          if (!currentUser) {
            setError('This profile is only visible to Gators. Please sign in.');
            setLoading(false);
            return;
          }
        } catch {
          setError('This profile is only visible to Gators. Please sign in.');
          setLoading(false);
          return;
        }
      }

      // Increment profile views
      await base44.asServiceRole.entities.User.update(user.id, {
        profile_views: (user.profile_views || 0) + 1
      });

      setProfile(user);
      setLoading(false);

    } catch (error) {
      console.error('Failed to load profile:', error);
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="text-6xl mb-4">🐊</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {error || 'Profile Not Found'}
            </h2>
            <p className="text-slate-600 mb-4">
              The profile you're looking for doesn't exist or is no longer available.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isStudent = profile.persona === 'gator';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Card */}
        <Card className="mb-6 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>
          <CardContent className="relative pt-16 pb-6">
            <div className="absolute -top-16 left-8">
              <UserAvatar
                user={profile}
                className="w-32 h-32 border-4 border-white shadow-lg"
              />
            </div>

            <div className="ml-44">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {profile.full_name || 'Gator'}
              </h1>
              
              <div className="flex flex-wrap gap-3 mb-4">
                {profile.persona && (
                  <Badge className="bg-blue-100 text-blue-800">
                    {profile.persona === 'gator' ? '🎓 Student' : 
                     profile.persona === 'parent' ? '👨‍👩‍👧 Parent' : '🐊 Alumni'}
                  </Badge>
                )}
                
                {isStudent && profile.major && (
                  <Badge variant="outline">
                    <GraduationCap className="w-3 h-3 mr-1" />
                    {profile.major}
                  </Badge>
                )}

                {!isStudent && profile.job_title && (
                  <Badge variant="outline">
                    <Briefcase className="w-3 h-3 mr-1" />
                    {profile.job_title}
                  </Badge>
                )}

                {profile.location_city && (
                  <Badge variant="outline">
                    <MapPin className="w-3 h-3 mr-1" />
                    {profile.location_city}{profile.location_state ? `, ${profile.location_state}` : ''}
                  </Badge>
                )}
              </div>

              {profile.bio && (
                <p className="text-slate-700 mb-4">{profile.bio}</p>
              )}

              {/* Contact Buttons */}
              <div className="flex flex-wrap gap-3">
                {profile.linkedin_url && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(profile.linkedin_url, '_blank')}
                  >
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Button>
                )}

                {profile.resume_url && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(profile.resume_url, '_blank')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Resume
                  </Button>
                )}

                {profile.email && (
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = `mailto:${profile.email}`}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Academic/Professional Info */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                {isStudent ? (
                  <>
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    Academic Info
                  </>
                ) : (
                  <>
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    Professional Info
                  </>
                )}
              </h2>

              <div className="space-y-3">
                {isStudent ? (
                  <>
                    {profile.major && (
                      <div>
                        <p className="text-sm text-slate-500">Major</p>
                        <p className="font-semibold text-slate-900">{profile.major}</p>
                      </div>
                    )}
                    {profile.graduation_year && (
                      <div>
                        <p className="text-sm text-slate-500">Graduation Year</p>
                        <p className="font-semibold text-slate-900">{profile.graduation_year}</p>
                      </div>
                    )}
                    {profile.gpa && (
                      <div>
                        <p className="text-sm text-slate-500">GPA</p>
                        <p className="font-semibold text-slate-900">{profile.gpa}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {profile.company && (
                      <div>
                        <p className="text-sm text-slate-500">Company</p>
                        <p className="font-semibold text-slate-900">{profile.company}</p>
                      </div>
                    )}
                    {profile.job_title && (
                      <div>
                        <p className="text-sm text-slate-500">Job Title</p>
                        <p className="font-semibold text-slate-900">{profile.job_title}</p>
                      </div>
                    )}
                    {profile.industry && (
                      <div>
                        <p className="text-sm text-slate-500">Industry</p>
                        <p className="font-semibold text-slate-900">{profile.industry}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skills & Interests */}
          {(profile.skills?.length > 0 || profile.interests?.length > 0) && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Skills & Interests
                </h2>

                {profile.skills?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-slate-500 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.interests?.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest, idx) => (
                        <Badge key={idx} className="bg-purple-100 text-purple-800">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-500 text-sm">
          <p>Profile powered by College Fast Forward 🧡💙</p>
        </div>
      </div>
    </div>
  );
}