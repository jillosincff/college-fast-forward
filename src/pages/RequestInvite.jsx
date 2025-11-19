import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Mail, ArrowLeft, CheckCircle, GraduationCap, Users, Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import { useToast } from '@/components/ui/use-toast';

export default function RequestInvite() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !fullName || !userType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke('sendInvite', {
        email: email.toLowerCase().trim(),
        full_name: fullName.trim(),
        user_type: userType,
        reason: reason.trim() || 'No reason provided'
      });

      if (response.data?.success) {
        setSubmitted(true);
        toast({
          title: "Request Submitted! ✅",
          description: "Check your email for confirmation",
        });
      } else {
        throw new Error(response.data?.error || 'Failed to submit');
      }

    } catch (error) {
      console.error('Error submitting invite request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-2 border-green-200 shadow-xl">
            <CardContent className="pt-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Request Submitted!
              </h2>
              <p className="text-slate-600 mb-6">
                We'll review your request within 24-48 hours and send an invite code to <strong>{email}</strong>
              </p>
              <Button
                onClick={() => navigate('LandingPage')}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Want In?
          </h1>
          <p className="text-slate-600">
            Request access to join 4,000+ Gators in the private network
          </p>
        </div>

        <Card className="border-2 border-blue-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">Request Your Invite</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Full Name *
                </label>
                <Input
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Email Address *
                </label>
                <Input
                  type="email"
                  placeholder="your@email.com or your@ufl.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  Students: Use your @ufl.edu email for faster approval
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700 block mb-3">
                  I am a... *
                </Label>
                <RadioGroup value={userType} onValueChange={setUserType} className="space-y-3">
                  <Label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 hover:bg-slate-50">
                    <RadioGroupItem value="uf_student" id="student" className="mt-1" />
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 block">UF Student</span>
                        <p className="text-sm text-slate-600">Current University of Florida student</p>
                      </div>
                    </div>
                  </Label>

                  <Label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all has-[:checked]:bg-orange-50 has-[:checked]:border-orange-500 hover:bg-slate-50">
                    <RadioGroupItem value="uf_alumni" id="alumni" className="mt-1" />
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 block">UF Alumni</span>
                        <p className="text-sm text-slate-600">University of Florida graduate</p>
                      </div>
                    </div>
                  </Label>

                  <Label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all has-[:checked]:bg-purple-50 has-[:checked]:border-purple-500 hover:bg-slate-50">
                    <RadioGroupItem value="uf_parent" id="parent" className="mt-1" />
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Heart className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 block">UF Parent</span>
                        <p className="text-sm text-slate-600">Parent of a UF student or alum</p>
                      </div>
                    </div>
                  </Label>
                </RadioGroup>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Why do you want to join? (Optional)
                </label>
                <Textarea
                  placeholder="Tell us a bit about yourself and why you want access..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="h-24"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-bold py-6"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200 text-center">
              <p className="text-sm text-slate-600 mb-3">
                Already have an invite code?
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('InviteRequired')}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Enter Invite Code
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('LandingPage')}
            className="text-slate-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}