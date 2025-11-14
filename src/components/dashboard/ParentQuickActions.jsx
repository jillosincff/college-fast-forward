
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, PlusCircle, MessageSquare } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import { trackEvent } from '@/components/utils/analytics';

const ActionCard = ({ icon: Icon, title, description, onClick, colorClass }) => (
  <motion.div
    whileHover={{ y: -5, boxShadow: '0 8px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    onClick={onClick}
    className="cursor-pointer h-full"
  >
    <Card className="h-full border-slate-200 hover:border-[var(--uf-blue)] transition-colors duration-300 flex flex-col">
      <CardContent className="p-6 flex-grow flex flex-col items-center text-center">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-lg ${colorClass}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 flex-grow">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
);

export default function ParentQuickActions() {
  const handleActionClick = (page, eventName) => {
    trackEvent(eventName, { persona: 'parent' });
    navigate(page);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActionCard
          icon={Briefcase}
          title="Browse Gator Profiles"
          description="See what students are looking for and lend a hand by making an introduction or offering advice."
          onClick={() => handleActionClick('Connections', 'parent_browse_requests_clicked')}
          colorClass="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <ActionCard
          icon={PlusCircle}
          title="Post An Opportunity"
          description="Know of a job, internship, or shadowing opportunity? Share it with the Gator community."
          onClick={() => handleActionClick('PostOpportunity', 'parent_post_opportunity_clicked')}
          colorClass="bg-gradient-to-br from-green-500 to-green-600"
        />
        <ActionCard
          icon={MessageSquare}
          title="My Messages"
          description="View your conversations with students and stay in touch about opportunities."
          onClick={() => handleActionClick('Messages', 'parent_view_messages_clicked')}
          colorClass="bg-gradient-to-br from-purple-500 to-purple-600"
        />
      </div>
    </div>
  );
}
