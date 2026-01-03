import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Mail, User, ArrowRight, CheckCircle, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

/**
 * Lightweight Respond Modal
 * 
 * Allows logged-out users to respond to a question with minimal friction:
 * 1. Enter first name + email + optional role
 * 2. Verify via OTP code
 * 3. Return to question page ready to answer
 */
export default function LightweightRespondModal({ 
  isOpen, 
  onClose, 
  questionId,
  onVerificationComplete 
}) {
  const { toast } = useToast();
  const [step, setStep] = useState('info'); // 'info' | 'verify' | 'success'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form data
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [agreedToGuidelines, setAgreedToGuidelines] = useState(false);
  
  // OTP verification
  const [otpCode, setOtpCode] = useState('');
  const [otpSentTo, setOtpSentTo] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const otpInputRef = useRef(null);
  
  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);
  
  // Focus OTP input when entering verify step
  useEffect(() => {
    if (step === 'verify' && otpInputRef.current) {
      setTimeout(() => otpInputRef.current?.focus(), 100);
    }
  }, [step]);

  const handleSubmitInfo = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!firstName.trim()) {
      setError('Please enter your first name');
      return;
    }
    
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (!agreedToGuidelines) {
      setError('Please agree to the community guidelines');
      return;
    }
    
    setLoading(true);
    
    try {
      // Send OTP to email
      const response = await base44.functions.invoke('sendLightweightOTP', {
        email: email.trim().toLowerCase(),
        firstName: firstName.trim(),
        role: role || 'other',
        questionId
      });
      
      if (response?.data?.success) {
        setOtpSentTo(email.trim().toLowerCase());
        setResendCooldown(60);
        setStep('verify');
        toast({
          title: "Check your email",
          description: `We sent a 6-digit code to ${email}`
        });
      } else {
        throw new Error(response?.data?.error || 'Failed to send verification code');
      }
    } catch (err) {
      console.error('OTP send error:', err);
      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await base44.functions.invoke('verifyLightweightOTP', {
        email: otpSentTo,
        code: otpCode,
        firstName: firstName.trim(),
        role: role || 'other',
        sourceQuestionId: questionId
      });
      
      if (response?.data?.success) {
        // Store lightweight user info in session
        sessionStorage.setItem('lightweight_responder', JSON.stringify({
          email: otpSentTo,
          firstName: firstName.trim(),
          role: role || 'other',
          verified: true,
          verifiedAt: new Date().toISOString()
        }));
        
        sessionStorage.setItem('pending_answer_question_id', questionId);
        
        setStep('success');
        
        // Auto-close and trigger callback after brief success message
        setTimeout(() => {
          onVerificationComplete?.({
            email: otpSentTo,
            firstName: firstName.trim(),
            role: role || 'other'
          });
        }, 1500);
      } else {
        throw new Error(response?.data?.error || 'Invalid verification code');
      }
    } catch (err) {
      console.error('OTP verify error:', err);
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    
    setError(null);
    setLoading(true);
    
    try {
      const response = await base44.functions.invoke('sendLightweightOTP', {
        email: otpSentTo,
        firstName: firstName.trim(),
        role: role || 'other',
        questionId
      });
      
      if (response?.data?.success) {
        setResendCooldown(60);
        toast({
          title: "Code resent",
          description: `New code sent to ${otpSentTo}`
        });
      } else {
        throw new Error(response?.data?.error || 'Failed to resend code');
      }
    } catch (err) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset state on close
    setStep('info');
    setError(null);
    setOtpCode('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {/* INFO STEP */}
        {step === 'info' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center">
                Share your perspective
              </DialogTitle>
              <p className="text-sm text-slate-600 text-center mt-2">
                Quick signup — no password needed
              </p>
            </DialogHeader>
            
            <form onSubmit={handleSubmitInfo} className="space-y-4 mt-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  First name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Your first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-12"
                  autoComplete="given-name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                  autoComplete="email"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-700">
                  How do you know UF? (optional)
                </Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select your relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent">Parent of a UF student</SelectItem>
                    <SelectItem value="alumni">UF Alumni</SelectItem>
                    <SelectItem value="student">Current UF student</SelectItem>
                    <SelectItem value="other">Other / Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Checkbox
                  id="guidelines"
                  checked={agreedToGuidelines}
                  onCheckedChange={setAgreedToGuidelines}
                  className="mt-0.5"
                />
                <label htmlFor="guidelines" className="text-sm text-slate-600 cursor-pointer">
                  I agree to be respectful and helpful in my response
                </label>
              </div>
              
              <Button
                type="submit"
                disabled={loading || !firstName.trim() || !email.trim()}
                className="w-full h-12 text-base font-semibold"
                style={{ backgroundColor: '#16A34A' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending code...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
              
              <p className="text-xs text-slate-400 text-center">
                We'll send a one-time code to verify your email
              </p>
            </form>
          </>
        )}
        
        {/* VERIFY STEP */}
        {step === 'verify' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center">
                Check your email
              </DialogTitle>
              <p className="text-sm text-slate-600 text-center mt-2">
                We sent a 6-digit code to<br />
                <strong>{otpSentTo}</strong>
              </p>
            </DialogHeader>
            
            <form onSubmit={handleVerifyOTP} className="space-y-4 mt-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="otp" className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-400" />
                  Verification code
                </Label>
                <Input
                  ref={otpInputRef}
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="h-14 text-center text-2xl font-mono tracking-widest"
                  autoComplete="one-time-code"
                />
              </div>
              
              <Button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full h-12 text-base font-semibold"
                style={{ backgroundColor: '#16A34A' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify & Continue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendCooldown > 0 || loading}
                  className="text-sm text-slate-500 hover:text-slate-700 disabled:opacity-50"
                >
                  {resendCooldown > 0 
                    ? `Resend code in ${resendCooldown}s`
                    : "Didn't get the code? Resend"
                  }
                </button>
              </div>
              
              <button
                type="button"
                onClick={() => setStep('info')}
                className="w-full text-sm text-slate-500 hover:text-slate-700"
              >
                ← Use a different email
              </button>
            </form>
          </>
        )}
        
        {/* SUCCESS STEP */}
        {step === 'success' && (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              You're verified!
            </h2>
            <p className="text-slate-600">
              Now you can share your perspective...
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading answer form...</span>
            </div>
          </div>
        )}
        
        {/* ANSWERED SUCCESS STEP - Shown after answer submission */}
        {step === 'answered' && (
          <div className="py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Great answer! 🎉
            </h2>
            <p className="text-slate-600 mb-6">
              Your response has been submitted and will help this student.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-blue-800 font-medium mb-2">
                Want to do more?
              </p>
              <p className="text-sm text-blue-700 mb-3">
                Join the full network to see replies, earn karma, and help more students.
              </p>
              <Button
                onClick={() => {
                  // Pre-fill email in signup flow
                  sessionStorage.setItem('prefill_email', email);
                  window.location.href = '/#GatorAuth';
                }}
                className="w-full"
                style={{ backgroundColor: '#0021A5' }}
              >
                Join College Fast Forward
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            
            <button
              onClick={handleClose}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Maybe later
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}