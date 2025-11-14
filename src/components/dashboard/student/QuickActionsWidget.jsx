import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { navigate } from '@/components/utils/navigation';
import { MessageSquare, Briefcase, Users, Home, Target } from 'lucide-react';

const quickActions = [
  {
    id: 'post-request',
    title: 'Get Help from Gators',
    description: 'Post a request and get intros from alumni & parents',
    icon: MessageSquare,
    color: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
    action: () => navigate('PostRequest'),
    badge: '🔥 Most Popular'
  },
  {
    id: 'interview-prep',
    title: 'Practice Interviews',
    description: 'AI-powered mock interviews with instant feedback',
    icon: Target,
    color: 'bg-purple-600',
    hoverColor: 'hover:bg-purple-700',
    action: () => navigate('InterviewPrep'),
    badge: '✨ New'
  },
  {
    id: 'browse-opportunities',
    title: 'Find Opportunities',
    description: 'Browse jobs, internships & student gigs',
    icon: Briefcase,
    color: 'bg-green-600',
    hoverColor: 'hover:bg-green-700',
    action: () => navigate('Opportunities')
  },
  {
    id: 'find-roommate',
    title: 'Find a Roommate',
    description: 'Connect with Gators looking for housing',
    icon: Home,
    color: 'bg-orange-600',
    hoverColor: 'hover:bg-orange-700',
    action: () => navigate('Roommates')
  },
  {
    id: 'browse-network',
    title: 'Browse Network',
    description: 'See who\'s helping students right now',
    icon: Users,
    color: 'bg-indigo-600',
    hoverColor: 'hover:bg-indigo-700',
    action: () => navigate('Connections')
  },
  {
    id: 'gator-directory',
    title: 'Gator Directory',
    description: 'Search 12,000+ students, alumni & parents',
    icon: Users,
    color: 'bg-pink-600',
    hoverColor: 'hover:bg-pink-700',
    action: () => navigate('GatorDirectory')
  }
];

export default function QuickActionsWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.action}
                className={`${action.color} ${action.hoverColor} text-white p-4 rounded-xl transition-all hover:shadow-lg hover:scale-105 text-left relative`}
              >
                {action.badge && (
                  <span className="absolute -top-2 -right-2 bg-white text-slate-900 text-xs font-bold px-2 py-1 rounded-full shadow-md">
                    {action.badge}
                  </span>
                )}
                <Icon className="w-6 h-6 mb-2" />
                <div className="font-semibold text-sm mb-1">{action.title}</div>
                <div className="text-xs opacity-90">{action.description}</div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}