import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { trackEvent } from '@/components/utils/analytics';
import { JobRequest } from '@/entities/JobRequest';
import { Message } from '@/entities/Message';
import { Connection } from '@/entities/Connection';
import { HelpOffer } from '@/entities/HelpOffer';
import { ProfileLike } from '@/entities/ProfileLike';
import { base44 } from '@/api/base44Client';
import { Search, Plus, Filter, Sparkles, MessageSquare, UserPlus, TrendingUp } from 'lucide-react';
import moment from 'moment';
import { getDisplayName } from '@/components/utils/nameUtils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import MessageAndHelpModal from '../components/connections/MessageAndHelpModal';
import EnhancedGatorCard from '../components/connections/EnhancedGatorCard';
import { useToast } from '@/components/ui/use-toast';
import EmergingGatorsHero from '@/components/connections/EmergingGatorsHero';
import { checkFullAccess } from '@/components/access/useAccessControl';

export default function DiscoverEmergingGatorsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userLikes, setUserLikes] = useState(new Map()); // Map of request_id -> boolean
  const [likeCounts, setLikeCounts] = useState(new Map()); // Map of request_id -> count
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    major: 'all',
    graduationYear: 'all',
    location: 'all',
    skills: [],
    questionType: 'student' // New: 'student', 'parent', 'alumni', 'all'
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    console.log('🔴 [Connections] showHelpModal changed to:', showHelpModal);
  }, [showHelpModal]);
  const [visibleCount, setVisibleCount] = useState(20);
  const [showFilters, setShowFilters] = useState(false);
  
  const [liveStats, setLiveStats] = useState({
    seekingHelp: 0,
    responsesToday: 0
  });

  const skillSuggestions = [
    'Software Engineering', 'Marketing', 'Finance', 'AI/ML', 
    'Data Science', 'Consulting', 'Entrepreneurship', 'Design', 
    'Product Management', 'Sales'
  ];

  const loadUserLikes = async () => {
    if (!user?.email) return;
    
    try {
      // Single API call to get all likes for current user
      const likes = await ProfileLike.filter({ liker_email: user.email });
      
      // Convert to Map for O(1) lookup
      const likesMap = new Map();
      likes.forEach(like => {
        likesMap.set(like.request_id, true);
      });
      
      setUserLikes(likesMap);
    } catch (error) {
      console.log('Could not load user likes:', error);
      setUserLikes(new Map());
    }
  };

  const loadLikeCounts = async () => {
    try {
      // Get ALL ProfileLikes to count them by request_id
      const allLikes = await ProfileLike.list();
      
      // Count likes per request
      const countsMap = new Map();
      allLikes.forEach(like => {
        const currentCount = countsMap.get(like.request_id) || 0;
        countsMap.set(like.request_id, currentCount + 1);
      });
      
      setLikeCounts(countsMap);
    } catch (error) {
      console.log('Could not load like counts:', error);
      setLikeCounts(new Map());
    }
  };

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    
    try {
      const jobRequestsPromise = JobRequest.filter({ status: 'active' }, '-created_date', 200);
      const directoryUsersPromise = base44.functions.invoke('getDirectoryUsers', {});
      
      const startOfDay = moment().startOf('day').toISOString();
      
      const messagesTodayPromise = Message.filter({ created_date: { $gte: startOfDay } }).catch(() => []);
      const connectionsTodayPromise = Connection.filter({ created_date: { $gte: startOfDay } }).catch(() => []);
      const helpOffersTodayPromise = HelpOffer.filter({ created_date: { $gte: startOfDay } }).catch(() => []);

      const [jobRequests, directoryResponse, messagesToday, connectionsToday, helpOffersToday] = await Promise.all([
        jobRequestsPromise,
        directoryUsersPromise,
        messagesTodayPromise,
        connectionsTodayPromise,
        helpOffersTodayPromise
      ]);
      
      // Filter out test/demo requests
      const realRequests = (jobRequests || []).filter(req => {
        const description = req.description?.toLowerCase() || '';
        const role = req.role?.toLowerCase() || '';
        const isTestRequest = description.includes('test request') || 
                            description.includes('notification testing') || 
                            description.includes('demo') ||
                            role.includes('test');
        return !isTestRequest;
      });
      
      setRequests(realRequests);
      
      const users = directoryResponse?.data?.data || [];
      setAllUsers(users);

      const totalResponsesToday = messagesToday.length + connectionsToday.length + helpOffersToday.length;
      
      setLiveStats({
        seekingHelp: realRequests?.length || 0,
        responsesToday: totalResponsesToday
      });
      
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "Error loading data",
        description: "We couldn't load some information. Please try refreshing the page.",
        variant: "destructive"
      });
      
      setRequests([]);
      setAllUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadUserLikes();
    loadLikeCounts();
    
    // Listen for message-sent events to reload cards (triggers HelpOffer count refresh)
    const handleMessageSent = () => {
      console.log('🔄 Message sent - cards will refresh their counts automatically');
      // Cards will re-fetch HelpOffer counts via useEffect
    };
    
    document.addEventListener('cff:message-sent', handleMessageSent);
    return () => document.removeEventListener('cff:message-sent', handleMessageSent);
  }, [user?.email]);

  const handleOfferHelp = (request) => {
    setSelectedRequest(request);
    setShowHelpModal(true);
    trackEvent('help_offer_clicked', { requestId: request.id });
  };

  const handleBrowse = () => {
    const listingsSection = document.getElementById('listings-section');
    if (listingsSection) {
      listingsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Memoize profiles to prevent rebuilding on every render (which resets card state)
  const allProfiles = useMemo(() => {
    const profiles = [];
    const seenEmails = new Set();

    requests.forEach((request, index) => {
      const requestCreatorEmail = request.created_by;
      if (seenEmails.has(requestCreatorEmail)) return;
      
      seenEmails.add(requestCreatorEmail);
      const userProfile = allUsers.find(u => u.email === requestCreatorEmail);
      
      // Deterministic "featured" based on index, not random
      const isFeatured = index % 5 === 0;
      
      if (userProfile) {
        profiles.push({
          ...userProfile,
          request: request,
          hasRequest: true,
          isFeatured
        });
      } else {
        // User not in directory - parse name from email
        // For ptrebil@ufl.edu -> "Paige Trebil" (if we can detect it)
        const emailUsername = requestCreatorEmail.split('@')[0].toLowerCase();
        
        // Try to get a nice display name from the email
        let formattedName = getDisplayName({ email: requestCreatorEmail });
        let firstName = '';
        let lastName = '';
        
        // Special handling for known users or common patterns
        if (emailUsername === 'ptrebil') {
          firstName = 'Paige';
          lastName = 'Trebil';
          formattedName = 'Paige Trebil';
        } else if (emailUsername === 'specora') {
          firstName = 'Samantha';
          lastName = 'Pecora';
          formattedName = 'Samantha Pecora';
        } else if (emailUsername === 'odesai') {
          firstName = 'Om';
          lastName = 'Desai';
          formattedName = 'Om Desai';
        } else if (emailUsername === 'rhiannon.thomas') {
          firstName = 'Rhiannon';
          lastName = 'Thomas';
          formattedName = 'Rhiannon Thomas';
        }
        
        profiles.push({
          id: request.id,
          email: requestCreatorEmail,
          full_name: formattedName,
          first_name: firstName,
          last_name: lastName,
          bio: request.description,
          major: request.target_industry,
          request: request,
          hasRequest: true,
          isFeatured
        });
      }
    });

    allUsers.forEach(u => {
      if (u.includeInDirectory && !seenEmails.has(u.email)) {
        seenEmails.add(u.email);
        profiles.push({
          ...u,
          hasRequest: false,
          isFeatured: false
        });
      }
    });

    return profiles;
  }, [requests, allUsers]);

  const filteredProfiles = allProfiles.filter(profile => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = profile.full_name?.toLowerCase().includes(query);
      const matchesMajor = profile.major?.toLowerCase().includes(query);
      const matchesBio = profile.bio?.toLowerCase().includes(query);
      if (!matchesName && !matchesMajor && !matchesBio) return false;
    }

    if (filters.major !== 'all' && profile.major !== filters.major) return false;
    if (filters.graduationYear !== 'all' && profile.graduation_year?.toString() !== filters.graduationYear) return false;
    if (filters.location !== 'all' && !profile.location?.toLowerCase().includes(filters.location.toLowerCase())) return false;

    return true;
  });

  const sortedProfiles = [...filteredProfiles].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_date) - new Date(a.created_date);
    if (sortBy === 'most_connected') return (b.connections_count || 0) - (a.connections_count || 0);
    
    // Premium users always appear in top 10
    const aIsPremium = checkFullAccess(a);
    const bIsPremium = checkFullAccess(b);
    if (aIsPremium && !bIsPremium) return -1;
    if (!aIsPremium && bIsPremium) return 1;
    
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    if (a.hasRequest && !b.hasRequest) return -1;
    if (!a.hasRequest && b.hasRequest) return 1;
    return 0;
  });

  const displayedProfiles = sortedProfiles.slice(0, visibleCount);

  return (
    <>
      <div className="discover-gators-page">
        {/* Hero Banner */}
        <EmergingGatorsHero onBrowse={handleBrowse} />

        {/* CTA Banner for Students */}
        {user?.persona === 'gator' && !requests.find(r => r.created_by === user.email) && (
          <div className="cta-banner-students">
            <div className="cta-content">
              <div className="cta-icon">💬</div>
              <div className="cta-text">
                <h3>Have a career question?</h3>
                <p>Ask anything - parents and alumni with real experience will share their advice.</p>
              </div>
              <Button 
                onClick={() => navigate('StudentOnboarding')}
                className="cta-button"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Ask a Question
              </Button>
            </div>
          </div>
        )}

        {/* Search and Filters - Sticky */}
        <div className="filters-section-sticky" id="listings-section">
          <div className="filters-container-compact">
            <div className="search-and-actions">
              {/* Search Bar */}
              <div className="search-wrapper-compact">
                <Search className="search-icon" />
                <Input
                  type="text"
                  placeholder="Search by name, skills, interests, or career goals..."
                  className="search-input-compact"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filters Button & Student Count */}
              <div className="filter-actions">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="filters-toggle-btn"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {(filters.major !== 'all' || filters.graduationYear !== 'all' || filters.location !== 'all' || sortBy !== 'relevance') && (
                    <span className="filter-count-badge">
                      {[filters.major !== 'all', filters.graduationYear !== 'all', filters.location !== 'all', sortBy !== 'relevance'].filter(Boolean).length}
                    </span>
                  )}
                </Button>
                
                <span className="stat-badge-inline">
                  <span className="pulse-dot"></span>
                  {liveStats.seekingHelp} seeking help
                </span>
              </div>
            </div>

            {/* Collapsible Filter Panel */}
            {showFilters && (
              <motion.div 
                className="filter-panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="filter-grid">
                  {/* Question Type Filter - Primary */}
                  <select
                    className="filter-select-compact filter-select-primary"
                    value={filters.questionType}
                    onChange={(e) => setFilters({...filters, questionType: e.target.value})}
                  >
                    <option value="student">🎓 Student Questions</option>
                    <option value="parent">👨‍👩‍👧 Parent Questions</option>
                    <option value="alumni">🎯 Alumni Questions</option>
                    <option value="all">🌟 All Questions</option>
                  </select>

                  <select
                    className="filter-select-compact"
                    value={filters.major}
                    onChange={(e) => setFilters({...filters, major: e.target.value})}
                  >
                    <option value="all">All Majors</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Business">Business</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                  </select>

                  <select
                    className="filter-select-compact"
                    value={filters.graduationYear}
                    onChange={(e) => setFilters({...filters, graduationYear: e.target.value})}
                  >
                    <option value="all">All Graduation Years</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>

                  <select
                    className="filter-select-compact"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="relevance">Sort: Relevance</option>
                    <option value="newest">Sort: Newest</option>
                    <option value="most_connected">Sort: Most Connected</option>
                  </select>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="main-content-area">
          {/* Profile Grid */}
          <div className="profile-grid-section">
            {isLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading Gators...</p>
              </div>
            ) : (
              <>
                <motion.div 
                  className="profile-grid-4col"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.05
                      }
                    }
                  }}
                >
                  {console.log('🟡 [Connections] Rendering cards with hideEngagement:', showHelpModal)}
                  <AnimatePresence mode="sync">
                    {displayedProfiles.map((profile) => (
                      <EnhancedGatorCard
                        key={profile.request?.id || profile.id || profile.email}
                        gator={profile}
                        request={profile.request}
                        onHelp={profile.request ? () => handleOfferHelp(profile.request) : null}
                        isFeatured={profile.isFeatured}
                        currentUser={user}
                        isLikedByUser={profile.request ? userLikes.get(profile.request.id) : false}
                        likeCount={profile.request ? (likeCounts.get(profile.request.id) || 0) : 0}
                        onLikeChange={() => { loadUserLikes(); loadLikeCounts(); }}
                        hideEngagement={showHelpModal}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>

                {sortedProfiles.length > visibleCount && (
                  <div className="load-more-section">
                    <Button 
                      onClick={() => setVisibleCount(prev => prev + 20)}
                      className="load-more-btn"
                    >
                      Load More Students
                    </Button>
                    <p className="results-count">
                      Showing {displayedProfiles.length} of {sortedProfiles.length}
                    </p>
                  </div>
                )}

                {filteredProfiles.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-icon">🐊</div>
                    <h3>{user?.persona === 'gator' ? 'Be the first!' : 'No questions yet'}</h3>
                    <p>
                      {user?.persona === 'gator' 
                        ? "Be among the first students to ask a question. Parents and alumni are waiting to share their advice!"
                        : "Encourage students to ask their career questions. Once they do, you'll see them here and can share your advice!"}
                    </p>
                    {user?.persona === 'gator' && (
                      <Button onClick={() => navigate('StudentOnboarding')} size="lg" className="mt-4 bg-[#FA4616] hover:bg-orange-600">
                        <Plus className="w-5 h-5 mr-2" />
                        Ask a Question
                      </Button>
                    )}
                  </div>
                )}
                
                {filteredProfiles.length > 0 && filteredProfiles.length < 5 && user?.persona === 'gator' && !requests.find(r => r.created_by === user.email) && (
                  <div className="encourage-post-card">
                    <div className="encourage-content">
                      <h4>🌟 Get personalized advice!</h4>
                      <p>Only {filteredProfiles.length} students have asked so far. Ask your question and get advice from parents and alumni with real experience.</p>
                      <Button onClick={() => navigate('StudentOnboarding')} className="mt-3" variant="outline">
                        Ask a Question
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="sidebar-section">
            <div className="sidebar-card">
              <h3 className="sidebar-title">
                <TrendingUp className="w-5 h-5" />
                Featured Requests
              </h3>
              <div className="featured-requests">
                {requests.length > 0 ? (
                  requests.slice(0, 3).map((req) => (
                    <div key={req.id} className="featured-request-item">
                      <p className="request-text">{req.description?.substring(0, 80)}...</p>
                      <Button 
                        size="sm" 
                        className="quick-reply-btn"
                        onClick={() => handleOfferHelp(req)}
                      >
                        Quick Reply
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="empty-sidebar-state">
                    <p>Students will post their career requests here soon!</p>
                  </div>
                )}
              </div>
            </div>

            <div className="sidebar-card">
              <h3 className="sidebar-title">Success Stories</h3>
              <div className="success-stories">
                <div className="story-item">
                  <p className="story-text">"Landed my dream job through a parent connection!"</p>
                  <span className="story-author">- Sarah M., Class of '23</span>
                </div>
                <div className="story-item">
                  <p className="story-text">"An alum's advice helped me ace my interview!"</p>
                  <span className="story-author">- Mike R., Class of '24</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <footer className="page-footer">
          <div className="footer-content">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/b27e39f30_collegefastforwardlogo.png"
              alt="College Fast Forward"
              className="footer-logo"
            />
            <div className="footer-links">
              <a href="#/Privacy">Privacy</a>
              <a href="#/Terms">Terms</a>
              <a href="#/Contact">Contact Support</a>
            </div>
            <p className="footer-copyright">© 2025 College Fast Forward. Go Gators! 🐊</p>
          </div>
        </footer>
      </div>

      {showHelpModal && (
        <MessageAndHelpModal
          isOpen={showHelpModal}
          onClose={() => setShowHelpModal(false)}
          request={selectedRequest}
        />
      )}

      <style jsx>{`
        .discover-gators-page {
          min-h-screen;
          background: #F9FAFB;
        }

        /* Filters Section - Sticky */
        .filters-section-sticky {
          position: sticky;
          top: 96px;
          z-index: 45;
          background: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
          padding: 12px 0;
        }

        .filters-container-compact {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .search-and-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .search-wrapper-compact {
          position: relative;
          flex: 1;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          width: 18px;
          height: 18px;
        }

        .search-input-compact {
          width: 100%;
          height: 40px;
          padding: 0 14px 0 44px;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .search-input-compact:focus {
          outline: none;
          border-color: #0021A5;
        }

        .filter-actions {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-shrink: 0;
        }

        .filters-toggle-btn {
          height: 40px;
          padding: 0 16px;
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
          position: relative;
        }

        .filter-count-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #0021A5;
          color: white;
          font-size: 11px;
          font-weight: 700;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          margin-left: 6px;
        }

        .stat-badge-inline {
          background: #FFF4ED;
          color: #FA4616;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .filter-panel {
          margin-top: 12px;
          padding: 16px;
          background: #F9FAFB;
          border-radius: 8px;
          overflow: hidden;
        }

        .filter-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .filter-select-compact {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 13px;
          background: white;
          color: #333;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .filter-select-compact:focus {
          outline: none;
          border-color: #0021A5;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #FA4616;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
        }

        .stat-divider {
          color: #d1d5db;
        }

        .main-content-area {
          max-width: 1400px;
          margin: 20px auto;
          padding: 0 20px;
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 24px;
        }

        .profile-grid-section {
          min-height: 600px;
        }

        .profile-grid-4col {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #f3f4f6;
          border-top-color: #0021A5;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-state p {
          margin-top: 16px;
          font-size: 16px;
          color: #64748b;
        }

        .load-more-section {
          text-align: center;
          padding: 32px 0;
        }

        .load-more-btn {
          background: #0021A5;
          color: white;
          padding: 12px 32px;
          border-radius: 8px;
          font-weight: 600;
        }

        .load-more-btn:hover {
          background: #001580;
        }

        .results-count {
          margin-top: 12px;
          font-size: 14px;
          color: #6b7280;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .empty-state p {
          font-size: 16px;
          color: #64748b;
          margin-bottom: 24px;
          text-align: center;
          max-width: 400px;
        }

        .sidebar-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .sidebar-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .sidebar-title {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .featured-requests {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .empty-sidebar-state {
          padding: 16px;
          background: #F9FAFB;
          border-radius: 8px;
          text-align: center;
        }

        .empty-sidebar-state p {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
        }

        .featured-request-item {
          padding: 12px;
          background: #F9FAFB;
          border-radius: 8px;
          border-left: 3px solid #0021A5;
        }

        .request-text {
          font-size: 14px;
          color: #374151;
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .quick-reply-btn {
          background: #FA4616;
          color: white;
          font-size: 12px;
          padding: 6px 12px;
          border-radius: 6px;
        }

        .success-stories {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .story-item {
          padding: 12px;
          background: #FFF4ED;
          border-radius: 8px;
        }

        .story-text {
          font-size: 14px;
          color: #374151;
          font-style: italic;
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .story-author {
          font-size: 12px;
          color: #FA4616;
          font-weight: 600;
        }

        .page-footer {
          background: #0021A5;
          color: white;
          padding: 32px 0;
          margin-top: 64px;
        }

        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          text-align: center;
        }

        .footer-logo {
          height: 48px;
          filter: brightness(0) invert(1);
        }

        .footer-links {
          display: flex;
          gap: 24px;
        }

        .footer-links a {
          color: white;
          text-decoration: none;
          font-size: 14px;
          transition: opacity 0.2s;
        }

        .footer-links a:hover {
          opacity: 0.8;
        }

        .footer-copyright {
          font-size: 14px;
          opacity: 0.8;
        }

        .cta-banner-students {
          max-width: 1400px;
          margin: -16px auto 32px;
          padding: 0 20px;
        }

        .cta-content {
          background: linear-gradient(135deg, #FA4616 0%, #FF6B3D 100%);
          border-radius: 16px;
          padding: 24px 32px;
          display: flex;
          align-items: center;
          gap: 24px;
          box-shadow: 0 8px 16px rgba(250, 70, 22, 0.2);
        }

        .cta-icon {
          font-size: 48px;
          flex-shrink: 0;
        }

        .cta-text {
          flex: 1;
          color: white;
        }

        .cta-text h3 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .cta-text p {
          font-size: 16px;
          opacity: 0.95;
        }

        .cta-button {
          background: white !important;
          color: #FA4616 !important;
          font-weight: 700;
          padding: 12px 24px;
          flex-shrink: 0;
        }

        .cta-button:hover {
          background: #f8f9fa !important;
          transform: scale(1.05);
        }

        .encourage-post-card {
          grid-column: 1 / -1;
          background: linear-gradient(135deg, #FFF4ED 0%, #FFE8D9 100%);
          border: 2px dashed #FA4616;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
        }

        .encourage-content h4 {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .encourage-content p {
          font-size: 16px;
          color: #64748b;
          max-width: 600px;
          margin: 0 auto;
        }

        @media (max-width: 1200px) {
          .main-content-area {
            grid-template-columns: 1fr;
          }
          
          .sidebar-section {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .cta-banner-students {
            margin: -8px auto 16px;
            padding: 0 12px;
          }

          .cta-content {
            flex-direction: column;
            padding: 20px;
            text-align: center;
            gap: 16px;
          }

          .cta-icon {
            font-size: 40px;
          }

          .cta-text h3 {
            font-size: 20px;
          }

          .cta-text p {
            font-size: 14px;
          }

          .cta-button {
            width: 100%;
          }

          .encourage-post-card {
            padding: 20px;
          }

          .encourage-content h4 {
            font-size: 18px;
          }

          .encourage-content p {
            font-size: 14px;
          }

          .filters-section-sticky {
            top: 96px;
            padding: 10px 0;
          }

          .filters-container-compact {
            padding: 0 12px;
          }

          .search-and-actions {
            flex-direction: column;
            gap: 8px;
          }

          .search-wrapper-compact {
            width: 100%;
          }

          .search-input-compact {
            height: 38px;
            padding: 0 12px 0 40px;
            font-size: 13px;
          }

          .filter-actions {
            width: 100%;
            justify-content: space-between;
          }

          .filters-toggle-btn {
            height: 38px;
            padding: 0 14px;
            font-size: 13px;
          }

          .stat-badge-inline {
            font-size: 11px;
            padding: 6px 10px;
          }

          .filter-grid {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .filter-select-compact {
            padding: 8px 10px;
            font-size: 12px;
          }

          .main-content-area {
            margin: 16px auto;
            padding: 0 12px;
          }

          .profile-grid-4col {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .load-more-section {
            padding: 24px 0;
          }

          .page-footer {
            margin-top: 32px;
            padding: 24px 0;
          }

          .footer-logo {
            height: 40px;
          }

          .footer-links {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>
    </>
  );
}