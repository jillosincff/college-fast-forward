import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Circle, 
  User, 
  FileText, 
  Search, 
  Users,
  ArrowRight
} from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import { trackEvent } from '@/components/utils/analytics';

export default function StudentGettingStarted({ 
  hasPostedRequest, 
  hasBrowsedOpportunities, 
  hasVisitedRoommates, 
  profileCompletion,
  onBrowseOpportunities, 
  onVisitRoommates 
}) {
  const tasks = [
    {
      id: 'complete-profile',
      title: 'Complete Your Profile',
      description: 'Add your major, interests, and career goals',
      completed: profileCompletion >= 80,
      icon: User,
      onClick: () => {
        trackEvent('getting_started_complete_profile');
        navigate('Profile');
      }
    },
    {
      id: 'post-request',
      title: 'Post Your First Request',
      description: 'Ask for help finding internships or jobs',
      completed: hasPostedRequest,
      icon: FileText,
      onClick: () => {
        trackEvent('getting_started_post_request');
        navigate('PostRequest');
      }
    },
    {
      id: 'browse-opportunities',
      title: 'Browse Opportunities',
      description: 'Explore jobs and internships posted by the network',
      completed: hasBrowsedOpportunities,
      icon: Search,
      onClick: () => {
        trackEvent('getting_started_browse_opportunities');
        onBrowseOpportunities();
        navigate('Opportunities');
      }
    },
    {
      id: 'explore-roommates',
      title: 'Explore Roommate Options',
      description: 'Find your next roommate from fellow Gators',
      completed: hasVisitedRoommates,
      icon: Users,
      onClick: () => {
        trackEvent('getting_started_explore_roommates');
        onVisitRoommates();
        navigate('Roommates');
      }
    }
  ];

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = (completedTasks / totalTasks) * 100;

  if (completedTasks === totalTasks) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              You're All Set!
            </h3>
            <p className="text-slate-600 mb-4">
              Great job completing your getting started checklist. You're ready to make the most of your Gator network!
            </p>
            <Button
              onClick={() => {
                trackEvent('getting_started_explore_more');
                navigate('Connections');
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Explore More Connections
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="mb-8"
    >
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900">Getting Started</div>
                <div className="text-sm text-slate-600 font-normal">
                  {completedTasks} of {totalTasks} tasks completed
                </div>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-800">
              {Math.round(progressPercentage)}% Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${
                  task.completed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-slate-50 border-slate-200 hover:border-blue-200 hover:bg-blue-50'
                }`}
              >
                <div className={`flex-shrink-0 ${
                  task.completed ? 'text-green-600' : 'text-slate-400'
                }`}>
                  {task.completed ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </div>
                
                <div className="flex-grow">
                  <h4 className={`font-semibold ${
                    task.completed ? 'text-green-800' : 'text-slate-900'
                  }`}>
                    {task.title}
                  </h4>
                  <p className={`text-sm ${
                    task.completed ? 'text-green-600' : 'text-slate-600'
                  }`}>
                    {task.description}
                  </p>
                </div>
                
                {!task.completed && (
                  <Button
                    onClick={task.onClick}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
                  >
                    <task.icon className="w-4 h-4 mr-2" />
                    Start
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}