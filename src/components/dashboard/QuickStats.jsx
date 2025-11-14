import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Briefcase, Users, Heart, TrendingUp, Send, ClipboardList, Award, Trophy } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";

const AnimatedStat = ({ value, label }) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const numericValue = typeof value === 'number' ? value : 0;
    let startTimestamp = null;
    const duration = 1500;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentVal = Math.floor(progress * numericValue);
      setAnimatedValue(currentVal);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value]);

  return <div className="text-3xl font-bold">{animatedValue}</div>;
};

export default function QuickStats({ jobRequests, roommatePosts }) {
  const { user } = useAuth();

  const getStatsForRole = () => {
    const persona = user?.persona || 'student';

    switch(persona) {
      case 'parent':
        return [
          { title: "Requests Viewed", value: 24, icon: ClipboardList, colorName: "blue", tooltip: "Number of student help requests you've viewed." },
          { title: "Reachouts Made", value: 22, icon: Send, colorName: "purple", tooltip: "Number of times you've offered help to a student." },
          { title: "Active This Month", value: 12, icon: TrendingUp, colorName: "orange", tooltip: "Students you've helped who were active this month." }
        ];
        
      case 'alumni':
        return [
          { title: "Introductions Made", value: 17, icon: Send, colorName: "purple", tooltip: "Total career connections you've facilitated this year. Keep going!" },
          { title: "Students Helped", value: 12, icon: Users, colorName: "blue", tooltip: "Total number of students you've assisted." },
          { title: "Jobs Unlocked", value: 3, icon: Trophy, colorName: "orange", tooltip: "Confirmed job offers thanks to Gator Nation introductions this month." },
          { title: "Success Stories", value: 4, icon: Award, colorName: "green", tooltip: "Confirmed positive outcomes from your introductions." }
        ];

      case 'student':
      default:
        return [
          { title: "Your Job Requests", value: jobRequests?.length || 0, icon: Briefcase, colorName: "blue", tooltip: "Your active job or internship requests." },
          { title: "Active Roommate Posts", value: roommatePosts?.length || 0, icon: Users, colorName: "purple", tooltip: "Your active listings for finding a roommate." },
          { title: "Offers Received", value: user?.offers_received_count || 0, icon: Heart, colorName: "green", tooltip: "Help offers you've received from alumni and parents." },
          { title: "Profile Views", value: 47, icon: TrendingUp, colorName: "orange", tooltip: "How many times other Gators have viewed your profile." }
        ];
    }
  };

  const stats = getStatsForRole();
  
  const colorStyles = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
    green: { bg: 'bg-green-50', text: 'text-green-600' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600' }
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const colors = colorStyles[stat.colorName];
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm h-full">
                <div className={`absolute inset-0 ${colors.bg} opacity-40`} />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="h-full">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                        <CardTitle className="text-sm font-semibold text-slate-600">
                          {stat.title}
                        </CardTitle>
                        <div className={`p-2 rounded-lg bg-white`}>
                          <stat.icon className={`w-4 h-4 ${colors.text}`} aria-hidden="true" />
                        </div>
                      </CardHeader>
                      <CardContent className="relative">
                        {typeof stat.value === 'number' && stat.value >= 0 ? (
                          <div className={`${colors.text}`}>
                            <AnimatedStat value={stat.value} />
                          </div>
                        ) : (
                           <p className="text-3xl font-bold">{stat.value}</p>
                        )}
                      </CardContent>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{stat.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </Card>
            </motion.div>
          )
        })}
      </div>
      
      {/* Celebratory message for alumni with personal impact */}
      {user?.persona === 'alumni' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <div className="bg-gradient-to-r from-[var(--uf-orange)]/10 to-[var(--uf-blue)]/10 border border-[var(--uf-orange)]/20 rounded-xl px-6 py-4 inline-block">
            <p className="text-slate-700 font-semibold">
              You've unlocked 3 jobs for Gators this month. Amazing! 🐊
            </p>
            <p className="text-sm text-slate-600 mt-1">
              Here's how your introductions have made a difference recently...
            </p>
          </div>
        </motion.div>
      )}
    </TooltipProvider>
  );
}