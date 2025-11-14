import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Users, Share2, Search, Briefcase, MessageSquare } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import { trackEvent } from '@/components/utils/analytics';

const ActionCard = ({ icon: Icon, title, description, onClick, colorClass, badgeText }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="cursor-pointer"
    onClick={onClick}
  >
    <Card className="h-full bg-white hover:shadow-xl transition-all duration-300 border-0 overflow-hidden group">
      <CardContent className="p-6 relative">
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity ${colorClass}`} />
        <div className="relative z-10">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${colorClass}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-bold text-slate-900 mb-2 text-lg">{title}</h3>
          {badgeText && (
            <div className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full mb-3">
              ✨ {badgeText}
            </div>
          )}
          <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function AlumniQuickActions({ onHelpGator, onShareStory, onNetworking }) {
  const handleActionClick = (actionType, callback) => {
    trackEvent(`alumni_quick_action_${actionType}`, { persona: 'alumni' });
    callback();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          ⚡
        </motion.div>
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ActionCard
          icon={Heart}
          title="Help a Gator"
          description="Find students who need your expertise. Make introductions, offer advice, or share opportunities."
          onClick={() => handleActionClick('help_gator', onHelpGator)}
          colorClass="bg-gradient-to-br from-red-500 to-pink-600"
          badgeText="5 new matches"
        />
        
        <ActionCard
          icon={Users}
          title="Alumni Network"
          description="Connect with fellow alumni in your industry or graduation year. Build professional relationships."
          onClick={() => handleActionClick('networking', onNetworking)}
          colorClass="bg-gradient-to-br from-blue-500 to-indigo-600"
        />
        
        <ActionCard
          icon={Share2}
          title="Share Your Story"
          description="Inspire the next generation by sharing your career journey, challenges, and successes."
          onClick={() => handleActionClick('share_story', onShareStory)}
          colorClass="bg-gradient-to-br from-green-500 to-emerald-600"
        />
        
        <ActionCard
          icon={Briefcase}
          title="Post Opportunities"
          description="Share job openings, internships, or projects with the Gator community."
          onClick={() => handleActionClick('post_opportunity', () => navigate('PostOpportunity'))}
          colorClass="bg-gradient-to-br from-purple-500 to-violet-600"
        />
        
        <ActionCard
          icon={Search}
          title="Browse Directory"
          description="Search the Gator directory by industry, location, or graduation year to find connections."
          onClick={() => handleActionClick('browse_directory', () => navigate('GatorDirectory'))}
          colorClass="bg-gradient-to-br from-orange-500 to-red-600"
        />
        
        <ActionCard
          icon={MessageSquare}
          title="My Messages"
          description="View conversations with students you're mentoring and other alumni connections."
          onClick={() => handleActionClick('view_messages', () => navigate('Messages'))}
          colorClass="bg-gradient-to-br from-cyan-500 to-blue-600"
        />
      </div>
    </div>
  );
}