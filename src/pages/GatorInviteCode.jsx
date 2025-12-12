import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

export default function GatorInviteCode() {
  const [inviteCode, setInviteCode] = useState('');

  const handleContinue = () => {
    if (!inviteCode?.trim()) {
      alert('Please enter your invite code');
      return;
    }
    
    // Store invite code
    sessionStorage.setItem('pending_invite_code', inviteCode.trim());
    sessionStorage.setItem('pending_invite_role', 'gator');
    
    // Redirect to Google OAuth
    base44.auth.redirectToLogin(window.location.origin);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #FDF8F3 0%, #FEFCFA 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
          {/* Lock Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-blue-100 rounded-2xl flex items-center justify-center">
              <Lock className="w-8 h-8 text-[#0021A5]" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#0021A5' }}>
              Enter Your Invite Code
            </h1>
            <p className="text-gray-600">
              College Fast Forward is invite-only
            </p>
          </div>

          {/* Code Input */}
          <div className="space-y-4">
            <Input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="ENTER YOUR CODE"
              className="text-center text-xl font-mono tracking-wider border-2 border-gray-200 focus:border-[#0021A5] rounded-xl py-6 uppercase"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
            />

            <button
              onClick={handleContinue}
              disabled={!inviteCode.trim()}
              className="w-full bg-gradient-to-r from-[#0021A5] to-[#003865] text-white rounded-xl py-4 text-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have a code?{' '}
              <button
                onClick={() => window.location.href = '/#RequestInvite'}
                className="text-[#FA4616] hover:underline font-medium"
              >
                Request one
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}