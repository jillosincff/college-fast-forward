import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Eye, 
  Users, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { trackEvent } from '@/components/utils/analytics';
import { navigate } from '@/components/utils/navigation';

export default function StudentImpactWidget({ stats = {}, loading = false }) {
  // Provide default values for all stats properties
  const {
    profileViews = 0,
    connectionsReceived = 0,
    messagesReceived = 0,
    impactScore = 0,
    profileCompletion = 0,
    requestsPosted = 0
  } = stats;

  const impactLevel = getImpactLevel(impactScore);
  const nextMilestone = getNextMilestone(impactScore);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-slate-200 rounded w-1/2 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mb-8"
    >
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </motion.div>
            <div>
              <div className="text-xl font-bold text-slate-900">Your Gator Progress</div>
              <div className="text-sm text-slate-600 font-normal">
                Track your networking journey and growth
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Impact Level Badge */}
          <div className="flex items-center justify-between">
            <Badge className={`${impactLevel.color} text-sm font-semibold py-1 px-3`}>
              {impactLevel.icon} {impactLevel.name}
            </Badge>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">{impactScore}</div>
              <div className="text-xs text-slate-500">Impact Points</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Progress to {nextMilestone.name}</span>
              <span>{Math.round((impactScore / nextMilestone.threshold) * 100)}%</span>
            </div>
            <Progress 
              value={(impactScore / nextMilestone.threshold) * 100} 
              className="h-3 bg-slate-200"
            />
            <p className="text-xs text-slate-500 text-center">
              {nextMilestone.threshold - impactScore} points to next level
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/80 backdrop-blur-sm rounded-lg p-3 text-center border border-blue-200"
            >
              <Eye className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-slate-900">{profileViews}</div>
              <div className="text-xs text-slate-600">Profile Views</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/80 backdrop-blur-sm rounded-lg p-3 text-center border border-blue-200"
            >
              <Users className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-slate-900">{connectionsReceived}</div>
              <div className="text-xs text-slate-600">Help Offers</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/80 backdrop-blur-sm rounded-lg p-3 text-center border border-blue-200"
            >
              <MessageSquare className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-slate-900">{messagesReceived}</div>
              <div className="text-xs text-slate-600">Messages</div>
            </motion.div>
          </div>

          {/* Action Button */}
          {profileCompletion < 100 && (
            <Button
              onClick={() => {
                trackEvent('student_complete_profile_clicked');
                navigate('ProfileEdit');
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            >
              Complete Your Profile ({profileCompletion}%)
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function getImpactLevel(score) {
  if (score >= 1000) return { name: 'Gator Leader', color: 'bg-purple-100 text-purple-800', icon: '👑' };
  if (score >= 500) return { name: 'Rising Gator', color: 'bg-blue-100 text-blue-800', icon: '🚀' };
  if (score >= 200) return { name: 'Active Gator', color: 'bg-green-100 text-green-800', icon: '⭐' };
  if (score >= 50) return { name: 'Growing Gator', color: 'bg-yellow-100 text-yellow-800', icon: '🌱' };
  return { name: 'New Gator', color: 'bg-slate-100 text-slate-800', icon: '🐊' };
}

function getNextMilestone(score) {
  if (score >= 1000) return { name: 'Gator Legend', threshold: 2000 };
  if (score >= 500) return { name: 'Gator Leader', threshold: 1000 };
  if (score >= 200) return { name: 'Rising Gator', threshold: 500 };
  if (score >= 50) return { name: 'Active Gator', threshold: 200 };
  return { name: 'Growing Gator', threshold: 50 };
}