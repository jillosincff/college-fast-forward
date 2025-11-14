
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { trackEvent } from '@/components/utils/analytics';

export default function ShareAppButton({ className = "", variant = "default" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareText = `🧡💙 Get Gators Hired 🐊

When parents open their networks, Gators get hired. Connect with 12,000+ UF students and parents for internships, jobs & mentorship.

Join the network: www.collegefastforward.com

Go Gators! 🎓`;

  const handleShare = async () => {
    trackEvent('share_button_clicked');
    
    // Check if Web Share API is available and supported
    if (navigator.share && navigator.canShare && navigator.canShare({ text: shareText })) {
      try {
        await navigator.share({
          title: '🧡💙 Get Gators Hired 🐊',
          text: shareText,
          url: 'https://www.collegefastforward.com'
        });
        
        trackEvent('share_completed', { method: 'native' });
        toast({
          title: "Thanks for sharing! 🎉",
          description: "Help us grow the Gator network!",
        });
      } catch (error) {
        // User cancelled or share failed - show modal as fallback
        if (error.name !== 'AbortError') {
          console.log('Share API failed, falling back to copy modal');
        }
        setIsOpen(true);
      }
    } else {
      // Web Share API not available - go straight to copy modal
      setIsOpen(true);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      trackEvent('share_text_copied');
      
      toast({
        title: "✅ Copied!",
        description: "Share text copied to clipboard. Paste it anywhere!",
      });
      
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      toast({
        title: "Copy failed",
        description: "Please manually copy the text above.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Button
        onClick={handleShare}
        variant={variant}
        className={className}
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share App
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-[#0033A0]" />
              Share College Fast Forward
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-600">
              Copy this text and share it via iMessage, WhatsApp, or any messaging app!
            </p>
            
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <pre className="text-sm whitespace-pre-wrap font-sans text-slate-700">
                {shareText}
              </pre>
            </div>

            <Button
              onClick={handleCopy}
              className="w-full bg-[#0033A0] hover:bg-blue-700 text-white"
              disabled={copied}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Share Text
                </>
              )}
            </Button>

            <p className="text-xs text-slate-500 text-center">
              💡 The emojis and message will stand out in texts!
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
