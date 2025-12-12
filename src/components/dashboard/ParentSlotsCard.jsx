import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, RefreshCw, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ParentSlotsCard({ user, onInviteClick, onUpdate }) {
  const [cancelingSlot, setCancelingSlot] = useState(null);
  const [resendingCode, setResendingCode] = useState(false);

  const hasParent1 = user?.parent_1_email;
  const hasParent2 = user?.parent_2_email;
  const hasPendingCode = user?.pending_parent_verification_code;
  const pendingParentEmail = user?.pending_parent_email;

  const handleCancelPending = async () => {
    setCancelingSlot(true);
    try {
      await base44.auth.updateMe({
        pending_parent_verification_code: null,
        pending_parent_email: null,
        verification_code_expires_at: null
      });
      toast.success('Pending invitation cancelled');
      onUpdate?.();
    } catch (error) {
      console.error('Failed to cancel:', error);
      toast.error('Failed to cancel invitation');
    } finally {
      setCancelingSlot(false);
    }
  };

  const handleResendCode = async () => {
    if (!pendingParentEmail) return;
    
    setResendingCode(true);
    try {
      // Trigger a new code to be sent
      const { addStudentToFamily } = await import('@/functions/addStudentToFamily');
      await addStudentToFamily({
        student_email: user.email,
        action: 'send_code'
      });
      toast.success('Verification code resent!');
    } catch (error) {
      console.error('Failed to resend:', error);
      toast.error('Failed to resend code');
    } finally {
      setResendingCode(false);
    }
  };

  return (
    <Card className="border-3 border-[#FA4616] shadow-2xl bg-gradient-to-r from-orange-50 via-orange-50 to-amber-50">
      <CardContent className="pt-8 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">🚀</span>
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Parent Superpower
          </h3>
        </div>

        <p className="text-slate-800 text-base mb-6 leading-relaxed">
          <strong className="text-[#FA4616]">Parents provide warm introductions to hiring managers.</strong> When your parent joins, they can post opportunities and help you connect with their network.
        </p>

        {/* Parent Slots */}
        <div className="space-y-3 mb-6">
          {/* Parent Slot 1 */}
          <div className={`flex items-center justify-between p-4 rounded-xl border-2 ${
            hasParent1 
              ? 'bg-green-50 border-green-300' 
              : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              {hasParent1 ? (
                <>
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-slate-900">Parent 1</p>
                    <p className="text-sm text-slate-600">{user.parent_1_email}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-slate-500 font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">Parent Slot 1</p>
                    <p className="text-sm text-slate-500">Empty</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Parent Slot 2 */}
          <div className={`flex items-center justify-between p-4 rounded-xl border-2 ${
            hasParent2 
              ? 'bg-green-50 border-green-300' 
              : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              {hasParent2 ? (
                <>
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-slate-900">Parent 2</p>
                    <p className="text-sm text-slate-600">{user.parent_2_email}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-slate-500 font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">Parent Slot 2</p>
                    <p className="text-sm text-slate-500">Empty</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Pending Code Status */}
        {hasPendingCode && pendingParentEmail && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-bold text-yellow-900 mb-1">Pending Verification</p>
                <p className="text-sm text-yellow-800">
                  Sent code to <strong>{pendingParentEmail}</strong>
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  They need to enter the code we sent them to complete the link.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleResendCode}
                  disabled={resendingCode}
                  className="text-yellow-700 border-yellow-400 hover:bg-yellow-100"
                >
                  {resendingCode ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelPending}
                  disabled={cancelingSlot}
                  className="text-red-600 border-red-400 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Invite Button */}
        {(!hasParent1 || !hasParent2) && !hasPendingCode && (
          <Button
            onClick={onInviteClick}
            className="w-full bg-gradient-to-r from-[#FA4616] to-orange-600 hover:from-orange-600 hover:to-red-600 text-white font-extrabold py-6 text-lg shadow-xl"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Invite a Parent
          </Button>
        )}

        {/* Benefits */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-900 px-3 py-1.5 rounded-full font-bold text-sm shadow-sm">
            ✨ Warm Intros
          </span>
          <span className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-900 px-3 py-1.5 rounded-full font-bold text-sm shadow-sm">
            💼 Job Posts
          </span>
          <span className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-900 px-3 py-1.5 rounded-full font-bold text-sm shadow-sm">
            🏆 Elite Network
          </span>
        </div>
      </CardContent>
    </Card>
  );
}