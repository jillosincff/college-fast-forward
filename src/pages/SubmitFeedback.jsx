import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import FeedbackChipSelector from '@/components/feedback/FeedbackChipSelector';
import FeedbackImpressionSelector from '@/components/feedback/FeedbackImpressionSelector';
import FeedbackGrowthSelector from '@/components/feedback/FeedbackGrowthSelector';

export default function SubmitFeedback() {
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const interactionId = urlParams.get('interactionId');
  const studentId = urlParams.get('studentId');
  const studentEmail = urlParams.get('studentEmail');

  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [user, setUser] = useState(null);

  const [positiveAttributes, setPositiveAttributes] = useState([]);
  const [overallImpression, setOverallImpression] = useState('');
  const [openFeedback, setOpenFeedback] = useState('');
  const [growthAttributes, setGrowthAttributes] = useState([]);
  const [recommendCoaching, setRecommendCoaching] = useState(false);

  useEffect(() => {
    const load = async () => {
      const me = await base44.auth.me();
      setUser(me);

      // Try to get student name from interaction log or user lookup
      if (interactionId) {
        const logs = await base44.entities.InteractionLog.filter({ id: interactionId });
        if (logs?.length > 0) {
          setStudentName(logs[0].student_name || studentEmail?.split('@')[0] || 'the student');
        }
      }
      if (!studentName && studentEmail) {
        setStudentName(studentEmail.split('@')[0]);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSubmit = async () => {
    if (!overallImpression) return;
    setSubmitting(true);

    await base44.entities.InteractionFeedback.create({
      interaction_log_id: interactionId || '',
      student_id: studentId || '',
      student_email: studentEmail || '',
      student_name: studentName,
      reviewer_id: user?.id || '',
      reviewer_email: user?.email || '',
      reviewer_name: user?.full_name || '',
      positive_attributes: positiveAttributes,
      growth_attributes: growthAttributes,
      overall_impression: overallImpression,
      open_feedback: openFeedback,
      recommend_coaching: recommendCoaching,
      feedback_visible: true,
    });

    setSubmitting(false);
    setSubmitted(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Thank you!</h2>
          <p className="text-slate-600 leading-relaxed mb-8">
            Your feedback helps {studentName} grow and earn recognition on CFF. Your mentorship matters more than you know.
          </p>
          <Button
            onClick={() => navigate('ParentDashboard')}
            className="bg-gradient-to-r from-[#0021A5] to-[#FA4616] hover:opacity-90 text-white px-8 py-3 rounded-xl font-semibold"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm mb-6 min-h-0"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            How was your conversation with {studentName}?
          </h1>
          <p className="text-slate-500 text-sm">
            Your feedback helps CFF students grow and earn recognition. This takes about 60 seconds.
          </p>
        </div>

        {/* Field 1: Positive attributes */}
        <FeedbackChipSelector
          selected={positiveAttributes}
          onChange={setPositiveAttributes}
        />

        {/* Field 2: Overall impression */}
        <FeedbackImpressionSelector
          selected={overallImpression}
          onChange={setOverallImpression}
        />

        {/* Field 3: Open text */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Anything else you'd like to share?
          </Label>
          <Textarea
            placeholder="Optional — anything you'd want others to know about this student"
            value={openFeedback}
            onChange={(e) => setOpenFeedback(e.target.value)}
            className="min-h-[80px] resize-none"
          />
        </div>

        {/* Field 4: Growth attributes */}
        <FeedbackGrowthSelector
          selected={growthAttributes}
          onChange={setGrowthAttributes}
        />

        {/* Field 5: Coaching toggle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-slate-700">
              Could this student benefit from coaching?
            </Label>
            <Switch
              checked={recommendCoaching}
              onCheckedChange={setRecommendCoaching}
            />
          </div>
          <p className="text-xs text-slate-400">
            This is private. CFF offers free coaching sessions to help students grow.
          </p>
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={!overallImpression || submitting}
          className="w-full bg-gradient-to-r from-[#0021A5] to-[#FA4616] hover:opacity-90 text-white py-3 rounded-xl font-semibold text-base"
        >
          {submitting ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting...</>
          ) : (
            'Submit Feedback'
          )}
        </Button>
      </div>
    </div>
  );
}