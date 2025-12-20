import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Key, Check, AlertCircle } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import { toast } from 'sonner';

export default function EnterCodeForm({ onSuccess, onCancel }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('Please enter an invite code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await base44.functions.invoke('verifyInviteCode', {
        code: code.trim().toUpperCase()
      });

      if (response.data?.success) {
        setVerified(true);
        setVerifyResult(response.data);
        
        // Store the role from the invite in localStorage
        const assignedRole = response.data.role || 'parent';
        localStorage.setItem('pending_invite_role', assignedRole);
        localStorage.setItem('pending_invite_code', code.trim().toUpperCase());
        
        console.log('✅ Invite verified, role:', assignedRole);
        toast.success(`Code verified! You'll join as ${assignedRole === 'alumni' ? 'an Alumni' : 'a Parent'}`);
        
        if (onSuccess) onSuccess(response.data);
      } else {
        setError(response.data?.error || 'Invalid invite code');
      }
    } catch (error) {
      console.error('Failed to verify code:', error);
      setError('Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    // Navigate to Google sign-in
    navigate('GatorAuth');
  };

  if (verified) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Code Verified!</h3>
        <p className="text-slate-600 mb-2">
          Welcome! You'll be joining as {verifyResult?.role === 'alumni' ? 'an Alumni' : 'a Parent'}.
        </p>
        {verifyResult?.inviter_name && (
          <p className="text-sm text-slate-500 mb-4">
            Invited by: {verifyResult.inviter_name}
          </p>
        )}
        <Button
          onClick={handleContinue}
          className="w-full bg-[#0021A5] hover:bg-blue-800"
        >
          Continue with Google Sign-In
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleVerify} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Enter your invite code
        </label>
        <div className="relative">
          <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="XXXX-XXXXXX"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError('');
            }}
            className="pl-10 text-center font-mono text-lg tracking-wider uppercase"
            maxLength={12}
          />
        </div>
        {error && (
          <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading || !code.trim()}
          className="flex-1 bg-[#0021A5] hover:bg-blue-800"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify Code'
          )}
        </Button>
      </div>

      <p className="text-xs text-slate-500 text-center">
        Don't have a code? Request one above or sign in with your @ufl.edu email.
      </p>
    </form>
  );
}