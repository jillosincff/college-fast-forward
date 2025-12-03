import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function CleanAuthModal({ isOpen, onClose }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = () => {
    setIsLoading(true);
    // Redirect to login - base44 handles Google/Facebook OAuth
    base44.auth.redirectToLogin(window.location.origin + '/#Dashboard');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-white border-0 shadow-2xl">
        <div className="bg-gradient-to-r from-[#0021A5] to-[#FA4616] p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Welcome to College Fast Forward
            </DialogTitle>
            <p className="text-center text-blue-100 mt-2">
              Your gateway to the Gator professional network
            </p>
          </DialogHeader>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {/* Sign In Button */}
            <Button 
              onClick={handleSignIn}
              className="w-full bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white py-6 text-lg font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Redirecting...' : '🐊 Join / Sign In'}
            </Button>

            {/* UF Student Callout */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-800">
                <strong>🎓 UF Students:</strong> Sign in with your @ufl.edu email for instant access!
              </p>
            </div>

            {/* Alumni/Parents Note */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <p className="text-sm text-orange-800">
                <strong>Alumni & Parents:</strong> You'll need an invite code after signing in.
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}