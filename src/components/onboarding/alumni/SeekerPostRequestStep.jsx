import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { JobRequest } from '@/entities/JobRequest';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const HELP_CATEGORIES = [
  { value: 'career_guidance', label: 'Career guidance', icon: '💼' },
  { value: 'jobs_referrals', label: 'Jobs & referrals', icon: '🔍' },
  { value: 'resume_interviews', label: 'Resume & interviews', icon: '📄' },
  { value: 'industry_insights', label: 'Industry insights', icon: '🏢' },
  { value: 'introductions', label: 'Introductions', icon: '🤝' },
];

export default function SeekerPostRequestStep({ user, seekerNeeds = [], onComplete, onSkip }) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map seeker needs from onboarding to help categories
  const NEED_TO_HELP_MAP = {
    'intros_hiring_managers': 'introductions',
    'career_advice': 'career_guidance',
    'resume_review': 'resume_interviews',
    'interview_prep': 'resume_interviews',
    'salary_negotiation': 'career_guidance',
    'career_pivot': 'industry_insights',
  };
  const mappedTypes = [...new Set(seekerNeeds.map(n => NEED_TO_HELP_MAP[n]).filter(Boolean))];
  const selectedTypes = mappedTypes.length > 0 ? mappedTypes : ['career_guidance'];

  const canSubmit = description.trim().length >= 20;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);

    try {
      await JobRequest.create({
        role: title.trim() || `Career help — ${selectedTypes.map(t => HELP_CATEGORIES.find(c => c.value === t)?.label).join(', ')}`,
        title: title.trim() || `Career help — ${selectedTypes.map(t => HELP_CATEGORIES.find(c => c.value === t)?.label).join(', ')}`,
        description: description.trim(),
        is_alumni_career_request: true,
        alumni_help_type: selectedTypes[0],
        help_types: selectedTypes,
        poster_type: 'alumni',
        poster_email: user.email,
        poster_name: user.full_name,
        poster_first_name: user.full_name?.split(/\s+/)[0],
        target_helpers: ['alumni', 'parents'],
        target_industry: user.industry || user.industries?.[0] || '',
        status: 'active',
      });

      toast({ title: "Request posted! 🎉", description: "Parents and alumni can now see your request and reach out." });
      onComplete();
    } catch (error) {
      console.error('Failed to post request:', error);
      toast({ title: "Error", description: "Failed to post. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h2 className="text-xl lg:text-2xl font-bold text-slate-800 mb-1">
          Post your first request 🚀
        </h2>
        <p className="text-slate-500">
          Tell the network what you need — parents and alumni will see this and reach out.
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          What specifically are you looking for? <span className="text-red-500">*</span>
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Be specific — what's your situation, what have you tried, and what would help most?"
          className="min-h-[120px] resize-none"
          maxLength={1000}
        />
        <div className="flex justify-between mt-1">
          {description.trim().length > 0 && description.trim().length < 20 && (
            <p className="text-xs text-amber-600">Please write at least 20 characters</p>
          )}
          <p className="text-xs text-slate-400 ml-auto">{description.length}/1000</p>
        </div>
      </div>

      {/* Privacy note */}
      <div className="flex items-start gap-2 text-sm text-blue-800 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <span>🔒</span>
        <span>Your request is <strong>only visible to parents and alumni</strong> — not students.</span>
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-2">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            canSubmit
              ? 'bg-[#0021A5] text-white hover:bg-[#001580] shadow-lg hover:shadow-xl'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Posting...
            </span>
          ) : (
            'Post Request & Continue →'
          )}
        </button>

        <button
          onClick={onSkip}
          className="w-full py-3 rounded-xl font-medium text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all"
        >
          Skip for now — I'll post later
        </button>
      </div>
    </div>
  );
}