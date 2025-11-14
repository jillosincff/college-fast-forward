
import { useState, useEffect } from 'react';
import { JobRequest } from '@/entities/JobRequest';
import { User } from '@/entities/User';
import { HelpOffer } from '@/entities/HelpOffer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Briefcase, Building, Calendar, FileText, Globe, Zap, Heart, Home, ExternalLink, Edit, MoreVertical, Trash2, Star, Shield } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { useAuth } from '@/components/auth/AuthContext';
import { trackEvent } from '@/components/utils/analytics';
import { useToast } from '@/components/ui/use-toast';
import NetworkModal from '../jobs/NetworkModal'; // Use the existing NetworkModal instead
import ConnectionSuccessModal from '../connections/ConnectionSuccessModal';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const DetailItem = ({ icon: Icon, label, value, isLink = false, linkUrl = "" }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-slate-600" />
      </div>
      <div>
        <dt className="text-sm font-semibold text-slate-800">{label}</dt>
        <dd className="text-sm text-slate-600">
          {isLink ? (
            <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--uf-blue)] hover:underline inline-flex items-center gap-1">
              {value}
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            value
          )}
        </dd>
      </div>
    </div>
  );
};

const getDegreeColor = (degree) => {
  switch(degree) {
    case 1: return 'bg-green-100 text-green-800 border-green-200';
    case 2: return 'bg-blue-100 text-blue-800 border-blue-200';
    case 3: return 'bg-slate-100 text-slate-800 border-slate-200';
    default: return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

const sampleData = {
  'sample-1': {
    request: {
      id: 'sample-1', role: 'Software Engineer', title: 'Recent CS grad seeking entry-level software engineering roles',
      description: 'Hi Gator Nation! I just graduated with a Computer Science degree and I\'m actively seeking entry-level software engineering positions. I have experience with React, Node.js, Python, and have completed several internships. I\'m particularly interested in fintech and healthtech companies but open to all opportunities. Would love to connect with alumni who can provide insights, referrals, or just general career advice. Go Gators! 🐊',
      target_industry: 'Technology', job_type: 'full_time', location_preference: 'Remote',
      created_date: subDays(new Date(), 0).toISOString(), created_by: 'sample1@ufl.edu', is_boosted: true, status: 'active',
      mockDegree: 1,
      resume_url: 'https://example.com/emily-johnson-resume.pdf',
    },
    poster: {
      email: 'sample1@ufl.edu', full_name: 'Emily Johnson', persona: 'student', graduation_year: 2024,
      profile_image_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/99bf20d25_hannah-busing-ahrrLDtnuNU-unsplash1.jpg',
    }
  },
  'sample-2': {
    request: {
      id: 'sample-2', role: 'Product Designer', title: 'UX/UI Designer with 3+ years experience looking for next challenge',
      description: 'Passionate product designer with a strong portfolio in consumer tech. Skilled in Figma, prototyping, user research, and design systems. Looking for mid to senior-level roles where I can contribute to impactful products. Open to remote or hybrid opportunities. Let\'s connect if your team is building something amazing!',
      target_industry: 'Software', job_type: 'full_time', location_preference: 'Remote',
      created_date: subDays(new Date(), 2).toISOString(), created_by: 'sample2@ufl.edu', is_boosted: false, status: 'active',
      mockDegree: 2,
      resume_url: 'https://example.com/david-lee-portfolio.pdf',
    },
    poster: {
      email: 'sample2@ufl.edu', full_name: 'David Lee', persona: 'alumni', graduation_year: 2019,
      profile_image_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/542b0822d_alex-starnes-PK_t0Lrh7MM-unsplash.jpg',
    }
  },
  'sample-3': {
    request: {
      id: 'sample-3', role: 'Marketing Specialist', title: 'Recent grad seeking entry-level marketing role in sports industry',
      description: 'Go Gators! I\'m a recent UF Marketing graduate with a passion for sports. I have experience in social media management, content creation, and event planning through various student organizations. Eager to break into the sports marketing world. Any Gator alumni in the industry willing to share advice or opportunities?',
      target_industry: 'Sports', job_type: 'full_time', location_preference: 'On-site',
      created_date: subDays(new Date(), 5).toISOString(), created_by: 'sample3@ufl.edu', is_boosted: true, status: 'active',
      mockDegree: 1,
      posted_by_parent: true,
    },
    poster: {
      email: 'sample3@ufl.edu', full_name: 'Jessica Adams', persona: 'student', graduation_year: 2025,
      profile_image_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/9528eb42c_linkedin-sales-solutions-pAtA8xe_iVM-unsplash.jpg',
    }
  }
};

export default function JobRequestDetail({ requestId, onBack, inviteData, onSendHelp }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [request, setRequest] = useState(null);
  const [poster, setPoster] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNetworkModal, setShowNetworkModal] = useState(false); // Changed from showConnectModal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmittingHelp, setIsSubmittingHelp] = useState(false);
  const [isConnectRequested, setIsConnectRequested] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInvitedUser, setIsInvitedUser] = useState(false);

  useEffect(() => {
    const loadRequestDetails = async () => {
      setIsLoading(true);

      try {
        let currentRequestData = null;
        let requestPosterData = null;

        if (sampleData[requestId]) {
          // It's a sample request, load data locally
          const { request: sampleRequest, poster: sampleUser } = sampleData[requestId];
          currentRequestData = sampleRequest;
          requestPosterData = sampleUser;
          setRequest(sampleRequest);
          setPoster(sampleUser);
        } else {
          // It's a real request, fetch from the database
          const req = await JobRequest.get(requestId);
          if (req) {
            // Assign a random mock degree for real requests
            currentRequestData = { ...req, mockDegree: [1, 2, 3][Math.floor(Math.random() * 3)] };
            setRequest(currentRequestData);

            const requestPoster = await User.filter({ email: req.created_by });
            requestPosterData = requestPoster[0] || null;
            setPoster(requestPosterData);
          }
        }

        // Check if this is an invited user
        if (inviteData?.is_valid) {
          setIsInvitedUser(true);
          // Auto-trigger the help modal for invited users
          setTimeout(() => {
            setShowNetworkModal(true); // Use new state name
          }, 500);
        }

        // Track page view - important to check 'request' after it's been set
        if (currentRequestData) {
            trackEvent('six_degrees_detail_view', {
                requestId: currentRequestData.id,
                industry: currentRequestData.target_industry,
                jobType: currentRequestData.job_type,
                from_invite: !!inviteData,
                is_sample: Object.keys(sampleData).includes(requestId)
            });
        }
      } catch (error) {
        console.error("Error loading request details:", error);
      }
      setIsLoading(false);
    };

    if (requestId) {
      loadRequestDetails();
      if(user) {
        const userFavorites = JSON.parse(localStorage.getItem(`job_favorites_${user.email}`) || '[]');
        setIsFavorite(userFavorites.includes(requestId));
      }
    }
  }, [requestId, user, inviteData]);

  const handleToggleFavorite = () => {
    if (!user) return; // User must be logged in to favorite
    const oldFavorites = JSON.parse(localStorage.getItem(`job_favorites_${user.email}`) || '[]');
    const newFavorites = new Set(oldFavorites);
    const currentlyIsFavorite = newFavorites.has(requestId);

    if (currentlyIsFavorite) {
      newFavorites.delete(requestId);
      trackEvent('six_degrees_unfavorited', { requestId: requestId });
    } else {
      newFavorites.add(requestId);
      trackEvent('six_degrees_favorited', { requestId: requestId });
    }

    localStorage.setItem(`job_favorites_${user.email}`, JSON.stringify([...newFavorites]));
    setIsFavorite(!currentlyIsFavorite);
  };

  const handleConnectClick = () => {
    if (request) {
      setShowNetworkModal(true); // Use new state name
      trackEvent('six_degrees_connect_clicked', {
        requestId: request.id,
        source: 'detail_page',
        from_invite: isInvitedUser,
        is_sample: Object.keys(sampleData).includes(requestId)
      });
    }
  };

  const handleNetworkHelp = async (helpData) => {
    setIsSubmittingHelp(true);
    try {
      await HelpOffer.create({
        request_id: request.id,
        request_title: request.title || request.role,
        offerer_user_id: user.id,
        offerer_role: user.persona,
        recipient_email: request.created_by,
        message: helpData.message,
        selected_degree: helpData.selectedDegree || 1, // Use selectedDegree from helpData, or default to 1
      });

      trackEvent('help_offer_sent', {
        request_id: request.id,
        helper_persona: user.persona,
        from: 'detail_view'
      });

      setShowNetworkModal(false);
      setShowSuccessModal(true); // Show success modal after sending help
      setIsConnectRequested(true); // Mark as sent after successful submission

      // Notify parent about the sent help
      if (onSendHelp) {
        onSendHelp(request.id);
      }

    } catch (error) {
       console.error("Error sending help offer:", error);
       toast({
        title: "Error Sending Offer",
        description: "Could not send your help offer. Please try again.",
        variant: "destructive",
      });
    }
     setIsSubmittingHelp(false);
  };

  const handleEditClick = () => {
    // Don't allow editing sample requests
    if (Object.keys(sampleData).includes(requestId)) {
      alert('This is a sample request and cannot be edited.');
      return;
    }
    trackEvent('six_degrees_edit_clicked', { requestId: request.id });
    console.log('Edit request:', request.id);
  };

  const handleDeleteClick = () => {
    // Don't allow deleting sample requests
    if (Object.keys(sampleData).includes(requestId)) {
      alert('This is a sample request and cannot be deleted.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      trackEvent('six_degrees_delete_clicked', { requestId: request.id });
      console.log('Delete request:', request.id);
      onBack(); // Navigate back after deletion
    }
  };

  // Check if current user owns this request (sample requests are never owned by current user)
  const isOwnRequest = user && request && request.created_by === user.email && !Object.keys(sampleData).includes(requestId);

  // Critical Security Fix: Only show sensitive data to authorized users
  const canViewSensitiveData = user && request && (
    user.email === request.created_by || // Poster themselves
    user.persona === 'alumni' || // Alumni can help
    user.persona === 'parent'    // Parents can help
  );

  const canViewResumeUrl = canViewSensitiveData && request?.resume_url;


  if (isLoading) {
    return (
      <div className="p-4 md:p-8">
        <div className="h-10 w-48 bg-slate-200 rounded-lg animate-pulse mb-8" />
        <div className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-slate-800">Request Not Found</h2>
        <p className="text-slate-600 mt-2">The request you are looking for does not exist or has been removed.</p>
        <Button onClick={onBack} variant="outline" className="mt-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to All Requests
        </Button>
      </div>
    );
  }

  // Format description with paragraph breaks
  const formattedDescription = request.description?.split('\n').map((paragraph, index) => (
    <p key={index} className={`text-slate-700 leading-relaxed ${index > 0 ? 'mt-4' : ''}`}>
      {paragraph}
    </p>
  ));

  const displayTitle = request.title || request.role;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col bg-white"
    >
      <div className="max-w-5xl mx-auto flex-grow px-4 md:px-8 pt-4 pb-20">
        {/* Breadcrumb Navigation */}
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-6 hover:bg-slate-100 transition-colors"
          aria-label="Go back to all job requests"
        >
          <Home className="w-4 h-4 mr-2" />
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to All Requests
        </Button>

        {/* Sample Request Notice */}
        {Object.keys(sampleData).includes(requestId) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
          >
            <p className="text-blue-800 text-sm">
              <strong>Sample Request:</strong> This is an example to show how requests appear. Click "Offer Help" to see the connection flow!
            </p>
          </motion.div>
        )}

        {/* Invite Context Banner */}
        {isInvitedUser && inviteData && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
          >
            <p className="text-green-800 text-sm">
              <strong>You were invited by {inviteData.helper_name}</strong> to connect with {poster?.full_name?.split(' ')[0] || 'this student'}.
            </p>
          </motion.div>
        )}

        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-visible">
          <CardHeader className="p-6 border-b">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                {/* Badges - Updated Parent badge */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {request.is_boosted && (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200" aria-label="This request has been boosted for visibility">
                      <Zap className="w-3 h-3 mr-1" />
                      Boosted
                    </Badge>
                  )}
                  {request.posted_by_parent && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className="bg-orange-100 text-orange-800 border border-orange-300 shadow-md flex items-center justify-center w-8 h-8 p-0 rounded-full" aria-label="This request was posted by a parent">
                          <Heart className="w-3 h-3" />
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Parent Sponsored</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {request.mockDegree && (
                    <Badge className={`${getDegreeColor(request.mockDegree)} font-semibold`} aria-label={`You are ${request.mockDegree} degrees away from this opportunity`}>
                      {request.mockDegree}° Connection
                    </Badge>
                  )}
                </div>

                <CardTitle className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                  {displayTitle}
                </CardTitle>
                <p className="text-slate-600">
                  Posted on {format(new Date(request.created_date), 'MMMM d, yyyy')}
                  {poster && ` by ${poster.full_name}`}
                </p>
              </div>

              {/* Top-right CTA - Enhanced for invited users */}
              <div className="flex-shrink-0 flex items-center gap-3">
                {isOwnRequest ? (
                  // User owns this request - show edit/manage options
                  <>
                    <Button
                      size="lg"
                      variant="outline"
                      className="px-6 focus:outline-none focus:ring-2 focus:ring-[var(--uf-blue)] focus:ring-offset-2"
                      onClick={handleEditClick}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Request
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="lg" className="px-3 focus:outline-none focus:ring-2 focus:ring-[var(--uf-blue)] focus:ring-offset-2">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleDeleteClick} className="text-red-600 focus:text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Request
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  // User doesn't own this request - show connect options
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleToggleFavorite}
                      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      className="rounded-full w-12 h-12"
                    >
                      <Star className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
                    </Button>
                    {isConnectRequested ? (
                      <Button
                        variant="outline"
                        size="lg"
                        disabled
                        className="px-8"
                        aria-label="Help offer already sent"
                      >
                        Offer Sent
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        className={`px-8 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
                          isInvitedUser
                            ? 'bg-green-600 hover:bg-green-700 ring-green-600 text-white font-bold'
                            : 'bg-[var(--uf-blue)] hover:bg-[var(--uf-blue-light)] ring-[var(--uf-blue)]'
                        }`}
                        onClick={handleConnectClick}
                        aria-label={`Offer help to ${poster?.full_name || 'the poster'} about this opportunity`}
                      >
                        {isInvitedUser ? "I'm Here to Help" : "Offer Help"}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6"> {/* Added space-y-6 for consistent spacing */}
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Request Details</h3>
              <div className="prose prose-slate max-w-none">
                {formattedDescription}
              </div>

              {/* SECURITY FIX: Only show resume to authorized users */}
              {canViewResumeUrl && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[var(--uf-blue)]" />
                    Resume
                  </h3>
                  <Button
                    onClick={() => window.open(request.resume_url, '_blank')}
                    variant="outline"
                    className="w-full"
                    aria-label="View resume in new tab"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Resume
                  </Button>
                </div>
              )}

              {/* PRIVACY: Only show contact info to helpers (this message applies broadly) */}
              {!canViewSensitiveData && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <Shield className="w-6 h-6 text-blue-600 mb-2" />
                  <h3 className="font-semibold text-blue-900">Privacy Protected</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Connect through the platform to protect everyone's privacy. Personal details are only shared with verified helpers.
                  </p>
                </div>
              )}

            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Key Information</h3>
                <dl className="space-y-6">
                  <DetailItem
                    icon={Building}
                    label="Target Company"
                    value={request.target_company}
                  />
                  <DetailItem
                    icon={Briefcase}
                    label="Target Industry"
                    value={request.target_industry}
                  />
                  <DetailItem
                    icon={Globe}
                    label="Location Preference"
                    value={request.location_preference}
                  />
                  <DetailItem
                    icon={Calendar}
                    label="Job Type"
                    value={request.job_type?.replace('_', ' ')}
                  />
                  {/* The resume DetailItem is removed from here and moved to main content with conditional rendering */}
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sticky Footer CTA - Also conditional based on ownership */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900 truncate">{displayTitle}</h4>
            <p className="text-sm text-slate-600">{request.target_company || request.target_industry}</p>
          </div>
          <div className="flex items-center gap-3 ml-4">
            {isOwnRequest ? (
              // User owns this request - show edit options
              <>
                <Button
                  variant="outline"
                  onClick={handleEditClick}
                  className="hidden sm:flex"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Request
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="sm:hidden">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleEditClick}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Request
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDeleteClick} className="text-red-600 focus:text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Request
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              // User doesn't own this request - show connect button
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleFavorite}
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  className="rounded-full w-10 h-10" // Smaller size for footer
                >
                  <Star className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
                </Button>
                {isConnectRequested ? (
                  <Button variant="outline" disabled>
                    Offer Sent
                  </Button>
                ) : (
                  <Button
                    className="bg-[var(--uf-blue)] hover:bg-[var(--uf-blue-light)]"
                    onClick={handleConnectClick}
                  >
                    Offer Help
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Connect Modal */}
      <AnimatePresence>
        {showNetworkModal && request && poster && (
          <NetworkModal
            isOpen={showNetworkModal}
            onClose={() => setShowNetworkModal(false)}
            request={request}
            poster={poster}
            onSubmit={handleNetworkHelp} // Updated to use handleNetworkHelp
            isSubmitting={isSubmittingHelp}
          />
        )}
      </AnimatePresence>

      {/* Connection Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <ConnectionSuccessModal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            request={request}
            poster={poster}
            helperName={user?.full_name?.split(' ')[0]}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
