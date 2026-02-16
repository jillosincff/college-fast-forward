import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/components/auth/AuthContext';
import { User } from '@/entities/User';
import { useToast } from '@/components/ui/use-toast';
import { navigate } from '@/components/utils/navigation';
import { trackEvent } from '@/components/utils/analytics';
import LinkedInSettings from '@/components/profile/LinkedInSettings';
import { base44 } from '@/api/base44Client';
import ResumeUpload from '@/components/profile/ResumeUpload';
import ShareableProfile from '@/components/profile/ShareableProfile';
import ExpertiseTagSelector from '@/components/profile/ExpertiseTagSelector';


import {
  ArrowLeft,
  Save,
  User as UserIcon,
  Briefcase,
  MapPin,
  FileText,
  Linkedin,
  Star,
  CheckCircle,
  Loader2,
  Globe,
  CheckCircle2,
  Sparkles,
  Clock,
  Award,
  Target
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
    student_emails: '',
    ...(user || {})
  });

  const [linkedStudents, setLinkedStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

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
      
      // Load linked students for parents
      if ((user.persona === 'parent' || user.roles?.includes('parent')) && user.linked_students?.length > 0) {
        loadLinkedStudents(user.linked_students);
      }
    }
  }, [user]);

  const loadLinkedStudents = async (studentIds) => {
    setLoadingStudents(true);
    try {
      const students = [];
      for (const id of studentIds) {
        try {
          const allUsers = await base44.entities.User.list();
          const student = allUsers.find(u => u.id === id);
          if (student) students.push(student);
        } catch (err) {
          console.error('Error loading student:', err);
        }
      }
      setLinkedStudents(students);
    } catch (error) {
      console.error('Failed to load linked students:', error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Only send editable profile fields — never spread the entire formData
      // which may contain non-string values from the user object
      const profileUpdate = {
        bio: formData.bio || '',
        linkedin_url: formData.linkedin_url || '',
        phone: formData.phone || '',
        location_city: formData.location_city || '',
        location_state: formData.location_state || '',
        company: formData.company || '',
        job_title: formData.job_title || '',
        industry: formData.industry || '',
        years_of_experience: formData.years_of_experience || '',
        expertise_areas: formData.expertise_areas || [],
        mentorship_topics: formData.mentorship_topics || [],
        companies_worked_at: formData.companies_worked_at || [],
        can_provide_referrals: formData.can_provide_referrals || false,
        major: formData.major || '',
        graduation_year: formData.graduation_year || '',
        gpa: formData.gpa || '',
        skills: formData.skills || [],
        interests: formData.interests || [],
        ways_to_help: formData.ways_to_help || [],
        show_in_directory: formData.show_in_directory !== false,
      };
      await base44.auth.updateMe(profileUpdate);
      
      // Link students if provided (for parents)
      if (isParent && formData.student_emails?.trim()) {
        try {
          const emails = formData.student_emails.split(',').map(e => e.trim()).filter(e => e);
          const { data: linkResult } = await base44.functions.invoke('linkStudentsToParent', {
            studentEmailsOrNames: emails
          });
          
          if (linkResult.linkedCount > 0) {
            toast({
              title: "✅ Students Linked!",
              description: `Successfully linked ${linkResult.linkedCount} student(s)`,
            });
          }
        } catch (linkError) {
          console.error('Failed to link students:', linkError);
        }
      }
      
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
    navigate(isParent ? 'ParentDashboard' : 'Dashboard');
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

  // Detect parent persona - check both persona field and roles array
  const isParent = user.persona === 'parent' || user.roles?.includes('parent');
  const isStudent = user.persona === 'gator' || user.persona === 'student' || user.persona === 'alumni' || (!isParent && user.email?.toLowerCase().endsWith('@ufl.edu'));

  console.log('ProfileEdit persona detection:', { 
    email: user.email,
    persona: user.persona, 
    roles: user.roles, 
    isParent, 
    isStudent 
  });

  // STUDENT/ALUMNI/PARENT VIEW
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-4 sm:py-8 overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-3 sm:mb-4 text-slate-600 hover:text-slate-900 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Edit Your Profile
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Keep your information up to date to maximize opportunities
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
                  ? 'Complete your profile to get matched with more student questions!'
                  : 'Complete your profile to get discovered by more parents and alumni!'
                }
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Resume Upload Section - Students Only */}
          {!isParent && <ResumeUpload user={user} onResumeUpdated={handleResumeUpdated} />}

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

          {/* Professional Information - Parents Only */}
          {isParent && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Professional Information
                </CardTitle>
                <CardDescription>This helps us match you with the right students</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Current Company</Label>
                    <Input
                      id="company"
                      value={formData.company || ''}
                      onChange={(e) => handleChange('company', e.target.value)}
                      placeholder="e.g., Google, Deloitte"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job_title">Current Position</Label>
                    <Input
                      id="job_title"
                      value={formData.job_title || ''}
                      onChange={(e) => handleChange('job_title', e.target.value)}
                      placeholder="e.g., VP of Marketing"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      value={formData.industry || ''}
                      onValueChange={(value) => handleChange('industry', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {['Marketing', 'Finance & Banking', 'Technology & Software', 'Healthcare', 'Engineering', 'Education', 'Law & Legal', 'Consulting', 'Real Estate', 'Media & Entertainment', 'Non-Profit', 'Government', 'Retail', 'Manufacturing', 'Hospitality', 'Other'].map(ind => (
                          <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        <SelectItem value="5-10">5-10 years</SelectItem>
                        <SelectItem value="10-15">10-15 years</SelectItem>
                        <SelectItem value="15-20">15-20 years</SelectItem>
                        <SelectItem value="20+">20+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Expertise Areas</Label>
                  <p className="text-xs text-slate-500 mb-2">Select all that apply</p>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_EXPERTISE_AREAS.map(area => {
                      const selected = (formData.expertise_areas || []).includes(area);
                      return (
                        <button
                          key={area}
                          type="button"
                          onClick={() => {
                            const current = formData.expertise_areas || [];
                            handleChange('expertise_areas', 
                              selected ? current.filter(a => a !== area) : [...current, area]
                            );
                          }}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
                            selected
                              ? 'bg-blue-50 border-blue-600 text-blue-700'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {area} {selected && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Ways to Help Students</Label>
                  <p className="text-xs text-slate-500 mb-2">What types of help can you provide?</p>
                  <div className="flex flex-wrap gap-2">
                    {WAYS_TO_HELP_OPTIONS.map(option => {
                      const selected = (formData.ways_to_help || []).includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            const current = formData.ways_to_help || [];
                            handleChange('ways_to_help',
                              selected ? current.filter(o => o !== option) : [...current, option]
                            );
                          }}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
                            selected
                              ? 'bg-orange-50 border-orange-500 text-orange-700'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {option} {selected && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Academic Information - Students Only */}
          {!isParent && (
            <Card>
              <CardHeader>
                <CardTitle>Academic Information</CardTitle>
                <CardDescription>Your education and career interests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

          {/* Save Button */}
          <div className="sticky bottom-4 bg-white rounded-lg shadow-lg p-3 sm:p-4 border">
            <div className="flex gap-2 sm:gap-3">
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