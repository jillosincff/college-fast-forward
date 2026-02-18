import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { JobRequest } from '@/entities/JobRequest';
import { useAuth } from '@/components/auth/AuthContext';

// Consolidated 5 categories (same as giving help)
const REQUEST_TYPES = [
  { value: 'career_guidance', label: 'Career guidance', icon: '💼', description: 'Career paths, transitions, mentorship, salary advice' },
  { value: 'jobs_referrals', label: 'Jobs & referrals', icon: '🔍', description: 'Job search help, referrals, opportunities' },
  { value: 'resume_interviews', label: 'Resume & interviews', icon: '📄', description: 'Resume review, interview prep' },
  { value: 'industry_insights', label: 'Industry insights', icon: '🏢', description: 'Learn about a field, career paths' },
  { value: 'introductions', label: 'Introductions', icon: '🤝', description: 'Connect with specific people or companies' },
];

export default function AlumniPostRequestModal({ onClose, onSuccess, existingRequest = null }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isEditing = !!existingRequest;
  
  const [step, setStep] = useState(existingRequest ? 2 : 1);
  const [requestType, setRequestType] = useState(existingRequest?.alumni_help_type || existingRequest?.help_types?.[0] || '');
  const [title, setTitle] = useState(existingRequest?.title || existingRequest?.role || '');
  const [description, setDescription] = useState(existingRequest?.description || '');
  const [industry, setIndustry] = useState(existingRequest?.target_industry || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast({ title: "Missing fields", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await JobRequest.update(existingRequest.id, {
          role: title,
          title: title,
          description: description,
          target_industry: industry || 'General',
          alumni_help_type: requestType,
          help_types: requestType ? [requestType] : existingRequest.help_types,
        });
        toast({ title: "Request updated! ✅", description: "Your changes have been saved." });
      } else {
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
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save request:', error);
      toast({ title: "Error", description: `Failed to ${isEditing ? 'update' : 'post'} request. Please try again.`, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl" style={{ color: '#0021A5' }}>
            {isEditing ? 'Edit Your Request' : 'Ask the UF Network'}
          </DialogTitle>
          <p className="text-sm text-gray-500">
            {isEditing ? 'Update your request details below' : 'Your request is visible to the network'}
          </p>
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
                {isSubmitting ? (isEditing ? 'Saving...' : 'Posting...') : (isEditing ? 'Save Changes' : 'Post Request')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}