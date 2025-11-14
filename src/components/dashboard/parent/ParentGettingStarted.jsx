import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

export default function ParentGettingStarted() {
  const [completedSteps, setCompletedSteps] = useState([]);

  const steps = [
    {
      id: 'browse-requests',
      title: 'Browse Help Requests',
      description: 'See how you can help students',
      action: () => navigate('Connections'),
      actionText: 'Browse Now'
    },
    {
      id: 'complete-profile',
      title: 'Complete Your Profile',
      description: 'Add your expertise and background',
      action: () => navigate('ProfileEdit'),
      actionText: 'Edit Profile'
    },
    {
      id: 'make-connection',
      title: 'Make Your First Connection',
      description: 'Help a student by offering advice or introductions',
      action: () => navigate('Connections'),
      actionText: 'Get Started'
    },
    {
      id: 'explore-directory',
      title: 'Explore Gator Directory',
      description: 'Connect with other alumni and parents',
      action: () => navigate('GatorDirectory'),
      actionText: 'Explore'
    }
  ];

  const toggleStep = (stepId) => {
    setCompletedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const progress = (completedSteps.length / steps.length) * 100;

  return (
    <Card className="h-full shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="w-8 h-8 bg-orange-100 text-orange-600 flex items-center justify-center rounded-lg">🚀</span>
          Getting Started
        </CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Progress</span>
            <span className="font-medium">{completedSteps.length}/{steps.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map((step) => {
            const isCompleted = completedSteps.includes(step.id);
            return (
              <div key={step.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <button
                  onClick={() => toggleStep(step.id)}
                  className="mt-0.5 text-slate-400 hover:text-blue-600"
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                    {step.title}
                  </h4>
                  <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                  {!isCompleted && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="mt-2 p-0 h-auto text-blue-600 hover:text-blue-700"
                      onClick={step.action}
                    >
                      {step.actionText} <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}