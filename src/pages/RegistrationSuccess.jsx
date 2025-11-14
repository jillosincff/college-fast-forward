import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { navigate, useParams } from '@/components/utils/navigation';
import { toast } from '@/components/ui/use-toast';
import { resendVerificationEmail } from "@/functions/resendVerificationEmail";

export default function RegistrationSuccess() {
  const params = useParams();
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    // FIX: read email from our hash router params (not window.location.search)
    if (params?.email) {
      setEmail(params.email);
    }
  }, [params.email]); // Add params.email to dependency array

  const handleContinue = () => {
    navigate('Dashboard');
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "We couldn't determine your email. Please sign up again.", // Updated description
        variant: "destructive",
      });
      return;
    }
    
    setIsResending(true);
    try {
      const { data } = await resendVerificationEmail({ email }); // Destructure data only
      if (!data?.success) { // Updated success check
        throw new Error(data?.error || "Failed to resend verification email."); // Updated error message access
      }
      toast({
        title: "Verification Email Sent!",
        description: "Please check your inbox for the verification link.",
        // Removed variant: "success" as per outline
      });
    } catch (error) {
      toast({
        title: "Failed to Resend",
        description: `Error: ${error.message}. Please try again or contact support.`,
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            Registration Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <Mail className="h-8 w-8 text-blue-600 mx-auto" />
            <p className="text-gray-600">
              We've sent a verification email to:
            </p>
            <p className="font-semibold text-gray-900 break-all">
              {email || 'your email address'}
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Please check your inbox and click the verification link to activate your account.
            </p>
            <p className="text-xs text-gray-400">
              Don't forget to check your spam folder!
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <Button 
              onClick={handleResendVerification} 
              variant="outline" 
              className="w-full"
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resending...
                </>
              ) : (
                'Resend Verification Email'
              )}
            </Button>
            
            <Button onClick={handleContinue} className="w-full">
              Continue to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              Having trouble? Contact us at support@collegefastforward.com
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Public confirmation page
RegistrationSuccess.isPublic = true;