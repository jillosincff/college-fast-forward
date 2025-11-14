import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Trophy, Star, Shield, Zap } from 'lucide-react';
import { HelpOffer } from '@/entities/HelpOffer';
import { User } from '@/entities/User';
import { groupBy, map, orderBy } from 'lodash';

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

const rankConfig = [
  { icon: Crown, color: 'text-amber-400', shadow: 'shadow-[0_0_15px_rgba(252,211,77,0.7)]' },
  { icon: Star, color: 'text-slate-400', shadow: 'shadow-[0_0_15px_rgba(148,163,184,0.6)]' },
  { icon: Shield, color: 'text-yellow-600', shadow: 'shadow-[0_0_15px_rgba(202,138,4,0.5)]' },
];

const HelperRow = ({ helper, rank, index }) => {
  const rankDetails = rankConfig[rank] || { icon: Zap, color: 'text-slate-500', shadow: '' };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="flex items-center gap-4 p-3 hover:bg-slate-100 rounded-lg transition-colors duration-200"
    >
      <div className="flex items-center gap-3 w-1/3">
        <span className={`font-bold text-lg ${rankDetails.color}`}>{rank + 1}</span>
        <Avatar className="w-10 h-10 border-2 border-white shadow-md">
          <AvatarImage src={helper.user.profile_image_url} alt={`${helper.user.full_name}'s avatar`} />
          <AvatarFallback className="bg-slate-200 text-slate-700 font-semibold">
            {getInitials(helper.user.full_name)}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 truncate">{helper.user.full_name}</p>
        <p className="text-sm text-slate-500">{helper.user.headline || 'Gator Helper'}</p>
      </div>
      <div className="flex items-center gap-1 font-bold text-lg text-slate-700">
        <rankDetails.icon className={`w-5 h-5 ${rankDetails.color} ${rankDetails.shadow}`} />
        <span>{helper.count}</span>
      </div>
    </motion.div>
  );
};

export default function LeaderboardSidebar() {
  const [topHelpers, setTopHelpers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopHelpers = async () => {
      setIsLoading(true);
      try {
        const [offers, users] = await Promise.all([
          HelpOffer.list('-created_date', 200), // Fetch recent offers
          User.list()
        ]);

        const usersById = users.reduce((acc, u) => {
          acc[u.id] = u;
          return acc;
        }, {});

        const offersByHelper = groupBy(offers, 'offerer_user_id');
        
        const helpers = map(offersByHelper, (helperOffers, userId) => ({
          userId,
          count: helperOffers.length,
          user: usersById[userId],
        })).filter(h => h.user); // Ensure user exists

        const sortedHelpers = orderBy(helpers, ['count'], ['desc']);
        
        setTopHelpers(sortedHelpers.slice(0, 5)); // Get top 5
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      }
      setIsLoading(false);
    };

    fetchTopHelpers();
  }, []);

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Trophy className="w-6 h-6 text-amber-500" />
          Top Helpers This Week
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 bg-slate-200 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : topHelpers.length === 0 ? (
          <div className="text-center py-6 text-slate-500">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Be the first to help!</p>
            <p className="text-sm">Offer help to a student to appear on the leaderboard.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {topHelpers.map((helper, index) => (
                <HelperRow key={helper.userId} helper={helper} rank={index} index={index} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}