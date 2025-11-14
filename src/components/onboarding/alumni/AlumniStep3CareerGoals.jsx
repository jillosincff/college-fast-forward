import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Target, Briefcase, MapPin, Building } from 'lucide-react';
import { trackEvent } from '@/components/utils/analytics';

export default function AlumniStep3CareerGoals({ formData, onUpdate, onNext, onBack }) {
  const [localData, setLocalData] = useState({
    career_goals_summary: formData?.career_goals_summary || '',
    target_roles: formData?.target_roles || '',
    target_industries: formData?.target_industries || '',
    target_locations: formData?.target_locations || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    onUpdate(localData);
    trackEvent('alumni_onboarding_career_goals_submitted', localData);
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center justify-center gap-2">
          <Target className="w-8 h-8 text-[var(--uf-orange)]" />
          What's Next for You?
        </h2>
        <p className="text-slate-600">The Gator Network is a two-way street. Tell us your goals so we can connect you with the right people and opportunities.</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="career_goals_summary" className="block text-sm font-medium text-slate-700 mb-2">
            Briefly, what are you looking for? (e.g., "Exploring senior roles in fintech," "Pivoting to product management")
          </Label>
          <Textarea
            id="career_goals_summary"
            name="career_goals_summary"
            value={localData.career_goals_summary}
            onChange={handleChange}
            placeholder="Tell us what's on your mind..."
            className="py-3 focus:ring-4 focus:ring-orange-200 focus:shadow-lg transition-all"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="target_roles" className="block text-sm font-medium text-slate-700 mb-2">
              <Briefcase className="w-4 h-4 inline mr-1" />
              Target Roles
            </Label>
            <Input
              id="target_roles"
              name="target_roles"
              value={localData.target_roles}
              onChange={handleChange}
              placeholder="e.g., Head of Growth, Lead Engineer"
              className="py-3 focus:ring-4 focus:ring-orange-200 focus:shadow-lg transition-all"
            />
          </div>
          <div>
            <Label htmlFor="target_industries" className="block text-sm font-medium text-slate-700 mb-2">
              <Building className="w-4 h-4 inline mr-1" />
              Target Industries
            </Label>
            <Input
              id="target_industries"
              name="target_industries"
              value={localData.target_industries}
              onChange={handleChange}
              placeholder="e.g., SaaS, Healthcare Tech"
              className="py-3 focus:ring-4 focus:ring-orange-200 focus:shadow-lg transition-all"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="target_locations" className="block text-sm font-medium text-slate-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Target Locations
          </Label>
          <Input
            id="target_locations"
            name="target_locations"
            value={localData.target_locations}
            onChange={handleChange}
            placeholder="e.g., Austin, TX; New York, NY; Remote"
            className="py-3 focus:ring-4 focus:ring-orange-200 focus:shadow-lg transition-all"
          />
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-slate-200 flex items-center justify-between">
        <Button variant="outline" size="lg" onClick={onBack} className="rounded-xl">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </Button>
        <Button 
          size="lg" 
          onClick={handleNext} 
          className="bg-[var(--uf-orange)] hover:bg-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl"
        >
          Continue <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}