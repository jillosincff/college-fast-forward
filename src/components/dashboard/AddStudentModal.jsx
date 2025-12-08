import React, { useState } from 'react';
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
import { UserPlus, Mail, Key } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AddStudentModal({ isOpen, onClose, onSuccess }) {
  const { toast } = useToast();
  const [step, setStep] = useState('email'); // 'email' or 'verify'
  const [studentEmail, setStudentEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!studentEmail || !studentEmail.trim()) {
      toast({ 
        title: "Please enter student email", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke('addStudentToFamily', {
        student_email: studentEmail.trim(),
        action: 'send_code'
      });

      if (response.data.success) {
        setStep('verify');
        toast({
          title: "Verification code sent! 📧",
          description: `We sent a code to ${studentEmail}`
        });
      } else {
        throw new Error(response.data.error || 'Failed to send code');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || 'Failed to send verification code',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({ 
        title: "Please enter the 6-digit code", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke('addStudentToFamily', {
        student_email: studentEmail.trim(),
        action: 'verify',
        code: verificationCode
      });

      if (response.data.success) {
        toast({
          title: "Student linked! 🎉",
          description: `${studentEmail} is now part of your family`
        });
        setStudentEmail('');
        setVerificationCode('');
        setStep('email');
        if (onSuccess) onSuccess();
        setTimeout(() => onClose(), 1500);
      } else {
        throw new Error(response.data.error || 'Failed to verify');
      }
    } catch (error) {
      toast({
        title: "Verification failed",
        description: error.message || 'Invalid or expired code',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('email');
    setVerificationCode('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-7 h-7 text-orange-600" />
          </div>
          <DialogTitle className="text-2xl text-center">Add Another Child</DialogTitle>
          <DialogDescription className="text-center">
            {step === 'email' 
              ? "Enter your student's email to send them a verification code"
              : "Enter the 6-digit code we sent to your student"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === 'email' ? (
            <>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Student Email
                </label>
                <Input
                  type="email"
                  placeholder="student@ufl.edu"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button
                onClick={handleSendCode}
                disabled={loading || !studentEmail}
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                {loading ? 'Sending...' : 'Send Verification Code'}
              </Button>
            </>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 text-center">
                📧 We sent a 6-digit code to<br />
                <strong>{studentEmail}</strong>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Verification Code
                </label>
                <Input
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={loading}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  disabled={loading}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleVerify}
                  disabled={loading || verificationCode.length !== 6}
                  className="flex-1"
                >
                  <Key className="w-4 h-4 mr-2" />
                  {loading ? 'Verifying...' : 'Verify & Link'}
                </Button>
              </div>
              <Button
                onClick={handleSendCode}
                variant="ghost"
                size="sm"
                disabled={loading}
                className="w-full text-xs"
              >
                Resend Code
              </Button>
            </>
          )}
        </div>

        <div className="text-xs text-slate-500 text-center border-t pt-3">
          💡 Your student will receive an email with a verification code to confirm the link
        </div>
      </DialogContent>
    </Dialog>
  );
}