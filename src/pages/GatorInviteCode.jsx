import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Lock, AlertCircle, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import { useAuth } from '@/components/auth/AuthContext';

export default function GatorInviteCode() {
  const { user } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCheckingApproval, setIsCheckingApproval] = useState(true);
  const [approvedInvite, setApprovedInvite] = useState(null);
  
  // Get the pending role from localStorage (set by GatorAuth)
  const pendingRole = localStorage.getItem('pending_invite_role') || 'parent';

  // Check if user has an approved invite request (auto-fill their code)
  useEffect(() => {
    const checkApprovedInvite = async () => {
      // Need user email to check
      const emailToCheck = user?.email;
      if (!emailToCheck) {
        setIsCheckingApproval(false);
        return;
      }

      try {
        console.log('🔍 Checking for approved invite for:', emailToCheck);
        const response = await base44.functions.invoke('checkApprovedInvite', {
          email: emailToCheck
        });

        if (response.data?.success && response.data?.has_approved_invite && response.data?.code_valid) {
          console.log('✅ Found valid approved invite:', response.data.invite_code);
          setApprovedInvite(response.data);
          setInviteCode(response.data.invite_code);
        } else if (response.data?.has_approved_invite && !response.data?.code_valid) {
          console.log('⚠️ Approved invite but code invalid:', response.data.message);
          // Don't set error - just let them request a new code
        }
      } catch (err) {
        console.error('Failed to check approved invite:', err);
        // Don't block - just let them enter code manually
      } finally {
        setIsCheckingApproval(false);
      }
    };

    checkApprovedInvite();
  }, [user?.email]);

  // Check for expired pending invite on mount
  useEffect(() => {
    const storedTimestamp = localStorage.getItem('pending_invite_timestamp');
    
    // Clear if older than 30 minutes
    if (storedTimestamp && Date.now() - parseInt(storedTimestamp) > 30 * 60 * 1000) {
      clearPendingInvite();
    }
  }, []);

  function clearPendingInvite() {
    localStorage.removeItem('pending_invite_code');
    localStorage.removeItem('pending_invite_timestamp');
    localStorage.removeItem('pending_invite_role');
    localStorage.removeItem('pending_invite_code_id');
  }

  function handleBack() {
    clearPendingInvite();
    navigate('GatorAuth');
  }

  const handleContinue = async () => {
    setError('');
    
    const trimmedCode = inviteCode?.trim().toUpperCase();
    
    if (!trimmedCode) {
      setError('Please enter your invite code');
      return;
    }

    if (trimmedCode.length < 4) {
      setError('Invite codes are at least 4 characters');
      return;
    }
    
    setIsVerifying(true);
    console.log('📝 Verifying invite code:', trimmedCode);
    
    try {
      // Verify the invite code first
      console.log('📞 Calling verifyInviteCode function...');
      const response = await base44.functions.invoke('verifyInviteCode', {
        code: trimmedCode
      });
      
      console.log('📬 verifyInviteCode response:', response);
      
      if (response.data?.success) {
        // Store verified invite code with timestamp
        const role = response.data.role || pendingRole || 'parent';
        console.log('✅ Code verified, role:', role);
        
        localStorage.setItem('pending_invite_code', trimmedCode);
        localStorage.setItem('pending_invite_role', role);
        localStorage.setItem('pending_invite_timestamp', Date.now().toString());
        
        // Store code ID for later use
        if (response.data.codeId) {
          localStorage.setItem('pending_invite_code_id', response.data.codeId);
        }
        
        // Navigate to GatorWelcome to complete setup
        navigate('GatorWelcome');
      } else {
        const errorMsg = response.data?.error || 'Invalid invite code. Please check and try again.';
        console.error('❌ Code verification failed:', errorMsg);
        setError(errorMsg);
        setIsVerifying(false);
      }
    } catch (err) {
      console.error('Failed to verify invite code:', err);
      console.error('Error details:', err.message, err.response?.data);
      
      // More specific error message based on error type
      let errorMsg = 'Unable to verify code. Please check your connection and try again.';
      if (err.message?.includes('500') || err.message?.includes('Internal')) {
        errorMsg = 'Server error verifying code. Please try again in a moment.';
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        errorMsg = 'Network error. Please check your connection and try again.';
      }
      
      setError(errorMsg);
      setIsVerifying(false);
    }
  };

  const roleLabel = pendingRole === 'alumni' ? 'Alumni' : 'Parent';
  const roleEmoji = pendingRole === 'alumni' ? '🎓' : '👨‍👩‍👧';

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ 
      background: 'linear-gradient(135deg, #0021A5 0%, #001580 100%)' 
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Back Button */}
        <button 
          onClick={handleBack}
          className="mb-4 text-white/70 hover:text-white text-sm flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to role selection
        </button>

        <div className="bg-white rounded-2xl p-8 shadow-xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-blue-100 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">{roleEmoji}</span>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2 text-slate-800">
              {roleLabel} Invite Code
            </h1>
            <p className="text-gray-600">
              Enter your invite code to join Gator Network
            </p>
          </div>

          {/* Auto-detected approved invite banner */}
          {approvedInvite && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-800">
                    Good news! Your access was already approved 🎉
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    We found your invite code. Just click "Continue" below!
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Code Input */}
          <div className="space-y-4">
            <Input
              value={inviteCode}
              onChange={(e) => {
                setInviteCode(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder="ENTER CODE"
              className="text-center text-xl font-mono tracking-wider border-2 border-gray-200 focus:border-[#0021A5] rounded-xl py-6 uppercase"
              autoFocus
              maxLength={20}
              onKeyDown={(e) => e.key === 'Enter' && !isVerifying && handleContinue()}
            />

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}

            <button
              onClick={handleContinue}
              disabled={!inviteCode.trim() || isVerifying}
              className="w-full bg-[#0021A5] hover:bg-[#001580] text-white rounded-xl py-4 text-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="px-3 text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Request Access */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-3">
              Don't have an invite code?
            </p>
            <button
              onClick={() => navigate('RequestInvite')}
              className="text-[#FA4616] hover:text-orange-700 font-semibold text-sm transition-colors"
            >
              Request Access →
            </button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-gray-400 text-center mt-6">
            Invite codes are sent by email when your access is approved
          </p>
        </div>
      </motion.div>
    </div>
  );
}