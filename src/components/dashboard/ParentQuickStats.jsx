import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Send, MessageSquare, TrendingUp, CheckCircle, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { navigate } from '@/components/utils/navigation';

const ImpactStarter = ({ onAction }) => {
  const starterActions = [
    {
      icon: Eye,
      label: 'Browse Student Requests',
      description: 'See how you can help fellow Gators',
      action: () => {
        onAction('browse');
        navigate('Connections');
      }
    },
    {
      icon: Send,
      label: 'Send Your First Message',
      description: 'Offer help to a student in need',
      action: () => {
        onAction('message');
        navigate('Connections');
      }
    },
    {
      icon: Heart,
      label: 'Set Your Expertise',
      description: 'Tell students how you can help',
      action: () => {
        onAction('profile');
        navigate('Profile');
      }
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-orange-50 border-0 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-lg font-bold text-slate-900 flex items-center justify-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          You're Just Getting Started!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 text-center mb-6">
          Complete 1 of these actions to unlock your Impact Score and start helping students.
        </p>
        <div className="grid gap-3">
          {starterActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={action.action}
              className="h-auto p-4 text-left flex items-center gap-3 hover:bg-white hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <action.icon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{action.label}</div>
                <div className="text-xs text-slate-500">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default function ParentQuickStats({ stats = {} }) {
  const {
    requestsViewed = 0,
    reachoutsMade = 0,
    activeConnections = 0,
    impactScore = 0
  } = stats;

  // Check if user has any meaningful activity
  const hasImpact = (requestsViewed + reachoutsMade + activeConnections + impactScore) > 0;

  const handleStarterAction = (actionType) => {
    // Track the action and potentially update local state
    console.log(`Starter action taken: ${actionType}`);
  };

  if (!hasImpact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ImpactStarter onAction={handleStarterAction} />
      </motion.div>
    );
  }

  const statItems = [
    {
      title: 'Requests Viewed',
      value: requestsViewed,
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      tooltip: 'Student requests you\'ve opened and reviewed'
    },
    {
      title: 'Reachouts Made',
      value: reachoutsMade,
      icon: Send,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      tooltip: 'Times you offered help to a student'
    },
    {
      title: 'Active Connections',
      value: activeConnections,
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      tooltip: 'Ongoing conversations with students this month'
    },
    {
      title: 'Impact Score',
      value: impactScore,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      tooltip: 'A composite of your helpful actions (messages, intros, saved requests)'
    }
  ];

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900">
              Your Impact This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statItems.map((stat, index) => (
                <Tooltip key={stat.title} delayDuration={300}>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className={`${stat.bgColor} rounded-xl p-4 text-center hover:scale-105 transition-transform cursor-help`}
                    >
                      <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                      <div className="text-2xl font-bold text-slate-900 mb-1">
                        {stat.value.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-600 font-medium">
                        {stat.title}
                      </div>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{stat.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
}