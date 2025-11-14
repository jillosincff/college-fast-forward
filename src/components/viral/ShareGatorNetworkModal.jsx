import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, MessageSquare, Mail, Share2, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const SHARE_LINKS = {
  facebook: (url, text) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
  twitter: (url, text) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  linkedin: (url, text) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`,
  email: (url, text) => `mailto:?subject=${encodeURIComponent('Check out College Fast Forward!')}&body=${encodeURIComponent(text + '\n\n' + url)}`,
  sms: (url, text) => `sms:?body=${encodeURIComponent(text + ' ' + url)}`
};

const SHARE_CONTENT = {
  text_email: "Check out College Fast Forward—UF's new free networking platform for students, parents, and alumni! Let's help each other land jobs, internships, and roommates. Join now:",
  social: "Excited to see College Fast Forward launching for the UF community! If you're a Gator looking for opportunities, connections, or ways to help, join free and spread the word:",
  url: "https://collegefastforward.com"
};

export default function ShareGatorNetworkModal({ isOpen, onClose }) {
  const [copiedText, setCopiedText] = useState('');

  const handleShare = (platform) => {
    const text = platform === 'facebook' || platform === 'linkedin' || platform === 'twitter' 
      ? SHARE_CONTENT.social 
      : SHARE_CONTENT.text_email;
    
    const shareUrl = SHARE_LINKS[platform](SHARE_CONTENT.url, text);
    
    // Track the share action
    console.log('ANALYTICS: Share clicked', { platform });
    
    if (platform === 'email' || platform === 'sms') {
      window.location.href = shareUrl;
    } else {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const handleCopyLink = async () => {
    const fullText = `${SHARE_CONTENT.text_email} ${SHARE_CONTENT.url}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedText('Message + Link copied!');
      setTimeout(() => setCopiedText(''), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = fullText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedText('Message + Link copied!');
      setTimeout(() => setCopiedText(''), 2000);
    }
  };

  const handleNotNow = () => {
    // Set a flag to not show this modal for 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    localStorage.setItem('gator_share_dismissed_until', thirtyDaysFromNow.toISOString());
    console.log('ANALYTICS: Share modal dismissed for 30 days');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 border-0 bg-transparent shadow-none">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
        >
          <Card className="bg-white border-2 border-[var(--uf-orange)]/20 shadow-2xl">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  College Fast Forward is Free for All Gators!
                </h2>
                <div className="space-y-3 text-slate-700 leading-relaxed">
                  <p>
                    We're building this platform to help every Gator—students, alumni, and parents—connect and succeed.
                  </p>
                  <p>
                    We're keeping it <strong>100% free</strong> for the UF community…
                  </p>
                  <p>
                    All we ask? <strong>Share College Fast Forward with one fellow Gator</strong> so our network grows even stronger!
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <p className="font-semibold text-slate-800 mb-3">Share via:</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleShare('sms')}
                    variant="outline"
                    className="flex items-center gap-2 h-12 border-2 hover:bg-blue-50 hover:border-blue-300"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Text Message
                  </Button>

                  <Button
                    onClick={() => handleShare('email')}
                    variant="outline"
                    className="flex items-center gap-2 h-12 border-2 hover:bg-blue-50 hover:border-blue-300"
                  >
                    <Mail className="w-5 h-5" />
                    Email
                  </Button>

                  <Button
                    onClick={() => handleShare('facebook')}
                    variant="outline"
                    className="flex items-center gap-2 h-12 border-2 hover:bg-blue-50 hover:border-blue-300"
                  >
                    <Share2 className="w-5 h-5" />
                    Facebook
                  </Button>

                  <Button
                    onClick={() => handleShare('linkedin')}
                    variant="outline"
                    className="flex items-center gap-2 h-12 border-2 hover:bg-blue-50 hover:border-blue-300"
                  >
                    <Share2 className="w-5 h-5" />
                    LinkedIn
                  </Button>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    className="w-full h-12 border-2 border-dashed hover:bg-slate-50 hover:border-slate-400"
                  >
                    {copiedText ? (
                      <>
                        <Check className="w-5 h-5 mr-2 text-green-600" />
                        {copiedText}
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5 mr-2" />
                        Copy Message + Link
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="text-center mt-8 space-y-4">
                <p className="text-sm text-slate-600 italic">
                  Thanks for spreading the word and keeping Gator Nation strong. Once a Gator, always a Gator! 🐊
                </p>
                
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={handleNotNow}
                    variant="ghost"
                    className="text-slate-500 hover:text-slate-700"
                  >
                    Not now
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}