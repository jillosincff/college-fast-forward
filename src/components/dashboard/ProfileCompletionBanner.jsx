import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { trackEvent } from '@/components/utils/analytics';
import { UserCircle } from 'lucide-react';

export default function ProfileCompletionBanner() {
  const { user } = useAuth();
  const [missingFields, setMissingFields] = useState([]);
  const [completion, setCompletion] = useState(100);

  useEffect(() => {
    if (!user) return;

    const fieldsToCheck = {
      student: [
        { key: 'major', label: 'Major' },
        { key: 'graduation_year', label: 'Graduation Year' },
        { key: 'headline', label: 'Profile Headline' },
        { key: 'career_goals_summary', label: 'Career Goals' }
      ],
      alumni: [
        { key: 'current_position', label: 'Current Position' },
        { key: 'current_company', label: 'Company' },
        { key: 'industry', label: 'Industry' },
        { key: 'ways_to_help', label: 'Ways to Help' }
      ],
      parent: [
        { key: 'current_position', label: 'Current Position' },
        { key: 'industry', label: 'Industry' },
        { key: 'ways_to_help', label: 'Ways to Help' }
      ]
    };

    const relevantFields = fieldsToCheck[user.persona] || [];
    const missing = relevantFields.filter(field => !user[field.key] || (Array.isArray(user[field.key]) && user[field.key].length === 0));
    
    setMissingFields(missing);

    if (relevantFields.length > 0) {
      const completedCount = relevantFields.length - missing.length;
      setCompletion(Math.round((completedCount / relevantFields.length) * 100));
    } else {
      setCompletion(100);
    }
  }, [user]);

  const handleUpdateProfile = () => {
    trackEvent('profile_completion_banner_clicked', { 
      currentScore: completion,
      missingFieldsCount: missingFields.length 
    });
    navigate('ProfileEdit');
  };

  if (completion === 100 || !user || user.onboarding_completed === false) {
    return null;
  }

  const getBannerMessage = () => {
    if (missingFields.length > 0) {
      const firstMissing = missingFields[0].label;
      return `Add your ${firstMissing} to get better matches and connect with more Gators!`;
    }
    return 'Complete your profile to unlock better connections.';
  };

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mx-4 mt-4 rounded-r-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-grow">
          <div className="flex-shrink-0">
            <UserCircle className="text-blue-400 w-6 h-6" />
          </div>
          <div className="flex-grow">
            <p className="text-sm font-medium text-blue-800">
              Complete Your Profile ({completion}%)
            </p>
            <p className="text-sm text-blue-600">
              {getBannerMessage()}
            </p>
          </div>
        </div>
        <Button onClick={handleUpdateProfile} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors ml-4">
          Update Profile
        </Button>
      </div>
      <div className="mt-3">
        <Progress value={completion} className="h-2 [&>div]:bg-blue-600" />
      </div>
    </div>
  );
}