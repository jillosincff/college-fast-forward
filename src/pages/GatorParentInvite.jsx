import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Ticket, FileText, ArrowRight, Loader2, Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import { trackEvent } from '@/components/utils/analytics';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

export default function GatorParentInvite() {
  const { toast } = useToast();
  
  // Have Code state
  const [inviteCode, setInviteCode] = useState('');
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  
  // Request Access state
  const [userType, setUserType] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [studentName, setStudentName] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // User type for "Have Code" section
  const [codeUserType, setCodeUserType] = useState('');

  const handleJoinWithCode = async () => {
    if (!inviteCode.trim()) {
      toast({
        title: "Code Required",
        description: "Please enter your invite code",
        variant: "destructive"
      });
      return;
    }
    
    if (!codeUserType) {
      toast({
        title: "Please Select Role",
        description: "Please select whether you're an alumni or parent",
        variant: "destructive"
      });
      return;
    }

    setIsVerifyingCode(true);
    const code = inviteCode.trim().toUpperCase();
    
    try {
      // Store role (alumni or parent) and code for after OAuth
      // CRITICAL: uf_alumni -> 'alumni', uf_parent -> 'parent'
      const role = codeUserType === 'uf_alumni' ? 'alumni' : 'parent';
      console.log('🔐 [GatorParentInvite] Storing role:', role, 'from selection:', codeUserType);
      localStorage.setItem('pending_invite_role', role);
      localStorage.setItem('pending_invite_code', code);
      localStorage.setItem('pending_invite_timestamp', Date.now().toString());
      
      // Redirect to GatorAuth which will handle the OAuth flow
      navigate('GatorAuth');
    } catch (error) {
      console.error('Failed to initiate login:', error);
      toast({
        title: "Error",
        description: "Failed to initiate login. Please try again.",
        variant: "destructive"
      });
      setIsVerifyingCode(false);
    }
  };

  const handleRequestInvite = async () => {
    if (!userType || !fullName.trim() || !email.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    trackEvent('parent_invite_request_submitted', { userType });

    try {
      // Map user type to role: uf_alumni -> alumni, uf_parent -> parent
      const role = userType === 'uf_alumni' ? 'alumni' : 'parent';
      
      await base44.entities.InviteRequest.create({
        email: email.trim(),
        full_name: fullName.trim(),
        name: fullName.trim(),
        user_type: userType,
        role: role, // Store the actual role for approval
        reason: `${userType === 'uf_alumni' && gradYear ? `Grad Year: ${gradYear}. ` : ''}${userType === 'uf_parent' && studentName ? `Student: ${studentName}. ` : ''}${reason.trim()}`,
        status: 'pending'
      });

      // Notify admins
      try {
        const allUsers = await base44.entities.User.list();
        const admins = allUsers.filter(u => u.roles?.includes('admin') || u.role === 'admin');
        
        for (const admin of admins) {
          await base44.entities.Notification.create({
            recipient_email: admin.email,
            type: 'application_received',
            title: '🆕 New Invite Request',
            message: `${fullName.trim()} (${email.trim()}) requested to join as ${userType === 'uf_alumni' ? 'UF Alumni' : 'UF Parent'}`,
            action_url: 'AdminDashboard',
            action_label: 'Review Request',
            priority: 'high'
          });
        }
      } catch (notifError) {
        console.error('Failed to notify admin:', notifError);
      }

      setRequestSubmitted(true);
    } catch (error) {
      console.error('Failed to submit invite request:', error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success page after request submitted
  if (requestSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
        <Card className="max-w-md w-full shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Request Submitted!</h2>
            <p className="text-slate-600 mb-6">
              Thanks! We'll review your request and send you an invite code within 24-48 hours.
            </p>
            <p className="text-sm text-slate-500 mb-6">
              Check your email: <span className="font-semibold text-slate-700">{email}</span>
            </p>
            <p className="text-sm text-slate-500 mb-8">
              Questions? Email <a href="mailto:support@collegefastforward.com" className="text-blue-600 hover:underline">support@collegefastforward.com</a>
            </p>
            <Button
              onClick={() => navigate('LandingPage')}
              className="w-full bg-[#0021A5] hover:bg-blue-800"
            >
              Back to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-4xl mb-3">🐊</div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Join Gator Network
          </h1>
          <p className="text-lg text-slate-600">For Parents & Alumni</p>
        </div>

        {/* Two Options - Side by Side */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Option 1: Have Invite Code */}
          <Card className="shadow-lg border-2 border-slate-200 hover:border-blue-300 transition-colors">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">I Have an Invite Code</h2>
              </div>
              
              <p className="text-slate-600 mb-6">
                Got a code from a UF student or family member? Enter it below to join their family.
              </p>
              
              <div className="space-y-4">
                {/* User Type Selection for Have Code */}
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                    I am a: <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCodeUserType('uf_alumni')}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                        codeUserType === 'uf_alumni'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      UF Alumni
                    </button>
                    <button
                      onClick={() => setCodeUserType('uf_parent')}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                        codeUserType === 'uf_parent'
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      UF Parent
                    </button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Invite Code
                  </Label>
                  <Input
                    type="text"
                    placeholder="GATOR-XXXXX"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="h-12 text-center text-lg font-mono tracking-wider border-2 focus:border-blue-500"
                    maxLength={20}
                  />
                </div>
                
                <Button
                  onClick={handleJoinWithCode}
                  disabled={!inviteCode.trim() || !codeUserType || isVerifyingCode}
                  className="w-full h-14 text-lg font-bold bg-[#0021A5] hover:bg-blue-800"
                >
                  {isVerifyingCode ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Join with Code
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Option 2: Request Access */}
          <Card className="shadow-lg border-2 border-slate-200 hover:border-orange-300 transition-colors">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Request an Invite Code</h2>
              </div>
              
              <p className="text-slate-600 mb-6">
                Don't have a code? Request access and we'll send you an invite within 24-48 hours.
              </p>
              
              <div className="space-y-4">
                {/* User Type */}
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                    I am a: <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setUserType('uf_alumni')}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                        userType === 'uf_alumni'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      UF Alumni
                    </button>
                    <button
                      onClick={() => setUserType('uf_parent')}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                        userType === 'uf_parent'
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      Parent of UF Student
                    </button>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-12 border-2"
                  />
                </div>

                {/* Email */}
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 border-2"
                  />
                </div>

                {/* Conditional: Grad Year for Alumni */}
                {userType === 'uf_alumni' && (
                  <div>
                    <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Graduation Year <span className="text-slate-400">(optional)</span>
                    </Label>
                    <Input
                      type="text"
                      placeholder="e.g., 2015"
                      value={gradYear}
                      onChange={(e) => setGradYear(e.target.value)}
                      className="h-12 border-2"
                      maxLength={4}
                    />
                  </div>
                )}

                {/* Conditional: Student Name for Parents */}
                {userType === 'uf_parent' && (
                  <div>
                    <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Student's Name <span className="text-slate-400">(optional)</span>
                    </Label>
                    <Input
                      type="text"
                      placeholder="Your student's name"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="h-12 border-2"
                    />
                  </div>
                )}

                {/* Why Join */}
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Why do you want to join? <span className="text-slate-400">(optional)</span>
                  </Label>
                  <Textarea
                    placeholder="e.g., Want to help UF students in marketing"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="min-h-[80px] border-2 resize-none"
                    maxLength={200}
                  />
                  <p className="text-xs text-slate-400 mt-1 text-right">{reason.length}/200</p>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleRequestInvite}
                  disabled={!userType || !fullName.trim() || !email.trim() || isSubmitting}
                  className="w-full h-14 text-lg font-bold bg-[#FA4616] hover:bg-orange-600"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Request Invite
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>

                {/* Privacy Note */}
                <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" />
                  Your info is secure and only used to process your invite request
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('GatorRoleSelection')}
            className="text-slate-500 hover:text-slate-700 text-sm flex items-center justify-center gap-1 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to signup options
          </button>
        </div>
      </div>
    </div>
  );
}