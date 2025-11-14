
import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import UserAvatar from '@/components/common/UserAvatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button'; // Added Button import
import {
  Heart,
  Share2,
  Eye,
  Clock,
  MapPin,
  Briefcase,
  Users
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import ConfettiCelebration from '@/components/viral/ConfettiCelebration';
import { UserContext } from '@/components/context/UserContext';

// Helper function for time formatting
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
};


// Note: For 'HelpOffer.create' to work, you would typically need to import a data model
// or API client, e.g., 'import { HelpOffer } from "@/lib/models/HelpOffer";'
// or define a service function that interacts with your backend.
// As the prompt only provided the function body, it's assumed 'HelpOffer' is accessible
// in the context where this component runs (e.g., through a global setup or a mock).

const ViralFeedCard = ({ request, onOfferHelp, onMakeIntro, onOpenModal, index, onOpenAuthModal }) => { // Changed onHelpOffered to onOfferHelp
  const { user, updateUserStats } = useContext(UserContext);
  const { toast } = useToast();
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50) + 10);
  const [hasHelped, setHasHelped] = useState(false);
  const [isOfferingHelp, setIsOfferingHelp] = useState(false); // New state for loading/disabling help button
  const [showAuthPrompt, setShowAuthPrompt] = useState(false); // New state for authentication prompt

  const poster = request.poster || {};

  // Gamification badges for users
  const getUserBadges = (persona, helpCount = 0) => {
    const badges = [];
    if (helpCount >= 20) badges.push({ type: 'crown', label: 'Gator Legend', color: 'from-yellow-400 to-orange-500' });
    else if (helpCount >= 10) badges.push({ type: 'trophy', label: 'Super Helper', color: 'from-purple-400 to-pink-500' });
    else if (helpCount >= 5) badges.push({ type: 'star', label: 'Rising Star', color: 'from-blue-400 to-indigo-500' });

    // The outline uses 'graduation' and 'heart' for persona types as emoji
    if (persona === 'alumni') badges.push({ type: 'graduation', label: 'Alumni Mentor', color: 'from-green-400 to-teal-500' });
    if (persona === 'parent') badges.push({ type: 'heart', label: 'Gator Parent', color: 'from-red-400 to-pink-500' });

    return badges;
  };

  const posterBadges = getUserBadges(poster.persona, poster.help_count || 0);

  const handleOfferHelp = async () => {
    if (!user) {
      // If user is not logged in, trigger authentication modal
      if (onOpenAuthModal) {
        onOpenAuthModal();
      } else {
        // Fallback or local state if no external modal handler is provided
        setShowAuthPrompt(true);
        toast({
          title: "Sign In Required",
          description: "Please sign in to offer help.",
          variant: "destructive"
        });
      }
      return;
    }

    if (user.email === request.created_by) {
      toast({
        title: "🚫 Action Blocked",
        description: "You can't offer help for your own request.",
        variant: "destructive"
      });
      return;
    }

    if (hasHelped) return; // Prevent multiple actions

    setIsOfferingHelp(true);

    try {
      // Create the help offer
      // This line assumes 'HelpOffer' is an available object with a 'create' method (e.g., an ORM or API client).
      // If 'HelpOffer' is not defined in your environment, this will cause a runtime error.
      // You might need to import it or define a mock for development.
      // Example mock for compilation if HelpOffer isn't globally available:
      const HelpOffer = window.HelpOffer || {
        create: async (data) => {
          console.log("Mock HelpOffer.create called with:", data);
          return { id: `mock-${Date.now()}`, ...data };
        }
      };

      const helpOffer = await HelpOffer.create({
        request_id: request.id,
        request_title: request.role,
        offerer_user_id: user.id,
        recipient_email: request.created_by,
        message: `Hi! I'd love to help with your ${request.role} search. Let me know how I can assist!`,
        offerer_role: user.persona || 'alumni'
      });

      // Send notification email
      try {
        const { sendHelpOfferNotification } = await import('@/functions/sendHelpOfferNotification');
        await sendHelpOfferNotification({
          helpOffer,
          request,
          helper: user
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
        // Don't fail the whole operation if email fails, but log it.
      }

      // Success feedback (original handleStepUp logic merged)
      setShowConfetti(true);
      setHasHelped(true); // Mark as helped to disable further actions
      updateUserStats('helps', 1); // Update user's help stats

      toast({
        title: "🙋‍♂️ You stepped up!",
        description: `Your help offer has been sent to ${poster.full_name || 'the request poster'}.`,
        duration: 4000,
      });

      // Callback to parent component - using the new prop name 'onOfferHelp'
      onOfferHelp(request.id);

      // Hide confetti after animation
      setTimeout(() => setShowConfetti(false), 3000);

    } catch (error) {
      console.error('Failed to offer help:', error);
      toast({
        title: "Failed to offer help",
        description: "There was an issue sending your offer. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsOfferingHelp(false);
    }
  };

  const handleMakeIntro = () => {
    if (hasHelped) return; // If already helped, don't make intro (can be adjusted based on business logic)

    setShowConfetti(true);
    setHasHelped(true); // Mark as helped to disable further actions
    updateUserStats('intros', 1);

    toast({
      title: "🤝 Introduction made!",
      description: "You're connecting Gators. The network grows stronger!",
      duration: 4000,
    });

    onMakeIntro(request.id);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleLike = () => {
    if (!isLiked) {
      setIsLiked(true);
      setLikeCount(prev => prev + 1);
      updateUserStats('likes', 1);

      // Subtle celebration for likes
      toast({
        title: "❤️ Liked!",
        description: "Showing love for fellow Gators",
        duration: 2000,
      });
    } else {
      setIsLiked(false);
      setLikeCount(prev => prev - 1);
    }
  };

  const handleShare = (platform) => {
    const url = `https://collegefastforward.com/request/${request.id}`;
    const text = `Help ${poster.full_name || 'a fellow Gator'} with: ${request.role}`;

    updateUserStats('shares', 1);

    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    }

    toast({
      title: "📢 Shared!",
      description: `Spreading the Gator spirit on ${platform}!`,
      duration: 3000,
    });
  };

  // Determine if a "Hot" badge should be shown
  const badge = index < 3 ? {
    text: "Hot",
    color: "bg-gradient-to-r from-orange-400 to-red-500 text-white"
  } : null;

  const cardVariants = {
    initial: { opacity: 0, y: 50, scale: 0.9 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut"
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
      transition: { duration: 0.3 }
    }
  };

  // buttonVariants are no longer needed as motion.button is replaced by Button components

  return (
    <>
      <ConfettiCelebration trigger={showConfetti} />

      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        className="break-inside-avoid mb-6"
      >
        <Card className="group bg-white overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-0">
            {/* Enhanced Header with Badges */}
            <div className="p-5 pb-3">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="relative"
                  >
                    <UserAvatar user={poster} className="w-14 h-14 rounded-full ring-3 ring-white shadow-xl" />
                  </motion.div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-900 text-base">
                        {poster.full_name || 'A Gator'}
                      </h4>
                      {posterBadges.length > 0 && (
                        <div className="flex gap-1">
                          {posterBadges.slice(0, 2).map((badge, idx) => (
                            <motion.div
                              key={idx}
                              className={`w-5 h-5 rounded-full bg-gradient-to-r ${badge.color} flex items-center justify-center`}
                              whileHover={{ scale: 1.2, rotate: 360 }}
                              transition={{ duration: 0.3 }}
                              title={badge.label}
                            >
                              {badge.type === 'crown' && '👑'}
                              {badge.type === 'trophy' && '🏆'}
                              {badge.type === 'star' && '⭐'}
                              {badge.type === 'graduation' && '🎓'}
                              {badge.type === 'heart' && '❤️'}
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span>
                        {poster.persona === 'alumni' ? '🎓 Alumni' :
                          poster.persona === 'parent' ? '👨‍👩‍👧‍👦 Parent' : '📚 Student'}
                        {poster.graduation_year && ` '${String(poster.graduation_year).slice(-2)}`}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(request.created_date)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trending/Featured Badge */}
                {badge && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    <Badge className={`${badge.color} border-0 font-bold text-xs px-2 py-1`}>
                      {badge.text}
                    </Badge>
                  </motion.div>
                )}
              </div>

              {/* Enhanced Content */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h3
                  className="font-bold text-slate-900 text-lg mb-2 cursor-pointer hover:text-blue-600 transition-colors line-clamp-2"
                  onClick={() => onOpenModal(request.id)}
                >
                  {request.role}
                </h3>

                <p className="text-slate-600 leading-relaxed mb-4 line-clamp-3 text-sm">
                  {request.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    {request.location_preference || 'Remote'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Briefcase className="w-3 h-3 mr-1" />
                    {request.target_industry}
                  </Badge>
                  {request.job_type && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {request.job_type.replace(/_/g, ' ')}
                    </Badge>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Combined Engagement & Action Bar */}
            <div className="px-5 py-3 bg-slate-50 border-t"> {/* Kept original padding for engagement stats */}
              {/* Engagement Stats Bar */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <button
                    className="flex items-center gap-1 hover:text-red-500 transition-colors"
                    onClick={handleLike}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    {likeCount}
                  </button>

                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {(request.offers_count || 0) + (request.intros_count || 0)} helpers
                  </span>

                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {request.views_count || Math.floor(Math.random() * 100) + 50}
                  </span>
                </div>
              </div>

              {/* Action buttons - as per outline */}
              <div className="p-4 bg-slate-50 border-t space-y-3 -mx-5 -mb-3"> {/* Negative margins to counter parent padding */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleOfferHelp} // Kept internal handler for functionality
                    disabled={hasHelped || isOfferingHelp}
                    size="sm"
                    className={`w-full font-semibold ${
                      hasHelped || isOfferingHelp
                        ? 'bg-green-500 cursor-not-allowed text-white'
                        : 'bg-[var(--uf-blue)] hover:bg-blue-700 text-white'
                    }`}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    {isOfferingHelp ? 'Sending...' : (hasHelped ? '✅ Helped!' : 'Step Up 🐊')}
                  </Button>

                  <Button
                    onClick={handleMakeIntro} // Kept internal handler for functionality
                    disabled={hasHelped}
                    variant="outline"
                    size="sm"
                    className={`w-full font-semibold ${
                      hasHelped
                        ? 'bg-green-500 cursor-not-allowed text-white'
                        : 'border-[var(--uf-blue)] text-[var(--uf-blue)] hover:bg-blue-50'
                    }`}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    {hasHelped ? '🤝 Connected!' : 'Introduce'}
                  </Button>
                </div>

                <Button
                  onClick={() => onOpenModal(request.id)} // View Full Request now a button
                  variant="ghost"
                  size="sm"
                  className="w-full text-slate-600 hover:text-slate-900"
                >
                  View Full Request
                </Button>
              </div>

              {/* Share Buttons - Preserved and integrated into the footer structure */}
              <div className="flex justify-center pt-3"> {/* Added pt-3 for spacing below action buttons */}
                <button
                  onClick={() => handleShare('linkedin')}
                  className="w-full flex items-center justify-center px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <Share2 className="w-3 h-3 mr-1" />
                  Share on LinkedIn
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
};

export default ViralFeedCard;
