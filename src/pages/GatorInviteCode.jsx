import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

export default function GatorInviteCode() {
  const [referralCode, setReferralCode] = useState('');
  const [showReferralInput, setShowReferralInput] = useState(false);

  const handleContinue = () => {
    // Store referral code and role
    if (referralCode?.trim()) {
      sessionStorage.setItem('pending_referral_code', referralCode.trim());
      console.log('🎟️ Stored referral code:', referralCode.trim());
    }
    sessionStorage.setItem('pending_invite_role', 'gator');
    
    // Redirect to Google OAuth
    base44.auth.redirectToLogin(window.location.origin);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #FDF8F3 0%, #FEFCFA 100%)' }}>
      {/* Decorative background elements */}
      <div 
        className="absolute top-0 right-0 w-1/2 h-1/2 opacity-10 pointer-events-none" 
        style={{ 
          background: 'radial-gradient(circle, rgba(250, 70, 22, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 20s ease-in-out infinite'
        }} 
      />
      <div 
        className="absolute bottom-0 left-0 w-3/4 h-3/4 opacity-10 pointer-events-none" 
        style={{ 
          background: 'radial-gradient(circle, rgba(0, 33, 165, 0.05) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 25s ease-in-out infinite reverse'
        }} 
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/80">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif", color: '#003865', letterSpacing: '-0.02em' }}>
              UF Gator Network
            </h1>
            <p className="text-xl text-gray-600 font-medium">
              Where Gators connect for careers
            </p>
          </div>

          {/* Auth Section */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2" style={{ color: '#003865' }}>
                Sign in with your @ufl.edu email
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Your data is secure. We only use this to verify you're a UF student.
              </p>
            </div>

            {/* Referral Code Section */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowReferralInput(!showReferralInput)}
                className="inline-flex items-center gap-2 text-gray-700 font-medium hover:bg-gray-50 rounded-lg px-4 py-2 transition-all"
              >
                Have a referral code?
                <div 
                  className={`w-6 h-6 border-2 border-gray-400 rounded-full flex items-center justify-center text-xs font-bold transition-all ${showReferralInput ? 'rotate-45 bg-gray-400 text-white border-gray-400' : 'bg-gray-50 text-gray-600'}`}
                >
                  <Plus className="w-4 h-4" />
                </div>
              </button>
              
              {showReferralInput && (
                <motion.div
                  initial={{ opacity: 0, maxHeight: 0 }}
                  animate={{ opacity: 1, maxHeight: 100 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4"
                >
                  <Input
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="Enter your friend's referral code"
                    className="text-center text-lg border-2 border-gray-200 focus:border-gray-400 rounded-xl py-6 bg-[#FEFCFA]"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    We'll make sure your friend gets credit for referring you!
                  </p>
                </motion.div>
              )}
            </div>

            {/* Google Button */}
            <button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-[#0021A5] to-[#003865] text-white rounded-2xl py-4 text-lg font-semibold hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              <span>Continue with Google</span>
              <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-20px, -30px) rotate(2deg); }
          66% { transform: translate(20px, -20px) rotate(-1deg); }
        }
      `}</style>
    </div>
  );
}