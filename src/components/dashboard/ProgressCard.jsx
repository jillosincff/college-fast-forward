import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { User, Send, Users, ArrowRight } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import InviteGatorButton from '@/components/viral/InviteGatorButton';

const RadialProgress = ({ percentage, size = 100, strokeWidth = 10 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="absolute top-0 left-0" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="text-slate-200"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-blue-600 transition-all duration-500"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-slate-800">{percentage}%</span>
      </div>
    </div>
  );
};

const calculateProfileCompletion = (user) => {
    if (!user) return 0;
    const fields = [
      { key: 'full_name', weight: 20 }, { key: 'graduation_year', weight: 20 },
      { key: 'major', weight: 20 }, { key: 'location', weight: 15 },
      { key: 'bio', weight: 15 }, { key: 'linkedin_url', weight: 10 },
    ];
    const maxScore = fields.reduce((sum, field) => sum + field.weight, 0);
    const totalScore = fields.reduce((sum, field) => {
        const value = user[field.key];
        return sum + (value ? field.weight : 0);
    }, 0);
    return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
};

export default function ProgressCard() {
  const { user } = useAuth();

  const profileScore = useMemo(() => calculateProfileCompletion(user), [user]);
  const networkingScore = useMemo(() => Math.min(((user?.offers_received_count || 0) * 20), 100), [user]);

  const allQuickActions = [
    { id: 'profile', label: 'Complete Profile', action: () => navigate('ProfileEdit'), icon: User, disabled: profileScore >= 95 },
    { id: 'request', label: 'Post a Request', action: () => navigate('PostRequest'), icon: Send, disabled: false },
  ];

  const quickActions = allQuickActions.filter(action => {
    if (action.id === 'profile' && user?.persona === 'student') {
      return false;
    }
    return true;
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Your Progress</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Progress Visuals */}
        <div className="flex justify-around items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <RadialProgress percentage={profileScore} />
            <span className="text-sm font-medium text-slate-600">Profile</span>
          </div>
          <div className="w-full">
            <div className="text-center mb-4">
              <span className="text-xl font-bold text-slate-800">{networkingScore}%</span>
              <p className="text-sm font-medium text-slate-600">Network</p>
            </div>
            <Progress value={networkingScore} className="h-2" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                onClick={action.action}
                disabled={action.disabled}
                className="w-full justify-start text-base text-slate-700 hover:bg-slate-100"
              >
                <Icon className="w-4 h-4 mr-3 text-slate-500" />
                {action.label}
                <ArrowRight className="w-4 h-4 ml-auto text-slate-400" />
              </Button>
            );
          })}
          <InviteGatorButton
            from="progress_card"
            variant="ghost"
            className="w-full justify-start text-base text-slate-700 hover:bg-slate-100"
          >
            <Users className="w-4 h-4 mr-3 text-slate-500" />
            Invite Gators
            <ArrowRight className="w-4 h-4 ml-auto text-slate-400" />
          </InviteGatorButton>
        </div>
      </CardContent>
    </Card>
  );
}