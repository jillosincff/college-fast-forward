import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MessageSquare, Star, Paperclip, Linkedin, MapPin, Calendar, Plane, Globe2 } from 'lucide-react';
import UserAvatar from '@/components/common/UserAvatar';
import MessageUserModal from '@/components/directory/MessageUserModal';
import { getDisplayName } from '@/components/utils/nameUtils';
import { useToast } from '@/components/ui/use-toast';
import { checkFullAccess } from '@/components/access/useAccessControl';
import { base44 } from '@/api/base44Client';

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

export default function EnhancedGatorCard({ gator, request, onHelp, isFeatured, currentUser, isLikedByUser = false, likeCount = 0, onLikeChange, hideEngagement = false }) {
  console.log('🟢 [EnhancedGatorCard] Render - hideEngagement:', hideEngagement, 'gatorName:', gator?.full_name);
  
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const { toast } = useToast();
  
  // Check if the gator (student) has premium access → show Featured badge
  const gatorHasPremium = checkFullAccess(gator);
  const showFeaturedBadge = isFeatured || gatorHasPremium;
  
  const requestId = request?.id;
  
  // Use passed-in like count and status from parent (single batch API call)
  const [displayCount, setDisplayCount] = useState(likeCount);
  const [isLiked, setIsLiked] = useState(isLikedByUser);
  
  // Debug logging
  useEffect(() => {
    console.log('💡 Card mounted/updated:', 
      '\n  requestId:', requestId,
      '\n  isLikedByUser:', isLikedByUser,
      '\n  isLiked:', isLiked,
      '\n  posterName:', request?.poster_name
    );
  }, [requestId, isLikedByUser, isLiked, request?.poster_name]);
  
  // Sync like status and count when props change
  useEffect(() => {
    console.log('🔄 Syncing:', 
      '\n  isLiked from:', isLiked, 'to:', isLikedByUser,
      '\n  count from:', displayCount, 'to:', likeCount,
      '\n  requestId:', requestId
    );
    setIsLiked(isLikedByUser);
    setDisplayCount(likeCount);
  }, [isLikedByUser, likeCount]);
  
  // Check if request is anonymous (parents only)
  const isAnonymous = request?.is_anonymous && request?.poster_type === 'parent';
  
  // Priority: 1. gator.first_name + last_name, 2. request.poster_name, 3. gator.full_name, 4. nameUtils fallback
  // If anonymous, always show "Anonymous Parent"
  const fullName = isAnonymous 
    ? 'Anonymous Parent'
    : (gator.first_name && gator.last_name) 
      ? `${gator.first_name} ${gator.last_name}`
      : request?.poster_name 
        || gator.full_name 
        || getDisplayName(gator);
  const graduationYear = gator.graduation_year ? `Class of ${gator.graduation_year}` : 'UF Student';
  const major = gator.major || 'Undeclared';
  const bio = gator.bio || request?.description || 'Connect with me to learn more!';
  
  // Truncate bio to 1-2 lines (approx 80 chars for tighter display)
  const shouldTruncate = bio.length > 80;
  const displayBio = showFullBio || !shouldTruncate ? bio : bio.substring(0, 80) + '...';

  // Check for LinkedIn and Resume
  const hasLinkedIn = !!gator.linkedin_url;
  const hasResume = !!request?.resume_url;

  // Get Intent (Internship, Full-time, Advice)
  const getIntent = () => {
    if (!request) return null;
    
    const jobType = request.job_type || request.role_type || '';
    const role = request.role || request.target_industry || 'Opportunity';
    
    if (jobType === 'internship') {
      return { type: 'Internship', role, color: 'intent-internship' };
    } else if (jobType === 'full_time' || jobType === 'fulltime') {
      return { type: 'Full-time', role, color: 'intent-fulltime' };
    } else {
      return { type: 'Advice', role: 'Career Guidance', color: 'intent-advice' };
    }
  };

  // Get Location
  const getLocation = () => {
    if (request?.location_city && request?.location_state) {
      return `${request.location_city}, ${request.location_state}`;
    }
    if (request?.location_preference) return request.location_preference;
    if (request?.work_mode === 'remote') return 'Remote';
    if (gator.location) return gator.location;
    return 'Flexible';
  };

  // Get Start Timing
  const getStartTiming = () => {
    if (!request?.start_timing) return null;
    
    const timingMap = {
      'immediate': 'Immediate',
      'asap': 'ASAP',
      'this_semester': 'This Semester',
      'next_semester': 'Next Semester',
      'summer': 'Summer',
      'summer_2025': 'Summer 2025',
      'summer_2026': 'Summer 2026',
      'after_grad_2025': 'After Graduation 2025',
      'after_grad_2026': 'After Graduation 2026'
    };
    
    return timingMap[request.start_timing] || request.start_timing.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  // Extract skills from bio
  const getSkills = () => {
    const skillKeywords = ['python', 'react', 'marketing', 'finance', 'design', 'leadership', 'javascript', 'ai', 'ml', 'excel', 'analytics'];
    const found = [];
    const bioLower = bio.toLowerCase();
    skillKeywords.forEach(skill => {
      if (bioLower.includes(skill)) found.push(skill);
    });
    return found.slice(0, 5);
  };

  const intent = getIntent();
  const location = getLocation();
  const startTiming = getStartTiming();
  const skills = getSkills();

  // Relocation and Visa flags
  const isOpenToRelocate = request?.relocation_ok || false;
  const needsVisaSponsorship = request?.visa_needed || false;

  // Real engagement stats - count from actual HelpOffers
  const [messagesCount, setMessagesCount] = useState(0);
  
  const loadHelpOffersCount = async () => {
    if (!request?.id) return;
    
    try {
      const offers = await base44.entities.HelpOffer.filter({ job_request_id: request.id });
      setMessagesCount(offers?.length || 0);
      console.log('📊 [EnhancedGatorCard] Loaded', offers?.length || 0, 'help offers for', fullName);
    } catch (err) {
      console.error('Failed to load help offers count:', err);
      setMessagesCount(0);
    }
  };
  
  useEffect(() => {
    loadHelpOffersCount();
  }, [request?.id]);
  
  // Listen for message-sent events to refresh count
  useEffect(() => {
    const handleMessageSent = () => {
      console.log('🔄 [EnhancedGatorCard] Refreshing count for', fullName);
      loadHelpOffersCount();
    };
    
    document.addEventListener('cff:message-sent', handleMessageSent);
    return () => document.removeEventListener('cff:message-sent', handleMessageSent);
  }, [request?.id]);

  const handleMessage = () => {
    if (onHelp) {
      onHelp();
    } else {
      setShowMessageModal(true);
    }
  };

  const handleLinkedInClick = (e) => {
    e.stopPropagation();
    if (gator.linkedin_url) {
      window.open(gator.linkedin_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleResumeDownload = (e) => {
    e.stopPropagation();
    if (request?.resume_url) {
      window.open(request.resume_url, '_blank');
    }
  };

  const handleThumbsUp = async () => {
    console.log('🔥 handleThumbsUp CALLED!', {
      requestId,
      isLiked,
      currentUser: currentUser?.email,
      displayCount
    });
    
    if (!requestId) {
      console.error('❌ No requestId:', requestId);
      toast({
        title: "Error",
        description: "No request ID found",
        variant: "destructive"
      });
      return;
    }
    
    if (isLiked) {
      console.log('❌ Already liked');
      return;
    }
    
    if (!currentUser?.email) {
      console.error('❌ No user email:', currentUser);
      toast({
        title: "Please log in",
        description: "You must be logged in to like",
        variant: "destructive"
      });
      return;
    }

    console.log('✅ Processing like...');

    // Optimistic update
    const prevCount = displayCount;
    const newCount = displayCount + 1;
    setDisplayCount(newCount);
    setIsLiked(true);

    try {
      console.log('📞 Calling incrementOfferCount with:', { requestId, actionType: 'like' });
      const result = await base44.functions.invoke('incrementOfferCount', { requestId, actionType: 'like' });
      console.log('✅ Backend result:', result);
      console.log('📦 result.data:', result?.data);
      console.log('🔢 result.data.newCount:', result?.data?.newCount);
      console.log('✅ result.data.success:', result?.data?.success);

      if (result?.data?.success) {
        const finalCount = result.data.newCount;
        console.log('📈 Setting display count to:', finalCount);
        setDisplayCount(finalCount);
        if (onLikeChange) onLikeChange();
        toast({
          title: "👍 You liked this!",
        });
      } else {
        throw new Error(result?.data?.error || 'Failed to like');
      }
    } catch (err) {
      console.error('❌ Failed to save like:', err);
      setDisplayCount(prevCount);
      setIsLiked(false);
      toast({
        title: "Failed to save like",
        description: err?.message || "Please try again",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <motion.div
        variants={cardVariants}
        className={`gator-card-enhanced ${showFeaturedBadge ? 'featured' : ''}`}
      >
        {showFeaturedBadge && (
          <div className="featured-badge">
            🔥 Featured
          </div>
        )}

        {/* Profile Photo */}
        <div className="card-header">
          {isAnonymous ? (
            <div className="profile-photo-enhanced anonymous-avatar">
              <span className="text-3xl">👨‍👩‍👧</span>
            </div>
          ) : (
            <UserAvatar 
              user={gator} 
              className="profile-photo-enhanced"
              showFallback={true}
            />
          )}
        </div>

        {/* User Details */}
        <div className="card-content">
          {/* Poster Type Badge */}
          {request?.poster_type && request.poster_type !== 'student' && (
            <div className="poster-type-badge-container">
              <span className={`poster-type-badge poster-type-${request.poster_type}`}>
                {request.poster_type === 'parent' 
                  ? (isAnonymous ? '👨‍👩‍👧 Anonymous Parent' : '👨‍👩‍👧 Parent') 
                  : '🎯 Alumni'}
              </span>
            </div>
          )}
          
          {/* Name with LinkedIn */}
          <div className="name-section">
            <h3 className="student-name-enhanced">{fullName}</h3>
            {hasLinkedIn && !isAnonymous && (
              <button
                onClick={handleLinkedInClick}
                className="linkedin-icon"
                title="View on LinkedIn"
                aria-label="View LinkedIn profile"
              >
                <Linkedin className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {/* Academic Info - different display based on poster type */}
          <div className="academic-info">
            {request?.poster_type === 'parent' ? (
              <span className="graduation-year">UF Parent</span>
            ) : request?.poster_type === 'alumni' ? (
              <>
                <span className="graduation-year">{gator.graduation_year ? `Class of ${gator.graduation_year}` : 'UF Alumni'}</span>
                {major && major !== 'Undeclared' && <span className="major-separator">•</span>}
                {major && major !== 'Undeclared' && <span className="major-field">{major}</span>}
              </>
            ) : (
              <>
                <span className="graduation-year">{graduationYear}</span>
                {major && <span className="major-separator">•</span>}
                <span className="major-field">{major}</span>
              </>
            )}
          </div>

          {/* Intent, Role, and Location Line */}
          {intent && (
            <div className="intent-location-section">
              <span className={`intent-badge ${intent.color}`}>
                {intent.type}
              </span>
              <span className="role-text">- {intent.role}</span>
              <span className="location-divider">|</span>
              <div className="location-group">
                <MapPin className="location-icon" />
                <span className="location-text">{location}</span>
              </div>
            </div>
          )}

          {/* Additional Details: Relocation, Visa, Start Timing */}
          {(isOpenToRelocate || needsVisaSponsorship || startTiming) && (
            <div className="additional-details">
              {isOpenToRelocate && (
                <span className="detail-badge relocation-badge" title="Open to relocate">
                  <Plane className="w-3 h-3" />
                  Open to Relocate
                </span>
              )}
              {needsVisaSponsorship && (
                <span className="detail-badge visa-badge" title="Needs visa sponsorship">
                  <Globe2 className="w-3 h-3" />
                  Needs Sponsorship
                </span>
              )}
              {startTiming && (
                <span className="detail-badge timing-badge" title="Start timing">
                  <Calendar className="w-3 h-3" />
                  Starting: {startTiming}
                </span>
              )}
            </div>
          )}

          {/* Their Question - Prominently Displayed */}
          {request?.description && (
            <div className="question-section">
              <span className="question-label">💬 Their Question:</span>
              <p className="question-text">
                "{request.description.length > 200 ? request.description.substring(0, 200) + '...' : request.description}"
              </p>
            </div>
          )}

          {/* Bio - Secondary */}
          {bio && bio !== request?.description && (
            <p className="student-bio-enhanced">
              {displayBio}
              {shouldTruncate && (
                <button 
                  onClick={() => setShowFullBio(!showFullBio)}
                  className="read-more-btn"
                >
                  {showFullBio ? ' Show less' : ' Show more'}
                </button>
              )}
            </p>
          )}

          {/* Skills Tags */}
          {skills.length > 0 && (
            <div className="skills-section">
              {skills.map((skill, idx) => (
                <span key={idx} className="skill-tag-enhanced">
                  {skill.charAt(0).toUpperCase() + skill.slice(1)}
                </span>
              ))}
            </div>
          )}

          {/* Resume Icon */}
          {hasResume && (
            <button
              onClick={handleResumeDownload}
              className="resume-download"
              title="Download Resume"
              aria-label="Download resume"
            >
              <Paperclip className="w-4 h-4" />
              <span>Resume attached</span>
            </button>
          )}

          {/* Single Message Button */}
          <Button
            onClick={handleMessage}
            className="message-btn-primary"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {currentUser?.persona === 'parent' || currentUser?.roles?.includes('parent') 
              ? 'Share Your Advice' 
              : 'Message'}
          </Button>

          {/* Quick-Win Engagement Signals */}
          {request && !hideEngagement && (
            <div className="engagement-signals">
              <span 
                className={`signal-badge ${messagesCount >= 3 ? 'signal-hot' : ''}`}
                title={messagesCount > 0 ? `${messagesCount} parent${messagesCount > 1 ? 's have' : ' has'} already messaged ${fullName.split(' ')[0]}` : 'Be the first to reach out!'}
              >
                💬 {messagesCount}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {showMessageModal && (
        <MessageUserModal
          isOpen={showMessageModal}
          onClose={() => setShowMessageModal(false)}
          recipientUser={gator}
        />
      )}

      <style jsx>{`
        .gator-card-enhanced {
          background: white;
          border-radius: 12px;
          padding: 14px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
          position: relative;
          border: 2px solid transparent;
          display: flex;
          flex-direction: column;
        }

        .gator-card-enhanced:hover {
          border-color: #FA4616;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
          transform: translateY(-4px);
        }

        .gator-card-enhanced.featured {
          border-color: #0021A5;
          background: linear-gradient(135deg, rgba(0, 33, 165, 0.02) 0%, rgba(250, 70, 22, 0.02) 100%);
        }

        .featured-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #0021A5;
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 3px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .poster-type-badge-container {
          display: flex;
          justify-content: center;
          margin-bottom: 4px;
        }

        .poster-type-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .poster-type-parent {
          background: #E0E7FF;
          color: #4338CA;
        }

        .poster-type-alumni {
          background: #FEF3C7;
          color: #92400E;
        }

        .card-header {
          display: flex;
          justify-content: center;
          margin-bottom: 10px;
        }

        .profile-photo-enhanced {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          border: 3px solid #0021A5;
        }

        .anonymous-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%);
        }

        .card-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex-grow: 1;
        }

        .name-section {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .student-name-enhanced {
          font-size: 18px;
          font-weight: 700;
          color: #0021A5;
          text-align: center;
          margin: 0;
        }

        .linkedin-icon {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          color: #0077B5;
          transition: transform 0.2s;
          display: flex;
          align-items: center;
        }

        .linkedin-icon:hover {
          transform: scale(1.1);
        }

        .academic-info {
          text-align: center;
          font-size: 14px;
          color: #6b7280;
          font-style: italic;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .graduation-year {
          color: #6b7280;
        }

        .major-separator {
          color: #d1d5db;
        }

        .major-field {
          color: #6b7280;
        }

        /* Intent and Location Section */
        .intent-location-section {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          flex-wrap: wrap;
          font-size: 14px;
          font-weight: 600;
          margin-top: 4px;
        }

        .intent-badge {
          padding: 4px 10px;
          border-radius: 6px;
          color: white;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .intent-internship {
          background: #0055D4;
        }

        .intent-fulltime {
          background: #FA4616;
        }

        .intent-advice {
          background: #6B7280;
        }

        .role-text {
          color: #374151;
          font-weight: 600;
        }

        .location-divider {
          color: #d1d5db;
          font-weight: 400;
        }

        .location-group {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .location-icon {
          width: 16px;
          height: 16px;
          color: #6b7280;
        }

        .location-text {
          color: #6b7280;
          font-weight: 600;
        }

        /* Additional Details */
        .additional-details {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          justify-content: center;
        }

        .detail-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          border: 1px solid;
        }

        .relocation-badge {
          background: #DBEAFE;
          color: #1E40AF;
          border-color: #93C5FD;
        }

        .visa-badge {
          background: #FEF3C7;
          color: #92400E;
          border-color: #FDE68A;
        }

        .timing-badge {
          background: #DCFCE7;
          color: #166534;
          border-color: #86EFAC;
        }

        .question-section {
          background: linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%);
          border: 2px solid #FA4616;
          border-radius: 12px;
          padding: 12px 16px;
          margin: 8px 0;
        }

        .question-label {
          font-size: 12px;
          font-weight: 700;
          color: #FA4616;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
          margin-bottom: 6px;
        }

        .question-text {
          font-size: 15px;
          color: #1f2937;
          line-height: 1.5;
          font-style: italic;
          margin: 0;
        }

        .student-bio-enhanced {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.5;
          text-align: center;
          margin: 0;
        }

        .read-more-btn {
          background: none;
          border: none;
          color: #0021A5;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
        }

        .skills-section {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          justify-content: center;
          margin-top: -2px;
        }

        .skill-tag-enhanced {
          background: #0021A5;
          color: white;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 9px;
          border-radius: 12px;
        }

        .resume-download {
          background: #FFF4ED;
          border: 1px solid #FA4616;
          color: #FA4616;
          padding: 8px 12px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
          justify-content: center;
        }

        .resume-download:hover {
          background: #FA4616;
          color: white;
        }

        .message-btn-primary {
          background: #FA4616;
          color: white;
          font-size: 14px;
          font-weight: 700;
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 40px;
          margin-top: auto;
        }

        .message-btn-primary:hover {
          background: #FF6F00;
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(250, 70, 22, 0.3);
        }

        /* Engagement Signals */
        .engagement-signals {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 4px;
          position: relative;
          z-index: 1;
        }

        .signal-badge {
          font-size: 14px;
          color: #666;
          cursor: default;
          display: flex;
          align-items: center;
          gap: 3px;
          transition: all 0.2s;
          background: none;
          border: none;
          padding: 0;
          position: relative;
          z-index: 1;
        }

        .signal-badge.signal-clickable {
          cursor: pointer !important;
          padding: 6px 10px;
          border-radius: 8px;
          background: #f3f4f6;
          user-select: none;
          border: 2px solid transparent;
          outline: none;
          font-weight: 600;
          transition: all 0.15s ease;
          position: relative;
          z-index: 1;
        }
        
        .signal-badge.signal-clickable:not(:disabled):hover {
          border-color: #FA4616;
          box-shadow: 0 2px 8px rgba(250, 70, 22, 0.2);
        }
        
        .signal-badge.signal-clickable:not(:disabled):active {
          transform: scale(0.92);
          background: #e5e7eb;
        }

        .signal-badge.signal-clickable:hover:not(:disabled) {
          background: #FFF4ED;
          color: #FA4616;
          transform: scale(1.1);
        }

        .signal-badge.signal-clickable:disabled {
          cursor: default;
        }

        .signal-badge.signal-clickable:active:not(:disabled) {
          transform: scale(0.95);
        }

        .signal-badge.signal-liked {
          background: #FFF4ED;
          color: #FA4616;
          font-weight: 600;
        }

        .signal-badge.signal-hot {
          color: #FA4616;
          font-weight: 600;
        }

        .signal-badge.signal-fire {
          color: #FA4616;
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .gator-card-enhanced {
            padding: 14px;
          }

          .student-name-enhanced {
            font-size: 16px;
          }

          .academic-info {
            font-size: 13px;
          }

          .student-bio-enhanced {
            font-size: 13px;
          }

          .intent-location-section {
            font-size: 13px;
          }
        }
      `}</style>
    </>
  );
}