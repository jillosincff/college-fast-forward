import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { LinkedinIcon, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AlumniSelfVerifyModal({ isOpen, onClose, onVerified }) {
  const { toast } = useToast();
  const [hasVerified, setHasVerified] = useState(false);

  const alumniToolURL = "https://www.linkedin.com/school/university-of-florida/people/";

  const handleOpenLinkedIn = () => {
    window.open(alumniToolURL, '_blank');
    toast({
      title: "LinkedIn Opened",
      description: "Look for your name in the UF alumni directory",
    });
  };

  const handleConfirmVerification = () => {
    setHasVerified(true);
    toast({
      title: "✅ Verified! +50 Points",
      description: "Welcome to the Gator alumni network!",
    });
    
    setTimeout(() => {
      onVerified();
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <LinkedinIcon className="w-6 h-6 text-blue-600" />
            Verify UF Alumni Status
          </DialogTitle>
          <DialogDescription>
            Confirm you're in UF's official LinkedIn alumni directory
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              This takes 30 seconds. You'll verify via LinkedIn's public UF alumni directory - no login required!
            </AlertDescription>
          </Alert>

          <Card className="border-2 border-blue-200">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Open UF Alumni Directory</p>
                    <p className="text-sm text-slate-600 mt-1">Click below to view UF's verified alumni on LinkedIn</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Search for Your Name</p>
                    <p className="text-sm text-slate-600 mt-1">Use LinkedIn's search to find yourself in the directory</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Come Back & Confirm</p>
                    <p className="text-sm text-slate-600 mt-1">Once you find yourself, click "I Found Myself" below</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleOpenLinkedIn}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open UF Alumni Directory
              </Button>
            </CardContent>
          </Card>

          {!hasVerified ? (
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="pt-6">
                <p className="text-sm text-orange-900 mb-4">
                  <strong>Found yourself in the directory?</strong> Click below to confirm and join the network!
                </p>
                <Button
                  onClick={handleConfirmVerification}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  size="lg"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  I Found Myself - Continue
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900 font-semibold">
                Verified! Welcome to the Gator alumni network 🐊
              </AlertDescription>
            </Alert>
          )}

          <div className="text-center">
            <p className="text-xs text-slate-500">
              💡 Can't find yourself? Make sure "University of Florida" is listed in your LinkedIn Education section
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}