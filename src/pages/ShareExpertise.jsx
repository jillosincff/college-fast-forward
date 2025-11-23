import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Sparkles, CheckCircle2, Linkedin } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { navigate } from '@/components/utils/navigation';

export default function ShareExpertise() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [selectedOption, setSelectedOption] = useState('linkedin');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [quickBio, setQuickBio] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  // Pre-fill LinkedIn if available from SSO
  useEffect(() => {
    if (user?.linkedin_url) {
      setLinkedinUrl(user.linkedin_url);
    }
  }, [user]);

  const handleSubmit = async () => {
    if (selectedOption === 'linkedin' && !linkedinUrl.trim()) {
      toast({
        title: "LinkedIn URL Required",
        description: "Please enter your LinkedIn profile URL.",
        variant: "destructive"
      });
      return;
    }

    if (selectedOption === 'bio') {
      if (!quickBio.trim() || quickBio.length < 50) {
        toast({
          title: "Bio Too Short",
          description: "Please write at least 50 characters about yourself.",
          variant: "destructive"
        });
        return;
      }
      if (!currentRole.trim() || !industry.trim() || !yearsExperience) {
        toast({
          title: "Missing Information",
          description: "Please fill in your current role, industry, and experience.",
          variant: "destructive"
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const updateData = {
        expertise_shared: true,
        visible_in_directory: isVisible,
        profile_completion_score: (user.profile_completion_score || 50) + 30
      };

      if (selectedOption === 'linkedin') {
        updateData.linkedin_url = linkedinUrl;
        // TODO: In future, implement LinkedIn scraping via backend function
      } else {
        updateData.bio = quickBio;
        updateData.job_title = currentRole;
        updateData.industry = industry;
        updateData.years_of_experience = parseInt(yearsExperience);
      }

      await base44.auth.updateMe(updateData);
      await refreshUser();

      setShowSuccess(true);

      setTimeout(() => {
        navigate('ParentDashboard');
      }, 2500);

    } catch (error) {
      console.error('Failed to save expertise:', error);
      toast({
        title: "Error",
        description: "Failed to save your information. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            Done! Your background is live 🎉
          </h2>
          <p className="text-slate-600 text-lg mb-4">
            Students can now find and message you.
          </p>
          <p className="text-blue-600 font-semibold">
            Redirecting to your dashboard...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Share Your Background to Help Gators
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Students see this in the directory — make it easy for them to reach out. Link your LinkedIn or add a quick bio.
          </p>
        </div>

        {/* Option Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card
            onClick={() => setSelectedOption('linkedin')}
            className={`cursor-pointer transition-all ${
              selectedOption === 'linkedin' 
                ? 'ring-2 ring-blue-500 shadow-lg bg-blue-50' 
                : 'hover:shadow-md'
            }`}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Linkedin className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">LinkedIn Profile</h3>
              </div>
              <p className="text-sm text-slate-600">
                Auto-pull your headline, experience, and photo
              </p>
            </div>
          </Card>

          <Card
            onClick={() => setSelectedOption('bio')}
            className={`cursor-pointer transition-all ${
              selectedOption === 'bio' 
                ? 'ring-2 ring-orange-500 shadow-lg bg-orange-50' 
                : 'hover:shadow-md'
            }`}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✍️</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Quick Bio</h3>
              </div>
              <p className="text-sm text-slate-600">
                Write a brief background if you don't use LinkedIn
              </p>
            </div>
          </Card>
        </div>

        {/* LinkedIn Form */}
        {selectedOption === 'linkedin' && (
          <Card className="p-8 mb-6">
            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold mb-2">LinkedIn Profile URL</Label>
                <Input
                  type="url"
                  placeholder="https://linkedin.com/in/yourname"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="text-lg h-12"
                />
                <p className="text-sm text-slate-600 mt-2">
                  We'll auto-pull your headline, experience, and photo (you can edit later).
                </p>
              </div>

              <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
                <Checkbox
                  id="visible"
                  checked={isVisible}
                  onCheckedChange={setIsVisible}
                />
                <label
                  htmlFor="visible"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Visible to students? (Yes by default — toggle off if private)
                </label>
              </div>
            </div>
          </Card>
        )}

        {/* Bio Form */}
        {selectedOption === 'bio' && (
          <Card className="p-8 mb-6">
            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold mb-2">Quick Bio (100-200 characters)</Label>
                <Textarea
                  placeholder="e.g., Finance analyst at hedge fund with 20 years experience — happy to chat banking internships."
                  value={quickBio}
                  onChange={(e) => setQuickBio(e.target.value)}
                  className="min-h-32 text-base"
                  maxLength={200}
                />
                <p className="text-sm text-slate-600 mt-1">
                  {quickBio.length}/200 characters
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-base font-semibold mb-2">Current Role</Label>
                  <Input
                    placeholder="e.g., Senior Analyst"
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                    className="text-base"
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold mb-2">Industry</Label>
                  <Input
                    placeholder="e.g., Finance, Tech, Healthcare"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="text-base"
                  />
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-2">Years of Experience</Label>
                <select
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-base"
                >
                  <option value="">Select...</option>
                  {[...Array(30)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} {i + 1 === 1 ? 'year' : 'years'}</option>
                  ))}
                  <option value="30+">30+ years</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 p-4 bg-orange-50 rounded-lg">
                <Checkbox
                  id="visible-bio"
                  checked={isVisible}
                  onCheckedChange={setIsVisible}
                />
                <label
                  htmlFor="visible-bio"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Visible to students? (Yes by default — toggle off if private)
                </label>
              </div>
            </div>
          </Card>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          size="lg"
          className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 shadow-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Publish to Directory
              <Sparkles className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>

        <p className="text-center text-sm text-slate-500 mt-4">
          Required to access your dashboard
        </p>
      </div>
    </div>
  );
}