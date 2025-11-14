import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Briefcase, Users, ArrowRight, Sparkles } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

export default function ParentQuickActions() {
  const actions = [
    {
      icon: Heart,
      title: 'Help Students',
      description: 'Browse student requests and offer your expertise',
      color: 'blue',
      action: () => navigate('Connections'),
      label: 'View Requests'
    },
    {
      icon: Briefcase,
      title: 'Post a Job',
      description: 'Share internships and job opportunities with students',
      color: 'green',
      action: () => navigate('PostOpportunity'),
      label: 'Create Posting'
    },
    {
      icon: Users,
      title: 'Network',
      description: 'Connect with other parents and alumni in the Gator community',
      color: 'purple',
      action: () => navigate('GatorDirectory'),
      label: 'Browse Directory'
    }
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-100',
      hoverBg: 'group-hover:bg-blue-200',
      icon: 'text-blue-600',
      text: 'text-blue-600',
      border: 'hover:border-blue-500',
      hoverBgCard: 'hover:bg-blue-50'
    },
    green: {
      bg: 'bg-green-100',
      hoverBg: 'group-hover:bg-green-200',
      icon: 'text-green-600',
      text: 'text-green-600',
      border: 'hover:border-green-500',
      hoverBgCard: 'hover:bg-green-50'
    },
    purple: {
      bg: 'bg-purple-100',
      hoverBg: 'group-hover:bg-purple-200',
      icon: 'text-purple-600',
      text: 'text-purple-600',
      border: 'hover:border-purple-500',
      hoverBgCard: 'hover:bg-purple-50'
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-600" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            const colors = colorClasses[action.color];
            
            return (
              <button
                key={index}
                onClick={action.action}
                className={`p-6 rounded-xl border-2 border-slate-200 ${colors.border} ${colors.hoverBgCard} transition-all text-left group`}
              >
                <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center mb-4 ${colors.hoverBg} transition-colors`}>
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{action.title}</h3>
                <p className="text-sm text-slate-600 mb-3">
                  {action.description}
                </p>
                <div className={`flex items-center ${colors.text} text-sm font-medium`}>
                  {action.label} <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}