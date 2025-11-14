// Email verification enforcement component
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Shield } from 'lucide-react';

export const EmailVerificationGate = ({ children, allowReadOnly = false }) => {
  const { user } = useAuth();

  // Allow access if user is verified or if read-only access is permitted for unverified users
  if (!user) {
    return allowReadOnly ? children : null;
  }

  if (user.email_verified !== false) {
    return children; // email_verified is true or undefined (legacy users)
  }

  // Show verification required message
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-xl">Verify Your Email</CardTitle>
          <CardDescription>
            Please verify your email address to access all features and ensure account security.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800">
              <Shield className="w-4 h-4" />
              <span className="font-semibold text-sm">Security Notice</span>
            </div>
            <p className="text-blue-700 text-sm mt-1">
              Email verification helps protect your account and enables important notifications.
            </p>
          </div>
          
          <Button 
            onClick={() => window.location.reload()} // Refresh to check verification status
            className="w-full"
          >
            I've Verified My Email
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => {/* TODO: Resend verification email */}}
            className="w-full"
          >
            Resend Verification Email
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};