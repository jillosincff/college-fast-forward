import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { trackEvent } from '@/components/utils/analytics';
import { JobRequest } from '@/entities/JobRequest';
import { HelpRequest } from '@/entities/HelpRequest';
import { ProfileLike } from '@/entities/ProfileLike';
import { Answer } from '@/entities/Answer';
import { base44 } from '@/api/base44Client';
import { Search, Plus, Filter, MessageSquare, DollarSign, Mic } from 'lucide-react';
import moment from 'moment';
import { getDisplayName } from '@/components/utils/nameUtils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import MessageAndHelpModal from '../components/connections/MessageAndHelpModal';
import QuestionCard from '../components/connections/QuestionCard';
import { useToast } from '@/components/ui/use-toast';
import { checkFullAccess } from '@/components/access/useAccessControl';
import SortTabs, { sortQuestions } from '@/components/questions/SortTabs';
import TopicFilters, { getQuestionTopics, HELP_TYPE_TO_TOPIC, INDUSTRY_TO_TOPIC } from '@/components/questions/TopicFilters';
import CommunityTabs from '@/components/community/CommunityTabs';
import SalaryBrowse from '@/components/community/SalaryBrowse';
import InterviewBrowse from '@/components/community/InterviewBrowse';

export default function QuestionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Get initial tab from URL
  const getInitialTab = () => {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    return urlParams.get('tab') || 'questions';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());
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
    urgent: false,
    includeAlumniCareer: false
  });
  const [sortBy, setSortBy] = useState('trending');
  const [activeTopic, setActiveTopic] = useState(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [visibleCount, setVisibleCount] = useState(20);
  const [showFilters, setShowFilters] = useState(false);
  const [showParentBanner, setShowParentBanner] = useState(true);

  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalAnswers: 0,
    activeThisWeek: 0
  });
  
  // Update URL when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const currentHash = window.location.hash.split('?')[0];
    window.history.replaceState(null, '', `${currentHash}?tab=${tab}`);
    trackEvent('community_tab_changed', { tab });
  };

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
      // Fetch BOTH JobRequest AND HelpRequest entities
      const jobRequestsPromise = JobRequest.filter({ status: 'active' }, '-created_date', 200);
      const helpRequestsPromise = HelpRequest.filter({ status: 'active' }, '-created_date', 200);
      const directoryUsersPromise = base44.functions.invoke('getDirectoryUsers', {});
      const answersPromise = Answer.list('-created_date', 1000);

      const [jobRequests, helpRequests, directoryResponse, allAnswers] = await Promise.all([
        jobRequestsPromise,
        helpRequestsPromise,
        directoryUsersPromise,
        answersPromise
      ]);
      
      // Build answer counts map from actual Answer records
      const answerCountsMap = new Map();
      (allAnswers || []).forEach(answer => {
        const qId = answer.question_id;
        answerCountsMap.set(qId, (answerCountsMap.get(qId) || 0) + 1);
      });
      
      // Build upvote totals map from answers
      const upvoteTotalsMap = new Map();
      (allAnswers || []).forEach(answer => {
        const qId = answer.question_id;
        upvoteTotalsMap.set(qId, (upvoteTotalsMap.get(qId) || 0) + (answer.upvote_count || 0));
      });
      
      // Normalize HelpRequest to match JobRequest structure
      const normalizedHelpRequests = (helpRequests || []).map(hr => ({
        ...hr,
        // Map HelpRequest fields to JobRequest equivalents
        role: hr.help_types?.join(', ') || 'Career Help',
        target_industry: hr.industry,
        poster_name: hr.student_name,
        poster_type: hr.poster_type || 'student',
        created_by: hr.student_email || hr.created_by,
        _source: 'HelpRequest'
      }));
      
      // Merge both request types
      const allRequests = [
        ...(jobRequests || []).map(jr => ({ ...jr, _source: 'JobRequest' })),
        ...normalizedHelpRequests
      ];
      
      // Filter out test/demo requests and add real answer counts
      const realRequests = allRequests.filter(req => {
        const description = req.description?.toLowerCase() || '';
        const role = req.role?.toLowerCase() || '';
        const isTestRequest = description.includes('test request') || 
                            description.includes('notification testing') || 
                            description.includes('demo') ||
                            role.includes('test');
        return !isTestRequest;
      }).map(req => ({
        ...req,
        // Use actual answer count from Answer entity as source of truth
        answer_count: answerCountsMap.get(req.id) || 0,
        // Calculate total_upvotes from actual answer upvotes
        total_upvotes: upvoteTotalsMap.get(req.id) || req.total_upvotes || 0,
        // Use view_count from DB
        view_count: req.view_count || req.views_count || 0
      }));
      
      // Sort merged results by created_date descending
      realRequests.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      
      setRequests(realRequests);
      
      const users = directoryResponse?.data?.data || [];
      setAllUsers(users);

      // Calculate stats from actual answer counts
      const totalAnswers = realRequests.reduce((sum, r) => sum + (r.answer_count || 0), 0);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const activeThisWeek = realRequests.filter(r => new Date(r.created_date) >= oneWeekAgo).length;
      
      setStats({
        totalQuestions: realRequests.length,
        totalAnswers,
        activeThisWeek
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
    
    // Refresh data when returning to this page (e.g., after viewing a question)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData(true); // silent refresh
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user?.email]);

  // Build profiles from requests
  const allProfiles = useMemo(() => {
    const profiles = [];
    const seenRequestIds = new Set(); // Use request IDs to avoid duplicates, not emails

    requests.forEach((request, index) => {
      // Skip if we've already processed this request
      if (seenRequestIds.has(request.id)) return;
      seenRequestIds.add(request.id);
      
      const requestCreatorEmail = request.created_by;
      const isFeatured = index % 5 === 0;
      
      // Handle truly anonymous questions (is_anonymous flag is true for parent questions)
      const isTrulyAnonymous = request.is_anonymous && request.poster_type === 'parent';
      
      if (isTrulyAnonymous) {
        // For truly anonymous questions, create a profile without linking to a real user
        profiles.push({
          id: request.id,
          email: 'anonymous',
          full_name: 'Anonymous Parent',
          bio: request.description,
          major: request.target_industry,
          request: request,
          hasRequest: true,
          isFeatured,
          isAnonymous: true
        });
      } else {
        // Not anonymous - try to find user profile or use poster_name from request
        // Handle 'anonymous' created_by but with poster_name available
        const isCreatedByAnonymous = !requestCreatorEmail || requestCreatorEmail === 'anonymous';
        const userProfile = !isCreatedByAnonymous 
          ? allUsers.find(u => u.email === requestCreatorEmail)
          : null;
        
        if (userProfile) {
          profiles.push({
            ...userProfile,
            // Ensure student onboarding fields from user profile are available
            minor: userProfile.minor || null,
            pre_professional_track: userProfile.pre_professional_track || null,
            preferred_work_location: userProfile.preferred_work_location || request.location_preference,
            target_timeline: userProfile.target_timeline || request.start_timing || request.timeline,
            seeking_type: userProfile.seeking_type || [],
            help_needed: userProfile.help_needed || request.help_types || [],
            industries_interested: userProfile.industries_interested || (request.target_industry ? [request.target_industry] : []),
            request: request,
            hasRequest: true,
            isFeatured
          });
        } else {
          // Use poster name data from request - these are valid questions with names stored
          // This handles cases where created_by is 'anonymous' but poster_name exists
          const posterName = request.poster_name || request.student_name;
          const posterFirstName = request.poster_first_name;
          const posterLastName = request.poster_last_name;
          
          // Build a display name from available data
          let formattedName = posterName;
          if (!formattedName && !isCreatedByAnonymous) {
            formattedName = getDisplayName({ email: requestCreatorEmail });
          }
          if (!formattedName) {
            // Fallback based on poster_type
            const posterType = request.poster_type || 'student';
            formattedName = posterType === 'parent' ? 'A UF Parent' : 
                           posterType === 'alumni' ? 'A UF Alum' : 'A UF Student';
          }
          
          profiles.push({
            id: request.id,
            email: !isCreatedByAnonymous ? requestCreatorEmail : null,
            full_name: formattedName,
            first_name: posterFirstName,
            last_name: posterLastName,
            bio: request.description,
            major: request.target_industry,
            // Pull student onboarding data from request if available (stored at creation)
            minor: null,
            pre_professional_track: null,
            graduation_year: request.student_year,
            preferred_work_location: request.location_preference,
            target_timeline: request.start_timing || request.timeline,
            seeking_type: [],
            help_needed: request.help_types || [],
            industries_interested: request.target_industry ? [request.target_industry] : [],
            request: request,
            hasRequest: true,
            isFeatured
          });
        }
      }
    });

    return profiles;
  }, [requests, allUsers]);

  const filteredProfiles = allProfiles.filter(profile => {
    // CRITICAL: Hide alumni career requests from students
    const isAlumniCareerRequest = profile.request?.is_alumni_career_request;
    const isStudent = user?.persona === 'gator' || user?.roles?.includes('gator') || user?.email?.endsWith('@ufl.edu');
    if (isAlumniCareerRequest && isStudent) {
      return false; // Students cannot see alumni career requests
    }

    // Filter out alumni career requests unless showing alumni filter or includeAlumniCareer
    if (isAlumniCareerRequest && filters.questionType !== 'alumni' && !filters.includeAlumniCareer) {
      return false;
    }

    // Topic filter - match against help_types and industry
    if (activeTopic) {
      const questionTopics = getQuestionTopics(profile.request);
      if (!questionTopics.includes(activeTopic)) {
        // Also check industry directly
        const industry = profile.request?.target_industry;
        const industryTopic = industry ? INDUSTRY_TO_TOPIC[industry] : null;
        if (industryTopic !== activeTopic) {
          return false;
        }
      }
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = profile.full_name?.toLowerCase().includes(query);
      const matchesFirstName = profile.first_name?.toLowerCase().includes(query);
      const matchesLastName = profile.last_name?.toLowerCase().includes(query);
      const matchesPosterName = profile.request?.poster_name?.toLowerCase().includes(query);
      const matchesPosterFirstName = profile.request?.poster_first_name?.toLowerCase().includes(query);
      const matchesPosterLastName = profile.request?.poster_last_name?.toLowerCase().includes(query);
      const matchesMajor = profile.major?.toLowerCase().includes(query);
      const matchesBio = profile.bio?.toLowerCase().includes(query);
      const matchesDescription = profile.request?.description?.toLowerCase().includes(query);
      const matchesRole = profile.request?.role?.toLowerCase().includes(query);
      const matchesIndustry = profile.request?.target_industry?.toLowerCase().includes(query);
      if (!matchesName && !matchesFirstName && !matchesLastName && !matchesPosterName && !matchesPosterFirstName && !matchesPosterLastName && !matchesMajor && !matchesBio && !matchesDescription && !matchesRole && !matchesIndustry) return false;
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

  // Apply sorting using the sortQuestions function for trending/top/discussed
  const sortedProfiles = useMemo(() => {
    // First extract requests for sorting
    const profilesWithRequests = filteredProfiles.filter(p => p.request);
    
    // Use sortQuestions for the main sort types
    if (['trending', 'recent', 'top', 'discussed', 'unanswered'].includes(sortBy)) {
      const requests = profilesWithRequests.map(p => p.request);
      const sortedRequests = sortQuestions(requests, sortBy);
      
      // Map back to profiles
      const requestIdToProfile = new Map();
      profilesWithRequests.forEach(p => requestIdToProfile.set(p.request.id, p));
      
      return sortedRequests
        .map(req => requestIdToProfile.get(req.id))
        .filter(Boolean);
    }
    
    // Fallback to legacy sorting
    return [...profilesWithRequests].sort((a, b) => {
      // PRIORITY 1: Active karma boosts
      const now = new Date();
      const aBoostActive = a.request?.karma_boost > 0 && (!a.request?.boosted_until || new Date(a.request.boosted_until) > now);
      const bBoostActive = b.request?.karma_boost > 0 && (!b.request?.boosted_until || new Date(b.request.boosted_until) > now);
      
      if (aBoostActive && !bBoostActive) return -1;
      if (!aBoostActive && bBoostActive) return 1;
      
      if (aBoostActive && bBoostActive) {
        const aBoostLevel = a.request?.karma_boost || 0;
        const bBoostLevel = b.request?.karma_boost || 0;
        if (aBoostLevel !== bBoostLevel) return bBoostLevel - aBoostLevel;
      }
      
      // Default: newest first
      return new Date(b.request?.created_date || b.created_date) - new Date(a.request?.created_date || a.created_date);
    });
  }, [filteredProfiles, sortBy]);

  const displayedProfiles = sortedProfiles.slice(0, visibleCount);
  const questionsWithProfiles = displayedProfiles.filter(p => p.request);
  const totalQuestionsFiltered = sortedProfiles.filter(p => p.request).length;

  return (
    <>
      <div className="questions-page">
        {/* HEADER - Reddit Style */}
        <div className="page-header">
          <div className="header-content">
            <div className="header-left">
              <h1 className="flex items-center gap-2">
                <MessageSquare className="w-7 h-7 text-blue-600" />
                Community Questions
              </h1>
              <p className="subtitle">
                The Gator career community — learn from others, share what you know
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
        {!isLoading && user?.persona === 'gator' && !requests.find(r => r.created_by === user.email) && (
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

        {/* Parent Callout Banner - Friendly encouragement */}
        {(user?.persona === 'parent' || user?.persona === 'alumni') && showParentBanner && (
          <div className="parent-callout-banner">
            <div className="parent-callout-content">
              <span className="parent-callout-icon">👋</span>
              <div className="parent-callout-text">
                <p><strong>Parents:</strong> You don't need to be an expert to help.</p>
                <p className="parent-callout-subtext">Sharing how you've seen this work in the real world — even 2–3 sentences — can really help a student.</p>
              </div>
              <button 
                className="parent-callout-dismiss"
                onClick={() => setShowParentBanner(false)}
                aria-label="Dismiss banner"
              >
                ×
              </button>
            </div>
          </div>
        )}



        {/* Search and Filters - Reddit Style */}
        <div className="filters-section">
          <div className="filters-container">
            {/* Search Bar */}
            <div className="search-row mb-4">
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
            </div>

            {/* Sort Tabs */}
            <div className="mb-4">
              <SortTabs activeSort={sortBy} onSortChange={setSortBy} />
            </div>

            {/* Topic Filters */}
            <div className="mb-4">
              <TopicFilters activeTopic={activeTopic} onTopicChange={setActiveTopic} />
            </div>

            {/* Quick Filter Tabs + Stats */}
            <div className="filter-tabs-row">
              <div className="filter-tabs">
                <button
                  className={`filter-tab ${filters.questionType === 'all' && !filters.noAnswers && !filters.urgent ? 'active' : ''}`}
                  onClick={() => setFilters({...filters, questionType: 'all', noAnswers: false, urgent: false})}
                >
                  All
                </button>
                <button
                  className={`filter-tab ${filters.questionType === 'student' ? 'active' : ''}`}
                  onClick={() => setFilters({...filters, questionType: 'student', noAnswers: false, urgent: false})}
                >
                  🎓 Students
                </button>
                <button
                  className={`filter-tab ${filters.questionType === 'parent' ? 'active' : ''}`}
                  onClick={() => setFilters({...filters, questionType: 'parent', noAnswers: false, urgent: false})}
                >
                  👨‍👩‍👧 Parents
                </button>
                <button
                  className={`filter-tab ${filters.questionType === 'alumni' ? 'active' : ''}`}
                  onClick={() => setFilters({...filters, questionType: 'alumni', noAnswers: false, urgent: false})}
                >
                  🎯 Alumni
                </button>
                {/* Alumni Career toggle - only show to parents and alumni */}
                {(user?.persona === 'parent' || user?.persona === 'alumni' || user?.roles?.includes('parent') || user?.roles?.includes('alumni')) && (
                  <button
                    className={`filter-tab ${filters.includeAlumniCareer ? 'active' : ''}`}
                    onClick={() => setFilters({...filters, includeAlumniCareer: !filters.includeAlumniCareer, questionType: 'all', noAnswers: false, urgent: false})}
                  >
                    🎯 Alumni Career
                  </button>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="filters-toggle-btn"
              >
                <Filter className="w-4 h-4 mr-1" />
                More
              </Button>
            </div>

            {/* Activity Stats */}
            <p className="activity-stats">
              📊 {stats.totalQuestions.toLocaleString()} questions · {stats.totalAnswers.toLocaleString()} answers · {stats.activeThisWeek} active this week
            </p>

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
                    <option value="2028">2028</option>
                  </select>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* QUESTIONS LIST */}
        <div className="questions-container">
          {/* Quick perspectives nudge */}
          {!isLoading && questionsWithProfiles.length > 0 && (user?.persona === 'parent' || user?.persona === 'alumni') && (
            <p className="quick-perspectives-nudge">
              💬 Quick perspectives welcome — short, imperfect answers are encouraged.
            </p>
          )}
          
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
                        onDeleted={(deletedId) => {
                          setRequests(prev => prev.filter(r => r.id !== deletedId));
                        }}
                        onUpdated={() => loadData(true)}
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
                  <div className="empty-icon">📭</div>
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
          color: white;
        }

        .cta-text p {
          font-size: 15px;
          opacity: 0.95;
          margin: 0;
          color: white;
        }

        .cta-button {
          background: white !important;
          color: #FA4616 !important;
          font-weight: 700;
          flex-shrink: 0;
        }

        /* Helper Prompt */
        .helper-prompt {
          max-width: 900px;
          margin: 0 auto 20px;
          padding: 0 20px;
        }

        .helper-prompt-content {
          background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
          border: 1px solid #C7D2FE;
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .helper-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .helper-prompt-content p {
          margin: 0;
          font-size: 15px;
          color: #4338CA;
        }

        .helper-prompt-content strong {
          color: #312E81;
        }

        /* Parent Callout Banner */
        .parent-callout-banner {
          max-width: 900px;
          margin: 0 auto 20px;
          padding: 0 20px;
        }

        .parent-callout-content {
          background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
          border: 1px solid #F59E0B;
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          position: relative;
        }

        .parent-callout-icon {
          font-size: 24px;
          flex-shrink: 0;
          line-height: 1;
        }

        .parent-callout-text {
          flex: 1;
        }

        .parent-callout-text p {
          margin: 0;
          font-size: 15px;
          color: #92400E;
        }

        .parent-callout-text strong {
          color: #78350F;
        }

        .parent-callout-subtext {
          margin-top: 4px !important;
          font-size: 14px !important;
          opacity: 0.9;
        }

        .parent-callout-dismiss {
          position: absolute;
          top: 8px;
          right: 12px;
          background: none;
          border: none;
          font-size: 20px;
          color: #92400E;
          cursor: pointer;
          opacity: 0.6;
          transition: opacity 0.2s;
          padding: 4px 8px;
          line-height: 1;
        }

        .parent-callout-dismiss:hover {
          opacity: 1;
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
          gap: 12px;
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

        .activity-stats {
          font-size: 13px;
          color: #6B7280;
          margin: 12px 0 0 0;
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
          height: 36px;
          padding: 0 12px;
          font-weight: 500;
          font-size: 13px;
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

        .quick-perspectives-nudge {
          text-align: center;
          font-size: 14px;
          color: #6B7280;
          margin: 0 0 16px 0;
          padding: 0;
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
            padding: 0 16px;
          }

          .header-left h1 {
            font-size: 20px;
            line-height: 1.2;
          }
          
          .subtitle {
            font-size: 13px;
          }

          .ask-question-btn {
            width: 100%;
            justify-content: center;
            min-height: 48px;
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
            min-height: 48px;
          }

          .helper-prompt {
            padding: 0 16px;
            margin-bottom: 16px;
          }

          .helper-prompt-content {
            flex-direction: row;
            padding: 14px 16px;
          }

          .helper-icon {
            font-size: 20px;
          }

          .helper-prompt-content p {
            font-size: 14px;
          }

          .parent-callout-banner {
            padding: 0 16px;
            margin-bottom: 16px;
          }

          .parent-callout-content {
            padding: 14px 36px 14px 16px;
          }

          .parent-callout-icon {
            font-size: 20px;
          }

          .parent-callout-text p {
            font-size: 14px;
          }

          .parent-callout-subtext {
            font-size: 13px !important;
          }

          .filters-section {
            padding: 12px 16px;
            top: 56px; /* Account for mobile header height */
          }

          .filter-tabs-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .filter-tabs {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            -ms-overflow-style: none;
            padding-bottom: 4px;
            margin: 0 -16px;
            padding-left: 16px;
            padding-right: 16px;
          }

          .filter-tabs::-webkit-scrollbar {
            display: none;
          }

          .filter-tab {
            padding: 10px 16px;
            font-size: 13px;
            min-height: 44px;
            flex-shrink: 0;
          }

          .search-row {
            flex-direction: column;
            gap: 8px;
          }

          .search-wrapper {
            width: 100%;
          }

          .search-input {
            min-height: 48px;
            font-size: 16px; /* Prevent iOS zoom */
          }

          .filters-toggle-btn {
            width: auto;
            min-height: 36px;
          }

          .filter-grid {
            grid-template-columns: 1fr;
          }

          .filter-select {
            min-height: 48px;
            font-size: 16px; /* Prevent iOS zoom */
          }

          .questions-container {
            padding: 16px 0 100px; /* Extra bottom padding for bottom nav */
          }

          .questions-list {
            margin: 0; /* Full-width on mobile */
          }

          .load-more-btn {
            margin: 16px;
            min-height: 48px;
          }

          .empty-state {
            margin: 0 16px;
            padding: 60px 20px;
          }

          .empty-icon {
            font-size: 48px;
          }

          .empty-state h3 {
            font-size: 20px;
          }
        }
        
        /* Extra small screens */
        @media (max-width: 375px) {
          .header-left h1 {
            font-size: 18px;
          }
          
          .filter-tab {
            padding: 8px 12px;
            font-size: 12px;
          }
        }
      `}</style>
    </>
  );
}