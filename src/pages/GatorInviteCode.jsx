import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Lock, AlertCircle, Loader2 } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

export default function GatorInviteCode() {
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Get the pending role from localStorage (set by GatorAuth)
  const pendingRole = localStorage.getItem('pending_invite_role') || 'parent';

  const handleContinue = async () => {
    setError('');
    
    if (!inviteCode?.trim()) {
      setError('Please enter your invite code');
      return;
    }
    
    setIsVerifying(true);
    console.log('📝 Verifying invite code:', inviteCode.trim());
    
    try {
      // Verify the invite code first
      const response = await base44.functions.invoke('verifyInviteCode', {
        code: inviteCode.trim().toUpperCase()
      });
      
      if (response.data?.success) {
        // Store verified invite code and role
        const role = response.data.role || pendingRole || 'parent';
        localStorage.setItem('pending_invite_code', inviteCode.trim().toUpperCase());
        localStorage.setItem('pending_invite_role', role);
        
        // Navigate to GatorWelcome to complete setup
        navigate('GatorWelcome');
      } else {
        setError(response.data?.error || 'Invalid or expired invite code');
        setIsVerifying(false);
      }
    } catch (err) {
      console.error('Failed to verify invite code:', err);
      setError('Failed to verify code. Please try again.');
      setIsVerifying(false);
    }
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
              {pendingRole === 'alumni' ? 'Alumni access' : 'Parent access'} requires an invite code
            </p>
          </div>

          {/* Code Input */}
          <div className="space-y-4">
            <Input
              value={inviteCode}
              onChange={(e) => {
                setInviteCode(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder="ENTER YOUR CODE"
              className="text-center text-xl font-mono tracking-wider border-2 border-gray-200 focus:border-[#0021A5] rounded-xl py-6 uppercase"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
            />

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </motion.div>
            )}

            <button
              onClick={handleContinue}
              disabled={!inviteCode.trim() || isVerifying}
              className="w-full bg-gradient-to-r from-[#0021A5] to-[#003865] text-white rounded-xl py-4 text-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Continue →'
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have a code?{' '}
              <button
                onClick={() => navigate('RequestInvite')}
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