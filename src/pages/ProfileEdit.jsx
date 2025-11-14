import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { navigate } from '@/components/utils/navigation';
import { trackEvent } from '@/components/utils/analytics';
import { base44 } from '@/api/base44Client';
import ResumeUpload from '@/components/profile/ResumeUpload';
import ShareableProfile from '@/components/profile/ShareableProfile';
import ExpertiseTagSelector from '@/components/profile/ExpertiseTagSelector';

import {
  ArrowLeft,
  Save,
  Linkedin,
  Loader2,
  Sparkles,
  Award
} from 'lucide-react';

const GRADUATION_YEARS = Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - 10 + i);

// Common expertise areas for parents to choose from
const COMMON_EXPERTISE_AREAS = [
  'Software Engineering',
  'Product Management',
  'Data Science',
  'Marketing',
  'Sales',
  'Finance',
  'Accounting',
  'Human Resources',
  'Legal',
  'Operations',
  'Strategy',
  'Consulting',
  'Healthcare',
  'Education',
  'Design',
  'Engineering',
  'Research',
  'Entrepreneurship'
];

const COMMON_MENTORSHIP_TOPICS = [
  'Career Advice',
  'Resume Review',
  'Mock Interviews',
  'Networking Tips',
  'Job Search Strategy',
  'Salary Negotiation',
  'Work-Life Balance',
  'Leadership Development',
  'Switching Industries',
  'Graduate School',
  'Entrepreneurship',
  'Technical Skills'
];

const WAYS_TO_HELP_OPTIONS = [
  'Resume Review',
  'Mock Interviews',
  'Career Advice',
  'Networking Introductions',
  'Job Referrals',
  'Informational Interviews',
  'Portfolio Review',
  'Mentorship'
];

const calculateProfileCompletion = (userData) => {
  const baseFields = [
    { key: 'full_name', label: 'Full Name', required: true },
    { key: 'bio', label: 'Bio/Headline', required: false },
    { key: 'location_city', label: 'Location', required: false },
    { key: 'linkedin_url', label: 'LinkedIn Profile', required: false }
  ];

  const studentFields = [
    { key: 'major', label: 'Major/Field of Study', required: false },
    { key: 'graduation_year', label: 'Graduation Year', required: false }
  ];

  const parentFields = [
    { key: 'company', label: 'Current Company', required: false },
    { key: 'job_title', label: 'Current Position', required: false },
    { key: 'industry', label: 'Industry', required: false },
    { key: 'years_of_experience', label: 'Years of Experience', required: false },
    { key: 'expertise_areas', label: 'Expertise Areas', required: false, isArray: true },
    { key: 'ways_to_help', label: 'Ways to Help', required: false, isArray: true }
  ];

  const fields = userData.persona === 'parent' 
    ? [...baseFields, ...parentFields]
    : [...baseFields, ...studentFields];

  const completedCount = fields.filter(field => {
    const value = userData[field.key];
    if (field.isArray) {
      return value && Array.isArray(value) && value.length > 0;
    }
    return value && (typeof value === 'string' ? value.trim() !== '' : true);
  }).length;

  return Math.round((completedCount / fields.length) * 100);
};

export default function ProfileEdit() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    linkedin_url: '',
    phone: '',
    location_city: '',
    location_state: '',
    company: '',
    job_title: '',
    industry: '',
    years_of_experience: '',
    expertise_areas: [],
    mentorship_topics: [],
    companies_worked_at: [],
    can_provide_referrals: false,
    major: '',
    graduation_year: '',
    gpa: '',
    skills: [],
    interests: [],
    ways_to_help: [],
    show_in_directory: true,
    ...(user || {})
  });

  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        full_name: user.full_name || '',
        bio: user.bio || '',
        linkedin_url: user.linkedin_url || '',
        phone: user.phone || '',
        location_city: user.location_city || '',
        location_state: user.location_state || '',
        company: user.company || '',
        job_title: user.job_title || '',
        industry: user.industry || '',
        years_of_experience: user.years_of_experience || '',
        expertise_areas: user.expertise_areas || [],
        mentorship_topics: user.mentorship_topics || [],
        companies_worked_at: user.companies_worked_at || [],
        can_provide_referrals: user.can_provide_referrals || false,
        major: user.major || '',
        graduation_year: user.graduation_year || '',
        gpa: user.gpa || '',
        skills: user.skills || [],
        interests: user.interests || [],
        ways_to_help: user.ways_to_help || [],
        show_in_directory: user.show_in_directory !== false,
      }));
      setProfileCompletion(calculateProfileCompletion(user));
    }
  }, [user]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe(formData);
      await refreshUser();
      
      toast({
        title: "✅ Profile Updated!",
        description: "Your changes have been saved"
      });

      setProfileCompletion(calculateProfileCompletion({ ...user, ...formData }));
      
      trackEvent('profile_updated', { 
        userId: user.id, 
        persona: user.persona,
        hasExpertise: formData.expertise_areas?.length > 0
      });

    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate('Dashboard');
  };

  const handleResumeUpdated = async (updates) => {
    await refreshUser();
  };

  const handleProfileUpdated = async (updates) => {
    await refreshUser();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const isParent = user.persona === 'parent';
  const isStudent = user.persona === 'gator';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Edit Your Profile
          </h1>
          <p className="text-slate-600">
            {isParent 
              ? 'Showcase your expertise to help Gator students succeed'
              : 'Keep your information up to date to maximize opportunities'
            }
          </p>

          {/* Profile Completion */}
          <div className="mt-6 p-4 bg-white rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-700">Profile Completion</span>
              <span className="text-blue-600 font-bold">{profileCompletion}%</span>
            </div>
            <Progress value={profileCompletion} className="h-2" />
            {profileCompletion < 100 && (
              <p className="text-xs text-slate-500 mt-2">
                {isParent 
                  ? 'Complete your expertise profile to help more students!'
                  : 'Complete your profile to get discovered by more parents and alumni!'
                }
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Resume Upload Section - Students Only */}
          {isStudent && <ResumeUpload user={user} onResumeUpdated={handleResumeUpdated} />}

          {/* Shareable Profile Section */}
          <ShareableProfile user={user} onProfileUpdated={handleProfileUpdated} />

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Your core profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name || ''}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio / Headline</Label>
                <Textarea
                  id="bio"
                  value={formData.bio || ''}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder={isParent 
                    ? "Senior Product Manager at Google. Passionate about mentoring UF students in tech careers."
                    : "Computer Science major seeking software engineering opportunities. Interested in AI/ML."
                  }
                  rows={4}
                />
                <p className="text-xs text-slate-500">
                  {isParent 
                    ? 'This appears at the top of your profile. Share your expertise and how you can help!'
                    : 'This appears at the top of your profile when parents view it.'
                  }
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin_url">
                    <div className="flex items-center gap-2">
                      <Linkedin className="w-4 h-4 text-blue-600" />
                      LinkedIn URL
                    </div>
                  </Label>
                  <Input
                    id="linkedin_url"
                    value={formData.linkedin_url || ''}
                    onChange={(e) => handleChange('linkedin_url', e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location_city">City</Label>
                  <Input
                    id="location_city"
                    value={formData.location_city || ''}
                    onChange={(e) => handleChange('location_city', e.target.value)}
                    placeholder="Gainesville"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location_state">State</Label>
                  <Input
                    id="location_state"
                    value={formData.location_state || ''}
                    onChange={(e) => handleChange('location_state', e.target.value)}
                    placeholder="FL"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional/Academic Information */}
          <Card>
            <CardHeader>
              <CardTitle>
                {isStudent ? 'Academic Information' : 'Professional Information'}
              </CardTitle>
              <CardDescription>
                {isStudent 
                  ? 'Your education and career interests' 
                  : 'Your work experience and expertise'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isStudent ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="major">Major</Label>
                    <Input
                      id="major"
                      value={formData.major || ''}
                      onChange={(e) => handleChange('major', e.target.value)}
                      placeholder="Computer Science"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="graduation_year">Graduation Year</Label>
                      <Select
                        value={formData.graduation_year ? formData.graduation_year.toString() : ''}
                        onValueChange={(value) => handleChange('graduation_year', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {GRADUATION_YEARS.map(year => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gpa">GPA (Optional)</Label>
                      <Input
                        id="gpa"
                        value={formData.gpa || ''}
                        onChange={(e) => handleChange('gpa', e.target.value)}
                        placeholder="3.8"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="company">Current Company</Label>
                    <Input
                      id="company"
                      value={formData.company || ''}
                      onChange={(e) => handleChange('company', e.target.value)}
                      placeholder="Google"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="job_title">Current Job Title</Label>
                    <Input
                      id="job_title"
                      value={formData.job_title || ''}
                      onChange={(e) => handleChange('job_title', e.target.value)}
                      placeholder="Senior Product Manager"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        value={formData.industry || ''}
                        onChange={(e) => handleChange('industry', e.target.value)}
                        placeholder="Technology"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="years_of_experience">Years of Experience</Label>
                      <Select
                        value={formData.years_of_experience || ''}
                        onValueChange={(value) => handleChange('years_of_experience', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-2">0-2 years</SelectItem>
                          <SelectItem value="3-5">3-5 years</SelectItem>
                          <SelectItem value="6-10">6-10 years</SelectItem>
                          <SelectItem value="11-15">11-15 years</SelectItem>
                          <SelectItem value="16-20">16-20 years</SelectItem>
                          <SelectItem value="20+">20+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Expertise Profile Section - Parents Only */}
          {isParent && (
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-purple-600" />
                  <CardTitle>Your Expertise Profile</CardTitle>
                </div>
                <CardDescription>
                  Help students find you based on your professional expertise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Expertise Areas */}
                <div className="space-y-2">
                  <Label>Areas of Expertise</Label>
                  <ExpertiseTagSelector
                    selectedTags={formData.expertise_areas || []}
                    onChange={(tags) => handleChange('expertise_areas', tags)}
                    suggestions={COMMON_EXPERTISE_AREAS}
                    placeholder="Add your areas of expertise..."
                  />
                  <p className="text-xs text-slate-500">
                    Students can filter by these to find the right mentor
                  </p>
                </div>

                {/* Mentorship Topics */}
                <div className="space-y-2">
                  <Label>Mentorship Topics</Label>
                  <ExpertiseTagSelector
                    selectedTags={formData.mentorship_topics || []}
                    onChange={(tags) => handleChange('mentorship_topics', tags)}
                    suggestions={COMMON_MENTORSHIP_TOPICS}
                    placeholder="What can you mentor students on?"
                  />
                  <p className="text-xs text-slate-500">
                    Topics you're comfortable discussing with students
                  </p>
                </div>

                {/* Ways to Help */}
                <div className="space-y-2">
                  <Label>Ways You Can Help</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {WAYS_TO_HELP_OPTIONS.map((option) => {
                      const isSelected = formData.ways_to_help?.includes(option);
                      return (
                        <Button
                          key={option}
                          type="button"
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            const current = formData.ways_to_help || [];
                            const updated = isSelected
                              ? current.filter(w => w !== option)
                              : [...current, option];
                            handleChange('ways_to_help', updated);
                          }}
                          className={isSelected ? 'bg-purple-600 hover:bg-purple-700' : ''}
                        >
                          {option}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Companies Worked At */}
                <div className="space-y-2">
                  <Label>Notable Companies You've Worked At (Optional)</Label>
                  <ExpertiseTagSelector
                    selectedTags={formData.companies_worked_at || []}
                    onChange={(tags) => handleChange('companies_worked_at', tags)}
                    suggestions={[]}
                    placeholder="Add companies... (e.g., Google, Microsoft)"
                  />
                  <p className="text-xs text-slate-500">
                    Helps students interested in specific companies find you
                  </p>
                </div>

                {/* Can Provide Referrals */}
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div className="space-y-0.5">
                    <Label htmlFor="can_provide_referrals" className="text-base font-semibold">
                      I can provide job referrals at my company
                    </Label>
                    <p className="text-sm text-slate-500">
                      Students looking for referrals will be able to see this
                    </p>
                  </div>
                  <Switch
                    id="can_provide_referrals"
                    checked={formData.can_provide_referrals}
                    onCheckedChange={(checked) => handleChange('can_provide_referrals', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Directory Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control your visibility in the Gator Directory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show_in_directory" className="text-base">Show in Directory</Label>
                  <p className="text-sm text-slate-500">
                    Allow other Gators to find and connect with you
                  </p>
                </div>
                <Switch
                  id="show_in_directory"
                  checked={formData.show_in_directory}
                  onCheckedChange={(checked) => handleChange('show_in_directory', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Talent Spotlight Banner - Students Only */}
          {isStudent && (
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      🌟 Join the Talent Spotlight
                    </h3>
                    <p className="text-slate-700 mb-4">
                      Get discovered by UF parents, alumni, and recruiters. Showcase your skills, 
                      projects, and career goals to stand out from the crowd!
                    </p>
                    <Button
                      onClick={() => navigate('TalentSpotlight')}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Learn More
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          <div className="sticky bottom-4 bg-white rounded-lg shadow-lg p-4 border">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}