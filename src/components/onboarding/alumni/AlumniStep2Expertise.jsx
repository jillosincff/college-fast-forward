import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, Clock, Users, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const HELP_OPTIONS = [
  { id: 'introductions', label: 'Make introductions to my network', icon: '🤝' },
  { id: 'resume_feedback', label: 'Provide resume feedback', icon: '📄' },
  { id: 'career_advice', label: 'Offer career advice and mentoring', icon: '💡' },
  { id: 'interview_prep', label: 'Help with interview preparation', icon: '🎯' },
  { id: 'job_leads', label: 'Share job and internship leads', icon: '💼' },
  { id: 'industry_insights', label: 'Share industry insights and trends', icon: '📊' }
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
            Choose the ways you'd like to support fellow Gators. You can always update these later.
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
            {HELP_OPTIONS.map(option => (
              <div key={option.id} className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                <Checkbox 
                  id={option.id} 
                  checked={(formData.ways_to_help || []).includes(option.id)} 
                  onCheckedChange={() => handleHelpToggle(option.id)}
                />
                <div className="flex-grow">
                  <Label 
                    htmlFor={option.id} 
                    className="font-medium text-slate-800 cursor-pointer flex items-center gap-3"
                  >
                    <span className="text-lg">{option.icon}</span>
                    <span>{option.label}</span>
                  </Label>
                </div>
              </div>
            ))}
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