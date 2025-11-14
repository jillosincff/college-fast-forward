import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck } from 'lucide-react';

export default function ParentPrivacyBanner() {
  return (
    <Alert className="bg-blue-50 border-blue-200 text-blue-800">
      <ShieldCheck className="h-5 w-5 text-blue-600" />
      <AlertTitle className="font-bold">For Your Privacy</AlertTitle>
      <AlertDescription className="text-blue-700">
        Only verified UF community members can view your posts or contact you. Your information is safe with us.
      </AlertDescription>
    </Alert>
  );
}