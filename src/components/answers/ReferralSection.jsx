import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Send, Loader2, Check, Link2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { trackEvent } from '@/components/utils/analytics';

export default function ReferralSection({ question, currentUser, collapsed = false }) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'sending' | 'success' | 'error'
  const [resultType, setResultType] = useState(null); // 'tagged' | 'invited'
  const [taggedUserName, setTaggedUserName] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!collapsed);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendInvite = async () => {
    // Validate
    if (!email.trim()) {
      setStatus('error');
      setErrorMessage('Please enter an email address');
      return;
    }

    if (!validateEmail(email)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address');
      return;
    }

    // Prevent self-referral
    if (email.toLowerCase() === currentUser?.email?.toLowerCase()) {
      setStatus('error');
      setErrorMessage("That's your email! Enter someone else's email to invite them.");
      return;
    }

    // Prevent inviting the question poster
    const posterEmail = question?.poster_email || question?.created_by;
    if (posterEmail && email.toLowerCase() === posterEmail.toLowerCase()) {
      setStatus('error');
      setErrorMessage("That's the student who asked the question!");
      return;
    }

    setStatus('sending');

    try {
      const response = await base44.functions.invoke('createQuestionReferral', {
        questionId: question?.id,
        referrerEmail: currentUser?.email,
        referrerName: currentUser?.full_name,
        inviteeEmail: email.toLowerCase().trim()
      });

      const result = response?.data;
      setResultType(result?.type || 'invited');
      if (result?.type === 'tagged') {
        setTaggedUserName(result?.userName);
      }

      trackEvent(result?.type === 'tagged' ? 'referral_internal_tag_sent' : 'referral_external_invite_sent', {
        question_id: question?.id,
        referrer_id: currentUser?.id
      });

      setStatus('success');

    } catch (err) {
      console.error('Failed to send referral:', err);
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  const handleCopyLink = async () => {
    // Generate referral link with attribution
    const referralLink = `https://collegefastforward.com/#QuestionDetail?id=${question?.id}&src=share${currentUser?.id ? `&ref=${currentUser.id}` : ''}`;
    
    // Generate share message
    const studentName = question?.poster_first_name || question?.poster_name?.split(' ')[0] || 'a student';
    const shareMessage = `Can you help ${studentName}? They're looking for career advice: ${referralLink}`;

    try {
      await navigator.clipboard.writeText(shareMessage);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      
      trackEvent('referral_link_copied', {
        question_id: question?.id,
        referrer_id: currentUser?.id
      });

      toast({
        title: "📋 Copied!",
        description: "Share message copied to clipboard"
      });
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      toast({
        title: "Copy failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleReset = () => {
    setEmail('');
    setStatus('idle');
    setResultType(null);
    setTaggedUserName(null);
    setErrorMessage('');
  };

  if (!question?.id) return null;

  // Success state - Tagged existing user
  if (status === 'success' && resultType === 'tagged') {
    return (
      <div className="referral-section success">
        <div className="success-content">
          <Check className="w-6 h-6 text-green-600" />
          <div>
            <p className="success-title">Sent!</p>
            <p className="success-desc">
              {taggedUserName} has been notified about this question. We'll let you know if they respond.
            </p>
          </div>
        </div>
        <button onClick={handleReset} className="invite-another-btn">
          Invite Someone Else
        </button>

        <style jsx>{styles}</style>
      </div>
    );
  }

  // Success state - Invited new user
  if (status === 'success') {
    return (
      <div className="referral-section success">
        <div className="success-content">
          <Check className="w-6 h-6 text-green-600" />
          <div>
            <p className="success-title">Sent!</p>
            <p className="success-desc">
              We emailed your contact with this question. They can answer without creating an account. We'll let you know if they respond.
            </p>
          </div>
        </div>
        <button onClick={handleReset} className="invite-another-btn">
          Invite Someone Else
        </button>

        <style jsx>{styles}</style>
      </div>
    );
  }

  // Collapsed state - simple button to expand
  if (!isExpanded) {
    return (
      <div className="referral-collapsed">
        <button 
          onClick={() => setIsExpanded(true)}
          className="expand-btn"
        >
          <span className="collapsed-label">Not your area?</span>
          <span className="collapsed-action">
            <Users className="w-4 h-4" />
            Send this question to someone who can help
          </span>
        </button>
        <style jsx>{styles}</style>
      </div>
    );
  }

  // Default/Error state - expanded
  return (
    <div className="referral-section">
      <div className="referral-header">
        <Users className="w-5 h-5 text-blue-600" />
        <span className="referral-title">Know someone who can help?</span>
        <button onClick={() => setIsExpanded(false)} className="close-btn">✕</button>
      </div>

      <p className="referral-desc">
        We'll send them this question directly. They can answer without creating an account.
      </p>

      {/* Email input */}
      <div className="email-input-wrapper">
        <Input
          type="email"
          placeholder="Their email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === 'error') setStatus('idle');
          }}
          className={`email-input ${status === 'error' ? 'error' : ''}`}
          disabled={status === 'sending'}
          onKeyDown={(e) => e.key === 'Enter' && handleSendInvite()}
        />
        {status === 'error' ? (
          <p className="error-message">⚠️ {errorMessage}</p>
        ) : (
          <p className="privacy-note">🔒 Their email won't be shared with the student</p>
        )}
      </div>

      {/* Send button */}
      <Button
        onClick={handleSendInvite}
        disabled={status === 'sending'}
        className="send-btn"
      >
        {status === 'sending' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Sending...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Send This Question
          </>
        )}
      </Button>

      {/* Divider */}
      <div className="divider">
        <span>or</span>
      </div>

      {/* Copy link */}
      <button onClick={handleCopyLink} className="copy-link-btn">
        {linkCopied ? (
          <span className="copied">
            <Check className="w-4 h-4 mr-1" />
            Link copied!
          </span>
        ) : (
          <>
            <Link2 className="w-4 h-4 mr-1" />
            Copy link to share yourself
          </>
        )}
      </button>

      <style jsx>{styles}</style>
    </div>
  );
}

const styles = `
  .referral-section {
    background: #F0F9FF;
    border: 1px solid #BAE6FD;
    border-radius: 12px;
    padding: 20px;
    margin-top: 16px;
  }

  .referral-section.success {
    background: #ECFDF5;
    border-color: #A7F3D0;
    text-align: center;
  }

  .referral-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .referral-title {
    font-size: 15px;
    font-weight: 600;
    color: #0F172A;
  }

  .referral-desc {
    font-size: 13px;
    color: #64748B;
    margin: 0 0 16px 0;
    line-height: 1.5;
  }

  .email-input-wrapper {
    margin-bottom: 12px;
  }

  .email-input {
    width: 100%;
    height: 44px;
    border-radius: 8px;
    font-size: 15px;
  }

  .email-input.error {
    border-color: #EF4444;
    background: #FEF2F2;
  }

  .error-message {
    font-size: 12px;
    color: #DC2626;
    margin: 6px 0 0 0;
  }

  .privacy-note {
    font-size: 12px;
    color: #9CA3AF;
    margin: 6px 0 0 0;
  }

  .send-btn {
    width: 100%;
    height: 44px;
    background: #0021A5 !important;
    color: white !important;
    font-weight: 600;
    border-radius: 8px;
  }

  .send-btn:hover:not(:disabled) {
    background: #001A84 !important;
  }

  .send-btn:disabled {
    opacity: 0.7;
  }

  .divider {
    display: flex;
    align-items: center;
    gap: 16px;
    margin: 16px 0;
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #CBD5E1;
  }

  .divider span {
    font-size: 12px;
    color: #94A3B8;
  }

  .copy-link-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    background: none;
    border: none;
    font-size: 14px;
    color: #64748B;
    cursor: pointer;
    transition: color 0.15s;
  }

  .copy-link-btn:hover {
    color: #0F172A;
  }

  .copy-link-btn .copied {
    color: #059669;
    display: flex;
    align-items: center;
  }

  /* Success state */
  .success-content {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    text-align: left;
    margin-bottom: 16px;
  }

  .success-title {
    font-size: 16px;
    font-weight: 600;
    color: #059669;
    margin: 0 0 4px 0;
  }

  .success-desc {
    font-size: 14px;
    color: #374151;
    margin: 0;
    line-height: 1.5;
  }

  .invite-another-btn {
    background: none;
    border: none;
    font-size: 14px;
    font-weight: 500;
    color: #059669;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .invite-another-btn:hover {
    color: #047857;
  }

  @media (max-width: 640px) {
    .referral-section {
      padding: 16px;
    }

    .email-input {
      font-size: 16px; /* Prevent iOS zoom */
    }
  }
`;