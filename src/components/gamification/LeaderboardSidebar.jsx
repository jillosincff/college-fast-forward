import { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown,
  TrendingUp,
  Users,
  Zap,
  Flame
} from 'lucide-react';
import { motion } from 'framer-motion';
import { UserContext } from '@/components/context/UserContext';

const LeaderboardSidebar = () => {
  const { user } = useContext(UserContext);
  const [topHelpers, setTopHelpers] = useState([]);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    // Mock leaderboard data
    const mockHelpers = [
      {
        id: 1,
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face',
        persona: 'alumni',
        graduation_year: 2019,
        stats: { helps: 45, intros: 23, streak: 12 },
        badges: ['gator_legend', 'super_helper', 'connector'],
        points: 340
      },
      {
        id: 2,
        name: 'Mike Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
        persona: 'parent',
        graduation_year: null,
        stats: { helps: 38, intros: 19, streak: 8 },
        badges: ['super_helper', 'connector'],
        points: 295
      },
      {
        id: 3,
        name: 'Lisa Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face',
        persona: 'alumni',
        graduation_year: 2020,
        stats: { helps: 32, intros: 16, streak: 6 },
        badges: ['super_helper'],
        points: 248
      },
      {
        id: 4,
        name: 'David Park',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
        persona: 'alumni',
        graduation_year: 2018,
        stats: { helps: 28, intros: 14, streak: 4 },
        badges: ['connector'],
        points: 210
      },
      {
        id: 5,
        name: 'Jennifer Kim',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop&crop=face',
        persona: 'alumni',
        graduation_year: 2021,
        stats: { helps: 24, intros: 12, streak: 3 },
        badges: [],
        points: 180
      }
    ];

    setTopHelpers(mockHelpers);
    
    // Calculate user rank based on current user stats
    const userPoints = (user.stats.helps * 5) + (user.stats.intros * 8) + (user.stats.likes * 1);
    const rank = mockHelpers.filter(helper => helper.points > userPoints).length + 1;
    setUserRank(rank <= 10 ? rank : null);
  }, [user.stats]);

  const getRankIcon = (position) => {
    switch(position) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3: return <Medal className="w-5 h-5 text-amber-600" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-slate-500">#{position}</span>;
    }
  };

  const getBadgeIcon = (badge) => {
    const badges = {
      gator_legend: { icon: Crown, color: 'text-yellow-500' },
      super_helper: { icon: Trophy, color: 'text-purple-500' },
      connector: { icon: Users, color: 'text-blue-500' },
      influencer: { icon: TrendingUp, color: 'text-green-500' }
    };
    return badges[badge] || { icon: Award, color: 'text-slate-500' };
  };

  return (
    <div className="space-y-6">
      {/* User Progress Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Your Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Helps Given</span>
              <span className="font-bold text-blue-600">{user.stats.helps}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Intros Made</span>
              <span className="font-bold text-orange-600">{user.stats.intros}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Your Rank</span>
              <span className="font-bold text-green-600">
                {userRank ? `#${userRank}` : 'Unranked'}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Next Badge</span>
                <span>{user.stats.helps}/10</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((user.stats.helps / 10) * 100, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* User Badges */}
            {user.badges.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {user.badges.map((badge, index) => {
                  const { icon: Icon, color } = getBadgeIcon(badge);
                  return (
                    <motion.div
                      key={badge}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white shadow-sm text-xs font-medium ${color}`}
                    >
                      <Icon className="w-3 h-3" />
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Top Helpers
            <Badge className="bg-red-100 text-red-600 ml-auto">
              <Flame className="w-3 h-3 mr-1" />
              Live
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topHelpers.map((helper, index) => (
              <motion.div
                key={helper.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex-shrink-0">
                  {getRankIcon(index + 1)}
                </div>
                
                <Avatar className="w-8 h-8">
                  <AvatarImage src={helper.avatar} />
                  <AvatarFallback className="text-xs">
                    {helper.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {helper.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {helper.stats.helps} helps • {helper.stats.intros} intros
                  </p>
                </div>
                
                {/* Top badge for #1 */}
                {index === 0 && (
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex-shrink-0"
                  >
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs">
                      Legend
                    </Badge>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
          
          {/* Weekly Challenge */}
          <div className="mt-6 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-800">Weekly Challenge</span>
            </div>
            <p className="text-xs text-green-700">
              Help 3 more Gators this week to earn the "Weekly Hero" badge! 🏆
            </p>
            <div className="mt-2 bg-white rounded-full h-1.5">
              <div className="bg-green-500 h-1.5 rounded-full w-1/3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderboardSidebar;