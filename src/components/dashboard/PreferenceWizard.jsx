import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { User } from '@/entities/User';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Sparkles, MapPin, Briefcase, DollarSign, Target } from 'lucide-react';

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Marketing', 'Consulting',
  'Engineering', 'Education', 'Legal', 'Non-profit', 'Real Estate',
  'Media', 'Hospitality', 'Retail', 'Manufacturing', 'Government'
];

const JOB_TYPES = [
  'Full-time', 'Part-time', 'Internship', 'Contract', 'Remote', 'Hybrid'
];

const LOCATIONS = [
  'Remote', 'Florida', 'New York', 'California', 'Texas', 'Illinois',
  'Massachusetts', 'Washington', 'Georgia', 'North Carolina'
];

export default function PreferenceWizard({ isOpen, onClose }) {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    target_roles: '',
    target_industries: [],
    target_locations: [],
    preferred_job_types: [],
    min_salary: '',
    remote_only: false,
    willing_to_relocate: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setPreferences({
        target_roles: user.target_roles || '',
        target_industries: user.target_industries ? user.target_industries.split(',').map(i => i.trim()) : [],
        target_locations: user.target_locations ? user.target_locations.split(',').map(l => l.trim()) : [],
        preferred_job_types: user.preferred_job_types || [],
        min_salary: user.min_salary || '',
        remote_only: user.remote_only || false,
        willing_to_relocate: user.willing_to_relocate || false,
      });
    }
  }, [user, isOpen]);

  const handleIndustryToggle = (industry) => {
    setPreferences(prev => ({
      ...prev,
      target_industries: prev.target_industries.includes(industry)
        ? prev.target_industries.filter(i => i !== industry)
        : [...prev.target_industries, industry]
    }));
  };

  const handleLocationToggle = (location) => {
    setPreferences(prev => ({
      ...prev,
      target_locations: prev.target_locations.includes(location)
        ? prev.target_locations.filter(l => l !== location)
        : [...prev.target_locations, location]
    }));
  };

  const handleJobTypeToggle = (type) => {
    setPreferences(prev => ({
      ...prev,
      preferred_job_types: prev.preferred_job_types.includes(type)
        ? prev.preferred_job_types.filter(t => t !== type)
        : [...prev.preferred_job_types, type]
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await User.updateMyUserData({
        target_roles: preferences.target_roles,
        target_industries: preferences.target_industries.join(', '),
        target_locations: preferences.target_locations.join(', '),
        preferred_job_types: preferences.preferred_job_types,
        min_salary: preferences.min_salary ? parseInt(preferences.min_salary) : null,
        remote_only: preferences.remote_only,
        willing_to_relocate: preferences.willing_to_relocate,
      });

      await refreshUser();

      toast({
        title: "✨ Preferences Saved!",
        description: "We'll use these to personalize your recommendations.",
      });

      onClose();
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast({
        title: "Failed to save",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return preferences.target_roles.trim().length > 0;
    if (step === 2) return preferences.target_industries.length > 0;
    if (step === 3) return preferences.target_locations.length > 0;
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Set Your Job Preferences
          </DialogTitle>
          <DialogDescription>
            Help us find the perfect opportunities for you
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full mx-1 transition-all ${
                  s <= step ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          {/* Step 1: Target Roles */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">What roles are you looking for?</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Enter job titles or roles you're interested in (comma-separated)
              </p>
              <Input
                placeholder="e.g., Software Engineer, Product Manager, Data Analyst"
                value={preferences.target_roles}
                onChange={(e) => setPreferences({ ...preferences, target_roles: e.target.value })}
                className="h-12"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {preferences.target_roles.split(',').filter(r => r.trim()).map((role, idx) => (
                  <Badge key={idx} variant="secondary">
                    {role.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Industries */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Which industries interest you?</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Select all that apply
              </p>
              <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                {INDUSTRIES.map(industry => (
                  <div
                    key={industry}
                    onClick={() => handleIndustryToggle(industry)}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      preferences.target_industries.includes(industry)
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={preferences.target_industries.includes(industry)}
                        onCheckedChange={() => handleIndustryToggle(industry)}
                      />
                      <span className="text-sm font-medium">{industry}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Locations */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Where do you want to work?</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Select your preferred locations
              </p>
              <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                {LOCATIONS.map(location => (
                  <div
                    key={location}
                    onClick={() => handleLocationToggle(location)}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      preferences.target_locations.includes(location)
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={preferences.target_locations.includes(location)}
                        onCheckedChange={() => handleLocationToggle(location)}
                      />
                      <span className="text-sm font-medium">{location}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-4 p-3 bg-slate-50 rounded-lg">
                <Checkbox
                  checked={preferences.willing_to_relocate}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, willing_to_relocate: checked })}
                />
                <span className="text-sm">I'm willing to relocate for the right opportunity</span>
              </div>
            </div>
          )}

          {/* Step 4: Additional Preferences */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Additional Preferences</h3>
              </div>

              <div>
                <Label className="mb-2 block">Job Types</Label>
                <div className="flex flex-wrap gap-2">
                  {JOB_TYPES.map(type => (
                    <Badge
                      key={type}
                      variant={preferences.preferred_job_types.includes(type) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => handleJobTypeToggle(type)}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="min-salary">Minimum Salary (optional)</Label>
                <Input
                  id="min-salary"
                  type="number"
                  placeholder="e.g., 60000"
                  value={preferences.min_salary}
                  onChange={(e) => setPreferences({ ...preferences, min_salary: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                <Checkbox
                  checked={preferences.remote_only}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, remote_only: checked })}
                />
                <span className="text-sm">Only show remote opportunities</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            onClick={() => step < 4 ? setStep(step + 1) : handleSave()}
            disabled={!canProceed() || isSaving}
          >
            {isSaving ? 'Saving...' : step === 4 ? 'Save Preferences' : 'Next'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}