import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { trackEvent } from '@/components/utils/analytics';
import { JobRequest } from '@/entities/JobRequest';
import { Message } from '@/entities/Message';
import { Connection } from '@/entities/Connection';
import { HelpOffer } from '@/entities/HelpOffer';
import { ProfileLike } from '@/entities/ProfileLike';
import { base44 } from '@/api/base44Client';
import { Search, Plus, Filter } from 'lucide-react';
import moment from 'moment';
import { getDisplayName } from '@/components/utils/nameUtils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import MessageAndHelpModal from '../components/connections/MessageAndHelpModal';
import QuestionCard from '../components/connections/QuestionCard';
import { useToast } from '@/components/ui/use-toast';
import { checkFullAccess } from '@/components/access/useAccessControl';

export default function QuestionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userLikes, setUserLikes] = useState(new Map());
  const [likeCounts, setLikeCounts] = useState(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    major: 'all',
    graduationYear: 'all',
    location: 'all',
    questionType: 'all',
    noAnswers: false,
    urgent: false
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [visibleCount, setVisibleCount] = useState(20);
  const [showFilters, setShowFilters] = useState(false);

  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalAnswers: 0,
    urgentCount: 0
  });

  const loadUserLikes = async () => {
    if (!user?.email) return;
    try {
      const likes = await ProfileLike.filter({ liker_email: user.email });
      const likesMap = new Map();
      likes.forEach(like => likesMap.set(like.request_id, true));
      setUserLikes(likesMap);
    } catch (error) {
      console.log('Could not load user likes:', error);
      setUserLikes(new Map());
    }
  };

  const loadLikeCounts = async () => {
    try {
      const allLikes = await ProfileLike.list();
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

      const [jobRequests, directoryResponse] = await Promise.all([
        jobRequestsPromise,
        directoryUsersPromise
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

      // Calculate stats
      const totalAnswers = realRequests.reduce((sum, r) => sum + (r.answer_count || 0), 0);
      const urgentCount = realRequests.filter(r => r.timeline === 'this_week').length;
      
      setStats({
        totalQuestions: realRequests.length,
        totalAnswers,
        urgentCount
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
  }, [user?.email]);

  // Build profiles from requests
  const allProfiles = useMemo(() => {
    const profiles = [];
    const seenEmails = new Set();

    requests.forEach((request, index) => {
      const requestCreatorEmail = request.created_by;
      if (seenEmails.has(requestCreatorEmail)) return;
      
      seenEmails.add(requestCreatorEmail);
      const userProfile = allUsers.find(u => u.email === requestCreatorEmail);
      const isFeatured = index % 5 === 0;
      
      if (userProfile) {
        profiles.push({
          ...userProfile,
          request: request,
          hasRequest: true,
          isFeatured
        });
      } else {
        const emailUsername = requestCreatorEmail?.split('@')[0]?.toLowerCase() || '';
        let formattedName = getDisplayName({ email: requestCreatorEmail });
        
        profiles.push({
          id: request.id,
          email: requestCreatorEmail,
          full_name: formattedName,
          bio: request.description,
          major: request.target_industry,
          request: request,
          hasRequest: true,
          isFeatured
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
      const matchesDescription = profile.request?.description?.toLowerCase().includes(query);
      if (!matchesName && !matchesMajor && !matchesBio && !matchesDescription) return false;
    }

    if (filters.questionType !== 'all' && profile.request) {
      const posterType = profile.request.poster_type || 'student';
      if (filters.questionType !== posterType) return false;
    }

    // Filter for "No Answers" questions
    if (filters.noAnswers && profile.request) {
      if ((profile.request.answer_count || 0) > 0) return false;
    }

    // Filter for "ASAP/Urgent" questions
    if (filters.urgent && profile.request) {
      if (profile.request.timeline !== 'this_week') return false;
    }

    if (filters.major !== 'all' && profile.major !== filters.major) return false;
    if (filters.graduationYear !== 'all' && profile.graduation_year?.toString() !== filters.graduationYear) return false;

    return true;
  });

  const sortedProfiles = [...filteredProfiles].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_date) - new Date(a.created_date);
    if (sortBy === 'most_connected') return (b.connections_count || 0) - (a.connections_count || 0);
    
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
  const questionsWithProfiles = displayedProfiles.filter(p => p.request);
  const totalQuestionsFiltered = sortedProfiles.filter(p => p.request).length;

  return (
    <>
      <div className="questions-page">
        {/* HEADER - Minimal */}
        <div className="page-header">
          <div className="header-content">
            <div className="header-left">
              <h1>Questions From UF Students</h1>
              <p className="subtitle">
                Browse questions and share your advice
              </p>
            </div>
            
            {user && (
              <Button 
                onClick={() => navigate(user?.persona === 'gator' ? 'StudentOnboarding' : 'PostRequest')}
                className="ask-question-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ask a Question
              </Button>
            )}
          </div>
        </div>

        {/* CTA Banner for Students */}
        {user?.persona === 'gator' && !requests.find(r => r.created_by === user.email) && (
          <div className="cta-banner">
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



        {/* Search and Filters */}
        <div className="filters-section">
          <div className="filters-container">
            {/* Quick Filter Tabs */}
            <div className="filter-tabs-row">
              <div className="filter-tabs">
                <button
                  className={`filter-tab ${filters.questionType === 'all' && !filters.noAnswers && !filters.urgent ? 'active' : ''}`}
                  onClick={() => setFilters({...filters, questionType: 'all', noAnswers: false, urgent: false})}
                >
                  All Questions
                </button>
                <button
                  className={`filter-tab ${filters.noAnswers ? 'active' : ''}`}
                  onClick={() => setFilters({...filters, noAnswers: !filters.noAnswers, urgent: false})}
                >
                  No Answers 🆘
                </button>
                <button
                  className={`filter-tab ${filters.urgent ? 'active' : ''}`}
                  onClick={() => setFilters({...filters, urgent: !filters.urgent, noAnswers: false})}
                >
                  ASAP 🔥
                </button>
              </div>
              <div className="filter-stats">
                {totalQuestionsFiltered} questions
              </div>
            </div>

            <div className="search-row">
              <div className="search-wrapper">
                <Search className="search-icon" />
                <Input
                  type="text"
                  placeholder="Search questions..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="filters-toggle-btn"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
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
                  <select
                    className="filter-select"
                    value={filters.major}
                    onChange={(e) => setFilters({...filters, major: e.target.value})}
                  >
                    <option value="all">All Industries</option>
                    <option value="Technology & Software">Technology</option>
                    <option value="Finance & Banking">Finance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Consulting">Consulting</option>
                  </select>

                  <select
                    className="filter-select"
                    value={filters.graduationYear}
                    onChange={(e) => setFilters({...filters, graduationYear: e.target.value})}
                  >
                    <option value="all">All Years</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>

                  <select
                    className="filter-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="relevance">Sort: Relevance</option>
                    <option value="newest">Sort: Newest</option>
                    <option value="most_connected">Sort: Most Engaged</option>
                  </select>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* QUESTIONS LIST */}
        <div className="questions-container">
          {isLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading questions...</p>
            </div>
          ) : (
            <>
              <motion.div 
                className="questions-list"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: { staggerChildren: 0.05 }
                  }
                }}
              >
                <AnimatePresence mode="sync">
                  {questionsWithProfiles.map((profile) => (
                    <motion.div
                      key={profile.request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <QuestionCard
                        question={profile.request}
                        gator={profile}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* LOAD MORE */}
              {totalQuestionsFiltered > visibleCount && (
                <button 
                  className="load-more-btn"
                  onClick={() => setVisibleCount(prev => prev + 20)}
                >
                  Load More Questions
                </button>
              )}

              {totalQuestionsFiltered > 0 && (
                <p className="results-count">
                  Showing {questionsWithProfiles.length} of {totalQuestionsFiltered} questions
                </p>
              )}

              {/* Empty State */}
              {totalQuestionsFiltered === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">🐊</div>
                  <h3>No questions yet in this category</h3>
                  <p>
                    {filters.questionType === 'parent' 
                      ? "No parent questions yet. Be the first parent to ask!"
                      : filters.questionType === 'alumni'
                      ? "No alumni questions yet."
                      : "Be among the first to ask a question!"}
                  </p>
                  {user && (
                    <Button 
                      onClick={() => navigate(user?.persona === 'gator' ? 'StudentOnboarding' : 'PostRequest')} 
                      size="lg" 
                      className="mt-4"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Ask a Question
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showHelpModal && (
        <MessageAndHelpModal
          isOpen={showHelpModal}
          onClose={() => setShowHelpModal(false)}
          request={selectedRequest}
        />
      )}

      <style jsx>{`
        .questions-page {
          min-height: 100vh;
          background: #F9FAFB;
        }

        /* HEADER - Minimal */
        .page-header {
          background: white;
          border-bottom: 1px solid #E5E7EB;
          padding: 20px 0;
        }

        .header-content {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .header-left h1 {
          font-size: 26px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 4px 0;
        }

        .subtitle {
          font-size: 14px;
          color: #6B7280;
          margin: 0;
        }

        .ask-question-btn {
          background: #FA4616 !important;
          color: white !important;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .ask-question-btn:hover {
          background: #E03E10 !important;
        }

        /* CTA BANNER */
        .cta-banner {
          max-width: 900px;
          margin: -20px auto 24px;
          padding: 0 20px;
        }

        .cta-content {
          background: linear-gradient(135deg, #FA4616 0%, #FF6B3D 100%);
          border-radius: 16px;
          padding: 24px 32px;
          display: flex;
          align-items: center;
          gap: 24px;
          box-shadow: 0 8px 24px rgba(250, 70, 22, 0.25);
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
          font-size: 22px;
          font-weight: 700;
          margin: 0 0 6px 0;
        }

        .cta-text p {
          font-size: 15px;
          opacity: 0.95;
          margin: 0;
        }

        .cta-button {
          background: white !important;
          color: #FA4616 !important;
          font-weight: 700;
          flex-shrink: 0;
        }



        /* FILTERS */
        .filters-section {
          background: white;
          border-bottom: 1px solid #E5E7EB;
          padding: 16px 20px;
          position: sticky;
          top: 96px;
          z-index: 40;
        }

        .filters-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .filter-tabs-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .filter-tabs {
          display: flex;
          gap: 8px;
        }

        .filter-tab {
          background: white;
          border: 1px solid #E5E7EB;
          color: #6B7280;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .filter-tab:hover {
          border-color: #0021A5;
          color: #0021A5;
        }

        .filter-tab.active {
          background: #0021A5;
          border-color: #0021A5;
          color: white;
        }

        .filter-stats {
          font-size: 14px;
          color: #6B7280;
          font-weight: 500;
        }

        .search-row {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .search-wrapper {
          position: relative;
          flex: 1;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #9CA3AF;
          width: 18px;
          height: 18px;
        }

        .search-input {
          width: 100%;
          height: 44px;
          padding: 0 14px 0 44px;
          border: 1.5px solid #E5E7EB;
          border-radius: 10px;
          font-size: 15px;
        }

        .search-input:focus {
          outline: none;
          border-color: #0021A5;
        }

        .filters-toggle-btn {
          height: 44px;
          padding: 0 20px;
          font-weight: 600;
        }

        .filter-panel {
          margin-top: 12px;
          padding: 16px;
          background: #F9FAFB;
          border-radius: 10px;
          overflow: hidden;
        }

        .filter-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .filter-select {
          padding: 10px 14px;
          border: 1.5px solid #E5E7EB;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          cursor: pointer;
        }

        .filter-select:focus {
          outline: none;
          border-color: #0021A5;
        }

        /* QUESTIONS LIST */
        .questions-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 24px 20px 60px;
        }

        .questions-list {
          display: flex;
          flex-direction: column;
        }

        .load-more-btn {
          width: 100%;
          padding: 16px;
          background: white;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          color: #6B7280;
          cursor: pointer;
          margin-top: 24px;
          transition: all 0.2s;
        }

        .load-more-btn:hover {
          border-color: #0021A5;
          color: #0021A5;
          background: #F9FAFB;
        }

        .results-count {
          text-align: center;
          margin-top: 16px;
          font-size: 14px;
          color: #6B7280;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
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
          color: #6B7280;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 80px 20px;
          background: white;
          border-radius: 16px;
          text-align: center;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
        }

        .empty-state p {
          font-size: 16px;
          color: #6B7280;
          max-width: 400px;
        }

        @media (max-width: 768px) {
          .page-header {
            padding: 16px 0;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .header-left h1 {
            font-size: 22px;
          }
          
          .subtitle {
            font-size: 13px;
          }

          .ask-question-btn {
            width: 100%;
            justify-content: center;
          }

          .cta-banner {
            padding: 0 12px;
            margin: -16px auto 20px;
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
            font-size: 18px;
          }

          .cta-button {
            width: 100%;
          }

          .filters-section {
            padding: 12px 12px;
          }

          .filter-tabs-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .filter-tabs {
            width: 100%;
            overflow-x: auto;
          }

          .filter-tab {
            padding: 6px 12px;
            font-size: 13px;
          }

          .search-row {
            flex-direction: column;
            gap: 8px;
          }

          .search-wrapper {
            width: 100%;
          }

          .filters-toggle-btn {
            width: 100%;
          }

          .filter-grid {
            grid-template-columns: 1fr;
          }

          .questions-container {
            padding: 16px 12px 40px;
          }
        }
      `}</style>
    </>
  );
}