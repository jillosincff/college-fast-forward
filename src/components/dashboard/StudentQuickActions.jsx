import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Users, 
  Plus, 
  MessageSquare, 
  ArrowRight,
  FileText,
  Search
} from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import { trackEvent } from '@/components/utils/analytics';

export default function StudentQuickActions() {
  const quickActions = [
    {
      id: 'find-connections',
      title: 'Find Job Connections',
      description: 'Connect with alumni & parents',
      icon: Briefcase,
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      iconColor: 'text-blue-600',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => {
        trackEvent('student_quick_action_connections_clicked');
        navigate('Connections');
      },
      badge: 'Popular'
    },
    {
      id: 'browse-roommates',
      title: 'Browse Roommates',
      description: 'Find your perfect roommate',
      icon: Users,
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
      iconColor: 'text-purple-600',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      onClick: () => {
        trackEvent('student_quick_action_roommates_clicked');
        navigate('Roommates');
      }
    },
    {
      id: 'post-request',
      title: 'Post Your First Request',
      description: 'Ask for help from the network',
      icon: Plus,
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
      iconColor: 'text-green-600',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      onClick: () => {
        trackEvent('student_quick_action_post_request_clicked');
        navigate('PostRequest');
      }
    },
    {
      id: 'browse-opportunities',
      title: 'Browse Opportunities',
      description: 'Discover jobs & internships',
      icon: Search,
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
      iconColor: 'text-orange-600',
      buttonColor: 'bg-orange-600 hover:bg-orange-700',
      onClick: () => {
        trackEvent('student_quick_action_opportunities_clicked');
        navigate('Opportunities');
      }
    },
    {
      id: 'gator-directory',
      title: 'Gator Directory',
      description: 'Discover alumni & parents',
      icon: FileText,
      bgColor: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
      iconColor: 'text-indigo-600',
      buttonColor: 'bg-indigo-600 hover:bg-indigo-700',
      onClick: () => {
        trackEvent('student_quick_action_directory_clicked');
        navigate('GatorDirectory');
      }
    },
    {
      id: 'messages',
      title: 'My Messages',
      description: 'Check your conversations',
      icon: MessageSquare,
      bgColor: 'bg-gradient-to-br from-slate-50 to-slate-100',
      iconColor: 'text-slate-600',
      buttonColor: 'bg-slate-600 hover:bg-slate-700',
      onClick: () => {
        trackEvent('student_quick_action_messages_clicked');
        navigate('Messages');
      }
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-8"
    >
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ y: -4 }}
            className="group"
          >
            <Card className={`${action.bgColor} border-0 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer h-full`}>
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${action.bgColor} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className={`w-6 h-6 ${action.iconColor}`} />
                  </div>
                  {action.badge && (
                    <Badge variant="secondary" className="bg-white/80 text-slate-700 text-xs">
                      {action.badge}
                    </Badge>
                  )}
                </div>
                
                <div className="flex-grow">
                  <h3 className="font-bold text-slate-900 text-lg mb-2">
                    {action.title}
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">
                    {action.description}
                  </p>
                </div>

                <Button
                  onClick={action.onClick}
                  className={`${action.buttonColor} text-white w-full rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-105`}
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}