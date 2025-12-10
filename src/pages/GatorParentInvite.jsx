import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Lock, Shield, CheckCircle, Users, Heart, ArrowRight } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import { trackEvent } from '@/components/utils/analytics';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

export default function GatorParentInvite() {
  const { toast } = useToast();
  const [userType, setUserType] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestInvite = async () => {
    if (!userType || !fullName.trim() || !email.trim() || !reason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to request an invite.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    trackEvent('parent_invite_request_submitted', { userType });

    try {
      await base44.entities.InviteRequest.create({
        email: email.trim(),
        full_name: fullName.trim(),
        user_type: userType,
        reason: reason.trim(),
        status: 'pending'
      });

      toast({
        title: "Request Submitted! 🐊",
        description: "We'll review your request and send you an invite code soon."
      });

      // Clear form
      setFullName('');
      setEmail('');
      setReason('');
      setUserType('');
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

  return (
    <div className="min-h-screen bg-[#faf8f3] py-8 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4A017] to-[#B8860B] mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Lock className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">
            UF Gator Network
          </h1>
          <p className="text-sm text-slate-600">
            Where Gators connect for careers
          </p>
        </div>

        {/* Main Value Prop Card */}
        <div className="bg-[#F2A900] rounded-2xl p-8 text-center mb-5 shadow-md">
          <Shield className="w-14 h-14 text-slate-900 mx-auto mb-4" strokeWidth={2} />
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            Join the UF Gator Family Network
          </h2>
          <p className="text-sm text-slate-800 mb-5 max-w-md mx-auto leading-relaxed">
            Connect with 4,000+ UF Gators, Alumni & Families to help students launch careers through warm introductions
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-2 text-slate-900">
              <CheckCircle className="w-4 h-4" />
              <span>Invite Only</span>
            </div>
            <div className="flex items-center gap-2 text-slate-900">
              <CheckCircle className="w-4 h-4" />
              <span>Exclusive Network</span>
            </div>
            <div className="flex items-center gap-2 text-slate-900">
              <CheckCircle className="w-4 h-4" />
              <span>Help Gators</span>
            </div>
          </div>
        </div>

        {/* Already Have Code */}
        <button
          onClick={() => navigate('GatorAuth')}
          className="w-full mb-5 p-3.5 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-slate-200 hover:border-slate-300 flex items-center justify-between group"
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-slate-400 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-400"></div>
            </div>
            <span className="text-slate-700 text-sm">Already have an invite code?</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
        </button>

        {/* Request Invite Form */}
        <Card className="shadow-md border-0 bg-white rounded-2xl">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-5 text-center">
              Request Your Invite
            </h3>

            {/* User Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                I am a...
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setUserType('uf_alumni')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    userType === 'uf_alumni'
                      ? 'border-[#0021A5] bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-[#0021A5]" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 mb-1">UF Graduate</div>
                      <div className="text-sm text-slate-600">University of Florida Alumni</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setUserType('uf_parent')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    userType === 'uf_parent'
                      ? 'border-[#FA4616] bg-orange-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 text-[#FA4616]" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 mb-1">UF Family Member</div>
                      <div className="text-sm text-slate-600">Parent/Guardian of UF student or alum</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="John Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12"
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
              />
              <p className="text-xs text-slate-500 mt-1">
                We'll send your invite to this email
              </p>
            </div>

            {/* Why Join */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Why do you want to join? <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Tell us about your UF connection and how you'd like to help students find opportunities..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[100px]"
                maxLength={500}
              />
              <p className="text-xs text-slate-500 mt-1">
                Minimum 20 characters
              </p>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleRequestInvite}
              disabled={!userType || !fullName.trim() || !email.trim() || reason.trim().length < 20 || isSubmitting}
              className="w-full h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
              style={{ 
                backgroundColor: isSubmitting ? '#94a3b8' : '#6b7280',
                color: '#fff'
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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
            <p className="text-xs text-slate-500 text-center mt-4 flex items-start justify-center gap-2">
              <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Your information is secure and will only be used to process your invite request</span>
            </p>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600 mb-4">
            Join thousands of UF families helping Gators succeed
          </p>
          <div className="flex justify-center gap-8">
            <div>
              <div className="text-3xl font-bold text-[#FA4616]">4,000+</div>
              <div className="text-sm text-slate-600">Network Members</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#0021A5]">500+</div>
              <div className="text-sm text-slate-600">Job Placements</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}