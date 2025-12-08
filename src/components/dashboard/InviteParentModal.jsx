import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Users2, Copy, X, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';

export default function InviteParentModal({ isOpen, onClose, onSuccess }) {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [parentSlots, setParentSlots] = useState({ parent_1: null, parent_2: null });
  const [inviteCodes, setInviteCodes] = useState({ parent_1: null, parent_2: null });
  const [pendingInvites, setPendingInvites] = useState({ parent_1: null, parent_2: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadParentSlots();
      loadPendingInvites();
    }
  }, [isOpen, user]);

  const loadParentSlots = () => {
    setParentSlots({
      parent_1: user?.parent_1_email || null,
      parent_2: user?.parent_2_email || null
    });
  };

  const loadPendingInvites = async () => {
    try {
      const codes = await base44.entities.InviteCode.filter({
        inviter_id: user.id,
        invite_type: 'gator_to_parent',
        status: 'active'
      });

      const pending = { parent_1: null, parent_2: null };
      codes.forEach(code => {
        if (code.parent_slot) {
          pending[code.parent_slot] = code;
        }
      });
      setPendingInvites(pending);
    } catch (error) {
      console.error('Failed to load pending invites:', error);
    }
  };

  const generateInvite = async (slot) => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateParentInvite', {
        parent_slot: slot
      });

      if (response.data.success) {
        setInviteCodes(prev => ({ ...prev, [slot]: response.data.code }));
        await loadPendingInvites();
        toast({
          title: "Invite code generated! 🎉",
          description: `Share this code with ${slot === 'parent_1' ? 'Parent 1' : 'Parent 2'}`
        });
      } else {
        throw new Error(response.data.error || 'Failed to generate code');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || 'Failed to generate invite',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelInvite = async (slot) => {
    const invite = pendingInvites[slot];
    if (!invite) return;

    try {
      await base44.entities.InviteCode.update(invite.id, { status: 'cancelled' });
      setPendingInvites(prev => ({ ...prev, [slot]: null }));
      setInviteCodes(prev => ({ ...prev, [slot]: null }));
      toast({
        title: "Invite cancelled",
        description: "You can create a new invite code for this slot"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel invite",
        variant: "destructive"
      });
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied! 📋",
      description: "Invite code copied to clipboard"
    });
  };

  const sendCodeByEmail = async (slot, code) => {
    const parentNum = slot === 'parent_1' ? '1' : '2';
    try {
      const email = prompt(`Enter Parent ${parentNum}'s email address:`);
      if (!email) return;

      await base44.integrations.Core.SendEmail({
        to: email.trim(),
        subject: `${user.full_name || 'Your Gator'} invited you to join their College Fast Forward network!`,
        body: `Hi!

${user.full_name || 'Your student'} has invited you to join College Fast Forward as their parent!

Your invite code: ${code}

Visit ${window.location.origin} and use this code to create your account.

As a Gator Parent, you'll be able to:
• Help your student connect with opportunities
• View their progress and connections
• Network with other UF parents and alumni

Go Gators! 🐊🧡💙

College Fast Forward Team`
      });

      toast({
        title: "Email sent! 📧",
        description: `Invite sent to ${email}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive"
      });
    }
  };

  const renderSlot = (slot) => {
    const slotNum = slot === 'parent_1' ? '1' : '2';
    const filled = parentSlots[slot];
    const pending = pendingInvites[slot];
    const code = inviteCodes[slot] || pending?.code;

    if (filled) {
      return (
        <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-green-800">Parent {slotNum}</div>
              <div className="text-sm text-green-600">{filled}</div>
            </div>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
        </div>
      );
    }

    if (pending && code) {
      return (
        <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-blue-800">Parent {slotNum} - Pending</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => cancelInvite(slot)}
              className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="bg-white border border-blue-300 rounded px-3 py-2 text-center mb-3">
            <div className="text-xs text-slate-500 mb-1">Invite Code</div>
            <div className="text-lg font-bold text-blue-600 tracking-wider">{code}</div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyCode(code)}
              className="flex-1"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
            <Button
              size="sm"
              onClick={() => sendCodeByEmail(slot, code)}
              className="flex-1"
            >
              Email Code
            </Button>
          </div>
          <div className="text-xs text-slate-500 mt-2 text-center">
            Expires: {new Date(pending.expires_at).toLocaleDateString()}
          </div>
        </div>
      );
    }

    return (
      <div className="border-2 border-slate-200 rounded-lg p-4">
        <div className="text-sm font-semibold text-slate-700 mb-3">Parent {slotNum}</div>
        <Button
          onClick={() => generateInvite(slot)}
          disabled={loading}
          className="w-full"
          variant="outline"
        >
          Generate Invite
        </Button>
      </div>
    );
  };

  const bothSlotsFilled = parentSlots.parent_1 && parentSlots.parent_2;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users2 className="w-7 h-7 text-blue-600" />
          </div>
          <DialogTitle className="text-2xl text-center">Invite Your Parents</DialogTitle>
          <DialogDescription className="text-center">
            {bothSlotsFilled 
              ? "Both parent slots are filled!"
              : "Generate invite codes for up to 2 parents"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {renderSlot('parent_1')}
          {renderSlot('parent_2')}
        </div>

        {bothSlotsFilled && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center text-sm text-green-700">
            ✅ Both parent slots are filled! Your family is complete.
          </div>
        )}

        <div className="text-xs text-slate-500 text-center border-t pt-3">
          💡 Your parents will use these codes to create their accounts and join your family network
        </div>
      </DialogContent>
    </Dialog>
  );
}