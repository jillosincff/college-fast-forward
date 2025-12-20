import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const INDUSTRIES = [
  'Marketing',
  'Finance & Banking',
  'Technology & Software',
  'Healthcare',
  'Engineering',
  'Education',
  'Law & Legal',
  'Consulting',
  'Real Estate',
  'Media & Entertainment',
  'Non-Profit',
  'Government',
  'Retail',
  'Manufacturing',
  'Hospitality',
  'Other'
];

const HELP_TYPES = [
  { value: 'career_advice', label: 'Career advice and guidance', icon: '💼' },
  { value: 'internship_leads', label: 'Internship or job leads', icon: '🎯' },
  { value: 'resume_review', label: 'Resume review', icon: '📄' },
  { value: 'interview_prep', label: 'Interview preparation', icon: '🎤' },
  { value: 'industry_insights', label: 'Industry insights', icon: '🔍' },
  { value: 'networking_intros', label: 'Networking introductions', icon: '🤝' },
  { value: 'informational_interview', label: 'Informational interview', icon: '☕' }
];

const HELP_TIMELINES = [
  { value: 'this_week', label: 'This week - urgent!' },
  { value: 'this_month', label: 'Within this month' },
  { value: 'no_rush', label: 'No rush, just exploring' }
];

export default function EditHelpRequestModal({ isOpen, onClose, helpRequest, onSuccess }) {
  const [formData, setFormData] = useState({
    help_types: [],
    industry: '',
    description: '',
    timeline: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (helpRequest) {
      setFormData({
        help_types: helpRequest.help_types || [],
        industry: helpRequest.industry || '',
        description: helpRequest.description || '',
        timeline: helpRequest.timeline || 'no_rush'
      });
    }
  }, [helpRequest]);

  const toggleHelpType = (value) => {
    setFormData(prev => ({
      ...prev,
      help_types: prev.help_types.includes(value)
        ? prev.help_types.filter(t => t !== value)
        : [...prev.help_types, value]
    }));
  };

  const handleSave = async () => {
    if (!helpRequest?.id) return;
    
    setIsSaving(true);
    try {
      await base44.entities.HelpRequest.update(helpRequest.id, {
        help_types: formData.help_types,
        industry: formData.industry,
        description: formData.description,
        timeline: formData.timeline
      });

      // Re-run matching with updated request
      try {
        await base44.functions.invoke('generateMatches', {
          help_request_id: helpRequest.id,
          mode: 'for_request'
        });
      } catch (matchError) {
        console.error('Failed to regenerate matches:', matchError);
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Failed to update help request:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const isValid = formData.help_types.length > 0 && formData.industry && formData.description?.trim().length >= 10;

  if (showSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Request Updated!</h3>
            <p className="text-slate-600">We're finding new matches based on your updates...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#0021A5] flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#FA4616]" />
            Edit Your Help Request
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Help Types */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              What kind of help do you need? *
            </label>
            <div className="grid grid-cols-1 gap-2">
              {HELP_TYPES.map(type => (
                <label
                  key={type.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.help_types.includes(type.value)
                      ? 'border-[#0021A5] bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.help_types.includes(type.value)}
                    onChange={() => toggleHelpType(type.value)}
                    className="w-5 h-5 text-[#0021A5] rounded"
                  />
                  <span className="text-xl">{type.icon}</span>
                  <span className="text-sm font-medium text-slate-700">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Which industry? *
            </label>
            <Select 
              value={formData.industry} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map(industry => (
                  <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-5">
            <label className="block text-base font-bold text-slate-900 mb-2">
              ⭐ Tell us what you're looking for *
            </label>
            <p className="text-sm text-orange-700 mb-3">
              The more detail you provide, the better we can match you with Gator parents & alumni.
            </p>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="e.g., Looking for advice on breaking into tech consulting. Interested in learning about the interview process..."
              rows={5}
              className="text-base border-orange-300 focus:border-orange-500"
            />
            <p className="text-xs text-slate-600 mt-2">
              {formData.description?.length || 0} characters (minimum 10)
            </p>
          </div>

          {/* Timeline */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              When do you need this help?
            </label>
            <div className="space-y-2">
              {HELP_TIMELINES.map(timeline => (
                <button
                  key={timeline.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, timeline: timeline.value }))}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    formData.timeline === timeline.value
                      ? 'border-[#0021A5] bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="font-medium text-slate-800">{timeline.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid || isSaving}
            className="flex-1 bg-[#FA4616] hover:bg-[#e63e13] text-white font-semibold"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save & Find New Matches'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}