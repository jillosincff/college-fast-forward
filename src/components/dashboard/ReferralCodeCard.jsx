import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Copy, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ReferralCodeCard({ user }) {
  const [code, setCode] = useState(user?.my_referral_code || null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If user doesn't have a code, generate one
    if (user && !user.my_referral_code && !loading) {
      generateCode();
    }
  }, [user]);

  const generateCode = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateUserReferralCode', {});
      if (response.data?.success && response.data?.code) {
        setCode(response.data.code);
      }
    } catch (err) {
      console.error('Failed to generate referral code:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!code && !loading) {
    return null;
  }

  return (
    <Card className="border-2 border-dashed border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <Gift className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">🎁 Invite Friends</h3>
            <p className="text-xs text-slate-600">Share your code to grow the network!</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white border-2 border-orange-200 rounded-lg px-4 py-2">
            {loading ? (
              <span className="text-slate-400">Generating...</span>
            ) : (
              <code className="font-mono font-bold text-orange-700">{code}</code>
            )}
          </div>
          <Button 
            onClick={handleCopy}
            disabled={!code || loading}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}