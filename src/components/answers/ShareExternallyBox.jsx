import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Link2, Copy, Mail, MessageSquare, X, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { trackEvent } from '@/components/utils/analytics';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ShareExternallyBox({ question, currentUser }) {
  const { toast } = useToast();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFallbackModal, setShowFallbackModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Generate the canonical question permalink - always use production domain
  const questionLink = question?.id 
    ? `https://collegefastforward.com/#QuestionDetail?id=${question.id}`
    : null;

  // Message template
  const messageTemplate = questionLink 
    ? `Hi! A student asked a question on College Fast Forward that made me think of you.

No pressure at all — but if you're open to sharing a quick perspective, I think it could really help.

Here's the question: ${questionLink}

If not, totally fine — just wanted to pass it along.`
    : '';

  const trackShareEvent = (eventName) => {
    trackEvent(eventName, {
      user_id: currentUser?.id,
      question_id: question?.id,
      timestamp: new Date().toISOString()
    });
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      
      if (type === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
        trackShareEvent('question_share_external_copy_link');
        toast({ title: "Link copied", description: "Ready to paste!" });
      } else {
        setCopiedMessage(true);
        setTimeout(() => setCopiedMessage(false), 2000);
        trackShareEvent('question_share_external_copy_message');
        toast({ title: "Message copied", description: "Ready to paste!" });
      }
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      // Show fallback modal with selectable text
      setShowFallbackModal(true);
    }
  };

  const handleShareClick = async () => {
    trackShareEvent('question_share_external_opened');

    // Check if native share is available (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'College Fast Forward Question',
          text: messageTemplate,
          url: questionLink
        });
        trackShareEvent('question_share_external_native_share');
      } catch (err) {
        // User cancelled or share failed - open modal instead
        if (err.name !== 'AbortError') {
          setShowShareModal(true);
        }
      }
    } else {
      // Desktop - show share options modal
      setShowShareModal(true);
    }
  };

  const handleEmailClick = () => {
    trackShareEvent('question_share_external_email_clicked');
    const subject = encodeURIComponent('Quick question I thought you could help with');
    const body = encodeURIComponent(messageTemplate);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleSmsClick = () => {
    const body = encodeURIComponent(messageTemplate);
    // SMS links work differently on iOS vs Android
    const smsLink = /iPhone|iPad|iPod/i.test(navigator.userAgent)
      ? `sms:&body=${body}`
      : `sms:?body=${body}`;
    window.open(smsLink, '_blank');
  };

  if (!questionLink) {
    return (
      <div className="share-external-box disabled">
        <ExternalLink className="w-5 h-5 text-gray-400" />
        <div className="share-external-content">
          <h4>Know someone who can help (not on CFF)?</h4>
          <p className="disabled-text">Link unavailable — please refresh.</p>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  return (
    <>
      <div className="share-external-box">
        <div className="share-external-header">
          <ExternalLink className="w-5 h-5 text-purple-600" />
          <div className="share-external-content">
            <h4>Know someone who can help (not on CFF)?</h4>
            <p>Send them this question — no pressure to join.</p>
          </div>
        </div>

        <div className="share-external-buttons">
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(questionLink, 'link')}
            className="share-btn"
          >
            {copiedLink ? <Check className="w-4 h-4 mr-1.5 text-green-600" /> : <Link2 className="w-4 h-4 mr-1.5" />}
            {copiedLink ? 'Copied!' : 'Copy link'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(messageTemplate, 'message')}
            className="share-btn"
          >
            {copiedMessage ? <Check className="w-4 h-4 mr-1.5 text-green-600" /> : <Copy className="w-4 h-4 mr-1.5" />}
            {copiedMessage ? 'Copied!' : 'Copy message'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareClick}
            className="share-btn share-main"
          >
            <ExternalLink className="w-4 h-4 mr-1.5" />
            Share…
          </Button>
        </div>
      </div>

      {/* Desktop Share Options Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share this question</DialogTitle>
          </DialogHeader>
          
          <div className="share-modal-content">
            <p className="share-modal-subtitle">
              Send this question to someone who might be able to help.
            </p>

            <div className="share-modal-buttons">
              <Button
                variant="outline"
                onClick={() => copyToClipboard(questionLink, 'link')}
                className="share-modal-btn"
              >
                <Link2 className="w-4 h-4 mr-2" />
                {copiedLink ? 'Link copied!' : 'Copy link'}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => copyToClipboard(messageTemplate, 'message')}
                className="share-modal-btn"
              >
                <Copy className="w-4 h-4 mr-2" />
                {copiedMessage ? 'Message copied!' : 'Copy message'}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleEmailClick}
                className="share-modal-btn"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>

              <Button
                variant="outline"
                onClick={handleSmsClick}
                className="share-modal-btn"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Text message
              </Button>
            </div>

            <div className="share-modal-preview">
              <h5>Message preview:</h5>
              <div className="preview-text">{messageTemplate}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fallback Modal (when clipboard fails) */}
      <Dialog open={showFallbackModal} onOpenChange={setShowFallbackModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Copy this text</DialogTitle>
          </DialogHeader>
          
          <div className="fallback-modal-content">
            <p>Select and copy the text below:</p>
            
            <div className="fallback-section">
              <label>Link:</label>
              <textarea 
                readOnly 
                value={questionLink}
                onClick={(e) => e.target.select()}
                className="fallback-textarea link"
              />
            </div>

            <div className="fallback-section">
              <label>Full message:</label>
              <textarea 
                readOnly 
                value={messageTemplate}
                onClick={(e) => e.target.select()}
                className="fallback-textarea message"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx>{styles}</style>
    </>
  );
}

const styles = `
  .share-external-box {
    margin-top: 12px;
    padding: 16px;
    border: 2px dashed #9333EA;
    border-radius: 8px;
    background: #FAF5FF;
  }

  .share-external-box.disabled {
    border-color: #D1D5DB;
    background: #F9FAFB;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .share-external-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 12px;
  }

  .share-external-content h4 {
    font-size: 14px;
    font-weight: 600;
    color: #7C3AED;
    margin: 0 0 4px 0;
  }

  .share-external-content p {
    font-size: 13px;
    color: #6B7280;
    margin: 0;
  }

  .share-external-content .disabled-text {
    color: #9CA3AF;
    font-style: italic;
  }

  .share-external-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .share-btn {
    font-size: 13px;
    font-weight: 500;
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #E5E7EB;
    background: white;
    color: #374151;
    transition: all 0.15s;
  }

  .share-btn:hover {
    background: #F3F4F6;
    border-color: #D1D5DB;
  }

  .share-btn.share-main {
    background: #7C3AED;
    color: white;
    border-color: #7C3AED;
  }

  .share-btn.share-main:hover {
    background: #6D28D9;
    border-color: #6D28D9;
  }

  .share-modal-content {
    padding: 8px 0;
  }

  .share-modal-subtitle {
    font-size: 14px;
    color: #6B7280;
    margin: 0 0 16px 0;
  }

  .share-modal-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 20px;
  }

  .share-modal-btn {
    justify-content: flex-start;
    padding: 12px 16px;
  }

  .share-modal-preview {
    background: #F9FAFB;
    border-radius: 8px;
    padding: 12px;
  }

  .share-modal-preview h5 {
    font-size: 12px;
    font-weight: 600;
    color: #6B7280;
    margin: 0 0 8px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .preview-text {
    font-size: 13px;
    color: #374151;
    white-space: pre-wrap;
    line-height: 1.5;
    max-height: 150px;
    overflow-y: auto;
  }

  .fallback-modal-content {
    padding: 8px 0;
  }

  .fallback-modal-content > p {
    font-size: 14px;
    color: #6B7280;
    margin: 0 0 16px 0;
  }

  .fallback-section {
    margin-bottom: 16px;
  }

  .fallback-section label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 4px;
  }

  .fallback-textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    font-size: 13px;
    resize: none;
    background: #F9FAFB;
  }

  .fallback-textarea.link {
    height: 60px;
  }

  .fallback-textarea.message {
    height: 150px;
  }

  @media (max-width: 640px) {
    .share-external-buttons {
      flex-direction: column;
    }

    .share-btn {
      width: 100%;
      justify-content: center;
    }

    .share-modal-buttons {
      grid-template-columns: 1fr;
    }
  }
`;