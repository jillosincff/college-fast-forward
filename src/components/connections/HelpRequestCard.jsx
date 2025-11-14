
import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { trackEvent } from '@/components/utils/analytics';
import { Eye, HandHeart, Users2 } from 'lucide-react';
import QuickComposeModal from './QuickComposeModal';
import RequestDetailModal from './RequestDetailModal';
import HelpOfferModal from './HelpOfferModal'; // New import for the 'clean' variant

// --- Stat Components for Friendly Zero-States ---

const StatViews = ({ views }) => {
  if (views === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
            aria-label="New request">
        <Eye className="w-3 h-3" /> New
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-700" aria-label={`${views} views`}>
      <Eye className="w-3 h-3" /> <strong className="font-semibold tabular-nums">{views}</strong> views
    </span>
  );
};

const StatOffers = ({ offers, views }) => {
  if (offers === 0) {
    if (views >= 10) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-[#FA4616]"
              aria-label="Be the first to help">
          <HandHeart className="w-3 h-3" /> Be the first to help
        </span>
      );
    }
    return (
      <span className="text-xs text-slate-500 inline-flex items-center gap-1" aria-label="No offers yet">
        <HandHeart className="w-3 h-3" /> No offers yet
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-700" aria-label={`${offers} offers`}>
      <HandHeart className="w-3 h-3" /> <strong className="font-semibold tabular-nums">{offers}</strong> offers
    </span>
  );
};

const StatIntros = ({ intros }) => {
  if (intros === 0) {
    return (
      <span className="text-xs text-slate-500 inline-flex items-center gap-1" aria-label="No intros yet">
        <Users2 className="w-3 h-3" /> No intros yet
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-700" aria-label={`${intros} intros`}>
      <Users2 className="w-3 h-3" /> <strong className="font-semibold tabular-nums">{intros}</strong> intros
    </span>
  );
};


const RoleChip = ({ role }) => {
  const styles = {
    student: 'bg-blue-100 text-blue-800',
    parent: 'bg-purple-100 text-purple-800',
    alumni: 'bg-green-100 text-green-800',
  };
  return <Badge className={`border-0 capitalize text-xs ${styles[role] || styles.student}`}>{role}</Badge>;
};

const StatusBadge = ({ label, emoji, color }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-${color}-50 border border-${color}-200 text-${color}-700`}>
    <span aria-hidden="true">{emoji}</span> {label}
  </span>
);

const getBadges = (request) => {
  const badges = [];
  const now = Date.now();
  if (request.is_featured) badges.push({ id: 'featured', label: "Featured", emoji: "✨", color: "purple" });
  
  const isTrending = (request.offers_count + request.intros_count >= 10) || 
                     (new Date(request.last_activity_at) > now - 24 * 3600 * 1000 && request.offers_count + request.intros_count >= 5);
  if (isTrending) badges.push({ id: 'trending', label: "Trending", emoji: "🔥", color: "rose" });

  if (new Date(request.last_activity_at) > now - 10 * 60 * 1000) badges.push({ id: 'active', label: "Active", emoji: "🟢", color: "green" });
  if (new Date(request.created_date) > now - 7 * 24 * 3600 * 1000) badges.push({ id: 'new', label: "New", emoji: "🆕", color: "sky" });
  
  return badges.slice(0, 2);
};

// Helper function to calculate time ago
const calculateTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + "y";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + "mo";
  }
  interval = seconds / 604800; // weeks
  if (interval > 1) {
    return Math.floor(interval) + "w";
  }
  interval = seconds / 86400; // days
  if (interval > 1) {
    return Math.floor(interval) + "d";
  }
  interval = seconds / 3600; // hours
  if (interval > 1) {
    return Math.floor(interval) + "h";
  }
  interval = seconds / 60; // minutes
  if (interval > 1) {
    return Math.floor(interval) + "m";
  }
  return Math.floor(seconds) + "s";
};

export default function HelpRequestCard({ 
  request, 
  currentUser, 
  onUpdate, // Changed from onMutate to onUpdate as per outline
  showBoost = false,
  variant = 'default' // Add variant prop
}) {
  const { toast } = useToast();
  const [showComposeModal, setShowComposeModal] = useState(false); // For default variant
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false); // For clean variant (HelpOfferModal)
  const [isSubmitting, setIsSubmitting] = useState(false); // For clean variant offer help
  
  const badges = getBadges(request);
  const poster = request.poster || {};
  const stats = {
    views: request.views_count || 0,
    offers: request.offers_count || 0,
    intros: request.intros_count || 0,
  };

  // Logic specific to 'clean' variant
  const isNewRequest = (new Date() - new Date(request.created_date)) < (7 * 24 * 60 * 60 * 1000); // New if less than 7 days old
  const timeAgo = calculateTimeAgo(request.created_date);

  const handleOfferHelp = (e) => {
    e.stopPropagation();
    trackEvent('request_card_offer_help_clicked', { requestId: request.id });
    setShowComposeModal(true);
  };

  const handleReadMore = (e) => {
    e.stopPropagation();
    trackEvent('request_card_read_more_clicked', { requestId: request.id });
    setShowDetailModal(true);
  };

  const handleBoost = (e) => {
    e.stopPropagation();
    trackEvent('request_card_boost_clicked', { requestId: request.id });
    toast({ title: 'Coming soon!', description: 'Boost features are being finalized.' });
  };

  const handleComposeModalClose = () => {
    setShowComposeModal(false);
    onUpdate?.(); // Use onUpdate instead of onMutate
  };

  // New function for clean variant's offer help
  const handleHelpOffer = async (formData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call for help offer submission
      // In a real application, you would make an API call here, e.g.:
      // const response = await fetch(`/api/requests/${request.id}/offers`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });
      // if (!response.ok) throw new Error('Failed to submit offer');

      toast({
        title: "Offer sent!",
        description: "Your help offer has been sent to the request poster.",
      });
      setShowHelpModal(false);
      onUpdate?.(); // Trigger update on parent component after successful offer
      trackEvent('help_offer_submitted', { requestId: request.id });
    } catch (error) {
      console.error("Error submitting help offer:", error);
      toast({
        title: "Failed to send offer",
        description: "There was an error sending your offer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (variant === 'clean') {
    return (
      <>
        <style jsx>{`
          .request-card {
            background: white;
            border-radius: 12px;
            padding: 24px;
            border: 1px solid #e2e8f0;
            border-left: 4px solid #F37021;
            transition: all 0.2s;
            position: relative;
          }
          
          .request-card:hover {
            border-color: #cbd5e1;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            transform: translateY(-2px);
          }
          
          .request-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 12px;
          }
          
          .request-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 4px;
          }
          
          .request-meta {
            font-size: 0.875rem;
            color: #64748b;
            margin-bottom: 16px;
          }
          
          .request-new {
            background: #dcfce7;
            color: #166534;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
          }
          
          .request-content {
            color: #374151;
            margin-bottom: 16px;
            line-height: 1.5;
            font-style: italic;
          }
          
          .request-tags {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
            flex-wrap: wrap;
          }
          
          .tag {
            background: rgba(243, 112, 33, 0.1);
            color: #F37021;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 500;
          }
          
          .request-stats {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            font-size: 0.875rem;
            color: #64748b;
          }
          
          .help-count {
            display: flex;
            align-items: center;
            gap: 6px;
          }
          
          .btn-offer-help {
            width: 100%;
            background: #F37021;
            color: white;
            padding: 14px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.2s;
          }
          
          .btn-offer-help:hover {
            background: #e85d0a;
            transform: translateY(-1px);
          }
        `}</style>
        
        <div className="request-card">
          <div className="request-header">
            <div>
              <h3 className="request-title">{request.role || request.title}</h3>
              <p className="request-meta">
                {request.offers_count > 0 
                  ? `${request.offers_count} ${request.offers_count === 1 ? 'person ready' : 'people ready'} to help`
                  : 'No offers yet'
                }
              </p>
            </div>
            {isNewRequest && <span className="request-new">New</span>}
          </div>
          
          <p className="request-content">"{request.description}"</p>
          
          <div className="request-tags">
            {/* These tags are hardcoded in the outline; ideally, they would come from request.tags */}
            <span className="tag">Industry Advice</span>
            <span className="tag">Referrals</span>
          </div>
          
          <div className="request-stats">
            <span className="help-count">
              👥 {isNewRequest ? 'New' : timeAgo} • {request.offers_count || 'No'} offers • {request.intros_count || 'No'} intros yet
            </span>
            <span style={{ cursor: 'pointer', color: '#F37021' }} onClick={() => setShowDetailModal(true)}>
              Read more
            </span>
          </div>
          
          <button 
            className="btn-offer-help"
            onClick={() => setShowHelpModal(true)}
          >
            Offer Help
          </button>

          {/* Keep existing modals */}
          {showHelpModal && (
            <HelpOfferModal
              request={request}
              isOpen={showHelpModal}
              onClose={() => setShowHelpModal(false)}
              onSubmit={handleHelpOffer}
              isSubmitting={isSubmitting}
            />
          )}

          {showDetailModal && (
            <RequestDetailModal
              request={request}
              isOpen={showDetailModal}
              onClose={() => setShowDetailModal(false)}
              onOfferHelp={() => { // Changed from onHelp to onOfferHelp to match existing prop
                setShowDetailModal(false);
                setShowHelpModal(true);
              }}
            />
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <style jsx>{`
        .request-card {
          transition: all 0.3s ease;
        }

        .request-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.12);
        }

        .student-story {
          background: rgba(0,33,165,0.03);
          border-left: 3px solid #0021A5;
        }

        .help-tag {
          background: rgba(255,105,0,0.1);
          color: #FF6900;
        }

        .offer-help-btn {
          background: linear-gradient(45deg, #FF6900, #ff8533);
          transition: all 0.3s ease;
        }

        .offer-help-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(255,105,0,0.3);
        }
      `}</style>

      <article className="request-card bg-white rounded-xl border border-slate-200 border-l-4 border-l-orange-500 shadow-sm hover:shadow-lg transition-all relative p-4">
        {/* Status badges in top-right */}
        {badges.length > 0 && (
          <div className="absolute right-3 top-3 flex gap-1.5 z-10">
            {badges.map(b => <StatusBadge key={b.id} {...b} />)}
          </div>
        )}

        {/* Header with urgency and connection count */}
        <header className="mb-4 flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={poster.profile_image_url} alt={poster.full_name} />
                <AvatarFallback className="text-xs">{poster.full_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-slate-900 leading-tight text-sm">{poster.full_name}</p>
                <div className="flex items-center gap-1.5">
                  <RoleChip role={poster.persona} />
                  {poster.graduation_year && (
                    <span className="text-xs text-slate-500">'{String(poster.graduation_year).slice(-2)}</span>
                  )}
                </div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 pr-12">
              {request.role || request.title}
            </h3>
            {stats.offers > 0 && (
              <div className="text-sm text-green-700 font-medium mb-2">
                {stats.offers} {stats.offers === 1 ? 'person ready' : 'people ready'} to help
              </div>
            )}
          </div>
        </header>

        {/* Student Story */}
        <div className="student-story p-3 rounded-lg mb-4">
          <p className="text-slate-700 italic leading-relaxed text-sm line-clamp-3">
            "{request.description}"
          </p>
        </div>

        {/* Request Meta */}
        <div className="request-meta flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="student-info flex gap-2 text-xs">
            {poster.major && (
              <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                {poster.major}
              </span>
            )}
          </div>
          <div className="help-types flex gap-1">
            <span className="help-tag text-xs px-2 py-1 rounded-full font-medium">
              Industry Advice
            </span>
            <span className="help-tag text-xs px-2 py-1 rounded-full font-medium">
              Referrals
            </span>
          </div>
        </div>

        {/* Stats row with friendly zero-states */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs mb-4">
          <StatViews views={stats.views} />
          <StatOffers offers={stats.offers} views={stats.views} />
          <StatIntros intros={stats.intros} />
          
          <button
            onClick={handleReadMore}
            className="ml-auto text-xs font-medium text-slate-600 underline-offset-2 hover:underline hover:text-slate-800"
          >
            Read more
          </button>
        </div>

        {/* Enhanced Offer Help Button */}
        <button
          onClick={handleOfferHelp}
          className="offer-help-btn w-full text-white border-none py-3 px-6 rounded-xl font-semibold cursor-pointer"
          aria-label={`Offer help for ${request.role || request.title}`}
        >
          💫 Offer Help
        </button>

        {showBoost && (
          <div className="mt-3 text-center">
            <span className="text-xs text-gray-600">⚡ Want more views?</span>
            <button
              onClick={handleBoost}
              className="ml-2 text-xs font-medium text-gray-700 underline hover:text-gray-900"
            >
              Boost
            </button>
          </div>
        )}
      </article>

      <QuickComposeModal
        isOpen={showComposeModal}
        onClose={handleComposeModalClose}
        request={request}
      />

      <RequestDetailModal 
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        request={request}
        onOfferHelp={() => {
          setShowDetailModal(false);
          setShowComposeModal(true);
        }}
      />
    </>
  );
}
