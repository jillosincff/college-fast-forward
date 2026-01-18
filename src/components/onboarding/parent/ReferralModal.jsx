import React, { useState } from 'react';
import { X, Send, Loader2, Users, Copy, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

export default function ReferralModal({ 
  question, 
  referrerName,
  referrerEmail,
  onClose, 
  onSuccess 
}) {
  const { toast } = useToast();
  const [friendName, setFriendName] = useState('');
  const [friendEmail, setFriendEmail] = useState('');
  const [personalNote, setPersonalNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [referralLink, setReferralLink] = useState('');

  const canSubmit = friendName.trim() && friendEmail.trim() && friendEmail.includes('@');

  const handleSubmit = async () => {
    if (!canSubmit) return;
    
    setSubmitting(true);
    try {
      // Call backend to create referral and send email
      const response = await base44.functions.invoke('createQuestionReferral', {
        questionId: question.id,
        friendName: friendName.trim(),
        friendEmail: friendEmail.trim(),
        personalNote: personalNote.trim(),
        referrerName,
        referrerEmail
      });

      if (response.data?.success) {
        setReferralLink(response.data.referralLink);
        toast({
          title: "Referral sent!",
          description: `We've emailed ${friendName} with the question.`
        });
        onSuccess?.(friendName.trim());
      } else {
        throw new Error(response.data?.error || 'Failed to send referral');
      }
    } catch (error) {
      console.error('Failed to send referral:', error);
      toast({
        title: "Couldn't send referral",
        description: "Please try again or copy the link manually.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  // Success state - show link
  if (referralLink) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Referral sent to {friendName}!
            </h3>
            <p className="text-slate-600 mb-6">
              They'll receive an email with a link to answer this question directly.
            </p>

            <div className="bg-slate-50 rounded-lg p-3 mb-4">
              <p className="text-xs text-slate-500 mb-2">Or share this link:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 text-sm bg-white border rounded px-3 py-2 truncate"
                />
                <button
                  onClick={copyLink}
                  className="p-2 bg-[#0021A5] text-white rounded-lg hover:bg-[#001580] transition-colors"
                >
                  {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-bold bg-[#0021A5] text-white hover:bg-[#001580] transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-[#0021A5]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Refer Someone</h3>
              <p className="text-sm text-slate-500">They can answer without creating an account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Their name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              placeholder="e.g., Sarah Johnson"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl
                       focus:border-[#0021A5] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Their email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={friendEmail}
              onChange={(e) => setFriendEmail(e.target.value)}
              placeholder="sarah@company.com"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl
                       focus:border-[#0021A5] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Personal note <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={personalNote}
              onChange={(e) => setPersonalNote(e.target.value)}
              placeholder="Hey Sarah, thought you'd be perfect to help with this..."
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl resize-none h-20
                       focus:border-[#0021A5] focus:outline-none transition-colors"
            />
          </div>

          {/* Question Preview */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-xs text-slate-500 mb-2">They'll be asked to help with:</p>
            <p className="text-sm text-slate-700 line-clamp-3">
              "{question?.description || question?.title}"
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t bg-slate-50 rounded-b-2xl">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className={`
              w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2
              ${canSubmit && !submitting
                ? 'bg-[#0021A5] text-white hover:bg-[#001580] shadow-lg'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }
            `}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Referral
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}