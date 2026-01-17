import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { JobRequest } from '@/entities/JobRequest';
import { useAuth } from '@/components/auth/AuthContext';

const REQUEST_TYPES = [
  { value: 'new_job_search', label: 'Job Search', icon: '🔍', description: 'Looking for opportunities' },
  { value: 'career_transition', label: 'Career Transition', icon: '🔄', description: 'Moving to a new role or company' },
  { value: 'industry_shift', label: 'Industry Shift', icon: '🏢', description: 'Breaking into a new industry' },
  { value: 'business_advice', label: 'Business Advice', icon: '💡', description: 'Entrepreneurship or strategy questions' },
];

export default function AlumniPostRequestModal({ onClose, onSuccess }) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [requestType, setRequestType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast({ title: "Missing fields", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await JobRequest.create({
        role: title,
        title: title,
        description: description,
        target_industry: industry || 'General',
        is_alumni_career_request: true,
        alumni_help_type: requestType,
        poster_type: 'alumni',
        poster_email: user.email,
        poster_name: user.full_name,
        status: 'active'
      });

      toast({ title: "Request posted! 🎉", description: "Your request is now visible to other alumni." });
      onSuccess();
    } catch (error) {
      console.error('Failed to post request:', error);
      toast({ title: "Error", description: "Failed to post request. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl" style={{ color: '#0021A5' }}>
            Ask the UF Network
          </DialogTitle>
          <p className="text-sm text-gray-500">Your request is visible to alumni only</p>
        </DialogHeader>

        {/* Step 1: Choose Type */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">What kind of help do you need?</p>
            <div className="grid grid-cols-2 gap-3">
              {REQUEST_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => {
                    setRequestType(type.value);
                    setStep(2);
                  }}
                  className="p-4 rounded-2xl border-2 text-left transition hover:shadow-md border-gray-200 hover:border-blue-300"
                >
                  <span className="text-2xl mb-2 block">{type.icon}</span>
                  <span className="font-semibold text-gray-900 block">{type.label}</span>
                  <span className="text-xs text-gray-500">{type.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Write Request */}
        {step === 2 && (
          <div className="space-y-4">
            <button 
              onClick={() => setStep(1)}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              ← Back to categories
            </button>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-gray-400">(be specific)</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Looking for intro to someone at Google in Product"
                maxLength={100}
              />
              <p className="text-xs text-gray-400 mt-1">{title.length}/100</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry <span className="text-gray-400">(optional)</span>
              </label>
              <Input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., Technology, Finance, Healthcare"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Details
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide context about your situation, what you've tried, and what specifically you're hoping for..."
                rows={5}
                maxLength={1000}
              />
              <p className="text-xs text-gray-400 mt-1">{description.length}/1000</p>
            </div>

            {/* Privacy Note */}
            <div 
              className="p-3 rounded-xl flex items-start gap-3"
              style={{ backgroundColor: 'rgba(0, 33, 165, 0.08)' }}
            >
              <span>🔒</span>
              <p className="text-sm text-gray-600">
                Your request is <strong>only visible to UF alumni</strong>. 
                Students and non-members cannot see it.
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!title.trim() || !description.trim() || isSubmitting}
                className="flex-1"
                style={{ backgroundColor: '#0021A5' }}
              >
                {isSubmitting ? 'Posting...' : 'Post Request'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}