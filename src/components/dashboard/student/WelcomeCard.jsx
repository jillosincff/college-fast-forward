import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ArrowRight } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import { trackEvent } from '@/components/utils/analytics';

export default function WelcomeCard({ user }) {
  const handleGetStarted = () => {
    trackEvent('welcome_card_get_started');
    navigate('PostRequest');
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <h3 className="text-lg font-semibold text-gray-900">
                Welcome to College Fast Forward, {user.full_name?.split(' ')[0] || 'Gator'}!
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              You're now connected to a powerful network of UF alumni and parents who want to help you succeed. 
              Ready to tap into the Gator community?
            </p>
            <Button onClick={handleGetStarted} className="bg-blue-600 hover:bg-blue-700">
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <div className="text-4xl ml-4">
            🐊
          </div>
        </div>
      </CardContent>
    </Card>
  );
}