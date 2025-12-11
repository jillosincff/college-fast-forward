import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Lock, Shield, CheckCircle, Users, Heart, ArrowRight, ChevronDown, Info, Network, GraduationCap, Handshake, TrendingUp, Briefcase, Star, Loader2 } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import { trackEvent } from '@/components/utils/analytics';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import baffle from 'baffle';

export default function GatorParentInvite() {
  const { toast } = useToast();
  const [userType, setUserType] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [networkCount, setNetworkCount] = useState(0);
  const [jobCount, setJobCount] = useState(0);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const codeInputRef = useRef(null);

  // Counting animation for stats
  useEffect(() => {
    const animateCount = (target, setter, duration = 2000) => {
      const start = 0;
      const increment = target / (duration / 16);
      let current = start;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(Math.floor(current));
        }
      }, 16);
      
      return () => clearInterval(timer);
    };
    
    const cleanup1 = animateCount(4000, setNetworkCount);
    const cleanup2 = animateCount(500, setJobCount, 1800);
    
    return () => {
      cleanup1();
      cleanup2();
    };
  }, []);

  // Baffle animation for invite code input
  useEffect(() => {
    if (showCodeInput && codeInputRef.current) {
      const b = baffle(codeInputRef.current, {
        characters: '█▓▒░ <░▒▓█>',
        speed: 100
      });
      b.start().reveal(200);
    }
  }, [showCodeInput]);

  const handleRequestInvite = async () => {
    if (!userType || !fullName.trim() || !email.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields to request an invite.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    trackEvent('parent_invite_request_submitted', { userType });

    try {
      const inviteRequest = await base44.entities.InviteRequest.create({
        email: email.trim(),
        full_name: fullName.trim(),
        user_type: userType,
        reason: reason.trim(),
        status: 'pending'
      });

      // Notify admin(s)
      try {
        const allUsers = await base44.entities.User.list();
        const admins = allUsers.filter(u => u.roles?.includes('admin') || u.role === 'admin');
        
        for (const admin of admins) {
          await base44.entities.Notification.create({
            recipient_email: admin.email,
            type: 'application_received',
            title: '🆕 New Invite Request',
            message: `${fullName.trim()} (${email.trim()}) requested to join as ${userType === 'uf_alumni' ? 'UF Graduate' : 'UF Family Member'}`,
            action_url: 'AdminDashboard',
            action_label: 'Review Request',
            priority: 'high'
          });
        }
      } catch (notifError) {
        console.error('Failed to notify admin:', notifError);
      }

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-blue-50/30 py-12 px-4">
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 33, 165, 0.3); }
          50% { box-shadow: 0 0 40px rgba(0, 33, 165, 0.6); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .gradient-text {
          background: linear-gradient(135deg, #FF6900 0%, #0021A5 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
      
      <div className="max-w-xl mx-auto">
        {/* Enhanced Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center shadow-2xl animate-float" style={{ background: 'linear-gradient(135deg, #0021A5 0%, #1a4d9e 100%)' }}>
            <Lock className="w-9 h-9 text-white absolute" strokeWidth={2.5} />
            <div className="w-6 h-6 bg-[#FF6900] rounded-full absolute -bottom-1 -right-1 flex items-center justify-center border-4 border-white">
              <Shield className="w-3 h-3 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-extrabold mb-2 gradient-text">
            UF Gator Network
          </h1>
          <p className="text-lg text-slate-700 font-medium" style={{ color: '#FF6900' }}>
            Where Gators connect for careers ✨
          </p>
        </motion.div>

        {/* Enhanced Hero Section */}
        <motion.div 
          className="rounded-3xl p-10 text-center mb-6 shadow-2xl relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0021A5 0%, #1a3d7c 50%, #0021A5 100%)' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-orange-400 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Shield className="w-16 h-16 text-white mx-auto mb-5 drop-shadow-lg" strokeWidth={2} />
            </motion.div>
            
            <h2 className="text-3xl font-extrabold text-white mb-4 leading-tight">
              Join the UF Gator<br />Family Network
            </h2>
            
            <p className="text-base text-blue-100 mb-6 max-w-md mx-auto leading-relaxed">
              Connect with <span className="font-bold text-white">4,000+ UF Gators, Alumni & Families</span> to help students launch careers through warm introductions
            </p>
            
            <div className="flex flex-col gap-3 max-w-sm mx-auto">
              <motion.div 
                className="flex items-center gap-3 text-white bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/20 transition-all"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-10 h-10 rounded-full bg-[#FF6900] flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm">Invite Only</div>
                  <div className="text-xs text-blue-200">Exclusive, verified community</div>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-3 text-white bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/20 transition-all"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-10 h-10 rounded-full bg-[#FF6900] flex items-center justify-center flex-shrink-0">
                  <Network className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm">Exclusive Network</div>
                  <div className="text-xs text-blue-200">Connect with top professionals</div>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-3 text-white bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/20 transition-all"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-10 h-10 rounded-full bg-[#FF6900] flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm">Help Gators</div>
                  <div className="text-xs text-blue-200">Make a real impact on careers</div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
        
        {/* Member Avatars & Trust Bar */}
        <motion.div 
          className="mb-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex justify-center items-center mb-3">
            <div className="flex -space-x-3">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className="w-10 h-10 rounded-full border-3 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs"
                  style={{ 
                    background: i % 2 === 0 ? '#0021A5' : '#FF6900',
                    zIndex: 5 - i
                  }}
                >
                  {['JD', 'SM', 'AL', 'KP', 'TR'][i]}
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-slate-600 font-medium">
            Join <span className="font-bold text-[#0021A5]">fellow Gators</span> building careers together
          </p>
        </motion.div>

        {/* Already Have Code - Collapsible */}
        <motion.div 
          className="mb-6 bg-white rounded-xl shadow-lg border-2 border-slate-200 overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={() => setShowCodeInput(!showCodeInput)}
            className="w-full p-4 flex items-center justify-between group hover:bg-gradient-to-r hover:from-orange-50 hover:to-blue-50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF6900] to-[#ff8c3a] flex items-center justify-center">
                <Info className="w-5 h-5 text-white" />
              </div>
              <span className="text-slate-800 text-base font-semibold">Already have an invite code?</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${showCodeInput ? 'rotate-180' : ''}`} />
          </button>
          
          {showCodeInput && (
            <motion.div 
              className="p-5 border-t-2 border-slate-200 bg-gradient-to-br from-orange-50 to-blue-50"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="relative">
                <Input
                  ref={codeInputRef}
                  type="text"
                  placeholder="ENTER CODE"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="h-14 text-center text-xl font-bold border-3 border-[#FF6900] focus:border-[#0021A5] focus:ring-4 focus:ring-blue-100 mb-4 shadow-lg tracking-widest"
                  maxLength={20}
                />
              </div>
              <Button
                onClick={async () => {
                  if (inviteCode.trim()) {
                    setIsVerifyingCode(true);
                    sessionStorage.setItem('pending_invite_code', inviteCode.trim());
                    sessionStorage.setItem('pending_invite_role', 'parent');
                    
                    // Small delay for UX
                    await new Promise(resolve => setTimeout(resolve, 500));
                    navigate('GatorAuth');
                  } else {
                    toast({
                      title: "Code Required",
                      description: "Please enter your invite code",
                      variant: "destructive"
                    });
                  }
                }}
                disabled={!inviteCode.trim() || isVerifyingCode}
                className="w-full h-14 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                style={{ 
                  background: (!inviteCode.trim() || isVerifyingCode)
                    ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                    : 'linear-gradient(135deg, #FF6900 0%, #ff8c3a 100%)',
                  color: 'white'
                }}
              >
                {isVerifyingCode ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Continue with Code
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </motion.div>
        
        {/* Testimonial */}
        <motion.div 
          className="mb-6 bg-white rounded-xl shadow-lg p-5 border-l-4 border-[#FF6900]"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0021A5] to-[#1a4d9e] flex items-center justify-center flex-shrink-0">
              <Star className="w-6 h-6 text-[#FF6900] fill-[#FF6900]" />
            </div>
            <div>
              <p className="text-sm text-slate-700 italic mb-2 leading-relaxed">
                "Within 2 weeks of joining, I connected my daughter with 3 alumni in her field. She landed her dream internship!"
              </p>
              <p className="text-xs font-semibold text-[#0021A5]">
                — Sarah M., UF Parent, Class of 2022
              </p>
            </div>
          </div>
        </motion.div>

        {/* Request Invite Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="shadow-2xl border-0 bg-white rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <h3 className="text-2xl font-extrabold text-slate-900 mb-6 text-center gradient-text">
                Request Your Invite
              </h3>

            {/* User Type Selection - Enhanced Cards */}
            <div className="mb-6">
              <label className="block text-base font-bold text-slate-800 mb-3">
                I am a...
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.button
                  onClick={() => setUserType('uf_alumni')}
                  className={`p-5 rounded-2xl border-3 transition-all text-left relative overflow-hidden ${
                    userType === 'uf_alumni'
                      ? 'border-[#0021A5] bg-gradient-to-br from-blue-50 to-blue-100 shadow-xl'
                      : 'border-slate-200 hover:border-[#FF6900] bg-white hover:shadow-lg'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {userType === 'uf_alumni' && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="w-6 h-6 text-[#0021A5] fill-[#0021A5]" />
                    </div>
                  )}
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      userType === 'uf_alumni' 
                        ? 'bg-[#0021A5]' 
                        : 'bg-blue-100'
                    }`}>
                      <GraduationCap className={`w-7 h-7 ${
                        userType === 'uf_alumni' ? 'text-white' : 'text-[#0021A5]'
                      }`} />
                    </div>
                    <div>
                      <div className="font-bold text-base text-slate-900">UF Graduate</div>
                      <div className="text-sm text-slate-600 mt-1">University of Florida alum</div>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => setUserType('uf_parent')}
                  className={`p-5 rounded-2xl border-3 transition-all text-left relative overflow-hidden ${
                    userType === 'uf_parent'
                      ? 'border-[#FF6900] bg-gradient-to-br from-orange-50 to-orange-100 shadow-xl'
                      : 'border-slate-200 hover:border-[#0021A5] bg-white hover:shadow-lg'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {userType === 'uf_parent' && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="w-6 h-6 text-[#FF6900] fill-[#FF6900]" />
                    </div>
                  )}
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      userType === 'uf_parent' 
                        ? 'bg-[#FF6900]' 
                        : 'bg-orange-100'
                    }`}>
                      <Heart className={`w-7 h-7 ${
                        userType === 'uf_parent' ? 'text-white' : 'text-[#FF6900]'
                      }`} />
                    </div>
                    <div>
                      <div className="font-bold text-base text-slate-900">UF Family Member</div>
                      <div className="text-sm text-slate-600 mt-1">Parent/Guardian of UF student or alum</div>
                    </div>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Full Name */}
            <div className="mb-5">
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12 text-base border-2 border-slate-300 focus:border-[#0021A5] focus:ring-4 focus:ring-blue-100 rounded-xl shadow-sm"
              />
            </div>

            {/* Email */}
            <div className="mb-5">
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base border-2 border-slate-300 focus:border-[#0021A5] focus:ring-4 focus:ring-blue-100 rounded-xl shadow-sm"
              />
              <p className="text-xs text-slate-600 mt-2 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                We'll send your invite to this email
              </p>
            </div>

            {/* Why Join */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Why do you want to join? <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              <Textarea
                placeholder="Share your UF story and how you'd like to help current Gators succeed..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[110px] text-base border-2 border-slate-300 focus:border-[#0021A5] focus:ring-4 focus:ring-blue-100 rounded-xl shadow-sm leading-relaxed"
                maxLength={500}
              />
              <p className="text-xs text-slate-500 mt-1.5 text-right">{reason.length}/500</p>
            </div>

            {/* Submit Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleRequestInvite}
                disabled={!userType || !fullName.trim() || !email.trim() || isSubmitting}
                className="w-full h-14 text-lg font-bold shadow-xl hover:shadow-2xl transition-all rounded-xl"
                style={{ 
                  background: (!userType || !fullName.trim() || !email.trim() || isSubmitting) 
                    ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                    : 'linear-gradient(135deg, #FF6900 0%, #ff8c3a 50%, #0021A5 100%)',
                  color: '#fff'
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Request Invite
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>

            {/* Privacy Note */}
            <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-600 text-center flex items-center justify-center gap-2">
                <Shield className="w-4 h-4 flex-shrink-0 text-[#0021A5]" />
                <span className="leading-relaxed">Your information is <span className="font-bold">secure</span> and will only be used to process your invite request</span>
              </p>
            </div>
          </CardContent>
        </Card>
        </motion.div>

        {/* Enhanced Stats Section */}
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <p className="text-lg text-slate-700 mb-6 font-semibold">
            Join <span className="text-[#0021A5]">thousands of UF families</span> helping Gators succeed
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <motion.div 
              className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-100 hover:border-[#FF6900] transition-all"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6900] to-[#ff8c3a] flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-5xl font-extrabold mb-2" style={{ color: '#FF6900' }}>
                {networkCount.toLocaleString()}+
              </div>
              <div className="text-sm text-slate-600 font-medium">Active Network Members</div>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-100 hover:border-[#0021A5] transition-all"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0021A5] to-[#1a4d9e] flex items-center justify-center mx-auto mb-3">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div className="text-5xl font-extrabold mb-2" style={{ color: '#0021A5' }}>
                {jobCount.toLocaleString()}+
              </div>
              <div className="text-sm text-slate-600 font-medium">Successful Job Connections</div>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-100 hover:border-[#FF6900] transition-all"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center mx-auto mb-3">
                <Handshake className="w-6 h-6 text-white" />
              </div>
              <div className="text-5xl font-extrabold mb-2" style={{ color: '#FFD700' }}>
                100+
              </div>
              <div className="text-sm text-slate-600 font-medium">Companies Hiring</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}