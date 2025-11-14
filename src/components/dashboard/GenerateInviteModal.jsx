import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Copy, Check, Share2, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { generateInviteCode } from '@/functions/generateInviteCode';
import { useAuth } from '@/components/auth/AuthContext';

export default function GenerateInviteModal({ isOpen, onClose, inviteType, userPersona }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [inviteCode, setInviteCode] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      // Determine correct invite type based on user persona
      let finalInviteType = inviteType;
      
      if (!finalInviteType) {
        if (userPersona === 'gator' || user?.persona === 'gator') {
          finalInviteType = 'gator_to_parent';
        } else if (userPersona === 'parent' || user?.persona === 'parent') {
          finalInviteType = 'parent_to_parent';
        }
      }

      const { data } = await generateInviteCode({ invite_type: finalInviteType });

      if (data.success) {
        setInviteCode(data);
        toast({
          title: "✅ Invite Code Generated!",
          description: "Share this code to invite someone to join.",
        });
      } else {
        throw new Error(data.error || 'Failed to generate code');
      }
    } catch (error) {
      console.error('Failed to generate invite code:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = async () => {
    if (!inviteCode) return;
    
    try {
      await navigator.clipboard.writeText(inviteCode.code);
      setCopied(true);
      toast({
        title: "✅ Copied!",
        description: "Invite code copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please manually copy the code",
        variant: "destructive"
      });
    }
  };

  const handleShareViaEmail = () => {
    if (!inviteCode) return;

    const subject = "Join College Fast Forward - Your Invite Code";
    const body = `Hey! I'm inviting you to join College Fast Forward, a platform connecting UF Gators with opportunities and support.

Your invite code: ${inviteCode.code}

Join here: ${window.location.origin}

This code expires in 7 days. Looking forward to having you in the network!

Go Gators! 🐊`;

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleClose = () => {
    setInviteCode(null);
    setCopied(false);
    onClose();
  };

  const getInviteTypeDisplay = () => {
    if (inviteCode?.invite_type === 'gator_to_parent') {
      return { title: 'Invite a Parent', description: 'Share this code with a UF parent to join the network' };
    } else if (inviteCode?.invite_type === 'parent_to_parent') {
      return { title: 'Invite Another Parent', description: 'Share this code with another UF parent' };
    }
    return { title: 'Generate Invite', description: 'Create an invite code to share' };
  };

  const display = getInviteTypeDisplay();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{display.title}</DialogTitle>
          <DialogDescription>{display.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!inviteCode ? (
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-4">
                Click below to generate a unique invite code
              </p>
              <Button
                onClick={handleGenerateCode}
                disabled={isGenerating}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Invite Code'
                )}
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-slate-50 rounded-lg p-6 border-2 border-blue-200">
                <Label className="text-sm font-medium text-slate-600 mb-2 block">
                  Your Invite Code
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={inviteCode.code}
                    readOnly
                    className="text-2xl font-bold text-center tracking-wider"
                  />
                  <Button
                    onClick={handleCopyCode}
                    variant="outline"
                    size="icon"
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  Expires: {new Date(inviteCode.expires_at).toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleShareViaEmail}
                  variant="outline"
                  className="w-full"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Share via Email
                </Button>
                <Button
                  onClick={handleCopyCode}
                  variant="outline"
                  className="w-full"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Copy & Share Manually
                </Button>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Share this code via text, email, or any messaging app. 
                  The recipient can use it during sign-up to join the Gator network.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            {inviteCode ? 'Done' : 'Cancel'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}