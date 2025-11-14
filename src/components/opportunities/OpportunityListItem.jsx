
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  MapPin, 
  Clock, 
  Building, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Sparkles,
  MessageSquare,
  Bookmark,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatOpportunityType, formatLocationDisplay } from '@/components/utils/format';
import { useAuth } from '@/components/auth/AuthContext';
import { trackEvent } from '@/components/utils/analytics';
import AskButton from './AskButton';

const getRoleBadgeEnhanced = (role, posterName) => {
  const styles = {
    parent: { 
      bg: 'bg-gradient-to-r from-[#ff6b35] to-[#e55a2b]', 
      text: 'text-white',
      icon: '👨‍💼',
      advantage: 'Insider Access'
    },
    alumni: { 
      bg: 'bg-gradient-to-r from-[#4a90e2] to-[#357abd]', 
      text: 'text-white',
      icon: '🎓',
      advantage: 'Direct Connection'
    },
    student: { // Updated student role
      bg: 'bg-gradient-to-r from-[#7c4dff] to-[#651fff]', 
      text: 'text-white',
      icon: '🔗',
      advantage: 'Gator Vetted'
    }
  };
  return styles[role] || styles.alumni;
};

const getInitials = (name) => {
  if (!name) return 'UF';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const ConnectionModal = ({ isOpen, onClose, opportunity, posterName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl p-6 max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-4">Connect with {posterName}</h3>
        <div className="text-center mb-6">
          <Avatar className="w-16 h-16 mx-auto mb-3">
            <AvatarImage src={opportunity.poster_avatar_url} alt={posterName} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              {getInitials(posterName)}
            </AvatarFallback>
          </Avatar>
          <p className="font-semibold">{posterName}</p>
          <p className="text-sm text-slate-600">{opportunity.company_name}</p>
        </div>
        <p className="text-slate-700 mb-6 text-sm">
          "Happy to help fellow Gators! Ask me about company culture, interview process, or career guidance."
        </p>
        <div className="space-y-3">
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            <MessageSquare className="w-4 h-4 mr-2" />
            Send Direct Message
          </Button>
          <Button variant="outline" className="w-full">
            Request 15min Coffee Chat
          </Button>
          <Button variant="outline" className="w-full">
            Ask a Quick Question
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default function OpportunityListItem({ 
  opportunity, 
  isExpanded, 
  onToggleExpand, 
  animationDelay = 0,
  showAIRecommendation = false 
}) {
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);

  const {
    id, title, company_name, posted_by_persona, poster_name, poster_avatar_url,
    opportunity_type, location_type, city, state, description, tags, 
    apply_method, apply_url, apply_email, created_date, is_boosted,
    view_count = 6, save_count = 0, apply_click_count = 11, question_count = 3
  } = opportunity;

  const roleBadge = getRoleBadgeEnhanced(posted_by_persona, poster_name);
  const timeAgo = formatDistanceToNow(new Date(created_date), { addSuffix: true });

  const personaText = posted_by_persona
    ? posted_by_persona.charAt(0).toUpperCase() + posted_by_persona.slice(1)
    : 'Community';

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    onToggleExpand();
  };

  const handleConnectionClick = () => {
    setShowConnectionModal(true);
    trackEvent('opportunity_connection_click', { id, posterRole: posted_by_persona });
  };

  const handleApply = async () => {
    trackEvent('opportunity_apply_click', { id, method: apply_method });
    
    switch (apply_method) {
      case 'external':
        window.open(apply_url, '_blank', 'noopener,noreferrer');
        break;
      case 'email':
        const subject = `Application: ${title} - ${user?.full_name || 'Interested Gator'}`;
        window.location.href = `mailto:${apply_email}?subject=${encodeURIComponent(subject)}`;
        break;
      case 'message':
        break;
    }
  };

  const getConnectionCTA = () => {
    const posterFirstName = poster_name?.split(' ')[0] || 'Poster';
    
    switch (posted_by_persona) {
      case 'parent':
        return `🎯 Ask ${posterFirstName} (Parent) about the hiring manager`;
      case 'alumni':
        return `💬 Chat with ${posterFirstName} (Alumni) about company culture`;
      case 'student':
        return `💡 Ask ${posterFirstName} why they recommend this`;
      default:
        return `👥 Connect with ${posterFirstName} who shared this`;
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: animationDelay, duration: 0.4 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card className={`relative overflow-hidden transition-all duration-300
          ${isExpanded ? 'shadow-lg border-blue-200' : 'shadow-sm hover:shadow-md'}
          ${is_boosted ? 'ring-2 ring-amber-200 bg-gradient-to-r from-amber-50 to-orange-50' : 'bg-white'}
        `}>
          {/* AI Recommendation Badge */}
          {showAIRecommendation && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-purple-100 text-purple-800 text-xs font-semibold">
                <Sparkles className="w-3 h-3 mr-1" />
                Recommended
              </Badge>
            </div>
          )}

          {/* Boost Banner */}
          {is_boosted && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500"></div>
          )}

          <CardContent className="p-4 sm:p-6">
            {/* Main Content Row */}
            <div className="flex items-start gap-4 cursor-pointer" onClick={handleCardClick}>
              {/* Company Logo/Avatar */}
              <Avatar className="w-12 h-12 flex-shrink-0 ring-2 ring-slate-100">
                <AvatarImage src={poster_avatar_url} alt={company_name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {getInitials(company_name || poster_name)}
                </AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Title and Company */}
                <div className="mb-2">
                  <h3 className="text-lg font-semibold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {title}
                  </h3>
                  <p className="text-sm text-slate-600 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    {company_name}
                  </p>
                </div>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {formatLocationDisplay(location_type, city, state)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {timeAgo}
                  </div>
                </div>

                {/* Enhanced Network Badge */}
                <div className="mb-3">
                  <span className={`network-badge-enhanced inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${roleBadge.bg} ${roleBadge.text}`}>
                    <span className="mr-2">{roleBadge.icon}</span>
                    Posted by {personaText} → 
                    <strong className="ml-1">{roleBadge.advantage}</strong>
                  </span>
                </div>

                {/* Opportunity Indicators */}
                <div className="opportunity-indicators flex flex-wrap gap-2 mb-3">
                  <span className="indicator hot inline-block px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-600">
                    🔥 {apply_click_count} Gators applied (48h)
                  </span>
                  {posted_by_persona !== 'student' && ( 
                    <span className="indicator insider inline-block px-2 py-1 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-600">
                      ⭐ Poster is an insider 
                    </span>
                  )}
                  {posted_by_persona === 'student' && ( 
                     <span className="indicator vetted inline-block px-2 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-600">
                      ✅ Vetted by a fellow Gator
                    </span>
                  )}
                  {showAIRecommendation && (
                    <span className="indicator intelligence inline-block px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-600">
                      🎯 Network intelligence find 
                    </span>
                  )}
                  <span className="indicator trending inline-block px-2 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-600"> 
                    📈 Popular in your network 
                  </span>
                </div>

                {/* Tags and Type */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {formatOpportunityType(opportunity_type)}
                  </Badge>
                  
                  {/* Additional Tags */}
                  {tags?.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  
                  {tags?.length > 2 && (
                    <span className="text-xs text-slate-500">+{tags.length - 2} more</span>
                  )}
                </div>

                {/* Direct Connection CTA */}
                <div className="connection-actions mb-3">
                  <button
                    onClick={handleConnectionClick}
                    className={`connection-btn bg-white/80 backdrop-blur-sm border hover:bg-white/90 hover:-translate-y-0.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-sm ${posted_by_persona === 'student' ? 'border-purple-200 text-purple-800' : 'border-slate-200 text-slate-700'}`}
                  >
                    {getConnectionCTA()}
                  </button>
                </div>

                {/* Enhanced Engagement Stats */}
                <div className="enhanced-stats flex items-center gap-4 text-xs text-slate-500">
                  <div className="stat-group flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span className="stat-number font-semibold">{view_count}</span>
                    <span className="stat-label">views</span>
                  </div>
                  <div className="stat-group flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    <span className="stat-number font-semibold">{question_count}</span>
                    <span className="stat-label">questions</span>
                    {question_count > 0 && (
                      <span className="stat-badge bg-green-100 text-green-600 px-1 py-0.5 rounded text-xs ml-1">Active Discussion</span>
                    )}
                  </div>
                  <div className="stat-group flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    <span className="stat-number font-semibold">{apply_click_count}</span>
                    <span className="stat-label">applied</span>
                    {apply_click_count > 8 && (
                      <span className="stat-badge bg-orange-100 text-orange-600 px-1 py-0.5 rounded text-xs ml-1">High Interest</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons and Expand Icon */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onToggleExpand}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-6 h-6 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-slate-400" />
                  )}
                </motion.div>
              </div>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-4 border-t border-slate-100">
                    {/* Description */}
                    <div className="prose prose-sm max-w-none mb-6">
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {description}
                      </p>
                    </div>

                    {/* All Tags (Expanded) */}
                    {tags && tags.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-slate-900 mb-2">Skills & Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        onClick={handleApply}
                        className="bg-orange-600 hover:bg-orange-700 text-white flex-1 sm:flex-none"
                      >
                        Apply Now
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                      
                      <AskButton
                        oppId={id}
                        posterId={opportunity.created_by}
                        posterEmail={opportunity.poster_email}
                        oppTitle={title}
                        variant="outline"
                        className="flex-1 sm:flex-none"
                      />
                      
                      <Button variant="ghost" size="sm" className="flex-shrink-0">
                        <Bookmark className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Connection Modal */}
      <ConnectionModal
        isOpen={showConnectionModal}
        onClose={() => setShowConnectionModal(false)}
        opportunity={opportunity}
        posterName={poster_name}
      />
    </>
  );
}
