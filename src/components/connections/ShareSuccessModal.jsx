import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  Linkedin, 
  Twitter, 
  Instagram,
  Download,
  Sparkles,
  Heart
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function ShareSuccessModal({ isOpen, onClose, successData }) {
  const [customMessage, setCustomMessage] = useState('');
  const { toast } = useToast();

  const defaultMessage = `🎉 Just made an amazing connection through GatorConnect! The UF alumni network is incredible. #GatorNation #UFAlumni #Networking`;

  const shareUrl = `https://gatorconnect.app/success/${successData?.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Success story link copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLinkedInShare = () => {
    const message = customMessage || defaultMessage;
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(message)}`;
    window.open(linkedinUrl, '_blank');
  };

  const handleTwitterShare = () => {
    const message = customMessage || defaultMessage;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleInstagramStory = () => {
    // This would open Instagram app or web with a pre-filled story
    toast({
      title: "Instagram Story",
      description: "Copy the message and create your story on Instagram!",
    });
  };

  const handleDownloadImage = () => {
    // This would generate and download a branded success image
    toast({
      title: "Generating image...",
      description: "Your branded success image is being created!",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-6 h-6 text-[var(--uf-orange)]" />
            Share Your Success!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Success Preview */}
          <div className="bg-gradient-to-r from-[var(--uf-blue)] to-[var(--uf-orange)] rounded-lg p-4 text-white text-center">
            <h3 className="font-bold text-lg mb-2">🎉 Connection Made!</h3>
            <p className="text-sm opacity-90">
              {successData?.message || "Successfully connected through the Gator Network"}
            </p>
            <div className="flex justify-center gap-2 mt-3">
              <Badge className="bg-white/20 text-white border-white/30">
                UF Alumni Network
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30">
                #GatorNation
              </Badge>
            </div>
          </div>

          {/* Custom Message */}
          <div>
            <label className="block text-sm font-medium mb-2">Customize your message</label>
            <Textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder={defaultMessage}
              className="h-20"
            />
          </div>

          {/* Share Options */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900">Share on social media</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleLinkedInShare}
                className="flex items-center gap-2 bg-[#0077B5] hover:bg-[#005885] text-white"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </Button>
              
              <Button
                onClick={handleTwitterShare}
                className="flex items-center gap-2 bg-[#1DA1F2] hover:bg-[#1a91da] text-white"
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </Button>
              
              <Button
                onClick={handleInstagramStory}
                className="flex items-center gap-2 bg-gradient-to-r from-[#E4405F] to-[#833AB4] hover:opacity-90 text-white"
              >
                <Instagram className="w-4 h-4" />
                Instagram
              </Button>
              
              <Button
                onClick={handleDownloadImage}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Image
              </Button>
            </div>
          </div>

          {/* Copy Link */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Share link</label>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1"
              />
              <Button onClick={handleCopyLink} variant="outline" size="icon">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button 
              onClick={() => {
                // Trigger confetti animation
                window.dispatchEvent(new CustomEvent('gator-success-shared'));
                onClose();
              }}
              className="bg-[var(--uf-orange)] hover:bg-orange-600 text-white"
            >
              <Heart className="w-4 h-4 mr-2" />
              Done Sharing
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}