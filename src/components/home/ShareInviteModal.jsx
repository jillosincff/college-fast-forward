import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Share2, Mail, Copy, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import { trackEvent } from '@/components/utils/analytics';

export default function ShareInviteModal({ isOpen, onClose, onInviteSent, inviteCount }) {
  const [activeTab, setActiveTab] = useState('share');
  const [emails, setEmails] = useState('');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareText = `🧡💙 Get Gators Hired 🐊

When parents and alumni open their networks, Gators get hired. Connect with 12,000+ UF students, alumni & parents for internships, jobs & mentorship.

Join the network: www.collegefastforward.com

Go Gators! 🎓`;

  const handleShare = async () => {
    trackEvent('share_text_clicked', { from: 'invite_modal' });
    
    // Try native share first
    if (navigator.share && navigator.canShare && navigator.canShare({ text: shareText })) {
      try {
        await navigator.share({
          title: '🧡💙 Get Gators Hired 🐊',
          text: shareText,
          url: 'https://www.collegefastforward.com'
        });
        
        trackEvent('native_share_completed', { method: 'text' });
        toast({
          title: "Thanks for sharing! 🎉",
          description: "Help us grow the Gator network!",
        });
        return;
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.log('Native share failed, will show copy option');
        }
      }
    }
    
    // Fallback to copy
    handleCopy();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      trackEvent('share_text_copied', { from: 'invite_modal' });
      
      toast({
        title: "✅ Copied!",
        description: "Share text copied! Paste it anywhere - iMessage, WhatsApp, social media!",
      });
      
      setTimeout(() => {
        setCopied(false);
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

  const handleEmailInvite = async () => {
    if (!emails.trim()) {
      toast({
        title: "Email required",
        description: "Please enter at least one email address",
        variant: "destructive"
      });
      return;
    }

    const emailList = emails.split(/[\s,;]+/).filter(e => e.trim());
    
    if (emailList.length === 0) {
      toast({
        title: "Invalid emails",
        description: "Please enter valid email addresses",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    trackEvent('email_invite_attempted', { count: emailList.length });

    try {
      const { data } = await base44.functions.invoke('sendGatorInvites', {
        emails: emailList,
        role: 'student',
        campus: 'UF',
        note: note.trim() || undefined,
        refSource: 'share_modal'
      });

      toast({
        title: "🎉 Invites Sent!",
        description: `Successfully sent ${data.sent?.length || 0} invite(s)`,
      });

      if (onInviteSent) {
        onInviteSent();
      }

      // Reset form
      setEmails('');
      setNote('');
      
      trackEvent('email_invite_completed', { 
        sent: data.sent?.length || 0,
        alreadyUsers: data.alreadyUsers?.length || 0 
      });
      
    } catch (error) {
      console.error('Failed to send invites:', error);
      toast({
        title: "Invite failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Share2 className="w-5 h-5 text-[#0021A5]" />
            Grow the Gator Network
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="share">
              <Share2 className="w-4 h-4 mr-2" />
              Share via Text
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="w-4 h-4 mr-2" />
              Email Invite
            </TabsTrigger>
          </TabsList>

          <TabsContent value="share" className="space-y-4 mt-4">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-sm font-medium text-slate-700 mb-2">Share this message:</p>
              <pre className="text-sm whitespace-pre-wrap font-sans text-slate-700 leading-relaxed">
                {shareText}
              </pre>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleShare}
                className="flex-1 bg-[#0021A5] hover:bg-blue-700 text-white"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Now
              </Button>
              <Button
                onClick={handleCopy}
                variant="outline"
                className="flex-1"
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
                    Copy Text
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-slate-500 text-center">
              💡 The emojis and message will stand out in texts and social media!
            </p>
          </TabsContent>

          <TabsContent value="email" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="emails">Email Addresses *</Label>
              <Textarea
                id="emails"
                placeholder="friend@example.com, another@example.com"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                className="mt-1 h-24"
              />
              <p className="text-xs text-slate-500 mt-1">
                Separate multiple emails with commas or new lines
              </p>
            </div>

            <div>
              <Label htmlFor="note">Personal Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Hey! I've been using College Fast Forward and thought you'd love it..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 h-20"
              />
            </div>

            <Button
              onClick={handleEmailInvite}
              disabled={sending || !emails.trim()}
              className="w-full bg-[#FA4616] hover:bg-orange-600 text-white"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Invites...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email Invites
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {inviteCount > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <p className="text-sm text-blue-800 font-medium">
              🎉 You've helped invite {inviteCount} Gator{inviteCount > 1 ? 's' : ''} today!
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}