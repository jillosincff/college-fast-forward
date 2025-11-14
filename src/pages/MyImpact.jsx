
import { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import EnhancedImpactTimeline from '@/components/impact/EnhancedImpactTimeline';

export default function MyImpact() {
  const { user, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('LandingPage');
    }
  }, [user, isLoading]);

  const handleBackToDashboard = () => {
    if (user?.persona === 'parent') {
      navigate('ParentDashboard');
    } else if (user?.persona === 'alumni') {
      navigate('AlumniDashboard');
    } else {
      navigate('Dashboard'); // Default for students
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin text-gator-orange"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <EnhancedImpactTimeline />

      {/* Back to Dashboard Button */}
      <div className="mt-6 text-center">
        <Button onClick={handleBackToDashboard} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
