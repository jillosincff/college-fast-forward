import React, { useState, useEffect, useCallback } from 'react';
import { X, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Step1Intent from './Step1Intent';
import Step2Draft from './Step2Draft';
import Step3Review from './Step3Review';

const INTENT_OPTIONS = [
  { id: 'career_advice', label: 'Career advice', desc: 'Learn how they broke into their industry' },
  { id: 'info_interview', label: 'Informational interview', desc: 'A 15-minute call about their career path' },
  { id: 'company_question', label: 'Company question', desc: "What it's like to work at their company" },
  { id: 'referral', label: 'Referral or intro', desc: 'Who else should I be talking to' },
  { id: 'resume_feedback', label: 'Resume feedback', desc: "A quick look at my resume" },
];

export default function MessageComposerModal({ isOpen, onClose, recipient, currentUser }) {
  const [step, setStep] = useState(1);
  const [intent, setIntent] = useState(null);
  const [draft, setDraft] = useState('');
  const [originalDraft, setOriginalDraft] = useState('');
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const trackEvent = React.useCallback((eventName, data = {}) => {
    base44.analytics.track({
      eventName,
      properties: { recipient_id: recipient?.id, ...data },
    }).catch(() => {});
  }, [recipient?.id]);

  useEffect(() => {
    if (isOpen) {
      trackEvent('composer_opened');
    }
  }, [isOpen, trackEvent]);

  if (!isOpen) return null;

  const handleSelectIntent = (intentId) => {
    setIntent(intentId);
    trackEvent('composer_intent_selected', { intent: intentId });
    generateDraft(intentId);
  };

  const generateDraft = async (selectedIntent) => {
    setGenerating(true);
    setError('');
    try {
      const res = await base44.functions.invoke('generateMessageDraft', {
        recipientProfile: recipient,
        studentProfile: currentUser,
        intent: selectedIntent,
      });
      if (res?.data?.draft) {
        setDraft(res.data.draft);
        setOriginalDraft(res.data.draft);
        trackEvent('composer_draft_generated', { intent: selectedIntent });
        setStep(2);
      } else {
        setError('Failed to generate draft. Please try again.');
      }
    } catch (err) {
      setError('Error generating draft. Please try again.');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = () => {
    trackEvent('composer_regenerated', { intent });
    generateDraft(intent);
  };

  const handleSend = async () => {
    setSending(true);
    try {
      const editPercentage = calculateEditPercentage(originalDraft, draft);
      await base44.functions.invoke('sendComposerMessage', {
        recipientId: recipient.id,
        recipientEmail: recipient.email,
        messageBody: draft,
        intent,
        editPercentage,
      });
      trackEvent('composer_message_sent', { intent, editPercentage });
      onClose();
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      await base44.functions.invoke('saveDraft', {
        recipientId: recipient.id,
        messageBody: draft,
        intent,
      });
      onClose();
    } catch (err) {
      console.error('Failed to save draft:', err);
    }
  };

  const calculateEditPercentage = (original, edited) => {
    if (original === edited) return 0;
    const changes = edited.split(' ').filter((word, idx) => 
      word !== original.split(' ')[idx]
    ).length;
    return Math.round((changes / original.split(' ').length) * 100);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {step === 1 && 'Message ' + (recipient.full_name || 'this person')}
            {step === 2 && 'Your message'}
            {step === 3 && 'Ready to send'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <Step1Intent options={INTENT_OPTIONS} onSelect={handleSelectIntent} />
          )}

          {step === 2 && (
            <Step2Draft
              draft={draft}
              onDraftChange={setDraft}
              onRegenerate={handleRegenerate}
              generating={generating}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <Step3Review
              recipient={recipient}
              draft={draft}
              onSend={handleSend}
              onSaveDraft={handleSaveDraft}
              onBack={() => setStep(2)}
              sending={sending}
            />
          )}
        </div>
      </div>
    </div>
  );
}