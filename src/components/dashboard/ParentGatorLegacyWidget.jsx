import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Heart, Users, Star, Award, TrendingUp } from 'lucide-react';

export default function ParentGatorLegacyWidget({ stats = {}, loading = false }) {
  // Provide default values to prevent undefined errors
  const {
    impactScore = 0,
    familyConnections = 0,
    reachoutsMade = 0,
    storiesShared = 0,
    requestsViewed = 0,
    activeConnections = 0
  } = stats;

  // Calculate legacy level based on impact score
  const getLegacyLevel = (score) => {
    if (score >= 500) return { level: "Legendary Parent", icon: Award, color: "text-purple-600", bgColor: "bg-purple-100" };
    if (score >= 300) return { level: "Super Connector", icon: Star, color: "text-yellow-600", bgColor: "bg-yellow-100" };
    if (score >= 150) return { level: "Active Helper", icon: Trophy, color: "text-orange-600", bgColor: "bg-orange-100" };
    if (score >= 50) return { level: "Rising Helper", icon: TrendingUp, color: "text-blue-600", bgColor: "bg-blue-100" };
    return { level: "Getting Started", icon: Heart, color: "text-green-600", bgColor: "bg-green-100" };
  };

  const legacyInfo = getLegacyLevel(impactScore);
  const LegacyIcon = legacyInfo.icon;
  const progressPercentage = Math.min((impactScore / 500) * 100, 100);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-slate-200 rounded w-1/2 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-slate-100 rounded animate-pulse" />
            <div className="h-20 bg-slate-100 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <LegacyIcon className={`w-6 h-6 ${legacyInfo.color}`} />
          </motion.div>
          <div>
            <div className="text-xl font-bold text-slate-900">Your Gator Legacy</div>
            <div className="text-sm text-slate-600 font-normal">
              Impact Level: <span className={`font-semibold ${legacyInfo.color}`}>{legacyInfo.level}</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Impact Score Progress */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-slate-700">Legacy Score</span>
            <Badge className={`${legacyInfo.bgColor} ${legacyInfo.color} border-0`}>
              {impactScore} points
            </Badge>
          </div>
          <Progress value={progressPercentage} className="h-3 bg-slate-200" />
          <p className="text-xs text-slate-500 mt-2">
            {impactScore < 500 ? `${500 - impactScore} more points to reach Legendary status` : 'Maximum level achieved! 🎉'}
          </p>
        </div>

        {/* Legacy Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-4 text-center border border-orange-100"
          >
            <div className="flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{familyConnections}</div>
            <div className="text-xs text-slate-600">Family Connections</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-4 text-center border border-orange-100"
          >
            <div className="flex items-center justify-center mb-2">
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{reachoutsMade}</div>
            <div className="text-xs text-slate-600">Gators Helped</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-4 text-center border border-orange-100"
          >
            <div className="flex items-center justify-center mb-2">
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{storiesShared}</div>
            <div className="text-xs text-slate-600">Stories Shared</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-4 text-center border border-orange-100"
          >
            <div className="flex items-center justify-center mb-2">
              <Trophy className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{activeConnections}</div>
            <div className="text-xs text-slate-600">Active Connections</div>
          </motion.div>
        </div>

        {/* Achievement Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 border border-orange-200"
        >
          <div className="text-center">
            <div className="text-sm font-semibold text-slate-900 mb-2">
              🎉 Your Impact This Month
            </div>
            <p className="text-sm text-slate-600">
              You've viewed <span className="font-semibold text-orange-600">{requestsViewed}</span> student requests 
              and made <span className="font-semibold text-orange-600">{reachoutsMade}</span> connections. 
              Keep building that Gator legacy!
            </p>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}