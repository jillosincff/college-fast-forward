import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, Clock, Users, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

// Consolidated 5 categories for alumni help
const HELP_OPTIONS = [
  { id: 'career_guidance', label: 'Career guidance', icon: '💼', description: 'Career paths, transitions, mentorship, salary advice' },
  { id: 'jobs_referrals', label: 'Jobs & referrals', icon: '🔍', description: 'Job search help, referrals, sharing opportunities' },
  { id: 'resume_interviews', label: 'Resume & interviews', icon: '📄', description: 'Resume review, LinkedIn optimization, mock interviews' },
  { id: 'industry_insights', label: 'Industry insights', icon: '🏢', description: 'Day-to-day work, breaking into a field, career paths' },
  { id: 'introductions', label: 'Introductions', icon: '🤝', description: 'Connecting with specific people or companies' },
];

export default function AlumniStep2Expertise({ formData, onUpdate, onNext, onBack }) {
  const handleHelpToggle = (optionId) => {
    const currentHelp = formData.ways_to_help || [];
    const newHelpOptions = currentHelp.includes(optionId)
      ? currentHelp.filter(id => id !== optionId)
      : [...currentHelp, optionId];
    onUpdate({ ways_to_help: newHelpOptions });
  };

  return (
    <div className="p-8 sm:p-12">
      {/* Header Section */}
      <div className="text-center mb-8">
        {/* Progress and Time Indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center text-sm text-slate-500">
            <Clock className="w-4 h-4 mr-1" />
            1 minute remaining
          </div>
          <div className="text-sm text-slate-500">Step 2 of 2</div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={100} className="h-2" />
        </div>

        {/* Step Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            How would you like to help?
          </h2>
          <p className="text-lg text-slate-600 mb-6 max-w-2xl mx-auto">
            Select all that apply. Students will be matched based on your expertise.
          </p>
        </motion.div>
      </div>

      {/* Form Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-lg mx-auto space-y-6"
      >
        <div>
          <Label className="text-base font-medium mb-4 block">Ways I Can Help Students</Label>
          <div className="space-y-4">
            {HELP_OPTIONS.map(option => {
              const isSelected = (formData.ways_to_help || []).includes(option.id);
              return (
                <button
                  type="button"
                  key={option.id}
                  onClick={() => handleHelpToggle(option.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition text-left ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <div className="flex-1">
                    <span className="font-medium text-slate-900">{option.label}</span>
                    {option.description && (
                      <p className="text-sm text-slate-500 mt-0.5">{option.description}</p>
                    )}
                  </div>
                  {isSelected && (
                    <span className="text-blue-500 font-bold">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Directory Inclusion */}
        <div className="pt-6">
          <Label className="text-base font-medium mb-4 block">Gator Directory</Label>
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="pr-4">
              <p className="font-medium text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Appear in the alumni directory
              </p>
              <p className="text-sm text-slate-600 mt-1">
                Allow students to discover and connect with you based on your expertise
              </p>
            </div>
            <Switch
              checked={formData.includeInDirectory}
              onCheckedChange={(checked) => onUpdate({ includeInDirectory: checked })}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center items-center gap-4 pt-8">
          <Button variant="outline" size="lg" onClick={onBack} className="rounded-xl">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </Button>
          <Button 
            size="lg" 
            onClick={onNext} 
            className="bg-[var(--uf-blue)] hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl"
          >
            Complete Setup <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}