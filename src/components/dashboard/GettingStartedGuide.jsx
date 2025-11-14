import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, ArrowRight, Users, Briefcase, User, Home } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';

export default function GettingStartedGuide({ 
  hasPostedRequest, 
  hasBrowsedOpportunities, 
  hasVisitedRoommates,
  onBrowseOpportunities,
  onVisitRoommates 
}) {
  const { user } = useAuth();

  const steps = [
    {
      id: 'profile',
      title: 'Complete your profile',
      description: 'Add your major, graduation year, and goals',
      icon: User,
      action: () => navigate('Profile'),
      actionText: 'Edit Profile',
      completed: !!(user?.major && user?.graduation_year)
    },
    {
      id: 'request',
      title: 'Post your first request',
      description: 'Ask for help with internships, jobs, or advice',
      icon: Briefcase,
      action: () => navigate('PostRequest'),
      actionText: 'Post Request',
      completed: hasPostedRequest
    },
    {
      id: 'browse',
      title: 'Explore opportunities',
      description: 'Browse job postings from alumni and parents',
      icon: Users,
      action: () => {
        if (onBrowseOpportunities) {
          onBrowseOpportunities();
        }
        navigate('Opportunities');
      },
      actionText: 'Browse Jobs',
      completed: hasBrowsedOpportunities
    },
    {
      id: 'roommates',
      title: 'Find Roommates',
      description: 'Find your ideal post-grad roommate and living arrangements',
      icon: Home,
      action: () => {
        if (onVisitRoommates) {
          onVisitRoommates();
        }
        navigate('Roommates');
      },
      actionText: 'Find Roommates',
      completed: hasVisitedRoommates
    }
  ];

  const completedCount = steps.filter(step => step.completed).length;
  const progress = (completedCount / steps.length) * 100;

  if (completedCount === steps.length) {
    return null; // Hide guide when all steps completed
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Briefcase className="w-5 h-5" />
          Getting Started
        </CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-blue-700">
            <span>{completedCount} of {steps.length} completed</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-blue-100" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                step.completed ? 'bg-green-50 border border-green-200' : 'bg-white border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1 rounded-full ${step.completed ? 'text-green-600' : 'text-slate-400'}`}>
                  {step.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className={`font-medium ${step.completed ? 'text-green-800 line-through' : 'text-slate-900'}`}>
                    {step.title}
                  </h4>
                  <p className={`text-sm ${step.completed ? 'text-green-600' : 'text-slate-600'}`}>
                    {step.description}
                  </p>
                </div>
              </div>
              
              {!step.completed && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={step.action}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  {step.actionText}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}