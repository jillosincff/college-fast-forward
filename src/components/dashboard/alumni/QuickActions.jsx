import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Briefcase, Mail, Search, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { navigate } from '@/components/utils/navigation';
import { Badge } from '@/components/ui/badge';

const ActionCard = ({ title, description, icon: Icon, action, badgeText, badgeColor }) => (
  <motion.div
    className="relative w-full h-full"
    whileHover={{ y: -5 }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    <Card onClick={action} className="h-full cursor-pointer group transition-all duration-300 hover:shadow-xl hover:border-blue-300 bg-white">
      <CardContent className="p-6 flex flex-col items-start justify-between h-full">
        <div>
          <div className="flex justify-between items-start mb-3">
            <div className="p-3 bg-slate-100 rounded-lg group-hover:bg-blue-100 transition-colors">
              <Icon className="w-6 h-6 text-slate-600 group-hover:text-blue-600" />
            </div>
            {badgeText && (
              <Badge className={badgeColor}>{badgeText}</Badge>
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-600 mt-1">{description}</p>
        </div>
        <div className="flex items-center text-sm font-semibold text-blue-600 mt-4 group-hover:underline">
          Go <ArrowRight className="w-4 h-4 ml-1" />
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function QuickActions({ stats }) {
  const actions = [
    {
      title: "Browse Help Requests",
      description: "See what students are looking for and lend a hand.",
      icon: Search,
      action: () => navigate('Connections'),
      badgeText: 'Make an Impact',
      badgeColor: 'bg-green-100 text-green-800'
    },
    {
      title: "Post an Opportunity",
      description: "Share a job, internship, or networking event from your company.",
      icon: Briefcase,
      action: () => navigate('PostOpportunity'),
      badgeText: null,
      badgeColor: null
    },
    {
      title: "My Messages",
      description: "Read and reply to students who have reached out to you.",
      icon: Mail,
      action: () => navigate('Messages'),
      badgeText: stats.unreadMessages > 0 ? `${stats.unreadMessages} New` : null,
      badgeColor: 'bg-orange-500 text-white'
    },
    {
      title: "Gator Directory",
      description: "Connect with fellow alumni and expand your professional network.",
      icon: Users,
      action: () => navigate('GatorDirectory'),
      badgeText: null,
      badgeColor: null
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {actions.map((action, index) => (
        <ActionCard key={index} {...action} />
      ))}
    </div>
  );
}